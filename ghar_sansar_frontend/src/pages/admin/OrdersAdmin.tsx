import React, { useEffect, useState, useMemo } from 'react';
import { useOrders, Order } from '../../context/OrderContext';
import { Search, FileText, Clock, Truck, ShieldCheck, Printer, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const OrdersAdmin: React.FC = () => {
  const { orders, fetchUserOrders } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printMode, setPrintMode] = useState<'standard' | 'thermal'>('standard');

  const API_BASE =
    import.meta.env.VITE_AWS_API_URL ||
    "http://localhost:5001/api";

  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [trackingAwb, setTrackingAwb] = useState<string | null>(null);
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
  const [loadingTracking, setLoadingTracking] = useState(false);

  const handleShipDelhivery = async (orderId: string) => {
    setShippingOrderId(orderId);
    try {
      const response = await fetch(`${API_BASE}/shipping/create-shipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      if (!response.ok) throw new Error("Fulfillment failed");
      const data = await response.json();
      if (data.success) {
        toast.success(`Shipped successfully via Delhivery! AWB: ${data.waybill}`);
        fetchUserOrders(); // reload
      } else {
        toast.error("Fulfillment returned failure");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fulfill shipment via Delhivery");
    } finally {
      setShippingOrderId(null);
    }
  };

  const handleTrackShipment = async (awb: string) => {
    setTrackingAwb(awb);
    setLoadingTracking(true);
    setTrackingInfo(null);
    try {
      const response = await fetch(`${API_BASE}/shipping/track/${awb}`);
      if (!response.ok) throw new Error("Tracking fetch failed");
      const data = await response.json();
      if (data.success) {
        setTrackingInfo(data);
      } else {
        toast.error("Tracking status not found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to track Delhivery shipment");
    } finally {
      setLoadingTracking(false);
    }
  };

  // Fetch all orders on load
  useEffect(() => {
    fetchUserOrders();
  }, []);

  // Update order status on server
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus.toLowerCase() })
      });
      if (!response.ok) throw new Error("Failed to update status on server");
      
      toast.success(`Order status updated to ${newStatus}`);
      fetchUserOrders();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status');
    }
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || order.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Dynamic printer style injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide main site layout completely */
          body * {
            visibility: hidden;
            background: none !important;
          }
          /* Show only the printable container */
          #printable-bill, #printable-bill * {
            visibility: visible;
          }
          #printable-bill {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Specialized 80mm thermal receipt constraints */
          .thermal-layout {
            width: 80mm !important;
            max-width: 80mm !important;
            padding: 4mm !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 12px !important;
            line-height: 1.3 !important;
            color: #000000 !important;
            background: #ffffff !important;
          }
          .thermal-layout * {
            font-family: 'Courier New', Courier, monospace !important;
            color: #000000 !important;
          }
          .thermal-layout border-b, 
          .thermal-layout border-t {
            border-color: #000000 !important;
            border-style: dashed !important;
          }
        }
      `}} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 font-outfit">Showroom Orders</h1>
          <p className="text-gray-600 mt-1">Generate dynamic customer bills and handle thermal receipt printing</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none bg-white font-medium text-gray-700 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </motion.div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-sm">
                <th className="p-4 sm:p-6">Order ID</th>
                <th className="p-4 sm:p-6">Date</th>
                <th className="p-4 sm:p-6">Customer</th>
                <th className="p-4 sm:p-6">Total Amount</th>
                <th className="p-4 sm:p-6">Payment Status</th>
                <th className="p-4 sm:p-6">Order Status</th>
                <th className="p-4 sm:p-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4 sm:p-6 font-bold text-blue-600 font-mono">{order.id}</td>
                    <td className="p-4 sm:p-6 text-gray-500">
                      {new Date(order.createdAt || new Date()).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-4 sm:p-6">
                      <div className="font-semibold text-gray-900">
                        {order.customer.firstName} {order.customer.lastName}
                      </div>
                      <div className="text-xs text-gray-400">{order.customer.email}</div>
                    </td>
                    <td className="p-4 sm:p-6 font-bold text-gray-900">₹{(order.total || 0).toLocaleString()}</td>
                    <td className="p-4 sm:p-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        <ShieldCheck className="w-3.5 h-3.5" /> PAID
                      </span>
                    </td>
                    <td className="p-4 sm:p-6">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold outline-none cursor-pointer ${
                          order.status === 'delivered'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : order.status === 'shipped'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      <div className="flex justify-center items-center gap-2.5">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setPrintMode('standard');
                          }}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors inline-flex items-center gap-1 font-semibold text-xs"
                          title="Generate Auto Bill"
                        >
                          <FileText className="w-4 h-4" /> Bill
                        </button>
                        {!order.trackingNumber && order.status.toLowerCase() === "processing" && (
                          <button
                            onClick={() => handleShipDelhivery(order.id)}
                            disabled={shippingOrderId === order.id}
                            className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-all inline-flex items-center gap-1 font-semibold text-xs disabled:opacity-50"
                            title="Ship via Delhivery B2C"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            {shippingOrderId === order.id ? "Shipping..." : "Ship"}
                          </button>
                        )}
                        {order.trackingNumber && (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-mono text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                              AWB: {order.trackingNumber}
                            </span>
                            <button
                              onClick={() => handleTrackShipment(order.trackingNumber!)}
                              className="px-2 py-1 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-md text-[11px] font-bold transition-all border border-yellow-200"
                            >
                              Track
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-semibold text-lg">No orders found</p>
                    <p className="text-sm mt-1">Showroom orders will list here in real time once checked out.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal (Fully visible over fixed headers, high Z-Index z-[99999]) */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex flex-col items-center justify-start pt-24 pb-8 px-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col shrink-0 print:shadow-none"
            >
              {/* Modal Controls (Sticky top header, ALWAYS fully visible, hidden in print) */}
              <div className="p-4 bg-gray-900 text-white flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
                <div className="flex items-center gap-2 font-bold">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="font-outfit">Invoice #{selectedOrder.orderNumber}</span>
                </div>

                {/* Print mode selector */}
                <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
                  <button
                    onClick={() => setPrintMode('standard')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      printMode === 'standard'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    📄 A4 Invoice
                  </button>
                  <button
                    onClick={() => setPrintMode('thermal')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      printMode === 'thermal'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    📟 Thermal (80mm)
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold inline-flex items-center gap-2 text-sm transition-all"
                  >
                    <Printer className="w-4 h-4" /> Print Invoice
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Invoice Scrollable Area */}
              <div className="overflow-y-auto flex-1 p-6 sm:p-10 bg-white print:overflow-visible print:p-0">
                
                {/* 1. STANDARD A4 VIEW */}
                {printMode === 'standard' && (
                  <div className="space-y-8" id="printable-bill">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                      <div>
                        <img src="/ghar sansar logo.svg" alt="Ghar Sansar" className="h-10 object-contain mb-3" />
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Showroom Hub</p>
                        <p className="text-sm text-gray-500">Vijayawada, Guntur, Hyderabad</p>
                        <p className="text-sm text-gray-400 mt-1">support@gharsansar.com</p>
                      </div>
                      <div className="text-right">
                        <h2 className="text-xl font-black text-gray-800 tracking-wider">INVOICE</h2>
                        <p className="text-blue-600 font-bold font-mono text-xs mt-1">ID: {selectedOrder.id}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          <span className="font-semibold">Date:</span> {new Date(selectedOrder.createdAt || new Date()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          <span className="font-semibold">Status:</span> {selectedOrder.status}
                        </p>
                      </div>
                    </div>

                    {/* Billing details */}
                    <div className="grid grid-cols-2 gap-6 bg-gray-50 rounded-xl p-5 print:bg-white print:border print:border-gray-200">
                      <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                        <div className="text-base font-bold text-gray-900">
                          {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{selectedOrder.customer.email}</div>
                        <div className="text-sm text-gray-600">{selectedOrder.customer.phone}</div>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shipping Destination</h3>
                        <div className="text-sm text-gray-700 font-semibold">{selectedOrder.customer.address}</div>
                        <div className="text-sm text-gray-600 mt-0.5">
                          {selectedOrder.customer.city}, {selectedOrder.customer.state} - {selectedOrder.customer.zipCode}
                        </div>
                        <div className="text-sm text-gray-600">{selectedOrder.customer.country}</div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden print:border-gray-200">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                            <th className="p-4 text-left">Product Name</th>
                            <th className="p-4 text-center">Qty</th>
                            <th className="p-4 text-right">Unit Price</th>
                            <th className="p-4 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
                          {selectedOrder.items.map((item) => (
                            <tr key={item.id}>
                              <td className="p-4 font-semibold text-gray-900">{item.name}</td>
                              <td className="p-4 text-center">{item.quantity}</td>
                              <td className="p-4 text-right">₹{(item.price || 0).toLocaleString()}</td>
                              <td className="p-4 text-right font-bold text-gray-900">
                                ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Billing Summary */}
                    <div className="flex justify-end pt-2">
                      <div className="w-full sm:w-72 space-y-2.5">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Subtotal</span>
                          <span className="font-semibold text-gray-800">₹{(selectedOrder.subtotal || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Shipping Fee</span>
                          <span className="font-semibold text-gray-800 font-mono">
                            {selectedOrder.shipping === 0 ? 'FREE' : `₹${selectedOrder.shipping}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>GST (18%)</span>
                          <span className="font-semibold text-gray-800">₹{(selectedOrder.tax || 0).toLocaleString()}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-black text-gray-900">
                          <span>Total Amount</span>
                          <span className="text-blue-600">₹{(selectedOrder.total || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer notes */}
                    <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-500 font-semibold space-y-1">
                      <p>Thank you for choosing Ghar Sansar. This is an automatically generated system invoice.</p>
                      <p className="text-red-600 uppercase tracking-wider">⚠️ All items are custom bespoke works & strictly non-refundable and non-returnable.</p>
                      <p className="text-gray-400 font-normal">For support or delivery queries, contact showroom helpdesk.</p>
                    </div>
                  </div>
                )}

                {/* 2. THERMAL 80MM RECEIPT VIEW */}
                {printMode === 'thermal' && (
                  <div 
                    className="thermal-layout mx-auto border border-dashed border-gray-300 p-6 bg-white w-[80mm] max-w-full font-mono text-[12px] text-black space-y-4 print:border-none print:p-0"
                    id="printable-bill"
                  >
                    {/* Header */}
                    <div className="text-center space-y-1">
                      <h2 className="text-lg font-bold tracking-tight">GHAR SANSAR</h2>
                      <p className="text-[11px] leading-tight">PREMIUM HOME SHOWROOM</p>
                      <p className="text-[10px] leading-tight">Vijayawada, Andhra Pradesh</p>
                      <p className="text-[10px] leading-tight">support@gharsansar.com</p>
                    </div>

                    <div className="border-b border-black border-dashed py-1"></div>

                    {/* Metadata */}
                    <div className="space-y-0.5 text-[11px]">
                      <div><strong>Invoice:</strong> {selectedOrder.orderNumber}</div>
                      <div className="truncate"><strong>ID:</strong> {selectedOrder.id}</div>
                      <div><strong>Date:</strong> {new Date(selectedOrder.createdAt || new Date()).toLocaleDateString()}</div>
                      <div><strong>Status:</strong> {selectedOrder.status}</div>
                    </div>

                    <div className="border-b border-black border-dashed py-1"></div>

                    {/* Billed To */}
                    <div className="text-[11px] space-y-0.5">
                      <div><strong>Customer:</strong> {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</div>
                      <div><strong>Phone:</strong> {selectedOrder.customer.phone}</div>
                      <div className="truncate"><strong>Deliv:</strong> {selectedOrder.customer.address}</div>
                    </div>

                    <div className="border-b border-black border-dashed py-1"></div>

                    {/* Items Monospace list */}
                    <div className="space-y-2 text-[11px]">
                      <div className="grid grid-cols-12 font-bold border-b border-black border-dotted pb-1">
                        <span className="col-span-7">ITEM</span>
                        <span className="col-span-2 text-center">QTY</span>
                        <span className="col-span-3 text-right">TOTAL</span>
                      </div>
                      
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="space-y-0.5">
                          <div className="font-semibold">{item.name}</div>
                          <div className="grid grid-cols-12 text-[10px] text-gray-700">
                            <span className="col-span-7"> @ ₹{(item.price || 0).toLocaleString()}</span>
                            <span className="col-span-2 text-center">x{item.quantity}</span>
                            <span className="col-span-3 text-right">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-b border-black border-dashed py-1"></div>

                    {/* Monospace Financial Calculations */}
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span>SUBTOTAL:</span>
                        <span>₹{(selectedOrder.subtotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SHIPPING:</span>
                        <span>{selectedOrder.shipping === 0 ? 'FREE' : `₹${selectedOrder.shipping}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (18%):</span>
                        <span>₹{(selectedOrder.tax || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm border-t border-black border-dotted pt-1">
                        <span>TOTAL AMOUNT:</span>
                        <span>₹{(selectedOrder.total || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="border-b border-black border-dashed py-1"></div>

                    {/* Footer barcode/coupons */}
                    <div className="text-center text-[10px] space-y-1 pt-2">
                      <p>*** THANK YOU FOR VISITING ***</p>
                      <p className="font-bold text-red-600 uppercase">NO RETURNS / NO REFUNDS</p>
                      <p>Items are custom-made & non-returnable.</p>
                      <p className="font-bold text-[9px] mt-1 font-mono uppercase">*{selectedOrder.id}*</p>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delhivery Tracking Modal */}
      <AnimatePresence>
        {trackingAwb && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[24px] shadow-2xl overflow-hidden w-full max-w-lg border border-gray-100 flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-5 bg-gray-900 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-400" />
                  <span className="font-bold font-outfit">Delhivery Tracking: #{trackingAwb}</span>
                </div>
                <button
                  onClick={() => {
                    setTrackingAwb(null);
                    setTrackingInfo(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Tracking Details */}
              <div className="p-6 overflow-y-auto flex-1 bg-white">
                {loadingTracking ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <Loader className="animate-spin w-8 h-8 text-blue-600" />
                    <p className="text-sm text-gray-500 font-semibold">Querying Delhivery Network...</p>
                  </div>
                ) : trackingInfo ? (
                  <div className="space-y-6">
                    {/* Overall status card */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Shipment Status</span>
                        <span className="text-lg font-black text-blue-600">{trackingInfo.status}</span>
                      </div>
                      {trackingInfo.expectedDate && (
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Expected Delivery</span>
                          <span className="text-sm font-bold text-gray-700">
                            {new Date(trackingInfo.expectedDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Milestones / Checkpoints */}
                    <div className="relative border-l-2 border-blue-100 ml-3.5 pl-6 space-y-6 py-2">
                      {trackingInfo.checkpoints.map((cp, idx) => {
                        const isLatest = idx === trackingInfo.checkpoints.length - 1 || idx === 0;
                        return (
                          <div key={idx} className="relative group">
                            {/* Marker dot */}
                            <span className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                              isLatest ? "border-blue-500 bg-blue-500 text-white shadow-md scale-110" : "border-gray-300"
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${isLatest ? "bg-white" : "bg-gray-400"}`}></span>
                            </span>

                            {/* Milestone details */}
                            <div>
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                <h4 className={`font-bold text-sm leading-tight ${isLatest ? "text-blue-600" : "text-gray-800"}`}>
                                  {cp.status}
                                </h4>
                                <span className="text-[10px] text-gray-400 font-bold font-mono">
                                  {new Date(cp.timestamp).toLocaleString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 font-bold mt-0.5">{cp.location}</p>
                              {cp.description && (
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{cp.description}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p>Failed to retrieve tracking data</p>
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

export default OrdersAdmin;
