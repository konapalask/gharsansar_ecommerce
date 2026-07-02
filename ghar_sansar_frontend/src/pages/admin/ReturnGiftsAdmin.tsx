import React, { useState, useEffect } from "react";
import { Save, Edit3, X, Trash2, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ReturnGiftsAdmin: React.FC = () => {
  const API_BASE = import.meta.env.VITE_AWS_API_URL || "https://backend.gharsansar.store/api";

  const [returnGifts, setReturnGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingReturnGift, setEditingReturnGift] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    stock: "50",
    image: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [quickPrice, setQuickPrice] = useState<string>("");

  const fetchReturnGifts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE.replace('/api', '')}/api/return_gifts?limit=1000`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Failed to fetch return gifts: ${res.status}`);
      const data = await res.json();
      setReturnGifts(Array.isArray(data.products) ? data.products.reverse() : (Array.isArray(data) ? data.reverse() : []));
    } catch (err) {
      console.error("❌ Error fetching return gifts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnGifts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReturnGift) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE.replace('/api', '')}/api/return_gifts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingReturnGift.id,
          title: form.title,
          price: form.price,
          description: form.description,
          stock: form.stock,
          image: form.image || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80",
        })
      });

      if (!res.ok) throw new Error("Failed to save return gift");

      setEditingReturnGift(null);
      await fetchReturnGifts();
      alert("✅ Return gift updated!");
    } catch (err) {
      console.error("❌ Error saving return gift:", err);
      alert("Failed to save return gift. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this return gift?")) return;
    
    try {
      const res = await fetch(`${API_BASE.replace('/api', '')}/api/return_gifts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete return gift");
      await fetchReturnGifts();
    } catch (err) {
      console.error("❌ Error deleting return gift:", err);
      alert("Failed to delete return gift.");
    }
  };

  const handleEdit = (gift: any) => {
    setEditingReturnGift(gift);
    setForm({
      title: gift.title,
      price: gift.price?.toString() || "",
      description: gift.description,
      stock: gift.stock?.toString() || "50",
      image: gift.image || "",
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE.replace('/api', '')}/api/return_gifts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          price: form.price,
          description: form.description,
          stock: form.stock,
          image: form.image || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80",
        })
      });

      if (!res.ok) throw new Error("Failed to create return gift");

      setIsCreating(false);
      await fetchReturnGifts();
      alert("✅ Return gift created!");
    } catch (err) {
      console.error("❌ Error creating return gift:", err);
      alert("Failed to create return gift. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setForm({
      title: "",
      price: "",
      description: "",
      stock: "50",
      image: "",
    });
    setIsCreating(true);
  };

  const filteredGifts = returnGifts.filter(gift => 
    gift.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    gift.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickPriceUpdate = async (gift: any) => {
    if (!quickPrice || isNaN(Number(quickPrice))) {
      alert("Please enter a valid price");
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE.replace('/api', '')}/api/return_gifts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: gift.id,
          title: gift.title,
          price: quickPrice,
          description: gift.description,
          stock: gift.stock,
          image: gift.image || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80",
        })
      });

      if (!res.ok) throw new Error("Failed to quick update price");

      setEditingPriceId(null);
      await fetchReturnGifts();
    } catch (err) {
      console.error("Error updating price:", err);
      alert("Failed to update price quickly.");
    }
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredGifts.length / itemsPerPage);
  const currentGifts = filteredGifts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-serif">Manage Return Gifts 🎁</h2>
          <p className="text-gray-600 text-sm mt-1">Edit titles, prices, descriptions, and stock of return gifts.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search return gifts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pl-10"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Gift
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading Return Gifts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentGifts.length > 0 ? (
                  currentGifts.map((gift) => (
                    <tr key={gift.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <img 
                          src={gift.image} 
                          alt={gift.title} 
                          className="w-16 h-16 object-contain mix-blend-multiply bg-gray-50 rounded p-1" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=800&auto=format&fit=crop';
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-gray-900">{gift.title}</div>
                        
                        <div className="mt-1 h-8">
                          {editingPriceId === gift.id ? (
                            <div className="flex items-center gap-1 w-32 bg-blue-50 border border-blue-200 rounded px-2 py-1">
                              <span className="text-blue-600 font-bold">₹</span>
                              <input 
                                autoFocus
                                type="number" 
                                className="w-full bg-transparent outline-none text-blue-700 font-bold text-sm"
                                value={quickPrice}
                                onChange={(e) => setQuickPrice(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleQuickPriceUpdate(gift);
                                  if (e.key === 'Escape') setEditingPriceId(null);
                                }}
                              />
                              <button onClick={() => handleQuickPriceUpdate(gift)} className="p-1 hover:bg-blue-200 rounded text-blue-600">
                                <Check size={14} />
                              </button>
                              <button onClick={() => setEditingPriceId(null)} className="p-1 hover:bg-blue-200 rounded text-red-500">
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group/price cursor-pointer w-max" onClick={() => { setEditingPriceId(gift.id); setQuickPrice(gift.price?.toString()); }}>
                              <span className="text-sm font-semibold text-gray-600 border-b border-transparent group-hover/price:border-blue-400 border-dashed">₹{gift.price}</span>
                              <Edit3 className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover/price:opacity-100 transition-opacity" />
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 mt-1 truncate max-w-md">{gift.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          gift.stock > 10 ? "bg-green-100 text-green-700" :
                          gift.stock > 0 ? "bg-orange-100 text-orange-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {gift.stock > 0 ? `${gift.stock} in stock` : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(gift)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(gift.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No return gifts found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-100 gap-4">
            <span className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredGifts.length)}</span> of <span className="font-semibold text-gray-700">{filteredGifts.length}</span> entries
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition ${currentPage === page ? "bg-blue-600 text-white shadow-md" : "border border-gray-300 text-gray-700 hover:bg-gray-100"}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingReturnGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">Edit Return Gift</h3>
                <button onClick={() => setEditingReturnGift(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    required
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setEditingReturnGift(null)} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">Add New Return Gift</h3>
                <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    required
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsCreating(false)} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
                    <Save className="w-4 h-4" /> Create Gift
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReturnGiftsAdmin;
