// src/pages/admin/BlogAdmin.tsx
import React, { useState, useEffect, useRef } from "react";
import { Save, Edit3, Trash2, ImagePlus, Video } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  image: string | File;
  video?: string;
  category: string;
  subCategory: string;
  features?: string[];
}

interface Category {
  name: string;
  subcategories: { name: string }[];
}

const fixUrl = (url: string | File) => {
  if (!url) return "";
  if (url instanceof File) return URL.createObjectURL(url);
  return url.replace(/^https?:\/\/https?:\/\//, "https://").replace(/([^:]\/)\/+/g, "$1");
};

const API_BASE = import.meta.env.VITE_AWS_API_URL || "https://lx70r6zsef.execute-api.ap-south-1.amazonaws.com/prod/api";

const BlogAdmin: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "" as string | File,
    video: "",
    category: "general",
    subCategory: "general",
    features: [] as string[],
  });

  const fetchCategoriesAndBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/storage/upload/blog`);
      const data = await res.json();

      // Map the flat data array directly to BlogPost
      const blogData: BlogPost[] = (data.data || []).map((item: any) => ({
        id: item.id,
        title: item.title || "Untitled",
        description: item.description || "",
        image: "", // No image in API response
        video: item.video || "",
      }));

      setBlogs(blogData);

      // Since no categories exist, just set a default
      setCategories([{ name: "general", subcategories: [{ name: "general" }] }]);

    } catch (err) {
      console.error("Error fetching blogs:", err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndBlogs();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setForm({ ...form, image: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.image) {
      alert("Title and image are required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("category_type", "blog");
      formData.append("category_name", form.category);
      formData.append("subcategory_name", form.subCategory);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("features", form.features.join(","));
      formData.append("video", form.video || "");
      if (form.image instanceof File) formData.append("image", form.image);

      const res = await fetch(`${API_BASE}/storage/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      await fetchCategoriesAndBlogs();
      setForm({ title: "", description: "", image: "", video: "", category: categories[0]?.name || "general", subCategory: categories[0]?.subcategories[0]?.name || "general", features: [] });
      setPreview(null);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to upload blog");
    }
  };

  const handleEdit = (id: string) => {
    const blog = blogs.find((b) => b.id === id);
    if (!blog) return;
    setForm({ ...blog });
    setPreview(fixUrl(blog.image));
    setEditingId(id);
  };

  const handleDelete = async (id: string, category_name: string, subcategory_name: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(
        `${API_BASE}/storage/upload/blog?category_name=${category_name}&subcategory_name=${subcategory_name}&id=${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Delete failed");
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete blog");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin: Manage Blog</h1>

      <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded-md">
        <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border p-2 w-full" />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border p-2 w-full" />

        <div className="flex space-x-2">
          <div className="flex-1">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: categories.find((c) => c.name === e.target.value)?.subcategories[0]?.name || "" })} className="border p-2 w-full">
              {categories.map((cat) => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label>Subcategory</label>
            <select value={form.subCategory} onChange={(e) => setForm({ ...form, subCategory: e.target.value })} className="border p-2 w-full">
              {categories.find((c) => c.name === form.category)?.subcategories.map((sub) => <option key={sub.name} value={sub.name}>{sub.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label>Video URL (optional)</label>
          <input type="text" value={form.video} onChange={(e) => setForm({ ...form, video: e.target.value })} className="border p-2 w-full" />
        </div>

        <div>
          <label>Blog Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && <img src={preview} alt="Preview" className="w-full h-64 object-contain mt-2" />}
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
          {editingId ? <><Save className="w-4 h-4 mr-2" /> Update Blog</> : <><ImagePlus className="w-4 h-4 mr-2" /> Add Blog</>}
        </button>
      </form>

      <h2 className="text-xl font-semibold mt-6">Existing Blogs</h2>
      {loading ? <p>Loading...</p> : blogs.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {blogs.map((b) => (
            <div key={b.id} className="border rounded p-3 shadow-sm">
              {b.video && <video src={b.video} controls className="w-full h-64 object-cover rounded mb-2" />}
              {!b.video && <img src={fixUrl(b.image)} alt={b.title} className="w-full h-64 object-cover rounded mb-2" />}
              <h3 className="font-bold">{b.title}</h3>
              <p className="text-gray-600 text-sm">{b.description}</p>
              <p className="text-gray-500 text-xs">Category: {b.category} / {b.subCategory}</p>
              <div className="flex space-x-2 mt-2">
                <button onClick={() => handleEdit(b.id)} className="bg-yellow-500 text-white px-2 py-1 rounded flex items-center"><Edit3 className="w-4 h-4 mr-1" /> Edit</button>
                <button onClick={() => handleDelete(b.id, b.category, b.subCategory)} className="bg-red-500 text-white px-2 py-1 rounded flex items-center"><Trash2 className="w-4 h-4 mr-1" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : <p>No blogs found.</p>}
    </div>
  );
};

export default BlogAdmin;
