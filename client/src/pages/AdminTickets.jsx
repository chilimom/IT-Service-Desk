import { useEffect, useMemo, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { getTickets } from '../services/ticketService'
import path from '../ultils/path'
import { formatTicketCode, getOrderCodeDisplay, getTicketTypeLabel } from '../ultils/ticketMeta'
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
  const [error, setError] = useState('')

  useEffect(() => {
    getTickets().then(setTickets).catch(() => setError('Khong the tai danh sach ticket.'))
  }, [])

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
      .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
  }, [searchTerm, tickets])

  return (
    <section className="requests-page">
      <div className="requests-page__hero">
        <p className="requests-page__eyebrow">Admin</p>
        <h1 className="requests-page__title">Quản Trị Ticket</h1>
        <p className="requests-page__subtitle">
          Admin co the xem toan bo ticket, theo doi trang thai va vao chi tiet de xu ly.
        </p>
      </div>

      {error && <div className="requests-page__alert">{error}</div>}

      <section className="requests-search">
        <label className="requests-search__field">
          <span>Tim kiem ticket</span>
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

      <section className="requests-table">
        <div className="requests-table__head">
          <span>Ma ticket</span>
          <span>Loai / Mo ta</span>
          <span>Thiet bi / Khu vuc</span>
          <span>Doi xu ly</span>
          <span>So order</span>
          <span>Thoi gian</span>
          <span>Trang thai</span>
          <span>Thao tac</span>
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
                <p>{ticket.description || ticket.title || 'Chua co mo ta'}</p>
              </div>
              <div>
                <strong>{ticket.equipmentCode || 'Chua co thiet bi'}</strong>
                <p>{ticket.area || 'Chua co khu vuc'}</p>
              </div>
              <span>{ticket.assignedTeam || 'Chua phan cong'}</span>
              <span>{getOrderCodeDisplay(ticket)}</span>
              <div>
                <strong>Tao: {formatDate(ticket.createdAt)}</strong>
                <p>Han: {formatDate(ticket.dueDate)}</p>
              </div>
              <span className={getStatusClass(ticket.status)}>{ticket.status || 'Unknown'}</span>
              <Link className="requests-row__action" to={`/${path.ADMIN}/${path.ADMIN_TICKETS}/${ticket.id}`}>
                Config
              </Link>
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
