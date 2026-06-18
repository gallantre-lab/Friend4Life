import React, { useState, useEffect } from "react";
import { Mic, Check, Loader2, List, Trash2, Copy, Edit2, Play, Sparkles } from "lucide-react";

interface DailyFoodLogCardProps {
  currentUser: "Rhon" | "Suz";
  selectedDate: string;
}

export interface FoodLog {
  id: string;
  date: string;
  user: "Rhon" | "Suz";
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  estimatedCalories: number;
}

export default function DailyFoodLogCard({
  currentUser,
  selectedDate
}: DailyFoodLogCardProps) {
  const [logs, setLogs] = useState<FoodLog[]>(() => {
    const saved = localStorage.getItem("forlife_food_logs_v1");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const [calorieGoals, setCalorieGoals] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("forlife_calorie_goals");
    if (saved) return JSON.parse(saved);
    return { Rhon: 1500, Suz: 1800 };
  });

  const [naturalInput, setNaturalInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavedMsg, setIsSavedMsg] = useState(false);

  // Recognition for dictation
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef<any>(null);
  const silenceTimerRef = React.useRef<any>(null);
  const initialValueRef = React.useRef<string>("");

  useEffect(() => {
    const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechClass) {
      const rec = new SpeechClass();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";
      
      rec.onstart = () => {
        setIsListening(true);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          rec.stop();
        }, 25000); // 25 seconds initial silence timeout
      };

      rec.onresult = (e: any) => {
        // Reset our safety silence timer since speech was captured
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          rec.stop();
        }, 25000); // 25 seconds of silence allowed between utterances

        let sessionText = "";
        for (let i = 0; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            sessionText += e.results[i][0].transcript + " ";
          }
        }

        if (sessionText) {
          const lowerText = sessionText.trim().toLowerCase();
          const hasStopWord = 
            lowerText.endsWith("done recording") || 
            lowerText.endsWith("done") || 
            lowerText.endsWith("finish") || 
            lowerText.includes("done recording") ||
            lowerText.includes("finish");

          if (hasStopWord) {
            const cleanedText = sessionText
              .replace(/done recording/gi, "")
              .replace(/done/gi, "")
              .replace(/finish/gi, "")
              .replace(/\s+/g, " ")
              .trim();
            
            setNaturalInput(() => {
              return initialValueRef.current ? initialValueRef.current + " " + cleanedText : cleanedText;
            });
            rec.stop();
            return;
          }

          setNaturalInput(() => {
            return initialValueRef.current ? initialValueRef.current + " " + sessionText.trim() : sessionText.trim();
          });
        }
      };

      rec.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      };

      recognitionRef.current = rec;
    }
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      initialValueRef.current = naturalInput;
      recognitionRef.current.start();
    }
  };

  const handleProcessLog = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/food-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logText: naturalInput, userContext: currentUser })
      });
      const data = await res.json();
      
      const newLog: FoodLog = {
        id: "fl_" + Date.now().toString(),
        date: selectedDate,
        user: currentUser,
        breakfast: data.breakfast || "",
        lunch: data.lunch || "",
        dinner: data.dinner || "",
        snacks: data.snacks || "",
        estimatedCalories: data.estimatedCalories || 0
      };

      // Ensure only one log per day per user (update existing or add new)
      let updated = [...logs];
      const existingIdx = updated.findIndex(l => l.date === selectedDate && l.user === currentUser);
      if (existingIdx >= 0) {
        updated[existingIdx] = newLog;
      } else {
        updated.push(newLog);
      }
      
      setLogs(updated);
      localStorage.setItem("forlife_food_logs_v1", JSON.stringify(updated));

      setNaturalInput("");
      setIsSavedMsg(true);
      setTimeout(() => setIsSavedMsg(false), 2000);
    } catch (e) {
      console.error(e);
      alert("Failed to parse log. Check network or API key.");
    } finally {
      setIsProcessing(false);
    }
  };

  const activeGoal = calorieGoals[currentUser] || 2000;
  const currentLog = logs.find(l => l.date === selectedDate && l.user === currentUser) || { breakfast: "", lunch: "", dinner: "", snacks: "", estimatedCalories: 0 };

  const handleUpdateGoal = (val: number) => {
    const next = { ...calorieGoals, [currentUser]: val };
    setCalorieGoals(next);
    localStorage.setItem("forlife_calorie_goals", JSON.stringify(next));
  };

  const copyReportToClipboard = () => {
    const reportText = `🍽️ Daily Food Report - ${new Date(selectedDate).toLocaleDateString()}
User: ${currentUser === "Rhon" ? "Rhonda" : "Susan"}
    
Breakfast: ${currentLog.breakfast || "None logged"}
Lunch: ${currentLog.lunch || "None logged"}
Dinner: ${currentLog.dinner || "None logged"}
Snacks: ${currentLog.snacks || "None logged"}

Estimated Calories: ${currentLog.estimatedCalories} / ${activeGoal}
`;
    navigator.clipboard.writeText(reportText).then(() => {
      alert("Copied to clipboard! Ready to send to sponsor.");
    });
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-3xs flex flex-col gap-5">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <List className="w-5 h-5 text-indigo-500"/> Intelligent Food Log
          </h2>
          <p className="text-xs text-stone-500 font-semibold mt-1">Log meals naturally to track nutrition</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-stone-400">Daily Goal</span>
          <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 mt-1">
            <input 
              type="number" 
              value={activeGoal} 
              onChange={(e) => handleUpdateGoal(Number(e.target.value))}
              className="w-14 bg-transparent text-sm font-black text-indigo-700 focus:outline-none text-right"
            />
            <span className="text-xs text-stone-500 font-bold">kcal</span>
          </div>
        </div>
      </div>

      {/* Input section */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 gap-3 flex flex-col">
        <label className="text-xs font-bold text-stone-700">What did you eat today?</label>
        <div className="relative">
          <textarea
            value={naturalInput}
            onChange={(e) => setNaturalInput(e.target.value)}
            placeholder="E.g., I had 2 eggs and toast for breakfast, a salad with chicken for lunch, and pasta for dinner with an apple as a snack."
            className="w-full bg-white border border-stone-200 focus:border-indigo-400 focus:outline-none rounded-xl p-3 pr-12 text-sm text-stone-800"
            rows={3}
          />
          <button
            onClick={handleToggleListening}
            className={`absolute right-3 top-3 p-1.5 rounded-lg transition ${isListening ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
        {isListening && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-700 font-extrabold animate-pulse bg-rose-50/50 border border-rose-100/50 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            <span>Microphone active & listening continuously. Say <strong>"Done recording"</strong> or <strong>"Finish"</strong> to stop.</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          {isSavedMsg ? <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5"/> Parsed & Saved!</span> : <span></span>}
          <button
            disabled={isProcessing || !naturalInput.trim()}
            onClick={handleProcessLog}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
            Parse Log
          </button>
        </div>
      </div>

      {/* Summary output */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
          <h3 className="text-sm font-black text-indigo-900">Today's Summary</h3>
          <button 
            onClick={copyReportToClipboard}
            className="text-[10px] font-bold bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded-md flex items-center gap-1 transition"
          >
            <Copy className="w-3 h-3"/> Export Report
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-indigo-900 pb-2">
          <div><strong className="font-extrabold text-indigo-700">Breakfast:</strong> <span className="ml-1 text-slate-700">{currentLog.breakfast || "--"}</span></div>
          <div><strong className="font-extrabold text-indigo-700">Lunch:</strong> <span className="ml-1 text-slate-700">{currentLog.lunch || "--"}</span></div>
          <div><strong className="font-extrabold text-indigo-700">Dinner:</strong> <span className="ml-1 text-slate-700">{currentLog.dinner || "--"}</span></div>
          <div><strong className="font-extrabold text-indigo-700">Snacks:</strong> <span className="ml-1 text-slate-700">{currentLog.snacks || "--"}</span></div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-indigo-100">
           <div className="text-sm">
             <strong className="font-black text-indigo-900">Est. Calories:</strong> 
             <span className={`ml-2 font-black ${currentLog.estimatedCalories > activeGoal ? 'text-rose-600' : 'text-emerald-600'}`}>
               {currentLog.estimatedCalories || 0}
             </span> 
             <span className="text-xs font-bold text-stone-500 ml-1">/ {activeGoal} kcal</span>
           </div>
           {currentLog.estimatedCalories > 0 && (
             <div className="flex-1 bg-stone-200 h-2 rounded-full overflow-hidden">
               <div 
                 className={`h-full ${currentLog.estimatedCalories > activeGoal ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                 style={{ width: Math.min(100, (currentLog.estimatedCalories / activeGoal) * 100) + "%"}}
               />
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
