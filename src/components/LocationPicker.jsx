import React, { useState } from 'react';
import { FaMapMarkerAlt, FaSearch, FaGlobe, FaCrosshairs, FaExternalLinkAlt } from 'react-icons/fa';

const LocationPicker = ({ 
  onStartLocationSelect, 
  onEndLocationSelect, 
  startLocation, 
  endLocation 
}) => {
  const [activeSelection, setActiveSelection] = useState(null); // 'start' or 'end'
  const [tempLocation, setTempLocation] = useState({
    address: '',
    lat: '',
    lng: ''
  });

  const handleLocationSubmit = () => {
    if (!tempLocation.address.trim()) {
      alert('Please enter a location address');
      return;
    }

    const locationData = {
      address: tempLocation.address,
      lat: tempLocation.lat ? parseFloat(tempLocation.lat) : null,
      lng: tempLocation.lng ? parseFloat(tempLocation.lng) : null
    };

    if (activeSelection === 'start') {
      onStartLocationSelect(locationData);
    } else if (activeSelection === 'end') {
      onEndLocationSelect(locationData);
    }

    // Reset form
    setTempLocation({ address: '', lat: '', lng: '' });
    setActiveSelection(null);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setTempLocation(prev => ({
          ...prev,
          lat: lat.toString(),
          lng: lng.toString(),
          address: prev.address || `Current Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`
        }));
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get current location. Please enter coordinates manually.');
      }
    );
  };

  const openInMaps = (location) => {
    if (location && location.lat && location.lng) {
      const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      window.open(url, '_blank');
    } else if (location && location.address) {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(location.address)}`;
      window.open(url, '_blank');
    }
  };

  const validateCoordinates = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    return !isNaN(latitude) && !isNaN(longitude) && 
           latitude >= -90 && latitude <= 90 && 
           longitude >= -180 && longitude <= 180;
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
          <FaGlobe /> How to add locations:
        </h4>
        <ol className="text-blue-200 text-sm space-y-1">
          <li>1. Click "Set Start Location" or "Set End Location"</li>
          <li>2. Enter the address/location name</li>
          <li>3. Optionally add GPS coordinates for precision</li>
          <li>4. Use "Get Current Location" for your current position</li>
          <li>5. Click "Save Location" to confirm</li>
        </ol>
      </div>

      {/* Current Locations Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Location */}
        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-green-300 font-semibold flex items-center gap-2">
              <FaMapMarkerAlt /> Start Location
            </h4>
            {startLocation && startLocation.address && (
              <button
                onClick={() => openInMaps(startLocation)}
                className="text-green-400 hover:text-green-300 transition-colors"
                title="View in Google Maps"
              >
                <FaExternalLinkAlt size={14} />
              </button>
            )}
          </div>
          {startLocation && startLocation.address ? (
            <div>
              <p className="text-white text-sm mb-1">{startLocation.address}</p>
              {startLocation.lat && startLocation.lng && (
                <p className="text-gray-400 text-xs">
                  📍 {startLocation.lat.toFixed(6)}, {startLocation.lng.toFixed(6)}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveSelection('start');
                  setTempLocation({
                    address: startLocation.address,
                    lat: startLocation.lat ? startLocation.lat.toString() : '',
                    lng: startLocation.lng ? startLocation.lng.toString() : ''
                  });
                }}
                className="mt-2 text-green-400 hover:text-green-300 text-sm underline"
              >
                Edit Location
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 text-sm mb-2">No start location set</p>
              <button
                type="button"
                onClick={() => setActiveSelection('start')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Set Start Location
              </button>
            </div>
          )}
        </div>

        {/* End Location */}
        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-red-300 font-semibold flex items-center gap-2">
              <FaMapMarkerAlt /> End Location
            </h4>
            {endLocation && endLocation.address && (
              <button
                onClick={() => openInMaps(endLocation)}
                className="text-red-400 hover:text-red-300 transition-colors"
                title="View in Google Maps"
              >
                <FaExternalLinkAlt size={14} />
              </button>
            )}
          </div>
          {endLocation && endLocation.address ? (
            <div>
              <p className="text-white text-sm mb-1">{endLocation.address}</p>
              {endLocation.lat && endLocation.lng && (
                <p className="text-gray-400 text-xs">
                  📍 {endLocation.lat.toFixed(6)}, {endLocation.lng.toFixed(6)}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveSelection('end');
                  setTempLocation({
                    address: endLocation.address,
                    lat: endLocation.lat ? endLocation.lat.toString() : '',
                    lng: endLocation.lng ? endLocation.lng.toString() : ''
                  });
                }}
                className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
              >
                Edit Location
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 text-sm mb-2">No end location set</p>
              <button
                type="button"
                onClick={() => setActiveSelection('end')}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Set End Location
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Location Input Form */}
      {activeSelection && (
        <div className={`bg-gray-700 rounded-lg p-6 border-2 ${
          activeSelection === 'start' ? 'border-green-500' : 'border-red-500'
        }`}>
          <h4 className={`font-semibold mb-4 flex items-center gap-2 ${
            activeSelection === 'start' ? 'text-green-300' : 'text-red-300'
          }`}>
            <FaMapMarkerAlt />
            {activeSelection === 'start' ? 'Set Start Location' : 'Set End Location'}
          </h4>

          <div className="space-y-4">
            {/* Address Input */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Location Address/Name *
              </label>
              <input
                type="text"
                value={tempLocation.address}
                onChange={(e) => setTempLocation(prev => ({ ...prev, address: e.target.value }))}
                placeholder="e.g., Desert Trail Entrance, Phoenix, AZ"
                className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            {/* Quick Paste Coordinates */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                📍 Paste Coordinates from Google Maps
              </label>
              <input
                type="text"
                placeholder="Paste coordinates here: e.g., 9.524214093959516, 76.81849446875187"
                className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                onChange={(e) => {
                  const value = e.target.value.trim();
                  if (value.includes(',')) {
                    const [lat, lng] = value.split(',').map(coord => coord.trim());
                    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                      setTempLocation(prev => ({
                        ...prev,
                        lat: parseFloat(lat),
                        lng: parseFloat(lng)
                      }));
                      // Clear the input after successful parsing
                      e.target.value = '';
                    }
                  }
                }}
              />
              <p className="text-gray-400 text-xs mt-1">
                💡 Right-click on Google Maps → Copy coordinates, then paste here
              </p>
            </div>

            {/* Coordinates Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Latitude (optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={tempLocation.lat}
                  onChange={(e) => setTempLocation(prev => ({ ...prev, lat: e.target.value }))}
                  placeholder="e.g., 33.4484"
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Longitude (optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={tempLocation.lng}
                  onChange={(e) => setTempLocation(prev => ({ ...prev, lng: e.target.value }))}
                  placeholder="e.g., -112.0740"
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Coordinate validation */}
            {(tempLocation.lat || tempLocation.lng) && (
              <div className={`text-sm p-2 rounded ${
                validateCoordinates(tempLocation.lat, tempLocation.lng)
                  ? 'text-green-300 bg-green-500/10'
                  : 'text-red-300 bg-red-500/10'
              }`}>
                {validateCoordinates(tempLocation.lat, tempLocation.lng)
                  ? '✓ Valid coordinates'
                  : '⚠ Invalid coordinates (Lat: -90 to 90, Lng: -180 to 180)'
                }
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <FaCrosshairs /> Get Current Location
              </button>
              
              <button
                type="button"
                onClick={handleLocationSubmit}
                className={`flex-1 text-white px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeSelection === 'start'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Save Location
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setActiveSelection(null);
                  setTempLocation({ address: '', lat: '', lng: '' });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper Links */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <h5 className="text-gray-300 font-medium mb-2">Need help finding coordinates?</h5>
        <div className="flex flex-wrap gap-2 text-sm">
          <a
            href="https://www.google.com/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
          >
            <FaExternalLinkAlt size={12} /> Google Maps
          </a>
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
          >
            <FaExternalLinkAlt size={12} /> OpenStreetMap
          </a>
          <a
            href="https://www.latlong.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
          >
            <FaExternalLinkAlt size={12} /> LatLong.net
          </a>
        </div>
        <div className="text-gray-400 text-xs mt-2 space-y-1">
          <p><strong>📋 Quick Copy from Google Maps:</strong></p>
          <p>1. Right-click on any location in Google Maps</p>
          <p>2. Click on the coordinates (e.g., "9.524214, 76.818494")</p>
          <p>3. Paste directly into the "📍 Paste Coordinates" field above</p>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;