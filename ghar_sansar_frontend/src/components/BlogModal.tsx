// src/components/BlogModal.tsx
import React from "react";

import { BlogImage } from "./BlogCard";

interface BlogModalProps {
  blog: BlogImage;
  onClose: () => void;
}

const BlogModal: React.FC<BlogModalProps> = ({ blog, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl max-w-3xl w-full overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          &times;
        </button>

        {/* Media Section */}
        <div className="w-full h-64 md:h-96 bg-gray-200">
          {blog.video ? (
            <iframe
              src={blog.video}
              title={blog.title}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          ) : blog.image ? (
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No Media
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{blog.title}</h2>
          {blog.price && <p className="text-blue-600 font-semibold mb-2">₹{blog.price}</p>}
          <p className="text-gray-700">{blog.description}</p>
        </div>
      </div>
    </div>
  );
};

export default BlogModal;
