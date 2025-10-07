import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FaMapMarkedAlt,
  FaUser,
  FaSignOutAlt,
  FaCalendarAlt,
  FaRoute,
  FaTrophy,
  FaBell,
  FaSearch,
  FaCompass,
  FaBars,
  FaTimes
} from 'react-icons/fa'

const formatMsToTime = (ms) => {
  if (ms == null) return ''
  const sign = ms < 0 ? '-' : ''
  ms = Math.abs(ms)
  const h = Math.floor(ms / 3600000); ms %= 3600000
  const m = Math.floor(ms / 60000); ms %= 60000
  const s = Math.floor(ms / 1000); const mm = ms % 1000
  const p2 = (n) => String(n).padStart(2,'0'); const p3 = (n)=>String(n).padStart(3,'0')
  return `${sign}${p2(h)}:${p2(m)}:${p2(s)}.${p3(mm)}`
}

function Achievements(){
  const [user, setUser] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [search, setSearch] = useState('')
  const [myOnly, setMyOnly] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
      fetchProfileData()
      fetchAllResults()
    } else {
      navigate('/login')
    }
  }, [navigate])

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
      }
    } catch (e) {
      console.error('Error fetching profile:', e)
    }
  }

  const fetchAllResults = async () => {
    try{
      setLoading(true); setError('')
      const res = await fetch('http://localhost:5000/api/results', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (!res.ok){ setResults([]); return }
      const data = await res.json()
      setResults(Array.isArray(data.results) ? data.results : [])
    }catch(e){
      console.error(e); setError('Failed to load achievements')
    }finally{ setLoading(false) }
  }

  // Live updates via SSE
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    const es = new EventSource(`http://localhost:5000/api/events/results/stream?token=${encodeURIComponent(token)}`)
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data?.event === 'result_saved') {
          fetchAllResults()
        }
      } catch {}
    }
    es.onerror = () => {
      es.close()
    }
    return () => es.close()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleProfileClick = () => {
    navigate('/profile')
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const filtered = results.filter(r => {
    const text = `${r.event?.name||''} ${r.race?.name||''} ${r.user?.firstName||''} ${r.user?.secondName||''}`.toLowerCase()
    const matches = text.includes(search.toLowerCase())
    const mine = !myOnly || (user && r.user && r.user._id === user._id)
    return matches && mine
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="loadingMountain1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(120, 113, 108, 0.20)" />
                <stop offset="50%" stopColor="rgba(168, 162, 158, 0.15)" />
                <stop offset="100%" stopColor="rgba(87, 83, 81, 0.10)" />
              </linearGradient>
              <linearGradient id="loadingMountain2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(249, 115, 22, 0.12)" />
                <stop offset="50%" stopColor="rgba(251, 191, 36, 0.08)" />
                <stop offset="100%" stopColor="rgba(245, 158, 11, 0.06)" />
              </linearGradient>
            </defs>
            <path d="M0,500 L200,300 L400,450 L600,250 L800,400 L1000,200 L1200,350 L1200,800 L0,800 Z" fill="url(#loadingMountain1)" className="animate-[mountainFloat1_15s_ease-in-out_infinite] opacity-60" />
            <path d="M0,600 L150,400 L350,550 L550,350 L750,500 L950,300 L1200,450 L1200,800 L0,800 Z" fill="url(#loadingMountain2)" className="animate-[mountainFloat2_12s_ease-in-out_infinite_reverse] opacity-40" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-stone-100 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="mountain1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(120, 113, 108, 0.15)" />
              <stop offset="50%" stopColor="rgba(168, 162, 158, 0.12)" />
              <stop offset="100%" stopColor="rgba(87, 83, 81, 0.08)" />
            </linearGradient>
            <linearGradient id="mountain2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(168, 162, 158, 0.12)" />
              <stop offset="50%" stopColor="rgba(120, 113, 108, 0.15)" />
              <stop offset="100%" stopColor="rgba(214, 211, 209, 0.10)" />
            </linearGradient>
            <linearGradient id="mountain3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(87, 83, 81, 0.10)" />
              <stop offset="50%" stopColor="rgba(168, 162, 158, 0.08)" />
              <stop offset="100%" stopColor="rgba(120, 113, 108, 0.06)" />
            </linearGradient>
          </defs>
          <path d="M0,400 L200,200 L400,350 L600,150 L800,300 L1000,100 L1200,250 L1200,800 L0,800 Z" fill="url(#mountain3)" className="animate-[mountainFloat1_30s_ease-in-out_infinite] opacity-40" />
          <path d="M0,500 L150,300 L350,450 L550,250 L750,400 L950,200 L1200,350 L1200,800 L0,800 Z" fill="url(#mountain2)" className="animate-[mountainFloat2_25s_ease-in-out_infinite_reverse] opacity-50" />
          <path d="M0,600 L100,400 L300,550 L500,350 L700,500 L900,300 L1200,450 L1200,800 L0,800 Z" fill="url(#mountain1)" className="animate-[mountainFloat3_20s_ease-in-out_infinite] opacity-60" />
        </svg>
      </div>

      {/* Navigation Header (copied from Home) */}
      <nav className="relative z-50 bg-gradient-to-r from-stone-900/95 to-neutral-900/90 border-b border-stone-700/50 sticky top-0 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <FaMapMarkedAlt className="text-orange-500 text-2xl md:text-3xl transform group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]" />
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              </div>
              <span className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 drop-shadow-2xl tracking-tight">
                OffroadX
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-10">
              <Link to="/events" className="text-stone-300 hover:text-orange-400 transition-all duration-300 flex items-center space-x-2 font-semibold tracking-wide">
                <FaCalendarAlt className="text-lg" />
                <span>Events</span>
              </Link>
              <Link to="/routes" className="text-stone-300 hover:text-orange-400 transition-all duration-300 flex items-center space-x-2 font-semibold tracking-wide">
                <FaRoute className="text-lg" />
                <span>Routes</span>
              </Link>
              <Link to="/achievements" className="text-orange-400 transition-all duration-300 flex items-center space-x-2 font-semibold tracking-wide">
                <FaTrophy className="text-lg" />
                <span>Achievements</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <button className="text-stone-300 hover:text-orange-400 transition-all duration-300 relative">
                <FaBell className="text-2xl" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              </button>
              <div className="flex items-center space-x-4">
                <button onClick={handleProfileClick} className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
                  {profileData?.profilePhotoUrl ? (
                    <img src={profileData.profilePhotoUrl} alt="Profile" className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-500/50" />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                      <FaUser className="text-white text-lg" />
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-bold text-white tracking-wide">{user.firstName} {user.secondName}</p>
                    <p className="text-sm text-stone-400">Click to view profile</p>
                  </div>
                </button>
                <button onClick={handleLogout} className="text-stone-300 hover:text-red-400 transition-all duration-300 p-2 rounded-xl hover:bg-red-500/10" title="Logout">
                  <FaSignOutAlt className="text-xl" />
                </button>
              </div>
            </div>

            <div className="md:hidden flex items-center space-x-4">
              <button className="text-stone-300 hover:text-orange-400 transition-all duration-300 relative">
                <FaBell className="text-xl" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              </button>
              <button onClick={handleProfileClick} className="hover:opacity-80 transition-opacity">
                {profileData?.profilePhotoUrl ? (
                  <img src={profileData.profilePhotoUrl} alt="Profile" className="w-10 h-10 rounded-xl object-cover border-2 border-orange-500/50" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                )}
              </button>
              <button onClick={toggleMobileMenu} className="text-stone-300 hover:text-orange-400 transition-all duration-300 p-2">
                {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-br from-stone-900/98 to-neutral-900/95 border-b border-stone-700/50 backdrop-blur-xl shadow-2xl">
              <div className="px-4 py-6 space-y-4">
                <Link to="/events" className="flex items-center space-x-3 text-stone-300 hover:text-orange-400 transition-all duration-300 py-3 px-4 rounded-xl hover:bg-stone-800/50" onClick={() => setIsMobileMenuOpen(false)}>
                  <FaCalendarAlt className="text-lg" />
                  <span className="font-semibold">Events</span>
                </Link>
                <Link to="/routes" className="flex items-center space-x-3 text-stone-300 hover:text-orange-400 transition-all duration-300 py-3 px-4 rounded-xl hover:bg-stone-800/50" onClick={() => setIsMobileMenuOpen(false)}>
                  <FaRoute className="text-lg" />
                  <span className="font-semibold">Routes</span>
                </Link>
                <Link to="/achievements" className="flex items-center space-x-3 text-orange-400 transition-all duration-300 py-3 px-4 rounded-xl bg-orange-500/10" onClick={() => setIsMobileMenuOpen(false)}>
                  <FaTrophy className="text-lg" />
                  <span className="font-semibold">Achievements</span>
                </Link>
                <div className="border-t border-stone-700/50 pt-4 mt-4">
                  <div className="flex items-center space-x-3 py-3 px-4">
                    <div className="text-stone-300">
                      <p className="font-bold text-white">{user.firstName} {user.secondName}</p>
                      <p className="text-sm text-stone-400">Welcome back!</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition-all duration-300 py-3 px-4 rounded-xl hover:bg-red-500/10 w-full">
                    <FaSignOutAlt className="text-lg" />
                    <span className="font-semibold">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative bg-gradient-to-br from-stone-900/90 via-amber-950/80 to-stone-800/90 backdrop-blur-xl rounded-3xl p-8 text-white border border-orange-500/20 shadow-2xl shadow-orange-500/10 overflow-hidden mb-8">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <FaTrophy className="text-white text-xl" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">Achievements</h1>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-stone-900/90 via-amber-950/80 to-stone-900/90 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 shadow-xl shadow-orange-500/5 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search events, races, players..." className="w-full pl-12 pr-4 py-4 bg-black/40 border border-orange-500/30 rounded-xl text-white placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300" />
            </div>
            <label className="inline-flex items-center space-x-3">
              <input type="checkbox" checked={myOnly} onChange={e=>setMyOnly(e.target.checked)} className="w-5 h-5 accent-orange-500" />
              <span className="text-stone-200">My achievements only</span>
            </label>
          </div>
        </div>

        {loading && <p className="text-orange-400">Loading...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <p className="text-stone-400">No achievements found.</p>
            ) : (
              filtered.map((r) => (
                <div key={r._id} className="group relative bg-gradient-to-br from-stone-900/90 via-amber-950/80 to-stone-800/90 backdrop-blur-xl rounded-2xl border border-orange-500/20 hover:border-orange-400/40 transition-all duration-500 overflow-hidden shadow-xl shadow-orange-500/5">
                  <div className="relative p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-orange-400 text-sm">{r.event?.name}</p>
                        <h3 className="text-xl font-bold">{r.race?.name}</h3>
                        <p className="text-stone-400 text-sm">{r.race?.date} · {r.race?.startTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-stone-400">Position</p>
                        <p className="text-2xl font-bold text-white">{r.position ?? '-'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                      <div>
                        <p className="text-sm text-stone-400">Winner / Participant</p>
                        <p className="text-white">{r.user?.firstName} {r.user?.secondName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-stone-400">Time</p>
                        <p className="text-white">{formatMsToTime(r.finishingTimeMs)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-stone-400">Score</p>
                        <p className="text-white">{r.score ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-stone-400">Vehicle</p>
                        <p className="text-white">{r.vehicle ? `${r.vehicle.make} ${r.vehicle.model}${r.vehicle.year?` (${r.vehicle.year})`:''}` : '-'}</p>
                      </div>
                    </div>
                    {r.notes && (
                      <div className="mt-3">
                        <p className="text-sm text-stone-400">Notes</p>
                        <p className="text-stone-200">{r.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Achievements

