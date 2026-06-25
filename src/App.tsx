import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PantryItem, WeightRecord, UserProfile } from "./types";
import { 
  Sun, Moon, BookOpen, Scale, Utensils, ShoppingBag, 
  Mic, MicOff, Volume2, VolumeX, AlertCircle, Loader2, Check, MessageCircle, Heart, Key, Compass, ChevronLeft,
  ArrowLeft, Calendar, FileText, Sparkles, MessageSquare, Plus, ShoppingCart, HelpCircle, UserCheck, Play, Camera, Lock, CreditCard
} from "lucide-react";

import VoiceCompanionView from "./components/VoiceCompanionView";
import BlissAvatar from "./components/BlissAvatar";
import MorningConnectionCard from "./components/MorningConnectionCard";
import DailyReadingsCard from "./components/DailyReadingsCard";
import PlayRecoveryTimeButton from "./components/PlayRecoveryTimeButton";
import MealPlanCard from "./components/MealPlanCard";
import WeighInCard from "./components/WeighInCard";
import EveningInventoryCard from "./components/EveningInventoryCard";
import CalendarWorkspace from "./components/CalendarWorkspace";
import JournalCard from "./components/JournalCard";
import PinGate from "./components/PinGate";
import CollapsibleCard from "./components/CollapsibleCard";

import NotesWorkspace from "./components/NotesWorkspace";
import ProfilesView from "./components/ProfilesView";
import DailyFoodLogCard from "./components/DailyFoodLogCard";
import ScheduleWorkspace from "./components/ScheduleWorkspace";
import { uploadKeyToCloud, setupCloudSyncListener } from "./firebase";

// Global interception of localStorage.setItem to sync automatically to the cloud (Firestore)
const originalSetItem = window.localStorage.setItem;
window.localStorage.setItem = function(key: string, value: string) {
  originalSetItem.call(window.localStorage, key, value);
  uploadKeyToCloud(key, value);
};

// Global interception of localStorage.removeItem to clear sync values on deletions
const originalRemoveItem = window.localStorage.removeItem;
window.localStorage.removeItem = function(key: string) {
  originalRemoveItem.call(window.localStorage, key);
  uploadKeyToCloud(key, "");
};

export default function App() {
  const APP_VERSION = "1.1.2";
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [syncVersion, setSyncVersion] = useState(0);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch("/api/version");
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (data && data.version && data.version !== APP_VERSION) {
            console.log(`[Version Check] New version available: ${data.version} (current: ${APP_VERSION})`);
            setUpdateAvailable(true);
          }
        }
      } catch (err) {
        console.error("Failed to check app version:", err);
      }
    };
    checkVersion();
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const [currentUser, setCurrentUser] = useState<"Rhon" | "Suz">("Rhon");
  const [muteVoice, setMuteVoice] = useState(true);
  const [isSpeakingOut, setIsSpeakingOut] = useState(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isBlessyPaused, setIsBlessyPaused] = useState(() => {
    return localStorage.getItem("forlife_bliss_paused") === "true";
  });

  const handleTogglePauseBlessy = () => {
    const nextVal = !isBlessyPaused;
    setIsBlessyPaused(nextVal);
    localStorage.setItem("forlife_bliss_paused", String(nextVal));
    if (nextVal) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      setIsSpeakingOut(false);
    }
  };

  // Selected date defaulted to local today
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split("T")[0];
  });

  const [morningCompleted, setMorningCompleted] = useState(false);
  const [readingsCompleted, setReadingsCompleted] = useState(false);
  const [eveningCompleted, setEveningCompleted] = useState(false);

  const [morningExpanded, setMorningExpanded] = useState(true);
  const [readingsExpanded, setReadingsExpanded] = useState(false);
  const [eveningExpanded, setEveningExpanded] = useState(false);

  // Sync completion states whenever currentUser or selectedDate changes
  useEffect(() => {
    const morningKey = `forlife_morning_completed_${currentUser}_${selectedDate}`;
    const readingsKey = `forlife_readings_completed_${currentUser}_${selectedDate}`;
    const eveningKey = `forlife_evening_completed_${currentUser}_${selectedDate}`;

    const isMorningDone = localStorage.getItem(morningKey) === "true";
    const isReadingsDone = localStorage.getItem(readingsKey) === "true";
    const isEveningDone = localStorage.getItem(eveningKey) === "true";

    setMorningCompleted(isMorningDone);
    setReadingsCompleted(isReadingsDone);
    setEveningCompleted(isEveningDone);

    // Auto-expansion rules based on sequential step logic
    if (!isMorningDone) {
      setMorningExpanded(true);
      setReadingsExpanded(false);
      setEveningExpanded(false);
    } else if (!isEveningDone) {
      setMorningExpanded(false);
      setReadingsExpanded(false);
      setEveningExpanded(true);
    } else {
      setMorningExpanded(false);
      setReadingsExpanded(false);
      setEveningExpanded(false);
    }
  }, [currentUser, selectedDate, syncVersion]);

  // Current active workspace: 'home' represents the pristine launcher grid, other IDs launch full screens 
  const [activeWorkspace, setActiveWorkspace] = useState<string>("home");
  const [profileUnlockTarget, setProfileUnlockTarget] = useState<"Rhon" | "Suz" | null>(null);

  const [sessionUnlocked, setSessionUnlocked] = useState(false);
  const [pinEntry, setPinEntry] = useState("");
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [pinError, setPinError] = useState("");

  const requestWorkspaceChange = (workspace: string) => {
    const isProtected = ["profiles", "notes"].includes(workspace);
    
    if (workspace === "home" || !isProtected) {
      setActiveWorkspace(workspace);
      return;
    }
    
    // Attempting to enter private workspace
    const currentProfileData = currentUser === "Rhon" ? rhonProfile : suzProfile;
    if (!currentProfileData?.pin) {
      setIsSettingPin(true);
      setPinEntry("");
      setPinError("");
      setProfileUnlockTarget(workspace as any);
      setActiveWorkspace("lockscreen");
    } else if (!sessionUnlocked) {
      setIsSettingPin(false);
      setPinEntry("");
      setPinError("");
      setActiveWorkspace("lockscreen");
      // Store the intent
      setProfileUnlockTarget(workspace as any);
    } else {
      setActiveWorkspace(workspace);
    }
  };

  const handleLockSession = () => {
    setSessionUnlocked(false);
    setActiveWorkspace("home");
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentProfileData = currentUser === "Rhon" ? rhonProfile : suzProfile;

    if (isSettingPin) {
      if (pinEntry.length >= 4) {
        handleUpdateProfile(currentUser.toLowerCase() as "rhon" | "suz", { pin: pinEntry });
        setSessionUnlocked(true);
        setActiveWorkspace(profileUnlockTarget ? (profileUnlockTarget as unknown as string) : "home");
        setProfileUnlockTarget(null);
      } else {
        setPinError("PIN must be at least 4 digits");
      }
    } else {
      if (pinEntry === currentProfileData?.pin) {
        setSessionUnlocked(true);
        setActiveWorkspace(profileUnlockTarget ? (profileUnlockTarget as unknown as string) : "home");
        setProfileUnlockTarget(null);
      } else {
        setPinError("Incorrect PIN");
        setPinEntry("");
      }
    }
  };

  const [primaryLogo, setPrimaryLogo] = useState(() => {
    return localStorage.getItem("forlife_logo_primary") || localStorage.getItem("forlife_custom_logo") || "/logo.png";
  });

  const [secondaryLogo, setSecondaryLogo] = useState(() => {
    return localStorage.getItem("forlife_logo_secondary") || "/logo.png";
  });

  const compressImageFile = (file: File, callback: (base64: string) => void) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 250;
      const MAX_HEIGHT = 250;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      
      const compressedBase64 = canvas.toDataURL("image/webp", 0.65);
      callback(compressedBase64);
    };
    img.src = URL.createObjectURL(file);
  };

  const handlePrimaryLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImageFile(file, (base64) => {
        setPrimaryLogo(base64);
        try {
          localStorage.setItem("forlife_logo_primary", base64);
        } catch (err) {
          console.error("Quota exceeded:", err);
          alert("Storage limit reached! The primary logo could not be saved permanently, but is visible for this session.");
        }
      });
    }
  };

  const handleSecondaryLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImageFile(file, (base64) => {
        setSecondaryLogo(base64);
        try {
          localStorage.setItem("forlife_logo_secondary", base64);
        } catch (err) {
          console.error("Quota exceeded:", err);
          alert("Storage limit reached! The secondary logo could not be saved permanently, but is visible for this session.");
        }
      });
    }
  };

  // User Profiles State
  const [rhonProfile, setRhonProfile] = useState(() => {
    const saved = localStorage.getItem("forlife_rhon_profile_v3");
    if (saved) return JSON.parse(saved);
    return {
      name: "Rhon",
      age: 47,
      currentWeight: 154,
      goalWeight: 145,
      goals: ["Sustainable weight loss", "Sober consistency", "Daily movement"],
      glutenFree: false,
      lowSugar: true,
      recoveryNote: "AA (15 yrs sober)",
      meds: "Vyvanse",
      supplements: "",
      allergies: "",
      foodRestrictions: "lower sugar",
      preferences: "Enjoys voice check-ins with Bliss",
      streak: 5,
      badges: []
    };
  });

  const [suzProfile, setSuzProfile] = useState(() => {
    const saved = localStorage.getItem("forlife_suz_profile_v3");
    if (saved) return JSON.parse(saved);
    return {
      name: "Suz",
      age: 45,
      currentWeight: 160,
      goalWeight: 155,
      goals: ["Portion control", "Regular walking", "Meal prep consistency"],
      glutenFree: false,
      lowSugar: false,
      recoveryNote: "Overeaters Anon (OA)",
      meds: "Wegovy",
      supplements: "",
      allergies: "",
      foodRestrictions: "",
      preferences: "Shares kitchen & meals with Rhon. Standard or custom portion size.",
      streak: 3,
      badges: []
    };
  });

  // Core persistent states
  const [pantryList, setPantryList] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem("forlife_pantry_v3");
    if (saved) return JSON.parse(saved);
    return [];
  });

  const handleUpdateProfile = (user: "rhon" | "suz", fields: any) => {
    if (user === "rhon") {
      const updated = { ...rhonProfile, ...fields };
      setRhonProfile(updated);
      localStorage.setItem("forlife_rhon_profile_v3", JSON.stringify(updated));
    } else {
      const updated = { ...suzProfile, ...fields };
      setSuzProfile(updated);
      localStorage.setItem("forlife_suz_profile_v3", JSON.stringify(updated));
    }
  };

  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>(() => {
    const saved = localStorage.getItem("forlife_weight_history_v3");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [journalEntries, setJournalEntries] = useState<any[]>(() => {
    const saved = localStorage.getItem("forlife_journal_entries_v3");
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Bliss Conversation State (Renamed reference requested: "Chat with Bliss")
  const [chatHistory, setChatHistory] = useState<{ sender: "user" | "bliss"; text: string }[]>(() => {
    const saved = localStorage.getItem("forlife_bliss_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { sender: "bliss", text: "Welcome! Bliss here, your supportive companion and recovery guide. ☀️ Tell me what's on your mind, update your pantry, or let's outline our healthy meal plans!" }
    ];
  });

  // Setup real-time cloud data sync listener
  useEffect(() => {
    const unsubscribe = setupCloudSyncListener((key, value) => {
      console.log(`[Cloud Sync] Received update for key: ${key}`);
      
      // Update matching local React states in App.tsx if they are actively loaded
      if (key === "forlife_rhon_profile_v3") {
        try { setRhonProfile(JSON.parse(value)); } catch (e) {}
      } else if (key === "forlife_suz_profile_v3") {
        try { setSuzProfile(JSON.parse(value)); } catch (e) {}
      } else if (key === "forlife_pantry_v3") {
        try { setPantryList(JSON.parse(value)); } catch (e) {}
      } else if (key === "forlife_weight_history_v3") {
        try { setWeightHistory(JSON.parse(value)); } catch (e) {}
      } else if (key === "forlife_journal_entries_v3") {
        try { setJournalEntries(JSON.parse(value)); } catch (e) {}
      } else if (key === "forlife_bliss_chat_history") {
        try { setChatHistory(JSON.parse(value)); } catch (e) {}
      } else if (key === "forlife_bliss_paused") {
        setIsBlessyPaused(value === "true");
      }
      
      // Force workspace and card remounts/re-evaluations to pull the fresh localStorage values
      setSyncVersion((v) => v + 1);
    });
    
    return () => unsubscribe();
  }, []);

  const [inputText, setInputText] = useState("");
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState("");
  const recognitionRef = useRef<any>(null);

  // Confirmation Modal and Undo Toast State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    onConfirm: () => void;
    message?: string;
  } | null>(null);

  const [undoToast, setUndoToast] = useState<{
    visible: boolean;
    message: string;
    onUndo: () => void;
  } | null>(null);

  useEffect(() => {
    const handleTrigger = (e: any) => {
      const { onDelete, onUndo, message } = e.detail || {};
      if (!onDelete) return;

      setDeleteConfirm({
        isOpen: true,
        message: message || "Are you sure you want to delete this item?",
        onConfirm: () => {
          onDelete();
          setDeleteConfirm(null);
          
          if (onUndo) {
            setUndoToast({
              visible: true,
              message: message ? `${message}` : "Item deleted",
              onUndo: () => {
                onUndo();
                setUndoToast(null);
              }
            });

            // Auto dismiss toast after 6 seconds
            setTimeout(() => {
              setUndoToast(prev => {
                if (prev && prev.message === (message || "Item deleted")) {
                  return null;
                }
                return prev;
              });
            }, 6000);
          }
        }
      });
    };

    window.addEventListener("trigger-delete-confirm" as any, handleTrigger);
    return () => window.removeEventListener("trigger-delete-confirm" as any, handleTrigger);
  }, []);

  // Init speech recognition
  useEffect(() => {
    const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechClass) {
      const rec = new SpeechClass();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setRecognitionError("");
      };

      rec.onresult = (e: any) => {
        const transText = e.results[0][0].transcript;
        if (transText) {
          setInputText(prev => prev ? prev + " " + transText : transText);
        }
      };

      rec.onerror = (err: any) => {
        console.warn("Speech recognition error: ", err.error);
        if (err.error === "not-allowed") {
          setRecognitionError("Permission to use microphone is held. Type manually below instead!");
        } else {
          setRecognitionError(`Mic error: ${err.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      setRecognitionError("Speech recognition is not supported in this frame. Type below!");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setRecognitionError("");
      setMuteVoice(false);
      try {
        if (activeAudioRef.current) {
          activeAudioRef.current.pause();
          activeAudioRef.current = null;
        }
        setIsSpeakingOut(false);
        recognitionRef.current.start();
      } catch (e) {
        console.error("Speech recognition start failed:", e);
      }
    }
  };

  // TTS helper
  const speakText = async (text: string) => {
    if (localStorage.getItem("forlife_bliss_paused") === "true") return;
    if (muteVoice) return;

    // Stop active audio if any
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    setIsSpeakingOut(false);

    // Clean emojis
    const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").trim();
    if (!cleanText) return;

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: cleanText
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy call failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.audioContent) {
        throw new Error("No audio content in proxy response");
      }

      // Format as direct base64 source to avoid iframe and sandbox constraints
      const dataUrl = `data:audio/mp3;base64,${data.audioContent}`;

      if (!activeAudioRef.current) {
        activeAudioRef.current = new Audio();
      }

      const audio = activeAudioRef.current;
      audio.src = dataUrl;
      audio.volume = 1.0;

      audio.onplay = () => setIsSpeakingOut(true);
      audio.onended = () => {
        setIsSpeakingOut(false);
      };

      audio.onerror = () => {
        setIsSpeakingOut(false);
      };

      setIsSpeakingOut(true);
      await audio.play();
    } catch (err: any) {
      setIsSpeakingOut(false);
      const isAbortError = err?.name === "AbortError" || err?.message?.includes("interrupted by a call to pause");
      if (!isAbortError) {
        console.warn("Unable to generate Google Cloud TTS for companion response:", err);
      } else {
        console.log("Companion audio playback was cancelled or paused gracefully.");
      }
    }
  };

  // Submit trigger to Bliss
  const handleSendChat = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const cleanPrompt = customPrompt || inputText;
    if (!cleanPrompt.trim()) return;

    if (localStorage.getItem("forlife_bliss_paused") === "true") {
      alert("Blessy is currently paused. Resume her using the button to process commands!");
      return;
    }

    // Pre-initialize activeAudioRef inside user click thread to comply with browser autoplay gesture rules
    if (!activeAudioRef.current) {
      activeAudioRef.current = new Audio();
    }
    activeAudioRef.current.volume = 1.0;

    // Add user message to log
    const newUserMsg = { sender: "user" as const, text: cleanPrompt };
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);
    localStorage.setItem("forlife_bliss_chat_history", JSON.stringify(updatedHistory));
    setInputText("");

    setIsProcessingChat(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanPrompt,
          userName: currentUser === "Rhon" ? "Rhonda" : "Susan",
          userContext: currentUser === "Rhon" ? "rhon" : "suz",
          pantryList: pantryList, // Direct array passing for synced pantry
          winsContent: "",
          recentCheckIn: null,
          history: chatHistory.slice(-5) // limit context history to keep chat responsive
        })
      });

      const data = await res.json();
      if (data.reply) {
        const newBlissMsg = { sender: "bliss" as const, text: data.reply };
        const withReply = [...updatedHistory, newBlissMsg];
        setChatHistory(withReply);
        localStorage.setItem("forlife_bliss_chat_history", JSON.stringify(withReply));
        speakText(data.reply);
      }

      // If active pantry sync item actions were taken by Blessy
      if (data.updatedPantry) {
        setPantryList(data.updatedPantry);
        localStorage.setItem("forlife_pantry_v3", JSON.stringify(data.updatedPantry));
      }
    } catch (e) {
      console.error(e);
      const fallbackMsg = { sender: "bliss" as const, text: "Hey! My connection feels a bit fuzzy. Let me know what you need again, friend! 💛" };
      setChatHistory(prev => [...prev, fallbackMsg]);
    } finally {
      setIsProcessingChat(false);
    }
  };

  const triggerBlissSpeechInteraction = (prompt: string) => {
    handleSendChat(undefined, prompt);
  };

  const handleAddWeight = (weight: number, notes: string, date?: string) => {
    let formattedDate = new Date().toLocaleDateString([], { month: "short", day: "numeric" });
    if (date) {
      try {
        const dObj = new Date(date + "T00:00:00");
        formattedDate = dObj.toLocaleDateString([], { month: "short", day: "numeric" });
      } catch (e) {}
    }

    const newItem: WeightRecord = {
      id: "wt_" + Date.now(),
      date: formattedDate,
      weight,
      notes: notes.trim(),
      user: currentUser
    };

    const updated = [...weightHistory, newItem];
    setWeightHistory(updated);
    localStorage.setItem("forlife_weight_history_v3", JSON.stringify(updated));
  };

  const handleAddJournalEntry = (content: string, type: string, overrideUser?: "Rhon" | "Suz") => {
    const newEntry = {
      id: "j_" + Date.now().toString() + Math.floor(Math.random()*100),
      user: overrideUser || currentUser,
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content,
      type
    };

    const updated = [newEntry, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem("forlife_journal_entries_v3", JSON.stringify(updated));
  };

  const handleEditJournalEntry = (id: string, newContent: string) => {
    const updated = journalEntries.map((j) =>
      j.id === id ? { ...j, content: newContent } : j
    );
    setJournalEntries(updated);
    localStorage.setItem("forlife_journal_entries_v3", JSON.stringify(updated));
  };

  const handleDeleteJournalEntry = (id: string) => {
    const updated = journalEntries.filter(j => j.id !== id);
    setJournalEntries(updated);
    localStorage.setItem("forlife_journal_entries_v3", JSON.stringify(updated));
  };

  const handleSwitchUser = (user: "Rhon" | "Suz") => {
    // Silent switch without opening chat to stay on Wellness Hub
    if (user !== currentUser) {
      setCurrentUser(user);
      setSessionUnlocked(false);
      setActiveWorkspace("home");
    }
  };

  // Human readable date display for the header
  const getReadableFormattedDate = () => {
    try {
      const d = new Date(selectedDate + "T00:00:00");
      return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    } catch(e) {
      return selectedDate;
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-stone-900 selection:bg-stone-200 pb-16 relative font-sans">
      
      {/* UPDATE NOTIFICATION BANNER */}
      {updateAvailable && (
        <div className="bg-indigo-600 text-white text-xs py-2.5 px-4 flex items-center justify-between gap-3 font-semibold shadow-md relative z-[9999] animate-fade-in border-b border-indigo-700">
          <div className="flex items-center gap-2 max-w-[80%]">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span>
              A new version of <strong>Friends for Life</strong> is available with recent updates!
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              // Refresh page while clearing cache
              window.location.reload();
            }}
            className="bg-white/15 hover:bg-white/25 text-white font-extrabold px-3 py-1 rounded-xl transition text-[11px] uppercase tracking-wider shrink-0 cursor-pointer border border-white/20"
          >
            Refresh App
          </button>
        </div>
      )}
      
      {/* Dynamic Header */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-30 shadow-3xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <label className="cursor-pointer relative group/seclogo flex items-center justify-center shrink-0 p-1" title="Click to Change Secondary Logo">
              <img src={secondaryLogo} alt="Friend4Life Secondary Logo" className="w-[10vw] max-w-[40px] min-w-[32px] h-auto max-w-full object-contain rounded-xl shadow-sm transition-transform group-hover/seclogo:scale-105" />
              <div className="absolute inset-1 bg-slate-955/65 rounded-xl flex items-center justify-center opacity-0 group-hover/seclogo:opacity-100 transition-opacity">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" aria-label="Upload secondary logo" onChange={handleSecondaryLogoUpload} />
            </label>
            <span 
              onClick={() => setActiveWorkspace("home")}
              className="text-xs font-black tracking-wider uppercase text-slate-800 font-mono cursor-pointer hover:opacity-80 transition block w-full text-center sm:text-left py-1"
            >
              Friend4Life
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            {/* Realtime Date display */}
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 border border-stone-200 rounded-xl text-[11px] font-black uppercase text-stone-500 font-mono">
              <Calendar className="w-3.5 h-3.5 text-stone-400" /> {getReadableFormattedDate()}
            </span>

            {/* Profile switcher */}
            <div className="flex bg-stone-100 border border-stone-250/75 rounded-xl p-0.5 items-center">
              <button
                type="button"
                onClick={() => handleSwitchUser("Rhon")}
                className={`px-3 py-1.2 rounded-lg text-[10.5px] font-black transition-all cursor-pointer ${
                  currentUser === "Rhon" 
                    ? "bg-slate-950 text-white shadow-xs" 
                    : "text-slate-505 hover:text-slate-800"
                }`}
              >
                Rhonda
              </button>
              <button
                type="button"
                onClick={() => handleSwitchUser("Suz")}
                className={`px-3 py-1.2 rounded-lg text-[10.5px] font-black transition-all cursor-pointer ${
                  currentUser === "Suz" 
                    ? "bg-slate-950 text-white shadow-xs" 
                    : "text-slate-505 hover:text-slate-800"
                }`}
              >
                Susan
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        
        {activeWorkspace === "home" ? (
          /* SIMPLE & UNCLUTTERED HOME SCREEN - BENTO LAUNCHER GRID */
          <div className="space-y-6">
            
            {/* Quick Greeting Panel */}
            <div className="flex flex-col items-center justify-center pt-2 pb-6 px-4">
                <label className="cursor-pointer relative inline-block group/logo text-center p-2" title="Click to Change Primary Logo">
                  <img src={primaryLogo} alt="Friend4Life Primary Logo" className="w-[30vw] max-w-[144px] min-w-[96px] h-auto max-w-full object-contain rounded-full shadow-md drop-shadow-sm transition-opacity group-hover/logo:opacity-80 mx-auto" />
                  <div className="absolute inset-2 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity">
                    <div className="bg-slate-900/70 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Camera className="w-3 h-3" /> Change Primary Logo
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" aria-label="Upload primary logo" onChange={handlePrimaryLogoUpload} />
                </label>
            </div>


            {/* Launcher Grid - 5 Large Squares */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. One Day at a Time – Soft Blue */}
                <button
                  type="button"
                  onClick={() => requestWorkspaceChange("oneday")}
                  className="aspect-square p-6 md:p-8 bg-blue-100/70 border border-blue-200 rounded-3xl text-center hover:bg-blue-200/80 transition-all cursor-pointer shadow-3xs group flex flex-col items-center justify-center gap-4 hover:-translate-y-1"
                >
                  <div className="w-16 h-16 rounded-full bg-white text-blue-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Sun className="w-8 h-8" />
                  </div>
                  <h3 className="font-sans font-black text-[#1e3a8a] text-xl md:text-2xl leading-none m-0">One Day at a Time</h3>
                  <p className="text-xs text-blue-700/80 font-semibold m-0 px-4">Daily reflections & spiritual focus</p>
                </button>

                {/* 2. Profiles – Soft Green */}
                <button
                  type="button"
                  onClick={() => requestWorkspaceChange("profiles")}
                  className="aspect-square p-6 md:p-8 bg-green-100/70 border border-green-200 rounded-3xl text-center hover:bg-green-200/80 transition-all cursor-pointer shadow-3xs group flex flex-col items-center justify-center gap-4 hover:-translate-y-1"
                >
                  <div className="w-16 h-16 rounded-full bg-white text-green-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <h3 className="font-sans font-black text-[#14532d] text-xl md:text-2xl leading-none m-0">Profiles</h3>
                  <p className="text-xs text-green-700/80 font-semibold m-0 px-4">Manage household profiles & settings</p>
                </button>

                {/* 3. Pantry & Meals – Soft Peach */}
                <button
                  type="button"
                  onClick={() => requestWorkspaceChange("pantry")}
                  className="aspect-square p-6 md:p-8 bg-orange-100/70 border border-orange-200 rounded-3xl text-center hover:bg-orange-200/80 transition-all cursor-pointer shadow-3xs group flex flex-col items-center justify-center gap-4 hover:-translate-y-1"
                >
                  <div className="w-16 h-16 rounded-full bg-white text-orange-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Utensils className="w-8 h-8" />
                  </div>
                  <h3 className="font-sans font-black text-[#7c2d12] text-xl md:text-2xl leading-none m-0">Pantry & Meals</h3>
                  <p className="text-xs text-orange-700/80 font-semibold m-0 px-4">Nutrition planning using your stocks</p>
                </button>

                {/* 4. Calendar – Soft Lavender */}
                <button
                  type="button"
                  onClick={() => requestWorkspaceChange("calendar")}
                  className="aspect-square p-6 md:p-8 bg-purple-100/70 border border-purple-200 rounded-3xl text-center hover:bg-purple-200/80 transition-all cursor-pointer shadow-3xs group flex flex-col items-center justify-center gap-4 hover:-translate-y-1"
                >
                  <div className="w-16 h-16 rounded-full bg-white text-purple-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="font-sans font-black text-[#4c1d95] text-xl md:text-2xl leading-none m-0">Calendar</h3>
                  <p className="text-xs text-purple-700/80 font-semibold m-0 px-4">View your historic recovery data</p>
                </button>
                
                {/* 5. Notes & Journaling – Soft Yellow */}
                <button
                  type="button"
                  onClick={() => requestWorkspaceChange("notes")}
                  className="aspect-square p-6 md:p-8 bg-yellow-100/70 border border-yellow-200 rounded-3xl text-center hover:bg-yellow-200/80 transition-all cursor-pointer shadow-3xs group flex flex-col items-center justify-center gap-4 hover:-translate-y-1"
                >
                  <div className="w-16 h-16 rounded-full bg-white text-yellow-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="font-sans font-black text-[#713f12] text-xl md:text-2xl leading-none m-0">Notes & Journaling</h3>
                  <p className="text-xs text-yellow-700/80 font-semibold m-0 px-4">Securely auto-organized by individual profile</p>
                </button>

                {/* 6. Bi-Weekly Schedule – Soft Cyan */}
                <button
                  type="button"
                  onClick={() => requestWorkspaceChange("schedule")}
                  className="aspect-square p-6 md:p-8 bg-cyan-100/70 border border-cyan-200 rounded-3xl text-center hover:bg-cyan-200/80 transition-all cursor-pointer shadow-3xs group flex flex-col items-center justify-center gap-4 hover:-translate-y-1"
                >
                  <div className="w-16 h-16 rounded-full bg-white text-cyan-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="font-sans font-black text-[#164e63] text-xl md:text-2xl leading-none m-0">Schedule & Payments</h3>
                  <p className="text-xs text-cyan-800/80 font-semibold m-0 px-4">Bi-weekly budgeting and payments toggle</p>
                </button>

              </div>
            </div>

          </div>
        ) : activeWorkspace === "lockscreen" ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 min-w-[320px]">
              <Lock className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                {isSettingPin ? "Create Your PIN" : "Enter Your PIN"}
              </h2>
              <p className="text-stone-500 text-sm mb-6 font-semibold">
                {isSettingPin 
                  ? "Secure your private profile and journals." 
                  : `Please enter the PIN for ${currentUser}'s profile.`}
              </p>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <input 
                  type="password" 
                  autoFocus
                  inputMode="numeric"
                  maxLength={4}
                  value={pinEntry}
                  onChange={(e) => setPinEntry(e.target.value)}
                  className="w-full text-center tracking-[1em] text-2xl font-extrabold p-3 rounded-2xl bg-stone-100 border-2 border-stone-300 focus:border-indigo-500 focus:outline-none"
                  placeholder="••••"
                />
                
                {pinError && (
                  <p className="text-rose-500 text-xs font-bold">{pinError}</p>
                )}

                <button 
                  type="submit" 
                  className="w-full py-3 bg-slate-950 text-white font-black rounded-xl hover:bg-slate-800 transition-colors"
                >
                  {isSettingPin ? "Save & Lock Profile" : "Unlock"}
                </button>
              </form>

              <button
                onClick={() => setActiveWorkspace("home")}
                className="mt-6 text-sm font-bold text-stone-400 hover:text-stone-600 cursor-pointer transition-colors"
              >
                Go back
              </button>
            </div>
          </div>
        ) : (
          /* FULL-SCREEN WORKSPACE FOCUS CONTAINER FRAME */
          <div className="space-y-4 animate-fade-in relative z-20">
            
            {/* Header controls inside the full screen workspace representing strict demands */}
            <div className="bg-slate-900 text-white shadow-md rounded-2xl p-4.5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setActiveWorkspace("home")}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl cursor-pointer transition flex items-center justify-center border border-white/15 text-xs font-black"
                >
                  ◀ Back to Wellness Hub
                </button>
                <div className="h-6 w-px bg-white/20 hidden md:block" />
                <div>
                  <span className="text-[10px] text-indigo-300 font-extrabold uppercase font-mono tracking-wider block">Currently focusing on</span>
                  <h2 className="text-sm font-black m-0 leading-tight">
                    {activeWorkspace === "chat" && "💬 Chat with Bliss Companion"}
                    {activeWorkspace === "morning" && "☀️ Morning Connection & Intention"}
                    {activeWorkspace === "readings" && "📖 Daily Recovery Readings"}
                    {activeWorkspace === "pantry" && "🧺 Pantry & Meal Planning"}
                    {activeWorkspace === "mealplan" && "🍽️ Pantry & Meal Planning"}
                    {activeWorkspace === "weight" && "⚖️ Weight Progress & Bio Metrics"}
                    {activeWorkspace === "evening" && "🌙 Evening Check-In & Step 10"}
                    {activeWorkspace === "calendar" && "📅 Integrated Activity Calendar"}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 bg-white/5 p-1.5 rounded-xl border border-white/10">
                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => {
                      const d = new Date(selectedDate + "T00:00:00");
                      d.setDate(d.getDate() - 1);
                      setSelectedDate(d.toISOString().substring(0, 10));
                    }}
                    className="p-1 px-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-black transition cursor-pointer"
                  >
                    ◄
                  </button>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => { if(e.target.value) setSelectedDate(e.target.value); }}
                    className="bg-slate-950 border border-white/20 rounded-lg p-1 text-xs text-white font-extrabold focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer text-center"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const d = new Date(selectedDate + "T00:00:00");
                      d.setDate(d.getDate() + 1);
                      setSelectedDate(d.toISOString().substring(0, 10));
                    }}
                    className="p-1 px-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-black transition cursor-pointer"
                  >
                    ►
                  </button>
                </div>

                <div className="h-4 w-px bg-white/10" />

                <button
                  type="button"
                  onClick={() => {
                    const flashMsg = `${activeWorkspace.toUpperCase()} details securely cached.`;
                    speakText(flashMsg);
                    alert(flashMsg);
                  }}
                  className="px-3.5 py-1 text-stone-900 bg-amber-400 font-extrabold text-xs uppercase tracking-wider rounded-lg hover:bg-amber-300 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3px]" /> Save & Sync
                </button>
              </div>
            </div>

            {/* Sub-panels display */}
            <div key={syncVersion} className="bg-white border border-stone-200 p-5 rounded-3xl shadow-3xs min-h-[400px]">
              {activeWorkspace === "chat" && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-2.5 bg-slate-50 border border-stone-150 rounded-2xl">
                    <BlissAvatar state={isSpeakingOut ? "speaking" : isProcessingChat ? "thinking" : "happy"} />
                    <div className="text-center mt-2">
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        {isSpeakingOut ? "Bliss is Speaking" : isProcessingChat ? "Bliss is Thinking..." : "Bliss Companion"}
                      </span>
                    </div>
                  </div>

                  <div className="border border-stone-150 rounded-2xl bg-white p-4 space-y-3.5 max-h-96 overflow-y-auto">
                    {chatHistory.map((msg, index) => {
                      const isBliss = msg.sender === "bliss";
                      return (
                        <div key={index} className={`flex ${isBliss ? "justify-start" : "justify-end"}`}>
                          <div 
                            className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed font-semibold shadow-3xs ${
                              isBliss 
                                ? "bg-stone-50 border border-stone-150 text-slate-850 rounded-tl-none" 
                                : "bg-slate-900 border border-slate-950 text-white rounded-tr-none"
                            }`}
                          >
                            <p className="m-0 whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between border-t border-stone-100 pt-3 flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleListening}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                          isListening 
                            ? "bg-amber-400 text-slate-950 border-amber-500 scale-103" 
                            : "bg-slate-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                      <span className="text-[10.5px] font-bold text-slate-500 font-mono">
                        {isListening ? "Listening... Speak now!" : "Mouthpiece Assist"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTogglePauseBlessy}
                        className={`p-1 px-3 border rounded-xl flex items-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                          isBlessyPaused 
                            ? "bg-amber-150 border-amber-300 text-amber-800 scale-103 animate-pulse" 
                            : "bg-stone-50 border-stone-200/80 text-stone-600 hover:text-slate-800"
                        }`}
                      >
                        {isBlessyPaused ? <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" /> : <Loader2 className="w-3.5 h-3.5 text-indigo-600" />}
                        {isBlessyPaused ? "Resume Blessy" : "Pause Blessy"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setMuteVoice(!muteVoice)}
                        className="p-1 px-3 bg-stone-50 border border-stone-200/80 text-stone-600 hover:text-slate-800 rounded-xl flex items-center gap-1.5 text-[11px] font-bold"
                      >
                        {muteVoice ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-600" />}
                        {muteVoice ? "Sound Muted" : "Voice On"}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSendChat} className="relative">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ask Bliss about meals, recipes, or seek wellness tips..."
                      className="w-full bg-stone-50 border border-stone-250 font-semibold focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl pl-3.5 pr-14 py-2.5 text-xs text-slate-800 shadow-3xs"
                    />
                    {inputText.trim() && (
                      <button
                        type="submit"
                        disabled={isProcessingChat}
                        className="absolute right-1.5 top-1.5 bg-slate-950 hover:bg-slate-850 text-white font-extrabold text-[10px] px-3.5 py-1.8 rounded-lg"
                      >
                        {isProcessingChat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "SEND"}
                      </button>
                    )}
                  </form>
                </div>
              )}

              {activeWorkspace === "oneday" && (
                <div className="space-y-6">
                  {(() => {
                    const morningCard = morningCompleted ? (
                      <div className="bg-emerald-50/50 border border-emerald-100 p-4.5 rounded-2xl md:rounded-3xl flex items-center justify-between shadow-3xs">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                            <Check className="w-5 h-5 stroke-[3px]" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm md:text-base text-slate-900 tracking-tight leading-snug">
                              1. Morning Inventory – Connected with God & Intention
                            </h3>
                            <span className="inline-block mt-0.5 text-[10px] font-black tracking-widest uppercase text-emerald-600 font-mono">
                              ✓ Completed for Today
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <CollapsibleCard
                        id="morning-journey"
                        title="1. Morning Inventory – Connect With God & Intention Setting"
                        icon={<Sun className="w-5 h-5 text-amber-500" />}
                        isOpen={morningExpanded}
                        onToggle={() => setMorningExpanded(!morningExpanded)}
                        themeColor="amber"
                        badge="Pending Required Step"
                      >
                        <MorningConnectionCard
                          currentUser={currentUser}
                          onAddJournalEntry={handleAddJournalEntry}
                          onBlissInteract={triggerBlissSpeechInteraction}
                          onSaveSuccess={() => {
                            localStorage.setItem(`forlife_morning_completed_${currentUser}_${selectedDate}`, "true");
                            setMorningCompleted(true);
                            setMorningExpanded(false);
                            // Set Step 10 Evening Inventory active automatically
                            setEveningExpanded(true);
                          }}
                        />
                      </CollapsibleCard>
                    );

                    const readingsCard = (
                      <CollapsibleCard
                        id="daily-readings"
                        title="2. Daily Readings & Guidance Notes (Optional)"
                        icon={<BookOpen className="w-5 h-5 text-indigo-500" />}
                        isOpen={readingsExpanded}
                        onToggle={() => setReadingsExpanded(!readingsExpanded)}
                        themeColor="indigo"
                        badge={readingsCompleted ? "✓ Read (Completed)" : "Optional / Reviewable"}
                      >
                        <DailyReadingsCard
                          currentUser={currentUser}
                          onBlissInteract={triggerBlissSpeechInteraction}
                          selectedDate={selectedDate}
                          setSelectedDate={setSelectedDate}
                          onAddEntry={handleAddJournalEntry}
                          onCompleteSuccess={() => {
                            localStorage.setItem(`forlife_readings_completed_${currentUser}_${selectedDate}`, "true");
                            setReadingsCompleted(true);
                            setReadingsExpanded(false); // Automatically minimize Daily Readings after completion
                          }}
                        />
                      </CollapsibleCard>
                    );

                    const eveningCard = (
                      <CollapsibleCard
                        id="evening-inventory"
                        title="3. Step 10 Evening Inventory"
                        icon={<Moon className="w-5 h-5 text-rose-500" />}
                        isOpen={eveningExpanded}
                        onToggle={() => {
                          if (morningCompleted) {
                            setEveningExpanded(!eveningExpanded);
                          } else {
                            alert("Please complete 1. Morning Inventory first!");
                          }
                        }}
                        themeColor="rose"
                        badge={eveningCompleted ? "✓ Completed" : "Pending Required Step"}
                      >
                        <EveningInventoryCard
                          currentUser={currentUser}
                          onAddJournalEntry={handleAddJournalEntry}
                          onBlissInteract={triggerBlissSpeechInteraction}
                          onSaveSuccess={() => {
                            // 1. Mark day as complete
                            localStorage.setItem(`forlife_evening_completed_${currentUser}_${selectedDate}`, "true");
                            setEveningCompleted(true);
                            setEveningExpanded(false);

                            // 2. Prepare for next day automatically
                            const current = new Date(selectedDate + "T12:00:00");
                            current.setDate(current.getDate() + 1);
                            const nextDateStr = current.toISOString().split("T")[0];
                            setSelectedDate(nextDateStr);

                            // 3. System closes daily workflow and returns to home Wellness Hub bento grid
                            setActiveWorkspace("home");

                            alert("All steps completed for today! System has closed the daily workflow and prepped for tomorrow.");
                          }}
                        />
                      </CollapsibleCard>
                    );

                    return (
                      <div className="space-y-6">
                        {morningCard}
                        {readingsCard}
                        {eveningCard}
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeWorkspace === "pantry" && (
                <div className="space-y-6">
                  <DailyFoodLogCard 
                    currentUser={currentUser}
                    selectedDate={selectedDate}
                  />
                  <MealPlanCard
                    currentUser={currentUser}
                    pantryList={pantryList}
                    setPantryList={setPantryList}
                    onBlissInteract={triggerBlissSpeechInteraction}
                    speakText={speakText}
                    selectedDate={selectedDate}
                  />
                </div>
              )}

              {activeWorkspace === "weight" && (
                <WeighInCard
                  currentUser={currentUser}
                  weightHistory={weightHistory}
                  setWeightHistory={setWeightHistory}
                  onAddWeight={handleAddWeight}
                  onBlissInteract={triggerBlissSpeechInteraction}
                />
              )}

              {/* Evening removed as it is now in oneday */}

              {activeWorkspace === "calendar" && (
                <CalendarWorkspace
                  currentUser={currentUser}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  weightHistory={weightHistory}
                />
              )}

              {activeWorkspace === "schedule" && (
                <ScheduleWorkspace />
              )}

              {activeWorkspace === "notes" && (
                <NotesWorkspace
                  currentUser={currentUser}
                  journalEntries={journalEntries}
                  onAddEntry={handleAddJournalEntry}
                  onEditEntry={handleEditJournalEntry}
                  onDeleteEntry={handleDeleteJournalEntry}
                  onBlissInteract={triggerBlissSpeechInteraction}
                  onLockSession={handleLockSession}
                />
              )}

              {activeWorkspace === "profiles" && (
                <ProfilesView
                  currentUser={currentUser}
                  rhonProfile={rhonProfile as UserProfile}
                  suzProfile={suzProfile as UserProfile}
                  weightHistory={weightHistory}
                  onAddWeight={handleAddWeight}
                  onDeleteWeight={(id) => {
                    const updated = weightHistory.filter(w => w.id !== id);
                    setWeightHistory(updated);
                    localStorage.setItem("forlife_weight_history_v3", JSON.stringify(updated));
                  }}
                  onUpdateProfile={handleUpdateProfile}
                  onLockSession={handleLockSession}
                />
              )}
            </div>

          </div>
        )}

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-40 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto grid grid-cols-6 gap-0.5 px-0.5 py-2">
          <button onClick={() => requestWorkspaceChange("oneday")} className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${activeWorkspace === "oneday" ? "text-indigo-600 bg-indigo-50/80" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}>
            <Sun className="w-5 h-5 mb-0.5" />
            <span className="text-[8.5px] sm:text-[9.5px] font-extrabold text-center leading-none tracking-tight">One Day</span>
          </button>
          <button onClick={() => requestWorkspaceChange("profiles")} className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${activeWorkspace === "profiles" ? "text-indigo-600 bg-indigo-50/80" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}>
            <UserCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[8.5px] sm:text-[9.5px] font-extrabold text-center leading-none tracking-tight">Profile</span>
          </button>
          <button onClick={() => requestWorkspaceChange("pantry")} className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${activeWorkspace === "pantry" ? "text-indigo-600 bg-indigo-50/80" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}>
            <Utensils className="w-5 h-5 mb-0.5" />
            <span className="text-[8.5px] sm:text-[9.5px] font-extrabold text-center leading-none tracking-tight">Meals</span>
          </button>
          <button onClick={() => requestWorkspaceChange("calendar")} className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${activeWorkspace === "calendar" ? "text-indigo-600 bg-indigo-50/80" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}>
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[8.5px] sm:text-[9.5px] font-extrabold text-center leading-none tracking-tight">Calendar</span>
          </button>
          <button onClick={() => requestWorkspaceChange("notes")} className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${activeWorkspace === "notes" ? "text-indigo-600 bg-indigo-50/80" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}>
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[8.5px] sm:text-[9.5px] font-extrabold text-center leading-none tracking-tight">Notes & Journal</span>
          </button>
          <button onClick={() => requestWorkspaceChange("schedule")} className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${activeWorkspace === "schedule" ? "text-indigo-600 bg-indigo-50/80" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}>
            <CreditCard className="w-5 h-5 mb-0.5" />
            <span className="text-[8.5px] sm:text-[9.5px] font-extrabold text-center leading-none tracking-tight">Bi-Weekly Payments</span>
          </button>
        </div>
      </nav>

      {/* Floating Bliss Companion Icon */}
      <button 
        type="button"
        onClick={() => requestWorkspaceChange("chat")}
        className="fixed top-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-750 transition-all z-40 hover:scale-105 active:scale-95"
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* If Bliss is "open", we just render it in an overlay or directly in the workspace container if that's easier. Currently "chat" is an activeWorkspace. Let's make it an overlay. */}
      {activeWorkspace === "chat" && (
        <VoiceCompanionView
          onClose={() => setActiveWorkspace("home")}
          onSendSpeech={(txt) => handleSendChat(undefined, txt)}
          lastReplyText={chatHistory.filter(c => c.sender === "bliss").pop()?.text || ""}
          isBlissSpeaking={isSpeakingOut}
          isBlissReplying={isProcessingChat}
          muteVoice={muteVoice}
          setMuteVoice={setMuteVoice}
          speakText={speakText}
          isBlessyPaused={isBlessyPaused}
          onTogglePauseBlessy={handleTogglePauseBlessy}
          stopSpeaking={() => {
            if (activeAudioRef.current) {
              activeAudioRef.current.pause();
              activeAudioRef.current = null;
            }
            setIsSpeakingOut(false);
          }}
        />
      )}

      {/* GLOBAL DELETE CONFIRMATION MODAL */}
      {deleteConfirm?.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-xl">⚠️</div>
              <h3 className="text-base font-black text-slate-900">Are you sure you want to delete this item?</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">This action will remove the item from active records.</p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold text-slate-600 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteConfirm.onConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL UNDO TOAST */}
      {undoToast?.visible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-4 z-[9999] min-w-[300px] justify-between animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">●</span>
            <span className="text-xs font-bold">{undoToast.message}</span>
          </div>
          <button
            type="button"
            onClick={undoToast.onUndo}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-emerald-300 border border-slate-700 text-xs font-extrabold text-white rounded-lg transition cursor-pointer uppercase tracking-wider"
          >
            Undo
          </button>
        </div>
      )}

    </div>
  );
}
