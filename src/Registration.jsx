import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { showSuccess, showError, showWarning, showInfo } from './utils/sweetAlert'
import { FaUserPlus, FaSignInAlt, FaMapMarkedAlt, FaEnvelope, FaCheck, FaClock } from 'react-icons/fa'

function Registration() {
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    email: '',
    phone: '',
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

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleOtpChange = (e) => {
    setOtpData({ ...otpData, otp: e.target.value })
  }

  // Send OTP to email
  const sendOTP = async () => {
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

    if (formData.password !== formData.confirmPassword) {
      showWarning('Password Mismatch', 'Passwords do not match')
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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <FaMapMarkedAlt className="text-green-500 text-3xl" />
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
              OffroadX
            </span>
          </div>
        </div>

        {/* Registration Card */}
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
              <p className="text-gray-400">Join the offroad adventure community</p>
              {!otpData.isOtpVerified && (
                <p className="text-sm text-yellow-400 mt-2">
                  📧 Email verification required before registration
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    name="secondName"
                    value={formData.secondName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={otpData.isOtpVerified}
                    className={`flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 ${
                      otpData.isOtpVerified ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  {!otpData.isOtpVerified && (
                    <button
                      type="button"
                      onClick={sendOTP}
                      disabled={otpData.isLoading || !formData.email || !formData.firstName}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {otpData.isLoading ? (
                        <FaClock className="animate-spin" />
                      ) : (
                        <FaEnvelope />
                      )}
                    </button>
                  )}
                  {otpData.isOtpVerified && (
                    <div className="px-4 py-3 bg-green-600 text-white rounded-lg flex items-center">
                      <FaCheck />
                    </div>
                  )}
                </div>
              </div>

              {/* OTP Verification Section */}
              {otpData.isOtpSent && !otpData.isOtpVerified && (
                <div className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Enter OTP sent to your email
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={otpData.otp}
                      onChange={handleOtpChange}
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={verifyOTP}
                      disabled={otpData.isLoading || !otpData.otp}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {otpData.isLoading ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">
                      {otpData.countdown > 0 ? (
                        <>OTP expires in: <span className="text-orange-400">{formatTime(otpData.countdown)}</span></>
                      ) : (
                        <span className="text-red-400">OTP expired</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={resendOTP}
                      disabled={otpData.isLoading || otpData.countdown > 0}
                      className="text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}

              {otpData.isOtpVerified && (
                <div className="mb-4 p-3 bg-green-900 border border-green-600 rounded-lg">
                  <div className="flex items-center text-green-300">
                    <FaCheck className="mr-2" />
                    <span className="text-sm">Email verified successfully!</span>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={!otpData.isOtpVerified}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all shadow-lg flex items-center justify-center ${
                  otpData.isOtpVerified
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-500 hover:to-green-600 hover:shadow-green-500/20'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FaUserPlus className="mr-2" />
                {otpData.isOtpVerified ? 'Register' : 'Verify Email First'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-green-500 hover:text-green-400 flex items-center justify-center"
              >
                <FaSignInAlt className="mr-1" />
                Login here
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <Link to="/privacy" className="hover:text-gray-300 mx-3">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-gray-300 mx-3">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Registration