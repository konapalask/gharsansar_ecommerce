import React, { useState, useEffect, useMemo } from "react";
import { Save, Edit3, Trash2, ImagePlus, Search, X, Filter, Plus, TrendingUp, Package, ChevronDown, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Product type
interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  actual_price?: string;
  image: string | File;
  video?: string;
  category: string;
  subCategory: string;
  features?: string[];
}

// Category type
interface Category {
  cat_id: string;
  name: string;
  subcategories: { sub_id: string; name: string }[];
}

// Fix CloudFront/S3 URLs or create object URL for File type images
const fixImageUrl = (url: string | File) => {
  if (!url) return "";
  if (url instanceof File) return URL.createObjectURL(url);
  let fixed = url.replace(/^https?:\/\/https?:\/\//, "https://").replace(/([^:]\/)\/+/g, "$1");
  if (fixed.startsWith("http://backend.gharsansar.store") || fixed.startsWith("http://lx70r6zsef")) {
    fixed = fixed.replace(/^http:/, "https:");
  }
  return fixed;
};

const ProductsAdmin: React.FC = () => {
  const API_BASE =
    import.meta.env.VITE_AWS_API_URL ||
    "https://backend.gharsansar.store/api";

  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Quick Edit State
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [quickPrice, setQuickPrice] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [expandedCategories, setExpandedCategories] = useState<{ [categoryName: string]: boolean }>({});
  const [expandedSubcategories, setExpandedSubcategories] = useState<{ [key: string]: boolean }>({});
  const [currentPages, setCurrentPages] = useState<{ [key: string]: number }>({});
  const ITEMS_PER_PAGE = 6;

  const toggleCategory = (catName: string) => {
    setExpandedCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  const toggleSubcategory = (catName: string, subName: string) => {
    const key = `${catName}-${subName}`;
    setExpandedSubcategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getPageForSubcategory = (catName: string, subName: string) => {
    return currentPages[`${catName}-${subName}`] || 1;
  };

  const setPageForSubcategory = (catName: string, subName: string, page: number) => {
    setCurrentPages(prev => ({ ...prev, [`${catName}-${subName}`]: page }));
  };

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    actual_price: "",
    image: "" as string | File,
    category: "Idols", // default
    subCategory: "Premium Line",
    features: [] as string[],
  });

  // Fetch categories and products
  const fetchCategoriesAndProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/storage/upload/products`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
      const data = await res.json();

      const categories = data.data || [];

      // Store categories
      setCategoriesData(
        categories.map((cat: any) => ({
          cat_id: cat.cat_id,
          name: cat.name,
          subcategories: (cat.subcategories || []).map((sub: any) => ({
            sub_id: sub.sub_id,
            name: sub.name,
          })),
        }))
      );

      // Flatten all products
      const allProducts: Product[] = [];
      categories.forEach((category: any) => {
        category.subcategories?.forEach((sub: any) => {
          sub.products?.forEach((p: any) => {
            allProducts.push({
              id: p.prod_id || p.id,
              title: p.title || "Untitled Product",
              description: p.description || "No description",
              price: p.price?.toString() || "0",
              actual_price: p["act-price"]?.toString() || "0",
              image: fixImageUrl(p.image),
              category: category.name,
              subCategory: sub.name,
            });
          });
        });
      });

      setProducts(allProducts);
      console.log("✅ Loaded products:", allProducts.length);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndProducts();
  }, []);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setForm({ ...form, image: file });
      setExistingImageUrl(null);
    }
  };

  // Handle form submit (Add or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || (!form.image && !existingImageUrl)) {
      alert("Title, price, and image are required.");
      return;
    }

    try {
      let res: Response;

      // 🟢 UPDATE PRODUCT
      if (editingId) {
        console.log("Updating product ID:", editingId);
        const params = new URLSearchParams();
        params.append("id", editingId);
        params.append("title", form.title);
        params.append("price", form.price);
        params.append("actual_price", form.actual_price || "0");
        params.append("description", form.description);
        params.append("category_name", form.category);
        params.append("subcategory_name", form.subCategory);

        res = await fetch(`${API_BASE}/storage/upload/products`, {
          method: "PUT",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        });
      }

      // 🟣 CREATE PRODUCT
      else {
        const formData = new FormData();
        formData.append("category_type", "products");
        formData.append("category_name", form.category);
        formData.append("subcategory_name", form.subCategory);
        formData.append("title", form.title);
        formData.append("price", form.price);
        formData.append("actual_price", form.actual_price || "0");
        formData.append("description", form.description);
        if (form.image instanceof File) {
          formData.append("image", form.image);
        }

        res = await fetch(`${API_BASE}/storage/upload`, {
          method: "POST",
          body: formData,
        });
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      await fetchCategoriesAndProducts();
      alert(editingId ? "✅ Product updated!" : "✅ Product added!");

      // Reset form
      setForm({
        title: "",
        description: "",
        price: "",
        actual_price: "",
        image: "",
        category: categoriesData[0]?.name || "Idols",
        subCategory: categoriesData[0]?.subcategories[0]?.name || "Premium Line",
        features: [],
      });
      setPreview(null);
      setExistingImageUrl(null);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error("❌ Error uploading product:", err);
      alert("Upload failed. Check console for details.");
    }
  };

  // Edit Product
  const handleEdit = (id: string) => {
    const p = products.find((p) => p.id === id);
    if (!p) {
      alert("Product not found!");
      return;
    }

    setForm({
      title: p.title,
      description: p.description,
      price: p.price,
      actual_price: p.actual_price || "",
      image: "",
      category: p.category,
      subCategory: p.subCategory,
      features: p.features || [],
    });
    setPreview(null);
    setExistingImageUrl(fixImageUrl(p.image));
    setEditingId(id);
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete product
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${API_BASE}/storage/uploads/products?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      alert("🗑️ Product deleted successfully!");
      await fetchCategoriesAndProducts();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save product.");
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      price: "",
      actual_price: "",
      image: "",
      category: categoriesData[0]?.name || "Idols",
      subCategory: categoriesData[0]?.subcategories[0]?.name || "Premium Line",
      features: [],
    });
    setPreview(null);
    setExistingImageUrl(null);
    setEditingId(null);
    setShowForm(false);
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = searchTerm
        ? p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const uniqueCategories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const groupedProducts = useMemo(() => {
    const groups: {
      [category: string]: {
        [subcategory: string]: Product[]
      }
    } = {};

    filteredProducts.forEach(p => {
      if (!groups[p.category]) {
        groups[p.category] = {};
      }
      if (!groups[p.category][p.subCategory]) {
        groups[p.category][p.subCategory] = [];
      }
      groups[p.category][p.subCategory].push(p);
    });

    return groups;
  }, [filteredProducts]);

  // Auto-expand categories/subcategories on search
  useEffect(() => {
    if (searchTerm) {
      const newExpCats: { [catName: string]: boolean } = {};
      const newExpSubs: { [key: string]: boolean } = {};
      
      filteredProducts.forEach(p => {
        newExpCats[p.category] = true;
        newExpSubs[`${p.category}-${p.subCategory}`] = true;
      });
      
      setExpandedCategories(newExpCats);
      setExpandedSubcategories(newExpSubs);
    }
  }, [searchTerm, filteredProducts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Products</h1>
          <p className="text-gray-600 mt-1">{products.length} total products</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add New Product
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
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none bg-white"
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

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-w-4xl w-full my-auto max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {editingId ? <Edit3 className="text-blue-600" /> : <Plus className="text-blue-600" />}
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title & Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product Title *</label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Premium Idol"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                        <input
                          type="number"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          placeholder="e.g. 999"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Actual Price</label>
                        <input
                          type="number"
                          value={form.actual_price}
                          onChange={(e) => setForm({ ...form, actual_price: e.target.value })}
                          placeholder="e.g. 1299"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Product details..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                    ></textarea>
                  </div>

                  {/* Category & Subcategory */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          const subcats = categoriesData.find(c => c.name === newCat)?.subcategories || [];
                          setForm({
                            ...form,
                            category: newCat,
                            subCategory: subcats.length > 0 ? subcats[0].name : "",
                          });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none bg-white"
                      >
                        {categoriesData.map((cat) => (
                          <option key={cat.cat_id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory</label>
                      <select
                        value={form.subCategory}
                        onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none bg-white"
                      >
                        {categoriesData
                          .find((c) => c.name === form.category)
                          ?.subcategories.map((sub) => (
                            <option key={sub.sub_id} value={sub.name}>{sub.name}</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image *</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden">
                        {(preview || existingImageUrl) ? (
                          <img
                            src={preview || existingImageUrl || ""}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImagePlus className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
                          </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold inline-flex items-center justify-center gap-2"
                    >
                      {editingId ? <><Save className="w-5 h-5" /> Update Product</> : <><Plus className="w-5 h-5" /> Add Product</>}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product List Grouped by Category & Subcategory */}
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Products Catalog ({filteredProducts.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="spinner"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="space-y-4">
            {Object.keys(groupedProducts).map((catName) => {
              const isCatExpanded = !!expandedCategories[catName];
              const subcats = groupedProducts[catName];
              const totalItemsInCat = Object.values(subcats).reduce((acc, curr) => acc + curr.length, 0);

              return (
                <div key={catName} className="bg-white/85 backdrop-blur-md rounded-2xl border border-gray-100 shadow-md overflow-hidden transition-all duration-300">
                  {/* Category Accordion Header */}
                  <button
                    onClick={() => toggleCategory(catName)}
                    className="w-full flex items-center justify-between p-5 text-left bg-gray-50/50 hover:bg-gray-50/80 transition-colors border-b border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{catName}</h3>
                        <p className="text-xs text-gray-500 font-medium">{totalItemsInCat} products across {Object.keys(subcats).length} subcategories</p>
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
                        className="overflow-hidden p-4 space-y-4 bg-white"
                      >
                        {Object.keys(subcats).map((subName) => {
                          const subcatKey = `${catName}-${subName}`;
                          const isSubExpanded = !!expandedSubcategories[subcatKey];
                          const allSubProducts = subcats[subName];
                          const page = getPageForSubcategory(catName, subName);
                          const totalPages = Math.ceil(allSubProducts.length / ITEMS_PER_PAGE);
                          const startIndex = (page - 1) * ITEMS_PER_PAGE;
                          const paginatedProducts = allSubProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

                          return (
                            <div key={subName} className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/20">
                              {/* Subcategory Accordion Header */}
                              <button
                                onClick={() => toggleSubcategory(catName, subName)}
                                className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors border-b border-gray-100"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                  <h4 className="font-semibold text-base text-gray-800">{subName}</h4>
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                    {allSubProducts.length}
                                  </span>
                                </div>
                                {isSubExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-500" />
                                )}
                              </button>

                              {/* Subcategory Content */}
                              <AnimatePresence initial={false}>
                                {isSubExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden p-4"
                                  >
                                    {/* Products Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                      {paginatedProducts.map((p, index) => (
                                        <motion.div
                                          key={p.id}
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ duration: 0.2, delay: index * 0.03 }}
                                          whileHover={{ scale: 1.01, y: -3 }}
                                          className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group"
                                        >
                                          <div className="relative overflow-hidden bg-gray-100 aspect-square flex items-center justify-center">
                                            <img
                                              src={fixImageUrl(p.image)}
                                              alt={p.title}
                                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                            />
                                          </div>
                                          <div className="p-4">
                                            <h5 className="font-bold text-sm text-gray-800 mb-1 line-clamp-1">{p.title}</h5>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description}</p>
                                            
                                            {/* Price with Inline Edit */}
                                            <div className="flex items-center gap-2 mb-4 h-8">
                                              {editingPriceId === p.id ? (
                                                <div className="flex items-center gap-1 w-full bg-blue-50 border border-blue-200 rounded px-2 py-1">
                                                  <span className="text-blue-600 font-bold">₹</span>
                                                  <input 
                                                    autoFocus
                                                    type="number" 
                                                    className="w-full bg-transparent outline-none text-blue-700 font-bold text-sm"
                                                    value={quickPrice}
                                                    onChange={(e) => setQuickPrice(e.target.value)}
                                                    onKeyDown={(e) => {
                                                      if (e.key === 'Enter') handleQuickPriceUpdate(p);
                                                      if (e.key === 'Escape') setEditingPriceId(null);
                                                    }}
                                                  />
                                                  <button onClick={() => handleQuickPriceUpdate(p)} className="p-1 hover:bg-blue-200 rounded text-blue-600">
                                                    <Check size={14} />
                                                  </button>
                                                  <button onClick={() => setEditingPriceId(null)} className="p-1 hover:bg-blue-200 rounded text-red-500">
                                                    <X size={14} />
                                                  </button>
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-2 group/price cursor-pointer w-full" onClick={() => { setEditingPriceId(p.id); setQuickPrice(p.price); }}>
                                                  <span className="text-lg font-bold text-blue-600 border-b border-transparent group-hover/price:border-blue-400 border-dashed">₹{p.price}</span>
                                                  {p.actual_price && (
                                                    <span className="text-xs text-gray-400 line-through">₹{p.actual_price}</span>
                                                  )}
                                                  <Edit3 className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover/price:opacity-100 transition-opacity ml-auto" />
                                                </div>
                                              )}
                                            </div>

                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => handleEdit(p.id)}
                                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs transition-colors font-semibold inline-flex items-center justify-center gap-1"
                                              >
                                                <Edit3 className="w-3.5 h-3.5" /> Edit
                                              </button>
                                              <button
                                                onClick={() => handleDelete(p.id)}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs transition-colors font-semibold inline-flex items-center justify-center gap-1"
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
                                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                                        <button
                                          onClick={() => setPageForSubcategory(catName, subName, page - 1)}
                                          disabled={page === 1}
                                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 text-gray-700"
                                        >
                                          Previous
                                        </button>
                                        <span className="text-sm font-medium text-gray-600">
                                          Page {page} of {totalPages}
                                        </span>
                                        <button
                                          onClick={() => setPageForSubcategory(catName, subName, page + 1)}
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
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600">
              {searchTerm || categoryFilter !== "All"
                ? "Try adjusting your filters"
                : "Start by adding your first product"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductsAdmin;
