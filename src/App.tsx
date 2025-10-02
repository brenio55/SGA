import { useState } from 'react'
import Header from './Header'
import ProfileLeft from './ProfileLeft'
import './App.css'

function App() {
  return (
    <>
      <Header></Header>
      <main className="">
        <ProfileLeft></ProfileLeft>
        <div className="rSideHome"></div>
      </main>
      <footer>

      </footer>
    </>
  )
}

export default App
