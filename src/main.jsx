import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import App from './App.jsx'
import Login from './login.jsx' // Make sure this file exists
import Registration from './Registration.jsx' // Make sure this file exists
import Dashboard from './Dashboard'
import Events from './Events'
import UserEvents from './UserEvents'
import ForgotPassword from './ForgotPassword.jsx'
import ResetPassword from './ResetPassword.jsx'
import Home from './Home.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute requiredRole="user">
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/events" element={
          <ProtectedRoute requiredRole="user">
            <UserEvents />
          </ProtectedRoute>
        } />
        <Route path="/admin/events" element={
          <ProtectedRoute requiredRole="admin">
            <Events />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
