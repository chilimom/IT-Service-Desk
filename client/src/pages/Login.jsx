import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginRequest } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import path from '../ultils/path'
import '../styles/login.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setError('')
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      const user = await loginRequest(form)
      login(user)

      if ((user.role || '').toLowerCase() === 'admin') {
        navigate(`/${path.ADMIN}/${path.ADMIN_DASHBOARD}`, { replace: true })
        return
      }

      navigate(`/${path.USER}/${path.USER_TICKETS}/${path.USER_TICKETS_CREATE}`, { replace: true })
    } catch {
      setError('Sai tên đăng nhập hoặc mật khẩu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <p className="login-card__eyebrow">IT Service Desk</p>
        <h1 className="login-card__title">Đăng nhập hệ thống</h1>
        {/* <p className="login-card__subtitle">
          User tao va theo doi ticket. Admin quan tri va xu ly toan bo ticket.
        </p> */}

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Tên đăng nhập</span>
            <input name="username" value={form.username} onChange={handleChange} />
          </label>

          <label>
            <span>Mật khẩu</span>
            <input type="password" name="password" value={form.password} onChange={handleChange} />
          </label>

          {error && <div className="login-form__error">{error}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Dang dang nhap...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Login
