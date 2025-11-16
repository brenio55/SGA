import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { isAdmin } from './utils/roles'
import { companiesApi } from './services/api'
import "./Header.css"

interface Company {
  id: number
  name: string
  logo_base64?: string
}

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const [company, setCompany] = useState<Company | null>(null)
  const [loadingCompany, setLoadingCompany] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loadCompany = async () => {
      if (user?.company_id) {
        try {
          setLoadingCompany(true)
          const companyData = await companiesApi.getById(user.company_id)
          setCompany(companyData as Company)
        } catch (err) {
          console.error('Erro ao carregar empresa:', err)
        } finally {
          setLoadingCompany(false)
        }
      }
    }
    loadCompany()
  }, [user?.company_id])

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleAdminClick = () => {
    navigate('/admin')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const showAdminButton = user && isAdmin(user.role)

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__brand">
          {company?.logo_base64 ? (
            <div className="header__logo">
              <img 
                src={company.logo_base64} 
                alt={company.name}
                className="header__logo-image"
              />
            </div>
          ) : (
            <div className="header__logo">
              <span className="header__logo-icon">
                {company?.name ? company.name.charAt(0).toUpperCase() : 'S'}
              </span>
            </div>
          )}
          <div className="header__brand-text">
            <h1 className="header__title">
              {loadingCompany ? 'Carregando...' : (company?.name || 'SGA-BMS')}
            </h1>
            <p className="header__subtitle">Sistema de Gestão e Avisos</p>
          </div>
        </div>
        
        <div className="header__datetime">
          <div className="header__date">
            <span className="header__date-text">{formatDate(currentDateTime)}</span>
          </div>
          <div className="header__time">
            <span className="header__time-text">{formatTime(currentDateTime)}</span>
          </div>
          {showAdminButton && (
            <button 
              className="header__admin-button"
              onClick={handleAdminClick}
              title="Painel Administrativo"
            >
              <span className="header__admin-icon">⚙️</span>
              <span className="header__admin-text">Admin</span>
            </button>
          )}
          {user && (
            <div className="header__user-menu" ref={userMenuRef}>
              <button
                className="header__user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                title="Menu do Usuário"
              >
                {user.image_base64 ? (
                  <img 
                    src={user.image_base64} 
                    alt={user.full_name}
                    className="header__user-avatar"
                  />
                ) : (
                  <div className="header__user-avatar-placeholder">
                    {getInitials(user.full_name)}
                  </div>
                )}
              </button>
              {showUserMenu && (
                <div className="header__user-dropdown">
                  <div className="header__user-info">
                    <p className="header__user-name">{user.full_name}</p>
                    <p className="header__user-email">{user.email}</p>
                  </div>
                  <div className="header__user-divider"></div>
                  <button
                    className="header__user-menu-item"
                    onClick={handleLogout}
                  >
                    <span className="header__user-menu-icon">🚪</span>
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
