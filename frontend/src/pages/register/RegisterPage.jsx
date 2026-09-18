import { useState } from 'react'
import { CircleHelp, UserRound } from 'lucide-react'
import './register.css'

function RegisterPage({ onAuthenticate }) {
  const [mode, setMode] = useState('login')
  const signup = mode === 'signup'

  function handleSubmit(event) {
    event.preventDefault()
    onAuthenticate()
  }
  return <section className="account-auth">
    <header className="account-auth__header">
      <UserRound aria-hidden="true" />
      <div>
        <h1>Your Account</h1>
        <p>Log in to scan QR codes and collect heritage stamps</p>
      </div>
    </header>

    <div className="account-auth__content">
      <div className="account-auth__card">
        <div className="account-auth__tabs" role="tablist">
          <button className={!signup ? 'active' : ''} type="button" onClick={() => setMode('login')}>Log in</button>
          <button className={signup ? 'active' : ''} type="button" onClick={() => setMode('signup')}>Sign up</button>
        </div>

        <form onSubmit={handleSubmit}>
          {signup && <input aria-label="Full name" type="text" placeholder="Full name" autoComplete="name" required />}
          <input aria-label="Email" type="email" placeholder="Email" autoComplete="email" required />
          <input aria-label="Password" type="password" placeholder="Password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} required />
          <button className="account-auth__submit" type="submit">{signup ? 'Sign up' : 'Log in'}</button>
        </form>
        <a className="account-auth__back" href="/Explore">← Continue exploring as a guest</a>

        <p className="account-auth__notice">
          <CircleHelp aria-hidden="true" />
          Browsing the Gallery, Categories and Digital Experience is always free — you only need an account to scan QR codes and collect heritage stamps.
        </p>
      </div>
    </div>
  </section>
}

export default RegisterPage
