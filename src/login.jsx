import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaMapMarkedAlt } from 'react-icons/fa';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
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

        {/* Login Card */}
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
                Welcome Back
              </span>
            </h2>
            <p className="text-gray-400 text-center mb-6">Sign in to manage your offroad adventures</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-medium hover:from-green-500 hover:to-green-600 transition-all shadow-lg hover:shadow-green-500/20"
              >
                <FaSignInAlt className="inline mr-2" />
                Login
              </button>

              {message && (
                <p className="mt-4 text-center text-sm text-red-400 bg-red-900/30 p-2 rounded-lg">
                  {message}
                </p>
              )}

              {token && (
                <p className="mt-2 text-center text-xs text-gray-400 break-all bg-gray-700 p-2 rounded">
                  Token: {token}
                </p>
              )}
            </form>
          </div>

          <div className="px-8 py-4 bg-gray-900/50 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm">
              New to OffroadX?{' '}
              <Link to="/register" className="text-green-500 hover:text-green-400 font-medium">
                <FaUserPlus className="inline mr-1" />
                Create account
              </Link>
            </p>
            <p className="text-gray-400 text-sm">
              <Link to="/forgot-password" className="text-green-500 hover:text-green-400 font-medium">
                Forgot password?
              </Link>
            </p>
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

export default LoginForm;