import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import UserLogin from './pages/UserLogin'
import UserSignup from './pages/UserSignup'
import CaptainSignup from './pages/CaptainSignup'
import CaptainLogin from './pages/CaptainLogin'
import UserDashboard from './pages/UserDashboard'
import CaptainDashboard from './pages/CaptainDashboard'
import RideHistory from './pages/RideHistory'
import { ProtectedRoute } from './components/ProtectedRoute'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />

        <Route path='/login' element={<UserLogin />} />
        <Route path='/signup' element={<UserSignup />} />
        <Route path='/captain-signup' element={<CaptainSignup />} />
        <Route path='/captain-login' element={<CaptainLogin />} />

        <Route
          path='/user-home'
          element={
            <ProtectedRoute role='user'>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/ride-history'
          element={
            <ProtectedRoute role='user'>
              <RideHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path='/captain-home'
          element={
            <ProtectedRoute role='captain'>
              <CaptainDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
