import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from './config/api'
import {
  FaMapMarkedAlt,
  FaUser,
  FaSignOutAlt,
  FaCalendarAlt,
  FaRoute,
  FaTrophy,
  FaBell,
  FaSearch,
  FaUsers,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaCompass,
  FaShoppingCart,
  FaBolt,
  FaMedal,
  FaFlagCheckered,
  FaCrown,
  FaClock
} from 'react-icons/fa'
import NotificationBell from './components/NotificationBell'

const formatMsToTime = (ms) => {
  if (ms == null) return ''
  const sign = ms < 0 ? '-' : ''
  ms = Math.abs(ms)
  const h = Math.floor(ms / 3600000); ms %= 3600000
  const m = Math.floor(ms / 60000); ms %= 60000
  const s = Math.floor(ms / 1000); const mm = ms % 1000
  const p2 = (n) => String(n).padStart(2, '0'); const p3 = (n) => String(n).padStart(3, '0')
  return `${sign}${p2(h)}:${p2(m)}:${p2(s)}.${p3(mm)}`
}

const getMedalIcon = (position) => {
  if (position === 1) return <FaCrown className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
  if (position === 2) return <FaMedal className="text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]" />
  if (position === 3) return <FaMedal className="text-amber-600 drop-shadow-[0_0_10px_rgba(180,83,9,0.5)]" />
  return null
}

const EventCard = ({ eventData, expanded, onToggle, expandedRaces, onToggleRace, currentUserId, hoveredResult, setHoveredResult, showAllResults, toggleShowAllResults }) => {
  const { event, races } = eventData
  const raceGroups = useMemo(() => {
    const groups = {}
    races.forEach(raceResult => {
      const raceName = raceResult.race.name
      if (!groups[raceName]) groups[raceName] = { race: raceResult.race, results: [] }
      groups[raceName].results.push(raceResult)
    })
    Object.values(groups).forEach(group => group.results.sort((a, b) => (a.position || 999) - (b.position || 999)))
    return groups
  }, [races])

  return (
    <div className={`bg-stone-900/40 border border-stone-800/80 rounded-[2.5rem] overflow-hidden transition-all duration-500 ${expanded ? 'border-orange-500/30 bg-stone-900/60 shadow-2xl' : 'hover:border-stone-700'}`}>
      <div className="p-8 cursor-pointer group" onClick={onToggle}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-stone-800/50 border border-stone-700/50 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 italic">
              <span>Mission ID: {event._id.slice(-8).toUpperCase()}</span>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase group-hover:text-orange-500 transition-colors uppercase leading-none">{event.name}</h3>
            <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-stone-500">
              <div className="flex items-center space-x-2"><FaCalendarAlt className="text-orange-500" /><span>{new Date(event.date).toLocaleDateString()}</span></div>
              <div className="flex items-center space-x-2"><FaMapMarkedAlt className="text-orange-500" /><span>{event.location}</span></div>
              <div className="flex items-center space-x-2"><FaFlagCheckered className="text-orange-500" /><span>{races.length} COMPLETED STAGES</span></div>
            </div>
          </div>
          <div className={`w-12 h-12 bg-stone-800 rounded-2xl flex items-center justify-center transition-all duration-300 ${expanded ? 'rotate-180 bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'text-stone-400 group-hover:border-stone-600 border border-stone-700'}`}>
            <FaChevronDown />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-8 pt-0 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          {Object.entries(raceGroups).map(([raceName, raceGroup]) => {
            const raceKey = `${event._id}-${raceName}`
            const isRaceExpanded = expandedRaces.has(raceKey)

            return (
              <div key={raceName} className="bg-stone-950/50 border border-stone-800/50 rounded-[2rem] overflow-hidden">
                <div
                  className={`p-6 cursor-pointer flex justify-between items-center transition-all ${isRaceExpanded ? 'bg-stone-900 border-b border-stone-800' : 'hover:bg-stone-900/50'}`}
                  onClick={() => onToggleRace(raceKey)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-center text-orange-500">
                      <FaBolt size={14} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">{raceName}</h4>
                      <p className="text-[10px] font-bold text-stone-600 uppercase tracking-tighter italic">{raceGroup.race.type} • {raceGroup.results.length} CONTENDERS</p>
                    </div>
                  </div>
                  <FaChevronDown className={`text-stone-600 transition-transform duration-300 ${isRaceExpanded ? 'rotate-180 text-orange-500' : ''}`} />
                </div>

                {isRaceExpanded && (
                  <div className="p-6 space-y-3">
                    {raceGroup.results
                      .slice(0, showAllResults.has(raceKey) ? raceGroup.results.length : 3)
                      .map((result, idx) => {
                        const isCurrentUser = result.participant._id === currentUserId;
                        const rank = result.position;
                        const resultKey = `${raceKey}-${idx}`;

                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredResult(resultKey)}
                            onMouseLeave={() => setHoveredResult(null)}
                            className={`group relative p-4 rounded-[1.5rem] border transition-all duration-300 flex items-center justify-between ${rank === 1 ? 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/50' :
                              rank === 2 ? 'bg-slate-300/5 border-slate-300/20 hover:border-slate-300/50' :
                                rank === 3 ? 'bg-amber-600/5 border-amber-600/20 hover:border-amber-600/50' :
                                  'bg-stone-900 border-stone-800/80 hover:border-stone-700'
                              }`}
                          >
                            <div className="flex items-center space-x-6 z-10">
                              <div className="w-12 h-12 flex items-center justify-center">
                                {getMedalIcon(rank) || <span className="text-xl font-black text-stone-700">#{rank}</span>}
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <img src={result.participant.profilePhotoUrl || 'https://via.placeholder.com/150'} className="w-12 h-12 rounded-xl object-cover border border-stone-700 shadow-xl" />
                                  {isCurrentUser && <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-black text-[8px] font-black rounded-full flex items-center justify-center">YOU</div>}
                                </div>
                                <div>
                                  <p className={`text-sm font-black uppercase tracking-tight ${isCurrentUser ? 'text-orange-500' : 'text-white'}`}>
                                    {result.participant.firstName} {result.participant.secondName}
                                  </p>
                                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{result.vehicle ? `${result.vehicle.make} ${result.vehicle.model}` : 'N/A'}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-8 z-10">
                              <div className="text-right">
                                <p className="text-[8px] font-black text-stone-600 uppercase tracking-widest mb-1">ELAPSED</p>
                                <p className="text-xs font-black text-stone-300 font-mono tracking-tighter">{result.finishingTimeMs ? formatMsToTime(result.finishingTimeMs) : '--:--:--'}</p>
                              </div>
                              <div className="w-px h-6 bg-stone-800"></div>
                              <div className="text-right">
                                <p className="text-[8px] font-black text-stone-600 uppercase tracking-widest mb-1">RATING</p>
                                <p className={`text-sm font-black tracking-tighter ${rank === 1 ? 'text-yellow-400' : 'text-white'}`}>{result.score ?? '--'}</p>
                              </div>
                            </div>

                            {/* Hover Image Peak */}
                            <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-24 h-16 rounded-xl overflow-hidden border border-stone-700 transition-all duration-500 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 hidden md:block`}>
                              <img src={result.vehicle?.photoUrl || 'https://via.placeholder.com/300x200'} className="w-full h-full object-cover" />
                            </div>
                          </div>
                        );
                      })}

                    {raceGroup.results.length > 3 && (
                      <button
                        onClick={() => toggleShowAllResults(raceKey)}
                        className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-stone-600 hover:text-orange-500 transition-all border-t border-stone-900 mt-4"
                      >
                        {showAllResults.has(raceKey) ? 'COMPRESS LOGS' : `IDENTIFY ALL ${raceGroup.results.length} CONTENDERS`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Achievements() {
  const [user, setUser] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [eventsList, setEventsList] = useState([])
  const [search, setSearch] = useState('')
  const [myOnly, setMyOnly] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [expandedEvents, setExpandedEvents] = useState(new Set())
  const [expandedRaces, setExpandedRaces] = useState(new Set())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredResult, setHoveredResult] = useState(null)
  const [showAllResults, setShowAllResults] = useState(new Set())
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
      fetchProfileData()
      fetchEvents()
      fetchAllResults()
    } else {
      navigate('/login')
    }
  }, [navigate])

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
      }
    } catch (e) { }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setEventsList(data.events || [])
      }
    } catch (e) { }
  }

  const fetchAllResults = async () => {
    try {
      setLoading(true); setError('')
      const res = await fetch(`${API_BASE_URL}/api/events/results`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (!res.ok) { setResults([]); return }
      const data = await res.json()
      setResults(Array.isArray(data.results) ? data.results : [])
    } catch (e) {
      setError('Sync Failure: Achievements unavailable')
    } finally { setLoading(false) }
  }

  const years = useMemo(() => {
    const yearSet = new Set()
    eventsList.forEach(e => { if (e.date) yearSet.add(e.date.slice(0, 4)) })
    return [...yearSet].sort((a, b) => b - a)
  }, [eventsList])

  const filteredEvents = useMemo(() => {
    return results.filter(eventData => {
      if (selectedEvent !== 'all' && eventData.event._id !== selectedEvent) return false
      if (selectedYear !== 'all' && eventData.event.date.slice(0, 4) !== selectedYear) return false
      if (myOnly && !eventData.races.some(r => r.participant._id === user._id)) return false
      if (search) {
        const s = search.toLowerCase()
        return eventData.races.some(r => `${r.participant.firstName} ${r.participant.secondName} ${r.vehicle?.make || ''} ${r.vehicle?.model || ''}`.toLowerCase().includes(s))
      }
      return true
    })
  }, [results, selectedEvent, selectedYear, myOnly, search, user])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    const es = new EventSource(`${API_BASE_URL}/api/events/results/stream?token=${encodeURIComponent(token)}`)
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data?.event === 'result_saved') fetchAllResults()
      } catch { }
    }
    return () => es.close()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login')
  }

  const handleProfileClick = () => {
    navigate('/profile'); setIsMobileMenuOpen(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-100 relative overflow-x-hidden">
      {/* Tactical Background Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-orange-950/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-amber-950/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 bg-stone-900/80 border-b border-stone-800/50 sticky top-0 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => navigate('/home')}>
              <div className="relative"><FaMapMarkedAlt className="text-orange-500 text-2xl md:text-3xl" /><div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div></div>
              <span className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 tracking-tighter">OffroadX</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {[{ to: '/home', icon: FaCompass, label: 'Home' }, { to: '/events', icon: FaCalendarAlt, label: 'Events' }, { to: '/routes', icon: FaRoute, label: 'Routes' }, { to: '/achievements', icon: FaTrophy, label: 'Achievements', active: true }, { to: '/ecommerce', icon: FaShoppingCart, label: 'Shop' }].map((item) => (
                <Link key={item.label} to={item.to} className={`relative px-3 py-2 text-sm font-bold tracking-widest uppercase transition-all duration-300 flex items-center space-x-2 group ${item.active ? 'text-orange-500' : 'text-stone-400 hover:text-white'}`}>
                  <item.icon className="text-lg" /><span>{item.label}</span>
                  {item.active && <div className="absolute -bottom-1 left-3 right-3 h-0.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <NotificationBell />
              <div className="flex items-center p-1.5 bg-stone-800/50 rounded-2xl border border-stone-700/50 backdrop-blur-sm">
                <button onClick={handleProfileClick} className="flex items-center space-x-3 pr-4 pl-2 hover:opacity-80 transition-opacity">
                  {profileData?.profilePhotoUrl ? <img src={profileData.profilePhotoUrl} alt="Profile" className="w-9 h-9 rounded-xl object-cover border border-orange-500/30" /> : <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center"><FaUser className="text-white text-sm" /></div>}
                  <span className="font-bold text-sm tracking-tight text-white">{user.firstName}</span>
                </button>
                <div className="w-px h-6 bg-stone-700 mx-2"></div>
                <button onClick={handleLogout} className="p-2 text-stone-400 hover:text-red-400 transition-colors"><FaSignOutAlt /></button>
              </div>
            </div>

            <div className="md:hidden flex items-center space-x-4">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-stone-300 p-2 bg-stone-800/50 rounded-xl border border-stone-700/50 italic">{isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center space-x-3"><FaMapMarkedAlt className="text-orange-500 text-3xl" /><span className="text-2xl font-black text-white tracking-widest uppercase">OFFROADX</span></div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-stone-800 rounded-2xl border border-stone-700 text-white"><FaTimes className="text-xl" /></button>
          </div>
          <div className="space-y-4 flex-1">
            {[{ to: '/home', icon: FaCompass, label: 'Home' }, { to: '/events', icon: FaCalendarAlt, label: 'Events' }, { to: '/routes', icon: FaRoute, label: 'Routes' }, { to: '/achievements', icon: FaTrophy, label: 'Achievements', active: true }, { to: '/ecommerce', icon: FaShoppingCart, label: 'Shop' }].map((item) => (
              <Link key={item.label} to={item.to} className={`flex items-center space-x-4 p-5 rounded-2xl text-lg font-bold transition-all ${item.active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-stone-400 bg-stone-900/50 border border-stone-800/50 hover:bg-stone-800'}`} onClick={() => setIsMobileMenuOpen(false)}><item.icon /><span>{item.label}</span></Link>
            ))}
          </div>
          <button onClick={handleLogout} className="mt-8 flex items-center justify-center space-x-3 p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold"><FaSignOutAlt /><span>Sign Out</span></button>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <FaTrophy className="animate-bounce" />
            <span>HALL OF EMINENCE</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-2 uppercase">Achievements</h1>
          <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Examine historic mission data and operative standings.</p>
        </header>

        {/* Global Hall Stats (Visual Flavor) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {[
            { label: 'MISSIONS LOGGED', val: results.length, icon: FaFlagCheckered, color: 'text-orange-500' },
            { label: 'TOP POSITIONS', val: results.reduce((acc, ev) => acc + ev.races.filter(r => r.position <= 3).length, 0), icon: FaCrown, color: 'text-yellow-500' },
            { label: 'TOTAL CONTENDERS', val: results.reduce((acc, ev) => acc + ev.races.length, 0), icon: FaUsers, color: 'text-blue-500' },
            { label: 'FASTEST TIME', val: '00:42:15', icon: FaClock, color: 'text-green-500' }
          ].map(stat => (
            <div key={stat.label} className="p-6 bg-stone-900/40 border border-stone-800 rounded-[2rem] flex flex-col items-center text-center group hover:bg-stone-900/60 transition-all">
              <div className={`w-10 h-10 ${stat.color} mb-3 group-hover:scale-110 transition-transform`}><stat.icon size={28} /></div>
              <span className="text-[8px] font-black text-stone-600 uppercase tracking-widest mb-1">{stat.label}</span>
              <span className="text-2xl font-black text-white tracking-tighter">{stat.val}</span>
            </div>
          ))}
        </section>

        {/* Tactical Search & Filters */}
        <section className="mb-10 bg-stone-900/40 border border-stone-800 p-6 rounded-[2.5rem] backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex-1 relative w-full">
              <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-600" />
              <input
                type="text"
                placeholder="IDENTIFY OPERATIVE OR UNIT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black tracking-widest uppercase text-white focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full lg:w-auto">
              <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} className="bg-stone-950 border border-stone-800 rounded-2xl py-4 px-6 text-[10px] font-black tracking-widest uppercase text-orange-500 focus:outline-none appearance-none min-w-[140px]">
                <option value="all">ALL DEPLOYMENTS</option>
                {eventsList.map(e => <option key={e._id} value={e._id}>{e.name.toUpperCase()}</option>)}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-stone-950 border border-stone-800 rounded-2xl py-4 px-6 text-[10px] font-black tracking-widest uppercase text-orange-500 focus:outline-none appearance-none min-w-[100px]">
                <option value="all">ALL YEARS</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button onClick={() => setMyOnly(!myOnly)} className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all col-span-2 md:col-span-1 ${myOnly ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-stone-800 text-stone-400 hover:text-white'}`}>
                {myOnly ? 'MY MISSION LOGS' : 'ALL PERSONNEL'}
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-stone-600 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Retrieving Hall Data...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-red-500/5 border border-red-500/20 rounded-[2.5rem]">
            <p className="text-red-500 font-black uppercase tracking-widest text-xs italic">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.length === 0 ? (
              <div className="py-24 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-stone-900 border border-stone-800 mb-6 text-stone-700"><FaTrophy size={32} /></div>
                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter leading-none">Archives Empty</h3>
                <p className="text-stone-500 max-w-xs mx-auto font-medium text-sm">No historic achievements matching your parameters were identified in the main memory.</p>
              </div>
            ) : (
              filteredEvents.map((eventData, idx) => (
                <div key={eventData.event._id} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                  <EventCard
                    eventData={eventData}
                    expanded={expandedEvents.has(eventData.event._id)}
                    onToggle={() => { setExpandedEvents(prev => { const n = new Set(prev); if (n.has(eventData.event._id)) n.delete(eventData.event._id); else n.add(eventData.event._id); return n; }) }}
                    expandedRaces={expandedRaces}
                    onToggleRace={(rk) => { setExpandedRaces(prev => { const n = new Set(prev); if (n.has(rk)) n.delete(rk); else n.add(rk); return n; }) }}
                    currentUserId={user._id}
                    hoveredResult={hoveredResult}
                    setHoveredResult={setHoveredResult}
                    showAllResults={showAllResults}
                    toggleShowAllResults={(rk) => { setShowAllResults(prev => { const n = new Set(prev); if (n.has(rk)) n.delete(rk); else n.add(rk); return n; }) }}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Floating Support FAB */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <button className="w-16 h-16 bg-white text-black rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group">
          <FaBell className="text-xl group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  )
}

export default Achievements;