import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { showSuccess, showError, showWarning, showConfirm } from './utils/sweetAlert';
import { validateName, validatePhone, formatName, formatPhoneNumber } from './utils/validation';
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
  FaExclamationTriangle,
  FaShoppingCart,
  FaArrowRight,
  FaBolt,
  FaShieldAlt
} from 'react-icons/fa';
import NotificationBell from './components/NotificationBell';

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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
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
      const response = await fetch(`${API_BASE_URL}/api/events/user/participations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserParticipations(data.participations || []);
      }
    } catch (error) {
      console.error('Error fetching user participations:', error);
    }
  };

  const fetchUserRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/events/user/registrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
      const res = await fetch(`${API_BASE_URL}/api/vehicles`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
    if (event.participants >= event.maxParticipants) {
      showWarning('Event Full', 'This event has reached maximum capacity.');
      return;
    }
    let fetchedRaces = racesByEvent[eventId] || null;
    try {
      setRacesLoading(true);
      if (!fetchedRaces) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/races/event/${eventId}`, {
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
    const availableRaces = fetchedRaces || racesByEvent[eventId] || [];
    if (!availableRaces.length) {
      showWarning('No Races Available', 'Registration requires selecting at least one race, but none are available for this event.');
      return;
    }
    setSelectedEvent(event);
    setRegistrationFormData(prev => ({ ...prev, races: [] }));
    setRaceVehicleSelections({});
    if (!userVehicles.length) await fetchUserVehicles();
    setShowRegistrationForm(true);
  };

  const handleRegistrationFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!validateAllFields()) {
      showWarning('Validation Error', 'Please fix all validation errors before submitting');
      return;
    }
    if (!Array.isArray(registrationFormData.races) || registrationFormData.races.length === 0) {
      showWarning('Race Selection Required', 'Please select at least one race to register.');
      return;
    }
    if (!Array.isArray(userVehicles) || userVehicles.length === 0) {
      showWarning('No Vehicles Found', 'Add a vehicle to your profile before registering.');
      return;
    }
    for (const raceId of registrationFormData.races) {
      const vehiclesForRace = raceVehicleSelections[raceId] || [];
      if (!vehiclesForRace.length) {
        showWarning('Vehicle Required', 'Please select at least one vehicle for every selected race.');
        return;
      }
    }
    const unionVehicles = Array.from(new Set(Object.values(raceVehicleSelections).flat())).filter(Boolean);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/events/${selectedEvent._id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...registrationFormData,
          vehicles: unionVehicles,
          vehiclesByRace: raceVehicleSelections
        })
      });
      if (response.ok) {
        await fetchUserRegistrations();
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
    const result = await showConfirm('Cancel Registration', `Are you sure you want to cancel your registration for "${event.name}"?`, 'Yes, cancel', 'Keep registration');
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/cancel-registration`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (response.ok) {
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
    try {
      setRacesLoading(true);
      if (!racesByEvent[event._id]) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/races/event/${event._id}`, {
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

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const getRegistrationStatus = (eventId) => {
    const registration = userRegistrations.find(reg => reg.event._id === eventId);
    return registration ? registration.status : null;
  };

  const handleRegistrationFormChange = (field, value) => {
    let processedValue = value;
    if (field === 'emergencyContact.phone') processedValue = formatPhoneNumber(value);
    else if (field === 'emergencyContact.name') processedValue = formatName(value);

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setRegistrationFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: processedValue } }));
      setTouchedFields(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: true } }));
      validateField(field, processedValue);
    } else {
      setRegistrationFormData(prev => ({ ...prev, [field]: processedValue }));
    }
  };

  const validateField = (fieldName, value) => {
    let validation = { isValid: true, message: '' };
    switch (fieldName) {
      case 'emergencyContact.name': validation = validateName(value, 'Emergency Contact Name'); break;
      case 'emergencyContact.phone': validation = validatePhone(value); break;
      case 'emergencyContact.relationship':
        if (!value || value.trim() === '') validation = { isValid: false, message: 'Relationship is required' };
        else if (value.trim().length < 2) validation = { isValid: false, message: 'Relationship must be at least 2 characters' };
        break;
      default: break;
    }
    const [parent, child] = fieldName.split('.');
    setValidationErrors(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: validation.isValid ? '' : validation.message } }));
    return validation.isValid;
  };

  const validateAllFields = () => {
    const fields = ['emergencyContact.name', 'emergencyContact.phone', 'emergencyContact.relationship'];
    let allValid = true;
    fields.forEach(field => {
      const [parent, child] = field.split('.');
      const isValid = validateField(field, registrationFormData[parent][child]);
      if (!isValid) allValid = false;
    });
    return allValid;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || event.difficulty === filterDifficulty;
    const regStatus = getRegistrationStatus(event._id);
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'joined' && regStatus === 'approved') ||
      (filterStatus === 'pending' && regStatus === 'pending') ||
      (filterStatus === 'available' && !regStatus);
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const uniqueDifficulties = ['all', ...new Set(events.map(e => e.difficulty).filter(Boolean))];

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
                { to: '/events', icon: FaCalendarAlt, label: 'Events', active: true },
                { to: '/routes', icon: FaRoute, label: 'Routes' },
                { to: '/achievements', icon: FaTrophy, label: 'Achievements' },
                { to: '/ecommerce', icon: FaShoppingCart, label: 'Shop' }
              ].map((item) => (
                <Link key={item.label} to={item.to} className={`relative px-3 py-2 text-sm font-bold tracking-widest uppercase transition-all duration-300 flex items-center space-x-2 group ${item.active ? 'text-orange-500' : 'text-stone-400 hover:text-white'}`}>
                  <item.icon className="text-lg" />
                  <span>{item.label}</span>
                  {item.active && <div className="absolute -bottom-1 left-3 right-3 h-0.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <NotificationBell />
              <div className="flex items-center p-1.5 bg-stone-800/50 rounded-2xl border border-stone-700/50 backdrop-blur-sm">
                <button onClick={handleProfileClick} className="flex items-center space-x-3 pr-4 pl-2 hover:opacity-80">
                  {profileData?.profilePhotoUrl ? <img src={profileData.profilePhotoUrl} alt="Profile" className="w-9 h-9 rounded-xl object-cover border border-orange-500/30" /> : <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center"><FaUser className="text-white text-sm" /></div>}
                  <span className="font-bold text-sm tracking-tight">{user.firstName}</span>
                </button>
                <div className="w-px h-6 bg-stone-700 mx-2"></div>
                <button onClick={handleLogout} className="p-2 text-stone-400 hover:text-red-400 transition-colors"><FaSignOutAlt /></button>
              </div>
            </div>

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
              { to: '/events', icon: FaCalendarAlt, label: 'Events', active: true },
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
      )}

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <FaBolt className="animate-pulse" />
              <span>Active Global Deployments</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-2">EXPEDITIONS</h1>
            <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Browse and join high-stakes offroad events across the globe.</p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="SEARCH MISSIONS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-stone-900 border border-stone-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold tracking-widest text-white focus:outline-none focus:border-orange-500 w-full sm:w-64 uppercase"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="bg-stone-900 border border-stone-800 rounded-2xl py-3 pl-11 pr-8 text-xs font-black tracking-widest text-orange-500 focus:outline-none focus:border-orange-500 appearance-none w-full uppercase"
              >
                <option value="all">ALL RANKS</option>
                {uniqueDifficulties.filter(d => d !== 'all').map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Categories Bar */}
        <section className="mb-10 flex overflow-x-auto scrollbar-hide p-1 gap-3">
          {[
            { id: 'all', label: 'ALL OPERATIONS' },
            { id: 'joined', label: 'JOINED MISSIONS' },
            { id: 'available', label: 'OPEN ENROLLMENT' },
            { id: 'pending', label: 'AWAITING AUTH' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${filterStatus === tab.id ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-stone-900 text-stone-500 border border-stone-800 hover:border-stone-700 hover:text-stone-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-stone-600 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Mission Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.length > 0 ? filteredEvents.map((event, index) => {
              const status = getRegistrationStatus(event._id);
              return (
                <div key={event._id} className="group relative bg-stone-900/40 border border-stone-800/80 rounded-[2.5rem] overflow-hidden flex flex-col hover:bg-stone-900/60 hover:border-orange-500/40 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${index * 50}ms` }}>
                  {/* Image Part */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10"></div>
                    <img
                      src={event.image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                      alt={event.name}
                    />

                    <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-black/80 backdrop-blur border border-stone-700/50 rounded-lg text-[10px] font-black text-orange-500 tracking-widest uppercase">
                        RANK: {event.difficulty}
                      </span>
                      {status && (
                        <span className={`px-3 py-1 bg-black/80 backdrop-blur border border-stone-700/50 rounded-lg text-[10px] font-black tracking-widest uppercase ${status === 'approved' ? 'text-green-500' : 'text-yellow-500'}`}>
                          STATUS: {status}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                      <div className="flex items-center space-x-2 text-stone-300">
                        <FaMapMarkerAlt className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">{event.location}</span>
                      </div>
                      <div className="bg-stone-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-stone-700/50 shadow-xl">
                        <span className="text-[10px] font-black text-white tracking-widest uppercase truncate">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Part */}
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-orange-500 transition-colors leading-tight">{event.name}</h3>
                    <p className="text-stone-500 text-sm line-clamp-2 mb-8 font-medium leading-relaxed">{event.description}</p>

                    <div className="mt-auto grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleViewDetails(event)}
                        className="h-14 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        MISSION INTEL
                      </button>
                      {status === 'approved' ? (
                        <button
                          onClick={() => handleCancelRegistration(event._id)}
                          className="h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                        >
                          ABORT MISSION
                        </button>
                      ) : status === 'pending' ? (
                        <button
                          disabled
                          className="h-14 rounded-2xl bg-stone-800 text-stone-600 font-black text-[10px] uppercase tracking-widest cursor-not-allowed border border-stone-700/50"
                        >
                          PENDING AUTH
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegisterEvent(event._id)}
                          className="h-14 rounded-2xl bg-orange-500 text-black font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                        >
                          ENROLL NOW
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-32 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-stone-900 border border-stone-800 mb-6 text-stone-700">
                  <FaExclamationTriangle size={32} />
                </div>
                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Negative Contact</h3>
                <p className="text-stone-500 max-w-sm mx-auto font-medium">No missions currently match your search parameters or ranking status. Expand your search or check again later.</p>
                <button
                  onClick={() => { setSearchTerm(''); setFilterDifficulty('all'); setFilterStatus('all'); }}
                  className="mt-8 text-orange-500 font-black uppercase tracking-widest text-[10px] border-b-2 border-orange-500/30 pb-1 hover:text-orange-400"
                >
                  RESET SYSTEM FILTERS
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal: Registration Form */}
        {showRegistrationForm && selectedEvent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-stone-900 border border-stone-800 rounded-[3rem] w-full max-w-4xl p-8 lg:p-12 relative shadow-[0_0_100px_rgba(0,0,0,0.8)] my-8">
              <button onClick={() => setShowRegistrationForm(false)} className="absolute top-8 right-8 p-4 bg-stone-800 border border-stone-700 rounded-2xl text-stone-400 hover:text-white hover:border-stone-600 transition-all"><FaTimes /></button>

              <div className="flex items-center space-x-4 mb-10">
                <div className="w-12 h-12 bg-orange-500 text-black rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-orange-500/20"><FaBolt /></div>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">MISSION ENROLLMENT</h2>
                  <p className="text-stone-500 font-bold uppercase tracking-widest text-[10px]">Operation: {selectedEvent.name}</p>
                </div>
              </div>

              <form onSubmit={handleRegistrationFormSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-stone-100 items-center uppercase tracking-widest flex space-x-2">
                      <FaShieldAlt className="text-orange-500" />
                      <span>Emergency Protocol</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <input
                          type="text" placeholder="CONTACT NAME"
                          value={registrationFormData.emergencyContact.name}
                          onChange={(e) => handleRegistrationFormChange('emergencyContact.name', e.target.value)}
                          className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-xs font-bold tracking-widest uppercase text-white focus:border-orange-500 transition-all"
                        />
                        {touchedFields.emergencyContact.name && validationErrors.emergencyContact.name && (
                          <p className="text-[10px] text-red-500 font-bold">{validationErrors.emergencyContact.name}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <input
                            type="text" placeholder="PHONE"
                            value={registrationFormData.emergencyContact.phone}
                            onChange={(e) => handleRegistrationFormChange('emergencyContact.phone', e.target.value)}
                            className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-xs font-bold tracking-widest uppercase text-white focus:border-orange-500 transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <input
                            type="text" placeholder="RELATIONSHIP"
                            value={registrationFormData.emergencyContact.relationship}
                            onChange={(e) => handleRegistrationFormChange('emergencyContact.relationship', e.target.value)}
                            className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-xs font-bold tracking-widest uppercase text-white focus:border-orange-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-stone-100 items-center uppercase tracking-widest flex space-x-2">
                      <FaCompass className="text-orange-500" />
                      <span>Skill & Health Clearance</span>
                    </h3>
                    <select
                      value={registrationFormData.experienceLevel}
                      onChange={(e) => handleRegistrationFormChange('experienceLevel', e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-xs font-black tracking-widest uppercase text-orange-500 focus:border-orange-500 appearance-none"
                    >
                      <option value="beginner">RECRUIT (BEGINNER)</option>
                      <option value="intermediate">OPERATIVE (INTERMEDIATE)</option>
                      <option value="advanced">VETERAN (ADVANCED)</option>
                    </select>
                    <textarea
                      placeholder="MEDICAL CONDITIONS (IF ANY)"
                      value={registrationFormData.medicalConditions}
                      onChange={(e) => handleRegistrationFormChange('medicalConditions', e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-xs font-bold tracking-widest uppercase text-white focus:border-orange-500 min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-stone-100 items-center uppercase tracking-widest flex space-x-2">
                      <FaBolt className="text-orange-500" />
                      <span>Deployable Units & Races</span>
                    </h3>

                    {racesLoading ? (
                      <div className="py-12 text-center text-stone-600 font-bold uppercase tracking-widest text-[10px]">Loading Intel...</div>
                    ) : (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {(racesByEvent[selectedEvent._id] || []).map(race => (
                          <div key={race._id} className="bg-stone-950 border border-stone-800 p-5 rounded-2xl space-y-4">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id={race._id}
                                checked={registrationFormData.races.includes(race._id)}
                                onChange={(e) => {
                                  const newRaces = e.target.checked
                                    ? [...registrationFormData.races, race._id]
                                    : registrationFormData.races.filter(id => id !== race._id);
                                  setRegistrationFormData(prev => ({ ...prev, races: newRaces }));
                                }}
                                className="w-5 h-5 text-orange-500 bg-stone-800 border-stone-700 rounded-lg focus:ring-0"
                              />
                              <label htmlFor={race._id} className="text-sm font-black text-white uppercase tracking-tighter leading-tight cursor-pointer">
                                {race.name}
                              </label>
                            </div>

                            {registrationFormData.races.includes(race._id) && (
                              <div className="pl-8 space-y-3">
                                <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Select Unit for this Stage:</p>
                                <div className="grid grid-cols-1 gap-2">
                                  {userVehicles.map(vehicle => (
                                    <button
                                      key={vehicle._id}
                                      type="button"
                                      onClick={() => {
                                        const current = raceVehicleSelections[race._id] || [];
                                        const updated = current.includes(vehicle._id)
                                          ? current.filter(id => id !== vehicle._id)
                                          : [...current, vehicle._id];
                                        setRaceVehicleSelections(prev => ({ ...prev, [race._id]: updated }));
                                      }}
                                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${(raceVehicleSelections[race._id] || []).includes(vehicle._id) ? 'bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-stone-900 border-stone-700 text-stone-400 hover:border-stone-500'}`}
                                    >
                                      <span className="text-[10px] font-black uppercase tracking-widest">{vehicle.make} {vehicle.model}</span>
                                      {(raceVehicleSelections[race._id] || []).includes(vehicle._id) && <FaCheckCircle />}
                                    </button>
                                  ))}
                                  {userVehicles.length === 0 && (
                                    <button
                                      type="button"
                                      onClick={() => navigate('/profile')}
                                      className="p-4 bg-orange-500/10 border-2 border-dashed border-orange-500/30 text-orange-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500/20 transition-all"
                                    >
                                      + ADDR UNIT TO GARAGE
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full h-20 bg-orange-500 text-black font-black text-lg uppercase tracking-[0.3em] rounded-3xl hover:bg-white transition-all shadow-2xl shadow-orange-500/40 active:scale-[0.98]"
                  >
                    CONFIRM DEPLOYMENT
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Mission Intel (Details) */}
        {showEventDetails && selectedEvent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-stone-900 border border-stone-800 rounded-[3rem] w-full max-w-4xl overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,0.8)] my-8">
              <div className="h-64 relative">
                <img src={selectedEvent.image} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent"></div>
                <button onClick={() => setShowEventDetails(false)} className="absolute top-8 right-8 p-4 bg-black/50 backdrop-blur border border-stone-700/50 rounded-2xl text-white hover:bg-orange-500 hover:text-black transition-all"><FaTimes /></button>
              </div>

              <div className="p-8 lg:p-12 -mt-12 relative z-10">
                <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-4">{selectedEvent.name}</h2>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="px-5 py-3 bg-stone-800 rounded-2xl border border-stone-700 flex items-center space-x-3">
                    <FaMapMarkerAlt className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-100">{selectedEvent.location}</span>
                  </div>
                  <div className="px-5 py-3 bg-stone-800 rounded-2xl border border-stone-700 flex items-center space-x-3">
                    <FaCalendarAlt className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-100">{new Date(selectedEvent.date).toLocaleDateString()}</span>
                  </div>
                  <div className="px-5 py-3 bg-stone-800 rounded-2xl border border-stone-700 flex items-center space-x-3">
                    <FaBolt className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-100">RANK: {selectedEvent.difficulty}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.3em]">Operational Objectives</h3>
                    <p className="text-stone-400 text-lg font-medium leading-relaxed">{selectedEvent.description}</p>
                  </div>
                  <aside className="space-y-6">
                    <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.3em]">Stage Details</h3>
                    <div className="space-y-4">
                      {racesLoading ? <div className="text-[10px] text-stone-600 font-bold uppercase animate-pulse">Syncing stages...</div> : (
                        (racesByEvent[selectedEvent._id] || []).map(r => (
                          <div key={r._id} className="p-4 bg-stone-950 border border-stone-800 rounded-2xl">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">{r.name}</h4>
                            <div className="flex items-center space-x-2 text-stone-600 text-[9px] font-bold">
                              <FaClock />
                              <span>STAGE LENGTH: TBD</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </aside>
                </div>

                <div className="mt-12 pt-10 border-t border-stone-800 flex flex-col sm:flex-row gap-4">
                  {getRegistrationStatus(selectedEvent._id) ? (
                    <button disabled className="flex-1 h-14 bg-stone-800 text-stone-500 rounded-2xl font-black uppercase tracking-widest border border-stone-700 opacity-50">ALREADY REGISTERED</button>
                  ) : (
                    <button onClick={() => { setShowEventDetails(false); handleRegisterEvent(selectedEvent._id); }} className="flex-1 h-16 bg-orange-500 text-black rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-orange-500/20 italic">ENLIST IN DISPATCH NOW</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <button className="w-16 h-16 bg-white text-black rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group">
          <FaBell className="text-xl group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default UserEvents;