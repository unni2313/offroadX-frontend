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
                <FaHome className="text-sm" />
                <span>Home</span>
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
                            <div className="hidden md:block">
                              <p className="text-sm font-medium text-white">{user.firstName} {user.secondName}</p>
                              <Link to="/profile" className="text-xs text-gray-400 hover:text-green-400 transition">View Profile</Link>
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

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2">
            <FaCheckCircle />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10 flex items-center space-x-6">
              <div className="relative">
                {/* Avatar or user icon */}
                {profileData?.profilePhotoUrl ? (
                  <img
                    src={profileData.profilePhotoUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
                  />
                ) : (
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <FaUser className="text-4xl text-white" />
                  </div>
                )}

                {/* Photo actions */}
                <div className="absolute -bottom-2 -right-2 flex space-x-2">
                  <button
                    onClick={handleChoosePhoto}
                    disabled={photoUploading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white text-xs px-3 py-1 rounded-full shadow"
                  >
                    {photoUploading ? 'Uploading...' : 'Change'}
                  </button>
                  {profileData?.profilePhotoUrl && (
                    <button
                      onClick={handleRemovePhoto}
                      disabled={photoUploading}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white text-xs px-3 py-1 rounded-full shadow"
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
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {isEditing ? `${editFormData.firstName} ${editFormData.secondName}` : `${profileData?.firstName} ${profileData?.secondName}`}
                </h1>
                <p className="text-green-100 text-lg mb-2">
                  {isEditing ? editFormData.email : profileData?.email}
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
                {photoError && (
                  <div className="mt-2 text-sm text-red-200 bg-red-900/40 border border-red-700 px-3 py-2 rounded">
                    {photoError}
                  </div>
                )}
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 text-6xl opacity-20">👤</div>
          </div>
        </div>

        {/* Driving License (PDF) */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <FaShieldAlt className="text-green-400" />
            <span>Driving License (PDF)</span>
          </h3>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm text-gray-300">
              {profileData?.licenseDocUrl ? (
                <div className="space-y-1">
                  <p className="text-green-300">License on file</p>
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
                    className="text-blue-400 hover:underline"
                  >
                    Download current license
                  </a>
                </div>
              ) : (
                <p className="text-gray-400">No license uploaded</p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleChooseLicense}
                disabled={licenseUploading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white text-sm px-4 py-2 rounded-lg"
              >
                {licenseUploading ? 'Uploading...' : (profileData?.licenseDocUrl ? 'Replace PDF' : 'Upload PDF')}
              </button>
              {profileData?.licenseDocUrl && (
                <button
                  onClick={handleRemoveLicense}
                  disabled={licenseUploading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white text-sm px-4 py-2 rounded-lg"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          {licenseError && (
            <div className="mt-3 text-sm text-red-200 bg-red-900/40 border border-red-700 px-3 py-2 rounded">
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
            {/* Basic Information */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <FaUser className="text-green-500" />
                    <span>Personal Information</span>
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={handleEditClick}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center space-x-2"
                    >
                      <FaEdit className="text-sm" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      First Name {isEditing && <span className="text-red-400">*</span>}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={editFormData.firstName}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                        placeholder="Enter first name"
                        required
                      />
                    ) : (
                      <div className="bg-gray-900 rounded-lg p-3 text-white">
                        {profileData?.firstName || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Last Name {isEditing && <span className="text-red-400">*</span>}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="secondName"
                        value={editFormData.secondName}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                        placeholder="Enter last name"
                        required
                      />
                    ) : (
                      <div className="bg-gray-900 rounded-lg p-3 text-white">
                        {profileData?.secondName || 'N/A'}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center space-x-1">
                    <FaEnvelope className="text-sm" />
                    <span>Email Address {isEditing && <span className="text-red-400">*</span>}</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                      placeholder="Enter email address"
                      required
                    />
                  ) : (
                    <div className="bg-gray-900 rounded-lg p-3 text-white">
                      {profileData?.email || 'N/A'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center space-x-1">
                    <FaPhone className="text-sm" />
                    <span>Phone Number</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="bg-gray-900 rounded-lg p-3 text-white">
                      {profileData?.phone || 'N/A'}
                    </div>
                  )}
                </div>
                
                {/* Password Change Section */}
                {isEditing && (
                  <div className="border-t border-gray-700 pt-6 mt-6">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
                      <FaShieldAlt className="text-yellow-500" />
                      <span>Change Password (Optional)</span>
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={editFormData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            value={editFormData.newPassword}
                            onChange={handleInputChange}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                            placeholder="Enter new password (min 6 chars)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={editFormData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 bg-gray-800 p-3 rounded-lg">
                        <p>💡 <strong>Password Change Tips:</strong></p>
                        <p>• Leave password fields empty if you don't want to change your password</p>
                        <p>• New password must be at least 6 characters long</p>
                        <p>• Use a mix of uppercase, lowercase, numbers, and special characters for better security</p>
                      </div>
                    </div>
                  </div>
                )}
                {isEditing && (
                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={updateLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2"
                    >
                      {updateLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                      className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2"
                    >
                      <FaTimes />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
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
                <button 
                  onClick={handleEditClick}
                  disabled={isEditing}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2"
                >
                  <FaEdit />
                  <span>{isEditing ? 'Editing...' : 'Edit Profile'}</span>
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