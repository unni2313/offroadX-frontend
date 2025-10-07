import React, { useEffect, useState, useMemo } from 'react'
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
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp
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

const getMedalIcon = (position) => {
  if (position === 1) return '🥇'
  if (position === 2) return '🥈'
  if (position === 3) return '🥉'
  return null
}

// Event Card Component
const EventCard = ({ eventData, expanded, onToggle, expandedRaces, onToggleRace, currentUserId, hoveredResult, setHoveredResult, showAllResults, toggleShowAllResults }) => {
  const { event, races } = eventData

  // Group races by race name
  const raceGroups = useMemo(() => {
    const groups = {}
    races.forEach(raceResult => {
      const raceName = raceResult.race.name
      if (!groups[raceName]) {
        groups[raceName] = {
          race: raceResult.race,
          results: []
        }
      }
      groups[raceName].results.push(raceResult)
    })
    
    // Sort results within each race by position
    Object.values(groups).forEach(group => {
      group.results.sort((a, b) => (a.position || 999) - (b.position || 999))
    })
    
    return groups
  }, [races])

  return (
    <div className="bg-gradient-to-br from-stone-900/95 to-stone-800/90 rounded-2xl overflow-hidden border border-stone-700/50 shadow-2xl hover:shadow-orange-500/10 hover:border-orange-500/40 transition-all duration-300">
      {/* Event Header - Clickable */}
      <div 
        className="p-4 sm:p-6 cursor-pointer hover:bg-stone-800/50 transition-colors border-b border-stone-700/30"
        onClick={onToggle}
      >
        <div className="flex justify-between items-start sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-orange-400 mb-2 sm:mb-3 truncate">{event.name}</h3>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm sm:text-base text-stone-300">
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-orange-500 flex-shrink-0" />
                <span className="truncate">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaMapMarkedAlt className="text-orange-500 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaTrophy className="text-orange-500 flex-shrink-0" />
                <span className="font-semibold text-amber-400">{races.length} {races.length === 1 ? 'Result' : 'Results'}</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            {expanded ? (
              <FaChevronUp className="text-xl sm:text-2xl text-orange-400 transition-transform" />
            ) : (
              <FaChevronDown className="text-xl sm:text-2xl text-stone-400 transition-transform" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Race Results */}
      {expanded && (
        <div className="p-4 sm:p-6 space-y-4 bg-black/10">
          {Object.entries(raceGroups).map(([raceName, raceGroup]) => {
            const raceKey = `${event._id}-${raceName}`
            const isRaceExpanded = expandedRaces.has(raceKey)
            
            return (
              <div key={raceName} className="bg-stone-900/60 rounded-xl overflow-hidden border border-stone-700/40 shadow-lg">
                {/* Race Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-stone-800/50 transition-colors border-b border-stone-700/30"
                  onClick={() => onToggleRace(raceKey)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaTrophy className="text-white text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg sm:text-xl font-bold text-amber-400 truncate">{raceName}</h4>
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-stone-400">
                          <span className="px-2 py-0.5 bg-stone-800 rounded">{raceGroup.race.type}</span>
                          <span>•</span>
                          <span>{raceGroup.results.length} participants</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {isRaceExpanded ? (
                        <FaChevronUp className="text-lg text-amber-400 transition-transform" />
                      ) : (
                        <FaChevronDown className="text-lg text-stone-400 transition-transform" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Race Results */}
                {isRaceExpanded && (
                  <div className="p-4">
                    {/* Results List - Row Layout */}
                    <div className="space-y-2 mb-4">
                      {raceGroup.results
                        .slice(0, showAllResults.has(raceKey) ? raceGroup.results.length : 3)
                        .map((result, idx) => {
                          const isCurrentUser = result.participant._id === currentUserId;
                          const rank = result.position;
                          const resultKey = `${raceKey}-${idx}`;

                          const rankColors = {
                            1: 'border-yellow-400/80 bg-yellow-900/20 shadow-yellow-400/20',
                            2: 'border-slate-300/80 bg-slate-800/20 shadow-slate-300/20',
                            3: 'border-amber-600/80 bg-amber-900/20 shadow-amber-600/20',
                          };
                          
                          const rankColor = rank <= 3 ? rankColors[rank] : 'border-stone-700/50 bg-stone-800/20';

                          return (
                            <div
                              key={idx}
                              className={`group relative rounded-xl border ${rankColor} p-3 transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg`}
                              onMouseEnter={() => setHoveredResult(resultKey)}
                              onMouseLeave={() => setHoveredResult(null)}
                              style={{
                                backgroundImage: `
                                  linear-gradient(90deg, 
                                    rgba(0,0,0,0.9) 0%, 
                                    rgba(0,0,0,0.7) 40%, 
                                    rgba(0,0,0,0.5) 60%, 
                                    rgba(0,0,0,0.8) 100%
                                  ), 
                                  url(${result.participant.profilePhotoUrl || 'https://via.placeholder.com/150'})
                                `,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center right',
                              }}
                            >
                              <div className="flex items-center justify-between relative z-10">
                                {/* Left: Rank, Medal, and Participant Info */}
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-2xl font-bold ${rank <= 3 ? 'text-white' : 'text-stone-300'} drop-shadow-lg`}>
                                      #{rank || '-'}
                                    </span>
                                    {getMedalIcon(rank) && (
                                      <span className="text-2xl drop-shadow-lg">{getMedalIcon(rank)}</span>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <p className={`text-lg font-bold ${isCurrentUser ? 'text-orange-400' : 'text-white'} drop-shadow-lg`}>
                                      {result.participant.firstName} {result.participant.secondName}
                                    </p>
                                    <p className="text-sm text-stone-300 drop-shadow">
                                      {result.vehicle ? `${result.vehicle.make} ${result.vehicle.model}` : <span className="text-stone-400 italic">N/A</span>}
                                    </p>
                                  </div>
                                </div>

                                {/* Right: Stats and Vehicle Image */}
                                <div className="flex items-center space-x-4">
                                  <div className="text-right">
                                    <p className="text-sm text-stone-400 uppercase tracking-wide">Time</p>
                                    <p className="text-lg font-mono text-stone-200 drop-shadow">
                                      {result.finishingTimeMs ? formatMsToTime(result.finishingTimeMs) : '-'}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-stone-400 uppercase tracking-wide">Score</p>
                                    <p className={`text-lg font-bold ${rank <= 3 ? 'text-yellow-400' : 'text-stone-200'} drop-shadow`}>
                                      {result.score != null ? result.score : '-'}
                                    </p>
                                  </div>
                                  
                                  {/* Vehicle Image */}
                                  <div className="w-16 h-12 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg">
                                    <img
                                      src={result.vehicle?.photoUrl || 'https://via.placeholder.com/300x200'}
                                      alt={`${result.vehicle?.make || ''} ${result.vehicle?.model || ''}`}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                  </div>
                                </div>

                                {/* Current User Badge */}
                                {isCurrentUser && (
                                  <div className="absolute top-2 right-2">
                                    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full font-bold shadow-md">You</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Show More/Less Button */}
                    {raceGroup.results.length > 3 && (
                      <div className="text-center">
                        <button
                          onClick={() => toggleShowAllResults(raceKey)}
                          className="px-4 py-2 bg-stone-700/50 hover:bg-stone-600/50 text-stone-300 hover:text-white rounded-lg transition-all duration-300 text-sm font-medium"
                        >
                          {showAllResults.has(raceKey) 
                            ? `Show Less (${raceGroup.results.length - 3} hidden)` 
                            : `Show All ${raceGroup.results.length} Results`
                          }
                        </button>
                      </div>
                    )}

                    {/* 3D Hover Card */}
                    {hoveredResult && (
                      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                        <div 
                          className="transform transition-all duration-500 ease-out"
                          style={{
                            transform: 'perspective(1000px) rotateY(-15deg) rotateX(5deg) translateZ(50px)',
                            animation: 'float 3s ease-in-out infinite'
                          }}
                        >
                          {(() => {
                            const [raceId, resultIdx] = hoveredResult.split('-').slice(-2);
                            const result = raceGroup.results[parseInt(resultIdx)];
                            if (!result) return null;

                            const isCurrentUser = result.participant._id === currentUserId;
                            const rank = result.position;

                            const rankColors = {
                              1: 'border-yellow-400/90 bg-gradient-to-br from-yellow-900/80 to-yellow-800/60 shadow-yellow-400/50',
                              2: 'border-slate-300/90 bg-gradient-to-br from-slate-700/80 to-slate-600/60 shadow-slate-300/50',
                              3: 'border-amber-600/90 bg-gradient-to-br from-amber-900/80 to-amber-800/60 shadow-amber-600/50',
                            };
                            
                            const rankColor = rank <= 3 ? rankColors[rank] : 'border-stone-600/80 bg-gradient-to-br from-stone-800/80 to-stone-700/60';

                            return (
                              <div
                                className={`w-80 h-96 rounded-2xl border-2 ${rankColor} overflow-hidden shadow-2xl backdrop-blur-lg`}
                                style={{
                                  backgroundImage: `
                                    linear-gradient(135deg, 
                                      rgba(0,0,0,0.7) 0%, 
                                      rgba(0,0,0,0.4) 30%, 
                                      rgba(0,0,0,0.2) 50%, 
                                      rgba(0,0,0,0.5) 70%, 
                                      rgba(0,0,0,0.8) 100%
                                    ), 
                                    url(${result.participant.profilePhotoUrl || 'https://via.placeholder.com/150'})
                                  `,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}
                              >
                                {/* Vehicle Image - Large display */}
                                <div className="absolute top-4 right-4 w-24 h-16 rounded-lg overflow-hidden border-2 border-white/30 shadow-xl z-20">
                                  <img
                                    src={result.vehicle?.photoUrl || 'https://via.placeholder.com/300x200'}
                                    alt={`${result.vehicle?.make || ''} ${result.vehicle?.model || ''}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                </div>

                                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                                  {/* Header: Rank and Medal */}
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                      <span className={`text-4xl font-bold ${rank <= 3 ? 'text-white' : 'text-stone-300'} drop-shadow-lg`}>
                                        #{rank || '-'}
                                      </span>
                                      {getMedalIcon(rank) && (
                                        <span className="text-4xl drop-shadow-lg">{getMedalIcon(rank)}</span>
                                      )}
                                    </div>
                                    {isCurrentUser && (
                                      <span className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full font-bold shadow-lg">You</span>
                                    )}
                                  </div>

                                  {/* Participant Info */}
                                  <div className="mb-6">
                                    <p className={`text-2xl font-bold ${isCurrentUser ? 'text-orange-400' : 'text-white'} drop-shadow-lg mb-2`}>
                                      {result.participant.firstName} {result.participant.secondName}
                                    </p>
                                    <p className="text-lg text-stone-300 drop-shadow">
                                      {result.vehicle ? `${result.vehicle.make} ${result.vehicle.model}` : <span className="text-stone-400 italic">N/A</span>}
                                    </p>
                                  </div>

                                  {/* Stats */}
                                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/30">
                                    <div>
                                      <p className="text-sm text-stone-400 uppercase tracking-wide mb-1">Time</p>
                                      <p className="text-xl font-mono text-stone-200 drop-shadow">
                                        {result.finishingTimeMs ? formatMsToTime(result.finishingTimeMs) : '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-stone-400 uppercase tracking-wide mb-1">Score</p>
                                      <p className={`text-xl font-bold ${rank <= 3 ? 'text-yellow-400' : 'text-stone-200'} drop-shadow`}>
                                        {result.score != null ? result.score : '-'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Rank indicator overlay for top 3 */}
                                {rank <= 3 && (
                                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-current to-transparent opacity-80"></div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
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

function Achievements(){
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

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setEventsList(data.events || [])
      }
    } catch (e) {
      console.error('Error fetching events:', e)
    }
  }

  const fetchAllResults = async () => {
    try{
      setLoading(true); setError('')
      const res = await fetch('http://localhost:5000/api/events/results', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (!res.ok){ setResults([]); return }
      const data = await res.json()
      setResults(Array.isArray(data.results) ? data.results : [])
    }catch(e){
      console.error(e); setError('Failed to load achievements')
    }finally{ setLoading(false) }
  }

  const years = useMemo(() => {
    const yearSet = new Set()
    eventsList.forEach(e => {
      if (e.date) {
        yearSet.add(e.date.slice(0,4))
      }
    })
    return [...yearSet].sort((a,b) => b - a)
  }, [eventsList])

  const filteredEvents = useMemo(() => {
    return results.filter(eventData => {
      if (selectedEvent !== 'all' && eventData.event._id !== selectedEvent) return false
      if (selectedYear !== 'all' && eventData.event.date.slice(0,4) !== selectedYear) return false
      if (myOnly && !eventData.races.some(r => r.participant._id === user._id)) return false
      if (search) {
        const s = search.toLowerCase()
        return eventData.races.some(r =>
          `${r.participant.firstName} ${r.participant.secondName} ${r.vehicle?.make || ''} ${r.vehicle?.model || ''}`.toLowerCase().includes(s)
        )
      }
      return true
    })
  }, [results, selectedEvent, selectedYear, myOnly, search, user])

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

  const toggleEventExpansion = (eventId) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  const toggleRaceExpansion = (raceKey) => {
    setExpandedRaces(prev => {
      const newSet = new Set(prev)
      if (newSet.has(raceKey)) {
        newSet.delete(raceKey)
      } else {
        newSet.add(raceKey)
      }
      return newSet
    })
  }

  const toggleShowAllResults = (raceKey) => {
    setShowAllResults(prev => {
      const newSet = new Set(prev)
      if (newSet.has(raceKey)) {
        newSet.delete(raceKey)
      } else {
        newSet.add(raceKey)
      }
      return newSet
    })
  }

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
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: perspective(1000px) rotateY(-15deg) rotateX(5deg) translateZ(50px) translateY(0px); }
          50% { transform: perspective(1000px) rotateY(-15deg) rotateX(5deg) translateZ(50px) translateY(-10px); }
        }
      `}</style>
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

      {/* Navigation Header */}
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
                    <FaUser className="text-white text-lg" />
                  </div>
                )}
              </button>
              <button onClick={toggleMobileMenu} className="text-stone-300 hover:text-orange-400 transition-all duration-300">
                {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-stone-900/95 border-t border-stone-700/50 backdrop-blur-xl">
            <div className="px-4 py-6 space-y-4">
              <Link to="/events" className="flex items-center space-x-3 text-stone-300 hover:text-orange-400 transition-all duration-300 p-3 rounded-xl hover:bg-stone-800/50">
                <FaCalendarAlt className="text-lg" />
                <span className="font-semibold">Events</span>
              </Link>
              <Link to="/routes" className="flex items-center space-x-3 text-stone-300 hover:text-orange-400 transition-all duration-300 p-3 rounded-xl hover:bg-stone-800/50">
                <FaRoute className="text-lg" />
                <span className="font-semibold">Routes</span>
              </Link>
              <Link to="/achievements" className="flex items-center space-x-3 text-orange-400 p-3 rounded-xl bg-orange-500/10">
                <FaTrophy className="text-lg" />
                <span className="font-semibold">Achievements</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition-all duration-300 p-3 rounded-xl hover:bg-red-500/10 w-full text-left">
                <FaSignOutAlt className="text-lg" />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 mb-4 tracking-tight">
            Achievements
          </h1>
          <p className="text-xl text-stone-400 max-w-2xl mx-auto leading-relaxed">
            Track your racing accomplishments and see how you stack up against other drivers
          </p>
        </div>

        {/* Filters */}
        <div className="bg-stone-900/60 rounded-2xl p-6 mb-8 border border-stone-700/50 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search participants or vehicles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-stone-800/50 border border-stone-600/50 rounded-xl text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
              />
            </div>

            {/* Event Filter */}
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-4 py-3 bg-stone-800/50 border border-stone-600/50 rounded-xl text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
            >
              <option value="all">All Events</option>
              {eventsList.map(event => (
                <option key={event._id} value={event._id}>{event.name}</option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-3 bg-stone-800/50 border border-stone-600/50 rounded-xl text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* My Results Only */}
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={myOnly}
                onChange={(e) => setMyOnly(e.target.checked)}
                className="w-5 h-5 text-orange-500 bg-stone-800/50 border-stone-600/50 rounded focus:ring-orange-500/50 focus:ring-2"
              />
              <span className="text-stone-300 font-medium">My Results Only</span>
            </label>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 mb-8">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <div className="space-y-6">
            {filteredEvents.length === 0 ? (
              <div className="bg-stone-900/50 rounded-xl p-12 text-center border border-stone-700/50">
                <FaTrophy className="text-stone-600 text-6xl mx-auto mb-4" />
                <p className="text-stone-400 text-lg">No achievements found.</p>
                <p className="text-stone-500 text-sm mt-2">Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              filteredEvents.map(eventData => (
                <EventCard 
                  key={eventData.event._id} 
                  eventData={eventData} 
                  expanded={expandedEvents.has(eventData.event._id)} 
                  onToggle={() => toggleEventExpansion(eventData.event._id)}
                  expandedRaces={expandedRaces}
                  onToggleRace={toggleRaceExpansion}
                  currentUserId={user._id}
                  hoveredResult={hoveredResult}
                  setHoveredResult={setHoveredResult}
                  showAllResults={showAllResults}
                  toggleShowAllResults={toggleShowAllResults}
                />
              ))
            )}
          </div>
        )}
      </div>
      </div>
    </>
  )
}

export default Achievements