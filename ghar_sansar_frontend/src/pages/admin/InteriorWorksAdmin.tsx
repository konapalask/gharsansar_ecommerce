import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit3, Trash2, Save, X, Search, Hammer, ChevronDown, ChevronRight } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface InteriorWork {
  id: string;
  title: string;
  category: string;
  subCategory: string;
  description: string;
  image?: string;
  file?: File;
}

interface Category {
  name: string;
  subcategories: { name: string }[];
}

const API_UPLOAD = (import.meta.env.VITE_AWS_API_URL || "https://backend.gharsansar.store/api") + "/storage/upload";

const InteriorWorksAdmin: React.FC = () => {
  const [works, setWorks] = useState<InteriorWork[]>([]);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [form, setForm] = useState<InteriorWork | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [expandedCategories, setExpandedCategories] = useState<{ [categoryName: string]: boolean }>({});
  const [currentPages, setCurrentPages] = useState<{ [categoryName: string]: number }>({});
  const ITEMS_PER_PAGE = 6;

  const toggleCategory = (catName: string) => {
    setExpandedCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  const getPageForCategory = (catName: string) => {
    return currentPages[catName] || 1;
  };

  const setPageForCategory = (catName: string, page: number) => {
    setCurrentPages(prev => ({ ...prev, [catName]: page }));
  };

  const fetchWorks = async () => {
    try {
      const res = await axios.get(`${API_UPLOAD}/interior`);
      const data = await res.data;

      // Handle new API structure with data.data array
      const categories = data.data || data.categories || [];

      setCategoriesData(
        Array.isArray(categories)
          ? categories.map((cat: any) => ({
              name: cat.name,
              subcategories: Array.isArray(cat.subcategories)
                ? cat.subcategories.map((sub: any) => ({ name: sub.name }))
                : [],
            }))
          : []
      );

      const BACKEND_STATIC_URL = API_UPLOAD.replace('/api/storage/upload', '');
      const flatWorks: InteriorWork[] = categories.flatMap((cat: any) =>
        cat.subcategories.map((sub: any, idx: number) => {
          const imagePath = sub.image;
          const sanitizedImage = imagePath ? (imagePath.startsWith("http") ? imagePath : `${BACKEND_STATIC_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`) : undefined;
          return {
            id: sub.id || `${cat.name}-${sub.name}-${idx}`,
            title: sub.name,
            category: cat.name,
            subCategory: sub.name,
            description: sub.description || cat.name,
            image: sanitizedImage,
          };
        })
      );
      setWorks(flatWorks);
    } catch (err) {
      console.error("Failed to fetch works:", err);
      setWorks([]);
      setCategoriesData([]);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const handleAdd = () => {
    setForm({
      id: "",
      title: "",
      category: "",
      subCategory: "",
      description: "",
      image: "",
    });
  };

  const handleEdit = (work: InteriorWork) => {
    setForm({ ...work, file: undefined });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    const work = works.find((w) => w.id === id);
    if (!work || !window.confirm("Are you sure you want to delete this interior work?")) return;

    try {
      await axios.delete(`${API_UPLOAD}/interior`, {
        params: {
          category_type: "interior",
          category_name: work.category,
          subcategory_name: work.subCategory,
          id: work.id,
        },
      });
      alert("🗑️ Interior work deleted successfully!");
      fetchWorks();
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("❌ Failed to delete interior work");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => (prev ? { ...prev, file: e.target.files![0] } : prev));
    }
  };

  const handleSave = async () => {
    if (!form || !form.title || !form.category || !form.subCategory)
      return alert("Fill all required fields");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("category_type", "interior");
      formData.append("category_name", form.category);
      formData.append("subcategory_name", form.subCategory);
      formData.append("title", form.title);
      formData.append("description", form.description || "");
      if (form.file) {
        formData.append("image", form.file);
      }

      await axios.post(API_UPLOAD, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Interior work saved successfully!");
      setForm(null);
      fetchWorks();
    } catch (err) {
      console.error("Failed to save:", err);
      alert("❌ Failed to save interior work");
    } finally {
      setLoading(false);
    }
  };

  // Filter works
  const filteredWorks = useMemo(() => {
    return works.filter((work) => {
      const matchesSearch = searchTerm
        ? work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          work.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesCategory = categoryFilter === "All" || work.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [works, searchTerm, categoryFilter]);

  const uniqueCategories = useMemo(
    () => ["All", ...Array.from(new Set(works.map((w) => w.category)))],
    [works]
  );

  const groupedWorks = useMemo(() => {
    const groups: { [category: string]: InteriorWork[] } = {};
    filteredWorks.forEach((work) => {
      if (!groups[work.category]) {
        groups[work.category] = [];
      }
      groups[work.category].push(work);
    });
    return groups;
  }, [filteredWorks]);

  // Auto-expand categories on search
  useEffect(() => {
    if (searchTerm) {
      const newExpCats: { [catName: string]: boolean } = {};
      filteredWorks.forEach(w => {
        newExpCats[w.category] = true;
      });
      setExpandedCategories(newExpCats);
    }
  }, [searchTerm, filteredWorks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Interior Works Management</h1>
          <p className="text-gray-600 mt-1">{works.length} total works</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add New Work
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search interior works..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div className="relative">
            <Hammer className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition appearance-none bg-white"
            >
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {form && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {form.id ? "Edit Work" : "Add New Work"}
              </h2>
              <button
                onClick={() => setForm(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  placeholder="Enter work title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <input
                    list="category-list"
                    placeholder="Select or type new category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                    required
                  />
                  <datalist id="category-list">
                    {categoriesData.map((cat) => (
                      <option key={cat.name} value={cat.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory *</label>
                  <input
                    list="subcategory-list"
                    placeholder="Select or type new subcategory"
                    value={form.subCategory}
                    onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                    required
                  />
                  <datalist id="subcategory-list">
                    {categoriesData
                      .find((c) => c.name === form.category)
                      ?.subcategories.map((sub) => (
                        <option key={sub.name} value={sub.name} />
                      ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Enter description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition h-32 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Work Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition cursor-pointer"
                />
              </div>

              {form.file ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={URL.createObjectURL(form.file)}
                  alt="Preview"
                  className="w-full h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
                />
              ) : (
                form.image && (
                  <img
                    src={form.image}
                    alt="Current"
                    className="w-full h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
                  />
                )
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-8 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold inline-flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" /> {loading ? "Saving..." : "Save Work"}
                </button>
                <button
                  onClick={() => setForm(null)}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Grouped by Category */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          Interior Works Catalog ({filteredWorks.length})
        </h2>
        {filteredWorks.length > 0 ? (
          <div className="space-y-4">
            {Object.keys(groupedWorks).map((catName) => {
              const isCatExpanded = !!expandedCategories[catName];
              const categoryWorks = groupedWorks[catName];
              const page = getPageForCategory(catName);
              const totalPages = Math.ceil(categoryWorks.length / ITEMS_PER_PAGE);
              const startIndex = (page - 1) * ITEMS_PER_PAGE;
              const paginatedWorks = categoryWorks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

              return (
                <div key={catName} className="bg-white/85 backdrop-blur-md rounded-2xl border border-gray-100 shadow-md overflow-hidden transition-all duration-300">
                  {/* Category Header (Accordion) */}
                  <button
                    onClick={() => toggleCategory(catName)}
                    className="w-full flex items-center justify-between p-5 text-left bg-gray-50/50 hover:bg-gray-50/80 transition-colors border-b border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                        <Hammer className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{catName}</h3>
                        <p className="text-xs text-gray-500 font-medium">{categoryWorks.length} interior works designs</p>
                      </div>
                    </div>
                    {isCatExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  {/* Category Content */}
                  <AnimatePresence initial={false}>
                    {isCatExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden p-5 bg-white space-y-6"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {paginatedWorks.map((work, index) => (
                            <motion.div
                              key={work.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: index * 0.03 }}
                              whileHover={{ scale: 1.01, y: -3 }}
                              className="bg-white rounded-xl border border-gray-100 shadow overflow-hidden hover:shadow-md transition-all duration-300 group"
                            >
                              {work.image && (
                                <div className="relative overflow-hidden bg-gray-100 aspect-[4/3] flex items-center justify-center">
                                  <img
                                    src={work.image}
                                    alt={work.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                </div>
                              )}
                              <div className="p-4">
                                <h4 className="text-base font-bold mb-1 text-gray-800 line-clamp-1">{work.title}</h4>
                                <p className="text-xs text-gray-500 mb-2">
                                  {work.category} → {work.subCategory}
                                </p>
                                <p className="text-gray-600 text-xs line-clamp-2 mb-4">{work.description}</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEdit(work)}
                                    className="flex-1 bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition-colors text-xs font-semibold inline-flex items-center justify-center gap-1"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(work.id)}
                                    className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-xs font-semibold inline-flex items-center justify-center gap-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                            <button
                              onClick={() => setPageForCategory(catName, page - 1)}
                              disabled={page === 1}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 text-gray-700"
                            >
                              Previous
                            </button>
                            <span className="text-sm font-medium text-gray-600">
                              Page {page} of {totalPages}
                            </span>
                            <button
                              onClick={() => setPageForCategory(catName, page + 1)}
                              disabled={page === totalPages}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 text-gray-700"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <Hammer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No interior works found</h3>
            <p className="text-gray-600">
              {searchTerm || categoryFilter !== "All"
                ? "Try adjusting your filters"
                : "Start by adding your first interior work"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InteriorWorksAdmin;
