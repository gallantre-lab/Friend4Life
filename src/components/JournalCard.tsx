import React, { useState } from "react";
import { Search, Plus, Trash2, Calendar, Clipboard, Mic, Sparkles } from "lucide-react";

export interface JournalEntry {
  id: string;
  date: string;
  time: string;
  type: "quick" | "voice" | "recovery" | "gratitude" | "food-feelings" | "morning" | "evening";
  content: string;
  user: "Rhon" | "Suz";
}

interface JournalCardProps {
  currentUser: "Rhon" | "Suz";
  journalEntries: JournalEntry[];
  onAddEntry: (content: string, type: JournalEntry["type"]) => void;
  onDeleteEntry: (id: string) => void;
  onBlissInteract: (text: string) => void;
}

export default function JournalCard({
  currentUser,
  journalEntries,
  onAddEntry,
  onDeleteEntry,
  onBlissInteract
}: JournalCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypeTab, setActiveTypeTab] = useState<JournalEntry["type"]>("quick");
  const [contentInput, setContentInput] = useState("");
  const [savedOk, setSavedOk] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentInput.trim()) return;

    onAddEntry(contentInput.trim(), activeTypeTab);
    setContentInput("");
    setSavedOk("Journal entry saved successfully! 📖");

    const categoryLabel = 
      activeTypeTab === "recovery" ? "Recovery Thought" : 
      activeTypeTab === "gratitude" ? "Gratitude Note" : 
      activeTypeTab === "food-feelings" ? "Food & Feelings Reflection" : "Quick Entry";

    // Inform Bliss of the entry
    const userDisplayName = currentUser === "Rhon" ? "Rhonda" : "Susan";
    const promptMsg = `Bliss, I just logged a new ${categoryLabel} in my personal journal: "${contentInput.trim()}". Could you write a supportive, warm 2-sentence response echoing my feelings and encouraging my progress?`;
    onBlissInteract(promptMsg);

    setTimeout(() => {
      setSavedOk("");
    }, 4000);
  };

  // Filter trends by current user and search query
  const filteredList = journalEntries
    .filter((j) => j.user === currentUser)
    .filter((j) => {
      if (!searchQuery.trim()) return true;
      return j.content.toLowerCase().includes(searchQuery.toLowerCase()) || j.type.toLowerCase().includes(searchQuery.toLowerCase());
    })
    // Sort reverse-chronologically
    .sort((a, b) => b.id.localeCompare(a.id));

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "recovery": return "❤️ Recovery";
      case "gratitude": return "🙏 Gratitude";
      case "food-feelings": return "🍽 Food & Feelings";
      case "morning": return "☀️ Morning Conn.";
      case "evening": return "🌙 Evening Inv.";
      case "voice": return "🎙 Spoken / Voice";
      default: return "📝 Quick Note";
    }
  };

  return (
    <div id="journal-comp-panel" className="space-y-4 font-sans text-xs md:text-sm">
      
      {/* Category Selection Bar */}
      <div className="flex border-b border-slate-100 pb-1.5 gap-1.5 flex-wrap">
        {[
          { type: "quick" as const, label: "📝 Quick Entry" },
          { type: "recovery" as const, label: "❤️ Recovery Notes" },
          { type: "gratitude" as const, label: "🙏 Gratitude Notes" },
          { type: "food-feelings" as const, label: "🍽 Food & Feelings" }
        ].map((tab) => (
          <button
            key={tab.type}
            type="button"
            onClick={() => setActiveTypeTab(tab.type)}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
              activeTypeTab === tab.type
                ? "bg-slate-900 text-white"
                : "bg-slate-50 hover:bg-slate-100 text-slate-655"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {savedOk && (
        <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl font-bold text-center flex items-center justify-center gap-1.5 animate-bounce">
          {savedOk}
        </div>
      )}

      {/* Input box */}
      <form onSubmit={handleCreate} className="space-y-2 text-xs">
        <textarea
          required
          value={contentInput}
          onChange={(e) => setContentInput(e.target.value)}
          placeholder={`Type your ${getTypeLabel(activeTypeTab)} freely here. Bliss maintains this private space safe from judgment...`}
          className="w-full bg-white border border-slate-250 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 rounded-xl p-3 text-slate-800 outline-none font-semibold resize-none h-20 leading-relaxed shadow-3xs"
        />
        <div className="flex justify-end gap-2 items-center">
          {activeTypeTab === "quick" && (
            <span className="text-[10px] text-slate-400 font-mono italic">
              Shortcut: Say 'Bliss, help!' in the top mic to speak directly.
            </span>
          )}
          <button
            type="submit"
            className="px-4.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Save Entry
          </button>
        </div>
      </form>

      {/* Search Input Filter */}
      <div className="relative border-t border-slate-100 pt-3">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-3">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search through previous files, reflections, and evening scales..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-slate-400 transition"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Display List of logs */}
      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
        {filteredList.length === 0 ? (
          <div className="text-center p-4 text-slate-400 italic">
            No journal entries match your filters. Track your thoughts to unlock history!
          </div>
        ) : (
          filteredList.map((entry) => (
            <div
              key={entry.id}
              className="p-3 bg-white border border-slate-150 rounded-xl flex items-start justify-between gap-3 shadow-2xs hover:border-slate-300 transition"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                    {entry.date} at {entry.time}
                  </span>
                  <span className="text-[9px] font-black uppercase text-indigo-750 bg-indigo-50 px-1.5 py-0.5 rounded-md font-mono">
                    {getTypeLabel(entry.type)}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onDeleteEntry(entry.id)}
                className="text-slate-400 hover:text-rose-600 p-1 bg-stone-50 hover:bg-rose-50 border border-stone-200 rounded-lg transition cursor-pointer"
                title="Delete journal record"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
