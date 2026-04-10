import { useEffect, useMemo, useState } from 'react'
import { Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useTicketPolling } from '../hooks/useTicketPolling'
import { getTickets } from '../services/ticketService'
import { formatTicketCode, getMaintenanceTypeDisplay, getOrderCodeDisplay, getStatusDisplayLabel } from '../ultils/ticketMeta'
import { filterTicketsByAccess } from '../ultils/auth'
import '../styles/dashboard.css'

const MAINTENANCE_CARD_TINTS = [
  { background: 'linear-gradient(180deg, rgba(239,246,255,0.96), rgba(219,234,254,0.88))', borderColor: '#bfdbfe' },
  { background: 'linear-gradient(180deg, rgba(236,253,245,0.96), rgba(209,250,229,0.9))', borderColor: '#a7f3d0' },
  { background: 'linear-gradient(180deg, rgba(255,251,235,0.96), rgba(254,240,138,0.68))', borderColor: '#fde68a' },
  { background: 'linear-gradient(180deg, rgba(254,242,242,0.96), rgba(254,202,202,0.78))', borderColor: '#fecaca' },
  { background: 'linear-gradient(180deg, rgba(245,243,255,0.96), rgba(221,214,254,0.82))', borderColor: '#ddd6fe' },
  { background: 'linear-gradient(180deg, rgba(240,253,250,0.96), rgba(153,246,228,0.72))', borderColor: '#99f6e4' },
  { background: 'linear-gradient(180deg, rgba(255,247,237,0.96), rgba(254,215,170,0.82))', borderColor: '#fed7aa' },
  { background: 'linear-gradient(180deg, rgba(238,242,255,0.96), rgba(199,210,254,0.82))', borderColor: '#c7d2fe' },
]

const MAINTENANCE_DISPLAY_ORDER = ['PM01', 'PM02', 'PM03', 'PM05', 'ZPM5', 'ZPM6', 'ZPM7', 'QMTD']

function formatDate(dateValue) {
  if (!dateValue) return 'Chua co'

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Khong hop le'

  return date.toLocaleDateString('vi-VN')
}

function formatNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value) || 0)
}

function getStatusClass(status) {
  const normalized = (status || '').toLowerCase()

  if (normalized === 'submitted') return 'status-pill status-pill--submitted'
  if (normalized === 'inprogress') return 'status-pill status-pill--progress'
  if (normalized === 'done') return 'status-pill status-pill--done'

  return 'status-pill'
}

function getDashboardMaintenanceType(ticket) {
  if (ticket?.categoryType !== 'Maintenance') return 'Không áp dụng'
  return getMaintenanceTypeDisplay(ticket)
}

function getDashboardEquipment(ticket) {
  return ticket?.area || 'Chưa có'
}

function getDashboardArea(ticket) {
  return ticket?.equipmentCode || 'Chưa có'
}

function getDashboardFactory(ticket) {
  return ticket?.factoryName || 'Chua co nha may'
}

function Dashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(null)

  async function loadTickets() {
    try {
      const ticketData = await getTickets()
      setTickets(Array.isArray(ticketData) ? ticketData : [])
      setError('')
    } catch {
      setError('Khong the tai du lieu tu he thong ticket.')
      setTickets([])
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  useTicketPolling(loadTickets, { intervalMs: 10000 })

  const statusLookup = useMemo(() => {
    const visibleTickets = filterTicketsByAccess(tickets, user)
    const lookup = new Map()

    visibleTickets.forEach((ticket) => {
      const count = (lookup.get(Number(ticket.statusId)) || 0) + 1
      lookup.set(Number(ticket.statusId), count)
      lookup.set(String(ticket.status || '').toLowerCase(), count)
    })

    return lookup
  }, [tickets, user])

  const visibleTickets = useMemo(() => filterTicketsByAccess(tickets, user), [tickets, user])

  const stats = useMemo(() => {
    const done = statusLookup.get(1) ?? statusLookup.get('done') ?? 0
    const inProgress = statusLookup.get(2) ?? statusLookup.get('inprogress') ?? 0
    const submitted = statusLookup.get(3) ?? statusLookup.get('submitted') ?? 0

    return [
      { label: 'Tổng yêu cầu', value: visibleTickets.length, tone: 'total' },
      { label: 'Hoàn thành', value: done, tone: 'done' },
      { label: 'Đang xử lý', value: inProgress, tone: 'progress' },
      { label: 'Chờ xử lý', value: submitted, tone: 'submitted' },
    ]
  }, [statusLookup, visibleTickets.length])

  const recentTickets = useMemo(() => {
    return [...visibleTickets]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6)
  }, [visibleTickets])

  const ticketTypeChartData = useMemo(() => {
    const grouped = visibleTickets.reduce(
      (accumulator, ticket) => {
        if (ticket.categoryType === 'Maintenance') {
          accumulator.maintenance += 1
        } else if (ticket.categoryType === 'Support') {
          accumulator.support += 1
        } else {
          accumulator.other += 1
        }

        return accumulator
      },
      { maintenance: 0, support: 0, other: 0 },
    )

    return [
      { name: 'Lenh bao tri', value: grouped.maintenance, fill: 'url(#ticketTypeMaintenance)' },
      { name: 'Ho tro CNTT', value: grouped.support, fill: 'url(#ticketTypeSupport)' },
      { name: 'Khac', value: grouped.other, fill: 'url(#ticketTypeOther)' },
    ].filter((item) => item.value > 0)
  }, [visibleTickets])

  const factoryChartData = useMemo(() => {
    const grouped = visibleTickets.reduce((accumulator, ticket) => {
      const key =
        ticket.factoryName || 'Chưa có nhà máy' // Đặt tên chung cho các ticket không có thông tin nhà máy
      accumulator[key] = (accumulator[key] || 0) + 1
      return accumulator
    }, {})

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value, fill: 'url(#factoryBarGradient)' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [visibleTickets])

  const maintenanceChartData = useMemo(() => {
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#6366f1']
    const orderLookup = new Map(MAINTENANCE_DISPLAY_ORDER.map((code, index) => [code, index]))
    const grouped = visibleTickets.reduce((accumulator, ticket) => {
      const isMaintenance = ticket.categoryType === 'Maintenance'
      if (!isMaintenance) return accumulator

      const code = ticket.maintenanceTypeCode || 'N/A'
      const name = ticket.maintenanceTypeName || 'Chưa phân loại'
      const key = `${code}|${name}`
      accumulator[key] = (accumulator[key] || 0) + 1
      return accumulator
    }, {})

    return Object.entries(grouped)
      .map(([key, value], index) => {
        const [code, name] = key.split('|')
        return {
          code,
          name: getMaintenanceTypeDisplay({ maintenanceTypeCode: code === 'N/A' ? '' : code, maintenanceTypeName: name }),
          value,
          color: colors[index % colors.length],
        }
      })
      .sort((a, b) => {
        const leftOrder = orderLookup.get(a.code) ?? Number.MAX_SAFE_INTEGER
        const rightOrder = orderLookup.get(b.code) ?? Number.MAX_SAFE_INTEGER

        if (leftOrder !== rightOrder) return leftOrder - rightOrder
        if (b.value !== a.value) return b.value - a.value
        return a.name.localeCompare(b.name)
      })
  }, [visibleTickets])

  const totalMaintenance = maintenanceChartData.reduce((sum, item) => sum + item.value, 0)
  const activeItem = activeIndex !== null ? maintenanceChartData[activeIndex] : null
  const percent = activeItem && totalMaintenance > 0 ? Math.round((activeItem.value / totalMaintenance) * 100) : 100
  const highestMaintenanceTotal = maintenanceChartData[0]?.value || 1

  const maintenanceChartSegments = useMemo(() => {
    if (!maintenanceChartData.length || totalMaintenance <= 0) return []

    const circumference = 2 * Math.PI * 84
    let accumulatedOffset = 0

    return maintenanceChartData.map((item, index) => {
      const ratio = item.value / totalMaintenance
      const rawLength = ratio * circumference
      const visibleLength = maintenanceChartData.length > 1 ? Math.max(rawLength - 10, 0) : rawLength
      const segment = {
        ...item,
        label: item.name,
        percent: Math.round(ratio * 100),
        index,
        radius: 84,
        strokeDasharray: `${visibleLength} ${Math.max(circumference - visibleLength, 0)}`,
        strokeDashoffset: -accumulatedOffset,
      }

      accumulatedOffset += rawLength
      return segment
    })
  }, [maintenanceChartData, totalMaintenance])

  return (
    <section className="dashboard-page">
      <div className="dashboard-page__hero">
        <div>
          <p className="dashboard-page__eyebrow">IT Service Desk</p>
          <h1 className="dashboard-page__title">Tổng quan Ticket</h1>
        </div>
      </div>

      {error && <div className="dashboard-alert">{error}</div>}

      <div className="dashboard-stats">
        {stats.map((item) => (
          <article key={item.label} className={`dashboard-card dashboard-card--${item.tone}`}>
            <span className="dashboard-card__glow" aria-hidden="true" />
            <span className="dashboard-card__label">{item.label}</span>
            <strong className="dashboard-card__value">{formatNumber(item.value)}</strong>
          </article>
        ))}
      </div>

      <div className="dashboard-chart-grid">
        <section className="dashboard-panel dashboard-panel--maintenance">
          <div className="dashboard-panel__header">
            <div>
              <h2 className="dashboard-panel__title">Thống kê loại bảo trì</h2>
            </div>
          </div>

          <div className="maintenance-overview">
            <div className="maintenance-donut-card">
              <div className="maintenance-donut-wrap">
                <svg viewBox="0 0 220 220" className="maintenance-donut-chart" aria-hidden="true">
                  <circle cx="110" cy="110" r="84" fill="none" stroke="#e2e8f0" strokeWidth="26" />
                  {maintenanceChartSegments.map((item) => (
                    <circle
                      key={item.label}
                      cx="110"
                      cy="110"
                      r={item.radius}
                      fill="none"
                      stroke={item.color}
                      strokeWidth={activeIndex === item.index ? 34 : 28}
                      strokeDasharray={item.strokeDasharray}
                      strokeDashoffset={item.strokeDashoffset}
                      strokeLinecap="round"
                      className="maintenance-donut-segment"
                      style={{
                        filter: activeIndex === item.index ? `drop-shadow(0 10px 18px ${item.color}55)` : 'none',
                        transform: activeIndex === item.index ? 'scale(1.04)' : 'scale(1)',
                        transformOrigin: '110px 110px',
                      }}
                      onMouseEnter={() => setActiveIndex(item.index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    />
                  ))}
                </svg>

                <div className="maintenance-donut-center">
                  <div className="maintenance-donut-center__label">{activeItem ? activeItem.name : 'Lệnh bảo trì'}</div>
                  <div className="maintenance-donut-center__meta">
                    {activeItem && totalMaintenance > 0 ? `${percent}% Tổng` : 'Tổng số'}
                  </div>
                  <div
                    className="maintenance-donut-center__value"
                    style={{ color: activeItem?.color || '#2563eb' }}
                  >
                    {formatNumber(activeItem?.value ?? totalMaintenance)}
                  </div>
                </div>
              </div>

              <div className="maintenance-donut-copy">
                <div className="maintenance-donut-copy__title">Cấu trúc theo nhóm thống kê</div>
                <div className="maintenance-donut-copy__text">Biểu đồ tròn tổng hợp các nhóm lệnh bảo trì nhiều nhất</div>
              </div>
            </div>

            <div className="maintenance-legend-grid">
              {maintenanceChartData.map((item, index) => {
                const cardTint = MAINTENANCE_CARD_TINTS[index % MAINTENANCE_CARD_TINTS.length]
                const itemPercent = totalMaintenance > 0 ? Math.round((item.value / totalMaintenance) * 100) : 0

                return (
                  <div
                    key={item.name}
                    className="maintenance-legend-card"
                    style={{
                      border: `1px solid ${cardTint.borderColor}`,
                      background: cardTint.background,
                      boxShadow: activeIndex === index ? `0 14px 28px ${item.color}1F` : 'none',
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <div className="maintenance-legend-card__header">
                      <div className="maintenance-legend-card__identity">
                        <span className="maintenance-legend-card__dot" style={{ backgroundColor: item.color }} />
                        <div>
                          <div className="maintenance-legend-card__name">{item.name}</div>
                          <div className="maintenance-legend-card__meta">{itemPercent}% Tổng lệnh</div>
                        </div>
                      </div>
                      <div className="maintenance-legend-card__value" style={{ color: item.color }}>
                        {formatNumber(item.value)}
                      </div>
                    </div>

                    <div className="maintenance-legend-card__track">
                      <div
                        className="maintenance-legend-card__bar"
                        style={{
                          width: `${Math.max((item.value / highestMaintenanceTotal) * 100, 10)}%`,
                          background: `linear-gradient(90deg, ${item.color}, ${item.color}CC)`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {maintenanceChartData.length === 0 && <p className="dashboard-empty">Chưa có dữ liệu bảo trì.</p>}
          </div>
        </section>

        <section className="dashboard-panel dashboard-panel--ticket-type">
          <div className="dashboard-panel__header">
            <div>
              <h2 className="dashboard-panel__title">Loại Ticket</h2>
              <p className="dashboard-panel__caption">Thống kê loại Ticket</p>
            </div>
          </div>
          <div className="chart-container chart-container--bar">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ticketTypeChartData} margin={{ top: 8, right: 8, left: -24, bottom: 4 }}>
                <defs>
                  <linearGradient id="ticketTypeMaintenance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="ticketTypeSupport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                  <linearGradient id="ticketTypeOther" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e6eef8" strokeDasharray="4 4" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#54708d', fontSize: 11 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#7a93ab', fontSize: 11 }} />
                <Tooltip formatter={(value) => `${value} ticket`} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                <Bar dataKey="value" radius={[14, 14, 4, 4]} maxBarSize={52}>
                  {ticketTypeChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {ticketTypeChartData.length === 0 && <p className="dashboard-empty">Chua co du lieu loai ticket.</p>}
          </div>
        </section>

        <section className="dashboard-panel dashboard-panel--factory">
          <div className="dashboard-panel__header">
            <div>
              <h2 className="dashboard-panel__title">Thống kê theo nhà máy</h2>
              <p className="dashboard-panel__caption">Thống kê số lượng theo nhà máy</p>
            </div>
          </div>
          <div className="chart-container chart-container--bar chart-container--bar-factory">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={factoryChartData} margin={{ top: 8, right: 8, left: -8, bottom: 28 }}>
                <defs>
                  <linearGradient id="factoryBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e6eef8" strokeDasharray="4 4" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#54708d', fontSize: 10 }}
                  interval={0}
                  angle={-8}
                  textAnchor="end"
                  height={42}
                />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#7a93ab', fontSize: 11 }} />
                <Tooltip formatter={(value) => `${value} ticket`} cursor={{ fill: 'rgba(124, 58, 237, 0.08)' }} />
                <Bar dataKey="value" radius={[14, 14, 4, 4]} maxBarSize={44}>
                  {factoryChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {factoryChartData.length === 0 && <p className="dashboard-empty">Chua co du lieu nha may.</p>}
          </div>
        </section>
      </div>

      <section className="dashboard-panel">
        <div className="dashboard-panel__header">
          <div>
            <h2 className="dashboard-panel__title">Ticket gần đây</h2>
          </div>
        </div>

        <div className="ticket-table">
          <div className="ticket-table__head">
            <span>Mã Ticket</span>
            <span>Equipment</span>
            <span>Khu vực</span>
            <span>Loại bảo trì</span>
            <span>Số order</span>
            <span>Nhà máy</span>
            <span>Ngày xử lý</span>
            <span>Trạng thái</span>
          </div>

          <div className="ticket-table__body">
            {recentTickets.map((ticket) => (
              <article key={ticket.id} className="ticket-row">
                <div>
                  <strong>{formatTicketCode(ticket)}</strong>
                  <p>{ticket.title || 'Chua co tieu de'}</p>
                </div>
                <span>{getDashboardEquipment(ticket)}</span>
                <span>{getDashboardArea(ticket)}</span>
                <span>{getDashboardMaintenanceType(ticket)}</span>
                <span>{getOrderCodeDisplay(ticket)}</span>
                <span>{getDashboardFactory(ticket)}</span>
                <span>{formatDate(ticket.dueDate)}</span>
                <span className={getStatusClass(ticket.status)}>{getStatusDisplayLabel(ticket.status)}</span>
              </article>
            ))}
            {recentTickets.length === 0 && <div className="dashboard-empty dashboard-empty--table">Chua co ticket de hien thi.</div>}
          </div>
        </div>
      </section>
    </section>
  )
}

export default Dashboard
