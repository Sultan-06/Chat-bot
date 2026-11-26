import { useState, useRef, useCallback } from 'react'
import { API_BASE_URL } from '../config/api'

export function useChatStream({ onToken, onDone, onError }) {
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef(null)

  const send = useCallback(
    async ({ messages, domainId, languageCode }) => {
      if (isStreaming) return
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, domainId, languageCode }),
          signal: controller.signal,
        })

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
              setIsStreaming(false)
              abortRef.current = null
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
              if (parseErr.message !== 'Unexpected token') {
                // Could be a real error from the parsed object
                if (parseErr.message && !parseErr.message.startsWith('Unexpected')) {
                  throw parseErr
                }
              }
            }
          }
        }

        onDone?.()
      } catch (err) {
        if (err.name === 'AbortError') {
          onDone?.() // partial response preserved
        } else {
          onError?.(err.message || 'An error occurred')
        }
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [isStreaming, onToken, onDone, onError]
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { isStreaming, send, stop }
}
