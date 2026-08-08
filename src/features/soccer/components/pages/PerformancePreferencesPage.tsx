import { Panel } from '@components/ui/Panel'
import { CustomTabsEditor } from '../../athlete/components/CustomTabsEditor'
import { useAthleteDevelopment } from '../../hooks/useAthleteDevelopment'

export function PerformancePreferencesPage() {
  const { development, setGymEnabled } = useAthleteDevelopment()

  return (
    <div className="w-full pb-2">
      <Panel
        title="Tab preferences"
        subtitle="Optional focus tabs and gym visibility"
        className="w-full"
      >
        <div className="space-y-6">
          <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-4">
            <input
              type="checkbox"
              checked={development.gymEnabled}
              onChange={(e) => void setGymEnabled(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)]"
            />
            <span>
              <span className="block text-sm font-medium text-[var(--color-text-primary)]">Show Gym tab</span>
              <span className="mt-1 block text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                Turn on if you lift or work out in the gym. You can also enable this during performance setup.
              </span>
            </span>
          </label>

          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)]/40 p-4">
            <CustomTabsEditor />
          </div>
        </div>
      </Panel>
    </div>
  )
}
