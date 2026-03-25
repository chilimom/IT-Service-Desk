import { useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiEye } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getTickets } from '../services/ticketService'
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

function MyRequests() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [factoryFilter, setFactoryFilter] = useState('ALL')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTickets() {
      try {
        const data = await getTickets()
        const ownTickets = Array.isArray(data) ? data.filter((ticket) => ticket.requestedBy === user?.id) : []
        setTickets(ownTickets)
      } catch {
        setError('Khong the tai danh sach yeu cau da gui.')
        setTickets([])
      }
    }

    loadTickets()
  }, [user?.id])

  const filteredTickets = useMemo(() => {
    return [...tickets]
      .filter((ticket) => (statusFilter === 'ALL' ? true : ticket.status === statusFilter))
      .filter((ticket) => (typeFilter === 'ALL' ? true : ticket.LoaiTicket === typeFilter))
      .filter((ticket) => (factoryFilter === 'ALL' ? true : (ticket.factoryName || '') === factoryFilter))
      .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
  }, [factoryFilter, statusFilter, tickets, typeFilter])

  const statuses = useMemo(() => ['ALL', ...new Set(tickets.map((ticket) => ticket.status).filter(Boolean))], [tickets])
  const types = useMemo(() => ['ALL', ...new Set(tickets.map((ticket) => ticket.LoaiTicket).filter(Boolean))], [tickets])
  const factories = useMemo(() => {
    const knownFactoryValues = new Set(factoryOptions.map((option) => option.code))
    tickets.map((ticket) => ticket.factoryName).filter(Boolean).forEach((factory) => knownFactoryValues.add(factory))
    return ['ALL', ...knownFactoryValues]
  }, [tickets])

  const canEditTicket = (ticket) => {
    const normalizedStatus = (ticket?.status || '').toLowerCase()
    return normalizedStatus !== 'inprogress' && normalizedStatus !== 'done'
  }

  return (
    <section className="requests-page">
      <div className="requests-page__hero">
        <p className="requests-page__eyebrow">Tổng hợp danh sách</p>
        <h1 className="requests-page__title">Yêu cầu của tôi</h1>
        <p className="requests-page__subtitle">
          Trang này chỉ hiển thị các ticket có `RequestedBy` trùng với user đang đăng nhập.
        </p>
      </div>

      {error && <div className="requests-page__alert">{error}</div>}

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
          <span>Lọc theo loại ticket</span>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            {types.map((type) => (
              <option key={type} value={type}>
                {type === 'ALL' ? 'Tất cả loại ticket' : getTicketTypeLabel({ type })}
              </option>
            ))}
          </select>
        </label>

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
          <span>Đội xử lý</span>
          <span>Số order</span>
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
                <p>{ticket.description || ticket.title || 'Chua co mo ta'}</p>
              </div>
              <div>
                <strong>{ticket.equipmentCode || 'Chua co thiet bi'}</strong>
                <p>{getFactoryLabel(ticket.factory)} / {ticket.area || 'Chua co khu vuc'}</p>
              </div>
              <span>{ticket.assignedTeam || 'Chua phan cong'}</span>
              <span>{getOrderCodeDisplay(ticket)}</span>
              <div>
                <strong>Tao: {formatDate(ticket.createdAt)}</strong>
                <p>Han: {formatDate(ticket.dueDate)}</p>
              </div>
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

          {filteredTickets.length === 0 && <div className="requests-empty">Chua co ticket nao cua ban.</div>}
        </div>
      </section>
    </section>
  )
}

export default MyRequests
