import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { groupsApi, departmentsApi } from '../../services/api'
import './AdminGroups.css'

interface Group {
  id: number
  department_id: number
  name: string
  description?: string
  created_at: string
}

interface Department {
  id: number
  name: string
}

function AdminGroups() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [formData, setFormData] = useState({
    department_id: '',
    name: '',
    description: '',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [groupsData, departmentsData] = await Promise.all([
        groupsApi.getAll(),
        departmentsApi.getAll(user?.company_id),
      ])

      // Filtrar grupos por departamentos da empresa do usuário
      const deptIds = (Array.isArray(departmentsData) ? departmentsData : []).map(d => d.id)
      const filteredGroups = (Array.isArray(groupsData) ? groupsData : []).filter(
        g => deptIds.includes(g.department_id)
      )

      setGroups(filteredGroups)
      setDepartments(Array.isArray(departmentsData) ? departmentsData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar grupos')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (group?: Group) => {
    if (group) {
      setEditingGroup(group)
      setFormData({
        department_id: group.department_id.toString(),
        name: group.name,
        description: group.description || '',
      })
    } else {
      setEditingGroup(null)
      setFormData({
        department_id: '',
        name: '',
        description: '',
      })
    }
    setShowModal(true)
    setError(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingGroup(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim() || !formData.department_id) {
      setError('Nome do grupo e departamento são obrigatórios')
      return
    }

    try {
      if (editingGroup) {
        await groupsApi.update(editingGroup.id, {
          name: formData.name,
          description: formData.description || undefined,
        })
      } else {
        await groupsApi.create({
          department_id: Number(formData.department_id),
          name: formData.name,
          description: formData.description || undefined,
        })
      }
      handleCloseModal()
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar grupo')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este grupo? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await groupsApi.delete(id)
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar grupo')
    }
  }

  if (loading) {
    return <div className="admin-groups__loading">Carregando...</div>
  }

  const getDepartmentName = (departmentId: number) => {
    return departments.find(d => d.id === departmentId)?.name || 'Desconhecido'
  }

  return (
    <div className="admin-groups">
      <div className="admin-groups__header">
        <h1 className="admin-groups__title">Gerenciar Grupos</h1>
        <button
          className="admin-groups__add-button"
          onClick={() => handleOpenModal()}
        >
          + Novo Grupo
        </button>
      </div>

      {error && (
        <div className="admin-groups__error">
          {error}
        </div>
      )}

      <div className="admin-groups__list">
        {groups.length === 0 ? (
          <div className="admin-groups__empty">
            <p>Nenhum grupo cadastrado</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="admin-groups__card">
              <div className="admin-groups__card-content">
                <div className="admin-groups__card-info">
                  <h3 className="admin-groups__card-name">{group.name}</h3>
                  <p className="admin-groups__card-department">
                    Departamento: {getDepartmentName(group.department_id)}
                  </p>
                  {group.description && (
                    <p className="admin-groups__card-description">{group.description}</p>
                  )}
                  <p className="admin-groups__card-date">
                    Criado em: {new Date(group.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="admin-groups__card-actions">
                <button
                  className="admin-groups__edit-button"
                  onClick={() => handleOpenModal(group)}
                >
                  Editar
                </button>
                <button
                  className="admin-groups__delete-button"
                  onClick={() => handleDelete(group.id)}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="admin-groups__modal-overlay" onClick={handleCloseModal}>
          <div className="admin-groups__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-groups__modal-header">
              <h2>{editingGroup ? 'Editar Grupo' : 'Novo Grupo'}</h2>
              <button className="admin-groups__modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form className="admin-groups__form" onSubmit={handleSubmit}>
              <div className="admin-groups__field">
                <label htmlFor="department_id">Departamento *</label>
                <select
                  id="department_id"
                  value={formData.department_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, department_id: e.target.value }))}
                  required
                  disabled={!!editingGroup}
                >
                  <option value="">Selecione...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {editingGroup && (
                  <small>O departamento não pode ser alterado após a criação</small>
                )}
              </div>
              <div className="admin-groups__field">
                <label htmlFor="name">Nome do Grupo *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-groups__field">
                <label htmlFor="description">Descrição</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>
              {error && <div className="admin-groups__form-error">{error}</div>}
              <div className="admin-groups__form-actions">
                <button type="button" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit">{editingGroup ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminGroups
