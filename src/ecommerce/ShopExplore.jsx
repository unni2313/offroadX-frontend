import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { showSuccess } from '../utils/sweetAlert';
import {
    FaShoppingCart,
    FaSearch,
    FaBox,
    FaFilter,
    FaTimes,
    FaTools
} from 'react-icons/fa';

const ShopExplore = () => {
    const { cart, setCart } = useOutletContext();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchProducts();
        // Check for category from URL params
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, [searchParams]);

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
        const existingIndex = cart.findIndex(item => item._id === product._id);
        let newCart;

        if (existingIndex > -1) {
            newCart = cart.map((item, index) =>
                index === existingIndex
                    ? { ...item, quantity: (item.quantity || 1) + 1 }
                    : item
            );
        } else {
            newCart = [...cart, { ...product, quantity: 1 }];
        }

        setCart(newCart);
        localStorage.setItem('shopCart', JSON.stringify(newCart));
        showSuccess('Added to Cart', `${product.name} is ready for checkout!`);
    };

    const uniqueCategories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' ? true : product.category === selectedCategory;

        let matchesPrice = true;
        if (priceRange === 'under50') matchesPrice = product.price < 50;
        else if (priceRange === '50to100') matchesPrice = product.price >= 50 && product.price <= 100;
        else if (priceRange === '100to300') matchesPrice = product.price >= 100 && product.price <= 300;
        else if (priceRange === 'over300') matchesPrice = product.price > 300;

        return matchesSearch && matchesCategory && matchesPrice;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('All');
        setPriceRange('all');
    };

    const hasActiveFilters = searchTerm || selectedCategory !== 'All' || priceRange !== 'all';

    return (
        <>
            {/* Filter & Search Bar */}
            <section className="sticky top-20 z-40 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/50 py-4 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
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
                                    placeholder="SEARCH..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-stone-900 border border-stone-800 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold tracking-widest uppercase text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 placeholder-stone-600 transition-all"
                                />
                            </div>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-3.5 bg-stone-900 border rounded-2xl transition-all ${showFilters ? 'border-orange-500 text-orange-500' : 'border-stone-800 text-stone-400 hover:border-orange-500'}`}
                            >
                                <FaFilter className="text-lg" />
                            </button>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center space-x-2"
                                >
                                    <FaTimes />
                                    <span>Clear</span>
                                </button>
                            )}

                           
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-stone-900/50 rounded-2xl border border-stone-800/50 animate-in slide-in-from-top duration-200">
                            <div className="flex flex-wrap gap-4 items-center">
                                <div>
                                    <label className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-2 block">Price Range</label>
                                    <select
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(e.target.value)}
                                        className="bg-stone-800 border border-stone-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                                    >
                                        <option value="all">All Prices</option>
                                        <option value="under50">Under $50</option>
                                        <option value="50to100">$50 - $100</option>
                                        <option value="100to300">$100 - $300</option>
                                        <option value="over300">Over $300</option>
                                    </select>
                                </div>
                                <div className="text-stone-500 text-sm">
                                    Showing <span className="text-orange-500 font-bold">{filteredProducts.length}</span> of <span className="font-bold">{products.length}</span> products
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Product Grid */}
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
                                    onClick={clearFilters}
                                    className="mt-8 text-orange-500 font-black uppercase tracking-widest text-xs hover:text-orange-400 transition-all border-b border-orange-500/30 pb-1"
                                >
                                    Clear Search
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </>
    );
};

export default ShopExplore;
