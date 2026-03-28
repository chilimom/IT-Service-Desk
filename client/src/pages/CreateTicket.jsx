
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createTicket } from '../services/ticketService'
import { maintenanceOptions } from '../ultils/ticketMeta'
import '../styles/form.css'

const initialForm = {
  type: 'Maintenance',
  factoryId: '',
  maintenanceTypeId: '', // Thay maintenanceCategory
  title: '',
  description: '',
  equipmentCode: '',
  area: '',
  assignedTeam: '',
  dueDate: '',
  categoryId: '',
}

function CreateTicket() {
  const { user } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [allCategories, setAllCategories] = useState([])
  const [factories, setFactories] = useState([])
  const [maintenanceTypes, setMaintenanceTypes] = useState([])
  const isMaintenance = form.type === 'Maintenance'

  // Fetch tất cả categories
  useEffect(() => {
    fetch('http://localhost:5017/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllCategories(data)
        } else {
          setAllCategories([])
        }
      })
      .catch(err => console.error('Error fetching categories:', err))
  }, [])

  // Fetch maintenance types
useEffect(() => {
    fetch('http://localhost:5017/api/MaintenanceTypes')
        .then(res => res.json())
        .then(data => setMaintenanceTypes(data))
        .catch(err => console.error(err))
}, [])
  // Filter categories theo loại ticket
  const filteredCategories = allCategories.filter(cat => 
    isMaintenance ? cat.type === 'Maintenance' : cat.type === 'Support'
  )

  // Fetch factories
  useEffect(() => {
    fetch("http://localhost:5017/api/Tickets/factories")
      .then(res => res.json())
      .then(data => {
        setFactories(data)
      })
      .catch(err => console.error('Error fetching factories:', err))
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setErrorMessage('')
    
    if (name === 'type') {
      setForm((prev) => ({
        ...prev,
        type: value,
        categoryId: '', // Reset category khi đổi loại ticket
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: ['categoryId', 'factoryId'].includes(name)
          ? (value ? Number(value) : '')
          : value,
      }))
    }
  }

  const buildPayload = () => {
    if (!user?.id) {
      setErrorMessage("Không tìm thấy thông tin người dùng")
      return null
    }

    if (!form.categoryId) {
      setErrorMessage("Vui lòng chọn lĩnh vực")
      return null
    }

    if (!form.factoryId) {
      setErrorMessage("Vui lòng chọn nhà máy")
      return null
    }

    if (!form.description?.trim()) {
      setErrorMessage("Vui lòng nhập mô tả")
      return null
    }

    if (isMaintenance) {
      if (!form.maintenanceTypeId) {
        setErrorMessage('Vui long chon loai bao tri')
        return null
      }
      if (!form.area?.trim()) {
        setErrorMessage('Vui lòng nhập Equipment')
        return null
      }
      if (!form.equipmentCode?.trim()) {
        setErrorMessage('Vui lòng nhập Tên thiết bị')
        return null
      }
      if (!form.assignedTeam?.trim()) {
        setErrorMessage('Vui lòng nhập Tổ bảo trì')
        return null
      }
    } else {
      if (!form.title?.trim()) {
        setErrorMessage('Vui lòng nhập Tiêu đề hỗ trợ')
        return null
      }
    }

    let title = form.title
    if (isMaintenance && !title?.trim()) {
      const parts = []
      if (form.equipmentCode?.trim()) parts.push(form.equipmentCode.trim())
      if (form.area?.trim()) parts.push(form.area.trim())
      title = parts.length > 0 ? `Bảo trì: ${parts.join(' - ')}` : "Bảo trì thiết bị"
    }

    return {
      categoryId: Number(form.categoryId),
      factoryId: Number(form.factoryId),
      requestedBy: Number(user.id),
      description: form.description.trim(),
      title: title?.trim() || null,
      maintenanceTypeId: isMaintenance && form.maintenanceTypeId ? Number(form.maintenanceTypeId) : null,
      equipmentCode: form.equipmentCode?.trim() || null,
      area: form.area?.trim() || null,
      assignedTeam: form.assignedTeam?.trim() || null,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      statusId: 3,
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = buildPayload()
    if (!payload) return

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      await createTicket(payload)
      alert('Tạo ticket thành công!')
      setForm(initialForm)
    } catch (error) {
      console.error('Submit error:', error)
      setErrorMessage(error.message || 'Lỗi khi tạo ticket. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="create-ticket-page">
      <div className="form-container">
        <h2>Tạo Ticket</h2>
        <form onSubmit={handleSubmit}>
          <label>Loại Ticket</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="Maintenance">Tạo Lệnh bảo trì</option>
            <option value="IT">Hỗ trợ CNTT</option>
          </select>

          <label>Lĩnh vực</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange}>
            <option value="">Chọn danh mục</option>
            {filteredCategories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label>Nhà máy</label>
          <select name="factoryId" value={form.factoryId || ""} onChange={handleChange}>
            <option value="">Chọn nhà máy</option>
            {factories.map(f => (
              <option key={f.id} value={f.id}>{f.code} - {f.name}</option>
            ))}
          </select>

          {isMaintenance && (
            <>
              {/* <label>Loại bảo trì</label>
              <select name="maintenanceCategory" value={form.maintenanceCategory} onChange={handleChange}>
                {maintenanceOptions.map(option => (
                  <option key={option.code} value={option.code}>
                    {option.code} - {option.name}
                  </option>
                ))}
              </select> */}
              <label>Loại bảo trì</label>
        <select name="maintenanceTypeId" value={form.maintenanceTypeId} onChange={handleChange}>
            <option value="">Chọn loại bảo trì</option>
            {maintenanceTypes.map(type => (
                <option key={type.id} value={type.id}>
                    {type.code} - {type.name}
                </option>
            ))}
        </select>
            </>
          )}

          {/* <div className="form-note">
            {isMaintenance
              ? 'Loại bảo trì sẽ được map vào thông tin ticket. Số order sẽ do admin cập nhật sau khi xử lý.'
              : 'Ticket hỗ trợ CNTT không sử dụng số order và không bắt buộc nhập EQ.'}
          </div> */}

          {!isMaintenance && (
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ví dụ: Lỗi máy in, không đăng nhập được..."
            />
          )}

          {isMaintenance && (
            <>
              <input name="area" value={form.area} onChange={handleChange} placeholder="Equipment" />
              <input name="equipmentCode" value={form.equipmentCode} onChange={handleChange} placeholder="Khu vực" />
            </>
          )}

          <input name="assignedTeam" value={form.assignedTeam} onChange={handleChange} placeholder="Tổ bảo trì" />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả...Kiểm tra  bơm chất chuẩn định kỳ OK 53" rows="4" />
          <input type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange} />

          {errorMessage && <div className="form-error">{errorMessage}</div>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang tạo...' : 'Tạo Ticket'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default CreateTicket
