import React, { useState, useRef, useEffect } from "react";
import { Play, Square, Loader2 } from "lucide-react";

interface PlayRecoveryTimeButtonProps {
  currentUser: "Rhon" | "Suz";
  selectedDate: string;
  journalEntries: any[];
}

export default function PlayRecoveryTimeButton({ currentUser, selectedDate, journalEntries }: PlayRecoveryTimeButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      // Clean up audio references on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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

  const attemptPlaySequential = async () => {
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

    // Stop existing audio if any
    handleStop();

    // Create / fetch audioRef inside user click context to comply with browser autoplay gesture rules
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    audioRef.current.volume = 1.0;

    setIsLoading(true);
    // Clean string for speech
    const combinedText = parts.join(". ").replace(/[*_#\[\]\-]/g, "");

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: combinedText,
          title: "Today's Recovery Reflection"
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy call failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.audioContent) {
        throw new Error("No audio content received from server.");
      }

      // Standard base64 direct source URI to avoid iframe blob sandbox blocks
      const dataUrl = `data:audio/mp3;base64,${data.audioContent}`;

      const audio = audioRef.current;
      audio.src = dataUrl;
      audio.volume = 1.0;

      audio.onended = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };

      setIsLoading(false);
      setIsPlaying(true);
      await audio.play();
    } catch (err: any) {
      setIsLoading(false);
      const isAbortError = err?.name === "AbortError" || err?.message?.includes("interrupted by a call to pause");
      if (isAbortError) {
        console.log("Recovery time audio playback was cancelled or paused gracefully.");
        return;
      }
      console.error("Google Cloud TTS sequential playback failed:", err);
      alert("Unable to play recovery time audio right now. Please verify your Internet connection and API credentials.");
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  return (
    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-3xl flex items-center justify-between mb-4 shadow-3xs">
      <div>
        <h3 className="text-sm font-black text-indigo-900 m-0">Play Today's Recovery Time</h3>
        <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Reads your daily materials sequentially.</p>
      </div>
      
      <div className="flex gap-2">
        {isLoading ? (
          <button 
            disabled
            className="flex items-center gap-1.5 bg-indigo-100 text-indigo-400 px-4 py-2 rounded-xl text-xs font-black cursor-not-allowed animate-pulse"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Preparing Audio...
          </button>
        ) : !isPlaying ? (
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
