import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_LANG, isSupported, LANGUAGES, detectLang, storage } from './config.js'

const LanguageContext = createContext(null)

function lookup(messages, path) {
  return path.split('.').reduce((value, key) => value?.[key], messages)
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectLang)
  const setLang = useCallback((nextLanguage) => {
    if (isSupported(nextLanguage)) setLangState(nextLanguage)
  }, [])

  useEffect(() => {
    storage.set(lang)
    document.documentElement.lang = lang
    document.documentElement.dir = LANGUAGES[lang].dir
  }, [lang])

  const t = useCallback((path, params = {}) => {
    let message = lookup(LANGUAGES[lang].messages, path)
      ?? lookup(LANGUAGES[DEFAULT_LANG].messages, path)

    if (message === undefined) {
      if (import.meta.env.DEV) console.warn(`[i18n] Missing translation key: ${path}`)
      return path
    }

    if (message && typeof message === 'object' && 'count' in params) {
      const plural = new Intl.PluralRules(LANGUAGES[lang].locale).select(params.count)
      message = message[plural] ?? message.other
    }

    return String(message).replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? ''))
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t, locale: LANGUAGES[lang].locale }), [lang, setLang, t])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return context
}
