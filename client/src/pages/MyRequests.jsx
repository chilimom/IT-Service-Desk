import { useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiEye, FiSearch } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import path from '../ultils/path'
import { formatTicketCode } from '../ultils/ticketMeta'
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

function getTicketTypeLabelForTable(ticket) {
  if (ticket?.categoryType === 'Maintenance') return 'Lenh bao tri'
  if (ticket?.categoryType === 'Support') return 'Ho tro CNTT'
  return 'Chua xac dinh'
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

function MyRequests() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [factoryFilter, setFactoryFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoading(true)
        if (!user?.id) return

        const response = await fetch(`http://localhost:5017/api/tickets/my?userId=${user.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch tickets')
        }

        const data = await response.json()
        setTickets(Array.isArray(data) ? data : [])
      } catch {
        setError('Khong the tai danh sach yeu cau da gui.')
        setTickets([])
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [user?.id])

  const filteredTickets = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()

    return [...tickets]
      .filter((ticket) => {
        if (!keyword) return true

        const searchableValues = [
          ticket.code,
          ticket.id,
          ticket.title,
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
      .filter((ticket) => {
        if (statusFilter === 'ALL') return true
        return (ticket.status || '').toLowerCase() === statusFilter.toLowerCase()
      })
      .filter((ticket) => {
        if (typeFilter === 'ALL') return true
        const ticketType = ticket.categoryType === 'Maintenance' ? 'Maintenance' : 'IT'
        return ticketType === typeFilter
      })
      .filter((ticket) => {
        if (factoryFilter === 'ALL') return true
        return ticket.factoryName === factoryFilter
      })
      .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
  }, [factoryFilter, searchTerm, statusFilter, tickets, typeFilter])

  const statuses = useMemo(() => ['ALL', ...new Set(tickets.map((ticket) => ticket.status).filter(Boolean))], [tickets])

  const types = useMemo(() => {
    const typeList = ['ALL']
    const hasMaintenance = tickets.some((ticket) => ticket.categoryType === 'Maintenance')
    const hasIT = tickets.some((ticket) => ticket.categoryType === 'Support')

    if (hasMaintenance) typeList.push('Maintenance')
    if (hasIT) typeList.push('IT')

    return typeList
  }, [tickets])

  const factories = useMemo(() => {
    const factorySet = new Set(['ALL'])
    tickets.forEach((ticket) => {
      if (ticket.factoryName) factorySet.add(ticket.factoryName)
    })
    return Array.from(factorySet)
  }, [tickets])

  function canEditTicket(ticket) {
    return (ticket?.status || '').toLowerCase() === 'submitted'
  }

  if (loading) {
    return <div className="requests-page__loading">Dang tai du lieu...</div>
  }

  return (
    <section className="requests-page">
      <div className="requests-page__hero">
        <p className="requests-page__eyebrow">Tổng hợp danh sách</p>
        <h1 className="requests-page__title">Yêu cầu của tôi</h1>
        {/* <p className="requests-page__subtitle">Trang nay hien thi cac ticket ban da tao.</p> */}
      </div>

      {error && <div className="requests-page__alert">{error}</div>}

      <section className="requests-search">
        <label className="requests-search__field">
          <span>Tìm kiếm Ticket</span>
          <div className="requests-search__input-wrap">
            <span className="requests-search__icon">
              <FiSearch size={16} />
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Mã Ticket, Loại bảo trì, Nhà máy, Trạng thái..."
            />
          </div>
        </label>
      </section>

      <section className="requests-filters">
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
          <span>Lọc theo loại Ticket</span>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            {types.map((type) => (
              <option key={type} value={type}>
                {type === 'ALL' ? 'Tất cả loại Ticket' : type === 'Maintenance' ? 'Lenh bao tri' : 'Ho tro CNTT'}
              </option>
            ))}
          </select>
        </label>

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
      </section>

      <section className="requests-table">
        <div className="requests-table__head">
          <span>Ma ticket</span>
          <span>Loai ticket</span>
          <span>Loai bao tri</span>
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
              <span>{getTicketTypeLabelForTable(ticket)}</span>
              <span>{getMaintenanceTypeLabel(ticket)}</span>
              <span>{getFactoryLabel(ticket)}</span>
              <span>{formatDate(ticket.dueDate)}</span>
              <span className={getStatusClass(ticket.status)}>{ticket.status || 'Unknown'}</span>
              <Link
                className="requests-row__action"
                to={`/${path.USER}/${path.USER_TICKETS}/requests/${ticket.id}`}
                title={canEditTicket(ticket) ? 'Sua' : 'Xem'}
                aria-label={canEditTicket(ticket) ? 'Sua' : 'Xem'}
                data-tooltip={canEditTicket(ticket) ? 'Sua' : 'Xem'}
              >
                <span className="sr-only">{canEditTicket(ticket) ? 'Sua' : 'Xem'}</span>
                <span className="requests-row__action-icon">
                  {canEditTicket(ticket) ? <FiEdit2 size={16} /> : <FiEye size={16} />}
                </span>
              </Link>
            </article>
          ))}

          {filteredTickets.length === 0 && !loading && (
            <div className="requests-empty">
              {error ? error : 'Khong tim thay ticket phu hop voi bo loc hoac tu khoa tim kiem.'}
            </div>
          )}
        </div>
      </section>
    </section>
  )
}

export default MyRequests
