import icons from './icons'
import path from './path'

const {
  MdOutlineDashboardCustomize,
  HiOutlineWrenchScrewdriver,
  FaEye,
  FaUser,
} = icons

export const getSidebarItems = (role) => {
  if ((role || '').toLowerCase() === 'admin') {
    return [
      {
        id: 0,
        text: 'Dashboard',
        icon: <MdOutlineDashboardCustomize size={24} />,
        path: `/${path.ADMIN}/${path.ADMIN_DASHBOARD}`,
      },
      {
        id: 1,
        text: 'Quản trị Ticket',
        icon: <FaUser size={20} />,
        path: `/${path.ADMIN}/${path.ADMIN_TICKETS}`,
      },
    ]
  }

  return [
    {
      id: 0,
      text: 'Tổng quan ticket',
      icon: <MdOutlineDashboardCustomize size={24} />,
      path: `/${path.USER}/${path.USER_TICKETS}/${path.USER_TICKETS_DASHBOARD}`,
    },
    {
      id: 1,
      text: 'Tạo Ticket',
      icon: <HiOutlineWrenchScrewdriver size={22} />,
      path: `/${path.USER}/${path.USER_TICKETS}/${path.USER_TICKETS_CREATE}`,
    },
    {
      id: 2,
      text: 'Yêu cầu của tôi',
      icon: <FaEye size={20} />,
      path: `/${path.USER}/${path.USER_TICKETS}/${path.USER_TICKETS_REQUESTS}`,
    },
  ]
}
