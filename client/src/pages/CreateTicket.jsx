import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createTicket } from '../services/ticketService'
import { factoryOptions, maintenanceOptions } from '../ultils/ticketMeta'
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

  const selectedMaintenance = useMemo(() => {
    return maintenanceOptions.find((item) => item.code === form.maintenanceCategory) ?? maintenanceOptions[0]
  }, [form.maintenanceCategory]) 

    // hàm lấy category từ server khi component mount
  useEffect(() => {
  const typeMap = {
    IT: 'Support',
    Maintenance: 'Maintenance',
  }

  const apiType = typeMap[form.type]

  fetch(`http://localhost:5017/api/categories?type=${apiType}`)  // 👈 SỬA DÒNG NÀY
    .then(res => res.json())
    .then(data => setCategories(data))
}, [form.type])
// useEffect(() => {
//   fetch('http://localhost:5017/api/categories')   // 👈 KHÔNG cần type
//     .then(res => res.json())
//     .then(data => setCategories(data))
// }, [])
  const handleChange = (event) => {
    const { name, value } = event.target
    setErrorMessage('')
    setForm((prev) => ({
      ...prev,
      [name]: name === ['categoryId', 'factoryId'].includes(name) ? Number(value) :value,// sửa
    }))
  }

  const buildPayload = () => {
    return {
      categoryId: form.categoryId,   // 👈 QUAN TRỌNG
      title: form.title || '',
      description: form.description,
      factoryId: form.factoryId || null,
      equipmentCode: form.equipmentCode || '',
      area: form.area || '',
      assignedTeam: form.assignedTeam,
      dueDate: form.dueDate || null,
      requestedBy: user?.id,
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
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
  {categories.map((c) => (
    <option key={c.id} value={c.id}>
      {c.name}
    </option>
  ))}
</select>

          <label>Nhà máy</label>
          <select name="factory" value={form.factoryId} onChange={handleChange}>
            <option value="">Chọn nhà máy</option>
            {factoryOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.code} - {option.name}
              </option>
            ))}
          </select>

          {isMaintenance && (
            <>
              <label>Loại bảo trì</label>
              <select name="maintenanceCategory" value={form.maintenanceCategory} onChange={handleChange}>
                {maintenanceOptions.map((option) => (
                  <option key={option.id} value={option.id}>
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
