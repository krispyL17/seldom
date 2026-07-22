export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-text-tertiary)]"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}
