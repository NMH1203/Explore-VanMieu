import { useEffect, useState } from 'react'

function AccountPage() {
  // Trạng thái phiên đăng nhập và dữ liệu người dùng
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formMode, setFormMode] = useState('login') // 'login' | 'register'
  
  // Trạng thái các ô dữ liệu nhập Form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  
  // Trạng thái số liệu thống kê thực tế lấy từ database Backend
  const [stats, setStats] = useState({ stamps: 0, visits: 0, rewards: 0 })

  // 1. TỰ ĐỘNG ĐỒNG BỘ SESSION KHI TẢI TRANG
  useEffect(() => {
    fetch('/api/auth/session') //
      .then((res) => res.json())
      .then((resData) => {
        if (resData.data && resData.data.user) {
          const currentUser = resData.data.user
          setUser(currentUser) //
          
          // Nếu tài khoản hợp lệ, tiến hành gọi API lấy số liệu thống kê thật từ database
          fetch('/api/passport') //
            .then((pRes) => pRes.json())
            .then((pData) => {
              if (pData.data) {
                setStats({
                  stamps: pData.data.stamps ? pData.data.stamps.filter(s => s.collected).length : 0,
                  visits: pData.data.totalVisits || 0,
                  rewards: pData.data.collected || 0
                })
              }
            })
            .catch((e) => console.error('Lỗi tải dữ liệu thống kê:', e))
        } else {
          setUser(null)
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  // 2. XỬ LÝ GỬI FORM ĐĂNG NHẬP / ĐĂNG KÝ VỚI BACKEND
  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (password.length < 10 || password.length > 128) {
      setErrorMsg('Mật khẩu bắt buộc phải từ 10 đến 128 ký tự.') //
      return
    }

    const url = formMode === 'login' ? '/api/auth/login' : '/api/auth/register' //
    const bodyData = formMode === 'login' ? { email, password } : { email, password, name }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })

      const responseText = await response.text()
      let result = responseText ? JSON.parse(responseText) : {}

      if (!response.ok) {
        throw new Error(result.error?.message || 'Thông tin xác thực không chính xác.')
      }

      // Xác thực thành công, ghi nhận user và ép tải lại luồng dữ liệu mới
      setUser(result.data?.user || result.user)
      window.location.href = '/Explore/Tai-Khoan'
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  // 3. XỬ LÝ ĐĂNG XUẤT AN TOÀN TUÂN THỦ BẢO MẬT CSRF
  const handleLogout = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session')
      const sessionData = await sessionRes.json()
      const csrfToken = sessionData.data?.csrfToken || ''

      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Csrf-Token': csrfToken // Gửi token chống tấn công CSRF để Backend phê duyệt xóa cookie
        }
      })

      setUser(null)
      window.location.href = '/Explore/Tai-Khoan' // Trình duyệt tải lại trang ở trạng thái Form sạch
    } catch (err) {
      console.error('Lỗi hệ thống khi đăng xuất:', err)
      setUser(null)
      window.location.href = '/Explore/Tai-Khoan'
    }
  }

  if (loading) {
    return <section className="screen" id="account"><div className="container" style={{ textAlign: 'center', padding: '50px' }}><p>Đang kết nối cơ sở dữ liệu...</p></div></section>
  }

  // ==========================================
  // TRẠNG THÁI 1: CHƯA ĐĂNG NHẬP - HIỂN THỊ FORM TRẮNG (GIỐNG ẢNH VÍ DỤ 2)
  // ==========================================
  if (!user) {
    return (
      <section className="screen" id="account" style={{ background: '#f4f6f9', minHeight: '100vh', padding: '40px 20px' }}>
        <div style={{ maxWidth: '450px', margin: '0 auto', background: '#fff', padding: '40px 30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          <h1 style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: '700', marginBottom: '25px', textAlign: 'center' }}>
            {formMode === 'login' ? 'Đăng nhập' : 'Đăng ký thành viên'}
          </h1>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {errorMsg && <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', background: '#fee2e2', padding: '10px', borderRadius: '6px' }}>{errorMsg}</div>}

            {formMode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Họ và tên</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem' }} placeholder="Nguyễn Văn An" />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem' }} placeholder="name@example.com" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Mật khẩu (10–128 ký tự)</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem' }} placeholder="••••••••••••" />
            </div>

            <button type="submit" style={{ width: '100%', padding: '14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '6px', fontSize: '1rem', cursor: 'pointer', marginTop: '10px', transition: 'background 0.2s' }}>
              {formMode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản mới'}
            </button>
          </form>

          <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.85rem' }}>
            {formMode === 'login' ? (
              <span style={{ cursor: 'pointer', color: '#a07823', fontWeight: '500' }} onClick={() => setFormMode('register')}>Chưa có tài khoản? Đăng ký ngay</span>
            ) : (
              <span style={{ cursor: 'pointer', color: '#a07823', fontWeight: '500' }} onClick={() => setFormMode('login')}>Đã có tài khoản? Quay lại Đăng nhập</span>
            )}
          </div>

        </div>
      </section>
    )
  }

  // ==========================================
  // TRẠNG THÁI 2: ĐÃ ĐĂNG NHẬP - HIỂN THỊ THÔNG TIN USER VÀ THỐNG KÊ (GIỐNG ẢNH VÍ DỤ 1)
  // ==========================================
  const isAdmin = user.role === 'admin' //

  return (
    <section className="screen" id="account">
      {/* VÙNG HEADER TÀI KHOẢN (NAVY BANNER) */}
      <header className="topbar" style={{ background: '#0a2240', padding: '30px 20px', color: '#fff' }}>
        <div className="inner" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="eyebrow" style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', opacity: 0.8 }}>EXPLORE VAN MIEU</div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '700', margin: '5px 0 10px 0' }}>Tài khoản</h1>
          <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8 }}>Quản lý thông tin và lịch sử tham quan.</p>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* KHỐI THÔNG TIN ĐỊNH DANH USER PROFILE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', background: '#0a2240', color: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {isAdmin ? '👑' : user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: '0 0 5px 0', color: '#0f172a' }}>{user.name || 'Người dùng'}</h2>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>
              {user.email} · <span style={{ fontWeight: '500', color: isAdmin ? '#4a148c' : '#a07823' }}>{isAdmin ? 'Quản trị viên' : 'Khách tham quan'}</span>
            </p>
          </div>
        </div>

        {/* CỤM NÚT ĐIỀU HƯỚNG NHANH */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
          <a className="btn btn-primary" href="/Explore/Ho-Chieu" style={{ minWidth: '110px', textAlign: 'center', padding: '10px' }}>Hộ chiếu</a>
          <a className="btn btn-outline" href="/Explore/Ban-Do" style={{ minWidth: '110px', textAlign: 'center', padding: '10px' }}>Bản đồ</a>
          
          {/* NÚT KÍCH HOẠT ĐĂNG XUẤT */}
          <button 
            className="btn btn-outline" 
            onClick={handleLogout} 
            style={{ minWidth: '110px', cursor: 'pointer', padding: '10px' }}
          >
            Đăng xuất
          </button>
        </div>

                {/* HÀNG HỘP THỐNG KÊ LỚN TRỰC QUAN (GIỐNG VÍ DỤ ẢNH 1) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
          
          <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <strong style={{ display: 'block', fontSize: '2.5rem', color: '#0f172a', fontWeight: '700', marginBottom: '5px' }}>
              {isAdmin ? '—' : stats.stamps}
            </strong>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Con dấu</span>
          </div>

          <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <strong style={{ display: 'block', fontSize: '2.5rem', color: '#0f172a', fontWeight: '700', marginBottom: '5px' }}>
              {isAdmin ? '—' : stats.visits}
            </strong>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Lượt tham quan</span>
          </div>

          <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <strong style={{ display: 'block', fontSize: '2.5rem', color: '#0f172a', fontWeight: '700', marginBottom: '5px' }}>
              {isAdmin ? '—' : stats.rewards}
            </strong>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Phần thưởng đã nhận</span>
          </div>

        </div>

        {/* PHÂN HỆ LINK ĐẶC QUYỀN TRANG QUẢN TRỊ NẾU LÀ ADMIN */}
        {isAdmin && (
          <section className="panel section" style={{ border: '2px dashed #ffd700', padding: '20px', borderRadius: '12px', background: '#fff', marginBottom: '30px' }}>
            <h2 style={{ color: '#0a2240', marginBottom: '10px' }}>⚙️ Quyền hạn Quản trị viên</h2>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '15px' }}>Bạn có quyền thay đổi dữ liệu cấu hình, tọa độ GPS di tích, quản lý hồ sơ hiện vật cổ vật và cấp phát quà tặng vật lý.</p>
            <a className="btn btn-primary" href="/Explore#admin" style={{ display: 'inline-block', padding: '12px 25px' }}>Mở Trang Quản Trị Hệ Thống (#admin)</a>
          </section>
        )}

      </div>
    </section>
  )
}

export default AccountPage
