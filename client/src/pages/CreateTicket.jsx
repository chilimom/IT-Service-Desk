import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createTicket } from '../services/ticketService'
import { maintenanceOptions } from '../ultils/ticketMeta'
import '../styles/form.css'

const initialForm = {
  type: 'Maintenance',
  maintenanceCategory: 'PM01',
  title: '',
  description: '',
  equipmentCode: '',
  area: '',
  assignedTeam: '',
  dueDate: '',
}

function CreateTicket() {
  const { user } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const isMaintenance = form.type === 'Maintenance'

  const selectedMaintenance = useMemo(() => {
    return maintenanceOptions.find((item) => item.code === form.maintenanceCategory) ?? maintenanceOptions[0]
  }, [form.maintenanceCategory])

  const handleChange = (event) => {
    const { name, value } = event.target
    setErrorMessage('')
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const buildPayload = () => {
    const description = form.description?.trim() || ''

    if (!isMaintenance) {
      return {
        type: 'IT',
        title: form.title?.trim() || 'Ho tro CNTT',
        description,
        equipmentCode: '',
        area: '',
        assignedTeam: form.assignedTeam,
        dueDate: form.dueDate || null,
        requestedBy: user?.id,
      }
    }

    return {
      type: `Maintenance|${selectedMaintenance.code}`,
      title: `${selectedMaintenance.code} - ${selectedMaintenance.name}`,
      description,
      equipmentCode: form.equipmentCode,
      area: form.area,
      assignedTeam: form.assignedTeam,
      dueDate: form.dueDate || null,
      requestedBy: user?.id,
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

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
        <h2>Tao Ticket</h2>

        <form onSubmit={handleSubmit}>
          <label>Loai Ticket</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="Maintenance">Lenh bao tri</option>
            <option value="IT">Ho tro CNTT</option>
          </select>

          {isMaintenance && (
            <>
              <label>Loai bao tri</label>
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

              <label>Ten thiet bi</label>
              <input name="equipmentCode" value={form.equipmentCode} onChange={handleChange} />
            </>
          )}

          <label>Doi xu ly</label>
          <input name="assignedTeam" value={form.assignedTeam} onChange={handleChange} />

          <label>Mo ta</label>
          <textarea name="description" value={form.description} onChange={handleChange} />

          <label>Han xu ly</label>
          <input type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange} />

          {errorMessage && <div className="form-error">{errorMessage}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Dang tao...' : 'Tao ticket'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default CreateTicket
