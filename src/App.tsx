import { useState } from 'react'
import Header from './Header'
import ProfileLeft from './ProfileLeft'
import Notification from './components/Notification'
import { Notification as NotificationClass, NotificationType } from './classes/Notification'

import './App.css'

function App() {
  // Dados mockados de notificações (será substituído por dados da API)
  const [notifications] = useState<NotificationClass[]>([
    new NotificationClass(
      "Atualização do Sistema de Gestão",
      "Nova versão do sistema disponível. Por favor, revise as mudanças e confirme o aceite.",
      "TI",
      NotificationType.IMPORTANT,
      true,
      1
    ),
    new NotificationClass(
      "Reunião de Planejamento Mensal",
      "Reunião agendada para o dia 15/01 às 14:00. Confirme sua presença.",
      "Operações",
      NotificationType.NORMAL,
      true,
      2
    ),
    new NotificationClass(
      "Aprovação de Orçamento Urgente",
      "Necessária aprovação imediata do orçamento do Q1. Prazo: hoje às 18:00.",
      "Financeiro",
      NotificationType.URGENT,
      true,
      3
    ),
    new NotificationClass(
      "Novo Processo de Recrutamento",
      "Foi implementado um novo processo de recrutamento. Leia as diretrizes.",
      "RH",
      NotificationType.INFO,
      false,
      4
    ),
    new NotificationClass(
      "Manutenção Programada",
      "Sistema ficará indisponível no sábado das 02:00 às 06:00 para manutenção.",
      "TI",
      NotificationType.IMPORTANT,
      false,
      5
    ),
    new NotificationClass(
      "Relatório Mensal Disponível",
      "O relatório de desempenho do mês passado já está disponível para consulta.",
      "Operações",
      NotificationType.INFO,
      false,
      6
    )
  ])

  const handleAccept = (id: number | null) => {
    console.log('Notificação aceita:', id)
    // Aqui será feita a chamada à API
  }

  const handleReject = (id: number | null) => {
    console.log('Notificação rejeitada:', id)
    // Aqui será feita a chamada à API
  }

  const handleRead = (id: number | null) => {
    console.log('Notificação lida:', id)
    // Aqui será feita a chamada à API
  }

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <ProfileLeft />
        <div className="app__content">
          <div className="app__content-header">
            <h2 className="app__content-title">
              <span className="app__content-icon">📬</span>
              Notificações Recebidas
            </h2>
            <p className="app__content-subtitle">
              {notifications.length} {notifications.length === 1 ? 'notificação' : 'notificações'} disponíveis
            </p>
          </div>
          <div className="app__notifications-list">
            {notifications.length > 0 ? (
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
                <span className="app__empty-icon">📭</span>
                <p className="app__empty-text">Nenhuma notificação disponível</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
