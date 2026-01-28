import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from './config/api';
import {
  FaMapMarkedAlt,
  FaClock,
  FaRoad,
  FaMountain,
  FaUsers,
  FaExclamationTriangle,
  FaFilter,
  FaSearch,
  FaCompass,
  FaCalendarAlt,
  FaTrophy,
  FaShoppingCart,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaArrowRight,
  FaBolt,
  FaShieldAlt,
  FaTools,
  FaGlobe,
  FaRoute
} from 'react-icons/fa';


const UserRoutes = () => {
  // Auth & Layout State
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Routes State
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [terrainFilter, setTerrainFilter] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchProfileData();
      fetchRoutes();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/routes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    let filtered = routes;
    if (searchTerm) {
      filtered = filtered.filter(route =>
        route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.endLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (difficultyFilter) filtered = filtered.filter(route => route.difficulty === difficultyFilter);
    if (terrainFilter) filtered = filtered.filter(route => route.terrain === terrainFilter);
    setFilteredRoutes(filtered);
  }, [routes, searchTerm, difficultyFilter, terrainFilter]);

  const terrainIcons = {
    'Rocky': '🪨', 'Muddy': '🟤', 'Sandy': '🏜️', 'Forest': '🌲',
    'Desert': '🏜️', 'Mountain': '⛰️', 'Mixed': '🌍'
  };

  if (!user) return null;

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
                { to: '/home', icon: FaCompass, label: 'Home' },
                { to: '/events', icon: FaCalendarAlt, label: 'Events' },
                { to: '/routes', icon: FaRoute, label: 'Routes', active: true },
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
              <button className="text-stone-300 hover:text-orange-400 relative">
                <FaBell className="text-xl" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              </button>
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

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 p-6 flex flex-col">
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
              { to: '/home', icon: FaCompass, label: 'Home' },
              { to: '/events', icon: FaCalendarAlt, label: 'Events' },
              { to: '/routes', icon: FaRoute, label: 'Routes', active: true },
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
      )}

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">

        {/* Scouting Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <FaGlobe className="animate-pulse" />
              <span>TACTICAL RECONNAISSANCE</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-2">TRIAL CATALOG</h1>
            <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Examine topographical layouts and technical route specifications.</p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="SEARCH TRIALS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-stone-900 border border-stone-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold tracking-widest text-white focus:outline-none focus:border-orange-500 w-full sm:w-64 uppercase"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-stone-900 border border-stone-800 rounded-2xl py-3 pl-11 pr-8 text-xs font-black tracking-widest text-orange-500 focus:outline-none focus:border-orange-500 appearance-none w-full uppercase"
              >
                <option value="">ALL RANKS</option>
                <option value="Beginner">RECRUIT</option>
                <option value="Intermediate">OPERATIVE</option>
                <option value="Advanced">VETERAN</option>
                <option value="Expert">ELITE</option>
              </select>
            </div>
          </div>
        </header>

        {/* Categories Bar */}
        <section className="mb-10 flex overflow-x-auto scrollbar-hide p-1 gap-3">
          {[
            { id: '', label: 'ALL TERRAINS' },
            ...Object.keys(terrainIcons).map(t => ({ id: t, label: t.toUpperCase() }))
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTerrainFilter(tab.id)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${terrainFilter === tab.id ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-stone-900 text-stone-500 border border-stone-800 hover:border-stone-700 hover:text-stone-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </section>


        {/* Routes Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-stone-600 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Scanning Terrain Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRoutes.length > 0 ? filteredRoutes.map((route, index) => {
              const terrainImages = {
                'Rocky': 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?q=80&w=2070',
                'Muddy': 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=2069',
                'Sandy': 'https://images.unsplash.com/photo-1509316785289-025f543463a5?q=80&w=2070',
                'Forest': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071',
                'Desert': 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=2070',
                'Mountain': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070',
                'Mixed': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2074'
              };

              return (
                <div
                  key={route._id}
                  className="group relative bg-stone-900/40 border border-stone-800/80 rounded-[2.5rem] overflow-hidden flex flex-col hover:bg-stone-900/60 hover:border-orange-500/40 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Part */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10"></div>
                    <img
                      src={terrainImages[route.terrain] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                      alt={route.name}
                    />

                    <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-black/80 backdrop-blur border border-stone-700/50 rounded-lg text-[10px] font-black text-orange-500 tracking-widest uppercase">
                        RANK: {route.difficulty === 'Expert' ? 'ELITE' : route.difficulty === 'Advanced' ? 'VETERAN' : route.difficulty === 'Intermediate' ? 'OPERATIVE' : 'RECRUIT'}
                      </span>
                      <span className="px-3 py-1 bg-black/80 backdrop-blur border border-stone-700/50 rounded-lg text-[10px] font-black text-white tracking-widest uppercase">
                        {terrainIcons[route.terrain] || '🗺️'} {route.terrain.toUpperCase()}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                      <div className="flex items-center space-x-2 text-stone-300">
                        <FaMapMarkerAlt className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]">{route.startLocation} ➔ {route.endLocation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Part */}
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-orange-500 transition-colors leading-tight">{route.name}</h3>

                    {/* Specs Row */}
                    <div className="flex gap-6 mb-6">
                      <div className="flex items-center space-x-2">
                        <FaRoute className="text-orange-500 text-xs" />
                        <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">{route.distance} KM</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaClock className="text-orange-500 text-xs" />
                        <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">{route.estimatedTime}</span>
                      </div>
                    </div>

                    <p className="text-stone-500 text-sm line-clamp-2 mb-8 font-medium leading-relaxed">{route.description}</p>

                    <div className="mt-auto grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedRoute(route)}
                        className="h-14 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        TRIAL INTEL
                      </button>
                      <button
                        onClick={() => setSelectedRoute(route)}
                        className="h-14 rounded-2xl bg-orange-500 text-black font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                      >
                        EXPLORE NOW
                      </button>
                    </div>
                  </div>
                </div>
              );
            }) : (

              <div className="col-span-full py-32 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-stone-900 border border-stone-800 mb-6 text-stone-700">
                  <FaMapMarkedAlt size={32} />
                </div>
                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Coordinate Mismatch</h3>
                <p className="text-stone-500 max-w-sm mx-auto font-medium">No trials identified with current search filters. Check system logs or reset reconnaissance parameters.</p>
                <button
                  onClick={() => { setSearchTerm(''); setDifficultyFilter(''); setTerrainFilter(''); }}
                  className="mt-8 text-orange-500 font-black uppercase tracking-widest text-[10px] border-b-2 border-orange-500/30 pb-1 hover:text-orange-400 transition-all"
                >
                  RECALIBRATE SENSORS
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal: Route Detail Intel */}
      {selectedRoute && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-[3rem] w-full max-w-4xl p-8 lg:p-12 relative shadow-[0_0_100px_rgba(0,0,0,0.8)] my-8">
            <button onClick={() => setSelectedRoute(null)} className="absolute top-8 right-8 p-4 bg-stone-800 border border-stone-700 rounded-2xl text-stone-400 hover:text-white hover:border-stone-600 transition-all"><FaTimes /></button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-3 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                  <FaBolt className="animate-pulse" />
                  <span>Topographical Intelligence File</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-none">{selectedRoute.name}</h2>
              </div>
              <div className="flex gap-3">
                <div className="px-5 py-3 bg-stone-950 border border-stone-800 rounded-2xl flex items-center space-x-3">
                  <span className="text-xl">{terrainIcons[selectedRoute.terrain]}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-100">{selectedRoute.terrain}</span>
                </div>
                <div className={`px-5 py-3 bg-stone-950 border border-stone-800 rounded-2xl flex items-center space-x-3`}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">RANK: {selectedRoute.difficulty}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                  {[
                    { label: 'DISTANCE', val: `${selectedRoute.distance} KM`, icon: FaRoute },
                    { label: 'EST. TIME', val: selectedRoute.estimatedTime, icon: FaClock },
                    { label: 'VEHICLE CLASS', val: selectedRoute.requiredVehicleType.toUpperCase(), icon: FaTools },
                    { label: 'MAX UNITS', val: selectedRoute.maxParticipants, icon: FaUsers }
                  ].map(spec => (
                    <div key={spec.label} className="p-6 bg-stone-950 border border-stone-800 rounded-[2rem] flex flex-col items-center">
                      <spec.icon className="text-orange-500 mb-3 text-xl" />
                      <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-1">{spec.label}</span>
                      <span className="text-lg font-black text-white tracking-tighter">{spec.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-8 space-y-10">
                <section className="space-y-4">
                  <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.3em]">Scouting Narrative</h3>
                  <p className="text-stone-400 text-lg font-medium leading-relaxed">{selectedRoute.description}</p>
                </section>

                {selectedRoute.waypoints && selectedRoute.waypoints.length > 0 && (
                  <section className="space-y-4">
                    <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.3em]">Primary Waypoints</h3>
                    <div className="space-y-3">
                      {selectedRoute.waypoints.map((wp, i) => (
                        <div key={i} className="group p-5 bg-stone-950 border border-stone-800 rounded-[1.5rem] flex items-center space-x-6 hover:border-stone-700 transition-all">
                          <div className="w-10 h-10 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center text-[10px] font-black text-orange-500">
                            {i + 1}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">{wp.name}</h4>
                            {wp.description && <p className="text-[10px] text-stone-500 font-bold uppercase tracking-tight">{wp.description}</p>}
                            {wp.coordinates && <p className="text-[8px] text-stone-700 font-black mt-1">COORD: {wp.coordinates.lat}, {wp.coordinates.lng}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className="lg:col-span-4 space-y-8">
                <section className="p-8 bg-stone-950 border border-stone-800 rounded-[2.5rem]">
                  <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-6">Course Navigation</h3>
                  <div className="space-y-8">
                    <div className="relative pl-6 border-l-2 border-stone-800 py-2">
                      <div className="absolute top-0 left-[-5px] w-2 h-2 bg-orange-500 rounded-full"></div>
                      <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-1">DEPARTURE</p>
                      <p className="text-xs font-black text-white uppercase tracking-widest">{selectedRoute.startLocation}</p>
                    </div>
                    <div className="relative pl-6 border-l-2 border-stone-800 py-2">
                      <div className="absolute bottom-0 left-[-5px] w-2 h-2 bg-stone-100 rounded-full"></div>
                      <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-1">DESTINATION</p>
                      <p className="text-xs font-black text-white uppercase tracking-widest">{selectedRoute.endLocation}</p>
                    </div>
                  </div>
                </section>

                {selectedRoute.safetyNotes && (
                  <section className="p-8 bg-red-500/5 border border-red-500/20 rounded-[2.5rem]">
                    <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4 flex items-center space-x-2">
                      <FaExclamationTriangle />
                      <span>Hazard Analysis</span>
                    </h3>
                    <p className="text-xs font-bold text-red-200 uppercase tracking-widest leading-relaxed">{selectedRoute.safetyNotes}</p>
                  </section>
                )}
              </aside>
            </div>

            <div className="mt-12 pt-10 border-t border-stone-800 flex justify-end">
              <button
                onClick={() => setSelectedRoute(null)}
                className="px-12 h-16 bg-stone-100 text-black font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-orange-500 transition-all active:scale-95"
              >
                CLOSE INTELLIGENCE FILE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support FAB */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <button className="w-16 h-16 bg-white text-black rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group">
          <FaBell className="text-xl group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default UserRoutes;