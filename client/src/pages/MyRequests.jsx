// import { useEffect, useMemo, useState } from 'react'
// import { FiEdit2, FiEye } from 'react-icons/fi'
// import { Link } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import { getTickets } from '../services/ticketService'
// import path from '../ultils/path'
// import { factoryOptions, formatTicketCode, getFactoryLabel, getOrderCodeDisplay, getTicketTypeLabel } from '../ultils/ticketMeta'
// import '../styles/requests.css'

// function formatDate(value) {
//   if (!value) return 'Chua co'
//   const date = new Date(value)
//   if (Number.isNaN(date.getTime())) return 'Khong hop le'
//   return date.toLocaleString('vi-VN')
// }

// function getStatusClass(status) {
//   const normalized = (status || '').toLowerCase()
//   if (normalized === 'submitted') return 'status-pill status-pill--submitted'
//   if (normalized === 'inprogress') return 'status-pill status-pill--progress'
//   if (normalized === 'done') return 'status-pill status-pill--done'
//   return 'status-pill'
// }

// function MyRequests() {
//   const { user } = useAuth()
//   const [tickets, setTickets] = useState([])
//   const [statusFilter, setStatusFilter] = useState('ALL')
//   const [typeFilter, setTypeFilter] = useState('ALL')
//   const [factoryFilter, setFactoryFilter] = useState('ALL')
//   const [error, setError] = useState('')

 
//     useEffect(() => {
//   const fetchTickets = async () => {
//     try {
//       const res = await fetch(
//         `http://localhost:5017/api/tickets/my?userId=${user.id}`
//       );

//       const data = await res.json();

//       console.log("DATA:", data);

//       setTickets(data);
//     } catch (err) {
//       console.error("ERROR:", err);
//     }
//   };

//   if (user?.id) {
//     fetchTickets();
//   }
// }, [user]);
//       // 🔥 FILTER CHUẨN THEO USER
//       // const ownTickets = Array.isArray(data)
//       //   ? data.filter((ticket) =>
//       //       ticket.requestedBy && user?.id
//       //         ? Number(ticket.requestedBy) === Number(user.id)
//       //         : false
//       //     )
//       //   : []
//   //     const ownTickets = Array.isArray(data)
//   // ? data.filter((ticket) =>
//   //     ticket.requestedByName &&
//   //     user?.username &&
//   //     ticket.requestedByName === user.username
//   //   )
//       // const ownTickets = data.filter(
//       //       t => Number(t.requestedBy) === Number(user.id)
//       //         );  
//       //       []

//       // setTickets(ownTickets)
   
//       // useEffect(() => {
//       //   async function loadTickets() {
//       //      try {
//       //       const data = await getTickets()

//       // // ✅ CHỈ SỬA DÒNG NÀY
//       //       const ownTickets = data

//       //       setTickets(ownTickets)
//       //     } catch {
//       //       setError('Khong the tai danh sach yeu cau da gui.')
//       //       setTickets([])
//       //     }
//       //   }

//       // loadTickets()
//       // }, [user?.id])
//   const filteredTickets = useMemo(() => {
//     return [...tickets]
//       .filter((ticket) => (statusFilter === 'ALL' ? true : ticket.status === statusFilter))
//       .filter((ticket) => (typeFilter === 'ALL' ? true : ticket.loaiTicket === typeFilter))
//       .filter((ticket) => (factoryFilter === 'ALL' ? true : (ticket.factoryName || '') === factoryFilter))
//       .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
//   }, [factoryFilter, statusFilter, tickets, typeFilter])

//   const statuses = useMemo(() => ['ALL', ...new Set(tickets.map((ticket) => ticket.status).filter(Boolean))], [tickets])
//   const types = useMemo(() => ['ALL', ...new Set(tickets.map((ticket) => ticket.loaiTicket).filter(Boolean))], [tickets])
//   const factories = useMemo(() => {
//     const knownFactoryValues = new Set(factoryOptions.map((option) => option.name))
//     tickets.map((ticket) => ticket.factoryName).filter(Boolean).forEach((factory) => knownFactoryValues.add(factory))
//     return ['ALL', ...knownFactoryValues]
//   }, [tickets])

//   const canEditTicket = (ticket) => {
//     const normalizedStatus = (ticket?.status || '').toLowerCase()
//     return normalizedStatus !== 'inprogress' && normalizedStatus !== 'done'
//   }

//   return (
//     <section className="requests-page">
//       <div className="requests-page__hero">
//         <p className="requests-page__eyebrow">Tổng hợp danh sách</p>
//         <h1 className="requests-page__title">Yêu cầu của tôi</h1>
//         <p className="requests-page__subtitle">
//           Trang này chỉ hiển thị các ticket có `RequestedBy` trùng với user đang đăng nhập.
//         </p>
//       </div>

//       {error && <div className="requests-page__alert">{error}</div>}

//       <section className="requests-filters">
//         <label className="requests-filters__field">
//           <span>Lọc theo trạng thái</span>
//           <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
//             {statuses.map((status) => (
//               <option key={status} value={status}>
//                 {status === 'ALL' ? 'Tất cả trạng thái' : status}
//               </option>
//             ))}
//           </select>
//         </label>

//         <label className="requests-filters__field">
//           <span>Lọc theo loại ticket</span>
//           <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
//             {types.map((type) => (
//               <option key={type} value={type}>
//                 {type === 'ALL' ? 'Tất cả loại ticket' : getTicketTypeLabel({ type })}
//               </option>
//             ))}
//           </select>
//         </label>

//         <label className="requests-filters__field">
//           <span>Lọc theo nhà máy</span>
//           <select value={factoryFilter} onChange={(event) => setFactoryFilter(event.target.value)}>
//             {factories.map((factory) => (
//               <option key={factory} value={factory}>
//                 {factory === 'ALL' ? 'Tất cả nhà máy' : getFactoryLabel(factory)}
//               </option>
//             ))}
//           </select>
//         </label>
//       </section>

//       <section className="requests-table">
//         <div className="requests-table__head">
//           <span>Mã Ticket</span>
//           <span>Loại / Mô tả</span>
//           <span>Thiết bị / Khu vực</span>
//           <span>Đội xử lý</span>
//           <span>Số order</span>
//           <span>Thời gian</span>
//           <span>Trạng thái</span>
//           <span>Thao tác</span>
//         </div>

//         <div className="requests-table__body">
//           {filteredTickets.map((ticket) => (
//             <article key={ticket.id} className="requests-row">
//               <div>
//                 <strong>{formatTicketCode(ticket)}</strong>
//                 <p>ID: {ticket.id}</p>
//               </div>
//               <div>
//                 <strong>{getTicketTypeLabel(ticket.LoaiTicket)}</strong>
//                 <p>{ticket.description || ticket.title || 'Chua co mo ta'}</p>
//               </div>
//               <div>
//                 <strong>{ticket.equipmentCode || 'Chua co thiet bi'}</strong>
//                 <p>{getFactoryLabel(ticket.factoryName)} / {ticket.area || 'Chua co khu vuc'}</p>
//               </div>
//               <span>{ticket.assignedTeam || 'Chua phan cong'}</span>
//               <span>{getOrderCodeDisplay(ticket)}</span>
//               <div>
//                 <strong>Tao: {formatDate(ticket.createdAt)}</strong>
//                 <p>Han: {formatDate(ticket.dueDate)}</p>
//               </div>
//               <span className={getStatusClass(ticket.status)}>{ticket.status || 'Unknown'}</span>
//               <Link
//                 className="requests-row__action"
//                 to={`/${path.USER}/${path.USER_TICKETS}/requests/${ticket.id}`}
//                 title={canEditTicket(ticket) ? 'Sua' : 'Xem'}
//                 aria-label={canEditTicket(ticket) ? 'Sua' : 'Xem'}
//                 data-tooltip={canEditTicket(ticket) ? 'Sua' : 'Xem'}
//               >
//                 <span className="sr-only">{canEditTicket(ticket) ? 'Sua' : 'Xem'}</span>
//                 <span className="requests-row__action-icon">
//                   {canEditTicket(ticket) ? <FiEdit2 size={16} /> : <FiEye size={16} />}
//                 </span>
//               </Link>
//             </article>
//           ))}

//           {filteredTickets.length === 0 && <div className="requests-empty">Chua co ticket nao cua ban.</div>}
//         </div>
//       </section>
//     </section>
//   )
// }

// export default MyRequests
import { useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiEye } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import path from '../ultils/path'
import { factoryOptions, formatTicketCode, getFactoryLabel, getOrderCodeDisplay, getTicketTypeLabel, maintenanceOptions } from '../ultils/ticketMeta'
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

function MyRequests() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [factoryFilter, setFactoryFilter] = useState('ALL')
  const [error, setError] = useState('')

  // Fetch tickets của user hiện tại
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        if (!user?.id) return
        
        const response = await fetch(`http://localhost:5017/api/tickets/my?userId=${user.id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch tickets')
        }
        
        const data = await response.json()
        console.log("📋 My tickets:", data)
        
        if (Array.isArray(data)) {
          setTickets(data)
        } else {
          setTickets([])
        }
      } catch (err) {
        console.error("❌ Error fetching tickets:", err)
        setError('Khong the tai danh sach yeu cau da gui.')
        setTickets([])
      }
    }

    fetchTickets()
  }, [user?.id])

  // Lấy tên nhà máy từ factoryId
  const getFactoryName = (factoryId) => {
    const factory = factoryOptions.find(f => f.code === factoryId || f.id === factoryId)
    return factory ? `${factory.code} - ${factory.name}` : factoryId || 'Chua co nha may'
  }

  // Lấy loại bảo trì từ title hoặc description
  const getMaintenanceInfo = (ticket) => {
    if (ticket.categoryType !== 'Maintenance') return null
    
    // Tìm maintenance category từ title
    const maintenanceCode = maintenanceOptions.find(opt => 
      ticket.title?.includes(opt.code)
    )
    
    return maintenanceCode || null
  }

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return [...tickets]
      .filter((ticket) => {
        if (statusFilter === 'ALL') return true
        return (ticket.status || '').toLowerCase() === statusFilter.toLowerCase()
      })
      .filter((ticket) => {
        if (typeFilter === 'ALL') return true
        const ticketType = ticket.categoryType === 'Maintenance' ? 'Maintenance' : 'IT'
        return ticketType === typeFilter
      })
      .filter((ticket) => {
        if (factoryFilter === 'ALL') return true
        const factoryName = getFactoryName(ticket.factoryId)
        return factoryName === factoryFilter
      })
      .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
  }, [factoryFilter, statusFilter, tickets, typeFilter])

  // Lấy danh sách các giá trị filter
  const statuses = useMemo(() => {
    return ['ALL', ...new Set(tickets.map((ticket) => ticket.status).filter(Boolean))]
  }, [tickets])

  const types = useMemo(() => {
    const typeList = ['ALL']
    const hasMaintenance = tickets.some(t => t.categoryType === 'Maintenance')
    const hasIT = tickets.some(t => t.categoryType === 'IT' || t.categoryType === 'Support')
    
    if (hasMaintenance) typeList.push('Maintenance')
    if (hasIT) typeList.push('IT')
    
    return typeList
  }, [tickets])

  const factories = useMemo(() => {
    const factorySet = new Set(['ALL'])
    tickets.forEach(ticket => {
      const factoryName = getFactoryName(ticket.factoryId)
      if (factoryName) factorySet.add(factoryName)
    })
    return Array.from(factorySet)
  }, [tickets])

  const canEditTicket = (ticket) => {
    const normalizedStatus = (ticket?.status || '').toLowerCase()
    return normalizedStatus === 'submitted'
  }

  const getTicketType = (ticket) => {
    return ticket.categoryType === 'Maintenance' ? 'Maintenance' : 'IT'
  }

  return (
    <section className="requests-page">
      <div className="requests-page__hero">
        <p className="requests-page__eyebrow">Tổng hợp danh sách</p>
        <h1 className="requests-page__title">Yêu cầu của tôi</h1>
        <p className="requests-page__subtitle">
          Trang này hiển thị các ticket bạn đã tạo.
        </p>
      </div>

      {error && <div className="requests-page__alert">{error}</div>}

      <section className="requests-filters">
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
          <span>Lọc theo loại ticket</span>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            {types.map((type) => (
              <option key={type} value={type}>
                {type === 'ALL' ? 'Tất cả loại ticket' : type === 'Maintenance' ? 'Lệnh bảo trì' : 'Hỗ trợ CNTT'}
              </option>
            ))}
          </select>
        </label>

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
      </section>

      <section className="requests-table">
        <div className="requests-table__head">
          <span>Mã Ticket</span>
          <span>Loại / Mô tả</span>
          <span>Thiết bị / Khu vực / Nhà máy</span>
          <span>Đội xử lý</span>
          <span>Số order</span>
          <span>Thời gian</span>
          <span>Trạng thái</span>
          <span>Thao tác</span>
        </div>

        <div className="requests-table__body">
          {filteredTickets.map((ticket) => {
            const maintenanceInfo = getMaintenanceInfo(ticket)
            const isMaintenance = ticket.categoryType === 'Maintenance'
            const factoryName = getFactoryName(ticket.factoryId)
            
            return (
              <article key={ticket.id} className="requests-row">
                <div>
                  <strong>{formatTicketCode(ticket)}</strong>
                  <p>ID: {ticket.id}</p>
                </div>
                <div>
                  <strong>{isMaintenance ? 'Lệnh bảo trì' : 'Hỗ trợ CNTT'}</strong>
                  <p>{ticket.title || ticket.description || 'Chua co mo ta'}</p>
                  {maintenanceInfo && (
                    <small style={{ fontSize: '0.75rem', color: '#666' }}>
                      Loại bảo trì: {maintenanceInfo.code} - {maintenanceInfo.name}
                    </small>
                  )}
                  {ticket.categoryName && !isMaintenance && (
                    <small style={{ fontSize: '0.75rem', color: '#666' }}>
                      Lĩnh vực: {ticket.categoryName}
                    </small>
                  )}
                </div>
                <div>
                  <strong>{ticket.equipmentCode || 'Chua co thiet bi'}</strong>
                  <p>Khu vực: {ticket.area || 'Chua co khu vuc'}</p>
                  <small style={{ fontSize: '0.75rem', color: '#666' }}>
                    Nhà máy: {factoryName}
                  </small>
                </div>
                <span>{ticket.assignedTeam || 'Chua phan cong'}</span>
                <span>{getOrderCodeDisplay(ticket)}</span>
                <div>
                  <strong>Tạo: {formatDate(ticket.createdAt)}</strong>
                  <p>Hạn: {formatDate(ticket.dueDate)}</p>
                </div>
                <span className={getStatusClass(ticket.status)}>{ticket.status || 'Unknown'}</span>
                <Link
                  className="requests-row__action"
                  to={`/${path.USER}/${path.USER_TICKETS}/requests/${ticket.id}`}
                  title={canEditTicket(ticket) ? 'Sửa' : 'Xem'}
                  aria-label={canEditTicket(ticket) ? 'Sửa' : 'Xem'}
                  data-tooltip={canEditTicket(ticket) ? 'Sửa' : 'Xem'}
                >
                  <span className="sr-only">{canEditTicket(ticket) ? 'Sửa' : 'Xem'}</span>
                  <span className="requests-row__action-icon">
                    {canEditTicket(ticket) ? <FiEdit2 size={16} /> : <FiEye size={16} />}
                  </span>
                </Link>
              </article>
            )
          })}

          {filteredTickets.length === 0 && (
            <div className="requests-empty">
              {error ? error : 'Chưa có ticket nào của bạn.'}
            </div>
          )}
        </div>
      </section>
    </section>
  )
}

export default MyRequests