import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { showSuccess } from '../utils/sweetAlert';
import {
    FaShoppingCart,
    FaArrowRight,
    FaFire,
    FaShieldAlt,
    FaRoute,
    FaTools,
    FaTrophy,
    FaBox
} from 'react-icons/fa';

const ShopHome = () => {
    const { cart, setCart } = useOutletContext();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

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
        const newCart = [...cart, { ...product, quantity: 1 }];
        setCart(newCart);
        localStorage.setItem('shopCart', JSON.stringify(newCart));
        showSuccess('Added to Cart', `${product.name} is ready for checkout!`);
    };

    // Get featured products (first 4 in stock)
    const featuredProducts = products.filter(p => p.stock > 0).slice(0, 4);

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    return (
        <>
            {/* Hero Section */}
            <section className="relative h-[450px] flex items-center overflow-hidden border-b border-stone-800/50">
                <div className="absolute inset-0 z-0">
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
                            <button
                                onClick={() => navigate('/ecommerce/explore')}
                                className="group px-8 py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all flex items-center space-x-3 shadow-xl shadow-orange-500/20 active:scale-95"
                            >
                                <span>Browse Full Catalog</span>
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

            {/* Categories Section */}
            {categories.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                    <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-tight">Shop by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => navigate(`/ecommerce/explore?category=${encodeURIComponent(cat)}`)}
                                className="group p-6 bg-stone-900/50 border border-stone-800 rounded-2xl hover:border-orange-500/50 transition-all hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                                    <FaBox className="text-orange-500 text-xl" />
                                </div>
                                <h3 className="text-lg font-bold text-white uppercase tracking-tight">{cat}</h3>
                                <p className="text-sm text-stone-500 mt-1">
                                    {products.filter(p => p.category === cat).length} items
                                </p>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Featured Products Section */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Featured Gear</h2>
                    <button
                        onClick={() => navigate('/ecommerce/explore')}
                        className="text-orange-500 font-bold uppercase tracking-widest text-xs hover:text-orange-400 transition-all flex items-center space-x-2"
                    >
                        <span>View All</span>
                        <FaArrowRight />
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                        <p className="text-stone-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Loading...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((product, index) => (
                            <div
                                key={product._id}
                                className="group flex flex-col bg-stone-900/40 border border-stone-800/80 rounded-[2rem] overflow-hidden transition-all duration-500 hover:bg-stone-900/60 hover:border-orange-500/40 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-8 duration-500"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Image Container */}
                                <div className="relative aspect-square overflow-hidden">
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

                                    {/* Price Badge */}
                                    <div className="absolute bottom-4 right-4 z-20 bg-stone-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-stone-700/50 shadow-xl">
                                        <span className="text-lg font-black text-white tracking-tighter">${product.price}</span>
                                    </div>
                                </div>

                                {/* Content Container */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-black text-white mb-2 leading-tight group-hover:text-orange-400 transition-colors uppercase tracking-tight truncate">
                                        {product.name}
                                    </h3>
                                    <p className="text-stone-500 text-sm line-clamp-2 mb-4 font-medium leading-[1.6]">
                                        {product.description}
                                    </p>

                                    <button
                                        onClick={() => addToCart(product)}
                                        className="mt-auto w-full h-12 rounded-xl bg-stone-100 text-black hover:bg-orange-500 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-2 active:scale-[0.98] transition-all"
                                    >
                                        <FaShoppingCart />
                                        <span>Add to Cart</span>
                                    </button>
                                </div>
                            </div>
                        ))}
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
        </>
    );
};

export default ShopHome;
