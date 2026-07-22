import { SidebarNav } from './SidebarNav'
import { SidebarBrand, SidebarFooter } from './SidebarBrand'

interface SidebarProps {
  onNavigate?: () => void
}

/**
 * Desktop left sidebar — fixed width, visible on md+ screens.
 */
export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-raised)] md:flex">
      <div className="flex h-16 items-center px-5">
        <SidebarBrand />
      </div>

      <SidebarNav onNavigate={onNavigate} />

      <SidebarFooter />
    </aside>
  )
}
