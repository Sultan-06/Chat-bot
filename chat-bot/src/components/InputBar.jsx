import { useRef, useEffect, useState, useCallback } from 'react'
import { Send, Square, Mic, MicOff, Languages, Trash2, Download, ChevronDown } from 'lucide-react'
import { LANGUAGES } from '../utils/languages'
import { useVoiceInput } from '../hooks/useVoiceInput'

export default function InputBar({
  onSend,
  onStop,
  isStreaming,
  disabled,
  languageCode,
  onLanguageChange,
  onClear,
  onExport,
  isRtl,
}) {
  const [text, setText] = useState('')
  const [langOpen, setLangOpen] = useState(false)
  const textareaRef = useRef(null)

  const handleTranscript = useCallback((transcript, isFinal) => {
    setText((prev) => {
      if (isFinal) return prev + transcript + ' '
      return prev
    })
  }, [])

  const { isListening, isSupported, error: voiceError, start: startVoice } = useVoiceInput({
    languageCode,
    onTranscript: handleTranscript,
  })

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [text])

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [text, isStreaming, onSend])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const currentLang = LANGUAGES.find((l) => l.code === languageCode) || LANGUAGES[0]

  return (
    <div className="border-t border-[#E8E4DA] dark:border-[#2a2825] bg-[#FCFBF8] dark:bg-[#141312] px-4 py-3">
      <div className="max-w-3xl mx-auto">
        {/* Voice error notice */}
        {voiceError && (
          <div className="mb-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            {voiceError}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Composer pill */}
          <div className={[
            'flex-1 flex items-end gap-2 rounded-2xl border border-[#E8E4DA] dark:border-[#2a2825] bg-white dark:bg-[#1e1e1c] px-4 py-2.5 shadow-sm',
            isListening ? 'border-red-400 dark:border-red-600' : '',
          ].join(' ')}>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              disabled={disabled}
              dir={isRtl ? 'rtl' : 'ltr'}
              className="flex-1 bg-transparent outline-none text-sm text-[#1E1D1B] dark:text-[#E8E4DA] placeholder:text-[#6E6A63] dark:placeholder:text-[#9b9690] resize-none py-0.5 leading-relaxed"
              style={{ maxHeight: '10rem' }}
            />

            <div className="flex items-center gap-1 pb-0.5 flex-shrink-0">
              {/* Voice button */}
              <button
                onClick={startVoice}
                disabled={!isSupported}
                title={isSupported ? (isListening ? 'Stop recording' : 'Voice input') : 'Voice not supported in this browser'}
                className={[
                  'p-1.5 rounded-lg transition-colors',
                  isListening
                    ? 'text-red-500 recording-pulse'
                    : 'text-[#6E6A63] dark:text-[#9b9690] hover:text-[#1E1D1B] dark:hover:text-[#E8E4DA]',
                  !isSupported ? 'opacity-40 cursor-not-allowed' : '',
                ].join(' ')}
                aria-label={isListening ? 'Stop recording' : 'Start voice input'}
              >
                {isListening ? <MicOff size={17} /> : <Mic size={17} />}
              </button>

              {/* Send / Stop */}
              {isStreaming ? (
                <button
                  onClick={onStop}
                  className="p-1.5 rounded-lg bg-[#1E1D1B] dark:bg-[#E8E4DA] text-white dark:text-[#1E1D1B] hover:opacity-80 transition-opacity"
                  aria-label="Stop generation"
                >
                  <Square size={15} />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!text.trim() || disabled}
                  className="p-1.5 rounded-lg bg-[#1E1D1B] dark:bg-[#E8E4DA] text-white dark:text-[#1E1D1B] hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Right toolbar */}
          <div className="flex items-center gap-1 pb-1">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[#E8E4DA] dark:border-[#2a2825] bg-white dark:bg-[#1e1e1c] text-xs text-[#6E6A63] dark:text-[#9b9690] hover:text-[#1E1D1B] dark:hover:text-[#E8E4DA] hover:border-[#1E1D1B] dark:hover:border-[#E8E4DA] transition-colors"
                aria-label="Select language"
              >
                <Languages size={14} />
                <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
                <ChevronDown size={11} />
              </button>

              {langOpen && (
                <div className="absolute bottom-full mb-2 right-0 w-52 bg-white dark:bg-[#1e1e1c] border border-[#E8E4DA] dark:border-[#2a2825] rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code)
                          setLangOpen(false)
                        }}
                        className={[
                          'w-full text-left px-3 py-2 text-xs transition-colors',
                          lang.code === languageCode
                            ? 'bg-[#EFECE4] dark:bg-[#2a2825] text-[#1E1D1B] dark:text-[#E8E4DA] font-medium'
                            : 'text-[#6E6A63] dark:text-[#9b9690] hover:bg-[#FAF9F5] dark:hover:bg-[#252320] hover:text-[#1E1D1B] dark:hover:text-[#E8E4DA]',
                        ].join(' ')}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clear */}
            <button
              onClick={onClear}
              title="Clear conversation"
              className="p-1.5 rounded-lg border border-[#E8E4DA] dark:border-[#2a2825] bg-white dark:bg-[#1e1e1c] text-[#6E6A63] dark:text-[#9b9690] hover:text-red-500 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 transition-colors"
              aria-label="Clear conversation"
            >
              <Trash2 size={15} />
            </button>

            {/* Download */}
            <button
              onClick={onExport}
              title="Download transcript"
              className="p-1.5 rounded-lg border border-[#E8E4DA] dark:border-[#2a2825] bg-white dark:bg-[#1e1e1c] text-[#6E6A63] dark:text-[#9b9690] hover:text-[#1E1D1B] dark:hover:text-[#E8E4DA] hover:border-[#1E1D1B] dark:hover:border-[#E8E4DA] transition-colors"
              aria-label="Download transcript"
            >
              <Download size={15} />
            </button>
          </div>
        </div>

        {/* Voice listening indicator */}
        {isListening && (
          <div className="mt-2 flex items-center gap-2 text-xs text-red-500 dark:text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 recording-pulse" />
            Listening... Click the mic to stop.
          </div>
        )}
      </div>
    </div>
  )
}
