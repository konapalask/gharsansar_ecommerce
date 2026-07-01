import React, { useState, useEffect } from "react";
import { Plus, Image as ImageIcon, Upload, Save, X, Eye } from "lucide-react";
import toast from "react-hot-toast";

export default function BannersAdmin() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add more sophisticated CMS banner management logic here based on requirements.
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Banner Management</h1>
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="text-lg font-bold mb-4">Add New Banner</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-sm text-gray-700 mb-2">Upload Requirements</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Recommended Resolution (Hero): 1920 × 900 px (Aspect 16:7)</li>
              <li>Recommended Resolution (Mobile): 1080 × 1350 px</li>
              <li>Max File Size: 2MB</li>
              <li>Supported Formats: JPG, PNG, WebP</li>
            </ul>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Banner Title</label>
            <input type="text" className="w-full border p-2 rounded-lg" placeholder="e.g. Summer Collection" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Banner Type</label>
            <select className="w-full border p-2 rounded-lg">
              <option>Homepage Hero</option>
              <option>Return Gift Banner</option>
              <option>Category Banner</option>
              <option>Offer Banner</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image Upload</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50">
              <Upload className="mb-2" />
              <span>Click or drag image to upload</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              <Save size={16} /> Save Banner
            </button>
            <button className="flex items-center gap-2 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">
              <Eye size={16} /> Live Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
