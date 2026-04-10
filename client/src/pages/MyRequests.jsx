import { useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiEye, FiSearch } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { buildApiUrl } from '../services/api'
import path from '../ultils/path'
import { formatTicketCode, getMaintenanceTypeDisplay, getOrderCodeDisplay, getStatusDisplayLabel } from '../ultils/ticketMeta'
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
  return getMaintenanceTypeDisplay(ticket)
}

function getFactoryLabel(ticket) {
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

function getTicketTypeLabel(ticket) {
  if (ticket?.categoryType) return ticket.categoryType
  if (ticket?.maintenanceTypeCode || ticket?.maintenanceTypeName) return 'Maintenance'
  return 'Support'
}

function MyRequests() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [maintenanceFilter, setMaintenanceFilter] = useState('ALL')
  const [ticketTypeFilter, setTicketTypeFilter] = useState('ALL')
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
      .filter((ticket) => (ticketTypeFilter === 'ALL' ? true : getTicketTypeLabel(ticket) === ticketTypeFilter))
      .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
  }, [maintenanceFilter, searchTerm, statusFilter, ticketTypeFilter, tickets])

  const statuses = useMemo(() => ['ALL', ...new Set(tickets.map((ticket) => ticket.status).filter(Boolean))], [tickets])
  const maintenanceTypes = useMemo(() => ['ALL', ...new Set(tickets.map((ticket) => getMaintenanceFilterValue(ticket)).filter(Boolean))], [tickets])
  const ticketTypes = useMemo(() => {
    const ticketTypeSet = new Set(['ALL'])
    tickets.forEach((ticket) => {
      ticketTypeSet.add(getTicketTypeLabel(ticket))
    })
    return Array.from(ticketTypeSet)
  }, [tickets])

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / ITEMS_PER_PAGE))
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, filteredTickets])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, maintenanceFilter, ticketTypeFilter])

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
        <p className="requests-page__eyebrow">Tổng hợp danh sách</p>
        <h1 className="requests-page__title">Yêu cầu của tôi</h1>
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
              placeholder="Mã ticket, loại bảo trì, nhà máy, trạng thái..."
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
                {status === 'ALL' ? 'Tất cả trạng thái' : getStatusDisplayLabel(status)}
              </option>
            ))}
          </select>
        </label>

        <label className="requests-filters__field">
          <span>Lọc theo loại bảo trì</span>
          <select value={maintenanceFilter} onChange={(event) => setMaintenanceFilter(event.target.value)}>
            {maintenanceTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'ALL' ? 'Tất cả loại bảo trì' : type}
              </option>
            ))}
          </select>
        </label>

        <label className="requests-filters__field">
          <span>Lọc theo loại Ticket</span>
          <select value={ticketTypeFilter} onChange={(event) => setTicketTypeFilter(event.target.value)}>
            {ticketTypes.map((ticketType) => (
              <option key={ticketType} value={ticketType}>
                {ticketType === 'ALL' ? 'Tất cả loại ticket' : ticketType}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="requests-table">
        <div className="requests-table__head">
          <span>Mã ticket</span>
          <span>Equipment</span>
          <span>Khu vực</span>
          <span>Loại bảo trì</span>
          <span>Số order</span>
          <span>Nhà máy</span>
          <span>Ngày xử lý</span>
          <span>Trạng thái</span>
          <span>Thao tác</span>
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
              <span className={getStatusClass(ticket.status)}>{getStatusDisplayLabel(ticket.status)}</span>
              <Link
                className="requests-row__action"
                to={`/${path.USER}/${path.USER_TICKETS}/requests/${ticket.id}`}
                title={canEditTicket(ticket) ? 'Sửa' : 'Xem'}
                aria-label={canEditTicket(ticket) ? 'Sửa' : 'Xem'}
                data-tooltip={canEditTicket(ticket) ? 'Sửa' : 'Xem'}
              >
                <span className="sr-only">{canEditTicket(ticket) ? 'Sửa' : 'Xem'}</span>
                <span className="requests-row__action-icon">
                  {canEditTicket(ticket) ? <FiEdit2 size={16} /> : <FiEye size={16} />}
                </span>
              </Link>
            </article>
          ))}

          {filteredTickets.length === 0 && !loading && (
            <div className="requests-empty">
              {error ? error : 'Không tìm thấy ticket phù hợp với bộ lọc hoặc từ khóa tìm kiếm.'}
            </div>
          )}
        </div>
      </section>

      {filteredTickets.length > 0 && (
        <div className="requests-pagination">
          <div className="requests-pagination__summary">
            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)} / {filteredTickets.length} ticket
          </div>
          <div className="requests-pagination__controls">
            <button
              type="button"
              className="requests-pagination__button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Trước
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
