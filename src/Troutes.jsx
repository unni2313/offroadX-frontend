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
  FaTimes
} from 'react-icons/fa';

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
      const response = await fetch('http://localhost:5000/api/routes?isActive=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      } else {
        console.error('Failed to fetch routes');
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
      const response = await fetch('http://localhost:5000/api/profile', {
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
        console.error('Failed to fetch profile data');
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
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-neutral-900 to-stone-800 text-white">
      {/* Navigation Header */}
      <nav className="relative z-50 bg-gradient-to-r from-stone-900/95 to-neutral-900/90 border-b border-stone-700/50 sticky top-0 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <FaMapMarkedAlt className="text-orange-500 text-2xl md:text-3xl transform group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]" />
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              </div>
              <span className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 drop-shadow-2xl tracking-tight">
                OffroadX
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-10">
              <Link to="/events" className="text-stone-300 hover:text-orange-400 transition-all duration-300 flex items-center space-x-2 font-semibold tracking-wide">
                <FaCalendarAlt className="text-lg" />
                <span>Events</span>
              </Link>
              <Link to="/routes" className="text-orange-400 transition-all duration-300 flex items-center space-x-2 font-semibold tracking-wide">
                <FaRoute className="text-lg" />
                <span>Routes</span>
              </Link>
              <Link to="/achievements" className="text-stone-300 hover:text-orange-400 transition-all duration-300 flex items-center space-x-2 font-semibold tracking-wide">
                <FaTrophy className="text-lg" />
                <span>Achievements</span>
              </Link>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <button className="text-stone-300 hover:text-orange-400 transition-all duration-300 relative">
                <FaBell className="text-2xl" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              </button>
              <div className="flex items-center space-x-4">
                <button onClick={handleProfileClick} className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
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
                  <div>
                    <p className="text-lg font-bold text-white tracking-wide">{user.firstName} {user.secondName}</p>
                    <p className="text-sm text-stone-400">Click to view profile</p>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-stone-300 hover:text-red-400 transition-all duration-300 p-2 rounded-xl hover:bg-red-500/10"
                  title="Logout"
                >
                  <FaSignOutAlt className="text-xl" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              <button className="text-stone-300 hover:text-orange-400 transition-all duration-300 relative">
                <FaBell className="text-xl" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              </button>
              <button onClick={handleProfileClick} className="hover:opacity-80 transition-opacity">
                {profileData?.profilePhotoUrl ? (
                  <img
                    src={profileData.profilePhotoUrl}
                    alt="Profile"
                    className="w-10 h-10 rounded-xl object-cover border-2 border-orange-500/50 shadow-[0_8px_30px_rgba(249,115,22,0.3)]"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_8px_30px_rgba(249,115,22,0.3)]">
                    <FaUser className="text-white text-sm" />
                  </div>
                )}
              </button>
              <button
                onClick={toggleMobileMenu}
                className="text-stone-300 hover:text-orange-400 transition-all duration-300 p-2"
              >
                {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-br from-stone-900/98 to-neutral-900/95 border-b border-stone-700/50 backdrop-blur-xl shadow-2xl">
              <div className="px-4 py-6 space-y-4">
                <Link 
                  to="/events" 
                  className="flex items-center space-x-3 text-stone-300 hover:text-orange-400 transition-all duration-300 py-3 px-4 rounded-xl hover:bg-stone-800/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaCalendarAlt className="text-lg" />
                  <span className="font-semibold">Events</span>
                </Link>
                <Link 
                  to="/routes" 
                  className="flex items-center space-x-3 text-orange-400 transition-all duration-300 py-3 px-4 rounded-xl bg-orange-500/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaRoute className="text-lg" />
                  <span className="font-semibold">Routes</span>
                </Link>
                <Link 
                  to="/achievements" 
                  className="flex items-center space-x-3 text-stone-300 hover:text-orange-400 transition-all duration-300 py-3 px-4 rounded-xl hover:bg-stone-800/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
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
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition-all duration-300 py-3 px-4 rounded-xl hover:bg-red-500/10 w-full"
                  >
                    <FaSignOutAlt className="text-lg" />
                    <span className="font-semibold">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900/95 to-neutral-900/90 border-b border-stone-700/50 backdrop-blur-xl z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 mb-2">
              Discover Trail Routes
            </h1>
            <p className="text-gray-400 text-lg">Explore amazing offroad adventures and find your next challenge</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-stone-800/50 border border-stone-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-stone-800/50 border border-stone-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
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
                className="bg-stone-800/50 border border-stone-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
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
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredRoutes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRoutes.map((route) => (
              <div key={route._id} className="bg-gradient-to-br from-stone-800/80 to-neutral-800/80 rounded-2xl p-6 border border-stone-700/50 hover:border-orange-500/50 transition-all duration-300 shadow-2xl backdrop-blur-sm">
                {/* Route Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{route.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${difficultyColors[route.difficulty]}`}>
                        {route.difficulty}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {terrainIcons[route.terrain]} {route.terrain}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBookmark(route._id)}
                    className="text-orange-500 hover:text-orange-400 transition-colors p-2"
                    title={bookmarkedRoutes.includes(route._id) ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    {bookmarkedRoutes.includes(route._id) ? <FaBookmark size={20} /> : <FaRegBookmark size={20} />}
                  </button>
                </div>

                {/* Route Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaRoad className="text-orange-500" />
                    <span className="text-sm">{route.distance} km</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaClock className="text-orange-500" />
                    <span className="text-sm">{route.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaUsers className="text-orange-500" />
                    <span className="text-sm">Max {route.maxParticipants} participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaMapMarkedAlt className="text-orange-500" />
                    <span className="text-sm">{route.startLocation} → {route.endLocation}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{route.description}</p>

                {/* Safety Notes */}
                {route.safetyNotes && (
                  <div className="flex items-start gap-2 mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <FaExclamationTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" size={14} />
                    <p className="text-yellow-200 text-xs">{route.safetyNotes}</p>
                  </div>
                )}

                {/* Vehicle Type */}
                <div className="mb-4">
                  <span className="inline-block bg-stone-700/50 text-gray-300 px-3 py-1 rounded-full text-xs">
                    {route.requiredVehicleType}
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setViewingRoute(route)}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                >
                  <FaEye size={16} /> View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FaMapMarkedAlt className="text-6xl text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-400 mb-4">No routes found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || difficultyFilter || terrainFilter 
                ? "Try adjusting your search criteria or filters" 
                : "No trail routes are currently available"}
            </p>
            {(searchTerm || difficultyFilter || terrainFilter) && (
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* View Route Modal */}
      {viewingRoute && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-stone-800 to-neutral-800 rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-stone-700/50 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{viewingRoute.name}</h2>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${difficultyColors[viewingRoute.difficulty]}`}>
                    {viewingRoute.difficulty}
                  </span>
                  <span className="text-gray-300 text-lg">
                    {terrainIcons[viewingRoute.terrain]} {viewingRoute.terrain}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingRoute(null)}
                className="text-gray-400 hover:text-white text-3xl transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{viewingRoute.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <FaRoad className="text-orange-500" /> Distance
                    </h4>
                    <p className="text-gray-300">{viewingRoute.distance} km</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <FaClock className="text-orange-500" /> Estimated Time
                    </h4>
                    <p className="text-gray-300">{viewingRoute.estimatedTime}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <FaUsers className="text-orange-500" /> Max Participants
                    </h4>
                    <p className="text-gray-300">{viewingRoute.maxParticipants} people</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Start Location</h4>
                    <p className="text-gray-300">{viewingRoute.startLocation}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">End Location</h4>
                    <p className="text-gray-300">{viewingRoute.endLocation}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Required Vehicle</h4>
                    <p className="text-gray-300">{viewingRoute.requiredVehicleType}</p>
                  </div>
                </div>
              </div>

              {/* Map Section (Leaflet with two pins, no route line) */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <FaMapMarkedAlt className="text-orange-500" /> Map
                </h3>
                <div className="rounded-xl overflow-hidden border border-stone-700">
                  <div id="route-leaflet-map" className="w-full h-80" />
                </div>
                <a
                  href={
                    (viewingRoute?.startCoordinates?.lat != null && viewingRoute?.startCoordinates?.lng != null)
                      ? `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${viewingRoute.startCoordinates.lat},${viewingRoute.startCoordinates.lng}`
                      : `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encodeURIComponent(viewingRoute.startLocation)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 text-sm mt-2 inline-block"
                >
                  Open in Google Maps (Directions to Start)
                </a>
              </div>

              {viewingRoute.safetyNotes && (
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <FaExclamationTriangle className="text-yellow-500" /> Safety Notes
                  </h4>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <p className="text-yellow-200">{viewingRoute.safetyNotes}</p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 pt-6 border-t border-stone-700">
                <button
                  onClick={() => toggleBookmark(viewingRoute._id)}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    bookmarkedRoutes.includes(viewingRoute._id)
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-stone-700 hover:bg-stone-600 text-gray-300'
                  }`}
                >
                  {bookmarkedRoutes.includes(viewingRoute._id) ? <FaBookmark /> : <FaRegBookmark />}
                  {bookmarkedRoutes.includes(viewingRoute._id) ? 'Bookmarked' : 'Bookmark Route'}
                </button>
                <button
                  onClick={() => setViewingRoute(null)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
                >
                  Close
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