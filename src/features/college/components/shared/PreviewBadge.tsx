import { Badge } from '@components/ui/Badge'
import { IconSparkles } from '@components/ui/icons'

/** Consistent preview badge for AI features not yet live */
export function PreviewBadge() {
  return (
    <Badge variant="accent" className="normal-case tracking-normal">
      <IconSparkles width={10} height={10} className="mr-1" aria-hidden />
      Preview
    </Badge>
  )
}
