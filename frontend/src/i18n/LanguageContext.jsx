import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_LANG, isSupported, LANGUAGES, detectLang, storage } from './config.js'

// React Context for internationalization
const LanguageContext = createContext(null)

// Helper to look up a nested key using dot-notation (e.g. 'home.welcome.title')
function lookup(messages, path) {
  return path.split('.').reduce((value, key) => value?.[key], messages)
}

// Language Provider component wrapping the app to supply translation helpers
export function LanguageProvider({ children }) {
  // Current active language state (defaults to detected preference)
  const [lang, setLangState] = useState(detectLang)

  // Switch language handler (only accepts supported languages)
  const setLang = useCallback((nextLanguage) => {
    if (isSupported(nextLanguage)) setLangState(nextLanguage)
  }, [])

  // Update HTML tag attributes and sync language preference with localStorage
  useEffect(() => {
    storage.set(lang)
    document.documentElement.lang = lang
    document.documentElement.dir = LANGUAGES[lang].dir
  }, [lang])

  // Translation function: resolves dot-notation key, handles plurals, and replaces {{variable}}
  const t = useCallback((path, params = {}) => {
    let message = lookup(LANGUAGES[lang].messages, path)
      ?? lookup(LANGUAGES[DEFAULT_LANG].messages, path)

    if (message === undefined) {
      if (import.meta.env.DEV) console.warn(`[i18n] Missing translation key: ${path}`)
      return path
    }

    // Handle pluralization if message object contains plural keys (e.g., { one: '...', other: '...' })
    if (message && typeof message === 'object' && 'count' in params) {
      const plural = new Intl.PluralRules(LANGUAGES[lang].locale).select(params.count)
      message = message[plural] ?? message.other
    }

    // Interpolate variables (e.g., {{name}} -> actual parameter value)
    return String(message).replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? ''))
  }, [lang])

  // Memoize context value to optimize re-renders
  const value = useMemo(() => ({ lang, setLang, t, locale: LANGUAGES[lang].locale }), [lang, setLang, t])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

// Custom hook to consume language context in any component
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return context
}

