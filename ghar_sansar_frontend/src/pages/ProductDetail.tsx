// src/pages/ProductDetail.tsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Phone, MessageCircle, MapPinIcon, ChevronLeft, ArrowLeft, ShoppingCart, Zap } from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const ProductDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Product id from URL
  const { pathname, search, state } = location;
  const id = decodeURIComponent(pathname.split("/").pop() || "");
  const { products } = useProducts();

  // Prefer router state, else lookup from context
  const product = state || useMemo(() =>
    products.find((p) => p.id === id), [id, products]
  );

  if (!product) {
    return (
      <div className="p-6 text-center">
        <p>Product not found.</p>
        <button
          onClick={() => navigate(`/products${search}`)}
          className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl shadow-md hover:from-blue-700 hover:to-blue-600 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg"
        >
          <ArrowLeft size={18} /> Go Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg"
      >
        <ChevronLeft size={18} /> Back
      </button>

             {/* Product Image */}
       <img
         src={product.image}
         alt={product.name || product.title}
         className="w-full max-h-[70vh] object-contain rounded-xl shadow-lg transition-transform duration-500 hover:scale-[1.02]"
         loading="lazy"
       />

      {/* Product Name */}
      <h1 className="text-4xl font-extrabold mt-6 tracking-tight text-gray-900">
        {product.name || product.title}
      </h1>

      {/* Price */}
      {product.price ? (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-3xl font-bold text-blue-600">₹{product.price}</span>
          {product.actualPrice && product.actualPrice > product.price && (
            <span className="text-xl text-gray-500 line-through">₹{product.actualPrice}</span>
          )}
          {product.actualPrice && product.actualPrice > product.price && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              {Math.round((1 - product.price / product.actualPrice) * 100)}% OFF
            </span>
          )}
        </div>
      ) : (
        <p className="mt-4 text-xl text-gray-600">Contact for Price</p>
      )}

      {/* Product Description */}
      <div
        className="relative mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 
                    rounded-xl shadow-inner border-l-4 border-blue-500 
                    animate-fadeIn"
      >
        <p className="text-lg leading-relaxed font-serif text-gray-800 italic">
          {product.description}
        </p>
      </div>

      {/* Buy Now and Add to Cart Buttons */}
      {product.price && (
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => {
              addToCart({
                id: product.id,
                name: product.title,
                price: product.price,
                image: product.image
              });
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            <ShoppingCart size={20} /> Add to Cart
          </button>
          <button
            onClick={() => {
              addToCart({
                id: product.id,
                name: product.title,
                price: product.price,
                image: product.image
              });
              if (!isAuthenticated) {
                toast.error('Please sign in to proceed to checkout!');
                navigate('/login', { state: { from: { pathname: '/checkout' } } });
              } else {
                navigate('/checkout');
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors font-semibold text-lg"
          >
            <Zap size={20} /> Buy Now
          </button>
        </div>
      )}

      {/* Policy Notice */}
      <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
        <span className="text-lg">⚠️</span>
        <div>
          <h4 className="font-bold text-red-800 text-sm">Purchase Policy</h4>
          <p className="text-red-700 text-xs mt-0.5">
            Bespoke custom showroom creations are strictly non-refundable and non-returnable.
          </p>
        </div>
      </div>

      {/* Contact Options */}
      <div className="flex gap-4 mt-6 flex-wrap">
        {/* Call */}
        <a
          href="tel:+918121135980"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          <Phone size={18} /> Call
        </a>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/918121135980?text=I'm interested in ${product.name || product.title}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          <MessageCircle size={18} /> WhatsApp
        </a>

        {/* Address */}
        <a
          href="https://www.google.com/maps/dir//27-14-60,+Rajagopalachari+St,+Governor+Peta,+Vijayawada,+Andhra+Pradesh"
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
        >
          <MapPinIcon size={18} /> Address
        </a>
      </div>
    </div>
  );
};

export default ProductDetail;
