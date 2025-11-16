import { useState, useEffect } from 'react'
import { notificationsApi } from '../../services/api'
import './NotificationDetails.css'

interface NotificationView {
  id: number
  user_id: number
  full_name: string
  role: string
  department_name?: string
  group_name?: string
  viewed_at: string
}

interface NotificationResponse {
  id: number
  user_id: number
  full_name: string
  role: string
  department_name?: string
  group_name?: string
  response_type: 'accepted' | 'rejected'
  responded_at: string
}

interface NotificationDetailsProps {
  notificationId: number
  onClose: () => void
}

function NotificationDetails({ notificationId, onClose }: NotificationDetailsProps) {
  const [views, setViews] = useState<NotificationView[]>([])
  const [responses, setResponses] = useState<NotificationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'views' | 'responses' | 'summary'>('summary')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationId])

  const loadDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const [viewsData, responsesData] = await Promise.all([
        notificationsApi.getViews(notificationId),
        notificationsApi.getResponses(notificationId),
      ])

      setViews(Array.isArray(viewsData) ? viewsData : [])
      setResponses(Array.isArray(responsesData) ? responsesData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes')
      console.error('Erro ao carregar detalhes da notificação:', err)
    } finally {
      setLoading(false)
    }
  }

  const acceptedCount = responses.filter(r => r.response_type === 'accepted').length
  const rejectedCount = responses.filter(r => r.response_type === 'rejected').length

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="notification-details-overlay" onClick={onClose}>
        <div className="notification-details" onClick={(e) => e.stopPropagation()}>
          <div className="notification-details__loading">
            <span className="notification-details__spinner">⟳</span>
            <p>Carregando detalhes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="notification-details-overlay" onClick={onClose}>
      <div className="notification-details" onClick={(e) => e.stopPropagation()}>
        <div className="notification-details__header">
          <h2 className="notification-details__title">Detalhes da Notificação</h2>
          <button className="notification-details__close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && (
          <div className="notification-details__error">
            {error}
          </div>
        )}

        <div className="notification-details__tabs">
          <button
            className={`notification-details__tab ${activeTab === 'summary' ? 'notification-details__tab--active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            📊 Resumo
          </button>
          <button
            className={`notification-details__tab ${activeTab === 'views' ? 'notification-details__tab--active' : ''}`}
            onClick={() => setActiveTab('views')}
          >
            👁️ Visualizações ({views.length})
          </button>
          <button
            className={`notification-details__tab ${activeTab === 'responses' ? 'notification-details__tab--active' : ''}`}
            onClick={() => setActiveTab('responses')}
          >
            ✅ Respostas ({responses.length})
          </button>
        </div>

        <div className="notification-details__content">
          {activeTab === 'summary' && (
            <div className="notification-details__summary">
              <div className="notification-details__stat-cards">
                <div className="notification-details__stat-card">
                  <div className="notification-details__stat-icon">👁️</div>
                  <div className="notification-details__stat-info">
                    <h3 className="notification-details__stat-value">{views.length}</h3>
                    <p className="notification-details__stat-label">Visualizações</p>
                  </div>
                </div>
                <div className="notification-details__stat-card notification-details__stat-card--accepted">
                  <div className="notification-details__stat-icon">✓</div>
                  <div className="notification-details__stat-info">
                    <h3 className="notification-details__stat-value">{acceptedCount}</h3>
                    <p className="notification-details__stat-label">Aceitações</p>
                  </div>
                </div>
                <div className="notification-details__stat-card notification-details__stat-card--rejected">
                  <div className="notification-details__stat-icon">✕</div>
                  <div className="notification-details__stat-info">
                    <h3 className="notification-details__stat-value">{rejectedCount}</h3>
                    <p className="notification-details__stat-label">Rejeições</p>
                  </div>
                </div>
                <div className="notification-details__stat-card">
                  <div className="notification-details__stat-icon">📝</div>
                  <div className="notification-details__stat-info">
                    <h3 className="notification-details__stat-value">{responses.length}</h3>
                    <p className="notification-details__stat-label">Total de Respostas</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'views' && (
            <div className="notification-details__list">
              {views.length === 0 ? (
                <div className="notification-details__empty">
                  <span className="notification-details__empty-icon">👁️</span>
                  <p>Nenhuma visualização registrada</p>
                </div>
              ) : (
                <div className="notification-details__table-container">
                  <table className="notification-details__table">
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Departamento</th>
                        <th>Grupo</th>
                        <th>Role</th>
                        <th>Visualizado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {views.map((view) => (
                        <tr key={view.id}>
                          <td>
                            <div className="notification-details__user-info">
                              <strong>{view.full_name}</strong>
                            </div>
                          </td>
                          <td>{view.department_name || 'N/A'}</td>
                          <td>{view.group_name || 'N/A'}</td>
                          <td>
                            <span className="notification-details__role-badge">
                              {view.role}
                            </span>
                          </td>
                          <td>{formatDate(view.viewed_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'responses' && (
            <div className="notification-details__list">
              {responses.length === 0 ? (
                <div className="notification-details__empty">
                  <span className="notification-details__empty-icon">✅</span>
                  <p>Nenhuma resposta registrada</p>
                </div>
              ) : (
                <div className="notification-details__table-container">
                  <table className="notification-details__table">
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Departamento</th>
                        <th>Grupo</th>
                        <th>Role</th>
                        <th>Resposta</th>
                        <th>Respondido em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((response) => (
                        <tr key={response.id}>
                          <td>
                            <div className="notification-details__user-info">
                              <strong>{response.full_name}</strong>
                            </div>
                          </td>
                          <td>{response.department_name || 'N/A'}</td>
                          <td>{response.group_name || 'N/A'}</td>
                          <td>
                            <span className="notification-details__role-badge">
                              {response.role}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`notification-details__response-badge ${
                                response.response_type === 'accepted'
                                  ? 'notification-details__response-badge--accepted'
                                  : 'notification-details__response-badge--rejected'
                              }`}
                            >
                              {response.response_type === 'accepted' ? '✓ Aceito' : '✕ Rejeitado'}
                            </span>
                          </td>
                          <td>{formatDate(response.responded_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationDetails

