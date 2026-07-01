import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders, Order } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  ShoppingBag, 
  MapPin, 
  Settings, 
  LogOut, 
  Clock, 
  Truck, 
  Loader, 
  Mail, 
  Phone, 
  ChevronRight, 
  X,
  Plus,
  Trash2,
  Edit3,
  Camera,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { orders, loading: loadingOrders, fetchUserOrders, getUserOrders } = useOrders();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'address' | 'settings'>('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Tracking modal states
  const [trackingAwb, setTrackingAwb] = useState<string | null>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<{
    awb: string;
    status: string;
    expectedDate: string | null;
    checkpoints: {
      status: string;
      location: string;
      timestamp: string;
      description: string;
    }[];
  } | null>(null);

  // Profile Settings state
  const [settingsData, setSettingsData] = useState({
    name: '',
    phone: ''
  });

  // Multiple Addresses state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });

  // Avatar upload state
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE = import.meta.env.VITE_AWS_API_URL || "https://backend.gharsansar.store/api";

  // Fetch orders on mount
  useEffect(() => {
    if (user?.email) {
      fetchUserOrders();
    }
  }, [user]);

  // Load and sync user data
  useEffect(() => {
    if (user) {
      setSettingsData({
        name: user.name || '',
        phone: user.phone || ''
      });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  const userOrders = useMemo(() => {
    if (!user?.email) return [];
    return getUserOrders(user.email);
  }, [orders, user]);

  const stats = useMemo(() => {
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const deliveredCount = userOrders.filter(o => o.status === 'delivered').length;
    const activeOrders = userOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
    return {
      totalOrders: userOrders.length,
      totalSpent,
      deliveredCount,
      activeCount: activeOrders.length
    };
  }, [userOrders]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Profile Picture Upload Handler
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setLoadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      // 1. Upload file to backend
      const uploadRes = await fetch(`${API_BASE}/auth/profile/upload-avatar`, {
        method: 'POST',
        body: formData
      });
      if (!uploadRes.ok) throw new Error("Avatar upload failed");
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error(uploadData.error || "Upload failed");

      const avatarUrl = uploadData.url;

      // 2. Update user profile database
      const updateRes = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          profilePicture: avatarUrl
        })
      });
      if (!updateRes.ok) throw new Error("Profile updates failed");
      const updateData = await updateRes.json();
      if (!updateData.success) throw new Error(updateData.error || "Update database failed");

      // 3. Update local auth context
      updateUser(updateData.user);
      toast.success('Avatar updated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Avatar upload failed');
    } finally {
      setLoadingAvatar(false);
    }
  };

  // Settings Save Handler
  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: settingsData.name,
          phone: settingsData.phone
        })
      });
      if (!response.ok) throw new Error("Failed to save profile settings");
      const data = await response.json();
      if (data.success && data.user) {
        updateUser(data.user);
        toast.success('Profile settings updated successfully!');
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save profile changes");
    }
  };

  // Address CRUD operations
  const syncAddressesToBackend = async (updatedAddresses: any[]) => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          addresses: updatedAddresses
        })
      });
      if (!response.ok) throw new Error("Failed to sync addresses");
      const data = await response.json();
      if (data.success && data.user) {
        updateUser(data.user);
        // Sync default address to localStorage for Checkout defaults
        const defaultAddr = updatedAddresses.find(a => a.isDefault);
        if (defaultAddr) {
          localStorage.setItem(`shipping_address_${user.email}`, JSON.stringify(defaultAddr));
          localStorage.setItem('user_shipping_address', JSON.stringify(defaultAddr));
        } else if (updatedAddresses.length > 0) {
          // Fallback if none default
          localStorage.setItem(`shipping_address_${user.email}`, JSON.stringify(updatedAddresses[0]));
          localStorage.setItem('user_shipping_address', JSON.stringify(updatedAddresses[0]));
        } else {
          localStorage.removeItem(`shipping_address_${user.email}`);
          localStorage.removeItem('user_shipping_address');
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync address updates to server");
      return false;
    }
  };

  const handleAddressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedAddresses = [...addresses];

    if (currentAddressId) {
      // Editing existing address
      updatedAddresses = updatedAddresses.map(addr => {
        if (addr.id === currentAddressId) {
          return { ...addressForm, id: currentAddressId };
        }
        return addressForm.isDefault ? { ...addr, isDefault: false } : addr;
      });
    } else {
      // Adding new address
      const newAddress = {
        ...addressForm,
        id: `addr_${Date.now()}`,
        isDefault: addressForm.isDefault || addresses.length === 0
      };
      
      if (newAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
      }
      updatedAddresses.push(newAddress);
    }

    const success = await syncAddressesToBackend(updatedAddresses);
    if (success) {
      toast.success(currentAddressId ? 'Address updated successfully!' : 'Address added successfully!');
      setIsEditingAddress(false);
      setCurrentAddressId(null);
      setAddressForm({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        isDefault: false
      });
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    const success = await syncAddressesToBackend(updated);
    if (success) {
      toast.success('Default shipping address updated!');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this shipping address?")) return;

    let updated = addresses.filter(addr => addr.id !== id);
    
    // If we deleted the default address and there are remaining addresses, assign a new default
    const wasDefault = addresses.find(addr => addr.id === id)?.isDefault;
    if (wasDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }

    const success = await syncAddressesToBackend(updated);
    if (success) {
      toast.success('Address removed successfully!');
    }
  };

  const handleEditAddressInit = (addr: any) => {
    setCurrentAddressId(addr.id);
    setAddressForm({ ...addr });
    setIsEditingAddress(true);
  };

  const handleTrackShipment = async (awb: string) => {
    setTrackingAwb(awb);
    setLoadingTracking(true);
    setTrackingInfo(null);
    try {
      const response = await fetch(`${API_BASE}/shipping/track/${awb}`);
      if (!response.ok) throw new Error("Tracking details unavailable");
      const data = await response.json();
      if (data.success) {
        setTrackingInfo(data);
      } else {
        toast.error('Tracking information could not be retrieved.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to connect to tracking server');
    } finally {
      setLoadingTracking(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full">
          <Loader className="animate-spin text-blue-600 w-12 h-12 mx-auto mb-6" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Redirecting...</h2>
          <p className="text-gray-500 text-sm">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f7] font-sans pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header Hero */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden mb-10 shadow-lg border border-white bg-white/70 backdrop-blur-xl p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-8"
        >
          {/* Decorative backdrop blur patches */}
          <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] pointer-events-none z-0"></div>
          <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-yellow-100/40 rounded-full blur-[100px] pointer-events-none z-0"></div>

          {/* Avatar Circle with upload capabilities */}
          <div 
            onClick={handleAvatarClick}
            className="relative z-10 w-24 h-24 rounded-full overflow-hidden shadow-md border border-gray-200 shrink-0 group cursor-pointer bg-[#f3f2ee] flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          >
            {loadingAvatar ? (
              <Loader className="animate-spin text-gray-900 w-8 h-8" />
            ) : user.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.name || "User Avatar"} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-gray-900 to-gray-700 text-white flex items-center justify-center text-3xl font-bold font-mono">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Upload Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
              <Camera size={18} />
              <span>Upload Photo</span>
            </div>
            
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarChange} 
            />
          </div>
          
          <div className="relative z-10 flex-1 text-center md:text-left space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              {user.name || 'Ghar Sansar Customer'}
            </h1>
            <p className="text-gray-500 font-semibold text-sm flex items-center justify-center md:justify-start gap-2">
              <Mail size={16} className="text-gray-400" /> {user.email}
            </p>
            {user.phone && (
              <p className="text-gray-500 font-semibold text-sm flex items-center justify-center md:justify-start gap-2">
                <Phone size={16} className="text-gray-400" /> {user.phone}
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
              <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 uppercase tracking-wider">
                {user.role === 'admin' ? 'Administrator' : 'Customer Account'}
              </span>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-100">
                Member since May 2026
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Side Menu Tab Navigator */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-1"
          >
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${
                activeTab === 'overview' 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <UserIcon size={18} /> Account Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${
                activeTab === 'orders' 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <ShoppingBag size={18} /> My Orders
              {stats.activeCount > 0 && (
                <span className="ml-auto bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {stats.activeCount} Active
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('address')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${
                activeTab === 'address' 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <MapPin size={18} /> Shipping Address
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${
                activeTab === 'settings' 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Settings size={18} /> Account Settings
            </button>
            <hr className="my-2 border-gray-100" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </motion.div>

          {/* Dynamic Content Panel */}
          <div className="lg:col-span-9">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="space-y-8"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Orders</span>
                    <span className="text-3xl font-black text-gray-900">{stats.totalOrders}</span>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Spent</span>
                    <span className="text-2xl font-black text-gray-900">₹{stats.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Active Deliveries</span>
                    <span className="text-3xl font-black text-blue-600">{stats.activeCount}</span>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Delivered</span>
                    <span className="text-3xl font-black text-green-600">{stats.deliveredCount}</span>
                  </div>
                </div>

                {/* Quick Dashboard Info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Order Overview</h3>
                  
                  {loadingOrders ? (
                    <div className="flex justify-center py-6"><Loader className="animate-spin text-blue-600" /></div>
                  ) : userOrders.length === 0 ? (
                    <p className="text-gray-500 text-sm">No orders placed yet. Explore our luxury collection!</p>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.slice(0, 2).map((order) => (
                        <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-xl hover:bg-gray-50 transition gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 text-sm">Order #{order.orderNumber}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>{order.status}</span>
                            </div>
                            <span className="text-xs text-gray-400 block mt-1">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="text-right sm:text-left flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                            <span className="font-bold text-gray-900 text-sm">₹{order.total.toLocaleString()}</span>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setActiveTab('orders');
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                            >
                              Details <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="space-y-6"
              >
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-4">My Orders</h2>
                
                {loadingOrders ? (
                  <div className="flex justify-center py-12"><Loader className="animate-spin text-blue-600" /></div>
                ) : userOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm mb-4">You have not placed any orders yet.</p>
                    <button onClick={() => navigate('/products')} className="bg-gray-900 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-blue-600 transition">Explore Products</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userOrders.map((order) => {
                      const isExpanded = selectedOrder?.id === order.id;
                      return (
                        <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition">
                          
                          {/* Order Header Summary */}
                          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 bg-gray-50/20">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-base">Order #{order.orderNumber}</span>
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${
                                  order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                  order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }`}>{order.status}</span>
                              </div>
                              <span className="text-xs text-gray-500 block">Placed on: {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            
                            <div className="flex items-center justify-between sm:justify-end gap-6">
                              <div className="text-right">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Paid</span>
                                <span className="font-extrabold text-gray-900 text-base">₹{order.total.toLocaleString()}</span>
                              </div>
                              <button
                                onClick={() => setSelectedOrder(isExpanded ? null : order)}
                                className="bg-gray-900 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full transition"
                              >
                                {isExpanded ? 'Hide Details' : 'View Details'}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Details section */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-50 p-6 space-y-6"
                              >
                                {/* Items List */}
                                <div className="space-y-4">
                                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Ordered Items</h4>
                                  <div className="divide-y divide-gray-100">
                                    {order.items.map((item) => (
                                      <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                        <div className="relative w-16 h-16 bg-[#f8f8f7] rounded-lg flex items-center justify-center p-1.5 border border-gray-50 shrink-0">
                                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                          <span className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                            {item.quantity}
                                          </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h5 className="font-bold text-gray-900 text-xs truncate">{item.name}</h5>
                                          <p className="text-[10px] text-gray-400 font-medium">Price: ₹{item.price.toLocaleString()}</p>
                                        </div>
                                        <span className="font-extrabold text-gray-900 text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Order Metadata Split */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 text-sm">
                                  {/* Shipping Address */}
                                  <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Delivery Address</h4>
                                    <div className="text-xs text-gray-600 space-y-1">
                                      <p className="font-bold text-gray-800">{order.customer.firstName} {order.customer.lastName}</p>
                                      <p>{order.customer.address}</p>
                                      <p>{order.customer.city}, {order.customer.state} - {order.customer.zipCode}</p>
                                      <p>Phone: {order.customer.phone}</p>
                                    </div>
                                  </div>

                                  {/* Payment Details */}
                                  <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-2.5">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Payment Summary</h4>
                                    <div className="flex justify-between text-xs text-gray-600">
                                      <span>Subtotal:</span>
                                      <span className="font-semibold text-gray-900">₹{order.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600">
                                      <span>Shipping Charge:</span>
                                      <span className="font-semibold text-gray-900">{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600">
                                      <span>GST Tax (18%):</span>
                                      <span className="font-semibold text-gray-900">₹{order.tax.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm text-gray-950">
                                      <span>Paid Total:</span>
                                      <span className="text-blue-600">₹{order.total.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Delhivery Tracking Info */}
                                {order.trackingNumber && (
                                  <div className="pt-4 border-t border-gray-100 space-y-3">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Courier Shipment</h4>
                                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-blue-50/30 border border-blue-100 rounded-xl">
                                      <div>
                                        <p className="text-xs text-gray-500 font-medium">Provider: <strong>Delhivery B2C Express</strong></p>
                                        <p className="text-xs text-gray-500 font-medium mt-1">Waybill (AWB): <strong className="font-mono text-blue-700">{order.trackingNumber}</strong></p>
                                      </div>
                                      <button
                                        onClick={() => handleTrackShipment(order.trackingNumber || '')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full transition flex items-center gap-1.5"
                                      >
                                        <Truck size={14} /> Track Package
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="space-y-6"
              >
                {!isEditingAddress ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Shipping Addresses</h2>
                        <p className="text-xs text-gray-400 mt-1">Manage multiple delivery destinations for quick checkout.</p>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentAddressId(null);
                          setAddressForm({
                            firstName: '',
                            lastName: '',
                            phone: '',
                            address: '',
                            city: '',
                            state: '',
                            zipCode: '',
                            country: 'India',
                            isDefault: false
                          });
                          setIsEditingAddress(true);
                        }}
                        className="flex items-center gap-1.5 bg-gray-950 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full text-xs font-bold transition shadow-sm"
                      >
                        <Plus size={14} /> Add New Address
                      </button>
                    </div>

                    {addresses.length === 0 ? (
                      <div className="py-12 border-2 border-dashed border-gray-200 rounded-2xl text-center space-y-3">
                        <MapPin className="w-10 h-10 text-gray-300 mx-auto" />
                        <p className="text-sm text-gray-500 font-semibold">No shipping addresses saved yet.</p>
                        <button
                          onClick={() => setIsEditingAddress(true)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-bold border border-blue-200 px-4 py-2 rounded-full hover:bg-blue-50/55 transition"
                        >
                          Add Your First Address
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((addr) => (
                          <div 
                            key={addr.id} 
                            className={`p-5 rounded-2xl border transition relative flex flex-col justify-between h-full bg-gray-50/30 ${
                              addr.isDefault 
                                ? 'border-gray-900 ring-2 ring-gray-950/5' 
                                : 'border-gray-200 hover:border-gray-900'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-gray-900 capitalize">
                                  {addr.firstName} {addr.lastName}
                                </span>
                                {addr.isDefault && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-gray-900 bg-gray-100 border border-gray-300 rounded-full px-2 py-0.5">
                                    <Check size={10} strokeWidth={3} /> Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-650 leading-relaxed font-semibold">
                                {addr.address}
                              </p>
                              <p className="text-xs text-gray-500 font-medium">
                                {addr.city}, {addr.state} - {addr.zipCode}
                              </p>
                              <p className="text-xs text-gray-450 font-medium flex items-center gap-1">
                                <Phone size={12} /> {addr.phone}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 pt-5 mt-5 border-t border-gray-100 text-xs font-bold">
                              {!addr.isDefault && (
                                <button
                                  onClick={() => handleSetDefaultAddress(addr.id)}
                                  className="text-blue-650 hover:text-blue-750 transition"
                                >
                                  Make Default
                                </button>
                              )}
                              <button
                                onClick={() => handleEditAddressInit(addr)}
                                className="text-gray-600 hover:text-gray-900 transition flex items-center gap-1 ml-auto"
                              >
                                <Edit3 size={13} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-red-550 hover:text-red-650 transition flex items-center gap-1"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        {currentAddressId ? 'Edit Shipping Address' : 'Add New Shipping Address'}
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">Fill out the delivery contact and address details.</p>
                    </div>

                    <form onSubmit={handleAddressSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">First Name</label>
                        <input
                          type="text"
                          required
                          value={addressForm.firstName}
                          onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none text-gray-900 font-semibold text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Last Name</label>
                        <input
                          type="text"
                          required
                          value={addressForm.lastName}
                          onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none text-gray-900 font-semibold text-sm"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Street Address</label>
                        <input
                          type="text"
                          required
                          value={addressForm.address}
                          onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none text-gray-900 font-semibold text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">City</label>
                        <input
                          type="text"
                          required
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none text-gray-900 font-semibold text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">State</label>
                        <input
                          type="text"
                          required
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none text-gray-900 font-semibold text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">ZIP/Postal Code</label>
                        <input
                          type="text"
                          required
                          value={addressForm.zipCode}
                          onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none text-gray-900 font-semibold text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Phone</label>
                        <input
                          type="tel"
                          required
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none text-gray-900 font-semibold text-sm"
                        />
                      </div>
                      
                      <div className="md:col-span-2 flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="isDefaultCheckbox"
                          checked={addressForm.isDefault || addresses.length === 0}
                          disabled={addresses.length === 0 || (currentAddressId ? addresses.find(a => a.id === currentAddressId)?.isDefault : false)}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                        />
                        <label htmlFor="isDefaultCheckbox" className="text-xs font-bold text-gray-600 cursor-pointer select-none">
                          Set as default shipping address
                        </label>
                      </div>

                      <div className="md:col-span-2 pt-4 border-t border-gray-100 flex justify-end gap-3 text-sm font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingAddress(false);
                            setCurrentAddressId(null);
                          }}
                          className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-full transition"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="bg-gray-950 hover:bg-gray-800 text-white px-6 py-3 rounded-full transition shadow-md"
                        >
                          {currentAddressId ? 'Save Address' : 'Add Address'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Account Information</h2>
                  <p className="text-xs text-gray-400 mt-1">Manage your public account details.</p>
                </div>

                <form onSubmit={handleSettingsSave} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      value={settingsData.name}
                      onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none text-gray-900 font-semibold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Account Email (Cannot change)</label>
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={user.email}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-semibold text-sm cursor-not-allowed outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Phone</label>
                    <input
                      type="tel"
                      value={settingsData.phone}
                      onChange={(e) => setSettingsData({ ...settingsData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none text-gray-900 font-semibold text-sm"
                    />
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button type="submit" className="bg-gray-900 hover:bg-blue-600 text-white text-sm font-bold px-6 py-3 rounded-full transition shadow-md">
                      Save Settings
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* Interactive Delhivery Tracking timeline modal */}
      <AnimatePresence>
        {trackingAwb && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[28px] shadow-2xl overflow-hidden w-full max-w-lg border border-gray-100 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-gray-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-blue-400" />
                  <span className="font-bold tracking-wide">Track Shipment</span>
                </div>
                <button
                  onClick={() => setTrackingAwb(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status and AWB summary banner */}
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-0.5">AWB Tracking Number</span>
                  <span className="font-mono font-bold text-gray-800 text-sm">{trackingAwb}</span>
                </div>
                {trackingInfo && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-0.5">Status</span>
                    <span className="text-sm font-black text-blue-600 uppercase">{trackingInfo.status}</span>
                  </div>
                )}
              </div>

              {/* Timelines content list */}
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {loadingTracking && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <Loader className="animate-spin text-blue-600 w-8 h-8" />
                    <span className="text-xs text-gray-500 font-semibold">Connecting to Delhivery Server...</span>
                  </div>
                )}

                {trackingInfo && (
                  <div className="space-y-6">
                    {/* Expected delivery alert */}
                    {trackingInfo.expectedDate && (
                      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-center space-x-3 text-xs text-blue-800">
                        <Clock size={16} className="text-blue-500" />
                        <span>Expected Delivery: <strong>{new Date(trackingInfo.expectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</strong></span>
                      </div>
                    )}

                    {/* Timeline checks */}
                    <div className="relative border-l-2 border-gray-100 pl-6 ml-3 space-y-8 py-2">
                      {trackingInfo.checkpoints.map((checkpoint, idx) => {
                        const isLatest = idx === 0;
                        return (
                          <div key={idx} className="relative">
                            {/* Point Bullet */}
                            <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isLatest 
                                ? 'bg-blue-600 border-blue-300 ring-4 ring-blue-50 scale-110' 
                                : 'bg-white border-gray-300'
                            }`}>
                              {isLatest && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                            </span>

                            {/* Text content details */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${isLatest ? 'text-blue-600' : 'text-gray-800'}`}>
                                  {checkpoint.status}
                                </span>
                                <span className="text-[10px] text-gray-400 font-semibold">•</span>
                                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md">
                                  {checkpoint.location}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 font-medium">
                                {new Date(checkpoint.timestamp).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {checkpoint.description && (
                                <p className="text-xs text-gray-500 leading-relaxed pt-1">
                                  {checkpoint.description}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
