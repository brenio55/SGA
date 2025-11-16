import { useState, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import { notificationsApi, departmentsApi } from './services/api'
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
  const { user } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [notificationStats, setNotificationStats] = useState<NotificationStats[]>([])
  const [totalNotifications, setTotalNotifications] = useState(0)

  useEffect(() => {
    loadNotificationStats()
  }, [user])

  const loadNotificationStats = async () => {
    if (!user) return

    try {
      const [notificationsData, departmentsData] = await Promise.all([
        notificationsApi.getForUser(user.id, user.company_id),
        departmentsApi.getAll(user.company_id),
      ])

      const notifications = Array.isArray(notificationsData) ? notificationsData : []
      const departments = Array.isArray(departmentsData) ? departmentsData : []

      // Agrupar notificações por departamento
      const statsMap = new Map<string, { count: number; color: string }>()

      notifications.forEach((notif: any) => {
        const deptName = notif.department_name || 'Geral'
        const dept = departments.find((d: any) => d.name === deptName)
        const color = dept?.color || '#667eea'

        if (statsMap.has(deptName)) {
          const current = statsMap.get(deptName)!
          statsMap.set(deptName, { count: current.count + 1, color })
        } else {
          statsMap.set(deptName, { count: 1, color })
        }
      })

      const stats: NotificationStats[] = Array.from(statsMap.entries()).map(([department, data]) => ({
        department,
        ...data,
      }))

      setNotificationStats(stats)
      setTotalNotifications(notifications.length)
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadNotificationStats()
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
          <h3 className="profile-sidebar__name">{user?.full_name || 'Usuário'}</h3>
          <p className="profile-sidebar__role">
            {user?.role || 'N/A'}
          </p>
          <p className="profile-sidebar__department">
            {user?.department_name || 'N/A'}
          </p>
        </div>
      </div>

      <div className="profile-sidebar__stats">
        <div className="profile-sidebar__stats-header">
          <h3 className="profile-sidebar__stats-title">
            Notificações
          </h3>
          <div className="profile-sidebar__stats-badge">
            {totalNotifications}
          </div>
        </div>

        <div className="profile-sidebar__stats-list">
          {notificationStats.length > 0 ? (
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
