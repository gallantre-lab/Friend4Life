import React, { useState } from "react";
import { UserProfile, CheckInScale } from "../types";
import { 
  Compass, Sunset, Sun, ListTodo, CheckSquare, 
  RefreshCw, Sparkles, Smile, Award, CheckCircle2, TrendingUp, AlertCircle
} from "lucide-react";

interface CoachingModeViewProps {
  currentUser: "rhon" | "suz" | "shared";
  rhonProfile: UserProfile;
  suzProfile: UserProfile;
  checkInList: CheckInScale[];
  todayWater: number;
  todayExercise: number;
  todayProtein: number;
  todayCalories: number;
  onTriggerCoachingDialogue: (prompt: string) => void;
}

export default function CoachingModeView({
  currentUser,
  rhonProfile,
  suzProfile,
  checkInList,
  todayWater,
  todayExercise,
  todayProtein,
  todayCalories,
  onTriggerCoachingDialogue
}: CoachingModeViewProps) {
  const activeUserKey: "Rhon" | "Suz" = currentUser === "suz" ? "Suz" : "Rhon";
  const activeProfile = activeUserKey === "Rhon" ? rhonProfile : suzProfile;

  // Track coaching phases
  const [activeSegment, setActiveSegment] = useState<"morning" | "evening">("morning");

  // Morning interactive goal states
  const [morningWaterGoal, setMorningWaterGoal] = useState(64);
  const [morningStretching, setMorningStretching] = useState(true);
  const [morningProteinGoal, setMorningProteinGoal] = useState(90);
  const [morningPrayerSurrender, setMorningPrayerSurrender] = useState("");
  const [selectedMantra, setSelectedMantra] = useState("Progress beats perfection!");

  // Evening achievement self-ratings
  const [eveningStepsAchieved, setEveningStepsAchieved] = useState(true);
  const [eveningHydrationAchieved, setEveningHydrationAchieved] = useState(todayWater >= 64);
  const [eveningProteinLaid, setEveningProteinLaid] = useState(todayProtein >= 90);
  const [eveningSobrietyGuarded, setEveningSobrietyGuarded] = useState(true);
  const [eveningReflectionNotes, setEveningReflectionNotes] = useState("");

  const triggerMorningPlanning = () => {
    const formattedPrompt = `Bliss! Let's build today's morning coaching directive. I am starting my day as ${activeUserKey}. Current Weight is ${activeProfile.currentWeight} lbs. My set targets are: Water: ${morningWaterGoal} oz, Protein: ${morningProteinGoal}g, Gentle stretching: ${morningStretching ? 'Yes' : 'No'}. For spiritual commitment, my God surrender today is: "${morningPrayerSurrender || 'to stay calm and easy'}". My selected motivational focus is: "${selectedMantra}". Talk to me as Bliss in your sporty support voice. Plan the day!`;
    onTriggerCoachingDialogue(formattedPrompt);
  };

  const triggerEveningPlanning = () => {
    const missedTargets: string[] = [];
    if (todayWater < 64) missedTargets.push("Hydration target (~64oz)");
    if (todayProtein < 90) missedTargets.push("Gluten-free lean protein target (~90g)");
    if (todayExercise < 30) missedTargets.push("Realistic daily movement (~30 mins)");

    const achievedTargets: string[] = [];
    if (todayWater >= 64) achievedTargets.push("64oz Water");
    if (todayProtein >= 90) achievedTargets.push("90g high-protein");
    if (todayExercise > 0) achievedTargets.push(`${todayExercise} mins movement`);
    if (eveningSobrietyGuarded) achievedTargets.push("Guarded recovery boundaries securely");

    const formattedPrompt = `Bliss, time for my evening wrap-up for ${activeUserKey}! Let's review targets. We succeeded with: [${achievedTargets.join(", ") || 'getting through the day safely'}]. We missed: [${missedTargets.join(", ") || 'none, all completed!'}]. Overall reflection of today: "${eveningReflectionNotes || 'proud of trying our best'}". Give me Suz & Rhon's coaching summary!`;
    onTriggerCoachingDialogue(formattedPrompt);
  };

  return (
    <div id="coaching-station-view" className="space-y-6">
      
      {/* Dynamic Selector Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl"></div>
        
        <div className="flex items-center gap-3 relative z-10">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-900 animate-pulse flex items-center justify-center font-black text-sm">
            🎓
          </span>
          <div>
            <h3 className="font-extrabold text-white text-base">Dedicated Bliss Coaching Station</h3>
            <p className="text-xs text-slate-400 font-medium">Daily planning & accountability loops built together</p>
          </div>
        </div>

        {/* Phase selector buttons */}
        <div className="flex bg-slate-800 rounded-2xl px-1 py-1 border border-slate-700 max-w-xs shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveSegment("morning")}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSegment === "morning" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-350 hover:text-white"
            }`}
          >
            <Sun className="w-4 h-4 shrink-0" /> Morning Goals
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSegment("evening")}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSegment === "evening" ? "bg-indigo-600 text-white shadow-md" : "text-slate-350 hover:text-white"
            }`}
          >
            <Sunset className="w-4 h-4 shrink-0" /> Evening Summary
          </button>
        </div>
      </div>

      {/* Segment MORNING */}
      {activeSegment === "morning" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in font-sans">
          
          {/* Main setup column */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sun className="w-4.5 h-4.5 text-amber-500" /> Morning Target Coordinator ({activeUserKey})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Today's Hydration Target</label>
                <select
                  value={morningWaterGoal}
                  onChange={e => setMorningWaterGoal(parseInt(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg text-xs p-1.5 font-bold text-slate-700 focus:outline-none"
                >
                  <option value={48}>48 oz (Moderate Hydrate)</option>
                  <option value={64}>64 oz (Optimal 8-gls Routine)</option>
                  <option value={80}>80 oz (Highly Active Day)</option>
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Dietary Protein target (g)</label>
                <select
                  value={morningProteinGoal}
                  onChange={e => setMorningProteinGoal(parseInt(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg text-xs p-1.5 font-bold text-slate-700 focus:outline-none"
                >
                  <option value={70}>70g protein basis</option>
                  <option value={90}>90g standard (Gluten-free balance)</option>
                  <option value={110}>110g high loading portion</option>
                </select>
              </div>

            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Spiritual Surrender to higher power</label>
              <input 
                type="text"
                value={morningPrayerSurrender}
                onChange={e => setMorningPrayerSurrender(e.target.value)}
                placeholder="e.g. My anxiety over late workloads, keeping peace with Suz."
                className="w-full bg-white border border-slate-200 rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Choose Today's Motivational Focus</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {[
                  "Progress beats perfection!",
                  "My worth is not determined by weight.",
                  "Recovery comes before weight loss.",
                  "God loves me on difficult days too."
                ].map((mantra) => (
                  <button
                    key={mantra}
                    type="button"
                    onClick={() => setSelectedMantra(mantra)}
                    className={`text-xs p-2 rounded-xl text-left border transition font-medium ${
                      selectedMantra === mantra 
                        ? "bg-slate-900 border-slate-900 text-amber-400 font-bold" 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    ✨ {mantra}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 select-none">
              <input 
                type="checkbox" 
                id="stretch"
                checked={morningStretching}
                onChange={e => setMorningStretching(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="stretch" className="text-xs text-slate-600 font-bold cursor-pointer">Commit to 5 mins of gentle stretching</label>
            </div>

            <button
              type="button"
              onClick={triggerMorningPlanning}
              className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-3 rounded-3xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-[1.01]"
            >
              <Sparkles className="w-4.5 h-4.5 text-amber-400" /> Formulate Morning Coaching Routine
            </button>
          </div>

          {/* Guidelines Sidebar info */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-1">Bliss's Morning Mantra</span>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Good morning Rhon and Suz! Lacing up those sneakers? We don't restrict, and we don't stress. We load up proteins, stay gluten-free, and surrender worries. Progress beats perfection!"
              </p>
              <div className="bg-amber-50 rounded-2xl p-2.5 text-[11px] text-amber-900 leading-normal border border-amber-100/50">
                <strong>💡 Quick Tip:</strong> Click the button above to let Bliss parse these goals straight into your live coaching dialogue.
              </div>
            </div>
            
            <div className="bg-slate-900 text-slate-200 rounded-3xl p-5 border border-slate-800 text-xs text-center space-y-1">
              <span className="text-2xl font-black block text-amber-400">{activeProfile.streak}</span>
              <span className="uppercase font-bold tracking-widest text-[9px] text-slate-400 block">Current Streak level</span>
              <p className="text-[10px] text-slate-400">Keep it cooking by checking in tomorrow morning!</p>
            </div>
          </div>

        </div>
      )}

      {/* Segment EVENING */}
      {activeSegment === "evening" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in font-sans">
          
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sunset className="w-4.5 h-4.5 text-indigo-600" /> Evening Summary & Reflection Review ({activeUserKey})
            </h4>

            {/* Tracking calculation targets against inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Today's Achievements</span>
                <ul className="text-xs text-slate-700 font-bold space-y-1 mt-1.5">
                  <li className="flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> {todayWater} oz water tracked
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> {todayProtein}g protein loaded
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> {todayExercise} mins active movement
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Missed Targets</span>
                  {todayWater < 64 || todayProtein < 90 || todayExercise < 30 ? (
                    <div className="text-[11px] text-amber-700 font-medium space-y-1 mt-1">
                      {todayWater < 64 && <div>• Hydration ({todayWater}/64oz)</div>}
                      {todayProtein < 90 && <div>• Protein Goal ({todayProtein}/90g)</div>}
                      {todayExercise < 30 && <div>• Movement ({todayExercise}/30m)</div>}
                    </div>
                  ) : (
                    <span className="text-emerald-600 text-xs font-bold block mt-3">★ Absolutely clean sweep!</span>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 leading-normal block mt-1.5 italic">"No scolds, no lectures here!" - Bliss</span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="block text-xs font-bold text-slate-700">Accountability checklist:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="sob-chk"
                    checked={eveningSobrietyGuarded}
                    onChange={e => setEveningSobrietyGuarded(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="sob-chk" className="text-slate-600 font-medium cursor-pointer">Sobriety protected securely</label>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="step-chk"
                    checked={eveningStepsAchieved}
                    onChange={e => setEveningStepsAchieved(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="step-chk" className="text-slate-600 font-medium cursor-pointer">Daily steps or movement logged</label>
                </div>

              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">How went the day overall?</label>
              <textarea
                value={eveningReflectionNotes}
                onChange={e => setEveningReflectionNotes(e.target.value)}
                placeholder="What did you achieve? Did you struggle with self-criticism or food cravings? Drop it here friend..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-755 min-h-[90px] focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={triggerEveningPlanning}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-3xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
            >
              <Sunset className="w-4.5 h-4.5 text-indigo-200" /> Upload Evening Analysis to Bliss
            </button>
          </div>

          {/* Sidebar insights segment */}
          <div className="space-y-4 font-sans">
            <div className="bg-indigo-950 text-indigo-100 rounded-3xl p-5 border border-indigo-900 space-y-3 shadow-md">
              <h5 className="font-extrabold text-sm text-indigo-300 flex items-center gap-1.5">
                <AlertCircle className="w-4.5 h-4.5 text-indigo-400" /> Evening Reflection Coach
              </h5>
              <p className="text-[11px] leading-relaxed italic text-slate-300">
                "Rhon, Suz, as you wrap up the day, remember to surrender the outcomes. God loves you on both active days and sluggish days. Recovery is always our absolute biggest win!"
              </p>
              <div className="bg-indigo-900/60 p-2.5 rounded-xl text-[10px] border border-indigo-800 text-indigo-200 leading-normal">
                <strong>Progress Trends:</strong> Today's hydration was {todayWater}oz. We celebrate whatever consistency was made!
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
