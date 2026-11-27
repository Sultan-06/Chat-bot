import { useState, useRef, useCallback } from 'react'
import { API_BASE_URL } from '../config/api'

const WAKE_TIMEOUT_MS = 65_000   // Total budget to wake Render free tier
const HEALTH_ATTEMPT_MS = 25_000 // Per /health attempt timeout
const WAKE_RETRY_MS = 2_500

function createAbortError() {
  const err = new Error('Aborted')
  err.name = 'AbortError'
  return err
}

function isNetworkFetchError(err) {
  if (!err || err.name === 'AbortError') return false
  return err.name === 'TypeError' || /failed to fetch|networkerror|load failed/i.test(err.message || '')
}

function formatFetchError(err) {
  if (!isNetworkFetchError(err)) {
    return err?.message || 'An error occurred'
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'No internet connection. Please check your network and try again.'
  }
  return `Cannot reach the AI server (${API_BASE_URL}). If the server was waking from sleep, wait a moment and try again — or hard-refresh the page (Ctrl+Shift+R).`
}

/** Perform a single fetch with combined parent AbortSignal + timeout */
async function fetchWithTimeout(url, options, parentSignal, timeoutMs) {
  const attemptController = new AbortController()
  const onParentAbort = () => attemptController.abort()
  if (parentSignal?.aborted) {
    throw createAbortError()
  }
  parentSignal?.addEventListener('abort', onParentAbort, { once: true })
  const timer = setTimeout(() => attemptController.abort(), timeoutMs)

  try {
    return await fetch(url, { ...options, signal: attemptController.signal })
  } catch (err) {
    if (parentSignal?.aborted) throw createAbortError()
    throw err
  } finally {
    clearTimeout(timer)
    parentSignal?.removeEventListener('abort', onParentAbort)
  }
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(createAbortError())
    const onAbort = () => {
      clearTimeout(timer)
      reject(createAbortError())
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/** Ping /health until the server responds or timeout/abort triggers */
async function wakeServer(signal, onWaking) {
  const start = Date.now()
  let notifiedWaking = false

  // If the first health check takes > 2s (cold start), show the waking indicator
  const slowTimer = setTimeout(() => {
    if (!notifiedWaking && !signal?.aborted) {
      notifiedWaking = true
      onWaking?.()
    }
  }, 2_000)

  try {
    while (Date.now() - start < WAKE_TIMEOUT_MS) {
      if (signal?.aborted) throw createAbortError()
      try {
        const res = await fetchWithTimeout(
          `${API_BASE_URL}/health`,
          { method: 'GET', cache: 'no-store' },
          signal,
          HEALTH_ATTEMPT_MS
        )
        if (res.ok) return true
      } catch (err) {
        if (err.name === 'AbortError' && signal?.aborted) throw err
      }

      if (!notifiedWaking) {
        notifiedWaking = true
        onWaking?.()
      }

      if (Date.now() - start + WAKE_RETRY_MS >= WAKE_TIMEOUT_MS) break
      await sleep(WAKE_RETRY_MS, signal)
    }
    return false
  } finally {
    clearTimeout(slowTimer)
  }
}

export function useChatStream({ onToken, onDone, onError }) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isWaking, setIsWaking] = useState(false)
  const isStreamingRef = useRef(false)
  const abortRef = useRef(null)

  const send = useCallback(
    async ({ messages, domainId, languageCode, memoryContext }) => {
      if (isStreamingRef.current) return
      isStreamingRef.current = true
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const awake = await wakeServer(controller.signal, () => setIsWaking(true))
        setIsWaking(false)

        if (!awake) {
          onError?.(`AI server at ${API_BASE_URL} is taking too long to respond. Please try again in a few seconds.`)
          return
        }

        const requestInit = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, domainId, languageCode, memoryContext }),
          signal: controller.signal,
        }

        let res
        try {
          res = await fetch(`${API_BASE_URL}/api/chat`, requestInit)
        } catch (firstErr) {
          if (!isNetworkFetchError(firstErr)) throw firstErr
          // Transient cold-start proxy hiccup — brief retry once
          setIsWaking(true)
          await sleep(1_500, controller.signal)
          setIsWaking(false)
          res = await fetch(`${API_BASE_URL}/api/chat`, requestInit)
        }

        if (!res.ok) {
          let errMsg = `Server error (${res.status})`
          try {
            const data = await res.json()
            errMsg = data.error || errMsg
          } catch {}
          throw new Error(errMsg)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue
            const payload = trimmed.slice(5).trim()
            if (payload === '[DONE]') {
              onDone?.()
              return
            }
            try {
              const parsed = JSON.parse(payload)
              if (parsed.error) {
                throw new Error(parsed.error)
              }
              if (parsed.token) {
                onToken(parsed.token)
              }
            } catch (parseErr) {
              if (parseErr.message && !parseErr.message.startsWith('Unexpected')) {
                throw parseErr
              }
            }
          }
        }

        onDone?.()
      } catch (err) {
        if (err.name === 'AbortError') {
          onDone?.() // partial response preserved
        } else {
          onError?.(formatFetchError(err))
        }
      } finally {
        setIsWaking(false)
        setIsStreaming(false)
        isStreamingRef.current = false
        abortRef.current = null
      }
    },
    [onToken, onDone, onError]
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { isStreaming, isWaking, send, stop }
}
