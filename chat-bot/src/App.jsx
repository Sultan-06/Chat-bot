import { useState, useEffect, useCallback, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MessageList from './components/MessageList'
import InputBar from './components/InputBar'
import SettingsModal from './components/SettingsModal'
import ConfirmModal from './components/ConfirmModal'
import { useChatSessions } from './hooks/useChatSessions'
import { useChatStream } from './hooks/useChatStream'
import { exportTranscript } from './utils/exportTranscript'
import { getLanguageByCode } from './utils/languages'
import { getDomainById } from './utils/domains'
import { buildMemoryContext } from './utils/memory'

// Persist helpers
function loadPref(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v !== null ? v : fallback
  } catch {
    return fallback
  }
}
function savePref(key, value) {
  try { localStorage.setItem(key, value) } catch {}
}

function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export default function App() {
  // Theme
  const [theme, setTheme] = useState(() => loadPref('aura-theme', 'light'))
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    savePref('aura-theme', theme)
  }, [theme])

  // Language
  const [languageCode, setLanguageCode] = useState(() => loadPref('aura-lang', 'en'))
  const handleLanguageChange = useCallback((code) => {
    setLanguageCode(code)
    savePref('aura-lang', code)
  }, [])

  // Domain / Persona
  const [domainId, setDomainId] = useState(() => loadPref('aura-domain', 'general'))
  const handleDomainChange = useCallback((id) => {
    setDomainId(id)
    savePref('aura-domain', id)
  }, [])

  // RTL
  const isRtl = getLanguageByCode(languageCode)?.rtl === true

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Modals
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)

  // API error banner
  const [apiError, setApiError] = useState(null)

  // Sessions
  const {
    sessions,
    activeId,
    activeSession,
    newChat,
    switchSession,
    deleteSession,
    addMessage,
    updateLastAssistantMessage,
    clearSession,
  } = useChatSessions(domainId)

  // Streaming state
  const streamingContentRef = useRef('')
  const [isStreaming, setIsStreaming] = useState(false)
  const activeSessionIdRef = useRef(activeId)
  useEffect(() => { activeSessionIdRef.current = activeId }, [activeId])

  const { send, stop } = useChatStream({
    onToken: useCallback((token) => {
      streamingContentRef.current += token
      updateLastAssistantMessage(activeSessionIdRef.current, streamingContentRef.current)
    }, [updateLastAssistantMessage]),

    onDone: useCallback(() => {
      streamingContentRef.current = ''
      setIsStreaming(false)
    }, []),

    onError: useCallback((errMsg) => {
      setApiError(errMsg)
      streamingContentRef.current = ''
      setIsStreaming(false)
      // Remove empty placeholder assistant message if error on first token
      // (handled gracefully since it'll just be empty content)
    }, []),
  })

  const handleSend = useCallback(async (text) => {
    if (isStreaming) return
    setApiError(null)

    const userMsg = {
      id: generateMessageId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    addMessage(activeId, userMsg)

    // Add placeholder assistant message
    const assistantMsg = {
      id: generateMessageId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }
    addMessage(activeId, assistantMsg)
    setIsStreaming(true)
    streamingContentRef.current = ''

    // Build messages array for API (last 30 messages, strip system roles)
    const history = activeSession?.messages ?? []
    const apiMessages = [...history, userMsg]
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-30)
      .map((m) => ({ role: m.role, content: m.content }))

    // Build cross-chat memory from previous sessions
    const memoryContext = buildMemoryContext(sessions, activeId)

    await send({
      messages: apiMessages,
      domainId,
      languageCode,
      memoryContext,
    })
  }, [isStreaming, activeId, activeSession, sessions, addMessage, send, domainId, languageCode])

  const handleStop = useCallback(() => {
    stop()
  }, [stop])

  const handleExport = useCallback(() => {
    if (!activeSession) return
    const domain = getDomainById(domainId)
    const lang = getLanguageByCode(languageCode)
    exportTranscript({
      title: activeSession.title,
      messages: activeSession.messages,
      persona: domain.label,
      language: lang.label,
    })
  }, [activeSession, domainId, languageCode])

  const handleNewChat = useCallback(() => {
    newChat(domainId)
    setMobileSidebarOpen(false)
  }, [newChat, domainId])

  const handleClearConfirm = useCallback(() => {
    clearSession(activeId)
    setConfirmClearOpen(false)
  }, [clearSession, activeId])

  const handleStarterClick = useCallback((prompt) => {
    handleSend(prompt)
  }, [handleSend])

  return (
    <div
      className="flex h-[100dvh] overflow-hidden bg-[#FCFBF8] dark:bg-[#141312] text-[#1E1D1B] dark:text-[#E8E4DA]"
    >
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onNewChat={handleNewChat}
        onSwitch={(id) => { switchSession(id); setMobileSidebarOpen(false) }}
        onDelete={deleteSession}
        onSettings={() => setSettingsOpen(true)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onOpenSidebar={() => setSidebarCollapsed(false)}
          onMobileSidebarOpen={() => setMobileSidebarOpen(true)}
          onExport={handleExport}
          domainId={domainId}
        />

        {/* API error banner */}
        {apiError && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <div className="flex-1 text-sm text-amber-700 dark:text-amber-400">
                <strong>Error:</strong> {apiError}
                {apiError.toLowerCase().includes('api key') || apiError.toLowerCase().includes('401') ? (
                  <span> — Add your API key to <code className="font-mono text-xs">server/.env</code>. Get a free key at{' '}
                    <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline">console.groq.com</a>.
                  </span>
                ) : null}
              </div>
              <button
                onClick={() => setApiError(null)}
                className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 text-xs font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <MessageList
          messages={activeSession?.messages ?? []}
          isStreaming={isStreaming}
          domainId={domainId}
          isRtl={isRtl}
          onStarterClick={handleStarterClick}
        />

        {/* Input bar */}
        <InputBar
          onSend={handleSend}
          onStop={handleStop}
          isStreaming={isStreaming}
          disabled={false}
          languageCode={languageCode}
          onLanguageChange={handleLanguageChange}
          onClear={() => setConfirmClearOpen(true)}
          onExport={handleExport}
          isRtl={isRtl}
        />
      </div>

      {/* Settings modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        languageCode={languageCode}
        onLanguageChange={handleLanguageChange}
        domainId={domainId}
        onDomainChange={handleDomainChange}
      />

      {/* Confirm clear modal */}
      <ConfirmModal
        open={confirmClearOpen}
        title="Clear Conversation"
        message="This will permanently delete all messages in this conversation. This action cannot be undone."
        onConfirm={handleClearConfirm}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  )
}
