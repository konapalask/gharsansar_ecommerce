// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ProductProvider } from "./context/ProductContext";
import { BlogProvider } from "./context/BlogContext";
import { ServiceProvider } from "./context/ServiceContext";
import { InteriorProvider } from "./context/InteriorContext";
import { PaymentProvider } from "./context/PaymentContext";
import { OrderProvider } from "./context/OrderContext";

import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import InteriorDesignPage from "./pages/InteriorDesignPage";
import InteriorWorks from "./pages/InteriorWorks";

// ✅ Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
// import AdminEnquiryList from "./pages/admin/AdminEnquiryList";
import BlogAdmin from "./pages/admin/BlogAdmin";
import ServicesAdmin from "./pages/admin/ServicesAdmin";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import ProductAdminBulk from "./pages/admin/ProductAdminBulk";
import InteriorWorksAdmin from "./pages/admin/InteriorWorksAdmin";
import OrdersAdmin from "./pages/admin/OrdersAdmin";

import ChatBot from "./components/ChatBot/ChatBot";

// ✅ Updated product pages
import ProductsPage from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductProvider>
          <BlogProvider>
            <ServiceProvider>
              <InteriorProvider>
                <PaymentProvider>
                  <OrderProvider>
                    <BrowserRouter>
                      <ScrollToTop />
                      <div className="min-h-screen bg-gray-50">
                        <Header />
                        <main className="pt-20">
                          <Routes>
                        {/* ---------- Public routes ---------- */}
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:id" element={<BlogPost />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/cart" element={<Cart />} />

                        {/* Public Interior Design page */}
                        <Route path="/interior-design" element={<InteriorDesignPage />} />

                        {/* ---------- Protected routes ---------- */}
                        <Route
                          path="/checkout"
                          element={
                            <ProtectedRoute>
                              <Checkout />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/interior-works"
                          element={
                            <ProtectedRoute>
                              <InteriorWorks />
                            </ProtectedRoute>
                          }
                        />

                        {/* ---------- Admin protected routes ---------- */}
                        <Route
                          path="/admin/*"
                          element={
                            <ProtectedRoute role="admin">
                              <AdminLayout />
                            </ProtectedRoute>
                          }
                        >
                          <Route index element={<AdminDashboard />} />
                          <Route path="blog-admin" element={<BlogAdmin />} />
                          {/* <Route path="enquiries" element={<AdminEnquiryList />} /> */}
                          <Route path="services-admin" element={<ServicesAdmin />} />
                          <Route path="products-admin" element={<ProductsAdmin />} />
                          <Route path="products-bulk" element={<ProductAdminBulk />} />
                          <Route path="interior-works" element={<InteriorWorksAdmin />} />
                          <Route path="orders" element={<OrdersAdmin />} />
                        </Route>
                      </Routes>
                    </main>
                    <Footer />
                    <ChatBot />
                  </div>
                </BrowserRouter>
                  </OrderProvider>
                </PaymentProvider>
              </InteriorProvider>
            </ServiceProvider>
          </BlogProvider>
        </ProductProvider>
      </CartProvider>
    </AuthProvider>
  );
}
