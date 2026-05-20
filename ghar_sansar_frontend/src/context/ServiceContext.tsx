// src/context/ServiceContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import mockServices from "../data/services.json";

export interface Service {
  id: string;                  // backend id
  title: string;
  description: string;
  price: string | number;
  actual_price?: number;
  image: string;               // full URL for display
  category_name: string;
  subcategory_name: string;
  features?: string[];
}

interface ServiceContextType {
  services: Service[];
  addService: (service: Omit<Service, "id" | "image"> & { image?: File }) => Promise<void>;
  updateService: (service: Service, updated: Partial<Service>) => Promise<void>;
  deleteService: (service: Service) => Promise<void>;
  refreshServices: (categoryType?: string) => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_AWS_API_URL || "https://lx70r6zsef.execute-api.ap-south-1.amazonaws.com/prod/api";

// ✅ Normalize image URL
const fixImageUrl = (url: string | undefined) => {
  if (!url) return "";
  return url
    .replace(/^https(?!:\/\/)/, "https://")
    .replace(/\s/g, "%20")
    .replace(/([^:]\/)\/+/g, "$1");
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) throw new Error("useServices must be used within ServiceProvider");
  return context;
};

export const ServiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);

  // ✅ Fetch services
  const fetchServices = async (categoryType: string = "services") => {
    try {
      console.log("Loading services from local JSON mock data");
      // Handle possible default export or direct array
      const rawData = (mockServices as any).default || mockServices;
      const categories = Array.isArray(rawData) ? rawData : [];
      console.log("Services categories found:", categories.length);

      const allServices: Service[] = [];

      categories.forEach((category: any) => {
        category.subcategories?.forEach((sub: any) => {
          // Try 'services' as well as 'products' and 'images'
          const items = sub.services || sub.products || sub.images || [];
          items.forEach((item: any, index: number) => {
            allServices.push({
              id: item.id || `${category.name || category.category}-${sub.name}-${index}`,
              title: item.title || item.name || "Untitled",
              description: item.description || "No description",
              price: item.price || "Custom Pricing",
              actual_price: item.actual_price || 0,
              image: fixImageUrl(item.image),
              category_name: category.name || category.category || "General",
              subcategory_name: sub.name,
              features: item.features || [],
            });
          });
        });
      });

      console.log("Total services found:", allServices.length);
      setServices(allServices);
    } catch (err) {
      console.error("❌ Error fetching services:", err);
      // Fallback to empty if it fails to prevent crash
      setServices([]);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // ✅ Add service
  const addService = async (
    service: Omit<Service, "id" | "image"> & { image?: File }
  ) => {
    try {
      const formData = new FormData();
      formData.append("category_type", "services");
      formData.append("category_name", service.category_name);
      formData.append("subcategory_name", service.subcategory_name);
      formData.append("title", service.title);
      formData.append("description", service.description);

      // ✅ Force integer conversion
      formData.append("price", parseInt(service.price.toString(), 10).toString());
      if (service.actual_price !== undefined) {
        formData.append("actual_price", parseInt(service.actual_price.toString(), 10).toString());
      }

      service.features?.forEach((f) => formData.append("features", f));
      if (service.image) {
        formData.append("image", service.image, service.image.name.replace(/\s/g, "-"));
      }

      await axios.post(`${API_BASE}/storage/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchServices();
    } catch (err) {
      console.error("❌ Error adding service:", err);
    }
  };

  // ✅ Update service
  const updateService = async (service: Service, updated: Partial<Service>) => {
    try {
      const payload = new URLSearchParams();
      payload.append("category_name", service.category_name);
      payload.append("subcategory_name", service.subcategory_name);
      payload.append("id", service.id);

      if (updated.title) payload.append("title", updated.title);
      if (updated.description) payload.append("description", updated.description);
      if (updated.price !== undefined) {
        payload.append("price", parseInt(updated.price.toString(), 10).toString());
      }
      if (updated.actual_price !== undefined) {
        payload.append("actual_price", parseInt(updated.actual_price.toString(), 10).toString());
      }
      updated.features?.forEach((f) => payload.append("features", f));

      await axios.put(`${API_BASE}/storage/upload/services`, payload, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      await fetchServices();
    } catch (err) {
      console.error("❌ Error updating service:", err);
    }
  };

  // ✅ Delete service
  const deleteService = async (service: Service) => {
    try {
      const params = new URLSearchParams({
        category_name: service.category_name,
        subcategory_name: service.subcategory_name,
        id: service.id,
      });

      await axios.delete(`${API_BASE}/storage/uploads/services?${params.toString()}`);
      setServices((prev) => prev.filter((s) => s.id !== service.id));
    } catch (err) {
      console.error("❌ Error deleting service:", err);
    }
  };

  const refreshServices = async (categoryType: string = "services") => {
    await fetchServices(categoryType);
  };

  return (
    <ServiceContext.Provider
      value={{ services, addService, updateService, deleteService, refreshServices }}
    >
      {children}
    </ServiceContext.Provider>
  );
};
