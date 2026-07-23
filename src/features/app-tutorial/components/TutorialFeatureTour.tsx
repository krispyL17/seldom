import { useState } from 'react'
import { Button } from '@components/ui/Button'
import { cn } from '@lib/utils'
import type { FeatureSlide } from '../featureSlides'

interface TutorialFeatureTourProps {
  slides: FeatureSlide[]
  onFinish: () => void
}

export function TutorialFeatureTour({ slides, onFinish }: TutorialFeatureTourProps) {
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  const Icon = slide.icon
  const isLast = index === slides.length - 1

  function next() {
    if (isLast) {
      onFinish()
    } else {
      setIndex((i) => i + 1)
    }
  }

  function prev() {
    setIndex((i) => Math.max(0, i - 1))
  }

  return (
    <div className="flex min-h-[22rem] flex-col">
      <div
        key={slide.id}
        className="flex flex-1 flex-col items-center justify-center px-4 py-6 text-center animate-slide-up"
      >
        <div
          className={cn(
            'mb-6 flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)]',
            'border border-[var(--color-border)] bg-[var(--color-surface-overlay)]',
            'transition-transform duration-300 hover:scale-[1.02]',
          )}
        >
          <Icon width={32} height={32} className="text-[var(--color-text-secondary)]" aria-hidden />
        </div>

        <h3 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          {slide.title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {slide.description}
        </p>

        <p className="mt-6 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
          {index + 1} of {slides.length}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
        <Button variant="ghost" size="sm" onClick={prev} disabled={index === 0}>
          Back
        </Button>

        <div className="flex gap-1">
          {slides.map((s, i) => (
            <span
              key={s.id}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === index ? 'w-4 bg-[var(--color-accent)]' : 'w-1.5 bg-[var(--color-surface-elevated)]',
              )}
              aria-hidden
            />
          ))}
        </div>

        <Button size="sm" onClick={next}>
          {isLast ? 'Finish tour' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
