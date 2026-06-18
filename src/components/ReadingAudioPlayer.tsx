import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, FastForward } from "lucide-react";

interface ReadingAudioPlayerProps {
  textToRead: string;
  title?: string;
  autoPlay?: boolean;
}

export default function ReadingAudioPlayer({ textToRead, title, autoPlay }: ReadingAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup when unmounting
      if (utteranceRef.current && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!textToRead) return;

    if (localStorage.getItem("forlife_bliss_paused") === "true") {
      alert("Blessy is currently paused. Resume her to play readings!");
      return;
    }

    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    speechSynthesis.cancel(); // Stop any current speech
    
    // Strip markdown chars if any for smoother reading
    const cleanText = textToRead.replace(/[*_#]/g, "");
    
    const utterance = new SpeechSynthesisUtterance(title ? `${title}. ${cleanText}` : cleanText);
    utterance.rate = rate;

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
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const toggleRate = () => {
    const nextRate = rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : rate === 1.5 ? 2 : 1;
    setRate(nextRate);
    if (isPlaying) {
      // Changing rate requires restart
      speechSynthesis.cancel();
      handlePlay();
    }
  };

  return (
    <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
      {!isPlaying ? (
        <button 
          onClick={handlePlay}
          className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition"
          title="Play Audio"
        >
          <Play className="w-4 h-4" />
        </button>
      ) : (
        <button 
          onClick={handlePause}
          className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition"
          title="Pause Audio"
        >
          <Pause className="w-4 h-4" />
        </button>
      )}
      
      <button 
        onClick={handleStop}
        disabled={!isPlaying && !isPaused}
        className={`p-1.5 rounded-lg transition ${
          isPlaying || isPaused 
            ? "bg-rose-100 hover:bg-rose-200 text-rose-700" 
            : "bg-stone-50 text-stone-300 cursor-not-allowed"
        }`}
        title="Stop Audio"
      >
        <Square className="w-4 h-4" />
      </button>
      
      <button 
        onClick={toggleRate}
        className="px-2 py-1 flex items-center justify-center gap-1 bg-white hover:bg-stone-50 text-stone-600 rounded-lg border border-stone-200 text-[10px] font-black transition"
        title="Playback Speed"
      >
        <FastForward className="w-3 h-3 text-stone-400" /> {rate}x
      </button>
    </div>
  );
}
