import React, { useState } from "react";
import { Plus, Trash, Edit, Check, X, ShieldAlert, Star, Sparkles, Smile } from "lucide-react";

export interface FoodMemoryItem {
  id: string;
  name: string;
  notes: string;
  user: "Rhon" | "Suz";
  type: "like" | "dislike";
}

interface LikesDislikesCardProps {
  memoryItems: FoodMemoryItem[];
  onAddMemory: (name: string, notes: string, user: "Rhon" | "Suz", type: "like" | "dislike") => void;
  onEditMemory: (id: string, name: string, notes: string) => void;
  onDeleteMemory: (id: string) => void;
}

export default function LikesDislikesCard({
  memoryItems,
  onAddMemory,
  onEditMemory,
  onDeleteMemory
}: LikesDislikesCardProps) {
  // Current filtering context inside the card
  const [activeTab, setActiveTab] = useState<"Rhon" | "Suz">("Rhon");
  const [activeType, setActiveType] = useState<"like" | "dislike">("like");

  // State for adding
  const [newItemName, setNewItemName] = useState("");
  const [newItemNotes, setNewItemNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // State for editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingNotes, setEditingNotes] = useState("");

  const filteredItems = memoryItems.filter(
    (item) => item.user === activeTab && item.type === activeType
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddMemory(newItemName.trim(), newItemNotes.trim(), activeTab, activeType);
    setNewItemName("");
    setNewItemNotes("");
    setIsAdding(false);
  };

  const startEdit = (item: FoodMemoryItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
    setEditingNotes(item.notes);
  };

  const saveEdit = (id: string) => {
    if (!editingName.trim()) return;
    onEditMemory(id, editingName.trim(), editingNotes.trim());
    setEditingId(null);
  };

  return (
    <div id="likes-dislikes-root" className="space-y-4 font-sans">
      
      {/* Tab Switchers for Rhonda vs Susan */}
      <div className="flex border-b border-slate-150 pb-1.5 gap-2 justify-between items-center flex-wrap">
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("Rhon")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
              activeTab === "Rhon" ? "bg-slate-900 text-white shadow-xs" : "text-slate-505 hover:text-slate-800"
            }`}
          >
            Rhonda's Memory
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("Suz")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
              activeTab === "Suz" ? "bg-slate-900 text-white shadow-xs" : "text-slate-505 hover:text-slate-800"
            }`}
          >
            Susan's Memory
          </button>
        </div>

        {/* Toggle likes vs dislikes */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveType("like")}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
              activeType === "like" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            ⭐ Likes
          </button>
          <button
            type="button"
            onClick={() => setActiveType("dislike")}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
              activeType === "dislike" ? "bg-white text-rose-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            ❌ Dislikes
          </button>
        </div>
      </div>

      {/* Button to show add form */}
      {!isAdding ? (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-250 hover:border-slate-400 rounded-xl text-[11px] font-black tracking-tight text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1 cursor-pointer transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Add Food to {activeTab === "Rhon" ? "Rhonda" : "Susan's"}{" "}
          {activeType === "like" ? "Likes" : "Dislikes"}
        </button>
      ) : (
        <form onSubmit={handleCreate} className="p-4 bg-slate-50 border border-slate-205 rounded-2.5xl space-y-3.5 animate-fade-in text-xs font-medium">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono">Food Item Name</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="E.g., Banana Oatmeal, Salmon skin, Broccoli"
                className="w-full bg-white border border-slate-250 focus:border-slate-500 focus:ring-1 focus:ring-slate-300 rounded-xl px-2.5 py-1.5 outline-none transition font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono">Feedback Notes</label>
              <input
                type="text"
                value={newItemNotes}
                onChange={(e) => setNewItemNotes(e.target.value)}
                placeholder="E.g., makes Vyvanse crash lighter, Susan loves"
                className="w-full bg-white border border-slate-250 focus:border-slate-500 focus:ring-1 focus:ring-slate-300 rounded-xl px-2.5 py-1.5 outline-none transition font-semibold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1 bg-slate-900 text-white font-black rounded-lg"
            >
              Add Item
            </button>
          </div>
        </form>
      )}

      {/* Render list */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center text-slate-450 text-xs italic">
            No memories recorded. Bliss will learn these automatically based on meal plans!
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-white border border-slate-150 rounded-xl flex items-center justify-between gap-4 shadow-2xs hover:border-slate-300 transition"
            >
              {editingId === item.id ? (
                <div className="flex-1 space-y-2 text-xs">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-lg outline-none font-bold"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-2 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-lg outline-none"
                      value={editingNotes}
                      placeholder="Add notes"
                      onChange={(e) => setEditingNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 px-2.5 border rounded-lg bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-500"
                    >
                      X
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEdit(item.id)}
                      className="p-1 px-2.5 rounded-lg bg-emerald-900 text-white text-[10px] font-black"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black ${activeType === "like" ? "text-emerald-800" : "text-rose-800"}`}>
                        {activeType === "like" ? "★" : "✦"} {item.name}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-slate-500 italic">
                        Notes: {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="p-1.5 bg-slate-50 hover:bg-stone-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
                      title="Edit note details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMemory(item.id)}
                      className="p-1.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-lg text-slate-400 hover:text-rose-720 cursor-pointer"
                      title="Delete food record"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
