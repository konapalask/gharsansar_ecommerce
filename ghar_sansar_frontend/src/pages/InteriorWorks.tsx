// src/pages/InteriorWorks.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import categoriesData from "../data/categories.json";

interface InteriorWork {
  id: string;
  title: string;
  description: string;
  image?: string;
  category: string;
  subCategory: string;
}

// src/pages/InteriorWorks.tsx

const ITEMS_PER_PAGE = 9; // adjust per your layout (3x3 grid etc.)

const InteriorWorks: React.FC = () => {
  const [works, setWorks] = useState<InteriorWork[]>([]);
  const [loading, setLoading] = useState(true);

  // get ?page= from URL
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        setLoading(true);
        // AWS Endpoint Expired, using local data
        const responseData = categoriesData;

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
                description: category.name,
                image: imagePath,
                category: category.name,
                subCategory: sub.name,
              });
            });
          });
        }

        setWorks(flatWorks);
      } catch (err) {
        console.error("Failed to load interior works:", err);
        setWorks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, []);

  // update URL whenever page changes
  useEffect(() => {
    setSearchParams({ page: String(currentPage) });
  }, [currentPage, setSearchParams]);

  // pagination logic
  const totalPages = Math.ceil(works.length / ITEMS_PER_PAGE);
  const paginatedWorks = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return works.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [works, currentPage]);

  if (loading) return <div className="p-6 text-gray-500">Loading interior works...</div>;
  if (!works.length) return <div className="p-6 text-gray-500">No interior works found.</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Interior Works</h1>

      {/* Works Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paginatedWorks.map((work) => (
          <div
            key={work.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg"
          >
            {work.image && (
              <img
                src={work.image}
                alt={work.title}
                className="w-full h-48 object-cover rounded mb-3"
              />
            )}
            <h2 className="text-xl font-semibold">{work.title}</h2>
            <p className="text-gray-500 text-sm">
              {work.category} → {work.subCategory}
            </p>
            <p className="text-gray-600 mt-1">{work.description}</p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="flex justify-center mt-10 space-x-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-200"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded border ${currentPage === page
                ? "bg-red-600 text-white border-red-600"
                : "hover:bg-gray-200"
                }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-200"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
};

export default InteriorWorks;
