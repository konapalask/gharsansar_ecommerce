// src/context/InteriorContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import categoriesData from "../data/categories.json";

export interface InteriorWork {
  id: string;
  title: string;
  category: string;
  subCategory: string;
  description?: string;
  image?: string;
  videoUrl?: string; // YouTube / Instagram / direct video
}

interface InteriorContextType {
  works: InteriorWork[];
  loading: boolean;
  error: string | null;
  refreshWorks: () => Promise<void>;
}

const InteriorContext = createContext<InteriorContextType | undefined>(undefined);

export const useInterior = () => {
  const context = useContext(InteriorContext);
  if (!context) throw new Error("useInterior must be used inside InteriorProvider");
  return context;
};

const API_BASE = import.meta.env.VITE_AWS_API_URL || "https://backend.gharsansar.store/api";

// Sanitize URLs
const sanitizeUrl = (url?: string) => {
  if (!url) return "";
  url = url.trim();
  url = url.replace(/^https?:\/\/https?:\/\//, "https://");
  const httpsIndex = url.indexOf("://");
  if (httpsIndex !== -1) {
    let [prefix, path] = [url.slice(0, httpsIndex + 3), url.slice(httpsIndex + 3)];
    path = path.replace(/\/{2,}/g, "/");
    url = prefix + path;
  }
  return url;
};

interface InteriorProviderProps {
  children: ReactNode;
}

export const InteriorProvider: React.FC<InteriorProviderProps> = ({ children }) => {
  const [works, setWorks] = useState<InteriorWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorks = async () => {
    setLoading(true);
    setError(null);
    try {
      let responseData = categoriesData;
      try {
        const res = await axios.get(`${API_BASE}/storage/upload/interior`);
        if (res.data && res.data.success && res.data.data) {
          responseData = res.data.data;
        }
      } catch (e) {
        console.warn("Local backend categories fetch failed, using fallback static data:", e);
      }

             // Handle new JSON structure with data array
       const flatWorks: InteriorWork[] = [];
       const dataArr = Array.isArray(responseData) ? responseData : (responseData as any).data || [];
       
       if (dataArr && Array.isArray(dataArr)) {
         dataArr.forEach((category: any, catIndex: number) => {
           category.subcategories.forEach((sub: any, subIndex: number) => {
             // Ensure image path starts with / for proper routing
             const imagePath = sub.image 
               ? (sub.image.startsWith('/') ? sub.image : `/${sub.image}`)
               : undefined;
             
             flatWorks.push({
               id: `${catIndex}-${subIndex}`,
               title: sub.name,
               category: category.name,
               subCategory: sub.name,
               description: category.name,
               image: sanitizeUrl(imagePath),
               videoUrl: sanitizeUrl(sub.video),
             });
           });
         });
       }

      setWorks(flatWorks);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch interior works");
      setWorks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  return (
    <InteriorContext.Provider value={{ works, loading, error, refreshWorks: fetchWorks }}>
      {children}
    </InteriorContext.Provider>
  );
};
