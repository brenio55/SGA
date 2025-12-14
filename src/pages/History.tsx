import { useState, useEffect } from 'react'
import Header from '../Header'
import ProfileLeft from '../ProfileLeft'
import Notification from '../components/Notification'
import { Notification as NotificationClass, NotificationType, NotificationStatus } from '../classes/Notification'
import { useAuth } from '../contexts/AuthContext'
import { notificationsApi } from '../services/api'
import './History.css'

interface NotificationData {
  id: number
  title: string
  description: string
  type: string
  requires_acceptance: boolean
  department_name?: string
  created_at: string
  user_response?: 'accepted' | 'rejected' | null
  viewed_at: string
  responded_at?: string
}

function History() {
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
      const data = await notificationsApi.getViewedByUser(user.id, user.company_id)
      const notificationsList = Array.isArray(data) ? data : []

      const mappedNotifications = notificationsList.map((notif: NotificationData) => {
        // Determinar o status baseado na resposta do usuário
        let status: NotificationStatus = NotificationStatus.READ
        if (notif.user_response === 'accepted') {
          status = NotificationStatus.ACCEPTED
        } else if (notif.user_response === 'rejected') {
          status = NotificationStatus.REJECTED
        }

        const notification = new NotificationClass(
          notif.title,
          notif.description,
          notif.department_name || 'Geral',
          notif.type as NotificationType,
          notif.requires_acceptance,
          notif.id,
          status
        )
        return notification
      })

      setNotifications(mappedNotifications)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar histórico')
      console.error('Erro ao carregar histórico:', err)
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

  const handleRead = async () => {
    // Não fazer nada no histórico, pois todas já foram visualizadas
  }

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <ProfileLeft onRefresh={loadNotifications} />
        <div className="app__content">
          <div className="app__content-header">
            <h2 className="app__content-title">
              Histórico de Notificações
            </h2>
            <p className="app__content-subtitle">
              {loading ? 'Carregando...' : (
                <>
                  {notifications.length} {notifications.length === 1 ? 'notificação visualizada' : 'notificações visualizadas'}
                </>
              )}
            </p>
          </div>
          {error && (
            <div className="app__error">
              {error}
            </div>
          )}
          {loading ? (
            <div className="app__loading">
              <p>Carregando histórico...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="app__empty">
              <p>Nenhuma notificação visualizada ainda.</p>
            </div>
          ) : (
            <div className="app__notifications">
              {notifications.map((notification) => (
                <Notification
                  key={notification.id}
                  notification={notification}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onRead={handleRead}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default History

