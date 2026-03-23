import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiAlertCircle, FiCheckCircle, FiEdit2, FiInfo, FiSave, FiSettings, FiX } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { getTicketById, updateAdminTicket, updateUserTicket } from '../services/ticketService'
import { getUsers } from '../services/userService'
import { factoryOptions, getFactoryLabel, getMaintenanceCategory, getOrderCodeDisplay, maintenanceOptions } from '../ultils/ticketMeta'
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

function getStatusMeta(status) {
  const normalized = (status || '').toLowerCase()

  if (normalized === 'submitted') {
    return {
      className: 'ticket-details__status-banner ticket-details__status-banner--submitted',
      icon: FiInfo,
      title: 'Ticket da gui va chua duoc tiep nhan',
      description: 'Ban co the sua noi dung ticket trong giai doan nay truoc khi bo phan xu ly bat dau tiep nhan.',
    }
  }

  if (normalized === 'inprogress') {
    return {
      className: 'ticket-details__status-banner ticket-details__status-banner--progress',
      icon: FiAlertCircle,
      title: 'Ticket dang duoc tiep nhan va xu ly',
      description: 'Ticket da vao quy trinh xu ly, noi dung yeu cau tam thoi khong con cho phep sua.',
    }
  }

  if (normalized === 'done') {
    return {
      className: 'ticket-details__status-banner ticket-details__status-banner--done',
      icon: FiCheckCircle,
      title: 'Ticket da hoan tat',
      description: 'Thong tin ticket duoc luu lai de theo doi, hien tai khong the sua noi dung.',
    }
  }

  return {
    className: 'ticket-details__status-banner',
    icon: FiInfo,
    title: 'Trang thai ticket',
    description: 'Trang thai hien tai cua ticket dang duoc cap nhat.',
  }
}

function TicketDetails() {
  const { ticketId } = useParams()
  const { user } = useAuth()
  const isAdmin = (user?.role || '').toLowerCase() === 'admin'
  const [ticket, setTicket] = useState(null)
  const [form, setForm] = useState({
    // type: 'Maintenance',
    factory: '',
    maintenanceCategory: 'PM01',
    title: '',
    description: '',
    equipmentCode: '',
    area: '',
    assignedTo: '',
    assignedTeam: '',
    dueDate: '',
    status: '',
    orderCode: '',
     categoryId: '',   // 👈 THÊM DÒNG NÀY
  })
  const [users, setUsers] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTicketDetails() {
      try {
        setError('')
        const ticketData = await getTicketById(ticketId)

        setTicket(ticketData)
        const ticketMaintenanceCategory = getMaintenanceCategory(ticketData)
        setForm({
          // type: isMaintenanceTicket(ticketData) ? 'Maintenance' : 'IT',
  //         type: ticketData.categoryName?.includes('Bảo trì')
  // ? 'Maintenance'
  // : 'IT',
          
          factory: ticketData.factory || '',
          maintenanceCategory: ticketMaintenanceCategory?.code || 'PM01',
          title: ticketData.title || '',
          description: ticketData.description || '',
          equipmentCode: ticketData.equipmentCode || '',
          area: ticketData.area || '',
          assignedTo: ticketData.assignedTo ? String(ticketData.assignedTo) : '',
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

  useEffect(() => {
    if (!isAdmin) return

    getUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
  }, [isAdmin])

  const statusText = useMemo(() => (ticket ? ticket.status || 'Unknown' : ''), [ticket])
  const canUserEdit = useMemo(() => {
    if (isAdmin || !ticket) return false
    const normalizedStatus = (ticket.status || '').toLowerCase()
    return normalizedStatus === 'submitted'
  }, [isAdmin, ticket])
  // const isMaintenance = useMemo(() => isMaintenanceTicket(ticket), [ticket])
 // ✅ MỚI (ví dụ: 1 = Maintenance)
const isMaintenance = useMemo(() => {
  return ticket?.categoryId === 1   // 👈 đổi ID đúng DB của bạn
}, [ticket])
  const maintenanceCategory = useMemo(() => getMaintenanceCategory(ticket), [ticket])
  const orderCodeDisplay = useMemo(() => getOrderCodeDisplay(ticket), [ticket])
  const maintenanceHeadline = maintenanceCategory ? `${maintenanceCategory.code} - ${maintenanceCategory.name}` : 'Khong ap dung'
  const statusMeta = useMemo(() => getStatusMeta(statusText), [statusText])
  const showEditButton = isAdmin || canUserEdit
  const StatusIcon = statusMeta.icon
  const isEditingMaintenance = form.type === 'Maintenance'
  const actionLabel = isEditing ? 'Dong' : isAdmin ? 'Xu ly Ticket' : 'Sua ticket'
  const ActionIcon = isEditing ? FiX : isAdmin ? FiSettings : FiEdit2
  const requesterDisplay = useMemo(() => {
    const requesterId = ticket?.requestedBy
    const requesterName = ticket?.requestedByName || ticket?.requestedByUsername || ticket?.createdByName || ticket?.createdByUsername

    if (requesterId && requesterName) return `${requesterId} - ${requesterName}`
    if (requesterId) return String(requesterId)
    if (requesterName) return requesterName
    return 'Chua co'
  }, [ticket])
  const assigneeDisplay = useMemo(() => {
    const assigneeId = ticket?.assignedTo
    const assigneeName = ticket?.assignedToName || ticket?.assignedToUsername

    if (assigneeId && assigneeName) return `${assigneeId} - ${assigneeName}`
    if (assigneeId) return String(assigneeId)
    if (assigneeName) return assigneeName
    return 'Chua co nguoi tiep nhan'
  }, [ticket])

  const handleChange = (event) => {
    const { name, value } = event.target
    setMessage('')
    setForm((prev) => {
      if (name === 'type') {
        const nextIsMaintenance = value === 'Maintenance'
        const selectedMaintenance = maintenanceOptions.find((item) => item.code === prev.maintenanceCategory) ?? maintenanceOptions[0]

        return {
          ...prev,
          type: value,
          title: nextIsMaintenance ? `${selectedMaintenance.code} - ${selectedMaintenance.name}` : '',
          maintenanceCategory: nextIsMaintenance ? prev.maintenanceCategory || 'PM01' : '',
          area: nextIsMaintenance ? prev.area : '',
          equipmentCode: nextIsMaintenance ? prev.equipmentCode : '',
        }
      }

      if (name === 'maintenanceCategory') {
        const selectedMaintenance = maintenanceOptions.find((item) => item.code === value) ?? maintenanceOptions[0]

        return {
          ...prev,
          maintenanceCategory: value,
          title: `${selectedMaintenance.code} - ${selectedMaintenance.name}`,
        }
      }

      return { ...prev, [name]: value }
    })
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
          factory: form.factory || null,
          equipmentCode: form.equipmentCode,
          area: form.area,
          assignedTo: form.assignedTo ? Number(form.assignedTo) : user?.id || null,
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

        const selectedMaintenance = maintenanceOptions.find((item) => item.code === form.maintenanceCategory) ?? maintenanceOptions[0]
        const isMaintenancePayload = form.type === 'Maintenance'

        await updateUserTicket(ticketId, {
          // type: isMaintenancePayload ? `Maintenance|${selectedMaintenance.code}` : 'IT',
          categoryId: form.categoryId,
          title: isMaintenancePayload ? `${selectedMaintenance.code} - ${selectedMaintenance.name}` : form.title,
          description: form.description,
          factory: form.factory || null,
          equipmentCode: isMaintenancePayload ? form.equipmentCode : '',
          area: isMaintenancePayload ? form.area : '',
          assignedTeam: form.assignedTeam,
          dueDate: form.dueDate || null,
        })
      }

      const updatedTicket = await getTicketById(ticketId)
      setTicket(updatedTicket)
      const updatedMaintenanceCategory = getMaintenanceCategory(updatedTicket)
      setForm({
        // type: isMaintenanceTicket(updatedTicket) ? 'Maintenance' : 'IT',
        // ✅ MỚI
categoryId: updatedTicket.categoryId,
        factory: updatedTicket.factory || '',
        maintenanceCategory: updatedMaintenanceCategory?.code || 'PM01',
        title: updatedTicket.title || '',
        description: updatedTicket.description || '',
        equipmentCode: updatedTicket.equipmentCode || '',
        area: updatedTicket.area || '',
        assignedTo: updatedTicket.assignedTo ? String(updatedTicket.assignedTo) : '',
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
      {message && <div className="ticket-details__success">{message}</div>}
      {error && <div className="ticket-details__alert">{error}</div>}
      <div className={statusMeta.className}>
        <StatusIcon size={20} />
        <div>
          <strong>{statusMeta.title}</strong>
          <p>{statusMeta.description}</p>
        </div>
      </div>

      <div className="ticket-details__grid ticket-details__grid--single">
        <section className="ticket-details__card ticket-details__card--primary">
          <div className="ticket-details__form-card">
            <div className="ticket-details__card-header">
              <div className="ticket-details__card-heading">
                <h2>Thong tin Ticket</h2>
                <span className={getStatusClass(statusText)}>{statusText}</span>
              </div>
              {showEditButton && (
                <button
                  type="button"
                  className="ticket-details__button ticket-details__button--icon"
                  onClick={() => setIsEditing((prev) => !prev)}
                  title={actionLabel}
                  aria-label={actionLabel}
                  data-tooltip={actionLabel}
                >
                  <ActionIcon size={18} />
                </button>
              )}
            </div>

            {!isEditing && (
              <div className="ticket-details__form-view">
                <label>Loai Ticket</label>
                <div className="ticket-details__field-view">{ticket?.categoryName} </div>

                <label>Nha may</label>
                <div className="ticket-details__field-view">{getFactoryLabel(ticket.factory)}</div>

                {isMaintenance && (
                  <>
                    <label>Loai bao tri</label>
                    <div className="ticket-details__field-view">{maintenanceHeadline}</div>

                    {/* <div className="ticket-details__field-note">
                      Loai bao tri se duoc map vao thong tin ticket. So order se do admin cap nhat sau khi xu ly.
                    </div> */}
                  </>
                )}

                {!isMaintenance && (
                  <>
                    <label>Tieu de ho tro</label>
                    <div className="ticket-details__field-view">{ticket.title || 'Chua co tieu de'}</div>
                  </>
                )}

                {isMaintenance && (
                  <>
                    <label>Equipment</label>
                    <div className="ticket-details__field-view">{ticket.area || 'Chua co'}</div>

                    <label>Ten thiet bi</label>
                    <div className="ticket-details__field-view">{ticket.equipmentCode || 'Chua co'}</div>
                  </>
                )}

                <label>Doi xu ly</label>
                <div className="ticket-details__field-view">{ticket.assignedTeam || 'Chua phan cong'}</div>

                {!isAdmin && (
                  <>
                    <label>Nguoi tiep nhan</label>
                    <div className="ticket-details__field-view">{assigneeDisplay}</div>
                  </>
                )}

                <label>Mo ta</label>
                <div className="ticket-details__field-view ticket-details__field-view--textarea">
                  {ticket.description || 'Chua co mo ta'}
                </div>

                <label>Han xu ly</label>
                <div className="ticket-details__field-view">{formatDate(ticket.dueDate)}</div>

                {isAdmin && (
                  <>
                    <label>Nguoi tao</label>
                    <div className="ticket-details__field-view">{requesterDisplay}</div>
                  </>
                )}

                <label>Thoi gian tao</label>
                <div className="ticket-details__field-view">{formatDate(ticket.createdAt)}</div>

                {/* <label>Thoi gian cap nhat</label>
                <div className="ticket-details__field-view">{formatDate(ticket.updatedAt)}</div> */}

                {isMaintenance && (
                  <>
                    <label>So order</label>
                    <div className="ticket-details__field-view">{orderCodeDisplay}</div>
                  </>
                )}
              </div>
            )}

            {isEditing && (
              <form className="ticket-details__form" onSubmit={handleSave}>
              {!isAdmin && (
                <>
                  <label className="ticket-details__form-field ticket-details__form-field--full">
                    <span>Loai Ticket</span>
                    <select name="type" value={form.type} onChange={handleChange} disabled={!isEditing}>
                      <option value="Maintenance">Lenh bao tri</option>
                      <option value="IT">Ho tro CNTT</option>
                    </select>
                  </label>

                  <label className="ticket-details__form-field ticket-details__form-field--full">
                    <span>Nha may</span>
                    <select name="factory" value={form.factory} onChange={handleChange} disabled={!isEditing}>
                      <option value="">Chon nha may</option>
                      {factoryOptions.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.code} - {option.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {isEditingMaintenance && (
                    <>
                      <label className="ticket-details__form-field ticket-details__form-field--full">
                        <span>Loai bao tri</span>
                        <select name="maintenanceCategory" value={form.maintenanceCategory} onChange={handleChange} disabled={!isEditing}>
                          {maintenanceOptions.map((option) => (
                            <option key={option.code} value={option.code}>
                              {option.code} - {option.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="ticket-details__field-note">
                        Loai bao tri se duoc map vao thong tin ticket. So order se do admin cap nhat sau khi xu ly.
                      </div>
                    </>
                  )}

                  {!isEditingMaintenance && (
                    <label className="ticket-details__form-field ticket-details__form-field--full">
                      <span>Tieu de</span>
                      <input name="title" value={form.title} onChange={handleChange} disabled={!isEditing} />
                    </label>
                  )}

                  <label className="ticket-details__form-field ticket-details__form-field--full">
                    <span>Mo ta</span>
                    <textarea name="description" rows="6" value={form.description} onChange={handleChange} disabled={!isEditing} />
                  </label>

                  <div className="ticket-details__form-split">
                    {isEditingMaintenance && (
                      <>
                        <label className="ticket-details__form-field">
                          <span>Ten thiet bi</span>
                          <input name="equipmentCode" value={form.equipmentCode} onChange={handleChange} disabled={!isEditing} />
                        </label>

                        <label className="ticket-details__form-field">
                          <span>Equipment</span>
                          <input name="area" value={form.area} onChange={handleChange} disabled={!isEditing} />
                        </label>
                      </>
                    )}

                    <label className="ticket-details__form-field">
                      <span>Doi xu ly</span>
                      <input name="assignedTeam" value={form.assignedTeam} onChange={handleChange} disabled={!isEditing} />
                    </label>

                    <label className="ticket-details__form-field">
                      <span>Nguoi tiep nhan</span>
                      <select name="assignedTo" value={form.assignedTo} onChange={handleChange} disabled={!isEditing}>
                        <option value="">Chua gan nguoi tiep nhan</option>
                        {users.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.id} - {item.username} ({item.role})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="ticket-details__form-field">
                      <span>Han xu ly</span>
                      <input type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange} disabled={!isEditing} />
                    </label>
                  </div>
                </>
              )}

              {isAdmin && isEditing && (
                <>
                  <label className="ticket-details__form-field ticket-details__form-field--full">
                    <span>Nha may</span>
                    <select name="factory" value={form.factory} onChange={handleChange} disabled={!isEditing}>
                      <option value="">Chon nha may</option>
                      {factoryOptions.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.code} - {option.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="ticket-details__form-field ticket-details__form-field--full">
                    <span>Tieu de</span>
                    <input name="title" value={form.title} onChange={handleChange} disabled={!isEditing} />
                  </label>

                  <label className="ticket-details__form-field ticket-details__form-field--full">
                    <span>Mo ta</span>
                    <textarea name="description" rows="6" value={form.description} onChange={handleChange} disabled={!isEditing} />
                  </label>

                  <div className="ticket-details__form-split">
                    <label className="ticket-details__form-field">
                      <span>Ten thiet bi</span>
                      <input name="equipmentCode" value={form.equipmentCode} onChange={handleChange} disabled={!isEditing} />
                    </label>

                    <label className="ticket-details__form-field">
                      <span>Equipment</span>
                      <input name="area" value={form.area} onChange={handleChange} disabled={!isEditing} />
                    </label>

                    <label className="ticket-details__form-field">
                      <span>Doi xu ly</span>
                      <input name="assignedTeam" value={form.assignedTeam} onChange={handleChange} disabled={!isEditing} />
                    </label>

                    <label className="ticket-details__form-field">
                      <span>Han xu ly</span>
                      <input type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange} disabled={!isEditing} />
                    </label>

                    <div className="ticket-details__static-field">
                      <strong>Nguoi tao</strong>
                      <p>{requesterDisplay}</p>
                    </div>

                    <label className="ticket-details__form-field">
                      <span>Trang thai</span>
                      <select name="status" value={form.status} onChange={handleChange} disabled={!isEditing}>
                        <option value="Submitted">Submitted</option>
                        <option value="InProgress">InProgress</option>
                        <option value="Done">Done</option>
                      </select>
                    </label>

                    {isMaintenance ? (
                      <label className="ticket-details__form-field">
                        <span>So order</span>
                        <input name="orderCode" value={form.orderCode} onChange={handleChange} disabled={!isEditing} />
                      </label>
                    ) : (
                      <div className="ticket-details__static-field">
                        <strong>So order</strong>
                        <p>Khong ap dung cho ticket ho tro CNTT.</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {(isAdmin || canUserEdit) && (
                <button
                  type="submit"
                  className="ticket-details__button ticket-details__button--icon"
                  disabled={isSaving}
                  title={isSaving ? 'Dang luu...' : 'Luu thay doi'}
                  aria-label={isSaving ? 'Dang luu...' : 'Luu thay doi'}
                  data-tooltip={isSaving ? 'Dang luu...' : 'Luu thay doi'}
                >
                  <FiSave size={18} />
                </button>
              )}
              </form>
            )}
          </div>
        </section>

      </div>
    </section>
  )
}

export default TicketDetails
