import React, { useState, useEffect } from 'react';
import API_BASE_URL from './config/api';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaToggleOn, 
  FaToggleOff,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaClock,
  FaRoad,
  FaMountain,
  FaUsers,
  FaExclamationTriangle,
  FaExternalLinkAlt
} from 'react-icons/fa';
import LocationPicker from './components/LocationPicker';

const AdminTrails = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [viewingRoute, setViewingRoute] = useState(null);
  const [currentLocation, setCurrentLocation] = useState({ lat: null, lng: null });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'Beginner',
    distance: '',
    estimatedTime: '',
    terrain: 'Mixed',
    startLocation: '',
    endLocation: '',
    startCoordinates: { lat: null, lng: null },
    endCoordinates: { lat: null, lng: null },
    waypoints: [],
    safetyNotes: '',
    requiredVehicleType: 'Any',
    maxParticipants: 20
  });

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

  const fetchRoutes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/routes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch routes:', errorData);
        if (response.status === 401) {
          alert('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          alert('Access denied. Admin privileges required.');
        } else {
          alert('Failed to load routes. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Please enter a trail route name');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }
    
    if (!formData.startLocation.trim()) {
      alert('Please set a start location');
      return;
    }
    
    if (!formData.endLocation.trim()) {
      alert('Please set an end location');
      return;
    }
    
    if (!formData.distance || parseFloat(formData.distance) <= 0) {
      alert('Please enter a valid distance');
      return;
    }
    
    if (!formData.estimatedTime.trim()) {
      alert('Please enter estimated time');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = editingRoute 
        ? `${API_BASE_URL}/api/routes/${editingRoute._id}`
        : `${API_BASE_URL}/api/routes`;
      
      const method = editingRoute ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          distance: parseFloat(formData.distance),
          maxParticipants: parseInt(formData.maxParticipants)
        })
      });

      if (response.ok) {
        await fetchRoutes();
        resetForm();
        setShowModal(false);
        alert(editingRoute ? 'Route updated successfully!' : 'Route created successfully!');
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        alert(errorData.message || 'Error saving route');
      }
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Error saving route. Please check your connection and try again.');
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      description: route.description,
      difficulty: route.difficulty,
      distance: route.distance.toString(),
      estimatedTime: route.estimatedTime,
      terrain: route.terrain,
      startLocation: route.startLocation,
      endLocation: route.endLocation,
      startCoordinates: route.startCoordinates || { lat: null, lng: null },
      endCoordinates: route.endCoordinates || { lat: null, lng: null },
      waypoints: route.waypoints || [],
      safetyNotes: route.safetyNotes || '',
      requiredVehicleType: route.requiredVehicleType,
      maxParticipants: route.maxParticipants
    });
    setShowModal(true);
  };

  const handleDelete = async (routeId) => {
    if (!confirm('Are you sure you want to delete this trail route?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/routes/${routeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchRoutes();
        alert('Route deleted successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error deleting route:', errorData);
        alert(errorData.message || 'Error deleting route');
      }
    } catch (error) {
      console.error('Error deleting route:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const handleToggleActive = async (routeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/routes/${routeId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchRoutes();
      } else {
        const errorData = await response.json();
        console.error('Error toggling route status:', errorData);
        alert(errorData.message || 'Error toggling route status');
      }
    } catch (error) {
      console.error('Error toggling route status:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      difficulty: 'Beginner',
      distance: '',
      estimatedTime: '',
      terrain: 'Mixed',
      startLocation: '',
      endLocation: '',
      startCoordinates: { lat: null, lng: null },
      endCoordinates: { lat: null, lng: null },
      waypoints: [],
      safetyNotes: '',
      requiredVehicleType: 'Any',
      maxParticipants: 20
    });
    setEditingRoute(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStartLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      startLocation: location.address,
      startCoordinates: { lat: location.lat, lng: location.lng }
    }));
  };

  const handleEndLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      endLocation: location.address,
      endCoordinates: { lat: location.lat, lng: location.lng }
    }));
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Generate Google Maps route URL for opening in new tab
  const generateRouteMapUrl = (startCoords, endCoords) => {
    if (!startCoords.lat || !startCoords.lng || !endCoords.lat || !endCoords.lng) {
      return null;
    }
    
    const startLatLng = `${startCoords.lat},${startCoords.lng}`;
    const endLatLng = `${endCoords.lat},${endCoords.lng}`;
    
    // Calculate center point for better view
    const centerLat = (startCoords.lat + endCoords.lat) / 2;
    const centerLng = (startCoords.lng + endCoords.lng) / 2;
    
    // Calculate zoom level based on distance between points
    const latDiff = Math.abs(startCoords.lat - endCoords.lat);
    const lngDiff = Math.abs(startCoords.lng - endCoords.lng);
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let zoom = 15; // default zoom
    if (maxDiff > 0.1) zoom = 12;
    if (maxDiff > 0.5) zoom = 10;
    if (maxDiff > 1) zoom = 8;
    
    return `https://www.google.com/maps/dir/${startLatLng}/${endLatLng}/@${centerLat},${centerLng},${zoom}z?hl=en-US&entry=ttu`;
  };

  // Generate Google Maps Embed URL for iframe (directions mode)
  const generateEmbedMapUrl = (startCoords, endCoords) => {
    if (!startCoords.lat || !startCoords.lng || !endCoords.lat || !endCoords.lng) {
      return null;
    }
    
    const origin = `${startCoords.lat},${startCoords.lng}`;
    const destination = `${endCoords.lat},${endCoords.lng}`;
    
    // Using Google Maps Embed API for directions
    // Note: For production, you should get a Google Maps API key and add it as &key=YOUR_API_KEY
    return `https://www.google.com/maps/embed/v1/directions?origin=${origin}&destination=${destination}&mode=driving`;
  };

  // Generate route map from current location to start point
  const generateCurrentToStartMapUrl = (startCoords, currentCoords) => {
    if (!startCoords.lat || !startCoords.lng || !currentCoords.lat || !currentCoords.lng) {
      return null;
    }
    
    // Calculate center point and zoom level
    const centerLat = (startCoords.lat + currentCoords.lat) / 2;
    const centerLng = (startCoords.lng + currentCoords.lng) / 2;
    
    // Calculate zoom level based on distance between points
    const latDiff = Math.abs(startCoords.lat - currentCoords.lat);
    const lngDiff = Math.abs(startCoords.lng - currentCoords.lng);
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let zoom = 15;
    if (maxDiff > 0.01) zoom = 13;
    if (maxDiff > 0.05) zoom = 11;
    if (maxDiff > 0.1) zoom = 10;
    if (maxDiff > 0.5) zoom = 8;
    if (maxDiff > 1) zoom = 6;
    
    // Create a data URL for an HTML page with Leaflet map showing route to start
    const mapHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Route to Trail Start</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
    <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100%; }
        .custom-marker {
            border: 2px solid #fff;
            border-radius: 8px;
            width: 60px;
            height: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 10px;
            color: white;
            font-family: Arial, sans-serif;
        }
        .current-marker {
            background-color: #3b82f6;
        }
        .start-marker {
            background-color: #22c55e;
        }
        .leaflet-routing-container {
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 8px;
            padding: 10px;
            max-height: 200px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
    <script>
        var map = L.map('map').setView([${centerLat}, ${centerLng}], ${zoom});
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Current location marker (blue)
        var currentIcon = L.divIcon({
            className: 'custom-marker current-marker',
            html: 'YOU',
            iconSize: [60, 30],
            iconAnchor: [30, 15]
        });
        
        // Start marker (green)
        var startIcon = L.divIcon({
            className: 'custom-marker start-marker',
            html: 'START',
            iconSize: [60, 30],
            iconAnchor: [30, 15]
        });
        
        // Add markers
        var currentMarker = L.marker([${currentCoords.lat}, ${currentCoords.lng}], {icon: currentIcon})
            .addTo(map)
            .bindPopup('Your Current Location');
            
        var startMarker = L.marker([${startCoords.lat}, ${startCoords.lng}], {icon: startIcon})
            .addTo(map)
            .bindPopup('Trail Start Point');
        
        // Add routing
        L.Routing.control({
            waypoints: [
                L.latLng(${currentCoords.lat}, ${currentCoords.lng}),
                L.latLng(${startCoords.lat}, ${startCoords.lng})
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            createMarker: function() { return null; }, // Don't create default markers
            lineOptions: {
                styles: [{ color: '#3b82f6', weight: 4, opacity: 0.7 }]
            }
        }).addTo(map);
        
        // Fit bounds to show both markers and route
        var group = new L.featureGroup([currentMarker, startMarker]);
        map.fitBounds(group.getBounds().pad(0.1));
    </script>
</body>
</html>`;
    
    return `data:text/html;charset=utf-8,${encodeURIComponent(mapHtml)}`;
  };

  // Generate Leaflet-based map URL with markers
  const generateStaticMapUrl = (startCoords, endCoords) => {
    if (!startCoords.lat || !startCoords.lng || !endCoords.lat || !endCoords.lng) {
      return null;
    }
    
    // Calculate center point and zoom level
    const centerLat = (startCoords.lat + endCoords.lat) / 2;
    const centerLng = (startCoords.lng + endCoords.lng) / 2;
    
    // Calculate zoom level based on distance between points
    const latDiff = Math.abs(startCoords.lat - endCoords.lat);
    const lngDiff = Math.abs(startCoords.lng - endCoords.lng);
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let zoom = 15;
    if (maxDiff > 0.01) zoom = 13;
    if (maxDiff > 0.05) zoom = 11;
    if (maxDiff > 0.1) zoom = 10;
    if (maxDiff > 0.5) zoom = 8;
    if (maxDiff > 1) zoom = 6;
    
    // Create a data URL for an HTML page with Leaflet map
    const mapHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trail Route Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100%; }
        .custom-marker {
            background-color: #ff4444;
            border: 2px solid #fff;
            border-radius: 8px;
            width: 60px;
            height: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 10px;
            color: white;
            font-family: Arial, sans-serif;
        }
        .start-marker {
            background-color: #22c55e;
        }
        .end-marker {
            background-color: #ef4444;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        var map = L.map('map').setView([${centerLat}, ${centerLng}], ${zoom});
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Start marker (green) with text
        var startIcon = L.divIcon({
            className: 'custom-marker start-marker',
            html: 'START',
            iconSize: [60, 30],
            iconAnchor: [30, 15]
        });
        
        // End marker (red) with text
        var endIcon = L.divIcon({
            className: 'custom-marker end-marker',
            html: 'END',
            iconSize: [60, 30],
            iconAnchor: [30, 15]
        });
        
        L.marker([${startCoords.lat}, ${startCoords.lng}], {icon: startIcon})
            .addTo(map)
            .bindPopup('Start Point');
            
        L.marker([${endCoords.lat}, ${endCoords.lng}], {icon: endIcon})
            .addTo(map)
            .bindPopup('End Point');
            
        // Fit bounds to show both markers
        var group = new L.featureGroup([
            L.marker([${startCoords.lat}, ${startCoords.lng}]),
            L.marker([${endCoords.lat}, ${endCoords.lng}])
        ]);
        map.fitBounds(group.getBounds().pad(0.1));
    </script>
</body>
</html>`;
    
    return `data:text/html;charset=utf-8,${encodeURIComponent(mapHtml)}`;
  };

  // No API key needed for the simplified location picker

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Trail Routes Management</h1>
          <p className="text-gray-400">Manage offroad trail routes for events and practice sessions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          <FaPlus /> Add New Trail Route
        </button>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => (
          <div key={route._id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-orange-500/50 transition-all duration-300 shadow-lg">
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
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleActive(route._id)}
                  className={`p-2 rounded-lg transition-colors ${route.isActive ? 'text-green-500 hover:bg-green-500/10' : 'text-gray-500 hover:bg-gray-500/10'}`}
                  title={route.isActive ? 'Active' : 'Inactive'}
                >
                  {route.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                </button>
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
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{route.description}</p>

            {/* Safety Notes */}
            {route.safetyNotes && (
              <div className="flex items-start gap-2 mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <FaExclamationTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" size={14} />
                <p className="text-yellow-200 text-xs">{route.safetyNotes}</p>
              </div>
            )}

            {/* Route Map Link */}
            {route.startCoordinates && route.endCoordinates && 
             route.startCoordinates.lat && route.startCoordinates.lng &&
             route.endCoordinates.lat && route.endCoordinates.lng && (
              <div className="mb-4">
                <a
                  href={generateRouteMapUrl(route.startCoordinates, route.endCoordinates)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm underline transition-colors"
                >
                  <FaMapMarkedAlt size={14} />
                  View Route on Google Maps
                  <FaExternalLinkAlt size={12} />
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewingRoute(route)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
              >
                <FaEye size={14} /> View
              </button>
              <button
                onClick={() => handleEdit(route)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
              >
                <FaEdit size={14} /> Edit
              </button>
              <button
                onClick={() => handleDelete(route._id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
              >
                <FaTrash size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {routes.length === 0 && (
        <div className="text-center py-12">
          <FaMapMarkedAlt className="text-6xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No trail routes found</h3>
          <p className="text-gray-500">Create your first trail route to get started</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-6xl max-h-[95vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingRoute ? 'Edit Trail Route' : 'Add New Trail Route'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Trail Route Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    placeholder="Enter trail route name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Difficulty Level *</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Trail Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  placeholder="Describe the trail route..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Distance (km) *</label>
                  <input
                    type="number"
                    name="distance"
                    value={formData.distance}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    placeholder="0.0"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Estimated Time *</label>
                  <input
                    type="text"
                    name="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    placeholder="e.g., 2-3 hours"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Terrain Type *</label>
                  <select
                    name="terrain"
                    value={formData.terrain}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Rocky">Rocky</option>
                    <option value="Muddy">Muddy</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Forest">Forest</option>
                    <option value="Desert">Desert</option>
                    <option value="Mountain">Mountain</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
              </div>

              {/* Location Selection with Google Maps */}
              <div>
                <label className="block text-gray-300 text-lg font-medium mb-4">Trail Route Locations *</label>
                <LocationPicker
                  onStartLocationSelect={handleStartLocationSelect}
                  onEndLocationSelect={handleEndLocationSelect}
                  startLocation={
                    formData.startLocation
                      ? {
                          lat: formData.startCoordinates.lat,
                          lng: formData.startCoordinates.lng,
                          address: formData.startLocation
                        }
                      : null
                  }
                  endLocation={
                    formData.endLocation
                      ? {
                          lat: formData.endCoordinates.lat,
                          lng: formData.endCoordinates.lng,
                          address: formData.endLocation
                        }
                      : null
                  }
                />
              </div>

              {/* Google Maps Route Preview */}
              {formData.startCoordinates.lat && formData.startCoordinates.lng && 
               formData.endCoordinates.lat && formData.endCoordinates.lng && (
                <div>
                  <label className="block text-gray-300 text-lg font-medium mb-4">Route Preview</label>
                  <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold flex items-center gap-2">
                          <FaMapMarkedAlt className="text-orange-500" />
                          Trail Route Map
                        </h4>
                        <p className="text-gray-400 text-xs mt-1">🟢 Green "START" marker | 🔴 Red "END" marker</p>
                      </div>
                      <a
                        href={generateRouteMapUrl(formData.startCoordinates, formData.endCoordinates)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm underline flex items-center gap-1"
                      >
                        Open in Google Maps <FaExternalLinkAlt size={12} />
                      </a>
                    </div>
                    
                    <div className="relative w-full h-80 rounded-lg overflow-hidden border border-gray-600">
                      <iframe
                        src={generateStaticMapUrl(formData.startCoordinates, formData.endCoordinates)}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Trail Route Map"
                        className="rounded-lg"
                      />
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-300 font-semibold mb-1">
                          <FaMapMarkerAlt size={14} />
                          Start Location
                        </div>
                        <p className="text-white text-xs">{formData.startLocation}</p>
                        <p className="text-gray-400 text-xs">
                          📍 {formData.startCoordinates.lat.toFixed(6)}, {formData.startCoordinates.lng.toFixed(6)}
                        </p>
                      </div>
                      
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-300 font-semibold mb-1">
                          <FaMapMarkedAlt size={14} />
                          End Location
                        </div>
                        <p className="text-white text-xs">{formData.endLocation}</p>
                        <p className="text-gray-400 text-xs">
                          📍 {formData.endCoordinates.lat.toFixed(6)}, {formData.endCoordinates.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Route to Start Point */}
              {formData.startCoordinates.lat && formData.startCoordinates.lng && (
                <div>
                  <label className="block text-gray-300 text-lg font-medium mb-4">Route to Trail Start</label>
                  <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold flex items-center gap-2">
                          <FaMapMarkerAlt className="text-blue-500" />
                          Get Directions to Start Point
                        </h4>
                        <p className="text-gray-400 text-xs mt-1">🔵 Blue "YOU" marker | 🟢 Green "START" marker</p>
                      </div>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-3 py-1 rounded text-sm flex items-center gap-2"
                      >
                        {locationLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Getting Location...
                          </>
                        ) : (
                          <>
                            📍 Get My Location
                          </>
                        )}
                      </button>
                    </div>
                    
                    {locationError && (
                      <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-300 text-sm">{locationError}</p>
                      </div>
                    )}
                    
                    {currentLocation.lat && currentLocation.lng ? (
                      <>
                        <div className="relative w-full h-80 rounded-lg overflow-hidden border border-gray-600">
                          <iframe
                            src={generateCurrentToStartMapUrl(formData.startCoordinates, currentLocation)}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Route to Trail Start"
                            className="rounded-lg"
                          />
                        </div>
                        
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-blue-300 font-semibold mb-1">
                              <FaMapMarkerAlt size={14} />
                              Your Location
                            </div>
                            <p className="text-white text-xs">Current Position</p>
                            <p className="text-gray-400 text-xs">
                              📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                            </p>
                          </div>
                          
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-green-300 font-semibold mb-1">
                              <FaMapMarkerAlt size={14} />
                              Trail Start
                            </div>
                            <p className="text-white text-xs">{formData.startLocation}</p>
                            <p className="text-gray-400 text-xs">
                              📍 {formData.startCoordinates.lat.toFixed(6)}, {formData.startCoordinates.lng.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400 mb-3">Click "Get My Location" to see directions to the trail start point</p>
                        <div className="text-gray-500 text-sm">
                          <p>📍 This will show you the best route from your current location</p>
                          <p>🗺️ Interactive map with turn-by-turn directions</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Required Vehicle Type</label>
                  <select
                    name="requiredVehicleType"
                    value={formData.requiredVehicleType}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Any">Any Vehicle</option>
                    <option value="ATV">ATV</option>
                    <option value="UTV">UTV</option>
                    <option value="Dirt Bike">Dirt Bike</option>
                    <option value="4x4 Truck">4x4 Truck</option>
                    <option value="Jeep">Jeep</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Max Participants</label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    placeholder="20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Safety Notes</label>
                <textarea
                  name="safetyNotes"
                  value={formData.safetyNotes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  placeholder="Important safety information for this trail..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
                >
                  {editingRoute ? 'Update Trail Route' : 'Create Trail Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Route Modal */}
      {viewingRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{viewingRoute.name}</h2>
              <button
                onClick={() => setViewingRoute(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${difficultyColors[viewingRoute.difficulty]}`}>
                  {viewingRoute.difficulty}
                </span>
                <span className="text-gray-300">
                  {terrainIcons[viewingRoute.terrain]} {viewingRoute.terrain}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${viewingRoute.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}>
                  {viewingRoute.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-300">{viewingRoute.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-1">Distance</h4>
                  <p className="text-gray-300">{viewingRoute.distance} km</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Estimated Time</h4>
                  <p className="text-gray-300">{viewingRoute.estimatedTime}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Start Location</h4>
                  <p className="text-gray-300">{viewingRoute.startLocation}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">End Location</h4>
                  <p className="text-gray-300">{viewingRoute.endLocation}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Vehicle Type</h4>
                  <p className="text-gray-300">{viewingRoute.requiredVehicleType}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Max Participants</h4>
                  <p className="text-gray-300">{viewingRoute.maxParticipants}</p>
                </div>
              </div>
              
              {viewingRoute.safetyNotes && (
                <div>
                  <h4 className="font-semibold text-white mb-2">Safety Notes</h4>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-yellow-200">{viewingRoute.safetyNotes}</p>
                  </div>
                </div>
              )}

              {/* Route Map Preview */}
              {viewingRoute.startCoordinates && viewingRoute.endCoordinates && 
               viewingRoute.startCoordinates.lat && viewingRoute.startCoordinates.lng &&
               viewingRoute.endCoordinates.lat && viewingRoute.endCoordinates.lng && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white">Route Map</h4>
                      <p className="text-gray-400 text-xs mt-1">🟢 Green "START" marker | 🔴 Red "END" marker</p>
                    </div>
                    <a
                      href={generateRouteMapUrl(viewingRoute.startCoordinates, viewingRoute.endCoordinates)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm underline flex items-center gap-1"
                    >
                      Open in Google Maps <FaExternalLinkAlt size={12} />
                    </a>
                  </div>
                  
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-600">
                    <iframe
                      src={generateStaticMapUrl(viewingRoute.startCoordinates, viewingRoute.endCoordinates)}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Trail Route Map"
                      className="rounded-lg"
                    />
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-300 font-semibold mb-1">
                        <FaMapMarkedAlt size={14} />
                        Start Location
                      </div>
                      <p className="text-white text-xs">{viewingRoute.startLocation}</p>
                      <p className="text-gray-400 text-xs">
                        📍 {viewingRoute.startCoordinates.lat.toFixed(6)}, {viewingRoute.startCoordinates.lng.toFixed(6)}
                      </p>
                    </div>
                    
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-300 font-semibold mb-1">
                        <FaMapMarkedAlt size={14} />
                        End Location
                      </div>
                      <p className="text-white text-xs">{viewingRoute.endLocation}</p>
                      <p className="text-gray-400 text-xs">
                        📍 {viewingRoute.endCoordinates.lat.toFixed(6)}, {viewingRoute.endCoordinates.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Route to Start Point in Viewing Modal */}
              {viewingRoute.startCoordinates && viewingRoute.startCoordinates.lat && viewingRoute.startCoordinates.lng && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white">Route to Trail Start</h4>
                      <p className="text-gray-400 text-xs mt-1">🔵 Blue "YOU" marker | 🟢 Green "START" marker</p>
                    </div>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-3 py-1 rounded text-sm flex items-center gap-2"
                    >
                      {locationLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Getting Location...
                        </>
                      ) : (
                        <>
                          📍 Get My Location
                        </>
                      )}
                    </button>
                  </div>
                  
                  {locationError && (
                    <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 text-sm">{locationError}</p>
                    </div>
                  )}
                  
                  {currentLocation.lat && currentLocation.lng ? (
                    <>
                      <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-600">
                        <iframe
                          src={generateCurrentToStartMapUrl(viewingRoute.startCoordinates, currentLocation)}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Route to Trail Start"
                          className="rounded-lg"
                        />
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-blue-300 font-semibold mb-1">
                            <FaMapMarkerAlt size={14} />
                            Your Location
                          </div>
                          <p className="text-white text-xs">Current Position</p>
                          <p className="text-gray-400 text-xs">
                            📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                          </p>
                        </div>
                        
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-300 font-semibold mb-1">
                            <FaMapMarkerAlt size={14} />
                            Trail Start
                          </div>
                          <p className="text-white text-xs">{viewingRoute.startLocation}</p>
                          <p className="text-gray-400 text-xs">
                            📍 {viewingRoute.startCoordinates.lat.toFixed(6)}, {viewingRoute.startCoordinates.lng.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-400 mb-3">Click "Get My Location" to see directions to the trail start point</p>
                      <div className="text-gray-500 text-sm">
                        <p>📍 This will show you the best route from your current location</p>
                        <p>🗺️ Interactive map with turn-by-turn directions</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={() => setViewingRoute(null)}
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

export default AdminTrails;