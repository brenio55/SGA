import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { notificationsApi, departmentsApi, groupsApi, usersApi, companiesApi } from '../../services/api'
import { NotificationType } from '../../classes/Notification'
import { canCreateGroupNotifications, UserRole } from '../../utils/roles'
import './AdminNotifications.css'

interface Notification {
  id: number
  company_id: number
  department_id?: number
  title: string
  description: string
  type: string
  requires_acceptance: boolean
  created_at: string
  department_name?: string
}

interface Department {
  id: number
  name: string
  company_id?: number
}

interface Group {
  id: number
  name: string
  department_id: number
}

interface User {
  id: number
  full_name: string
  email: string
  company_id?: number
}

interface Company {
  id: number
  name: string
}

type TargetType = 'all' | 'department' | 'group' | 'user'

function AdminNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [companySearch, setCompanySearch] = useState('')
  const [departmentSearch, setDepartmentSearch] = useState('')
  const [formData, setFormData] = useState({
    company_id: user?.company_id || 0,
    department_id: '',
    title: '',
    description: '',
    type: NotificationType.NORMAL,
    requires_acceptance: false,
    target_type: 'all' as TargetType,
    selected_departments: [] as number[],
    selected_groups: [] as number[],
    selected_users: [] as number[],
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Carregar departamentos quando a empresa mudar (para super_admin) ou quando o componente carregar (para outros)
    if (user?.role === UserRole.SUPER_ADMIN) {
      if (formData.company_id) {
        loadDepartmentsForCompany(formData.company_id)
      }
    } else {
      // Para não-super_admin, sempre carregar departamentos da empresa do usuário
      if (user?.company_id) {
        loadDepartmentsForCompany(user.company_id)
      }
    }
  }, [formData.company_id, user?.company_id, user?.role])

  useEffect(() => {
    if (formData.target_type === 'group' && formData.selected_departments.length > 0) {
      loadGroupsForDepartments(formData.selected_departments)
    } else {
      setGroups([])
    }
  }, [formData.target_type, formData.selected_departments])

  const loadDepartmentsForCompany = async (companyId: number) => {
    try {
      // Para não-super_admin, sempre usar a empresa do usuário logado
      const finalCompanyId = user?.role === UserRole.SUPER_ADMIN ? companyId : user?.company_id
      if (!finalCompanyId) return
      
      const departmentsData = await departmentsApi.getAll(finalCompanyId)
      setDepartments(Array.isArray(departmentsData) ? departmentsData : [])
    } catch (err) {
      console.error('Erro ao carregar departamentos:', err)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const companyId = user?.role === UserRole.SUPER_ADMIN ? undefined : user?.company_id
      const [notificationsData, departmentsData, usersData, companiesData] = await Promise.all([
        notificationsApi.getAll(companyId),
        departmentsApi.getAll(companyId),
        usersApi.getAll(companyId),
        user?.role === UserRole.SUPER_ADMIN ? companiesApi.getAll() : Promise.resolve([]),
      ])

      setNotifications(Array.isArray(notificationsData) ? notificationsData : [])
      setDepartments(Array.isArray(departmentsData) ? departmentsData : [])
      setUsers(Array.isArray(usersData) ? usersData : [])
      setCompanies(Array.isArray(companiesData) ? companiesData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const loadGroupsForDepartments = async (departmentIds: number[]) => {
    try {
      const allGroups: Group[] = []
      for (const deptId of departmentIds) {
        const groupsData = await groupsApi.getAll(deptId)
        if (Array.isArray(groupsData)) {
          allGroups.push(...groupsData)
        }
      }
      setGroups(allGroups)
    } catch (err) {
      console.error('Erro ao carregar grupos:', err)
    }
  }

  const handleTargetTypeChange = (targetType: TargetType) => {
    setFormData(prev => ({
      ...prev,
      target_type: targetType,
      selected_departments: [],
      selected_groups: [],
      selected_users: [],
    }))
  }

  const handleDepartmentToggle = (deptId: number) => {
    setFormData(prev => {
      const isSelected = prev.selected_departments.includes(deptId)
      return {
        ...prev,
        selected_departments: isSelected
          ? prev.selected_departments.filter(id => id !== deptId)
          : [...prev.selected_departments, deptId],
        selected_groups: isSelected ? prev.selected_groups.filter(g => {
          const group = groups.find(gr => gr.id === g)
          return group && group.department_id !== deptId
        }) : prev.selected_groups,
      }
    })
  }

  const handleGroupToggle = (groupId: number) => {
    setFormData(prev => {
      const isSelected = prev.selected_groups.includes(groupId)
      return {
        ...prev,
        selected_groups: isSelected
          ? prev.selected_groups.filter(id => id !== groupId)
          : [...prev.selected_groups, groupId],
      }
    })
  }

  const handleUserToggle = (userId: number) => {
    setFormData(prev => {
      const isSelected = prev.selected_users.includes(userId)
      return {
        ...prev,
        selected_users: isSelected
          ? prev.selected_users.filter(id => id !== userId)
          : [...prev.selected_users, userId],
      }
    })
  }

  const handleOpenModal = () => {
    setFormData({
      company_id: user?.company_id || 0,
      department_id: '',
      title: '',
      description: '',
      type: NotificationType.NORMAL,
      requires_acceptance: false,
      target_type: 'all',
      selected_departments: [],
      selected_groups: [],
      selected_users: [],
    })
    setCompanySearch('')
    setDepartmentSearch('')
    setShowModal(true)
    setError(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Título e descrição são obrigatórios')
      return
    }

    // Validar empresa para super_admin
    if (user?.role === UserRole.SUPER_ADMIN && !formData.company_id) {
      setError('Selecione uma empresa')
      return
    }

    // Para não-super_admin, garantir que company_id seja o do usuário
    if (user?.role !== UserRole.SUPER_ADMIN && !user?.company_id) {
      setError('Erro: usuário não possui empresa associada')
      return
    }

    // Validar targets baseado no tipo (apenas se tiver departamento selecionado)
    if (formData.department_id) {
      if (formData.target_type === 'department' && formData.selected_departments.length === 0) {
        setError('Selecione pelo menos um departamento')
        return
      }

      if (formData.target_type === 'group' && formData.selected_groups.length === 0) {
        setError('Selecione pelo menos um grupo')
        return
      }

      if (formData.target_type === 'user' && formData.selected_users.length === 0) {
        setError('Selecione pelo menos um usuário')
        return
      }
    }

    try {
      // Se não tiver departamento selecionado, a notificação deve ser para todos
      const finalTargetType = !formData.department_id ? 'all' : formData.target_type
      
      // Construir array de targets
      const targets: Array<{ target_type: string; target_id?: number }> = []

      if (finalTargetType === 'all') {
        targets.push({ target_type: 'all' })
      } else if (finalTargetType === 'department') {
        formData.selected_departments.forEach(deptId => {
          targets.push({ target_type: 'department', target_id: deptId })
        })
      } else if (finalTargetType === 'group') {
        formData.selected_groups.forEach(groupId => {
          targets.push({ target_type: 'group', target_id: groupId })
        })
      } else if (finalTargetType === 'user') {
        formData.selected_users.forEach(userId => {
          targets.push({ target_type: 'user', target_id: userId })
        })
      }

      // Para não-super_admin, sempre usar a empresa do usuário logado
      const finalCompanyId = user?.role === UserRole.SUPER_ADMIN 
        ? (formData.company_id || user!.company_id)
        : user!.company_id

      await notificationsApi.create({
        company_id: finalCompanyId,
        department_id: formData.department_id ? Number(formData.department_id) : undefined,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        requires_acceptance: formData.requires_acceptance,
        targets,
      })

      handleCloseModal()
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar notificação')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta notificação? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await notificationsApi.delete(id)
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar notificação')
    }
  }

  if (loading) {
    return <div className="admin-notifications__loading">Carregando...</div>
  }

  const canCreateGroups = canCreateGroupNotifications(user?.role || '')

  return (
    <div className="admin-notifications">
      <div className="admin-notifications__header">
        <h1 className="admin-notifications__title">Gerenciar Notificações</h1>
        <button
          className="admin-notifications__add-button"
          onClick={handleOpenModal}
        >
          + Nova Notificação
        </button>
      </div>

      {error && (
        <div className="admin-notifications__error">
          {error}
        </div>
      )}

      <div className="admin-notifications__list">
        {notifications.length === 0 ? (
          <div className="admin-notifications__empty">
            <p>Nenhuma notificação criada</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className="admin-notifications__card">
              <div className="admin-notifications__card-content">
                <div className="admin-notifications__card-header">
                  <div className="admin-notifications__card-title-section">
                    <h3 className="admin-notifications__card-title">{notification.title}</h3>
                    <span className="admin-notifications__card-id">ID: {notification.id}</span>
                  </div>
                  <span className={`admin-notifications__type-badge admin-notifications__type-badge--${notification.type}`}>
                    {notification.type}
                  </span>
                </div>
                <p className="admin-notifications__card-description">{notification.description}</p>
                <div className="admin-notifications__card-meta">
                  <span>Departamento: {notification.department_name || 'N/A'}</span>
                  <span>Requer aceitação: {notification.requires_acceptance ? 'Sim' : 'Não'}</span>
                  <span>Criada em: {new Date(notification.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <div className="admin-notifications__card-actions">
                <button
                  className="admin-notifications__delete-button"
                  onClick={() => handleDelete(notification.id)}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="admin-notifications__modal-overlay" onClick={handleCloseModal}>
          <div className="admin-notifications__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-notifications__modal-header">
              <h2>Nova Notificação</h2>
              <button className="admin-notifications__modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form className="admin-notifications__form" onSubmit={handleSubmit}>
              {user?.role === UserRole.SUPER_ADMIN && (
                <div className="admin-notifications__field">
                  <label htmlFor="company_id">Empresa *</label>
                  <input
                    type="text"
                    placeholder="Buscar empresa por ID ou nome..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="admin-notifications__search-input"
                  />
                  <select
                    id="company_id"
                    value={formData.company_id}
                    onChange={(e) => {
                      const companyId = Number(e.target.value)
                      setFormData(prev => ({ 
                        ...prev, 
                        company_id: companyId,
                        department_id: '', // Reset department when company changes
                      }))
                      setCompanySearch('')
                    }}
                    required
                  >
                    <option value="">Selecione uma empresa</option>
                    {companies
                      .filter(company => 
                        !companySearch || 
                        company.id.toString().includes(companySearch) ||
                        company.name.toLowerCase().includes(companySearch.toLowerCase())
                      )
                      .map((company) => (
                        <option key={company.id} value={company.id}>
                          ID: {company.id} - {company.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              <div className="admin-notifications__field">
                <label htmlFor="department_id">Departamento (Opcional)</label>
                <p className="admin-notifications__field-hint">
                  Se não selecionar um departamento, a notificação será enviada a todos os usuários da empresa.
                </p>
                <input
                  type="text"
                  placeholder="Buscar departamento por ID ou nome..."
                  value={departmentSearch}
                  onChange={(e) => setDepartmentSearch(e.target.value)}
                  className="admin-notifications__search-input"
                />
                <select
                  id="department_id"
                  value={formData.department_id}
                  onChange={(e) => {
                    const deptId = e.target.value
                    setFormData(prev => ({ 
                      ...prev, 
                      department_id: deptId,
                      // Se remover o departamento, voltar para 'all' apenas se estava usando departamento/grupo
                      target_type: !deptId && (prev.target_type === 'department' || prev.target_type === 'group') ? 'all' : prev.target_type
                    }))
                    setDepartmentSearch('')
                  }}
                >
                  <option value="">Nenhum (Todos os usuários)</option>
                  {departments
                    .filter(dept => {
                      // Para super_admin, filtrar pela empresa selecionada; para outros, pela empresa do usuário
                      const companyFilter = user?.role === UserRole.SUPER_ADMIN
                        ? (!formData.company_id || dept.company_id === formData.company_id)
                        : (dept.company_id === user?.company_id)
                      
                      const searchFilter = !departmentSearch || 
                        dept.id.toString().includes(departmentSearch) ||
                        dept.name.toLowerCase().includes(departmentSearch.toLowerCase())
                      
                      return companyFilter && searchFilter
                    })
                    .map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        ID: {dept.id} - {dept.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="admin-notifications__field">
                <label htmlFor="title">Título *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-notifications__field">
                <label htmlFor="description">Descrição *</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                />
              </div>
              <div className="admin-notifications__field">
                <label htmlFor="type">Tipo *</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  required
                >
                  <option value={NotificationType.NORMAL}>Normal</option>
                  <option value={NotificationType.URGENT}>Urgente</option>
                  <option value={NotificationType.IMPORTANT}>Importante</option>
                  <option value={NotificationType.INFO}>Informação</option>
                </select>
              </div>
              <div className="admin-notifications__field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.requires_acceptance}
                    onChange={(e) => setFormData(prev => ({ ...prev, requires_acceptance: e.target.checked }))}
                  />
                  Requer aceitação/rejeição
                </label>
              </div>

              <div className="admin-notifications__field">
                <label>Destinatários *</label>
                <div className="admin-notifications__target-types">
                  <label>
                    <input
                      type="radio"
                      name="target_type"
                      value="all"
                      checked={formData.target_type === 'all'}
                      onChange={() => handleTargetTypeChange('all')}
                    />
                    Todos os usuários da empresa
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="target_type"
                      value="department"
                      checked={formData.target_type === 'department'}
                      onChange={() => handleTargetTypeChange('department')}
                      disabled={!formData.department_id}
                    />
                    Departamentos específicos
                  </label>
                  {canCreateGroups && (
                    <label>
                      <input
                        type="radio"
                        name="target_type"
                        value="group"
                        checked={formData.target_type === 'group'}
                        onChange={() => handleTargetTypeChange('group')}
                        disabled={!formData.department_id}
                      />
                      Grupos específicos
                    </label>
                  )}
                  <label>
                    <input
                      type="radio"
                      name="target_type"
                      value="user"
                      checked={formData.target_type === 'user'}
                      onChange={() => handleTargetTypeChange('user')}
                    />
                    Usuários específicos
                  </label>
                </div>
                {!formData.department_id && (
                  <p className="admin-notifications__field-hint">
                    Selecione um departamento para usar opções de departamentos ou grupos específicos.
                  </p>
                )}
              </div>

              {formData.target_type === 'department' && (
                <div className="admin-notifications__field">
                  <label>Selecione Departamentos</label>
                  <div className="admin-notifications__checklist">
                    {departments
                      .filter(dept => {
                        // Para super_admin, filtrar pela empresa selecionada; para outros, pela empresa do usuário
                        return user?.role === UserRole.SUPER_ADMIN
                          ? (!formData.company_id || dept.company_id === formData.company_id)
                          : (dept.company_id === user?.company_id)
                      })
                      .map((dept) => (
                        <label key={dept.id} className="admin-notifications__checkbox-item">
                          <input
                            type="checkbox"
                            checked={formData.selected_departments.includes(dept.id)}
                            onChange={() => handleDepartmentToggle(dept.id)}
                          />
                          {dept.name}
                        </label>
                      ))}
                  </div>
                </div>
              )}

              {formData.target_type === 'group' && (
                <>
                  <div className="admin-notifications__field">
                    <label>Selecione Departamentos (para filtrar grupos)</label>
                    <div className="admin-notifications__checklist">
                      {departments
                        .filter(dept => {
                          // Para super_admin, filtrar pela empresa selecionada; para outros, pela empresa do usuário
                          return user?.role === UserRole.SUPER_ADMIN
                            ? (!formData.company_id || dept.company_id === formData.company_id)
                            : (dept.company_id === user?.company_id)
                        })
                        .map((dept) => (
                          <label key={dept.id} className="admin-notifications__checkbox-item">
                            <input
                              type="checkbox"
                              checked={formData.selected_departments.includes(dept.id)}
                              onChange={() => handleDepartmentToggle(dept.id)}
                            />
                            {dept.name}
                          </label>
                        ))}
                    </div>
                  </div>
                  {formData.selected_departments.length > 0 && (
                    <div className="admin-notifications__field">
                      <label>Selecione Grupos</label>
                      <div className="admin-notifications__checklist">
                        {groups.length === 0 ? (
                          <p className="admin-notifications__no-groups">
                            Selecione departamentos para ver os grupos disponíveis
                          </p>
                        ) : (
                          groups.map((group) => (
                            <label key={group.id} className="admin-notifications__checkbox-item">
                              <input
                                type="checkbox"
                                checked={formData.selected_groups.includes(group.id)}
                                onChange={() => handleGroupToggle(group.id)}
                              />
                              {group.name} ({departments.find(d => d.id === group.department_id)?.name})
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {formData.target_type === 'user' && (
                <div className="admin-notifications__field">
                  <label>Selecione Usuários</label>
                  <div className="admin-notifications__checklist">
                    {users
                      .filter(usr => {
                        // Para super_admin, filtrar pela empresa selecionada; para outros, pela empresa do usuário
                        return user?.role === UserRole.SUPER_ADMIN
                          ? (!formData.company_id || usr.company_id === formData.company_id)
                          : (usr.company_id === user?.company_id)
                      })
                      .map((usr) => (
                        <label key={usr.id} className="admin-notifications__checkbox-item">
                          <input
                            type="checkbox"
                            checked={formData.selected_users.includes(usr.id)}
                            onChange={() => handleUserToggle(usr.id)}
                          />
                          {usr.full_name} ({usr.email})
                        </label>
                      ))}
                  </div>
                </div>
              )}

              {error && <div className="admin-notifications__form-error">{error}</div>}
              <div className="admin-notifications__form-actions">
                <button type="button" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit">Criar Notificação</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminNotifications
