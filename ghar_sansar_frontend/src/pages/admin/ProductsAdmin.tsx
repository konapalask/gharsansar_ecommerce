import React, { useState, useEffect, useMemo } from "react";
import { Save, Edit3, Trash2, ImagePlus, Search, X, Filter, Plus, TrendingUp, Package } from "lucide-react";
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
  return url.replace(/^https?:\/\/https?:\/\//, "https://").replace(/([^:]\/)\/+/g, "$1");
};

const ProductsAdmin: React.FC = () => {
  const API_BASE =
    import.meta.env.VITE_AWS_API_URL ||
    "http://localhost:5001/api";

  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

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
    } catch (err) {
      console.error("❌ Error deleting product:", err);
      alert("Delete failed. Check console for details.");
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

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter price"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter product description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition h-32 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                        subCategory:
                          categoriesData.find((c) => c.name === e.target.value)?.subcategories[0]
                            ?.name || "",
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none bg-white"
                  >
                    {categoriesData.map((cat) => (
                      <option key={cat.cat_id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={form.subCategory}
                    onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none bg-white"
                  >
                    {categoriesData
                      .find((c) => c.name === form.category)
                      ?.subcategories.map((sub) => (
                        <option key={sub.sub_id} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition cursor-pointer"
                />
                {(preview || existingImageUrl) && (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={preview || existingImageUrl || ""}
                    alt="Preview"
                    className="w-full h-64 object-contain rounded-lg mt-4 border border-gray-200 bg-gray-50"
                  />
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold inline-flex items-center gap-2"
                >
                  {editingId ? (
                    <>
                      <Save className="w-5 h-5" /> Update Product
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-5 h-5" /> Add Product
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
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Products ({filteredProducts.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="spinner"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative overflow-hidden bg-gray-100 aspect-square flex items-center justify-center">
                  <img
                    src={fixImageUrl(p.image)}
                    alt={p.title}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {p.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2">{p.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{p.description}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-blue-600">₹{p.price}</span>
                    {p.actual_price && (
                      <span className="text-gray-400 line-through">₹{p.actual_price}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(p.id)}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold inline-flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold inline-flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
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
