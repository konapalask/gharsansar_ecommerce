import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBlogs } from "../context/BlogContext";

const API_URL = "https://lx70r6zsef.execute-api.ap-south-1.amazonaws.com/prod/api/storage/upload/blog";
const YOUTUBE_LINK = "https://www.youtube.com/@gharsansar_shop";

const sanitizeUrl = (url?: string) => {
  if (!url) return "";
  url = url.trim().replace(/^https?:\/\/https?:\/\//, "https://");
  const httpsIndex = url.indexOf("://");
  if (httpsIndex !== -1) {
    let [prefix, path] = [url.slice(0, httpsIndex + 3), url.slice(httpsIndex + 3)];
    path = path.replace(/\/{2,}/g, "/");
    url = prefix + path;
  }
  return url;
};

type BlogItem = {
  id?: string;
  title?: string;
  description?: string;
  image?: string;
  video?: string;
};

const extractYouTubeId = (url: string) => {
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : "";
};

const Blog: React.FC = () => {
  const { blogs, loading } = useBlogs();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBlog, setModalBlog] = useState<any | null>(null);

  // useEffect removed since context handles fetching


  const videoPosts = blogs.filter(
    (p) =>
      p.video &&
      ((/\.(mp4|webm|ogg)(\?|$)/i.test(p.video)) ||
        p.video.includes("youtube.com") ||
        p.video.includes("youtu.be"))
  );
  const imagePosts = blogs.filter((p) => !videoPosts.includes(p) && p.image);

  // Hide controls for <video> by using controls={false} and loop/autoplay/muted/playsInline
  // For YouTube, autoplay, mute, loop—no controls or branding
  const getYoutubeEmbedUrl = (post: BlogItem) => {
    const vid = post.video ? extractYouTubeId(post.video) : "";
    if (!vid) return "";
    return `https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&disablekb=1&modestbranding=1&showinfo=0&rel=0`;
  };

  const handleSubscribe = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(YOUTUBE_LINK, "_blank", "noopener noreferrer");
  };

  const handleOpenModal = (post: BlogItem) => {
    setModalBlog(post);
    setModalOpen(true);
  };

  if (loading)
    return <div className="text-center p-10 text-gray-500">Loading blog posts...</div>;
  if (!blogs.length)
    return <div className="text-center p-10 text-gray-500">No blog posts available.</div>;

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="w-full mx-auto px-2 sm:px-4 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
          >
            Design Inspiration & Tips
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Discover the latest trends, expert tips, and creative ideas to transform your home into a beautiful sanctuary.
          </motion.p>
        </div>
        {/* Header with Subscribe */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center mb-6 space-x-3">
            {/* Logo Avatar */}
            <div className="w-24 h-24 rounded-full border border-gray-200 flex items-center justify-center shadow overflow-hidden bg-white">
              <img
                src="/images/logo.png"
                alt="Ghar sansar Logo"
                className="w-full h-40 object-cover"
                draggable={false}
              />
            </div>

            {/* Brand Name and Subtitle */}
            <div>
              <div className="font-bold text-2xl text-gray-900 flex items-center space-x-2">
                <span>Ghar sansar</span>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-base font-semibold shadow ml-2"
                  onClick={handleSubscribe}
                >
                  Subscribe
                </button>
              </div>
              <div className="text-sm text-gray-500">Latest on our Social</div>
            </div>
          </div>
        </div>
        {/* Video Reel (all autoplay, loop, no controls, no description) */}
        {videoPosts.length > 0 && (
          <div className="flex space-x-8 overflow-x-auto pb-8 hide-scrollbar">
            {videoPosts.map((post, idx) => {
              const isYouTube = post.video?.includes("youtube") || post.video?.includes("youtu.be");
              return (
                <motion.div
                  key={`video-card-${idx}`}
                  id={`video-card-${idx}`}
                  className="flex-shrink-0 bg-white rounded-xl shadow p-3 transition-transform cursor-pointer hover:scale-105 w-[280px] md:w-[350px]"
                  style={{ scrollSnapAlign: "center" }}
                  onClick={() => handleOpenModal(post)}
                >
                  {isYouTube ? (
                    <iframe
                      width="100%"
                      height="440"
                      src={getYoutubeEmbedUrl(post)}
                      title="YouTube video"
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      className="rounded"
                      style={{ pointerEvents: "none" }}
                    />
                  ) : (
                    <video
                      src={post.video}
                      autoPlay
                      muted
                      playsInline
                      loop
                      controls={false}
                      className="w-full h-[440px] md:h-[500px] object-cover rounded"
                      style={{ outline: "none", border: "none", userSelect: "none", pointerEvents: "none" }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Modal for video/image (show description/title here) */}
        <AnimatePresence>
          {modalOpen && modalBlog && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.96 }}
                className="bg-white rounded-xl flex flex-col md:flex-row p-6 max-w-3xl w-full shadow-xl relative"
                onClick={e => e.stopPropagation()}
              >
                {modalBlog.video ? (
                  modalBlog.video.includes("youtube") ? (
                    <iframe
                      width="100%"
                      height="384"
                      src={getYoutubeEmbedUrl(modalBlog)}
                      title="YouTube video"
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      className="md:w-96 rounded"
                    />
                  ) : (
                    <video
                      src={modalBlog.video}
                      controls
                      autoPlay
                      loop
                      className="w-full md:w-96 h-96 object-cover rounded"
                    />
                  )
                ) : modalBlog.image ? (
                  <img
                    src={modalBlog.image}
                    alt={modalBlog.title}
                    className="w-full md:w-96 h-96 object-cover rounded"
                  />
                ) : null}
                <div className="flex-1 px-4 mt-4 md:mt-0">
                  <div className="font-bold text-lg mb-2">{modalBlog.title}</div>
                  <div className="whitespace-pre-line text-gray-700">{modalBlog.description}</div>
                  <button
                    className="absolute right-2 top-1 text-2xl text-gray-500 hover:text-gray-800"
                    onClick={() => setModalOpen(false)}
                  >
                    &times;
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Images */}
        {imagePosts.length > 0 && (
          <>
            <div className="text-xl font-bold mt-8 mb-4">Photos and Images</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {imagePosts.map((post, idx) => (
                <div
                  key={`img-card-${idx}`}
                  className="bg-white shadow rounded-xl p-4 flex flex-col items-center cursor-pointer"
                  onClick={() => handleOpenModal(post)}
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-64 object-cover rounded"
                  />
                  <div className="mt-3 font-semibold text-base text-center">{post.title}</div>
                  {post.description && (
                    <div className="text-gray-600 text-sm mt-1 text-center">{post.description}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {/* Hide scrollbar styling */}
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Blog;
