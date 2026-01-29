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
  FaTimes,
  FaCompass,
  FaShoppingCart,
  FaBolt,
  FaTools,
  FaKey,
  FaCloudUploadAlt,
  FaFilePdf,
  FaBars,
  FaFlagCheckered
} from 'react-icons/fa';
import NotificationBell from './components/NotificationBell';
import VehiclesSection from './VehiclesSection';
import API_BASE_URL from './config/api';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const licenseInputRef = useRef(null);
  const [licenseUploading, setLicenseUploading] = useState(false);
  const [licenseError, setLicenseError] = useState('');

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
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
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
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
        setError('Failed to fetch profile data');
      }
    } catch (error) {
      setError('Error fetching profile data');
    }
    finally { setLoading(false); }
  };

  const handleChoosePhoto = () => { setPhotoError(''); if (fileInputRef.current) fileInputRef.current.click(); };
  const handlePhotoSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true); setPhotoError('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch(`${API_BASE_URL}/api/profile/photo`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
      });
      if (!res.ok) throw new Error('Failed to upload photo');
      const updatedUser = await res.json();
      setProfileData(updatedUser);
      setSuccessMessage('Operative identity updated');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) { setPhotoError(err.message); }
    finally { setPhotoUploading(false); }
  };

  const handleRemovePhoto = async () => {
    setPhotoUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/profile/photo`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = await res.json();
      setProfileData(updatedUser);
    } catch (err) { }
    finally { setPhotoUploading(false); }
  };

  const handleChooseLicense = () => { setLicenseError(''); if (licenseInputRef.current) licenseInputRef.current.click(); };
  const handleLicenseSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLicenseUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('license', file);
      const res = await fetch(`${API_BASE_URL}/api/profile/license`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
      });
      const updatedUser = await res.json();
      setProfileData(updatedUser);
      setSuccessMessage('Mission clearance updated');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) { }
    finally { setLicenseUploading(false); }
  };

  const handleUpdateProfile = async () => {
    setUpdateLoading(true);
    try {
      const token = localStorage.getItem('token');
      const dataToSend = { firstName: editFormData.firstName, secondName: editFormData.secondName, email: editFormData.email, phone: editFormData.phone };
      if (editFormData.newPassword) { dataToSend.currentPassword = editFormData.currentPassword; dataToSend.newPassword = editFormData.newPassword; }
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSend)
      });
      if (response.ok) {
        const updatedData = await response.json();
        setProfileData(updatedData);
        setIsEditing(false);
        setSuccessMessage('Dossier updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const err = await response.json();
        setError(err.message || 'Update failed');
      }
    } catch (error) { setError('System error during update'); }
    finally { setUpdateLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-100 relative overflow-x-hidden">
      {/* Tactical Background Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-orange-950/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-amber-950/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 bg-stone-900/80 border-b border-stone-800/50 sticky top-0 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => navigate('/home')}>
              <div className="relative"><FaMapMarkedAlt className="text-orange-500 text-2xl md:text-3xl" /><div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div></div>
              <span className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 tracking-tighter">OffroadX</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {[{ to: '/home', icon: FaCompass, label: 'Home' }, { to: '/events', icon: FaCalendarAlt, label: 'Events' }, { to: '/routes', icon: FaRoute, label: 'Routes' }, { to: '/achievements', icon: FaTrophy, label: 'Achievements' }, { to: '/ecommerce', icon: FaShoppingCart, label: 'Shop' }].map((item) => (
                <Link key={item.label} to={item.to} className={`relative px-3 py-2 text-sm font-bold tracking-widest uppercase transition-all duration-300 flex items-center space-x-2 group text-stone-400 hover:text-white`}>
                  <item.icon className="text-lg" /><span>{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <NotificationBell />
              <div className="flex items-center p-1.5 bg-stone-800/50 rounded-2xl border border-orange-500/30 backdrop-blur-sm">
                <div className="flex items-center space-x-3 pr-4 pl-2">
                  {profileData?.profilePhotoUrl ? <img src={profileData.profilePhotoUrl} alt="Profile" className="w-9 h-9 rounded-xl object-cover border border-orange-500/30" /> : <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center"><FaUser className="text-white text-sm" /></div>}
                  <span className="font-bold text-sm tracking-tight text-white">{user.firstName}</span>
                </div>
              </div>
            </div>

            <div className="md:hidden flex items-center space-x-4">
              <button onClick={toggleMobileMenu} className="text-stone-300 p-2 bg-stone-800/50 rounded-xl border border-stone-700/50 italic">{isMobileMenuOpen ? <FaTimes /> : <FaBars />}</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Header Hero Area */}
        <header className="relative bg-stone-900/40 border border-stone-800 p-8 lg:p-12 rounded-[2.5rem] overflow-hidden mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="absolute top-0 right-0 p-12 opacity-5"><FaUser size={120} /></div>
          <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
            <div className="relative group">
              {profileData?.profilePhotoUrl ? (
                <img src={profileData.profilePhotoUrl} className="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-orange-500/30 shadow-2xl transition-all group-hover:border-orange-500" />
              ) : (
                <div className="w-40 h-40 rounded-[2.5rem] bg-stone-800 border border-stone-700 flex items-center justify-center text-5xl text-stone-600"><FaUser /></div>
              )}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <button onClick={handleChoosePhoto} className="p-3 bg-orange-500 text-black rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><FaCloudUploadAlt /></button>
                {profileData?.profilePhotoUrl && <button onClick={handleRemovePhoto} className="p-3 bg-red-500 text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><FaTimes /></button>}
              </div>
              <input ref={fileInputRef} type="file" onChange={handlePhotoSelected} className="hidden" />
            </div>

            <div className="text-center lg:text-left space-y-4">
              <div className="inline-flex items-center space-x-3 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <FaBolt className="animate-pulse" />
                <span>OPERATIVE STATUS: ACTIVE</span>
              </div>
              <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">{profileData?.firstName} {profileData?.secondName}</h1>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-[10px] font-black uppercase tracking-widest text-stone-500">
                <div className="flex items-center space-x-2"><FaEnvelope className="text-orange-500" /><span>{profileData?.email}</span></div>
                <div className="flex items-center space-x-2"><FaShieldAlt className="text-orange-500" /><span>LEVEL: VETERAN</span></div>
                <div className="flex items-center space-x-2"><FaClock className="text-orange-500" /><span>LOGGED: 142H</span></div>
              </div>
            </div>
          </div>
        </header>

        {successMessage && <div className="mb-8 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-500 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-right duration-500">{successMessage}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <section className="lg:col-span-2 space-y-12">

            {/* Dossier Section */}
            <div className="bg-stone-900/40 border border-stone-800 rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-stone-800 flex justify-between items-center bg-stone-950/20">
                <div className="flex items-center space-x-4">
                  <FaUser size={20} className="text-orange-500" />
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Personal Dossier</h2>
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">EDIT INTEL</button>
                )}
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: 'FIRST NAME', name: 'firstName', icon: FaUser },
                  { label: 'SECOND NAME', name: 'secondName', icon: FaUser },
                  { label: 'EMAIL CHANNEL', name: 'email', icon: FaEnvelope },
                  { label: 'COMMS LINK', name: 'phone', icon: FaPhone }
                ].map(field => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center space-x-2"><field.icon size={10} className="text-orange-500" /><span>{field.label}</span></label>
                    {isEditing ? (
                      <input
                        type="text" name={field.name}
                        value={editFormData[field.name]}
                        onChange={(e) => setEditFormData({ ...editFormData, [field.name]: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 p-4 rounded-xl text-xs font-bold tracking-widest text-white focus:border-orange-500 focus:outline-none"
                      />
                    ) : (
                      <p className="p-4 bg-stone-950/50 rounded-xl text-sm font-bold text-white border border-stone-800/50">{profileData?.[field.name] || 'NOT DEFINED'}</p>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="p-8 bg-stone-800/10 border-t border-stone-800 space-y-6">
                  <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] flex items-center space-x-2"><FaKey /><span>Access Realignment</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="password" placeholder="CURRENT KEY" value={editFormData.currentPassword} onChange={(e) => setEditFormData({ ...editFormData, currentPassword: e.target.value })} className="bg-stone-950 border border-stone-800 p-4 rounded-xl text-xs font-bold tracking-widest text-white outline-none" />
                    <input type="password" placeholder="NEW KEY" value={editFormData.newPassword} onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })} className="bg-stone-950 border border-stone-800 p-4 rounded-xl text-xs font-bold tracking-widest text-white outline-none" />
                    <input type="password" placeholder="CONFIRM KEY" value={editFormData.confirmPassword} onChange={(e) => setEditFormData({ ...editFormData, confirmPassword: e.target.value })} className="bg-stone-950 border border-stone-800 p-4 rounded-xl text-xs font-bold tracking-widest text-white outline-none" />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={handleUpdateProfile} disabled={updateLoading} className="flex-1 h-14 bg-orange-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-xl shadow-orange-500/20">{updateLoading ? 'SYNCING...' : 'COMMIT CHANGES'}</button>
                    <button onClick={() => setIsEditing(false)} className="px-8 h-14 bg-stone-800 text-stone-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all">ABORT</button>
                  </div>
                </div>
              )}
            </div>

            <VehiclesSection />
          </section>

          <aside className="space-y-8">
            {/* Clearance Section */}
            <div className="p-8 bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><FaShieldAlt size={64} /></div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6">Mission Clearance</h3>
              <div className="space-y-6">
                <div className="p-6 bg-stone-950 rounded-[1.5rem] border border-stone-800">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Driving License</span>
                    <FaFilePdf size={16} className={profileData?.licenseDocUrl ? 'text-green-500' : 'text-stone-700'} />
                  </div>
                  {profileData?.licenseDocUrl ? (
                    <div className="space-y-4">
                      <div className="text-[10px] font-black text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-center uppercase tracking-widest">CLEARANCE GRANTED</div>
                      <button onClick={() => window.open(profileData.licenseDocUrl, '_blank')} className="w-full py-3 border border-stone-800 rounded-xl text-[9px] font-black uppercase text-stone-400 hover:text-white hover:border-stone-600 transition-all">VIEW DOCUMENT</button>
                    </div>
                  ) : <div className="text-[10px] font-black text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 text-center uppercase tracking-widest">AWAITING FILING</div>}
                  <button onClick={handleChooseLicense} className="w-full mt-4 py-4 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-black transition-all">UPLOAD DOCS</button>
                  <input ref={licenseInputRef} type="file" accept="application/pdf" onChange={handleLicenseSelected} className="hidden" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[9px] font-black text-stone-500 uppercase tracking-widest">
                    <span>Security Level</span>
                    <span className="text-white">LEVEL 04</span>
                  </div>
                  <div className="h-1 bg-stone-800 rounded-full overflow-hidden"><div className="h-full w-[80%] bg-orange-500 rounded-full"></div></div>
                </div>
              </div>
            </div>

            {/* Quick Stats Panel */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-6"><div className="w-1 h-6 bg-orange-500 rounded-full"></div><h3 className="text-xl font-black text-white uppercase tracking-tight">Expedition Summary</h3></div>
              {[
                { label: 'GLOBAL RANKING', val: '#412', icon: FaTrophy },
                { label: 'COMPLETED OPS', val: '24', icon: FaFlagCheckered },
                { label: 'FRIENDS SYNCED', val: '156', icon: FaUsers }
              ].map(stat => (
                <div key={stat.label} className="p-6 bg-stone-900/30 border border-stone-800/50 rounded-[1.5rem] flex items-center justify-between group hover:border-stone-600 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center text-orange-500"><stat.icon size={16} /></div>
                    <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <span className="text-lg font-black text-white tracking-tighter">{stat.val}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <button className="w-16 h-16 bg-white text-black rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group">
          <FaBell className="text-xl group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center space-x-3"><FaMapMarkedAlt className="text-orange-500 text-3xl" /><span className="text-2xl font-black text-white tracking-widest uppercase">OFFROADX</span></div>
            <button onClick={toggleMobileMenu} className="p-3 bg-stone-800 rounded-2xl border border-stone-700 text-white"><FaTimes className="text-xl" /></button>
          </div>
          <div className="space-y-4 flex-1">
            {[{ to: '/home', icon: FaCompass, label: 'Home' }, { to: '/events', icon: FaCalendarAlt, label: 'Events' }, { to: '/routes', icon: FaRoute, label: 'Routes' }, { to: '/achievements', icon: FaTrophy, label: 'Achievements' }, { to: '/ecommerce', icon: FaShoppingCart, label: 'Shop' }].map((item) => (
              <Link key={item.label} to={item.to} className={`flex items-center space-x-4 p-5 rounded-2xl text-lg font-bold transition-all text-stone-400 bg-stone-900/50 border border-stone-800/50 hover:bg-stone-800`} onClick={() => setIsMobileMenuOpen(false)}><item.icon /><span>{item.label}</span></Link>
            ))}
          </div>
          <button onClick={handleLogout} className="mt-8 flex items-center justify-center space-x-3 p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold"><FaSignOutAlt /><span>Sign Out</span></button>
        </div>
      )}
    </div>
  );
}

export default Profile;