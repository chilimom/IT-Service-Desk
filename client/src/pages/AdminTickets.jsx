import { useEffect, useMemo, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { FiSettings, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { deleteTicket, getTickets } from '../services/ticketService'
import path from '../ultils/path'
import { factoryOptions, formatTicketCode, getFactoryLabel, getOrderCodeDisplay, getTicketTypeLabel } from '../ultils/ticketMeta'
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

function AdminTickets() {
  const [tickets, setTickets] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [factoryFilter, setFactoryFilter] = useState('ALL')
  const [error, setError] = useState('')
  const [deletingTicketId, setDeletingTicketId] = useState(null)

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

    return [...tickets]
      .filter((ticket) => {
        if (!keyword) return true

        const searchableValues = [
          formatTicketCode(ticket),
          ticket.code,
          ticket.type,
          getTicketTypeLabel(ticket),
          ticket.factory,
          getFactoryLabel(ticket.factory),
          ticket.title,
          ticket.description,
          ticket.equipmentCode,
          ticket.area,
          ticket.assignedTeam,
          ticket.orderCode,
          ticket.status,
          String(ticket.id),
        ]

        return searchableValues.some((value) => (value || '').toLowerCase().includes(keyword))
      })
      .filter((ticket) => (factoryFilter === 'ALL' ? true : (ticket.factory || '') === factoryFilter))
      .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
  }, [factoryFilter, searchTerm, tickets])

  const factories = useMemo(() => {
    const knownFactoryValues = new Set(factoryOptions.map((option) => option.code))
    tickets.map((ticket) => ticket.factory).filter(Boolean).forEach((factory) => knownFactoryValues.add(factory))
    return ['ALL', ...knownFactoryValues]
  }, [tickets])

  return (
    <section className="requests-page">
      <div className="requests-page__hero">
        <p className="requests-page__eyebrow">Admin</p>
        <h1 className="requests-page__title">Quản Trị Ticket</h1>
        {/* <p className="requests-page__subtitle">
          Admin co the xem toan bo ticket, theo doi trang thai va vao chi tiet de xu ly.
        </p> */}
      </div>

      {error && <div className="requests-page__alert">{error}</div>}

      <section className="requests-search">
        <label className="requests-search__field">
          <span>Tìm Kiếm Ticket</span>
          <div className="requests-search__input-wrap">
            <span className="requests-search__icon">
              <FaSearch size={14} />
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nhap ma ticket, loai, mo ta, thiet bi, khu vuc, doi xu ly..."
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
                {factory === 'ALL' ? 'Tất cả nhà máy' : getFactoryLabel(factory)}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="requests-table">
        <div className="requests-table__head">
          <span>Mã Ticket</span>
          <span>Loại / Mô tả</span>
          <span>Thiết bị / Khu vực</span>
          <span>Tổ bảo trì</span>
          <span>Số Order</span>
          <span>Thời gian</span>
          <span>Trạng thái</span>
          <span>Thao tác</span>
        </div>

        <div className="requests-table__body">
          {filteredTickets.map((ticket) => (
            <article key={ticket.id} className="requests-row">
              <div>
                <strong>{formatTicketCode(ticket)}</strong>
                <p>ID: {ticket.id}</p>
              </div>
              <div>
                <strong>{getTicketTypeLabel(ticket)}</strong>
                <p>{ticket.description || ticket.title || 'Chưa có mô tả'}</p>
              </div>
              <div>
                <strong>{ticket.equipmentCode || 'Chưa có thiết bị'}</strong>
                <p>{getFactoryLabel(ticket.factory)} / {ticket.area || 'Chưa có khu vực'}</p>
              </div>
              <span>{ticket.assignedTeam || 'Chưa phân công'}</span>
              <span>{getOrderCodeDisplay(ticket)}</span>
              <div>
                <strong>Tạo: {formatDate(ticket.createdAt)}</strong>
                <p>Hạn: {formatDate(ticket.dueDate)}</p>
              </div>
              <span className={getStatusClass(ticket.status)}>{ticket.status || 'Unknown'}</span>
              <div className="requests-row__actions">
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
                <button
                  type="button"
                  className="requests-row__action requests-row__action--danger"
                  title="Xoa"
                  aria-label="Xoa"
                  data-tooltip="Xoa"
                  onClick={() => handleDelete(ticket)}
                  disabled={deletingTicketId === ticket.id}
                >
                  <span className="sr-only">Xóa</span>
                  <span className="requests-row__action-icon">
                    <FiTrash2 size={16} />
                  </span>
                </button>
              </div>
            </article>
          ))}

          {filteredTickets.length === 0 && (
            <div className="requests-empty">Khong tim thay ticket phu hop voi tu khoa tim kiem.</div>
          )}
        </div>
      </section>
    </section>
  )
}

export default AdminTickets
