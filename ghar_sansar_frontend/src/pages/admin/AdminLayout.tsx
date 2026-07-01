import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Settings, PenBox, Hammer, Mail, LogOut, User, Home, MessageSquare, Gift } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen flex-col sm:flex-row bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full sm:w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-2xl">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Admin Panel</h2>
          </div>
          {user && (
            <div className="flex items-center gap-2 text-sm bg-gray-800/50 rounded-lg p-2">
              <User className="w-4 h-4" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 overflow-y-auto">
          <nav className="space-y-2">
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/admin")
                  ? "bg-blue-600 text-white shadow-lg"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <LayoutDashboard size={20} /> <span className="font-semibold">Dashboard</span>
            </Link>
            <Link
              to="/admin/products-admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/admin/products-admin")
                  ? "bg-blue-600 text-white shadow-lg"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Package size={20} /> <span className="font-semibold">Products Admin</span>
            </Link>
            <Link
              to="/admin/services-admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/admin/services-admin")
                  ? "bg-blue-600 text-white shadow-lg"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Settings size={20} /> <span className="font-semibold">Services Admin</span>
            </Link>
            <Link
              to="/admin/blog-admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/admin/blog-admin")
                  ? "bg-blue-600 text-white shadow-lg"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <PenBox size={20} /> <span className="font-semibold">Blog Admin</span>
            </Link>
            <Link
              to="/admin/interior-works"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/admin/interior-works")
                  ? "bg-blue-600 text-white shadow-lg"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Hammer size={20} /> <span className="font-semibold">Interior Works</span>
            </Link>
            <Link
              to="/admin/orders"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/admin/orders")
                  ? "bg-blue-600 text-white shadow-lg"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Package size={20} /> <span className="font-semibold">Manage Orders</span>
            </Link>
            <Link
              to="/admin/chats"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/admin/chats")
                  ? "bg-blue-600 text-white shadow-lg"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <MessageSquare size={20} /> <span className="font-semibold">Customer Chats</span>
            </Link>
            <Link
              to="/admin/return-gifts"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/admin/return-gifts")
                  ? "bg-blue-600 text-white shadow-lg"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Gift size={20} /> <span className="font-semibold">Return Gifts</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300 transition-all"
          >
            <Home size={20} /> <span className="font-semibold">Back to Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all font-semibold"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        {/* Watermark Logo */}
        <div className="pointer-events-none fixed sm:left-64 left-0 top-0 bottom-0 flex justify-center items-center w-full sm:w-[calc(100vw-16rem)] h-screen z-0">
          <img
            src="/ghar sansar logo.svg"
            alt="Ghar Sansar Logo Watermark"
            className="w-1/2 max-w-xl opacity-5"
            style={{
              minWidth: '320px',
              objectFit: 'contain',
              filter: "none",
            }}
          />
        </div>
        {/* Content */}
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
