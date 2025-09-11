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
  const [profileData, setProfileData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchProfileData();
    } else {
      navigate('/login');
    }

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [navigate]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Loading Mountains Animation Background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
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
            
            <path
              d="M0,500 L200,300 L400,450 L600,250 L800,400 L1000,200 L1200,350 L1200,800 L0,800 Z"
              fill="url(#loadingMountain1)"
              className="animate-[mountainFloat1_15s_ease-in-out_infinite] opacity-60"
            />
            
            <path
              d="M0,600 L150,400 L350,550 L550,350 L750,500 L950,300 L1200,450 L1200,800 L0,800 Z"
              fill="url(#loadingMountain2)"
              className="animate-[mountainFloat2_12s_ease-in-out_infinite_reverse] opacity-40"
            />
            
            {/* Loading sun */}
            <circle
              cx="1000"
              cy="150"
              r="30"
              fill="url(#loadingMountain2)"
              className="animate-[sunPulse_4s_ease-in-out_infinite] opacity-30"
            />
          </svg>
        </div>
        
        {/* 3D Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-1">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-500/8 to-amber-600/4 rounded-3xl transform rotate-45 animate-[float_8s_ease-in-out_infinite] blur-sm"></div>
          <div className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-tl from-orange-400/6 to-yellow-500/3 rounded-2xl transform -rotate-12 animate-[float_10s_ease-in-out_infinite_reverse] blur-sm"></div>
          <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-amber-500/5 to-orange-600/3 rounded-full transform animate-[float_12s_ease-in-out_infinite] blur-md"></div>
        </div>
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]"></div>
        </div>
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
    <div className="min-h-screen bg-black text-stone-100 relative overflow-hidden">
      {/* Offroad Car Through Mountains Animation Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Mountain gradients */}
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
            {/* Orange accent gradients */}
            <linearGradient id="orangeAccent1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(249, 115, 22, 0.08)" />
              <stop offset="50%" stopColor="rgba(251, 191, 36, 0.06)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0.04)" />
            </linearGradient>
            <linearGradient id="orangeAccent2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(234, 88, 12, 0.06)" />
              <stop offset="50%" stopColor="rgba(249, 115, 22, 0.08)" />
              <stop offset="100%" stopColor="rgba(251, 191, 36, 0.04)" />
            </linearGradient>
            {/* Car gradient */}
            <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(249, 115, 22, 0.8)" />
              <stop offset="50%" stopColor="rgba(251, 191, 36, 0.9)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0.7)" />
            </linearGradient>
            {/* Dust cloud gradient */}
            <radialGradient id="dustCloud" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(168, 162, 158, 0.3)" />
              <stop offset="70%" stopColor="rgba(120, 113, 108, 0.15)" />
              <stop offset="100%" stopColor="rgba(87, 83, 81, 0.05)" />
            </radialGradient>
          </defs>
          
          {/* Background Mountains - Far Layer */}
          <path
            d="M0,400 L200,200 L400,350 L600,150 L800,300 L1000,100 L1200,250 L1200,800 L0,800 Z"
            fill="url(#mountain3)"
            className="animate-[mountainFloat1_30s_ease-in-out_infinite] opacity-40"
          />
          
          {/* Middle Mountains */}
          <path
            d="M0,500 L150,300 L350,450 L550,250 L750,400 L950,200 L1200,350 L1200,800 L0,800 Z"
            fill="url(#mountain2)"
            className="animate-[mountainFloat2_25s_ease-in-out_infinite_reverse] opacity-50"
          />
          
          {/* Foreground Mountains */}
          <path
            d="M0,600 L100,400 L300,550 L500,350 L700,500 L900,300 L1200,450 L1200,800 L0,800 Z"
            fill="url(#mountain1)"
            className="animate-[mountainFloat3_20s_ease-in-out_infinite] opacity-60"
          />
          
          {/* Orange accent peaks */}
          <path
            d="M200,300 L300,200 L400,280 L500,180 L600,260 L700,160 L800,240 L900,140 L1000,220 L1100,120 L1200,200 L1200,0 L0,0 L0,380 Z"
            fill="url(#orangeAccent1)"
            className="animate-[peakGlow_15s_ease-in-out_infinite] opacity-30"
          />
          
          {/* Trail/Road Path */}
          <path
            d="M0,650 Q300,620 600,640 T1200,630"
            stroke="url(#orangeAccent2)"
            strokeWidth="3"
            fill="none"
            opacity="0.4"
            className="animate-[trailShimmer_8s_ease-in-out_infinite]"
          />
          
          {/* Offroad Car */}
          <g className="animate-[carDrive_20s_linear_infinite]" transform-origin="center">
            {/* Car Body */}
            <rect
              x="50"
              y="620"
              width="60"
              height="25"
              rx="8"
              fill="url(#carGradient)"
              className="drop-shadow-[0_4px_15px_rgba(249,115,22,0.4)]"
            />
            {/* Car Roof */}
            <rect
              x="60"
              y="610"
              width="40"
              height="15"
              rx="6"
              fill="url(#carGradient)"
              opacity="0.8"
            />
            {/* Wheels */}
            <circle
              cx="65"
              cy="650"
              r="8"
              fill="rgba(87, 83, 81, 0.8)"
              className="animate-[wheelSpin_1s_linear_infinite]"
            />
            <circle
              cx="95"
              cy="650"
              r="8"
              fill="rgba(87, 83, 81, 0.8)"
              className="animate-[wheelSpin_1s_linear_infinite]"
            />
            {/* Headlights */}
            <circle
              cx="112"
              cy="630"
              r="3"
              fill="rgba(251, 191, 36, 0.9)"
              className="animate-[headlightFlicker_2s_ease-in-out_infinite]"
            />
            <circle
              cx="112"
              cy="638"
              r="3"
              fill="rgba(251, 191, 36, 0.9)"
              className="animate-[headlightFlicker_2s_ease-in-out_infinite_0.5s]"
            />
          </g>
          
          {/* Dust Clouds behind car */}
          <g className="animate-[carDrive_20s_linear_infinite]">
            <ellipse
              cx="30"
              cy="645"
              rx="25"
              ry="12"
              fill="url(#dustCloud)"
              className="animate-[dustPuff_3s_ease-in-out_infinite] opacity-60"
            />
            <ellipse
              cx="10"
              cy="650"
              rx="20"
              ry="8"
              fill="url(#dustCloud)"
              className="animate-[dustPuff_3s_ease-in-out_infinite_1s] opacity-40"
            />
            <ellipse
              cx="-10"
              cy="655"
              rx="15"
              ry="6"
              fill="url(#dustCloud)"
              className="animate-[dustPuff_3s_ease-in-out_infinite_2s] opacity-20"
            />
          </g>
          
          {/* Flying particles/debris */}
          <circle
            cx="200"
            cy="400"
            r="2"
            fill="url(#orangeAccent1)"
            className="animate-[particle1_12s_ease-in-out_infinite] opacity-50"
          />
          <circle
            cx="600"
            cy="300"
            r="1.5"
            fill="url(#orangeAccent2)"
            className="animate-[particle2_15s_ease-in-out_infinite] opacity-40"
          />
          <circle
            cx="900"
            cy="500"
            r="2.5"
            fill="url(#mountain1)"
            className="animate-[particle3_18s_ease-in-out_infinite] opacity-30"
          />
          
          {/* Sun/Light source */}
          <circle
            cx="1000"
            cy="100"
            r="40"
            fill="url(#orangeAccent1)"
            className="animate-[sunPulse_8s_ease-in-out_infinite] opacity-20"
          />
          
          {/* Additional mountain details */}
          <path
            d="M400,450 L450,400 L500,430 L550,380 L600,410 L650,360 L700,390 L750,340 L800,370"
            stroke="url(#orangeAccent2)"
            strokeWidth="2"
            fill="none"
            opacity="0.25"
            className="animate-[ridgeLine_10s_ease-in-out_infinite]"
          />
        </svg>
      </div>

      {/* 3D Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-1">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-500/6 to-amber-600/3 rounded-3xl transform rotate-45 animate-[float_8s_ease-in-out_infinite] blur-sm"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-tl from-orange-400/4 to-yellow-500/2 rounded-2xl transform -rotate-12 animate-[float_10s_ease-in-out_infinite_reverse] blur-sm"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-amber-500/4 to-orange-600/2 rounded-full transform animate-[float_12s_ease-in-out_infinite] blur-md"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 bg-gradient-to-r from-stone-900/95 to-neutral-900/90 border-b border-stone-700/50 sticky top-0 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <FaMapMarkedAlt className="text-orange-500 text-3xl transform group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]" />
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              </div>
              <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 drop-shadow-2xl tracking-tight">
                OffroadX
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-10">
              <Link to="/events" className="text-stone-300 hover:text-orange-400 transition-all duration-300 flex items-center space-x-2 font-semibold tracking-wide">
                <FaCalendarAlt className="text-lg" />
                <span>Events</span>
              </Link>
              <Link to="/routes" className="text-stone-300 hover:text-orange-400 transition-all duration-300 flex items-center space-x-2 font-semibold tracking-wide">
                <FaRoute className="text-lg" />
                <span>Routes</span>
              </Link>
              <Link to="/community" className="text-stone-300 hover:text-orange-400 transition-all duration-300 flex items-center space-x-2 font-semibold tracking-wide">
                <FaUsers className="text-lg" />
                <span>Community</span>
              </Link>
              <Link to="/achievements" className="text-stone-300 hover:text-orange-400 transition-all duration-300 flex items-center space-x-2 font-semibold tracking-wide">
                <FaTrophy className="text-lg" />
                <span>Achievements</span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-6">
              <button className="text-stone-300 hover:text-orange-400 transition-all duration-300 relative">
                <FaBell className="text-2xl" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              </button>
              <div className="flex items-center space-x-4">
                {profileData?.profilePhotoUrl ? (
                  <img
                    src={profileData.profilePhotoUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-500/50 shadow-[0_8px_30px_rgba(249,115,22,0.3)]"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(249,115,22,0.3)]">
                    <FaUser className="text-white text-lg" />
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-lg font-bold text-white tracking-wide">{user.firstName} {user.secondName}</p>
                  <Link to="/profile" className="text-sm text-stone-400 hover:text-orange-400 transition-colors duration-300 font-medium">View Profile</Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-stone-300 hover:text-red-400 transition-all duration-300 p-2 rounded-xl hover:bg-red-500/10"
                  title="Logout"
                >
                  <FaSignOutAlt className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="relative bg-gradient-to-br from-stone-900/90 to-neutral-900/80 rounded-3xl p-12 text-white overflow-hidden border border-stone-700/50 backdrop-blur-xl">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 to-amber-600/5 opacity-50"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-500/15 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                  {getGreeting()}, {user.firstName}!
                </span>
                <span className="text-5xl ml-4">🌟</span>
              </h1>
              <p className="text-stone-300 text-xl mb-8 font-light leading-relaxed">
                Ready for your next offroad adventure? The trails are calling!
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link
                  to="/events"
                  className="group relative bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white px-8 py-4 rounded-2xl font-bold text-lg tracking-wide transform hover:scale-105 transition-all duration-500 shadow-[0_12px_40px_rgba(249,115,22,0.3)] hover:shadow-[0_16px_50px_rgba(249,115,22,0.5)] overflow-hidden flex items-center justify-center space-x-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center"></div>
                  <span className="relative z-10 flex items-center space-x-3">
                    <FaCalendarAlt className="text-xl" />
                    <span>Browse Events</span>
                  </span>
                </Link>
                <Link
                  to="/routes"
                  className="border-2 border-stone-600 hover:border-orange-500/50 text-stone-200 hover:text-white px-8 py-4 rounded-2xl font-bold text-lg tracking-wide hover:bg-orange-500/10 transition-all duration-500 flex items-center justify-center space-x-3 backdrop-blur-sm"
                >
                  <FaCompass className="text-xl" />
                  <span>Explore Routes</span>
                </Link>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-6 right-6 text-7xl opacity-15">🏔️</div>
            <div className="absolute bottom-6 right-20 text-5xl opacity-15">🚗</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => (
            <div key={index} className="relative bg-gradient-to-br from-stone-900/90 to-neutral-900/80 rounded-3xl p-8 border border-stone-700/50 hover:border-orange-500/30 transition-all duration-500 backdrop-blur-xl group overflow-hidden">
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-600/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl group-hover:opacity-100 opacity-0 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`text-3xl ${stat.color} drop-shadow-[0_0_15px_rgba(249,115,22,0.3)] group-hover:scale-110 transition-transform duration-300`} />
                  <span className="text-3xl font-black text-white tracking-tight">{stat.value}</span>
                </div>
                <p className="text-stone-400 text-sm font-semibold tracking-wide">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <div className="relative bg-gradient-to-br from-stone-900/90 to-neutral-900/80 rounded-3xl border border-stone-700/50 overflow-hidden backdrop-blur-xl">
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-600/3 opacity-50"></div>
              
              <div className="relative z-10 p-8 border-b border-stone-700/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white flex items-center space-x-3">
                    <FaCalendarAlt className="text-orange-500 text-2xl drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600">Upcoming Events</span>
                  </h2>
                  <Link to="/events" className="text-orange-400 hover:text-orange-300 text-lg font-bold transition-colors duration-300 hover:underline">
                    View All
                  </Link>
                </div>
              </div>
              <div className="relative z-10 p-8 space-y-6">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="relative bg-black/40 rounded-2xl p-6 hover:bg-black/60 transition-all duration-500 cursor-pointer border border-stone-700/30 hover:border-orange-500/30 backdrop-blur-sm group overflow-hidden">
                    {/* Card hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 flex items-start space-x-6">
                      <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">{event.image}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-black text-white mb-2 text-lg tracking-wide">{event.title}</h3>
                            <p className="text-stone-400 text-base mb-3 font-medium">{event.location}</p>
                            <div className="flex items-center space-x-6 text-sm text-stone-500">
                              <span className="flex items-center space-x-2">
                                <FaCalendarAlt className="text-orange-400" />
                                <span className="font-semibold">{new Date(event.date).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-2">
                                <FaUsers className="text-orange-400" />
                                <span className="font-semibold">{event.participants} joined</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-3">
                            <span className={`px-4 py-2 rounded-2xl text-sm font-bold ${
                              event.difficulty === 'Expert' ? 'bg-red-900/50 text-red-300 border border-red-500/30' :
                              event.difficulty === 'Intermediate' ? 'bg-amber-900/50 text-amber-300 border border-amber-500/30' :
                              'bg-green-900/50 text-green-300 border border-green-500/30'
                            }`}>
                              {event.difficulty}
                            </span>
                            <button className="text-orange-400 hover:text-orange-300 text-base font-bold transition-colors duration-300 hover:underline">
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
          <div className="space-y-8">
            {/* Weather Widget */}
            <div className="relative bg-gradient-to-br from-stone-900/90 to-neutral-900/80 rounded-3xl border border-stone-700/50 p-8 backdrop-blur-xl overflow-hidden">
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-600/3 opacity-50"></div>
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-black text-white mb-6 flex items-center space-x-3">
                  <FaSun className="text-amber-400 text-2xl drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">Trail Conditions</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 font-semibold">Temperature</span>
                    <span className="text-white font-black text-lg">72°F</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 font-semibold">Conditions</span>
                    <span className="text-green-400 font-black text-lg">Perfect</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 font-semibold">Visibility</span>
                    <span className="text-white font-black text-lg">10 miles</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="relative bg-gradient-to-br from-stone-900/90 to-neutral-900/80 rounded-3xl border border-stone-700/50 p-8 backdrop-blur-xl overflow-hidden">
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-600/3 opacity-50"></div>
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-black text-white mb-6 flex items-center space-x-3">
                  <FaChartLine className="text-blue-400 text-2xl drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Recent Activity</span>
                </h3>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-black/60 rounded-2xl flex items-center justify-center border border-stone-700/50">
                        <activity.icon className="text-orange-400 text-lg" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base text-white font-semibold">
                          <span className="text-orange-400">{activity.action}</span> {activity.event}
                        </p>
                        <p className="text-sm text-stone-500 font-medium">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="relative bg-gradient-to-br from-stone-900/90 to-neutral-900/80 rounded-3xl border border-stone-700/50 p-8 backdrop-blur-xl overflow-hidden">
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-600/3 opacity-50"></div>
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-black text-white mb-6 flex items-center space-x-3">
                  <FaTools className="text-purple-400 text-2xl drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">Quick Actions</span>
                </h3>
                <div className="space-y-3">
                  <button className="w-full bg-black/60 hover:bg-orange-500/20 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center space-x-3 border border-stone-700/50 hover:border-orange-500/30 backdrop-blur-sm">
                    <FaRoute className="text-orange-400 text-lg" />
                    <span>Plan New Route</span>
                  </button>
                  <button className="w-full bg-black/60 hover:bg-orange-500/20 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center space-x-3 border border-stone-700/50 hover:border-orange-500/30 backdrop-blur-sm">
                    <FaCamera className="text-orange-400 text-lg" />
                    <span>Upload Photos</span>
                  </button>
                  <button className="w-full bg-black/60 hover:bg-orange-500/20 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center space-x-3 border border-stone-700/50 hover:border-orange-500/30 backdrop-blur-sm">
                    <FaUsers className="text-orange-400 text-lg" />
                    <span>Invite Friends</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Content */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Trail of the Week */}
          <div className="relative bg-gradient-to-br from-stone-900/90 to-neutral-900/80 rounded-3xl border border-stone-700/50 overflow-hidden backdrop-blur-xl group">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-600/3 opacity-50"></div>
            
            <div className="relative h-56 bg-gradient-to-br from-green-600/80 to-green-800/60 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center text-white">
                <FaMountain className="text-7xl mb-6 mx-auto drop-shadow-[0_0_20px_rgba(34,197,94,0.5)] group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-2xl font-black tracking-wide">Trail of the Week</h3>
              </div>
            </div>
            <div className="relative z-10 p-8">
              <h4 className="font-black text-white mb-3 text-xl tracking-wide">Eagle's Peak Trail</h4>
              <p className="text-stone-400 text-base mb-6 font-medium leading-relaxed">
                A challenging mountain trail with breathtaking views and technical terrain.
              </p>
              <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-green-500/20 transform hover:scale-105">
                Explore Trail
              </button>
            </div>
          </div>

          {/* Community Spotlight */}
          <div className="relative bg-gradient-to-br from-stone-900/90 to-neutral-900/80 rounded-3xl border border-stone-700/50 overflow-hidden backdrop-blur-xl group">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-600/3 opacity-50"></div>
            
            <div className="relative h-56 bg-gradient-to-br from-purple-600/80 to-purple-800/60 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center text-white">
                <FaUsers className="text-7xl mb-6 mx-auto drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-2xl font-black tracking-wide">Community</h3>
              </div>
            </div>
            <div className="relative z-10 p-8">
              <h4 className="font-black text-white mb-3 text-xl tracking-wide">Featured Explorer</h4>
              <p className="text-stone-400 text-base mb-6 font-medium leading-relaxed">
                Meet Sarah, who completed 15 trails this month and shared amazing photos!
              </p>
              <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/20 transform hover:scale-105">
                View Profile
              </button>
            </div>
          </div>

          {/* Tips & Guides */}
          <div className="relative bg-gradient-to-br from-stone-900/90 to-neutral-900/80 rounded-3xl border border-stone-700/50 overflow-hidden backdrop-blur-xl group">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-600/3 opacity-50"></div>
            
            <div className="relative h-56 bg-gradient-to-br from-amber-600/80 to-orange-700/60 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center text-white">
                <FaPlay className="text-7xl mb-6 mx-auto drop-shadow-[0_0_20px_rgba(251,191,36,0.5)] group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-2xl font-black tracking-wide">Learn & Grow</h3>
              </div>
            </div>
            <div className="relative z-10 p-8">
              <h4 className="font-black text-white mb-3 text-xl tracking-wide">Beginner's Guide</h4>
              <p className="text-stone-400 text-base mb-6 font-medium leading-relaxed">
                Essential tips for your first offroad adventure. Safety, gear, and techniques.
              </p>
              <button className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-orange-500/20 transform hover:scale-105">
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