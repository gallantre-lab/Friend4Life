import React, { useState, useEffect } from "react";
import { UserProfile, WeightRecord } from "../types";
import { 
  User, CheckCircle2, Heart, Award, Shield, 
  Trash2, Scale, Flame, RefreshCw, PlusCircle, Compass 
} from "lucide-react";

interface ProfilesViewProps {
  currentUser: "Rhon" | "Suz";
  rhonProfile: UserProfile;
  suzProfile: UserProfile;
  weightHistory: WeightRecord[];
  onAddWeight: (weight: number, notes: string, date?: string) => void;
  onDeleteWeight: (id: string) => void;
  onUpdateProfile: (user: "rhon" | "suz", fields: Partial<UserProfile>) => void;
  onLockSession: () => void;
}

export default function ProfilesView({
  currentUser,
  rhonProfile,
  suzProfile,
  weightHistory,
  onAddWeight,
  onDeleteWeight,
  onUpdateProfile,
  onLockSession
}: ProfilesViewProps) {
  const [newWeight, setNewWeight] = useState("");
  const [weightNotes, setWeightNotes] = useState("");
  const [logDate, setLogDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [editingUser, setEditingUser] = useState<"rhon" | "suz" | null>(null);

  // Profile fields editing
  const [editAge, setEditAge] = useState(47);
  const [editMeds, setEditMeds] = useState("");
  const [editPreferences, setEditPreferences] = useState("");
  const [editGoalWeight, setEditGoalWeight] = useState<number | "">("");

  const activeProfile = currentUser === "Rhon" ? rhonProfile : suzProfile;
  const myWeights = weightHistory
    .filter(w => w.user === currentUser)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Storing Start Weight properly
  const [startWeight, setStartWeight] = useState(() => localStorage.getItem(`forlife_start_weight_v8_${currentUser}`) || "");
  const [startDate, setStartDate] = useState(() => localStorage.getItem(`forlife_start_date_v8_${currentUser}`) || "");
  const [isEditingBaseline, setIsEditingBaseline] = useState(!localStorage.getItem(`forlife_start_weight_v8_${currentUser}`));

  useEffect(() => {
    const sw = localStorage.getItem(`forlife_start_weight_v8_${currentUser}`) || "";
    const sd = localStorage.getItem(`forlife_start_date_v8_${currentUser}`) || "";
    setStartWeight(sw);
    setStartDate(sd);
    if (!sw) setIsEditingBaseline(true);
  }, [currentUser]);

  const handleSaveProfile = (user: "rhon" | "suz") => {
    onUpdateProfile(user, {
      age: editAge,
      meds: editMeds,
      preferences: editPreferences,
      goalWeight: editGoalWeight === "" ? undefined : editGoalWeight
    });
    setEditingUser(null);
  };

  const startEdit = (user: "rhon" | "suz") => {
    setEditingUser(user);
    const prof = user === "rhon" ? rhonProfile : suzProfile;
    setEditAge(prof.age);
    setEditMeds(prof.meds);
    setEditPreferences(prof.preferences);
    setEditGoalWeight(prof.goalWeight || "");
  };

  const submitWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!isNaN(w) && w > 0) {
      onAddWeight(w, weightNotes, logDate);
      setNewWeight("");
      setWeightNotes("");
      setLogDate(new Date().toISOString().substring(0, 10));
    }
  };

  const handleSaveBaseline = () => {
    localStorage.setItem(`forlife_start_weight_v8_${currentUser}`, startWeight);
    localStorage.setItem(`forlife_start_date_v8_${currentUser}`, startDate);
    setIsEditingBaseline(false);
  };

  const originalWeightVal = parseFloat(startWeight) || 0;
  const currentWeightVal = myWeights.length > 0 ? myWeights[myWeights.length - 1].weight : originalWeightVal;
  const totalGoalAmount = originalWeightVal && activeProfile.goalWeight ? originalWeightVal - activeProfile.goalWeight : 0;
  
  // Dynamic Milestones Definition
  const milestoneOptions = [];
  if (totalGoalAmount >= 5) milestoneOptions.push({ label: "5 lbs", target: 5 });
  if (totalGoalAmount >= 10) milestoneOptions.push({ label: "10 lbs", target: 10 });
  if (totalGoalAmount >= 15) milestoneOptions.push({ label: "15 lbs", target: 15 });
  if (totalGoalAmount >= 25) milestoneOptions.push({ label: "25 lbs", target: 25 });
  if (totalGoalAmount >= 50) milestoneOptions.push({ label: "50 lbs", target: 50 });
  if (totalGoalAmount >= 75) milestoneOptions.push({ label: "75 lbs", target: 75 });
  if (totalGoalAmount >= 100) milestoneOptions.push({ label: "100 lbs", target: 100 });
  
  if (totalGoalAmount > 0) {
    milestoneOptions.push({ label: "Goal Reached", target: totalGoalAmount });
  } else {
    milestoneOptions.push({ label: "Goal Reached", target: 999 });
  }

  // Basic SVG mini line-graph generator
  const weightsArray = [originalWeightVal, ...myWeights.map(r => r.weight)];
  const minW = weightsArray.length > 0 ? Math.min(...weightsArray) - 5 : 120;
  const maxW = weightsArray.length > 0 ? Math.max(...weightsArray) + 5 : 180;
  const range = maxW - minW || 10;

  const points = myWeights.map((rec, idx) => {
    const x = myWeights.length > 1 ? (idx / (myWeights.length - 1)) * 100 : 50;
    const y = 80 - ((rec.weight - minW) / range) * 60;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div id="profiles-section" className="space-y-8">
      {/* Profiles Cards Row */}
      <div className="flex flex-col gap-6">
        {currentUser === "Rhon" && (
        <div id="profile-rhon" className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg">
                R
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Rhon</h3>
                <p className="text-xs text-slate-500 font-mono">Age {rhonProfile.age} • Active Lifestyle</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                className="text-xs text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer"
                onClick={() => startEdit("rhon")}
              >
                Configure
              </button>
              <button
                type="button"
                onClick={onLockSession}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-full shadow-sm text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
                title="Lock Profile"
              >
                <Shield className="w-3 h-3 text-emerald-400" />
                Lock
              </button>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider block mb-1">Sustainable Goals</span>
              <div className="flex flex-wrap gap-1.5">
                {rhonProfile.goals.map((goal, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {goal}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider block">Recovery Support</span>
                <span className="font-medium text-slate-700 text-xs flex items-center gap-1 mt-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> AA (15 yrs sober)
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider block">Key Med / Support</span>
                <span className="font-medium text-slate-700 text-xs flex items-center gap-1 mt-1">
                  <Shield className="w-3.5 h-3.5 text-blue-500" /> {rhonProfile.meds || "Vyvanse"}
                </span>
              </div>
            </div>

            <div className="pt-1">
              <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider block mb-0.5">Preferences & Food</span>
              <p className="text-xs text-slate-500 italic bg-amber-50/50 p-2 rounded-xl text-amber-900 border border-amber-100/50">
                {rhonProfile.preferences || "Gluten-Free, lower sugar. Enjoys voice check-ins with Bliss."}
              </p>
            </div>
          </div>
        </div>
        )}

        {currentUser === "Suz" && (
        <div id="profile-suz" className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-lg">
                S
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Suz (Rhon's Wife)</h3>
                <p className="text-xs text-slate-500 font-mono">Enjoys Cooking & Meal prep</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer"
                onClick={() => startEdit("suz")}
              >
                Configure
              </button>
              <button
                type="button"
                onClick={onLockSession}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-full shadow-sm text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
                title="Lock Profile"
              >
                <Shield className="w-3 h-3 text-rose-400" />
                Lock
              </button>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider block mb-1">Suz's Goals & Focus</span>
              <div className="flex flex-wrap gap-1.5">
                {suzProfile.goals.map((goal, i) => (
                  <span key={i} className="bg-rose-50 text-rose-700 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
                    <Heart className="w-3.5 h-3.5 text-rose-500" /> {goal}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider block">Recovery Path</span>
                <span className="font-medium text-slate-700 text-xs flex items-center gap-1 mt-1">
                  <Award className="w-3.5 h-3.5 text-purple-500" /> Overeaters Anon (OA)
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider block">Key Med / Support</span>
                <span className="font-medium text-slate-700 text-xs flex items-center gap-1 mt-1">
                  <Shield className="w-3.5 h-3.5 text-blue-500" /> {suzProfile.meds || "Wegovy"}
                </span>
              </div>
            </div>

            <div className="pt-1">
              <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider block mb-0.5">Kitchen Coordination</span>
              <p className="text-xs text-slate-500 italic bg-purple-50/50 p-2 rounded-xl text-purple-900 border border-purple-100/50">
                {suzProfile.preferences || "Shares kitchen & meals with Rhon. Standard or custom portion size."}
              </p>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Editor Modal / Panel if open */}
      {editingUser && (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mt-2">
          <h4 className="font-semibold text-slate-700 mb-3 text-sm">
            Updating {editingUser === "rhon" ? "Rhon's" : "Suz's"} profile rules:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-xs uppercase text-slate-400 tracking-wider mb-1">Age</label>
              <input 
                type="number" 
                value={editAge} 
                onChange={e => setEditAge(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-slate-400 tracking-wider mb-1">Goal Weight</label>
              <input 
                type="number" 
                value={editGoalWeight} 
                onChange={e => setEditGoalWeight(e.target.value === "" ? "" : parseFloat(e.target.value) || "")}
                placeholder="Target (lbs)"
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-slate-400 tracking-wider mb-1">Meds & Dosages</label>
              <input 
                type="text" 
                value={editMeds} 
                onChange={e => setEditMeds(e.target.value)}
                placeholder="e.g. Vyvanse 30mg"
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-slate-400 tracking-wider mb-1">Diet / Daily prefs</label>
              <input 
                type="text" 
                value={editPreferences} 
                onChange={e => setEditPreferences(e.target.value)}
                placeholder="e.g. Lower sugar, gluten-free"
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-700"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 text-xs">
            <button 
              type="button"
              className="px-3 py-1 bg-slate-200 border border-slate-300 rounded text-slate-600 hover:bg-slate-300 cursor-pointer"
              onClick={() => setEditingUser(null)}
            >
              Cancel
            </button>
            <button 
              type="button"
              className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
              onClick={() => handleSaveProfile(editingUser)}
            >
              Save Details
            </button>
          </div>
        </div>
      )}

      {/* Sustainable Weight Coaching Section */}
      <div id="weight-coaching-box" className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-lg tracking-tight">{currentUser}'s Sustainable Weight Coach</h3>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Worth is not determined by weight. Small sustainable habits lead to lasting change. 
              Target goal: {activeProfile.goalWeight} lbs.
            </p>
          </div>

          <form onSubmit={submitWeight} className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap gap-2">
              <input 
                type="date" 
                value={logDate}
                onChange={e => setLogDate(e.target.value)}
                className="w-32 bg-slate-800 text-white rounded-xl py-1.5 px-3 border border-slate-700 text-sm focus:outline-none focus:border-emerald-400"
              />
              <div className="relative">
                <input 
                  type="text" 
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  placeholder="e.g. 154" 
                  className="w-24 bg-slate-800 text-white rounded-xl py-1.5 px-3 border border-slate-700 text-center text-sm focus:outline-none focus:border-emerald-400"
                />
                <span className="absolute right-2 top-2 text-[10px] text-slate-500 font-bold uppercase">lb</span>
              </div>
              <input 
                type="text" 
                value={weightNotes}
                onChange={e => setWeightNotes(e.target.value)}
                placeholder="Comfortable? Cravings?" 
                className="bg-slate-800 text-white placeholder-slate-400 rounded-xl py-1.5 px-3 border border-slate-700 text-xs flex-1 min-w-[140px] focus:outline-none focus:border-emerald-400"
              />
              <button 
                type="submit" 
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl px-4 py-1.5 text-xs font-bold transition-transform cursor-pointer"
              >
                Log
              </button>
            </div>
          </form>
        </div>

        {/* Progress Summary and Metric cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-slate-850 p-5 rounded-3xl border border-slate-800 flex flex-col justify-between shadow-xs relative">
              {isEditingBaseline ? (
                <div className="space-y-3 mb-2">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-800 text-white p-1 rounded border border-slate-700 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Start Weight (lbs)</label>
                    <input type="number" value={startWeight} onChange={e => setStartWeight(e.target.value)} className="w-full bg-slate-800 text-white p-1 rounded border border-slate-700 text-xs" />
                  </div>
                  <button onClick={handleSaveBaseline} className="w-full bg-emerald-600 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-emerald-500">Save Baseline</button>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Starting Baseline</p>
                      <button onClick={() => setIsEditingBaseline(true)} className="text-slate-600 hover:text-emerald-400 text-[9px] uppercase tracking-wider font-bold bg-slate-800 px-1.5 py-0.5 rounded cursor-pointer mb-1 border border-slate-700/50">Edit</button>
                    </div>
                    <div className="text-xl font-black text-slate-300">
                      {startWeight} <span className="text-sm text-slate-500">lbs</span>
                    </div>
                    <p className="text-[9px] font-mono text-slate-600 mt-0.5">Start: {startDate}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Current</p>
                    <div className="text-3xl font-black text-white">
                      {currentWeightVal} <span className="text-lg text-slate-500">lbs</span>
                    </div>
                    {myWeights.length > 0 && (
                      <p className={`text-[9px] font-bold mt-1 ${currentWeightVal < originalWeightVal ? "text-emerald-400" : "text-amber-400"}`}>
                        {Math.abs(originalWeightVal - currentWeightVal).toFixed(1)} lbs since start
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Milestones Card */}
            <div className="bg-slate-850 p-5 rounded-3xl border border-slate-800 shadow-xs flex-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Milestones</p>
               <div className="grid grid-cols-1 gap-2">
                 {milestoneOptions.map((ms, i) => {
                   const totalLost = originalWeightVal ? originalWeightVal - currentWeightVal : 0;
                   const achieved = totalLost >= ms.target;
                   return (
                     <div key={i} className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-all ${
                       achieved 
                         ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50" 
                         : "bg-slate-800/50 text-slate-500 border border-slate-700/50"
                     }`}>
                       {achieved ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
                       {ms.label}
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>

          {/* SVG Line progress graph & log */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Weight Progress Chart</span>
                {weightHistory.length > 1 && (
                  <span className="text-[10px] font-mono text-emerald-400">
                    Total Change: {(weightHistory[0].weight - weightHistory[weightHistory.length - 1].weight).toFixed(1)} lbs
                  </span>
                )}
              </div>

              {myWeights.length === 0 ? (
                <div className="h-28 flex items-center justify-center border border-dashed border-slate-700 rounded-xl text-xs text-slate-400">
                  Log some entries to see a clean progress line graph!
                </div>
              ) : (
                <div className="relative pt-2">
                  <svg className="w-full h-24 stroke-emerald-400 stroke-2 fill-none overflow-visible pb-1">
                    {points && <polyline points={points} />}
                    <g className="group cursor-pointer">
                      <circle cx="0%" cy={80 - ((originalWeightVal - minW) / range) * 60} r="3.5" className="fill-slate-900 stroke-emerald-400 stroke-2 hover:fill-emerald-400" />
                      <title>{`Start (${startDate}): ${originalWeightVal} lbs`}</title>
                    </g>
                    {myWeights.map((rec, idx) => {
                      const x = myWeights.length > 1 ? (idx / (myWeights.length - 1)) * 100 : 50;
                      const y = 80 - ((rec.weight - minW) / range) * 60;
                      return (
                        <g key={rec.id} className="group cursor-pointer">
                          <circle cx={`${x}%`} cy={y} r="3.5" className="fill-slate-900 stroke-emerald-400 stroke-2 hover:fill-emerald-400" />
                          <title>{`${rec.date}: ${rec.weight} lbs ${rec.notes ? "(" + rec.notes + ")" : ""}`}</title>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 pt-2 border-t border-slate-800/50">
                    <span>{startDate}</span>
                    <span className="text-slate-400 hidden sm:inline">Min: {Math.round(minW + 5)} | Max: {Math.round(maxW - 5)} lbs</span>
                    <span>{myWeights[myWeights.length - 1]?.date || "End"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Historical Log list */}
            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 flex-1 max-h-48 overflow-y-auto">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Detailed Timeline</span>
              {myWeights.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No log entries yet.</p>
              ) : (
                <div className="space-y-1.5 text-xs text-slate-300">
                  {/* Show timeline reversed (newest first) */}
                  {[...myWeights].reverse().map((rec) => (
                    <div key={rec.id} className="flex justify-between items-center gap-1.5 p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-emerald-100 text-sm">{rec.weight} lbs</span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{rec.date}</span>
                        </div>
                        {rec.notes && <p className="text-[11px] text-slate-300 italic mt-0.5">{rec.notes}</p>}
                      </div>
                      <button 
                        type="button"
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                        onClick={() => onDeleteWeight(rec.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coach Advice Banner */}
        <div className="flex items-start gap-3 bg-emerald-950/40 border border-emerald-900/50 p-3 rounded-2xl text-xs text-emerald-100 mt-4">
          <Compass className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold block mb-0.5">Bliss's Coaching Compass for Today:</span>
            "{currentUser}, standard scale values fluctuate with carbs, stress, and sleep. We focus on consistent nutrition mapping, adequate rest, and daily movement. Our target trend is lovely, gradual progress!"
          </div>
        </div>
      </div>
    </div>
  );
}
