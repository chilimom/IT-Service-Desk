import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiEdit2, FiSave, FiSettings, FiX } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { buildApiUrl } from '../services/api'
import { getTicketById, updateAdminTicket, updateUserTicket } from '../services/ticketService'
import { getUsers } from '../services/userService'
import { getMaintenanceTypeDisplay, getOrderCodeDisplay, getStatusDisplayLabel } from '../ultils/ticketMeta'
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

function TicketDetails() {
  const { ticketId } = useParams()
  const { user } = useAuth()
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
  const [hasPendingStatusValidation, setHasPendingStatusValidation] = useState(false)
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
  const shouldShowAssignee = useMemo(() => {
    if (!ticket) return false

    const normalizedStatus = String(ticket.status || '').trim().toLowerCase()

    return (
      Boolean(ticket.assignedTo) ||
      Boolean(ticket.assignedToName) ||
      Number(ticket.statusId) === IN_PROGRESS_STATUS_ID ||
      Number(ticket.statusId) === DONE_STATUS_ID ||
      normalizedStatus === 'inprogress' ||
      normalizedStatus === 'dang xu ly' ||
      normalizedStatus === 'done' ||
      normalizedStatus === 'hoan thanh'
    )
  }, [ticket])
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
        return getMaintenanceTypeDisplay(selectedType)
      }
    }

    if (ticket?.maintenanceTypeCode && ticket?.maintenanceTypeName) {
      return getMaintenanceTypeDisplay({
        maintenanceTypeCode: ticket.maintenanceTypeCode,
        maintenanceTypeName: ticket.maintenanceTypeName,
      })
    }

    return 'Chua co loai bao tri'
  }, [maintenanceTypes, ticket])

  const requesterDisplay = useMemo(() => {
    const requesterId = ticket?.requestedBy
    const requesterName = ticket?.requestedByName
    if (requesterName) return requesterName
    if (requesterId) return String(requesterId)
    return 'Chua co'
  }, [ticket])

  const assigneeDisplay = useMemo(() => {
    const assigneeId = ticket?.assignedTo
    const assigneeName = ticket?.assignedToName
    const assigneeOption = users.find((option) => Number(option.id) === Number(assigneeId))
    if (assigneeName) return assigneeName
    if (assigneeOption) return assigneeOption.fullName || assigneeOption.username || `User ${assigneeOption.id}`
    if (assigneeId) return String(assigneeId)
    return 'Chưa có người tiếp nhận'
  }, [ticket, users])

  const getUserOptionLabel = (option) => option.fullName || option.username || `User ${option.id}`

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
    if (name === 'assignedTo' && value) {
      setError('')
      setHasPendingStatusValidation(false)
    } else if (name !== 'statusId') {
      setError('')
    }

    if (
      canProcessTickets &&
      name === 'statusId' &&
      (Number(value) === IN_PROGRESS_STATUS_ID || Number(value) === DONE_STATUS_ID) &&
      !form.assignedTo
    ) {
      setHasPendingStatusValidation(true)
      setError('Hãy chọn người tiếp nhận.')
      return
    }

    if (name === 'statusId') {
      setHasPendingStatusValidation(false)
      setError('')
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSave(event) {
    event.preventDefault()

    if (hasPendingStatusValidation) {
      setError('Hãy chọn người tiếp nhận.')
      return
    }

    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      if (canProcessTickets) {
        if (
          (Number(form.statusId) === IN_PROGRESS_STATUS_ID || Number(form.statusId) === DONE_STATUS_ID) &&
          !form.assignedTo
        ) {
          setError('Vui long chon nguoi tiep nhan truoc khi chuyen ticket sang Dang xu ly hoac Hoan thanh.')
          return
        }

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
      setMessage('Cập nhật ticket thành công.')
      setHasPendingStatusValidation(false)
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
                <div className="ticket-details__field-view">{ticket.factoryName || 'Chua co'}</div>

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

                {shouldShowAssignee && (
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
                            {option.name}
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
                              {getMaintenanceTypeDisplay(type)}
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
                            {option.name}
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
                              {getMaintenanceTypeDisplay(type)}
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
                              {getUserOptionLabel(option)}
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
                    className="ticket-details__button ticket-details__button--submit"
                    disabled={isSaving || hasPendingStatusValidation}
                  >
                    <FiSave size={18} />
                    <span>{isSaving ? 'Dang luu...' : ''}</span>
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
