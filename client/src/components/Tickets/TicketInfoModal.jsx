import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { getMaintenanceCategory, getOrderCodeDisplay, isMaintenanceTicket } from '../../ultils/ticketMeta'
import '../../styles/ticket-details.css'

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
      description: 'Ban co the xem nhanh thong tin ticket ngay tren danh sach hien tai.',
    }
  }

  if (normalized === 'inprogress') {
    return {
      className: 'ticket-details__status-banner ticket-details__status-banner--progress',
      icon: FiAlertCircle,
      title: 'Ticket dang duoc tiep nhan va xu ly',
      description: 'Thong tin hien thi trong hop noi de theo doi nhanh tien do xu ly.',
    }
  }

  if (normalized === 'done') {
    return {
      className: 'ticket-details__status-banner ticket-details__status-banner--done',
      icon: FiCheckCircle,
      title: 'Ticket da hoan tat',
      description: 'Ban co the xem lai toan bo thong tin ticket ngay tren trang danh sach.',
    }
  }

  return {
    className: 'ticket-details__status-banner',
    icon: FiInfo,
    title: 'Trang thai ticket',
    description: 'Thong tin ticket duoc hien thi nhanh ngay tren trang hien tai.',
  }
}

function TicketInfoModal({ ticket, onClose, detailPath, detailLabel = 'Mo chi tiet' }) {
  if (!ticket) return null

  const isMaintenance = isMaintenanceTicket(ticket)
  const maintenanceCategory = getMaintenanceCategory(ticket)
  const maintenanceHeadline = maintenanceCategory ? `${maintenanceCategory.code} - ${maintenanceCategory.name}` : 'Khong ap dung'
  const orderCodeDisplay = getOrderCodeDisplay(ticket)
  const statusText = ticket.status || 'Unknown'
  const statusMeta = getStatusMeta(statusText)
  const StatusIcon = statusMeta.icon

  return (
    <div className="ticket-preview-modal" onClick={onClose} role="presentation">
      <div className="ticket-preview-modal__dialog" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="ticket-preview-modal__close" onClick={onClose} aria-label="Dong">
          <FiX size={18} />
        </button>

        <section className="ticket-details ticket-preview-modal__content">
          <div className={statusMeta.className}>
            <StatusIcon size={20} />
            <div>
              <strong>{statusMeta.title}</strong>
              <p>{statusMeta.description}</p>
            </div>
          </div>

          <div className="ticket-details__form-card">
            <div className="ticket-details__card-header">
              <div className="ticket-details__card-heading">
                <h2>Thong tin Ticket</h2>
                <span className={getStatusClass(statusText)}>{statusText}</span>
              </div>
            </div>

            <div className="ticket-details__form-view">
              <label>Loai Ticket</label>
              <div className="ticket-details__field-view">{isMaintenance ? 'Lenh bao tri' : 'Ho tro CNTT'}</div>

              {isMaintenance && (
                <>
                  <label>Loai bao tri</label>
                  <div className="ticket-details__field-view">{maintenanceHeadline}</div>

                  <div className="ticket-details__field-note">
                    Loai bao tri se duoc map vao thong tin ticket. So order se do admin cap nhat sau khi xu ly.
                  </div>
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

              <label>Mo ta</label>
              <div className="ticket-details__field-view ticket-details__field-view--textarea">
                {ticket.description || 'Chua co mo ta'}
              </div>

              <label>Han xu ly</label>
              <div className="ticket-details__field-view">{formatDate(ticket.dueDate)}</div>

              <label>Requested By</label>
              <div className="ticket-details__field-view">{ticket.requestedBy || 'Chua co'}</div>

              <label>Thoi gian tao</label>
              <div className="ticket-details__field-view">{formatDate(ticket.createdAt)}</div>

              <label>Thoi gian cap nhat</label>
              <div className="ticket-details__field-view">{formatDate(ticket.updatedAt)}</div>

              {isMaintenance && (
                <>
                  <label>So order</label>
                  <div className="ticket-details__field-view">{orderCodeDisplay}</div>
                </>
              )}
            </div>

            {detailPath && (
              <div className="ticket-preview-modal__footer">
                <Link className="ticket-preview-modal__link" to={detailPath}>
                  {detailLabel}
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default TicketInfoModal
