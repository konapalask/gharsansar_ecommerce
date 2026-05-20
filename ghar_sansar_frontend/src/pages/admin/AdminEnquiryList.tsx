import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";

type Enquiry = {
  id: string;
  subcategory: string;
  image?: string;
  name: string;
  email: string;
  phone: string;
  propertyName?: string;
  date: string;
};

const placeholderImage = "/images/placeholder.jpg";
const ENTRIES_PER_PAGE = 10;

const AdminEnquiryList: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("enquiries") || "[]");
    setEnquiries(data);
    setLoading(false);
  }, []);

  const totalPages = Math.ceil(enquiries.length / ENTRIES_PER_PAGE);

  // Slice data for current page
  const shownEnquiries = enquiries.slice(
    (currentPage - 1) * ENTRIES_PER_PAGE,
    currentPage * ENTRIES_PER_PAGE
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        All Enquiries{" "}
        <span className="text-base font-normal text-gray-500">
          ({enquiries.length})
        </span>
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 border-b">#</th>
              <th className="py-2 px-3 border-b">Name</th>
              <th className="py-2 px-3 border-b">Email</th>
              <th className="py-2 px-3 border-b">Phone</th>
              <th className="py-2 px-3 border-b">Property Name</th>
              <th className="py-2 px-3 border-b">Image</th>
              <th className="py-2 px-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  Loading enquiries...
                </td>
              </tr>
            ) : shownEnquiries.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No enquiries found.
                </td>
              </tr>
            ) : (
              shownEnquiries.map((enquiry, idx) => (
                <tr key={enquiry.id || idx} className="hover:bg-gray-50">
                  <td className="py-2 px-3 border-b">
                    {(currentPage - 1) * ENTRIES_PER_PAGE + idx + 1}
                  </td>
                  <td className="py-2 px-3 border-b">{enquiry.name}</td>
                  <td className="py-2 px-3 border-b">{enquiry.email}</td>
                  <td className="py-2 px-3 border-b">{enquiry.phone}</td>
                  <td className="py-2 px-3 border-b">{enquiry.propertyName || "-"}</td>
                  <td className="py-2 px-3 border-b">
                    <img
                      src={enquiry.image || placeholderImage}
                      alt={enquiry.subcategory}
                      className="w-20 h-14 object-cover rounded border cursor-pointer"
                      onClick={() => setPreviewImage(enquiry.image || placeholderImage)}
                      onError={(e) => (e.currentTarget.src = placeholderImage)}
                    />
                  </td>
                  <td className="py-2 px-3 border-b text-center">
                    <button
                      onClick={() => setSelectedEnquiry(enquiry)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label="View Details"
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="flex justify-center mt-8 space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`mx-1 px-4 py-2 rounded border ${
                currentPage === page
                  ? "bg-red-600 text-white border-red-600"
                  : "hover:bg-gray-200 border-gray-300 text-gray-700"
              }`}
            >
              {page}
            </button>
          ))}
        </nav>
      )}

      {/* Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-4 text-2xl font-bold text-gray-500 hover:text-red-600"
              onClick={() => setSelectedEnquiry(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Enquiry Details</h2>
            <div className="mb-4 flex flex-col items-center">
              <img
                src={selectedEnquiry.image || placeholderImage}
                alt={selectedEnquiry.subcategory}
                className="w-32 h-32 object-cover rounded border mb-4"
                onError={(e) => (e.currentTarget.src = placeholderImage)}
              />
              <div className="text-left w-full">
                <p>
                  <strong>Name:</strong> {selectedEnquiry.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedEnquiry.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedEnquiry.phone}
                </p>
                <p>
                  <strong>Property Name:</strong> {selectedEnquiry.propertyName || "-"}
                </p>
                <p>
                  <strong>Design:</strong> {selectedEnquiry.subcategory}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedEnquiry.date).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="relative">
            <button
              className="absolute top-2 right-2 text-3xl text-white font-bold z-10"
              onClick={() => setPreviewImage(null)}
              aria-label="Close"
            >
              ×
            </button>
            <img
              src={previewImage}
              alt="Enquiry"
              className="max-w-[90vw] max-h-[80vh] rounded shadow-lg border bg-white"
              style={{ display: "block", margin: "auto" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnquiryList;
