import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { usersApi, companiesApi, departmentsApi, groupsApi } from '../../services/api'
import { UserRole, RoleLabels, canManageUsers } from '../../utils/roles'
import './AdminUsers.css'

interface User {
  id: number
  company_id: number
  department_id?: number
  group_id?: number
  full_name: string
  role: string
  email: string
  image_base64?: string
  department_name?: string
  group_name?: string
}

interface Company {
  id: number
  name: string
}

interface Department {
  id: number
  name: string
}

interface Group {
  id: number
  name: string
  department_id: number
}

function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    company_id: currentUser?.company_id || 0,
    department_id: '',
    group_id: '',
    full_name: '',
    role: UserRole.USER,
    email: '',
    password: '',
    image_base64: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (formData.department_id) {
      loadGroups(Number(formData.department_id))
    } else {
      setGroups([])
      setFormData(prev => ({ ...prev, group_id: '' }))
    }
  }, [formData.department_id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, companiesData, departmentsData] = await Promise.all([
        usersApi.getAll(currentUser?.company_id),
        companiesApi.getAll(),
        departmentsApi.getAll(currentUser?.company_id),
      ])

      setUsers(Array.isArray(usersData) ? usersData : [])
      setCompanies(Array.isArray(companiesData) ? companiesData : [])
      setDepartments(Array.isArray(departmentsData) ? departmentsData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async (departmentId: number) => {
    try {
      const groupsData = await groupsApi.getAll(departmentId)
      setGroups(Array.isArray(groupsData) ? groupsData : [])
    } catch (err) {
      console.error('Erro ao carregar grupos:', err)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image_base64: reader.result as string }))
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        company_id: user.company_id,
        department_id: user.department_id?.toString() || '',
        group_id: user.group_id?.toString() || '',
        full_name: user.full_name,
        role: user.role,
        email: user.email,
        password: '',
        image_base64: user.image_base64 || '',
      })
      if (user.department_id) {
        loadGroups(user.department_id)
      }
    } else {
      setEditingUser(null)
      setFormData({
        company_id: currentUser?.company_id || 0,
        department_id: '',
        group_id: '',
        full_name: '',
        role: UserRole.USER,
        email: '',
        password: '',
        image_base64: '',
      })
      setGroups([])
      setImageFile(null)
    }
    setShowModal(true)
    setError(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setImageFile(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.full_name.trim() || !formData.email.trim()) {
      setError('Nome completo e email são obrigatórios')
      return
    }

    if (!editingUser && !formData.password) {
      setError('Senha é obrigatória para novos usuários')
      return
    }

    try {
      const userData: any = {
        company_id: formData.company_id,
        full_name: formData.full_name,
        role: formData.role,
        email: formData.email,
        image_base64: formData.image_base64 || undefined,
      }

      if (formData.department_id) {
        userData.department_id = Number(formData.department_id)
      }
      if (formData.group_id) {
        userData.group_id = Number(formData.group_id)
      }
      if (formData.password) {
        userData.password = formData.password
      }

      if (editingUser) {
        await usersApi.update(editingUser.id, userData)
      } else {
        await usersApi.create(userData)
      }
      handleCloseModal()
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar usuário')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await usersApi.delete(id)
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar usuário')
    }
  }

  if (loading) {
    return <div className="admin-users__loading">Carregando...</div>
  }

  const canEdit = canManageUsers(currentUser?.role || '')

  return (
    <div className="admin-users">
      <div className="admin-users__header">
        <h1 className="admin-users__title">Gerenciar Usuários</h1>
        {canEdit && (
          <button
            className="admin-users__add-button"
            onClick={() => handleOpenModal()}
          >
            + Novo Usuário
          </button>
        )}
      </div>

      {error && (
        <div className="admin-users__error">
          {error}
        </div>
      )}

      <div className="admin-users__table-container">
        <table className="admin-users__table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Role</th>
              <th>Departamento</th>
              <th>Grupo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-users__empty">
                  Nenhum usuário cadastrado
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-users__user-info">
                      {user.image_base64 && (
                        <img
                          src={user.image_base64}
                          alt={user.full_name}
                          className="admin-users__avatar"
                        />
                      )}
                      <span>{user.full_name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className="admin-users__role-badge">
                      {RoleLabels[user.role as UserRole] || user.role}
                    </span>
                  </td>
                  <td>{user.department_name || '-'}</td>
                  <td>{user.group_name || '-'}</td>
                  <td>
                    <div className="admin-users__actions">
                      {canEdit && (
                        <>
                          <button
                            className="admin-users__edit-button"
                            onClick={() => handleOpenModal(user)}
                          >
                            Editar
                          </button>
                          <button
                            className="admin-users__delete-button"
                            onClick={() => handleDelete(user.id)}
                          >
                            Deletar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && canEdit && (
        <div className="admin-users__modal-overlay" onClick={handleCloseModal}>
          <div className="admin-users__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-users__modal-header">
              <h2>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              <button className="admin-users__modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form className="admin-users__form" onSubmit={handleSubmit}>
              {currentUser?.role === UserRole.SUPER_ADMIN && (
                <div className="admin-users__field">
                  <label htmlFor="company_id">Empresa *</label>
                  <select
                    id="company_id"
                    value={formData.company_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_id: Number(e.target.value) }))}
                    required
                  >
                    <option value="">Selecione...</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="admin-users__field">
                <label htmlFor="full_name">Nome Completo *</label>
                <input
                  type="text"
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-users__field">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              {!editingUser && (
                <div className="admin-users__field">
                  <label htmlFor="password">Senha *</label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required={!editingUser}
                    minLength={6}
                  />
                </div>
              )}
              {editingUser && (
                <div className="admin-users__field">
                  <label htmlFor="password">Nova Senha (deixe em branco para manter)</label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    minLength={6}
                  />
                </div>
              )}
              <div className="admin-users__field">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  required
                >
                  {Object.entries(RoleLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-users__field">
                <label htmlFor="department_id">Departamento</label>
                <select
                  id="department_id"
                  value={formData.department_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, department_id: e.target.value, group_id: '' }))}
                >
                  <option value="">Nenhum</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              {formData.department_id && (
                <div className="admin-users__field">
                  <label htmlFor="group_id">Grupo</label>
                  <select
                    id="group_id"
                    value={formData.group_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, group_id: e.target.value }))}
                  >
                    <option value="">Nenhum</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="admin-users__field">
                <label htmlFor="image">Foto (Opcional)</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imageFile && (
                  <div className="admin-users__image-preview">
                    <img src={URL.createObjectURL(imageFile)} alt="Preview" />
                    <span>{imageFile.name}</span>
                  </div>
                )}
                {editingUser && editingUser.image_base64 && !imageFile && (
                  <div className="admin-users__image-preview">
                    <img src={editingUser.image_base64} alt="Foto atual" />
                    <span>Foto atual</span>
                  </div>
                )}
              </div>
              {error && <div className="admin-users__form-error">{error}</div>}
              <div className="admin-users__form-actions">
                <button type="button" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit">{editingUser ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
