import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Copy, Check } from 'lucide-react'

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false)
  const code = String(children).replace(/\n$/, '')

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className="relative group my-3">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-[#2a2825]/80 text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1"
        aria-label="Copy code"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <code className={className}>{children}</code>
    </div>
  )
}

const markdownComponents = {
  pre({ children }) {
    return (
      <pre className="rounded-lg overflow-hidden border border-[#E6E2D8] dark:border-[#2a2825] text-sm">
        {children}
      </pre>
    )
  },
  code({ node: _node, inline, className, children, ...props }) {
    if (inline) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
    return <CodeBlock className={className}>{children}</CodeBlock>
  },
}

export default function MessageBubble({ message, isRtl }) {
  const isUser = message.role === 'user'
  if (!isUser && !message.content) return null
  const dir = isRtl ? 'rtl' : 'ltr'

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="flex flex-col items-end gap-1 max-w-[80%]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-[#6E6A63] dark:text-[#9b9690]">You</span>
            <div className="w-6 h-6 rounded-full bg-[#6E6A63] dark:bg-[#9b9690] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">Y</span>
            </div>
          </div>
          <div
            className="bg-[#EFECE4] dark:bg-[#2a2825] rounded-2xl px-4 py-3 text-sm text-[#1E1D1B] dark:text-[#E8E4DA] whitespace-pre-wrap break-words"
            dir={dir}
          >
            {message.content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="flex flex-col gap-1 max-w-[85%] min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-[#1E1D1B] dark:bg-[#E8E4DA] flex items-center justify-center flex-shrink-0">
            <span className="text-[#F7F5F0] dark:text-[#1E1D1B] text-[10px] font-bold">A</span>
          </div>
          <span className="text-xs font-medium text-[#6E6A63] dark:text-[#9b9690]">Aura AI</span>
        </div>
        <div
          className="bg-white dark:bg-[#1e1e1c] border border-[#E6E2D8] dark:border-[#2a2825] rounded-2xl px-4 py-3 text-sm text-[#1E1D1B] dark:text-[#E8E4DA] min-w-0"
          dir={dir}
        >
          <div className="prose-ai min-w-0 overflow-hidden">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
