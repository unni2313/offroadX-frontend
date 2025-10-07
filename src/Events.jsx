import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { showSuccess, showError, showWarning, showConfirm } from './utils/sweetAlert'
import { validateName, validatePhone, formatName, formatPhoneNumber } from './utils/validation'
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
  FaSave,
  FaFlag,
  FaExclamationTriangle
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
  
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    location: '',
    maxParticipants: '',
    duration: ''
  })
  
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    location: false,
    maxParticipants: false,
    duration: false
  })
  
  // View/Edit modal state
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [participants, setParticipants] = useState([])
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [participantsError, setParticipantsError] = useState(null)
  
  // Registration management state
  const [registrations, setRegistrations] = useState([])
  const [registrationsLoading, setRegistrationsLoading] = useState(false)
  const [registrationsError, setRegistrationsError] = useState(null)
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false)
  const [registrationFilter, setRegistrationFilter] = useState('pending')

  // Race management state
  const [races, setRaces] = useState([])
  const [racesLoading, setRacesLoading] = useState(false)
  const [racesError, setRacesError] = useState(null)
  const [routes, setRoutes] = useState([])
  const [routesLoading, setRoutesLoading] = useState(false)
  const [showRacesModal, setShowRacesModal] = useState(false)
  const [resultsByRace, setResultsByRace] = useState({})
  const [draftByRace, setDraftByRace] = useState({}) // { [raceId]: { [userId]: { score, timeStr, position, vehicleId } } }
  const [showResultsForm, setShowResultsForm] = useState({}) // { [raceId]: boolean }
  const [showCreateRaceForm, setShowCreateRaceForm] = useState(false)
  const [showEditRaceModal, setShowEditRaceModal] = useState(false)
  const [editRaceData, setEditRaceData] = useState(null)
  const [raceFormData, setRaceFormData] = useState({
    name: '',
    type: 'lap',
    route: '',
    date: '',
    startTime: '',
    estimatedDuration: '',
    numberOfLaps: '',
    stages: [],
    description: ''
  })

  const fetchParticipants = async (eventId) => {
    try {
      setParticipantsLoading(true)
      setParticipantsError(null)
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/participants`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch participants')
      setParticipants(data.participants || [])
    } catch (err) {
      console.error(err)
      setParticipantsError(err.message || 'Failed to load participants')
    } finally {
      setParticipantsLoading(false)
    }
  }

  const fetchRegistrations = async (eventId, status = null) => {
    try {
      setRegistrationsLoading(true)
      setRegistrationsError(null)
      const url = status 
        ? `http://localhost:5000/api/events/${eventId}/registrations?status=${status}`
        : `http://localhost:5000/api/events/${eventId}/registrations`
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch registrations')
      setRegistrations(data.registrations || [])
    } catch (err) {
      console.error(err)
      setRegistrationsError(err.message || 'Failed to load registrations')
    } finally {
      setRegistrationsLoading(false)
    }
  }

  const handleApproveRegistration = async (registrationId) => {
    const result = await showConfirm(
      'Approve Registration',
      'Are you sure you want to approve this registration?',
      'Yes, approve',
      'Cancel'
    )

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/api/events/registrations/${registrationId}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ reviewNotes: 'Approved by admin' })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to approve registration')
        }

        showSuccess('Approved!', 'Registration has been approved successfully.')
        fetchRegistrations(selectedEvent._id, registrationFilter)
        fetchParticipants(selectedEvent._id)
        fetchEvents() // Refresh events to update participant count
      } catch (error) {
        console.error('Error approving registration:', error)
        showError('Error!', error.message || 'Failed to approve registration.')
      }
    }
  }

  const handleRejectRegistration = async (registrationId) => {
    const result = await showConfirm(
      'Reject Registration',
      'Are you sure you want to reject this registration?',
      'Yes, reject',
      'Cancel'
    )

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/api/events/registrations/${registrationId}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ reviewNotes: 'Rejected by admin' })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to reject registration')
        }

        showSuccess('Rejected!', 'Registration has been rejected.')
        fetchRegistrations(selectedEvent._id, registrationFilter)
      } catch (error) {
        console.error('Error rejecting registration:', error)
        showError('Error!', error.message || 'Failed to reject registration.')
      }
    }
  }

  const openView = (event) => {
    setSelectedEvent(event)
    setShowViewModal(true)
    fetchParticipants(event._id)
  }

  const openRegistrations = (event) => {
    setSelectedEvent(event)
    setShowRegistrationsModal(true)
    fetchRegistrations(event._id, registrationFilter)
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
    setShowRegistrationsModal(false)
    setShowRacesModal(false)
    setShowCreateRaceForm(false)
    setShowEditRaceModal(false)
    setSelectedEvent(null)
    setEditData(null)
    setEditRaceData(null)
    setRegistrations([])
    setRaces([])
    setRaceFormData({
      name: '',
      type: 'lap',
      route: '',
      date: '',
      startTime: '',
      estimatedDuration: '',
      numberOfLaps: '',
      stages: [],
      description: ''
    })
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

  // Auto-fetch results when races are loaded and modal is open
  useEffect(() => {
    if (showRacesModal && selectedEvent && races.length > 0) {
      fetchAllRaceResults(selectedEvent._id, races)
    }
  }, [showRacesModal, selectedEvent, races])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let processedValue = value

    // Format values based on field type
    if (name === 'name' || name === 'location') {
      processedValue = formatName(value)
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))

    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }))

    // Validate field
    validateField(name, processedValue)
  }

  const validateField = (fieldName, value) => {
    let validation = { isValid: true, message: '' }

    switch (fieldName) {
      case 'name':
        if (!value || value.trim() === '') {
          validation = { isValid: false, message: 'Event name is required' }
        } else if (value.trim().length < 3) {
          validation = { isValid: false, message: 'Event name must be at least 3 characters' }
        } else if (value.trim().length > 100) {
          validation = { isValid: false, message: 'Event name is too long (maximum 100 characters)' }
        }
        break
      case 'location':
        if (!value || value.trim() === '') {
          validation = { isValid: false, message: 'Location is required' }
        } else if (value.trim().length < 3) {
          validation = { isValid: false, message: 'Location must be at least 3 characters' }
        } else if (value.trim().length > 200) {
          validation = { isValid: false, message: 'Location is too long (maximum 200 characters)' }
        }
        break
      case 'maxParticipants':
        if (!value || value.trim() === '') {
          validation = { isValid: false, message: 'Max participants is required' }
        } else if (isNaN(value) || parseInt(value) < 1) {
          validation = { isValid: false, message: 'Max participants must be a positive number' }
        } else if (parseInt(value) > 10000) {
          validation = { isValid: false, message: 'Max participants cannot exceed 10,000' }
        }
        break
      case 'duration':
        if (value && value.trim().length > 50) {
          validation = { isValid: false, message: 'Duration is too long (maximum 50 characters)' }
        }
        break
      default:
        break
    }

    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: validation.isValid ? '' : validation.message
    }))

    return validation.isValid
  }

  const validateAllFields = () => {
    const fields = ['name', 'location', 'maxParticipants']
    let allValid = true

    fields.forEach(field => {
      const isValid = validateField(field, formData[field])
      if (!isValid) allValid = false
    })

    return allValid
  }

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate all fields before submission
  if (!validateAllFields()) {
    showWarning('Validation Error', 'Please fix all validation errors before submitting');
    return;
  }

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



  // Race functions
  const fetchRaces = async (eventId) => {
    try {
      setRacesLoading(true)
      setRacesError(null)
      const response = await fetch(`http://localhost:5000/api/races/event/${eventId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch races')
      setRaces(data.races || [])
    } catch (err) {
      console.error(err)
      setRacesError(err.message || 'Failed to load races')
    } finally {
      setRacesLoading(false)
    }
  }

  // Fetch results for all races
  const fetchAllRaceResults = async (eventId, races) => {
    if (!races || races.length === 0) return
    
    try {
      // Fetch results for each race in parallel
      const resultPromises = races.map(race => 
        fetchResultsForRace(eventId, race._id).catch(err => {
          console.warn(`Failed to fetch results for race ${race.name}:`, err)
          return null // Don't fail the entire operation if one race fails
        })
      )
      
      await Promise.all(resultPromises)
    } catch (err) {
      console.error('Error fetching race results:', err)
    }
  }

  const parseTimeToMs = (timeStr) => {
    // hh:mm:ss.mmm
    if (!timeStr) return 0;
    const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2}):(\d{2})\.(\d{1,3})$/);
    if (!match) return 0;
    const [_, h, m, s, ms] = match;
    return Number(h) * 3600000 + Number(m) * 60000 + Number(s) * 1000 + Number(ms.padEnd(3, '0'));
  }

  const formatMsToTime = (ms) => {
    const sign = ms < 0 ? '-' : '';
    ms = Math.abs(ms || 0);
    const hours = Math.floor(ms / 3600000);
    ms %= 3600000;
    const minutes = Math.floor(ms / 60000);
    ms %= 60000;
    const seconds = Math.floor(ms / 1000);
    const millis = ms % 1000;
    const pad2 = (n) => String(n).padStart(2, '0');
    const pad3 = (n) => String(n).padStart(3, '0');
    return `${sign}${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}.${pad3(millis)}`;
  }

  const fetchResultsForRace = async (eventId, raceId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/events/${eventId}/races/${raceId}/results`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load results')
      setResultsByRace(prev => ({ ...prev, [raceId]: data.results || [] }))
    } catch (e) {
      console.error(e)
      setResultsByRace(prev => ({ ...prev, [raceId]: [] }))
    }
  }

  const saveResult = async ({ eventId, raceId, registration, user, vehicle, score, timeStr, position, notes }) => {
    const finishingTimeMs = parseTimeToMs(timeStr)
    const payload = {
      registrationId: registration._id,
      userId: user._id || user,
      vehicleId: vehicle?._id || vehicle || undefined,
      score: Number(score) || 0,
      finishingTimeMs,
      position: position ? Number(position) : undefined,
      notes: notes || ''
    }
    const res = await fetch(`http://localhost:5000/api/events/${eventId}/races/${raceId}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to save result')
    await fetchResultsForRace(eventId, raceId)
    showSuccess('Saved', 'Result saved successfully')
  }

  const fetchRoutes = async () => {
    try {
      setRoutesLoading(true)
      const response = await fetch('http://localhost:5000/api/routes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch routes')
      // Backend returns an array; fallback to data.routes if shape changes
      setRoutes(Array.isArray(data) ? data : (data.routes || []))
    } catch (err) {
      console.error(err)
      showError('Error!', 'Failed to load routes.')
    } finally {
      setRoutesLoading(false)
    }
  }

  const openRaces = (event) => {
    setSelectedEvent(event)
    setShowRacesModal(true)
    fetchRaces(event._id)
    fetchRoutes()
    fetchRegistrations(event._id)
    // Preload results for each race after races load
  }

  const openEditRace = (race) => {
    setEditRaceData({
      ...race,
      route: race.route._id
    })
    setShowEditRaceModal(true)
  }

  const closeRaceModals = () => {
    setShowRacesModal(false)
    setShowCreateRaceForm(false)
    setShowEditRaceModal(false)
    setSelectedEvent(null)
    setEditRaceData(null)
    setRaces([])
    setRaceFormData({
      name: '',
      type: 'lap',
      route: '',
      date: '',
      startTime: '',
      estimatedDuration: '',
      numberOfLaps: '',
      stages: [],
      description: ''
    })
  }

  const handleRaceInputChange = (e) => {
    const { name, value } = e.target
    setRaceFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditRaceChange = (e) => {
    const { name, value } = e.target
    setEditRaceData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateRace = async (e) => {
    e.preventDefault()

    if (!raceFormData.name || !raceFormData.route || !raceFormData.date || !raceFormData.startTime) {
      showWarning('Missing Information', 'Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/races/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...raceFormData,
          event: selectedEvent._id
        })
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Failed to create race')

      showSuccess('Success!', 'Race created successfully!')
      setRaceFormData({
        name: '',
        type: 'lap',
        route: '',
        date: '',
        startTime: '',
        estimatedDuration: '',
        numberOfLaps: '',
        stages: [],
        description: ''
      })
      setShowCreateRaceForm(false)
      fetchRaces(selectedEvent._id)
    } catch (err) {
      console.error(err)
      showError('Error!', 'Failed to create race. Please try again.')
    }
  }

  const handleUpdateRace = async (e) => {
    e.preventDefault()

    if (!editRaceData.name || !editRaceData.route || !editRaceData.date || !editRaceData.startTime) {
      showWarning('Missing Information', 'Please fill in all required fields')
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/races/${editRaceData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editRaceData)
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Failed to update race')

      showSuccess('Updated!', 'Race updated successfully.')
      setShowEditRaceModal(false)
      setEditRaceData(null)
      fetchRaces(selectedEvent._id)
    } catch (err) {
      console.error(err)
     showError('Error!', err.message || 'Failed to update race.')
   }
 }

 const handleDeleteRace = async (raceId, raceName) => {
   const result = await showConfirm(
     'Delete Race',
     `Are you sure you want to delete "${raceName}"? This action cannot be undone.`,
     'Yes, delete it!',
     'Cancel'
   )

   if (result.isConfirmed) {
     try {
       const response = await fetch(`http://localhost:5000/api/races/${raceId}`, {
         method: 'DELETE',
         headers: {
           Authorization: `Bearer ${localStorage.getItem('token')}`
         }
       })

       if (!response.ok) {
         const errorData = await response.json()
         throw new Error(errorData.error || 'Failed to delete race')
       }

       showSuccess('Deleted!', 'Race has been deleted successfully.')
       fetchRaces(selectedEvent._id)
     } catch (error) {
       showError('Error!', 'Failed to delete race. Please try again.')
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
    <div className="min-h-screen bg-black text-stone-100 flex relative overflow-hidden">
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
            className="animate-[mountainFloat1_15s_ease-in-out_infinite] opacity-60"
          />
          
          <path
            d="M0,600 L150,400 L350,550 L550,350 L750,500 L950,300 L1200,450 L1200,800 L0,800 Z"
            fill="url(#bgMountain2)"
            className="animate-[mountainFloat2_12s_ease-in-out_infinite_reverse] opacity-40"
          />
        </svg>
      </div>

      {/* Sidebar */}
     

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} relative z-10`}>
        {/* Header */}
      

        {/* Events Content */}
        <main className="p-8 pt-24">
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
                      className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                        validationErrors.name && touchedFields.name
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-gray-600 focus:border-green-500 focus:ring-green-500/20'
                      }`}
                      required
                    />
                    {validationErrors.name && touchedFields.name && (
                      <div className="mt-2 flex items-center text-red-400 text-sm">
                        <FaExclamationTriangle className="mr-2" />
                        {validationErrors.name}
                      </div>
                    )}
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
                      className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                        validationErrors.location && touchedFields.location
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-gray-600 focus:border-green-500 focus:ring-green-500/20'
                      }`}
                      required
                    />
                    {validationErrors.location && touchedFields.location && (
                      <div className="mt-2 flex items-center text-red-400 text-sm">
                        <FaExclamationTriangle className="mr-2" />
                        {validationErrors.location}
                      </div>
                    )}
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
                        className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                          validationErrors.maxParticipants && touchedFields.maxParticipants
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-gray-600 focus:border-green-500 focus:ring-green-500/20'
                        }`}
                        required
                      />
                      {validationErrors.maxParticipants && touchedFields.maxParticipants && (
                        <div className="mt-2 flex items-center text-red-400 text-sm">
                          <FaExclamationTriangle className="mr-2" />
                          {validationErrors.maxParticipants}
                        </div>
                      )}
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
                      className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                        validationErrors.duration && touchedFields.duration
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-gray-600 focus:border-green-500 focus:ring-green-500/20'
                      }`}
                    />
                    {validationErrors.duration && touchedFields.duration && (
                      <div className="mt-2 flex items-center text-red-400 text-sm">
                        <FaExclamationTriangle className="mr-2" />
                        {validationErrors.duration}
                      </div>
                    )}
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
                      disabled={Object.values(validationErrors).some(error => error !== '')}
                      className={`px-6 py-2 rounded-lg transition flex items-center space-x-2 ${
                        !Object.values(validationErrors).some(error => error !== '')
                          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-500 hover:to-green-600'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
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

                  {/* Participants Section */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold">Participants</h4>
                      <span className="text-sm text-gray-400">{participants.length} of {selectedEvent.maxParticipants}</span>
                    </div>

                    {participantsLoading && (
                      <p className="text-gray-400">Loading participants...</p>
                    )}
                    {participantsError && (
                      <p className="text-red-400">{participantsError}</p>
                    )}

                    {!participantsLoading && !participantsError && (
                      participants.length > 0 ? (
                        <ul className="divide-y divide-gray-700 rounded border border-gray-700">
                          {participants.map((p) => (
                            <li key={p._id} className="p-3 flex items-center justify-between">
                              <div>
                                <a
                                  href={`http://localhost:5173/dashboard/users/${p._id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-green-400 hover:underline"
                                >
                                  {p.firstName} {p.secondName}
                                </a>
                                <div className="text-sm text-gray-400">{p.email} · {p.phone}</div>
                              </div>
                              <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">{p.role}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400">No participants yet.</p>
                      )
                    )}
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

          {/* Registrations Management Modal */}
          {showRegistrationsModal && selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  {/* Modal Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Manage Registrations</h2>
                      <p className="text-gray-300">{selectedEvent.name}</p>
                    </div>
                    <button
                      onClick={closeModals}
                      className="text-gray-400 hover:text-white text-xl"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex space-x-4 mb-6">
                    {['pending', 'approved', 'rejected'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setRegistrationFilter(status);
                          fetchRegistrations(selectedEvent._id, status);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          registrationFilter === status
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Registrations List */}
                  <div className="space-y-4">
                    {registrationsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                      </div>
                    ) : registrationsError ? (
                      <div className="text-center py-8">
                        <p className="text-red-400">{registrationsError}</p>
                      </div>
                    ) : registrations.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No {registrationFilter} registrations found.</p>
                      </div>
                    ) : (
                      registrations.map((registration) => (
                        <div key={registration._id} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-3">
                                <div>
                                  <h4 className="text-lg font-semibold text-white">
                                    {registration.user.firstName} {registration.user.secondName}
                                  </h4>
                                  <p className="text-gray-400">{registration.user.email}</p>
                                  <p className="text-gray-400">{registration.user.phone}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-400">Applied</p>
                                  <p className="text-white">{new Date(registration.appliedAt).toLocaleDateString()}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div>
                                  <p className="text-sm text-gray-400">Experience Level</p>
                                  <p className="text-white capitalize">{registration.experienceLevel}</p>
                                </div>
                                {registration.emergencyContact && (
                                  <div>
                                    <p className="text-sm text-gray-400">Emergency Contact</p>
                                    <p className="text-white">
                                      {registration.emergencyContact.name} ({registration.emergencyContact.relationship})
                                    </p>
                                    <p className="text-gray-300">{registration.emergencyContact.phone}</p>
                                  </div>
                                )}
                              </div>

                              {registration.medicalConditions && (
                                <div className="mb-3">
                                  <p className="text-sm text-gray-400">Medical Conditions</p>
                                  <p className="text-white">{registration.medicalConditions}</p>
                                </div>
                              )}

                              {registration.additionalNotes && (
                                <div className="mb-3">
                                  <p className="text-sm text-gray-400">Additional Notes</p>
                                  <p className="text-white">{registration.additionalNotes}</p>
                                </div>
                              )}

                              {registration.reviewNotes && (
                                <div className="mb-3">
                                  <p className="text-sm text-gray-400">Review Notes</p>
                                  <p className="text-white">{registration.reviewNotes}</p>
                                </div>
                              )}

                        {/* Races and Vehicles */}
                        {(registration.races && registration.races.length > 0) && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-400 mb-2">Selected Races</p>
                            <div className="space-y-2">
                              {registration.races.map((race) => {
                                const vehiclesForRace = registration.vehiclesByRace && registration.vehiclesByRace[race._id] ? registration.vehiclesByRace[race._id] : [];
                                return (
                                  <div key={race._id} className="bg-gray-800 border border-gray-600 rounded p-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-white font-medium">{race.name}</p>
                                        <p className="text-gray-400 text-sm capitalize">{race.type?.replace('_',' ')} · {race.date} · {race.startTime}</p>
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <p className="text-xs text-gray-400">Vehicles</p>
                                      {vehiclesForRace && vehiclesForRace.length > 0 ? (
                                        <ul className="list-disc list-inside text-gray-300 text-sm">
                                          {vehiclesForRace.map((v) => (
                                            <li key={v._id || v}>
                                              {(() => {
                                                const veh = (registration.vehicles || []).find(x => (x._id || x) === (v._id || v));
                                                return veh ? `${veh.make} ${veh.model}${veh.year ? ' ('+veh.year+')' : ''}${veh.registrationNumber ? ' • '+veh.registrationNumber : ''}` : String(v);
                                              })()}
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-gray-400 text-sm">—</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                            </div>

                            

                            {/* Action Buttons */}
                            {registration.status === 'pending' && (
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={() => handleApproveRegistration(registration._id)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectRegistration(registration._id)}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                          {/* Results Editor for this race */}
                          
                        </div>
                      ))
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={closeModals}
                      className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Races Management Modal */}
          {showRacesModal && selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  {/* Modal Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Manage Races</h2>
                      <p className="text-gray-300">{selectedEvent.name}</p>
                    </div>
                    <button
                      onClick={closeRaceModals}
                      className="text-gray-400 hover:text-white text-xl"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Create Race Button */}
                  <div className="mb-6">
                    <button
                      onClick={() => setShowCreateRaceForm(true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center"
                    >
                      <FaPlus className="mr-2" />
                      Create New Race
                    </button>
                  </div>

                  {/* Races List */}
                  <div className="space-y-4">
                    {racesLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                      </div>
                    ) : racesError ? (
                      <div className="text-center py-8">
                        <p className="text-red-400">{racesError}</p>
                      </div>
                    ) : races.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No races found for this event.</p>
                      </div>
                    ) : (
                      races.map((race) => (
                        <div key={race._id} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-3">
                                <div>
                                  <h4 className="text-lg font-semibold text-white">{race.name}</h4>
                                  <p className="text-gray-400 capitalize">{race.type.replace('_', ' ')} Race</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-400">Date & Time</p>
                                  <p className="text-white">{race.date} at {race.startTime}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                <div>
                                  <p className="text-sm text-gray-400">Route</p>
                                  <p className="text-white">{race.route.name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">Status</p>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(race.status)}`}>
                                    {race.status.charAt(0).toUpperCase() + race.status.slice(1)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">Duration</p>
                                  <p className="text-white">{race.estimatedDuration}</p>
                                </div>
                              </div>

                              {race.type === 'lap' && race.numberOfLaps && (
                                <div className="mb-3">
                                  <p className="text-sm text-gray-400">Number of Laps</p>
                                  <p className="text-white">{race.numberOfLaps}</p>
                                </div>
                              )}

                              {race.type === 'rally' && race.stages && race.stages.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-sm text-gray-400">Stages</p>
                                  <p className="text-white">{race.stages.length} stages</p>
                                </div>
                              )}

                              {race.description && (
                                <div className="mb-3">
                                  <p className="text-sm text-gray-400">Description</p>
                                  <p className="text-white">{race.description}</p>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => openEditRace(race)}
                                className="p-2 text-yellow-500 hover:text-yellow-400 hover:bg-gray-600 rounded"
                                title="Edit Race"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteRace(race._id, race.name)}
                                className="p-2 text-red-500 hover:text-red-400 hover:bg-gray-600 rounded"
                                title="Delete Race"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          {/* Results Section for this race */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="text-white font-semibold">Results</h5>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => fetchResultsForRace(selectedEvent._id, race._id)}
                                  className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded"
                                >Refresh</button>
                                <button
                                  onClick={() => setShowResultsForm(prev => ({ ...prev, [race._id]: !prev[race._id] }))}
                                  className="text-xs px-2 py-1 bg-green-600 hover:bg-green-500 rounded"
                                >
                                  {showResultsForm[race._id] ? 'View Results' : 'Add/Edit Results'}
                                </button>
                              </div>
                            </div>

                            {/* Existing Results Display */}
                            {!showResultsForm[race._id] && (
                              <div className="space-y-3">
                                {(() => {
                                  const resList = resultsByRace[race._id] || []
                                  if (resList.length === 0) {
                                    return (
                                      <div className="text-center py-4">
                                        <p className="text-gray-400">No results recorded yet for this race.</p>
                                      </div>
                                    )
                                  }
                                  
                                  // Sort results by position
                                  const sortedResults = [...resList].sort((a, b) => {
                                    if (a.position && b.position) return a.position - b.position
                                    if (a.position) return -1
                                    if (b.position) return 1
                                    return 0
                                  })

                                  return sortedResults.map((result, index) => (
                                    <div key={result._id} className="bg-gray-800 border border-gray-600 rounded p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                          <span className="text-lg font-bold text-green-400">
                                            #{result.position || 'N/A'}
                                          </span>
                                          <div>
                                            <p className="text-white font-medium">
                                              {result.user?.firstName} {result.user?.secondName}
                                            </p>
                                            {result.vehicle && (
                                              <p className="text-sm text-gray-400">
                                                {result.vehicle.make} {result.vehicle.model}
                                                {result.vehicle.year && ` (${result.vehicle.year})`}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-white font-semibold">
                                            {result.finishingTimeMs ? formatMsToTime(result.finishingTimeMs) : 'N/A'}
                                          </p>
                                          {result.score !== undefined && (
                                            <p className="text-sm text-gray-400">Score: {result.score}</p>
                                          )}
                                        </div>
                                      </div>
                                      {result.notes && (
                                        <div className="mt-2">
                                          <p className="text-sm text-gray-300 italic">"{result.notes}"</p>
                                        </div>
                                      )}
                                    </div>
                                  ))
                                })()}
                              </div>
                            )}

                            {/* Results Form */}
                            {showResultsForm[race._id] && (
                              <div className="space-y-3">
                                <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700 rounded">
                                  <p className="text-blue-300 text-sm">
                                    <strong>Instructions:</strong> Select a participant and enter their race results. 
                                    You can edit existing results or add new ones.
                                  </p>
                                </div>
                                
                                {(registrations || [])
                                  .filter(reg => reg.status === 'approved' && (reg.races || []).some(rr => rr._id === race._id))
                                  .map((reg) => {
                                    const resList = resultsByRace[race._id] || []
                                    const existing = resList.find(x => x.user && (x.user._id === reg.user._id))
                                    const draft = (draftByRace[race._id] || {})[reg.user._id] || {}
                                    const currentScore = draft.score ?? (existing?.score ?? '')
                                    const currentTime = draft.timeStr ?? (existing ? formatMsToTime(existing.finishingTimeMs || 0) : '')
                                    const currentPos = draft.position ?? (existing?.position ?? '')
                                    const currentVehId = draft.vehicleId ?? (existing?.vehicle?._id || '')
                                    
                                    return (
                                      <div key={reg._id} className="bg-gray-800 border border-gray-600 rounded p-3">
                                        <div className="flex items-center justify-between mb-3">
                                          <div>
                                            <p className="text-gray-200 font-medium">{reg.user.firstName} {reg.user.secondName}</p>
                                            {existing && (
                                              <p className="text-xs text-green-400">Existing result - Position #{existing.position}</p>
                                            )}
                                          </div>
                                          <div className="flex space-x-2">
                                            <button
                                              onClick={() => fetchResultsForRace(selectedEvent._id, race._id)}
                                              className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                                            >Load</button>
                                            {existing && (
                                              <button
                                                onClick={() => {
                                                  // Clear draft to show existing values
                                                  setDraftByRace(prev => ({
                                                    ...prev,
                                                    [race._id]: { ...(prev[race._id] || {}), [reg.user._id]: undefined }
                                                  }))
                                                }}
                                                className="text-xs px-2 py-1 bg-yellow-600 hover:bg-yellow-500 rounded"
                                              >Reset</button>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                          <div>
                                            <label className="block text-xs text-gray-400 mb-1">Position *</label>
                                            <input 
                                              type="number" 
                                              value={currentPos} 
                                              placeholder="1, 2, 3..."
                                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500" 
                                              onChange={(e) => {
                                                setDraftByRace(prev => ({
                                                  ...prev,
                                                  [race._id]: {
                                                    ...(prev[race._id] || {}),
                                                    [reg.user._id]: { ...(prev[race._id]?.[reg.user._id] || {}), position: e.target.value }
                                                  }
                                                }))
                                              }} 
                                            />
                                          </div>
                                          
                                          <div>
                                            <label className="block text-xs text-gray-400 mb-1">Time (hh:mm:ss.mmm)</label>
                                            <input 
                                              type="text" 
                                              value={currentTime} 
                                              placeholder="00:00:00.000" 
                                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500" 
                                              onChange={(e) => {
                                                setDraftByRace(prev => ({
                                                  ...prev,
                                                  [race._id]: {
                                                    ...(prev[race._id] || {}),
                                                    [reg.user._id]: { ...(prev[race._id]?.[reg.user._id] || {}), timeStr: e.target.value }
                                                  }
                                                }))
                                              }} 
                                            />
                                          </div>
                                          
                                          <div>
                                            <label className="block text-xs text-gray-400 mb-1">Score</label>
                                            <input 
                                              type="number" 
                                              value={currentScore} 
                                              placeholder="Points"
                                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500" 
                                              onChange={(e) => {
                                                setDraftByRace(prev => ({
                                                  ...prev,
                                                  [race._id]: {
                                                    ...(prev[race._id] || {}),
                                                    [reg.user._id]: { ...(prev[race._id]?.[reg.user._id] || {}), score: e.target.value }
                                                  }
                                                }))
                                              }} 
                                            />
                                          </div>
                                          
                                          <div>
                                            <label className="block text-xs text-gray-400 mb-1">Vehicle</label>
                                            <select 
                                              value={currentVehId} 
                                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:border-green-500" 
                                              onChange={(e) => {
                                                setDraftByRace(prev => ({
                                                  ...prev,
                                                  [race._id]: {
                                                    ...(prev[race._id] || {}),
                                                    [reg.user._id]: { ...(prev[race._id]?.[reg.user._id] || {}), vehicleId: e.target.value }
                                                  }
                                                }))
                                              }}
                                            >
                                              <option value="">Select vehicle</option>
                                              {(reg.vehicles || []).map(v => (
                                                <option key={v._id} value={v._id}>
                                                  {v.make} {v.model}{v.year ? ` (${v.year})` : ''}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                        </div>
                                        
                                        <div className="mt-3 flex justify-end space-x-2">
                                          <button
                                            onClick={() => {
                                              // Clear draft for this user
                                              setDraftByRace(prev => ({
                                                ...prev,
                                                [race._id]: { ...(prev[race._id] || {}), [reg.user._id]: undefined }
                                              }))
                                            }}
                                            className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
                                          >Cancel</button>
                                          <button
                                            onClick={async () => {
                                              try {
                                                await saveResult({
                                                  eventId: selectedEvent._id,
                                                  raceId: race._id,
                                                  registration: reg,
                                                  user: reg.user,
                                                  vehicle: currentVehId,
                                                  score: currentScore,
                                                  timeStr: currentTime,
                                                  position: currentPos,
                                                  notes: ''
                                                })
                                                // Clear draft for this racer
                                                setDraftByRace(prev => ({
                                                  ...prev,
                                                  [race._id]: { ...(prev[race._id] || {}), [reg.user._id]: undefined }
                                                }))
                                              } catch (e) { 
                                                showError('Error', e.message) 
                                              }
                                            }}
                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                                          >
                                            {existing ? 'Update Result' : 'Save Result'}
                                          </button>
                                        </div>
                                      </div>
                                    )
                                  })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={closeRaceModals}
                      className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Race Modal */}
          {showCreateRaceForm && selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-white">Create New Race</h2>
                    <button
                      onClick={() => setShowCreateRaceForm(false)}
                      className="text-gray-400 hover:text-white text-xl"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  <form onSubmit={handleCreateRace}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Race Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={raceFormData.name}
                          onChange={handleRaceInputChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Race Type *</label>
                        <select
                          name="type"
                          value={raceFormData.type}
                          onChange={handleRaceInputChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                          required
                        >
                          <option value="lap">Lap Racing</option>
                          <option value="rally">Rally/Endurance</option>
                          <option value="time_trial">Time Trial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Route *</label>
                        <select
                          name="route"
                          value={raceFormData.route}
                          onChange={handleRaceInputChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                          required
                        >
                          <option value="">Select a route</option>
                          {routes.map((route) => (
                            <option key={route._id} value={route._id}>{route.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Date *</label>
                          <input
                            type="date"
                            name="date"
                            value={raceFormData.date}
                            onChange={handleRaceInputChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Start Time *</label>
                          <input
                            type="time"
                            name="startTime"
                            value={raceFormData.startTime}
                            onChange={handleRaceInputChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Duration</label>
                        <input
                          type="text"
                          name="estimatedDuration"
                          value={raceFormData.estimatedDuration}
                          onChange={handleRaceInputChange}
                          placeholder="e.g., 2 hours"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                        />
                      </div>

                      {raceFormData.type === 'lap' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Number of Laps</label>
                          <input
                            type="number"
                            name="numberOfLaps"
                            value={raceFormData.numberOfLaps}
                            onChange={handleRaceInputChange}
                            min="1"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea
                          name="description"
                          value={raceFormData.description}
                          onChange={handleRaceInputChange}
                          rows="3"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowCreateRaceForm(false)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                      >
                        Create Race
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Edit Race Modal */}
          {showEditRaceModal && editRaceData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Race</h2>
                    <button
                      onClick={() => setShowEditRaceModal(false)}
                      className="text-gray-400 hover:text-white text-xl"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateRace}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Race Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={editRaceData.name}
                          onChange={handleEditRaceChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Race Type *</label>
                        <select
                          name="type"
                          value={editRaceData.type}
                          onChange={handleEditRaceChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                          required
                        >
                          <option value="lap">Lap Racing</option>
                          <option value="rally">Rally/Endurance</option>
                          <option value="time_trial">Time Trial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Route *</label>
                        <select
                          name="route"
                          value={editRaceData.route}
                          onChange={handleEditRaceChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                          required
                        >
                          <option value="">Select a route</option>
                          {routes.map((route) => (
                            <option key={route._id} value={route._id}>{route.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Date *</label>
                          <input
                            type="date"
                            name="date"
                            value={editRaceData.date}
                            onChange={handleEditRaceChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Start Time *</label>
                          <input
                            type="time"
                            name="startTime"
                            value={editRaceData.startTime}
                            onChange={handleEditRaceChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Duration</label>
                        <input
                          type="text"
                          name="estimatedDuration"
                          value={editRaceData.estimatedDuration}
                          onChange={handleEditRaceChange}
                          placeholder="e.g., 2 hours"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                        />
                      </div>

                      {editRaceData.type === 'lap' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Number of Laps</label>
                          <input
                            type="number"
                            name="numberOfLaps"
                            value={editRaceData.numberOfLaps}
                            onChange={handleEditRaceChange}
                            min="1"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea
                          name="description"
                          value={editRaceData.description}
                          onChange={handleEditRaceChange}
                          rows="3"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowEditRaceModal(false)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                      >
                        Update Race
                      </button>
                    </div>
                  </form>
                </div>
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
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openRegistrations(event)}
                        className="p-2 text-green-500 hover:text-green-400 hover:bg-gray-700 rounded"
                        title="Manage Registrations"
                      >
                        <FaUsers />
                      </button>
                      <button
                        onClick={() => openRaces(event)}
                        className="p-2 text-purple-500 hover:text-purple-400 hover:bg-gray-700 rounded"
                        title="Manage Races"
                      >
                        <FaFlag />
                      </button>
                      <button
                        onClick={() => openEdit(event)}
                        className="p-2 text-yellow-500 hover:text-yellow-400 hover:bg-gray-700 rounded"
                        title="Edit Event"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id, event.name)}
                        className="p-2 text-red-500 hover:text-red-400 hover:bg-gray-700 rounded"
                        title="Delete Event"
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