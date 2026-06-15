import React, { useMemo, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Zap, ShieldCheck, Truck, RefreshCw, Headphones, MessageCircle, Star, Heart, Eye, X, ChevronDown, SlidersHorizontal } from "lucide-react";
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

interface CustomSelectProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
  formatValue?: (val: string) => string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
  formatValue = (v) => v
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-gray-200 hover:border-luxury-gold rounded-full py-3 px-5 text-xs font-semibold uppercase tracking-wider text-luxury-charcoal focus:outline-none focus:ring-2 focus:ring-luxury-gold/20 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-left"
      >
        <span className="truncate">
          {value === "All" ? placeholder : formatValue(value)}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-250 shrink-0 ml-2 ${
            isOpen ? "transform rotate-180 text-luxury-charcoal" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-40 left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 focus:outline-none"
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-5 py-2.5 text-xs transition-all hover:bg-luxury-warmGray/50 flex items-center justify-between uppercase tracking-wider ${
                  opt === value ? "font-bold text-luxury-gold bg-luxury-cream" : "font-semibold text-gray-650 hover:text-luxury-charcoal"
                }`}
              >
                <span className="truncate">{opt === "All" ? placeholder : formatValue(opt)}</span>
                {opt === value && (
                  <svg className="w-4 h-4 text-luxury-gold shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-cream/60 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif text-luxury-charcoal mb-4">
              Curated Premium Collections
            </h1>
            <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
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
          className="bg-white/65 backdrop-blur-md border border-gray-200/50 rounded-[24px] p-4 md:p-5 shadow-sm mb-6 flex flex-col lg:flex-row items-center gap-4 relative z-30"
        >
          {/* Search */}
          <div className="flex-grow w-full lg:w-auto relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-luxury-charcoal transition-colors">
              <Search size={18} />
            </div>
            <input
              type="search"
              placeholder="Search premium collections..."
              className="w-full bg-white border border-gray-200 focus:border-luxury-gold focus:ring-4 focus:ring-luxury-gold/10 rounded-full py-3.5 pl-12 pr-10 text-sm focus:outline-none transition-all font-medium placeholder:text-gray-400 text-gray-800 shadow-sm"
              value={search}
              onChange={(e) => updateQuery({ search: e.target.value, page: 1 })}
            />
            {search && (
              <button
                type="button"
                onClick={() => updateQuery({ search: "", page: 1 })}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-luxury-charcoal transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap w-full lg:w-auto gap-3 shrink-0">
            {/* Category Dropdown */}
            <div className="flex-1 sm:w-48 relative">
              <CustomSelect
                value={categoryFilter}
                options={categories}
                onChange={(val) => updateQuery({ category: val, subCategory: "All", page: 1 })}
                placeholder="All Categories"
                formatValue={formatName}
              />
            </div>

            {/* Subcategory Dropdown */}
            <div className="flex-1 sm:w-48 relative">
              <CustomSelect
                value={subCategoryFilter}
                options={subCategories}
                onChange={(val) => updateQuery({ subCategory: val, page: 1 })}
                placeholder="All Subcategories"
                disabled={categoryFilter === "All"}
                formatValue={formatName}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="w-full sm:w-44 relative">
              <CustomSelect
                value={sortOrder}
                options={["featured", "price-low", "price-high"]}
                onChange={(val) => updateQuery({ sort: val, page: 1 })}
                placeholder="Featured"
                formatValue={(val) => {
                  if (val === "featured") return "Featured";
                  if (val === "price-low") return "Price: Low to High";
                  if (val === "price-high") return "Price: High to Low";
                  return val;
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Category Chips (Quick Filters) */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-luxury-gold uppercase tracking-widest mr-2">
            <SlidersHorizontal size={11} className="text-luxury-gold" />
            Quick Filters:
          </span>
          {categories.map((cat) => {
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => updateQuery({ category: cat, subCategory: "All", page: 1 })}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${
                  isActive 
                    ? "bg-luxury-charcoal text-white border-luxury-charcoal hover:bg-luxury-gold hover:border-luxury-gold shadow-md" 
                    : "bg-white text-gray-500 border-gray-200 hover:border-luxury-gold hover:text-luxury-gold hover:bg-white"
                }`}
              >
                {cat === "All" ? "All Collections" : formatName(cat)}
              </button>
            );
          })}
        </div>

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
              const rating = (Math.random() * (5 - 4) + 4).toFixed(1);
              const reviewsCount = Math.floor(Math.random() * 200) + 15;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white rounded-[20px] shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-500 p-4 cursor-pointer group flex flex-col relative"
                  onClick={() => navigate(`/product/${encodeURIComponent(p.id)}?${location.search}`, { state: p })}
                >
                  {/* Floating Action Icons */}
                  <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <button className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md text-gray-600 hover:text-red-500 hover:bg-white transition-colors">
                      <Heart size={16} />
                    </button>
                  </div>

                  {/* Image Container - Strictly Uncropped, Centered */}
                  <div className="relative w-full aspect-[4/5] bg-[#fdfdfc] rounded-2xl overflow-hidden flex items-center justify-center p-6 mb-5 border border-gray-50">
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-luxury-gold text-white px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm z-10">
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
                    <span className="text-[9px] uppercase font-bold tracking-widest text-luxury-gold mb-1">
                      {formatName(p.category)}
                    </span>
                    
                    <h2 className="text-sm font-bold text-luxury-charcoal mb-2 line-clamp-2 leading-tight group-hover:text-luxury-gold transition-colors">
                      {formatName(p.title || "Untitled Collection")}
                    </h2>
                    
                    <div className="flex items-center gap-1.5 mb-4">
                      <div className="flex text-amber-500">
                        <Star size={11} className="fill-current" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-700">{rating}</span>
                      <span className="text-[11px] text-gray-400">({reviewsCount})</span>
                    </div>

                    {/* Luxury Action Row */}
                    <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                      <div>
                        {p.price ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-md font-extrabold text-luxury-charcoal">₹{p.price}</span>
                            {p.actualPrice && p.actualPrice > p.price && (
                              <span className="text-[11px] font-medium text-gray-400 line-through">₹{p.actualPrice}</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs font-bold text-gray-500">Price on Request</p>
                        )}
                      </div>
                      
                      {p.price && (
                        <button
                          onClick={(e) => handleAddToCart(e, p)}
                          className="w-8 h-8 rounded-full bg-luxury-charcoal hover:bg-luxury-gold text-white flex items-center justify-center transition-colors shadow-sm"
                          aria-label="Add to cart"
                        >
                          <ShoppingCart size={13} />
                        </button>
                      )}
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
              className="mt-6 px-6 py-2.5 bg-luxury-charcoal text-white rounded-full text-sm font-bold hover:bg-luxury-gold transition"
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
                        ? "bg-luxury-charcoal text-white shadow-md" 
                        : "text-gray-600 hover:bg-luxury-warmGray"
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
            <div className="w-12 h-12 bg-luxury-warmGray text-luxury-gold rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Secure Payments</h4>
            <p className="text-xs text-gray-500">100% encrypted transactions</p>
          </div>
          <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 bg-luxury-warmGray text-luxury-gold rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Truck size={24} />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Fast Delivery</h4>
            <p className="text-xs text-gray-500">Safe & secure logistics</p>
          </div>
          <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 bg-luxury-warmGray text-luxury-gold rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <RefreshCw size={24} />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Easy Returns</h4>
            <p className="text-xs text-gray-500">10-day return window</p>
          </div>
          <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 bg-luxury-warmGray text-luxury-gold rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
