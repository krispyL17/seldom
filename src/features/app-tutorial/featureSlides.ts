import type { ComponentType, SVGProps } from 'react'
import {
  IconAnalytics,
  IconCalendar,
  IconCollege,
  IconGoals,
  IconHome,
  IconJournal,
  IconSettings,
  IconSoccer,
  IconSparkles,
  IconTasks,
} from '@components/ui/icons'

export interface FeatureSlide {
  id: string
  title: string
  description: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  accent?: string
}

export function buildFeatureSlides(hobbyTabLabel: string): FeatureSlide[] {
  return [
    {
      id: 'home',
      title: 'Home',
      description:
        'Your command center. Tasks, goals, journal highlights, and daily context in one view.',
      icon: IconHome,
    },
    {
      id: 'tasks',
      title: 'Tasks',
      description:
        'Capture and prioritize work. Deadlines, categories, and completion tracking without clutter.',
      icon: IconTasks,
    },
    {
      id: 'goals',
      title: 'Goals',
      description:
        'Set long-term targets with milestones. Progress stays visible so you know where you stand.',
      icon: IconGoals,
    },
    {
      id: 'college',
      title: 'College',
      description:
        'Application prep when you need it — schools, deadlines, essays, and financial aid in one workspace.',
      icon: IconCollege,
    },
    {
      id: 'passion',
      title: hobbyTabLabel,
      description: `Your performance hub for ${hobbyTabLabel.toLowerCase()}. Training logs, metrics, matches, and development tracking.`,
      icon: IconSoccer,
    },
    {
      id: 'journal',
      title: 'Journal',
      description:
        'Reflect, debrief, and note patterns. Searchable entries tied to your broader progress.',
      icon: IconJournal,
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description:
        'Week, month, and list views for task and goal deadlines. Export to your device calendar or enable reminders.',
      icon: IconCalendar,
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description:
        'Cross-domain charts — tasks, goals, training, running, college, and journal trends together.',
      icon: IconAnalytics,
    },
    {
      id: 'assistant',
      title: 'Seldom OS',
      description:
        'Your AI layer. Ask questions, get plans, and connect context across every module.',
      icon: IconSparkles,
    },
    {
      id: 'settings',
      title: 'Settings',
      description:
        'Theme, animations, tab labels, and account preferences. Replay this tour anytime.',
      icon: IconSettings,
    },
  ]
}
