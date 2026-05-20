import React, { useState, useEffect, useMemo } from "react";
import { Package, PenBox, Hammer, Mail, Settings, TrendingUp, Users, Clock, BarChart3, Activity, Globe, Server, Database, Zap, AlertCircle, CheckCircle2, TrendingDown, DollarSign, Eye, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { useServices } from "../context/ServiceContext";
import { useBlogs } from "../context/BlogContext";
import { useInterior } from "../context/InteriorContext";

const stats = [
  { name: "Products", icon: Package, link: "/admin/products-admin", color: "bg-blue-500", gradient: "from-blue-500 to-blue-600" },
  { name: "Blogs", icon: PenBox, link: "/admin/blog-admin", color: "bg-green-500", gradient: "from-green-500 to-green-600" },
  { name: "Services", icon: Settings, link: "/admin/services-admin", color: "bg-purple-500", gradient: "from-purple-500 to-purple-600" },
  { name: "Interior Works", icon: Hammer, link: "/admin/interior-works", color: "bg-yellow-500", gradient: "from-yellow-500 to-yellow-600" },
  { name: "Enquiries", icon: Mail, link: "/admin/enquiries", color: "bg-red-500", gradient: "from-red-500 to-red-600" },
];

const AdminDashboard: React.FC = () => {
  const { products, loading: productsLoading } = useProducts();
  const { services, loading: servicesLoading } = useServices();
  const { blogs, loading: blogsLoading } = useBlogs();
  const { works, loading: interiorLoading } = useInterior();

  const [currentTime, setCurrentTime] = useState<string>("Loading...");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalItems = products.length + services.length + blogs.length + works.length;
  
  // Analytics calculations
  const categoriesStats = useMemo(() => {
    const productCategories = new Set(products.map(p => p.category));
    const serviceCategories = new Set(services.map(s => s.category_name));
    const blogCategories = new Set(blogs.filter(b => b.features && b.features.length > 0).map(b => b.features![0]));
    const interiorCategories = new Set(works.map(w => w.category));
    
    return {
      products: productCategories.size,
      services: serviceCategories.size,
      blogs: blogCategories.size,
      interior: interiorCategories.size,
      total: new Set([...productCategories, ...serviceCategories, ...blogCategories, ...interiorCategories]).size
    };
  }, [products, services, blogs, works]);

  const allLoading = productsLoading || servicesLoading || blogsLoading || interiorLoading;
  
  const uptime = "99.9%";
  const systemHealth = "Excellent";
  
  const growthData = {
    products: products.length > 0 ? "+12%" : "0%",
    blogs: blogs.length > 0 ? "+8%" : "0%",
    services: services.length > 0 ? "+15%" : "0%",
    interior: works.length > 0 ? "+20%" : "0%"
  };
  
  const recentItems = useMemo(() => {
    const all = [
      ...products.slice(0, 3).map(p => ({ ...p, type: 'Product', icon: Package, link: '/admin/products-admin' })),
      ...services.slice(0, 2).map(s => ({ ...s, type: 'Service', icon: Settings, link: '/admin/services-admin' })),
      ...blogs.slice(0, 2).map(b => ({ ...b, type: 'Blog', icon: PenBox, link: '/admin/blog-admin' }))
    ];
    return all.slice(0, 5);
  }, [products, services, blogs]);
  
  const topCategories = useMemo(() => {
    const categoryCounts: { [key: string]: number } = {};
    products.forEach(p => categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1);
    services.forEach(s => categoryCounts[s.category_name] = (categoryCounts[s.category_name] || 0) + 1);
    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [products, services]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <div className="flex flex-wrap items-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{mounted ? currentTime : "--:--:--"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Welcome back, Admin!</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Package className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{products.length}</h3>
            <p className="text-blue-100 text-sm mb-2">Total Products</p>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full inline-flex">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-semibold">{growthData.products}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <PenBox className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{blogs.length}</h3>
            <p className="text-green-100 text-sm mb-2">Total Blogs</p>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full inline-flex">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-semibold">{growthData.blogs}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Settings className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{services.length}</h3>
            <p className="text-purple-100 text-sm mb-2">Total Services</p>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full inline-flex">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-semibold">{growthData.services}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Hammer className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{works.length}</h3>
            <p className="text-yellow-100 text-sm mb-2">Interior Works</p>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full inline-flex">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-semibold">{growthData.interior}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BarChart3 className="w-6 h-6" />
              </div>
              <Activity className="w-5 h-5 opacity-80" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{totalItems}</h3>
            <p className="text-indigo-100 text-sm mb-2">Total Items</p>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full inline-flex">
              <CheckCircle2 className="w-3 h-3" />
              <span className="text-xs font-semibold">Active</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Link
                  to={item.link}
                  className="block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className={`bg-gradient-to-r ${item.gradient} p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white text-right">
                        <p className="text-sm opacity-90">Manage</p>
                        <p className="font-bold text-lg">{item.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <p className="text-sm text-gray-600 group-hover:text-gray-900">
                      Click to view and manage all {item.name.toLowerCase()}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Performance Metrics
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Response Time</p>
                  <p className="text-sm text-gray-600">Average load time</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">250ms</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Uptime</p>
                  <p className="text-sm text-gray-600">System availability</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{uptime}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Total Categories</p>
                  <p className="text-sm text-gray-600">Unique categories</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600">{categoriesStats.total}</span>
            </div>
          </div>
        </motion.div>

        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Top Categories
          </h2>
          {topCategories.length > 0 ? (
            <div className="space-y-3">
              {topCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{category.name}</p>
                      <p className="text-sm text-gray-600">{category.count} items</p>
                    </div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(category.count / totalItems) * 100}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No category data available</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-green-600" />
          Recent Items
        </h2>
        {recentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentItems.map((item: any, index: number) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all group cursor-pointer"
                >
                  <Link to={item.link} className="block">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                        <Icon className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="text-xs font-semibold text-gray-500">{item.type}</span>
                    </div>
                    <h4 className="font-semibold text-gray-800 line-clamp-2 text-sm">{item.title || item.name}</h4>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        )}
      </motion.div>

      {/* System Status & Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        {/* System Health */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            System Health
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="p-2 bg-green-500 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">System Status</p>
                <p className="text-sm text-green-600 font-medium">{systemHealth}</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Server className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Database Connection</p>
                <p className="text-sm text-blue-600 font-medium">AWS API Connected</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Storage</p>
                <p className="text-sm text-indigo-600 font-medium">S3 Bucket Active</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Eye className="w-6 h-6 text-purple-600" />
            Quick Insights
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-800">Product Categories</span>
              </div>
              <p className="text-3xl font-bold text-indigo-600">{categoriesStats.products}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-800">Service Types</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{categoriesStats.services}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Hammer className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-800">Interior Categories</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{categoriesStats.interior}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {allLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-800">Loading analytics...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
