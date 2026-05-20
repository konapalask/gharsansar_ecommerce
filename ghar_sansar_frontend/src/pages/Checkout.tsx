import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ShoppingBag, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { initializeRazorpayPayment } from '../utils/razorpay';
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
    // Shipping
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    
    // Order notes
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
    } else {
      // Process payment with our Dummy Gateway Modal
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-md mx-4"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Complete!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order will be processed and shipped within 2-3 business days.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Order #GS{Date.now().toString().slice(-8)}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center space-x-3 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="font-medium">Shipping</span>
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center space-x-3 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address *
                        </label>
                        <input
                          type="text"
                          name="address"
                          required
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          required
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          required
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <CreditCard className="w-6 h-6 mr-3 text-blue-600" />
                      Payment via Razorpay
                    </h2>
                    
                    <div className="p-6 bg-blue-50 rounded-lg mb-6">
                      <p className="text-gray-700 mb-4">
                        <strong>Secure Payment</strong> powered by Razorpay
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-white px-3 py-1 rounded-md text-sm font-medium">Cards</span>
                        <span className="bg-white px-3 py-1 rounded-md text-sm font-medium">UPI</span>
                        <span className="bg-white px-3 py-1 rounded-md text-sm font-medium">Netbanking</span>
                        <span className="bg-white px-3 py-1 rounded-md text-sm font-medium">Wallets</span>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-800">Your payment information is secure and encrypted</span>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex space-x-4">
                  {step === 2 && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={processingPayment}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
                    >
                      Back to Shipping
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={processingPayment}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center"
                  >
                    {processingPayment ? (
                      <>
                        <Loader className="animate-spin mr-2" size={20} />
                        Processing...
                      </>
                    ) : step === 1 ? (
                      'Continue to Payment'
                    ) : (
                      'Pay ₹' + (totalPrice * 1.18).toFixed(2)
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 h-fit"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <ShoppingBag className="w-6 h-6 mr-3" />
              Order Summary
            </h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (18% GST):</span>
                <span className="font-semibold">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200">
                <span>Total:</span>
                <span className="text-blue-600">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Simulated Razorpay Payment Gateway Modal */}
      {showDummyGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md border border-gray-100"
          >
            {/* Header */}
            <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span className="font-semibold tracking-wide">Razorpay Secure</span>
                <span className="text-[10px] bg-blue-500 px-2 py-0.5 rounded font-mono uppercase">Simulated</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDummyGateway(false)}
                disabled={dummyStatus === 'processing'}
                className="text-white/80 hover:text-white text-xl font-bold disabled:opacity-30"
              >
                ×
              </button>
            </div>

            {/* Merchant Brand Bar */}
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Ghar Sansar</h3>
                <p className="text-xs text-gray-500">Order #{Date.now().toString().slice(-6)}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block font-medium">Amount to Pay</span>
                <span className="text-xl font-extrabold text-blue-600">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Gateway States Content */}
            <div className="p-6">
              {dummyStatus === 'idle' && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Preferred Payment Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button type="button" className="border-2 border-blue-500 bg-blue-50/50 text-blue-700 py-2 rounded-lg text-xs font-bold flex flex-col items-center justify-center">
                        <CreditCard className="w-4 h-4 mb-1" />
                        Card
                      </button>
                      <button type="button" className="border border-gray-200 hover:border-blue-300 py-2 rounded-lg text-xs font-medium text-gray-600 flex flex-col items-center justify-center">
                        <span className="font-bold tracking-tighter mb-1 text-blue-600">UPI</span>
                        GooglePay/PhonePe
                      </button>
                      <button type="button" className="border border-gray-200 hover:border-blue-300 py-2 rounded-lg text-xs font-medium text-gray-600 flex flex-col items-center justify-center">
                        <span className="font-bold mb-1 text-purple-600">Net</span>
                        NetBanking
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Test Card details</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <span className="text-[10px] text-gray-400 block font-medium">Card Number</span>
                        <input
                          type="text"
                          readOnly
                          value={dummyCard}
                          className="w-full text-sm font-mono bg-white border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium">Expiry</span>
                        <input
                          type="text"
                          readOnly
                          value={dummyExpiry}
                          className="w-full text-sm font-mono bg-white border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium">CVV</span>
                        <input
                          type="text"
                          readOnly
                          value={dummyCvv}
                          className="w-full text-sm font-mono bg-white border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={simulateSuccess}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-emerald-100 flex items-center justify-center"
                    >
                      <span>Simulate Payment Success</span>
                    </button>
                    <button
                      type="button"
                      onClick={simulateFailure}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-rose-100 flex items-center justify-center"
                    >
                      <span>Simulate Payment Failure</span>
                    </button>
                  </div>
                </div>
              )}

              {dummyStatus === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="text-center">
                    <h4 className="font-bold text-gray-800">Processing Transaction</h4>
                    <p className="text-sm text-gray-500 animate-pulse">Contacting secure banking servers...</p>
                  </div>
                </div>
              )}

              {dummyStatus === 'success' && (
                <div className="py-10 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-800 text-lg">Payment Successful!</h4>
                    <p className="text-sm text-emerald-600">Simulating authorization completion...</p>
                  </div>
                </div>
              )}

              {dummyStatus === 'failed' && (
                <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                    <span className="text-3xl font-extrabold font-mono">!</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-800 text-lg">Transaction Failed</h4>
                    <p className="text-sm text-rose-600 px-4">Card was declined. Please verify test credentials or try success simulation.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDummyStatus('idle')}
                    className="mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>

            {/* Footer lock note */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-center space-x-2 text-gray-400 text-[11px] font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>PCI-DSS Compliant 256-bit SSL Encryption</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Checkout;