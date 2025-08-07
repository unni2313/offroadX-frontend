import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaMapMarkedAlt, 
  FaUser, 
  FaSignOutAlt, 
  FaCalendarAlt, 
  FaRoute, 
  FaTrophy, 
  FaUsers, 
  FaCamera,
  FaBell,
  FaChartLine,
  FaCompass,
  FaMountain,
  FaSun,
  FaTools,
  FaStar,
  FaPlay
} from 'react-icons/fa';

function Home() {
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const upcomingEvents = [
    {
      id: 1,
      title: "Desert Storm Challenge",
      date: "2025-08-15",
      location: "Mojave Desert",
      difficulty: "Expert",
      participants: 24,
      image: "🏜️"
    },
    {
      id: 2,
      title: "Mountain Trail Adventure",
      date: "2025-08-22",
      location: "Rocky Mountains",
      difficulty: "Intermediate",
      participants: 18,
      image: "🏔️"
    },
    {
      id: 3,
      title: "Forest Explorer",
      date: "2025-08-29",
      location: "Pacific Northwest",
      difficulty: "Beginner",
      participants: 32,
      image: "🌲"
    }
  ];

  const quickStats = [
    { label: "Events Joined", value: "12", icon: FaCalendarAlt, color: "text-blue-400" },
    { label: "Miles Traveled", value: "2,847", icon: FaRoute, color: "text-green-400" },
    { label: "Achievements", value: "8", icon: FaTrophy, color: "text-yellow-400" },
    { label: "Friends", value: "156", icon: FaUsers, color: "text-purple-400" }
  ];

  const recentActivities = [
    { action: "Completed", event: "Canyon Explorer", time: "2 days ago", icon: FaTrophy },
    { action: "Joined", event: "Desert Storm Challenge", time: "1 week ago", icon: FaUsers },
    { action: "Shared", event: "Mountain Trail Photos", time: "1 week ago", icon: FaCamera },
    { action: "Achieved", event: "100 Miles Milestone", time: "2 weeks ago", icon: FaStar }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Navigation Header */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <FaMapMarkedAlt className="text-green-500 text-2xl" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
                OffroadX
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/events" className="text-gray-300 hover:text-green-400 transition flex items-center space-x-1">
                <FaCalendarAlt className="text-sm" />
                <span>Events</span>
              </Link>
              <Link to="/routes" className="text-gray-300 hover:text-green-400 transition flex items-center space-x-1">
                <FaRoute className="text-sm" />
                <span>Routes</span>
              </Link>
              <Link to="/community" className="text-gray-300 hover:text-green-400 transition flex items-center space-x-1">
                <FaUsers className="text-sm" />
                <span>Community</span>
              </Link>
              <Link to="/achievements" className="text-gray-300 hover:text-green-400 transition flex items-center space-x-1">
                <FaTrophy className="text-sm" />
                <span>Achievements</span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-300 hover:text-green-400 transition">
                <FaBell className="text-xl" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-sm" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{user.firstName} {user.secondName}</p>
                  <p className="text-xs text-gray-400">Explorer</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-red-400 transition"
                  title="Logout"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {getGreeting()}, {user.firstName}! 🌟
              </h1>
              <p className="text-green-100 text-lg mb-6">
                Ready for your next offroad adventure? The trails are calling!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/events"
                  className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center space-x-2"
                >
                  <FaCalendarAlt />
                  <span>Browse Events</span>
                </Link>
                <Link
                  to="/routes"
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-700 transition flex items-center justify-center space-x-2"
                >
                  <FaCompass />
                  <span>Explore Routes</span>
                </Link>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 text-6xl opacity-20">🏔️</div>
            <div className="absolute bottom-4 right-16 text-4xl opacity-20">🚗</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500/30 transition">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`text-2xl ${stat.color}`} />
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <FaCalendarAlt className="text-green-500" />
                    <span>Upcoming Events</span>
                  </h2>
                  <Link to="/events" className="text-green-400 hover:text-green-300 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-gray-900 rounded-lg p-4 hover:bg-gray-850 transition cursor-pointer">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{event.image}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-white mb-1">{event.title}</h3>
                            <p className="text-gray-400 text-sm mb-2">{event.location}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <FaCalendarAlt />
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FaUsers />
                                <span>{event.participants} joined</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.difficulty === 'Expert' ? 'bg-red-900 text-red-300' :
                              event.difficulty === 'Intermediate' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-green-900 text-green-300'
                            }`}>
                              {event.difficulty}
                            </span>
                            <button className="mt-2 text-green-400 hover:text-green-300 text-sm font-medium">
                              Join Event
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Widget */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FaSun className="text-yellow-400" />
                <span>Trail Conditions</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Temperature</span>
                  <span className="text-white font-medium">72°F</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Conditions</span>
                  <span className="text-green-400 font-medium">Perfect</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Visibility</span>
                  <span className="text-white font-medium">10 miles</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FaChartLine className="text-blue-400" />
                <span>Recent Activity</span>
              </h3>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      <activity.icon className="text-green-400 text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        <span className="text-green-400">{activity.action}</span> {activity.event}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FaTools className="text-purple-400" />
                <span>Quick Actions</span>
              </h3>
              <div className="space-y-2">
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm transition flex items-center space-x-2">
                  <FaRoute />
                  <span>Plan New Route</span>
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm transition flex items-center space-x-2">
                  <FaCamera />
                  <span>Upload Photos</span>
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm transition flex items-center space-x-2">
                  <FaUsers />
                  <span>Invite Friends</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Content */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trail of the Week */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
              <div className="text-center text-white">
                <FaMountain className="text-6xl mb-4 mx-auto" />
                <h3 className="text-xl font-bold">Trail of the Week</h3>
              </div>
            </div>
            <div className="p-6">
              <h4 className="font-semibold text-white mb-2">Eagle's Peak Trail</h4>
              <p className="text-gray-400 text-sm mb-4">
                A challenging mountain trail with breathtaking views and technical terrain.
              </p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm transition">
                Explore Trail
              </button>
            </div>
          </div>

          {/* Community Spotlight */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <div className="text-center text-white">
                <FaUsers className="text-6xl mb-4 mx-auto" />
                <h3 className="text-xl font-bold">Community</h3>
              </div>
            </div>
            <div className="p-6">
              <h4 className="font-semibold text-white mb-2">Featured Explorer</h4>
              <p className="text-gray-400 text-sm mb-4">
                Meet Sarah, who completed 15 trails this month and shared amazing photos!
              </p>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm transition">
                View Profile
              </button>
            </div>
          </div>

          {/* Tips & Guides */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center">
              <div className="text-center text-white">
                <FaPlay className="text-6xl mb-4 mx-auto" />
                <h3 className="text-xl font-bold">Learn & Grow</h3>
              </div>
            </div>
            <div className="p-6">
              <h4 className="font-semibold text-white mb-2">Beginner's Guide</h4>
              <p className="text-gray-400 text-sm mb-4">
                Essential tips for your first offroad adventure. Safety, gear, and techniques.
              </p>
              <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg text-sm transition">
                Watch Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;