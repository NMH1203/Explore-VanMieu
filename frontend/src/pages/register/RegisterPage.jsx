import { useState } from 'react'
import { CircleHelp } from 'lucide-react'
import './register.css'
import { login, register } from '../../services/auth.js'

function RegisterPage({ onAuthenticate }) {
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
        <div className="eyebrow">Khám phá hành trình của riêng bạn</div>
        <h1>Đăng nhập</h1>
        <p>Trở thành người đồng hành cùng Văn Miếu</p>
      </div>
    </header>

    <div className="register__content">
      <div className="register__card">
        <div className="register__tabs" role="tablist">
          <button className={!signup ? 'active' : ''} type="button" onClick={() => setMode('login')}>Đăng nhập</button>
          <button className={signup ? 'active' : ''} type="button" onClick={() => setMode('signup')}>Đăng ký</button>
        </div>

        <form onSubmit={handleSubmit}>
          {signup && (
            <input
              aria-label="Họ và tên"
              type="text"
              placeholder="Họ và tên"
              autoComplete="name"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          )}
          <input
            aria-label="Email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            aria-label="Mật khẩu"
            type="password"
            placeholder="Mật khẩu"
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
            {busy ? 'Đang đăng nhập...' : signup ? 'Đăng ký' : 'Đăng nhập'}
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
        <a className="register__back" href="/Explore">← Tiếp tục khám phá với tư cách khách</a>

        <p className="register__notice">
          <CircleHelp aria-hidden="true" />
          Duyệt Thư viện, Danh mục và Trải nghiệm số miễn phí — bạn chỉ cần tài khoản để quét mã QR và thu thập dấu ấn di sản.
        </p>
      </div>
    </div>
  </section>
}

export default RegisterPage
