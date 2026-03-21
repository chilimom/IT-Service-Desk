import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getTicketById, getTicketLogs, updateAdminTicket, updateUserTicket } from '../services/ticketService'
import { formatTicketCode, getMaintenanceCategory, getOrderCodeDisplay, getTicketTypeLabel, isMaintenanceTicket } from '../ultils/ticketMeta'
import '../styles/ticket-details.css'

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

function TicketDetails() {
  const { ticketId } = useParams()
  const { user } = useAuth()
  const isAdmin = (user?.role || '').toLowerCase() === 'admin'
  const [ticket, setTicket] = useState(null)
  const [logs, setLogs] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    equipmentCode: '',
    area: '',
    assignedTeam: '',
    dueDate: '',
    status: '',
    orderCode: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTicketDetails() {
      try {
        setError('')
        const [ticketData, logData] = await Promise.all([getTicketById(ticketId), getTicketLogs(ticketId).catch(() => [])])

        setTicket(ticketData)
        setLogs(Array.isArray(logData) ? logData : [])
        setForm({
          title: ticketData.title || '',
          description: ticketData.description || '',
          equipmentCode: ticketData.equipmentCode || '',
          area: ticketData.area || '',
          assignedTeam: ticketData.assignedTeam || '',
          dueDate: ticketData.dueDate ? ticketData.dueDate.slice(0, 16) : '',
          status: ticketData.status || '',
          orderCode: ticketData.orderCode || '',
        })
      } catch {
        setError('Khong the tai chi tiet ticket.')
      }
    }

    loadTicketDetails()
  }, [ticketId])

  const statusText = useMemo(() => (ticket ? ticket.status || 'Unknown' : ''), [ticket])
  const canUserEdit = useMemo(() => {
    if (isAdmin || !ticket) return false
    const normalizedStatus = (ticket.status || '').toLowerCase()
    return normalizedStatus !== 'inprogress' && normalizedStatus !== 'done'
  }, [isAdmin, ticket])
  const isMaintenance = useMemo(() => isMaintenanceTicket(ticket), [ticket])
  const maintenanceCategory = useMemo(() => getMaintenanceCategory(ticket), [ticket])
  const orderCodeDisplay = useMemo(() => getOrderCodeDisplay(ticket), [ticket])

  const handleChange = (event) => {
    const { name, value } = event.target
    setMessage('')
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()

    try {
      setIsSaving(true)
      setError('')

      if (isAdmin) {
        await updateAdminTicket(ticketId, {
          title: form.title,
          description: form.description,
          equipmentCode: form.equipmentCode,
          area: form.area,
          assignedTeam: form.assignedTeam,
          dueDate: form.dueDate || null,
          status: form.status,
          ...(isMaintenance ? { orderCode: form.orderCode } : {}),
        })
      } else {
        if (!canUserEdit) {
          setError('User khong duoc sua ticket khi trang thai la InProgress hoac Done.')
          return
        }

        await updateUserTicket(ticketId, {
          title: form.title,
          description: form.description,
          equipmentCode: form.equipmentCode,
          area: form.area,
          assignedTeam: form.assignedTeam,
          dueDate: form.dueDate || null,
        })
      }

      const updatedTicket = await getTicketById(ticketId)
      setTicket(updatedTicket)
      setForm({
        title: updatedTicket.title || '',
        description: updatedTicket.description || '',
        equipmentCode: updatedTicket.equipmentCode || '',
        area: updatedTicket.area || '',
        assignedTeam: updatedTicket.assignedTeam || '',
        dueDate: updatedTicket.dueDate ? updatedTicket.dueDate.slice(0, 16) : '',
        status: updatedTicket.status || '',
        orderCode: updatedTicket.orderCode || '',
      })
      setMessage('Cap nhat ticket thanh cong.')
      setIsEditing(false)
    } catch {
      setError('Khong the cap nhat ticket.')
    } finally {
      setIsSaving(false)
    }
  }

  if (error && !ticket) return <div className="ticket-details__alert">{error}</div>
  if (!ticket) return <div className="ticket-details__alert">Dang tai chi tiet ticket...</div>

  return (
    <section className="ticket-details">
      <div className="ticket-details__hero">
        <div>
          <p className="ticket-details__eyebrow">{isAdmin ? 'Admin xu ly ticket' : 'Xem va sua ticket'}</p>
          <h1 className="ticket-details__title">{formatTicketCode(ticket)}</h1>
          <p className="ticket-details__subtitle">
            {isAdmin
              ? 'Admin co the cap nhat trang thai xu ly va so order cho ticket bao tri.'
              : 'User co the xem day du thong tin ticket va sua lai noi dung yeu cau da gui.'}
          </p>
        </div>
        <span className={getStatusClass(statusText)}>{statusText}</span>
      </div>

      {message && <div className="ticket-details__success">{message}</div>}
      {error && <div className="ticket-details__alert">{error}</div>}

      <div className="ticket-details__grid">
        <section className="ticket-details__card">
          <div className="ticket-details__card-header">
            <h2>Thong tin Ticket</h2>
            {(isAdmin || canUserEdit) && (
              <button type="button" className="ticket-details__button" onClick={() => setIsEditing((prev) => !prev)}>
                {isEditing ? 'Dong' : isAdmin ? 'Xu ly Ticket' : 'Sua ticket'}
              </button>
            )}
          </div>

          <div className="ticket-details__summary">
            <div>
              <strong>Loai Ticket</strong>
              <p>{getTicketTypeLabel(ticket)}</p>
            </div>
            <div>
              <strong>Requested By</strong>
              <p>{ticket.requestedBy || 'Chua co'}</p>
            </div>
            <div>
              <strong>Loai bao tri</strong>
              <p>{maintenanceCategory ? `${maintenanceCategory.code} - ${maintenanceCategory.name}` : 'Khong ap dung'}</p>
            </div>
            <div>
              <strong>So order</strong>
              <p>{orderCodeDisplay}</p>
            </div>
            <div>
              <strong>Thoi gian tao</strong>
              <p>{formatDate(ticket.createdAt)}</p>
            </div>
            <div>
              <strong>Thoi gian cap nhat</strong>
              <p>{formatDate(ticket.updatedAt)}</p>
            </div>
          </div>

          {isAdmin && !isEditing && (
            <div className="ticket-details__view-grid">
              <div className="ticket-details__static-field">
                <strong>Tieu de</strong>
                <p>{ticket.title || 'Chua co tieu de'}</p>
              </div>
              <div className="ticket-details__static-field">
                <strong>Trang thai</strong>
                <p>{ticket.status || 'Chua co trang thai'}</p>
              </div>
              <div className="ticket-details__static-field">
                <strong>Ten thiet bi</strong>
                <p>{ticket.equipmentCode || 'Chua co thiet bi'}</p>
              </div>
              <div className="ticket-details__static-field">
                <strong>Equipment</strong>
                <p>{ticket.area || 'Chua co equipment'}</p>
              </div>
              <div className="ticket-details__static-field">
                <strong>Doi xu ly</strong>
                <p>{ticket.assignedTeam || 'Chua phan cong'}</p>
              </div>
              <div className="ticket-details__static-field">
                <strong>Han xu ly</strong>
                <p>{formatDate(ticket.dueDate)}</p>
              </div>
              <div className="ticket-details__static-field ticket-details__static-field--full">
                <strong>Mo ta</strong>
                <p>{ticket.description || 'Chua co mo ta'}</p>
              </div>
              <div className="ticket-details__static-field ticket-details__static-field--full">
                <strong>So order</strong>
                <p>{orderCodeDisplay}</p>
              </div>
            </div>
          )}

          <form className="ticket-details__form" onSubmit={handleSave}>
            {!isAdmin && (
              <>
                <label>
                  <span>Tieu de</span>
                  <input name="title" value={form.title} onChange={handleChange} disabled={!isEditing} />
                </label>

                <label>
                  <span>Mo ta</span>
                  <textarea name="description" rows="6" value={form.description} onChange={handleChange} disabled={!isEditing} />
                </label>

                <label>
                  <span>Ten thiet bi</span>
                  <input name="equipmentCode" value={form.equipmentCode} onChange={handleChange} disabled={!isEditing} />
                </label>

                <label>
                  <span>Equipment</span>
                  <input name="area" value={form.area} onChange={handleChange} disabled={!isEditing} />
                </label>

                <label>
                  <span>Doi xu ly</span>
                  <input name="assignedTeam" value={form.assignedTeam} onChange={handleChange} disabled={!isEditing} />
                </label>

                <label>
                  <span>Han xu ly</span>
                  <input type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange} disabled={!isEditing} />
                </label>
              </>
            )}

            {isAdmin && isEditing && (
              <>
                <label>
                  <span>Tieu de</span>
                  <input name="title" value={form.title} onChange={handleChange} disabled={!isEditing} />
                </label>

                <label>
                  <span>Mo ta</span>
                  <textarea name="description" rows="6" value={form.description} onChange={handleChange} disabled={!isEditing} />
                </label>

                <label>
                  <span>Ten thiet bi</span>
                  <input name="equipmentCode" value={form.equipmentCode} onChange={handleChange} disabled={!isEditing} />
                </label>

                <label>
                  <span>Equipment</span>
                  <input name="area" value={form.area} onChange={handleChange} disabled={!isEditing} />
                </label>

                <label>
                  <span>Doi xu ly</span>
                  <input name="assignedTeam" value={form.assignedTeam} onChange={handleChange} disabled={!isEditing} />
                </label>

                <label>
                  <span>Han xu ly</span>
                  <input type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange} disabled={!isEditing} />
                </label>

                <label>
                  <span>Trang thai</span>
                  <select name="status" value={form.status} onChange={handleChange} disabled={!isEditing}>
                    <option value="Submitted">Submitted</option>
                    <option value="InProgress">InProgress</option>
                    <option value="Done">Done</option>
                  </select>
                </label>

                {isMaintenance ? (
                  <label>
                    <span>So order</span>
                    <input name="orderCode" value={form.orderCode} onChange={handleChange} disabled={!isEditing} />
                  </label>
                ) : (
                  <div className="ticket-details__static-field">
                    <strong>So order</strong>
                    <p>Khong ap dung cho ticket ho tro CNTT.</p>
                  </div>
                )}
              </>
            )}

            {isEditing && (isAdmin || canUserEdit) && (
              <button type="submit" className="ticket-details__button" disabled={isSaving}>
                {isSaving ? 'Dang luu...' : 'Luu thay doi'}
              </button>
            )}
          </form>
        </section>

        <section className="ticket-details__card">
          <div className="ticket-details__card-header">
            <h2>Lich su Ticket</h2>
          </div>

          <div className="ticket-details__logs">
            {logs.map((log) => (
              <article key={log.id} className="ticket-details__log">
                <strong>{log.action}</strong>
                <p>{log.note || 'Khong co ghi chu'}</p>
                <span>{formatDate(log.createdAt)}</span>
              </article>
            ))}

            {logs.length === 0 && <p className="ticket-details__empty">Chua co log nao cho ticket nay.</p>}
          </div>
        </section>
      </div>
    </section>
  )
}

export default TicketDetails
