// src/pages/Home.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Truck, Shield, Headphones, XCircle, Eye, Palette, HandHeart, CheckCircle, Home as HomeIcon, ShoppingCart, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useProducts } from "../context/ProductContext"; // ✅ using context
import { useCart } from "../context/CartContext";
import categoriesData from "../data/categories.json";

const Home: React.FC = () => {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // State for interior categories
  const [interiorCategories, setInteriorCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch interior categories
  useEffect(() => {
    const fetchInteriorCategories = async () => {
      try {
        // AWS Endpoint Expired, using local data
        const data = categoriesData;

        // Handle new JSON structure with data array
        const dataArr = Array.isArray(data) ? data : (data as any).data || [];
        const categories = dataArr.map((cat: any) => ({
          name: cat.name,
          image: cat.subcategories?.[0]?.image
            ? (cat.subcategories[0].image.startsWith('/') ? cat.subcategories[0].image : `/${cat.subcategories[0].image}`)
            : undefined,
          features: cat.features || [],
          subcategories: cat.subcategories || []
        }));

        setInteriorCategories(categories.slice(0, 6)); // Show only first 6
      } catch (err) {
        console.error("Failed to fetch interior categories:", err);
        setInteriorCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchInteriorCategories();
  }, []);

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "Free delivery on orders over ₹1500",
    },
    {
      icon: Shield,
      title: "Secure Payment",
      description: "100% secure payment processing",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Round-the-clock customer support",
    },
    {
      icon: XCircle,
      title: "No Return & Exchange",
      description: "Products cannot be returned or exchanged",
    },
  ];

  // ✅ Pick first 6 products as "recent" (backend usually gives newest first)
  const recentProducts = products.slice(0, 6);

  // How We Work steps
  const workSteps = [
    {
      icon: Eye,
      title: "Browse & Select",
      description: "Explore our extensive collection of products and interior design galleries. Select items or design services that match your style.",
      color: "blue"
    },
    {
      icon: Palette,
      title: "Consultation",
      description: "Connect with our design experts for personalized advice. Get professional recommendations tailored to your space and preferences.",
      color: "purple"
    },
    {
      icon: HandHeart,
      title: "We Deliver",
      description: "Experience hassle-free delivery right to your doorstep. We handle the logistics so you can focus on enjoying your new space.",
      color: "green"
    },
    {
      icon: CheckCircle,
      title: "Enjoy",
      description: "Transform your space and enjoy the results. Our commitment to quality ensures long-lasting satisfaction with your home transformation.",
      color: "orange"
    }
  ];


  return (
    <main className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* SEO Headings for Regional Keywords */}
      <div className="sr-only">
        <h2>Best Interior Designers in Vijayawada, Andhra Pradesh</h2>
        <h2>Best Interior Designers in Guntur, Andhra Pradesh</h2>
        <h2>Best Interior Designers in Eluru, Andhra Pradesh</h2>
        <h2>Best Interior Designers in Hyderabad, Telangana</h2>
        <h2>Interior Design Services Vijayawada</h2>
        <h2>Interior Design Services Guntur</h2>
        <h2>Interior Design Services Eluru</h2>
        <h2>Interior Design Services Hyderabad</h2>
        <h2>Professional Interior Designers Andhra Pradesh</h2>
        <h2>Professional Interior Designers Telangana</h2>
        <h2>Top Interior Designers in Vijayawada</h2>
        <h2>Top Interior Designers in Hyderabad</h2>
        <h2>Ghar Sansar - #1 Interior Designers Vijayawada</h2>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Best Interior Designers in
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Andhra Pradesh & Telangana</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Transform your home with premium decor items and professional interior design services in Vijayawada, Guntur, Eluru, Hyderabad, and across Andhra Pradesh & Telangana.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/interior-design"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold inline-flex items-center justify-center group text-sm sm:text-base"
                >
                  Design Services
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/products"
                  className="border-2 border-blue-600 text-blue-600 px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:bg-blue-600 hover:text-white hover:shadow-lg transition-all duration-300 font-semibold inline-flex items-center justify-center text-sm sm:text-base"
                >
                  Shop Now
                </Link>
              </div>
            </motion.div>

            {/* Video */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full"
            >
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <video
                  src="/videos/homepagevideo.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  poster="https://content3.jdmagicbox.com/comp/vijayawada/89/0866p866std2000089/catalogue/ghar-sansar-governerpet-vijayawada-gift-shops-r9zm63fkbh.jpg"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4"
            >
              How We Work
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4"
            >
              From browsing to delivery, we make your home transformation journey seamless
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {workSteps.map((step, index) => {
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600",
                purple: "bg-purple-100 text-purple-600",
                green: "bg-green-100 text-green-600",
                orange: "bg-orange-100 text-orange-600"
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow group relative"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-full ${colorClasses[step.color as keyof typeof colorClasses]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-10 h-10" />
                    </div>

                    {/* Step Number */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>

                    {/* Content */}
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 px-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed px-2">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <Link
              to="/products"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center group shadow-lg"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Interior Works Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 via-blue-50 to-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl hidden sm:block"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl hidden sm:block"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block"
            >
              <span className="text-blue-600 font-semibold text-xs sm:text-sm uppercase tracking-wide mb-2 block">
                Interior Design Services
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4"
            >
              Our Interior Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4"
            >
              Transform your space with our professional interior design solutions
            </motion.p>
          </div>

          {loadingCategories ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading interior categories...</p>
            </div>
          ) : interiorCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {interiorCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Link to="/interior-design" className="block h-full">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 h-full border border-gray-100">
                      {/* Image/Thumbnail */}
                      <div className="relative h-36 sm:h-40 md:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <HomeIcon className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors duration-200">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-1">
                          {category.subcategories.length} {category.subcategories.length === 1 ? 'Design' : 'Designs'}
                        </p>
                        <div className="flex items-center text-blue-600 font-semibold text-xs sm:text-sm group-hover:translate-x-1 transition-transform duration-200 mt-3">
                          View Gallery
                          <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No interior categories available.</p>
            </div>
          )}

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-8 sm:mt-12 lg:mt-16"
          >
            <Link
              to="/interior-design"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 sm:px-10 sm:py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 font-bold text-sm sm:text-base md:text-lg inline-flex items-center group"
            >
              Explore All Interior Works
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Recent Products Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4"
            >
              Recent Products
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4"
            >
              Check out our latest arrivals for your home.
            </motion.p>
          </div>

          {recentProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {recentProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer hover:-translate-y-2"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                      New
                    </div>
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                      <Link
                        to={`/products/${product.id}`}
                        className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {product.title}
                    </h3>
                    {product.price && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-600">₹{product.price}</span>
                        {product.actualPrice && product.actualPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">₹{product.actualPrice}</span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (product.price) {
                            addToCart({
                              id: product.id,
                              name: product.title,
                              price: product.price,
                              image: product.image
                            });
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Cart
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (product.price) {
                            addToCart({
                              id: product.id,
                              name: product.title,
                              price: product.price,
                              image: product.image
                            });
                            navigate('/checkout');
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                      >
                        <Zap className="w-4 h-4" />
                        Buy
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg">
              No recent products available.
            </p>
          )}

          {/* Show "View All" if more than 6 */}
          {products.length > 6 && (
            <div className="text-center mt-8 sm:mt-12 lg:mt-16">
              <Link
                to="/products"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 sm:px-10 sm:py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 font-bold text-sm sm:text-base md:text-lg inline-flex items-center group"
              >
                View All Products
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section (Above Footer) */}
      <section className="py-12 sm:py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-4 sm:p-6"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;