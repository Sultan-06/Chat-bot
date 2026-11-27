import { Menu, Share } from 'lucide-react'
import { getDomainById } from '../utils/domains'

export default function Header({
  onMobileSidebarOpen,
  onExport,
  domainId,
}) {
  const domain = getDomainById(domainId)
  const isNonDefault = domainId && domainId !== 'general'

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-[#E8E4DA] dark:border-[#2a2825] bg-[#FCFBF8] dark:bg-[#141312]">
      <div className="flex items-center gap-3 min-h-[30px]">
        {/* Mobile menu toggle */}
        <button
          onClick={onMobileSidebarOpen}
          className="md:hidden p-1.5 rounded-lg text-[#6E6A63] dark:text-[#9b9690] hover:bg-[#EFECE4] dark:hover:bg-[#2a2825] transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Domain persona pill */}
        {isNonDefault && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#EFECE4] dark:bg-[#2a2825] text-[#6E6A63] dark:text-[#9b9690] border border-[#E8E4DA] dark:border-[#3a3732]">
            <span>{domain.icon}</span>
            <span>{domain.label}</span>
          </span>
        )}
      </div>

      {/* Export button */}
      <button
        onClick={onExport}
        title="Export transcript"
        className="p-1.5 rounded-lg text-[#6E6A63] dark:text-[#9b9690] hover:bg-[#EFECE4] dark:hover:bg-[#2a2825] hover:text-[#1E1D1B] dark:hover:text-[#E8E4DA] transition-colors"
        aria-label="Export transcript"
      >
        <Share size={18} />
      </button>
    </header>
  )
}
