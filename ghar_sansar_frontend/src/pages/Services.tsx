import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useServices } from "../context/ServiceContext";

// ✅ Ensure images are always valid
const fixImageUrl = (url: string | undefined) => {
  if (!url) return "";
  return url
    .replace(/^https?:\/\/https?:\/\//, "https://")
    .replace(/\s/g, "%20")
    .replace(/([^:]\/)\/+/g, "$1");
};

const Services: React.FC = () => {
  const { services } = useServices();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // ✅ Stop loading whether services exist or not
    setLoading(false);
  }, [services]);

  if (loading) return <div className="py-12 flex justify-center"><div className="spinner"></div></div>;
  if (!services.length) return <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">No services available.</motion.p>;

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Interior Design Services
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg text-gray-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Professional interior design solutions for your home
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {services.map((s, index) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all duration-300 group"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              {s.image ? (
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img
                    src={fixImageUrl(s.image)}
                    alt={s.title}
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="w-full h-48 sm:h-56 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{s.description}</p>

              {s.features && (
                <ul className="space-y-2">
                  {s.features.map((f, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
