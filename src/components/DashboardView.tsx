import React, { useState } from "react";
import { UserProfile, WeightRecord, WaterRecord, ExerciseRecord, FoodRecord, WinRecord } from "../types";
import { 
  Users, Scale, Droplet, Dumbbell, Utensils, 
  Sparkles, PlusCircle, Volume2, Mic, Flame, 
  CheckCircle, ShieldCheck, Heart, Trash2, Award, Calendar, Compass
} from "lucide-react";

interface DashboardViewProps {
  currentUser: "rhon" | "suz" | "shared";
  setCurrentUser: (user: "rhon" | "suz" | "shared") => void;
  rhonProfile: UserProfile;
  suzProfile: UserProfile;
  weightHistory: WeightRecord[];
  waterHistory: WaterRecord[];
  exerciseHistory: ExerciseRecord[];
  foodHistory: FoodRecord[];
  onAddWeight: (weight: number, notes: string) => void;
  onAddWater: (ounces: number) => void;
  onAddExercise: (minutes: number, activity: string) => void;
  onAddFood: (foodName: string, calories: number, protein: number) => void;
  onAddScanMeal: (rawText: string) => void;
  onStartVoiceChat: () => void;
  onDeleteWeight: (id: string) => void;
  onDeleteWater: (id: string) => void;
  onDeleteExercise: (id: string) => void;
  onDeleteFood: (id: string) => void;
}

export default function DashboardView({
  currentUser,
  setCurrentUser,
  rhonProfile,
  suzProfile,
  weightHistory,
  waterHistory,
  exerciseHistory,
  foodHistory,
  onAddWeight,
  onAddWater,
  onAddExercise,
  onAddFood,
  onAddScanMeal,
  onStartVoiceChat,
  onDeleteWeight,
  onDeleteWater,
  onDeleteExercise,
  onDeleteFood
}: DashboardViewProps) {
  // Active selected user for logging context
  const activeUserKey: "Rhon" | "Suz" = currentUser === "suz" ? "Suz" : "Rhon";

  // Modal / Input Popups
  const [showLogWeight, setShowLogWeight] = useState(false);
  const [showLogWater, setShowLogWater] = useState(false);
  const [showLogExercise, setShowLogExercise] = useState(false);
  const [showLogFood, setShowLogFood] = useState(false);
  const [showScanMeal, setShowScanMeal] = useState(false);

  // Form states
  const [weightVal, setWeightVal] = useState("");
  const [weightNotes, setWeightNotes] = useState("");
  const [waterVal, setWaterVal] = useState("8");
  const [exMin, setExMin] = useState("");
  const [exType, setExType] = useState("Walk");
  const [foodNameVal, setFoodNameVal] = useState("");
  const [foodCal, setFoodCal] = useState("");
  const [foodProt, setFoodProt] = useState("");
  const [rawScanText, setRawScanText] = useState("");

  // Filter trends by current user
  const activeUserWeights = weightHistory.filter(w => w.user === activeUserKey);
  const activeUserWater = waterHistory.filter(w => w.user === activeUserKey);
  const activeUserExercise = exerciseHistory.filter(e => e.user === activeUserKey);
  const activeUserFood = foodHistory.filter(f => f.user === activeUserKey);

  // Today's Date String
  const todayStr = new Date().toISOString().split("T")[0];

  // Daily Sum stats
  const todayWaterSum = activeUserWater
    .filter(w => w.date === todayStr)
    .reduce((sum, curr) => sum + curr.ounces, 0);

  const todayExerciseSum = activeUserExercise
    .filter(e => e.date === todayStr)
    .reduce((sum, curr) => sum + curr.minutes, 0);

  const todayCaloriesSum = activeUserFood
    .filter(f => f.date === todayStr)
    .reduce((sum, curr) => sum + curr.calories, 0);

  const todayProteinSum = activeUserFood
    .filter(f => f.date === todayStr)
    .reduce((sum, curr) => sum + curr.protein, 0);

  const activeProfile = activeUserKey === "Rhon" ? rhonProfile : suzProfile;

  // Simple custom SVG Sparkline Helpers
  const renderSparkline = (data: number[], color: string, height: number = 50) => {
    if (data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-[10px] text-slate-400 font-medium">
          No logs to graph
        </div>
      );
    }
    const max = Math.max(...data) + (Math.max(...data) === 0 ? 10 : Math.max(...data)*0.1);
    const min = Math.min(...data) - (Math.min(...data) === 0 ? 0 : Math.min(...data)*0.1);
    const range = max - min || 1;

    const points = data.map((val, idx) => {
      const x = data.length > 1 ? (idx / (data.length - 1)) * 100 : 50;
      const y = height - ((val - min) / range) * (height - 10);
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg className="w-full h-full overflow-visible" style={{ minHeight: height }}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          points={points}
        />
        {data.map((val, idx) => {
          const x = data.length > 1 ? (idx / (data.length - 1)) * 100 : 50;
          const y = height - ((val - min) / range) * (height - 10);
          return (
            <circle
              key={idx}
              cx={`${x}%`}
              cy={y}
              r="3.5"
              className="fill-white cursor-help hover:r-5 transition-all"
              stroke={color}
              strokeWidth="2"
            >
              <title>{`${val}`}</title>
            </circle>
          );
        })}
      </svg>
    );
  };

  // Weight Trend numbers
  const weightValues = activeUserWeights.map(w => w.weight);
  
  // Last 7 days water
  const last7DailyWaterSum: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split("T")[0];
    const sum = activeUserWater.filter(w => w.date === dStr).reduce((s, c) => s + c.ounces, 0);
    last7DailyWaterSum.push(sum);
  }

  // Last 7 days exercise minutes
  const last7DailyExerciseSum: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split("T")[0];
    const sum = activeUserExercise.filter(e => e.date === dStr).reduce((s, c) => s + c.minutes, 0);
    last7DailyExerciseSum.push(sum);
  }

  // Last 7 days protein
  const last7DailyProteinSum: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split("T")[0];
    const sum = activeUserFood.filter(f => f.date === dStr).reduce((s, c) => s + c.protein, 0);
    last7DailyProteinSum.push(sum);
  }

  // Weekly Analytic Insights
  const calculateInsights = () => {
    let weightChangeStr = "No weight trend logged yet.";
    if (activeUserWeights.length >= 2) {
      const diff = activeUserWeights[activeUserWeights.length - 1].weight - activeUserWeights[0].weight;
      weightChangeStr = diff < 0 
        ? `${Math.abs(diff).toFixed(1)} lbs reduction logged. Steady and healthy!` 
        : diff === 0 ? "Weight stable. Great consistency!" : `Gently fluctuating (+${diff.toFixed(1)} lbs). Remember, Fluctuations are normal! 💛`;
    }

    const waterMeetCount = last7DailyWaterSum.filter(v => v >= 64).length;
    const hydrationRating = waterMeetCount >= 5 
      ? "Superb! Hydrated 5+ days this week." 
      : waterMeetCount > 0 
        ? "Good starts. Aim for 64oz (8 glasses) of clean water." 
        : "Let's log water today! Bliss is keeping track.";

    const exerciseMeetCount = last7DailyExerciseSum.filter(v => v > 0).length;
    const gymGoal = exerciseMeetCount >= 4 
      ? "Absolute consistency! Movement is a daily gift." 
      : "Excellent pacing. Gentle walks or gardening count beautifully!";

    return {
      weightChange: weightChangeStr,
      hydration: hydrationRating,
      exercise: gymGoal,
      weeklyStats: `Checked-in today. Streak: ${activeProfile.streak} days.`
    };
  };

  const insights = calculateInsights();

  // Handle Form Submissions
  const submitWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightVal);
    if (!isNaN(w) && w > 0) {
      onAddWeight(w, weightNotes);
      setWeightVal("");
      setWeightNotes("");
      setShowLogWeight(false);
    }
  };

  const submitWater = (e: React.FormEvent) => {
    e.preventDefault();
    const oz = parseInt(waterVal);
    if (!isNaN(oz) && oz > 0) {
      onAddWater(oz);
      setShowLogWater(false);
    }
  };

  const submitExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(exMin);
    if (!isNaN(mins) && mins > 0) {
      onAddExercise(mins, exType);
      setExMin("");
      setShowLogExercise(false);
    }
  };

  const submitFood = (e: React.FormEvent) => {
    e.preventDefault();
    const cal = parseInt(foodCal) || 0;
    const prot = parseInt(foodProt) || 0;
    if (foodNameVal.trim()) {
      onAddFood(foodNameVal, cal, prot);
      setFoodNameVal("");
      setFoodCal("");
      setFoodProt("");
      setShowLogFood(false);
    }
  };

  const submitScanMealText = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawScanText.trim()) {
      onAddScanMeal(rawScanText);
      setRawScanText("");
      setShowScanMeal(false);
    }
  };

  return (
    <div id="wellness-dashboard-outer" className="space-y-6">
      
      {/* Upper Status Bar - Select Active User Profile & Streak Display */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <span className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-900 font-extrabold flex items-center justify-center text-lg shadow-inner">
            {activeUserKey[0]}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-tight">
                {activeUserKey}'s Wellness Profile
              </h2>
              {activeProfile.glutenFree && (
                <span className="text-[10px] uppercase font-bold bg-emerald-900 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                  Gluten-Free 🌾
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Weight trend target: {activeProfile.currentWeight} lbs → Goal: <span className="text-emerald-400 font-extrabold">{activeProfile.goalWeight} lbs</span> (sustainable pacing)
            </p>
          </div>
        </div>

        {/* Gamified Streak & Badge rack */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <div className="bg-slate-800 rounded-2xl px-3.5 py-2 border border-slate-750 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
            <div className="text-left">
              <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Daily Streak</span>
              <span className="text-sm font-black text-white">{activeProfile.streak} Days</span>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-2xl px-3.5 py-2 border border-slate-750 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <div className="text-left">
              <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Badges Badged</span>
              <span className="text-sm font-black text-white">{activeProfile.badges.length || 1} level</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Daily Goals trackers */}
      <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider pt-2">Today's Daily Logs Checklist</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* WATER TRACKER */}
        <div className="bg-white rounded-3xl p-4 border border-blue-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Water Intake</span>
            <span className="p-1 rounded-lg bg-blue-50 text-blue-600"><Droplet className="w-4 h-4" /></span>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 tracking-tight block">
              {todayWaterSum} <span className="text-xs text-slate-400 font-medium">oz</span>
            </span>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all" 
                style={{ width: `${Math.min((todayWaterSum / 64) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Goal: 64 oz</span>
          </div>
        </div>

        {/* EXERCISE TRACKER */}
        <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Exercise Log</span>
            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600"><Dumbbell className="w-4 h-4" /></span>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 tracking-tight block">
              {todayExerciseSum} <span className="text-xs text-slate-400 font-medium">mins</span>
            </span>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all" 
                style={{ width: `${Math.min((todayExerciseSum / 30) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Goal: 30 mins movement</span>
          </div>
        </div>

        {/* CALORIES SUM */}
        <div className="bg-white rounded-3xl p-4 border border-amber-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Calories</span>
            <span className="p-1 rounded-lg bg-amber-50 text-amber-600"><Utensils className="w-4 h-4" /></span>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 tracking-tight block">
              {todayCaloriesSum} <span className="text-xs text-slate-400 font-medium">kcal</span>
            </span>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div 
                className="bg-amber-500 h-1.5 rounded-full transition-all" 
                style={{ width: `${Math.min((todayCaloriesSum / 1800) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Limit: ~1800 kcal</span>
          </div>
        </div>

        {/* NITROGEN/PROTEIN TRACKER */}
        <div className="bg-white rounded-3xl p-4 border border-red-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Protein Loading</span>
            <span className="p-1 rounded-lg bg-red-50 text-red-600"><Flame className="w-4 h-4" /></span>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 tracking-tight block">
              {todayProteinSum} <span className="text-xs text-slate-400 font-medium">g</span>
            </span>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div 
                className="bg-red-500 h-1.5 rounded-full transition-all" 
                style={{ width: `${Math.min((todayProteinSum / 90) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Goal: 90 g minimum</span>
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="bg-slate-100 rounded-3xl p-4 border border-slate-200">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-2 text-center">Quick Action Handlers</span>
        <div className="flex flex-wrap gap-2.5 items-center justify-center">
          <button 
            type="button" 
            onClick={() => setShowLogWeight(true)}
            className="bg-slate-900 text-white hover:bg-slate-800 text-xs py-2 px-3.5 rounded-2xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Scale className="w-4 h-4 text-emerald-400" /> Add Weight
          </button>
          
          <button 
            type="button" 
            onClick={() => setShowLogWater(true)}
            className="bg-slate-900 text-white hover:bg-slate-800 text-xs py-2 px-3.5 rounded-2xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Droplet className="w-4 h-4 text-blue-400" /> Log Water
          </button>

          <button 
            type="button" 
            onClick={() => setShowLogExercise(true)}
            className="bg-slate-900 text-white hover:bg-slate-800 text-xs py-2 px-3.5 rounded-2xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Dumbbell className="w-4 h-4 text-emerald-400" /> Log Exercise
          </button>

          <button 
            type="button" 
            onClick={() => setShowLogFood(true)}
            className="bg-slate-900 text-white hover:bg-slate-800 text-xs py-2 px-3.5 rounded-2xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Utensils className="w-4 h-4 text-amber-400" /> Log Food
          </button>

          <button 
            type="button" 
            onClick={() => setShowScanMeal(true)}
            className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs py-2 px-3.5 rounded-2xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" /> Scan Meal
          </button>

          <button 
            type="button" 
            onClick={onStartVoiceChat}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs py-2 px-4 rounded-2xl font-extrabold flex items-center gap-2 shadow-md cursor-pointer animate-pulse"
          >
            <Mic className="w-4 h-4 text-emerald-200 animate-spin" style={{ animationDuration: "12s" }} /> Start Voice Lounge
          </button>
        </div>
      </div>

      {/* QUICK LOG MODALS / OVERLAYS */}
      {showLogWeight && (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 relative">
          <h4 className="font-bold text-slate-800 text-xs uppercase block mb-2">Record Scale Weight ({activeUserKey})</h4>
          <form onSubmit={submitWeight} className="flex flex-wrap gap-2">
            <input 
              type="text" 
              value={weightVal} 
              onChange={e => setWeightVal(e.target.value)}
              placeholder="e.g. 159.5" 
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
              required 
            />
            <input 
              type="text" 
              value={weightNotes} 
              onChange={e => setWeightNotes(e.target.value)}
              placeholder="Comfort note (e.g. slept well)" 
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 flex-1" 
            />
            <button type="submit" className="bg-slate-900 text-white hover:bg-slate-950 font-bold px-3 py-1.5 text-xs rounded-xl cursor-pointer">Log</button>
            <button type="button" onClick={() => setShowLogWeight(false)} className="bg-slate-200 text-slate-600 px-3 py-1.5 text-xs rounded-xl cursor-pointer">Cancel</button>
          </form>
        </div>
      )}

      {showLogWater && (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 relative">
          <h4 className="font-bold text-slate-800 text-xs uppercase block mb-2">Record Drank Water ({activeUserKey})</h4>
          <form onSubmit={submitWater} className="flex flex-wrap gap-2 items-center">
            <select 
              value={waterVal} 
              onChange={e => setWaterVal(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
            >
              <option value="8">8 oz (1 elegant glass)</option>
              <option value="12">12 oz (small shaker)</option>
              <option value="16">16 oz (standard pint glass)</option>
              <option value="24">24 oz (athletic bottle)</option>
              <option value="32">32 oz (large insulated flask)</option>
            </select>
            <button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 font-bold px-4 py-1.5 text-xs rounded-xl cursor-pointer">Log Cup</button>
            <button type="button" onClick={() => setShowLogWater(false)} className="bg-slate-200 text-slate-600 px-3 py-1.5 text-xs rounded-xl cursor-pointer">Cancel</button>
          </form>
        </div>
      )}

      {showLogExercise && (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 relative font-sans">
          <h4 className="font-bold text-slate-800 text-xs uppercase block mb-2">Log Realistic Movement ({activeUserKey})</h4>
          <form onSubmit={submitExercise} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input 
              type="number" 
              value={exMin} 
              onChange={e => setExMin(e.target.value)}
              placeholder="Minutes (e.g. 20)" 
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
              required 
            />
            <select
              value={exType}
              onChange={e => setExType(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
            >
              <option value="Walk">Sunset Walk 🚶‍♀️</option>
              <option value="Gardening">Gardening / Yardwork 🌿</option>
              <option value="Stretching">Light Yoga / Stretching 🧘‍♀️</option>
              <option value="Strength">Light Strength Training 💪</option>
            </select>
            <button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-3 py-1.5 text-xs rounded-xl cursor-pointer">Save Movement</button>
            <button type="button" onClick={() => setShowLogExercise(false)} className="bg-slate-200 text-slate-600 px-3 py-1.5 text-xs rounded-xl cursor-pointer">Cancel</button>
          </form>
        </div>
      )}

      {showLogFood && (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 relative">
          <h4 className="font-bold text-slate-800 text-xs uppercase block mb-2">Log Today's Meal ({activeUserKey})</h4>
          <form onSubmit={submitFood} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <input 
              type="text" 
              value={foodNameVal} 
              onChange={e => setFoodNameVal(e.target.value)}
              placeholder="e.g. Skinless Chicken & spinach" 
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 sm:col-span-2"
              required 
            />
            <input 
              type="number" 
              value={foodCal} 
              onChange={e => setFoodCal(e.target.value)}
              placeholder="Calories (kcal)" 
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
            />
            <input 
              type="number" 
              value={foodProt} 
              onChange={e => setFoodProt(e.target.value)}
              placeholder="Protein (g)" 
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
            />
            <div className="flex gap-1.5 sm:col-span-1">
              <button type="submit" className="bg-amber-600 text-white hover:bg-amber-700 font-bold px-3.5 py-1.5 text-xs rounded-xl cursor-pointer flex-1">Save</button>
              <button type="button" onClick={() => setShowLogFood(false)} className="bg-slate-200 text-slate-600 px-2 py-1.5 text-xs rounded-xl cursor-pointer">X</button>
            </div>
          </form>
        </div>
      )}

      {showScanMeal && (
        <div className="bg-gradient-to-tr from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 relative font-sans">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-5 h-5 text-amber-600 animate-spin" style={{ animationDuration: "15s" }} />
            <h4 className="font-bold text-slate-800 text-sm">Bliss Meal Scanner & Paste Block</h4>
          </div>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Paste a descriptive list of foods or meals eaten. Bliss processes the ingredients, logs estimating nutrients on this page, and highlights custom recipes using only active pantry supplies.
          </p>
          <form onSubmit={submitScanMealText} className="space-y-3">
            <textarea
              value={rawScanText}
              onChange={e => setRawScanText(e.target.value)}
              placeholder="e.g. Paste food list from notes app: Grilled gluten free chicken thighs, half avocado, double sautéed spinach with olive oil."
              className="w-full bg-white border border-teal-250 rounded-xl p-3 text-xs text-slate-700 min-h-[90px] focus:outline-none focus:border-amber-500 resize-none"
              required
            />
            <div className="flex justify-end gap-2 text-xs">
              <button type="button" onClick={() => setShowScanMeal(false)} className="bg-slate-200 text-slate-600 px-3.5 py-1.5 rounded-xl cursor-pointer">Cancel</button>
              <button type="submit" className="bg-amber-600 text-white hover:bg-amber-700 font-bold px-4.5 py-1.5 rounded-xl cursor-pointer">Upload & Scan Now</button>
            </div>
          </form>
        </div>
      )}

      {/* DETAILED PROGRESS TREND DIAGRAMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WEIGHT PROGRESS CARD */}
        <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-500" /> Weight Tracking Trend (weekly)
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Total Entries: {activeUserWeights.length}</span>
          </div>
          
          <div className="h-44 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
            {weightValues.length > 0 ? (
              <div className="h-28 relative">
                {renderSparkline(weightValues, "#10b981", 110)}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 text-center">
                <Compass className="w-8 h-8 text-slate-300 mb-1" />
                No weight logs yet. Log a starting weight today!
              </div>
            )}
            <div className="text-[10px] text-slate-500 text-center font-medium mt-1 leading-normal border-t border-slate-100 pt-1.5">
              Rhon's Target: lose ~20 lbs sustainably. Weight fluctuates naturally!
            </div>
          </div>
        </div>

        {/* WATER TRACKING TRENDS */}
        <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-blue-500" /> Hydration History (Last 7 Days)
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Target: 64 oz</span>
          </div>

          <div className="h-44 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
            <div className="h-28 relative">
              {renderSparkline(last7DailyWaterSum, "#3b82f6", 110)}
            </div>
            <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase px-1 border-t border-slate-100 pt-1.5">
              <span>6 Days Ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* EXERCISE TREND MINUTES */}
        <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-emerald-500" /> Movement consistency (Last 7 Days)
            </h4>
            <span className="text-[10px] font-mono text-emerald-400">Goal: 30m / day</span>
          </div>

          <div className="h-44 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
            <div className="h-28 relative">
              {renderSparkline(last7DailyExerciseSum, "#10b981", 110)}
            </div>
            <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase px-1 border-t border-slate-100 pt-1.5">
              <span>6 Days Ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* NUTRITION & PROTEIN TREND */}
        <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500" /> Daily Protein Load History
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Target: 90 g</span>
          </div>

          <div className="h-44 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
            <div className="h-28 relative">
              {renderSparkline(last7DailyProteinSum, "#f43f5e", 110)}
            </div>
            <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase px-1 border-t border-slate-100 pt-1.5">
              <span>6 Days Ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

      </div>

      {/* WEEKLY ANALYTICS SUMMARY INSIGHTS CONTAINER */}
      <div id="weekly-analytics-insights" className="bg-gradient-to-tr from-emerald-50 via-white to-teal-50 rounded-3xl p-5 border border-emerald-150 shadow-sm font-sans">
        <h4 className="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
          <CheckCircle className="w-5 h-5 text-emerald-600" /> Weekly Summary & Holistic Progress
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Weight Dynamics</span>
            <span className="text-slate-700 font-medium leading-relaxed block">{insights.weightChange}</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Hydration Consistency</span>
            <span className="text-slate-700 font-medium leading-relaxed block">{insights.hydration}</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Movement consistency</span>
            <span className="text-slate-700 font-medium leading-relaxed block">{insights.exercise}</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Health Pacing Goal</span>
            <span className="text-slate-700 font-medium leading-relaxed block">
              {activeUserKey}'s medication ({activeProfile.meds || "No routine logged"}) matches GF dietary bounds.
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
