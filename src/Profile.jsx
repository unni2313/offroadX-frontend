import React, { useState, useEffect, useRef } from 'react';
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
  FaArrowLeft,
  FaHome,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import VehiclesSection from './VehiclesSection';

function Profile() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    secondName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Photo upload/remove states
  const fileInputRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');

  // License upload/remove states
  const licenseInputRef = useRef(null);
  const [licenseUploading, setLicenseUploading] = useState(false);
  const [licenseError, setLicenseError] = useState('');

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, text: 'Weak', color: 'text-red-400' };
    if (strength <= 4) return { strength, text: 'Medium', color: 'text-yellow-400' };
    return { strength, text: 'Strong', color: 'text-green-400' };
  };

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
        // Initialize edit form data with current profile data
        setEditFormData({
          firstName: data.firstName || '',
          secondName: data.secondName || '',
          email: data.email || '',
          phone: data.phone || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
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

  // Upload profile photo
  const handleChoosePhoto = () => {
    setPhotoError('');
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handlePhotoSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client-side validation
    if (!/(jpe?g|png|webp)$/i.test(file.name)) {
      setPhotoError('Only JPG, PNG, or WEBP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('File is too large. Max 5MB');
      return;
    }

    setPhotoUploading(true);
    setPhotoError('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch('http://localhost:5000/api/profile/photo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to upload photo');
      }

      const updatedUser = await res.json();
      // Update UI state with new profile data
      setProfileData(updatedUser);
      setSuccessMessage('Profile photo updated');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setPhotoError(err.message || 'Failed to upload photo');
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove profile photo
  const handleRemovePhoto = async () => {
    setPhotoError('');
    setPhotoUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile/photo', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to delete photo');
      }

      const updatedUser = await res.json();
      setProfileData(updatedUser);
      setSuccessMessage('Profile photo removed');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setPhotoError(err.message || 'Failed to delete photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  // License: choose file
  const handleChooseLicense = () => {
    setLicenseError('');
    if (licenseInputRef.current) licenseInputRef.current.click();
  };

  // License: upload selected PDF
  const handleLicenseSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.pdf$/i.test(file.name)) {
      setLicenseError('Only PDF files are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      setLicenseError('File is too large. Max 10MB');
      return;
    }

    setLicenseUploading(true);
    setLicenseError('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('license', file);

      const res = await fetch('http://localhost:5000/api/profile/license', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to upload license');
      }

      const updatedUser = await res.json();
      setProfileData(updatedUser);
      setSuccessMessage('Driving license uploaded');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setLicenseError(err.message || 'Failed to upload license');
    } finally {
      setLicenseUploading(false);
      if (licenseInputRef.current) licenseInputRef.current.value = '';
    }
  };

  // License: remove
  const handleRemoveLicense = async () => {
    setLicenseError('');
    setLicenseUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile/license', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to delete license');
      }
      const updatedUser = await res.json();
      setProfileData(updatedUser);
      setSuccessMessage('Driving license removed');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setLicenseError(err.message || 'Failed to delete license');
    } finally {
      setLicenseUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleEditClick = () => {
    setIsEditing(true);
    // Reset form data to current profile data
    setEditFormData({
      firstName: profileData?.firstName || '',
      secondName: profileData?.secondName || '',
      email: profileData?.email || '',
      phone: profileData?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({
      firstName: profileData?.firstName || '',
      secondName: profileData?.secondName || '',
      email: profileData?.email || '',
      phone: profileData?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    // Basic validation
    if (!editFormData.firstName.trim() || !editFormData.secondName.trim() || !editFormData.email.trim()) {
      setError('First name, last name, and email are required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Password validation if changing password
    if (editFormData.newPassword) {
      if (!editFormData.currentPassword) {
        setError('Current password is required to change password.');
        return;
      }
      
      if (editFormData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }

      if (editFormData.newPassword !== editFormData.confirmPassword) {
        setError('New password and confirm password do not match.');
        return;
      }
    }

    setUpdateLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare data to send (only include password fields if changing password)
      const dataToSend = {
        firstName: editFormData.firstName,
        secondName: editFormData.secondName,
        email: editFormData.email,
        phone: editFormData.phone
      };

      if (editFormData.newPassword) {
        dataToSend.currentPassword = editFormData.currentPassword;
        dataToSend.newPassword = editFormData.newPassword;
      }

      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfileData(updatedData);
        setIsEditing(false);
        const passwordChanged = editFormData.newPassword ? ' Password updated successfully!' : '';
        setSuccessMessage(`Profile updated successfully!${passwordChanged}`);
        setError(''); // Clear any previous errors
        // Update localStorage user data if needed
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const updatedUser = { ...user, ...editFormData };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
        setSuccessMessage(''); // Clear any success message
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error updating profile');
    } finally {
      setUpdateLoading(false);
    }
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
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="loadingBg1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(120, 113, 108, 0.1)" />
                <stop offset="100%" stopColor="rgba(87, 83, 81, 0.05)" />
              </linearGradient>
            </defs>
            <path d="M0,400 L300,200 L600,350 L900,150 L1200,300 L1200,800 L0,800 Z" fill="url(#loadingBg1)" className="animate-pulse" />
          </svg>
        </div>
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500/30 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-stone-300 text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="errorBg1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(120, 113, 108, 0.1)" />
                <stop offset="100%" stopColor="rgba(87, 83, 81, 0.05)" />
              </linearGradient>
            </defs>
            <path d="M0,400 L300,200 L600,350 L900,150 L1200,300 L1200,800 L0,800 Z" fill="url(#errorBg1)" />
          </svg>
        </div>
        <div className="relative z-10 text-center bg-stone-900/50 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-white text-2xl" />
          </div>
          <p className="text-xl mb-6 text-stone-200">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-orange-500/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-stone-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
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
          <path d="M0,500 L200,300 L400,450 L600,250 L800,400 L1000,200 L1200,350 L1200,800 L0,800 Z" fill="url(#bgMountain1)" className="animate-[mountainFloat1_15s_ease-in-out_infinite] opacity-60" />
          <path d="M0,600 L150,400 L350,550 L550,350 L750,500 L950,300 L1200,450 L1200,800 L0,800 Z" fill="url(#bgMountain2)" className="animate-[mountainFloat2_12s_ease-in-out_infinite_reverse] opacity-40" />
        </svg>
      </div>

      {/* Navigation Header */}
      <nav className="bg-stone-900/80 backdrop-blur-md border-b border-orange-500/20 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                <FaMapMarkedAlt className="text-white text-xl" />
              </div>
              <span
                onClick={() => navigate(user?.role === 'admin' ? '/dashboard' : '/home')}
                className="cursor-pointer text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500"
                title="Go to home"
              >
                OffroadX
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/home" className="text-stone-300 hover:text-orange-400 transition-all duration-300 flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-orange-500/10">
                <FaHome className="text-sm" />
                <span className="font-medium">Home</span>
              </Link>
              <Link to="/events" className="text-stone-300 hover:text-orange-400 transition-all duration-300 flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-orange-500/10">
                <FaCalendarAlt className="text-sm" />
                <span className="font-medium">Events</span>
              </Link>
              <Link to="/routes" className="text-stone-300 hover:text-orange-400 transition-all duration-300 flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-orange-500/10">
                <FaRoute className="text-sm" />
                <span className="font-medium">Routes</span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="text-stone-300 hover:text-orange-400 transition-all duration-300 p-2 rounded-lg hover:bg-orange-500/10">
                <FaBell className="text-xl" />
              </button>
              <div className="flex items-center space-x-3">
                {profileData?.profilePhotoUrl ? (
                  <img
                    src={profileData.profilePhotoUrl}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-500/50 shadow-lg shadow-orange-500/20"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <FaUser className="text-white text-sm" />
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-stone-100">{user.firstName} {user.secondName}</p>
                  <Link to="/profile" className="text-xs text-stone-400 hover:text-orange-400 transition-all duration-300">View Profile</Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-stone-300 hover:text-red-400 transition-all duration-300 p-2 rounded-lg hover:bg-red-500/10"
                  title="Logout"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 relative z-10">
          <div className="bg-gradient-to-r from-orange-500/20 to-amber-600/20 backdrop-blur-sm border border-orange-500/30 text-orange-200 px-6 py-4 rounded-xl flex items-center space-x-3 shadow-lg shadow-orange-500/10">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-white text-sm" />
            </div>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-stone-900/80 to-stone-800/80 backdrop-blur-md rounded-3xl p-8 text-white relative overflow-hidden border border-orange-500/20 shadow-2xl shadow-orange-500/10">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-amber-600/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-500/5 to-amber-600/5 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex items-center space-x-6">
              <div className="relative">
                {/* Avatar or user icon */}
                {profileData?.profilePhotoUrl ? (
                  <img
                    src={profileData.profilePhotoUrl}
                    alt="Profile"
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-orange-500/30 shadow-lg shadow-orange-500/20"
                  />
                ) : (
                  <div className="w-28 h-28 bg-gradient-to-br from-orange-500/20 to-amber-600/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-orange-500/30">
                    <FaUser className="text-4xl text-orange-300" />
                  </div>
                )}

                {/* Photo actions */}
                <div className="absolute -bottom-2 -right-2 flex space-x-2">
                  <button
                    onClick={handleChoosePhoto}
                    disabled={photoUploading}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-orange-700 disabled:to-amber-800 text-white text-xs px-3 py-2 rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-300 font-medium"
                  >
                    {photoUploading ? 'Uploading...' : 'Change'}
                  </button>
                  {profileData?.profilePhotoUrl && (
                    <button
                      onClick={handleRemovePhoto}
                      disabled={photoUploading}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-700 disabled:to-red-800 text-white text-xs px-3 py-2 rounded-xl shadow-lg shadow-red-500/20 transition-all duration-300 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoSelected}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-orange-300 to-amber-400">
                  {isEditing ? `${editFormData.firstName} ${editFormData.secondName}` : `${profileData?.firstName} ${profileData?.secondName}`}
                </h1>
                <p className="text-stone-200 text-lg mb-4 flex items-center space-x-2">
                  <FaEnvelope className="text-orange-400" />
                  <span>{isEditing ? editFormData.email : profileData?.email}</span>
                </p>
                <div className="flex items-center space-x-4 flex-wrap gap-2">
                  <span className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-500/20 to-amber-600/20 border border-orange-500/30 text-orange-200 backdrop-blur-sm">
                    {profileData?.role?.toUpperCase()}
                  </span>
                  <span className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm ${
                    profileData?.isEmailVerified 
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 text-green-200' 
                      : 'bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-200'
                  }`}>
                    {profileData?.isEmailVerified ? <FaCheckCircle /> : <FaTimesCircle />}
                    <span>
                      {profileData?.isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
                    </span>
                  </span>
                </div>
                {photoError && (
                  <div className="mt-4 text-sm text-red-200 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30 px-4 py-3 rounded-xl">
                    {photoError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Driving License (PDF) */}
        <div className="bg-gradient-to-br from-stone-900/80 to-stone-800/80 backdrop-blur-md rounded-2xl border border-orange-500/20 p-6 mb-8 shadow-lg shadow-orange-500/5">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <FaShieldAlt className="text-white" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">Driving License (PDF)</span>
          </h3>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-stone-300">
              {profileData?.licenseDocUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
                    <p className="text-green-300 font-medium">License on file</p>
                  </div>
                  <a
                    href="#"
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        const token = localStorage.getItem('token');
                        // Prefer the direct Cloudinary asset URL stored on the profile
                        const directUrl = profileData?.licenseDocUrl;
                        if (!directUrl) throw new Error('No license URL on file');
                        // Force download with a friendly filename using Cloudinary flag transformation
                        // Insert fl_attachment:licence after /raw/upload/
                        const attachmentUrl = directUrl.includes('/raw/upload/')
                          ? directUrl.replace('/raw/upload/', '/raw/upload/fl_attachment:licence/')
                          : directUrl;
                        const a = document.createElement('a');
                        a.href = attachmentUrl;
                        a.target = '_blank';
                        a.rel = 'noopener';
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                      } catch (err) {
                        setLicenseError(err.message || 'Failed to get download URL');
                      }
                    }}
                    className="text-orange-400 hover:text-orange-300 transition-colors duration-300 font-medium hover:underline"
                  >
                    Download current license
                  </a>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-stone-500 to-stone-600 rounded-full"></div>
                  <p className="text-stone-400">No license uploaded</p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleChooseLicense}
                disabled={licenseUploading}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-orange-700 disabled:to-amber-800 text-white text-sm px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-orange-500/20"
              >
                {licenseUploading ? 'Uploading...' : (profileData?.licenseDocUrl ? 'Replace PDF' : 'Upload PDF')}
              </button>
              {profileData?.licenseDocUrl && (
                <button
                  onClick={handleRemoveLicense}
                  disabled={licenseUploading}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-700 disabled:to-red-800 text-white text-sm px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-red-500/20"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          {licenseError && (
            <div className="mt-4 text-sm text-red-200 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30 px-4 py-3 rounded-xl">
              {licenseError}
            </div>
          )}
          <input
            ref={licenseInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleLicenseSelected}
            className="hidden"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicles */}
            <VehiclesSection />
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-stone-900/80 to-stone-800/80 backdrop-blur-md rounded-2xl border border-orange-500/20 overflow-hidden shadow-lg shadow-orange-500/5">
              <div className="p-6 border-b border-orange-500/20">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <FaUser className="text-white" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">Personal Information</span>
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={handleEditClick}
                      className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-medium shadow-lg shadow-orange-500/20"
                    >
                      <FaEdit className="text-sm" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full"></div>
                      <span>First Name {isEditing && <span className="text-red-400">*</span>}</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={editFormData.firstName}
                        onChange={handleInputChange}
                        className="w-full bg-black/30 border border-orange-500/30 rounded-xl p-4 text-white placeholder-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                        placeholder="Enter first name"
                        required
                      />
                    ) : (
                      <div className="bg-black/20 backdrop-blur-sm border border-orange-500/20 rounded-xl p-4 text-white">
                        {profileData?.firstName || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full"></div>
                      <span>Last Name {isEditing && <span className="text-red-400">*</span>}</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="secondName"
                        value={editFormData.secondName}
                        onChange={handleInputChange}
                        className="w-full bg-black/30 border border-orange-500/30 rounded-xl p-4 text-white placeholder-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                        placeholder="Enter last name"
                        required
                      />
                    ) : (
                      <div className="bg-black/20 backdrop-blur-sm border border-orange-500/20 rounded-xl p-4 text-white">
                        {profileData?.secondName || 'N/A'}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2 flex items-center space-x-2">
                    <FaEnvelope className="text-orange-400" />
                    <span>Email Address {isEditing && <span className="text-red-400">*</span>}</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleInputChange}
                      className="w-full bg-black/30 border border-orange-500/30 rounded-xl p-4 text-white placeholder-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                      placeholder="Enter email address"
                      required
                    />
                  ) : (
                    <div className="bg-black/20 backdrop-blur-sm border border-orange-500/20 rounded-xl p-4 text-white">
                      {profileData?.email || 'N/A'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2 flex items-center space-x-2">
                    <FaPhone className="text-orange-400" />
                    <span>Phone Number</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-black/30 border border-orange-500/30 rounded-xl p-4 text-white placeholder-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="bg-black/20 backdrop-blur-sm border border-orange-500/20 rounded-xl p-4 text-white">
                      {profileData?.phone || 'N/A'}
                    </div>
                  )}
                </div>
                
                {/* Password Change Section */}
                {isEditing && (
                  <div className="border-t border-orange-500/20 pt-6 mt-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <FaShieldAlt className="text-white" />
                      </div>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">Change Password (Optional)</span>
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-stone-300 mb-2 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full"></div>
                          <span>Current Password</span>
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={editFormData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full bg-black/30 border border-orange-500/30 rounded-xl p-4 text-white placeholder-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-stone-300 mb-2 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full"></div>
                            <span>New Password</span>
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            value={editFormData.newPassword}
                            onChange={handleInputChange}
                            className="w-full bg-black/30 border border-orange-500/30 rounded-xl p-4 text-white placeholder-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                            placeholder="Enter new password (min 6 chars)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-300 mb-2 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full"></div>
                            <span>Confirm New Password</span>
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={editFormData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full bg-black/30 border border-orange-500/30 rounded-xl p-4 text-white placeholder-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-orange-500/10 to-amber-600/10 backdrop-blur-sm border border-orange-500/20 p-6 rounded-2xl">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm">💡</span>
                          </div>
                          <div className="text-sm text-stone-300 space-y-2">
                            <p className="font-semibold text-orange-300">Password Change Tips:</p>
                            <p>• Leave password fields empty if you don't want to change your password</p>
                            <p>• New password must be at least 6 characters long</p>
                            <p>• Use a mix of uppercase, lowercase, numbers, and special characters for better security</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {isEditing && (
                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={updateLoading}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-orange-700 disabled:to-amber-800 text-white py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 font-medium shadow-lg shadow-orange-500/20"
                    >
                      {updateLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      ) : (
                        <>
                          <FaSave />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={updateLoading}
                      className="flex-1 bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-600 hover:to-stone-700 disabled:from-stone-800 disabled:to-stone-900 text-white py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 font-medium shadow-lg shadow-stone-500/20"
                    >
                      <FaTimes />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-gradient-to-br from-stone-900/80 to-stone-800/80 backdrop-blur-md rounded-2xl border border-orange-500/20 overflow-hidden shadow-lg shadow-orange-500/5">
              <div className="p-6 border-b border-orange-500/20">
                <h2 className="text-xl font-bold text-white flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <FaShieldAlt className="text-white" />
                  </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">Account Information</span>
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2 flex items-center space-x-2">
                      <FaUserTag className="text-orange-400" />
                      <span>Account Role</span>
                    </label>
                    <div className="bg-gradient-to-r from-orange-500/20 to-amber-600/20 backdrop-blur-sm border border-orange-500/30 text-orange-200 rounded-xl p-4 font-medium">
                      {profileData?.role?.toUpperCase() || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">Email Verification</label>
                    <div className={`rounded-xl p-4 flex items-center space-x-2 backdrop-blur-sm font-medium ${
                      profileData?.isEmailVerified 
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 text-green-200' 
                        : 'bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-200'
                    }`}>
                      {profileData?.isEmailVerified ? <FaCheckCircle /> : <FaTimesCircle />}
                      <span>{profileData?.isEmailVerified ? 'Verified' : 'Not Verified'}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2 flex items-center space-x-2">
                      <FaClock className="text-orange-400" />
                      <span>Account Created</span>
                    </label>
                    <div className="bg-black/20 backdrop-blur-sm border border-orange-500/20 rounded-xl p-4 text-white">
                      {formatDate(profileData?.createdAt)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2 flex items-center space-x-2">
                      <FaHistory className="text-orange-400" />
                      <span>Last Updated</span>
                    </label>
                    <div className="bg-black/20 backdrop-blur-sm border border-orange-500/20 rounded-xl p-4 text-white">
                      {formatDate(profileData?.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div className="bg-gradient-to-br from-stone-900/80 to-stone-800/80 backdrop-blur-md rounded-2xl border border-orange-500/20 overflow-hidden shadow-lg shadow-orange-500/5">
              <div className="p-6 border-b border-orange-500/20">
                <h2 className="text-xl font-bold text-white flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
                    <FaShieldAlt className="text-white" />
                  </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-500">Security Status</span>
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">Failed Login Attempts</label>
                    <div className={`rounded-xl p-4 backdrop-blur-sm font-medium ${
                      (profileData?.failedLoginAttempts || 0) > 0 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 text-yellow-200' 
                        : 'bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 text-green-200'
                    }`}>
                      {profileData?.failedLoginAttempts || 0}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">Account Status</label>
                    <div className={`rounded-xl p-4 flex items-center space-x-2 backdrop-blur-sm font-medium ${
                      profileData?.isBlocked 
                        ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-200' 
                        : 'bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 text-green-200'
                    }`}>
                      {profileData?.isBlocked ? <FaTimesCircle /> : <FaCheckCircle />}
                      <span>{profileData?.isBlocked ? 'Blocked' : 'Active'}</span>
                    </div>
                  </div>
                </div>
                {profileData?.isBlocked && profileData?.blockExpiry && (
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">Block Expires</label>
                    <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30 text-red-200 rounded-xl p-4 font-medium">
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
            <div className="bg-gradient-to-br from-stone-900/80 to-stone-800/80 backdrop-blur-md rounded-2xl border border-orange-500/20 p-6 shadow-lg shadow-orange-500/5">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <FaCalendarAlt className="text-white" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">Event Participation</span>
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500 mb-3">
                  {profileData?.eventParticipations?.length || 0}
                </div>
                <p className="text-stone-300 text-sm font-medium">Events Joined</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-stone-900/80 to-stone-800/80 backdrop-blur-md rounded-2xl border border-orange-500/20 p-6 shadow-lg shadow-orange-500/5">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <FaEdit className="text-white" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">Quick Actions</span>
              </h3>
              <div className="space-y-4">
                <button 
                  onClick={handleEditClick}
                  disabled={isEditing}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-orange-700 disabled:to-amber-800 text-white py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 font-medium shadow-lg shadow-orange-500/20"
                >
                  <FaEdit />
                  <span>{isEditing ? 'Editing...' : 'Edit Profile'}</span>
                </button>
                <Link 
                  to="/events" 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 font-medium shadow-lg shadow-blue-500/20"
                >
                  <FaCalendarAlt />
                  <span>Browse Events</span>
                </Link>
                <Link 
                  to="/home" 
                  className="w-full bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-600 hover:to-stone-700 text-white py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 font-medium shadow-lg shadow-stone-500/20"
                >
                  <FaArrowLeft />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>

            {/* Account Summary */}
            <div className="bg-gradient-to-br from-stone-900/80 to-stone-800/80 backdrop-blur-md rounded-2xl border border-orange-500/20 p-6 shadow-lg shadow-orange-500/5">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <FaHistory className="text-white" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">Account Summary</span>
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center p-3 bg-black/20 backdrop-blur-sm border border-orange-500/20 rounded-xl">
                  <span className="text-stone-300 font-medium">Member Since</span>
                  <span className="text-white font-semibold">
                    {profileData?.createdAt ? new Date(profileData.createdAt).getFullYear() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/20 backdrop-blur-sm border border-orange-500/20 rounded-xl">
                  <span className="text-stone-300 font-medium">Profile Completion</span>
                  <span className="text-green-400 font-semibold">100%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/20 backdrop-blur-sm border border-orange-500/20 rounded-xl">
                  <span className="text-stone-300 font-medium">Security Score</span>
                  <span className={`font-semibold ${profileData?.isEmailVerified ? 'text-green-400' : 'text-yellow-400'}`}>
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