import React, { useState, useEffect } from "react";
import { GripVertical, Save, Eye, Power } from "lucide-react";
import toast from "react-hot-toast";

export default function HomepageBuilderAdmin() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_AWS_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    fetch(`${API_BASE}/cms/homepage_layout`)
      .then(res => res.json())
      .then(data => {
        setSections(data.sections || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index - 1];
    newSections[index - 1] = temp;
    setSections(newSections);
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + 1];
    newSections[index + 1] = temp;
    setSections(newSections);
  };

  const toggleVisibility = (index: number) => {
    const newSections = [...sections];
    newSections[index].visible = !newSections[index].visible;
    setSections(newSections);
  };

  const saveLayout = () => {
    fetch(`${API_BASE}/cms/homepage_layout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections })
    })
      .then(res => res.json())
      .then(data => {
        if(data.success) toast.success("Homepage layout saved successfully!");
      });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Homepage Builder</h1>
        <button onClick={saveLayout} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
          <Save size={16} /> Publish Changes
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <p className="text-gray-500 mb-6 text-sm">Reorder sections using the up/down arrows or toggle visibility. Changes will reflect instantly on the frontend upon publishing.</p>
        
        {loading ? (
          <div>Loading layout...</div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, idx) => (
              <div key={section.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <GripVertical className="text-gray-400 cursor-grab" />
                  <span className="font-semibold text-gray-800">{section.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleVisibility(idx)} className={`px-3 py-1 text-xs font-bold rounded-full ${section.visible ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {section.visible ? 'VISIBLE' : 'HIDDEN'}
                  </button>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleMoveUp(idx)} disabled={idx === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">▲</button>
                    <button onClick={() => handleMoveDown(idx)} disabled={idx === sections.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">▼</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
