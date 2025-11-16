import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { companiesApi, usersApi, notificationsApi } from '../../services/api'
import './AdminDashboard.css'

function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    companies: 0,
    users: 0,
    notifications: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [companies, users, notifications] = await Promise.all([
          companiesApi.getAll(),
          usersApi.getAll(user?.company_id),
          notificationsApi.getAll(user?.company_id),
        ])

        setStats({
          companies: Array.isArray(companies) ? companies.length : 0,
          users: Array.isArray(users) ? users.length : 0,
          notifications: Array.isArray(notifications) ? notifications.length : 0,
        })
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadStats()
    }
  }, [user])

  if (loading) {
    return <div className="admin-dashboard__loading">Carregando...</div>
  }

  return (
    <div className="admin-dashboard">
      <h1 className="admin-dashboard__title">Dashboard Administrativo</h1>
      
      <div className="admin-dashboard__stats">
        <div className="admin-dashboard__stat-card">
          <div className="admin-dashboard__stat-icon">🏢</div>
          <div className="admin-dashboard__stat-info">
            <h3 className="admin-dashboard__stat-label">Empresas</h3>
            <p className="admin-dashboard__stat-value">{stats.companies}</p>
          </div>
        </div>

        <div className="admin-dashboard__stat-card">
          <div className="admin-dashboard__stat-icon">👥</div>
          <div className="admin-dashboard__stat-info">
            <h3 className="admin-dashboard__stat-label">Usuários</h3>
            <p className="admin-dashboard__stat-value">{stats.users}</p>
          </div>
        </div>

        <div className="admin-dashboard__stat-card">
          <div className="admin-dashboard__stat-icon">🔔</div>
          <div className="admin-dashboard__stat-info">
            <h3 className="admin-dashboard__stat-label">Notificações</h3>
            <p className="admin-dashboard__stat-value">{stats.notifications}</p>
          </div>
        </div>
      </div>

      <div className="admin-dashboard__welcome">
        <h2>Bem-vindo, {user?.full_name}!</h2>
        <p>Use o menu lateral para navegar pelas funcionalidades administrativas.</p>
      </div>
    </div>
  )
}

export default AdminDashboard

