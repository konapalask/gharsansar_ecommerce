import React, { useState, useMemo } from "react";
import { useBlogs, Blog } from "../../context/BlogContext";
import axios from "axios";
import { Search, Plus, X, Trash2, Save, ImagePlus, Youtube, Instagram, FileImage } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_DELETE = "https://lx70r6zsef.execute-api.ap-south-1.amazonaws.com/prod/api/storage/upload/blog";

const BlogAdmin: React.FC = () => {
  const { blogs, addBlog, refreshBlogs } = useBlogs();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleFileChange = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("Title required");

    try {
      await addBlog(
        { title, description, price: Number(price) || undefined, video },
        image || undefined
      );
      setTitle("");
      setDescription("");
      setPrice("");
      setImage(null);
      setVideo("");
      setPreview(null);
      setShowForm(false);
      await refreshBlogs();
      alert("✅ Blog added successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add blog");
    }
  };

  // ---- FIX: use blog.id (the UUID) for deletion query ----
  const handleDelete = async (blog: Blog) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await axios.delete(API_DELETE, {
        params: {
          category_type: "blog",
          category_name: blog.features?.[0] || "general",
          subcategory_name: "general",
          id: blog.id, // MUST use UUID returned as "id" from backend JSON
        },
      });
      await refreshBlogs();
      alert("🗑️ Blog deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete blog");
    }
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : "";
  };

  const extractInstagramId = (url: string) => {
    const match = url.match(/instagram\.com\/p\/([\w-]+)/);
    return match ? match[1] : "";
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setImage(null);
    setVideo("");
    setPreview(null);
    setShowForm(false);
  };

  // Filter blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesSearch = searchTerm
        ? b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
      return matchesSearch;
    });
  }, [blogs, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Blogs</h1>
          <p className="text-gray-600 mt-1">{blogs.length} total blogs</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add New Blog
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          />
        </div>
      </motion.div>

      {/* Add Blog Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl p-6 space-y-4 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Add New Blog</h2>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Blog Title *</label>
                <input
                  type="text"
                  placeholder="Enter blog title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                <input
                  type="text"
                  placeholder="Enter price (optional)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                placeholder="Enter blog description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition h-32 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Video URL (YouTube/Instagram)</label>
              <input
                type="text"
                placeholder="https://youtube.com/... or https://instagram.com/p/..."
                value={video}
                onChange={(e) => setVideo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Blog Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition cursor-pointer"
              />
            </div>

            {preview && (
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={preview}
                alt="Preview"
                className="w-full h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
              />
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold inline-flex items-center gap-2"
              >
                <ImagePlus className="w-5 h-5" /> Add Blog
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Existing Blogs */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          Blogs ({filteredBlogs.length})
        </h2>
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredBlogs.map((b, index) => {
              const isYouTube = b.video?.includes("youtube") || b.video?.includes("youtu.be");
              const isInstagram = b.video?.includes("instagram.com");

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{b.title}</h3>
                        <button
                          onClick={() => handleDelete(b)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold inline-flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                      {b.description && (
                        <p className="text-gray-600 mb-3 line-clamp-3">{b.description}</p>
                      )}
                      {b.price && (
                        <span className="text-green-600 font-bold text-lg">₹{b.price}</span>
                      )}
                    </div>

                    {/* Media */}
                    <div className="w-full sm:w-96">
                      {/* Image */}
                      {b.image && (
                        <motion.img
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          src={b.image}
                          alt={b.title}
                          className="w-full h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
                        />
                      )}

                      {/* YouTube Video */}
                      {b.video && isYouTube && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Youtube className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-semibold text-gray-700">YouTube Video</span>
                          </div>
                          <iframe
                            width="100%"
                            height="240"
                            src={`https://www.youtube.com/embed/${extractYouTubeId(b.video)}`}
                            title="YouTube video"
                            frameBorder="0"
                            allowFullScreen
                            className="rounded-lg"
                          />
                        </div>
                      )}

                      {/* Instagram Video */}
                      {b.video && isInstagram && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Instagram className="w-5 h-5 text-pink-600" />
                            <span className="text-sm font-semibold text-gray-700">Instagram Post</span>
                          </div>
                          <iframe
                            src={`https://www.instagram.com/p/${extractInstagramId(b.video)}/embed`}
                            width="100%"
                            height="400"
                            frameBorder="0"
                            scrolling="no"
                            allowTransparency={true}
                            className="rounded-lg"
                          ></iframe>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No blogs found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search" : "Start by adding your first blog"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogAdmin;
