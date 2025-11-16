import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    company_id: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!formData.company_id || !formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos')
      setLoading(false)
      return
    }

    try {
      await login(Number(formData.company_id), formData.email, formData.password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login__container">
        <div className="login__header">
          <h1 className="login__title">SGA-BMS</h1>
          <p className="login__subtitle">Sistema de Gestão A</p>
          <p className="login__subtitle">Business Management System</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label htmlFor="company_id">ID da Empresa</label>
            <input
              type="number"
              id="company_id"
              value={formData.company_id}
              onChange={(e) => setFormData(prev => ({ ...prev, company_id: e.target.value }))}
              placeholder="Digite o ID da empresa"
              required
              min="1"
            />
          </div>

          <div className="login__field">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="login__field">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Digite sua senha"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="login__error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login__submit"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login__footer">
          <p className="login__footer-text">
            Não tem uma conta?{' '}
            <Link to="/register" className="login__link">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

