import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { companiesApi } from '../../services/api'
import './AdminCompanies.css'

interface Company {
  id: number
  name: string
  logo_base64?: string
  created_at: string
  updated_at: string
}

function AdminCompanies() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    logo_base64: '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const data = await companiesApi.getAll()
      setCompanies(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar empresas')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, logo_base64: reader.result as string }))
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleOpenModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company)
      setFormData({
        name: company.name,
        logo_base64: company.logo_base64 || '',
      })
    } else {
      setEditingCompany(null)
      setFormData({ name: '', logo_base64: '' })
      setLogoFile(null)
    }
    setShowModal(true)
    setError(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCompany(null)
    setFormData({ name: '', logo_base64: '' })
    setLogoFile(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Nome da empresa é obrigatório')
      return
    }

    try {
      if (editingCompany) {
        await companiesApi.update(editingCompany.id, {
          name: formData.name,
          logo_base64: formData.logo_base64 || undefined,
        })
      } else {
        await companiesApi.create({
          name: formData.name,
          logo_base64: formData.logo_base64 || undefined,
        })
      }
      handleCloseModal()
      loadCompanies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar empresa')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta empresa? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await companiesApi.delete(id)
      loadCompanies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar empresa')
    }
  }

  if (loading) {
    return <div className="admin-companies__loading">Carregando...</div>
  }

  return (
    <div className="admin-companies">
      <div className="admin-companies__header">
        <h1 className="admin-companies__title">Gerenciar Empresas</h1>
        <button
          className="admin-companies__add-button"
          onClick={() => handleOpenModal()}
        >
          + Nova Empresa
        </button>
      </div>

      {error && (
        <div className="admin-companies__error">
          {error}
        </div>
      )}

      <div className="admin-companies__list">
        {companies.length === 0 ? (
          <div className="admin-companies__empty">
            <p>Nenhuma empresa cadastrada</p>
          </div>
        ) : (
          companies.map((company) => (
            <div key={company.id} className="admin-companies__card">
              <div className="admin-companies__card-content">
                {company.logo_base64 && (
                  <img
                    src={company.logo_base64}
                    alt={company.name}
                    className="admin-companies__logo"
                  />
                )}
                <div className="admin-companies__card-info">
                  <h3 className="admin-companies__card-name">{company.name}</h3>
                  <p className="admin-companies__card-date">
                    Criada em: {new Date(company.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="admin-companies__card-actions">
                <button
                  className="admin-companies__edit-button"
                  onClick={() => handleOpenModal(company)}
                >
                  Editar
                </button>
                <button
                  className="admin-companies__delete-button"
                  onClick={() => handleDelete(company.id)}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="admin-companies__modal-overlay" onClick={handleCloseModal}>
          <div className="admin-companies__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-companies__modal-header">
              <h2>{editingCompany ? 'Editar Empresa' : 'Nova Empresa'}</h2>
              <button className="admin-companies__modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form className="admin-companies__form" onSubmit={handleSubmit}>
              <div className="admin-companies__field">
                <label htmlFor="name">Nome da Empresa *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-companies__field">
                <label htmlFor="logo">Logo (Opcional)</label>
                <input
                  type="file"
                  id="logo"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                {logoFile && (
                  <div className="admin-companies__logo-preview">
                    <img src={URL.createObjectURL(logoFile)} alt="Preview" />
                    <span>{logoFile.name}</span>
                  </div>
                )}
                {editingCompany && editingCompany.logo_base64 && !logoFile && (
                  <div className="admin-companies__logo-preview">
                    <img src={editingCompany.logo_base64} alt="Logo atual" />
                    <span>Logo atual</span>
                  </div>
                )}
              </div>
              {error && <div className="admin-companies__form-error">{error}</div>}
              <div className="admin-companies__form-actions">
                <button type="button" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit">{editingCompany ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCompanies
