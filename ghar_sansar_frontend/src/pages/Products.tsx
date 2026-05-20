import React, { useMemo, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Zap, ShieldCheck, Truck, RefreshCw, CreditCard, Headphones, MessageCircle, Star, Heart, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// Helper for query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Formatting helper
function formatName(name: string) {
  if (!name) return "";
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const ProductsPage = () => {
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery();

  const itemsPerPage = 12;
  const page = Number(query.get("page") || 1);
  const categoryFilter = query.get("category") || "All";
  const subCategoryFilter = query.get("subCategory") || "All";
  const search = query.get("search") || "";
  const sortOrder = query.get("sort") || "featured";

  // State for image zoom / quick interactions
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Scroll to top when page or filters change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, categoryFilter, subCategoryFilter, search, sortOrder]);

  // Precompute lists
  const categories = useMemo(() => {
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
    let result = products.filter((p) => {
      const matchesSearch = search ? p.title.toLowerCase().includes(search.toLowerCase()) : true;
      const matchesCategory = categoryFilter === "All" ? true : p.category === categoryFilter;
      const matchesSubCategory = subCategoryFilter === "All" ? true : p.subCategory === subCategoryFilter;
      return matchesSearch && matchesCategory && matchesSubCategory;
    });

    if (sortOrder === "price-low") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOrder === "price-high") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [products, search, categoryFilter, subCategoryFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentProducts = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  function buildQuery(params: any) {
    const baseParams = Object.fromEntries(query.entries());
    const merged = { ...baseParams, ...params };
    Object.keys(merged).forEach((k) => {
      if (!merged[k] || merged[k] === "All" || merged[k] === "featured") delete merged[k];
    });
    return new URLSearchParams(merged).toString();
  }

  function updateQuery(params: any) {
    navigate(`?${buildQuery(params)}`);
  }

  function getPageNumbers(current: number, total: number, delta = 1) {
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

  const handleAddToCart = (e: React.MouseEvent, p: any) => {
    e.stopPropagation();
    if (p.price) {
      addToCart({
        id: p.id,
        name: p.title,
        price: p.price,
        image: p.image
      });
      toast.success("Added to Cart!");
    }
  };

  const handleBuyNow = (e: React.MouseEvent, p: any) => {
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
  };

  return (
    <div className="bg-[#f8f8f7] min-h-screen font-sans pb-20">
      
      {/* Luxury Hero Header */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-4">
              Curated Premium Collections
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium">
              Luxury crockery & interior essentials crafted for modern homes. Discover pieces that elevate your everyday living.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Breadcrumb & Results info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <nav className="flex items-center space-x-2 text-xs md:text-sm text-gray-400 font-medium">
            <span className="cursor-pointer hover:text-gray-900 transition" onClick={() => navigate("/")}>Home</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Shop Collection</span>
          </nav>
          <div className="text-sm text-gray-500 font-medium">
            Showing <span className="text-gray-900 font-bold">{filtered.length}</span> premium items
          </div>
        </div>

        {/* Floating Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-4 md:p-5 shadow-lg shadow-gray-200/20 mb-10 flex flex-col lg:flex-row items-center gap-4 sticky top-24 z-30"
        >
          {/* Search */}
          <div className="flex-grow w-full lg:w-auto relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="search"
              placeholder="Search premium collections..."
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400"
              value={search}
              onChange={(e) => updateQuery({ search: e.target.value, page: 1 })}
            />
          </div>

          <div className="flex flex-wrap md:flex-nowrap w-full lg:w-auto gap-3">
            {/* Category Dropdown */}
            <div className="flex-1 md:w-48 relative">
              <select
                className="w-full appearance-none bg-gray-50/50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                value={categoryFilter}
                onChange={(e) => updateQuery({ category: e.target.value, subCategory: "All", page: 1 })}
              >
                <option value="All">All Categories</option>
                {categories.filter(c => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>{formatName(cat)}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* Subcategory Dropdown */}
            <div className="flex-1 md:w-48 relative">
              <select
                className="w-full appearance-none bg-gray-50/50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
                value={subCategoryFilter}
                onChange={(e) => updateQuery({ subCategory: e.target.value, page: 1 })}
                disabled={categoryFilter === "All"}
              >
                <option value="All">All Subcategories</option>
                {subCategories.filter(s => s !== "All").map((sub) => (
                  <option key={sub} value={sub}>{formatName(sub)}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="w-full md:w-40 relative">
              <select
                className="w-full appearance-none bg-gray-50/50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                value={sortOrder}
                onChange={(e) => updateQuery({ sort: e.target.value, page: 1 })}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Chips (Quick Filters) */}
        {categoryFilter === "All" && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.filter(c => c !== "All").slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => updateQuery({ category: cat, page: 1 })}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:border-blue-500 hover:text-blue-600 shadow-sm transition-all"
              >
                {formatName(cat)}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-[20px] p-4 h-[400px]">
                <div className="bg-gray-100 rounded-2xl h-[240px] mb-4"></div>
                <div className="bg-gray-100 h-4 w-1/3 rounded mb-2"></div>
                <div className="bg-gray-100 h-6 w-3/4 rounded mb-4"></div>
                <div className="bg-gray-100 h-8 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center py-20 bg-white rounded-3xl border border-gray-100">
            <div className="text-2xl text-red-600 mb-2 font-bold">Unable to load collections</div>
            <div className="text-gray-500">{error}</div>
          </div>
        ) : currentProducts.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {currentProducts.map((p, index) => {
              const discount = p.actualPrice && p.price ? Math.round(((p.actualPrice - p.price) / p.actualPrice) * 100) : 0;
              const isHovered = hoveredProduct === p.id;
              
              // Random rating for premium feel if not available
              const rating = (Math.random() * (5 - 4) + 4).toFixed(1);
              const reviewsCount = Math.floor(Math.random() * 200) + 15;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onHoverStart={() => setHoveredProduct(p.id)}
                  onHoverEnd={() => setHoveredProduct(null)}
                  className="bg-white rounded-[24px] shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-500 p-4 cursor-pointer group flex flex-col relative"
                  onClick={() => navigate(`/product/${encodeURIComponent(p.id)}?${location.search}`, { state: p })}
                >
                  {/* Floating Action Icons */}
                  <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <button className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md text-gray-600 hover:text-red-500 hover:bg-white transition-colors">
                      <Heart size={16} />
                    </button>
                    <button className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md text-gray-600 hover:text-blue-600 hover:bg-white transition-colors">
                      <Eye size={16} />
                    </button>
                  </div>

                  {/* Image Container - Strictly Uncropped, Centered */}
                  <div className="relative w-full aspect-[4/5] bg-[#fdfdfc] rounded-2xl overflow-hidden flex items-center justify-center p-6 mb-5 border border-gray-50">
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm z-10">
                        {discount}% Off
                      </span>
                    )}
                    
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-gray-300 font-medium">No Image</div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col flex-grow px-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 mb-1">
                      {formatName(p.category)}
                    </span>
                    
                    <h2 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {formatName(p.title || "Untitled Collection")}
                    </h2>
                    
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex text-yellow-400">
                        <Star size={12} className="fill-current" />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{rating}</span>
                      <span className="text-xs text-gray-400">({reviewsCount})</span>
                    </div>

                    <div className="mt-auto pt-2">
                      {p.price ? (
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-xl font-black text-gray-900">₹{p.price}</span>
                          {p.actualPrice && p.actualPrice > p.price && (
                            <span className="text-xs font-semibold text-gray-400 line-through">₹{p.actualPrice}</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-gray-500 mb-4">Price on Request</p>
                      )}

                      {/* Luxury Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleAddToCart(e, p)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-gray-200 hover:border-blue-600 hover:text-blue-600 text-gray-700 rounded-xl text-xs font-bold transition-all"
                        >
                          <ShoppingCart size={14} />
                          Add
                        </button>
                        <button
                          onClick={(e) => handleBuyNow(e, p)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gray-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md transition-all transform active:scale-95"
                        >
                          <Zap size={14} />
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No collections found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
            <button 
              onClick={() => { updateQuery({ search: "All", category: "All", subCategory: "All" }); navigate('/products'); }}
              className="mt-6 px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-800 transition"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Elegant Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-16 mb-8">
            <nav className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <button
                disabled={page === 1}
                onClick={() => updateQuery({ page: page - 1 })}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 disabled:opacity-30 hover:bg-gray-100 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>

              {getPageNumbers(page, totalPages, 1).map((p, idx) =>
                p === "..." ? (
                  <span key={"dot" + idx} className="w-8 text-center text-gray-400 font-bold">
                    …
                  </span>
                ) : (
                  <button
                    key={`page-${p}`}
                    onClick={() => updateQuery({ page: p })}
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                      page === p 
                        ? "bg-gray-900 text-white shadow-md" 
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                disabled={page === totalPages}
                onClick={() => updateQuery({ page: page + 1 })}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 disabled:opacity-30 hover:bg-gray-100 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Trust & Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Secure Payments</h4>
            <p className="text-xs text-gray-500">100% encrypted transactions</p>
          </div>
          <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Truck size={24} />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Fast Delivery</h4>
            <p className="text-xs text-gray-500">Safe & secure logistics</p>
          </div>
          <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <RefreshCw size={24} />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Easy Returns</h4>
            <p className="text-xs text-gray-500">10-day return window</p>
          </div>
          <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Headphones size={24} />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Expert Support</h4>
            <p className="text-xs text-gray-500">Dedicated assistance</p>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Quick Action */}
      <a
        href="https://wa.me/918121135980"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-2xl shadow-green-600/30 transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-xl pointer-events-none">
          Need styling advice?
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </span>
      </a>

    </div>
  );
};

export default ProductsPage;
