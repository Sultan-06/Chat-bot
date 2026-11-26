import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import { getDomainById } from '../utils/domains'

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-6">
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-[#1E1D1B] dark:bg-[#E8E4DA] flex items-center justify-center flex-shrink-0">
            <span className="text-[#F7F5F0] dark:text-[#1E1D1B] text-[10px] font-bold">A</span>
          </div>
          <span className="text-xs font-medium text-[#6E6A63] dark:text-[#9b9690]">Aura AI</span>
        </div>
        <div className="bg-white dark:bg-[#1e1e1c] border border-[#E6E2D8] dark:border-[#2a2825] rounded-2xl px-4 py-3 flex items-center gap-1">
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#6E6A63] dark:bg-[#9b9690]" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#6E6A63] dark:bg-[#9b9690]" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#6E6A63] dark:bg-[#9b9690]" />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ domainId, onStarterClick }) {
  const domain = getDomainById(domainId)
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#1E1D1B] dark:bg-[#E8E4DA] flex items-center justify-center mb-4">
        <span className="text-[#F7F5F0] dark:text-[#1E1D1B] text-xl font-bold">A</span>
      </div>
      <h2 className="text-xl font-semibold text-[#1E1D1B] dark:text-[#E8E4DA] mb-2">
        Hello! How can I help you today?
      </h2>
      <p className="text-sm text-[#6E6A63] dark:text-[#9b9690] max-w-sm mb-8">
        I&apos;m Aura AI — your intelligent assistant. Ask me anything or choose a suggestion below.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {domain.starters.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onStarterClick(prompt)}
            className="text-left px-4 py-3 rounded-xl border border-[#E8E4DA] dark:border-[#2a2825] bg-white dark:bg-[#1e1e1c] text-sm text-[#6E6A63] dark:text-[#9b9690] hover:text-[#1E1D1B] dark:hover:text-[#E8E4DA] hover:border-[#1E1D1B] dark:hover:border-[#E8E4DA] hover:bg-[#FAF9F5] dark:hover:bg-[#252320] transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MessageList({
  messages,
  isStreaming,
  domainId,
  isRtl,
  onStarterClick,
}) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 h-full flex flex-col">
          <EmptyState domainId={domainId} onStarterClick={onStarterClick} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isRtl={isRtl} />
        ))}
        {isStreaming && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
