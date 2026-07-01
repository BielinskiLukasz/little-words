import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { LANG_KEY } from '@/i18n'

export function useSettings() {
  const { i18n } = useTranslation()

  const setLanguage = useCallback(
    (lang: 'pl' | 'en') => {
      void i18n.changeLanguage(lang)
      localStorage.setItem(LANG_KEY, lang)
    },
    [i18n]
  )

  return {
    currentLanguage: i18n.language,
    setLanguage,
  }
}
