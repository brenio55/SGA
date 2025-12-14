import { useState, useEffect } from 'react'
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

  // Sempre usar a notificação real se disponível, caso contrário usar o mock
  const currentNotification = notification || mockNotification

  const [isExpanded, setIsExpanded] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  // Usar o status da notificação passada como prop, ou o status padrão
  const [localStatus, setLocalStatus] = useState<NotificationStatus>(
    notification?.status || mockNotification.status
  )

  // Sincronizar o status quando a notificação mudar
  useEffect(() => {
    if (notification) {
      setLocalStatus(notification.status)
    }
  }, [notification?.status])

  const descriptionLength = currentNotification.description?.length || 0
  const shouldShowPopup = descriptionLength > 255

  const handleAccept = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    if (onAccept) {
      onAccept(currentNotification.id)
    }
    setLocalStatus(NotificationStatus.ACCEPTED)
  }

  const handleReject = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    if (onReject) {
      onReject(currentNotification.id)
    }
    setLocalStatus(NotificationStatus.REJECTED)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Sempre marcar como visualizada quando clicada/aberta
    if (localStatus === NotificationStatus.PENDING && onRead && currentNotification.id) {
      onRead(currentNotification.id)
      // Atualizar status local apenas se não requer aceitação
      if (!currentNotification.requiresAcceptance) {
        setLocalStatus(NotificationStatus.READ)
      }
    }
    
    if (shouldShowPopup) {
      setShowPopup(true)
    } else {
      if (!isExpanded) {
        setIsExpanded(true)
      } else {
        setIsExpanded(false)
      }
    }
  }

  const handleClosePopup = () => {
    setShowPopup(false)
  }

        const getTypeClass = () => {
          switch (currentNotification.type) {
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
    <>
      <div 
        className={`notification-card ${getStatusClass()} ${isExpanded ? 'notification-card--expanded' : ''}`}
        onClick={handleClick}
      >
        <div className="notification-card__header">
          <div className="notification-card__left">
            <div className="notification-card__title-section">
              <h4 className="notification-card__title">{currentNotification.title}</h4>
              <span className="notification-card__id">ID: {currentNotification.id || 'N/A'}</span>
              {localStatus === NotificationStatus.PENDING && (
                <span className="notification-badge notification-badge--new">Nova</span>
              )}
            </div>
            <p className="notification-card__department">
              {currentNotification.department}
            </p>
          </div>
          <div className="notification-card__right">
            <div className="notification-card__time">
              {currentNotification.formatTime()}
            </div>
            <span className={`notification-card__type ${getTypeClass()}`}>
              {currentNotification.type === NotificationType.URGENT ? 'Urgente' :
               currentNotification.type === NotificationType.IMPORTANT ? 'Importante' :
               currentNotification.type === NotificationType.INFO ? 'Informativa' : 'Normal'}
            </span>
          </div>
        </div>

        {isExpanded && !shouldShowPopup && (
          <div className="notification-card__body">
            <p className="notification-card__description">{currentNotification.description}</p>
            <div className="notification-card__date">
              {currentNotification.formatDate()}
            </div>

            {currentNotification.requiresAcceptance &&
             (localStatus === NotificationStatus.PENDING || localStatus === NotificationStatus.READ) && (
              <div className="notification-card__actions">
                <button 
                  className="notification-button notification-button--accept"
                  onClick={handleAccept}
                >
                  ✓ Aceitar
                </button>
                {/* <button 
                  className="notification-button notification-button--reject"
                  onClick={handleReject}
                >
                  ✕ Rejeitar
                </button> */}
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

        {isExpanded && shouldShowPopup && (
          <div className="notification-card__body">
            <p className="notification-card__description">
              {currentNotification.description.substring(0, 255)}...
            </p>
            <div className="notification-card__date">
              {currentNotification.formatDate()}
            </div>
            <button 
              className="notification-card__read-more"
              onClick={(e) => {
                e.stopPropagation()
                // Marcar como visualizada ao clicar em "Ler mais"
                if (localStatus === NotificationStatus.PENDING && onRead && currentNotification.id) {
                  onRead(currentNotification.id)
                  if (!currentNotification.requiresAcceptance) {
                    setLocalStatus(NotificationStatus.READ)
                  }
                }
                setShowPopup(true)
              }}
            >
              Ler mais
            </button>
          </div>
        )}
      </div>

            {showPopup && (
              <div className="notification-popup-overlay" onClick={handleClosePopup}>
                <div className="notification-popup" onClick={(e) => e.stopPropagation()}>
                  <div className="notification-popup__header">
                    <h3 className="notification-popup__title">{currentNotification.title}</h3>
                    <button className="notification-popup__close" onClick={handleClosePopup}>×</button>
                  </div>
                  <div className="notification-popup__body">
                    <div className="notification-popup__meta">
                      <span className="notification-popup__department">{currentNotification.department}</span>
                      <span className="notification-popup__date">{currentNotification.formatDate()}</span>
                      <span className={`notification-popup__type ${getTypeClass()}`}>
                        {currentNotification.type === NotificationType.URGENT ? 'Urgente' :
                         currentNotification.type === NotificationType.IMPORTANT ? 'Importante' :
                         currentNotification.type === NotificationType.INFO ? 'Informativa' : 'Normal'}
                      </span>
                    </div>
                    <p className="notification-popup__description">{currentNotification.description}</p>

                    {currentNotification.requiresAcceptance &&
               (localStatus === NotificationStatus.PENDING || localStatus === NotificationStatus.READ) && (
                <div className="notification-popup__actions">
                  <button 
                    className="notification-button notification-button--accept"
                    onClick={handleAccept}
                  >
                    ✓ Aceitar
                  </button>
                  <button 
                    className="notification-button notification-button--reject"
                    onClick={handleReject}
                  >
                    ✕ Rejeitar
                  </button>
                </div>
              )}

              {localStatus === NotificationStatus.ACCEPTED && (
                <div className="notification-popup__status-message notification-popup__status-message--success">
                  ✓ Notificação aceita
                </div>
              )}

              {localStatus === NotificationStatus.REJECTED && (
                <div className="notification-popup__status-message notification-popup__status-message--rejected">
                  ✕ Notificação rejeitada
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Notification