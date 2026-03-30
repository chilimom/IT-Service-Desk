import icons from './icons'
import { isAdminRole, isProcessorRole } from './auth'
import path from './path'

const {
  MdOutlineDashboardCustomize,
  MdGroups,
  HiOutlineWrenchScrewdriver,
  FaEye,
  FaUser,
} = icons

export const getSidebarItems = (role) => {
  if (isAdminRole(role)) {
    return [
      {
        id: 0,
        text: 'Dashboard',
        icon: <MdOutlineDashboardCustomize size={24} />,
        path: `/${path.ADMIN}/${path.ADMIN_DASHBOARD}`,
      },
      {
        id: 1,
        text: 'Quan tri Ticket',
        icon: <FaUser size={20} />,
        path: `/${path.ADMIN}/${path.ADMIN_TICKETS}`,
      },
      {
        id: 2,
        text: 'Quan ly User',
        icon: <MdGroups size={22} />,
        path: `/${path.ADMIN}/${path.ADMIN_USERS}`,
      },
    ]
  }

  if (isProcessorRole(role)) {
    return [
      {
        id: 0,
        text: 'Dashboard',
        icon: <MdOutlineDashboardCustomize size={24} />,
        path: `/${path.ADMIN}/${path.ADMIN_DASHBOARD}`,
      },
      {
        id: 1,
        text: 'Xu ly Ticket',
        icon: <FaUser size={20} />,
        path: `/${path.ADMIN}/${path.ADMIN_TICKETS}`,
      },
    ]
  }

  return [
    {
      id: 0,
      text: 'Tong quan ticket',
      icon: <MdOutlineDashboardCustomize size={24} />,
      path: `/${path.USER}/${path.USER_TICKETS}/${path.USER_TICKETS_DASHBOARD}`,
    },
    {
      id: 1,
      text: 'Tao Ticket',
      icon: <HiOutlineWrenchScrewdriver size={22} />,
      path: `/${path.USER}/${path.USER_TICKETS}/${path.USER_TICKETS_CREATE}`,
    },
    {
      id: 2,
      text: 'Yeu cau cua toi',
      icon: <FaEye size={20} />,
      path: `/${path.USER}/${path.USER_TICKETS}/${path.USER_TICKETS_REQUESTS}`,
    },
  ]
}
