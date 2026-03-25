import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createTicket } from '../services/ticketService'
import {  maintenanceOptions } from '../ultils/ticketMeta'
import '../styles/form.css'

const initialForm = {
  type: 'Maintenance',
  factoryId: '',
  maintenanceCategory: 'PM01',
  title: '',
  description: '',
  equipmentCode: '',
  area: '',
  assignedTeam: '',
  dueDate: '',
  categoryId: '',// thêm categoryId vào form để lưu giá trị category được chọn

}

function CreateTicket() {
  const { user } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [categories, setCategories] = useState([])// thêm state categories để lưu danh sách category từ server
  const isMaintenance = form.type === 'Maintenance'

  const selectedMaintenance =
  maintenanceOptions.find(
    (item) => item.code === form.maintenanceCategory
  ) || maintenanceOptions[0]
   
   useEffect(() => {
  fetch('http://localhost:5017/api/categories?type=Maintenance')
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setCategories(data)
      } else {
        setCategories([])
      }
     })
    }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setErrorMessage('')
    setForm((prev) => ({
      ...prev,
   // sửa
      [name]: ['categoryId', 'factoryId'].includes(name)
    ? (value ? Number(value) : '')
    : value,
     }))
    } 
    const [factories, setFactories] = useState([])

useEffect(() => {
  fetch("http://localhost:5017/api/Tickets/factories")
    .then(res => res.json())
    .then(data => {
      console.log("FACTORIES:", data)
      setFactories(data)
    })
    .catch(err => console.error(err))
}, [])
  const buildPayload = () => {
    return {
      categoryId: Number(form.categoryId),
    factoryId: form.factoryId ? Number(form.factoryId) : null,
    statusId: null, // backend tự set cũng được
    requestedBy: Number(user?.id),

    // giữ nguyên
    title: form.title || '',
    description: form.description || '',
    equipmentCode: form.equipmentCode || '',
    area: form.area || '',
    assignedTeam: form.assignedTeam || '',
    dueDate: form.dueDate || null,
    }
  }
  
  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!user?.id) {
  alert("Chưa có user")
  return
}
    if (!form.categoryId) {
    alert("Vui lòng chọn danh mục")
  return
}

if (!form.title && form.type === 'Support') {
  alert("Vui lòng nhập tiêu đề")
  return
}

    if (!form.factoryId

    ) {
      setErrorMessage('Vui long chon Nha may truoc khi tao ticket.')
      return
    }

    if (isMaintenance) {
      if (!form.area.trim()) {
        setErrorMessage('Vui long nhap Equipment truoc khi tao lenh bao tri.')
        return
      }

      if (!form.equipmentCode.trim()) {
        setErrorMessage('Vui long nhap Ten thiet bi truoc khi tao lenh bao tri.')
        return
      }

      if (!form.assignedTeam.trim()) {
        setErrorMessage('Vui long nhap Doi xu ly truoc khi tao lenh bao tri.')
        return
      }

      if (!form.description.trim()) {
        setErrorMessage('Vui long nhap Mo ta truoc khi tao lenh bao tri.')
        return
      }
    } else {
      if (!form.title.trim()) {
        setErrorMessage('Vui long nhap Tieu de truoc khi gui ticket ho tro CNTT.')
        return
      }

      if (!form.description.trim()) {
        setErrorMessage('Vui long nhap Mo ta truoc khi gui ticket ho tro CNTT.')
        return
      }
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      await createTicket(buildPayload())
      alert('Tao ticket thanh cong!')
      setForm(initialForm)
    } catch (error) {
      console.error(error)
      alert('Loi tao ticket')
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
  {categories?.map((c) => (
    <option key={c.id} value={c.id}>
      {c.name}
    </option>
  ))}
</select>

          <label>Nhà máy</label>
          {/* <select name="factoryId" value={form.factoryId} onChange={handleChange}>
            <option value="">Chọn nhà máy</option>
            {factories.map((f) => (
              <option key={f.id} value={f.id}>  
                {f.code} - {f.name}
              </option>
            ))}
          </select> */}
          <select
  value={form.factoryId || ""}
  onChange={(e) =>
    setForm({ ...form, factoryId: Number(e.target.value) })
  }
>
  <option value="">Chọn nhà máy</option>

  {factories.map((f) => (
    <option key={f.id} value={f.id}>
      {f.code} - {f.name}
    </option>
  ))}
</select>

          {isMaintenance && (
            <>
              <label>Loại bảo trì</label>
              <select name="maintenanceCategory" value={form.maintenanceCategory} onChange={handleChange}>
                {maintenanceOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} - {option.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <div className="form-note">
            {isMaintenance
              ? 'Loai bao tri se duoc map vao thong tin ticket. So order se do admin cap nhat sau khi xu ly.'
              : 'Ticket ho tro CNTT khong su dung so order va khong bat buoc nhap EQ.'}
          </div>

          {!isMaintenance && (
            <>
              <label>Tieu de ho tro</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Vi du: Loi may in, khong dang nhap duoc..."
              />
            </>
          )}

          {isMaintenance && (
            <>
              <label>Equipment</label>
              <input name="area" value={form.area} onChange={handleChange} />

              <label>Tên thiết bị</label>
              <input name="equipmentCode" value={form.equipmentCode} onChange={handleChange} />
            </>
          )}

          <label>Tổ bảo trì</label>
          <input name="assignedTeam" value={form.assignedTeam} onChange={handleChange} />

          <label>Mô tả</label>
          <textarea name="description" value={form.description} onChange={handleChange} />

          <label>Hạn xử lý</label>
          <input type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange} />

          {errorMessage && <div className="form-error">{errorMessage}</div>}
          

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Dang tao...' : 'Tạo Ticket'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default CreateTicket
