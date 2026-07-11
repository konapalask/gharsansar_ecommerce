import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleRemove = (itemId: string, itemName: string) => {
    const confirmed = window.confirm(`Are you sure you want to remove "${itemName}" from your cart?`);
    if (confirmed) {
      removeFromCart(itemId);
      toast.success(`"${itemName}" removed from cart`);
    }
  };

  const handleDecreaseQuantity = (itemId: string, currentQty: number, itemName: string, isReturnGift?: boolean) => {
    if (isReturnGift && currentQty <= 50) {
      toast.error(`Return gifts require a minimum order of 50.`);
      return;
    }
    
    if (currentQty === 1) {
      const confirmed = window.confirm(`Are you sure you want to remove "${itemName}" from your cart?`);
      if (confirmed) {
        removeFromCart(itemId);
        toast.success(`"${itemName}" removed from cart`);
      }
    } else {
      updateQuantity(itemId, currentQty - 1);
    }
  };

  const handleIncreaseQuantity = (item: any) => {
    if (item.stock !== undefined && item.quantity >= item.stock) {
      toast.error(`Only ${item.stock} items left in stock`);
      return;
    }
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to proceed to checkout!');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover our beautiful collection of home decor items.
            </p>
            <Link
              to="/products"
              className="bg-luxury-charcoal hover:bg-luxury-gold text-white px-8 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs transition duration-300 inline-flex items-center"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your selected items</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-2xl font-bold text-luxury-charcoal">₹{item.price}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDecreaseQuantity(item.id, item.quantity, item.name, item.isReturnGift)}
                        className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleIncreaseQuantity(item)}
                        className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleRemove(item.id, item.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-xl font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 h-fit"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-semibold text-gray-500 text-xs mt-1">Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (18% GST):</span>
                <span className="font-semibold">₹{(totalPrice * 0.18).toFixed(2)}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span className="text-luxury-charcoal font-black">₹{(totalPrice * 1.18).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleCheckoutClick}
                className="w-full bg-luxury-charcoal hover:bg-luxury-gold text-white py-3.5 px-6 rounded-full font-bold uppercase tracking-widest text-xs transition duration-300 text-center block"
              >
                Proceed to Checkout
              </button>
              <Link
                to="/products"
                className="w-full border-2 border-gray-300 text-gray-700 py-3.5 px-6 rounded-full hover:bg-luxury-warmGray transition-colors font-bold uppercase tracking-widest text-xs text-center block"
              >
                Continue Shopping
              </Link>
            </div>

            <div className="mt-6 p-4 bg-luxury-warmGray/50 rounded-lg border border-luxury-gold/20">
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                Delivery charges are calculated at checkout: ₹99 flat for serviceable regions, ₹149 elsewhere.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cart;