import { useState } from 'react'
import { Notification as NotificationClass, NotificationType, NotificationStatus } from '../classes/Notification'
import "./Notification.css"

interface NotificationProps {
  notification?: NotificationClass
  onAccept?: (id: number | null) => void
  onReject?: (id: number | null) => void
  onRead?: (id: number | null) => void
}

function Notification({ 
  notification, 
  onAccept, 
  onReject, 
  onRead 
}: NotificationProps) {
  // Dados mockados para demonstração (será substituído por dados reais)
  const mockNotification: NotificationClass = notification || new NotificationClass(
    "Atualização do Sistema de Gestão",
    "Nova versão do sistema disponível. Por favor, revise as mudanças e confirme o aceite.",
    "TI",
    NotificationType.IMPORTANT,
    true
  )

  const [isExpanded, setIsExpanded] = useState(false)
  const [localStatus, setLocalStatus] = useState<NotificationStatus>(mockNotification.status)

  const handleAccept = () => {
    if (onAccept) {
      onAccept(mockNotification.id)
    }
    setLocalStatus(NotificationStatus.ACCEPTED)
  }

  const handleReject = () => {
    if (onReject) {
      onReject(mockNotification.id)
    }
    setLocalStatus(NotificationStatus.REJECTED)
  }

  const handleClick = () => {
    if (!isExpanded) {
      setIsExpanded(true)
      if (localStatus === NotificationStatus.PENDING && onRead) {
        onRead(mockNotification.id)
        setLocalStatus(NotificationStatus.READ)
      }
    } else {
      setIsExpanded(false)
    }
  }

  const getTypeClass = () => {
    switch (mockNotification.type) {
      case NotificationType.URGENT:
        return 'notification-type--urgent'
      case NotificationType.IMPORTANT:
        return 'notification-type--important'
      case NotificationType.INFO:
        return 'notification-type--info'
      default:
        return 'notification-type--normal'
    }
  }

  const getStatusClass = () => {
    switch (localStatus) {
      case NotificationStatus.ACCEPTED:
        return 'notification-status--accepted'
      case NotificationStatus.REJECTED:
        return 'notification-status--rejected'
      case NotificationStatus.READ:
        return 'notification-status--read'
      default:
        return 'notification-status--pending'
    }
  }

  return (
    <div 
      className={`notification-card ${getStatusClass()} ${isExpanded ? 'notification-card--expanded' : ''}`}
      onClick={handleClick}
    >
      <div className="notification-card__header">
        <div className="notification-card__left">
          <div className="notification-card__title-section">
            <h4 className="notification-card__title">{mockNotification.title}</h4>
            {localStatus === NotificationStatus.PENDING && (
              <span className="notification-badge notification-badge--new">Nova</span>
            )}
          </div>
          <p className="notification-card__department">
            <span className="notification-card__department-icon">🏢</span>
            {mockNotification.department}
          </p>
        </div>
        <div className="notification-card__right">
          <div className="notification-card__time">
            <span className="notification-card__time-icon">🕐</span>
            {mockNotification.formatTime()}
          </div>
          <span className={`notification-card__type ${getTypeClass()}`}>
            {mockNotification.type === NotificationType.URGENT ? 'Urgente' :
             mockNotification.type === NotificationType.IMPORTANT ? 'Importante' :
             mockNotification.type === NotificationType.INFO ? 'Informativa' : 'Normal'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="notification-card__body">
          <p className="notification-card__description">{mockNotification.description}</p>
          <div className="notification-card__date">
            <span>📅</span> {mockNotification.formatDate()}
          </div>
          
          {mockNotification.requiresAcceptance && localStatus === NotificationStatus.PENDING && (
            <div className="notification-card__actions">
              <button 
                className="notification-button notification-button--accept"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAccept()
                }}
              >
                ✓ Aceitar
              </button>
              <button 
                className="notification-button notification-button--reject"
                onClick={(e) => {
                  e.stopPropagation()
                  handleReject()
                }}
              >
                ✕ Rejeitar
              </button>
            </div>
          )}

          {localStatus === NotificationStatus.ACCEPTED && (
            <div className="notification-card__status-message notification-card__status-message--success">
              ✓ Notificação aceita
            </div>
          )}

          {localStatus === NotificationStatus.REJECTED && (
            <div className="notification-card__status-message notification-card__status-message--rejected">
              ✕ Notificação rejeitada
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Notification