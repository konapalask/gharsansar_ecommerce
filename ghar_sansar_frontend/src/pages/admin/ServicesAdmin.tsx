import React, { useState, useEffect, useMemo } from "react";
import { useServices, Service } from "../../context/ServiceContext";
import { Search, Plus, X, Edit3, Trash2, Save, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const fixImageUrl = (url: string | undefined) => {
  if (!url) return "";
  return url
    .replace(/^https?:\/\/https?:\/\//, "https://")
    .replace(/\s/g, "%20")
    .replace(/([^:]\/)\/+/g, "$1");
};

const ServicesAdmin: React.FC = () => {
  const { services, addService, updateService, deleteService, refreshServices } = useServices();

  // ✅ Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [actualPrice, setActualPrice] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [features, setFeatures] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Reset form
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setActualPrice("");
    setCategoryName("");
    setSubcategoryName("");
    setFeatures("");
    setImageFile(null);
    setPreview(null);
    setEditingService(null);
    setShowForm(false);
  };

  // ✅ Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Safe number conversion
  const parseNumber = (val: string): number | undefined => {
    if (!val.trim()) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  };

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !price || !categoryName || !subcategoryName) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      if (editingService) {
        // ✅ Update existing service
        await updateService(editingService, {
          title,
          description,
          price: parseNumber(price),
          actual_price: parseNumber(actualPrice),
          features: features ? features.split(",").map((f) => f.trim()) : [],
        });
      } else {
        // ✅ Add new service
        await addService({
          id: "", // backend generates
          title,
          description,
          price: parseNumber(price),
          actual_price: parseNumber(actualPrice),
          image: imageFile || "", // file upload
          category_name: categoryName,
          subcategory_name: subcategoryName,
          features: features ? features.split(",").map((f) => f.trim()) : [],
        } as any);
      }

      await refreshServices();
      resetForm();
      alert(editingService ? "✅ Service updated successfully!" : "✅ Service added successfully!");
    } catch (err) {
      console.error("❌ Error saving service:", err);
      alert("❌ Failed to save service. Please try again.");
    }
  };

  const handleEdit = (id: string) => {
    const s = services.find((s) => s.id === id);
    if (!s) return;
    setEditingService(s);
    setTitle(s.title);
    setDescription(s.description);
    setPrice(s.price?.toString() || "");
    setActualPrice(s.actual_price?.toString() || "");
    setCategoryName(s.category_name);
    setSubcategoryName(s.subcategory_name);
    setFeatures(s.features?.join(", ") || "");
    setPreview(fixImageUrl(s.image));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    const s = services.find((s) => s.id === id);
    if (!s) return;
    if (confirm("Are you sure you want to delete this service?")) {
      await deleteService(s);
      await refreshServices();
      alert("🗑️ Service deleted successfully!");
    }
  };

  useEffect(() => {
    refreshServices();
  }, []);

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch = searchTerm
        ? s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesSearch;
    });
  }, [services, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Services</h1>
          <p className="text-gray-600 mt-1">{services.length} total services</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add New Service
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
          />
        </div>
      </motion.div>

      {/* ✅ Add / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl p-6 space-y-4 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingService ? "Edit Service" : "Add New Service"}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Service Title *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="Enter service title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="Enter category"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="Enter subcategory"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition h-32 resize-none"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Features</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="Features (comma separated)"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
              />
            </div>

            {/* ✅ Image upload only for NEW */}
            {!editingService && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Service Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition cursor-pointer"
                />
              </div>
            )}

            {preview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden"
              >
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              </motion.div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold inline-flex items-center gap-2"
              >
                {editingService ? (
                  <>
                    <Save className="w-5 h-5" /> Update Service
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-5 h-5" /> Add Service
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ✅ Service List */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          Services ({filteredServices.length})
        </h2>
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredServices.map((s, index) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 bg-white rounded-2xl shadow-lg flex flex-col sm:flex-row gap-4 hover:shadow-xl transition-all duration-300 group"
              >
                {s.image && (
                  <div className="w-full sm:w-32 aspect-video sm:aspect-square bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={fixImageUrl(s.image)}
                      alt={s.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <strong className="block text-lg font-bold text-gray-800 mb-1">{s.title}</strong>
                  {s.price && (
                    <span className="text-purple-600 font-bold text-lg">₹{s.price}</span>
                  )}
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{s.description}</p>
                  <span className="text-xs text-gray-500 mt-2 inline-block bg-gray-100 px-2 py-1 rounded">
                    {s.category_name} → {s.subcategory_name}
                  </span>
                </div>
                <div className="flex sm:flex-col gap-2 sm:justify-start">
                  <button
                    onClick={() => handleEdit(s.id)}
                    className="flex-1 sm:flex-none bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-semibold inline-flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold inline-flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No services found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search" : "Start by adding your first service"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ServicesAdmin;
