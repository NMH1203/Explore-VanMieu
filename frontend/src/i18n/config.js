import vi from '../locales/vi.json'
import en from '../locales/en.json'

export const LANGUAGES = Object.freeze({
  vi: { label: 'Vietnamese', short: 'VI', locale: 'vi-VN', dir: 'ltr', messages: vi },
  en: { label: 'English', short: 'EN', locale: 'en-US', dir: 'ltr', messages: en },
})

export const DEFAULT_LANG = 'vi'
const STORAGE_KEY = 'explore-language'

export const isSupported = (language) => Object.hasOwn(LANGUAGES, language)

export const storage = {
  get() {
    try {
      return typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  },
  set(language) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // Storage can be unavailable in private browsing or restricted environments.
    }
  },
}

export function detectLang() {
  const saved = storage.get()
  if (isSupported(saved)) return saved
  const browser = typeof navigator !== 'undefined' ? navigator.language?.slice(0, 2) : null
  return isSupported(browser) ? browser : DEFAULT_LANG
}
