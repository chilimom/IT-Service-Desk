import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBell } from 'react-icons/fa'
import { FaMessage } from 'react-icons/fa6'
import { IoIosSunny } from 'react-icons/io'
import avatar from '../../assets/image/account.png'
import { useAuth } from '../../context/AuthContext'
import { canManageTickets } from '../../ultils/auth'
import icons from '../../ultils/icons'
import path from '../../ultils/path'

const { IoMdMenu, FaSortDown } = icons

const Header = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isShowOption, setIsShowOption] = useState(false)
  const displayName = user?.fullName || user?.username || 'User'
  const profilePath = canManageTickets(user) ? `/${path.ADMIN}/${path.ACCOUNT_PROFILE}` : `/${path.USER}/${path.ACCOUNT_PROFILE}`

  const handleOpenProfile = () => {
    navigate(profilePath)
    setIsShowOption(false)
  }

  const handleLogout = () => {
    logout()
    navigate(path.LOGIN)
    setIsShowOption(false)
  }

  return (
    <div className="topbar">
      <button type="button" className="topbar__toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        <IoMdMenu size={24} />
      </button>

      <div className="topbar__actions">
        <div className="topbar__icons">
          <span className="topbar__icon">
            <FaMessage />
          </span>
          <span className="topbar__icon">
            <FaBell />
          </span>
          <span className="topbar__icon">
            <IoIosSunny size={22} />
          </span>
        </div>

        <div className="topbar__profile" onClick={() => setIsShowOption((prev) => !prev)}>
          <img src={avatar} alt="avatar" className="topbar__avatar" />
          <span className="topbar__name">{displayName}</span>
          <FaSortDown />

          {isShowOption && (
            <div className="topbar__menu" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="topbar__menu-item" onClick={handleOpenProfile}>
                Thông tin tài khoản
              </button>
              <button type="button" className="topbar__menu-item topbar__menu-item--danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(Header)
