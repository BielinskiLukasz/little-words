import { useCallback } from 'react'
import { useUIStore } from '@/stores/ui.store'

const IOS_PROMPT_SEEN_KEY = 'little-words-ios-prompt-seen'

export function useiOSInstallPrompt() {
  const iosInstallPromptSeen = useUIStore((s) => s.iosInstallPromptSeen)
  const setIosInstallPromptSeen = useUIStore((s) => s.setIosInstallPromptSeen)

  const isIOS =
    navigator.userAgent.includes('iPhone') ||
    navigator.userAgent.includes('iPad')
  const alreadyDismissed = localStorage.getItem(IOS_PROMPT_SEEN_KEY) === 'true'

  const shouldShow = isIOS && !alreadyDismissed && iosInstallPromptSeen

  const dismiss = useCallback(() => {
    localStorage.setItem(IOS_PROMPT_SEEN_KEY, 'true')
    setIosInstallPromptSeen(false)
  }, [setIosInstallPromptSeen])

  return { shouldShow, dismiss }
}
