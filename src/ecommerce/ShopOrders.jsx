import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import {
    FaBox,
    FaCheckCircle,
    FaTruck,
    FaClipboardList,
    FaSpinner,
    FaTimesCircle,
    FaChevronDown,
    FaChevronUp,
    FaShoppingBag,
    FaArrowRight
} from 'react-icons/fa';

const ShopOrders = () => {
    const { user } = useOutletContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/ecommerce/orders/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrders(response.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            if (err.response?.status === 401) {
                // The ShopLayout context provides user but we might need a way to logout
                // navigate to home to trigger Layout's logout or handle here
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login', { state: { message: 'Session expired. Please login again.' } });
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            'Processing': {
                icon: FaSpinner,
                color: 'text-blue-400',
                bgColor: 'bg-blue-500/10',
                borderColor: 'border-blue-500/30',
                step: 1
            },
            'Shipped': {
                icon: FaTruck,
                color: 'text-amber-400',
                bgColor: 'bg-amber-500/10',
                borderColor: 'border-amber-500/30',
                step: 2
            },
            'Delivered': {
                icon: FaCheckCircle,
                color: 'text-green-400',
                bgColor: 'bg-green-500/10',
                borderColor: 'border-green-500/30',
                step: 3
            },
            'Cancelled': {
                icon: FaTimesCircle,
                color: 'text-red-400',
                bgColor: 'bg-red-500/10',
                borderColor: 'border-red-500/30',
                step: 0
            }
        };
        return configs[status] || configs['Processing'];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-stone-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Loading Orders...</p>
            </div>
        );
    }

    return (
        <section className="max-w-5xl mx-auto px-4 md:px-8 py-12">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">My Orders</h1>
                <p className="text-stone-400 font-medium">Track and manage your offroad gear orders</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-24">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-stone-900 border border-stone-800 mb-6 text-stone-700">
                        <FaShoppingBag size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">No Orders Yet</h3>
                    <p className="text-stone-500 max-w-xs mx-auto font-medium mb-8">You haven't placed any orders yet. Start exploring our gear collection!</p>
                    <button
                        onClick={() => navigate('/ecommerce/explore')}
                        className="px-8 py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all flex items-center space-x-3 mx-auto shadow-xl shadow-orange-500/20"
                    >
                        <span>Start Shopping</span>
                        <FaArrowRight />
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order, index) => {
                        const statusConfig = getStatusConfig(order.status);
                        const isExpanded = expandedOrder === order._id;
                        const StatusIcon = statusConfig.icon;

                        return (
                            <div
                                key={order._id}
                                className={`bg-stone-900/50 border rounded-2xl overflow-hidden transition-all duration-300 ${statusConfig.borderColor} animate-in fade-in slide-in-from-bottom-4`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Order Header */}
                                <div
                                    className="p-6 cursor-pointer hover:bg-stone-800/30 transition-colors"
                                    onClick={() => toggleExpand(order._id)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-xl ${statusConfig.bgColor} flex items-center justify-center`}>
                                                <StatusIcon className={`text-xl ${statusConfig.color} ${order.status === 'Processing' ? 'animate-spin' : ''}`} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-1">Order ID</p>
                                                <p className="text-white font-black tracking-tight">{order.orderId}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-6">
                                            <div className="text-right">
                                                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-1">Total</p>
                                                <p className="text-xl font-black text-orange-500">${order.totalAmount.toFixed(2)}</p>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-1">Date</p>
                                                <p className="text-white font-medium text-sm">{formatDate(order.createdAt || order.date)}</p>
                                            </div>
                                            <div className={`px-4 py-2 rounded-xl ${statusConfig.bgColor} ${statusConfig.color} font-bold text-xs uppercase tracking-widest`}>
                                                {order.status}
                                            </div>
                                            <button className="text-stone-400 hover:text-white transition-colors">
                                                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t border-stone-800/50 p-6 bg-stone-950/30 animate-in slide-in-from-top duration-200">
                                        {/* Order Progress */}
                                        {order.status !== 'Cancelled' && (
                                            <div className="mb-8">
                                                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-4">Order Progress</p>
                                                <div className="flex items-center justify-between relative">
                                                    {/* Progress Line */}
                                                    <div className="absolute left-6 right-6 top-4 h-0.5 bg-stone-800">
                                                        <div
                                                            className="h-full bg-orange-500 transition-all duration-500"
                                                            style={{ width: `${((statusConfig.step - 1) / 2) * 100}%` }}
                                                        ></div>
                                                    </div>

                                                    {[
                                                        { label: 'Processing', step: 1, icon: FaClipboardList },
                                                        { label: 'Shipped', step: 2, icon: FaTruck },
                                                        { label: 'Delivered', step: 3, icon: FaCheckCircle }
                                                    ].map((stage) => (
                                                        <div key={stage.step} className="flex flex-col items-center relative z-10">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${statusConfig.step >= stage.step
                                                                ? 'bg-orange-500 text-black'
                                                                : 'bg-stone-800 text-stone-600'
                                                                }`}>
                                                                <stage.icon className="text-sm" />
                                                            </div>
                                                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${statusConfig.step >= stage.step ? 'text-white' : 'text-stone-600'
                                                                }`}>
                                                                {stage.label}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Order Items */}
                                        <div>
                                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-4">Order Items</p>
                                            <div className="space-y-3">
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between p-4 bg-stone-900/50 rounded-xl border border-stone-800/50">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="w-12 h-12 bg-stone-800 rounded-lg flex items-center justify-center">
                                                                <FaBox className="text-stone-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-bold">{item.name}</p>
                                                                <p className="text-stone-500 text-sm">Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-orange-500 font-black">${(item.price * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Shipping Address */}
                                        {order.shippingAddress && (
                                            <div className="mt-6 pt-6 border-t border-stone-800/50">
                                                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-2">Shipping Address</p>
                                                <p className="text-stone-300">{order.shippingAddress}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default ShopOrders;
