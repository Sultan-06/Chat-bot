import { useEffect, useRef, useState } from 'react'
import { X, Sun, Moon, Mic, Info, Loader2 } from 'lucide-react'
import { LANGUAGES } from '../utils/languages'
import { DOMAINS } from '../utils/domains'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function SettingsModal({
  open,
  onClose,
  theme,
  onThemeChange,
  languageCode,
  onLanguageChange,
  domainId,
  onDomainChange,
}) {
  const dialogRef = useRef(null)
  const [health, setHealth] = useState(null)
  const [healthLoading, setHealthLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const controller = new AbortController()
    // Use setState inside async callback (not synchronously in the effect)
    fetch(`${API_BASE}/api/health`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setHealth(d) })
      .catch(() => { if (!cancelled) setHealth(null) })
      .finally(() => { if (!cancelled) setHealthLoading(false) })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) dialogRef.current?.focus()
  }, [open])

  if (!open) return null

  const isVoiceSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-md bg-white dark:bg-[#1e1e1c] rounded-2xl border border-[#E8E4DA] dark:border-[#2a2825] shadow-xl outline-none overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DA] dark:border-[#2a2825]">
          <h2 className="text-base font-semibold text-[#1E1D1B] dark:text-[#E8E4DA]">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6E6A63] dark:text-[#9b9690] hover:bg-[#EFECE4] dark:hover:bg-[#2a2825] transition-colors"
            aria-label="Close settings"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Theme */}
          <section>
            <label className="block text-xs font-semibold text-[#6E6A63] dark:text-[#9b9690] uppercase tracking-wider mb-3">
              Appearance
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onThemeChange('light')}
                className={[
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm transition-colors',
                  theme === 'light'
                    ? 'border-[#1E1D1B] dark:border-[#E8E4DA] bg-[#EFECE4] dark:bg-[#2a2825] text-[#1E1D1B] dark:text-[#E8E4DA] font-medium'
                    : 'border-[#E8E4DA] dark:border-[#2a2825] text-[#6E6A63] dark:text-[#9b9690] hover:bg-[#FAF9F5] dark:hover:bg-[#252320]',
                ].join(' ')}
              >
                <Sun size={15} /> Light
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={[
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm transition-colors',
                  theme === 'dark'
                    ? 'border-[#1E1D1B] dark:border-[#E8E4DA] bg-[#EFECE4] dark:bg-[#2a2825] text-[#1E1D1B] dark:text-[#E8E4DA] font-medium'
                    : 'border-[#E8E4DA] dark:border-[#2a2825] text-[#6E6A63] dark:text-[#9b9690] hover:bg-[#FAF9F5] dark:hover:bg-[#252320]',
                ].join(' ')}
              >
                <Moon size={15} /> Dark
              </button>
            </div>
          </section>

          {/* Language */}
          <section>
            <label className="block text-xs font-semibold text-[#6E6A63] dark:text-[#9b9690] uppercase tracking-wider mb-3">
              Language
            </label>
            <select
              value={languageCode}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E8E4DA] dark:border-[#2a2825] bg-[#FAF9F5] dark:bg-[#252320] text-sm text-[#1E1D1B] dark:text-[#E8E4DA] outline-none focus:border-[#1E1D1B] dark:focus:border-[#E8E4DA] transition-colors"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </section>

          {/* Domain / Persona */}
          <section>
            <label className="block text-xs font-semibold text-[#6E6A63] dark:text-[#9b9690] uppercase tracking-wider mb-3">
              Assistant Persona
            </label>
            <div className="space-y-2">
              {DOMAINS.map((domain) => (
                <button
                  key={domain.id}
                  onClick={() => onDomainChange(domain.id)}
                  className={[
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm transition-colors text-left',
                    domainId === domain.id
                      ? 'border-[#1E1D1B] dark:border-[#E8E4DA] bg-[#EFECE4] dark:bg-[#2a2825] text-[#1E1D1B] dark:text-[#E8E4DA]'
                      : 'border-[#E8E4DA] dark:border-[#2a2825] text-[#6E6A63] dark:text-[#9b9690] hover:bg-[#FAF9F5] dark:hover:bg-[#252320] hover:text-[#1E1D1B] dark:hover:text-[#E8E4DA]',
                  ].join(' ')}
                >
                  <span className="text-base">{domain.icon}</span>
                  <div>
                    <div className="font-medium text-xs">{domain.label}</div>
                    <div className="text-xs opacity-70">{domain.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Voice info */}
          <section>
            <label className="block text-xs font-semibold text-[#6E6A63] dark:text-[#9b9690] uppercase tracking-wider mb-2">
              Voice Input
            </label>
            <div className={[
              'flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs',
              isVoiceSupported
                ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
            ].join(' ')}>
              <Mic size={14} className="mt-0.5 flex-shrink-0" />
              <span>
                {isVoiceSupported
                  ? 'Voice input is supported in your browser. Click the mic icon in the composer to record.'
                  : 'Voice input requires Chrome or Edge. It is not supported in your current browser.'}
              </span>
            </div>
          </section>

          {/* Backend status */}
          <section>
            <label className="block text-xs font-semibold text-[#6E6A63] dark:text-[#9b9690] uppercase tracking-wider mb-2">
              Backend Status
            </label>
            {healthLoading ? (
              <div className="flex items-center gap-2 text-xs text-[#6E6A63] dark:text-[#9b9690]">
                <Loader2 size={12} className="animate-spin" />
                Connecting…
              </div>
            ) : health ? (
              <div className="bg-[#FAF9F5] dark:bg-[#252320] border border-[#E8E4DA] dark:border-[#2a2825] rounded-xl px-3 py-2.5 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6E6A63] dark:text-[#9b9690]">Status</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {health.status === 'ok' ? '✓ Connected' : health.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6A63] dark:text-[#9b9690]">Provider</span>
                  <span className="text-[#1E1D1B] dark:text-[#E8E4DA]">{health.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6A63] dark:text-[#9b9690]">Model</span>
                  <span className="text-[#1E1D1B] dark:text-[#E8E4DA] text-right max-w-[60%] truncate">{health.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6A63] dark:text-[#9b9690]">API Key</span>
                  <span className={health.apiKeyConfigured ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                    {health.apiKeyConfigured ? '✓ Configured' : '✗ Missing'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <span>
                  Cannot reach backend. Make sure the server is running on{' '}
                  <code className="font-mono">{API_BASE}</code>.
                </span>
              </div>
            )}
          </section>

          {/* App info */}
          <section className="pt-1 border-t border-[#E8E4DA] dark:border-[#2a2825]">
            <p className="text-xs text-[#6E6A63] dark:text-[#9b9690] text-center">
              Aura AI · Built with React, Vite &amp; Tailwind CSS v4
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
