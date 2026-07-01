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
  const minPrice = Number(query.get("minPrice")) || 0;
  const maxPrice = Number(query.get("maxPrice")) || 1000000;

  // Mobile drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Accordion states
  const [openSections, setOpenSections] = useState({
    category: true,
    subcategory: true,
    price: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Scroll to top when page or filters change
  useEffect(() => {
    if (categoryFilter.toLowerCase() === "return_gifts" || categoryFilter.toLowerCase() === "return gifts") {
      navigate("/return-gifts", { replace: true });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, categoryFilter, subCategoryFilter, search, sortOrder, navigate]);

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
      
      const productPrice = p.price || 0;
      const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;

      return matchesSearch && matchesCategory && matchesSubCategory && matchesPrice;
    });

    if (sortOrder === "price-low") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOrder === "price-high") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      // Default "featured" sort: push "Cello" (category or title containing Cello) to the back
      result.sort((a, b) => {
        const aIsCello = (a.category?.toLowerCase().includes("cello") || a.title?.toLowerCase().includes("cello"));
        const bIsCello = (b.category?.toLowerCase().includes("cello") || b.title?.toLowerCase().includes("cello"));
        if (aIsCello && !bIsCello) return 1;
        if (!aIsCello && bIsCello) return -1;
        return 0;
      });
    }

    return result;
  }, [products, search, categoryFilter, subCategoryFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentProducts = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  function buildQuery(params: any) {
    const baseParams = Object.fromEntries(query.entries());
    const merged = { ...baseParams, ...params };
    Object.keys(merged).forEach((k) => {
      if (
        !merged[k] || 
        merged[k] === "All" || 
        merged[k] === "featured" || 
        (k === "minPrice" && merged[k] === 0) || 
        (k === "maxPrice" && merged[k] === 1000000)
      ) {
        delete merged[k];
      }
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
    <div className="bg-[#f8f8f7] min-h-screen font-sans pb-20 flex flex-col">
      
      {/* Animated Premium Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full bg-white border-b border-gray-100 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-cream/60 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-gray-900 mb-4 capitalize">
            {categoryFilter === "All" ? "All Collections" : formatName(categoryFilter)}
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Luxury crockery & interior essentials crafted for modern homes. Discover pieces that elevate your everyday living.
          </p>
        </div>
      </motion.div>

      <div className="w-full flex-grow relative">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Breadcrumb & Mobile Filter Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <nav className="flex items-center space-x-2 text-xs md:text-sm text-gray-400 font-medium">
            <span className="cursor-pointer hover:text-gray-900 transition" onClick={() => navigate("/")}>Home</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Shop Collection</span>
          </nav>
          <div className="flex flex-col md:flex-row items-center justify-end gap-4 w-full md:w-auto flex-1 md:ml-8">
            {/* Search Bar */}
            <div className="relative w-full md:max-w-xs">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
              </div>
              <input
                type="search"
                placeholder="Search collections..."
                className="w-full bg-white border border-gray-200 focus:border-[#6B21A8] focus:ring-4 focus:ring-[#6B21A8]/10 rounded-full py-2.5 pl-11 pr-10 text-sm focus:outline-none transition-all font-medium placeholder:text-gray-400 text-gray-800 shadow-sm"
                value={search}
                onChange={(e) => updateQuery({ search: e.target.value, page: 1 })}
              />
              {search && (
                <button onClick={() => updateQuery({ search: "", page: 1 })} className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-red-500"><X size={14} /></button>
              )}
            </div>
            <div className="text-sm text-gray-500 font-medium whitespace-nowrap hidden lg:block">
              <span className="text-gray-900 font-bold">{filtered.length}</span> items
            </div>
            
            {/* Sort Dropdown */}
            <div className="shrink-0 w-full md:w-48 relative z-[55]">
              <CustomSelect
                value={sortOrder}
                options={["featured", "price-low", "price-high"]}
                onChange={(val) => updateQuery({ sort: val, page: 1 })}
                placeholder="Featured"
                formatValue={(val) => {
                  if (val === "featured") return "Sort by: Featured";
                  if (val === "price-low") return "Price: Low to High";
                  if (val === "price-high") return "Price: High to Low";
                  return val;
                }}
              />
            </div>

            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="w-full md:w-auto flex justify-center items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-luxury-charcoal hover:border-luxury-gold transition-colors shadow-sm"
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>
          </div>
        </div>

        {/* Products Layout */}
        <div className="flex flex-col relative items-start">
          
          {/* Mobile Slide-out Drawer overlay */}
          <AnimatePresence>
            {isMobileFilterOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFilterOpen(false)}
                className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm cursor-pointer"
              />
            )}
          </AnimatePresence>

          {/* Sidebar Drawer */}
          <motion.div
            initial={false}
            animate={{ x: isMobileFilterOpen ? 0 : "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-[320px] max-w-[85vw] bg-white z-[70] p-6 overflow-y-auto custom-scrollbar shadow-2xl flex flex-col gap-6"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-serif text-luxury-charcoal font-bold">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 text-gray-400 hover:text-luxury-charcoal transition-colors"><X size={20}/></button>
            </div>

            {/* Categories Accordion */}
            <div className="border-t border-gray-100 pt-6">
              <button onClick={() => toggleSection('category')} className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-luxury-charcoal mb-4">
                Categories
                <ChevronDown size={16} className={`transition-transform duration-300 ${openSections.category ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openSections.category && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-3">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="radio" name="category" checked={categoryFilter === cat} onChange={() => updateQuery({ category: cat, subCategory: "All", page: 1 })} className="peer appearance-none w-4 h-4 border border-gray-300 rounded-full checked:border-[#6B21A8] transition-colors" />
                          <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-[#6B21A8] scale-0 peer-checked:scale-100 transition-transform"></div>
                        </div>
                        <span className={`text-sm transition-colors ${categoryFilter === cat ? 'text-[#6B21A8] font-bold' : 'text-gray-600 group-hover:text-luxury-charcoal'}`}>
                          {cat === "All" ? "All Collections" : formatName(cat)}
                        </span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Subcategories Accordion */}
            <div className="border-t border-gray-100 pt-6">
              <button onClick={() => toggleSection('subcategory')} className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-luxury-charcoal mb-4">
                Subcategories
                <ChevronDown size={16} className={`transition-transform duration-300 ${openSections.subcategory ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openSections.subcategory && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-3">
                    {subCategories.map((sub) => (
                      <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="radio" name="subcategory" checked={subCategoryFilter === sub} onChange={() => updateQuery({ subCategory: sub, page: 1 })} disabled={categoryFilter === "All" && sub !== "All"} className="peer appearance-none w-4 h-4 border border-gray-300 rounded-full checked:border-[#6B21A8] disabled:bg-gray-100 transition-colors" />
                          <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-[#6B21A8] scale-0 peer-checked:scale-100 transition-transform"></div>
                        </div>
                        <span className={`text-sm transition-colors ${subCategoryFilter === sub ? 'text-[#6B21A8] font-bold' : 'text-gray-600 group-hover:text-luxury-charcoal'} ${categoryFilter === "All" && sub !== "All" ? 'opacity-40' : ''}`}>
                          {sub === "All" ? "All Subcategories" : formatName(sub)}
                        </span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Price Range Accordion */}
            <div className="border-t border-gray-100 pt-6 pb-6">
              <button onClick={() => toggleSection('price')} className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-luxury-charcoal mb-4">
                Price Range
                <ChevronDown size={16} className={`transition-transform duration-300 ${openSections.price ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openSections.price && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-4 pt-2">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Min (₹)</label>
                        <input type="number" min="0" value={minPrice} onChange={(e) => updateQuery({ minPrice: Number(e.target.value), page: 1 })} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] outline-none transition-all" />
                      </div>
                      <div className="text-gray-300 mt-5">-</div>
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Max (₹)</label>
                        <input type="number" min="0" value={maxPrice} onChange={(e) => updateQuery({ maxPrice: Number(e.target.value), page: 1 })} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#6B21A8] focus:ring-1 focus:ring-[#6B21A8] outline-none transition-all" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                        {[
                        { label: 'Under ₹5,000', min: 0, max: 5000 },
                        { label: '₹5,000 - ₹15,000', min: 5000, max: 15000 },
                        { label: '₹15,000 - ₹50,000', min: 15000, max: 50000 },
                        { label: 'Over ₹50,000', min: 50000, max: 1000000 },
                        ].map(bucket => (
                        <button 
                            key={bucket.label}
                            onClick={() => updateQuery({ minPrice: bucket.min, maxPrice: bucket.max, page: 1 })}
                            className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${minPrice === bucket.min && maxPrice === bucket.max ? 'bg-[#6B21A8]/10 text-[#6B21A8] font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-luxury-charcoal'}`}
                        >
                            {bucket.label}
                        </button>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Main Product Grid Area */}
          <div className="w-full flex flex-col gap-6 mt-4">

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {[...Array(9)].map((_, i) => (
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
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8"
          >
            {currentProducts.map((p, index) => {
              const discount = p.actualPrice && p.price ? Math.round(((p.actualPrice - p.price) / p.actualPrice) * 100) : 0;
              const rating = (Math.random() * (5 - 4) + 4).toFixed(1);
              const reviewsCount = Math.floor(Math.random() * 200) + 15;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1], // easeOutQuint for ultra smooth deceleration
                    delay: (index % 12) * 0.08 
                  }}
                  className="bg-white rounded-xl sm:rounded-[20px] shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-500 p-2.5 sm:p-4 cursor-pointer group flex flex-col relative"
                  onClick={() => navigate(`/product/${encodeURIComponent(p.id)}?${location.search}`, { state: p })}
                >
                  {/* Floating Action Icons */}
                  <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-20 flex flex-col gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-0 sm:translate-x-2 sm:group-hover:translate-x-0">
                    <button className="w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md text-gray-600 hover:text-red-500 hover:bg-white transition-colors">
                      <Heart size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  {/* Image Container - Strictly Uncropped, Centered */}
                  <div className="relative w-full aspect-[4/5] bg-[#fdfdfc] rounded-lg sm:rounded-2xl overflow-hidden flex items-center justify-center p-2 sm:p-6 mb-3 sm:mb-5 border border-gray-50">
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-luxury-gold text-white px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wider shadow-sm z-10">
                        {discount}% Off
                      </span>
                    )}
                    
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110"
                        loading={index < 4 ? "eager" : "lazy"}
                        // @ts-ignore
                        fetchPriority={index < 4 ? "high" : "low"}
                      />
                    ) : (
                      <div className="text-gray-300 font-medium">No Image</div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col flex-grow px-1">
                    <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-widest text-luxury-gold mb-1">
                      {formatName(p.category)}
                    </span>
                    
                    <h2 className="text-xs sm:text-sm font-bold text-luxury-charcoal mb-1.5 sm:mb-2 line-clamp-2 leading-tight group-hover:text-luxury-gold transition-colors">
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
                    <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-50 flex items-center justify-between">
                      <div>
                        {p.price ? (
                          <div className="flex flex-wrap items-baseline gap-1 sm:gap-1.5">
                            <span className="text-sm sm:text-md font-extrabold text-luxury-charcoal">₹{p.price}</span>
                            {p.actualPrice && p.actualPrice > p.price && (
                              <span className="text-[9px] sm:text-[11px] font-medium text-gray-400 line-through">₹{p.actualPrice}</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[10px] sm:text-xs font-bold text-gray-500">Price on Request</p>
                        )}
                      </div>
                      
                      {p.price && (
                        <button
                          onClick={(e) => handleAddToCart(e, p)}
                          className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-luxury-charcoal hover:bg-luxury-gold text-white flex items-center justify-center transition-colors shadow-sm"
                          aria-label="Add to cart"
                        >
                          <ShoppingCart size={12} className="sm:w-[13px] sm:h-[13px]" />
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
          </div> {/* End Main Product Grid Area */}
        </div> {/* End 2-Column Layout */}
      </div> {/* End max-w-[1440px] wrapper */}

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
        className="fixed bottom-24 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-2xl shadow-green-600/30 transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-xl pointer-events-none">
          Need styling advice?
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </span>
      </a>
      </div>
    </div>
  );
};

export default ProductsPage;
