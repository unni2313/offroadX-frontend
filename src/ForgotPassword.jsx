import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaMapMarkedAlt, FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/password/forgot-password', {
        email,
      });

      setMessage(response.data.message);
      setEmailSent(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Forgot Password Card */}
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
          <div className="p-8">
            {!emailSent ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                  <p className="text-gray-400">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Reset Link...
                      </div>
                    ) : (
                      <>
                        <FaEnvelope className="inline mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-6">
                  <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                  <p className="text-gray-400 mb-4">
                    We've sent a password reset link to:
                  </p>
                  <p className="text-green-400 font-medium mb-6">{email}</p>
                  <p className="text-gray-400 text-sm">
                    The link will expire in 30 minutes. If you don't see the email, 
                    check your spam folder.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                    setMessage('');
                    setError('');
                  }}
                  className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200"
                >
                  Send to Different Email
                </button>
              </div>
            )}
          </div>

          <div className="px-8 py-4 bg-gray-900/50 border-t border-gray-700 text-center">
            <Link 
              to="/login" 
              className="text-green-500 hover:text-green-400 font-medium inline-flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <Link to="/privacy" className="hover:text-gray-300 mx-3">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-gray-300 mx-3">
            Terms
          </Link>
          <Link to="/contact" className="hover:text-gray-300 mx-3">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;