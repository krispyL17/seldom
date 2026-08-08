import { useEffect } from 'react'
import { useCollegeAdvisorChatContext } from '@features/ai-session/providers/CollegeAdvisorChatProvider'

export function useCollegeAdvisor(isSeniorMode: boolean) {
  const ctx = useCollegeAdvisorChatContext()

  useEffect(() => {
    ctx.setSeniorMode(isSeniorMode)
  }, [isSeniorMode, ctx.setSeniorMode])

  return {
    messages: ctx.messages,
    input: ctx.input,
    setInput: ctx.setInput,
    isTyping: ctx.isTyping,
    sendMessage: ctx.sendMessage,
  }
}
