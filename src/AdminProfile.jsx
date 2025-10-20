import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEnvelope, FaKey, FaPhone, FaSave, FaSpinner, FaUser } from 'react-icons/fa'
import API_BASE_URL from './config/api'

const inputStyles = 'w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 transition'

function AdminProfile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [basicForm, setBasicForm] = useState({
    firstName: '',
    secondName: '',
    email: '',
    phone: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(true)
  const [savingBasic, setSavingBasic] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (!token || !storedUser) {
      navigate('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(storedUser)
      if (parsedUser.role !== 'admin') {
        navigate('/home')
        return
      }
    } catch (err) {
      console.error('Failed to parse stored user:', err)
      navigate('/login')
      return
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          throw new Error(err?.message || 'Failed to load profile')
        }

        const data = await response.json()
        setProfile(data)
        setBasicForm({
          firstName: data?.firstName || '',
          secondName: data?.secondName || '',
          email: data?.email || '',
          phone: data?.phone || ''
        })
        setError('')
      } catch (err) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [navigate])

  const handleBasicChange = (event) => {
    const { name, value } = event.target
    setBasicForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const saveBasicDetails = async () => {
    setSavingBasic(true)
    setError('')
    setSuccessMessage('')

    if (!basicForm.firstName.trim() || !basicForm.email.trim()) {
      setError('First name and email are required.')
      setSavingBasic(false)
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setError('Authentication required. Please log in again.')
      setSavingBasic(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(basicForm)
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update profile')
      }

      setProfile(data)
      setSuccessMessage('Profile details updated successfully.')

      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          const updated = {
            ...parsed,
            firstName: data?.firstName ?? basicForm.firstName,
            secondName: data?.secondName ?? basicForm.secondName,
            email: data?.email ?? basicForm.email,
            phone: data?.phone ?? basicForm.phone
          }
          localStorage.setItem('user', JSON.stringify(updated))
        } catch (err) {
          console.error('Failed to update cached user:', err)
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSavingBasic(false)
      if (!error) {
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    }
  }

  const savePassword = async () => {
    setSavingPassword(true)
    setError('')
    setSuccessMessage('')

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('All password fields are required.')
      setSavingPassword(false)
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirm password do not match.')
      setSavingPassword(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.')
      setSavingPassword(false)
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setError('Authentication required. Please log in again.')
      setSavingPassword(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update password')
      }

      setSuccessMessage('Password updated successfully.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.message || 'Failed to update password')
    } finally {
      setSavingPassword(false)
      if (!error) {
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <FaSpinner className="animate-spin text-xl" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/30 flex items-center justify-center text-2xl font-semibold text-orange-300">
              {profile?.firstName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Profile</h1>
              <p className="text-sm text-slate-400">Manage your personal details and security settings.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-300">
            <div className="flex items-center gap-2"><FaUser className="text-orange-400" />{profile?.firstName} {profile?.secondName}</div>
            <div className="flex items-center gap-2"><FaEnvelope className="text-orange-400" />{profile?.email}</div>
            <div className="flex items-center gap-2"><FaPhone className="text-orange-400" />{profile?.phone || 'N/A'}</div>
            <div className="flex items-center gap-2"><FaKey className="text-orange-400" /><span className="capitalize">{profile?.role || 'admin'}</span></div>
          </div>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-200 px-4 py-3 rounded-xl">
            {successMessage}
          </div>
        )}

        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300">
              <FaUser />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Basic Information</h2>
              <p className="text-sm text-slate-400">Update your contact details and display information.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="space-y-2 text-sm text-slate-300">
              <span>First Name</span>
              <input
                type="text"
                name="firstName"
                value={basicForm.firstName}
                onChange={handleBasicChange}
                className={inputStyles}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Last Name</span>
              <input
                type="text"
                name="secondName"
                value={basicForm.secondName}
                onChange={handleBasicChange}
                className={inputStyles}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={basicForm.email}
                onChange={handleBasicChange}
                className={inputStyles}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Phone</span>
              <input
                type="tel"
                name="phone"
                value={basicForm.phone}
                onChange={handleBasicChange}
                className={inputStyles}
              />
            </label>
          </div>

          <div>
            <button
              onClick={saveBasicDetails}
              disabled={savingBasic}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-60"
            >
              {savingBasic ? <FaSpinner className="animate-spin" /> : <FaSave />}<span>Save Changes</span>
            </button>
          </div>
        </section>

        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300">
              <FaKey />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Password</h2>
              <p className="text-sm text-slate-400">Change your account password to keep things secure.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Current Password</span>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className={inputStyles}
              />
            </label>
            <div className="grid grid-cols-1 gap-5">
              <label className="space-y-2 text-sm text-slate-300">
                <span>New Password</span>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className={inputStyles}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span>Confirm New Password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className={inputStyles}
                />
              </label>
            </div>
          </div>

          <div>
            <button
              onClick={savePassword}
              disabled={savingPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-60"
            >
              {savingPassword ? <FaSpinner className="animate-spin" /> : <FaSave />}<span>Update Password</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminProfile