import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import App from './App.jsx'
import Login from './login.jsx' // Make sure this file exists
import Registration from './Registration.jsx' // Make sure this file exists
import Dashboard, { DashboardOverview } from './Dashboard'
import Events from './Events'
import UserEvents from './UserEvents'
import ForgotPassword from './ForgotPassword.jsx'
import ResetPassword from './ResetPassword.jsx'
import Home from './Home.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import Profile from './Profile.jsx'
import Participants from './Participants.jsx'
import AdminUserProfile from './AdminUserProfile.jsx'
import AdminTrails from './AdminTrails.jsx'
import AdminProfile from './AdminProfile.jsx'
import UserRoutes from './UserRoutes.jsx'
import Troutes from './Troutes.jsx'
import Achievements from './Achievements.jsx'
import AdminEcommerce from './AdminEcommerce.jsx'
import UserEcommerce from './UserEcommerce.jsx'

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

        {/* Admin Dashboard with nested routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <Dashboard />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardOverview />} />
          <Route path="events" element={<Events />} />
          <Route path="participants" element={<Participants />} />
          <Route path="routes" element={<AdminTrails />} />
          <Route path="ecommerce" element={<AdminEcommerce />} />
          <Route path="users/:id" element={<AdminUserProfile />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="/events" element={
          <ProtectedRoute requiredRole="user">
            <UserEvents />
          </ProtectedRoute>
        } />

        <Route path="/routes" element={
          <ProtectedRoute requiredRole="user">
            <Troutes />
          </ProtectedRoute>
        } />

        <Route path="/achievements" element={
          <ProtectedRoute requiredRole="user">
            <Achievements />
          </ProtectedRoute>
        } />

        <Route path="/ecommerce" element={
          <ProtectedRoute requiredRole="user">
            <UserEcommerce />
          </ProtectedRoute>
        } />

        {/* Keep profile global */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
