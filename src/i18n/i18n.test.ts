import { describe, it, expect, beforeEach } from 'vitest'

describe('i18n initialization', () => {
  describe('default language (no localStorage value)', () => {
    it('should initialize to Polish when no stored preference exists', async () => {
      const i18n = (await import('./index')).default
      expect(i18n.language).toBe('pl')
    })

    it('should return Polish translation for nav.dashboard', async () => {
      const i18n = (await import('./index')).default
      expect(i18n.t('nav.dashboard')).toBe('Pulpit')
    })

    it('should return a non-empty string for nav.dashboard', async () => {
      const i18n = (await import('./index')).default
      expect(i18n.t('nav.dashboard')).toBeTruthy()
    })

    it('should return Polish app name for app.name', async () => {
      const i18n = (await import('./index')).default
      expect(i18n.t('app.name')).toBe('Słówko')
    })

    it('should return a non-empty string for errors.somethingWentWrong', async () => {
      const i18n = (await import('./index')).default
      expect(i18n.t('errors.somethingWentWrong')).toBeTruthy()
    })
  })

  describe('Polish plural forms — SUCCESS CRITERION 3', () => {
    it('should return "znaczenie" for count=1 (Polish _one form)', async () => {
      const i18n = (await import('./index')).default
      expect(i18n.t('meaning', { count: 1 })).toBe('znaczenie')
    })

    it('should return "znaczenia" for count=2 (Polish _few form)', async () => {
      const i18n = (await import('./index')).default
      expect(i18n.t('meaning', { count: 2 })).toBe('znaczenia')
    })

    it('should return "znaczeń" for count=5 (Polish _many form)', async () => {
      const i18n = (await import('./index')).default
      expect(i18n.t('meaning', { count: 5 })).toBe('znaczeń')
    })
  })

  describe('localStorage language preference', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('should use English when localStorage has little-words-lang = "en"', async () => {
      localStorage.setItem('little-words-lang', 'en')
      const i18n = (await import('./index')).default
      await i18n.changeLanguage('en')
      expect(i18n.language).toBe('en')
      expect(i18n.t('nav.dashboard')).toBe('Dashboard')
    })
  })
})
