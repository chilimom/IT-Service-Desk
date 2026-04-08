import { useEffect, useState } from 'react'
import { FiEye, FiEyeOff, FiLock, FiUser } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { loginRequest } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { isAdminRole, isProcessorRole } from '../ultils/auth'
import path from '../ultils/path'
import '../styles/login.css'

const LOGIN_REMEMBER_KEY = 'itservice_login_remember'

function getStoredLoginForm() {
  try {
    const rawValue = window.localStorage.getItem(LOGIN_REMEMBER_KEY)
    if (!rawValue) return { username: '', password: '', rememberMe: false }

    const storedValue = JSON.parse(rawValue)
    return {
      username: storedValue?.username || '',
      password: storedValue?.password || '',
      rememberMe: Boolean(storedValue?.rememberMe),
    }
  } catch {
    return { username: '', password: '', rememberMe: false }
  }
}

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const storedForm = getStoredLoginForm()
    setForm({ username: storedForm.username, password: storedForm.password })
    setRememberMe(storedForm.rememberMe)
  }, [])

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

      if (rememberMe) {
        window.localStorage.setItem(
          LOGIN_REMEMBER_KEY,
          JSON.stringify({
            username: form.username,
            password: form.password,
            rememberMe: true,
          }),
        )
      } else {
        window.localStorage.removeItem(LOGIN_REMEMBER_KEY)
      }

      login(user)

      if (isAdminRole(user.role) || isProcessorRole(user.role)) {
        navigate(`/${path.ADMIN}/${path.ADMIN_DASHBOARD}`, { replace: true })
        return
      }

      navigate(`/${path.USER}/${path.USER_TICKETS}/${path.USER_TICKETS_DASHBOARD}`, { replace: true })
    } catch (submitError) {
      if (submitError instanceof TypeError) {
        setError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra backend.')
      } else {
        setError(submitError.message || 'Đăng nhập thất bại.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <p className="login-card__eyebrow">IT Service Desk</p>
        <h1 className="login-card__title">Đăng nhập hệ thống</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Mã nhân viên</span>
            <div className="login-form__input-wrap">
              <span className="login-form__input-icon">
                <FiUser size={18} />
              </span>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Mã nhân viên"
                autoComplete="username"
              />
            </div>
          </label>

          <label>
            <span>Mật khẩu</span>
            <div className="login-form__input-wrap">
              <span className="login-form__input-icon">
                <FiLock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete={rememberMe ? 'current-password' : 'off'}
              />
              <button
                type="button"
                className="login-form__password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </label>

          <label className="login-form__remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Nhớ mật khẩu</span>
          </label>

          {error && <div className="login-form__error">{error}</div>}

          <button type="submit" className="login-form__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Login
