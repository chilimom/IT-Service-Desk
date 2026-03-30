import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginRequest } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { isAdminRole, isProcessorRole } from '../ultils/auth'
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

      if (isAdminRole(user.role) || isProcessorRole(user.role)) {
        navigate(`/${path.ADMIN}/${path.ADMIN_DASHBOARD}`, { replace: true })
        return
      }

      navigate(`/${path.USER}/${path.USER_TICKETS}/${path.USER_TICKETS_DASHBOARD}`, { replace: true })
    } catch (submitError) {
      if (submitError instanceof TypeError) {
        setError('Khong ket noi duoc toi may chu. Vui long kiem tra backend.')
      } else {
        setError(submitError.message || 'Dang nhap that bai.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <p className="login-card__eyebrow">IT Service Desk</p>
        <h1 className="login-card__title">Dang nhap he thong</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Ten dang nhap</span>
            <input name="username" value={form.username} onChange={handleChange} />
          </label>

          <label>
            <span>Mat khau</span>
            <input type="password" name="password" value={form.password} onChange={handleChange} />
          </label>

          {error && <div className="login-form__error">{error}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Dang dang nhap...' : 'Dang nhap'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Login
