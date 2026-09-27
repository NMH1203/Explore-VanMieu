import { useLanguage } from '../../i18n/LanguageContext.jsx'
import { LANGUAGES } from '../../i18n/config.js'

export default function LanguageSwitch() {
  const { lang, setLang, t } = useLanguage()
  const entries = Object.entries(LANGUAGES)
  if (entries.length < 2) return null

  return (
    <div className="language-switch" role="group" aria-label={t('common.language')}>
      {entries.map(([code, { short, label }]) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={lang === code}
          aria-label={label}
          onClick={() => setLang(code)}
        >
          {short}
        </button>
      ))}
    </div>
  )
}

