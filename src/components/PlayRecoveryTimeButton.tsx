import React, { useState } from "react";
import { Play, Square, Loader2 } from "lucide-react";

interface PlayRecoveryTimeButtonProps {
  currentUser: "Rhon" | "Suz";
  selectedDate: string;
  journalEntries: any[];
}

export default function PlayRecoveryTimeButton({ currentUser, selectedDate, journalEntries }: PlayRecoveryTimeButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const getCachedReading = (type: string) => {
    const key = `forlife_cache_reading_${type}_${selectedDate}`;
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      const parsed = JSON.parse(data);
      return `${parsed.title || ""}. ${parsed.quote || ""} ${parsed.text || ""} ${parsed.focus || ""}`;
    } catch {
      return null;
    }
  };

  const getMorningNotes = () => {
    const notesKey = `forlife_reading_notes_${currentUser === "Rhon" ? "aa" : "oa"}_${selectedDate}`;
    return localStorage.getItem(notesKey) || "";
  };

  const attemptPlaySequential = () => {
    const parts = [];
    
    // Add primary reading based on user
    const mainReading = getCachedReading(currentUser === "Rhon" ? "aa" : "oa");
    if (mainReading) {
      parts.push(`Today's Reading: ${mainReading}`);
    }

    if (currentUser === "Rhon") {
      const lettingGo = getCachedReading("letting_go");
      if (lettingGo) {
        parts.push(`Daily Reflection: The Language of Letting Go. ${lettingGo}`);
      }
    }

    const savedNotes = getMorningNotes();
    if (savedNotes) {
      parts.push(`Your personal reflection notes: ${savedNotes}`);
    }

    // Attempt to align selectedDate ("2023-11-20") to journal date form ("Nov 20")
    let targetJournalDate = "";
    try {
      const d = new Date(selectedDate + "T00:00:00");
      targetJournalDate = d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch(e) {}

    const morningEntry = journalEntries.find(j => j.user === currentUser && j.type === "morning" && j.date === targetJournalDate);
    if (morningEntry) {
      parts.push(`Morning Inventory: ${morningEntry.content}`);
    }

    const eveningEntry = journalEntries.find(j => j.user === currentUser && j.type === "evening" && j.date === targetJournalDate);
    if (eveningEntry) {
      parts.push(`Evening Inventory: ${eveningEntry.content}`);
    }

    if (parts.length === 0) {
      alert("No readings are currently cached for today. Please open the readings below to load them before playing.");
      return;
    }

    if (localStorage.getItem("forlife_bliss_paused") === "true") {
      alert("Blessy is currently paused. Resume her to play daily readings and journals!");
      return;
    }

    speechSynthesis.cancel();
    
    // Clean string for speech
    const combinedText = parts.join(". ").replace(/[*_#\[\]\-]/g, "");
    const utterance = new SpeechSynthesisUtterance(combinedText);
    utterance.rate = 1.0;

    // Load consistent natural female voice
    const voices = speechSynthesis.getVoices();
    const searchPatterns = ["samantha", "zira", "google us english", "female", "hazel", "natural"];
    let preferredVoice = null;
    for (const pattern of searchPatterns) {
      preferredVoice = voices.find(v => v.name.toLowerCase().includes(pattern));
      if (preferredVoice) break;
    }
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"));
    }
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-3xl flex items-center justify-between mb-4 shadow-3xs">
      <div>
        <h3 className="text-sm font-black text-indigo-900 m-0">Play Today's Recovery Time</h3>
        <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Reads your daily materials sequentially.</p>
      </div>
      
      <div className="flex gap-2">
        {!isPlaying ? (
          <button 
            onClick={attemptPlaySequential}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" /> Play All
          </button>
        ) : (
          <button 
            onClick={handleStop}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer"
          >
            <Square className="w-3.5 h-3.5" /> Stop
          </button>
        )}
      </div>
    </div>
  );
}
