import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { showSuccess, showError, showWarning, showConfirm } from './utils/sweetAlert';
import { validateName, validatePhone, formatName, formatPhoneNumber } from './utils/validation';
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
  FaPlay,
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaClock,
  FaUserPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaArrowLeft,
  FaBars,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';

function UserEvents() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [userParticipations, setUserParticipations] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationFormData, setRegistrationFormData] = useState({
    emergencyContact: { name: '', phone: '', relationship: '' },
    medicalConditions: '',
    experienceLevel: 'beginner',
    additionalNotes: '',
    vehicles: [],
    races: []
  });
  const [racesByEvent, setRacesByEvent] = useState({});
  const [racesLoading, setRacesLoading] = useState(false);
  const [userVehicles, setUserVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [raceVehicleSelections, setRaceVehicleSelections] = useState({}); // { [raceId]: string[] }
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  const [touchedFields, setTouchedFields] = useState({
    emergencyContact: {
      name: false,
      phone: false,
      relationship: false
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchProfileData();
      fetchEvents();
      fetchUserParticipations();
      fetchUserRegistrations();
    } else {
      navigate('/login');
    }
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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/events');

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserParticipations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/events/user/participations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserParticipations(data.participations || []);
      }
    } catch (error) {
      console.error('Error fetching user participations:', error);
      // Fallback to localStorage for now
      const participations = JSON.parse(localStorage.getItem('userParticipations') || '[]');
      setUserParticipations(participations);
    }
  };

  const fetchUserRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/events/user/registrations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserRegistrations(data.registrations || []);
      }
    } catch (error) {
      console.error('Error fetching user registrations:', error);
    }
  };

  const fetchUserVehicles = async () => {
    try {
      setVehiclesLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/vehicles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUserVehicles(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error fetching user vehicles:', e);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const handleRegisterEvent = async (eventId) => {
    const event = events.find(e => e._id === eventId);
    if (!event) return;

    // Check if user already has a registration for this event
    const existingRegistration = userRegistrations.find(reg => reg.event._id === eventId);
    if (existingRegistration) {
      const statusMessages = {
        pending: 'Your registration is pending admin approval.',
        approved: 'You are already approved for this event.',
        rejected: 'Your registration was rejected. You can apply again.'
      };
      if (existingRegistration.status !== 'rejected') {
        showWarning('Already Registered', statusMessages[existingRegistration.status]);
        return;
      }
    }

    // Check if event is full (for approved participants)
    if (event.participants >= event.maxParticipants) {
      showWarning('Event Full', 'This event has reached maximum capacity.');
      return;
    }

    // Fetch races for this event (if not already cached)
    let fetchedRaces = racesByEvent[eventId] || null;
    try {
      setRacesLoading(true);
      if (!fetchedRaces) {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/races/event/${eventId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          fetchedRaces = data.races || [];
          setRacesByEvent(prev => ({ ...prev, [eventId]: fetchedRaces }));
        }
      }
    } catch (e) {
      console.error('Failed to load races for event', e);
    } finally {
      setRacesLoading(false);
    }

    // Enforce: at least one race must exist to proceed
    const availableRaces = fetchedRaces || racesByEvent[eventId] || [];
    if (!availableRaces.length) {
      showWarning('No Races Available', 'Registration requires selecting at least one race, but none are available for this event.');
      return;
    }

    setSelectedEvent(event);
    // Reset races selection each time user opens form
    setRegistrationFormData(prev => ({ ...prev, races: [] }));
    setRaceVehicleSelections({});
    if (!userVehicles.length) {
      await fetchUserVehicles();
    }
    setShowRegistrationForm(true);
  };

  const handleRegistrationFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent) return;

    // Validate all fields before submission
    if (!validateAllFields()) {
      showWarning('Validation Error', 'Please fix all validation errors before submitting');
      return;
    }

    // Frontend validation: require at least one race selected
    if (!Array.isArray(registrationFormData.races) || registrationFormData.races.length === 0) {
      showWarning('Race Selection Required', 'Please select at least one race to register.');
      return;
    }

    // Require at least one vehicle from profile
    if (!Array.isArray(userVehicles) || userVehicles.length === 0) {
      showWarning('No Vehicles Found', 'Add a vehicle to your profile before registering.');
      return;
    }

    // For each selected race, require at least one vehicle selected
    for (const raceId of registrationFormData.races) {
      const vehiclesForRace = raceVehicleSelections[raceId] || [];
      if (!vehiclesForRace.length) {
        showWarning('Vehicle Required', 'Please select at least one vehicle for every selected race.');
        return;
      }
    }

    // Prepare union of vehicles across races to send to backend
    const unionVehicles = Array.from(new Set(Object.values(raceVehicleSelections).flat()))
      .filter(Boolean);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/events/${selectedEvent._id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...registrationFormData,
          vehicles: unionVehicles,
          // send detailed mapping too (backend may ignore)
          vehiclesByRace: raceVehicleSelections
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Refresh registrations
        await fetchUserRegistrations();
        
        // Reset form
        setRegistrationFormData({
          emergencyContact: { name: '', phone: '', relationship: '' },
          medicalConditions: '',
          experienceLevel: 'beginner',
          additionalNotes: '',
          vehicles: [],
          races: []
        });
        setRaceVehicleSelections({});
        setShowRegistrationForm(false);
        setSelectedEvent(null);

        showSuccess('Registration Submitted!', 'Your registration has been submitted and is awaiting admin approval.');
      } else {
        const errorData = await response.json();
        showError('Error!', errorData.error || 'Failed to submit registration. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      showError('Error!', 'Failed to submit registration. Please try again.');
    }
  };

  const handleCancelRegistration = async (eventId) => {
    const event = events.find(e => e._id === eventId);
    
    if (!event) return;

    const result = await showConfirm(
      'Cancel Registration',
      `Are you sure you want to cancel your registration for "${event.name}"?`,
      'Yes, cancel',
      'Keep registration'
    );

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/events/${eventId}/cancel-registration`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Refresh data
          await fetchUserRegistrations();
          await fetchUserParticipations();
          await fetchEvents();

          showSuccess('Success!', 'Your registration has been cancelled.');
        } else {
          const errorData = await response.json();
          showError('Error!', errorData.error || 'Failed to cancel registration. Please try again.');
        }
      } catch (error) {
        console.error('Error cancelling registration:', error);
        showError('Error!', 'Failed to cancel registration. Please try again.');
      }
    }
  };

  const handleViewDetails = async (event) => {
    setSelectedEvent(event);
    // Preload races for the event so user can see them in details modal
    try {
      setRacesLoading(true);
      if (!racesByEvent[event._id]) {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/races/event/${event._id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setRacesByEvent(prev => ({ ...prev, [event._id]: data.races || [] }));
        }
      }
    } catch (e) {
      console.error('Failed to load races for event', e);
    } finally {
      setRacesLoading(false);
    }
    setShowEventDetails(true);
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

  const getRegistrationStatus = (eventId) => {
    const registration = userRegistrations.find(reg => reg.event._id === eventId);
    return registration ? registration.status : null;
  };

  const getRegistrationStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-600 text-white',
      approved: 'bg-green-600 text-white',
      rejected: 'bg-red-600 text-white'
    };
    return badges[status] || 'bg-gray-600 text-white';
  };

  const getRegistrationStatusIcon = (status) => {
    const icons = {
      pending: <FaClock className="inline mr-1" />,
      approved: <FaCheckCircle className="inline mr-1" />,
      rejected: <FaTimesCircle className="inline mr-1" />
    };
    return icons[status] || null;
  };

  const handleRegistrationFormChange = (field, value) => {
    let processedValue = value;

    // Format values based on field type
    if (field === 'emergencyContact.phone') {
      processedValue = formatPhoneNumber(value);
    } else if (field === 'emergencyContact.name') {
      processedValue = formatName(value);
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setRegistrationFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: processedValue
        }
      }));

      // Mark field as touched
      setTouchedFields(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: true
        }
      }));

      // Validate field
      validateField(field, processedValue);
    } else {
      setRegistrationFormData(prev => ({
        ...prev,
        [field]: processedValue
      }));
    }
  };

  const validateField = (fieldName, value) => {
    let validation = { isValid: true, message: '' };

    switch (fieldName) {
      case 'emergencyContact.name':
        validation = validateName(value, 'Emergency Contact Name');
        break;
      case 'emergencyContact.phone':
        validation = validatePhone(value);
        break;
      case 'emergencyContact.relationship':
        if (!value || value.trim() === '') {
          validation = { isValid: false, message: 'Relationship is required' };
        } else if (value.trim().length < 2) {
          validation = { isValid: false, message: 'Relationship must be at least 2 characters' };
        } else if (value.trim().length > 50) {
          validation = { isValid: false, message: 'Relationship is too long (maximum 50 characters)' };
        }
        break;
      default:
        break;
    }

    const [parent, child] = fieldName.split('.');
    setValidationErrors(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: validation.isValid ? '' : validation.message
      }
    }));

    return validation.isValid;
  };

  const validateAllFields = () => {
    const fields = [
      'emergencyContact.name',
      'emergencyContact.phone', 
      'emergencyContact.relationship'
    ];
    let allValid = true;

    fields.forEach(field => {
      const [parent, child] = field.split('.');
      const value = registrationFormData[parent][child];
      const isValid = validateField(field, value);
      if (!isValid) allValid = false;
    });

    return allValid;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || event.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: 'bg-green-600 text-white',
      completed: 'bg-gray-600 text-white',
      cancelled: 'bg-red-600 text-white'
    };
    return badges[status] || 'bg-gray-600 text-white';
  };

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      Easy: 'bg-blue-600 text-white',
      Medium: 'bg-yellow-600 text-white',
      Hard: 'bg-red-600 text-white'
    };
    return badges[difficulty] || 'bg-gray-600 text-white';
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '🟢';
      case 'Medium': return '🟡';
      case 'Hard': return '🔴';
      default: return '⚪';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="loadingMountain1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(120, 113, 108, 0.08)" />
                <stop offset="50%" stopColor="rgba(168, 162, 158, 0.06)" />
                <stop offset="100%" stopColor="rgba(87, 83, 81, 0.04)" />
              </linearGradient>
              <linearGradient id="loadingMountain2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(249, 115, 22, 0.04)" />
                <stop offset="50%" stopColor="rgba(251, 191, 36, 0.03)" />
                <stop offset="100%" stopColor="rgba(245, 158, 11, 0.02)" />
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
          </svg>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500/20 border-t-orange-500 shadow-lg shadow-orange-500/20"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-orange-400/40"></div>
          </div>
          <div className="space-y-2">
            <p className="text-orange-400 font-semibold text-lg">Loading Adventure Portal...</p>
            <p className="text-stone-400">Preparing your offroad experience</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-stone-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-30"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bgMountain1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(120, 113, 108, 0.08)" />
              <stop offset="50%" stopColor="rgba(168, 162, 158, 0.06)" />
              <stop offset="100%" stopColor="rgba(87, 83, 81, 0.04)" />
            </linearGradient>
            <linearGradient id="bgMountain2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(249, 115, 22, 0.04)" />
              <stop offset="50%" stopColor="rgba(251, 191, 36, 0.03)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0.02)" />
            </linearGradient>
          </defs>
          
          <path
            d="M0,500 L200,300 L400,450 L600,250 L800,400 L1000,200 L1200,350 L1200,800 L0,800 Z"
            fill="url(#bgMountain1)"
            className="animate-[mountainFloat1_30s_ease-in-out_infinite] opacity-60"
          />
          
          <path
            d="M0,600 L150,400 L350,550 L550,350 L750,500 L950,300 L1200,450 L1200,800 L0,800 Z"
            fill="url(#bgMountain2)"
            className="animate-[mountainFloat2_25s_ease-in-out_infinite_reverse] opacity-40"
          />
        </svg>
      </div>

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
              <Link to="/home" className="text-stone-300 hover:text-orange-400 transition-all duration-300 flex items-center space-x-2 font-semibold tracking-wide">
                <FaCompass className="text-lg" />
                <span>Home</span>
              </Link>
              <Link to="/events" className="text-orange-400 transition-all duration-300 flex items-center space-x-2 font-semibold tracking-wide">
                <FaCalendarAlt className="text-lg" />
                <span>Events</span>
              </Link>
              <Link to="/routes" className="text-stone-300 hover:text-orange-400 transition-all duration-300 flex items-center space-x-2 font-semibold tracking-wide">
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
                  to="/home" 
                  className="flex items-center space-x-3 text-stone-300 hover:text-orange-400 transition-all duration-300 py-3 px-4 rounded-xl hover:bg-stone-800/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaCompass className="text-lg" />
                  <span className="font-semibold">Home</span>
                </Link>
                <Link 
                  to="/events" 
                  className="flex items-center space-x-3 text-orange-400 transition-all duration-300 py-3 px-4 rounded-xl bg-orange-500/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaCalendarAlt className="text-lg" />
                  <span className="font-semibold">Events</span>
                </Link>
                <Link 
                  to="/routes" 
                  className="flex items-center space-x-3 text-stone-300 hover:text-orange-400 transition-all duration-300 py-3 px-4 rounded-xl hover:bg-stone-800/50"
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

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-br from-stone-900/90 via-amber-950/80 to-stone-800/90 backdrop-blur-xl rounded-3xl p-8 text-white border border-orange-500/20 shadow-2xl shadow-orange-500/10 overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-amber-600/15 to-transparent rounded-full blur-2xl animate-pulse delay-1000"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <FaCalendarAlt className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                    Discover Amazing Events
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-300"></div>
                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse delay-700"></div>
                  </div>
                </div>
              </div>
              
              <p className="text-stone-200 text-lg mb-6 leading-relaxed">
                Join thrilling offroad adventures and connect with fellow explorers in the most epic terrain challenges!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <FaCalendarAlt className="text-white" />
                    </div>
                    <div>
                      <p className="text-orange-400 font-semibold">Available Events</p>
                      <p className="text-2xl font-bold text-white">{events.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-500 rounded-lg flex items-center justify-center">
                      <FaUsers className="text-white" />
                    </div>
                    <div>
                      <p className="text-orange-400 font-semibold">Your Events</p>
                      <p className="text-2xl font-bold text-white">{userParticipations.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 text-6xl opacity-20 animate-bounce">🏔️</div>
            <div className="absolute bottom-4 right-16 text-4xl opacity-20 animate-pulse">🚗</div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-gradient-to-r from-stone-900/90 via-amber-950/80 to-stone-900/90 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 shadow-xl shadow-orange-500/5 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative group">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 group-focus-within:text-orange-300 transition-colors" />
              <input
                type="text"
                placeholder="Search events by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-black/40 border border-orange-500/30 rounded-xl text-white placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 backdrop-blur-sm"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-amber-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <FaFilter className="text-white text-sm" />
                </div>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="bg-black/40 border border-orange-500/30 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 backdrop-blur-sm min-w-[160px]"
                >
                  <option value="all">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <FaClock className="text-white text-sm" />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-black/40 border border-orange-500/30 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 backdrop-blur-sm min-w-[140px]"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="relative mx-auto mb-6 w-16 h-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500/20 border-t-orange-500 shadow-lg shadow-orange-500/20"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-orange-400/40"></div>
            </div>
            <div className="space-y-2">
              <p className="text-orange-400 font-semibold text-lg">Loading Epic Adventures...</p>
              <p className="text-stone-400">Discovering the best offroad events for you</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-900/30 via-red-800/20 to-red-900/30 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 mb-8 shadow-xl shadow-red-500/10">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30">
                <FaTimesCircle className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Oops! Something went wrong</h3>
              <p className="text-red-300 mb-6">{error}</p>
              <button
                onClick={fetchEvents}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const registrationStatus = getRegistrationStatus(event._id);
              const isApproved = registrationStatus === 'approved';
              const isPending = registrationStatus === 'pending';
              const isRejected = registrationStatus === 'rejected';
              const hasRegistration = registrationStatus !== null;
              const isFull = event.participants >= event.maxParticipants;
              const isUpcoming = event.status === 'upcoming';
              
              return (
                <div key={event._id} className="group relative bg-gradient-to-br from-stone-900/90 via-amber-950/80 to-stone-800/90 backdrop-blur-xl rounded-2xl border border-orange-500/20 hover:border-orange-400/40 transition-all duration-500 overflow-hidden shadow-xl shadow-orange-500/5 hover:shadow-orange-500/10 hover:scale-[1.02]">
                  {/* Animated Background */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full blur-xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-600/10 to-transparent rounded-full blur-xl"></div>
                  </div>
                  
                  <div className="relative p-6">
                    {/* Event Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1 pr-4">
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-stone-200 line-clamp-2 mb-2">{event.name}</h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="text-orange-400 text-sm font-medium">Adventure Awaits</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getStatusBadge(event.status)} shadow-lg`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getDifficultyBadge(event.difficulty)} shadow-lg`}>
                          {getDifficultyIcon(event.difficulty)} {event.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center text-stone-200 group/item">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-orange-500/20">
                          <FaCalendarAlt className="text-white text-xs" />
                        </div>
                        <span className="text-sm font-medium">{event.date} at {event.time}</span>
                      </div>
                      <div className="flex items-center text-stone-200 group/item">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-orange-500 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-orange-500/20">
                          <FaMapMarkerAlt className="text-white text-xs" />
                        </div>
                        <span className="text-sm font-medium line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center text-stone-200 group/item">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-orange-500/20">
                          <FaUsers className="text-white text-xs" />
                        </div>
                        <span className="text-sm font-medium">{event.participants}/{event.maxParticipants} participants</span>
                      </div>
                      {event.duration && (
                        <div className="flex items-center text-stone-200 group/item">
                          <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-orange-500 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-orange-500/20">
                            <FaClock className="text-white text-xs" />
                          </div>
                          <span className="text-sm font-medium">{event.duration}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {event.description && (
                      <div className="mb-6">
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/10">
                          <p className="text-stone-300 text-sm leading-relaxed line-clamp-3">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-orange-400 mb-2 font-medium">
                        <span>Event Capacity</span>
                        <span>{Math.round((event.participants / event.maxParticipants) * 100)}% Full</span>
                      </div>
                      <div className="w-full bg-black/30 rounded-full h-3 border border-orange-500/20 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full transition-all duration-700 ${
                            isFull ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-orange-500 to-amber-600'
                          } shadow-lg ${isFull ? 'shadow-red-500/30' : 'shadow-orange-500/30'}`}
                          style={{ width: `${Math.min((event.participants / event.maxParticipants) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Registration Status Badge */}
                    {hasRegistration && (
                      <div className="mb-6">
                        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-orange-500/20">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getRegistrationStatusBadge(registrationStatus)} shadow-lg backdrop-blur-sm`}>
                            {getRegistrationStatusIcon(registrationStatus)}
                            {registrationStatus === 'pending' && 'Pending Approval'}
                            {registrationStatus === 'approved' && 'Approved'}
                            {registrationStatus === 'rejected' && 'Rejected'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleViewDetails(event)}
                        className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 text-sm font-medium transition-all duration-300 group/btn"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500/20 to-amber-600/20 rounded-lg flex items-center justify-center group-hover/btn:from-orange-500/30 group-hover/btn:to-amber-600/30 transition-all">
                          <FaInfoCircle className="text-orange-400" />
                        </div>
                        <span>Details</span>
                      </button>
                      
                      <div className="flex space-x-3">
                        {hasRegistration && !isRejected ? (
                          <button
                            onClick={() => handleCancelRegistration(event._id)}
                            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-105"
                          >
                            <FaTimesCircle />
                            <span>Cancel</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegisterEvent(event._id)}
                            disabled={!isUpcoming || isFull}
                            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg ${
                              !isUpcoming || isFull
                                ? 'bg-gradient-to-r from-stone-700 to-stone-800 text-stone-400 cursor-not-allowed shadow-stone-500/10'
                                : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-105'
                            }`}
                          >
                            <FaUserPlus />
                            <span>{isFull ? 'Full' : 'Register'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Joined Indicator */}
                    {isApproved && (
                      <div className="mt-4 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-900/40 via-emerald-900/30 to-green-900/40 backdrop-blur-sm border border-green-500/30 rounded-xl py-3 shadow-lg shadow-green-500/10">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <FaCheckCircle className="text-white text-sm" />
                        </div>
                        <span className="text-green-400 font-medium">You're registered for this adventure!</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Events Found */}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="relative mx-auto mb-8 w-24 h-24">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-500/20 to-amber-600/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-orange-500/20">
                <FaCalendarAlt className="text-orange-400 text-4xl" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-600/10 rounded-full animate-ping"></div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">No Adventures Found</h3>
              <p className="text-stone-400 max-w-md mx-auto leading-relaxed">
                No events match your current search criteria. Try adjusting your filters or check back later for new epic adventures!
              </p>
              <div className="flex justify-center space-x-2 mt-6">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-stone-900/95 via-amber-950/90 to-stone-800/95 backdrop-blur-xl rounded-3xl border border-orange-500/30 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-orange-500/10">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                      <FaCalendarAlt className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">{selectedEvent.name}</h2>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-orange-400 text-sm font-medium">Event Details</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${getStatusBadge(selectedEvent.status)} shadow-lg`}>
                      {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                    </span>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${getDifficultyBadge(selectedEvent.difficulty)} shadow-lg`}>
                      {getDifficultyIcon(selectedEvent.difficulty)} {selectedEvent.difficulty}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="text-stone-400 hover:text-orange-400 text-2xl transition-all duration-300 hover:scale-110 ml-4"
                >
                  <FaTimesCircle />
                </button>
              </div>

              {/* Event Details */}
              <div className="space-y-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
                    <div className="flex items-center space-x-3 text-stone-200">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <FaCalendarAlt className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-orange-400 font-medium">Date & Time</p>
                        <p className="font-bold text-white">{selectedEvent.date} at {selectedEvent.time}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
                    <div className="flex items-center space-x-3 text-stone-200">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <FaMapMarkerAlt className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-orange-400 font-medium">Location</p>
                        <p className="font-bold text-white">{selectedEvent.location}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
                    <div className="flex items-center space-x-3 text-stone-200">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <FaUsers className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-orange-400 font-medium">Participants</p>
                        <p className="font-bold text-white">{selectedEvent.participants}/{selectedEvent.maxParticipants}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedEvent.duration && (
                    <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
                      <div className="flex items-center space-x-3 text-stone-200">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                          <FaClock className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-orange-400 font-medium">Duration</p>
                          <p className="font-bold text-white">{selectedEvent.duration}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedEvent.description && (
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500 mb-4">Adventure Description</h3>
                    <p className="text-stone-200 leading-relaxed text-lg">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20">
                  <div className="flex justify-between text-orange-400 mb-4 font-medium">
                    <span className="text-lg">Event Capacity</span>
                    <span className="text-xl font-bold">{Math.round((selectedEvent.participants / selectedEvent.maxParticipants) * 100)}% Full</span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-4 border border-orange-500/20 overflow-hidden">
                    <div 
                      className={`h-4 rounded-full transition-all duration-700 ${
                        selectedEvent.participants >= selectedEvent.maxParticipants 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/30' 
                          : 'bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30'
                      }`}
                      style={{ width: `${Math.min((selectedEvent.participants / selectedEvent.maxParticipants) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Races for this Event */}
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <FaTrophy className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">Races</h3>
                </div>
                {(() => {
                  const races = racesByEvent[selectedEvent._id] || [];
                  if (racesLoading) {
                    return <p className="text-orange-400">Loading races...</p>;
                  }
                  if (!races.length) {
                    return <p className="text-stone-300">No races defined for this event yet.</p>;
                  }
                  return (
                    <div className="space-y-3">
                      {races.map(r => (
                        <div key={r._id} className="flex justify-between items-center bg-black/30 border border-orange-500/20 rounded-lg p-4">
                          <div>
                            <p className="text-white font-semibold">{r.name}</p>
                            <p className="text-stone-300 text-sm">
                              Type: <span className="text-orange-300">{r.type.replace('_',' ')}</span> • Date: {r.date} • Start: {r.startTime}
                            </p>
                            {r.route && (
                              <p className="text-stone-400 text-xs">Route: {r.route.name} • {r.route.distance} km • {r.route.difficulty}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-orange-500/20">
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="flex items-center space-x-3 text-stone-400 hover:text-orange-400 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-stone-700 to-stone-800 group-hover:from-orange-500/20 group-hover:to-amber-600/20 rounded-lg flex items-center justify-center transition-all">
                    <FaArrowLeft className="group-hover:text-orange-400" />
                  </div>
                  <span className="font-medium">Back to Events</span>
                </button>
                
                <div className="flex space-x-4">
                  {(() => {
                    const modalRegistrationStatus = getRegistrationStatus(selectedEvent._id);
                    const modalHasRegistration = modalRegistrationStatus !== null;
                    const modalIsRejected = modalRegistrationStatus === 'rejected';
                    
                    if (modalHasRegistration && !modalIsRejected) {
                      return (
                        <button
                          onClick={() => {
                            handleCancelRegistration(selectedEvent._id);
                            setShowEventDetails(false);
                          }}
                          className="flex items-center space-x-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-105"
                        >
                          <FaTimesCircle />
                          <span>Cancel Registration</span>
                        </button>
                      );
                    } else {
                      return (
                        <button
                          onClick={() => {
                            setShowEventDetails(false);
                            handleRegisterEvent(selectedEvent._id);
                          }}
                          disabled={selectedEvent.status !== 'upcoming' || selectedEvent.participants >= selectedEvent.maxParticipants}
                          className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg ${
                            selectedEvent.status !== 'upcoming' || selectedEvent.participants >= selectedEvent.maxParticipants
                              ? 'bg-gradient-to-r from-stone-700 to-stone-800 text-stone-400 cursor-not-allowed shadow-stone-500/10'
                              : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-105'
                          }`}
                        >
                          <FaUserPlus />
                          <span>
                            {selectedEvent.participants >= selectedEvent.maxParticipants 
                              ? 'Event Full' 
                              : selectedEvent.status !== 'upcoming' 
                                ? 'Event Closed' 
                                : 'Register for Adventure'
                            }
                          </span>
                        </button>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form Modal */}
      {showRegistrationForm && selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-stone-900/95 via-amber-950/90 to-stone-800/95 backdrop-blur-xl rounded-3xl border border-orange-500/30 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-orange-500/10">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                      <FaUserPlus className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">Register for Adventure</h2>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-orange-400 text-sm font-medium">Join the Experience</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
                    <p className="text-stone-200 font-medium text-lg">{selectedEvent.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowRegistrationForm(false);
                    setSelectedEvent(null);
                  }}
                  className="text-stone-400 hover:text-orange-400 text-2xl transition-all duration-300 hover:scale-110 ml-4"
                >
                  <FaTimesCircle />
                </button>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleRegistrationFormSubmit} className="space-y-8">
                {/* Emergency Contact */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <FaUsers className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">Emergency Contact</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-orange-400 mb-3">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={registrationFormData.emergencyContact.name}
                        onChange={(e) => handleRegistrationFormChange('emergencyContact.name', e.target.value)}
                        className={`w-full px-4 py-3 bg-black/30 border rounded-xl text-white placeholder-stone-400 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                          validationErrors.emergencyContact.name && touchedFields.emergencyContact.name
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-orange-500/30 focus:border-orange-400 focus:ring-orange-500/20'
                        }`}
                        required
                      />
                      {validationErrors.emergencyContact.name && touchedFields.emergencyContact.name && (
                        <div className="mt-2 flex items-center text-red-400 text-sm">
                          <FaExclamationTriangle className="mr-2" />
                          {validationErrors.emergencyContact.name}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-400 mb-3">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={registrationFormData.emergencyContact.phone}
                        onChange={(e) => handleRegistrationFormChange('emergencyContact.phone', e.target.value)}
                        className={`w-full px-4 py-3 bg-black/30 border rounded-xl text-white placeholder-stone-400 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                          validationErrors.emergencyContact.phone && touchedFields.emergencyContact.phone
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-orange-500/30 focus:border-orange-400 focus:ring-orange-500/20'
                        }`}
                        required
                      />
                      {validationErrors.emergencyContact.phone && touchedFields.emergencyContact.phone && (
                        <div className="mt-2 flex items-center text-red-400 text-sm">
                          <FaExclamationTriangle className="mr-2" />
                          {validationErrors.emergencyContact.phone}
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-orange-400 mb-3">
                        Relationship *
                      </label>
                      <input
                        type="text"
                        value={registrationFormData.emergencyContact.relationship}
                        onChange={(e) => handleRegistrationFormChange('emergencyContact.relationship', e.target.value)}
                        placeholder="e.g., Spouse, Parent, Friend"
                        className={`w-full px-4 py-3 bg-black/30 border rounded-xl text-white placeholder-stone-400 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                          validationErrors.emergencyContact.relationship && touchedFields.emergencyContact.relationship
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-orange-500/30 focus:border-orange-400 focus:ring-orange-500/20'
                        }`}
                        required
                      />
                      {validationErrors.emergencyContact.relationship && touchedFields.emergencyContact.relationship && (
                        <div className="mt-2 flex items-center text-red-400 text-sm">
                          <FaExclamationTriangle className="mr-2" />
                          {validationErrors.emergencyContact.relationship}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Experience Level */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <FaStar className="text-white" />
                    </div>
                    <label className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">
                      Experience Level *
                    </label>
                  </div>
                  <select
                    value={registrationFormData.experienceLevel}
                    onChange={(e) => handleRegistrationFormChange('experienceLevel', e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-orange-500/30 rounded-xl text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 backdrop-blur-sm"
                    required
                  >
                    <option value="beginner" className="bg-stone-900 text-stone-100  py-2">Beginner - New to offroad adventures</option>
                    <option value="intermediate" className="bg-stone-900 text-stone-100 py-2">Intermediate - Some experience</option>
                    <option value="advanced" className="bg-stone-900 text-stone-100 py-2">Advanced - Experienced adventurer</option>
                  </select>
                </div>

                {/* Race Selection (optional) */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <FaTrophy className="text-white" />
                      </div>
                      <label className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">
                        Select Races (required)
                      </label>
                    </div>
                    {racesLoading && <span className="text-sm text-orange-400">Loading races...</span>}
                  </div>

                  {(() => {
                    const races = racesByEvent[selectedEvent._id] || [];
                    if (!races.length) {
                      return (
                        <p className="text-stone-300">No races available for this event. Registration requires selecting at least one race.</p>
                      );
                    }
                    return (
                      <div className="space-y-3">
                        {races.map(r => {
                          const checked = registrationFormData.races.includes(r._id);
                          return (
                            <label key={r._id} className="flex items-center space-x-3 bg-black/30 border border-orange-500/20 rounded-lg p-4">
                              <input
                                type="checkbox"
                                className="w-5 h-5 accent-orange-500"
                                checked={checked}
                                onChange={(e) => {
                                  setRegistrationFormData(prev => {
                                    const current = new Set(prev.races);
                                    if (e.target.checked) {
                                      current.add(r._id);
                                    } else {
                                      current.delete(r._id);
                                    }
                                    return { ...prev, races: Array.from(current) };
                                  });
                                  if (!e.target.checked) {
                                    setRaceVehicleSelections(prev => {
                                      const next = { ...prev };
                                      delete next[r._id];
                                      return next;
                                    });
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <p className="text-white font-semibold">{r.name}</p>
                                <p className="text-stone-300 text-sm">{r.type.replace('_',' ')} • {r.date} • {r.startTime}</p>
                                {checked && (
                                  <div className="mt-3">
                                    <label className="block text-sm font-medium text-orange-400 mb-2">Select at least one vehicle for this race</label>
                                    {vehiclesLoading ? (
                                      <p className="text-orange-400 text-sm">Loading your vehicles...</p>
                                    ) : (
                                      <div className="space-y-2">
                                        {userVehicles.length === 0 ? (
                                          <p className="text-red-400 text-sm">You have no vehicles. Add a vehicle in your profile first.</p>
                                        ) : (
                                          userVehicles.map(v => {
                                            const selected = (raceVehicleSelections[r._id] || []).includes(v._id);
                                            return (
                                              <label key={v._id} className="flex items-center space-x-3 bg-black/20 border border-orange-500/10 rounded-lg p-3">
                                                <input
                                                  type="checkbox"
                                                  className="w-4 h-4 accent-orange-500"
                                                  checked={selected}
                                                  onChange={(e) => {
                                                    setRaceVehicleSelections(prev => {
                                                      const current = new Set(prev[r._id] || []);
                                                      if (e.target.checked) current.add(v._id); else current.delete(v._id);
                                                      return { ...prev, [r._id]: Array.from(current) };
                                                    });
                                                  }}
                                                />
                                                <span className="text-stone-200 text-sm">
                                                  {v.make} {v.model} {v.year ? `(${v.year})` : ''} • {v.registrationNumber}
                                                </span>
                                              </label>
                                            );
                                          })
                                        )}
                                      </div>
                                    )}
                                    {(!raceVehicleSelections[r._id] || raceVehicleSelections[r._id].length === 0) && (
                                      <p className="text-red-400 text-xs mt-2">Select at least one vehicle for this race.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </label>
                          );
                        })}
                        {registrationFormData.races.length === 0 && (
                          <p className="text-red-400 text-sm">Please select at least one race to continue.</p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Medical Conditions */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <FaInfoCircle className="text-white" />
                    </div>
                    <label className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">
                      Medical Conditions or Allergies
                    </label>
                  </div>
                  <textarea
                    value={registrationFormData.medicalConditions}
                    onChange={(e) => handleRegistrationFormChange('medicalConditions', e.target.value)}
                    placeholder="Please list any medical conditions, allergies, or medications that organizers should be aware of..."
                    rows="4"
                    className="w-full px-4 py-3 bg-black/30 border border-orange-500/30 rounded-xl text-white placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 backdrop-blur-sm resize-none"
                  />
                </div>

                {/* Additional Notes */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <FaCompass className="text-white" />
                    </div>
                    <label className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">
                      Additional Notes
                    </label>
                  </div>
                  <textarea
                    value={registrationFormData.additionalNotes}
                    onChange={(e) => handleRegistrationFormChange('additionalNotes', e.target.value)}
                    placeholder="Any additional information you'd like to share with the organizers..."
                    rows="4"
                    className="w-full px-4 py-3 bg-black/30 border border-orange-500/30 rounded-xl text-white placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 backdrop-blur-sm resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-between items-center pt-6 border-t border-orange-500/20">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegistrationForm(false);
                      setSelectedEvent(null);
                    }}
                    className="flex items-center space-x-3 text-stone-400 hover:text-orange-400 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-stone-700 to-stone-800 group-hover:from-orange-500/20 group-hover:to-amber-600/20 rounded-lg flex items-center justify-center transition-all">
                      <FaArrowLeft className="group-hover:text-orange-400" />
                    </div>
                    <span className="font-medium">Cancel</span>
                  </button>
                  
                  <button
                    type="submit"
                    disabled={Object.values(validationErrors.emergencyContact).some(error => error !== '')}
                    className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg ${
                      !Object.values(validationErrors.emergencyContact).some(error => error !== '')
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-105'
                        : 'bg-gradient-to-r from-stone-700 to-stone-800 text-stone-400 cursor-not-allowed shadow-stone-500/10'
                    }`}
                  >
                    <FaUserPlus />
                    <span>Submit Registration</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserEvents;