import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ShoppingBag, CheckCircle, Loader, ShieldCheck, Truck, Headphones, Award, Star, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Dummy Gateway States
  const [showDummyGateway, setShowDummyGateway] = useState(false);
  const [dummyStatus, setDummyStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [dummyCard, setDummyCard] = useState('4111 2222 3333 4444');
  const [dummyExpiry, setDummyExpiry] = useState('12/28');
  const [dummyCvv, setDummyCvv] = useState('123');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    notes: ''
  });

  if (items.length === 0 && !orderComplete) {
    return <Navigate to="/cart" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handlePayment();
    }
  };

  const handlePayment = () => {
    setShowDummyGateway(true);
    setDummyStatus('idle');
  };

  const simulateSuccess = async () => {
    setDummyStatus('processing');
    setProcessingPayment(true);
    
    const tax = totalPrice * 0.18; // 18% GST
    const grandTotal = totalPrice + tax;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    setDummyStatus('success');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const simulatedPaymentId = `pay_sim_${Date.now().toString().slice(-6)}`;
      const order = await createOrder({
        customer: formData,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal: totalPrice,
        tax: tax,
        total: grandTotal,
        paymentStatus: 'paid',
        paymentId: simulatedPaymentId,
        paymentMethod: 'razorpay_dummy'
      });

      if (order) {
        toast.success('Order placed successfully!');
        clearCart();
        setOrderComplete(true);
      } else {
        toast.error('Failed to create order');
      }
    } catch (err) {
      console.error('Error simulating order creation:', err);
      toast.error('An error occurred during order creation');
    } finally {
      setShowDummyGateway(false);
      setProcessingPayment(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const simulateFailure = async () => {
    setDummyStatus('processing');
    setProcessingPayment(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setDummyStatus('failed');
    setProcessingPayment(false);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[#f8f8f7] flex items-center justify-center py-16 px-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white p-12 rounded-[32px] shadow-2xl shadow-gray-200/50 text-center max-w-lg mx-auto border border-gray-100"
        >
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle className="w-12 h-12 text-green-500" />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Order Complete</h1>
          <p className="text-gray-500 mb-8 text-lg leading-relaxed">
            Thank you for your premium purchase. Your beautifully crafted items will be processed and shipped within 2-3 business days.
          </p>
          <div className="bg-gray-50 py-4 px-6 rounded-2xl mb-10 border border-gray-100 inline-block">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Order Number</span>
            <span className="text-lg font-mono font-bold text-gray-900">#GS{Date.now().toString().slice(-8)}</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-900 text-white px-8 py-4 rounded-full hover:bg-blue-600 transition-all duration-300 font-bold text-lg shadow-lg shadow-gray-200"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  const tax = totalPrice * 0.18; // 18% GST
  const grandTotal = totalPrice + tax;

  return (
    <div className="min-h-screen bg-[#f8f8f7] font-sans pb-20">
      
      {/* Premium Header */}
      <div className="pt-16 pb-12 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">Checkout</h1>
          <p className="text-gray-500 font-medium text-sm md:text-base">Complete your secure luxury purchase</p>
        </motion.div>
      </div>

      {/* Modern Stepper */}
      <div className="max-w-3xl mx-auto mb-16 px-4">
        <div className="flex items-center justify-center space-x-4 md:space-x-8">
          <div className={`flex items-center space-x-3 transition-colors duration-500 ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
              step >= 1 ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <span className="font-bold text-sm md:text-base tracking-wide">Shipping</span>
          </div>
          <div className="w-12 md:w-24 h-[2px] bg-gray-200 rounded-full relative overflow-hidden">
            <div className={`absolute top-0 left-0 h-full bg-gray-900 transition-all duration-700 ease-out ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className={`flex items-center space-x-3 transition-colors duration-500 ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
              step >= 2 ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <span className="font-bold text-sm md:text-base tracking-wide">Payment</span>
          </div>
        </div>
      </div>

      {/* Main Checkout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-[24px] shadow-sm shadow-gray-200/50 border border-gray-100 p-6 md:p-10"
            >
              <form onSubmit={handleSubmit}>
                
                {step === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight">Shipping Details</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium outline-none shadow-sm"
                          placeholder="Enter your first name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium outline-none shadow-sm"
                          placeholder="Enter your last name"
                        />
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium outline-none shadow-sm"
                          placeholder="Enter your email address"
                        />
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium outline-none shadow-sm"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Street Address</label>
                        <input
                          type="text"
                          name="address"
                          required
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium outline-none shadow-sm"
                          placeholder="Enter your street address"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">City</label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium outline-none shadow-sm"
                          placeholder="City"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">State</label>
                        <input
                          type="text"
                          name="state"
                          required
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium outline-none shadow-sm"
                          placeholder="State"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">ZIP Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          required
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium outline-none shadow-sm"
                          placeholder="ZIP/Postal Code"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center tracking-tight">
                      <CreditCard className="w-7 h-7 mr-3 text-gray-900" />
                      Payment Method
                    </h2>
                    
                    <div className="p-8 bg-gray-50 rounded-2xl mb-8 border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-900 font-bold text-lg">
                          Secure Payment
                        </p>
                        <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-6 opacity-70" />
                      </div>
                      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        All transactions are secure and encrypted. You will be redirected to the Razorpay secure gateway to complete your purchase.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="bg-white px-4 py-2 rounded-lg text-xs font-bold text-gray-700 shadow-sm border border-gray-100">Credit Card</span>
                        <span className="bg-white px-4 py-2 rounded-lg text-xs font-bold text-gray-700 shadow-sm border border-gray-100">UPI</span>
                        <span className="bg-white px-4 py-2 rounded-lg text-xs font-bold text-gray-700 shadow-sm border border-gray-100">Netbanking</span>
                        <span className="bg-white px-4 py-2 rounded-lg text-xs font-bold text-gray-700 shadow-sm border border-gray-100">Wallets</span>
                      </div>
                    </div>

                    <div className="p-5 bg-green-50/50 border border-green-100 rounded-2xl flex items-start space-x-4">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Lock className="w-5 h-5 text-green-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-green-900 mb-1">256-Bit Encryption</h4>
                        <span className="text-xs text-green-800 leading-relaxed block">Your payment information is handled with bank-level security. We never store your card details.</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
                  {step === 2 && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={processingPayment}
                      className="sm:w-1/3 bg-white border border-gray-200 text-gray-700 py-4 px-6 rounded-full hover:bg-gray-50 transition-colors font-bold text-sm disabled:opacity-50"
                    >
                      Back to Shipping
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={processingPayment}
                    className={`flex-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-bold text-sm md:text-base disabled:opacity-50 flex items-center justify-center shadow-xl shadow-gray-200/50 hover:-translate-y-0.5 ${step === 1 ? 'w-full' : ''}`}
                  >
                    {processingPayment ? (
                      <span className="flex items-center gap-2">
                        <Loader className="animate-spin" size={18} /> Processing...
                      </span>
                    ) : step === 1 ? (
                      'Continue to Payment'
                    ) : (
                      `Pay ₹${grandTotal.toFixed(2)} Securely`
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Trust Elements under button (Mobile only or everywhere) */}
            <div className="mt-8 flex justify-center items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2"><Lock size={14} /><span className="text-xs font-semibold">SSL Secured</span></div>
              <div className="flex items-center gap-2"><ShieldCheck size={14} /><span className="text-xs font-semibold">Buyer Protection</span></div>
              <div className="flex items-center gap-2"><RefreshCw size={14} /><span className="text-xs font-semibold">Easy Returns</span></div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-[24px] shadow-lg shadow-gray-200/50 border border-gray-100 p-8 sticky top-24"
            >
              <h2 className="text-xl font-extrabold text-gray-900 mb-8 flex items-center tracking-tight">
                <ShoppingBag className="w-5 h-5 mr-3 text-gray-400" />
                Order Summary
              </h2>
              
              <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 group">
                    <div className="relative w-20 h-20 bg-[#f8f8f7] rounded-xl flex items-center justify-center p-2 border border-gray-100 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110"
                      />
                      <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm leading-snug mb-1">{item.name}</h4>
                      <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-black text-gray-900 text-sm">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="font-bold text-gray-900">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Shipping Delivery</span>
                  <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">Complimentary</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Tax (18% GST)</span>
                  <span className="font-bold text-gray-900">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                  <span className="text-base font-medium text-gray-500">Total to pay</span>
                  <span className="text-3xl font-black text-gray-900 tracking-tight">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* BEFORE FOOTER: Why Shop With Ghar Sansar */}
      <div className="border-t border-gray-200 mt-12 bg-white relative overflow-hidden py-24">
        {/* Subtle blur backdrop */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-gray-50/80 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Why Shop With Ghar Sansar</h2>
            <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">Experience a new standard of luxury shopping. We are committed to delivering excellence straight to your home.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Trust Card 1 */}
            <div className="bg-white/80 backdrop-blur-lg border border-gray-100 rounded-[24px] p-8 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Curated collections of the highest grade materials crafted for sophisticated modern interiors.</p>
            </div>

            {/* Trust Card 2 */}
            <div className="bg-white/80 backdrop-blur-lg border border-gray-100 rounded-[24px] p-8 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fast & Secure Delivery</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Complimentary insured shipping in specialized packaging to ensure pristine condition upon arrival.</p>
            </div>

            {/* Trust Card 3 */}
            <div className="bg-white/80 backdrop-blur-lg border border-gray-100 rounded-[24px] p-8 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Trusted Interior Experts</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Over a decade of experience styling and outfitting premium homes across Andhra Pradesh & Telangana.</p>
            </div>

            {/* Trust Card 4 */}
            <div className="bg-white/80 backdrop-blur-lg border border-gray-100 rounded-[24px] p-8 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">24/7 Assistance</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Dedicated concierge support team ready to assist you with tracking, replacements, and styling advice.</p>
            </div>
          </div>

          <div className="text-center">
            <span className="inline-block bg-gray-50 text-gray-600 text-sm font-bold px-6 py-3 rounded-full border border-gray-200 shadow-sm">
              ✨ Trusted by 10,000+ happy homes across AP & Telangana
            </span>
          </div>
        </div>
      </div>

      {/* Simulated Razorpay Payment Gateway Modal */}
      <AnimatePresence>
        {showDummyGateway && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[24px] shadow-2xl overflow-hidden w-full max-w-md border border-gray-100"
            >
              {/* Header */}
              <div className="bg-gray-900 px-6 py-5 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span className="font-bold tracking-wide">Secure Checkout</span>
                  <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded font-mono uppercase tracking-widest ml-2">Test Mode</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDummyGateway(false)}
                  disabled={dummyStatus === 'processing'}
                  className="text-gray-400 hover:text-white transition-colors disabled:opacity-30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              {/* Merchant Brand Bar */}
              <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-gray-900">Ghar Sansar</h3>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">Order #{Date.now().toString().slice(-6)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold mb-0.5">Total Amount</span>
                  <span className="text-xl font-black text-gray-900">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Gateway States Content */}
              <div className="p-6">
                {dummyStatus === 'idle' && (
                  <div className="space-y-6">
                    <div className="space-y-4 bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-between">
                        <span>Test Card Credentials</span>
                        <CreditCard size={14} className="text-gray-300" />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <input type="text" readOnly value={dummyCard} className="w-full text-sm font-mono font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" readOnly value={dummyExpiry} className="w-full text-sm font-mono font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none text-center" />
                          <input type="text" readOnly value={dummyCvv} className="w-full text-sm font-mono font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none text-center" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={simulateSuccess}
                        className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center text-sm tracking-wide"
                      >
                        Simulate Successful Payment
                      </button>
                      <button
                        type="button"
                        onClick={simulateFailure}
                        className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-red-600 py-3 rounded-xl font-bold transition-all flex items-center justify-center text-sm"
                      >
                        Simulate Failure
                      </button>
                    </div>
                  </div>
                )}

                {dummyStatus === 'processing' && (
                  <div className="py-16 flex flex-col items-center justify-center space-y-6">
                    <Loader className="w-10 h-10 text-gray-900 animate-spin" />
                    <div className="text-center">
                      <h4 className="font-bold text-gray-900 mb-1">Processing Payment</h4>
                      <p className="text-sm text-gray-500">Please do not close this window...</p>
                    </div>
                  </div>
                )}

                {dummyStatus === 'success' && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-5 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">Payment Successful</h4>
                      <p className="text-sm text-gray-500">Redirecting to order confirmation...</p>
                    </div>
                  </div>
                )}

                {dummyStatus === 'failed' && (
                  <div className="py-10 flex flex-col items-center justify-center space-y-5 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">Transaction Failed</h4>
                      <p className="text-sm text-gray-500 px-4 mb-6">Your card was declined. Please verify details and try again.</p>
                      <button
                        type="button"
                        onClick={() => setDummyStatus('idle')}
                        className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold transition"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer lock note */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-center space-x-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                <span>PCI-DSS Compliant Encryption</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;