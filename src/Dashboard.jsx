import React, { useEffect, useState } from 'react'
import { useNavigate, NavLink, Outlet } from 'react-router-dom'
import { FaSignOutAlt, FaUsers, FaCalendarAlt, FaChartLine, FaMapMarkedAlt, FaCog, FaBars, FaUser, FaRoute, FaTrophy, FaArrowUp, FaClock, FaCheckCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import axios from 'axios'
import API_BASE_URL from './config/api'

// Default dashboard overview content shown at /dashboard
export function DashboardOverview() {
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState(null)
  const [topPerformers, setTopPerformers] = useState([])
  const [systemStatus, setSystemStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const config = { headers: { Authorization: `Bearer ${token}` } }

      // Fetch ALL events for calendar display (not just upcoming)
      const eventsRes = await axios.get(`${API_BASE_URL}/api/events`, config)
      const allEventsData = eventsRes.data.events || []
      
      // Pass all events to calendar - let calendar handle month filtering
      setEvents(allEventsData)

      // Fetch upcoming events for stats calculation
      const upcomingEventsRes = await axios.get(`${API_BASE_URL}/api/events/upcoming`, config).catch(() => null)
      const upcomingEventsData = upcomingEventsRes?.data || []
      
      // Fetch dashboard stats from admin endpoint
      const statsRes = await axios.get(`${API_BASE_URL}/api/admin/stats`, config).catch(() => null)
      
      if (statsRes?.data) {
        setStats(statsRes.data)
      } else {
        // Fallback stats calculation using real data
        const totalParticipants = allEventsData.reduce((sum, event) => sum + (event.participants || 0), 0)
        setStats({
          upcomingEvents: upcomingEventsData.length,
          totalParticipants: totalParticipants,
          totalRoutes: 0, // This would need a routes endpoint
          engagementRate: 0
        })
      }

      // Calculate top performing events from all events
      if (Array.isArray(allEventsData) && allEventsData.length > 0) {
        const performers = allEventsData
          .map(event => ({
            name: event.name,
            participants: event.participants || 0,
            completionRate: Math.min(100, ((event.participants || 0) / (event.maxParticipants || 50)) * 100) // Calculate based on participants vs max
          }))
          .sort((a, b) => b.participants - a.participants)
          .slice(0, 3)
        
        setTopPerformers(performers.length > 0 ? performers : [])
      } else {
        setTopPerformers([])
      }

      // Fetch system status from health endpoint
      try {
        const healthRes = await axios.get(`${API_BASE_URL}/health`, config).catch(() => null)
        if (healthRes?.data) {
          setSystemStatus({
            api: healthRes.data.status === 'ok' ? 'operational' : 'error',
            database: healthRes.data.database === 'connected' ? 'connected' : 'disconnected',
            storage: healthRes.data.storage === 'ok' ? 'synced' : 'error'
          })
        } else {
          // Fallback system status based on successful API calls
          setSystemStatus({
            api: eventsRes ? 'operational' : 'error',
            database: (eventsRes && statsRes) ? 'connected' : 'partial',
            storage: 'synced'
          })
        }
      } catch (err) {
        console.log('Health check endpoint not available, using fallback status')
        setSystemStatus({
          api: eventsRes ? 'operational' : 'error',
          database: (eventsRes && statsRes) ? 'connected' : 'partial',
          storage: 'synced'
        })
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
      // Set default stats on error
      setStats({
        upcomingEvents: 0,
        totalParticipants: 0,
        totalRoutes: 0,
        engagementRate: 0
      })
      // Set error system status
      setSystemStatus({
        api: 'error',
        database: 'disconnected',
        storage: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, trend }) => (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex justify-between items-start">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white mt-3">{value}</p>
          {trend && (
            <div className="flex items-center gap-2 mt-3">
              <FaArrowUp className="text-orange-400 text-xs" />
              <span className="text-orange-400 text-sm font-semibold">{trend}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xl">
          {icon}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const dashboardStats = [
    { title: 'Upcoming Events', value: stats?.upcomingEvents || 0, icon: <FaCalendarAlt /> },
    { title: 'Active Participants', value: stats?.totalParticipants || 0, icon: <FaUsers /> },
    { title: 'Trail Routes', value: stats?.totalRoutes || 0, icon: <FaRoute /> },
    { title: 'Engagement Rate', value: `${stats?.engagementRate || 0}%`, icon: <FaChartLine /> }
  ]

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500">
            Dashboard
          </span>
        </h1>
        <p className="text-slate-400 text-lg">Welcome back! Here's your offroad events overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {dashboardStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Events Calendar - Takes 2 columns on large screens */}
        <EventsCalendar events={events} />

        {/* Quick Actions Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700/50 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Quick Actions</h3>
            <p className="text-sm text-slate-400 mt-1">Essential management tools</p>
          </div>

          <div className="space-y-3 flex-1 flex flex-col">
            <ActionButton icon={<FaCalendarAlt />} title="Create Event" description="Plan new adventure" />
            <ActionButton icon={<FaRoute />} title="Manage Routes" description="Edit trail routes" />
            <ActionButton icon={<FaUsers />} title="Invite Users" description="Add participants" />
            <ActionButton icon={<FaChartLine />} title="View Reports" description="Performance data" />
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700/50 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
            <FaCalendarAlt className="text-orange-400 text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Upcoming Events</h3>
            <p className="text-sm text-slate-400 mt-1">Next scheduled adventures</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {events.length > 0 ? (
            events
              .filter(event => new Date(event.date) >= new Date().setHours(0, 0, 0, 0)) // Only upcoming events
              .slice()
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 5)
              .map((event, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 hover:border-orange-500/30 hover:bg-slate-700/50 transition-all duration-300">
                  {/* Date Badge */}
                  <div className="flex flex-col items-center justify-center min-w-[60px] p-3 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/40">
                    <span className="text-xs text-orange-400 font-semibold uppercase">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold text-orange-400">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">{event.name}</h4>
                        <div className="space-y-1">
                          {event.time && (
                            <p className="text-xs text-slate-400 flex items-center gap-2">
                              <FaClock className="text-orange-400 text-xs" />
                              {event.time}
                            </p>
                          )}
                          {event.location && (
                            <p className="text-xs text-slate-400 flex items-center gap-2">
                              <FaMapMarkedAlt className="text-orange-400 text-xs" />
                              {event.location}
                            </p>
                          )}
                          <div className="flex items-center gap-3 pt-1">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <FaUsers className="text-orange-400 text-xs" />
                              {event.participants || 0} / {event.maxParticipants || 'N/A'}
                            </span>
                            {event.difficulty && (
                              <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300">
                                {event.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-2">
                          {event.duration && `${event.duration}`}
                        </p>
                        <p className="text-xs font-semibold text-orange-400">
                          {event.status === 'upcoming' ? '📍 Upcoming' : event.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No upcoming events scheduled</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular Events */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
              <FaTrophy className="text-orange-400 text-lg" />
            </div>
            <h3 className="text-lg font-bold text-white">Top Performers</h3>
          </div>
          <div className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-300 truncate block">{item.name}</span>
                    <span className="text-xs text-slate-500">{item.participants} participants</span>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <div className="w-24 h-2 rounded-full bg-slate-700/50 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${item.completionRate}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-orange-400 w-10 text-right">{Math.round(item.completionRate)}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-400 text-sm">No events data available</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
              <FaCheckCircle className="text-orange-400 text-lg" />
            </div>
            <h3 className="text-lg font-bold text-white">System Status</h3>
          </div>
          <div className="space-y-4">
            {systemStatus ? (
              <>
                <StatusItem label="API Server" status={systemStatus.api} />
                <StatusItem label="Database" status={systemStatus.database} />
                <StatusItem label="Storage" status={systemStatus.storage} />
              </>
            ) : (
              <>
                <StatusItem label="API Server" status="operational" />
                <StatusItem label="Database" status="connected" />
                <StatusItem label="Storage" status="synced" />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Status Item Component
function StatusItem({ label, status }) {
  const isHealthy = status === 'operational' || status === 'connected' || status === 'synced'
  const statusColors = {
    operational: { dot: 'bg-green-500', text: 'text-green-400', label: 'Operational' },
    connected: { dot: 'bg-green-500', text: 'text-green-400', label: 'Connected' },
    synced: { dot: 'bg-green-500', text: 'text-green-400', label: 'Synced' },
    error: { dot: 'bg-red-500', text: 'text-red-400', label: 'Error' },
    disconnected: { dot: 'bg-red-500', text: 'text-red-400', label: 'Disconnected' }
  }
  
  const config = statusColors[status] || { dot: 'bg-yellow-500', text: 'text-yellow-400', label: status }
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="inline-flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${config.dot} ${isHealthy ? 'animate-pulse' : ''}`}></span>
        <span className={`text-sm font-semibold ${config.text}`}>{config.label}</span>
      </span>
    </div>
  )
}

// Quick Action Button Component
function ActionButton({ icon, title, description }) {
  return (
    <button className="group w-full flex items-start gap-3 p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 hover:border-orange-500/30 hover:bg-slate-700/50 transition-all duration-300 text-left">
      <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-lg group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all duration-300">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-white text-sm">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </button>
  )
}

// Events Calendar Component
function EventsCalendar({ events }) {
  const [hoveredDate, setHoveredDate] = useState(null)
  const today = new Date()
  
  // State for current viewing month/year
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  
  // Navigation functions
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }
  
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }
  
  // Filter events for current viewing month
  const currentMonthEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
  })
  
  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  
  // Create map of dates to events for current month
  const eventsByDate = {}
  currentMonthEvents.forEach(event => {
    const eventDate = new Date(event.date)
    const dateKey = eventDate.getDate()
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = []
    }
    eventsByDate[dateKey].push(event)
  })
  
  // Get events for a specific date
  const getEventsForDate = (day) => eventsByDate[day] || []
  
  // Month name
  const monthName = new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' })
  
  // Days of week header
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Create array of calendar days (including empty cells for alignment)
  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }
  
  return (
    <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700/50 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
            <FaCalendarAlt className="text-orange-400 text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:text-orange-400 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-200"
                title="Previous month"
              >
                <FaChevronLeft className="text-sm" />
              </button>
              <h2 className="text-xl font-bold text-white min-w-[200px] text-center">{monthName}</h2>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:text-orange-400 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-200"
                title="Next month"
              >
                <FaChevronRight className="text-sm" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mt-1">Navigate between months to view events</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold border border-orange-500/30">
          {currentMonthEvents.length} events
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            const dayEvents = day ? getEventsForDate(day) : []
            const hasEvents = dayEvents.length > 0
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
            
            return (
              <div
                key={idx}
                onMouseEnter={() => day && setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                className="relative"
              >
                <div
                  className={`
                    relative h-20 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center cursor-default
                    ${!day ? 'bg-slate-900/20 border-slate-700/20' : ''}
                    ${day && !hasEvents ? 'bg-slate-700/20 border-slate-600/30 hover:border-slate-500/30 hover:bg-slate-700/30' : ''}
                    ${hasEvents && !isToday ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/40 hover:from-orange-500/30 hover:to-orange-600/20' : ''}
                    ${isToday ? 'bg-gradient-to-br from-orange-500/30 to-orange-600/20 border-orange-500/60 ring-2 ring-orange-500/30' : ''}
                  `}
                >
                  {day && (
                    <>
                      <span className={`text-sm font-bold ${isToday ? 'text-orange-400' : 'text-white'}`}>
                        {day}
                      </span>
                      {hasEvents && (
                        <span className="text-xs text-orange-400 font-semibold mt-1">
                          {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Hover tooltip */}
                {hoveredDate === day && dayEvents.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl min-w-max w-72">
                    <div className="space-y-3">
                      {dayEvents.map((event, i) => (
                        <div key={i} className="pb-3 border-b border-slate-700/50 last:border-0 last:pb-0">
                          <p className="text-sm font-semibold text-orange-400 truncate">{event.name}</p>
                          {event.date && (
                            <p className="text-xs text-slate-400 mt-1">
                              📅 {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                          {event.time && (
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <FaClock className="text-xs" />
                              {event.time}
                            </p>
                          )}
                          {event.location && (
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              📍 {event.location}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <FaUsers className="text-xs" />
                            {event.participants || 0} participants
                          </p>
                          {event.difficulty && (
                            <p className="text-xs text-slate-400 mt-1">
                              Difficulty: <span className="text-orange-300">{event.difficulty}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-slate-700/50 flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/40"></div>
          <span className="text-slate-400">Has events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/60 ring-1 ring-orange-500/30"></div>
          <span className="text-slate-400">Today</span>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      navigate('/login')
    } else {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      // Check if user is admin, if not redirect to home
      if (parsedUser.role !== 'admin') {
        navigate('/home')
      }
    }
  }, [navigate])

  const navItems = [
    { to: '/dashboard', icon: <FaChartLine />, label: 'Dashboard', end: true },
    { to: '/dashboard/events', icon: <FaCalendarAlt />, label: 'Events' },
    { to: '/dashboard/participants', icon: <FaUsers />, label: 'Participants' },
    { to: '/dashboard/routes', icon: <FaRoute />, label: 'Trail Routes' },
    { to: '/settings', icon: <FaCog />, label: 'Settings' },
    { to: '/dashboard/profile', icon: <FaUser />, label: 'Profile' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 transition-all duration-300 z-20 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Logo Section */}
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
            <FaMapMarkedAlt className="text-white text-xl" />
          </div>
          <div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600">
              OffroadX
            </span>
            <p className="text-xs text-slate-500">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-orange-600/20 text-orange-400 border border-orange-500/50 font-semibold'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-gradient-to-t from-slate-900">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName?.charAt(0) || 'A'}
            </div>
            <div className="text-sm">
              <p className="font-semibold text-white">{user?.firstName || 'Admin'}</p>
              <p className="text-xs text-slate-400">{user?.email || 'admin@offroad.com'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-64 transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-gradient-to-r from-slate-900/95 via-slate-900/95 to-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-orange-400 transition"
          >
            <FaBars className="text-xl" />
          </button>

          <div className="flex-1 md:flex-none" />

          <div className="flex items-center gap-4">
            {/* Quick Info */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-slate-300">System Active</span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.firstName || 'Admin'}</p>
                <p className="text-xs text-slate-400">{user?.role || 'Administrator'}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                {user?.firstName?.charAt(0) || 'A'}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                navigate('/login')
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-slate-800 transition-all duration-300"
              title="Logout"
            >
              <FaSignOutAlt className="text-lg" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Dashboard