import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from './config/api';
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
  FaBars,
  FaTimes,
  FaShoppingCart,
  FaArrowRight,
  FaMapMarkerAlt,
  FaClock,
  FaBolt,
  FaCheckCircle
} from 'react-icons/fa';
import NotificationBell from './components/NotificationBell';
import offroadRacingHero from './assets/offroad_racing.png';


function Home() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchProfileData();
    } else {
      navigate('/login');
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [navigate]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
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

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  if (!user) return null;

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  const upcomingEvents = [
    {
      id: 1,
      title: "Desert Storm Challenge",
      date: "2025-08-15",
      location: "Mojave Desert",
      difficulty: "Expert",
      participants: 24,
      image: "https://images.unsplash.com/photo-1509316785289-025f543463a5?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Mountain Trail Adventure",
      date: "2025-08-22",
      location: "Rocky Mountains",
      difficulty: "Intermediate",
      participants: 18,
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  const quickStats = [
    { label: "EXPEDITIONS", value: "12", icon: FaMapMarkerAlt, color: "from-blue-500 to-cyan-400" },
    { label: "DISTANCE (KM)", value: "2,847", icon: FaRoute, color: "from-orange-500 to-amber-400" },
    { label: "ACHIEVEMENTS", value: "08", icon: FaTrophy, color: "from-yellow-500 to-amber-300" },
    { label: "COMMUNITY", value: "156", icon: FaUsers, color: "from-purple-500 to-pink-400" }
  ];

  const recentActivities = [
    { action: "COMPLETED", event: "Canyon Explorer", time: "2 days ago", icon: FaCheckCircle },
    { action: "JOINED", event: "Desert Storm Challenge", time: "1 week ago", icon: FaUsers },
    { action: "ACHIEVED", event: "100 Miles Milestone", time: "2 weeks ago", icon: FaStar }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-100 relative overflow-x-hidden">
      {/* Tactical Background Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-orange-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 bg-stone-900/80 border-b border-stone-800/50 sticky top-0 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => navigate('/home')}>
              <div className="relative">
                <FaMapMarkedAlt className="text-orange-500 text-2xl md:text-3xl transform group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
              </div>
              <span className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 tracking-tighter">
                OffroadX
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { to: '/home', icon: FaCompass, label: 'Home', active: true },
                { to: '/events', icon: FaCalendarAlt, label: 'Events' },
                { to: '/routes', icon: FaRoute, label: 'Routes' },
                { to: '/achievements', icon: FaTrophy, label: 'Achievements' },
                { to: '/ecommerce', icon: FaShoppingCart, label: 'Shop' }
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`relative px-3 py-2 text-sm font-bold tracking-widest uppercase transition-all duration-300 flex items-center space-x-2 group ${item.active ? 'text-orange-500' : 'text-stone-400 hover:text-white'}`}
                >
                  <item.icon className="text-lg" />
                  <span>{item.label}</span>
                  {item.active && (
                    <div className="absolute -bottom-1 left-3 right-3 h-0.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
                  )}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <NotificationBell />
              <div className="flex items-center p-1.5 bg-stone-800/50 rounded-2xl border border-stone-700/50 backdrop-blur-sm">
                <button onClick={handleProfileClick} className="flex items-center space-x-3 pr-4 pl-2 hover:opacity-80 transition-opacity">
                  {profileData?.profilePhotoUrl ? (
                    <img src={profileData.profilePhotoUrl} alt="Profile" className="w-9 h-9 rounded-xl object-cover border border-orange-500/30" />
                  ) : (
                    <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center">
                      <FaUser className="text-white text-sm" />
                    </div>
                  )}
                  <span className="font-bold text-sm tracking-tight">{user.firstName}</span>
                </button>
                <div className="w-px h-6 bg-stone-700 mx-2"></div>
                <button onClick={handleLogout} className="p-2 text-stone-400 hover:text-red-400 transition-colors">
                  <FaSignOutAlt />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              <button onClick={toggleMobileMenu} className="text-stone-300 p-2 bg-stone-800/50 rounded-xl border border-stone-700/50">
                {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center space-x-3">
                <FaMapMarkedAlt className="text-orange-500 text-3xl" />
                <span className="text-2xl font-black text-white tracking-widest uppercase">OFFROADX</span>
              </div>
              <button onClick={toggleMobileMenu} className="p-3 bg-stone-800 rounded-2xl border border-stone-700 text-white">
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto">
              {[
                { to: '/home', icon: FaCompass, label: 'Home', active: true },
                { to: '/events', icon: FaCalendarAlt, label: 'Events' },
                { to: '/routes', icon: FaRoute, label: 'Routes' },
                { to: '/achievements', icon: FaTrophy, label: 'Achievements' },
                { to: '/ecommerce', icon: FaShoppingCart, label: 'Shop' }
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center space-x-4 p-5 rounded-2xl text-lg font-bold transition-all ${item.active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-stone-400 bg-stone-900/50 border border-stone-800/50 hover:bg-stone-800'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <button onClick={handleLogout} className="mt-8 flex items-center justify-center space-x-3 p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold">
              <FaSignOutAlt />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">

        {/* Advanced Welcome Section */}
        <section className="relative rounded-[2.5rem] overflow-hidden mb-12 border border-stone-800/50 shadow-2xl group">
          {/* Background Hero */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10"></div>
            <img
              src={offroadRacingHero}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[20s]"
              alt="Hero"
            />
          </div>

          <div className="relative z-20 p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center space-x-3 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <FaBolt className="animate-pulse" />
                <span>STATUS: READY FOR MISSION</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter">
                {getGreeting()} <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                  {user.firstName.toUpperCase()}
                </span>
              </h1>
              <p className="text-stone-400 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
                The wild is calling, commander. Your vehicle diagnostics are clear and 12 routes await your command.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/events" className="group px-8 py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-orange-400 transition-all flex items-center space-x-3 shadow-xl shadow-orange-500/30 active:scale-95">
                  <span>BROWSE EXPEDITIONS</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/routes" className="px-8 py-4 bg-stone-900/50 backdrop-blur-md border border-stone-700/50 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-stone-800 transition-all active:scale-95">
                  EXPLORE TRAILS
                </Link>
              </div>
            </div>

            {/* Dashboard Secondary Stats (Visual) */}
            <div className="hidden lg:block w-72 h-72 relative">
              <div className="absolute inset-0 border-4 border-stone-800/50 rounded-full flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-orange-500/20 rounded-full border-t-orange-500 animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute w-44 h-44 border border-stone-700/50 rounded-full border-l-amber-500/40 animate-[spin_7s_linear_infinite_reverse]"></div>
                <div className="text-center z-10">
                  <p className="text-[10px] text-stone-500 font-bold tracking-widest">DRIVE RANK</p>
                  <p className="text-5xl font-black text-orange-500">A1</p>
                  <div className="flex gap-1 mt-2 justify-center">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-3 h-1 bg-orange-500/20 rounded"></div>)}
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-stone-900 border border-stone-800 p-3 rounded-2xl animate-bounce">
                <FaMountain className="text-orange-500 text-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Global Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => (
            <div key={index} className="relative group p-8 bg-stone-900/40 border border-stone-800/80 rounded-[2.2rem] overflow-hidden hover:bg-stone-900/60 hover:border-orange-500/40 transition-all duration-500 animate-in fade-in slide-in-from-bottom-6" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>

              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} p-4 rounded-2xl mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-300`}>
                <stat.icon className="text-black text-2l" />
              </div>

              <p className="text-[11px] font-black text-stone-500 uppercase tracking-[0.3em] mb-1">{stat.label}</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-white tracking-tighter">{stat.value}</span>
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Feed: Upcoming Expeditions */}
          <section className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-1.5 h-8 bg-orange-500 rounded-full"></div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Mission Briefing</h2>
              </div>
              <Link to="/events" className="text-xs font-black text-orange-500 uppercase tracking-widest hover:text-orange-400 transition-colors flex items-center space-x-2">
                <span>Active Deployment Ops</span>
                <FaArrowRight size={10} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="group relative bg-stone-900/40 border border-stone-800 rounded-[2rem] overflow-hidden flex flex-col md:flex-row hover:bg-stone-900/60 hover:border-orange-500/30 transition-all duration-300">
                  <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/80 backdrop-blur rounded-lg text-[10px] font-black text-orange-500 border border-stone-700/50 uppercase tracking-widest">
                      {event.difficulty}
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-orange-400 transition-colors">{event.title}</h3>
                    <div className="flex flex-wrap gap-6 mb-6">
                      <div className="flex items-center space-x-2 text-stone-500 text-xs font-bold uppercase tracking-widest">
                        <FaMapMarkerAlt className="text-orange-500" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-stone-500 text-xs font-bold uppercase tracking-widest">
                        <FaCalendarAlt className="text-orange-500" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-stone-500 text-xs font-bold uppercase tracking-widest">
                        <FaUsers className="text-orange-500" />
                        <span>{event.participants} REGISTERED</span>
                      </div>
                    </div>
                    <button className="w-fit px-8 py-3 bg-stone-100 text-black font-black rounded-xl text-xs uppercase tracking-widest hover:bg-orange-500 transition-all active:scale-95 shadow-lg shadow-black/20">
                      ENGAGE MISSION
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tactical Sidebar */}
          <aside className="space-y-12">
            {/* Intel Feed (Recent Activity) */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Expedition Intel</h3>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-stone-900/30 border border-stone-800/50 rounded-2xl hover:border-stone-700 transition-all">
                    <div className="mt-1 w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                      <FaChartLine size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-stone-300 uppercase tracking-widest mb-1 italic">
                        {activity.action}
                      </p>
                      <h4 className="text-sm font-bold text-white leading-tight mb-1">{activity.event}</h4>
                      <span className="text-[10px] text-stone-500 font-bold uppercase tracking-tight">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Diagnostics (Simulated Stats) */}
            <div className="p-8 bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <FaTools size={64} />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6">Unit Diagnostics</h3>
              <div className="space-y-6">
                {[
                  { label: 'EQUIPMENT INTEGRITY', val: '98%', color: 'w-[98%] bg-green-500' },
                  { label: 'OXYGEN / FUEL LEVEL', val: '72%', color: 'w-[72%] bg-orange-500' },
                  { label: 'TEAM SYNC STATUS', val: '100%', color: 'w-[100%] bg-blue-500' }
                ].map(diag => (
                  <div key={diag.label} className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black text-stone-500 uppercase tracking-widest">
                      <span>{diag.label}</span>
                      <span className="text-white">{diag.val}</span>
                    </div>
                    <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
                      <div className={`h-full ${diag.color} rounded-full`}></div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 p-4 bg-stone-800/50 border border-stone-700/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-white hover:bg-stone-800 transition-all">
                RUN DEEP SCAN
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* Support FAB */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <button className="w-16 h-16 bg-white text-black rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group">
          <FaBell className="text-xl group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default Home;