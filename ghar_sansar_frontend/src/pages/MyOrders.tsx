import React, { useEffect, useState, useMemo } from 'react';
import { useOrders } from '../../context/OrderContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Truck, Check, Clock } from 'lucide-react';

const MyOrders: React.FC = () => {
  const { orders, loading, fetchUserOrders, getUserOrders } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Assuming the user email is stored in localStorage under "user"
  const userEmail = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.email || '';
    } catch {
      return '';
    }
  })();

  const userOrders = useMemo(() => {
    return getUserOrders(userEmail);
  }, [orders, userEmail]);

  const filtered = useMemo(() => {
    if (!searchTerm) return userOrders;
    return userOrders.filter((o) =>
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.some((it) => it.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [userOrders, searchTerm]);

  useEffect(() => {
    if (userEmail) fetchUserOrders();
  }, [userEmail]);

  const formatCurrency = (n: number) => `₹${n.toLocaleString()}`;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto bg-white min-h-screen font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-5xl font-bold mb-6 text-gray-800"
      >
        My Orders
      </motion.h1>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="search"
          placeholder="Search your orders..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Clock className="animate-spin text-blue-600" size={32} /></div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <motion.div
              key={order.id}
              className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Order #{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    order.status === 'Delivered'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'Shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>${order.status}</span>
                  {order.shipped && (
                    <Truck className="text-gray-600" size={18} title="Shipped" />
                  )}
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  className="text-gray-500 hover:text-gray-800 transition"
                >
                  {expandedId === order.id ? <X size={20} /> : <Check size={20} />}
                </button>
              </div>

              <AnimatePresence>
                {expandedId === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 border-t pt-4"
                  >
                    <ul className="space-y-2">
                      {order.items.map((it) => (
                        <li key={it.id} className="flex justify-between text-sm">
                          <span>{it.name} (x{it.quantity})</span>
                          <span>{formatCurrency(it.price * it.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 text-right font-semibold">
                      Total: {formatCurrency(order.total)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
