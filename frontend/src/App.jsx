import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignupPage'
import './App.css'
import InventoryManagement from './pages/HomePage'

function App() {

  return (
    <div>
      <Routes>
        <Route path='/' element={<LoginPage />}></Route>
        <Route path='/signup' element={<SignUpPage />}></Route>
        <Route path='/dashboard' element={<InventoryManagement />}></Route>
      </Routes>

      <Toaster />
    </div>
  )
}

export default App
