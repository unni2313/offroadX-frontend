import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { showSuccess, showError, showWarning, showConfirm } from './utils/sweetAlert';
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
  FaArrowLeft
} from 'react-icons/fa';

function UserEvents() {
  const [user, setUser] = useState(null);
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
    vehicles: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchEvents();
      fetchUserParticipations();
      fetchUserRegistrations();
    } else {
      navigate('/login');
    }
  }, [navigate]);

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

  const handleRegisterEvent = (eventId) => {
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

    setSelectedEvent(event);
    setShowRegistrationForm(true);
  };

  const handleRegistrationFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/events/${selectedEvent._id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationFormData)
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
          vehicles: []
        });
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

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setRegistrationFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setRegistrationFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Navigation Header */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <FaMapMarkedAlt className="text-green-500 text-2xl" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
                OffroadX
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/home" className="text-gray-300 hover:text-green-400 transition flex items-center space-x-1">
                <FaCompass className="text-sm" />
                <span>Home</span>
              </Link>
              <Link to="/events" className="text-green-400 font-medium flex items-center space-x-1">
                <FaCalendarAlt className="text-sm" />
                <span>Events</span>
              </Link>
              <Link to="/routes" className="text-gray-300 hover:text-green-400 transition flex items-center space-x-1">
                <FaRoute className="text-sm" />
                <span>Routes</span>
              </Link>
              <Link to="/community" className="text-gray-300 hover:text-green-400 transition flex items-center space-x-1">
                <FaUsers className="text-sm" />
                <span>Community</span>
              </Link>
              <Link to="/achievements" className="text-gray-300 hover:text-green-400 transition flex items-center space-x-1">
                <FaTrophy className="text-sm" />
                <span>Achievements</span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-300 hover:text-green-400 transition">
                <FaBell className="text-xl" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-sm" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{user.firstName} {user.secondName}</p>
                  <p className="text-xs text-gray-400">Explorer</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-red-400 transition"
                  title="Logout"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Discover Amazing Events 🌟
              </h1>
              <p className="text-green-100 text-lg mb-4">
                Join thrilling offroad adventures and connect with fellow explorers!
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt />
                  <span>Available Events: {events.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaUsers />
                  <span>Your Events: {userParticipations.length}</span>
                </div>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 text-6xl opacity-20">🏔️</div>
            <div className="absolute bottom-4 right-16 text-4xl opacity-20">🚗</div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="all">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
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
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading events...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-6">
            <p className="text-red-400 text-center">{error}</p>
            <div className="text-center mt-4">
              <button
                onClick={fetchEvents}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const registrationStatus = getRegistrationStatus(event._id);
              const isApproved = registrationStatus === 'approved';
              const isPending = registrationStatus === 'pending';
              const isRejected = registrationStatus === 'rejected';
              const hasRegistration = registrationStatus !== null;
              const isFull = event.participants >= event.maxParticipants;
              const isUpcoming = event.status === 'upcoming';
              
              return (
                <div key={event._id} className="bg-gray-800 rounded-xl border border-gray-700 hover:border-green-500/30 transition overflow-hidden">
                  <div className="p-6">
                    {/* Event Header */}
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white line-clamp-2">{event.name}</h3>
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.status)}`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadge(event.difficulty)}`}>
                          {getDifficultyIcon(event.difficulty)} {event.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-gray-300">
                        <FaCalendarAlt className="mr-2 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{event.date} at {event.time}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <FaMapMarkerAlt className="mr-2 text-green-500 flex-shrink-0" />
                        <span className="text-sm line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <FaUsers className="mr-2 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{event.participants}/{event.maxParticipants} participants</span>
                      </div>
                      {event.duration && (
                        <div className="flex items-center text-gray-300">
                          <FaClock className="mr-2 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{event.duration}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {event.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {event.description}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Participants</span>
                        <span>{Math.round((event.participants / event.maxParticipants) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            isFull ? 'bg-red-500' : 'bg-gradient-to-r from-green-600 to-green-500'
                          }`}
                          style={{ width: `${Math.min((event.participants / event.maxParticipants) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Registration Status Badge */}
                    {hasRegistration && (
                      <div className="mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRegistrationStatusBadge(registrationStatus)}`}>
                          {getRegistrationStatusIcon(registrationStatus)}
                          {registrationStatus === 'pending' && 'Pending Approval'}
                          {registrationStatus === 'approved' && 'Approved'}
                          {registrationStatus === 'rejected' && 'Rejected'}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleViewDetails(event)}
                        className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        <FaInfoCircle />
                        <span>Details</span>
                      </button>
                      
                      <div className="flex space-x-2">
                        {hasRegistration && !isRejected ? (
                          <button
                            onClick={() => handleCancelRegistration(event._id)}
                            className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                          >
                            <FaTimesCircle />
                            <span>Cancel</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegisterEvent(event._id)}
                            disabled={!isUpcoming || isFull}
                            className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                              !isUpcoming || isFull
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white'
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
                      <div className="mt-3 flex items-center justify-center space-x-2 bg-green-900/30 border border-green-500/30 rounded-lg py-2">
                        <FaCheckCircle className="text-green-400" />
                        <span className="text-green-400 text-sm font-medium">You're registered!</span>
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
          <div className="text-center py-12">
            <FaCalendarAlt className="mx-auto text-gray-500 text-6xl mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No events found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or check back later for new events.</p>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedEvent.name}</h2>
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedEvent.status)}`}>
                      {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyBadge(selectedEvent.difficulty)}`}>
                      {getDifficultyIcon(selectedEvent.difficulty)} {selectedEvent.difficulty}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  <FaTimesCircle />
                </button>
              </div>

              {/* Event Details */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <FaCalendarAlt className="text-green-500" />
                    <div>
                      <p className="text-sm text-gray-400">Date & Time</p>
                      <p className="font-medium">{selectedEvent.date} at {selectedEvent.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <FaMapMarkerAlt className="text-green-500" />
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="font-medium">{selectedEvent.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <FaUsers className="text-green-500" />
                    <div>
                      <p className="text-sm text-gray-400">Participants</p>
                      <p className="font-medium">{selectedEvent.participants}/{selectedEvent.maxParticipants}</p>
                    </div>
                  </div>
                  {selectedEvent.duration && (
                    <div className="flex items-center space-x-3 text-gray-300">
                      <FaClock className="text-green-500" />
                      <div>
                        <p className="text-sm text-gray-400">Duration</p>
                        <p className="font-medium">{selectedEvent.duration}</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedEvent.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                    <p className="text-gray-300 leading-relaxed">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Event Capacity</span>
                    <span>{Math.round((selectedEvent.participants / selectedEvent.maxParticipants) * 100)}% Full</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        selectedEvent.participants >= selectedEvent.maxParticipants 
                          ? 'bg-red-500' 
                          : 'bg-gradient-to-r from-green-600 to-green-500'
                      }`}
                      style={{ width: `${Math.min((selectedEvent.participants / selectedEvent.maxParticipants) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white"
                >
                  <FaArrowLeft />
                  <span>Back to Events</span>
                </button>
                
                <div className="flex space-x-3">
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
                          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition"
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
                          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
                            selectedEvent.status !== 'upcoming' || selectedEvent.participants >= selectedEvent.maxParticipants
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          <FaUserPlus />
                          <span>
                            {selectedEvent.participants >= selectedEvent.maxParticipants 
                              ? 'Event Full' 
                              : selectedEvent.status !== 'upcoming' 
                                ? 'Event Closed' 
                                : 'Register'
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Register for Event</h2>
                  <p className="text-gray-300">{selectedEvent.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowRegistrationForm(false);
                    setSelectedEvent(null);
                  }}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  <FaTimesCircle />
                </button>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleRegistrationFormSubmit} className="space-y-6">
                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={registrationFormData.emergencyContact.name}
                        onChange={(e) => handleRegistrationFormChange('emergencyContact.name', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={registrationFormData.emergencyContact.phone}
                        onChange={(e) => handleRegistrationFormChange('emergencyContact.phone', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Relationship *
                      </label>
                      <input
                        type="text"
                        value={registrationFormData.emergencyContact.relationship}
                        onChange={(e) => handleRegistrationFormChange('emergencyContact.relationship', e.target.value)}
                        placeholder="e.g., Spouse, Parent, Friend"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Experience Level *
                  </label>
                  <select
                    value={registrationFormData.experienceLevel}
                    onChange={(e) => handleRegistrationFormChange('experienceLevel', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Medical Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Medical Conditions or Allergies
                  </label>
                  <textarea
                    value={registrationFormData.medicalConditions}
                    onChange={(e) => handleRegistrationFormChange('medicalConditions', e.target.value)}
                    placeholder="Please list any medical conditions, allergies, or medications that organizers should be aware of..."
                    rows="3"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={registrationFormData.additionalNotes}
                    onChange={(e) => handleRegistrationFormChange('additionalNotes', e.target.value)}
                    placeholder="Any additional information you'd like to share with the organizers..."
                    rows="3"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegistrationForm(false);
                      setSelectedEvent(null);
                    }}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white"
                  >
                    <FaArrowLeft />
                    <span>Cancel</span>
                  </button>
                  
                  <button
                    type="submit"
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
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