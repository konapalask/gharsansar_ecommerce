import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const searchList = [
  "Wallpaper Rolls",
  "Wallpapers",
  "3d Wallpapers",
  "Wall Art Effect",
  "Vinyl Flooring",
  "Natural Vertical Garden",
  "Blinds",
  "Automation Motorised Blinds",
  "Gym Flooring",
  "Artificial Wall Garden",
  "ICU Flooring",
  "Sliding & Metal Door",
  "Invisible Grill",
  "EPDM Flooring",
  "Bubble Fountain",
  "Terrace & Outdoor Gardening",
  "Outdoor Deck Benches",
  "Canopy",
  "Customised Water Fountain",
  "Wooden Flooring",
  "HDP Planter Pots",
  "Ceramic Pots",
  "Pigeon Net",
  "Artificial Lawn",
  "Curtains",
  "Office Room Carpets",
  "Cloth Dry Well",
  "Sky Light Blinds",
  "Pergola",
  "Wall And Ceiling Panels",
  "Hospital Curtains",
  "Mosquito Doors",
  "Customised Aquariums",
  "Gifting Plants",
  "All Types Of Doormats",
  "Basket Fruit Packings",
  "Brass Idols",
  "Sofa Cover",
  // Add product names or other keywords you want searchable
  "Designer Sofa",
  "Luxury Table",
  "Curtain Rods",
  "Planter Pot Set",
  "LED Floor Lamp",
];

const Header: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      // Hide on scroll down, show on scroll up/top
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const desktopSearchRef = useRef<HTMLFormElement>(null);
  const mobileSearchRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on page navigation
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
    setShowSuggestions(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearchOpen && desktopSearchRef.current && !desktopSearchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setShowSuggestions(false);
      }
      if (isMobileSearchOpen && mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setMobileSearchOpen(false);
      }
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setShowSuggestions(false);
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isSearchOpen, isMobileSearchOpen, isUserMenuOpen]);

  useEffect(() => {
    if (isSearchOpen || isMobileSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen, isMobileSearchOpen]);

  const updateSearchTerm = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = searchList.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const onSuggestionSelect = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(false);
    setSearchOpen(false);
    setMobileSearchOpen(false);
    navigate(`/interior-design?category=${encodeURIComponent(value)}`);
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/interior-design?category=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm("");
    setShowSuggestions(false);
    setSearchOpen(false);
    setMobileSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform flex items-center px-3 sm:px-6 w-full min-w-0 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        isScrolled 
          ? "h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100/40" 
          : "h-20 bg-white/95 border-b border-gray-100/20"
      }`}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between h-full relative">
          
          {/* Logo */}
          <Link to="/" aria-label="Go to home" className="flex items-center space-x-2 shrink-0 hover:opacity-80 transition-opacity">
            <img 
              src="/ghar sansar logo.svg" 
              alt="Ghar Sansar Logo" 
              className={`object-contain transition-all duration-300 ${isScrolled ? "h-12 sm:h-14" : "h-16 sm:h-19"}`} 
              style={{ minWidth: 0, width: "auto" }} 
            />
          </Link>

          {/* Desktop Nav - Centered */}
          <nav className="hidden md:flex items-center space-x-10 uppercase tracking-widest text-[11px] font-bold text-gray-400" role="navigation">
            <Link to="/" className={`relative py-2 transition-all duration-300 group ${isActive('/') ? 'text-luxury-charcoal font-black' : 'hover:text-luxury-charcoal'}`}>
              Home
              <span className={`absolute bottom-0 left-0 h-[1.5px] bg-luxury-gold transition-all duration-300 ${isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            <Link to="/interior-design" className={`relative py-2 transition-all duration-300 group ${isActive('/interior-design') ? 'text-luxury-charcoal font-black' : 'hover:text-luxury-charcoal'}`}>
              Interior Design
              <span className={`absolute bottom-0 left-0 h-[1.5px] bg-luxury-gold transition-all duration-300 ${isActive('/interior-design') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            <Link to="/products" className={`relative py-2 transition-all duration-300 group ${isActive('/products') ? 'text-luxury-charcoal font-black' : 'hover:text-luxury-charcoal'}`}>
              Products
              <span className={`absolute bottom-0 left-0 h-[1.5px] bg-luxury-gold transition-all duration-300 ${isActive('/products') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            <Link to="/return-gifts" className={`relative py-2 transition-all duration-300 group ${isActive('/return-gifts') ? 'text-luxury-charcoal font-black' : 'hover:text-luxury-charcoal'}`}>
              Return Gifts
              <span className={`absolute bottom-0 left-0 h-[1.5px] bg-luxury-gold transition-all duration-300 ${isActive('/return-gifts') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            <Link to="/services" className={`relative py-2 transition-all duration-300 group ${isActive('/services') ? 'text-luxury-charcoal font-black' : 'hover:text-luxury-charcoal'}`}>
              Services
              <span className={`absolute bottom-0 left-0 h-[1.5px] bg-luxury-gold transition-all duration-300 ${isActive('/services') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            <Link to="/blog" className={`relative py-2 transition-all duration-300 group ${isActive('/blog') ? 'text-luxury-charcoal font-black' : 'hover:text-luxury-charcoal'}`}>
              Blog
              <span className={`absolute bottom-0 left-0 h-[1.5px] bg-luxury-gold transition-all duration-300 ${isActive('/blog') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Desktop Search */}
            <form ref={desktopSearchRef} onSubmit={onSearchSubmit} className="hidden sm:flex items-center relative" role="search">
              <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-64 border-gray-900 bg-white shadow-sm ring-4 ring-gray-100/50' : 'w-10 border-transparent bg-transparent'} border rounded-full overflow-hidden`}>
                {isSearchOpen && (
                  <input
                    ref={inputRef}
                    type="search"
                    aria-label="Search products or categories"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => updateSearchTerm(e.target.value)}
                    className="w-full bg-transparent pl-4 pr-2 py-2 text-xs font-semibold focus:outline-none placeholder:text-gray-400 text-gray-800"
                    autoComplete="off"
                  />
                )}
                <button
                  type="button"
                  aria-label={isSearchOpen ? "Close search" : "Open search"}
                  className={`p-2.5 text-gray-500 hover:text-gray-900 transition-colors shrink-0 ${isSearchOpen ? 'mr-1' : ''}`}
                  onClick={() => {
                    setSearchOpen((v) => !v);
                    setShowSuggestions(false);
                  }}
                >
                  <Search size={16} />
                </button>
              </div>
              {isSearchOpen && showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl py-2 z-50 overflow-hidden">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-650 hover:bg-gray-50 hover:text-gray-950 transition-colors"
                      onClick={() => onSuggestionSelect(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* Mobile Search */}
            <button aria-label="Open search" className="sm:hidden p-2 text-gray-500 hover:text-gray-900" onClick={() => setMobileSearchOpen(true)}>
              <Search size={20} />
            </button>
            
            {isMobileSearchOpen && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-start p-4 pt-20 z-50">
                <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100">
                  <form onSubmit={onSearchSubmit} className="flex flex-col p-4 animate-scaleIn" role="search" ref={mobileSearchRef}>
                    <div className="flex items-center">
                      <input
                        ref={inputRef}
                        type="search"
                        aria-label="Mobile search"
                        placeholder="Search products or categories..."
                        value={searchTerm}
                        onChange={(e) => updateSearchTerm(e.target.value)}
                        className="flex-grow px-4 py-2.5 text-sm font-semibold border border-gray-200 focus:border-gray-900 rounded-l-xl focus:outline-none placeholder:text-gray-400"
                        autoComplete="off"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="h-10 px-4 bg-gray-950 hover:bg-gray-800 text-white rounded-r-xl transition-colors"
                        aria-label="Submit search"
                      >
                        <Search size={16} />
                      </button>
                    </div>
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="border border-gray-100 rounded-b-xl max-h-60 overflow-auto mt-1 bg-white">
                        {suggestions.map((s, idx) => (
                          <li
                            key={idx}
                            tabIndex={0}
                            className="px-4 py-2 text-xs font-semibold text-gray-650 cursor-pointer hover:bg-gray-50 hover:text-gray-950 transition-colors"
                            onClick={() => onSuggestionSelect(s)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") onSuggestionSelect(s);
                            }}
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* Cart */}
            <Link to="/cart" aria-label="Cart" className="relative p-2 text-gray-500 hover:text-luxury-charcoal transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-luxury-gold text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button aria-haspopup="true" aria-expanded={isUserMenuOpen} onClick={() => setUserMenuOpen((v) => !v)} className="flex items-center space-x-1.5 p-1 text-gray-500 hover:text-luxury-charcoal transition-colors" aria-label="User menu">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt="User avatar" 
                      className="w-6 h-6 rounded-full object-cover border border-gray-200" 
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-bold">
                    {user.email ? user.email.split('@')[0] : (user.name || "User")}
                  </span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/40 p-1.5 z-50">
                    <Link to="/profile" className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setUserMenuOpen(false)}>
                      Profile
                    </Link>
                    {user.role === "admin" && location.pathname.startsWith('/admin') && (
                      <Link to="/admin" className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors" onClick={() => setUserMenuOpen(false)}>
                        Admin Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-xs font-bold text-red-650 hover:bg-red-50 rounded-xl transition-colors mt-0.5">
                      <LogOut className="mr-2 w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex items-center justify-center bg-luxury-charcoal hover:bg-luxury-gold text-white px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all duration-300 font-bold text-[11px] uppercase tracking-wider active:scale-95" aria-label="Login">
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button aria-label="Toggle menu" className="md:hidden p-2 text-gray-500 hover:text-gray-950 transition-colors" onClick={() => setMenuOpen((v) => !v)}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

      </header>
      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] md:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl border-l border-gray-100 z-[999] p-6 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Navigation</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex flex-col space-y-4">
                {[
                  { path: "/", label: "Home" },
                  { path: "/interior-design", label: "Interior Design" },
                  { path: "/products", label: "Products" },
                  { path: "/return-gifts", label: "Return Gifts" },
                  { path: "/services", label: "Services" },
                  { path: "/blog", label: "Blog" }
                ].map((link, idx) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setMenuOpen(false)}
                      className={`block py-2 text-base font-bold transition-colors ${
                        isActive(link.path) ? "text-gray-950" : "text-gray-500 hover:text-gray-950"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                
                <hr className="my-2 border-gray-100" />
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    to="/cart"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-base font-bold text-gray-500 hover:text-gray-950"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingCart size={18} />
                      Cart
                    </span>
                    {totalItems > 0 && (
                      <span className="bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </motion.div>

                {user ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    className="pt-2"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block py-2 text-base font-bold text-gray-500 hover:text-gray-900 mb-4"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl text-sm font-bold transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    className="pt-4"
                  >
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center py-2.5 px-4 bg-gray-950 hover:bg-gray-800 text-white rounded-full text-sm font-bold transition-all shadow-sm"
                    >
                      Login
                    </Link>
                  </motion.div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
