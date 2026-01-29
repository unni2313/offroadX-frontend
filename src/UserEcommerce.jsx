import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from './config/api';
import NotificationBell from './components/NotificationBell';
import { showSuccess } from './utils/sweetAlert';
import {
    FaShoppingCart,
    FaSearch,
    FaFilter,
    FaBox,
    FaTag,
    FaMapMarkedAlt,
    FaUser,
    FaSignOutAlt,
    FaCalendarAlt,
    FaRoute,
    FaTrophy,
    FaBell,
    FaCompass,
    FaBars,
    FaTimes,
    FaArrowRight,
    FaFire,
    FaShieldAlt,
    FaTools
} from 'react-icons/fa';

const UserEcommerce = () => {
    // Auth & Layout State
    const [user, setUser] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // E-commerce State
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
            fetchProfileData();
            fetchProducts();
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
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/ecommerce/products`);
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        setCart([...cart, product]);
        showSuccess('Added to Cart', `${product.name} is ready for checkout!`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' ? true : product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const uniqueCategories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

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
                        <div className="md:hidden flex items-center space-x-4">
                            <button onClick={toggleMobileMenu} className="text-stone-300 p-2 bg-stone-800/50 rounded-xl border border-stone-700/50">
                                {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

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

            {/* Main Content Area */}
            <main className="relative z-10">
                {/* Hero Section */}
                <section className="relative h-[450px] flex items-center overflow-hidden border-b border-stone-800/50">
                    <div className="absolute inset-0 z-0">
                        {/* This would be the generated image or a fallback high-quality gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop"
                            className="w-full h-full object-cover grayscale-[20%] sepia-[10%] opacity-60"
                            alt="Hero Background"
                        />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-20 w-full">
                        <div className="max-w-2xl transform animate-in slide-in-from-left duration-700">
                            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-orange-500 text-black rounded-lg font-black text-[10px] uppercase tracking-[0.2em] mb-6 shadow-lg shadow-orange-500/20">
                                <FaFire />
                                <span>NEW SEASON GEAR</span>
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black text-stone-100 mb-6 leading-[0.9] tracking-tighter">
                                MASTER THE <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">TERRAIN</span>
                            </h1>
                            <p className="text-lg text-stone-400 mb-8 max-w-lg font-medium leading-relaxed">
                                Professional grade offroad equipment and survival apparel designed for those who don't follow roads.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="group px-8 py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all flex items-center space-x-3 shadow-xl shadow-orange-500/20 active:scale-95">
                                    <span>Browse Featured</span>
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <div className="px-6 py-4 bg-stone-900/50 backdrop-blur-md border border-stone-700/50 rounded-xl flex items-center space-x-6">
                                    <div className="text-center border-r border-stone-700 pr-6">
                                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-1">Items</p>
                                        <p className="text-xl font-black text-orange-500">{products.length}</p>
                                    </div>
                                    <div className="flex items-center space-x-2 text-stone-300">
                                        <FaShieldAlt className="text-orange-500" />
                                        <span className="text-xs font-bold whitespace-nowrap uppercase tracking-widest">Certified Gear</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filter & Search Bar - Sticky Header Style */}
                <section className="sticky top-20 z-40 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/50 py-4 shadow-2xl">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="flex flex-col lg:flex-row gap-6 items-center">
                            {/* Categories Chips */}
                            <div className="flex-1 w-full overflow-x-auto scrollbar-hide">
                                <div className="flex space-x-3 min-w-max p-1">
                                    {uniqueCategories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                                                ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/30'
                                                : 'bg-stone-900/50 border border-stone-800 text-stone-400 hover:text-stone-100 hover:border-stone-700'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search & Utility */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
                                <div className="relative w-full sm:w-64">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 text-sm" />
                                    <input
                                        type="text"
                                        placeholder="SEARCH INVENTORY..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-stone-900 border border-stone-800 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold tracking-widest uppercase text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 placeholder-stone-600 transition-all"
                                    />
                                </div>
                                <div className="h-10 w-px bg-stone-800 hidden sm:block"></div>
                                <button className="relative p-3.5 bg-stone-900 border border-stone-800 rounded-2xl hover:border-orange-500 transition-all group overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                    <FaShoppingCart className="text-lg text-orange-500 transition-transform group-hover:scale-110" />
                                    {cart.length > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-black text-[9px] font-black rounded flex items-center justify-center">
                                            {cart.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Product Section */}
                <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 space-y-4">
                            <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                            <p className="text-stone-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Inventory...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredProducts.length > 0 ? filteredProducts.map((product, index) => (
                                <div
                                    key={product._id}
                                    className="group flex flex-col bg-stone-900/40 border border-stone-800/80 rounded-[2rem] overflow-hidden transition-all duration-500 hover:bg-stone-900/60 hover:border-orange-500/40 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-8 duration-500"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-[4/5] overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent z-10"></div>

                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-stone-800 text-stone-600">
                                                <FaBox className="text-6xl opacity-20" />
                                            </div>
                                        )}

                                        {/* Badges */}
                                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                            <span className="px-3 py-1 bg-black/80 backdrop-blur-md border border-stone-700/50 rounded-lg text-[10px] font-black uppercase tracking-widest text-orange-400">
                                                {product.category || 'GEAR'}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black uppercase tracking-tighter mb-1 px-2 py-0.5 rounded w-fit ${product.stock > 10 ? 'bg-green-500/20 text-green-400' :
                                                    product.stock > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {product.stock > 10 ? 'READY TO SHIP' : product.stock > 0 ? `ONLY ${product.stock} LEFT` : 'BACKORDERED'}
                                                </span>
                                            </div>
                                            <div className="bg-stone-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-stone-700/50 shadow-xl">
                                                <span className="text-lg font-black text-white tracking-tighter">${product.price}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Container */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-black text-white mb-2 leading-tight group-hover:text-orange-400 transition-colors uppercase tracking-tight truncate">
                                            {product.name}
                                        </h3>
                                        <p className="text-stone-500 text-sm line-clamp-2 mb-6 font-medium leading-[1.6]">
                                            {product.description}
                                        </p>

                                        <div className="mt-auto flex gap-2">
                                            <button
                                                onClick={() => addToCart(product)}
                                                disabled={product.stock === 0}
                                                className={`flex-1 group/btn relative h-14 rounded-2xl overflow-hidden transition-all duration-300 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center ${product.stock > 0
                                                    ? 'bg-stone-100 text-black hover:bg-orange-500 hover:text-black active:scale-[0.98]'
                                                    : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                                                    }`}
                                            >
                                                {product.stock > 0 ? (
                                                    <span className="flex items-center space-x-2">
                                                        <FaShoppingCart className="group-hover/btn:-translate-y-px transition-transform" />
                                                        <span>ADD TO CART</span>
                                                    </span>
                                                ) : 'SOLDOUT'}
                                            </button>
                                            <button className="w-14 h-14 rounded-2xl bg-stone-800/50 border border-stone-700/50 flex items-center justify-center text-stone-400 hover:text-white hover:border-stone-600 transition-all">
                                                <FaTools size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-24 text-center">
                                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-stone-900 border border-stone-800 mb-6 text-stone-700">
                                        <FaSearch size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">No Match Found</h3>
                                    <p className="text-stone-500 max-w-xs mx-auto font-medium">We couldn't find any gear matching those exact specifications in our database.</p>
                                    <button
                                        onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
                                        className="mt-8 text-orange-500 font-black uppercase tracking-widest text-xs hover:text-orange-400 transition-all border-b border-orange-500/30 pb-1"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Bottom Trust Icons */}
                <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-stone-900">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: FaShieldAlt, title: 'BATTLE TESTED', desc: 'Tested in extreme conditions' },
                            { icon: FaRoute, title: 'WORLDWIDE SHIP', desc: 'Global expedition logistic' },
                            { icon: FaTools, title: 'LIFETIME TECH', desc: 'Professional repair support' },
                            { icon: FaTrophy, title: 'ELITE STATUS', desc: 'Used by offroad champions' }
                        ].map((item) => (
                            <div key={item.title} className="text-center group">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-stone-900 border border-stone-800 rounded-xl mb-4 text-orange-500 group-hover:scale-110 transition-transform">
                                    <item.icon />
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-1">{item.title}</h4>
                                <p className="text-[10px] text-stone-600 font-bold uppercase tracking-widest">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Sticky Floating Action Button for Mobile Chat/Support (Simulated) */}
            <div className="fixed bottom-6 right-6 z-[100] md:hidden">
                <button className="w-16 h-16 bg-orange-600 text-white rounded-2xl shadow-2xl shadow-orange-600/40 flex items-center justify-center active:scale-95 transition-transform">
                    <FaBell size={24} />
                </button>
            </div>
        </div>
    );
};

export default UserEcommerce;
