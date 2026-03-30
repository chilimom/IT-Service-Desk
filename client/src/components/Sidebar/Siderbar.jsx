import { memo, useEffect, useMemo } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import logo from '../../assets/image/Logo.png'
import { useAuth } from '../../context/AuthContext'
import { getSidebarItems } from '../../ultils/contain'
import path from '../../ultils/path'

const Sidebar = ({ isMini, onExpand }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const sidebarItems = useMemo(() => getSidebarItems(user?.role), [user?.role])

  useEffect(() => {
    if (location.pathname === `/${path.USER}` || location.pathname === `/${path.USER}/`) {
      navigate(`/${path.USER}/${path.USER_TICKETS}/${path.USER_TICKETS_DASHBOARD}`, { replace: true })
    }

    if (location.pathname === `/${path.ADMIN}` || location.pathname === `/${path.ADMIN}/`) {
      navigate(`/${path.ADMIN}/${path.ADMIN_DASHBOARD}`, { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <div className="sidebar">
      <div className={clsx('sidebar__brand', isMini && 'sidebar__brand--mini')}>
        <img src={logo} alt="Hoa Phat" className="sidebar__logo" />
      </div>

      <nav className="sidebar__nav">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={() => isMini && onExpand()}
            className={({ isActive }) =>
              clsx(
                'sidebar__link',
                isMini && 'sidebar__link--mini',
                isActive && 'sidebar__link--active'
              )
            }
            title={item.text}
          >
            <span className="sidebar__icon">{item.icon}</span>
            {!isMini && <span className="sidebar__text">{item.text}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default memo(Sidebar)
