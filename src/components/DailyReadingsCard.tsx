import React, { useState, useEffect } from "react";
import { BookOpen, Calendar, HelpCircle, Loader2, Save, Send, Sparkles, ChevronDown, ChevronUp, AlertCircle, FileText, Check } from "lucide-react";
import ReadingAudioPlayer from "./ReadingAudioPlayer";

interface DailyReadingsCardProps {
  currentUser: "Rhon" | "Suz";
  onBlissInteract: (text: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onAddEntry: (content: string, type: string) => void;
  onCompleteSuccess?: () => void;
}

interface CachedReading {
  title: string;
  date: string;
  quote?: string;
  text: string;
  focus?: string;
}

export default function DailyReadingsCard({
  currentUser,
  onBlissInteract,
  selectedDate,
  setSelectedDate,
  onAddEntry,
  onCompleteSuccess
}: DailyReadingsCardProps) {
  // Expand state for each reading card
  const [expandedReadings, setExpandedReadings] = useState<Record<string, boolean>>({
    aa: currentUser === "Rhon",
    letting_go: currentUser === "Rhon",
    oa: currentUser === "Suz"
  });

  // Cached readings in state
  const [readingsData, setReadingsData] = useState<Record<string, CachedReading | null>>({
    aa: null,
    letting_go: null,
    oa: null
  });

  // Loading/Error states for each reading
  const [loading, setLoading] = useState<Record<string, boolean>>({
    aa: false,
    letting_go: false,
    oa: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({
    aa: "",
    letting_go: "",
    oa: ""
  });

  // Reflection notes for each reading
  const [notes, setNotes] = useState<Record<string, string>>({
    aa: "",
    letting_go: "",
    oa: ""
  });

  const [savedNotify, setSavedNotify] = useState<Record<string, string>>({
    aa: "",
    letting_go: "",
    oa: ""
  });

  // Format date display nicely
  const getFormattedDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  // Switch to yesterday or today easily
  const setQuickDate = (daysOffset: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    const offset = target.getTimezoneOffset();
    const localDate = new Date(target.getTime() - (offset * 60 * 1000));
    setSelectedDate(localDate.toISOString().split("T")[0]);
  };

  // Sync / load cache and notes when date or user changes
  useEffect(() => {
    const readingTypes = ["aa", "letting_go", "oa"];
    
    // Auto-select expansion based on current user
    setExpandedReadings({
      aa: currentUser === "Rhon",
      letting_go: currentUser === "Rhon",
      oa: currentUser === "Suz"
    });

    readingTypes.forEach((type) => {
      // 1. Load notes
      const notesKey = `forlife_reading_notes_${currentUser}_${type}_${selectedDate}`;
      const savedNotes = localStorage.getItem(notesKey);
      setNotes((prev) => ({ ...prev, [type]: savedNotes || "" }));

      // 2. Load cached reading
      const cacheKey = `forlife_cache_reading_${type}_${selectedDate}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setReadingsData((prev) => ({ ...prev, [type]: parsed }));
          setErrors((prev) => ({ ...prev, [type]: "" }));
        } catch (e) {
          setReadingsData((prev) => ({ ...prev, [type]: null }));
        }
      } else {
        setReadingsData((prev) => ({ ...prev, [type]: null }));
        setErrors((prev) => ({ ...prev, [type]: "" }));
      }
    });
  }, [selectedDate, currentUser]);

  // Fetch from backend resiliently
  const fetchReading = async (type: string) => {
    setLoading((prev) => ({ ...prev, [type]: true }));
    setErrors((prev) => ({ ...prev, [type]: "" }));

    const dateLabel = getFormattedDateLabel(selectedDate);

    try {
      const res = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateLabel,
          type,
          userContext: currentUser.toLowerCase()
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to retrieve reading. Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.text) {
        // Cache locally
        const cacheKey = `forlife_cache_reading_${type}_${selectedDate}`;
        localStorage.setItem(cacheKey, JSON.stringify(data));
        setReadingsData((prev) => ({ ...prev, [type]: data }));
      } else {
        throw new Error("No text content returned for this selection.");
      }
    } catch (err: any) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        [type]: err.message || "Failed to fetch full text. Please check your internet connection or GEMINI_API_KEY."
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  // Toggle accordion and fetch if needed
  const toggleReading = (type: string) => {
    const nextState = !expandedReadings[type];
    setExpandedReadings((prev) => ({ ...prev, [type]: nextState }));

    // If expanding and we don't have the reading data yet, fetch it
    if (nextState && !readingsData[type]) {
      fetchReading(type);
    }
  };

  // Notes changes
  const handleNotesChange = (type: string, value: string) => {
    setNotes((prev) => ({ ...prev, [type]: value }));
    const notesKey = `forlife_reading_notes_${currentUser}_${type}_${selectedDate}`;
    localStorage.setItem(notesKey, value);
  };

  // Share Notes with Bliss and Save to Vault
  const handleShareWithBliss = (type: string, label: string) => {
    const userNote = notes[type]?.trim();
    if (userNote) {
      onAddEntry(`[${label}] - ${userNote}`, "recovery");
    }
    
    const prompt = `Hey Bliss! I just completed reading today's "${label}" (${getFormattedDateLabel(selectedDate)}). 
My reflections and prayers: "${userNote || "(None written yet)"}". 
Could you give me a very brief, warm, encouraging response?`;
    
    onBlissInteract(prompt);
    
    setSavedNotify((prev) => ({ ...prev, [type]: "Reflections saved to Vault & shared with Bliss!" }));
    
    // Clear out Notes
    setNotes((prev) => ({ ...prev, [type]: "" }));
    const notesKey = `forlife_reading_notes_${currentUser}_${type}_${selectedDate}`;
    localStorage.removeItem(notesKey);

    setTimeout(() => {
      setSavedNotify((prev) => ({ ...prev, [type]: "" }));
    }, 3000);
  };

  const readingConfigs = [
    {
      type: "aa",
      label: "Daily Reflections (AA)",
      subtitle: "Alcoholics Anonymous",
      accent: "border-emerald-250 bg-emerald-50/20 text-emerald-800",
      iconColor: "text-emerald-600",
      relevant: currentUser === "Rhon"
    },
    {
      type: "letting_go",
      label: "The Language of Letting Go",
      subtitle: "Melody Beattie",
      accent: "border-rose-250 bg-rose-50/20 text-rose-800",
      iconColor: "text-rose-600",
      relevant: currentUser === "Rhon"
    },
    {
      type: "oa",
      label: "Voices of Recovery / OA Readings",
      subtitle: "Overeaters Anonymous",
      accent: "border-purple-250 bg-purple-50/20 text-purple-800",
      iconColor: "text-purple-600",
      relevant: currentUser === "Suz"
    }
  ];

  return (
    <div className="space-y-4 font-sans">
      
      {/* Date Picker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 border border-stone-200 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-black text-slate-800 font-mono uppercase tracking-wider">
            Selected Date:
          </span>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
            {getFormattedDateLabel(selectedDate)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setQuickDate(-1)}
            className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-600 border border-stone-250 rounded-xl text-[10px] font-extrabold transition-all"
          >
            ← Yesterday
          </button>
          <button
            type="button"
            onClick={() => setQuickDate(0)}
            className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-600 border border-stone-250 rounded-xl text-[10px] font-extrabold transition-all"
          >
            Today
          </button>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            className="bg-white border border-stone-250 hover:border-indigo-400 text-xs font-bold text-slate-800 p-1 px-1.5 rounded-xl cursor-pointer"
          />
        </div>
      </div>

      {/* Accordion reading areas */}
      <div className="space-y-3">
        {readingConfigs.map(({ type, label, subtitle, accent, iconColor, relevant }) => {
          const isOpen = !!expandedReadings[type];
          const data = readingsData[type];
          const isLoading = !data && loading[type];
          const errorMsg = errors[type];
          const hasData = !isLoading && !!data;

          return (
            <div 
              key={type} 
              className={`border rounded-2xl transition-all shadow-3xs overflow-hidden ${
                relevant 
                  ? "border-slate-300 bg-white" 
                  : "border-stone-200 bg-stone-50/40 opacity-75 hover:opacity-100"
              }`}
            >
              {/* Card Header toggle click area */}
              <button
                type="button"
                onClick={() => toggleReading(type)}
                className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-stone-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <BookOpen className={`w-4 h-4 shrink-0 ${iconColor}`} />
                  <div className="truncate">
                    <h3 className="text-xs sm:text-[13px] font-black text-slate-850 m-0 leading-tight">
                      {label}
                    </h3>
                    <p className="text-[10px] text-stone-500 font-mono uppercase font-semibold m-0 pt-0.5 leading-none">
                      {subtitle} {relevant && "• HIGH RELEVANCE"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-stone-400">
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />}
                  {data && <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono shrink-0">CACHED</span>}
                  {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                </div>
              </button>

              {/* Collapsed/Expanded Reading Contents */}
              {isOpen && (
                <div className="border-t border-stone-150 px-4 py-4.5 space-y-4 bg-stone-50/30">
                  
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-2.5">
                      <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
                      <p className="text-xs text-stone-500 font-bold italic animate-pulse">
                        Retrieving complete daily reading from archive...
                      </p>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-900 text-xs font-semibold">
                      <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="m-0 font-bold">Failed to load reading</p>
                        <p className="m-0 text-rose-700 text-[11px] pt-1 leading-snug">{errorMsg}</p>
                        <button
                          type="button"
                          onClick={() => fetchReading(type)}
                          className="mt-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] px-3 py-1 rounded-lg transition"
                        >
                          Retry Fetching
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reading Full Body */}
                  {hasData && data && (
                    <div className="space-y-3.5">
                      <div className="bg-white border border-stone-200 rounded-2xl p-4.5 shadow-3xs space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-stone-100 font-mono text-[10px] uppercase font-bold text-stone-500">
                          <span>{data.date}</span>
                          <ReadingAudioPlayer 
                            textToRead={`${data.quote ? data.quote + ". " : ""}${data.text}${data.focus ? ". " + data.focus : ""}`} 
                            title={data.title}
                          />
                        </div>
                        
                        <h4 className="text-sm font-black text-slate-905 tracking-tight m-0 bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                          {data.title}
                        </h4>

                        {data.quote && (
                          <div className="bg-amber-50/20 border-l-4 border-amber-400 p-3 text-xs italic font-bold leading-relaxed text-slate-800 rounded-r-xl">
                            "{data.quote}"
                          </div>
                        )}

                        <div className="text-xs sm:text-[13px] leading-relaxed font-semibold text-slate-800 whitespace-pre-wrap space-y-2">
                          {data.text}
                        </div>

                        {data.focus && (
                          <div className="border-t border-stone-150 pt-3 mt-2.5">
                            <span className="text-[9px] uppercase font-black tracking-widest text-[#a855f7] block font-mono">
                              Daily Focus / Prayer:
                            </span>
                            <p className="m-0 text-xs sm:text-[13.5px] font-extrabold italic text-slate-900 leading-snug">
                              {data.focus}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Notes Box directly under reading */}
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[9.5px] uppercase font-bold text-slate-500 font-mono">
                          <FileText className="w-3.5 h-3.5 text-stone-400" />
                          Personal Notes & Reflection (Auto-saves for {selectedDate})
                        </label>
                        <textarea
                          rows={3}
                          value={notes[type] || ""}
                          onChange={(e) => handleNotesChange(type, e.target.value)}
                          placeholder={`Write your personal insights, gratitude, or prayers regarding this reading here...`}
                          className="w-full bg-white border border-stone-250 focus:border-indigo-400 focus:outline-none rounded-2xl p-3 text-xs font-semibold text-slate-800 shadow-3xs"
                        />

                        {/* Force share button */}
                        <div className="flex justify-between items-center pt-1 text-[10px] text-stone-400 font-semibold font-mono">
                          <span>Draft saved privately</span>
                          <button
                            type="button"
                            onClick={() => handleShareWithBliss(type, label)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-3 py-1 rounded-xl text-[9px] flex items-center gap-1 transition shrink-0 cursor-pointer"
                          >
                            <Send className="w-3 h-3 text-emerald-300" /> Save to Vault & Share
                          </button>
                        </div>
                      </div>

                      {savedNotify[type] && (
                        <div className="p-2.5 bg-emerald-50 text-emerald-850 border border-emerald-150 rounded-xl text-xs font-black text-center animate-fade-in font-mono">
                          💡 {savedNotify[type]}
                        </div>
                      )}
                    </div>
                  )}

                  {!hasData && !isLoading && !errorMsg && (
                    <div className="flex flex-col items-center justify-center py-6 text-stone-400 italic">
                      <p className="text-xs font-bold font-mono">No cached reading detected for this date.</p>
                      <button
                        type="button"
                        onClick={() => fetchReading(type)}
                        className="mt-2.5 bg-slate-950 hover:bg-slate-850 text-white font-black text-xs px-4 py-2 rounded-xl transition"
                      >
                        Retrieve Full Reading
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

      {onCompleteSuccess && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onCompleteSuccess}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer uppercase tracking-wider"
          >
            <Check className="w-4 h-4 text-emerald-100 animate-pulse" /> Done Reading: Mark Today's Readings Complete
          </button>
        </div>
      )}

    </div>
  );
}
