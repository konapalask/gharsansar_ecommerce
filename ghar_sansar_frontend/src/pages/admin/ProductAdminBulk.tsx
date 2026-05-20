// src/pages/admin/ProductAdminBulk.tsx
import React, { useState, useEffect } from "react";
import { useProducts } from "../../context/ProductContext";

export interface Product {
  id: string;
  name: string;
  category?: string;
  subCategory?: string;
  price?: number;
  description?: string;
  image?: string;
}

const BULK_ROWS = 100; // Number of rows displayed

const ProductAdminBulk: React.FC = () => {
  const { products, addProduct } = useProducts();
  const [rows, setRows] = useState<Product[]>(
    Array.from({ length: BULK_ROWS }, () => ({ id: "", name: "", price: 0 }))
  );

  useEffect(() => {
    // Load saved products from localStorage
    const saved = localStorage.getItem("products");
    if (saved) {
      const parsed: Product[] = JSON.parse(saved);
      parsed.forEach((p) => addProduct(p));
    }
  }, []);

  const handleChange = (index: number, field: keyof Product, value: any) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleSubmit = () => {
    rows.forEach((p) => {
      if (p.name.trim()) {
        addProduct({ ...p, id: Date.now().toString() + Math.random() });
      }
    });
    // Reset rows after submit
    setRows(Array.from({ length: BULK_ROWS }, () => ({ id: "", name: "", price: 0 })));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Bulk Product Upload</h1>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">#</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">SubCategory</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Image URL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="border p-2 text-center">{idx + 1}</td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => handleChange(idx, "name", e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={row.category || ""}
                    onChange={(e) => handleChange(idx, "category", e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={row.subCategory || ""}
                    onChange={(e) => handleChange(idx, "subCategory", e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={row.price || ""}
                    onChange={(e) => handleChange(idx, "price", Number(e.target.value))}
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={row.description || ""}
                    onChange={(e) => handleChange(idx, "description", e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={row.image || ""}
                    onChange={(e) => handleChange(idx, "image", e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit All Products
        </button>
      </div>
    </div>
  );
};

export default ProductAdminBulk;
