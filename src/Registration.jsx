import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { showSuccess, showError, showWarning, showInfo } from './utils/sweetAlert'
import { FaUserPlus, FaSignInAlt, FaMapMarkedAlt, FaEnvelope, FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa'
import { validateEmail, validatePhone, validateName, validatePassword, validatePasswordConfirmation, formatPhoneNumber, formatName } from './utils/validation'

const COUNTRY_CODES = [
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
]

function Registration() {
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: '',
  })

  const [otpData, setOtpData] = useState({
    otp: '',
    isOtpSent: false,
    isOtpVerified: false,
    isLoading: false,
    countdown: 0,
  })

  const [validationErrors, setValidationErrors] = useState({
    firstName: '',
    secondName: '',
    email: '',
    countryCode: '',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: '',
  })

  const [touchedFields, setTouchedFields] = useState({
    firstName: false,
    secondName: false,
    email: false,
    countryCode: false,
    phone: false,
    dob: false,
    password: false,
    confirmPassword: false,
  })

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    let processedValue = value

    // Format values based on field type
    if (name === 'phone') {
      // Remove non-digits and limit to 10 digits
      const digitsOnly = value.replace(/\D/g, '')
      processedValue = digitsOnly.slice(0, 10)
    } else if (name === 'firstName' || name === 'secondName') {
      processedValue = formatName(value)
    }

    setFormData({ ...formData, [name]: processedValue })

    // Mark field as touched
    setTouchedFields({ ...touchedFields, [name]: true })

    // Validate field
    validateField(name, processedValue)
  }

  const validateField = (fieldName, value) => {
    let validation = { isValid: true, message: '' }

    switch (fieldName) {
      case 'firstName':
        validation = validateName(value, 'First Name')
        break
      case 'secondName':
        validation = validateName(value, 'Last Name')
        break
      case 'email':
        validation = validateEmail(value)
        break
      case 'countryCode':
        if (!value) {
          validation = { isValid: false, message: 'Country code is required' }
        }
        break
      case 'phone':
        validation = validatePhone(value)
        break
      case 'dob':
        if (!value) {
          validation = { isValid: false, message: 'Date of birth is required' }
        } else {
          const dobDate = new Date(value)
          const today = new Date()
          const age = today.getFullYear() - dobDate.getFullYear()
          const monthDiff = today.getMonth() - dobDate.getMonth()
          const dayDiff = today.getDate() - dobDate.getDate()
          
          const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age
          
          if (actualAge < 18) {
            validation = { isValid: false, message: 'You must be at least 18 years old' }
          } else if (actualAge > 60) {
            validation = { isValid: false, message: 'You must be no older than 60 years old' }
          }
        }
        break
      case 'password':
        validation = validatePassword(value)
        break
      case 'confirmPassword':
        validation = validatePasswordConfirmation(formData.password, value)
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
    const fields = ['firstName', 'secondName', 'email', 'countryCode', 'phone', 'dob', 'password', 'confirmPassword']
    let allValid = true

    fields.forEach(field => {
      const isValid = validateField(field, formData[field])
      if (!isValid) allValid = false
    })

    return allValid
  }

  const handleOtpChange = (e) => {
    setOtpData({ ...otpData, otp: e.target.value })
  }

  // Send OTP to email
  const sendOTP = async () => {
    // Validate email and first name before sending OTP
    const emailValid = validateField('email', formData.email)
    const firstNameValid = validateField('firstName', formData.firstName)

    if (!emailValid || !firstNameValid) {
      showWarning('Validation Error', 'Please fix the validation errors before sending OTP')
      return
    }

    if (!formData.email || !formData.firstName) {
      showWarning('Missing Information', 'Please enter your email and first name first')
      return
    }

    setOtpData({ ...otpData, isLoading: true })

    try {
      const response = await fetch('http://localhost:5000/api/otp/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setOtpData({
          ...otpData,
          isOtpSent: true,
          isLoading: false,
          countdown: 600, // 10 minutes countdown
        })
        showSuccess('OTP Sent!', 'Please check your email for the verification code')
        startCountdown()
      } else {
        setOtpData({ ...otpData, isLoading: false })
        showError('Failed to Send OTP', data.error || 'Unable to send OTP')
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      setOtpData({ ...otpData, isLoading: false })
      showError('Server Error', 'Unable to connect to server. Please try again.')
    }
  }

  // Verify OTP
  const verifyOTP = async () => {
    if (!otpData.otp) {
      showWarning('Missing OTP', 'Please enter the OTP sent to your email')
      return
    }

    setOtpData({ ...otpData, isLoading: true })

    try {
      const response = await fetch('http://localhost:5000/api/otp/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otpData.otp,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setOtpData({
          ...otpData,
          isOtpVerified: true,
          isLoading: false,
        })
        showSuccess('Email Verified!', 'Your email has been successfully verified')
      } else {
        setOtpData({ ...otpData, isLoading: false })
        showError('Verification Failed', data.error || 'Invalid or expired OTP')
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      setOtpData({ ...otpData, isLoading: false })
      showError('Server Error', 'Unable to connect to server. Please try again.')
    }
  }

  // Resend OTP
  const resendOTP = async () => {
    setOtpData({ ...otpData, isLoading: true })

    try {
      const response = await fetch('http://localhost:5000/api/otp/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setOtpData({
          ...otpData,
          isLoading: false,
          countdown: 600, // Reset countdown
          otp: '', // Clear previous OTP
        })
        showSuccess('OTP Resent!', 'A new OTP has been sent to your email')
        startCountdown()
      } else {
        setOtpData({ ...otpData, isLoading: false })
        showError('Failed to Resend OTP', data.error || 'Unable to resend OTP')
      }
    } catch (error) {
      console.error('Error resending OTP:', error)
      setOtpData({ ...otpData, isLoading: false })
      showError('Server Error', 'Unable to connect to server. Please try again.')
    }
  }

  // Countdown timer for OTP expiry
  const startCountdown = () => {
    const timer = setInterval(() => {
      setOtpData(prev => {
        if (prev.countdown <= 1) {
          clearInterval(timer)
          return { ...prev, countdown: 0 }
        }
        return { ...prev, countdown: prev.countdown - 1 }
      })
    }, 1000)
  }

  // Format countdown time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields before submission
    if (!validateAllFields()) {
      showWarning('Validation Error', 'Please fix all validation errors before submitting')
      return
    }

    if (!otpData.isOtpVerified) {
      showWarning('Email Not Verified', 'Please verify your email with OTP first')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log('Server response:', data)

      if (response.ok) {
        showSuccess('Success!', 'Registration successful! Redirecting to login...').then(() => {
          navigate('/login')
        })
      } else {
        showError('Registration Failed', data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Error during registration:', error)
      showError('Server Error', 'Unable to connect to server. Please try again.')
    }
  }

  const handleGoogleLogin = () => {
    showInfo('Coming Soon', 'Google login not yet implemented')
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* 3D Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-500/8 to-amber-600/4 rounded-3xl transform rotate-45 animate-[float_8s_ease-in-out_infinite] blur-sm"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-tl from-orange-400/6 to-yellow-500/3 rounded-2xl transform -rotate-12 animate-[float_10s_ease-in-out_infinite_reverse] blur-sm"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-amber-500/5 to-orange-600/3 rounded-full transform animate-[float_12s_ease-in-out_infinite] blur-md"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4 group">
            <div className="relative">
              <FaMapMarkedAlt className="text-orange-500 text-4xl transform group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]" />
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
            </div>
            <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 drop-shadow-2xl tracking-tight">
              OffroadX
            </span>
          </div>
        </div>

        {/* Registration Card */}
        <div className="relative bg-gradient-to-br from-stone-900/90 to-neutral-900/80 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden border border-stone-700/50 backdrop-blur-xl">
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-600/3 opacity-50"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10 p-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-white mb-4 relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                  Create Your Account
                </span>
              </h2>
              <p className="text-stone-300 text-lg font-light mb-4">Join the offroad adventure community</p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full"></div>
              {!otpData.isOtpVerified && (
                <div className="mt-6 p-3 bg-amber-900/20 border border-amber-500/30 rounded-2xl backdrop-blur-sm">
                  <p className="text-amber-300 text-sm font-medium">
                    📧 Email verification required before registration
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-stone-200 text-sm font-semibold mb-3 tracking-wide">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className={`w-full px-6 py-4 bg-black/60 border rounded-2xl focus:outline-none focus:ring-2 text-white placeholder-stone-400 backdrop-blur-sm transition-all duration-300 hover:border-stone-500/70 ${
                      validationErrors.firstName && touchedFields.firstName
                        ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                        : 'border-stone-600/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                    }`}
                  />
                  {validationErrors.firstName && touchedFields.firstName && (
                    <div className="mt-2 flex items-center text-red-400 text-sm">
                      <FaExclamationTriangle className="mr-2" />
                      {validationErrors.firstName}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-stone-200 text-sm font-semibold mb-3 tracking-wide">Last Name</label>
                  <input
                    type="text"
                    name="secondName"
                    value={formData.secondName}
                    onChange={handleChange}
                    required
                    className={`w-full px-6 py-4 bg-black/60 border rounded-2xl focus:outline-none focus:ring-2 text-white placeholder-stone-400 backdrop-blur-sm transition-all duration-300 hover:border-stone-500/70 ${
                      validationErrors.secondName && touchedFields.secondName
                        ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                        : 'border-stone-600/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                    }`}
                  />
                  {validationErrors.secondName && touchedFields.secondName && (
                    <div className="mt-2 flex items-center text-red-400 text-sm">
                      <FaExclamationTriangle className="mr-2" />
                      {validationErrors.secondName}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-stone-200 text-sm font-semibold mb-3 tracking-wide">Email</label>
                <div className="flex gap-3">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={otpData.isOtpVerified}
                    className={`flex-1 px-6 py-4 bg-black/60 border rounded-2xl focus:outline-none focus:ring-2 text-white placeholder-stone-400 backdrop-blur-sm transition-all duration-300 hover:border-stone-500/70 ${
                      otpData.isOtpVerified ? 'opacity-50 cursor-not-allowed' : ''
                    } ${
                      validationErrors.email && touchedFields.email
                        ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                        : 'border-stone-600/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                    }`}
                  />
                  {!otpData.isOtpVerified && (
                    <button
                      type="button"
                      onClick={sendOTP}
                      disabled={otpData.isLoading || !formData.email || !formData.firstName || validationErrors.email || validationErrors.firstName}
                      className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                    >
                      {otpData.isLoading ? (
                        <FaClock className="animate-spin text-lg" />
                      ) : (
                        <FaEnvelope className="text-lg" />
                      )}
                    </button>
                  )}
                  {otpData.isOtpVerified && (
                    <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl flex items-center shadow-lg">
                      <FaCheck className="text-lg" />
                    </div>
                  )}
                </div>
                {validationErrors.email && touchedFields.email && (
                  <div className="mt-2 flex items-center text-red-400 text-sm">
                    <FaExclamationTriangle className="mr-2" />
                    {validationErrors.email}
                  </div>
                )}
              </div>

              {/* OTP Verification Section */}
              {otpData.isOtpSent && !otpData.isOtpVerified && (
                <div className="p-6 bg-stone-800/50 rounded-3xl border border-stone-600/50 backdrop-blur-sm">
                  <label className="block text-stone-200 text-sm font-semibold mb-4 tracking-wide">
                    Enter OTP sent to your email
                  </label>
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      value={otpData.otp}
                      onChange={handleOtpChange}
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      className="flex-1 px-6 py-4 bg-black/60 border border-stone-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-white placeholder-stone-400 backdrop-blur-sm transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={verifyOTP}
                      disabled={otpData.isLoading || !otpData.otp}
                      className="px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-2xl hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300 shadow-lg hover:shadow-orange-500/20"
                    >
                      {otpData.isLoading ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-400">
                      {otpData.countdown > 0 ? (
                        <>OTP expires in: <span className="text-orange-400 font-semibold">{formatTime(otpData.countdown)}</span></>
                      ) : (
                        <span className="text-red-400 font-semibold">OTP expired</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={resendOTP}
                      disabled={otpData.isLoading || otpData.countdown > 0}
                      className="text-orange-400 hover:text-orange-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors duration-300 hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}

              {otpData.isOtpVerified && (
                <div className="p-4 bg-green-900/30 border border-green-500/50 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center text-green-300">
                    <FaCheck className="mr-3 text-lg" />
                    <span className="font-semibold">Email verified successfully!</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-stone-200 text-sm font-semibold mb-3 tracking-wide">Phone Number</label>
                <div className="flex gap-3">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className={`px-6 py-4 bg-black/60 border rounded-2xl focus:outline-none focus:ring-2 text-white backdrop-blur-sm transition-all duration-300 hover:border-stone-500/70 appearance-none cursor-pointer bg-no-repeat bg-right pr-10 ${
                      validationErrors.countryCode && touchedFields.countryCode
                        ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                        : 'border-stone-600/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a1a1a1' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 1rem center'
                    }}
                  >
                    {COUNTRY_CODES.map((item) => (
                      <option key={item.code} value={item.code} className="bg-stone-900 text-white">
                        {item.flag} {item.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="1234567890"
                    maxLength="10"
                    required
                    className={`flex-1 px-6 py-4 bg-black/60 border rounded-2xl focus:outline-none focus:ring-2 text-white placeholder-stone-400 backdrop-blur-sm transition-all duration-300 hover:border-stone-500/70 ${
                      validationErrors.phone && touchedFields.phone
                        ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                        : 'border-stone-600/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                    }`}
                  />
                </div>
                <div className="mt-2">
                  {validationErrors.countryCode && touchedFields.countryCode && (
                    <div className="flex items-center text-red-400 text-sm">
                      <FaExclamationTriangle className="mr-2" />
                      {validationErrors.countryCode}
                    </div>
                  )}
                  {validationErrors.phone && touchedFields.phone && (
                    <div className="flex items-center text-red-400 text-sm">
                      <FaExclamationTriangle className="mr-2" />
                      {validationErrors.phone}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-stone-200 text-sm font-semibold mb-3 tracking-wide">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className={`w-full px-6 py-4 bg-black/60 border rounded-2xl focus:outline-none focus:ring-2 text-white placeholder-stone-400 backdrop-blur-sm transition-all duration-300 hover:border-stone-500/70 ${
                    validationErrors.dob && touchedFields.dob
                      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-stone-600/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                  }`}
                />
                {validationErrors.dob && touchedFields.dob && (
                  <div className="mt-2 flex items-center text-red-400 text-sm">
                    <FaExclamationTriangle className="mr-2" />
                    {validationErrors.dob}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-stone-200 text-sm font-semibold mb-3 tracking-wide">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-6 py-4 bg-black/60 border rounded-2xl focus:outline-none focus:ring-2 text-white placeholder-stone-400 backdrop-blur-sm transition-all duration-300 hover:border-stone-500/70 ${
                    validationErrors.password && touchedFields.password
                      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-stone-600/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                  }`}
                />
                {validationErrors.password && touchedFields.password && (
                  <div className="mt-2 flex items-center text-red-400 text-sm">
                    <FaExclamationTriangle className="mr-2" />
                    {validationErrors.password}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-stone-200 text-sm font-semibold mb-3 tracking-wide">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full px-6 py-4 bg-black/60 border rounded-2xl focus:outline-none focus:ring-2 text-white placeholder-stone-400 backdrop-blur-sm transition-all duration-300 hover:border-stone-500/70 ${
                    validationErrors.confirmPassword && touchedFields.confirmPassword
                      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-stone-600/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                  }`}
                />
                {validationErrors.confirmPassword && touchedFields.confirmPassword && (
                  <div className="mt-2 flex items-center text-red-400 text-sm">
                    <FaExclamationTriangle className="mr-2" />
                    {validationErrors.confirmPassword}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!otpData.isOtpVerified || Object.values(validationErrors).some(error => error !== '')}
                className={`group relative w-full py-4 px-6 rounded-2xl font-bold text-lg tracking-wide transform transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.3)] overflow-hidden ${
                  otpData.isOtpVerified && !Object.values(validationErrors).some(error => error !== '')
                    ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white hover:scale-105 hover:shadow-[0_16px_50px_rgba(249,115,22,0.5)]'
                    : 'bg-stone-700 text-stone-400 cursor-not-allowed'
                }`}
              >
                {otpData.isOtpVerified && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center"></div>
                  </>
                )}
                <span className="relative z-10 flex items-center justify-center">
                  <FaUserPlus className="mr-3" />
                  {otpData.isOtpVerified ? 'Create Account' : 'Verify Email First'}
                </span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-stone-400 text-sm mb-3">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-orange-400 hover:text-orange-300 font-semibold transition-colors duration-300 hover:underline"
                >
                  <FaSignInAlt className="inline mr-1" />
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 text-center text-sm text-stone-500">
          <Link to="/privacy" className="hover:text-stone-300 mx-4 transition-colors duration-300">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-stone-300 mx-4 transition-colors duration-300">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Registration