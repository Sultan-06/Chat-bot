# Aura AI — Intelligent Full-Stack Chatbot

A modern, production-oriented AI chatbot web application built with React, Vite, Tailwind CSS v4, and Node.js + Express. Features real-time token streaming, multilingual support, voice input, domain-specific personas, and persistent chat history.

---

## Screenshots

> _Add screenshots of your running app here._

---

## Features

- 🌊 **Real-time SSE streaming** — Token-by-token AI responses
- 🎭 **Domain personas** — General, College, Education, Healthcare, Banking
- 🌐 **11 languages** — Including Arabic RTL support
- 🎤 **Voice input** — Web Speech API integration
- 💬 **Chat history** — Persistent sessions in `localStorage`
- 🌙 **Light / Dark mode** — Warm editorial design system
- 📄 **Transcript export** — Download conversations as `.txt`
- 🔒 **Secure backend** — Helmet, CORS, rate-limiting, input validation
- 🔄 **Multi-provider** — Groq (default), OpenAI, Gemini, OpenRouter

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| UI | Lucide React, Inter font |
| Markdown | react-markdown, remark-gfm, rehype-highlight |
| Backend | Node.js, Express 4 |
| AI SDK | Official OpenAI JS SDK (`openai`) |
| Security | Helmet, express-rate-limit, CORS |
| Linting | Oxlint |

---

## Prerequisites

- Node.js 18+
- npm 9+
- A free AI API key (Groq recommended — see below)

---

## Local Installation

### 1. Clone or open the project

```bash
cd chat-bot
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure frontend environment

```bash
cp .env.example .env
# Edit .env if your backend runs on a non-default port
```

### 4. Install backend dependencies

```bash
cd server
npm install
```

### 5. Configure backend environment

```bash
cp .env.example .env
# Edit server/.env — set AI_API_KEY to your key
```

---

## Getting an API Key

### Groq (Free — Recommended)
1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign in and navigate to **API Keys**
3. Create a new key and copy it into `server/.env` as `AI_API_KEY`

### OpenAI
1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Create an API key — usage is billed per token

---

## Switching AI Providers

Edit `server/.env` to switch providers without changing any code:

```env
# Groq (free default)
AI_PROVIDER=groq
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.3-70b-versatile
AI_API_KEY=your_groq_key

# OpenAI
AI_PROVIDER=openai
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
AI_API_KEY=your_openai_key

# Google Gemini
AI_PROVIDER=gemini
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
AI_MODEL=gemini-2.5-flash
AI_API_KEY=your_gemini_key

# OpenRouter
AI_PROVIDER=openrouter
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=openai/gpt-4o-mini:free
AI_API_KEY=your_openrouter_key
```

> **Note:** Always verify model names on your provider's dashboard — availability changes.

---

## Running the App

**Terminal 1 — Backend:**
```bash
cd server
npm start
# Server starts at http://localhost:3000
```

**Terminal 2 — Frontend:**
```bash
# From chat-bot root
npm run dev
# App opens at http://localhost:5173
```

---

## API Endpoints

### `GET /api/health`
Returns server and provider status.

**Response:**
```json
{
  "status": "ok",
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "apiKeyConfigured": true
}
```

### `POST /api/chat`
Streams an AI response as Server-Sent Events.

**Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "domainId": "general",
  "languageCode": "en"
}
```

**SSE stream format:**
```
data: {"token": "Hello"}
data: {"token": "!"}
data: [DONE]
```

**Rate limit:** 30 requests/minute per IP.

---

## Deployment

### Frontend — Vercel

1. Push `chat-bot/` to a GitHub repo
2. Import the repo in [vercel.com](https://vercel.com)
3. Set **Root Directory** to `chat-bot` (or root if applicable)
4. Set **Environment Variable**: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy

### Backend — Render

1. Create a new **Web Service** at [render.com](https://render.com)
2. Set **Root Directory** to `chat-bot/server`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. Add environment variables:
   - `AI_PROVIDER`, `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`
   - `PORT=3000`
   - `FRONTEND_URL=https://your-app.vercel.app`

---

## Limitations

- **Voice input**: Web Speech API is supported in Chrome and Edge. It is not available in Firefox or Safari.
- **Chat history**: Stored in browser `localStorage` — limited to the current device and browser.
- **Free tier limits**: Provider rate limits apply. Check your provider's documentation.
- **No authentication**: This app has no user accounts or cloud storage. All data is local.
