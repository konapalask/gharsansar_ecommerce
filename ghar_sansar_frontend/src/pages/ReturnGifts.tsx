import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Eye, Heart, ArrowRight, CheckCircle2, SlidersHorizontal, ChevronDown, Filter, Image as ImageIcon, Search, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// ---------------------------------------------------------
// CMS Fallback Image Component
// ---------------------------------------------------------
function CMSImage({ src, alt, className }: { src?: string, alt: string, className?: string }) {
  const [error, setError] = useState(false);
  if (!src || error || src.includes('unsplash.com')) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        <ImageIcon size={24} className="mb-2 opacity-50" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">Image Coming Soon</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} loading="lazy" />;
}

// ---------------------------------------------------------
// MAIN RETURN GIFTS COMPONENT (REACT QUERY DRIVEN)
// ---------------------------------------------------------
export default function ReturnGifts() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSidebar, setShowSidebar] = useState(false);

  // Debounced Search state for UI
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  // Extract all filters from URL
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'All Gifts';
  const material = searchParams.get('material') || '';
  const sort = searchParams.get('sort') || '';

  // Custom artificial delay for the premium animation feel (400ms)
  const animationDelay = 400;

  // React Query Fetcher
  const fetchProducts = async () => {
    const API_BASE = import.meta.env.VITE_AWS_API_URL || "https://backend.gharsansar.store/api";
    // Build query string
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (category) params.append('category', category);
    if (material) params.append('material', material);
    if (sort) params.append('sort', sort);
    params.append('limit', '1000');
    params.append('delay', animationDelay.toString()); // Force minimum delay in backend

    const res = await fetch(`${API_BASE}/return_gifts?${params.toString()}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  };

  const { data, isFetching, error } = useQuery({
    queryKey: ['returnGifts', q, category, material, sort],
    queryFn: fetchProducts,
    placeholderData: (prev) => prev, // keeps previous data while fetching for smooth fade
  });

  // Handle Search input change with debounce sync to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchParams(prev => {
        if (searchInput) prev.set('q', searchInput);
        else prev.delete('q');
        return prev;
      });
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, setSearchParams]);

  // Derived state
  const products = data?.products || [];
  const total = data?.total || 0;

  // Active Filter Chips
  const activeFilters = [];
  if (category !== 'All Gifts') activeFilters.push({ key: 'category', label: category });
  if (material) {
    material.split(',').forEach(m => activeFilters.push({ key: 'material', label: m, rawValue: material }));
  }
  if (q) activeFilters.push({ key: 'q', label: `"${q}"` });

  const removeFilter = (filterKey: string, specificValue?: string) => {
    setSearchParams(prev => {
      if (filterKey === 'material' && specificValue) {
        const current = prev.get('material')?.split(',') || [];
        const updated = current.filter(m => m !== specificValue);
        if (updated.length) prev.set('material', updated.join(','));
        else prev.delete('material');
      } else {
        prev.delete(filterKey);
        if (filterKey === 'category') prev.set('category', 'All Gifts');
        if (filterKey === 'q') setSearchInput(''); // Also clear the text input
      }
      return prev;
    });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
  };

  const formatName = (str: string) => {
    return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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
            {category === "All Gifts" ? "Return Gifts" : formatName(category)}
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Discover elegant gifts for weddings, housewarming, corporate events, festivals, and memorable moments.
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
              <span className="text-gray-900 font-semibold">Return Gifts</span>
            </nav>
            <div className="flex flex-col md:flex-row items-center justify-end gap-4 w-full md:w-auto flex-1 md:ml-8">
              {/* Search Bar */}
              <div className="relative w-full md:max-w-xs">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                  <Search size={16} />
                </div>
                <input
                  type="search"
                  placeholder="Search gifts..."
                  className="w-full bg-white border border-gray-200 focus:border-[#6B21A8] focus:ring-4 focus:ring-[#6B21A8]/10 rounded-full py-2.5 pl-11 pr-10 text-sm focus:outline-none transition-all font-medium placeholder:text-gray-400 text-gray-800 shadow-sm"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button onClick={() => setSearchInput("")} className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-red-500"><X size={14} /></button>
                )}
              </div>
              <div className="text-sm text-gray-500 font-medium whitespace-nowrap hidden lg:block">
                <span className="text-gray-900 font-bold">{total}</span> items
              </div>
              
              {/* Sort Dropdown */}
              <div className="shrink-0 flex items-center gap-3">
                <span className="text-sm text-gray-500 font-medium hidden md:block">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSearchParams(prev => { prev.set('sort', e.target.value); return prev; })}
                  className="text-sm font-medium bg-transparent border-none text-gray-900 focus:ring-0 outline-none cursor-pointer"
                >
                  <option value="">Recommended</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </div>

              <button 
                onClick={() => setShowSidebar(true)}
                className="w-full md:w-auto flex justify-center items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-luxury-charcoal hover:border-luxury-gold transition-colors shadow-sm"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
            </div>
          </div>

          {/* Products Layout */}
          <div className="flex flex-col relative items-start">
            
            {/* Slide-out Drawer overlay */}
            <AnimatePresence>
              {showSidebar && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSidebar(false)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showSidebar && (
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl z-[70] flex flex-col overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h2 className="text-xl font-serif text-luxury-charcoal font-bold">Filters</h2>
                    <button onClick={() => setShowSidebar(false)} className="p-2 text-gray-400 hover:text-luxury-charcoal transition-colors"><X size={20}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
                    <SidebarContent activeCategory={category} searchParams={searchParams} setSearchParams={setSearchParams} />
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-white">
                    <button 
                      onClick={() => { clearAllFilters(); setShowSidebar(false); }}
                      className="w-full py-3 bg-gray-100 text-gray-900 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Filters Bar */}
            {activeFilters.length > 0 && (
              <div className="w-full flex flex-wrap gap-2 mb-6">
                <AnimatePresence>
                  {activeFilters.map((chip) => (
                    <motion.div
                      key={chip.key + chip.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 shadow-sm"
                    >
                      {chip.label}
                      <button onClick={() => removeFilter(chip.key, chip.key === 'material' ? chip.label : undefined)} className="hover:text-red-500 transition-colors">
                        <X size={12} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Grid Layout */}
            <div className="w-full">
              {error ? (
                <div className="py-24 text-center text-red-500 font-medium bg-white rounded-2xl border border-red-100">
                  Failed to load products. Please try again.
                </div>
              ) : (
                <div className="relative min-h-[500px]">
                  <AnimatePresence mode="wait">
                    {isFetching ? (
                      <motion.div
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 z-10 bg-[#f8f8f7]"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-[4/5] relative rounded-[20px] overflow-hidden bg-white border border-gray-100">
                              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 skeleton-shimmer" />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ) : products.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-100 shadow-sm"
                      >
                        <div className="w-20 h-20 mb-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                          <Search size={28} />
                        </div>
                        <h3 className="text-xl font-serif font-medium mb-2 text-gray-900">No gifts found</h3>
                        <p className="text-gray-500 max-w-sm mb-6 text-sm">We couldn't find any items matching your current filters.</p>
                        <button onClick={clearAllFilters} className="px-6 py-2.5 bg-[#6B21A8] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#581c87] transition-colors shadow-lg shadow-[#6B21A8]/20">
                          Clear Filters
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10"
                      >
                        {products.map((product: any, idx: number) => (
                          <motion.div 
                            key={product.id || product._id || idx}
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.6, delay: idx * 0.05, ease: "easeOut" }}
                          >
                            <CatalogCard product={product} onAdd={addToCart} navigate={navigate} />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// SIDEBAR CONTENT
// ---------------------------------------------------------
function SidebarContent({ activeCategory, searchParams, setSearchParams }: any) {
  const categories = ['All Gifts', 'Wedding', 'Housewarming', 'Corporate', 'Festivals', 'Luxury'];
  const filterSections = [
    { id: 'material', title: 'Material', items: ['German Silver', 'Brass', 'Ceramic', 'Wood', 'Glass', 'Crystal'] },
    { id: 'occasion', title: 'Occasion', items: ['Wedding', 'Housewarming', 'Anniversary', 'Corporate Event', 'Festivals'] }
  ];

  const handleCategory = (cat: string) => {
    setSearchParams((prev: any) => { prev.set('category', cat); return prev; });
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200/50 pb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-charcoal mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group select-none">
              <div className={`relative w-4 h-4 rounded-full flex items-center justify-center border transition-colors
                  ${activeCategory === cat ? 'border-[#6B21A8] bg-[#6B21A8]' : 'border-gray-300 group-hover:border-gray-500'}
              `}>
                {activeCategory === cat && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <span className={`text-sm transition-colors ${activeCategory === cat ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-900'}`} onClick={() => handleCategory(cat)}>
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {filterSections.map((sec) => (
        <FilterAccordion key={sec.id} section={sec} searchParams={searchParams} setSearchParams={setSearchParams} />
      ))}
    </div>
  );
}

function FilterAccordion({ section, searchParams, setSearchParams }: any) {
  const [isOpen, setIsOpen] = useState(true);
  const activeVals = searchParams.get(section.id)?.split(',') || [];

  const toggleItem = (item: string) => {
    setSearchParams((prev: any) => {
      const current = prev.get(section.id)?.split(',') || [];
      const updated = current.includes(item)
        ? current.filter((x: string) => x !== item)
        : [...current, item];
      if (updated.length) prev.set(section.id, updated.join(','));
      else prev.delete(section.id);
      return prev;
    });
  };

  return (
    <div className="border-b border-gray-200/50 pb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-luxury-charcoal mb-4 group"
      >
        {section.title}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="text-gray-400 group-hover:text-gray-600">
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              {section.items.map((item: string, i: number) => {
                const checked = activeVals.includes(item);
                return (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group select-none">
                    <motion.div
                      layout
                      className={`relative w-4 h-4 rounded flex items-center justify-center border transition-colors overflow-hidden
                        ${checked ? 'bg-[#6B21A8] border-[#6B21A8]' : 'bg-white border-gray-300 group-hover:border-gray-500'}
                      `}
                    >
                      <AnimatePresence>
                        {checked && (
                          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                            <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    <span className={`text-sm transition-colors ${checked ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-900'}`} onClick={() => toggleItem(item)}>
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------
// PREMIUM CATALOG CARD (Standard 4/5 Aspect Ratio)
// ---------------------------------------------------------
function CatalogCard({ product, onAdd, navigate }: any) {
  const handleAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    if (action === 'cart') {
      onAdd({ ...product, quantity: 50, minQty: 50 });
      toast.success(`Added 50 x ${product.title} to cart`);
    } else {
      toast(`${action} clicked`);
    }
  };

  return (
    <div
      className="group flex flex-col h-full cursor-pointer"
      onClick={() => navigate(`/product/${product._id || product.id || product.name}`, { state: { ...product, isReturnGift: true } })}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-[#F0F2F5] mb-4">
        <CMSImage src={product.image || product.images?.[0]} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />

        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-20">
          <button onClick={(e) => handleAction(e, 'quickview')} className="flex-1 bg-white/95 backdrop-blur-sm text-luxury-charcoal text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl shadow-lg hover:bg-luxury-charcoal hover:text-white transition-colors text-center">
            Quick View
          </button>
          <button onClick={(e) => handleAction(e, 'cart')} className="w-12 bg-[#6B21A8] text-white flex items-center justify-center rounded-xl shadow-lg hover:bg-[#581c87] transition-colors">
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-grow px-1">
        <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
          {product.category?.replace('_', ' ') || 'Return Gift'}
        </div>
        <h3 className="font-serif text-gray-900 text-xs sm:text-lg mb-1 leading-snug group-hover:text-[#6B21A8] transition-colors line-clamp-2 sm:line-clamp-1">
          {product.title || product.name}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-gray-900 font-bold text-sm sm:text-base">₹{product.price}</span>
        </div>
      </div>
    </div>
  );
}
