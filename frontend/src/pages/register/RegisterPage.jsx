import { useState } from 'react'
import { CircleHelp } from 'lucide-react'
import './register.css'
import { login, register } from '../../services/auth-service/index.js'
import { useLanguage } from '../../i18n/LanguageContext.jsx'

function RegisterPage({ onAuthenticate }) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState('login')
  const signup = mode === 'signup'
  const [username, setUsername] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setBusy(true)

    try {
      if (signup) {
        await register(email, password, username)
        setMode('login')
        setPassword('')
        return
      }

      const user = await login(email, password)
      onAuthenticate(user)
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
    }
  }

  return <section className="screen register" id="register">
    <header className="topbar">
      <div className="inner">
        <div className="eyebrow">{t("auth.eyebrow")}</div>
        <h1>{t("auth.login")}</h1>
        <p>{t("auth.tagline")}</p>
      </div>
    </header>

    <div className="register__content">
      <div className="register__card">
        <div className="register__tabs" role="tablist">
          <button className={!signup ? 'active' : ''} type="button" onClick={() => setMode('login')}>{t("auth.login")}</button>
          <button className={signup ? 'active' : ''} type="button" onClick={() => setMode('signup')}>{t("auth.signup")}</button>
        </div>

        <form onSubmit={handleSubmit}>
          {signup && (
            <input
              aria-label={t("auth.fullName")}
              type="text"
              placeholder={t("auth.fullName")}
              autoComplete="name"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          )}
          <input
            aria-label={t("auth.email")}
            type="email"
            placeholder={t("auth.email")}
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            aria-label={t("auth.password")}
            type="password"
            placeholder={t("auth.password")}
            autoComplete={signup ? 'new-password' : 'current-password'}
            minLength={signup ? 8 : undefined}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            className="register__submit"
            type="submit"
            disabled={busy}
          >
            {busy ? t("auth.busy") : signup ? t("auth.signup") : t("auth.login")}
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
        <a className="register__back" href="/Explore">{t("auth.continueGuest")}</a>

        <p className="register__notice">
          <CircleHelp aria-hidden="true" />
          {t("auth.notice")}
        </p>
      </div>
    </div>
  </section>
}

export default RegisterPage
