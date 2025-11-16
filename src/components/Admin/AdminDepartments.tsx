import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { departmentsApi, companiesApi } from '../../services/api'
import './AdminDepartments.css'

interface Department {
  id: number
  company_id: number
  name: string
  color?: string
  created_at: string
}

interface Company {
  id: number
  name: string
}

function AdminDepartments() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState<Department[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    company_id: user?.company_id || 0,
    name: '',
    color: '#667eea',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [departmentsData, companiesData] = await Promise.all([
        departmentsApi.getAll(user?.company_id),
        user?.role === 'super_admin' ? companiesApi.getAll() : Promise.resolve([]),
      ])

      setDepartments(Array.isArray(departmentsData) ? departmentsData : [])
      setCompanies(Array.isArray(companiesData) ? companiesData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar departamentos')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (department?: Department) => {
    if (department) {
      setEditingDepartment(department)
      setFormData({
        company_id: department.company_id,
        name: department.name,
        color: department.color || '#667eea',
      })
    } else {
      setEditingDepartment(null)
      setFormData({
        company_id: user?.company_id || 0,
        name: '',
        color: '#667eea',
      })
    }
    setShowModal(true)
    setError(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDepartment(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Nome do departamento é obrigatório')
      return
    }

    try {
      if (editingDepartment) {
        await departmentsApi.update(editingDepartment.id, {
          name: formData.name,
          color: formData.color,
        })
      } else {
        await departmentsApi.create({
          company_id: formData.company_id,
          name: formData.name,
          color: formData.color,
        })
      }
      handleCloseModal()
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar departamento')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este departamento? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await departmentsApi.delete(id)
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar departamento')
    }
  }

  if (loading) {
    return <div className="admin-departments__loading">Carregando...</div>
  }

  return (
    <div className="admin-departments">
      <div className="admin-departments__header">
        <h1 className="admin-departments__title">Gerenciar Departamentos</h1>
        <button
          className="admin-departments__add-button"
          onClick={() => handleOpenModal()}
        >
          + Novo Departamento
        </button>
      </div>

      {error && (
        <div className="admin-departments__error">
          {error}
        </div>
      )}

      <div className="admin-departments__list">
        {departments.length === 0 ? (
          <div className="admin-departments__empty">
            <p>Nenhum departamento cadastrado</p>
          </div>
        ) : (
          departments.map((department) => (
            <div key={department.id} className="admin-departments__card">
              <div className="admin-departments__card-content">
                <div
                  className="admin-departments__color-indicator"
                  style={{ backgroundColor: department.color || '#667eea' }}
                ></div>
                <div className="admin-departments__card-info">
                  <h3 className="admin-departments__card-name">{department.name}</h3>
                  <p className="admin-departments__card-date">
                    Criado em: {new Date(department.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="admin-departments__card-actions">
                <button
                  className="admin-departments__edit-button"
                  onClick={() => handleOpenModal(department)}
                >
                  Editar
                </button>
                <button
                  className="admin-departments__delete-button"
                  onClick={() => handleDelete(department.id)}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="admin-departments__modal-overlay" onClick={handleCloseModal}>
          <div className="admin-departments__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-departments__modal-header">
              <h2>{editingDepartment ? 'Editar Departamento' : 'Novo Departamento'}</h2>
              <button className="admin-departments__modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form className="admin-departments__form" onSubmit={handleSubmit}>
              {user?.role === 'super_admin' && (
                <div className="admin-departments__field">
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
              <div className="admin-departments__field">
                <label htmlFor="name">Nome do Departamento *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-departments__field">
                <label htmlFor="color">Cor (Hex) *</label>
                <div className="admin-departments__color-input">
                  <input
                    type="color"
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#667eea"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
              {error && <div className="admin-departments__form-error">{error}</div>}
              <div className="admin-departments__form-actions">
                <button type="button" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit">{editingDepartment ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDepartments
