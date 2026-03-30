import { useEffect, useMemo, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { getTickets } from '../services/ticketService'
import { getOrderCodeDisplay } from '../ultils/ticketMeta'
import { filterTicketsByAccess } from '../ultils/auth'
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

  useEffect(() => {
    getTickets().then(setTickets).catch(() => setError('Khong the tai danh sach ticket.'))
  }, [])

  const filteredTickets = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()

    return [...filterTicketsByAccess(tickets, user)]
      .filter((ticket) => {
        if (!keyword) return true

        const searchableValues = [
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
        ticket.status || 'Unknown',
      ],
    }))

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8" />
          <style>
            table {
              border-collapse: collapse;
              font-family: Arial, sans-serif;
              font-size: 12px;
            }

            th, td {
              border: 1px solid #9fb6ce;
              padding: 8px 10px;
              vertical-align: middle;
              line-height: 1.4;
            }

            th {
              background: #dbe9f8;
              color: #12385f;
              font-weight: 700;
              text-align: center;
            }

            .text-left {
              text-align: left;
            }

            .text-center {
              text-align: center;
            }

            .text-right {
              text-align: right;
            }
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
                      .map(
                        (cell, index) =>
                          `<td class="text-${columns[index].align}">${escapeExcelValue(cell)}</td>`
                      )
                      .join('')}</tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    const blob = new Blob([`\uFEFF${html}`], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    })

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
        <h1 className="requests-page__title">Quản lý Ticket</h1>
      </div>

      {error && <div className="requests-page__alert">{error}</div>}

      <section className="requests-search">
        <label className="requests-search__field">
          <span>Tìm kiếm Ticket</span>
          <div className="requests-search__input-wrap">
            <span className="requests-search__icon">
              <FaSearch size={14} />
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nhập ticket, loại bảo trì, nhà máy, người yêu cầu..."
            />
          </div>
        </label>

        <button type="button" className="requests-search__export" onClick={handleExportExcel}>
          Xuất Excel
        </button>
      </section>

      <section className="requests-filters">
        <label className="requests-filters__field">
          <span>Lọc theo nhà máy</span>
          <select value={factoryFilter} onChange={(event) => setFactoryFilter(event.target.value)}>
            {factories.map((factory) => (
              <option key={factory} value={factory}>
                {factory === 'ALL' ? 'Tất cả nhà máy' : factory}
              </option>
            ))}
          </select>
        </label>

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
          <span>Lọc theo loại bảo trì</span>
          <select value={maintenanceFilter} onChange={(event) => setMaintenanceFilter(event.target.value)}>
            {maintenanceTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'ALL' ? 'Tất cả loại bảo trì' : type}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="requests-table">
        <div className="requests-table__head">
          <span>STT</span>
          <span>Equipment</span>
          <span>Khu vực</span>
          <span>Loại bảo trì</span>
          <span>Số order</span>
          <span>Nhà máy</span>
          <span>Người yêu cầu</span>
          <span>Ngày xử lý</span>
          <span>Trạng thái</span>
        </div>

        <div className="requests-table__body">
          {filteredTickets.map((ticket, index) => (
            <article key={ticket.id} className="requests-row">
              <div>
                <strong>{index + 1}</strong>
                <p>{ticket.title || 'Chưa có tiêu đề'}</p>
              </div>
              <span>{getEquipmentLabel(ticket)}</span>
              <span>{getAreaLabel(ticket)}</span>
              <span>{getMaintenanceTypeLabel(ticket)}</span>
              <span>{getOrderCodeDisplay(ticket)}</span>
              <span>{getFactoryLabel(ticket)}</span>
              <span>{getRequesterLabel(ticket)}</span>
              <span>{formatDate(ticket.dueDate)}</span>
              <span className={getStatusClass(ticket.status)}>{ticket.status || 'Unknown'}</span>
            </article>
          ))}

          {filteredTickets.length === 0 && (
            <div className="requests-empty">Không tìm thấy ticket phù hợp với bộ lọc hoặc từ khóa tìm kiếm.</div>
          )}
        </div>
      </section>
    </section>
  )
}

export default AdminTickets
