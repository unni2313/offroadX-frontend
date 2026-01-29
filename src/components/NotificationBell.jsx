import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaTimes, FaCalendarAlt, FaRoute, FaInbox } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            if (!token || !user) return;

            const response = await fetch(`${API_BASE_URL}/api/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const notifs = data.notifications || [];
                setNotifications(notifs);

                // Calculate unread count
                const unread = notifs.filter(n => !n.readBy.includes(user.id)).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
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
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'event': return <FaCalendarAlt className="text-orange-500" />;
            case 'trail': return <FaRoute className="text-cyan-500" />;
            default: return <FaBell className="text-stone-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-stone-300 hover:text-orange-400 relative transition-colors p-2 bg-stone-800/50 rounded-xl border border-stone-700/50 backdrop-blur-sm"
            >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-[#1a1a1a] animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-80 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-stone-800 flex justify-between items-center">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Notifications</h3>
                        <button onClick={() => setIsOpen(false)} className="text-stone-500 hover:text-white">
                            <FaTimes size={12} />
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => {
                                const user = JSON.parse(localStorage.getItem('user'));
                                const isRead = notification.readBy.includes(user.id);

                                return (
                                    <div
                                        key={notification._id}
                                        onClick={() => !isRead && markAsRead(notification._id)}
                                        className={`p-4 border-b border-stone-800/50 flex gap-4 cursor-pointer hover:bg-stone-800/50 transition-colors ${!isRead ? 'bg-orange-500/5' : ''}`}
                                    >
                                        <div className="mt-1 w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm leading-snug ${!isRead ? 'text-white font-bold' : 'text-stone-400'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-stone-500 mt-1 uppercase font-black">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {!isRead && (
                                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center">
                                <FaBell className="text-3xl text-stone-800 mx-auto mb-3" />
                                <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">No notifications yet</p>
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 bg-stone-950 text-center">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/notifications');
                                }}
                                className="text-[10px] font-black text-stone-500 hover:text-orange-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 w-full"
                            >
                                <FaInbox />
                                View All Notification History
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
