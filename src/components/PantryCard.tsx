import React, { useState, useEffect, useRef } from "react";
import { 
  ShoppingBag, Trash2, Plus, Search, Edit2, AlertCircle, Mic, 
  Loader2, Check, Lock, Unlock, RefreshCw, Layers, Sparkles, X, Info
} from "lucide-react";
import { PantryItem } from "../types";

interface PantryCardProps {
  currentUser: "Rhon" | "Suz";
  pantryList: PantryItem[];
  setPantryList: React.Dispatch<React.SetStateAction<PantryItem[]>>;
  onBlissInteract: (text: string) => void;
  speakText: (text: string) => void;
}

export default function PantryCard({
  currentUser,
  pantryList,
  setPantryList,
  onBlissInteract,
  speakText
}: PantryCardProps) {
  const [activeTab, setActiveTab] = useState<"add-pasted" | "add-manual">("add-pasted");

  // Copy-paste text box state
  const [pastedText, setPastedText] = useState("");
  const [pastedStatus, setPastedStatus] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Normal Single Manual entry states
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [category, setCategory] = useState<"Proteins" | "Produce" | "Dairy" | "Frozen Foods" | "Grains & Starches" | "Pantry Staples" | "Snacks">("Pantry Staples");
  const [notes, setNotes] = useState("");
  const [isGF, setIsGF] = useState(true);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Voice speech states
  const [speechInput, setSpeechInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const recognitionRef = useRef<any>(null);

  // Inline editing of existing item
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState("");
  const [editCategory, setEditCategory] = useState<"Proteins" | "Produce" | "Dairy" | "Frozen Foods" | "Grains & Starches" | "Pantry Staples" | "Snacks">("Pantry Staples");

  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      recognitionRef.current = rec;
    }
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      setVoiceError("Microphone voice input is not supported in this frame. Please type or copy-paste instead!");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      setVoiceError("");
      recognitionRef.current.onresult = (e: any) => {
        const trans = e.results[0][0].transcript;
        if (trans) {
          setSpeechInput(trans);
        }
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (err: any) => {
        console.warn(err);
        setVoiceError(`Voice detection failed. Try again!`);
        setIsListening(false);
      };
      try { recognitionRef.current.start(); } catch (e) {}
    }
  };

  const handleProcessVoicePantry = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!speechInput.trim()) return;

    setIsProcessingVoice(true);
    setVoiceError("");
    try {
      const res = await fetch("/api/voice-pantry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speechText: speechInput,
          currentPantry: pantryList
        })
      });
      const data = await res.json();
      if (data.updatedPantry) {
        const mapped = data.updatedPantry.map((item: any) => {
          const oldCat = String(item.category).toLowerCase();
          let newCat = item.category;
          if (oldCat === "protein" || oldCat === "proteins") newCat = "Proteins";
          else if (oldCat === "fridge" || oldCat === "fridge/dairy" || oldCat === "dairy") newCat = "Dairy";
          else if (oldCat === "produce") newCat = "Produce";
          else if (oldCat === "freezer" || oldCat === "frozen") newCat = "Frozen Foods";
          else if (oldCat === "pantry" || oldCat === "pantry staples") newCat = "Pantry Staples";
          else if (oldCat === "snacks") newCat = "Snacks";
          else if (oldCat === "grains" || oldCat === "grains & starches") newCat = "Grains & Starches";
          else newCat = getAutoCategory(item.name);
          return { ...item, category: newCat };
        });
        setPantryList(mapped);
        localStorage.setItem("forlife_pantry_v3", JSON.stringify(mapped));
        setPastedStatus("Pantry Successfully Updated");
        setTimeout(() => setPastedStatus(""), 3500);
      }
      if (data.confirmationText) {
        onBlissInteract(data.confirmationText);
        speakText(data.confirmationText);
      }
      setSpeechInput("");
    } catch (err) {
      console.error(err);
      setVoiceError("Voice parser is temporarily unavailable. Paste raw details below to update instantly!");
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Automated smart matching categorizer
  const getAutoCategory = (itemName: string): "Proteins" | "Produce" | "Dairy" | "Frozen Foods" | "Grains & Starches" | "Pantry Staples" | "Snacks" => {
    const normalized = itemName.toLowerCase();
    if (/(chicken|beef|pork|fish|tuna|egg|tofu|protein|turkey|steak|shrimp|salmon|meat|lamb|bacon|sausage|cod|halibut|wings|lentil|beans|peanut\s*butter|nuts)/.test(normalized)) {
      return "Proteins";
    }
    if (/(spinach|lettuce|broccoli|carrot|apple|banana|berry|blueberry|strawberry|onion|garlic|lemon|lime|salad|greens|avocado|tomato|potato|cabbage|cucumber|pepper|celery|fruit|veg|kale|asparagus|mushroom)/.test(normalized)) {
      return "Produce";
    }
    if (/(milk|cheese|yogurt|butter|cream|dairy|whey|mozzarella|cheddar|parmesan|cream\s*cheese)/.test(normalized)) {
      return "Dairy";
    }
    if (/(frozen|freezer|waffles|hashbrowns|peas|corn|ice\s*cream|tot)/.test(normalized)) {
      return "Frozen Foods";
    }
    if (/(rice|pasta|oatmeal|oats|bread|grain|starch|flour|quinoa|cereal|bagel|tortilla|noodle|rice\s*cake)/.test(normalized)) {
      return "Grains & Starches";
    }
    if (/(snack|chips|cookie|cracker|popcorn|candy|chocolate|trail\s*mix|bar)/.test(normalized)) {
      return "Snacks";
    }
    return "Pantry Staples";
  };

  // Parse and Submit pasted text inventory
  const handleSubmitPastedList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;

    const lines = pastedText.split("\n");
    const newItems: PantryItem[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const match = trimmed.match(/^(\d+(?:\s*(?:cans?|packs?|boxes?|bags?|bottles?|pieces?|lbs?|kg|g|cups?|tbsps?|tsps?|jars?|cartons?|of|slices?))?)\s+(.+)$/i)
        || trimmed.match(/^(\d+)\s*(.*)$/);

      let parsedName = trimmed;
      let parsedQty = "some";

      if (match) {
        parsedQty = match[1].trim();
        parsedName = match[2].trim() || "Item";
      }

      const assignedCategory = getAutoCategory(parsedName);
      const isRhondaGF = currentUser === "Rhon";

      const newItem: PantryItem = {
        id: "pan_" + Date.now() + Math.random().toString(36).substring(2, 6),
        name: parsedName,
        qty: parsedQty,
        category: assignedCategory,
        notes: isRhondaGF ? "GF" : "",
        isGlutenFree: isRhondaGF
      };

      newItems.push(newItem);
    });

    if (newItems.length > 0) {
      // Append newly parsed items to active pantry
      const updated = [...pantryList, ...newItems];
      setPantryList(updated);
      localStorage.setItem("forlife_pantry_v3", JSON.stringify(updated));

      // Satisfy explicit requested confirmation string: "Pantry Successfully Updated"
      setPastedStatus("Pantry Successfully Updated");
      setPastedText("");

      // Notify Bliss
      const userDisplay = currentUser === "Rhon" ? "Rhonda" : "Susan";
      onBlissInteract(
        `Hey Bliss! I just pasted and submitted a new inventory list containing ${newItems.length} items to my Pantry. The system automatically processed and categorized them!`
      );

      setTimeout(() => setPastedStatus(""), 4500);
    }
  };

  // Add individual item manually
  const handleAddItemSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: PantryItem = {
      id: "pan_" + Date.now() + Math.random().toString(36).substring(2, 5),
      name: name.trim(),
      qty: qty.trim() || "some",
      category,
      notes: notes.trim(),
      isGlutenFree: isGF
    };

    const updated = [...pantryList, newItem];
    setPantryList(updated);
    localStorage.setItem("forlife_pantry_v3", JSON.stringify(updated));

    setName("");
    setQty("");
    setNotes("");
    setPastedStatus("Pantry Successfully Updated");
    setTimeout(() => setPastedStatus(""), 4000);
  };

  // Save Pantry manually
  const handleSavePantryAction = () => {
    localStorage.setItem("forlife_pantry_v3", JSON.stringify(pantryList));
    setPastedStatus("Pantry Successfully Updated");
    
    const summaryList = pantryList.map(p => `• ${p.qty} of ${p.name} (${p.category})`).join("\n");
    onBlissInteract(
      `Hey Bliss! I just clicked 'Save Pantry' to secure my current catalog. Here is my current list:\n${pantryList.length > 0 ? summaryList : "(Pantry list is empty)"}. Please remember this block for our meal suggestions!`
    );

    speakText("Pantry update saved and secured! The current stock has been synchronized with Bliss.");
    setTimeout(() => setPastedStatus(""), 4500);
  };

  // Clear Pantry entirely
  const handleClearPantryAll = () => {
    setPantryList([]);
    localStorage.setItem("forlife_pantry_v3", JSON.stringify([]));
    setShowClearConfirm(false);
    setPastedStatus("Pantry Successfully Updated");
    onBlissInteract("Hey Bliss, I just cleared out my central Pantry stock. Let's start fresh!");
    setTimeout(() => setPastedStatus(""), 4500);
  };

  // Delete individual item
  const deleteItem = (id: string) => {
    const updated = pantryList.filter(item => item.id !== id);
    setPantryList(updated);
    localStorage.setItem("forlife_pantry_v3", JSON.stringify(updated));
  };

  // Toggle low stock indicators
  const toggleLowStock = (id: string) => {
    const updated = pantryList.map(item => {
      if (item.id === id) {
        const isCurrentlyLow = item.notes?.toLowerCase().includes("low stock");
        let newNotes = item.notes || "";
        if (isCurrentlyLow) {
          newNotes = newNotes.replace(/\(low stock\)/gi, "").trim();
        } else {
          newNotes = newNotes ? `${newNotes} (Low Stock)` : "Low Stock";
        }
        return { ...item, notes: newNotes };
      }
      return item;
    });
    setPantryList(updated);
    localStorage.setItem("forlife_pantry_v3", JSON.stringify(updated));
  };

  // Inline edits
  const startEdit = (item: PantryItem) => {
    setEditingItemId(item.id);
    setEditName(item.name);
    setEditQty(item.qty);
    setEditCategory(item.category);
  };

  const saveEdit = (id: string) => {
    const updated = pantryList.map(item => {
      if (item.id === id) {
        return { ...item, name: editName.trim(), qty: editQty.trim(), category: editCategory };
      }
      return item;
    });
    setPantryList(updated);
    localStorage.setItem("forlife_pantry_v3", JSON.stringify(updated));
    setEditingItemId(null);
    setPastedStatus("Pantry Successfully Updated");
    setTimeout(() => setPastedStatus(""), 3500);
  };

  const filteredList = pantryList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.notes || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const categoriesColors: Record<string, string> = {
    Proteins: "bg-emerald-50 text-emerald-800 border-emerald-100",
    Produce: "bg-amber-50 text-amber-800 border-amber-100",
    Dairy: "bg-purple-50 text-purple-800 border-purple-100",
    "Frozen Foods": "bg-indigo-50 text-indigo-800 border-indigo-100",
    "Grains & Starches": "bg-rose-50 text-rose-800 border-rose-100",
    "Pantry Staples": "bg-stone-50 text-stone-800 border-stone-200",
    Snacks: "bg-blue-50 text-blue-800 border-blue-100"
  };

  const categories = [
    "Proteins", "Produce", "Dairy", "Frozen Foods", "Grains & Starches", "Pantry Staples", "Snacks"
  ];

  return (
    <div id="pantry-card-root" className="space-y-4 font-sans text-xs">
      
      {pastedStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-850 rounded-xl text-center font-bold flex items-center justify-center gap-1.5 animate-bounce">
          <Check className="w-4 h-4 text-emerald-600 fill-emerald-100" />
          <span>{pastedStatus}</span>
        </div>
      )}

      {/* CORE CONTROL BAR: SAVE PANTRY & CLEAR PANTRY ALWAYS VISIBLE */}
      <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-stone-200 p-3.5 rounded-2xl shadow-3xs">
        <button
          type="button"
          onClick={handleSavePantryAction}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
        >
          <Check className="w-4 h-4" /> Save Pantry
        </button>

        <button
          type="button"
          onClick={() => setShowClearConfirm(!showClearConfirm)}
          className="bg-stone-150 hover:bg-rose-100 hover:text-rose-700 text-stone-600 font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Trash2 className="w-4 h-4" /> Clear Pantry
        </button>

        {showClearConfirm && (
          <div className="col-span-2 p-3 bg-rose-50 border border-rose-150 rounded-xl space-y-2 text-center animate-fade-in mt-1">
            <p className="font-bold text-rose-850 m-0">Are you absolutely sure you want to clear the entire active pantry?</p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.2 rounded-lg bg-white border border-stone-200 text-[10.5px] font-bold text-stone-600"
              >
                No, Keep It
              </button>
              <button
                type="button"
                onClick={handleClearPantryAll}
                className="px-3.5 py-1.2 rounded-lg bg-rose-600 text-white text-[10.5px] font-black"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PROMINENT COPY-PASTE AND MANUAL INTAKE INTERFACE */}
      <div className="bg-white border border-stone-205 rounded-2.5xl p-4.5 shadow-3xs space-y-6">
        
        {/* MANUAL ADD SINGLE ITEM */}
        <div className="space-y-3 border-b border-stone-105 pb-5">
          <strong className="text-xs uppercase font-extrabold tracking-wider text-slate-700 font-mono flex items-center gap-1.5 border-b border-stone-105 pb-2">
            <Layers className="w-4 h-4 text-indigo-650" />
            Add pantry item
          </strong>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            const isRhondaGF = currentUser === "Rhon";
            const newItem: PantryItem = {
              id: "pan_" + Date.now() + Math.random().toString(36).substring(2, 5),
              name: name.trim(),
              qty: "some",
              category: getAutoCategory(name.trim()),
              notes: isRhondaGF ? "GF" : "",
              isGlutenFree: isRhondaGF
            };
            const updated = [...pantryList, newItem];
            setPantryList(updated);
            localStorage.setItem("forlife_pantry_v3", JSON.stringify(updated));
            setName("");
            setPastedStatus("Item Added");
            setTimeout(() => setPastedStatus(""), 3000);
          }} className="flex gap-2">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type one item (E.g. Eggs)..."
              className="flex-1 bg-stone-50/60 border border-stone-250 rounded-xl px-3 py-2 text-sm text-slate-850 font-semibold focus:bg-white focus:border-indigo-400 focus:outline-none shadow-inner"
            />
            <button
              type="submit"
              className="bg-indigo-650 hover:bg-slate-900 text-white font-extrabold px-6 py-2 rounded-xl transition cursor-pointer shadow whitespace-nowrap"
            >
              Add Item
            </button>
          </form>
        </div>

        {/* BULK COPY PASTE */}
        <div className="space-y-3">
          <strong className="text-xs uppercase font-extrabold tracking-wider text-slate-700 font-mono flex items-center gap-1.5 border-b border-stone-105 pb-2">
            <ShoppingBag className="w-4 h-4 text-emerald-650" />
            Paste pantry list
          </strong>
          <form onSubmit={handleSubmitPastedList} className="space-y-3 animate-fade-in">
            <div className="space-y-2">
              <span className="text-[12px] font-bold text-slate-700 block leading-snug">
                Effortlessly build your pantry. Copy and paste a list of foods/items below. Each line creates a separate item.
              </span>
              <textarea
                rows={5}
                required
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="E.g.&#10;Eggs&#10;Chicken breast&#10;Almond flour&#10;Frozen berries&#10;Greek yogurt"
                className="w-full bg-stone-50/60 border-2 border-stone-300 focus:bg-white focus:border-emerald-500 focus:outline-none rounded-xl p-3 text-sm font-semibold text-slate-850 shadow-inner resize-none"
              />
            </div>
            
            <div className="flex justify-end pr-0.5">
              <button
                type="submit"
                className="w-full sm:w-auto bg-slate-950 hover:bg-slate-800 text-white font-extrabold px-6 py-2.8 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-300" /> Add to Pantry
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* VOICE INTERFACE OPTIONAL SUB-CARD */}
      <div className="bg-slate-900 border border-slate-950 text-white p-3.5 rounded-2xl space-y-2.5 shadow-sm">
        <span className="text-[9px] uppercase font-bold text-emerald-400 font-mono flex items-center gap-1.2">
          <Mic className="w-3.5 h-3.5 animate-pulse" /> dictation voice addition
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleListening}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isListening 
                ? "bg-amber-500 text-slate-950 scale-105 ring-4 ring-amber-500/20" 
                : "bg-slate-800 text-slate-100 hover:bg-slate-750"
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
          
          <div className="text-[11px] text-slate-300 leading-tight">
            <span className="font-bold block">
              {isListening ? "Listening with focus..." : "Quick additions via Voice"}
            </span>
            <span className="text-[9.5px] text-slate-450 block mt-0.5">
              E.g. "We have chicken spinach yogurt almonds"
            </span>
          </div>
        </div>

        <form onSubmit={handleProcessVoicePantry} className="relative pt-1.5 flex gap-1.5">
          <input
            type="text"
            value={speechInput}
            onChange={(e) => setSpeechInput(e.target.value)}
            placeholder="Parsed dictate words show here. Press PROCESS to analyze..."
            className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-3 py-1.8 text-xs font-semibold focus:outline-none focus:border-slate-700 pr-20"
          />
          {speechInput.trim() && (
            <button
              type="submit"
              disabled={isProcessingVoice}
              className="absolute right-1.5 top-3.2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9px] px-3 py-1 rounded-lg transition"
            >
              {isProcessingVoice ? <Loader2 className="w-3 h-3 animate-spin" /> : "PROCESS"}
            </button>
          )}
        </form>

        {voiceError && (
          <p className="text-[9px] font-mono text-amber-500 m-0">{voiceError}</p>
        )}
      </div>

      {/* FILTER & CURRENT KITCHEN DISPLAY LIST */}
      <div className="space-y-3.5 text-xs bg-white border border-stone-200 p-4.5 rounded-2.5xl shadow-3xs">
        <div className="flex justify-between items-center flex-wrap gap-2 pt-1 border-b border-stone-100 pb-2">
          <strong className="text-xs uppercase font-extrabold text-stone-500 font-mono tracking-wider">
            Current Food & Pantry Stock ({filteredList.length})
          </strong>
          
          <div className="flex items-center gap-2">
            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {["all", ...categories].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat 
                      ? "bg-slate-900 text-white" 
                      : "bg-stone-105 text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {pantryList.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear your entire pantry list?")) {
                    setPantryList([]);
                    localStorage.setItem("forlife_pantry_v3", JSON.stringify([]));
                  }
                }}
                className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50 rounded-md transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Trash2 className="w-3 h-3" /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter search bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search kitchen active inventory stock..."
            className="w-full bg-stone-50 border border-stone-250 focus:bg-white pl-8.5 pr-4 py-2 text-xs font-semibold rounded-xl focus:outline-none focus:border-indigo-400"
          />
        </div>

        {filteredList.length === 0 ? (
          <div className="text-center py-9 text-stone-400 font-bold italic border border-dashed border-stone-200 rounded-2xl bg-stone-50/50 space-y-1">
            <p className="m-0">Stock ledger is currently empty.</p>
            <p className="text-[10px] text-stone-400 font-normal m-0">Paste your inventory list or type items into the intake form above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {filteredList.map((item) => {
              const isEditing = editingItemId === item.id;
              const isLowStock = item.notes?.toLowerCase().includes("low stock") || false;

              return (
                <div 
                  key={item.id} 
                  className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                    isLowStock 
                      ? "bg-amber-50/45 border-amber-300" 
                      : "bg-white border-stone-205 hover:border-slate-300 shadow-3xs"
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-white border border-stone-250 p-1.5 text-xs font-bold rounded-lg"
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={editQty}
                           onChange={(e) => setEditQty(e.target.value)}
                          className="w-full bg-white border border-stone-250 p-1.5 text-xs font-bold rounded-lg"
                        />
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as any)}
                          className="w-full bg-white border border-stone-250 p-1.5 text-xs font-bold rounded-lg"
                        >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-1 justify-end pt-1">
                        <button 
                          type="button" 
                          onClick={() => setEditingItemId(null)} 
                          className="px-2.5 py-1 bg-stone-100 text-[10px] font-extrabold rounded-lg hover:bg-stone-200 transition"
                        >
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          onClick={() => saveEdit(item.id)} 
                          className="px-2.5 py-1 bg-indigo-650 text-white text-[10px] font-extrabold rounded-lg hover:bg-indigo-700 transition"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center gap-1.5">
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-extrabold text-[12.5px] text-slate-850 leading-none truncate">{item.name}</span>
                          <span className="text-[9px] text-indigo-805 font-black bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md font-mono shrink-0 uppercase">{item.qty}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[8.5px] text-stone-500 mt-1.5 font-mono">
                          <span className={`uppercase font-black px-1 rounded-sm border ${categoriesColors[item.category] || "bg-stone-50 text-stone-800"}`}>
                            {item.category}
                          </span>
                          {item.isGlutenFree && <span className="text-emerald-800 font-extrabold">🌾 GF</span>}
                          {item.notes && <span className="italic">({item.notes})</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleLowStock(item.id)}
                          className={`p-1.2 rounded border transition ${isLowStock ? "bg-amber-150 text-amber-900 border-amber-300" : "bg-white text-stone-300 hover:text-stone-550"}`}
                          title="Toggle Low Stock Alert"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="p-1.2 rounded bg-white text-stone-300 hover:text-indigo-650 hover:bg-stone-50 border border-stone-205 transition"
                          title="Edit Item details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          className="p-1.2 rounded bg-white text-stone-300 hover:text-rose-600 hover:bg-stone-50 border border-stone-205 transition"
                          title="Delete from stock"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
