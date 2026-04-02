import { useEffect, useMemo, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { FiSettings, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { deleteTicket, getTickets } from '../services/ticketService'
import path from '../ultils/path'
import { formatTicketCode, getOrderCodeDisplay, getStatusDisplayLabel } from '../ultils/ticketMeta'
import { filterTicketsByAccess, isAdminRole } from '../ultils/auth'
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

function getRequesterLabel(ticket) {
  return ticket?.requestedByName || 'Chua co'
}

function getMaintenanceFilterValue(ticket) {
  return getMaintenanceTypeLabel(ticket)
}

function escapeExcelValue(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function AdminTickets() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [factoryFilter, setFactoryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [maintenanceFilter, setMaintenanceFilter] = useState('ALL')
  const [error, setError] = useState('')
  const [deletingTicketId, setDeletingTicketId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const canDeleteTicket = isAdminRole(user?.role)

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

    return [...filterTicketsByAccess(tickets, user)]
      .filter((ticket) => {
        if (!keyword) return true

        const searchableValues = [
          formatTicketCode(ticket),
          ticket.code,
          ticket.id,
          ticket.title,
          ticket.description,
          ticket.categoryName,
          ticket.categoryType,
          ticket.maintenanceTypeCode,
          ticket.maintenanceTypeName,
          ticket.factoryName,
          ticket.factoryCode,
          ticket.status,
          ticket.requestedByName,
        ]

        return searchableValues.some((value) => String(value || '').toLowerCase().includes(keyword))
      })
      .filter((ticket) => (factoryFilter === 'ALL' ? true : (ticket.factoryName || '') === factoryFilter))
      .filter((ticket) => (statusFilter === 'ALL' ? true : (ticket.status || '').toLowerCase() === statusFilter.toLowerCase()))
      .filter((ticket) => (maintenanceFilter === 'ALL' ? true : getMaintenanceFilterValue(ticket) === maintenanceFilter))
      .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
  }, [factoryFilter, maintenanceFilter, searchTerm, statusFilter, tickets, user])

  const visibleTickets = useMemo(() => filterTicketsByAccess(tickets, user), [tickets, user])
  const factories = useMemo(() => ['ALL', ...new Set(visibleTickets.map((ticket) => ticket.factoryName).filter(Boolean))], [visibleTickets])
  const statuses = useMemo(() => ['ALL', ...new Set(visibleTickets.map((ticket) => ticket.status).filter(Boolean))], [visibleTickets])

  const maintenanceTypes = useMemo(() => {
    return ['ALL', ...new Set(visibleTickets.map((ticket) => getMaintenanceFilterValue(ticket)).filter(Boolean))]
  }, [visibleTickets])

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / ITEMS_PER_PAGE))
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, filteredTickets])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, factoryFilter, statusFilter, maintenanceFilter])

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  function handleExportExcel() {
    const columns = [
      { header: 'STT', align: 'center', width: 48 },
      { header: 'Equipment', align: 'left', width: 150 },
      { header: 'Khu vuc', align: 'left', width: 170 },
      { header: 'Loai bao tri', align: 'left', width: 240 },
      { header: 'So order', align: 'center', width: 120 },
      { header: 'Nha may', align: 'left', width: 220 },
      { header: 'Nguoi yeu cau', align: 'center', width: 120 },
      { header: 'Ngay xu ly', align: 'right', width: 140 },
      { header: 'Trang thai', align: 'center', width: 110 },
    ]

    const rows = filteredTickets.map((ticket, index) => ({
      values: [
        index + 1,
        getEquipmentLabel(ticket),
        getAreaLabel(ticket),
        getMaintenanceTypeLabel(ticket),
        getOrderCodeDisplay(ticket),
        getFactoryLabel(ticket),
        getRequesterLabel(ticket),
        formatDate(ticket.dueDate),
        getStatusDisplayLabel(ticket.status),
      ],
    }))

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8" />
          <style>
            table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
            th, td { border: 1px solid #9fb6ce; padding: 8px 10px; vertical-align: middle; line-height: 1.4; }
            th { background: #dbe9f8; color: #12385f; font-weight: 700; text-align: center; }
            .text-left { text-align: left; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <table>
            <colgroup>
              ${columns.map((column) => `<col style="width:${column.width}px" />`).join('')}
            </colgroup>
            <thead>
              <tr>${columns.map((column) => `<th>${escapeExcelValue(column.header)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (row) =>
                    `<tr>${row.values
                      .map((cell, index) => `<td class="text-${columns[index].align}">${escapeExcelValue(cell)}</td>`)
                      .join('')}</tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    const blob = new Blob([`\uFEFF${html}`], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const exportDate = new Date().toISOString().slice(0, 10)
    link.href = url
    link.download = `admin-tickets-${exportDate}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <section className="requests-page">
      <div className="requests-page__hero">
        <p className="requests-page__eyebrow">Admin</p>
        <h1 className="requests-page__title">Quan tri Ticket</h1>
      </div>

      {error && <div className="requests-page__alert">{error}</div>}

      <section className="requests-search">
        <label className="requests-search__field">
          <span>Tim kiem Ticket</span>
          <div className="requests-search__input-wrap">
            <span className="requests-search__icon">
              <FaSearch size={14} />
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nhap ma ticket, loai bao tri, nha may, trang thai..."
            />
          </div>
        </label>

        <button type="button" className="requests-search__export" onClick={handleExportExcel}>
          Xuat Excel
        </button>
      </section>

      <section className="requests-filters">
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

        <label className="requests-filters__field">
          <span>Loc theo trang thai</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'ALL' ? 'Tat ca trang thai' : getStatusDisplayLabel(status)}
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
              <span className={getStatusClass(ticket.status)}>{getStatusDisplayLabel(ticket.status)}</span>
              <div className="requests-row__actions requests-row__actions--end">
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
                {canDeleteTicket && (
                  <button
                    type="button"
                    className="requests-row__action requests-row__action--danger"
                    title="Xoa"
                    aria-label="Xoa"
                    data-tooltip="Xoa"
                    onClick={() => handleDelete(ticket)}
                    disabled={deletingTicketId === ticket.id}
                  >
                    <span className="sr-only">Xoa</span>
                    <span className="requests-row__action-icon">
                      <FiTrash2 size={16} />
                    </span>
                  </button>
                )}
              </div>
            </article>
          ))}

          {filteredTickets.length === 0 && (
            <div className="requests-empty">Khong tim thay ticket phu hop voi bo loc hoac tu khoa tim kiem.</div>
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

export default AdminTickets
