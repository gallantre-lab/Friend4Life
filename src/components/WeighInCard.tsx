import React, { useState, useEffect } from "react";
import { WeightRecord } from "../types";
import { 
  Plus, Check, Scale, Calendar, Sparkles, TrendingDown, ArrowRight,
  Trash2, Trophy, ChevronDown, ChevronUp, Goal, Info, Clock, AlertCircle
} from "lucide-react";

interface WeighInCardProps {
  currentUser: "Rhon" | "Suz";
  weightHistory: WeightRecord[];
  setWeightHistory: React.Dispatch<React.SetStateAction<WeightRecord[]>>;
  onAddWeight: (weight: number, notes: string, date?: string) => void;
  onBlissInteract: (text: string) => void;
}

export default function WeighInCard({
  currentUser,
  weightHistory,
  setWeightHistory,
  onAddWeight,
  onBlissInteract
}: WeighInCardProps) {
  // Collapsible section states for a clean, uncluttered UX
  const [showBaselineSection, setShowBaselineSection] = useState(false);
  const [showAddSection, setShowAddSection] = useState(true);
  const [showProgressSection, setShowProgressSection] = useState(true);
  const [showGraphSection, setShowGraphSection] = useState(true);
  const [showHistorySection, setShowHistorySection] = useState(false);

  // Form Inputs
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [customDate, setCustomDate] = useState(() => {
    return new Date().toISOString().substring(0, 10);
  });

  // Starting & Target Config (Rhon vs Suz loaded from localStorage with healthy defaults)
  const [startWeight, setStartWeight] = useState("180");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [goalWeight, setGoalWeight] = useState("145");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const sw = localStorage.getItem(`forlife_start_weight_v6_${currentUser}`) || (currentUser === "Rhon" ? "180" : "250");
    const sd = localStorage.getItem(`forlife_start_date_v6_${currentUser}`) || "2026-01-01";
    const gw = localStorage.getItem(`forlife_goal_weight_v6_${currentUser}`) || (currentUser === "Rhon" ? "145" : "155");
    setStartWeight(sw);
    setStartDate(sd);
    setGoalWeight(gw);
  }, [currentUser]);

  // Clean formatted date helper
  const formatStartDisplayDate = (dStr: string) => {
    try {
      if (!dStr) return "N/A";
      const parts = dStr.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
      }
      return dStr;
    } catch (e) {
      return dStr;
    }
  };

  const handleSaveBaseline = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`forlife_start_weight_v6_${currentUser}`, startWeight);
    localStorage.setItem(`forlife_start_date_v6_${currentUser}`, startDate);
    localStorage.setItem(`forlife_goal_weight_v6_${currentUser}`, goalWeight);
    setSuccessMsg("Baseline details saved successfully! 🎯");
    
    // Notify Bliss
    const userDisplay = currentUser === "Rhon" ? "Rhonda" : "Susan";
    onBlissInteract(
      `Hey Bliss! I just updated my baseline starting weight to ${startWeight} lbs (since ${formatStartDisplayDate(startDate)}) with a goal weight of ${goalWeight} lbs. Please keep these health credentials in mind, friend!`
    );

    setTimeout(() => setSuccessMsg(""), 3500);
  };

  // Filter weights by current user context
  const myWeights = weightHistory
    .filter((w) => w.user === currentUser)
    // sort chronologically
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Current weight is either the latest log or original starting weight
  const originalWeightVal = parseFloat(startWeight) || 0;
  const currentWeightVal = myWeights.length > 0 ? myWeights[myWeights.length - 1].weight : originalWeightVal;
  const lastWeighInLabel = myWeights.length > 0 ? myWeights[myWeights.length - 1].date : "Baseline";

  // Total Weight Lost
  const totalWeightLost = originalWeightVal - currentWeightVal;

  // Weight Difference Since Last Weigh-In
  let diffSinceLast = 0;
  if (myWeights.length > 0) {
    if (myWeights.length === 1) {
      diffSinceLast = myWeights[0].weight - originalWeightVal;
    } else {
      diffSinceLast = myWeights[myWeights.length - 1].weight - myWeights[myWeights.length - 2].weight;
    }
  }

  // Progress Trend Text
  let progressTrendText = "Stable";
  if (totalWeightLost > 1) {
    progressTrendText = "📉 Moving Downward!";
  } else if (totalWeightLost < -1) {
    progressTrendText = "📈 Moving Upward";
  } else {
    progressTrendText = "🤝 Steady & Consistent";
  }

  // Add Weigh-In
  const handleAddNewWeighIn = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(weight);
    if (isNaN(parsed) || parsed <= 0) return;

    onAddWeight(parsed, notes, customDate);
    setWeight("");
    setNotes("");
    setSuccessMsg("Weigh-in tracked successfully! ⭐");

    // Inform Bliss
    const userDisplay = currentUser === "Rhon" ? "Rhonda" : "Susan";
    onBlissInteract(
      `Hey Bliss! I just logged a new weigh-in of ${parsed} lbs on ${customDate}${notes ? ` (Notes: "${notes}")` : ""}. Could you give me some warm encouragement for my wellness progress?`
    );

    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Delete Weigh-In Log
  const handleDeleteLog = (id: string) => {
    const updated = weightHistory.filter((w) => w.id !== id);
    setWeightHistory(updated);
    localStorage.setItem("forlife_weight_history_v3", JSON.stringify(updated));
    setSuccessMsg("Weigh-in record removed.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Milestone checkings
  const milestone5 = totalWeightLost >= 5;
  const milestone10 = totalWeightLost >= 10;
  const milestone25 = totalWeightLost >= 25;
  const goalReached = currentWeightVal <= (parseFloat(goalWeight) || 0);

  // Compile combined coordinates for standard SVG graph drawing
  const getGraphDataPoints = () => {
    const list: { dateLabel: string; weight: number }[] = [
      { dateLabel: "Start", weight: originalWeightVal }
    ];
    myWeights.forEach((w) => {
      list.push({ dateLabel: w.date, weight: w.weight });
    });
    return list;
  };

  const graphData = getGraphDataPoints();

  // Responsive SVG line drawing
  const renderInteractiveLossSvg = () => {
    if (graphData.length < 2) {
      return (
        <div id="no-graph-data" className="py-8 bg-stone-50/50 rounded-2xl text-center text-xs text-stone-400 font-bold border border-dashed border-stone-200">
          We will draw your interactive progress graph as soon as you record your first weigh-in check-in!
        </div>
      );
    }

    const height = 140;
    const padding = 20;
    const weightsArray = graphData.map((d) => d.weight);
    const maxVal = Math.max(...weightsArray, parseFloat(goalWeight) || 100) + 4;
    const minVal = Math.min(...weightsArray, parseFloat(goalWeight) || 300) - 4;
    const valueRange = maxVal - minVal || 10;

    // Calculate dynamic points mapping inside standard viewBox 100% / 140px
    const pointsString = graphData
      .map((val, idx) => {
        const xPercent = (idx / (graphData.length - 1)) * 100;
        const yCoord = padding + (1 - (val.weight - minVal) / valueRange) * (height - padding * 2);
        return `${xPercent}%,${yCoord}`;
      })
      .join(" ");

    return (
      <div className="bg-slate-50/75 border border-slate-205 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">
          <span>PROGRESS TIMELINE PATHWAY</span>
          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
            Goal: {goalWeight} lbs
          </span>
        </div>

        <div className="h-36 w-full relative pt-1" id="weight-trend-canvas-container">
          <svg className="w-full h-full overflow-visible" style={{ minWidth: "100%" }}>
            {/* Draw Horizontal Grid Lines */}
            {[0.25, 0.5, 0.75].map((ratio, gridIdx) => {
              const yVal = padding + ratio * (height - padding * 2);
              return (
                <line
                  key={gridIdx}
                  x1="0"
                  y1={yVal}
                  x2="100%"
                  y2={yVal}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Render Target Goal Horizontal Line (if within range) */}
            {parseFloat(goalWeight) >= minVal && parseFloat(goalWeight) <= maxVal && (
              <line
                x1="0"
                y1={padding + (1 - (parseFloat(goalWeight) - minVal) / valueRange) * (height - padding * 2)}
                x2="100%"
                y2={padding + (1 - (parseFloat(goalWeight) - minVal) / valueRange) * (height - padding * 2)}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            )}

            {/* Sparkline Polyline */}
            <polyline 
              fill="none" 
              stroke="#6366f1" 
              strokeWidth="3" 
              points={graphData.map((d, idx) => {
                const xPercent = graphData.length > 1 ? (idx / (graphData.length - 1)) * 100 : 50;
                const yCoord = padding + (1 - (d.weight - minVal) / valueRange) * (height - padding * 2);
                return `${xPercent} ${yCoord}`;
              }).map((point, idx) => {
                const parts = point.split(" ");
                return `${parts[0]}%,${parts[1]}`;
              }).join(" ")} 
            />

            {/* Points Overlay */}
            {graphData.map((val, idx) => {
              const xPercent = (idx / (graphData.length - 1)) * 100;
              const yCoord = padding + (1 - (val.weight - minVal) / valueRange) * (height - padding * 2);
              return (
                <g key={idx} className="group cursor-pointer">
                  <circle
                    cx={`${xPercent}%`}
                    cy={yCoord}
                    r="4.5"
                    className="fill-white stroke-indigo-600 stroke-2 hover:r-6 transition-all"
                  />
                  {/* Miniature Tooltip labels for points */}
                  <text
                    x={`${xPercent}%`}
                    y={yCoord - 10}
                    textAnchor="middle"
                    className="text-[9px] font-mono font-extrabold fill-indigo-950 bg-white opacity-90 select-none pointer-events-none"
                  >
                    {val.weight}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Labels Display footer */}
        <div className="flex justify-between text-[9px] font-mono text-slate-400 border-t border-slate-100 pt-1.5">
          <span className="font-semibold text-slate-500">Baseline ({startWeight} lbs)</span>
          <span className="font-extrabold text-indigo-600">Current ({currentWeightVal} lbs)</span>
        </div>
      </div>
    );
  };

  const userDisplayName = currentUser === "Rhon" ? "Rhonda" : "Susan";

  return (
    <div id="weigh-in-root" className="space-y-4 font-sans">

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-black border border-emerald-150 text-center flex items-center justify-center gap-1.5 animate-pulse">
          <Check className="w-4 h-4 text-emerald-600" /> {successMsg}
        </div>
      )}

      {/* SECTION 1: STARTING WEIGHT & GOAL BALESLINE (COLLAPSIBLE) */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-3xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowBaselineSection(!showBaselineSection)}
          className="w-full px-4.5 py-3.5 bg-stone-50/50 hover:bg-stone-50 flex justify-between items-center text-left border-b border-stone-150 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Scale className="w-4.5 h-4.5 text-indigo-650" />
            <strong className="text-xs uppercase font-extrabold tracking-wider text-slate-700 font-mono">
              Starting Weight & Target Baseline
            </strong>
          </div>
          {showBaselineSection ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {showBaselineSection && (
          <form onSubmit={handleSaveBaseline} className="p-4 bg-white space-y-4 animate-fade-in text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-[10.5px] font-black text-slate-650">Original Starting Weight (lbs)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={startWeight}
                  onChange={(e) => setStartWeight(e.target.value)}
                  placeholder="E.g. 250"
                  className="w-full bg-stone-50/60 border border-stone-250 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl px-3 py-2 font-semibold text-slate-850"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10.5px] font-black text-slate-650">Baseline Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-stone-50/60 border border-stone-250 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl px-3 py-2 font-semibold text-slate-850"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10.5px] font-black text-slate-650">Your Target Goal Weight (lbs)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(e.target.value)}
                  placeholder="E.g. 150"
                  className="w-full bg-stone-50/60 border border-stone-250 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl px-3 py-2 font-semibold text-slate-850"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-stone-100">
              <span className="text-[10px] text-stone-400 font-semibold flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Permanently sets your official health program milestones.
              </span>
              <button
                type="submit"
                className="bg-indigo-650 hover:bg-slate-900 text-white font-extrabold text-[11px] px-4.5 py-2 rounded-xl transition shadow-3xs cursor-pointer"
              >
                Save Baseline Details
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SECTION 2: ADD NEW WEIGH-IN (COLLAPSIBLE) */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-3xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAddSection(!showAddSection)}
          className="w-full px-4.5 py-3.5 bg-stone-50/50 hover:bg-stone-50 flex justify-between items-center text-left border-b border-stone-150 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4.5 h-4.5 text-emerald-600" />
            <strong className="text-xs uppercase font-extrabold tracking-wider text-slate-700 font-mono">
              Add New Weight Log
            </strong>
          </div>
          {showAddSection ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {showAddSection && (
          <form onSubmit={handleAddNewWeighIn} className="p-4 bg-white space-y-3.5 animate-fade-in text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-[10.5px] font-black text-slate-650">Weigh-in Reading (lbs)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="E.g., 247.2"
                  className="w-full bg-stone-50/60 border border-stone-250 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl px-3 py-2 font-semibold text-slate-850"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10.5px] font-black text-slate-650">Weigh-in Date</label>
                <input
                  type="date"
                  required
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full bg-stone-50/60 border border-stone-250 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl px-3 py-2 font-semibold text-slate-850"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10.5px] font-black text-slate-650">Optional notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g. fasted, morning routine done"
                  className="w-full bg-stone-50/60 border border-stone-250 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl px-3 py-2 font-semibold text-slate-850"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-300" /> Log Weigh-In Reading
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SECTION 3: PROGRESS METRICS & MILESTONES (COLLAPSIBLE) */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-3xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowProgressSection(!showProgressSection)}
          className="w-full px-4.5 py-3.5 bg-stone-50/50 hover:bg-stone-50 flex justify-between items-center text-left border-b border-stone-150 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4.5 h-4.5 text-amber-500" />
            <strong className="text-xs uppercase font-extrabold tracking-wider text-slate-700 font-mono">
              Health Metrics & Milestones
            </strong>
          </div>
          {showProgressSection ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {showProgressSection && (
          <div className="p-4 bg-white space-y-4 animate-fade-in">
            {/* Real-time stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-indigo-50/30 p-3 rounded-2xl border border-indigo-100/50 text-center">
                <span className="text-[10px] text-slate-400 block font-bold font-mono">STARTING WEIGHT</span>
                <span className="text-base font-black text-indigo-950 leading-none mt-1 block">
                  {originalWeightVal} lbs
                </span>
                <span className="text-[9px] text-slate-500 block font-semibold mt-1">
                  {formatStartDisplayDate(startDate)}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 block font-bold font-mono">CURRENT WEIGHT</span>
                <span className="text-base font-black text-slate-900 leading-none mt-1 block">
                  {currentWeightVal} lbs
                </span>
                <span className="text-[9px] text-slate-500 block font-semibold mt-1">
                  Last logged: {lastWeighInLabel}
                </span>
              </div>

              <div className="bg-emerald-50/30 p-3 rounded-2xl border border-emerald-100/40 text-center">
                <span className="text-[10px] text-slate-400 block font-bold font-mono">TOTAL LOST</span>
                <span className="text-base font-black text-emerald-800 leading-none mt-1 block">
                  {totalWeightLost > 0 ? `${totalWeightLost.toFixed(1)} lbs` : "0 lbs"}
                </span>
                <span className="text-[9px] text-emerald-600 block font-semibold mt-1">
                  Overall Progress
                </span>
              </div>

              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-150 text-center">
                <span className="text-[10px] text-slate-400 block font-bold font-mono">DIFFERENCE FROM LAST</span>
                <span className={`text-base font-black leading-none mt-1 block ${diffSinceLast < 0 ? "text-emerald-700" : diffSinceLast > 0 ? "text-rose-600" : "text-stone-500"}`}>
                  {diffSinceLast === 0 ? "—" : diffSinceLast > 0 ? `+${diffSinceLast.toFixed(1)} lbs` : `${diffSinceLast.toFixed(1)} lbs`}
                </span>
                <span className="text-[9px] text-stone-500 block font-semibold mt-1">
                  {progressTrendText}
                </span>
              </div>
            </div>

            {/* Achievement badges */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Milestone Achievements</span>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {/* 1. First 5lbs */}
                <div className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                  milestone5 
                    ? "bg-amber-50/55 border-amber-300 shadow-3xs" 
                    : "bg-stone-50 border-stone-150 opacity-50"
                }`}>
                  <Trophy className={`w-5 h-5 mb-1 ${milestone5 ? "text-amber-500 animate-bounce" : "text-stone-300"}`} />
                  <span className="text-[11px] font-black text-slate-850 block">First 5 lbs Lost</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">{milestone5 ? "Unlocked! 🎉" : "Locked"}</span>
                </div>

                {/* 2. First 10lbs */}
                <div className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                  milestone10 
                    ? "bg-amber-50/55 border-amber-300 shadow-3xs" 
                    : "bg-stone-50 border-stone-150 opacity-50"
                }`}>
                  <Trophy className={`w-5 h-5 mb-1 ${milestone10 ? "text-amber-500 animate-bounce" : "text-stone-300"}`} />
                  <span className="text-[11px] font-black text-slate-850 block">First 10 lbs Lost</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">{milestone10 ? "Unlocked! 🌟" : "Locked"}</span>
                </div>

                {/* 3. First 25lbs */}
                <div className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                  milestone25 
                    ? "bg-amber-50/55 border-amber-300 shadow-3xs" 
                    : "bg-stone-50 border-stone-150 opacity-50"
                }`}>
                  <Trophy className={`w-5 h-5 mb-1 ${milestone25 ? "text-amber-500 animate-bounce" : "text-stone-300"}`} />
                  <span className="text-[11px] font-black text-slate-850 block">25 lbs Lost</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">{milestone25 ? "Superstar! 🚀" : "Locked"}</span>
                </div>

                {/* 4. Goal Reached */}
                <div className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                  goalReached 
                    ? "bg-emerald-50/55 border-emerald-300 shadow-3xs" 
                    : "bg-stone-50 border-stone-150 opacity-50"
                }`}>
                  <Goal className={`w-5 h-5 mb-1 ${goalReached ? "text-emerald-500 animate-pulse" : "text-stone-300"}`} />
                  <span className="text-[11px] font-black text-slate-850 block">Goal Weight reached</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">{goalReached ? "Victory! 🏆" : "Goal: " + goalWeight + " lbs"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: PROGRESS TREND GRAPH (COLLAPSIBLE) */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-3xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowGraphSection(!showGraphSection)}
          className="w-full px-4.5 py-3.5 bg-stone-50/50 hover:bg-stone-50 flex justify-between items-center text-left border-b border-stone-150 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4.5 h-4.5 text-indigo-650" />
            <strong className="text-xs uppercase font-extrabold tracking-wider text-slate-700 font-mono">
              Interactive Weight-Loss Graph
            </strong>
          </div>
          {showGraphSection ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {showGraphSection && (
          <div className="p-4 bg-white animate-fade-in">
            {renderInteractiveLossSvg()}
          </div>
        )}
      </div>

      {/* SECTION 5: COMPLETES WEIGH-IN LOGS (COLLAPSIBLE) */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-3xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowHistorySection(!showHistorySection)}
          className="w-full px-4.5 py-3.5 bg-stone-50/50 hover:bg-stone-50 flex justify-between items-center text-left border-b border-stone-150 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-purple-600" />
            <strong className="text-xs uppercase font-extrabold tracking-wider text-slate-700 font-mono">
              Complete Weigh-In History Logs
            </strong>
          </div>
          {showHistorySection ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {showHistorySection && (
          <div className="p-4 bg-white space-y-3.5 animate-fade-in text-xs">
            {myWeights.length === 0 ? (
              <p className="text-center italic py-4 text-stone-400 font-bold">
                No past logs recorded yet for {userDisplayName}. Get started by logging a Reading above!
              </p>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {/* Baseline first in history */}
                <div className="p-3 bg-stone-50 border border-stone-150 rounded-2xl flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-850 block">Baseline: {originalWeightVal} lbs</span>
                    <span className="text-[10px] text-stone-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" /> {formatStartDisplayDate(startDate)}
                    </span>
                  </div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">BASE</span>
                </div>

                {/* Then actual user logs (reverse chronological so newest at top) */}
                {[...myWeights].reverse().map((w) => {
                  return (
                    <div key={w.id} className="p-3 bg-white border border-stone-205 hover:border-slate-350 rounded-2xl flex justify-between items-center transition shadow-3xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.8">
                          <span className="font-black text-[13px] text-slate-900">{w.weight} lbs</span>
                          {w.notes && (
                            <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg italic">
                              "{w.notes}"
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" /> {w.date}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteLog(w.id)}
                        className="p-2 bg-red-50 text-red-650 hover:bg-red-100 border border-red-200 rounded-xl transition cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Positive Encouragement Advice Box */}
      <div id="weigh-in-accountability-advice" className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 flex gap-3.5 items-start">
        <div className="p-2 bg-amber-500/10 text-amber-700 rounded-xl shrink-0 mt-0.5 animate-pulse">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-[11px] font-medium leading-relaxed text-amber-900 space-y-1">
          <span className="font-extrabold uppercase text-[9px] tracking-wider text-amber-800 block">Encouragement for {userDisplayName} 💛</span>
          <p>
            Scaling fluctuations are completely natural! Your progress is measured by the loving consistency of your sobriety, nourishment commitments, and mindful choices, friend. Give yourself immense credit today!
          </p>
        </div>
      </div>

    </div>
  );
}
