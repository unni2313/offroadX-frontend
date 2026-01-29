import React, { useState, useEffect } from 'react';
import {
    FaCreditCard,
    FaLock,
    FaCheckCircle,
    FaSpinner,
    FaTimes,
    FaShieldAlt,
    FaCcVisa,
    FaCcMastercard,
    FaUserSecret
} from 'react-icons/fa';

const FakePaymentGateway = ({ amount, onSuccess, onCancel }) => {
    const [step, setStep] = useState('input'); // 'input', 'processing', 'success'
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCardData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStep('processing');

        // Simulate processing time
        setTimeout(() => {
            setStep('success');
            // Wait a bit more to show success before calling callback
            setTimeout(() => {
                onSuccess();
            }, 2000);
        }, 3000);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={step === 'input' ? onCancel : undefined}></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300">

                {/* Header Decoration */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600"></div>

                {step === 'input' && (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight uppercase">SECURE CHECKOUT</h2>
                                <p className="text-stone-500 text-xs font-bold tracking-widest uppercase mt-1 flex items-center gap-2">
                                    <FaLock className="text-orange-500" />
                                    <span>Encrypted Gateway</span>
                                </p>
                            </div>
                            <button onClick={onCancel} className="p-2 text-stone-500 hover:text-white transition-colors">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Order Summary */}
                        <div className="mb-8 p-4 bg-black/30 rounded-2xl border border-stone-800/50 flex justify-between items-center">
                            <span className="text-stone-400 text-sm font-bold uppercase tracking-widest">Total Payable</span>
                            <span className="text-2xl font-black text-orange-500">${amount.toFixed(2)}</span>
                        </div>

                        {/* Card Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">Card Number</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="text"
                                        name="number"
                                        placeholder="0000 0000 0000 0000"
                                        value={cardData.number}
                                        onChange={handleInputChange}
                                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3.5 text-white placeholder-stone-700 focus:border-orange-500 focus:outline-none transition-all font-mono tracking-wider"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 text-xl text-stone-700">
                                        <FaCcVisa />
                                        <FaCcMastercard />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">Cardholder Name</label>
                                <input
                                    required
                                    type="text"
                                    name="name"
                                    placeholder="JOHN DOE"
                                    value={cardData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3.5 text-white placeholder-stone-700 focus:border-orange-500 focus:outline-none transition-all uppercase tracking-widest text-sm font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">Expiry</label>
                                    <input
                                        required
                                        type="text"
                                        name="expiry"
                                        placeholder="MM / YY"
                                        value={cardData.expiry}
                                        onChange={handleInputChange}
                                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3.5 text-white placeholder-stone-700 focus:border-orange-500 focus:outline-none transition-all font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">CVV</label>
                                    <input
                                        required
                                        type="password"
                                        name="cvv"
                                        placeholder="***"
                                        maxLength="3"
                                        value={cardData.cvv}
                                        onChange={handleInputChange}
                                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3.5 text-white placeholder-stone-700 focus:border-orange-500 focus:outline-none transition-all font-mono"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-6 py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <FaShieldAlt />
                                <span>Pay ${amount.toFixed(2)} Now</span>
                            </button>
                        </form>

                        <div className="mt-6 flex justify-center items-center gap-6 opacity-30">
                            <FaCcVisa className="text-3xl" />
                            <FaCcMastercard className="text-3xl" />
                            <FaUserSecret className="text-2xl" />
                        </div>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="p-16 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
                        <div className="relative">
                            <FaSpinner className="text-6xl text-orange-500 animate-spin" />
                            <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">VALIDATING TRANSACTION</h3>
                            <p className="text-stone-500 text-xs font-bold uppercase tracking-widest max-w-[200px]">Connecting to secure offroad banking network...</p>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="p-16 flex flex-col items-center justify-center text-center space-y-8 animate-in slide-in-from-bottom-8 duration-500">
                        <div className="relative">
                            <FaCheckCircle className="text-7xl text-green-500" />
                            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">PAYMENT SUCCESSFUL</h3>
                            <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">Your funds have been verified. Finalizing your order...</p>
                        </div>

                        {/* Transaction ID */}
                        <div className="px-4 py-2 bg-stone-950 rounded-lg border border-stone-800">
                            <span className="text-[10px] font-mono text-stone-600">TXN_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FakePaymentGateway;
