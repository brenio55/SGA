import { useState, useEffect } from 'react'
import "./Header.css"

function Header() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__brand">
          <div className="header__logo">
            <span className="header__logo-icon">⚡</span>
          </div>
          <div className="header__brand-text">
            <h1 className="header__title">DiVSeC</h1>
            <p className="header__subtitle">Cloud Technology</p>
          </div>
        </div>
        
        <div className="header__datetime">
          <div className="header__date">
            <span className="header__date-icon">📅</span>
            <span className="header__date-text">{formatDate(currentDateTime)}</span>
          </div>
          <div className="header__time">
            <span className="header__time-icon">🕐</span>
            <span className="header__time-text">{formatTime(currentDateTime)}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
