import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaMapMarkedAlt, FaExclamationTriangle } from 'react-icons/fa';
import { validateEmail } from './utils/validation';
import API_BASE_URL from './config/api';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
  });
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false,
  });
  const navigate = useNavigate();

  const validateField = (fieldName, value) => {
    let validation = { isValid: true, message: '' };

    switch (fieldName) {
      case 'email':
        validation = validateEmail(value);
        break;
      case 'password':
        if (!value || value.trim() === '') {
          validation = { isValid: false, message: 'Password is required' };
        }
        break;
      default:
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: validation.isValid ? '' : validation.message
    }));

    return validation.isValid;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setTouchedFields(prev => ({ ...prev, email: true }));
    validateField('email', value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setTouchedFields(prev => ({ ...prev, password: true }));
    validateField('password', value);
  };

  const validateAllFields = () => {
    const emailValid = validateField('email', email);
    const passwordValid = validateField('password', password);
    return emailValid && passwordValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validateAllFields()) {
      setMessage('Please fix validation errors before submitting');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        email,
        password,
      });

      setMessage(response.data.message);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      const user = response.data.user;
      
      // Role-based redirection
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/home');
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Login failed');
    }
  };

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

        {/* Login Card */}
        <div className="relative bg-gradient-to-br from-stone-900/90 to-neutral-900/80 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden border border-stone-700/50 backdrop-blur-xl">
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-600/3 opacity-50"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10 p-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-white mb-4 relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                  Welcome Back
                </span>
              </h2>
              <p className="text-stone-300 text-lg font-light">Sign in to manage your offroad adventures</p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto mt-4 rounded-full"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-stone-200 text-sm font-semibold mb-3 tracking-wide">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full px-6 py-4 bg-black/60 border rounded-2xl focus:outline-none focus:ring-2 text-white placeholder-stone-400 backdrop-blur-sm transition-all duration-300 hover:border-stone-500/70 ${
                    validationErrors.email && touchedFields.email
                      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-stone-600/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                  }`}
                  required
                />
                {validationErrors.email && touchedFields.email && (
                  <div className="mt-2 flex items-center text-red-400 text-sm">
                    <FaExclamationTriangle className="mr-2" />
                    {validationErrors.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-stone-200 text-sm font-semibold mb-3 tracking-wide">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full px-6 py-4 bg-black/60 border rounded-2xl focus:outline-none focus:ring-2 text-white placeholder-stone-400 backdrop-blur-sm transition-all duration-300 hover:border-stone-500/70 ${
                    validationErrors.password && touchedFields.password
                      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-stone-600/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                  }`}
                  required
                />
                {validationErrors.password && touchedFields.password && (
                  <div className="mt-2 flex items-center text-red-400 text-sm">
                    <FaExclamationTriangle className="mr-2" />
                    {validationErrors.password}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={Object.values(validationErrors).some(error => error !== '')}
                className={`group relative w-full py-4 px-6 rounded-2xl font-bold text-lg tracking-wide transform transition-all duration-500 shadow-[0_12px_40px_rgba(249,115,22,0.3)] overflow-hidden ${
                  !Object.values(validationErrors).some(error => error !== '')
                    ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white hover:scale-105 hover:shadow-[0_16px_50px_rgba(249,115,22,0.5)]'
                    : 'bg-stone-700 text-stone-400 cursor-not-allowed'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center"></div>
                <span className="relative z-10 flex items-center justify-center">
                  <FaSignInAlt className="mr-3" />
                  Sign In
                </span>
              </button>

              {message && (
                <div className="mt-6 p-4 bg-red-900/30 border border-red-500/50 rounded-2xl backdrop-blur-sm">
                  <p className="text-red-300 text-sm text-center font-medium">{message}</p>
                </div>
              )}

              {token && (
                <div className="mt-4 p-4 bg-stone-800/50 border border-stone-600/50 rounded-2xl backdrop-blur-sm">
                  <p className="text-stone-300 text-xs text-center break-all font-mono">
                    Token: {token}
                  </p>
                </div>
              )}
            </form>
          </div>

          <div className="relative z-10 px-10 py-6 bg-black/40 border-t border-stone-700/50 text-center backdrop-blur-sm">
            <p className="text-stone-400 text-sm mb-3">
              New to OffroadX?{' '}
              <Link to="/register" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors duration-300 hover:underline">
                <FaUserPlus className="inline mr-1" />
                Create account
              </Link>
            </p>
            <p className="text-stone-400 text-sm">
              <Link to="/forgot-password" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors duration-300 hover:underline">
                Forgot password?
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 text-center text-sm text-stone-500">
          <Link to="/privacy" className="hover:text-stone-300 mx-4 transition-colors duration-300">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-stone-300 mx-4 transition-colors duration-300">
            Terms
          </Link>
          <Link to="/contact" className="hover:text-stone-300 mx-4 transition-colors duration-300">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;