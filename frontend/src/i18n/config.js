import vi from '../locales/vi.json'
import en from '../locales/en.json'

// Supported languages configuration and translation dictionaries
export const LANGUAGES = Object.freeze({
  vi: { label: 'Vietnamese', short: 'VI', locale: 'vi-VN', dir: 'ltr', messages: vi },
  en: { label: 'English', short: 'EN', locale: 'en-US', dir: 'ltr', messages: en },
})

// Default application fallback language
export const DEFAULT_LANG = 'vi'
const STORAGE_KEY = 'explore-language'

// Helper to check whether a given language code is supported
export const isSupported = (language) => Object.hasOwn(LANGUAGES, language)

// LocalStorage wrapper to persist and retrieve chosen language preference safely
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

// Detect language: check saved preference in localStorage first, then browser setting, or fallback to default
export function detectLang() {
  const saved = storage.get()
  if (isSupported(saved)) return saved
  const browser = typeof navigator !== 'undefined' ? navigator.language?.slice(0, 2) : null
  return isSupported(browser) ? browser : DEFAULT_LANG
}

