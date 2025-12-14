import { useState, useEffect } from 'react'
import Header from '../Header'
import ProfileLeft from '../ProfileLeft'
import Notification from '../components/Notification'
import { Notification as NotificationClass, NotificationType, NotificationStatus } from '../classes/Notification'
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
  user_response?: 'accepted' | 'rejected' | null
  view_status?: 'read' | 'pending'
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
        // Determinar o status baseado na resposta do usuário e visualização
        let status: NotificationStatus = NotificationStatus.PENDING
        if (notif.user_response === 'accepted') {
          status = NotificationStatus.ACCEPTED
        } else if (notif.user_response === 'rejected') {
          status = NotificationStatus.REJECTED
        } else if (notif.view_status === 'read') {
          status = NotificationStatus.READ
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
      // Atualizar o estado local imediatamente
      setNotifications(prev => prev.map(notif => {
        if (notif.id === id) {
          notif.status = NotificationStatus.ACCEPTED
        }
        return notif
      }))
      // Recarregar para garantir sincronização
      await loadNotifications()
    } catch (err) {
      console.error('Erro ao aceitar notificação:', err)
      // Em caso de erro, recarregar para reverter estado
      await loadNotifications()
    }
  }

  const handleReject = async (id: number | null) => {
    if (!id || !user) return

    try {
      await notificationsApi.respond(id, user.id, 'rejected')
      // Atualizar o estado local imediatamente
      setNotifications(prev => prev.map(notif => {
        if (notif.id === id) {
          notif.status = NotificationStatus.REJECTED
        }
        return notif
      }))
      // Recarregar para garantir sincronização
      await loadNotifications()
    } catch (err) {
      console.error('Erro ao rejeitar notificação:', err)
      // Em caso de erro, recarregar para reverter estado
      await loadNotifications()
    }
  }

  const handleRead = async (id: number | null) => {
    if (!id || !user) return

    try {
      await notificationsApi.view(id, user.id)
      // Recarregar notificações para atualizar a lista
      // Notificações sem aceite serão removidas da lista (vão para histórico)
      // Notificações com aceite permanecerão na lista
      await loadNotifications()
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

