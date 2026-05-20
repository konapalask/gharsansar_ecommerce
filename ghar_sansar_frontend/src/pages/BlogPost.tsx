// src/pages/BlogPost.tsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useBlogs } from "../context/BlogContext";

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { blogs, loading, error } = useBlogs();

  if (loading)
    return <div className="text-center py-20 text-gray-500">Loading blog post...</div>;
  if (error)
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;

  const post = blogs.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Oops! The blog post doesn’t exist or has been removed.</p>
        <Link to="/blog" className="text-blue-600 underline">
          Go back to Blog
        </Link>
      </div>
    );
  }

  const extractYouTubeId = (url?: string) => {
    if (!url) return "";
    const match = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
    return match ? match[1] : "";
  };

  const extractInstagramId = (url?: string) => {
    if (!url) return "";
    const match = url.match(/instagram\.com\/p\/([\w-]+)/);
    return match ? match[1] : "";
  };

  const isYouTube = post.video?.includes("youtube") || post.video?.includes("youtu.be");
  const isInstagram = post.video?.includes("instagram.com");

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/blog"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
        </Link>

        {/* Main Post */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Media */}
          <div className="relative w-full lg:h-[500px] h-80">
            {post.video && isYouTube && (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${extractYouTubeId(post.video)}`}
                title="YouTube video"
                frameBorder="0"
                allowFullScreen
                className="w-full h-full object-cover"
              />
            )}
            {post.video && isInstagram && (
              <iframe
                src={`https://www.instagram.com/p/${extractInstagramId(post.video)}/embed`}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                allowTransparency={true}
                className="w-full h-full object-cover"
              />
            )}
            {!post.video && post.image && (
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
              {post.features && post.features[0] && (
                <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                  {post.features[0]}
                </span>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="p-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>{post.author || "Admin"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>5 min read</span>
            </div>
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>

          {/* Full Description */}
          <div className="p-8 lg:p-12 prose prose-lg prose-blue max-w-none">
            <p>{post.description}</p>
          </div>
        </motion.article>

        {/* Related Posts */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-12"
        >
          <h2 className="text-3xl font-bold mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs
              .filter((b) => b.id !== post.id)
              .slice(0, 4)
              .map((related) => {
                const isYt = related.video?.includes("youtube") || related.video?.includes("youtu.be");
                const isIg = related.video?.includes("instagram.com");

                return (
                  <Link
                    key={related.id}
                    to={`/blog/${related.id}`}
                    className="block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                  >
                    {related.video ? (
                      isYt ? (
                        <iframe
                          width="100%"
                          height="200"
                          src={`https://www.youtube.com/embed/${extractYouTubeId(related.video)}`}
                          title="YouTube video"
                          frameBorder="0"
                          allowFullScreen
                          className="w-full object-cover"
                        />
                      ) : isIg ? (
                        <iframe
                          src={`https://www.instagram.com/p/${extractInstagramId(related.video)}/embed`}
                          width="100%"
                          height="200"
                          frameBorder="0"
                          scrolling="no"
                          allowTransparency={true}
                          className="w-full object-cover"
                        />
                      ) : null
                    ) : (
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-48 object-cover"
                      />
                    )}

                    <div className="p-4">
                      <h3 className="text-xl font-semibold">{related.title}</h3>
                      <p className="text-gray-600 line-clamp-2">{related.description}</p>
                    </div>
                  </Link>
                );
              })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPost;
