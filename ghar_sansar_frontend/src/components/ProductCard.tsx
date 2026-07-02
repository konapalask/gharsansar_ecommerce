import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Eye, Share2 } from "lucide-react";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    image: string;
    description: string;
    price: string;
    height?: number;
    width?: number;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareData = {
      title: product.name.replace(/_/g, " "),
      text: `Check out ${product.name.replace(/_/g, " ")} at Ghar Sansar!`,
      url: `${window.location.origin}/product/${product.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user cancelled or error
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success("Link copied to clipboard!");
    }
  };

  const scrollToCard = () => {
    if (cardRef.current) {
      const yOffset = -80; // offset for fixed navbar
      const y =
        cardRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative group cursor-pointer w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={scrollToCard}
      whileHover={{ scale: 1.02 }}
    >
      {/* Image */}
      <img
        src={product.image}
        alt={product.name.replace("_", " ")}
        className="w-full h-64 object-cover sm:h-80 md:h-96 transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* Price badge */}
      <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
        ₹{product.price}
      </div>

      {/* Hover overlay */}
      <div
        className={`absolute inset-0 bg-black/30 flex flex-col justify-end p-4 text-white transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
      >
        <h3 className="text-lg font-bold mb-1">
          {product.name.replace("_", " ")}
        </h3>
        <p className="text-sm line-clamp-2 mb-3">
          {product.description}
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition"
            onClick={handleShare}
          >
            <Share2 size={16} /> Share
          </button>
          <button
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: add to cart logic
            }}
          >
            <ShoppingCart size={16} /> Cart
          </button>
          <a
            href={product.image}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded transition"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={16} /> View
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
