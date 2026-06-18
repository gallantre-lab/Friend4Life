import React, { useState } from "react";
import { CheckInScale } from "../types";
import { 
  Sliders, Calendar, Star, ShieldCheck, 
  Sparkles, Heart, RefreshCw, Send, BookOpen, Sun, Moon,
  ChevronDown, ChevronUp
} from "lucide-react";

interface CheckInFlowProps {
  onAddCheckIn: (scale: Omit<CheckInScale, "id" | "date">) => void;
  recentCheckIns: CheckInScale[];
  onTriggerCheckInGuide: (scale: CheckInScale) => void;
}

export default function CheckInFlow({
  onAddCheckIn,
  recentCheckIns,
  onTriggerCheckInGuide
}: CheckInFlowProps) {
  const [user, setUser] = useState<"rhon" | "suz">("rhon");
  const [inventoryType, setInventoryType] = useState<"morning" | "night">("night");
  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState(7);
  const [stress, setStress] = useState(4);
  const [cravings, setCravings] = useState(2);
  const [connectionToGod, setConnectionToGod] = useState(7);
  const [gratitudeNote, setGratitudeNote] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCheckIn({
      user,
      energy,
      mood,
      stress,
      cravings,
      connectionToGod,
      gratitudeNote,
      inventoryType
    });
    
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setGratitudeNote("");
    }, 3000);
  };

  const scaleKeys = [
    { label: "⚡ Energy Level", value: energy, setter: setEnergy, minLabel: "Drained", maxLabel: "Charged" },
    { label: "☀️ Current Mood", value: mood, setter: setMood, minLabel: "Low/Tense", maxLabel: "Joyful/Peaceful" },
    { label: "🌊 Stress Level", value: stress, setter: setStress, minLabel: "Quiet", maxLabel: "Overwhelming" },
    { label: "🍩 Craving Tension", value: cravings, setter: setCravings, minLabel: "None", maxLabel: "Intense" },
    { label: "🙏 Connection to God", value: connectionToGod, setter: setConnectionToGod, minLabel: "Distant", maxLabel: "Very Near" },
  ];

  return (
    <div id="checkin-section" className="space-y-6">
      
      {/* Introduction banner */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-3xl p-6 border border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-lg">Daily Scale Metrics Check-In</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            Quick 1-10 assessments are our premium tool. Tracking daily energy, stress, and connection helps us notice recovery patterns without judgment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Fill Out Metrics Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm">New Wellness Log</h4>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* User Switcher */}
              <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUser("rhon")}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-all ${
                    user === "rhon" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-850"
                  }`}
                >
                  Rhon
                </button>
                <button
                  type="button"
                  onClick={() => setUser("suz")}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-all ${
                    user === "suz" ? "bg-white text-rose-700 shadow-xs" : "text-slate-500 hover:text-slate-855"
                  }`}
                >
                  Suz
                </button>
              </div>

              {/* Inventory Type Switcher */}
              <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setInventoryType("morning")}
                  className={`px-2 py-1 text-[11px] rounded-lg font-extrabold transition-all ${
                    inventoryType === "morning" ? "bg-amber-500 text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🌅 Morning
                </button>
                <button
                  type="button"
                  onClick={() => setInventoryType("night")}
                  className={`px-2 py-1 text-[11px] rounded-lg font-extrabold transition-all ${
                    inventoryType === "night" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🌌 Night
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {scaleKeys.map((item, index) => (
              <div key={index} className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{item.label}</span>
                  <span className="font-mono bg-slate-200 px-2 py-0.5 rounded-lg text-slate-800 font-bold">
                    {item.value} / 10
                  </span>
                </div>
                
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={item.value}
                  onChange={(e) => item.setter(parseInt(e.target.value))}
                  className="w-full accent-slate-800 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                
                <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                  <span>{item.minLabel}</span>
                  <span>{item.maxLabel}</span>
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                {inventoryType === "morning" ? (
                  <>🌅 Morning Intention or Step 11 Mindful Focus</>
                ) : (
                  <>🌸 Gratitude Note or Step 10 Recovery Reflection</>
                )}
              </label>
              <textarea
                value={gratitudeNote}
                onChange={(e) => setGratitudeNote(e.target.value)}
                placeholder={
                  inventoryType === "morning"
                    ? "What is your main target, hope, or prayer of surrender as you step into today? What can we lay before God?"
                    : "What is one thing you are grateful for, or surrendering to your Higher Power today?"
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 font-sans resize-none min-h-[70px] bg-white animate-fade-in"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitted 
                  ? "bg-slate-700 text-slate-100 cursor-default" 
                  : inventoryType === "morning"
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                  : "bg-slate-800 hover:bg-slate-900 text-white"
              }`}
              disabled={isSubmitted}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              {isSubmitted ? "Saved safely!" : inventoryType === "morning" ? "Submit Morning Intention" : "Submit Night Inventory (Step 10)"}
            </button>
          </form>
        </div>

        {/* History / Recent Check-ins Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-800 text-sm">Recent Daily Logs</h4>
              <button 
                type="button" 
                onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
                className="text-slate-500 hover:text-slate-850 p-1 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                title={isHistoryCollapsed ? "Expand History Log" : "Collapse History Log"}
              >
                {isHistoryCollapsed ? (
                  <>
                    <span className="text-[11px] text-indigo-600">Show Feed</span>
                    <ChevronDown className="w-4 h-4 text-indigo-500" />
                  </>
                ) : (
                  <>
                    <span className="text-[11px] text-slate-400">Hide Feed</span>
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  </>
                )}
              </button>
            </div>
            
            {!isHistoryCollapsed && (
              recentCheckIns.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-slate-200 rounded-2xl">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No check-in logs submitted yet.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Submit your first log to start tracking weekly trends.</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                  {recentCheckIns.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 relative group animate-fade-in">
                      <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            log.user === "rhon" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}>
                            {log.user === "rhon" ? "Rhon" : "Suz"}
                          </span>
                          
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase flex items-center gap-0.5 ${
                            log.inventoryType === "morning" ? "bg-amber-100 text-amber-800" : "bg-slate-900 text-slate-100"
                          }`}>
                            {log.inventoryType === "morning" ? "🌅 Morn" : "🌌 Night"}
                          </span>

                          <span className="text-[10px] text-slate-400 font-mono">{log.date}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onTriggerCheckInGuide(log)}
                          className="opacity-0 group-hover:opacity-100 text-xs text-slate-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl transition flex items-center gap-1.5 shadow-sm font-semibold cursor-pointer"
                          title="Send metrics to Bliss for a complete feedback session!"
                        >
                          <Send className="w-3 h-3 text-emerald-600" /> Ask Bliss
                        </button>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono leading-tight mb-2">
                        <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-100/50">
                          <span className="text-[8px] text-amber-800 block">Energy</span>
                          <span className="font-bold text-slate-700">{log.energy}</span>
                        </div>
                        <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-100/50">
                          <span className="text-[8px] text-emerald-800 block">Mood</span>
                          <span className="font-bold text-slate-700">{log.mood}</span>
                        </div>
                        <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100/50">
                          <span className="text-[8px] text-blue-800 block">Stress</span>
                          <span className="font-bold text-slate-700">{log.stress}</span>
                        </div>
                        <div className="bg-rose-50 p-1.5 rounded-lg border border-rose-100/50">
                          <span className="text-[8px] text-rose-800 block">Cravin</span>
                          <span className="font-bold text-slate-700">{log.cravings}</span>
                        </div>
                        <div className="bg-purple-50 p-1.5 rounded-lg border border-purple-100/50">
                          <span className="text-[8px] text-purple-800 block">God</span>
                          <span className="font-bold text-slate-700">{log.connectionToGod}</span>
                        </div>
                      </div>

                      {log.gratitudeNote && (
                        <p className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-xl border border-slate-100 italic leading-relaxed">
                          {log.inventoryType === "morning" ? "🌅 Intention: " : "🌌 Reflection: "}"{log.gratitudeNote}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs flex flex-col gap-2.5 mt-4">
            <div className="flex items-start gap-3">
              <Sun className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold text-amber-300 block">Morning Alignment</span>
                "Ask God to direct your thinking, especially that it be divorced from self-pity, dishonest, or self-seeking motives."
              </div>
            </div>
            <div className="border-t border-slate-800 my-1"></div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-emerald-300 block">Step 10 Alignment</span>
                "To keep clean contact with God, we continue to take personal inventory & when of stress/cravings, we pray & share with friends."
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
