import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, User, LogOut } from "lucide-react";
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

  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const desktopSearchRef = useRef<HTMLFormElement>(null);
  const mobileSearchRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearchOpen && desktopSearchRef.current && !desktopSearchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setShowSuggestions(false);
      }
      if (isMobileSearchOpen && mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setMobileSearchOpen(false);
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
  }, [isSearchOpen, isMobileSearchOpen]);

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-professional border-b border-gray-200/50 h-20 flex items-center px-3 sm:px-6 w-full min-w-0">
        {/* Logo */}
        <Link to="/" aria-label="Go to home" className="flex items-center space-x-2 ml-2 sm:ml-4 shrink-0 hover:opacity-80 transition-opacity">
          <img src="/ghar sansar logo.svg" alt="Ghar Sansar Logo" className="w-20 h-20 sm:w-40 sm:h-20 object-contain" style={{ minWidth: 0 }} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 space-x-8 font-display font-semibold text-gray-700" role="navigation">
          {location.pathname !== "/" && <Link to="/" className="relative hover:text-primary-600 transition-all duration-300 font-semibold group">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>}
          <Link to="/interior-design" className="relative hover:text-primary-600 transition-all duration-300 font-semibold group">
            Interior Design
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/products" className="relative hover:text-primary-600 transition-all duration-300 font-semibold group">
            Products
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/services" className="relative hover:text-primary-600 transition-all duration-300 font-semibold group">
            Services
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/blog" className="relative hover:text-primary-600 transition-all duration-300 font-semibold group">
            Blog
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center ml-auto space-x-3 relative">
          {/* Desktop Search */}
          <form ref={desktopSearchRef} onSubmit={onSearchSubmit} className="hidden sm:flex relative" role="search">
            {isSearchOpen && (
              <input
                ref={inputRef}
                type="search"
                aria-label="Search Interior Design"
                placeholder="Search products or categories"
                value={searchTerm}
                onChange={(e) => updateSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 border rounded-l-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                autoComplete="off"
              />
            )}
            <button
              type="button"
              aria-label={isSearchOpen ? "Close search" : "Open search"}
              className={`p-2 border border-gray-300 text-gray-600 ${isSearchOpen ? "rounded-r-md border-l-0" : "rounded-md"} hover:text-blue-600 hover:border-blue-600 transition-all duration-200`}
              onClick={() => {
                setSearchOpen((v) => !v);
                setShowSuggestions(false);
              }}
            >
              <Search />
            </button>
            {isSearchOpen && <button type="submit" hidden aria-hidden />}
            {isSearchOpen && showSuggestions && (
              <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 max-h-72 overflow-auto rounded-b-md shadow z-50">
                {suggestions.map((s, idx) => (
                  <li
                    key={idx}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                    tabIndex={0}
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

          {/* Mobile Search */}
          <button aria-label="Open search" className="sm:hidden p-2 text-gray-600" onClick={() => setMobileSearchOpen(true)}>
            <Search />
          </button>
          {isMobileSearchOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start p-4 pt-20 z-50">
              <div className="relative w-full max-w-md bg-white rounded shadow-lg">
                <form onSubmit={onSearchSubmit} className="flex flex-col p-4" role="search" ref={mobileSearchRef}>
                  <div className="flex items-center mb-2">
                    <input
                      ref={inputRef}
                      type="search"
                      aria-label="Mobile search"
                      placeholder="Search products or categories"
                      value={searchTerm}
                      onChange={(e) => updateSearchTerm(e.target.value)}
                      className="flex-grow px-4 py-2 border rounded-l-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      autoComplete="off"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="h-10 px-4 bg-blue-600 text-white rounded-r-md hover:bg-blue-100"
                      aria-label="Submit search"
                    >
                      <Search />
                    </button>
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="border border-gray-300 rounded-b-md max-h-60 overflow-auto">
                      {suggestions.map((s, idx) => (
                        <li
                          key={idx}
                          tabIndex={0}
                          className="px-4 py-2 cursor-pointer hover:bg-blue-700"
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
                  {/* Close button omitted per your earlier request */}
                </form>
              </div>
            </div>
          )}

          {/* Cart */}
          <Link to="/cart" aria-label="Cart" className="relative p-2 text-gray-600 hover:text-blue-600">
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{totalItems}</span>
            )}
          </Link>

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button aria-haspopup="true" aria-expanded={isUserMenuOpen} onClick={() => setUserMenuOpen((v) => !v)} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600" aria-label="User menu">
                <User />
                <span className="hidden sm:inline">{user.email}</span>
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                    
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 hover:bg-gray-100">
                    <LogOut className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link to="/login" className="hidden sm:inline bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 shadow-professional hover:shadow-professional-lg transition-all duration-300 font-semibold hover:scale-105 active:scale-95" aria-label="Login">
                Login
              </Link>
            </div>
          ) }

          {/* Mobile Menu Toggle */}
          <button aria-label="Toggle menu" className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen((v) => !v)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg z-50" role="menu" aria-label="Mobile menu">
            <ul className="p-6 space-y-2">
              <li>
                <Link to="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-gray-100">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/interior-design" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-gray-100">
                  Interior Design
                </Link>
              </li>
              <li>
                <Link to="/products" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-gray-100">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/services" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-gray-100">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/blog" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-gray-100">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/cart" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart {totalItems > 0 && <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">{totalItems}</span>}
                </Link>
              </li>
              {user ? (
                <li>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                      navigate("/");
                    }}
                    className="block px-3 py-2 rounded hover:bg-red-100 text-red-600 w-full text-left"
                  >
                    Logout
                  </button>
                </li>
              ) : (
                <li>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded hover:bg-blue-100 text-blue-600">
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </header>
    </>
  );
};

export default Header;
