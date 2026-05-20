import React, { useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// Helper for query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Formatting helper
function formatName(name) {
  if (!name) return "";
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Example font style, adjust as needed for Tailwind config
const handwritingStyle = "font-bold italic font-cursive";

const ProductsPage = () => {
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery();

  const itemsPerPage = 12;
  const page = Number(query.get("page") || 1);
  const categoryFilter = query.get("category") || "Cello";
  const subCategoryFilter = query.get("subCategory") || "All";
  const search = query.get("search") || "";

  // Scroll to top when page or filters change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, categoryFilter, subCategoryFilter, search]);

  // Precompute lists
  const categories = useMemo(() => {
    // Preserve server-side order (Cello is already first in products.json)
    const seen = new Set<string>();
    const cats: string[] = [];
    products.forEach((p) => {
      if (!seen.has(p.category)) {
        seen.add(p.category);
        cats.push(p.category);
      }
    });
    return ["All", ...cats];
  }, [products]);

  const subCategories = useMemo(() => {
    if (categoryFilter === "All") {
      const subs = Array.from(new Set(products.map((p) => p.subCategory)));
      return ["All", ...subs];
    }
    const subs = Array.from(
      new Set(products.filter((p) => p.category === categoryFilter).map((p) => p.subCategory))
    );
    return ["All", ...subs];
  }, [products, categoryFilter]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = search ? p.title.toLowerCase().includes(search.toLowerCase()) : true;
      const matchesCategory = categoryFilter === "All" ? true : p.category === categoryFilter;
      const matchesSubCategory = subCategoryFilter === "All" ? true : p.subCategory === subCategoryFilter;
      return matchesSearch && matchesCategory && matchesSubCategory;
    });
  }, [products, search, categoryFilter, subCategoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentProducts = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Helper: build query string from object
  function buildQuery(params) {
    const baseParams = Object.fromEntries(query.entries());
    const merged = { ...baseParams, ...params };
    Object.keys(merged).forEach((k) => {
      if (!merged[k] || merged[k] === "All") delete merged[k];
    });
    return new URLSearchParams(merged).toString();
  }

  // Update query string in URL
  function updateQuery(params) {
    navigate(`?${buildQuery(params)}`);
  }

  // Pagination logic with "..." ellipsis, delta = 1
  function getPageNumbers(current, total, delta = 1) {
    const range = [];
    const rangeWithDots = [];
    let l;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }
    for (let i of range) {
      if (l !== undefined) {
        if (typeof i === "number" && i - l === 2) rangeWithDots.push(l + 1);
        else if (typeof i === "number" && i - l > 2) rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      l = typeof i === "number" ? i : l;
    }
    return rangeWithDots;
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto bg-white min-h-screen font-sans">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-5xl font-bold italic font-cursive mb-6"
      >
        Products by Gharsansar
      </motion.h1>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-6"
      >
        {/* Search */}
        <div className="flex items-center border rounded px-3 py-2 w-full md:max-w-xs bg-white shadow-sm hover:shadow-md transition-shadow">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="search"
            placeholder="Search products..."
            className="flex-grow bg-transparent outline-none text-sm"
            value={search}
            onChange={(e) => updateQuery({ search: e.target.value, page: 1 })}
          />
        </div>

        {/* Category Filter */}
        <select
          className="border rounded px-3 py-2 text-sm font-serif italic hover:shadow-md transition-shadow cursor-pointer"
          value={categoryFilter}
          onChange={(e) => updateQuery({ category: e.target.value, subCategory: "All", page: 1 })}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {formatName(cat)}
            </option>
          ))}
        </select>

        {/* Subcategory Filter */}
        <select
          className={`border rounded px-3 py-2 text-sm ${handwritingStyle} hover:shadow-md transition-shadow cursor-pointer`}
          value={subCategoryFilter}
          onChange={(e) => updateQuery({ subCategory: e.target.value, page: 1 })}
        >
          {subCategories.map((sub) => (
            <option key={sub} value={sub}>
              {formatName(sub)}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center py-12">
          <div className="text-xl text-red-600 mb-2">Error loading products</div>
          <div className="text-sm text-gray-500">{error}</div>
        </div>
      ) : currentProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {currentProducts.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="border rounded-lg shadow hover:shadow-xl transition-all duration-300 p-3 cursor-pointer bg-white group overflow-hidden"
              onClick={() => navigate(`/product/${encodeURIComponent(p.id)}?${location.search}`)}
            >
              <div className="relative overflow-hidden rounded-lg">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-48 sm:h-60 md:h-72 object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-48 sm:h-60 md:h-72 bg-gray-200 flex items-center justify-center rounded-lg">
                    No Image
                  </div>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-semibold mt-2 line-clamp-2">{formatName(p.title || "Untitled")}</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-bold italic font-cursive">
                {formatName(p.category)} / {formatName(p.subCategory)}
              </p>
              
              {/* Price and Buttons */}
              <div className="mt-3 space-y-2">
                {p.price ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-blue-600">₹{p.price}</span>
                    {p.actualPrice && p.actualPrice > p.price && (
                      <span className="text-sm text-gray-500 line-through">₹{p.actualPrice}</span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Contact for Price</p>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (p.price) {
                        addToCart({
                          id: p.id,
                          name: p.title,
                          price: p.price,
                          image: p.image
                        });
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (p.price) {
                        addToCart({
                          id: p.id,
                          name: p.title,
                          price: p.price,
                          image: p.image
                        });
                        if (!isAuthenticated) {
                          toast.error('Please sign in to proceed to checkout!');
                          navigate('/login', { state: { from: { pathname: '/checkout' } } });
                        } else {
                          navigate('/checkout');
                        }
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Buy
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-gray-600"
        >
          No products found.
        </motion.p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.nav 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mt-8"
        >
          <motion.button
            disabled={page === 1}
            onClick={() => updateQuery({ page: page - 1 })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-blue-600 hover:text-white transition-all font-semibold"
          >
            &lt; Previous
          </motion.button>

          {getPageNumbers(page, totalPages, 1).map((p, idx) =>
            p === "..." ? (
              <span key={"dot" + idx} className="px-3 py-2">
                …
              </span>
            ) : (
              <motion.button
                key={`page-${p}`}
                onClick={() => updateQuery({ page: p })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 border rounded hover:bg-blue-600 hover:text-white transition-all font-semibold ${
                  page === p ? "bg-blue-600 text-white border-blue-600" : ""
                }`}
              >
                {p}
              </motion.button>
            )
          )}

          <motion.button
            disabled={page === totalPages}
            onClick={() => updateQuery({ page: page + 1 })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-blue-600 hover:text-white transition-all font-semibold"
          >
            Next &gt;
          </motion.button>
        </motion.nav>
      )}
    </div>
  );
};

export default ProductsPage;
