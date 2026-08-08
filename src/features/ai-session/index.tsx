import type { ReactNode } from 'react'
import { AiFloatingSessionProvider } from './providers/AiFloatingSessionProvider'
import { AssistantChatProvider } from './providers/AssistantChatProvider'
import { CollegeAdvisorChatProvider } from './providers/CollegeAdvisorChatProvider'

export function AiSessionProviders({ children }: { children: ReactNode }) {
  return (
    <AiFloatingSessionProvider>
      <AssistantChatProvider>
        <CollegeAdvisorChatProvider>{children}</CollegeAdvisorChatProvider>
      </AssistantChatProvider>
    </AiFloatingSessionProvider>
  )
}

export { AiFloatingPopup } from './components/AiFloatingPopup'
export { useAssistantChatContext } from './providers/AssistantChatProvider'
export { useCollegeAdvisorChatContext } from './providers/CollegeAdvisorChatProvider'
