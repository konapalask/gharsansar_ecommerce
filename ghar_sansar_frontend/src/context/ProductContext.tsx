// src/context/ProductContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  actualPrice: number;
  image: string;
  video?: string;
  category: string;
  subCategory: string;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (p: Partial<Product> & { imageFile?: File }) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product> & { imageFile?: File }) => Promise<void>;
  deleteProduct: (id: string, category_type: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used within ProductProvider");
  return ctx;
};

// Fix CloudFront / URL issues
const fixImageUrl = (url: string) => {
  if (!url) return "";
  let fixed = url.replace(/^https?:\/\/https?:\/\//, "https://").replace(/([^:]\/)\/+/g, "$1");
  // Add crossorigin attribute support for CloudFront CDN
  if (fixed.includes('cloudfront.net')) {
    // Ensure proper protocol
    if (!fixed.startsWith('http')) {
      fixed = 'https:' + fixed;
    }
  }
  return fixed;
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const BACKEND_URL = import.meta.env.VITE_AWS_API_URL || "https://backend.gharsansar.store/api";
  const API_BASE = import.meta.env.VITE_AWS_API_URL || "https://lx70r6zsef.execute-api.ap-south-1.amazonaws.com/prod/api";

  // Fetch all products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching products from local backend:", `${BACKEND_URL}/products`);

      const res = await axios.get(`${BACKEND_URL}/products`);

      const data = res.data;
      const allProducts: Product[] = [];

      // Handle the new API structure or local JSON array
      const rawCategories = Array.isArray(data) ? data : (data.data || data.categories || []);
      const categories = Array.isArray(rawCategories) ? rawCategories : [];

      console.log("Categories found:", categories.length);

      categories.forEach((category: any) => {
        category.subcategories?.forEach((sub: any) => {
          // Try 'products', 'images', and 'services'
          const items = sub.products || sub.images || sub.services || [];
          items.forEach((img: any, index: number) => {
            const imageUrl = fixImageUrl(img.image);
            allProducts.push({
              id: img.id || `${category.name || category.category}-${sub.name}-${index}`,
              title: img.title || img.name || "Untitled Product",
              description: img.description || "",
              price: parseInt(img.price) || parseInt(img["act-price"]) || 0,
              actualPrice: parseInt(img["act-price"]) || parseInt(img.actual_price) || 0,
              image: imageUrl,
              video: img.video || "",
              category: category.name || category.category || "General",
              subCategory: sub.name,
            });
          });
        });
      });

      console.log("Total products found:", allProducts.length);
      setProducts(allProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add product
  const addProduct = async (p: Partial<Product> & { imageFile?: File }) => {
    try {
      const formData = new FormData();
      formData.append("category_name", p.category || "");
      formData.append("subcategory_name", p.subCategory || "");
      formData.append("title", p.title || "");
      formData.append("price", (p.price ?? 0).toString());
      formData.append("actual_price", (p.actualPrice ?? 0).toString());
      formData.append("description", p.description || "");
      if (p.video) formData.append("video", p.video);

      if (p.imageFile) {
        formData.append("image", p.imageFile, p.imageFile.name.replace(/\s/g, "-"));
      }

      await axios.post(`${BACKEND_URL}/storage/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  // Update product
  const updateProduct = async (id: string, p: Partial<Product> & { imageFile?: File }) => {
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("category_name", p.category || "");
      formData.append("subcategory_name", p.subCategory || "");
      formData.append("title", p.title || "");
      formData.append("price", Math.floor(p.price ?? 0).toString());
      formData.append("actual_price", Math.floor(p.actualPrice ?? 0).toString());
      formData.append("description", p.description || "");
      if (p.video) formData.append("video", p.video);

      if (p.imageFile) {
        formData.append("image", p.imageFile, p.imageFile.name.replace(/\s/g, "-"));
      }

      await axios.put(`${BACKEND_URL}/storage/upload/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };



  // Delete product
  const deleteProduct = async (id: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/storage/uploads/products?id=${id}`);
      setProducts((prev) => prev.filter((prod) => prod.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};
