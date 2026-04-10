import { useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiKey, FiPlus, FiSave, FiSearch, FiTrash2, FiX } from 'react-icons/fi'
import { buildApiUrl } from '../services/api'
import { createUser, deleteUser, getUsers, resetUserPassword, updateUser } from '../services/userService'
import '../styles/requests.css'
import '../styles/user-management.css'

const ITEMS_PER_PAGE = 10

const initialForm = {
  username: '',
  password: '',
  fullName: '',
  role: 'user',
  department: '',
  authorizedFactoryIdList: [],
}

function sortUsers(users) {
  const roleOrder = { admin: 0, processor: 1, user: 2 }

  return [...users].sort((left, right) => {
    const roleDiff = (roleOrder[left.role] ?? 99) - (roleOrder[right.role] ?? 99)
    if (roleDiff !== 0) return roleDiff
    return String(left.username || '').localeCompare(String(right.username || ''))
  })
}

function getRoleLabel(role) {
  if (role === 'admin') return 'Admin'
  if (role === 'processor') return 'Tiếp nhận Ticket'
  return 'Người dùng'
}

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('vi-VN').format(date)
}

function UserManagement() {
  const [users, setUsers] = useState([])
  const [factories, setFactories] = useState([])
  const [form, setForm] = useState(initialForm)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setError('')

        const [userData, factoryResponse] = await Promise.all([
          getUsers(),
          fetch(buildApiUrl('/api/tickets/factories')),
        ])

        const factoryData = factoryResponse.ok ? await factoryResponse.json() : []
        setUsers(Array.isArray(userData) ? sortUsers(userData) : [])
        setFactories(Array.isArray(factoryData) ? factoryData : [])
      } catch {
        setError('Khong the tai du lieu quan ly user.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    if (!keyword) return users

    return users.filter((user) =>
      [user.username, user.fullName, user.role, user.department, user.authorizedFactoryIds]
        .some((value) => String(value || '').toLowerCase().includes(keyword)),
    )
  }, [searchTerm, users])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE))
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, filteredUsers])

  const factoryMap = useMemo(() => {
    return factories.reduce((accumulator, factory) => {
      accumulator[factory.id] = factory
      return accumulator
    }, {})
  }, [factories])

  const selectedFactories = useMemo(() => {
    return new Set((form.authorizedFactoryIdList || []).map((value) => Number(value)))
  }, [form.authorizedFactoryIdList])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, users])

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  function resetFeedback() {
    setError('')
    setMessage('')
  }

  function resetFormState() {
    setSelectedUserId(null)
    setForm(initialForm)
    setResetPassword('')
  }

  function closeModal() {
    setIsModalOpen(false)
    resetFormState()
  }

  function openCreateModal() {
    resetFormState()
    resetFeedback()
    setIsModalOpen(true)
  }

  function getAuthorizedFactoriesLabel(user) {
    if (user.role !== 'processor') return '-'

    const names = (user.authorizedFactoryIdList || [])
      .map((factoryId) => factoryMap[factoryId])
      .filter(Boolean)
      .map((factory) => `${factory.code} - ${factory.name}`)

    return names.length ? names.join(', ') : 'Chua gan nha may'
  }

  function handleEditUser(user) {
    setSelectedUserId(user.id)
    setForm({
      username: user.username || '',
      password: '',
      fullName: user.fullName || '',
      role: user.role || 'user',
      department: user.department || '',
      authorizedFactoryIdList: Array.isArray(user.authorizedFactoryIdList) ? user.authorizedFactoryIdList : [],
    })
    setResetPassword('')
    resetFeedback()
    setIsModalOpen(true)
  }

  function handleChange(event) {
    const { name, value } = event.target
    resetFeedback()

    setForm((current) => {
      if (name === 'role') {
        return {
          ...current,
          role: value,
          authorizedFactoryIdList: value === 'processor' ? current.authorizedFactoryIdList : [],
        }
      }

      return { ...current, [name]: value }
    })
  }

  function toggleFactory(factoryId) {
    resetFeedback()

    setForm((current) => {
      const normalizedFactoryId = Number(factoryId)
      const currentValues = new Set((current.authorizedFactoryIdList || []).map((value) => Number(value)))

      if (currentValues.has(normalizedFactoryId)) {
        currentValues.delete(normalizedFactoryId)
      } else {
        currentValues.add(normalizedFactoryId)
      }

      return {
        ...current,
        authorizedFactoryIdList: Array.from(currentValues).sort((left, right) => left - right),
      }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    resetFeedback()

    try {
      const payload = {
        username: form.username.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        role: form.role,
        department: form.department.trim(),
        authorizedFactoryIdList: form.role === 'processor' ? form.authorizedFactoryIdList : [],
      }

      const savedUser = selectedUserId
        ? await updateUser(selectedUserId, payload)
        : await createUser(payload)

      setUsers((currentUsers) => {
        const nextUsers = selectedUserId
          ? currentUsers.map((user) => (user.id === savedUser.id ? savedUser : user))
          : [...currentUsers, savedUser]

        return sortUsers(nextUsers)
      })

      setMessage(selectedUserId ? 'Cap nhat user thanh cong.' : 'Tao user thanh cong.')
      closeModal()
    } catch (submitError) {
      setError(submitError.message || 'Khong the luu user.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleResetPassword() {
    if (!selectedUserId) return

    try {
      setIsResettingPassword(true)
      resetFeedback()
      await resetUserPassword(selectedUserId, resetPassword)
      setResetPassword('')
      setMessage('Reset mật khẩu thành công.')
    } catch (resetError) {
      setError(resetError.message || 'Khong the reset mat khau.')
    } finally {
      setIsResettingPassword(false)
    }
  }

  async function handleDeleteSelectedUser() {
    if (!selectedUserId) return

    const selectedUser = users.find((user) => user.id === selectedUserId)
    const confirmed = window.confirm(`Ban co chac muon xoa user ${selectedUser?.username || selectedUserId} khong?`)
    if (!confirmed) return

    try {
      setIsDeleting(true)
      resetFeedback()
      await deleteUser(selectedUserId)
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== selectedUserId))
      closeModal()
      setMessage('Xoa user thanh cong.')
    } catch (deleteError) {
      setError(deleteError.message || 'Khong the xoa user.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="user-management-page">
      {error && <div className="requests-page__alert">{error}</div>}
      {message && <div className="user-management__success">{message}</div>}

      <div className="user-management__toolbar">
        <button type="button" className="user-management__primary-button" onClick={openCreateModal}>
          <FiPlus size={16} />
          <span>Tạo tài khoản</span>
        </button>

        <label className="user-management__search">
          <FiSearch size={18} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tim kiem nguoi dung..."
          />
        </label>
      </div>

      <section className="user-management__table-card">
        <div className="user-management__table-wrap">
          <table className="user-management__table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Họ và tên</th>
                <th>Tên đăng nhập</th>
                <th>Vai trò</th>
                <th>Phòng ban</th>
                <th>Nhà máy truy cập</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="8" className="user-management__empty-cell">Đang tải danh sách user...</td>
                </tr>
              )}

              {!isLoading && paginatedUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                  <td>{user.fullName || '-'}</td>
                  <td>{user.username || '-'}</td>
                  <td>
                    <span className={`user-management__role-pill user-management__role-pill--${user.role}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>{user.department || '-'}</td>
                  <td className="user-management__factory-cell">{getAuthorizedFactoriesLabel(user)}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="user-management__actions">
                      <button
                        type="button"
                        className="user-management__table-icon user-management__table-icon--edit"
                        onClick={() => handleEditUser(user)}
                        title="Sua user"
                      >
                        <FiEdit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="8" className="user-management__empty-cell">Không tìm thấy người dùng phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {!isLoading && filteredUsers.length > 0 && (
        <div className="requests-pagination">
          <div className="requests-pagination__summary">
            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} / {filteredUsers.length} user
          </div>
          <div className="requests-pagination__controls">
            <button
              type="button"
              className="requests-pagination__button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            <span className="requests-pagination__page">Trang {currentPage} / {totalPages}</span>
            <button
              type="button"
              className="requests-pagination__button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="user-management__modal-backdrop" onClick={closeModal}>
          <section className="user-management__modal" onClick={(event) => event.stopPropagation()}>
            <div className="user-management__modal-header">
              <h2>{selectedUserId ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}</h2>
              <button type="button" className="user-management__close-button" onClick={closeModal}>
                <FiX size={22} />
              </button>
            </div>

            <form className="user-form" onSubmit={handleSubmit}>
              <div className="user-form__grid">
                <label className="user-form__field">
                  <span>Họ và tên</span>
                  <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Họ và tên" />
                </label>

                <label className="user-form__field">
                  <span>Tên đăng nhập</span>
                  <input name="username" value={form.username} onChange={handleChange} placeholder="Tên đăng nhập" />
                </label>

                <label className="user-form__field">
                  <span>Phòng ban</span>
                  <input name="department" value={form.department} onChange={handleChange} placeholder="Phòng ban" />
                </label>

                <label className="user-form__field">
                  <span>Phân quyền</span>
                  <select name="role" value={form.role} onChange={handleChange}>
                    <option value="admin">Admin</option>
                    <option value="processor">Tiếp nhận ticket</option>
                    <option value="user">Tạo ticket</option>
                  </select>
                </label>

                <label className="user-form__field user-form__field--full">
                  <span>{selectedUserId ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu'}</span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mật khẩu"
                  />
                </label>
              </div>

              {form.role === 'processor' && (
                <div className="user-form__field">
                  <span>Nhà máy được truy cập</span>
                  <div className="factory-picker">
                    {factories.map((factory) => (
                      <label
                        key={factory.id}
                        className={`factory-pill${selectedFactories.has(factory.id) ? ' factory-pill--active' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFactories.has(factory.id)}
                          onChange={() => toggleFactory(factory.id)}
                        />
                        <span>{factory.code} - {factory.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="user-form__actions">
                <button type="submit" className="user-management__submit-button" disabled={isSaving}>
                  <FiSave size={16} />
                  <span>{isSaving ? 'Dang luu...' : selectedUserId ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}</span>
                </button>
              </div>
            </form>

            {selectedUserId && (
              <div className="user-management__modal-footer">
                <div className="user-management__reset-box">
                  <label className="user-form__field user-form__field--compact">
                    <span>Reset mật khẩu</span>
                    <input
                      type="password"
                      value={resetPassword}
                      onChange={(event) => setResetPassword(event.target.value)}
                      placeholder="Nhập mật khẩu mới"
                    />
                  </label>

                  <button
                    type="button"
                    className="user-management__secondary-button"
                    onClick={handleResetPassword}
                    disabled={isResettingPassword}
                  >
                    <FiKey size={16} />
                    <span>{isResettingPassword ? 'Dang reset...' : 'Reset mat khau'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  className="user-management__danger-button"
                  onClick={handleDeleteSelectedUser}
                  disabled={isDeleting}
                >
                  <FiTrash2 size={16} />
                  <span>{isDeleting ? 'Dang xoa...' : 'Xoá user'}</span>
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  )
}

export default UserManagement
