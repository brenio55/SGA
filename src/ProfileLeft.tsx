import { useState, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import { notificationsApi, usersApi } from './services/api'
import "./ProfileLeft.css"

interface NotificationStats {
  department: string
  count: number
  color: string
}

interface ProfileLeftProps {
  onRefresh?: () => void
}

function ProfileLeft({ onRefresh }: ProfileLeftProps) {
  const { user, updateUser } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingUser, setLoadingUser] = useState(true)
  const [notificationStats, setNotificationStats] = useState<NotificationStats[]>([])
  const [totalNotifications, setTotalNotifications] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados do usuário ao montar o componente
  useEffect(() => {
    if (user?.id) {
      loadUserData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Carregar estatísticas quando os dados do usuário estiverem prontos
  useEffect(() => {
    if (user?.id && user?.company_id && !loadingUser) {
      loadNotificationStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.company_id, loadingUser])

  const loadUserData = async () => {
    if (!user?.id) {
      setLoadingUser(false)
      return
    }

    try {
      setLoadingUser(true)
      const userData = await usersApi.getById(user.id) as any

      // Atualizar o usuário no contexto com os dados mais recentes
      if (userData && updateUser) {
        updateUser({
          id: userData.id,
          company_id: userData.company_id,
          department_id: userData.department_id,
          group_id: userData.group_id,
          full_name: userData.full_name,
          role: userData.role,
          email: userData.email,
          image_base64: userData.image_base64,
          department_name: userData.department_name,
          group_name: userData.group_name,
        })
      }
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err)
      // Não mostrar erro aqui, apenas logar, pois o usuário pode já estar logado
    } finally {
      setLoadingUser(false)
    }
  }

  const loadNotificationStats = async () => {
    if (!user?.id || !user?.company_id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Usar a rota específica de estatísticas que retorna dados já agrupados
      const statsData = await notificationsApi.getStatsForUser(user.id, user.company_id)
      const stats = Array.isArray(statsData) ? statsData : []

      // Mapear os dados retornados para o formato esperado
      const mappedStats: NotificationStats[] = stats.map((stat: any) => ({
        department: stat.department_name || 'Geral',
        count: Number(stat.count) || 0,
        color: stat.department_color || '#667eea',
      }))

      setNotificationStats(mappedStats)

      // Calcular total de notificações
      const total = mappedStats.reduce((sum, stat) => sum + stat.count, 0)
      setTotalNotifications(total)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estatísticas'
      setError(errorMessage)
      console.error('Erro ao carregar estatísticas:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Recarregar dados do usuário e estatísticas
      await Promise.all([
        loadUserData(),
        loadNotificationStats()
      ])
      if (onRefresh) {
        onRefresh()
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <section className="profile-sidebar">
      <div className="profile-sidebar__header">
        <div className="profile-sidebar__image-container">
          {user?.image_base64 ? (
            <img
              src={user.image_base64}
              alt={user.full_name}
              className="profile-sidebar__image"
            />
          ) : (
            <div className="profile-sidebar__image-placeholder">
              <span className="profile-sidebar__initials">
                {user ? getInitials(user.full_name) : 'U'}
              </span>
            </div>
          )}
          <div className="profile-sidebar__status-indicator"></div>
        </div>

        <div className="profile-sidebar__info">
          <h3 className="profile-sidebar__name">
            {loadingUser ? 'Carregando...' : (user?.full_name || 'Usuário')}
          </h3>
          {/* <p className="profile-sidebar__role">
            {loadingUser ? '...' : (user?.role || 'N/A')}
          </p> */}
          <p className="profile-sidebar__department">
            {loadingUser ? '...' : (user?.department_name || 'N/A')}
          </p>
        </div>
      </div>

      <div className="profile-sidebar__stats">
        <div className="profile-sidebar__stats-header">
          <h3 className="profile-sidebar__stats-title">
            Notificações
          </h3>
          <div className="profile-sidebar__stats-badge">
            {loading ? '...' : totalNotifications}
          </div>
        </div>

        {error && (
          <div style={{
            padding: '8px',
            background: '#fed7d7',
            color: '#c53030',
            borderRadius: '4px',
            marginBottom: '8px',
            fontSize: '12px'
          }}>
            {error}
          </div>
        )}

        <div className="profile-sidebar__stats-list">
          {loading ? (
            <div className="profile-sidebar__stat-item">
              <span className="profile-sidebar__stat-label">Carregando...</span>
            </div>
          ) : notificationStats.length > 0 ? (
            notificationStats.map((stat, index) => (
              <div key={index} className="profile-sidebar__stat-item">
                <div className="profile-sidebar__stat-info">
                  <span
                    className="profile-sidebar__stat-color"
                    style={{ backgroundColor: stat.color }}
                  ></span>
                  <span className="profile-sidebar__stat-label">{stat.department}</span>
                </div>
                <span className="profile-sidebar__stat-count">{stat.count}</span>
              </div>
            ))
          ) : (
            <div className="profile-sidebar__stat-item">
              <span className="profile-sidebar__stat-label">Nenhuma notificação</span>
            </div>
          )}
        </div>
      </div>

      <div className="profile-sidebar__actions">
        <button
          type="button"
          className="profile-sidebar__refresh-button"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <span className="profile-sidebar__refresh-spinner">⟳</span>
              <span>Carregando...</span>
            </>
          ) : (
            <span>Recarregar Atualizações</span>
          )}
        </button>
      </div>
    </section>
  )
}

export default ProfileLeft

