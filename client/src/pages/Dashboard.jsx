import { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { getTicketDashboard, getTickets } from '../services/ticketService'
import { formatTicketCode, getTicketTypeLabel } from '../ultils/ticketMeta'
import '../styles/dashboard.css'

function formatDate(dateValue) {
  if (!dateValue) return 'Chua co'

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Khong hop le'

  return date.toLocaleDateString('vi-VN')
}

function getStatusClass(status) {
  const normalized = (status || '').toLowerCase()

  if (normalized === 'submitted') return 'status-pill status-pill--submitted'
  if (normalized === 'inprogress') return 'status-pill status-pill--progress'
  if (normalized === 'done') return 'status-pill status-pill--done'

  return 'status-pill'
}

function getDashboardTicketType(ticket) {
  if (ticket?.categoryType === 'Maintenance') return 'Lenh bao tri'
  if (ticket?.categoryType === 'Support') return 'Ho tro CNTT'
  return getTicketTypeLabel(ticket)
}

function getDashboardMaintenanceType(ticket) {
  if (ticket?.categoryType !== 'Maintenance') return 'Khong ap dung'
  if (ticket?.maintenanceTypeCode && ticket?.maintenanceTypeName) {
    return `${ticket.maintenanceTypeCode} - ${ticket.maintenanceTypeName}`
  }
  return ticket?.maintenanceTypeName || 'Chua co loai bao tri'
}

function getDashboardFactory(ticket) {
  if (ticket?.factoryCode && ticket?.factoryName) {
    return `${ticket.factoryCode} - ${ticket.factoryName}`
  }
  return ticket?.factoryName || 'Chua co nha may'
}

function Dashboard() {
  const [tickets, setTickets] = useState([])
  const [dashboard, setDashboard] = useState({ total: 0, today: 0, byStatus: [] })
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [ticketData, dashboardData] = await Promise.all([getTickets(), getTicketDashboard()])
        setTickets(Array.isArray(ticketData) ? ticketData : [])
        setDashboard(dashboardData || { total: 0, today: 0, byStatus: [] })
      } catch {
        setError('Khong the tai du lieu tu he thong ticket.')
        setTickets([])
        setDashboard({ total: 0, today: 0, byStatus: [] })
      }
    }

    loadData()
  }, [])

  const statusLookup = useMemo(() => {
    const lookup = new Map()
    ;(dashboard.byStatus || []).forEach((item) => {
      lookup.set(Number(item.statusId), Number(item.count) || 0)
      lookup.set(String(item.statusName || '').toLowerCase(), Number(item.count) || 0)
    })
    return lookup
  }, [dashboard.byStatus])

  const stats = useMemo(() => {
    const done = statusLookup.get(1) ?? statusLookup.get('done') ?? 0
    const inProgress = statusLookup.get(2) ?? statusLookup.get('inprogress') ?? 0
    const submitted = statusLookup.get(3) ?? statusLookup.get('submitted') ?? 0

    return [
      { label: 'Tổng yêu cầu', value: Number(dashboard.total) || tickets.length, tone: 'total' },
      { label: 'Hoàn ', value: done, tone: 'done' },
      { label: 'InProgress', value: inProgress, tone: 'progress' },
      { label: 'Submitted', value: submitted, tone: 'submitted' },
    ]
  }, [dashboard.total, statusLookup, tickets.length])

  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6)
  }, [tickets])

  const ticketTypeChartData = useMemo(() => {
    const grouped = tickets.reduce(
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
  }, [tickets])

  const factoryChartData = useMemo(() => {
    const grouped = tickets.reduce((accumulator, ticket) => {
      const key = ticket.factoryCode && ticket.factoryName ? `${ticket.factoryCode} - ${ticket.factoryName}` : ticket.factoryName || 'Chua co nha may'
      accumulator[key] = (accumulator[key] || 0) + 1
      return accumulator
    }, {})

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value, fill: 'url(#factoryBarGradient)' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [tickets])

  const maintenanceChartData = useMemo(() => {
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#6366f1']
    const grouped = tickets.reduce((accumulator, ticket) => {
      const isMaintenance = ticket.categoryType === 'Maintenance'
      if (!isMaintenance) return accumulator

      const code = ticket.maintenanceTypeCode || 'N/A'
      const name = ticket.maintenanceTypeName || 'Chua phan loai'
      const key = `${code}|${name}`
      accumulator[key] = (accumulator[key] || 0) + 1
      return accumulator
    }, {})

    return Object.entries(grouped).map(([key, value], index) => {
      const [code, name] = key.split('|')
      return {
        name: code && code !== 'N/A' ? `${code} - ${name}` : name,
        value,
        color: colors[index % colors.length],
      }
    })
  }, [tickets])

  const totalMaintenance = maintenanceChartData.reduce((sum, item) => sum + item.value, 0)
  const activeItem = activeIndex !== null ? maintenanceChartData[activeIndex] : null
  const percent = activeItem && totalMaintenance > 0 ? Math.round((activeItem.value / totalMaintenance) * 100) : 100

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
            <strong className="dashboard-card__value">{item.value}</strong>
          </article>
        ))}
      </div>

      <div className="dashboard-chart-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <h2 className="dashboard-panel__title">Thống kê loại bảo trì</h2>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={maintenanceChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  paddingAngle={3}
                  cornerRadius={10}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {maintenanceChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>

                <text x="50%" y="40%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 14, fill: '#64748b' }}>
                  {activeItem ? activeItem.name : 'Tổng số'}
                </text>

                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 14, fill: '#94a3b8' }}>
                  {activeItem && totalMaintenance > 0 ? `${percent}%` : ''}
                </text>

                <text
                  x="50%"
                  y="62%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: 32,
                    fontWeight: 'bold',
                    fill: activeItem ? activeItem.color : '#2563eb',
                  }}
                >
                  {activeItem ? activeItem.value : totalMaintenance}
                </text>

                <Tooltip formatter={(value) => `${value} ticket`} />
              </PieChart>
            </ResponsiveContainer>
            {maintenanceChartData.length === 0 && <p className="dashboard-empty">Chua co du lieu loai bao tri.</p>}
          </div>
        </section>

        <section className="dashboard-panel">
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
        <section className="dashboard-panel">
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
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#54708d', fontSize: 10 }} interval={0} angle={-8} textAnchor="end" height={42} />
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
            <span>Ma Ticket</span>
            <span>Loai ticket</span>
            <span>Loai bao tri</span>
            <span>Nha may</span>
            <span>Ngay xu ly</span>
            <span>Trang thai</span>
          </div>

          <div className="ticket-table__body">
            {recentTickets.map((ticket) => (
              <article key={ticket.id} className="ticket-row">
                <div>
                  <strong>{formatTicketCode(ticket)}</strong>
                  <p>{ticket.title || 'Chua co tieu de'}</p>
                </div>
                <span>{getDashboardTicketType(ticket)}</span>
                <span>{getDashboardMaintenanceType(ticket)}</span>
                <span>{getDashboardFactory(ticket)}</span>
                <span>{formatDate(ticket.dueDate)}</span>
                <span className={getStatusClass(ticket.status)}>{ticket.status || 'Unknown'}</span>
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
