import { useState, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@lib/utils'
import { sanitizeHref } from '@lib/safeUrl'

interface MarkdownContentProps {
  content: string
  className?: string
}

function CodeBlock({ className, children }: { className?: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false)
  const language = className?.replace('language-', '') ?? 'text'
  const code = String(children).replace(/\n$/, '')

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group relative my-3 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[#0d0d0d]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {language}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
          className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-sm leading-relaxed">
        <code className="font-mono text-[var(--color-text-primary)]">{code}</code>
      </pre>
    </div>
  )
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        'prose-chat text-sm leading-relaxed text-[var(--color-text-primary)]',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="text-[var(--color-text-secondary)]">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--color-text-primary)]">{children}</strong>
          ),
          em: ({ children }) => <em className="text-[var(--color-text-secondary)]">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-[var(--color-accent)] pl-3 text-[var(--color-text-secondary)]">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => {
            const safeHref = sanitizeHref(href)
            if (!safeHref) return <span className="text-[var(--color-text-secondary)]">{children}</span>
            return (
              <a
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent-muted)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
              >
                {children}
              </a>
            )
          },
          code: ({ className: codeClass, children }) => {
            const isBlock = codeClass?.includes('language-')
            if (isBlock) {
              return <CodeBlock className={codeClass}>{children}</CodeBlock>
            }
            return (
              <code className="rounded bg-[var(--color-surface-elevated)] px-1.5 py-0.5 font-mono text-[12px] text-[var(--color-accent-muted)]">
                {children}
              </code>
            )
          },
          pre: ({ children }) => <>{children}</>,
          h1: ({ children }) => <h1 className="mb-2 text-base font-semibold">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-2 text-sm font-semibold">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-1 text-sm font-medium">{children}</h3>,
          hr: () => <hr className="my-4 border-[var(--color-border)]" />,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1 text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[var(--color-border)] px-2 py-1">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
