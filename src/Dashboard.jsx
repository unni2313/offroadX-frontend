import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FaSignOutAlt, FaUsers, FaCalendarAlt, FaChartLine, FaMapMarkedAlt, FaCog, FaBars } from 'react-icons/fa'

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

  // Mock analytics data
  const dashboardStats = [
    { title: "Upcoming Events", value: 5, icon: <FaCalendarAlt className="text-green-500" /> },
    { title: "Total Participants", value: 128, icon: <FaUsers className="text-blue-500" /> },
    { title: "Routes Planned", value: 12, icon: <FaMapMarkedAlt className="text-yellow-500" /> },
    { title: "Engagement Rate", value: "78%", icon: <FaChartLine className="text-purple-500" /> }
  ]

  const recentEvents = [
    { name: "Mountain Trail Challenge", date: "2023-11-15", participants: 42 },
    { name: "Forest Adventure Ride", date: "2023-11-22", participants: 36 },
    { name: "Desert Expedition", date: "2023-12-05", participants: 28 }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      {/* Sidebar */}
      <div className={`bg-gray-800 w-64 fixed h-full transition-all duration-300 ${sidebarOpen ? 'ml-0' : '-ml-64'} z-10`}>
        <div className="p-4 flex items-center space-x-2 border-b border-gray-700 h-16">
          <FaMapMarkedAlt className="text-green-500 text-2xl" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
            OffroadX
          </span>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700 text-white">
                <FaChartLine />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/events" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition">
                <FaCalendarAlt />
                <span>Events</span>
              </Link>
            </li>
            <li>
              <Link to="/participants" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition">
                <FaUsers />
                <span>Participants</span>
              </Link>
            </li>
            <li>
              <Link to="/routes" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition">
                <FaMapMarkedAlt />
                <span>Routes</span>
              </Link>
            </li>
            <li>
              <Link to="/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition">
                <FaCog />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 h-16 flex items-center justify-between px-6 fixed w-full z-10">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            <FaBars className="text-xl" />
          </button>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden md:inline">{user.name}</span>
              </div>
            )}
            <button
              onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                navigate('/login')
              }}
              className="flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <FaSignOutAlt />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 pt-24">
          <h1 className="text-3xl font-bold mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
              Dashboard Overview
            </span>
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500/30 transition">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className="text-2xl">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Events */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-green-500" />
              Upcoming Events
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-left border-b border-gray-700">
                  <tr>
                    <th className="pb-3">Event Name</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Participants</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map((event, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                      <td className="py-3">{event.name}</td>
                      <td className="py-3">{event.date}</td>
                      <td className="py-3">{event.participants}</td>
                      <td className="py-3">
                        <button className="text-green-500 hover:text-green-400 text-sm font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold mb-3">Create New Event</h3>
              <p className="text-gray-400 text-sm mb-4">Plan your next offroad adventure</p>
              <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-500 hover:to-green-600 transition">
                Start Planning
              </button>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold mb-3">Invite Participants</h3>
              <p className="text-gray-400 text-sm mb-4">Share your events with others</p>
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-500 hover:to-blue-600 transition">
                Send Invites
              </button>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold mb-3">View Reports</h3>
              <p className="text-gray-400 text-sm mb-4">Analyze your event performance</p>
              <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-lg hover:from-purple-500 hover:to-purple-600 transition">
                Generate Report
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard