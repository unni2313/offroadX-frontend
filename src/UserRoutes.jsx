import React, { useState, useEffect } from 'react';
import { 
  FaMapMarkedAlt,
  FaClock,
  FaRoad,
  FaMountain,
  FaUsers,
  FaExclamationTriangle,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import API_BASE_URL from './config/api';

const UserRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [terrainFilter, setTerrainFilter] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);

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
    fetchRoutes();
  }, []);

  useEffect(() => {
    filterRoutes();
  }, [routes, searchTerm, difficultyFilter, terrainFilter]);

  const fetchRoutes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/routes`, {
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

  const clearFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('');
    setTerrainFilter('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <FaMapMarkedAlt className="text-4xl text-orange-500" />
            <div>
              <h1 className="text-4xl font-bold">Trail Routes</h1>
              <p className="text-gray-400 text-lg">Discover amazing offroad adventures</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
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
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
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
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredRoutes.length === 0 ? (
          <div className="text-center py-12">
            <FaMapMarkedAlt className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {routes.length === 0 ? 'No routes available' : 'No routes match your filters'}
            </h3>
            <p className="text-gray-500">
              {routes.length === 0 
                ? 'Check back later for new trail routes' 
                : 'Try adjusting your search criteria'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutes.map((route) => (
              <div 
                key={route._id} 
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-orange-500/50 transition-all duration-300 shadow-lg cursor-pointer transform hover:scale-105"
                onClick={() => setSelectedRoute(route)}
              >
                {/* Route Header */}
                <div className="mb-4">
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
                {route.requiredVehicleType !== 'Any' && (
                  <div className="text-center">
                    <span className="inline-block bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                      Requires: {route.requiredVehicleType}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Route Detail Modal */}
      {selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedRoute.name}</h2>
              <button
                onClick={() => setSelectedRoute(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${difficultyColors[selectedRoute.difficulty]}`}>
                  {selectedRoute.difficulty}
                </span>
                <span className="text-gray-300">
                  {terrainIcons[selectedRoute.terrain]} {selectedRoute.terrain}
                </span>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-300">{selectedRoute.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-1">Distance</h4>
                  <p className="text-gray-300">{selectedRoute.distance} km</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Estimated Time</h4>
                  <p className="text-gray-300">{selectedRoute.estimatedTime}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Start Location</h4>
                  <p className="text-gray-300">{selectedRoute.startLocation}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">End Location</h4>
                  <p className="text-gray-300">{selectedRoute.endLocation}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Vehicle Type</h4>
                  <p className="text-gray-300">{selectedRoute.requiredVehicleType}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Max Participants</h4>
                  <p className="text-gray-300">{selectedRoute.maxParticipants}</p>
                </div>
              </div>
              
              {selectedRoute.safetyNotes && (
                <div>
                  <h4 className="font-semibold text-white mb-2">Safety Notes</h4>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-yellow-200">{selectedRoute.safetyNotes}</p>
                  </div>
                </div>
              )}
              
              {selectedRoute.waypoints && selectedRoute.waypoints.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-2">Waypoints</h4>
                  <div className="space-y-2">
                    {selectedRoute.waypoints.map((waypoint, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-3">
                        <h5 className="font-medium text-white">{waypoint.name}</h5>
                        {waypoint.description && (
                          <p className="text-gray-300 text-sm">{waypoint.description}</p>
                        )}
                        {waypoint.coordinates && (
                          <p className="text-gray-400 text-xs">
                            Lat: {waypoint.coordinates.lat}, Lng: {waypoint.coordinates.lng}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={() => setSelectedRoute(null)}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
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

export default UserRoutes;