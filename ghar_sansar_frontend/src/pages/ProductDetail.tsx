// src/pages/ProductDetail.tsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Phone, 
  MessageCircle, 
  MapPinIcon, 
  ChevronLeft, 
  ChevronRight,
  ArrowLeft, 
  ShoppingCart, 
  Zap, 
  Star, 
  Camera, 
  User2, 
  X, 
  CheckCircle,
  ShieldCheck,
  Truck,
  RefreshCw,
  Award,
  CreditCard,
  Heart,
  Info,
  Sliders,
  FileText
} from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  image?: string;
}

const ProductDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { orders } = useOrders();
  const { products } = useProducts();

  // Decode product id from path
  const { pathname, search, state } = location;
  const id = decodeURIComponent(pathname.split("/").pop() || "");

  // Fetch target product
  const product = state || useMemo(() =>
    products.find((p) => p.id === id), [id, products]
  );

  // States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Review Form States
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [formImage, setFormImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  // Base list of mockup/alternative images for premium gallery feel
  const productImages = useMemo(() => {
    if (!product) return [];
    return [product.image, product.image, product.image];
  }, [product]);

  // Initial dummy reviews to match the premium looks
  const initialReviews: Review[] = useMemo(() => [
    {
      id: "dummy-1",
      name: "Aravind K.",
      rating: 5,
      comment: "Absolutely premium quality stainless steel. The heat distribution is very uniform and it is extremely easy to clean. Highly recommended!",
      date: "May 12, 2026",
      image: ""
    },
    {
      id: "dummy-2",
      name: "Meera Sen",
      rating: 4,
      comment: "Very elegant design and works perfectly on our induction cooktop. The glass lid fits snugly.",
      date: "May 08, 2026",
      image: ""
    },
    {
      id: "dummy-3",
      name: "Rajesh Prasad",
      rating: 5,
      comment: "Solid weight and professional finish. Excellent value for money. Highly durable.",
      date: "April 29, 2026",
      image: ""
    }
  ], []);

  // State to manage reviews (with localStorage persistence)
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (!product) return [];
    const saved = localStorage.getItem(`product_reviews_${product.id}`);
    return saved ? JSON.parse(saved) : initialReviews;
  });

  // Sync to localStorage
  useEffect(() => {
    if (product) {
      localStorage.setItem(`product_reviews_${product.id}`, JSON.stringify(reviews));
    }
  }, [reviews, product]);

  // Check if customer has bought this product
  const hasBoughtProduct = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    return orders.some((order) => 
      order.items.some((item) => item.id === product?.id)
    );
  }, [orders, user, isAuthenticated, product]);

  // Filter reviews: Hide dummy if logged in
  const displayedReviews = useMemo(() => {
    if (isAuthenticated) {
      return reviews.filter((r) => !r.id.startsWith("dummy-"));
    }
    return reviews;
  }, [reviews, isAuthenticated]);

  // Related products under the same category
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  // Rating aggregate calculations
  const { avgRating, ratingPercentages } = useMemo(() => {
    if (displayedReviews.length === 0) {
      return { avgRating: 0, ratingPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const sum = displayedReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Math.round((sum / displayedReviews.length) * 10) / 10;

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    displayedReviews.forEach((r) => {
      const ratingKey = Math.min(Math.max(Math.round(r.rating), 1), 5) as 5 | 4 | 3 | 2 | 1;
      counts[ratingKey]++;
    });

    const percentages = {
      5: Math.round((counts[5] / displayedReviews.length) * 100),
      4: Math.round((counts[4] / displayedReviews.length) * 100),
      3: Math.round((counts[3] / displayedReviews.length) * 100),
      2: Math.round((counts[2] / displayedReviews.length) * 100),
      1: Math.round((counts[1] / displayedReviews.length) * 100),
    };

    return { avgRating: avg, ratingPercentages: percentages };
  }, [displayedReviews]);

  // Handle Review Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image file size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormImage(base64String);
        setImagePreview(base64String);
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    const newRev: Review = {
      id: `review_${Date.now()}`,
      name: formName.trim(),
      rating: formRating,
      comment: formComment.trim(),
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      image: formImage
    };

    setReviews([newRev, ...reviews]);
    toast.success("Review submitted successfully!");

    // Reset Form
    setFormName("");
    setFormRating(5);
    setFormComment("");
    setFormImage("");
    setImagePreview("");
  };

  // Zoom on Hover Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.image
      });
    }
    toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to your cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    if (!isAuthenticated) {
      toast.error('Please sign in to complete checkout.');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f8f8f7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <Info size={28} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 max-w-sm mb-6">The product you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
        >
          <ArrowLeft size={18} /> Back to Catalog
        </button>
      </div>
    );
  }

  // Percentage Off Calculation
  const discountPercentage = product.actualPrice && product.price
    ? Math.round(((product.actualPrice - product.price) / product.actualPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#f8f8f7] pb-16 font-sans">
      
      {/* Luxury Sticky Mobile CTA Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 z-40 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-xs text-gray-400 block font-medium">Total Price</span>
          <span className="text-xl font-extrabold text-gray-900">₹{product.price * quantity}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAddToCart}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full font-bold text-sm transition"
          >
            Add to Cart
          </button>
          <button 
            onClick={handleBuyNow}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-sm transition shadow-lg"
          >
            Buy Now
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Luxury Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-gray-400 mb-8 font-medium">
          <span className="cursor-pointer hover:text-gray-900 transition" onClick={() => navigate("/")}>Home</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-gray-900 transition" onClick={() => navigate("/products")}>Shop</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-gray-900 transition" onClick={() => navigate(`/products?category=${product.category}`)}>{product.category}</span>
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate max-w-[200px]">{product.title}</span>
        </nav>

        {/* 2-Column Hero layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-gray-200">
          
          {/* LEFT SIDE: Image Showcase */}
          <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
            
            {/* Main Premium Container with Hover Zoom */}
            <div 
              className="flex-1 relative overflow-hidden rounded-3xl bg-white aspect-square border border-gray-100 flex items-center justify-center p-6 cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
            >
              <img
                src={productImages[activeImageIndex] || product.image}
                alt={product.title}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={isZooming ? {
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: 'scale(1.8)'
                } : {}}
              />
              
              {/* Luxury Badges */}
              {discountPercentage > 0 && (
                <span className="absolute top-6 left-6 bg-red-500 text-white px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                  {discountPercentage}% Save
                </span>
              )}

              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`absolute top-6 right-6 p-3 rounded-full border shadow-lg transition ${
                  isWishlisted ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-gray-400 hover:text-gray-600 border-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnails Sidebar */}
            <div className="flex md:flex-col gap-3 justify-center md:justify-start">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl p-1 bg-white border-2 transition overflow-hidden ${
                    activeImageIndex === idx ? 'border-blue-600 shadow-md' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Info panel */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {product.category}
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                  In Stock & Ready
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
                {product.title}
              </h1>

              {/* Star aggregation */}
              <div className="flex items-center gap-3 mt-4 mb-6">
                <div className="flex items-center text-yellow-400 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                  <Star size={14} className="fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-xs font-bold text-gray-800">{avgRating || "0.0"}</span>
                </div>
                <span className="text-xs text-gray-400 font-semibold">•</span>
                <span className="text-xs text-gray-500 font-medium">({displayedReviews.length} Verified Customer Reviews)</span>
              </div>

              {/* Pricing Section */}
              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-gray-900">₹{product.price}</span>
                  {product.actualPrice && product.actualPrice > product.price && (
                    <>
                      <span className="text-lg text-gray-400 line-through">₹{product.actualPrice}</span>
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">
                        -{discountPercentage}% Off
                      </span>
                    </>
                  )}
                </div>

                {/* Delivery details card */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-blue-600" />
                    <span>Free Shipping</span>
                  </div>
                  <div>
                    <span>Delivery by <strong className="text-gray-800">Friday, May 24</strong></span>
                  </div>
                </div>
              </div>

              {/* Description summary */}
              <p className="mt-6 text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>

              {/* Quantity Controls */}
              <div className="mt-8 flex items-center space-x-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-full bg-white px-2 py-1 shadow-sm">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 font-bold transition text-gray-600"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 font-bold transition text-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Premium CTA Buttons */}
            <div className="mt-8 space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 rounded-full font-bold shadow-sm transition transform hover:-translate-y-0.5 duration-300"
                >
                  <ShoppingCart size={18} />
                  <span>Add to Cart</span>
                </button>
                
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg shadow-blue-100 transition transform hover:-translate-y-0.5 duration-300"
                >
                  <Zap size={18} />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Contact panel */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/918121135980?text=Hello, I would like to inquire about: ${product.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-full font-semibold text-xs border border-green-100 transition"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp Inquiry</span>
                </a>
                <a
                  href="tel:+918121135980"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full font-semibold text-xs border border-gray-200 transition"
                >
                  <Phone size={14} />
                  <span>Call Support</span>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Horizontal Luxury Highlights Panel */}
        <div className="py-12 border-b border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award size={18} />
            </div>
            <span className="text-xs font-bold text-gray-900">Premium Quality</span>
            <span className="text-[10px] text-gray-400 font-medium">100% Certified</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <Truck size={18} />
            </div>
            <span className="text-xs font-bold text-gray-900">Fast Delivery</span>
            <span className="text-[10px] text-gray-400 font-medium">Safely Packaged</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <X size={18} />
            </div>
            <span className="text-xs font-bold text-gray-900">No Returns</span>
            <span className="text-[10px] text-gray-400 font-medium">No Exchange</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <span className="text-xs font-bold text-gray-900">Secure Payments</span>
            <span className="text-[10px] text-gray-400 font-medium">Fully Encrypted</span>
          </div>
        </div>

        {/* Premium Information Tabs */}
        <div className="py-16 border-b border-gray-200">
          <div className="flex border-b border-gray-200 overflow-x-auto space-x-8">
            {["description", "specifications", "materials", "shipping"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
                  activeTab === tab ? 'border-blue-600 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-8 prose prose-sm max-w-none text-gray-600 leading-relaxed font-sans">
            {activeTab === "description" && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900">Elegant Craftsmanship & Luxury Aesthetics</h4>
                <p>{product.description}</p>
                <p>This premium collection highlights our dedication to creating beautiful, lasting decorative elements for your home. Made with precision and passion, this piece will bring style and refinement to any interior layout.</p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="max-w-2xl bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <tbody>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <td className="px-6 py-4 font-bold text-gray-500 w-1/3">Category</td>
                      <td className="px-6 py-4 text-gray-900">{product.category}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-500">Weight</td>
                      <td className="px-6 py-4 text-gray-900">Premium heavy-duty grade (Variable by size)</td>
                    </tr>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <td className="px-6 py-4 font-bold text-gray-500">Finish</td>
                      <td className="px-6 py-4 text-gray-900">High gloss luxury finish</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-bold text-gray-500">Compatibility</td>
                      <td className="px-6 py-4 text-gray-900">Fully certified for premium household usage</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "materials" && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 font-sans">Only The Finest Materials</h4>
                <p>Constructed with eco-friendly and robust, food-grade materials that guarantee structural integrity and long durability under regular household usage.</p>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900">Reliable Logistics Network</h4>
                <p>We deliver using professional high-security transport partners. The product is securely packaged inside specialized heavy-duty boxes to prevent damages during transit.</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="py-16 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8 flex items-center gap-2">
            <span>Customer Reviews & Verification</span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 flex items-center gap-1">
              <ShieldCheck size={12} /> Verified Reviews Only
            </span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Reviews Breakdown card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Overall Score</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-gray-900">{avgRating || "0.0"}</span>
                  <span className="text-sm font-bold text-gray-400">out of 5</span>
                </div>

                <div className="flex items-center text-yellow-400 mt-3 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      className={`${
                        star <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Progress bars */}
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center text-xs text-gray-500 font-semibold">
                      <span className="w-8">{rating} star</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full mx-3 overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all"
                          style={{ width: `${ratingPercentages[rating as 5|4|3|2|1] || 0}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right">
                        {ratingPercentages[rating as 5|4|3|2|1] || 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditional authorization badge */}
              {!isAuthenticated ? (
                <div className="p-6 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 text-center space-y-3">
                  <span className="text-3xl block">🔒</span>
                  <h4 className="font-bold text-gray-800 text-sm">Sign In to Review</h4>
                  <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto">
                    Please log in to your customer account to rate and submit comments about this product.
                  </p>
                  <button
                    onClick={() => navigate('/login', { state: { from: location } })}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition"
                  >
                    Log In Now
                  </button>
                </div>
              ) : !hasBoughtProduct ? (
                <div className="p-6 border border-dashed border-red-200 rounded-3xl bg-red-50/20 text-center space-y-3">
                  <span className="text-3xl block">🛍️</span>
                  <h4 className="font-bold text-red-800 text-sm">Review Restricted</h4>
                  <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto">
                    To maintain strict authenticity, only customers who have verified purchase history for this item can write feedback.
                  </p>
                </div>
              ) : (
                <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-md">
                  <h3 className="font-extrabold text-gray-900 text-sm mb-4">Write your Review</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-4 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Your Rating</label>
                      <div className="flex items-center gap-1.5 py-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setFormRating(star)}
                            className="text-yellow-400 hover:scale-110 active:scale-95 transition-transform"
                          >
                            <Star
                              size={24}
                              className={`${star <= formRating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Review Comments</label>
                      <textarea
                        required
                        rows={3}
                        value={formComment}
                        onChange={(e) => setFormComment(e.target.value)}
                        placeholder="Share your experience..."
                        className="w-full px-4 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Upload Delivery Pic</label>
                      <div className="mt-1 flex flex-col items-center justify-center border border-dashed rounded-xl p-4 bg-gray-50 hover:bg-gray-100 relative cursor-pointer">
                        {imagePreview ? (
                          <div className="relative w-full h-32 flex items-center justify-center">
                            <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg shadow" />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview("");
                                setFormImage("");
                              }}
                              className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Camera className="w-6 h-6 text-gray-400 mb-1 animate-pulse" />
                            <span className="text-[10px] text-gray-500 font-semibold text-center">Click to select photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition"
                    >
                      Submit Review
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Customer reviews list */}
            <div className="lg:col-span-2 space-y-6">
              {displayedReviews.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <p className="text-gray-400 font-semibold text-sm">No reviews yet. Be the first to share your feedback!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {displayedReviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <User2 size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{review.name}</h4>
                            <span className="text-[10px] text-gray-400 font-medium">Verified Buyer • {review.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 text-yellow-400 bg-yellow-50 px-2 py-1 rounded-lg">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={`${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-sans">
                        {review.comment}
                      </p>

                      {review.image && (
                        <div className="pt-2">
                          <p className="text-[10px] font-bold text-gray-400 mb-1.5 flex items-center gap-1">
                            <CheckCircle size={12} className="text-green-600" />
                            <span>Customer Photo:</span>
                          </p>
                          <div className="relative w-28 h-28 overflow-hidden rounded-2xl shadow-sm cursor-zoom-in border border-gray-200 bg-gray-50 group">
                            <img
                              src={review.image}
                              alt="Review Pic"
                              className="w-full h-full object-cover transition group-hover:scale-105"
                              onClick={() => setActiveLightboxImage(review.image || null)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Premium Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="py-16">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">Related Masterpieces</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const discount = p.actualPrice && p.price ? Math.round(((p.actualPrice - p.price) / p.actualPrice) * 100) : 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      navigate(`/product/${encodeURIComponent(p.id)}`, { state: p });
                      window.scrollTo(0, 0);
                    }}
                    className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-[#f8f8f7] aspect-square flex items-center justify-center p-4">
                      <img src={p.image} alt={p.title} className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105" />
                      {discount > 0 && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold">
                          {discount}% Off
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {p.category}
                      </span>
                      <h4 className="font-bold text-gray-900 text-xs md:text-sm truncate group-hover:text-blue-600 transition pt-1">
                        {p.title}
                      </h4>
                      <div className="flex items-baseline gap-1.5 pt-1">
                        <span className="text-xs md:text-sm font-black text-gray-900">₹{p.price}</span>
                        {p.actualPrice && p.actualPrice > p.price && (
                          <span className="text-[10px] text-gray-400 line-through">₹{p.actualPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Floating WhatsApp Quick Action */}
      <a
        href="https://wa.me/918121135980"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 bg-green-600 hover:bg-green-700 text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-2 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-lg border border-gray-100">
          WhatsApp Support
        </span>
      </a>

      {/* Expand Image Lightbox */}
      <AnimatePresence>
        {activeLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setActiveLightboxImage(null)}
          >
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white rounded-full p-2.5 transition"
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={activeLightboxImage}
              alt="Full scale validation pic"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
