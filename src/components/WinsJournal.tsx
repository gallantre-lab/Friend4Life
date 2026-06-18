import React, { useState } from "react";
import { WinRecord } from "../types";
import { Award, PlusCircle, Sparkles, Smile, Trash2 } from "lucide-react";

interface WinsJournalProps {
  winsList: WinRecord[];
  onAddWin: (text: string, user: "Rhon" | "Suz" | "Together") => void;
  onDeleteWin: (id: string) => void;
  onTriggerBlissCelebrate: () => void;
}

export default function WinsJournal({
  winsList,
  onAddWin,
  onDeleteWin,
  onTriggerBlissCelebrate
}: WinsJournalProps) {
  const [winText, setWinText] = useState("");
  const [winUser, setWinUser] = useState<"Rhon" | "Suz" | "Together">("Rhon");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winText.trim()) return;
    onAddWin(winText, winUser);
    setWinText("");
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayWins = winsList.filter((w) => w.date === todayStr);

  return (
    <div id="wins-journal-section" className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 rounded-3xl p-6 border border-emerald-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Daily Wins Journal</h3>
            <p className="text-xs text-slate-600">
              Big or small, progress beats perfection! Rhon and Suz deserve to be celebrated.
            </p>
          </div>
        </div>

        <button 
          type="button"
          onClick={onTriggerBlissCelebrate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" /> Celebrations from Bliss
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form area */}
        <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm space-y-4">
          <div className="flex items-center gap-1.5">
            <Smile className="w-5 h-5 text-emerald-500" />
            <h4 className="font-bold text-slate-800 text-sm">Add a win!</h4>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3 font-sans">
            <div>
              <label className="block text-xs uppercase text-slate-400 tracking-wider mb-1">Who completed it?</label>
              <div className="grid grid-cols-3 gap-1">
                {(["Rhon", "Suz", "Together"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setWinUser(u)}
                    className={`text-xs py-1.5 px-2 rounded-xl border font-semibold transition ${
                      winUser === u 
                        ? "bg-slate-800 border-slate-800 text-white" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase text-slate-400 tracking-wider mb-1">What went well?</label>
              <textarea
                value={winText}
                onChange={(e) => setWinText(e.target.value)}
                placeholder="e.g. Cooked high-protein GF salmon bowls for dinner, or paused for step work"
                className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 rounded-xl p-3 text-xs text-slate-700 min-h-[90px] font-sans resize-none bg-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-705 text-white font-bold py-2 rounded-2.5xl text-xs transition cursor-pointer"
            >
              Log Daily Win
            </button>
          </form>

          {/* Scale Tip */}
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-[11px] text-slate-500 text-center leading-relaxed">
            🌿 "Remember friend, wins don't have to be massive. Pausing when feeling self-critical or getting sufficient sleep is a premium win!" – Bliss
          </div>
        </div>

        {/* List of wins today & History */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-150 shadow-sm max-h-[360px] overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-slate-800 text-sm">Wins Dashboard</h4>
            <span className="text-[10px] font-mono text-slate-400">Total logged: {winsList.length}</span>
          </div>

          {winsList.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-slate-200 rounded-2xl">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">No recorded wins yet for today.</p>
              <p className="text-[10px] text-slate-400 mt-1">Submit your first win on the left and see the magic buildup!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {winsList.map((rec) => (
                <div 
                  key={rec.id}
                  className="flex items-start justify-between gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-emerald-50/20 transition-all text-xs"
                >
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${
                      rec.user === "Rhon" 
                        ? "bg-emerald-100 text-emerald-800" 
                        : rec.user === "Suz" 
                          ? "bg-rose-100 text-rose-800"
                          : "bg-purple-100 text-purple-800"
                    }`}>
                      {rec.user}
                    </span>
                    <div>
                      <p className="text-slate-800 font-medium leading-relaxed">{rec.text}</p>
                      <span className="text-[9px] text-slate-400 font-mono italic block mt-1">{rec.date}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="text-slate-400 hover:text-red-500 p-0.5"
                    onClick={() => onDeleteWin(rec.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
