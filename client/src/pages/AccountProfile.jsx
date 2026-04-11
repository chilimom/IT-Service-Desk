import { useEffect, useMemo, useState } from 'react'
import { HiOutlineOfficeBuilding, HiOutlineUserCircle } from 'react-icons/hi'
import { MdBadge, MdFactory, MdOutlineCalendarMonth } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { buildApiUrl } from '../services/api'
import { getUsers, resetUserPassword } from '../services/userService'
import { normalizeRole, parseAuthorizedFactoryIds } from '../ultils/auth'
import '../styles/account-profile.css'

function formatDate(value) {
  if (!value) return 'Chua co'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chua co'

  return date.toLocaleDateString('vi-VN')
}

function getRoleLabel(role) {
  const normalizedRole = normalizeRole(role)

  if (normalizedRole === 'admin') return 'Quản trị viên'
  if (normalizedRole === 'processor') return 'Nhân viên xử lý'
  if (normalizedRole === 'user') return 'Người dùng'
  return role || 'Chưa cập nhật'
}

function AccountProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(user || null)
  const [factoryNames, setFactoryNames] = useState([])
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)

  useEffect(() => {
    // Lấy thêm thông tin hồ sơ mới nhất từ danh sách user để làm giàu dữ liệu hiển thị.
    let isMounted = true

    async function loadProfile() {
      try {
        const users = await getUsers()
        if (!isMounted || !Array.isArray(users)) return

        const currentProfile = users.find((item) => Number(item.id) === Number(user?.id))
        if (currentProfile) {
          setProfile((previous) => ({ ...previous, ...currentProfile }))
        }
      } catch {
        // Keep using auth context data when profile enrichment is unavailable.
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [user])

  useEffect(() => {
    // Quy đổi danh sách nhà máy được phân quyền từ ID sang tên để hiển thị thân thiện hơn.
    let isMounted = true

    async function loadFactories() {
      try {
        const response = await fetch(buildApiUrl('/api/tickets/factories'))
        if (!response.ok) return

        const data = await response.json()
        if (!isMounted || !Array.isArray(data)) return

        const assignedFactoryIds = new Set(parseAuthorizedFactoryIds(profile || user))
        const names = data
          .filter((factory) => assignedFactoryIds.has(Number(factory.id)))
          .map((factory) => factory.name)

        setFactoryNames(names)
      } catch {
        setFactoryNames([])
      }
    }

    loadFactories()

    return () => {
      isMounted = false
    }
  }, [profile, user])

  const profileFields = useMemo(() => {
    // Gom dữ liệu hồ sơ thành mảng field để render đồng nhất trên UI.
    const currentProfile = profile || user || {}

    return [
      {
        label: 'Họ và tên',
        value: currentProfile.fullName || 'Chua cap nhat',
      },
      {
        label: 'Mã nhân viên',
        value: currentProfile.username || 'Chua cap nhat',
      },
      {
        label: 'Vai trò',
        value: getRoleLabel(currentProfile.role),
      },
      {
        label: 'Bộ phận',
        value: currentProfile.department || 'Chưa cập nhật bộ phận',
      },
      {
        label: 'Ngày tạo tài khoản',
        value: formatDate(currentProfile.createdAt),
      },
      {
        label: 'Nhà máy phụ trách',
        value: factoryNames.length > 0 ? factoryNames.join(', ') : 'Không có nhà máy phụ trách',
      },
    ]
  }, [factoryNames, profile, user])

  const displayName = profile?.fullName || user?.fullName || user?.username || 'Nguoi dung'
  const displayRole = getRoleLabel(profile?.role || user?.role)
  const avatarUrl = profile?.avatarUrl ||user?.avatarUrl

  function handlePasswordChange(event) {
    const { name, value } = event.target
    setPasswordError('')
    setPasswordMessage('')
    setPasswordForm((previous) => ({ ...previous, [name]: value }))
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()

    // Chuẩn hóa dữ liệu trước khi kiểm tra để tránh sai lệch do khoảng trắng.
    const nextPassword = passwordForm.newPassword.trim()
    const confirmPassword = passwordForm.confirmPassword.trim()

    if (!profile?.id && !user?.id) {
      setPasswordError('Khong tim thay tai khoan de cap nhat mat khau.')
      return
    }

    if (!nextPassword) {
      setPasswordError('Vui long nhap mat khau moi.')
      return
    }

    if (nextPassword.length < 4) {
      setPasswordError('Mat khau moi can toi thieu 4 ky tu.')
      return
    }

    if (nextPassword !== confirmPassword) {
      setPasswordError('Xac nhan mat khau khong khop.')
      return
    }

    try {
      // Gọi API cập nhật mật khẩu và reset form nếu thao tác thành công.
      setIsSubmittingPassword(true)
      await resetUserPassword(profile?.id || user?.id, nextPassword)
      setPasswordMessage('Cập nhật mật khẩu thành công.')
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    } catch (error) {
      setPasswordError(error.message || 'Khong the cap nhat mat khau.')
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  return (
    <section className="account-profile-page">
      <div className="account-profile-card">
        <header className="account-profile-card__header">
          
          <h1 className="account-profile-card__title">Thông tin tài khoản</h1>
        </header>

        <div className="account-profile-card__body">
          <aside className="account-profile-card__identity">
            <div className="account-profile-card__avatar-wrap">
              {avatarUrl ? (
                <img 
                  src={buildApiUrl(avatarUrl)}
                  alt="Avatar"
                  className="account-profile-card__avatar"
                />
              ) : (
              <HiOutlineUserCircle size={132}/>
              )}
            </div>
            <div className="account-profile-card__identity-copy">
              <strong>{displayName}</strong>
              <span>{displayRole}</span>
            </div>
          </aside>

          <div className="account-profile-card__details">
            <div className="account-profile-card__field-grid">
              {profileFields.map((field) => (
              <article key={field.label} className="account-profile-card__field">
                <div className="account-profile-card__field-label">{field.label}</div>
                <div className="account-profile-card__field-value">{field.value}</div>
              </article>
              ))}
            </div>

            <div className="account-profile-card__meta-row">
              <div className="account-profile-card__meta-chip">
                <MdBadge size={18} />
                <span>ID: {profile?.id || user?.id || 'N/A'}</span>
              </div>
              <div className="account-profile-card__meta-chip">
                <HiOutlineOfficeBuilding size={18} />
                <span>{profile?.department || 'Chưa cập nhật bộ phận'}</span>
              </div>
              <div className="account-profile-card__meta-chip">
                <MdOutlineCalendarMonth size={18} />
                <span>Tạo ngày {formatDate(profile?.createdAt)}</span>
              </div>
              <div className="account-profile-card__meta-chip">
                <MdFactory size={18} />
                <span>{factoryNames.length > 0 ? `${factoryNames.length} nha may duoc phan quyen` : 'Không có nhà máy phụ trách'}</span>
              </div>
            </div>

            <section className="account-password-card">
              <div className="account-password-card__header">
                <h2>Thay đổi mật khẩu</h2>
                
              </div>

              <form className="account-password-card__form" onSubmit={handlePasswordSubmit}>
                <label className="account-password-card__field">
                  <span>Mật khẩu mới</span>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu mới"
                  />
                </label>

                <label className="account-password-card__field">
                  <span>Xác nhận mật khẩu</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </label>

                {passwordError && <div className="account-password-card__alert">{passwordError}</div>}
                {passwordMessage && <div className="account-password-card__success">{passwordMessage}</div>}

                <button type="submit" className="account-password-card__button" disabled={isSubmittingPassword}>
                  {isSubmittingPassword ? 'Dang cap nhat...' : 'Câp nhật mật khẩu'}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AccountProfile
