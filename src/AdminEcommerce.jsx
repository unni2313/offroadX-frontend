import React, { useState, useEffect } from 'react';
import { FaBox, FaShoppingCart, FaUsers, FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEllipsisV, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import API_BASE_URL from './config/api';

const AdminEcommerce = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, orderRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/ecommerce/products`),
                axios.get(`${API_BASE_URL}/api/ecommerce/orders`)
            ]);
            setProducts(prodRes.data);
            setOrders(orderRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingProduct
            ? `${API_BASE_URL}/api/ecommerce/products/${editingProduct._id}`
            : `${API_BASE_URL}/api/ecommerce/products`;

        try {
            if (editingProduct) {
                await axios.put(url, formData);
            } else {
                await axios.post(url, formData);
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            setFormData({ name: '', description: '', price: '', category: '', stock: '', image: '' });
            fetchData();
        } catch (err) {
            console.error('Error saving product:', err);
            alert('Error saving product. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${API_BASE_URL}/api/ecommerce/products/${id}`);
                fetchData();
            } catch (err) {
                console.error('Error deleting product:', err);
            }
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price,
                category: product.category || '',
                stock: product.stock,
                image: product.image || ''
            });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', description: '', price: '', category: '', stock: '', image: '' });
        }
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading e-commerce data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500">
                            E-commerce Management
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg">Manage your products, inventory, and orders.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-orange-500/20 transform hover:scale-105 active:scale-95"
                >
                    <FaPlus />
                    <span>Add New Product</span>
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="w-full overflow-x-auto pb-2 md:pb-0">
                <div className="flex items-center gap-2 p-1 bg-slate-800/50 rounded-2xl w-max md:w-fit border border-slate-700/50">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'products'
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                            }`}
                    >
                        <FaBox className="text-sm" />
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'orders'
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                            }`}
                    >
                        <FaShoppingCart className="text-sm" />
                        Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'customers'
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                            }`}
                    >
                        <FaUsers className="text-sm" />
                        Customers
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
                {activeTab === 'products' && (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-700/50 bg-slate-700/20">
                                        <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {products.length > 0 ? products.map((product) => (
                                        <tr key={product._id} className="hover:bg-slate-700/20 transition-all group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center overflow-hidden">
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <FaBox className="text-orange-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white group-hover:text-orange-400 transition-colors">{product.name}</p>
                                                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{product.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 text-sm">{product.category}</td>
                                            <td className="px-6 py-4 text-white font-mono font-semibold">${product.price.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-slate-300 text-sm">{product.stock} units</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.status === 'In Stock' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    product.status === 'Low Stock' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                        'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openModal(product)}
                                                        className="p-2 bg-slate-700/50 hover:bg-orange-500/20 rounded-lg text-slate-400 hover:text-orange-400 transition-all border border-slate-600/50"
                                                    >
                                                        <FaEdit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="p-2 bg-slate-700/50 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all border border-slate-600/50"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500">No products found. Add your first product to get started!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                            {products.length > 0 ? products.map((product) => (
                                <div key={product._id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex gap-4">
                                    <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center overflow-hidden">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <FaBox className="text-orange-400 text-2xl" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-bold text-white truncate pr-2">{product.name}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${product.status === 'In Stock' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                product.status === 'Low Stock' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                {product.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-2 truncate">{product.category}</p>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-orange-400 font-mono font-bold">${product.price.toFixed(2)}</p>
                                                <p className="text-xs text-slate-400">{product.stock} units</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openModal(product)} className="p-2 bg-slate-700/50 text-slate-400 rounded-lg border border-slate-600/50"><FaEdit size={12} /></button>
                                                <button onClick={() => handleDelete(product._id)} className="p-2 bg-slate-700/50 text-red-400 rounded-lg border border-slate-600/50"><FaTrash size={12} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center text-slate-500 py-8">No products found. Add your first product to get started!</div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'orders' && (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-700/50 bg-slate-700/20">
                                        <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {orders.length > 0 ? orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-slate-700/20 transition-all">
                                            <td className="px-6 py-4 font-mono text-orange-400 text-sm font-bold">{order.orderId}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-white text-sm font-medium">{order.customerName}</p>
                                                <p className="text-xs text-slate-500">{order.customerEmail}</p>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 text-sm">{new Date(order.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-white font-mono font-semibold">${order.totalAmount.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'Delivered' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                    order.status === 'Processing' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                        order.status === 'Shipped' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                                            'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-all border border-slate-600/50">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500">No orders found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                            {orders.length > 0 ? orders.map((order) => (
                                <div key={order._id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-mono text-orange-400 text-sm font-bold">{order.orderId}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${order.status === 'Delivered' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            order.status === 'Processing' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                order.status === 'Shipped' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                                    'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-white text-sm font-medium">{order.customerName}</p>
                                            <p className="text-xs text-slate-500">{order.customerEmail}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-mono font-bold">${order.totalAmount.toFixed(2)}</p>
                                            <p className="text-xs text-slate-500">{new Date(order.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg border border-slate-600/50">
                                        View Details
                                    </button>
                                </div>
                            )) : (
                                <div className="text-center text-slate-500 py-8">No orders found.</div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'customers' && (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 border border-slate-600/50">
                            <FaUsers size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Customer Management</h3>
                        <p className="text-slate-400 max-w-md mx-auto">Customer tracking is currently being integrated with your CRM. Stay tuned!</p>
                    </div>
                )}
            </div>

            {/* Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                            <h3 className="text-xl font-bold text-white">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                                        placeholder="e.g. Offroad Tires"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400">Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                                        placeholder="e.g. Accessories"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                                        placeholder="299.99"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400">Initial Stock</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                                        placeholder="10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400">Image URL</label>
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500 resize-none"
                                    placeholder="Describe your product..."
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20"
                                >
                                    {editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEcommerce;
