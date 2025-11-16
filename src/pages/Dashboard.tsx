import { useState, useEffect } from 'react'
import Header from '../Header'
import ProfileLeft from '../ProfileLeft'
import Notification from '../components/Notification'
import { Notification as NotificationClass, NotificationType } from '../classes/Notification'
import { useAuth } from '../contexts/AuthContext'
import { notificationsApi } from '../services/api'
import './Dashboard.css'

interface NotificationData {
  id: number
  title: string
  description: string
  type: string
  requires_acceptance: boolean
  department_name?: string
  created_at: string
}

function Dashboard() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.company_id])

  const loadNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const data = await notificationsApi.getForUser(user.id, user.company_id)
      const notificationsList = Array.isArray(data) ? data : []

      const mappedNotifications = notificationsList.map((notif: NotificationData) => {
        return new NotificationClass(
          notif.title,
          notif.description,
          notif.department_name || 'Geral',
          notif.type as NotificationType,
          notif.requires_acceptance,
          notif.id
        )
      })

      setNotifications(mappedNotifications)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar notificações')
      console.error('Erro ao carregar notificações:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (id: number | null) => {
    if (!id || !user) return

    try {
      await notificationsApi.respond(id, user.id, 'accepted')
      await loadNotifications()
    } catch (err) {
      console.error('Erro ao aceitar notificação:', err)
    }
  }

  const handleReject = async (id: number | null) => {
    if (!id || !user) return

    try {
      await notificationsApi.respond(id, user.id, 'rejected')
      await loadNotifications()
    } catch (err) {
      console.error('Erro ao rejeitar notificação:', err)
    }
  }

  const handleRead = async (id: number | null) => {
    if (!id || !user) return

    try {
      await notificationsApi.view(id, user.id)
      // Não recarregar todas as notificações, apenas atualizar o estado local se necessário
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err)
    }
  }

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <ProfileLeft onRefresh={loadNotifications} />
        <div className="app__content">
          <div className="app__content-header">
            <h2 className="app__content-title">
              Notificações Recebidas
            </h2>
            <p className="app__content-subtitle">
              {loading ? 'Carregando...' : (
                <>
                  {notifications.length} {notifications.length === 1 ? 'notificação' : 'notificações'} disponíveis
                </>
              )}
            </p>
          </div>
          {error && (
            <div style={{ 
              padding: '16px', 
              background: '#fed7d7', 
              color: '#c53030', 
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}
          <div className="app__notifications-list">
            {loading ? (
              <div className="app__empty-state">
                <span className="app__empty-icon">⟳</span>
                <p className="app__empty-text">Carregando notificações...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <Notification
                  key={notification.id}
                  notification={notification}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onRead={handleRead}
                />
              ))
            ) : (
              <div className="app__empty-state">
                <span className="app__empty-icon">—</span>
                <p className="app__empty-text">Nenhuma notificação disponível</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

