import React, { useState } from "react";
import { CheckInScale } from "../types";
import { Smile, Zap, Activity, ShieldAlert, Heart, Calendar, Plus } from "lucide-react";

interface MoodCheckInCardProps {
  currentUser: "Rhon" | "Suz";
  recentCheckIns: CheckInScale[];
  onAddCheckIn: (scale: Omit<CheckInScale, "id" | "date">) => void;
  onBlissInteract: (text: string) => void;
}

export default function MoodCheckInCard({
  currentUser,
  recentCheckIns,
  onAddCheckIn,
  onBlissInteract
}: MoodCheckInCardProps) {
  // Local state for the questionnaire sliders (1-10)
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [stress, setStress] = useState(4);
  const [hunger, setHunger] = useState(3);
  const [cravings, setCravings] = useState(2);
  const [motivation, setMotivation] = useState(8);

  const [saved, setSaved] = useState(false);

  // Filter trends by current user
  const activeUserKey = currentUser === "Suz" ? "suz" : "rhon";
  const myLogs = recentCheckIns.filter(
    (c) => c.user === activeUserKey || c.user === currentUser.toLowerCase() as any
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCheckIn({
      user: activeUserKey,
      mood,
      energy,
      stress,
      cravings,
      connectionToGod: motivation, // reuse motivation on this slot
      gratitudeNote: `Checked in. Energy: ${energy}, Mood: ${mood}, Stress: ${stress}, hunger: ${hunger}, motivation: ${motivation}`,
      inventoryType: "night"
    });

    setSaved(true);

    const userDisplay = currentUser === "Rhon" ? "Rhonda" : "Susan";
    const promptMessage = `Bliss, I checked in with my sliders:
- Mood: ${mood}/10
- Energy: ${energy}/10
- Stress: ${stress}/10
- Hunger: ${hunger}/10
- Cravings: ${cravings}/10
- Motivation: ${motivation}/10.
Could you share some mindful, recovery-focused coaching feedback about my active emotional state today?`;
    
    onBlissInteract(promptMessage);

    setTimeout(() => {
      setSaved(false);
    }, 4000);
  };

  // Sparkline of average mood
  const renderMoodTrend = () => {
    if (myLogs.length === 0) {
      return (
        <span className="text-slate-400 font-medium">No recorded slider check-ins. Keep tracking!</span>
      );
    }
    const averageMood = (myLogs.reduce((acc, curr) => acc + (curr.mood || 7), 0) / myLogs.length).toFixed(1);
    const averageStress = (myLogs.reduce((acc, curr) => acc + (curr.stress || 4), 0) / myLogs.length).toFixed(1);

    return (
      <div className="flex justify-around items-center pt-2 gap-4">
        <div className="text-center">
          <span className="text-[10px] text-slate-400 font-bold block">AVG MOOD</span>
          <span className="text-xl font-black text-slate-800 font-mono">{averageMood} / 10</span>
        </div>
        <div className="border-l border-slate-200 h-8" />
        <div className="text-center">
          <span className="text-[10px] text-slate-400 font-bold block font-mono">AVG STRESS</span>
          <span className="text-xl font-black text-rose-800 font-mono">{averageStress} / 10</span>
        </div>
      </div>
    );
  };

  const getEmojiForMood = (val: number) => {
    if (val >= 8) return "👑 Peaceful & Content";
    if (val >= 5) return "🌱 Grounded & Standard";
    return "⛈️ Tired or Vulnerable";
  };

  return (
    <div id="mood-check-in-root" className="space-y-4 font-sans text-xs md:text-sm">
      
      {saved && (
        <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl font-bold text-center flex items-center justify-center gap-1.5 animate-bounce">
          <Smile className="w-4 h-4 text-emerald-500" /> Logged! Saved and shared with Bliss.
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 bg-slate-50/70 border border-slate-150 rounded-2.5xl space-y-4 shadow-3xs text-slate-700">
        <div id="mood-sliders-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Mood Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-850 flex items-center gap-1">😊 Current Mood ({mood}/10)</span>
              <span className="text-[10px] text-slate-400 font-mono">{getEmojiForMood(mood)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
              value={mood}
              onChange={(e) => setMood(parseInt(e.target.value))}
            />
          </div>

          {/* Energy Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-855 flex items-center gap-1">⚡ Energy Level ({energy}/10)</span>
              <span className="text-[10px] text-slate-400 font-mono">{energy >= 7 ? "Fully Charged" : "Needs Rest"}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
            />
          </div>

          {/* Stress Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-860 flex items-center gap-1">🌊 Stress Level ({stress}/10)</span>
              <span className="text-[10px] text-slate-405 font-mono">{stress >= 7 ? "Heavy Wave" : "Calm Tide"}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none"
              value={stress}
              onChange={(e) => setStress(parseInt(e.target.value))}
            />
          </div>

          {/* Hunger Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-865 flex items-center gap-1">🍽 Hunger Cue ({hunger}/10)</span>
              <span className="text-[10px] text-slate-410 font-mono">{hunger <= 3 ? "Abstinent/Silent" : "Empty Cue"}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
              value={hunger}
              onChange={(e) => setHunger(parseInt(e.target.value))}
            />
          </div>

          {/* Cravings Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-870 flex items-center gap-1">🍩 Cravings Intensity ({cravings}/10)</span>
              <span className="text-[10px] text-slate-415 font-mono">{cravings >= 6 ? "Gale-Force" : "Soft breeze"}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
              value={cravings}
              onChange={(e) => setCravings(parseInt(e.target.value))}
            />
          </div>

          {/* Motivation Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-875 flex items-center gap-1">🎯 Motivation ({motivation}/10)</span>
              <span className="text-[10px] text-slate-420 font-mono">{motivation >= 7 ? "Purposeful" : "Gentle Stepping"}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none"
              value={motivation}
              onChange={(e) => setMotivation(parseInt(e.target.value))}
            />
          </div>

        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <div className="flex-1">
            {renderMoodTrend()}
          </div>
          <button
            type="submit"
            className="px-4.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs flex items-center gap-1 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Save Check-In
          </button>
        </div>
      </form>

    </div>
  );
}
