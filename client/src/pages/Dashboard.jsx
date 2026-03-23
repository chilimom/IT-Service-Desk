import { useEffect, useMemo, useState } from 'react'
import { getTicketDashboard, getTickets } from '../services/ticketService'
import { formatTicketCode, getTicketTypeLabel } from '../ultils/ticketMeta'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import '../styles/dashboard.css'

function formatDate(dateValue) {
  if (!dateValue) return 'Chua co'

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Không hợp lệ'

  return date.toLocaleDateString('vi-VN')
}

function getStatusClass(status) {
  const normalized = (status || '').toLowerCase()

  if (normalized === 'submitted') return 'status-pill status-pill--submitted'
  if (normalized === 'inprogress') return 'status-pill status-pill--progress'
  if (normalized === 'done') return 'status-pill status-pill--done'

  return 'status-pill'
}

function Dashboard() {
  const [tickets, setTickets] = useState([])
  const [dashboard, setDashboard] = useState({ total: 0, today: 0, byStatus: [] })
  const [error, setError] = useState('')

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
//   // thêm ở trên component
// const [activeIndex, setActiveIndex] = useState(null)

// // tính tổng
// const total = tickets.length

// // item đang hover
// const activeItem = activeIndex !== null ? chartData[activeIndex] : null

// const percent = activeItem
//   ? Math.round((activeItem.value / total) * 100)
//   : 100
  const stats = useMemo(() => {
    const total = tickets.length
    const done = tickets.filter((t) => (t.status || '').toLowerCase() === 'done').length
    const inProgress = tickets.filter(
    (t) => (t.status || '').toLowerCase() === 'inprogress'
  ).length

  const submitted = tickets.filter(
    (t) => (t.status || '').toLowerCase() === 'submitted'
  ).length

    return [
    { label: 'Tổng Ticket', value: total },
    { label: 'Done', value: done },
    { label: 'InProgress', value: inProgress },
    { label: 'Submitted', value: submitted },
  ]
  }, [tickets])

  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6)
  }, [tickets])

  const topAreas = useMemo(() => {
    const grouped = tickets.reduce((accumulator, ticket) => {
      const key = ticket.area || 'Chua gan khu vuc'
      accumulator[key] = (accumulator[key] || 0) + 1
      return accumulator
    }, {})

    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
  }, [tickets])


  // 1. state trước
const [activeIndex, setActiveIndex] = useState(null)

  const chartData = useMemo(() => {
  const done = tickets.filter(
    (t) => (t.status || '').toLowerCase() === 'done'
  ).length

  const inProgress = tickets.filter(
    (t) => (t.status || '').toLowerCase() === 'inprogress'
  ).length

  const submitted = tickets.filter(
    (t) => (t.status || '').toLowerCase() === 'submitted'
  ).length

  return [
    { name: 'Done', value: done, color: '#10b981' },       // xanh lá
  { name: 'InProgress', value: inProgress, color: '#3b82f6' }, // xanh dương
  { name: 'Submitted', value: submitted, color: '#f97316' },   // cam
  ]
}, [tickets])

// 3. rồi mới dùng chartData
const total = tickets.length

const activeItem =
  activeIndex !== null ? chartData[activeIndex] : null

const percent = activeItem
  ? Math.round((activeItem.value / total) * 100)
  : 100

  return (
    <section className="dashboard-page">
      <div className="dashboard-page__hero">
        <div>
          <p className="dashboard-page__eyebrow">IT Service Desk</p>
          <h1 className="dashboard-page__title">Tổng quan hệ thống Ticket</h1>
          {/* <p className="dashboard-page__subtitle">
            Giao dien nay dang bam theo backend hien co: Tickets, TicketLogs va Users. Dashboard uu tien cac truong nghiep vu quan trong nhu status, area, assigned team, due date va ma thiet bi.
          </p> */}
        </div>
      </div>

      {error && <div className="dashboard-alert">{error}</div>}

      <div className="dashboard-stats">
        {stats.map((item) => (
          <article key={item.label} className="dashboard-card">
            <span className="dashboard-card__label">{item.label}</span>
            <strong className="dashboard-card__value">{item.value}</strong>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <h2 className="dashboard-panel__title">Trạng thái xử lý</h2>
            </div>
          </div>
          <div className="chart-container">
  <ResponsiveContainer width="100%" height={320}>
    <PieChart>
      <Pie
        data={chartData}
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
        {chartData.map((entry, index) => (
          <Cell key={index} fill={entry.color} />
        ))}
      </Pie>

      {/* TEXT Ở GIỮA */}
      <text
        x="50%"
        y="40%"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: 14, fill: '#64748b' }}
      >
        {activeItem ? activeItem.name : 'Tổng số'}
      </text>

      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: 14, fill: '#94a3b8' }}
      >
        {activeItem ? `${percent}%` : ''}
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
        {activeItem ? activeItem.value : total}
      </text>

      <Tooltip formatter={(value) => `${value} ticket`} />
    </PieChart>
  </ResponsiveContainer>
</div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <h2 className="dashboard-panel__title">Khu vuc nhieu ticket</h2>
              <p className="dashboard-panel__caption">Tong hop tu truong `Area`</p>
            </div>
          </div>
          <div className="area-list">
            {topAreas.map(([area, count]) => (
              <div key={area} className="area-list__item">
                <span>{area}</span>
                <strong>{count}</strong>
              </div>
            ))}
            {topAreas.length === 0 && <p className="dashboard-empty">Chua co du lieu khu vuc.</p>}
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
            <span>Loại</span>
            <span>Thiết bị / Khu vực</span>
            <span>Đội xử lý</span>
            <span>Hạn xử lý</span>
            <span>Trạng thái</span>
          </div>

          <div className="ticket-table__body">
            {recentTickets.map((ticket) => (
              <article key={ticket.id} className="ticket-row">
                <div>
                  <strong>{formatTicketCode(ticket)}</strong>
                  <p>{ticket.title || 'Chua co tieu de'}</p>
                </div>
                <span>{getTicketTypeLabel(ticket)}</span>
                <span>{ticket.equipmentCode || 'N/A'} / {ticket.area || 'Chua co khu vuc'}</span>
                <span>{ticket.assignedTeam || 'Chua phan cong'}</span>
                <span>{formatDate(ticket.dueDate)}</span>
                <span className={getStatusClass(ticket.status)}>{ticket.status || 'Unknown'}</span>
              </article>
            ))}
            {recentTickets.length === 0 && (
              <div className="dashboard-empty dashboard-empty--table">Chua co ticket de hien thi.</div>
            )}
          </div>
        </div>
      </section>
    </section>
  )
}

export default Dashboard
