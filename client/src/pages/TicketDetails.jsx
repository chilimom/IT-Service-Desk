import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiAlertCircle, FiCheckCircle, FiEdit2, FiInfo, FiSave, FiSettings, FiX } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { buildApiUrl } from '../services/api'
import { getTicketById, updateAdminTicket, updateUserTicket } from '../services/ticketService'
import { getUsers } from '../services/userService'
import { getMaintenanceCategory, getOrderCodeDisplay, getStatusDisplayLabel } from '../ultils/ticketMeta'
import { canAccessFactory, canManageTickets, isAdminRole, isProcessorRole } from '../ultils/auth'
import '../styles/ticket-details.css'

const SUBMITTED_STATUS_ID = 3
const IN_PROGRESS_STATUS_ID = 2
const DONE_STATUS_ID = 1

function formatDate(value) {
  if (!value) return 'Chua co'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Khong hop le'
  return date.toLocaleString('vi-VN')
}

function getStatusLabel(statusId, statusName) {
  if (statusName) return getStatusDisplayLabel(statusName)
  if (statusId === SUBMITTED_STATUS_ID) return 'Chờ xử lý'
  if (statusId === IN_PROGRESS_STATUS_ID) return 'Đang xử lý'
  if (statusId === DONE_STATUS_ID) return 'Hoàn thành'
  return 'Unknown'
}

function getStatusClass(status) {
  const normalized = (status || '').toLowerCase()
  if (normalized === 'submitted' || normalized === 'cho xu ly') return 'status-pill status-pill--submitted'
  if (normalized === 'inprogress' || normalized === 'dang xu ly') return 'status-pill status-pill--progress'
  if (normalized === 'done' || normalized === 'hoan thanh') return 'status-pill status-pill--done'
  return 'status-pill'
}

function getStatusMeta(status) {
  const normalized = (status || '').toLowerCase()

  if (normalized === 'submitted' || normalized === 'cho xu ly') {
    return {
      className: 'ticket-details__status-banner ticket-details__status-banner--submitted',
      icon: FiInfo,
      title: 'Ticket đã gửi và chưa được tiếp nhận',
      // description: 'Ban co the sua noi dung ticket trong giai doan nay truoc khi bo phan xu ly bat dau tiep nhan.',
    }
  }

  if (normalized === 'inprogress' || normalized === 'dang xu ly') {
    return {
      className: 'ticket-details__status-banner ticket-details__status-banner--progress',
      icon: FiAlertCircle,
      title: 'Ticket đang được tiếp nhận và xử lý',
      // description: 'Ticket da vao quy trinh xu ly, noi dung yeu cau tam thoi khong con cho phep sua.',
    }
  }

  if (normalized === 'done' || normalized === 'hoan thanh') {
    return {
      className: 'ticket-details__status-banner ticket-details__status-banner--done',
      icon: FiCheckCircle,
      title: 'Ticket đã hoàn thành',
      // description: 'Thong tin ticket duoc luu lai de theo doi, hien tai khong the sua noi dung.',
    }
  }

  return {
    className: 'ticket-details__status-banner',
    icon: FiInfo,
    title: 'Trạng thái ticket',
    description: 'Trang thái hiện tại của ticket đang được cập nhật.',
  }
}

function TicketDetails() {
  const { ticketId } = useParams()
  const { user } = useAuth()
  const isAdmin = isAdminRole(user?.role)
  const isProcessor = isProcessorRole(user?.role)
  const canProcessTickets = canManageTickets(user)

  const [ticket, setTicket] = useState(null)
  const [users, setUsers] = useState([])
  const [factories, setFactories] = useState([])
  const [maintenanceTypes, setMaintenanceTypes] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    type: 'Maintenance',
    factoryId: '',
    maintenanceTypeId: '',
    title: '',
    description: '',
    equipmentCode: '',
    area: '',
    assignedTo: '',
    assignedTeam: '',
    dueDate: '',
    statusId: String(SUBMITTED_STATUS_ID),
    orderCode: '',
  })

  const isMaintenance = useMemo(() => ticket?.categoryType === 'Maintenance', [ticket])
  const statusText = useMemo(() => (ticket ? getStatusLabel(ticket.statusId, ticket.status) : ''), [ticket])
  const statusMeta = useMemo(() => getStatusMeta(statusText), [statusText])
  const StatusIcon = statusMeta.icon
  const canUserEdit = useMemo(() => !canProcessTickets && ticket?.statusId === SUBMITTED_STATUS_ID, [canProcessTickets, ticket])
  const showEditButton = canProcessTickets || canUserEdit
  const actionLabel = isEditing ? 'Đóng' : canProcessTickets ? 'Xử lý Ticket' : 'Sửa Ticket'
  const ActionIcon = isEditing ? FiX : canProcessTickets ? FiSettings : FiEdit2
  const isEditingMaintenance = form.type === 'Maintenance'
  const canMarkDone = !isMaintenance || Boolean(form.orderCode?.trim())
  const availableFactories = useMemo(() => {
    if (!isProcessor) return factories
    return factories.filter((option) => canAccessFactory(user, option.id))
  }, [factories, isProcessor, user])
  const assignableUsers = useMemo(() => {
    const selectedFactoryId = Number(form.factoryId || ticket?.factoryId || 0)

    return users.filter((option) => {
      if (isAdminRole(option.role)) return true
      return isProcessorRole(option.role) && canAccessFactory(option, selectedFactoryId)
    })
  }, [form.factoryId, ticket, users])

  const maintenanceHeadline = useMemo(() => {
    if (ticket?.maintenanceTypeId) {
      const selectedType = maintenanceTypes.find((item) => Number(item.id) === Number(ticket.maintenanceTypeId))
      if (selectedType) {
        return `${selectedType.code} - ${selectedType.name}`
      }
    }

    if (ticket?.maintenanceTypeCode && ticket?.maintenanceTypeName) {
      return `${ticket.maintenanceTypeCode} - ${ticket.maintenanceTypeName}`
    }

    const maintenanceCategory = getMaintenanceCategory(ticket)
    return maintenanceCategory ? `${maintenanceCategory.code} - ${maintenanceCategory.name}` : 'Chua co loai bao tri'
  }, [maintenanceTypes, ticket])

  const requesterDisplay = useMemo(() => {
    const requesterId = ticket?.requestedBy
    const requesterName = ticket?.requestedByName
    if (requesterId && requesterName) return `${requesterId} - ${requesterName}`
    if (requesterId) return String(requesterId)
    if (requesterName) return requesterName
    return 'Chua co'
  }, [ticket])

  const assigneeDisplay = useMemo(() => {
    const assigneeId = ticket?.assignedTo
    const assigneeName = ticket?.assignedToName
    if (assigneeId && assigneeName) return `${assigneeId} - ${assigneeName}`
    if (assigneeId) return String(assigneeId)
    if (assigneeName) return assigneeName
    return 'Chưa có người tiếp nhận'
  }, [ticket])

  useEffect(() => {
    async function loadTicketDetails() {
      try {
        setError('')
        const ticketData = await getTicketById(ticketId)
        setTicket(ticketData)
        setForm({
          type: ticketData.categoryType === 'Maintenance' ? 'Maintenance' : 'IT',
          factoryId: ticketData.factoryId ? String(ticketData.factoryId) : '',
          maintenanceTypeId: ticketData.maintenanceTypeId ? String(ticketData.maintenanceTypeId) : '',
          title: ticketData.title || '',
          description: ticketData.description || '',
          equipmentCode: ticketData.equipmentCode || '',
          area: ticketData.area || '',
          assignedTo: ticketData.assignedTo ? String(ticketData.assignedTo) : '',
          assignedTeam: ticketData.assignedTeam || '',
          dueDate: ticketData.dueDate ? ticketData.dueDate.slice(0, 16) : '',
          statusId: String(ticketData.statusId || SUBMITTED_STATUS_ID),
          orderCode: ticketData.orderCode || '',
        })
      } catch {
        setError('Khong the tai chi tiet ticket.')
      }
    }

    loadTicketDetails()
  }, [ticketId])

  useEffect(() => {
    async function loadMetadata() {
      try {
        const [factoriesResponse, maintenanceTypesResponse] = await Promise.all([
          fetch(buildApiUrl('/api/tickets/factories')),
          fetch(buildApiUrl('/api/MaintenanceTypes')),
        ])

        const factoriesData = factoriesResponse.ok ? await factoriesResponse.json() : []
        const maintenanceTypesData = maintenanceTypesResponse.ok ? await maintenanceTypesResponse.json() : []

        setFactories(Array.isArray(factoriesData) ? factoriesData : [])
        setMaintenanceTypes(Array.isArray(maintenanceTypesData) ? maintenanceTypesData : [])
      } catch {
        setFactories([])
        setMaintenanceTypes([])
      }
    }

    loadMetadata()
  }, [])

  useEffect(() => {
    if (!canProcessTickets) return

    getUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
  }, [canProcessTickets])

  function handleChange(event) {
    const { name, value } = event.target
    setMessage('')
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSave(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      if (canProcessTickets) {
        if (isMaintenance && Number(form.statusId) === DONE_STATUS_ID && !form.orderCode?.trim()) {
          setError('Lenh bao tri phai co so order truoc khi chuyen sang Done.')
          return
        }

        await updateAdminTicket(ticketId, {
          title: isMaintenance ? ticket?.title || form.title : form.title,
          description: form.description,
          factoryId: form.factoryId ? Number(form.factoryId) : 0,
          categoryId: ticket?.categoryId || 0,
          maintenanceTypeId: isMaintenance && form.maintenanceTypeId ? Number(form.maintenanceTypeId) : null,
          equipmentCode: form.equipmentCode,
          area: form.area,
          assignedTo: form.assignedTo ? Number(form.assignedTo) : null,
          assignedTeam: form.assignedTeam,
          dueDate: form.dueDate || null,
          statusId: form.statusId ? Number(form.statusId) : null,
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
          factoryId: form.factoryId ? Number(form.factoryId) : 0,
          maintenanceTypeId: isEditingMaintenance && form.maintenanceTypeId ? Number(form.maintenanceTypeId) : null,
          equipmentCode: isEditingMaintenance ? form.equipmentCode : '',
          area: isEditingMaintenance ? form.area : '',
          assignedTeam: form.assignedTeam,
          dueDate: form.dueDate || null,
        })
      }

      const updatedTicket = await getTicketById(ticketId)
      setTicket(updatedTicket)
      setForm({
        type: updatedTicket.categoryType === 'Maintenance' ? 'Maintenance' : 'IT',
        factoryId: updatedTicket.factoryId ? String(updatedTicket.factoryId) : '',
        maintenanceTypeId: updatedTicket.maintenanceTypeId ? String(updatedTicket.maintenanceTypeId) : '',
        title: updatedTicket.title || '',
        description: updatedTicket.description || '',
        equipmentCode: updatedTicket.equipmentCode || '',
        area: updatedTicket.area || '',
        assignedTo: updatedTicket.assignedTo ? String(updatedTicket.assignedTo) : '',
        assignedTeam: updatedTicket.assignedTeam || '',
        dueDate: updatedTicket.dueDate ? updatedTicket.dueDate.slice(0, 16) : '',
        statusId: String(updatedTicket.statusId || SUBMITTED_STATUS_ID),
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
  if (!canProcessTickets && Number(ticket.requestedBy) !== Number(user?.id)) {
    return <div className="ticket-details__alert">Ban khong co quyen xem ticket cua nguoi dung khac.</div>
  }
  if (isProcessor && !canAccessFactory(user, ticket.factoryId)) {
    return <div className="ticket-details__alert">Ban khong co quyen xu ly ticket cua nha may nay.</div>
  }

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
                <h2>Thông tin Ticket</h2>
                <span className={getStatusClass(statusText)}>{statusText}</span>
              </div>
              {showEditButton && (
                <button
                  type="button"
                  className="ticket-details__button ticket-details__button--icon"
                  onClick={() => setIsEditing((prev) => !prev)}
                  title={actionLabel}
                >
                  <ActionIcon size={18} />
                </button>
              )}
            </div>

            {!isEditing && (
              <div className="ticket-details__form-view">
                <label>Loại Ticket</label>
                <div className="ticket-details__field-view">{isMaintenance ? 'Lệnh bảo trì' : 'Hỗ trợ CNTT'}</div>

                <label>Lĩnh vực</label>
                <div className="ticket-details__field-view">{ticket.categoryName || 'Chưa có'}</div>

                <label>Nhà máy</label>
                <div className="ticket-details__field-view">{ticket.factoryCode ? `${ticket.factoryCode} - ${ticket.factoryName}` : ticket.factoryName || 'Chua co'}</div>

                {isMaintenance && (
                  <>
                    <label>Loại bảo trì</label>
                    <div className="ticket-details__field-view">{maintenanceHeadline}</div>
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

                    <label>Tên thiết bị</label>
                    <div className="ticket-details__field-view">{ticket.equipmentCode || 'Chua co'}</div>
                  </>
                )}

                <label>Tổ xử lý</label>
                <div className="ticket-details__field-view">{ticket.assignedTeam || 'Chua phan cong'}</div>

                {!canProcessTickets && (
                  <>
                    <label>Người tiếp nhận</label>
                    <div className="ticket-details__field-view">{assigneeDisplay}</div>
                  </>
                )}

                <label>Mô tả</label>
                <div className="ticket-details__field-view ticket-details__field-view--textarea">{ticket.description || 'Chua co mo ta'}</div>

                <label>Ngày hoàn thành</label>
                <div className="ticket-details__field-view">{formatDate(ticket.dueDate)}</div>

                {canProcessTickets && (
                  <>
                    <label>Nguoi tao</label>
                    <div className="ticket-details__field-view">{requesterDisplay}</div>
                  </>
                )}

                <label>Ngày tạo</label>
                <div className="ticket-details__field-view">{formatDate(ticket.createdAt)}</div>

                {isMaintenance && (
                  <>
                    <label>Số order</label>
                    <div className="ticket-details__field-view">{getOrderCodeDisplay(ticket)}</div>
                  </>
                )}
              </div>
            )}

            {isEditing && (
              <form className="ticket-details__form" onSubmit={handleSave}>
                {!canProcessTickets && (
                  <>
                    <label className="ticket-details__form-field ticket-details__form-field--full">
                      <span>Nhà máy</span>
                      <select name="factoryId" value={form.factoryId} onChange={handleChange}>
                        <option value="">Chọn nhà máy</option>
                        {availableFactories.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.code} - {option.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    {isEditingMaintenance ? (
                      <label className="ticket-details__form-field ticket-details__form-field--full">
                        <span>Loại bảo trì</span>
                        <select name="maintenanceTypeId" value={form.maintenanceTypeId} onChange={handleChange}>
                          <option value="">Chọn loại bảo trì</option>
                          {maintenanceTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.code} - {type.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <label className="ticket-details__form-field ticket-details__form-field--full">
                        <span>Tiêu đề</span>
                        <input name="title" value={form.title} onChange={handleChange} />
                      </label>
                    )}

                    <label className="ticket-details__form-field ticket-details__form-field--full">
                      <span>Mô tả</span>
                      <textarea name="description" rows="6" value={form.description} onChange={handleChange} />
                    </label>

                    <div className="ticket-details__form-split">
                      {isEditingMaintenance && (
                        <>
                          <label className="ticket-details__form-field">
                            <span>Tên thiết bị</span>
                            <input name="equipmentCode" value={form.equipmentCode} onChange={handleChange} />
                          </label>

                          <label className="ticket-details__form-field">
                            <span>Equipment</span>
                            <input name="area" value={form.area} onChange={handleChange} />
                          </label>
                        </>
                      )}

                      <label className="ticket-details__form-field">
                        <span>Tổ xử lý</span>
                        <input name="assignedTeam" value={form.assignedTeam} onChange={handleChange} />
                      </label>

                      <label className="ticket-details__form-field">
                        <span>Hạn xử lý</span>
                        <input type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange} />
                      </label>
                    </div>
                  </>
                )}

                {canProcessTickets && (
                  <>
                    <label className="ticket-details__form-field ticket-details__form-field--full">
                      <span>Nhà máy</span>
                      <select name="factoryId" value={form.factoryId} onChange={handleChange}>
                        <option value="">Chọn nhà máy</option>
                        {availableFactories.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.code} - {option.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    {isMaintenance ? (
                      <label className="ticket-details__form-field ticket-details__form-field--full">
                        <span>Loại bảo trì</span>
                        <select name="maintenanceTypeId" value={form.maintenanceTypeId} onChange={handleChange}>
                          <option value="">Chọn loại bảo trì</option>
                          {maintenanceTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.code} - {type.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <label className="ticket-details__form-field ticket-details__form-field--full">
                        <span>Tiều đề</span>
                        <input name="title" value={form.title} onChange={handleChange} />
                      </label>
                    )}

                    <label className="ticket-details__form-field ticket-details__form-field--full">
                      <span>Mô tả</span>
                      <textarea name="description" rows="6" value={form.description} onChange={handleChange} />
                    </label>

                    <div className="ticket-details__form-split">
                      <label className="ticket-details__form-field">
                        <span>Tên thiết bị</span>
                        <input name="equipmentCode" value={form.equipmentCode} onChange={handleChange} />
                      </label>

                      <label className="ticket-details__form-field">
                        <span>Equipment</span>
                        <input name="area" value={form.area} onChange={handleChange} />
                      </label>

                      <label className="ticket-details__form-field">
                        <span>Tổ bảo trì</span>
                        <input name="assignedTeam" value={form.assignedTeam} onChange={handleChange} />
                      </label>

                      <label className="ticket-details__form-field">
                        <span>Người tiếp nhận</span>
                        <select name="assignedTo" value={form.assignedTo} onChange={handleChange}>
                          <option value="">Chọn người tiếp nhận</option>
                          {assignableUsers.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.id} - {option.username}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="ticket-details__form-field">
                        <span>Hạn xử lý</span>
                        <input type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange} />
                      </label>

                      <div className="ticket-details__static-field">
                        <strong>Người tạo</strong>
                        <p>{requesterDisplay}</p>
                      </div>

                      <label className="ticket-details__form-field">
                        <span>Trạng thái</span>
                        <select name="statusId" value={form.statusId} onChange={handleChange}>
                          <option value={SUBMITTED_STATUS_ID}>Chờ xử lý</option>
                          <option value={IN_PROGRESS_STATUS_ID}>Đang xử lý</option>
                          <option value={DONE_STATUS_ID} disabled={!canMarkDone}>
                            Hoàn thành
                          </option>
                        </select>
                      </label>

                      {isMaintenance ? (
                        <label className="ticket-details__form-field">
                          <span>Số order</span>
                          <input name="orderCode" value={form.orderCode} onChange={handleChange} />
                        </label>
                      ) : (
                        <div className="ticket-details__static-field">
                          <strong>Số order</strong>
                          <p>Không áp dụng cho ticket hỗ trợ CNTT.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {(canProcessTickets || canUserEdit) && (
                  <button
                    type="submit"
                    className="ticket-details__button ticket-details__button--icon"
                    disabled={isSaving}
                    title={isSaving ? 'Dang luu...' : 'Luu thay doi'}
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
