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
  return <section className="screen register" id="regiter">
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
          {signup && <input aria-label="Họ và tên" type="text" placeholder="Họ và tên" autoComplete="name" required />}
          <input aria-label="Email" type="email" placeholder="Email" autoComplete="email" required />
          <input aria-label="Mật khẩu" type="password" placeholder="Mật khẩu" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} required />
          <button className="register__submit" type="submit">{signup ? 'Đăng ký' : 'Đăng nhập'}</button>
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
