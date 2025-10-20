import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { showSuccess, showError, showWarning, showConfirm } from './utils/sweetAlert'
import { validateName, validatePhone, formatName, formatPhoneNumber } from './utils/validation'
import API_BASE_URL from './config/api'
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
  FaExclamationTriangle,
  FaClock,
  FaLocationArrow,
  FaUserFriends,
  FaRoute,
  FaTrophy,
  FaBell,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaClipboardList
} from 'react-icons/fa'
import GuidelinesModal from './components/GuidelinesModal'

/* ============================================================================
   CONSTANTS & CONFIGURATION
   ============================================================================ */

const DIFFICULTY_OPTIONS = [
  { value: 'Easy', label: 'Easy' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Hard', label: 'Hard' }
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Events' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

const RACE_TYPE_OPTIONS = [
  { value: 'lap', label: 'Lap' },
  { value: 'sprint', label: 'Sprint' },
  { value: 'time-trial', label: 'Time Trial' },
  { value: 'stages', label: 'Stages' }
]

const REGISTRATION_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
]

const STATUS_BADGE_STYLES = {
  upcoming: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
  ongoing: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
  completed: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
  cancelled: 'bg-gradient-to-r from-red-500 to-red-600 text-white'
}

const DIFFICULTY_BADGE_STYLES = {
  Easy: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
  Medium: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
  Hard: 'bg-gradient-to-r from-red-500 to-red-600 text-white'
}

const inputBaseClasses = 'w-full bg-gray-800/80 border border-gray-600/50 rounded-xl px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none transition-colors'

/* ============================================================================
   UTILITY FUNCTIONS
   ============================================================================ */

const parseTimeToMs = (timeStr) => {
  if (!timeStr) return 0
  const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2}):(\d{2})\.(\d{1,3})$/)
  if (!match) return 0
  const [_, h, m, s, ms] = match
  return Number(h) * 3600000 + Number(m) * 60000 + Number(s) * 1000 + Number(ms.padEnd(3, '0'))
}

const formatMsToTime = (ms) => {
  const sign = ms < 0 ? '-' : ''
  ms = Math.abs(ms || 0)
  const hours = Math.floor(ms / 3600000)
  ms %= 3600000
  const minutes = Math.floor(ms / 60000)
  ms %= 60000
  const seconds = Math.floor(ms / 1000)
  const millis = ms % 1000
  const pad2 = (n) => String(n).padStart(2, '0')
  const pad3 = (n) => String(n).padStart(3, '0')
  return `${sign}${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}.${pad3(millis)}`
}

const createEventFormState = (event) => {
  const e = event || {}
  return {
    name: e.name || '',
    date: e.date || '',
    time: e.time || '',
    location: e.location || '',
    maxParticipants: e.maxParticipants || '',
    difficulty: e.difficulty || 'Easy',
    duration: e.duration || '',
    description: e.description || ''
  }
}

const createRaceFormState = (race) => {
  const r = race || {}
  return {
    name: r.name || '',
    type: r.type || 'lap',
    route: r.route?._id || r.route || '',
    date: r.date || '',
    startTime: r.startTime || '',
    estimatedDuration: r.estimatedDuration || '',
    numberOfLaps: r.numberOfLaps || '',
    stages: r.stages || [],
    description: r.description || ''
  }
}

/* ============================================================================
   REUSABLE UI COMPONENTS
   ============================================================================ */

const SectionCard = ({ children, className = '' }) => (
  <div className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-sm overflow-hidden ${className}`}>
    {children}
  </div>
)

const SectionHeader = ({ children, className = '' }) => (
  <div className={`p-8 border-b border-slate-700/50 ${className}`}>{children}</div>
)

const SectionBody = ({ children, className = '' }) => (
  <div className={`p-8 ${className}`}>{children}</div>
)

const LoadingState = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-400">Loading...</p>
    </div>
  </div>
)

const ErrorBanner = ({ message }) => (
  <div className="bg-gradient-to-r from-red-900/60 to-red-800/60 border border-red-600/50 px-6 py-4 rounded-2xl mb-6 backdrop-blur-sm">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-red-500/20 rounded-xl">
        <FaExclamationTriangle className="text-red-400" />
      </div>
      <span className="font-semibold text-red-200">{message}</span>
    </div>
  </div>
)

const EmptyState = ({ title, description, icon: Icon }) => (
  <div className="text-center py-20">
    <div className="relative mb-8">
      <Icon className="text-8xl text-gray-600 mx-auto mb-6 opacity-50" />
    </div>
    <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-600 mb-6">
      {title}
    </h3>
    <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
      {description}
    </p>
  </div>
)

const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  options = null,
  error = ''
}) => (
  <label className="block text-sm text-gray-300 mb-3">
    <span className="block mb-2 font-medium">{label}</span>
    {options ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`${inputBaseClasses} appearance-none`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className={`${inputBaseClasses} ${error ? 'border-red-500' : ''}`}
      />
    )}
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </label>
)

const StatusBadge = ({ status }) => {
  const style = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.upcoming
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${style} shadow-lg`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const DifficultyBadge = ({ difficulty }) => {
  const style = DIFFICULTY_BADGE_STYLES[difficulty] || DIFFICULTY_BADGE_STYLES.Medium
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${style} shadow-lg`}>
      {difficulty}
    </span>
  )
}

/* ============================================================================
   EVENTS LIST COMPONENT
   ============================================================================ */

const EventsListHeader = ({ onCreateClick }) => (
  <div className="mb-10">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500">
            Events Management
          </span>
        </h1>
        <p className="text-slate-400 text-lg">Create and manage offroad events for your community</p>
      </div>
      <button
        onClick={onCreateClick}
        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgba(249,115,22,0.3)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.4)] transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 w-full md:w-auto justify-center"
      >
        <FaPlus className="text-xl" />
        <span>Create New Event</span>
      </button>
    </div>
  </div>
)

const EventsSearchFilter = ({ searchTerm, onSearchChange, filterStatus, onFilterChange, onClearFilters }) => (
  <SectionCard className="mb-8">
    <SectionBody>
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md w-full">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-600 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="flex-1 md:flex-none bg-slate-800/50 border border-slate-600 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {(searchTerm || filterStatus !== 'all') && (
            <button
              onClick={onClearFilters}
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-4 rounded-2xl transition-all duration-300 font-medium whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </SectionBody>
  </SectionCard>
)

const EventCard = ({ event, onView, onEdit, onDelete, onRegistrations, onRaces, onGuidelines }) => (
  <SectionCard className="group hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10">
    <SectionBody>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors duration-300 flex-1 line-clamp-2">
          {event.name}
        </h3>
        <div className="flex flex-col gap-2 ml-4 shrink-0">
          <StatusBadge status={event.status} />
          <DifficultyBadge difficulty={event.difficulty} />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-slate-300 group-hover:text-white transition-colors duration-300">
          <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/30 mr-3 shrink-0">
            <FaClock className="text-orange-400 text-sm" />
          </div>
          <span className="font-medium text-sm">{event.date} at {event.time}</span>
        </div>
        <div className="flex items-center text-slate-300 group-hover:text-white transition-colors duration-300">
          <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/30 mr-3 shrink-0">
            <FaLocationArrow className="text-orange-400 text-sm" />
          </div>
          <span className="font-medium text-sm line-clamp-1">{event.location}</span>
        </div>
        <div className="flex items-center text-slate-300 group-hover:text-white transition-colors duration-300">
          <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/30 mr-3 shrink-0">
            <FaUserFriends className="text-orange-400 text-sm" />
          </div>
          <span className="font-medium text-sm">{event.participants || 0}/{event.maxParticipants} participants</span>
        </div>
      </div>

      <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed">
        {event.description || 'No description available'}
      </p>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium">Registration Progress</span>
          <span className="font-bold">
            {Math.round(((event.participants || 0) / event.maxParticipants) * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${((event.participants || 0) / event.maxParticipants) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onView(event)}
          className="flex-1 min-w-max bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-400 text-blue-400 hover:text-blue-300 px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
          title="View Details"
        >
          <FaEye className="text-sm" />
          <span className="text-sm">View</span>
        </button>
        <button
          onClick={() => onRegistrations(event)}
          className="flex-1 min-w-max bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 hover:border-green-400 text-green-400 hover:text-green-300 px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
          title="Manage Registrations"
        >
          <FaUsers className="text-sm" />
          <span className="text-sm">Registrations</span>
        </button>
        <button
          onClick={() => onRaces(event)}
          className="flex-1 min-w-max bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 hover:border-purple-400 text-purple-400 hover:text-purple-300 px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
          title="Manage Races"
        >
          <FaTrophy className="text-sm" />
          <span className="text-sm">Races</span>
        </button>
        <button
          onClick={() => onGuidelines(event)}
          className="flex-1 min-w-max bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-400 text-indigo-400 hover:text-indigo-300 px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
          title="Manage Guidelines"
        >
          <FaFlag className="text-sm" />
          <span className="text-sm">Guidelines</span>
        </button>
        <button
          onClick={() => onEdit(event)}
          className="bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 hover:border-yellow-400 text-yellow-400 hover:text-yellow-300 px-3 py-2 rounded-xl font-medium transition-all duration-300"
          title="Edit Event"
        >
          <FaEdit className="text-sm" />
        </button>
        <button
          onClick={() => onDelete(event._id, event.name)}
          className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-400 text-red-400 hover:text-red-300 px-3 py-2 rounded-xl font-medium transition-all duration-300"
          title="Delete Event"
        >
          <FaTrash className="text-sm" />
        </button>
      </div>
    </SectionBody>
  </SectionCard>
)

/* ============================================================================
   CREATE/EDIT EVENT MODAL COMPONENT
   ============================================================================ */

const EventFormModal = ({ isOpen, event, onClose, onSubmit, title }) => {
  const [formData, setFormData] = useState(createEventFormState(event))
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (event) {
      setFormData(createEventFormState(event))
    }
  }, [event, isOpen])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    let processedValue = value
    if (name === 'name' || name === 'location') {
      processedValue = formatName(value)
    }
    setFormData((prev) => ({ ...prev, [name]: processedValue }))
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, processedValue)
  }, [])

  const validateField = (fieldName, value) => {
    let error = ''
    switch (fieldName) {
      case 'name':
        if (!value || value.trim() === '') {
          error = 'Event name is required'
        } else if (value.trim().length < 3) {
          error = 'Event name must be at least 3 characters'
        } else if (value.trim().length > 100) {
          error = 'Event name is too long (maximum 100 characters)'
        }
        break
      case 'location':
        if (!value || value.trim() === '') {
          error = 'Location is required'
        } else if (value.trim().length < 3) {
          error = 'Location must be at least 3 characters'
        } else if (value.trim().length > 200) {
          error = 'Location is too long (maximum 200 characters)'
        }
        break
      case 'maxParticipants':
        if (!value || value.trim() === '') {
          error = 'Max participants is required'
        } else if (isNaN(value) || parseInt(value) < 1) {
          error = 'Max participants must be a positive number'
        } else if (parseInt(value) > 10000) {
          error = 'Max participants cannot exceed 10,000'
        }
        break
      case 'duration':
        if (value && value.trim().length > 50) {
          error = 'Duration is too long (maximum 50 characters)'
        }
        break
    }
    setErrors((prev) => ({ ...prev, [fieldName]: error }))
    return error === ''
  }

  const validateAll = useCallback(() => {
    const fields = ['name', 'location', 'maxParticipants']
    let allValid = true
    fields.forEach((field) => {
      const isValid = validateField(field, formData[field])
      if (!isValid) allValid = false
    })
    return allValid
  }, [formData])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!validateAll()) {
        showWarning('Validation Error', 'Please fix all validation errors')
        return
      }
      if (!formData.name || !formData.date || !formData.time || !formData.location || !formData.maxParticipants) {
        showWarning('Missing Information', 'Please fill in all required fields')
        return
      }
      await onSubmit(formData)
      onClose()
    },
    [formData, validateAll, onSubmit, onClose]
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <SectionCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <SectionHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </SectionHeader>
        <SectionBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Event Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter event name"
                error={touched.name ? errors.name : ''}
              />
              <FormInput
                label="Difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                options={DIFFICULTY_OPTIONS}
              />
              <FormInput
                label="Date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                type="date"
              />
              <FormInput
                label="Time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                type="time"
              />
              <FormInput
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter event location"
                error={touched.location ? errors.location : ''}
              />
              <FormInput
                label="Max Participants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                type="number"
                placeholder="Enter max participants"
                error={touched.maxParticipants ? errors.maxParticipants : ''}
              />
              <FormInput
                label="Duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 4 hours"
              />
            </div>
            <FormInput
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter event description"
            />
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FaSave />
                Save Event
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </form>
        </SectionBody>
      </SectionCard>
    </div>
  )
}

/* ============================================================================
   PARTICIPANTS MODAL COMPONENT
   ============================================================================ */

const ParticipantsModal = ({ isOpen, event, onClose, participants, loading, error }) => {
  if (!isOpen || !event) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <SectionCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <SectionHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Participants - {event.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </SectionHeader>
        <SectionBody>
          {loading && <LoadingState />}
          {error && <ErrorBanner message={error} />}
          {!loading && !error && (
            <>
              {participants && participants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left py-3 px-4 font-semibold text-slate-300">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-300">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-300">Phone</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((participant) => (
                        <tr key={participant._id} className="border-b border-slate-700 hover:bg-slate-800/50">
                          <td className="py-3 px-4 text-white">{participant.firstName} {participant.secondName}</td>
                          <td className="py-3 px-4 text-slate-300">{participant.email}</td>
                          <td className="py-3 px-4 text-slate-300">{participant.phone}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                              <FaCheckCircle className="mr-1" />
                              Registered
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No Participants"
                  description="No participants have registered for this event yet."
                  icon={FaUsers}
                />
              )}
            </>
          )}
        </SectionBody>
      </SectionCard>
    </div>
  )
}

/* ============================================================================
   REGISTRATIONS MODAL COMPONENT
   ============================================================================ */

const RegistrationsModal = ({ isOpen, event, onClose, registrations, loading, error, onApprove, onReject, filterStatus, onFilterChange }) => {
  if (!isOpen || !event) return null

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-400" />
      case 'rejected':
        return <FaTimesCircle className="text-red-400" />
      default:
        return <FaHourglassHalf className="text-yellow-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <SectionCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <SectionHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Registrations - {event.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </SectionHeader>
        <SectionBody>
          <div className="mb-6">
            <select
              value={filterStatus}
              onChange={(e) => onFilterChange(e.target.value)}
              className="bg-slate-800/50 border border-slate-600 rounded-2xl px-4 py-2 text-white focus:outline-none focus:border-orange-500"
            >
              {REGISTRATION_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {loading && <LoadingState />}
          {error && <ErrorBanner message={error} />}
          {!loading && !error && (
            <>
              {registrations && registrations.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {registrations.map((reg) => (
                    <div key={reg._id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-semibold text-white">
                          {reg.user?.firstName} {reg.user?.secondName}
                        </p>
                        <p className="text-sm text-slate-400">{reg.user?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusIcon(reg.status)}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(reg.status)}`}>
                            {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      {reg.status === 'pending' && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => onApprove(reg._id)}
                            className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onReject(reg._id)}
                            className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Registrations"
                  description="No registrations found with the selected status."
                  icon={FaUsers}
                />
              )}
            </>
          )}
        </SectionBody>
      </SectionCard>
    </div>
  )
}

/* ============================================================================
   RACES MODAL COMPONENT
   ============================================================================ */

const RacesModal = ({ isOpen, event, onClose, races, loading, error, onViewResults }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <SectionCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <SectionHeader className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Races - {event?.name}</h2>
            <p className="text-sm text-slate-400 mt-1">Manage races for this event</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </SectionHeader>
        <SectionBody>
          {loading && <LoadingState />}
          {error && <ErrorBanner message={error} />}
          {!loading && !error && (
            <>
              {races && races.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {races.map((race) => (
                    <div key={race._id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-purple-500/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FaTrophy className="text-purple-400" />
                            {race.name}
                          </h3>
                          <p className="text-sm text-slate-400 mt-1">{race.description}</p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 capitalize">
                          {race.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Date</p>
                          <p className="text-sm font-medium text-white">{race.date ? new Date(race.date).toLocaleDateString() : '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Start Time</p>
                          <p className="text-sm font-medium text-white">{race.startTime || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Duration</p>
                          <p className="text-sm font-medium text-white">{race.estimatedDuration || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Route</p>
                          <p className="text-sm font-medium text-white">{race.route?.name || race.route || '—'}</p>
                        </div>
                      </div>
                      {race.numberOfLaps && (
                        <div className="mt-4 flex items-center gap-2">
                          <span className="text-sm text-slate-400">Laps:</span>
                          <span className="text-sm font-bold text-white bg-slate-700/50 px-3 py-1 rounded-lg">{race.numberOfLaps}</span>
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t border-slate-700/50 flex gap-2">
                        <button
                          onClick={() => onViewResults(race)}
                          className="flex-1 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                          title="View Results"
                        >
                          <FaChartLine className="text-sm" />
                          <span className="text-sm">View Results</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Races"
                  description="No races have been created for this event yet."
                  icon={FaTrophy}
                />
              )}
            </>
          )}
        </SectionBody>
      </SectionCard>
    </div>
  )
}

/* ============================================================================
   RESULTS MODAL COMPONENT
   ============================================================================ */

const ResultsModal = ({ isOpen, race, onClose, results, loading, error, onVerify, onSaveResult }) => {
  const [editingResultId, setEditingResultId] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  if (!isOpen) return null

  const unverifiedResults = results.filter(r => !r.verifiedByAdmin)
  const verifiedResults = results.filter(r => r.verifiedByAdmin)

  const handleEditStart = (result) => {
    setEditingResultId(result._id)
    setEditFormData({
      score: result.score || 0,
      position: result.position || '',
      finishingTimeMs: result.finishingTimeMs || 0,
      notes: result.notes || '',
      vehicle: result.vehicle?._id || ''
    })
  }

  const handleSaveEdit = (resultId) => {
    onSaveResult(resultId, editFormData.score, editFormData.finishingTimeMs, editFormData.position, editFormData.notes, editFormData.vehicle)
    setEditingResultId(null)
    setEditFormData({})
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <SectionCard className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <SectionHeader className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Race Results - {race?.name}</h2>
            <p className="text-sm text-slate-400 mt-1">Manage results and verify participants</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </SectionHeader>
        <SectionBody>
          {loading && <LoadingState />}
          {error && <ErrorBanner message={error} />}
          {!loading && !error && (
            <>
              {results && results.length > 0 ? (
                <div className="space-y-8">
                  {/* Unverified Participants Section */}
                  {unverifiedResults.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                        <FaExclamationTriangle className="text-amber-500" />
                        Pending Verification ({unverifiedResults.length})
                      </h3>
                      <div className="space-y-3 bg-amber-500/5 border border-amber-500/30 rounded-xl p-4">
                        {unverifiedResults.map((result) => (
                          <div key={result._id} className="bg-slate-800/70 border border-amber-500/20 rounded-lg p-4 flex justify-between items-center">
                            <div className="flex-1">
                              <p className="font-semibold text-white">
                                {result.user?.firstName} {result.user?.secondName}
                              </p>
                              <p className="text-sm text-slate-400">{result.user?.email}</p>
                              <p className="text-xs text-slate-500 mt-1">Vehicle: {result.vehicle?.make} {result.vehicle?.model}</p>
                            </div>
                            <button
                              onClick={() => onVerify(result)}
                              className="bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 hover:border-amber-400 text-amber-400 hover:text-amber-300 px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center gap-2 whitespace-nowrap"
                            >
                              <FaCheckCircle className="text-sm" />
                              <span>Verify</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verified Results Section */}
                  {verifiedResults.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                        <FaCheckCircle className="text-emerald-500" />
                        Verified Results ({verifiedResults.length})
                      </h3>
                      <div className="space-y-3 bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4">
                        {verifiedResults.map((result) => (
                          <div key={result._id} className="bg-slate-800/70 border border-emerald-500/20 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <p className="font-semibold text-white">
                                  {result.user?.firstName} {result.user?.secondName}
                                </p>
                                <p className="text-sm text-slate-400">{result.user?.email}</p>
                                <p className="text-xs text-slate-500 mt-1">Vehicle: {result.vehicle?.make} {result.vehicle?.model} ({result.vehicle?.registrationNumber})</p>
                              </div>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Verified
                              </span>
                            </div>

                            {editingResultId === result._id ? (
                              <div className="space-y-3 mt-4 pt-4 border-t border-slate-700/50">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                  <div>
                                    <label className="text-xs text-slate-400 block mb-1">Position</label>
                                    <input
                                      type="number"
                                      value={editFormData.position}
                                      onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                      placeholder="1"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-400 block mb-1">Score</label>
                                    <input
                                      type="number"
                                      value={editFormData.score}
                                      onChange={(e) => setEditFormData({ ...editFormData, score: e.target.value })}
                                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-400 block mb-1">Finishing Time (ms)</label>
                                    <input
                                      type="number"
                                      value={editFormData.finishingTimeMs}
                                      onChange={(e) => setEditFormData({ ...editFormData, finishingTimeMs: e.target.value })}
                                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-400 block mb-1">Vehicle</label>
                                    <select
                                      value={editFormData.vehicle}
                                      onChange={(e) => setEditFormData({ ...editFormData, vehicle: e.target.value })}
                                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm appearance-none"
                                    >
                                      <option value="">Select Vehicle</option>
                                      {result.registration?.vehicles?.map((v) => (
                                        <option key={v._id} value={v._id}>
                                          {v.make} {v.model} ({v.registrationNumber})
                                        </option>
                                      )) || []}
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs text-slate-400 block mb-1">Notes</label>
                                  <textarea
                                    value={editFormData.notes}
                                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                    placeholder="Add any notes..."
                                    rows="2"
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleSaveEdit(result._id)}
                                    className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
                                  >
                                    <FaSave />
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingResultId(null)}
                                    className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
                                  >
                                    <FaTimes />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3 mt-4 pt-4 border-t border-slate-700/50">
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                  <div>
                                    <p className="text-xs text-slate-500 uppercase mb-1">Position</p>
                                    <p className="text-sm font-bold text-white">{result.position || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 uppercase mb-1">Score</p>
                                    <p className="text-sm font-bold text-white">{result.score || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 uppercase mb-1">Finishing Time</p>
                                    <p className="text-sm font-bold text-white">{result.finishingTimeMs ? `${result.finishingTimeMs}ms` : '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 uppercase mb-1">Vehicle</p>
                                    <p className="text-sm font-bold text-white">{result.vehicle ? `${result.vehicle.make} ${result.vehicle.model}` : '—'}</p>
                                  </div>
                                  <div className="flex justify-end">
                                    <button
                                      onClick={() => handleEditStart(result)}
                                      className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-1"
                                    >
                                      <FaEdit className="text-xs" />
                                      Edit
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            {result.notes && (
                              <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-700/50">Notes: {result.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {unverifiedResults.length === 0 && verifiedResults.length === 0 && (
                    <EmptyState
                      title="No Results"
                      description="No participants have been registered for this race yet."
                      icon={FaTrophy}
                    />
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No Results"
                  description="No participants have been registered for this race yet."
                  icon={FaTrophy}
                />
              )}
            </>
          )}
        </SectionBody>
      </SectionCard>
    </div>
  )
}

/* ============================================================================
   PARTICIPANT VERIFICATION MODAL COMPONENT
   ============================================================================ */

const ParticipantVerificationModal = ({ isOpen, result, race, onClose, onVerify, loading }) => {
  const [checklist, setChecklist] = useState([])
  const [notes, setNotes] = useState('')

  const DEFAULT_GUIDELINE_ITEMS = [
    { item: 'Valid Driver License', checked: false },
    { item: 'Medical Clearance', checked: false },
    { item: 'Vehicle Safety Check', checked: false },
    { item: 'Safety Equipment Complete', checked: false },
    { item: 'Registration Complete', checked: false }
  ]

  useEffect(() => {
    if (result) {
      // Load checklist from result if it exists and has items, otherwise use defaults
      if (result.guidelineChecklist && result.guidelineChecklist.length > 0) {
        // Create a deep copy to avoid state mutation
        setChecklist(result.guidelineChecklist.map(item => ({ ...item })))
      } else {
        // Use fresh copy of defaults
        setChecklist(DEFAULT_GUIDELINE_ITEMS.map(item => ({ ...item })))
      }
      // Load verification notes from result if already verified
      setNotes(result.verificationNotes || '')
    }
  }, [result])

  if (!isOpen || !result) return null

  const handleChecklistChange = (index) => {
    const updated = [...checklist]
    updated[index].checked = !updated[index].checked
    setChecklist(updated)
  }

  const handleSubmit = () => {
    if (checklist.filter(c => c.checked).length === 0) {
      showWarning('Warning!', 'Please check at least one guideline item')
      return
    }
    onVerify(result._id, checklist, notes)
  }

  const checkedCount = checklist.filter(c => c.checked).length
  const totalCount = checklist.length

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      {/* Modal container with max height and scrolling */}
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-600/50 scrollbar-track-slate-700/20 rounded-2xl">
        <SectionCard className="w-full shadow-2xl">
          <div className="sticky top-0 z-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-t-2xl border-b border-slate-700/50">
            <SectionHeader className="flex justify-between items-center py-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
                  Verify Participant
                </h2>
                <p className="text-xs md:text-sm text-slate-400 mt-2 line-clamp-1">{race?.name}</p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-all duration-300 hover:bg-slate-700/50 p-2 rounded-lg flex-shrink-0"
              >
                <FaTimes className="text-xl" />
              </button>
            </SectionHeader>
          </div>
          <SectionBody className="space-y-6">
            {/* Participant Info Card */}
            <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border border-emerald-500/30 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">Participant Details</p>
                  <p className="font-bold text-xl text-white mb-2">
                    {result.user?.firstName} {result.user?.secondName}
                  </p>
                  <p className="text-sm text-slate-400 mb-1 flex items-center gap-2">
                    <span className="inline-block w-1 h-1 bg-emerald-400 rounded-full"></span>
                    {result.user?.email}
                  </p>
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <span className="inline-block w-1 h-1 bg-emerald-400 rounded-full"></span>
                    Vehicle: <span className="font-medium text-emerald-300">{result.vehicle?.make} {result.vehicle?.model}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase mb-2">Verification Status</p>
                  {result.verifiedByAdmin ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <FaCheckCircle className="mr-2 text-xs" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <FaExclamationTriangle className="mr-2 text-xs" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Metadata (if already verified) */}
            {result.verifiedByAdmin && (
              <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-500/40 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30 mt-0.5">
                    <FaCheckCircle className="text-emerald-400 text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">Already Verified</p>
                    <p className="text-sm text-slate-300">
                      Verified on <span className="font-semibold text-emerald-300">{new Date(result.verifiedAt).toLocaleString()}</span>
                    </p>
                    {result.verificationNotes && (
                      <p className="text-xs text-slate-400 mt-2 italic">"{result.verificationNotes}"</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Guideline Checklist */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                    <FaFlag className="text-emerald-400" />
                  </div>
                  Pre-Verification Checklist
                </h3>
                <div className="text-sm font-semibold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                  <span className="text-emerald-400">{checkedCount}</span>
                  <span className="text-slate-400">/{totalCount}</span>
                </div>
              </div>
              
              {/* Scrollable Checklist Container */}
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-2 border-emerald-500/20 rounded-2xl overflow-hidden shadow-lg">
                {/* Header with item count */}
                <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900/40 px-6 py-3 border-b border-emerald-500/10">
                  <p className="text-xs font-semibold text-emerald-300 uppercase tracking-widest">
                    ✓ Complete all items to verify
                  </p>
                </div>
                
                {/* Scrollable checklist items */}
                <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-600/50 scrollbar-track-slate-700/20 p-4 space-y-2">
                  <style>{`
                    @keyframes checkboxBounce {
                      0% { transform: scale(0.8); }
                      50% { transform: scale(1.15); }
                      100% { transform: scale(1); }
                    }
                    @keyframes checkboxGlow {
                      0%, 100% { box-shadow: 0 0 8px rgba(16, 185, 129, 0.4), 0 0 20px rgba(16, 185, 129, 0.2); }
                      50% { box-shadow: 0 0 12px rgba(16, 185, 129, 0.6), 0 0 30px rgba(16, 185, 129, 0.3); }
                    }
                    .checkbox-checked {
                      animation: checkboxBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 1;
                    }
                    .checkbox-glow {
                      animation: checkboxGlow 2s ease-in-out infinite;
                    }
                  `}</style>
                  {checklist.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => !result.verifiedByAdmin && handleChecklistChange(index)}
                      className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 border-2 ${
                        result.verifiedByAdmin ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                      } ${
                        item.checked
                          ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                          : `${result.verifiedByAdmin ? 'bg-slate-700/30' : 'bg-slate-700/20 hover:border-emerald-500/30 hover:shadow-sm hover:shadow-emerald-500/10'} border-slate-600/30`
                      }`}
                    >
                      <div className={`relative w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        item.checked
                          ? 'checkbox-checked checkbox-glow bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 border-emerald-300 shadow-lg'
                          : 'border-slate-400 bg-slate-700/40 backdrop-blur-sm'
                      }`}>
                        {item.checked && (
                          <div className="flex items-center justify-center animate-pulse">
                            <FaCheckCircle className="text-white text-sm drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                      <span className={`font-semibold transition-colors ${item.checked ? 'text-emerald-200' : 'text-slate-300'}`}>
                        {item.item}
                      </span>
                      {item.checked && (
                        <div className="ml-auto">
                          <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/40 to-emerald-600/30 text-emerald-200 font-semibold border border-emerald-400/50 shadow-lg shadow-emerald-500/20">
                            ✓ Verified
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  Verification Progress
                </span>
                <span className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">{Math.round((checkedCount / totalCount) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden border border-slate-600/50 shadow-inner">
                <div
                  className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500 shadow-lg shadow-emerald-500/30"
                  style={{ width: `${(checkedCount / totalCount) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                <span className="text-emerald-300 font-medium">{checkedCount}</span> of <span className="text-emerald-300 font-medium">{totalCount}</span> items verified
              </p>
            </div>

            {/* Verification Notes */}
            <div>
              <label className="block text-sm text-slate-300 mb-3 font-semibold">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                    <FaClipboardList className="text-emerald-400 text-sm" />
                  </div>
                  Verification Notes
                  <span className="text-xs text-slate-500 font-normal ml-2">(Optional)</span>
                </div>
              </label>
              <textarea
                value={notes}
                onChange={(e) => !result.verifiedByAdmin && setNotes(e.target.value)}
                readOnly={result.verifiedByAdmin}
                className={`w-full bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-300 resize-none ${
                  result.verifiedByAdmin ? 'cursor-not-allowed opacity-60' : 'hover:border-slate-600'
                }`}
                placeholder="Add any additional notes about this verification..."
                rows="3"
              />
            </div>

            {/* Action Buttons */}
            <div className={`flex gap-3 pt-6 border-t border-slate-700/50 ${result.verifiedByAdmin ? 'justify-end' : ''}`}>
              {!result.verifiedByAdmin && (
                <button
                  onClick={handleSubmit}
                  disabled={loading || checkedCount === 0}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-white border border-emerald-500/30 ${
                    loading || checkedCount === 0
                      ? 'bg-slate-600 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transform hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-200/50 border-t-emerald-200 rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="text-lg" />
                      <span>Verify Participant</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-white border border-slate-600/50 hover:border-slate-500 ${
                  result.verifiedByAdmin 
                    ? 'flex-1 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-700' 
                    : 'flex-1 bg-slate-700/60 hover:bg-slate-600/80'
                }`}
              >
                <FaTimes className="text-lg" />
                <span>{result.verifiedByAdmin ? 'Close' : 'Cancel'}</span>
              </button>
            </div>
          </SectionBody>
        </SectionCard>
      </div>
    </div>
  )
}

/* ============================================================================
   MAIN EVENTS COMPONENT
   ============================================================================ */

function Events() {
  const navigate = useNavigate()
  const token = useMemo(() => localStorage.getItem('token'), [])

  // User State
  const [user, setUser] = useState(null)

  // Events State
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Search/Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Modal States
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false)
  const [showRacesModal, setShowRacesModal] = useState(false)
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [showParticipantVerificationModal, setShowParticipantVerificationModal] = useState(false)
  const [guidelinesLoading, setGuidelinesLoading] = useState(false)

  // Selected Event/Item
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [editData, setEditData] = useState(null)
  const [selectedRace, setSelectedRace] = useState(null)
  const [selectedResult, setSelectedResult] = useState(null)

  // Participants Data
  const [participants, setParticipants] = useState([])
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [participantsError, setParticipantsError] = useState(null)

  // Registrations Data
  const [registrations, setRegistrations] = useState([])
  const [registrationsLoading, setRegistrationsLoading] = useState(false)
  const [registrationsError, setRegistrationsError] = useState(null)
  const [registrationFilter, setRegistrationFilter] = useState('pending')

  // Races Data
  const [races, setRaces] = useState([])
  const [racesLoading, setRacesLoading] = useState(false)
  const [racesError, setRacesError] = useState(null)
  const [resultsByRace, setResultsByRace] = useState({})
  const [routes, setRoutes] = useState([])
  const [routesLoading, setRoutesLoading] = useState(false)

  // Results Data
  const [results, setResults] = useState([])
  const [resultsLoading, setResultsLoading] = useState(false)
  const [resultsError, setResultsError] = useState(null)
  const [guidelineChecklist, setGuidelineChecklist] = useState([])
  const [verificationNotes, setVerificationNotes] = useState('')

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterStatus === 'all' || event.status === filterStatus
      return matchesSearch && matchesFilter
    })
  }, [events, searchTerm, filterStatus])

  // ========== AUTH EFFECTS ==========
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      navigate('/login')
    } else {
      setUser(JSON.parse(userData))
    }
  }, [navigate, token])

  // ========== FETCH FUNCTIONS ==========
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/api/events`)
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchParticipants = useCallback(async (eventId) => {
    try {
      setParticipantsLoading(true)
      setParticipantsError(null)
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
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
  }, [token])

  const fetchRegistrations = useCallback(async (eventId, status = null) => {
    try {
      setRegistrationsLoading(true)
      setRegistrationsError(null)
      const url = status
        ? `${API_BASE_URL}/api/events/${eventId}/registrations?status=${status}`
        : `${API_BASE_URL}/api/events/${eventId}/registrations`
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
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
  }, [token])

  const fetchRaces = useCallback(async (eventId) => {
    try {
      setRacesLoading(true)
      setRacesError(null)
      const response = await fetch(`${API_BASE_URL}/api/races/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
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
  }, [token])

  const fetchRoutes = useCallback(async () => {
    try {
      setRoutesLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/routes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch routes')
      setRoutes(Array.isArray(data) ? data : (data.routes || []))
    } catch (err) {
      console.error(err)
      showError('Error!', 'Failed to load routes.')
    } finally {
      setRoutesLoading(false)
    }
  }, [token])

  const fetchResults = useCallback(async (raceId) => {
    try {
      setResultsLoading(true)
      setResultsError(null)
      const response = await fetch(`${API_BASE_URL}/api/races/${raceId}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Check response status first before parsing
      if (!response.ok) {
        // Try to get error message from JSON response
        let errorMsg = 'Failed to fetch results'
        try {
          const errorData = await response.json()
          errorMsg = errorData.error || errorMsg
        } catch (e) {
          // Response wasn't JSON, use status text
          errorMsg = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMsg)
      }
      
      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      console.error('Error fetching results:', err)
      setResultsError(err.message || 'Failed to load results')
    } finally {
      setResultsLoading(false)
    }
  }, [token])

  // ========== EVENT HANDLERS ==========
  const handleCreateEvent = useCallback(async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Error creating event')
      showSuccess('Success!', 'Event created successfully!')
      fetchEvents()
      setShowCreateForm(false)
    } catch (err) {
      console.error(err)
      showError('Error!', 'Failed to create event. Please try again.')
    }
  }, [token, fetchEvents])

  const handleEditEvent = useCallback(async (formData) => {
    if (!selectedEvent) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${selectedEvent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to update event')
      showSuccess('Updated!', 'Event updated successfully.')
      fetchEvents()
      setShowEditModal(false)
    } catch (err) {
      console.error(err)
      showError('Error', err.message || 'Failed to update event')
    }
  }, [selectedEvent, token, fetchEvents])

  const handleDeleteEvent = useCallback(async (eventId, eventName) => {
    const result = await showConfirm(
      'Delete Event',
      `Are you sure you want to delete "${eventName}"? This action cannot be undone.`,
      'Yes, delete it!',
      'Cancel'
    )
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to delete event')
        }
        showSuccess('Deleted!', 'Event has been deleted successfully.')
        fetchEvents()
      } catch (error) {
        showError('Error!', 'Failed to delete event. Please try again.')
      }
    }
  }, [token, fetchEvents])

  const handleApproveRegistration = useCallback(async (registrationId) => {
    const result = await showConfirm(
      'Approve Registration',
      'Are you sure you want to approve this registration?',
      'Yes, approve',
      'Cancel'
    )
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/events/registrations/${registrationId}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ reviewNotes: 'Approved by admin' })
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to approve registration')
        }
        showSuccess('Approved!', 'Registration has been approved successfully.')
        if (selectedEvent) {
          fetchRegistrations(selectedEvent._id, registrationFilter)
          fetchParticipants(selectedEvent._id)
        }
        fetchEvents()
      } catch (error) {
        console.error('Error approving registration:', error)
        showError('Error!', error.message || 'Failed to approve registration.')
      }
    }
  }, [token, selectedEvent, registrationFilter, fetchRegistrations, fetchParticipants, fetchEvents])

  const handleRejectRegistration = useCallback(async (registrationId) => {
    const result = await showConfirm(
      'Reject Registration',
      'Are you sure you want to reject this registration?',
      'Yes, reject',
      'Cancel'
    )
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/events/registrations/${registrationId}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ reviewNotes: 'Rejected by admin' })
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to reject registration')
        }
        showSuccess('Rejected!', 'Registration has been rejected.')
        if (selectedEvent) {
          fetchRegistrations(selectedEvent._id, registrationFilter)
        }
      } catch (error) {
        console.error('Error rejecting registration:', error)
        showError('Error!', error.message || 'Failed to reject registration.')
      }
    }
  }, [token, selectedEvent, registrationFilter, fetchRegistrations])

  // ========== MODAL HANDLERS ==========
  const handleOpenView = useCallback((event) => {
    setSelectedEvent(event)
    setShowViewModal(true)
    fetchParticipants(event._id)
  }, [fetchParticipants])

  const handleOpenEdit = useCallback((event) => {
    setSelectedEvent(event)
    setEditData(createEventFormState(event))
    setShowEditModal(true)
  }, [])

  const handleOpenRegistrations = useCallback((event) => {
    setSelectedEvent(event)
    setShowRegistrationsModal(true)
    fetchRegistrations(event._id, registrationFilter)
  }, [registrationFilter, fetchRegistrations])

  const handleOpenRaces = useCallback((event) => {
    setSelectedEvent(event)
    setShowRacesModal(true)
    fetchRaces(event._id)
    fetchRoutes()
    fetchRegistrations(event._id)
  }, [fetchRaces, fetchRoutes, fetchRegistrations])

  const handleOpenGuidelines = useCallback((event) => {
    setSelectedEvent(event)
    setShowGuidelinesModal(true)
  }, [])

  const handleUpdateGuidelines = useCallback(async (eventId, payload) => {
    try {
      setGuidelinesLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/guidelines`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update event guidelines')
      }

      showSuccess('Guidelines Updated', 'Event guidelines have been saved successfully.')

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId ? { ...event, guidelines: data?.event?.guidelines || payload } : event
        )
      )
    } catch (error) {
      console.error('Error updating guidelines:', error)
      showError('Error!', error.message || 'Failed to update event guidelines. Please try again.')
      throw error
    } finally {
      setGuidelinesLoading(false)
    }
  }, [token])

  const handleOpenVerification = useCallback((event) => {
    setSelectedEvent(event)
    setShowVerificationModal(true)
  }, [])

  const handleOpenResults = useCallback((race) => {
    setSelectedRace(race)
    setShowResultsModal(true)
    fetchResults(race._id)
  }, [fetchResults])

  const handleVerifyParticipant = useCallback(async (resultId, checklist, notes) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/races/${selectedRace._id}/verify-participant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          resultId,
          guidelineChecklist: checklist,
          verificationNotes: notes
        })
      })
      
      if (!response.ok) {
        let errorMsg = 'Failed to verify participant'
        try {
          const errorData = await response.json()
          errorMsg = errorData.error || errorMsg
        } catch (e) {
          errorMsg = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMsg)
      }
      
      const data = await response.json()
      showSuccess('Success!', 'Participant verified successfully!')
      fetchResults(selectedRace._id)
      setShowParticipantVerificationModal(false)
      setSelectedResult(null)
      setGuidelineChecklist([])
      setVerificationNotes('')
    } catch (err) {
      console.error('Error verifying participant:', err)
      showError('Error!', err.message || 'Failed to verify participant')
    }
  }, [token, selectedRace, fetchResults])

  const handleSaveResult = useCallback(async (resultId, score, finishingTimeMs, position, notes, vehicle) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/races/${selectedRace._id}/add-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          resultId,
          score: Number(score) || 0,
          finishingTimeMs: Number(finishingTimeMs) || 0,
          position: Number(position) || null,
          notes: notes || '',
          vehicle: vehicle || null
        })
      })
      
      if (!response.ok) {
        let errorMsg = 'Failed to save result'
        try {
          const errorData = await response.json()
          errorMsg = errorData.error || errorMsg
        } catch (e) {
          errorMsg = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMsg)
      }
      
      const data = await response.json()
      showSuccess('Success!', 'Result saved successfully!')
      fetchResults(selectedRace._id)
    } catch (err) {
      console.error('Error saving result:', err)
      showError('Error!', err.message || 'Failed to save result')
    }
  }, [token, selectedRace, fetchResults])

  const closeAllModals = useCallback(() => {
    setShowCreateForm(false)
    setShowEditModal(false)
    setShowViewModal(false)
    setShowRegistrationsModal(false)
    setShowRacesModal(false)
    setShowGuidelinesModal(false)
    setShowVerificationModal(false)
    setShowResultsModal(false)
    setShowParticipantVerificationModal(false)
    setSelectedEvent(null)
    setSelectedRace(null)
    setSelectedResult(null)
    setEditData(null)
    setGuidelineChecklist([])
    setVerificationNotes('')
  }, [])

  // ========== INITIAL LOAD ==========
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      {/* Navigation Header */}
      

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <EventsListHeader onCreateClick={() => setShowCreateForm(true)} />

        {/* Search and Filter */}
        <EventsSearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          onClearFilters={() => {
            setSearchTerm('')
            setFilterStatus('all')
          }}
        />

        {/* Loading State */}
        {loading && <LoadingState />}

        {/* Error State */}
        {error && <ErrorBanner message={error} />}

        {/* Events Grid */}
        {!loading && !error && (
          <>
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    onView={handleOpenView}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteEvent}
                    onRegistrations={handleOpenRegistrations}
                    onRaces={handleOpenRaces}
                    onGuidelines={handleOpenGuidelines}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Events Found"
                description={
                  searchTerm || filterStatus !== 'all'
                    ? 'No events match your search criteria. Try adjusting your filters.'
                    : 'No events have been created yet. Click "Create New Event" to get started.'
                }
                icon={FaCalendarAlt}
              />
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      <EventFormModal
        isOpen={showCreateForm}
        event={null}
        title="Create New Event"
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateEvent}
      />

      <EventFormModal
        isOpen={showEditModal}
        event={selectedEvent}
        title="Edit Event"
        onClose={() => {
          setShowEditModal(false)
          setSelectedEvent(null)
        }}
        onSubmit={handleEditEvent}
      />

      <ParticipantsModal
        isOpen={showViewModal}
        event={selectedEvent}
        onClose={() => {
          setShowViewModal(false)
          setSelectedEvent(null)
        }}
        participants={participants}
        loading={participantsLoading}
        error={participantsError}
      />

      <RegistrationsModal
        isOpen={showRegistrationsModal}
        event={selectedEvent}
        onClose={() => {
          setShowRegistrationsModal(false)
          setSelectedEvent(null)
        }}
        registrations={registrations}
        loading={registrationsLoading}
        error={registrationsError}
        onApprove={handleApproveRegistration}
        onReject={handleRejectRegistration}
        filterStatus={registrationFilter}
        onFilterChange={(status) => {
          setRegistrationFilter(status)
          if (selectedEvent) {
            fetchRegistrations(selectedEvent._id, status)
          }
        }}
      />

      <RacesModal
        isOpen={showRacesModal}
        event={selectedEvent}
        onClose={() => {
          setShowRacesModal(false)
          setSelectedEvent(null)
        }}
        races={races}
        loading={racesLoading}
        error={racesError}
        onViewResults={handleOpenResults}
      />

      <GuidelinesModal
        isOpen={showGuidelinesModal}
        event={selectedEvent}
        onClose={() => {
          setShowGuidelinesModal(false)
          setSelectedEvent(null)
        }}
        onSave={handleUpdateGuidelines}
        loading={guidelinesLoading}
      />

      <ResultsModal
        isOpen={showResultsModal}
        race={selectedRace}
        onClose={() => {
          setShowResultsModal(false)
          setSelectedRace(null)
        }}
        results={results}
        loading={resultsLoading}
        error={resultsError}
        onVerify={(result) => {
          setSelectedResult(result)
          setShowParticipantVerificationModal(true)
        }}
        onSaveResult={handleSaveResult}
      />

      <ParticipantVerificationModal
        isOpen={showParticipantVerificationModal}
        result={selectedResult}
        race={selectedRace}
        onClose={() => {
          setShowParticipantVerificationModal(false)
          setSelectedResult(null)
        }}
        onVerify={handleVerifyParticipant}
        loading={resultsLoading}
      />
    </div>
  )
}

export default Events