import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaMapMarkedAlt, 
  FaUser, 
  FaSignOutAlt, 
  FaCalendarAlt, 
  FaRoute, 
  FaTrophy, 
  FaUsers, 
  FaBell,
  FaEdit,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaUserTag,
  FaHistory,
  FaArrowLeft
} from 'react-icons/fa';

function Profile() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchProfileData();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        setError('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Error fetching profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-900 text-red-300';
      case 'user':
        return 'bg-green-900 text-green-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p className="text-xl mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Retry
          </button>
        </div>
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
                <FaArrowLeft className="text-sm" />
                <span>Back to Home</span>
              </Link>
              <Link to="/events" className="text-gray-300 hover:text-green-400 transition flex items-center space-x-1">
                <FaCalendarAlt className="text-sm" />
                <span>Events</span>
              </Link>
              <Link to="/routes" className="text-gray-300 hover:text-green-400 transition flex items-center space-x-1">
                <FaRoute className="text-sm" />
                <span>Routes</span>
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
        {/* Profile Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10 flex items-center space-x-6">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaUser className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {profileData?.firstName} {profileData?.secondName}
                </h1>
                <p className="text-green-100 text-lg mb-2">
                  {profileData?.email}
                </p>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profileData?.role)}`}>
                    {profileData?.role?.toUpperCase()}
                  </span>
                  <span className={`flex items-center space-x-1 ${profileData?.isEmailVerified ? 'text-green-300' : 'text-red-300'}`}>
                    {profileData?.isEmailVerified ? <FaCheckCircle /> : <FaTimesCircle />}
                    <span className="text-sm">
                      {profileData?.isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 text-6xl opacity-20">👤</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <FaUser className="text-green-500" />
                  <span>Personal Information</span>
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                    <div className="bg-gray-900 rounded-lg p-3 text-white">
                      {profileData?.firstName || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                    <div className="bg-gray-900 rounded-lg p-3 text-white">
                      {profileData?.secondName || 'N/A'}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center space-x-1">
                    <FaEnvelope className="text-sm" />
                    <span>Email Address</span>
                  </label>
                  <div className="bg-gray-900 rounded-lg p-3 text-white">
                    {profileData?.email || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center space-x-1">
                    <FaPhone className="text-sm" />
                    <span>Phone Number</span>
                  </label>
                  <div className="bg-gray-900 rounded-lg p-3 text-white">
                    {profileData?.phone || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <FaShieldAlt className="text-blue-500" />
                  <span>Account Information</span>
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center space-x-1">
                      <FaUserTag className="text-sm" />
                      <span>Account Role</span>
                    </label>
                    <div className={`rounded-lg p-3 ${getRoleColor(profileData?.role)}`}>
                      {profileData?.role?.toUpperCase() || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Verification</label>
                    <div className={`rounded-lg p-3 flex items-center space-x-2 ${
                      profileData?.isEmailVerified ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {profileData?.isEmailVerified ? <FaCheckCircle /> : <FaTimesCircle />}
                      <span>{profileData?.isEmailVerified ? 'Verified' : 'Not Verified'}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Account Created</label>
                    <div className="bg-gray-900 rounded-lg p-3 text-white">
                      {formatDate(profileData?.createdAt)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Last Updated</label>
                    <div className="bg-gray-900 rounded-lg p-3 text-white">
                      {formatDate(profileData?.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <FaShieldAlt className="text-red-500" />
                  <span>Security Status</span>
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Failed Login Attempts</label>
                    <div className={`rounded-lg p-3 ${
                      (profileData?.failedLoginAttempts || 0) > 0 ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'
                    }`}>
                      {profileData?.failedLoginAttempts || 0}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Account Status</label>
                    <div className={`rounded-lg p-3 flex items-center space-x-2 ${
                      profileData?.isBlocked ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'
                    }`}>
                      {profileData?.isBlocked ? <FaTimesCircle /> : <FaCheckCircle />}
                      <span>{profileData?.isBlocked ? 'Blocked' : 'Active'}</span>
                    </div>
                  </div>
                </div>
                {profileData?.isBlocked && profileData?.blockExpiry && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Block Expires</label>
                    <div className="bg-red-900 text-red-300 rounded-lg p-3">
                      {formatDate(profileData.blockExpiry)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Participation */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FaCalendarAlt className="text-green-400" />
                <span>Event Participation</span>
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {profileData?.eventParticipations?.length || 0}
                </div>
                <p className="text-gray-400 text-sm">Events Joined</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FaEdit className="text-purple-400" />
                <span>Quick Actions</span>
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2">
                  <FaEdit />
                  <span>Edit Profile</span>
                </button>
                <Link 
                  to="/events" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2"
                >
                  <FaCalendarAlt />
                  <span>Browse Events</span>
                </Link>
                <Link 
                  to="/home" 
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2"
                >
                  <FaArrowLeft />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>

            {/* Account Summary */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FaHistory className="text-yellow-400" />
                <span>Account Summary</span>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white">
                    {profileData?.createdAt ? new Date(profileData.createdAt).getFullYear() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profile Completion</span>
                  <span className="text-green-400">100%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Security Score</span>
                  <span className={profileData?.isEmailVerified ? 'text-green-400' : 'text-yellow-400'}>
                    {profileData?.isEmailVerified ? 'High' : 'Medium'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;