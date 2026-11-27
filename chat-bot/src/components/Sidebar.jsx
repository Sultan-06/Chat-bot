import { useState, useRef } from 'react'
import {
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
  Search,
  History,
  ChevronDown,
  ChevronRight,
  Trash2,
  Settings,
  X,
} from 'lucide-react'

export default function Sidebar({
  sessions,
  activeId,
  onNewChat,
  onSwitch,
  onDelete,
  onSettings,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}) {
  const [search, setSearch] = useState('')
  const [historyOpen, setHistoryOpen] = useState(true)
  const searchInputRef = useRef(null)

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  // Sort by most recent
  const sorted = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt)

  const handleRailSearch = () => {
    onToggleCollapse()
    setTimeout(() => searchInputRef.current?.focus(), 60)
  }

  const handleRailHistory = () => {
    setHistoryOpen(true)
    onToggleCollapse()
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          'flex flex-col fixed md:relative z-40 h-full transition-all duration-200',
          'border-r border-[#E8E4DA] dark:border-[#2a2825]',
          // Mobile: slide in/out
          mobileOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full md:translate-x-0',
          // Desktop width: full or slim icon rail
          collapsed ? 'md:w-16' : 'md:w-64',
          'bg-[#F7F5F0] dark:bg-[#1a1917]',
        ].join(' ')}
      >
        {/* Collapsed Desktop Icon Rail (logo only, no name, all options accessible) */}
        {collapsed && (
          <div className="hidden md:flex flex-1 flex-col items-center py-3 min-h-0">
            {/* Top Logo -> swaps to Expand icon on hover */}
            <button
              onClick={onToggleCollapse}
              title="Open sidebar"
              aria-label="Open sidebar"
              className="group relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#E8E4DA] dark:hover:bg-[#2a2825] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-[#1E1D1B] dark:bg-[#E8E4DA] flex items-center justify-center transition-opacity group-hover:opacity-0">
                <span className="text-[#F7F5F0] dark:text-[#1E1D1B] text-xs font-bold">A</span>
              </div>
              <PanelLeftOpen
                size={18}
                className="absolute text-[#6E6A63] dark:text-[#9b9690] group-hover:text-[#1E1D1B] dark:group-hover:text-[#E8E4DA] opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>

            {/* Primary options */}
            <div className="mt-4 flex flex-col items-center gap-1.5">
              <button
                onClick={onNewChat}
                title="New Chat"
                aria-label="New Chat"
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#6E6A63] dark:text-[#9b9690] hover:text-[#1E1D1B] dark:hover:text-[#E8E4DA] hover:bg-[#E8E4DA] dark:hover:bg-[#2a2825] transition-colors"
              >
                <SquarePen size={18} />
              </button>

              <button
                onClick={handleRailSearch}
                title="Search conversations"
                aria-label="Search conversations"
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#6E6A63] dark:text-[#9b9690] hover:text-[#1E1D1B] dark:hover:text-[#E8E4DA] hover:bg-[#E8E4DA] dark:hover:bg-[#2a2825] transition-colors"
              >
                <Search size={18} />
              </button>

              <button
                onClick={handleRailHistory}
                title="Chat history"
                aria-label="Chat history"
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#6E6A63] dark:text-[#9b9690] hover:text-[#1E1D1B] dark:hover:text-[#E8E4DA] hover:bg-[#E8E4DA] dark:hover:bg-[#2a2825] transition-colors"
              >
                <History size={18} />
              </button>
            </div>

            {/* Settings pinned bottom */}
            <div className="mt-auto pt-3 border-t border-[#E8E4DA] dark:border-[#2a2825] flex flex-col items-center">
              <button
                onClick={onSettings}
                title="Settings"
                aria-label="Settings"
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#6E6A63] dark:text-[#9b9690] hover:text-[#1E1D1B] dark:hover:text-[#E8E4DA] hover:bg-[#E8E4DA] dark:hover:bg-[#2a2825] transition-colors"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Expanded Sidebar (always visible on mobile drawer, and on desktop when open) */}
        <div className={collapsed ? 'flex md:hidden flex-1 flex-col min-h-0' : 'flex flex-1 flex-col min-h-0'}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#E8E4DA] dark:border-[#2a2825]">
            <div className="flex items-center gap-2">
              {/* Logo */}
              <div className="w-7 h-7 rounded-lg bg-[#1E1D1B] dark:bg-[#E8E4DA] flex items-center justify-center flex-shrink-0">
                <span className="text-[#F7F5F0] dark:text-[#1E1D1B] text-xs font-bold">A</span>
              </div>
              <span className="font-semibold text-sm text-[#1E1D1B] dark:text-[#E8E4DA] whitespace-nowrap">
                Aura AI
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onMobileClose}
                className="md:hidden p-1 rounded hover:bg-[#E8E4DA] dark:hover:bg-[#2a2825] text-[#6E6A63] dark:text-[#9b9690]"
                aria-label="Close sidebar"
              >
                <X size={16} />
              </button>
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex p-1 rounded hover:bg-[#E8E4DA] dark:hover:bg-[#2a2825] text-[#6E6A63] dark:text-[#9b9690]"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>
          </div>

          {/* New Chat */}
          <div className="px-3 pt-3 pb-2">
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#1E1D1B] dark:text-[#E8E4DA] hover:bg-[#E8E4DA] dark:hover:bg-[#2a2825] transition-colors"
            >
              <SquarePen size={16} />
              New Chat
            </button>
          </div>

          {/* Search */}
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#252320] border border-[#E8E4DA] dark:border-[#2a2825]">
              <Search size={13} className="text-[#6E6A63] dark:text-[#9b9690] flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-xs bg-transparent outline-none text-[#1E1D1B] dark:text-[#E8E4DA] placeholder:text-[#6E6A63] dark:placeholder:text-[#9b9690]"
              />
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-2">
            <button
              onClick={() => setHistoryOpen((v) => !v)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-[#6E6A63] dark:text-[#9b9690] hover:text-[#1E1D1B] dark:hover:text-[#E8E4DA] transition-colors"
            >
              <History size={13} />
              <span>Chat history</span>
              {historyOpen ? (
                <ChevronDown size={12} className="ml-auto" />
              ) : (
                <ChevronRight size={12} className="ml-auto" />
              )}
            </button>

            {historyOpen && (
              <div className="mt-1 space-y-0.5">
                {sorted.length === 0 && (
                  <p className="px-3 py-2 text-xs text-[#6E6A63] dark:text-[#9b9690]">
                    No conversations yet
                  </p>
                )}
                {sorted.map((s) => (
                  <ConversationItem
                    key={s.id}
                    session={s}
                    isActive={s.id === activeId}
                    onSwitch={onSwitch}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Settings pinned bottom */}
          <div className="px-3 py-3 border-t border-[#E8E4DA] dark:border-[#2a2825]">
            <button
              onClick={onSettings}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#6E6A63] dark:text-[#9b9690] hover:text-[#1E1D1B] dark:hover:text-[#E8E4DA] hover:bg-[#E8E4DA] dark:hover:bg-[#2a2825] transition-colors"
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function ConversationItem({ session, isActive, onSwitch, onDelete }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={[
        'group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm',
        isActive
          ? 'bg-[#E8E4DA] dark:bg-[#2a2825] text-[#1E1D1B] dark:text-[#E8E4DA]'
          : 'text-[#6E6A63] dark:text-[#9b9690] hover:bg-[#EFECE4] dark:hover:bg-[#252320] hover:text-[#1E1D1B] dark:hover:text-[#E8E4DA]',
      ].join(' ')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSwitch(session.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSwitch(session.id)}
    >
      <span className="flex-1 truncate text-xs">{session.title}</span>
      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(session.id)
          }}
          className="p-0.5 rounded hover:text-red-500 transition-colors flex-shrink-0"
          aria-label="Delete conversation"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  )
}
