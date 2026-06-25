import React, { useState, useEffect } from "react";
import { 
  Sparkles, Loader2, Trash2, RotateCw, ShoppingBag, 
  Check, Lock, Unlock, ShoppingCart, AlertCircle, Edit, Save, X, Eye, Clipboard, Plus, CheckSquare, Square
} from "lucide-react";
import { PantryItem } from "../types";

export interface MealDetail {
  name: string;
  instructions: string;
  locked?: boolean;
  edited?: boolean;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface MealDay {
  dayIndex: number;
  dateLabel: string;
  rawDate: string; // YYYY-MM-DD
  scheduleNote?: string;
  breakfast: MealDetail;
  lunch: MealDetail;
  dinner: MealDetail;
  snack: MealDetail;
}

export interface SmartMealPlan {
  title: string;
  mode: string;
  numDays: number;
  pantryCompleteness: string;
  pantryUtilization: string;
  estimatedCost: number;
  groceryList: string[];
  pantryOnHandUsed: string[];
  days: MealDay[];
}

interface MealPlanCardProps {
  currentUser: "Rhon" | "Suz";
  pantryList: PantryItem[];
  setPantryList: React.Dispatch<React.SetStateAction<PantryItem[]>>;
  onBlissInteract: (text: string) => void;
  speakText: (text: string) => void;
  selectedDate: string;
}

export default function MealPlanCard({
  currentUser,
  pantryList,
  setPantryList,
  onBlissInteract,
  speakText,
  selectedDate
}: MealPlanCardProps) {
  const [mealPlan, setMealPlan] = useState<SmartMealPlan | null>(null);
  const [isPlanningMeals, setIsPlanningMeals] = useState(false);
  const [duration, setDuration] = useState<number>(5); // 1, 2, 5, 7, 14
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [errorText, setErrorText] = useState("");
  
  const [savedPlansArchive, setSavedPlansArchive] = useState<string[]>([]);
  const [showPantryEditor, setShowPantryEditor] = useState(true);

  // Rebuilt Interactive Pantry states
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState("");
  const [manualItemName, setManualItemName] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState("");

  // Update lists archive dropdown
  const updateSavedPlansArchive = () => {
    const list: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("forlife_mealplan_by_start_date_")) {
        list.push(key.replace("forlife_mealplan_by_start_date_", ""));
      }
    }
    setSavedPlansArchive(list.sort());
  };

  // Load plan automatically connected to selectedDate
  useEffect(() => {
    updateSavedPlansArchive();

    let foundPlan: SmartMealPlan | null = null;
    let foundIdx = 0;

    // Look for saved plan containing selected date
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("forlife_mealplan_by_start_date_")) {
        try {
          const plan = JSON.parse(localStorage.getItem(key) || "{}") as SmartMealPlan;
          if (plan && plan.days) {
            const idx = plan.days.findIndex(d => d.rawDate === selectedDate);
            if (idx !== -1) {
              foundPlan = plan;
              foundIdx = idx;
              break;
            }
          }
        } catch (e) {}
      }
    }

    if (foundPlan) {
      setMealPlan(foundPlan);
      setActiveDayIdx(foundIdx);
    } else {
      const savedPlan = localStorage.getItem("forlife_mealplan_v5");
      if (savedPlan) {
        try {
          const plan = JSON.parse(savedPlan) as SmartMealPlan;
          const idx = plan.days ? plan.days.findIndex(d => d.rawDate === selectedDate) : -1;
          setMealPlan(plan);
          setActiveDayIdx(idx !== -1 ? idx : 0);
        } catch (e) {}
      } else {
        setMealPlan(null);
      }
    }
  }, [selectedDate]);

  // Save changes to storage
  const savePlanToStorage = (plan: SmartMealPlan) => {
    localStorage.setItem("forlife_mealplan_v5", JSON.stringify(plan));
    if (plan.days && plan.days[0]) {
      localStorage.setItem(`forlife_mealplan_by_start_date_${plan.days[0].rawDate}`, JSON.stringify(plan));
    }
    updateSavedPlansArchive();
  };

  // Rebuilt Interactive Pantry Methods

  // Manual Add Item (Type one item, click Add, instantly appear in pantry)
  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualItemName.trim()) return;
    const newItem: PantryItem = {
      id: "pt_man_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name: manualItemName.trim(),
      qty: "Present",
      category: "Pantry Staples",
      isGlutenFree: false
    };
    const updated = [...pantryList, newItem];
    setPantryList(updated);
    localStorage.setItem("forlife_pantry_v3", JSON.stringify(updated));
    setManualItemName("");
  };

  // Bulk Paste Add (Paste raw lines of items, Save button clears input and closes modal)
  const handleBulkPasteSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkPasteText.trim()) return;
    const lines = bulkPasteText.split("\n");
    const newItems: PantryItem[] = [];
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      newItems.push({
        id: "pt_bulk_" + Date.now() + "_" + idx + "_" + Math.floor(Math.random() * 1000),
        name: trimmed,
        qty: "Present",
        category: "Pantry Staples",
        isGlutenFree: false
      });
    });
    const updated = [...pantryList, ...newItems];
    setPantryList(updated);
    localStorage.setItem("forlife_pantry_v3", JSON.stringify(updated));
    setBulkPasteText(""); // Clear pasted text box immediately
    setIsBulkModalOpen(false); // Close the modal
  };

  // Delete Individual Pantry Item
  const handleDeletePantryItem = (id: string) => {
    const updated = pantryList.filter(item => item.id !== id);
    setPantryList(updated);
    localStorage.setItem("forlife_pantry_v3", JSON.stringify(updated));
  };

  // Clear Entire Pantry List with Confirmation
  const handleClearPantry = () => {
    if (window.confirm("Are you sure you want to clear your entire pantry list? This will remove all items.")) {
      setPantryList([]);
      localStorage.setItem("forlife_pantry_v3", JSON.stringify([]));
    }
  };

  // Start Inline Editing an Item
  const handleStartEdit = (item: PantryItem) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
  };

  // Save Inline Edited Item Name
  const handleSaveEdit = (id: string) => {
    if (!editingItemName.trim()) return;
    const updated = pantryList.map(item => {
      if (item.id === id) {
        return { ...item, name: editingItemName.trim() };
      }
      return item;
    });
    setPantryList(updated);
    localStorage.setItem("forlife_pantry_v3", JSON.stringify(updated));
    setEditingItemId(null);
    setEditingItemName("");
  };

  // Checkbox-driven lock state toggle (checked = locked, empty = unlocked)
  const toggleMealLock = (dayIndex: number, mealKey: "breakfast" | "lunch" | "dinner" | "snack") => {
    if (!mealPlan) return;

    const updatedDays = mealPlan.days.map((day) => {
      if (day.dayIndex === dayIndex) {
        const mealObj = day[mealKey] || { name: "", instructions: "" };
        const newLocked = !mealObj.locked;
        return {
          ...day,
          [mealKey]: {
            ...mealObj,
            locked: newLocked
          }
        };
      }
      return day;
    });

    const updatedPlan = { ...mealPlan, days: updatedDays };
    setMealPlan(updatedPlan);
    savePlanToStorage(updatedPlan);

    // Save details to general calendar logs
    const day = updatedDays.find(d => d.dayIndex === dayIndex);
    if (day) {
      localStorage.setItem(`forlife_calendar_meal_${day.rawDate}`, JSON.stringify({
        breakfast: day.breakfast,
        lunch: day.lunch,
        dinner: day.dinner,
        snack: day.snack,
        title: updatedPlan.title,
        scheduleNote: day.scheduleNote
      }));
    }

    const currentLockState = updatedDays.find(d => d.dayIndex === dayIndex)?.[mealKey]?.locked;
    speakText(`Meal is ${currentLockState ? "kept" : "changeable"}`);
  };

  // Unified Generative Planner Core
  const handleGenerateMealPlan = async (forceFresh: boolean = false) => {
    setIsPlanningMeals(true);
    setErrorText("");

    // Setup quiet default instructions honoring high protein, low waste & leftovers context
    const automaticPreferences = [
      "Use Pantry First",
      "Reduce Food Waste",
      "Create Healthy, High-Protein Meals",
      "Simple Preparation",
      currentUser === "Rhon" ? "Lower Sugar" : "Low Sugar"
    ];

    // Under-the-hood guidelines
    const automatedGuidelines = "Prioritize using ingredients already listed in the pantry. Reduce waste. Focus on healthy, high-protein recipes. Keep meal layouts clean and clear. Do not assume or output references containing family relationships like brothers, sisters, or siblings.";

    // Respect existing day checkbox logs
    const sendingDays = (!forceFresh && mealPlan && mealPlan.days) ? mealPlan.days : null;

    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pantryList,
          days: duration,
          mode: "small-top-up", // Quiet default Mode 2: Bliss suggests basic grocery help when needed
          startDate: selectedDate,
          customInstructions: automatedGuidelines,
          existingDays: sendingDays,
          preferences: automaticPreferences
        })
      });

      const data = await res.json();
      if (data.days) {
        // Sanitize generated meal plan to guarantee absolutely zero sisterly assumptions slip through
        const sanitizedDays = data.days.map((day: any) => {
          const sanitizeText = (txt: string) => {
            if (!txt) return "";
            return txt
              .replace(/sisters'|sister's/gi, "household")
              .replace(/sisters|sister/gi, "partners")
              .replace(/brothers|brother/gi, "partner")
              .replace(/siblings|sibling/gi, "adults")
              .replace(/family member/gi, "household member");
          };
          return {
            ...day,
            breakfast: { ...day.breakfast, name: sanitizeText(day.breakfast?.name), instructions: sanitizeText(day.breakfast?.instructions) },
            lunch: { ...day.lunch, name: sanitizeText(day.lunch?.name), instructions: sanitizeText(day.lunch?.instructions) },
            dinner: { ...day.dinner, name: sanitizeText(day.dinner?.name), instructions: sanitizeText(day.dinner?.instructions) },
            snack: day.snack ? { ...day.snack, name: sanitizeText(day.snack?.name), instructions: sanitizeText(day.snack?.instructions) } : undefined
          };
        });

        const sanitizedTitle = data.title
          ? data.title
              .replace(/sisters'|sister's/gi, "Household")
              .replace(/sisters|sister/gi, "Your")
              .replace(/brothers|brother/gi, "Household")
              .replace(/siblings|sibling/gi, "Weekly")
          : `${duration}-Day Meal Plan`;

        const sanitizedPlan = {
          ...data,
          title: sanitizedTitle,
          days: sanitizedDays
        };

        setMealPlan(sanitizedPlan);
        savePlanToStorage(sanitizedPlan);

        // Populate calendar cells
        sanitizedPlan.days.forEach((day: MealDay) => {
          localStorage.setItem(`forlife_calendar_meal_${day.rawDate}`, JSON.stringify({
            breakfast: day.breakfast,
            lunch: day.lunch,
            dinner: day.dinner,
            snack: day.snack,
            title: sanitizedPlan.title,
            scheduleNote: day.scheduleNote
          }));
        });

        const countLocked = sendingDays ? sendingDays.map(d => [d.breakfast?.locked, d.lunch?.locked, d.dinner?.locked, d.snack?.locked].filter(Boolean).length).reduce((a, b) => a + b, 0) : 0;
        if (countLocked > 0) {
          speakText(`Updated unlocked parts of your plan, keeping your checked meals securely saved.`);
        } else {
          speakText(`New plan formulated starting ${selectedDate}.`);
        }

        setActiveDayIdx(0);
        
        onBlissInteract(
          `Hey Bliss! I just created a clean, food-waste-optimized ${duration}-Day Meal Plan. Speak to us with warm text encouragement!`
        );
      } else if (data.error) {
        setErrorText(data.error);
      }
    } catch (e) {
      console.error(e);
      setErrorText("Oops, there was an issue designing the meal schedule. Let's try again in a moment!");
    } finally {
      setIsPlanningMeals(false);
    }
  };

  const handleClearMealPlan = () => {
    if (mealPlan && mealPlan.days && mealPlan.days[0]) {
      localStorage.removeItem(`forlife_mealplan_by_start_date_${mealPlan.days[0].rawDate}`);
    }
    setMealPlan(null);
    localStorage.removeItem("forlife_mealplan_v5");
    updateSavedPlansArchive();
    speakText("Meal plan cleared.");
  };

  const loadSavedPlanByStartDate = (start: string) => {
    const raw = localStorage.getItem(`forlife_mealplan_by_start_date_${start}`);
    if (raw) {
      try {
        const plan = JSON.parse(raw);
        setMealPlan(plan);
        setActiveDayIdx(0);
        speakText(`Loaded plan starting ${start}.`);
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-6 font-sans text-stone-800" id="unified-pantry-mealplanning-workspace">
      
      {/* Title Header Card */}
      <div className="p-5 bg-white border border-stone-200 rounded-3xl shadow-3xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50/80 text-indigo-650 flex items-center justify-center">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 leading-tight m-0">Pantry & Meal Planner</h2>
              <span className="text-[10px] text-stone-400 font-mono font-bold uppercase tracking-wider">Quietly coordinates foods on-hand to prevent food waste</span>
            </div>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            {currentUser === "Rhon" ? "Rhonda (AA Support)" : "Susan (OA Support)"}
          </span>
        </div>

        {/* Rebuilt True Interactive Pantry Section */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4.5 space-y-4">
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider font-mono">
              🥕 Kitchen Ingredients On-Hand ({pantryList.length} items)
            </span>
            {pantryList.length > 0 && (
              <button
                type="button"
                onClick={handleClearPantry}
                className="text-[10px] text-red-650 hover:text-red-850 font-black uppercase tracking-wider font-mono cursor-pointer transition bg-transparent border-0"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Manual entry row */}
            <form onSubmit={handleManualAdd} className="flex gap-2">
              <input
                type="text"
                required
                value={manualItemName}
                onChange={(e) => setManualItemName(e.target.value)}
                placeholder="Add a single item (e.g. Eggs)..."
                className="flex-1 bg-white border border-stone-250 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-400 focus:outline-none shadow-3xs"
              />
              <button
                type="submit"
                className="bg-indigo-650 hover:bg-indigo-750 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </form>

            {/* Bulk Import Button Area */}
            <div className="flex justify-between items-center bg-white/70 rounded-xl p-2.5 border border-stone-201 text-xs">
              <span className="text-stone-500 font-medium">Have a list ready?</span>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(true)}
                className="bg-stone-900 hover:bg-slate-800 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shadow-3xs"
              >
                <Clipboard className="w-3.5 h-3.5" /> Add Pantry Items (Bulk Paste)
              </button>
            </div>

            {/* Pantry List Entries */}
            {pantryList.length === 0 ? (
              <div className="text-center py-6 px-4 bg-white/40 rounded-xl border border-dashed border-stone-250">
                <p className="text-xs text-stone-500 font-semibold m-0">Your pantry list is empty.</p>
                <p className="text-[10px] text-stone-400 m-0 mt-1">Use the quick add field above or paste bulk list items.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {pantryList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white border border-stone-200 rounded-xl p-2.5 hover:shadow-3xs transition-shadow animate-fade-in"
                  >
                    {editingItemId === item.id ? (
                      <div className="flex items-center gap-1.5 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingItemName}
                          onChange={(e) => setEditingItemName(e.target.value)}
                          className="flex-1 bg-stone-50 border border-stone-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-805 focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(item.id);
                            if (e.key === "Escape") setEditingItemId(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item.id)}
                          className="p-1 text-emerald-650 hover:bg-emerald-50 rounded"
                          title="Save change"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItemId(null)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-850">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-1 text-stone-450 hover:text-indigo-650 hover:bg-indigo-50 rounded transition"
                            title="Edit Item"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePantryItem(item.id)}
                            className="p-1 text-stone-350 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rebuilt Bulk Paste Modal (State Overlay) */}
        {isBulkModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-stone-105 pb-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide font-mono flex items-center gap-1.5">
                  <Clipboard className="w-4.5 h-4.5 text-indigo-600" /> Add Pantry Items (Bulk Paste)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBulkPasteSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-650">
                    Paste pantry items here (Each line creates a separate item)
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={bulkPasteText}
                    onChange={(e) => setBulkPasteText(e.target.value)}
                    placeholder="E.g.&#10;Eggs&#10;Chicken breast&#10;Almond flour&#10;Frozen berries&#10;Greek yogurt"
                    className="w-full bg-stone-50 border border-stone-300 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-2xl p-3.5 text-xs font-semibold text-slate-800 shadow-inner resize-none font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-105">
                  <button
                    type="button"
                    onClick={() => {
                      setBulkPasteText(""); // Clear pasted text area
                      setIsBulkModalOpen(false); // Close
                    }}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-650 hover:bg-indigo-750 text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-300" /> Save Pantry Items
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Plan Configuration Actions Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Pick Duration */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase text-slate-405 tracking-wider font-mono block">Plan Duration</span>
            <div className="flex flex-wrap gap-1">
              {[1, 2, 5, 7, 14].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`px-3.5 py-1.8 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    duration === d
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {d} {d === 1 ? "Day" : d === 14 ? "Weeks (14d)" : "Days"}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions (Recall Saved Plans) */}
          <div className="space-y-1.5 flex flex-col justify-end">
            {savedPlansArchive.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[10px] font-mono font-black uppercase text-slate-400">Recall Saved Plans:</span>
                <select 
                  onChange={(e) => { if(e.target.value) loadSavedPlanByStartDate(e.target.value); }}
                  className="bg-white rounded-xl p-1.8 text-xs text-stone-700 font-extrabold border border-stone-250 focus:outline-none max-w-[160px] cursor-pointer"
                  value=""
                >
                  <option value="" disabled>-- Select Date --</option>
                  {savedPlansArchive.map(start => (
                    <option key={start} value={start}>{start}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Primary Gen Controllers */}
        <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-dashed border-stone-200">
          {mealPlan && (
            <button
              type="button"
              onClick={handleClearMealPlan}
              className="px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-600 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition border border-stone-200"
            >
              <Trash2 className="w-3.5 h-3.5 text-stone-400" />
              Reset Plan
            </button>
          )}

          <button
            type="button"
            onClick={() => handleGenerateMealPlan(false)}
            disabled={isPlanningMeals}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-40"
          >
            {isPlanningMeals ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Planning balanced nutrition...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                {mealPlan ? "Regenerate Unchecked Meals" : `Generate ${duration}-Day Plan`}
              </>
            )}
          </button>
        </div>

        {errorText && (
          <p className="text-[10.5px] text-rose-600 font-bold bg-rose-50 rounded-xl p-3 border border-rose-100 leading-relaxed m-0">
            {errorText}
          </p>
        )}
      </div>

      {/* Render Active Plan Schedule Outputs */}
      {mealPlan ? (
        <div className="space-y-5" id="meal-output-display">
          
          {/* Plan Header metadata panel (Simple & Relationship-Free) */}
          <div className="p-4 bg-indigo-900/5 text-indigo-950 border border-indigo-150 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 flex flex-col justify-center">
              <span className="text-[9px] font-mono tracking-wider text-indigo-650 uppercase font-bold block">HOUSEHOLD MEAL PLAN</span>
              <h3 className="m-0 text-[14px] font-black text-slate-900 tracking-tight leading-snug">{mealPlan.title}</h3>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[9px] font-black uppercase text-slate-500">
                <span className="bg-white border rounded border-stone-200 px-1.5 py-0.5">Completeness: {mealPlan.pantryCompleteness || "Sufficient"}</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-indigo-100 rounded-xl space-y-1">
              <span className="text-[9px] uppercase font-black text-[#a855f7] tracking-wider font-mono">Waste & Recycle Guide</span>
              <p className="m-0 text-[10.5px] text-stone-600 font-semibold leading-relaxed italic">
                "{mealPlan.pantryUtilization || "Using pantry staples quietly to minimize grocery purchases."}"
              </p>
            </div>
          </div>

          {/* Suggested Shopping Additions (Simple & non-intrusive) */}
          {mealPlan.groceryList && mealPlan.groceryList.length > 0 && (
            <div className="p-4.5 bg-[#fdf4ff] border border-purple-100 rounded-2xl space-y-3 shadow-3xs">
              <div className="flex justify-between items-center pb-2 border-b border-purple-150/40 text-xs">
                <span className="font-extrabold text-slate-800 uppercase font-mono flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-purple-600" />
                  💡 Suggested Shopping Additions
                </span>
                {mealPlan.estimatedCost > 0 && (
                  <span className="text-[10px] bg-purple-150 text-purple-800 font-extrabold px-2.5 py-0.5 rounded font-mono">
                    Est Cost: ${mealPlan.estimatedCost.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                {mealPlan.groceryList.map((item, id) => (
                  <div key={id} className="flex items-center gap-2 text-stone-700 bg-white/75 p-2 rounded-xl border border-purple-50">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-[9.5px] text-purple-500 font-semibold leading-snug m-0">
                * These basic items significantly elevate meal alternatives while using up your stocks beautifully.
              </p>
            </div>
          )}

          {/* Days Navigation Row */}
          <div className="space-y-4 pt-1">
            <div className="flex bg-stone-100 p-1.2 rounded-2xl overflow-x-auto w-fit max-w-full gap-1 border border-stone-200">
              {mealPlan.days?.map((day, index) => {
                const countLockedInDay = [
                  day.breakfast?.locked, 
                  day.lunch?.locked, 
                  day.dinner?.locked, 
                  day.snack?.locked
                ].filter(Boolean).length;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveDayIdx(index)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      activeDayIdx === index
                        ? "bg-white text-slate-900 shadow-sm border border-stone-200"
                        : "text-slate-500 hover:text-slate-805"
                    }`}
                  >
                    {countLockedInDay > 0 && (
                      <span className="w-2.5 h-2.5 bg-amber-400 rounded-full border border-white" title={`${countLockedInDay} meals checked/saved`} />
                    )}
                    {day.dateLabel ? day.dateLabel : `Day ${index + 1}`}
                  </button>
                );
              })}
            </div>

            {/* Daily prep detail */}
            {mealPlan.days[activeDayIdx]?.scheduleNote && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 font-semibold leading-relaxed">
                💡 <strong>Leftover planning:</strong> {mealPlan.days[activeDayIdx].scheduleNote}
              </div>
            )}

            {/* Pristine & Simple Daily Menu Display */}
            {mealPlan.days[activeDayIdx] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "breakfast" as const, label: "Breakfast 🍳", data: mealPlan.days[activeDayIdx].breakfast },
                  { key: "lunch" as const, label: "Lunch 🥗", data: mealPlan.days[activeDayIdx].lunch },
                  { key: "dinner" as const, label: "Dinner 🍗", data: mealPlan.days[activeDayIdx].dinner },
                  { key: "snack" as const, label: "Snack 🥑", data: mealPlan.days[activeDayIdx].snack }
                ].map((m) => {
                  if (!m.data || (!m.data.name && m.key === "snack")) return null; // Snack is optional

                  const isMealLocked = !!m.data.locked;

                  return (
                    <div 
                      key={m.key} 
                      className="bg-white border border-stone-200 p-4.5 rounded-2xl flex flex-col justify-between space-y-3.5 hover:border-stone-300 transition shadow-3xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono font-black text-indigo-650 tracking-wider">
                            {m.label}
                          </span>
                          {isMealLocked && (
                            <span className="text-[8px] bg-amber-100 text-amber-805 font-mono px-1.5 py-0.5 rounded border border-amber-200 uppercase font-black tracking-wider">
                              Locked
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-xs leading-snug m-0">
                          {m.data.name || "Nourishing Choice"}
                        </h4>
                        <p className="text-[11px] text-stone-500 leading-relaxed m-0 font-medium pt-0.5">
                          {m.data.instructions || "Preparation instructions."}
                        </p>
                      </div>

                      {/* Extremely simplified locked checkbox */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-[11px] font-black leading-none text-stone-605 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isMealLocked}
                            onChange={() => toggleMealLock(activeDayIdx, m.key)}
                            className="w-4.5 h-4.5 text-indigo-600 border-stone-350 rounded focus:ring-indigo-500 cursor-pointer"
                          />
                          <span>Lock Meal (Keep)</span>
                        </label>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="p-10 text-center bg-white border border-dashed border-stone-200 rounded-3xl">
          <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-xs text-slate-800 font-extrabold m-0">No active meal plan designed for {selectedDate}.</p>
          <p className="text-[10.5px] text-stone-400 mt-1 max-w-sm mx-auto font-medium">Click the "Generate Plan" button above and Bliss will build a fresh custom nutritional routine using your on-hand stocks!</p>
        </div>
      )}

    </div>
  );
}
