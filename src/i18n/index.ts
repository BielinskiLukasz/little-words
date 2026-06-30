import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import plCommon from './locales/pl/common.json'
import plOnboarding from './locales/pl/onboarding.json'
import enCommon from './locales/en/common.json'
import enOnboarding from './locales/en/onboarding.json'

const LANG_KEY = 'little-words-lang'

const storedLang = localStorage.getItem(LANG_KEY)
const lng = storedLang === 'pl' || storedLang === 'en' ? storedLang : 'pl'

i18n.use(initReactI18next).init({
  resources: {
    pl: { common: plCommon, onboarding: plOnboarding },
    en: { common: enCommon, onboarding: enOnboarding },
  },
  lng,
  fallbackLng: 'pl',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export { LANG_KEY }
export default i18n
