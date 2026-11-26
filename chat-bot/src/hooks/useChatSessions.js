import { useState, useCallback, useEffect, useRef } from 'react'

const STORAGE_KEY = 'aura-ai-sessions'

function generateId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function generateTitle(firstMessage) {
  const text = firstMessage.trim()
  return text.length > 50 ? text.slice(0, 50).trimEnd() + '…' : text || 'New Conversation'
}

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch {
    // localStorage unavailable
  }
}

function createNewSession(domainId = 'general') {
  return {
    id: generateId(),
    title: 'New Conversation',
    messages: [],
    domainId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function useChatSessions(initialDomainId = 'general') {
  const [sessions, setSessions] = useState(() => {
    const loaded = loadSessions()
    if (loaded.length > 0) return loaded
    return [createNewSession(initialDomainId)]
  })
  const [activeId, setActiveId] = useState(() => {
    const loaded = loadSessions()
    return loaded.length > 0 ? loaded[0].id : null
  })

  // Ensure activeId is always valid
  const validActiveId = sessions.find((s) => s.id === activeId)?.id ?? sessions[0]?.id ?? null

  const persistRef = useRef(sessions)
  useEffect(() => {
    persistRef.current = sessions
    saveSessions(sessions)
  }, [sessions])

  const activeSession = sessions.find((s) => s.id === validActiveId) ?? null

  const newChat = useCallback((domainId = 'general') => {
    const session = createNewSession(domainId)
    setSessions((prev) => [session, ...prev])
    setActiveId(session.id)
    return session.id
  }, [])

  const switchSession = useCallback((id) => {
    setActiveId(id)
  }, [])

  const deleteSession = useCallback((id) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id)
      if (remaining.length === 0) {
        const fresh = createNewSession()
        setActiveId(fresh.id)
        return [fresh]
      }
      if (id === validActiveId) {
        setActiveId(remaining[0].id)
      }
      return remaining
    })
  }, [validActiveId])

  const addMessage = useCallback((sessionId, message) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        const msgs = [...s.messages, message]
        // Auto-generate title from first user message
        let title = s.title
        if (title === 'New Conversation' && message.role === 'user') {
          title = generateTitle(message.content)
        }
        return { ...s, messages: msgs, title, updatedAt: Date.now() }
      })
    )
  }, [])

  const updateLastAssistantMessage = useCallback((sessionId, content) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        const msgs = [...s.messages]
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].role === 'assistant') {
            msgs[i] = { ...msgs[i], content }
            break
          }
        }
        return { ...s, messages: msgs, updatedAt: Date.now() }
      })
    )
  }, [])

  const clearSession = useCallback((sessionId) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, messages: [], title: 'New Conversation', updatedAt: Date.now() }
          : s
      )
    )
  }, [])

  return {
    sessions,
    activeId: validActiveId,
    activeSession,
    newChat,
    switchSession,
    deleteSession,
    addMessage,
    updateLastAssistantMessage,
    clearSession,
  }
}
