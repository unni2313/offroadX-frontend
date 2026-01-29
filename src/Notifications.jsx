import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    FaBell,
    FaCalendarAlt,
    FaRoute,
    FaCheckCircle,
    FaTrash,
    FaChevronLeft,
    FaChevronRight,
    FaCompass,
    FaTrophy,
    FaShoppingCart,
    FaUser,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaMapMarkedAlt,
    FaInbox
} from 'react-icons/fa';
import API_BASE_URL from './config/api';
import { showSuccess, showError } from './utils/sweetAlert';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [user, setUser] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const limit = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
            fetchProfileData();
            fetchNotifications(0);
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
            }
        } catch (e) { }
    };

    const fetchNotifications = async (newSkip) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/notifications?limit=${limit}&skip=${newSkip}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications);
                setTotal(data.total);
                setSkip(newSkip);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            showError('Sync Error', 'Failed to retrieve notification logs.');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchNotifications(skip);
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showSuccess('Completed', 'All notifications have been processed.');
                fetchNotifications(skip);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getIcon = (type) => {
        switch (type) {
            case 'event': return <FaCalendarAlt className="text-orange-500" />;
            case 'trail': return <FaRoute className="text-cyan-500" />;
            default: return <FaBell className="text-stone-400" />;
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-stone-100 relative overflow-x-hidden">
            {/* Tactical Background Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-orange-950/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-amber-950/20 rounded-full blur-[120px]"></div>
            </div>

            {/* Navigation Header */}
            <nav className="relative z-50 bg-stone-900/80 border-b border-stone-800/50 sticky top-0 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => navigate('/home')}>
                            <div className="relative">
                                <FaMapMarkedAlt className="text-orange-500 text-2xl md:text-3xl" />
                                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
                            </div>
                            <span className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 tracking-tighter">OffroadX</span>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            {[
                                { to: '/home', icon: FaCompass, label: 'Home' },
                                { to: '/events', icon: FaCalendarAlt, label: 'Events' },
                                { to: '/routes', icon: FaRoute, label: 'Routes' },
                                { to: '/achievements', icon: FaTrophy, label: 'Achievements' },
                                { to: '/ecommerce', icon: FaShoppingCart, label: 'Shop' }
                            ].map((item) => (
                                <Link key={item.label} to={item.to} className="relative px-3 py-2 text-sm font-bold tracking-widest uppercase transition-all duration-300 flex items-center space-x-2 group text-stone-400 hover:text-white">
                                    <item.icon className="text-lg" />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center space-x-6">
                            <div className="flex items-center p-1.5 bg-stone-800/50 rounded-2xl border border-stone-700/50 backdrop-blur-sm">
                                <button onClick={() => navigate('/profile')} className="flex items-center space-x-3 pr-4 pl-2 hover:opacity-80 transition-opacity">
                                    {profileData?.profilePhotoUrl ? (
                                        <img src={profileData.profilePhotoUrl} alt="Profile" className="w-9 h-9 rounded-xl object-cover border border-orange-500/30" />
                                    ) : (
                                        <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center">
                                            <FaUser className="text-white text-sm" />
                                        </div>
                                    )}
                                    <span className="font-bold text-sm tracking-tight text-white">{user.firstName}</span>
                                </button>
                                <div className="w-px h-6 bg-stone-700 mx-2"></div>
                                <button onClick={handleLogout} className="p-2 text-stone-400 hover:text-red-400 transition-colors">
                                    <FaSignOutAlt />
                                </button>
                            </div>
                        </div>

                        <div className="md:hidden flex items-center space-x-4">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-stone-300 p-2 bg-stone-800/50 rounded-xl border border-stone-700/50 italic">
                                {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <FaInbox />
                        <span>Communications Hub</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-2 uppercase">Notifications</h1>
                            <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Examine incoming transmissions and operative updates.</p>
                        </div>
                        {notifications.length > 0 && unreadCount(notifications, user.id) > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-6 py-4 bg-stone-800 hover:bg-orange-500 hover:text-black text-stone-300 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-stone-700 hover:border-orange-500 transition-all flex items-center space-x-2"
                            >
                                <FaCheckCircle />
                                <span>Acknowledge All</span>
                            </button>
                        )}
                    </div>
                </header>

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4">
                            <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                            <p className="text-stone-600 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Decrypting Transmissions...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-24 text-center bg-stone-900/40 border border-stone-800 rounded-[2.5rem]">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-stone-800 border border-stone-700 mb-6 text-stone-700">
                                <FaBell size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">No Logs Identified</h3>
                            <p className="text-stone-500 max-w-xs mx-auto font-medium text-sm italic">Communications terminal is currently clear of pending updates.</p>
                        </div>
                    ) : (
                        notifications.map((notif, idx) => {
                            const isRead = notif.readBy.includes(user.id);
                            return (
                                <div
                                    key={notif._id}
                                    className={`relative group bg-stone-900/40 border transition-all duration-500 rounded-3xl p-6 flex gap-6 items-center animate-in fade-in slide-in-from-bottom-4 duration-500 ${!isRead ? 'border-orange-500/30 bg-stone-900/60 shadow-xl' : 'border-stone-800/80 hover:border-stone-700'}`}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${!isRead ? 'bg-orange-500/10 border-orange-500/30' : 'bg-stone-800 border-stone-700'}`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${!isRead ? 'text-orange-500' : 'text-stone-500'}`}>
                                                {notif.type} Transmission
                                            </span>
                                            {!isRead && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>}
                                        </div>
                                        <p className={`text-lg leading-tight transition-colors ${!isRead ? 'text-white font-bold' : 'text-stone-400'}`}>
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-stone-600 mt-2 font-black uppercase tracking-widest">
                                            {new Date(notif.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                    {!isRead && (
                                        <button
                                            onClick={() => markAsRead(notif._id)}
                                            className="p-4 bg-stone-800 hover:bg-orange-500 hover:text-black text-stone-400 hover:text-black rounded-2xl border border-stone-700 hover:border-orange-500 transition-all opacity-0 group-hover:opacity-100"
                                            title="Mark as Seen"
                                        >
                                            <FaCheckCircle size={18} />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {total > limit && (
                    <div className="mt-12 flex justify-center items-center space-x-6">
                        <button
                            disabled={skip === 0}
                            onClick={() => fetchNotifications(skip - limit)}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-stone-900 border border-stone-800 text-stone-500 hover:text-orange-500 hover:border-orange-500 disabled:opacity-30 disabled:hover:text-stone-500 disabled:hover:border-stone-800 transition-all"
                        >
                            <FaChevronLeft />
                        </button>
                        <div className="text-[10px] font-black text-stone-500 uppercase tracking-[0.4em]">
                            Entry {skip + 1} - {Math.min(skip + limit, total)} / {total}
                        </div>
                        <button
                            disabled={skip + limit >= total}
                            onClick={() => fetchNotifications(skip + limit)}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-stone-900 border border-stone-800 text-stone-500 hover:text-orange-500 hover:border-orange-500 disabled:opacity-30 disabled:hover:text-stone-500 disabled:hover:border-stone-800 transition-all"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

const unreadCount = (notifs, userId) => {
    return notifs.filter(n => !n.readBy.includes(userId)).length;
};

export default Notifications;
