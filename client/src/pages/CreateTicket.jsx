import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { buildApiUrl } from '../services/api'
import { createTicket } from '../services/ticketService'
import { getMaintenanceTypeDisplay } from '../ultils/ticketMeta'
import '../styles/form.css'

const initialForm = {
  type: 'Maintenance',
  factoryId: '',
  maintenanceTypeId: '',
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

  useEffect(() => {
    fetch(buildApiUrl('/api/categories'))
      .then((res) => res.json())
      .then((data) => {
        setAllCategories(Array.isArray(data) ? data : [])
      })
      .catch((err) => console.error('Error fetching categories:', err))
  }, [])

  useEffect(() => {
    fetch(buildApiUrl('/api/MaintenanceTypes'))
      .then((res) => res.json())
      .then((data) => setMaintenanceTypes(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error fetching maintenance types:', err))
  }, [])

  const filteredCategories = allCategories.filter((cat) =>
    isMaintenance ? cat.type === 'Maintenance' : cat.type === 'Support',
  )

  useEffect(() => {
    fetch(buildApiUrl('/api/Tickets/factories'))
      .then((res) => res.json())
      .then((data) => {
        setFactories(Array.isArray(data) ? data : [])
      })
      .catch((err) => console.error('Error fetching factories:', err))
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setErrorMessage('')

    if (name === 'type') {
      setForm((prev) => ({
        ...prev,
        type: value,
        categoryId: '',
      }))
      return
    }

    setForm((prev) => ({
      ...prev,
      [name]: ['categoryId', 'factoryId'].includes(name) ? (value ? Number(value) : '') : value,
    }))
  }

  const buildPayload = () => {
    if (!user?.id) {
      setErrorMessage('Khong tim thay thong tin nguoi dung')
      return null
    }

    if (!form.categoryId) {
      setErrorMessage('Vui long chon linh vuc')
      return null
    }

    if (!form.factoryId) {
      setErrorMessage('Vui long chon nha may')
      return null
    }

    if (!form.description?.trim()) {
      setErrorMessage('Vui long nhap mo ta')
      return null
    }

    if (isMaintenance) {
      if (!form.maintenanceTypeId) {
        setErrorMessage('Vui long chon loai bao tri')
        return null
      }
      if (!form.area?.trim()) {
        setErrorMessage('Vui long nhap Equipment')
        return null
      }
      if (!form.equipmentCode?.trim()) {
        setErrorMessage('Vui lòng nhập Khu vực')
        return null
      }
      if (!form.assignedTeam?.trim()) {
        setErrorMessage('Vui long nhap Tổ bảo trì')
        return null
      }
    } else if (!form.title?.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề cho ticket hỗ trợ CNTT')
      return null
    }

    let title = form.title
    if (isMaintenance && !title?.trim()) {
      const parts = []
      if (form.area?.trim()) parts.push(form.area.trim())
      if (form.equipmentCode?.trim()) parts.push(form.equipmentCode.trim())
      title = parts.length > 0 ? `Bao tri: ${parts.join(' - ')}` : 'Bao tri thiet bi'
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
      alert('Tao ticket thanh cong!')
      setForm(initialForm)
    } catch (error) {
      console.error('Submit error:', error)
      setErrorMessage(error.message || 'Loi khi tao ticket. Vui long thu lai.')
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
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <label>Nhà máy</label>
          <select name="factoryId" value={form.factoryId || ''} onChange={handleChange}>
            <option value="">Chọn nhà máy</option>
            {factories.map((factory) => (
              <option key={factory.id} value={factory.id}>
                {factory.name}
              </option>
            ))}
          </select>

          {isMaintenance && (
            <>
              <label>Loại bảo trì</label>
              <select name="maintenanceTypeId" value={form.maintenanceTypeId} onChange={handleChange}>
                <option value="">Chọn loại bảo trì</option>
                {maintenanceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {getMaintenanceTypeDisplay(type)}
                  </option>
                ))}
              </select>
            </>
          )}

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
          {isMaintenance && (
            <input name="assignedTeam" value={form.assignedTeam} onChange={handleChange} placeholder="Tổ bảo trì" />
          )}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả...BTSC hỏng thiết bị ..."
            rows="4"
          />
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
