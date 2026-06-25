import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, FastForward, Loader2, Sparkles } from "lucide-react";

interface ReadingAudioPlayerProps {
  textToRead: string;
  title?: string;
  autoPlay?: boolean;
}

export default function ReadingAudioPlayer({ textToRead, title, autoPlay }: ReadingAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rate, setRate] = useState(0.95); // Perfect calming wellness reflection pace

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Keep track of the text and title to invalidate cache if they change
  useEffect(() => {
    setAudioUrl(null);
    handleStop();
  }, [textToRead, title]);

  useEffect(() => {
    return () => {
      // Cleanup audio element when unmounting
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Adjust playbackRate of active Google Cloud audio when rate state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, [rate]);

  const handlePlay = async () => {
    if (!textToRead) return;

    // Create / fetch audioRef inside user click context to comply with browser autoplay gesture rules
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    audioRef.current.volume = 1.0;
    audioRef.current.playbackRate = rate;

    // If we already have synthesized Google Cloud TTS audio, just play it
    if (audioUrl) {
      setIsPlaying(true);
      setIsPaused(false);
      try {
        await audioRef.current.play();
      } catch (err: any) {
        const isAbortError = err?.name === "AbortError" || err?.message?.includes("interrupted by a call to pause");
        if (!isAbortError) {
          console.error("Failed to resume premium audio:", err);
        }
        handleStop();
      }
      return;
    }

    // Otherwise, fetch from Google Cloud TTS endpoint
    setIsLoading(true);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: textToRead,
          title: title
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy call failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.audioContent) {
        throw new Error("No audio content in proxy response");
      }

      // Standard base64 direct source URI to avoid iframe blob sandbox blocks
      const dataUrl = `data:audio/mp3;base64,${data.audioContent}`;
      setAudioUrl(dataUrl);

      const audio = audioRef.current;
      audio.src = dataUrl;
      audio.volume = 1.0;
      audio.playbackRate = rate;

      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      audio.onerror = (e) => {
        console.error("Premium audio element playback error:", e);
        handleStop();
      };

      setIsPlaying(true);
      setIsPaused(false);
      setIsLoading(false);
      await audio.play();
    } catch (err: any) {
      setIsLoading(false);
      const isAbortError = err?.name === "AbortError" || err?.message?.includes("interrupted by a call to pause");
      if (isAbortError) {
        console.log("Audio playback was cancelled or paused gracefully.");
        return;
      }
      console.error("Unable to generate Google Cloud TTS:", err);
      alert("Unable to play premium audio reflection right now. Please check your internet connection.");
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const toggleRate = () => {
    const nextRate = rate === 0.95 ? 1.05 : rate === 1.05 ? 1.15 : rate === 1.15 ? 0.85 : 0.95;
    setRate(nextRate);
    if (isPlaying && audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
        {isLoading ? (
          <button 
            disabled
            className="p-1.5 bg-indigo-50 text-indigo-400 rounded-lg cursor-not-allowed animate-pulse"
            title="Loading premium audio..."
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </button>
        ) : !isPlaying ? (
          <button 
            onClick={handlePlay}
            className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition shrink-0 cursor-pointer"
            title="Play Audio"
          >
            <Play className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={handlePause}
            className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition shrink-0 cursor-pointer"
            title="Pause Audio"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}
        
        <button 
          onClick={handleStop}
          disabled={!isPlaying && !isPaused && !isLoading}
          className={`p-1.5 rounded-lg transition shrink-0 cursor-pointer ${
            isPlaying || isPaused || isLoading
              ? "bg-rose-100 hover:bg-rose-200 text-rose-700" 
              : "bg-stone-50 text-stone-300 cursor-not-allowed"
          }`}
          title="Stop Audio"
        >
          <Square className="w-4 h-4" />
        </button>
        
        <button 
          onClick={toggleRate}
          className="px-2 py-1 flex items-center justify-center gap-1 bg-white hover:bg-stone-50 text-stone-600 rounded-lg border border-stone-200 text-[10px] font-black transition shrink-0 cursor-pointer"
          title="Playback Speed"
        >
          <FastForward className="w-3 h-3 text-stone-400" /> {rate}x
        </button>

        {/* Neural voice indicator badge */}
        {!isLoading && (isPlaying || isPaused) && (
          <div className="ml-auto pr-1 flex items-center gap-1">
            <span className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-[9px] font-bold text-indigo-600 px-1.5 py-0.5 rounded-md leading-none select-none">
              <Sparkles className="w-2.5 h-2.5" /> Neural Voice
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
