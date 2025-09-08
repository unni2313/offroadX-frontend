import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { showSuccess, showError, showWarning, showConfirm } from './utils/sweetAlert'
import {
  FaSignOutAlt,
  FaUsers,
  FaCalendarAlt,
  FaChartLine,
  FaMapMarkedAlt,
  FaCog,
  FaBars,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaTimes,
  FaSave
} from 'react-icons/fa'

function Events() {
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: '',
    difficulty: 'Easy',
    duration: '',
    description: ''
  })
  
  // View/Edit modal state
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState(null)

  const openView = (event) => {
    setSelectedEvent(event)
    setShowViewModal(true)
  }

  const openEdit = (event) => {
    setSelectedEvent(event)
    setEditData({
      name: event.name || '',
      date: event.date || '',
      time: event.time || '',
      location: event.location || '',
      maxParticipants: event.maxParticipants || '',
      difficulty: event.difficulty || 'Easy',
      duration: event.duration || '',
      description: event.description || ''
    })
    setShowEditModal(true)
  }

  const closeModals = () => {
    setShowViewModal(false)
    setShowEditModal(false)
    setSelectedEvent(null)
    setEditData(null)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({ ...prev, [name]: value }))
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:5000/api/events/${selectedEvent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(editData),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to update event')
      showSuccess('Updated!', 'Event updated successfully.')
      closeModals()
      fetchEvents()
    } catch (err) {
      console.error(err)
      showError('Error', err.message || 'Failed to update event')
    }
  }

  const navigate = useNavigate()

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('http://localhost:5000/api/events')

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      navigate('/login')
    } else {
      setUser(JSON.parse(userData))
      fetchEvents() // Fetch events when component mounts
    }
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name || !formData.date || !formData.time || !formData.location || !formData.maxParticipants) {
    showWarning('Missing Information', 'Please fill in all required fields');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/events/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.error || 'Error creating event');

    showSuccess('Success!', 'Event created successfully!');
    setFormData({
      name: '',
      date: '',
      time: '',
      location: '',
      maxParticipants: '',
      difficulty: 'Easy',
      duration: '',
      description: ''
    });
    setShowCreateForm(false);
    fetchEvents(); // Refresh the events list
  } catch (err) {
    console.error(err);
    showError('Error!', 'Failed to create event. Please try again.');
  }
};


  const handleCancel = () => {
    setFormData({
      name: '',
      date: '',
      time: '',
      location: '',
      maxParticipants: '',
      difficulty: 'Easy',
      duration: '',
      description: ''
    })
    setShowCreateForm(false)
  }

  const handleDeleteEvent = async (eventId, eventName) => {
    const result = await showConfirm(
      'Delete Event',
      `Are you sure you want to delete "${eventName}"? This action cannot be undone.`,
      'Yes, delete it!',
      'Cancel'
    )

    if (result.isConfirmed) {
      try {




        const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to delete event')
        }

        showSuccess('Deleted!', 'Event has been deleted successfully.')
        fetchEvents() // Refresh the events list
      } catch (error) {
        showError('Error!', 'Failed to delete event. Please try again.')
      }
    }
  }



  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: 'bg-green-600 text-white',
      completed: 'bg-gray-600 text-white',
      cancelled: 'bg-red-600 text-white'
    }
    return badges[status] || 'bg-gray-600 text-white'
  }

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      Easy: 'bg-blue-600 text-white',
      Medium: 'bg-yellow-600 text-white',
      Hard: 'bg-red-600 text-white'
    }
    return badges[difficulty] || 'bg-gray-600 text-white'
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      {/* Sidebar */}
     

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
      

        {/* Events Content */}
        <main className="p-6 pt-24">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
                Events Management
              </span>
            </h1>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-500 hover:to-green-600 transition flex items-center space-x-2"
            >
              <FaPlus />
              <span>Create Event</span>
            </button>
          </div>

          {/* Create Event Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Create New Event</h2>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    <FaTimes />
                  </button>
                </div>


                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Event Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter event name"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                      required
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Time *
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter event location"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                      required
                    />
                  </div>

                  {/* Max Participants and Difficulty */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Participants *
                      </label>
                      <input
                        type="number"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleInputChange}
                        placeholder="Enter max participants"
                        min="1"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Difficulty
                      </label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 4 hours, 2 days"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter event description"
                      rows="4"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-500 hover:to-green-600 transition flex items-center space-x-2"
                    >
                      <FaSave />
                      <span>Create Event</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="all">All Events</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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

          {/* View Event Modal */}
          {showViewModal && selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Event Details</h2>
                  <button onClick={closeModals} className="text-gray-400 hover:text-white text-xl">
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-4 text-gray-300">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">{selectedEvent.name}</h3>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedEvent.status)}`}>
                        {selectedEvent.status?.charAt(0).toUpperCase() + selectedEvent.status?.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadge(selectedEvent.difficulty)}`}>
                        {selectedEvent.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-green-500" />
                      <span>{selectedEvent.date} at {selectedEvent.time}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkedAlt className="mr-2 text-green-500" />
                      <span>{selectedEvent.location}</span>
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="mr-2 text-green-500" />
                      <span>{selectedEvent.participants}/{selectedEvent.maxParticipants} participants</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Duration</div>
                    <div>{selectedEvent.duration || '-'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Description</div>
                    <p className="whitespace-pre-wrap">{selectedEvent.description || '-'}</p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button onClick={closeModals} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Event Modal */}
          {showEditModal && editData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Edit Event</h2>
                  <button onClick={closeModals} className="text-gray-400 hover:text-white text-xl">
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={submitEdit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Event Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={editData.date}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Time *</label>
                      <input
                        type="time"
                        name="time"
                        value={editData.time}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={editData.location}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Max Participants *</label>
                      <input
                        type="number"
                        name="maxParticipants"
                        value={editData.maxParticipants}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty *</label>
                      <select
                        name="difficulty"
                        value={editData.difficulty}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                        required
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={editData.duration}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                      placeholder="e.g., 3h 30m"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={editData.description}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                      rows="4"
                      placeholder="Event description..."
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={closeModals} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white flex items-center space-x-2">
                      <FaSave />
                      <span>Save</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Events Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div key={event._id} className="bg-gray-800 rounded-xl border border-gray-700 hover:border-green-500/30 transition overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">{event.name}</h3>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.status)}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadge(event.difficulty)}`}>
                        {event.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-300">
                      <FaCalendarAlt className="mr-2 text-green-500" />
                      <span>{event.date} at {event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <FaMapMarkedAlt className="mr-2 text-green-500" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <FaUsers className="mr-2 text-green-500" />
                      <span>{event.participants}/{event.maxParticipants} participants</span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">{event.duration}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openView(event)}
                        className="p-2 text-blue-500 hover:text-blue-400 hover:bg-gray-700 rounded"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openEdit(event)}
                        className="p-2 text-yellow-500 hover:text-yellow-400 hover:bg-gray-700 rounded"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id, event.name)}
                        className="p-2 text-red-500 hover:text-red-400 hover:bg-gray-700 rounded"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar for Participants */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Participants</span>
                      <span>{Math.round((event.participants / event.maxParticipants) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-600 to-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* No Events Found */}
          {!loading && !error && filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <FaCalendarAlt className="mx-auto text-gray-500 text-6xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or create a new event.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Events