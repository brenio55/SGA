import { useState } from 'react'
import Header from './Header'
import ProfileLeft from './ProfileLeft'
import Notification from './components/Notification'

import './App.css'

function App() {
  return (
    <>
      <Header></Header>
      <main className="">
        <ProfileLeft></ProfileLeft>
        <div className="rSideHome">
          <p>Novas notificações recebidas</p>
          <div>
            <Notification></Notification>
            <Notification></Notification>
            <Notification></Notification>
            <Notification></Notification>
            <Notification></Notification>
            <Notification></Notification>
            <Notification></Notification>
            <Notification></Notification>
            <Notification></Notification>
            <Notification></Notification>
            <Notification></Notification>
            <Notification></Notification>
            <Notification></Notification>
          </div>
        </div>
      </main>
      <footer>

      </footer>
    </>
  )
}

export default App
