import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../utils/roles'
import './InitialRegister.css'

function InitialRegister() {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company_name: '',
    logo_base64: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, logo: 'Por favor, selecione uma imagem' }))
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: 'A imagem deve ter no máximo 5MB' }))
      return
    }

    setLogoFile(file)

    // Converter para base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setFormData(prev => ({ ...prev, logo_base64: base64String }))
      setErrors(prev => ({ ...prev, logo: '' }))
    }
    reader.readAsDataURL(file)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nome completo é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Nome da empresa é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsLoading(true)

    try {
      // 1. Criar empresa primeiro
      const { companiesApi } = await import('../services/api')
      const company = await companiesApi.create({
        name: formData.company_name,
        logo_base64: formData.logo_base64 || undefined,
      }) as any

      // 2. Criar usuário super_admin vinculado à empresa
      await register({
        company_id: company.id,
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: UserRole.SUPER_ADMIN,
        image_base64: formData.logo_base64 || undefined,
      } as any)

      // Sucesso - redirecionar será feito pelo AuthContext
    } catch (error) {
      if (error instanceof Error) {
        setErrors(prev => ({ ...prev, submit: error.message }))
      } else {
        setErrors(prev => ({ ...prev, submit: 'Erro ao criar conta. Tente novamente.' }))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="initial-register">
      <div className="initial-register__container">
        <div className="initial-register__header">
          <h1 className="initial-register__title">Cadastro Inicial</h1>
          <p className="initial-register__subtitle">
            Crie sua conta de Super Administrador e sua empresa
          </p>
        </div>

        <form className="initial-register__form" onSubmit={handleSubmit}>
          <div className="initial-register__section">
            <h2 className="initial-register__section-title">Dados Pessoais</h2>

            <div className="initial-register__field">
              <label htmlFor="full_name" className="initial-register__label">
                Nome Completo *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={`initial-register__input ${errors.full_name ? 'initial-register__input--error' : ''}`}
                placeholder="Seu nome completo"
              />
              {errors.full_name && (
                <span className="initial-register__error">{errors.full_name}</span>
              )}
            </div>

            <div className="initial-register__field">
              <label htmlFor="email" className="initial-register__label">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`initial-register__input ${errors.email ? 'initial-register__input--error' : ''}`}
                placeholder="seu@email.com"
              />
              {errors.email && (
                <span className="initial-register__error">{errors.email}</span>
              )}
            </div>

            <div className="initial-register__field">
              <label htmlFor="password" className="initial-register__label">
                Senha *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`initial-register__input ${errors.password ? 'initial-register__input--error' : ''}`}
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && (
                <span className="initial-register__error">{errors.password}</span>
              )}
            </div>

            <div className="initial-register__field">
              <label htmlFor="confirmPassword" className="initial-register__label">
                Confirmar Senha *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`initial-register__input ${errors.confirmPassword ? 'initial-register__input--error' : ''}`}
                placeholder="Digite a senha novamente"
              />
              {errors.confirmPassword && (
                <span className="initial-register__error">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="initial-register__section">
            <h2 className="initial-register__section-title">Dados da Empresa</h2>

            <div className="initial-register__field">
              <label htmlFor="company_name" className="initial-register__label">
                Nome da Empresa *
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className={`initial-register__input ${errors.company_name ? 'initial-register__input--error' : ''}`}
                placeholder="Nome da sua empresa"
              />
              {errors.company_name && (
                <span className="initial-register__error">{errors.company_name}</span>
              )}
            </div>

            <div className="initial-register__field">
              <label htmlFor="logo" className="initial-register__label">
                Logo da Empresa (Opcional)
              </label>
              <input
                type="file"
                id="logo"
                name="logo"
                accept="image/*"
                onChange={handleLogoChange}
                className="initial-register__file-input"
              />
              {logoFile && (
                <div className="initial-register__logo-preview">
                  <img src={URL.createObjectURL(logoFile)} alt="Preview" />
                  <span>{logoFile.name}</span>
                </div>
              )}
              {errors.logo && (
                <span className="initial-register__error">{errors.logo}</span>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="initial-register__error-message">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            className="initial-register__submit"
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="initial-register__footer">
          <p className="initial-register__footer-text">
            Já tem uma conta?{' '}
            <Link to="/login" className="initial-register__link">
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default InitialRegister

