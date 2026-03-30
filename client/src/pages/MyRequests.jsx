import { useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiEye, FiSearch } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { buildApiUrl } from '../services/api'
import path from '../ultils/path'
import { formatTicketCode, getOrderCodeDisplay } from '../ultils/ticketMeta'
import '../styles/requests.css'

const ITEMS_PER_PAGE = 10

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

function MyRequests() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [maintenanceFilter, setMaintenanceFilter] = useState('ALL')
  const [factoryFilter, setFactoryFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoading(true)
        if (!user?.id) return

        const response = await fetch(buildApiUrl(`/api/tickets/my?userId=${user.id}`))
        if (!response.ok) throw new Error('Failed to fetch tickets')

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
      .filter((ticket) => (statusFilter === 'ALL' ? true : (ticket.status || '').toLowerCase() === statusFilter.toLowerCase()))
      .filter((ticket) => (maintenanceFilter === 'ALL' ? true : getMaintenanceFilterValue(ticket) === maintenanceFilter))
      .filter((ticket) => (factoryFilter === 'ALL' ? true : ticket.factoryName === factoryFilter))
      .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
  }, [factoryFilter, maintenanceFilter, searchTerm, statusFilter, tickets])

  const statuses = useMemo(() => ['ALL', ...new Set(tickets.map((ticket) => ticket.status).filter(Boolean))], [tickets])
  const maintenanceTypes = useMemo(() => ['ALL', ...new Set(tickets.map((ticket) => getMaintenanceFilterValue(ticket)).filter(Boolean))], [tickets])
  const factories = useMemo(() => {
    const factorySet = new Set(['ALL'])
    tickets.forEach((ticket) => {
      if (ticket.factoryName) factorySet.add(ticket.factoryName)
    })
    return Array.from(factorySet)
  }, [tickets])

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / ITEMS_PER_PAGE))
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, filteredTickets])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, maintenanceFilter, factoryFilter])

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  function canEditTicket(ticket) {
    return (ticket?.status || '').toLowerCase() === 'submitted'
  }

  if (loading) {
    return <div className="requests-page__loading">Dang tai du lieu...</div>
  }

  return (
    <section className="requests-page">
      <div className="requests-page__hero">
        <p className="requests-page__eyebrow">Tong hop danh sach</p>
        <h1 className="requests-page__title">Yeu cau cua toi</h1>
      </div>

      {error && <div className="requests-page__alert">{error}</div>}

      <section className="requests-search">
        <label className="requests-search__field">
          <span>Tim kiem Ticket</span>
          <div className="requests-search__input-wrap">
            <span className="requests-search__icon">
              <FiSearch size={16} />
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ma ticket, loai bao tri, nha may, trang thai..."
            />
          </div>
        </label>
      </section>

      <section className="requests-filters">
        <label className="requests-filters__field">
          <span>Loc theo trang thai</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'ALL' ? 'Tat ca trang thai' : status}
              </option>
            ))}
          </select>
        </label>

        <label className="requests-filters__field">
          <span>Loc theo loai bao tri</span>
          <select value={maintenanceFilter} onChange={(event) => setMaintenanceFilter(event.target.value)}>
            {maintenanceTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'ALL' ? 'Tat ca loai bao tri' : type}
              </option>
            ))}
          </select>
        </label>

        <label className="requests-filters__field">
          <span>Loc theo nha may</span>
          <select value={factoryFilter} onChange={(event) => setFactoryFilter(event.target.value)}>
            {factories.map((factory) => (
              <option key={factory} value={factory}>
                {factory === 'ALL' ? 'Tat ca nha may' : factory}
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
          {paginatedTickets.map((ticket) => (
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

      {filteredTickets.length > 0 && (
        <div className="requests-pagination">
          <div className="requests-pagination__summary">
            Hien thi {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)} / {filteredTickets.length} ticket
          </div>
          <div className="requests-pagination__controls">
            <button
              type="button"
              className="requests-pagination__button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Truoc
            </button>
            <span className="requests-pagination__page">Trang {currentPage} / {totalPages}</span>
            <button
              type="button"
              className="requests-pagination__button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default MyRequests
