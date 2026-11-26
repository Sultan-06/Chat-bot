import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm bg-white dark:bg-[#1e1e1c] rounded-2xl border border-[#E8E4DA] dark:border-[#2a2825] shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E4DA] dark:border-[#2a2825]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-[#1E1D1B] dark:text-[#E8E4DA]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-[#6E6A63] dark:text-[#9b9690] hover:bg-[#EFECE4] dark:hover:bg-[#2a2825] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-[#6E6A63] dark:text-[#9b9690]">{message}</p>
        </div>
        <div className="flex gap-2 px-5 pb-4">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-[#E8E4DA] dark:border-[#2a2825] text-sm text-[#6E6A63] dark:text-[#9b9690] hover:bg-[#FAF9F5] dark:hover:bg-[#252320] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
