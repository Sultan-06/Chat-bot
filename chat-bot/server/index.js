// server/index.js — Aura AI Express backend
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import OpenAI from 'openai'
import { getSystemPrompt, VALID_DOMAIN_IDS } from './prompts.js'

// ─── Configuration ───────────────────────────────────────────────
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const AI_PROVIDER = process.env.AI_PROVIDER || 'groq'
const AI_API_KEY = process.env.AI_API_KEY || ''
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1'
const AI_MODEL = process.env.AI_MODEL || 'openai/gpt-oss-120b'

// ─── OpenAI client ───────────────────────────────────────────────
const openai = new OpenAI({
  apiKey: AI_API_KEY || 'placeholder', // SDK requires non-empty key string
  baseURL: AI_BASE_URL,
  defaultHeaders:
    AI_PROVIDER === 'openrouter'
      ? { 'HTTP-Referer': FRONTEND_URL, 'X-Title': 'Aura AI' }
      : {},
})

// ─── App setup ───────────────────────────────────────────────────
const app = express()

// Security headers
app.use(helmet())

// CORS — support comma-separated origins
const allowedOrigins = FRONTEND_URL.split(',').map((o) => o.trim())
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (Postman, curl) and listed origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error(`CORS: origin ${origin} not allowed`))
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
)

// Body parsing with size limit
app.use(express.json({ limit: '100kb' }))

// ─── Rate limiting ────────────────────────────────────────────────
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment and try again.' },
})

// ─── Health endpoint ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    provider: AI_PROVIDER,
    model: AI_MODEL,
    apiKeyConfigured: !!(AI_API_KEY && AI_API_KEY.length > 0),
  })
})

// ─── Chat endpoint ────────────────────────────────────────────────
app.post('/api/chat', chatLimiter, async (req, res) => {
  // ── Validate payload ──────────────────────────────────────────
  const { messages, domainId, languageCode } = req.body

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array.' })
  }

  const MAX_MESSAGES = 30
  const MAX_MSG_LENGTH = 4000
  const allowedRoles = new Set(['user', 'assistant'])

  // Sanitize: reject any system roles from client, enforce limits
  const sanitized = messages
    .slice(-MAX_MESSAGES)
    .filter((m) => allowedRoles.has(m?.role) && typeof m?.content === 'string')
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_MSG_LENGTH),
    }))

  if (sanitized.length === 0) {
    return res.status(400).json({ error: 'No valid messages after sanitization.' })
  }

  // Check API key
  if (!AI_API_KEY) {
    return res.status(503).json({
      error:
        'AI_API_KEY is not configured. Add your API key to server/.env. Get a free Groq key at https://console.groq.com',
    })
  }

  // ── SSE headers ───────────────────────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // Disable nginx buffering

  // ── Build messages with system prompt ────────────────────────
  const safeDomainId = VALID_DOMAIN_IDS.includes(domainId) ? domainId : 'general'
  const systemPrompt = getSystemPrompt(safeDomainId, languageCode || 'en')

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...sanitized,
  ]

  // ── Abort handling ────────────────────────────────────────────
  const abortController = new AbortController()
  req.on('close', () => abortController.abort())

  // ── Stream ────────────────────────────────────────────────────
  try {
    const stream = await openai.chat.completions.create(
      {
        model: AI_MODEL,
        messages: apiMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      },
      { signal: abortController.signal }
    )

    for await (const chunk of stream) {
      if (abortController.signal.aborted) break

      const token = chunk.choices?.[0]?.delta?.content
      if (token) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`)
      }

      const finishReason = chunk.choices?.[0]?.finish_reason
      if (finishReason && finishReason !== 'null') {
        break
      }
    }

    if (!abortController.signal.aborted) {
      res.write('data: [DONE]\n\n')
    }
    res.end()
  } catch (err) {
    if (err.name === 'AbortError' || abortController.signal.aborted) {
      res.end()
      return
    }

    // Map provider errors to friendly messages
    let userMsg = 'An unexpected error occurred. Please try again.'

    if (err?.status === 401 || err?.code === 401) {
      userMsg = 'Invalid or missing API key. Check AI_API_KEY in server/.env.'
    } else if (err?.status === 429 || err?.code === 429) {
      userMsg = 'Rate limit reached on the AI provider. Please wait a moment.'
    } else if (err?.status === 503) {
      userMsg = 'AI provider is temporarily unavailable. Try again shortly.'
    } else if (err?.message?.toLowerCase().includes('model')) {
      userMsg = `Model not found: "${AI_MODEL}". Check AI_MODEL in server/.env.`
    }

    // Don't log full error details (may contain keys)
    console.error('[Aura AI] Stream error:', err?.status, err?.type)

    if (!res.headersSent) {
      res.status(500).json({ error: userMsg })
    } else {
      res.write(`data: ${JSON.stringify({ error: userMsg })}\n\n`)
      res.end()
    }
  }
})

// ─── 404 handler ─────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// ─── Global error handler ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Aura AI] Unhandled error:', err?.message)
  res.status(500).json({ error: 'Internal server error' })
})

// ─── Start server ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌟 Aura AI Server running on http://localhost:${PORT}`)
  console.log(`   Provider : ${AI_PROVIDER}`)
  console.log(`   Model    : ${AI_MODEL}`)
  console.log(`   API Key  : ${AI_API_KEY ? '✓ Configured' : '✗ Missing — add to server/.env'}`)
  console.log(`   CORS     : ${FRONTEND_URL}\n`)
})
