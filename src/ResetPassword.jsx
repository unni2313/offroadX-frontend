import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaMapMarkedAlt, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import API_BASE_URL from './config/api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setTokenValid(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/password/verify-reset-token/${token}`);
      setTokenValid(true);
      setUserInfo(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid or expired reset link');
      setTokenValid(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/password/reset-password`, {
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setMessage(response.data.message);
      setResetSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      setError(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while verifying token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* 3D Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-500/8 to-amber-600/4 rounded-3xl transform rotate-45 animate-[float_8s_ease-in-out_infinite] blur-sm"></div>
          <div className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-tl from-orange-400/6 to-yellow-500/3 rounded-2xl transform -rotate-12 animate-[float_10s_ease-in-out_infinite_reverse] blur-sm"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]"></div>
          <p className="text-stone-300 text-lg font-light">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* 3D Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-500/8 to-amber-600/4 rounded-3xl transform rotate-45 animate-[float_8s_ease-in-out_infinite] blur-sm"></div>
          <div className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-tl from-orange-400/6 to-yellow-500/3 rounded-2xl transform -rotate-12 animate-[float_10s_ease-in-out_infinite_reverse] blur-sm"></div>
          <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-amber-500/5 to-orange-600/3 rounded-full transform animate-[float_12s_ease-in-out_infinite] blur-md"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
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

          <div className="relative bg-gradient-to-br from-stone-900/90 to-neutral-900/80 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden border border-stone-700/50 backdrop-blur-xl">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-600/3 opacity-50"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10 p-10 text-center">
              <FaExclamationTriangle className="text-red-500 text-7xl mx-auto mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
              <h2 className="text-3xl font-black text-white mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600">
                  Invalid Reset Link
                </span>
              </h2>
              <p className="text-stone-300 text-lg mb-8 leading-relaxed">{error}</p>
              
              <div className="space-y-4">
                <Link
                  to="/forgot-password"
                  className="block w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white py-4 px-6 rounded-2xl font-bold text-lg tracking-wide transform hover:scale-105 transition-all duration-500 shadow-[0_12px_40px_rgba(249,115,22,0.3)] hover:shadow-[0_16px_50px_rgba(249,115,22,0.5)]"
                >
                  Request New Reset Link
                </Link>
                <Link
                  to="/login"
                  className="block w-full bg-stone-700 hover:bg-stone-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-stone-500/20"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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

        {/* Reset Password Card */}
        <div className="relative bg-gradient-to-br from-stone-900/90 to-neutral-900/80 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden border border-stone-700/50 backdrop-blur-xl">
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-600/3 opacity-50"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10 p-10">
            {!resetSuccess ? (
              <>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-black text-white mb-4 relative">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                      Reset Your Password
                    </span>
                  </h2>
                  <p className="text-stone-300 text-lg font-light">
                    Hi {userInfo?.firstName}, enter your new password below.
                  </p>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto mt-4 rounded-full"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-stone-200 text-sm font-semibold mb-3 tracking-wide">
                      New Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-6 top-1/2 transform -translate-y-1/2 text-stone-400 text-lg" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        className="w-full pl-14 pr-14 py-4 bg-black/60 border border-stone-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-white placeholder-stone-400 backdrop-blur-sm transition-all duration-300 hover:border-stone-500/70"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-300 transition-colors duration-300"
                      >
                        {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-200 text-sm font-semibold mb-3 tracking-wide">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-6 top-1/2 transform -translate-y-1/2 text-stone-400 text-lg" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full pl-14 pr-14 py-4 bg-black/60 border border-stone-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-white placeholder-stone-400 backdrop-blur-sm transition-all duration-300 hover:border-stone-500/70"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-6 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-300 transition-colors duration-300"
                      >
                        {showConfirmPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-2xl backdrop-blur-sm">
                      <p className="text-red-300 text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white py-4 px-6 rounded-2xl font-bold text-lg tracking-wide transform hover:scale-105 transition-all duration-500 shadow-[0_12px_40px_rgba(249,115,22,0.3)] hover:shadow-[0_16px_50px_rgba(249,115,22,0.5)] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center"></div>
                    <span className="relative z-10 flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Resetting Password...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </span>
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-6 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
                <h2 className="text-3xl font-black text-white mb-4">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
                    Password Reset Successful!
                  </span>
                </h2>
                <p className="text-stone-300 text-lg mb-6 leading-relaxed">
                  Your password has been successfully reset. You can now login with your new password.
                </p>
                <p className="text-green-400 font-semibold">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>
            )}
          </div>

          <div className="relative z-10 px-10 py-6 bg-black/40 border-t border-stone-700/50 text-center backdrop-blur-sm">
            <Link 
              to="/login" 
              className="text-orange-400 hover:text-orange-300 font-semibold transition-colors duration-300 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;