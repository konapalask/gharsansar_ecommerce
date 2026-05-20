// src/components/BlogCard.tsx
import React from "react";

export type BlogImage = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  video?: string; // YouTube / Instagram link
  price?: number;
  features?: string[];
};

interface BlogCardProps {
  blog: BlogImage;
  featured?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, featured }) => {
  // Helper to extract YouTube ID
  const extractYouTubeId = (url?: string) => {
    if (!url) return "";
    const match = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
    return match ? match[1] : "";
  };

  // Helper to extract Instagram Post ID
  const extractInstagramId = (url?: string) => {
    if (!url) return "";
    const match = url.match(/instagram\.com\/p\/([\w-]+)/);
    return match ? match[1] : "";
  };

  const isYouTube = blog.video?.includes("youtube") || blog.video?.includes("youtu.be");
  const isInstagram = blog.video?.includes("instagram.com");

  return (
    <div
      className={`rounded-lg overflow-hidden shadow-lg bg-white flex flex-col ${
        featured ? "lg:flex-row lg:h-96" : ""
      }`}
    >
      {/* Media Section */}
      <div className={`${featured ? "lg:w-1/2" : ""}`}>
        {blog.image && (
          <img
            src={blog.image}
            alt={blog.title}
            className={`${featured ? "h-full w-full object-cover" : "h-64 w-full object-cover"}`}
          />
        )}

        {blog.video && isYouTube && (
          <iframe
            width="100%"
            height={featured ? 400 : 200}
            src={`https://www.youtube.com/embed/${extractYouTubeId(blog.video)}`}
            title={blog.title || "YouTube video"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="mt-2 rounded-lg"
          />
        )}

        {blog.video && isInstagram && (
          <iframe
            src={`https://www.instagram.com/p/${extractInstagramId(blog.video)}/embed`}
            width="100%"
            height={featured ? 480 : 200}
            frameBorder="0"
            scrolling="no"
            allowTransparency
            className="mt-2 rounded-lg"
          ></iframe>
        )}
      </div>

      {/* Text / Info Section */}
      <div className={`p-4 ${featured ? "lg:w-1/2 lg:flex lg:flex-col lg:justify-center" : ""}`}>
        <h3 className={`font-semibold ${featured ? "text-2xl" : "text-lg"} mb-2`}>
          {blog.title}
        </h3>

        {blog.description && <p className="text-gray-600 mb-2">{blog.description}</p>}

        {typeof blog.price === "number" && blog.price > 0 && (
          <div className="font-bold text-red-600 mb-2">Price: ₹{blog.price}</div>
        )}

        {blog.features && blog.features.length > 0 && (
          <ul className="list-disc list-inside text-gray-500 text-sm">
            {blog.features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BlogCard;
