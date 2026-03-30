import { useEffect, useMemo, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { FiSettings, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { deleteTicket, getTickets } from '../services/ticketService'
import path from '../ultils/path'
import { formatTicketCode, getOrderCodeDisplay } from '../ultils/ticketMeta'
import { filterTicketsByAccess, isAdminRole } from '../ultils/auth'
import '../styles/requests.css'

function formatDate(value) {
  if (!value) return 'Chua co'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Khong hop le'
  return date.toLocaleString('vi-VN')
}

function getStatusClass(status) {
  const normalized = (status || '').toLowerCase()
  if (normalized === 'submitted') return 'status-pill status-pill--submitted'
  if (normalized === 'inprogress') return 'status-pill status-pill--progress'
  if (normalized === 'done') return 'status-pill status-pill--done'
  return 'status-pill'
}

function getMaintenanceTypeLabel(ticket) {
  if (ticket?.categoryType !== 'Maintenance') return 'Khong ap dung'
  if (ticket?.maintenanceTypeCode && ticket?.maintenanceTypeName) {
    return `${ticket.maintenanceTypeCode} - ${ticket.maintenanceTypeName}`
  }
  return ticket?.maintenanceTypeName || 'Chua co loai bao tri'
}

function getFactoryLabel(ticket) {
  if (ticket?.factoryCode && ticket?.factoryName) {
    return `${ticket.factoryCode} - ${ticket.factoryName}`
  }
  return ticket?.factoryName || 'Chua co nha may'
}

function getEquipmentLabel(ticket) {
  return ticket?.area || 'Chua co'
}

function getAreaLabel(ticket) {
  return ticket?.equipmentCode || 'Chua co'
}

function getMaintenanceFilterValue(ticket) {
  return getMaintenanceTypeLabel(ticket)
}

function AdminTickets() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [factoryFilter, setFactoryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [maintenanceFilter, setMaintenanceFilter] = useState('ALL')
  const [error, setError] = useState('')
  const [deletingTicketId, setDeletingTicketId] = useState(null)
  const canDeleteTicket = isAdminRole(user?.role)

  useEffect(() => {
    getTickets().then(setTickets).catch(() => setError('Khong the tai danh sach ticket.'))
  }, [])

  async function handleDelete(ticket) {
    const ticketCode = formatTicketCode(ticket)
    const confirmed = window.confirm(`Ban co chac muon xoa ticket ${ticketCode} khong?`)
    if (!confirmed) return

    setDeletingTicketId(ticket.id)
    setError('')

    try {
      await deleteTicket(ticket.id)
      setTickets((currentTickets) => currentTickets.filter((item) => item.id !== ticket.id))
    } catch {
      setError('Khong the xoa ticket. Vui long thu lai.')
    } finally {
      setDeletingTicketId(null)
    }
  }

  const filteredTickets = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()

    return [...filterTicketsByAccess(tickets, user)]
      .filter((ticket) => {
        if (!keyword) return true

        const searchableValues = [
          formatTicketCode(ticket),
          ticket.code,
          ticket.id,
          ticket.title,
          ticket.description,
          ticket.categoryName,
          ticket.categoryType,
          ticket.maintenanceTypeCode,
          ticket.maintenanceTypeName,
          ticket.factoryName,
          ticket.factoryCode,
          ticket.status,
        ]

        return searchableValues.some((value) => String(value || '').toLowerCase().includes(keyword))
      })
      .filter((ticket) => (factoryFilter === 'ALL' ? true : (ticket.factoryName || '') === factoryFilter))
      .filter((ticket) => (statusFilter === 'ALL' ? true : (ticket.status || '').toLowerCase() === statusFilter.toLowerCase()))
      .filter((ticket) => (maintenanceFilter === 'ALL' ? true : getMaintenanceFilterValue(ticket) === maintenanceFilter))
      .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
  }, [factoryFilter, maintenanceFilter, searchTerm, statusFilter, tickets, user])

  const visibleTickets = useMemo(() => filterTicketsByAccess(tickets, user), [tickets, user])
  const factories = useMemo(() => ['ALL', ...new Set(visibleTickets.map((ticket) => ticket.factoryName).filter(Boolean))], [visibleTickets])
  const statuses = useMemo(() => ['ALL', ...new Set(visibleTickets.map((ticket) => ticket.status).filter(Boolean))], [visibleTickets])

  const maintenanceTypes = useMemo(() => {
    return ['ALL', ...new Set(visibleTickets.map((ticket) => getMaintenanceFilterValue(ticket)).filter(Boolean))]
  }, [visibleTickets])

  return (
    <section className="requests-page">
      <div className="requests-page__hero">
        <p className="requests-page__eyebrow">Admin</p>
        <h1 className="requests-page__title">Quản trị  Ticket</h1>
      </div>

      {error && <div className="requests-page__alert">{error}</div>}

      <section className="requests-search">
        <label className="requests-search__field">
          <span>Tìm kiếm Ticket</span>
          <div className="requests-search__input-wrap">
            <span className="requests-search__icon">
              <FaSearch size={14} />
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nhập mã Ticket, Loại bảo trì, Nhà máy, Trạng thái..."
            />
          </div>
        </label>
      </section>

      <section className="requests-filters">
        <label className="requests-filters__field">
          <span>Lọc theo nhà máy</span>
          <select value={factoryFilter} onChange={(event) => setFactoryFilter(event.target.value)}>
            {factories.map((factory) => (
              <option key={factory} value={factory}>
                {factory === 'ALL' ? 'Tất cả nhà máy' : factory}
              </option>
            ))}
          </select>
        </label>

        <label className="requests-filters__field">
          <span>Lọc theo trạng thái</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'ALL' ? 'Tất cả trạng thái' : status}
              </option>
            ))}
          </select>
        </label>

        <label className="requests-filters__field">
          <span>Lọc theo loại bảo trì</span>
          <select value={maintenanceFilter} onChange={(event) => setMaintenanceFilter(event.target.value)}>
            {maintenanceTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'ALL' ? 'Tat ca loai bao tri' : type}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="requests-table">
        <div className="requests-table__head">
          <span>Ma ticket</span>
          <span>Equipment</span>
          <span>Khu vuc</span>
          <span>Loai bao tri</span>
          <span>So order</span>
          <span>Nha may</span>
          <span>Ngay xu ly</span>
          <span>Trang thai</span>
          <span>Thao tac</span>
        </div>

        <div className="requests-table__body">
          {filteredTickets.map((ticket) => (
            <article key={ticket.id} className="requests-row">
              <div>
                <strong>{formatTicketCode(ticket)}</strong>
                <p>{ticket.title || 'Chua co tieu de'}</p>
              </div>
              <span>{getEquipmentLabel(ticket)}</span>
              <span>{getAreaLabel(ticket)}</span>
              <span>{getMaintenanceTypeLabel(ticket)}</span>
              <span>{getOrderCodeDisplay(ticket)}</span>
              <span>{getFactoryLabel(ticket)}</span>
              <span>{formatDate(ticket.dueDate)}</span>
              <span className={getStatusClass(ticket.status)}>{ticket.status || 'Unknown'}</span>
              <div className="requests-row__actions requests-row__actions--end">
                <Link
                  className="requests-row__action"
                  to={`/${path.ADMIN}/${path.ADMIN_TICKETS}/${ticket.id}`}
                  title="Config"
                  aria-label="Config"
                  data-tooltip="Config"
                >
                  <span className="sr-only">Config</span>
                  <span className="requests-row__action-icon">
                    <FiSettings size={16} />
                  </span>
                </Link>
                {canDeleteTicket && (
                  <button
                    type="button"
                    className="requests-row__action requests-row__action--danger"
                    title="Xoa"
                    aria-label="Xoa"
                    data-tooltip="Xoa"
                    onClick={() => handleDelete(ticket)}
                    disabled={deletingTicketId === ticket.id}
                  >
                    <span className="sr-only">Xoa</span>
                    <span className="requests-row__action-icon">
                      <FiTrash2 size={16} />
                    </span>
                  </button>
                )}
              </div>
            </article>
          ))}

          {filteredTickets.length === 0 && (
            <div className="requests-empty">Khong tim thay ticket phu hop voi bo loc hoac tu khoa tim kiem.</div>
          )}
        </div>
      </section>
    </section>
  )
}

export default AdminTickets
