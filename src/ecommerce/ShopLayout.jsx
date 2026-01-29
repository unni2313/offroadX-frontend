import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import NotificationBell from '../components/NotificationBell';
import FakePaymentGateway from '../components/FakePaymentGateway';
import { showSuccess, showError } from '../utils/sweetAlert';
import {
    FaShoppingCart,
    FaMapMarkedAlt,
    FaUser,
    FaSignOutAlt,
    FaCalendarAlt,
    FaRoute,
    FaTrophy,
    FaCompass,
    FaBars,
    FaTimes,
    FaHome,
    FaSearch,
    FaClipboardList,
    FaTrash,
    FaMinus,
    FaPlus,
    FaBox
} from 'react-icons/fa';

const ShopLayout = () => {
    const [user, setUser] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showPaymentGateway, setShowPaymentGateway] = useState(false);
    const [cart, setCart] = useState([]);
    const [checkingOut, setCheckingOut] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
            fetchProfileData();
        } else {
            navigate('/login');
        }

        // Load cart from localStorage
        const savedCart = localStorage.getItem('shopCart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
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
            } else if (response.status === 401) {
                handleLogout();
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('shopCart');
        navigate('/login', { state: { message: 'Session expired. Please login again.' } });
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const toggleCart = () => setIsCartOpen(!isCartOpen);

    // Cart functions
    const updateQuantity = (productId, delta) => {
        const newCart = cart.map(item => {
            if (item._id === productId) {
                const newQty = (item.quantity || 1) + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean);

        setCart(newCart);
        localStorage.setItem('shopCart', JSON.stringify(newCart));
    };

    const removeFromCart = (productId) => {
        const newCart = cart.filter(item => item._id !== productId);
        setCart(newCart);
        localStorage.setItem('shopCart', JSON.stringify(newCart));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('shopCart');
    };

    const getCartTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    };

    const getCartItemCount = () => {
        return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setShowPaymentGateway(true);
    };

    const processFinalOrder = async () => {
        try {
            setCheckingOut(true);
            const token = localStorage.getItem('token');

            const orderData = {
                items: cart.map(item => ({
                    productId: item._id,
                    quantity: item.quantity || 1
                })),
                customerName: `${user.firstName} ${user.secondName || ''}`.trim(),
                customerEmail: user.email || '',
                shippingAddress: 'Default Address' // Could be expanded with address form
            };

            await axios.post(`${API_BASE_URL}/api/ecommerce/orders`, orderData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            showSuccess('Order Placed!', 'Your payment was successful and order has been submitted.');
            clearCart();
            setIsCartOpen(false);
            setShowPaymentGateway(false);
            navigate('/ecommerce/orders');
        } catch (err) {
            console.error('Checkout error:', err);
            if (err.response?.status === 401) {
                showError('Session Expired', 'Please login again to complete your order.');
                handleLogout();
            } else {
                showError('Order Failed', err.response?.data?.message || 'Payment processed but order creation failed');
            }
            setShowPaymentGateway(false);
        } finally {
            setCheckingOut(false);
        }
    };

    // Shop sub-navigation items
    const shopTabs = [
        { path: '/ecommerce', icon: FaHome, label: 'Shop Home', exact: true },
        { path: '/ecommerce/explore', icon: FaSearch, label: 'Explore' },
        { path: '/ecommerce/orders', icon: FaClipboardList, label: 'My Orders' }
    ];

    const isTabActive = (tab) => {
        if (tab.exact) {
            return location.pathname === tab.path;
        }
        return location.pathname.startsWith(tab.path);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-stone-100 relative overflow-x-hidden">
            {/* Dynamic Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-950/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-950/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
            </div>

            {/* Navigation Header */}
            <nav className="relative z-50 bg-stone-900/80 border-b border-stone-800/50 sticky top-0 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => navigate('/home')}>
                            <div className="relative">
                                <FaMapMarkedAlt className="text-orange-500 text-2xl md:text-3xl transform group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
                            </div>
                            <span className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 tracking-tighter">
                                OffroadX
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {[
                                { to: '/home', icon: FaCompass, label: 'Home' },
                                { to: '/events', icon: FaCalendarAlt, label: 'Events' },
                                { to: '/routes', icon: FaRoute, label: 'Routes' },
                                { to: '/achievements', icon: FaTrophy, label: 'Achievements' },
                                { to: '/ecommerce', icon: FaShoppingCart, label: 'Shop', active: true }
                            ].map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.to}
                                    className={`relative px-3 py-2 text-sm font-bold tracking-widest uppercase transition-all duration-300 flex items-center space-x-2 group ${item.active ? 'text-orange-500' : 'text-stone-400 hover:text-white'}`}
                                >
                                    <item.icon className="text-lg" />
                                    <span>{item.label}</span>
                                    {item.active && (
                                        <div className="absolute -bottom-1 left-3 right-3 h-0.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
                                    )}
                                </Link>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center space-x-6">
                            <NotificationBell />
                            <div className="flex items-center p-1.5 bg-stone-800/50 rounded-2xl border border-stone-700/50 backdrop-blur-sm">
                                <button onClick={handleProfileClick} className="flex items-center space-x-3 pr-4 pl-2 hover:opacity-80 transition-opacity">
                                    {profileData?.profilePhotoUrl ? (
                                        <img src={profileData.profilePhotoUrl} alt="Profile" className="w-9 h-9 rounded-xl object-cover border border-orange-500/30" />
                                    ) : (
                                        <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center">
                                            <FaUser className="text-white text-sm" />
                                        </div>
                                    )}
                                    <span className="font-bold text-sm tracking-tight">{user.firstName}</span>
                                </button>
                                <div className="w-px h-6 bg-stone-700 mx-2"></div>
                                <button onClick={handleLogout} className="p-2 text-stone-400 hover:text-red-400 transition-colors">
                                    <FaSignOutAlt />
                                </button>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center space-x-3">
                            <button onClick={toggleMobileMenu} className="text-stone-300 p-2 bg-stone-800/50 rounded-xl border border-stone-700/50">
                                {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Floating Cart Button - Bottom Right */}
            <button
                onClick={toggleCart}
                className="fixed bottom-6 right-6 z-[140] p-4 bg-orange-500 hover:bg-orange-400 rounded-2xl shadow-2xl shadow-orange-500/30 transition-all hover:scale-110 active:scale-95 group"
            >
                <FaShoppingCart className="text-2xl text-black" />
                {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-black text-orange-500 text-xs font-black rounded-full flex items-center justify-center border-2 border-orange-500">
                        {getCartItemCount()}
                    </span>
                )}
            </button>

            {/* Payment Gateway Modal */}
            {showPaymentGateway && (
                <FakePaymentGateway
                    amount={getCartTotal()}
                    onSuccess={processFinalOrder}
                    onCancel={() => setShowPaymentGateway(false)}
                />
            )}

            {/* Cart Sidebar */}
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/70 z-[150] backdrop-blur-sm"
                        onClick={() => setIsCartOpen(false)}
                    ></div>

                    {/* Cart Panel */}
                    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-stone-900 z-[160] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        {/* Cart Header */}
                        <div className="p-6 border-b border-stone-800 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <FaShoppingCart className="text-orange-500 text-xl" />
                                <h2 className="text-xl font-black uppercase tracking-tight">Your Cart</h2>
                                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-bold rounded">
                                    {getCartItemCount()} items
                                </span>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-stone-800"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {cart.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-stone-800 flex items-center justify-center">
                                        <FaShoppingCart className="text-3xl text-stone-600" />
                                    </div>
                                    <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Your cart is empty</p>
                                    <button
                                        onClick={() => { setIsCartOpen(false); navigate('/ecommerce/explore'); }}
                                        className="mt-4 text-orange-500 font-bold uppercase tracking-widest text-xs hover:text-orange-400"
                                    >
                                        Start Shopping →
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div key={item._id} className="flex gap-4 p-4 bg-stone-800/50 rounded-2xl border border-stone-700/50">
                                            {/* Product Image */}
                                            <div className="w-20 h-20 rounded-xl bg-stone-800 overflow-hidden flex-shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <FaBox className="text-stone-600" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-white truncate">{item.name}</h4>
                                                <p className="text-orange-500 font-black">${item.price}</p>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center space-x-3 mt-2">
                                                    <button
                                                        onClick={() => updateQuantity(item._id, -1)}
                                                        className="w-7 h-7 rounded-lg bg-stone-700 hover:bg-stone-600 flex items-center justify-center text-white transition-colors"
                                                    >
                                                        <FaMinus className="text-xs" />
                                                    </button>
                                                    <span className="font-bold text-sm w-6 text-center">{item.quantity || 1}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item._id, 1)}
                                                        className="w-7 h-7 rounded-lg bg-stone-700 hover:bg-stone-600 flex items-center justify-center text-white transition-colors"
                                                    >
                                                        <FaPlus className="text-xs" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromCart(item._id)}
                                                        className="ml-auto p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <FaTrash className="text-sm" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cart Footer */}
                        {cart.length > 0 && (
                            <div className="p-6 border-t border-stone-800 bg-stone-950/50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Total</span>
                                    <span className="text-2xl font-black text-white">${getCartTotal().toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    disabled={checkingOut}
                                    className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {checkingOut ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <span>Checkout</span>
                                    )}
                                </button>
                                <button
                                    onClick={clearCart}
                                    className="w-full mt-2 py-3 text-red-400 font-bold uppercase tracking-widest text-xs hover:text-red-300 transition-colors"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Mobile Sidebar Navigation */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-12">
                            <div className="flex items-center space-x-3">
                                <FaMapMarkedAlt className="text-orange-500 text-3xl" />
                                <span className="text-2xl font-black text-white tracking-widest">OFFROADX</span>
                            </div>
                            <button onClick={toggleMobileMenu} className="p-3 bg-stone-800 rounded-2xl border border-stone-700 text-white">
                                <FaTimes className="text-xl" />
                            </button>
                        </div>
                        <div className="space-y-4 flex-1">
                            {[
                                { to: '/home', icon: FaCompass, label: 'Home' },
                                { to: '/events', icon: FaCalendarAlt, label: 'Events' },
                                { to: '/routes', icon: FaRoute, label: 'Routes' },
                                { to: '/achievements', icon: FaTrophy, label: 'Achievements' },
                                { to: '/ecommerce', icon: FaShoppingCart, label: 'Shop', active: true }
                            ].map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.to}
                                    className={`flex items-center space-x-4 p-5 rounded-2xl text-lg font-bold transition-all ${item.active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-stone-400 bg-stone-900/50 border border-stone-800/50 hover:bg-stone-800'}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>
                        <button onClick={handleLogout} className="mt-auto flex items-center justify-center space-x-3 p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold">
                            <FaSignOutAlt />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Shop Sub-Navigation Tabs */}
            <div className="relative z-40 bg-stone-950/80 border-b border-stone-800/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex space-x-1 py-3 overflow-x-auto scrollbar-hide">
                        {shopTabs.map((tab) => (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${isTabActive(tab)
                                    ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/30'
                                    : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
                                    }`}
                            >
                                <tab.icon className="text-base" />
                                <span>{tab.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content - Outlet for nested routes */}
            <main className="relative z-10">
                <Outlet context={{ cart, setCart, user, profileData, toggleCart }} />
            </main>
        </div>
    );
};

export default ShopLayout;
