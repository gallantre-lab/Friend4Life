import React, { useState } from "react";
import { Plus, Check, Trash2, Star, Percent, Award } from "lucide-react";

export interface GoalItem {
  id: string;
  text: string;
  completed: boolean;
  streak: number;
  user: "Rhon" | "Suz";
}

interface GoalsCardProps {
  currentUser: "Rhon" | "Suz";
  goals: GoalItem[];
  setGoals: React.Dispatch<React.SetStateAction<GoalItem[]>>;
  onLogActivity: (text: string, type: "habit") => void;
  onBlissInteract: (text: string) => void;
}

export default function GoalsCard({
  currentUser,
  goals,
  setGoals,
  onLogActivity,
  onBlissInteract
}: GoalsCardProps) {
  const [newGoalText, setNewGoalText] = useState("");

  const handleToggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newVal = !g.completed;
          const newStreak = newVal ? g.streak + 1 : Math.max(0, g.streak - 1);
          
          if (newVal) {
            onLogActivity(`Completed Goal: "${g.text}"`, "habit");
          }

          return {
            ...g,
            completed: newVal,
            streak: newStreak
          };
        }
        return g;
      })
    );
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;

    const newGoal: GoalItem = {
      id: "goal_" + Date.now() + Math.random().toString(36).substring(2, 6),
      text: newGoalText.trim(),
      completed: false,
      streak: 0,
      user: currentUser
    };

    setGoals((prev) => [...prev, newGoal]);
    setNewGoalText("");
    onLogActivity(`Added custom goal: "${newGoal.text}"`, "habit");
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const myGoals = goals.filter((g) => g.user === currentUser);
  const completedCount = myGoals.filter((g) => g.completed).length;
  const percentComplete = myGoals.length > 0 ? Math.round((completedCount / myGoals.length) * 100) : 0;

  const handleCelebrate = () => {
    const userDisplay = currentUser === "Rhon" ? "Rhonda" : "Susan";
    onBlissInteract(
      `Bliss, my partner! I've accomplished ${completedCount}/${myGoals.length} of our recovery goals today! Could you write a warm congratulatory message for our journal history?`
    );
  };

  return (
    <div id="goals-card-panel" className="space-y-4 font-sans text-xs md:text-sm">
      
      {/* Percentage complete meter bar */}
      <div className="bg-slate-50 p-3.5 border border-slate-150 rounded-2xl flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wide inline-flex items-center gap-1.5 leading-none">
            <Award className="w-4 h-4 text-emerald-600" /> Daily Target Streak
          </h4>
          <p className="text-[10px] text-slate-500 font-medium">Completed {completedCount} of {myGoals.length} trackers today</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-sm font-black text-slate-900 font-mono">{percentComplete}%</span>
          </div>
          {percentComplete === 100 && myGoals.length > 0 && (
            <button
              type="button"
              onClick={handleCelebrate}
              className="px-3 py-1 bg-emerald-900 hover:bg-emerald-800 text-white font-black text-[10px] rounded-lg shadow-sm cursor-pointer transition animate-bounce"
            >
              Celebrate Win! 🎉
            </button>
          )}
        </div>
      </div>

      {/* Goal Items List */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {myGoals.length === 0 ? (
          <div className="p-4 text-center text-slate-400 italic">
            Add some goals to begin checking streaks!
          </div>
        ) : (
          myGoals.map((g) => (
            <div
              key={g.id}
              className="p-3 bg-white border border-slate-150 rounded-xl flex items-center justify-between gap-3 shadow-2xs hover:border-slate-350 transition"
            >
              <div className="flex items-center gap-3 flex-1 select-none">
                <button
                  type="button"
                  onClick={() => handleToggleGoal(g.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                    g.completed
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "border-slate-300 hover:border-slate-400 bg-slate-50"
                  }`}
                >
                  {g.completed && <Check className="w-3.5 h-3.5" />}
                </button>
                <div className="space-y-0.5">
                  <span className={`text-xs font-semibold leading-tight block ${g.completed ? "line-through text-slate-400" : "text-slate-800 font-bold"}`}>
                    {g.text}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
                    <span>Fire Streak:</span>
                    <span className="text-[10px] text-amber-600 font-bold">🔥 {g.streak} days</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteGoal(g.id)}
                className="p-1 px-1.5 hover:bg-rose-50 text-slate-350 hover:text-rose-600 rounded-lg transition border border-stone-150 border-none cursor-pointer"
                title="Remove goal tracker"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Goal entry creator form */}
      <form onSubmit={handleCreateGoal} className="flex gap-2">
        <input
          type="text"
          required
          placeholder="E.g., Attend Noon AA post-lunch, complete evening inventories..."
          className="flex-1 bg-slate-50 border border-slate-205 focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none font-semibold transition shadow-3xs"
          value={newGoalText}
          onChange={(e) => setNewGoalText(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 bg-slate-950 hover:bg-slate-850 text-white font-bold rounded-xl text-xs cursor-pointer transition shadow-xs"
        >
          Add Goal
        </button>
      </form>

    </div>
  );
}
