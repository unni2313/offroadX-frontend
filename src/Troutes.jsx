import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaMapMarkedAlt,
  FaClock,
  FaRoad,
  FaMountain,
  FaUsers,
  FaExclamationTriangle,
  FaFilter,
  FaSearch,
  FaEye,
  FaBookmark,
  FaRegBookmark,
  FaUser,
  FaSignOutAlt,
  FaCalendarAlt,
  FaRoute,
  FaTrophy,
  FaBell,
  FaBars,
  FaTimes,
  FaCompass,
  FaShoppingCart
} from 'react-icons/fa';

import API_BASE_URL from './config/api';

const Routes = () => {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingRoute, setViewingRoute] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [terrainFilter, setTerrainFilter] = useState('');
  const [bookmarkedRoutes, setBookmarkedRoutes] = useState([]);
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const leafletMapRef = useRef(null);
  const leafletContainerId = 'route-leaflet-map';
  const navigate = useNavigate();

  const difficultyColors = {
    'Beginner': 'bg-green-500',
    'Intermediate': 'bg-yellow-500',
    'Advanced': 'bg-orange-500',
    'Expert': 'bg-red-500'
  };

  const terrainIcons = {
    'Rocky': '🪨',
    'Muddy': '🟤',
    'Sandy': '🏜️',
    'Forest': '🌲',
    'Desert': '🏜️',
    'Mountain': '⛰️',
    'Mixed': '🌍'
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchProfileData();
    } else {
      navigate('/login');
    }
    fetchRoutes();
    loadBookmarks();
  }, [navigate]);

  useEffect(() => {
    filterRoutes();
  }, [routes, searchTerm, difficultyFilter, terrainFilter]);

  const fetchRoutes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/routes?isActive=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      } else {
        console.error('Failed to fetch routes', response.status);
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRoutes = () => {
    let filtered = routes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(route =>
        route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.endLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Difficulty filter
    if (difficultyFilter) {
      filtered = filtered.filter(route => route.difficulty === difficultyFilter);
    }

    // Terrain filter
    if (terrainFilter) {
      filtered = filtered.filter(route => route.terrain === terrainFilter);
    }

    setFilteredRoutes(filtered);
  };

  const loadBookmarks = () => {
    const saved = localStorage.getItem('bookmarkedRoutes');
    if (saved) {
      setBookmarkedRoutes(JSON.parse(saved));
    }
  };

  const toggleBookmark = (routeId) => {
    let newBookmarks;
    if (bookmarkedRoutes.includes(routeId)) {
      newBookmarks = bookmarkedRoutes.filter(id => id !== routeId);
    } else {
      newBookmarks = [...bookmarkedRoutes, routeId];
    }
    setBookmarkedRoutes(newBookmarks);
    localStorage.setItem('bookmarkedRoutes', JSON.stringify(newBookmarks));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('');
    setTerrainFilter('');
  };

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        console.error('Failed to fetch profile data', response.status);
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Initialize/Update Leaflet map when viewingRoute changes
  useEffect(() => {
    if (!viewingRoute) return;

    const hasStart = viewingRoute?.startCoordinates?.lat != null && viewingRoute?.startCoordinates?.lng != null;
    const hasEnd = viewingRoute?.endCoordinates?.lat != null && viewingRoute?.endCoordinates?.lng != null;

    // If no coordinates are present, do not render the map (keeps layout)
    if (!hasStart && !hasEnd) {
      // Clean up any previous map
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      return;
    }

    // Ensure container exists
    const container = document.getElementById(leafletContainerId);
    if (!container) return;

    // If a map already exists, remove it first to avoid duplicate maps
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    // Create map with a default center (use start if available, else end)
    const startLatLng = hasStart ? [viewingRoute.startCoordinates.lat, viewingRoute.startCoordinates.lng] : null;
    const endLatLng = hasEnd ? [viewingRoute.endCoordinates.lat, viewingRoute.endCoordinates.lng] : null;
    const center = startLatLng || endLatLng;

    const map = L.map(leafletContainerId, {
      center,
      zoom: 12,
      zoomControl: true
    });
    leafletMapRef.current = map;

    // Tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Markers and bounds
    const bounds = [];
    let startMarker = null;
    if (startLatLng) {
      startMarker = L.marker(startLatLng, { title: 'Start' }).addTo(map).bindPopup('Start');
      bounds.push(startLatLng);
    }
    if (endLatLng) {
      L.marker(endLatLng, { title: 'End' }).addTo(map).bindPopup('End');
      bounds.push(endLatLng);
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [30, 30] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    }

    // Make map clickable to open Google Maps directions from user's current location to Start
    const directionsUrl = startLatLng
      ? `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${startLatLng[0]},${startLatLng[1]}`
      : (viewingRoute?.startLocation
        ? `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encodeURIComponent(viewingRoute.startLocation)}`
        : null);

    if (directionsUrl) {
      // Indicate clickability
      const mapContainerEl = map.getContainer();
      if (mapContainerEl) {
        mapContainerEl.style.cursor = 'pointer';
        mapContainerEl.title = 'Open directions to Start in Google Maps';
      }

      // Click anywhere on the map
      map.on('click', () => {
        window.open(directionsUrl, '_blank', 'noopener,noreferrer');
      });

      // Click the Start marker
      if (startMarker) {
        startMarker.on('click', () => {
          window.open(directionsUrl, '_blank', 'noopener,noreferrer');
        });
      }
    }

    // Cleanup on unmount or when viewingRoute changes
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [viewingRoute]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-neutral-900 to-stone-800 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading trail routes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
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
              <button className="text-stone-300 hover:text-orange-400 relative transition-colors">
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

        {/* Mobile Menu Sidebar */}
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
      </nav>


      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900/95 to-gray-800/90 border-b border-gray-700/50 backdrop-blur-xl z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 mb-4 drop-shadow-2xl">
              Discover Trail Routes
            </h1>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">Explore amazing offroad adventures and find your next challenge</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400" />
              <input
                type="text"
                placeholder="Search routes by name, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-600 rounded-2xl pl-12 pr-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 backdrop-blur-sm transition-all duration-300"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-gray-800/60 border border-gray-600 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 backdrop-blur-sm transition-all duration-300"
              >
                <option value="">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>

              <select
                value={terrainFilter}
                onChange={(e) => setTerrainFilter(e.target.value)}
                className="bg-gray-800/60 border border-gray-600 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 backdrop-blur-sm transition-all duration-300"
              >
                <option value="">All Terrains</option>
                <option value="Rocky">Rocky</option>
                <option value="Muddy">Muddy</option>
                <option value="Sandy">Sandy</option>
                <option value="Forest">Forest</option>
                <option value="Desert">Desert</option>
                <option value="Mountain">Mountain</option>
                <option value="Mixed">Mixed</option>
              </select>

              {(searchTerm || difficultyFilter || terrainFilter) && (
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white px-6 py-4 rounded-2xl transition-all duration-300 font-semibold shadow-lg"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredRoutes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRoutes.map((route) => (
              <div key={route._id} className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-3xl p-8 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 shadow-2xl backdrop-blur-sm hover:scale-105 hover:shadow-[0_25px_50px_rgba(249,115,22,0.15)] group">
                {/* Route Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-3 group-hover:from-orange-200 group-hover:to-white transition-all duration-500">{route.name}</h3>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${route.difficulty === 'Beginner' ? 'from-green-500 to-green-600' :
                        route.difficulty === 'Intermediate' ? 'from-yellow-500 to-yellow-600' :
                          route.difficulty === 'Advanced' ? 'from-orange-500 to-orange-600' :
                            'from-red-500 to-red-600'
                        } shadow-lg`}>
                        {route.difficulty}
                      </span>
                      <span className="text-gray-300 text-base font-medium">
                        {terrainIcons[route.terrain]} {route.terrain}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBookmark(route._id)}
                    className="text-orange-500 hover:text-orange-400 transition-all duration-300 p-3 rounded-2xl hover:bg-orange-500/10 group-hover:scale-110"
                    title={bookmarkedRoutes.includes(route._id) ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    {bookmarkedRoutes.includes(route._id) ? <FaBookmark size={24} /> : <FaRegBookmark size={24} />}
                  </button>
                </div>

                {/* Route Info */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-200">
                    <div className="p-2 bg-orange-500/20 rounded-xl">
                      <FaRoad className="text-orange-400 text-lg" />
                    </div>
                    <span className="text-base font-medium">{route.distance} km</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-200">
                    <div className="p-2 bg-orange-500/20 rounded-xl">
                      <FaClock className="text-orange-400 text-lg" />
                    </div>
                    <span className="text-base font-medium">{route.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-200">
                    <div className="p-2 bg-orange-500/20 rounded-xl">
                      <FaUsers className="text-orange-400 text-lg" />
                    </div>
                    <span className="text-base font-medium">Max {route.maxParticipants} participants</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-200">
                    <div className="p-2 bg-orange-500/20 rounded-xl">
                      <FaMapMarkedAlt className="text-orange-400 text-lg" />
                    </div>
                    <span className="text-base font-medium">{route.startLocation} → {route.endLocation}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-base mb-6 line-clamp-3 leading-relaxed">{route.description}</p>

                {/* Safety Notes */}
                {route.safetyNotes && (
                  <div className="flex items-start gap-3 mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-500/30">
                    <div className="p-1 bg-yellow-500/20 rounded-lg">
                      <FaExclamationTriangle className="text-yellow-400 flex-shrink-0" size={16} />
                    </div>
                    <p className="text-yellow-200 text-sm leading-relaxed">{route.safetyNotes}</p>
                  </div>
                )}

                {/* Vehicle Type */}
                <div className="mb-6">
                  <span className="inline-block bg-gradient-to-r from-gray-700/80 to-gray-600/80 text-gray-200 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    {route.requiredVehicleType}
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setViewingRoute(route)}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:shadow-orange-500/25 group-hover:scale-105"
                >
                  <FaEye size={18} /> View Details & Map
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <FaMapMarkedAlt className="text-8xl text-gray-600 mx-auto mb-6 opacity-50" />
              <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-3xl opacity-30"></div>
            </div>
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-600 mb-6">No routes found</h3>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              {searchTerm || difficultyFilter || terrainFilter
                ? "Try adjusting your search criteria or filters to discover more routes"
                : "No trail routes are currently available. Check back soon for new adventures!"}
            </p>
            {(searchTerm || difficultyFilter || terrainFilter) && (
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-orange-500/25"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* View Route Modal */}
      {viewingRoute && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 rounded-3xl p-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700/50 shadow-2xl backdrop-blur-sm">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600 mb-4">{viewingRoute.name}</h2>
                <div className="flex items-center gap-4">
                  <span className={`px-6 py-3 rounded-full text-base font-bold text-white bg-gradient-to-r ${viewingRoute.difficulty === 'Beginner' ? 'from-green-500 to-green-600' :
                    viewingRoute.difficulty === 'Intermediate' ? 'from-yellow-500 to-yellow-600' :
                      viewingRoute.difficulty === 'Advanced' ? 'from-orange-500 to-orange-600' :
                        'from-red-500 to-red-600'
                    } shadow-lg`}>
                    {viewingRoute.difficulty}
                  </span>
                  <span className="text-gray-200 text-xl font-medium">
                    {terrainIcons[viewingRoute.terrain]} {viewingRoute.terrain}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingRoute(null)}
                className="text-gray-400 hover:text-orange-400 text-4xl transition-all duration-300 p-2 rounded-2xl hover:bg-gray-700/50"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-8">
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-xl">
                    <FaMapMarkedAlt className="text-orange-400" />
                  </div>
                  Route Description
                </h3>
                <p className="text-gray-200 leading-relaxed text-lg">{viewingRoute.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-3 text-lg">
                      <div className="p-2 bg-orange-500/20 rounded-xl">
                        <FaRoad className="text-orange-400" />
                      </div>
                      Distance
                    </h4>
                    <p className="text-gray-200 text-xl font-semibold">{viewingRoute.distance} km</p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-3 text-lg">
                      <div className="p-2 bg-orange-500/20 rounded-xl">
                        <FaClock className="text-orange-400" />
                      </div>
                      Estimated Time
                    </h4>
                    <p className="text-gray-200 text-xl font-semibold">{viewingRoute.estimatedTime}</p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-3 text-lg">
                      <div className="p-2 bg-orange-500/20 rounded-xl">
                        <FaUsers className="text-orange-400" />
                      </div>
                      Max Participants
                    </h4>
                    <p className="text-gray-200 text-xl font-semibold">{viewingRoute.maxParticipants} people</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30">
                    <h4 className="font-bold text-white mb-3 text-lg">Start Location</h4>
                    <p className="text-gray-200 text-xl font-semibold">{viewingRoute.startLocation}</p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30">
                    <h4 className="font-bold text-white mb-3 text-lg">End Location</h4>
                    <p className="text-gray-200 text-xl font-semibold">{viewingRoute.endLocation}</p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30">
                    <h4 className="font-bold text-white mb-3 text-lg">Required Vehicle</h4>
                    <p className="text-gray-200 text-xl font-semibold">{viewingRoute.requiredVehicleType}</p>
                  </div>
                </div>
              </div>

              {/* Map Section (Leaflet with two pins, no route line) */}
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-xl">
                    <FaMapMarkedAlt className="text-orange-400" />
                  </div>
                  Interactive Route Map
                </h3>
                <div className="rounded-2xl overflow-hidden border border-gray-600/50 shadow-2xl">
                  <div id="route-leaflet-map" className="w-full h-96" />
                </div>
                <div className="mt-4 flex justify-center">
                  <a
                    href={
                      (viewingRoute?.startCoordinates?.lat != null && viewingRoute?.startCoordinates?.lng != null)
                        ? `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${viewingRoute.startCoordinates.lat},${viewingRoute.startCoordinates.lng}`
                        : `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encodeURIComponent(viewingRoute.startLocation)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <FaMapMarkedAlt /> Get Directions in Google Maps
                  </a>
                </div>
              </div>

              {viewingRoute.safetyNotes && (
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/30">
                  <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-xl">
                      <FaExclamationTriangle className="text-yellow-400" />
                    </div>
                    Safety Notes
                  </h4>
                  <p className="text-yellow-200 text-lg leading-relaxed">{viewingRoute.safetyNotes}</p>
                </div>
              )}

              <div className="flex gap-6 pt-8 border-t border-gray-600/50">
                <button
                  onClick={() => toggleBookmark(viewingRoute._id)}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 text-lg shadow-xl ${bookmarkedRoutes.includes(viewingRoute._id)
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-500/25'
                    : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-200'
                    }`}
                >
                  {bookmarkedRoutes.includes(viewingRoute._id) ? <FaBookmark size={20} /> : <FaRegBookmark size={20} />}
                  {bookmarkedRoutes.includes(viewingRoute._id) ? 'Bookmarked' : 'Bookmark Route'}
                </button>
                <button
                  onClick={() => setViewingRoute(null)}
                  className="flex-1 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl text-lg"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routes;