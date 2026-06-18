import React, { useState, useEffect } from "react";
import { Check, Heart, Moon, TrendingUp, HelpCircle, BookOpen, AlertTriangle, MessageSquare, Clipboard } from "lucide-react";

interface EveningInventoryCardProps {
  currentUser: "Rhon" | "Suz";
  onAddJournalEntry: (content: string, type: string) => void;
  onBlissInteract: (text: string) => void;
}

interface EveningRatingLog {
  id: string;
  date: string;
  user: "Rhon" | "Suz";
  ratings: {
    energy: number;
    anxiety: number;
  };
  step10Answers: {
    resentful: string;
    selfish: string;
    dishonest: string;
    afraid: string;
    oweApology: string;
    helpedSomeone: string;
    gratefulToday: string;
    didWell: string;
    improveTomorrow: string;
    godWorking: string;
  };
  freeFormJournal: string;
  winsOfDay: string;
  lessonsLearned: string;
  gratitudeList: string;
}

export default function EveningInventoryCard({
  currentUser,
  onAddJournalEntry,
  onBlissInteract
}: EveningInventoryCardProps) {
  // 1-10 Rating states
  const [energy, setEnergy] = useState<number>(5);
  const [anxiety, setAnxiety] = useState<number>(3);

  // STEP 10 QUESTIONS
  const [resentful, setResentful] = useState("");
  const [selfish, setSelfish] = useState("");
  const [dishonest, setDishonest] = useState("");
  const [afraid, setAfraid] = useState("");
  const [oweApology, setOweApology] = useState("");
  const [helpedSomeone, setHelpedSomeone] = useState("");
  
  const [gratefulToday, setGratefulToday] = useState("");
  const [didWell, setDidWell] = useState("");
  const [improveTomorrow, setImproveTomorrow] = useState("");
  const [godWorking, setGodWorking] = useState("");

  // EXTRA SECTIONS
  const [freeFormJournal, setFreeFormJournal] = useState("");
  const [winsOfDay, setWinsOfDay] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [gratitudeList, setGratitudeList] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [history, setHistory] = useState<EveningRatingLog[]>([]);

  // Load trends from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("forlife_evening_checkins_v6");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newLog: EveningRatingLog = {
      id: "ev_" + Date.now(),
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
      user: currentUser,
      ratings: { energy, anxiety },
      step10Answers: {
        resentful: resentful.trim(),
        selfish: selfish.trim(),
        dishonest: dishonest.trim(),
        afraid: afraid.trim(),
        oweApology: oweApology.trim(),
        helpedSomeone: helpedSomeone.trim(),
        gratefulToday: gratefulToday.trim(),
        didWell: didWell.trim(),
        improveTomorrow: improveTomorrow.trim(),
        godWorking: godWorking.trim()
      },
      freeFormJournal: freeFormJournal.trim(),
      winsOfDay: winsOfDay.trim(),
      lessonsLearned: lessonsLearned.trim(),
      gratitudeList: gratitudeList.trim()
    };

    // Save history
    const existing = localStorage.getItem("forlife_evening_checkins_v6");
    let parsed: EveningRatingLog[] = [];
    if (existing) {
      try { parsed = JSON.parse(existing); } catch (e) {}
    }
    const updated = [newLog, ...parsed];
    localStorage.setItem("forlife_evening_checkins_v6", JSON.stringify(updated));
    setHistory(updated);

    // Build the Step 10 Journal Entry text
    const journalText = `[🌙 EVENING STEP 10 CHECK-IN]
Ratings: Energy: ${energy}/10, Anxiety: ${anxiety}/10

📋 STEP 10 DAILY QUESTIONS:
- Resentful today?: "${resentful.trim() || "No"}"
- Selfish today?: "${selfish.trim() || "No"}"
- Dishonest today?: "${dishonest.trim() || "No"}"
- Afraid today?: "${afraid.trim() || "No"}"
- Owe anyone an apology?: "${oweApology.trim() || "No"}"
- Did I help someone today?: "${helpedSomeone.trim() || "No"}"
- What am I grateful for today?: "${gratefulToday.trim() || "N/A"}"
- What did I do well today?: "${didWell.trim() || "N/A"}"
- What could I improve tomorrow?: "${improveTomorrow.trim() || "N/A"}"
- Where did I see God working in my life today?: "${godWorking.trim() || "N/A"}"

📓 OTHER SECTIONS:
- Free-form journal area: "${freeFormJournal.trim() || "(None)"}"
- Wins of the day: "${winsOfDay.trim() || "(None)"}"
- Lessons learned: "${lessonsLearned.trim() || "(None)"}"
- Gratitude list: "${gratitudeList.trim() || "(None)"}"`;
    
    onAddJournalEntry(journalText, "evening");

    // Bliss Interactivity prompt matching user profile
    const userDisplayName = currentUser === "Rhon" ? "Rhonda" : "Susan";
    const blissPrompt = `Hey Bliss! I just completed my Evening Step 10 Inventory (${userDisplayName}). 
My ratings are Energy: ${energy}/10 and Anxiety: ${anxiety}/10.

Brief recap of my Step 10 answers:
- Grateful for: "${gratefulToday || "Another sober day"}"
- Where I saw God: "${godWorking || "In small moments of peace"}"
- Did well today: "${didWell || "Maintained my recovery program"}"
- Wins of the day: "${winsOfDay || "No sugar/sober, took a long walk"}"

Could you give me a very brief, comforting, blessing-filled evening sign-off to help me sleep peacefully?`;
    
    onBlissInteract(blissPrompt);

    // Reset fields & Notify
    setIsSaved(true);
    setResentful("");
    setSelfish("");
    setDishonest("");
    setAfraid("");
    setOweApology("");
    setHelpedSomeone("");
    setGratefulToday("");
    setDidWell("");
    setImproveTomorrow("");
    setGodWorking("");
    setFreeFormJournal("");
    setWinsOfDay("");
    setLessonsLearned("");
    setGratitudeList("");

    setTimeout(() => {
      setIsSaved(false);
    }, 4500);
  };

  // Filter historical items for display
  const userHistory = history.filter(h => h.user === currentUser).slice(0, 5).reverse();

  return (
    <div id="evening-checkin-root" className="space-y-4 font-sans">
      
      {/* Night-focus Prayermeditation */}
      <div className="p-3.5 bg-indigo-950 text-indigo-200 border border-indigo-900 rounded-2xl">
        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider font-mono block mb-1">
          {currentUser === "Rhon" ? "Rhonda's Night Prayer" : "Susan's Night Prayer"}
        </span>
        <p className="italic text-xs font-semibold text-slate-100 m-0 leading-relaxed">
          {currentUser === "Rhon" 
            ? `"Forgive us our trespasses today. We ask that God direct our thinking; that it be divorced from self-pity, dishonest, or self-seeking motives."` 
            : `"We rest our physical temples in loving gratitude. We are enough, exactly as we are, one twenty-four-hour period at a time."`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Quick Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Energy Rating Row */}
          <div className="bg-white border border-stone-200 rounded-2xl p-3.5 space-y-1.5 shadow-3xs">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-850">Energy Level</span>
              <span className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-lg font-mono">
                {energy} / 10
              </span>
            </div>
            <div className="flex flex-wrap gap-1 justify-between pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = energy === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setEnergy(num)}
                    className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-400 text-slate-950 scale-108 border border-amber-500/30 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-stone-600 border border-stone-200/80"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Anxiety Rating Row */}
          <div className="bg-white border border-stone-200 rounded-2xl p-3.5 space-y-1.5 shadow-3xs">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-850">Anxiety Level</span>
              <span className="text-xs font-black text-indigo-750 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg font-mono">
                {anxiety} / 10
              </span>
            </div>
            <div className="flex flex-wrap gap-1 justify-between pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = anxiety === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setAnxiety(num)}
                    className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-650 text-white scale-108 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-stone-600 border border-stone-200/80"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* STEP 10 DAILY INVENTORY */}
        <div className="bg-rose-50/40 border border-rose-100/70 rounded-2xl p-4.5 shadow-3xs space-y-3.5">
          <div className="flex items-center gap-1.5 border-b border-rose-200/50 pb-2">
            <Clipboard className="w-4.5 h-4.5 text-rose-500" />
            <strong className="text-xs uppercase font-extrabold tracking-wider text-rose-900 font-mono">
              Step 10 Style Evening Inventory
            </strong>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10.5px] font-black text-rose-800 mb-0.8">Was I resentful today?</label>
              <input
                type="text"
                value={resentful}
                onChange={(e) => setResentful(e.target.value)}
                placeholder="No / E.g., at work meeting conflicts"
                className="w-full bg-white border border-rose-200 focus:bg-rose-50/50 focus:border-rose-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-850"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-black text-rose-800 mb-0.8">Was I selfish today?</label>
              <input
                type="text"
                value={selfish}
                onChange={(e) => setSelfish(e.target.value)}
                placeholder="No / Notes"
                className="w-full bg-white border border-rose-200 focus:bg-rose-50/50 focus:border-rose-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-850"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-black text-rose-800 mb-0.8">Was I dishonest today?</label>
              <input
                type="text"
                value={dishonest}
                onChange={(e) => setDishonest(e.target.value)}
                placeholder="No / Details"
                className="w-full bg-white border border-rose-200 focus:bg-rose-50/50 focus:border-rose-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-850"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-black text-rose-800 mb-0.8">Was I afraid today?</label>
              <input
                type="text"
                value={afraid}
                onChange={(e) => setAfraid(e.target.value)}
                placeholder="No / Worrying about sugar level"
                className="w-full bg-white border border-rose-200 focus:bg-rose-50/50 focus:border-rose-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-850"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-black text-rose-800 mb-0.8">Do I owe anyone an apology?</label>
              <input
                type="text"
                value={oweApology}
                onChange={(e) => setOweApology(e.target.value)}
                placeholder="No / Yes, Rhon Sponsor"
                className="w-full bg-white border border-rose-200 focus:bg-rose-50/50 focus:border-rose-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-850"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-black text-rose-800 mb-0.8">Did I help someone today?</label>
              <input
                type="text"
                value={helpedSomeone}
                onChange={(e) => setHelpedSomeone(e.target.value)}
                placeholder="Yes, texted support / checked in"
                className="w-full bg-white border border-rose-200 focus:bg-rose-50/50 focus:border-rose-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-850"
              />
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-rose-100/50">
            <div>
              <label className="block text-[10.5px] font-black text-rose-800 mb-0.8">What am I grateful for today?</label>
              <input
                type="text"
                value={gratefulToday}
                onChange={(e) => setGratefulToday(e.target.value)}
                placeholder="Family support, sponsors, clean food, 24 hours sober..."
                className="w-full bg-white border border-rose-200 focus:bg-rose-50/50 focus:border-rose-400 focus:outline-none rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-850"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-black text-rose-800 mb-0.8">What did I do well today?</label>
              <input
                type="text"
                value={didWell}
                onChange={(e) => setDidWell(e.target.value)}
                placeholder="Followed my meal commitments, meditated in the afternoon..."
                className="w-full bg-white border border-rose-200 focus:bg-rose-50/50 focus:border-rose-400 focus:outline-none rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-850"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-black text-rose-800 mb-0.8">What could I improve tomorrow?</label>
              <input
                type="text"
                value={improveTomorrow}
                onChange={(e) => setImproveTomorrow(e.target.value)}
                placeholder="Practice slower deep breathing when anxiety rises..."
                className="w-full bg-white border border-rose-200 focus:bg-rose-50/50 focus:border-rose-400 focus:outline-none rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-850"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-black text-rose-800 mb-0.8">Where did I see God working in my life today?</label>
              <input
                type="text"
                value={godWorking}
                onChange={(e) => setGodWorking(e.target.value)}
                placeholder="In the patience given during hard moments of the day..."
                className="w-full bg-white border border-rose-200 focus:bg-rose-50/50 focus:border-rose-400 focus:outline-none rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-850"
              />
            </div>
          </div>
        </div>

        {/* EXTRA ESSENTIAL AREAS REQUIRED BY USER */}
        <div className="bg-teal-50/40 border border-teal-100/70 rounded-2xl p-4.5 shadow-3xs space-y-3.5">
          <div className="flex items-center gap-1.5 border-b border-teal-200/50 pb-2">
            <BookOpen className="w-4.5 h-4.5 text-teal-500" />
            <strong className="text-xs uppercase font-extrabold tracking-wider text-teal-900 font-mono">
              Reflection Journal & Lists
            </strong>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10.5px] font-black text-teal-800 mb-0.8">Free-form Journal area</label>
              <textarea
                rows={3}
                value={freeFormJournal}
                onChange={(e) => setFreeFormJournal(e.target.value)}
                placeholder="Write any thoughts, prayers, or events of the day in a free-flowing format..."
                className="w-full bg-white border border-teal-200 focus:bg-teal-50/50 focus:border-teal-400 focus:outline-none rounded-2xl p-3 text-xs font-semibold text-slate-850"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10.5px] font-black text-teal-800 mb-0.8">Wins of the day</label>
                <textarea
                  rows={2}
                  value={winsOfDay}
                  onChange={(e) => setWinsOfDay(e.target.value)}
                  placeholder="What did we achieve?"
                  className="w-full bg-white border border-teal-200 focus:bg-teal-50/50 focus:border-teal-400 focus:outline-none rounded-2xl p-2.5 text-xs font-semibold text-slate-850"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-black text-teal-800 mb-0.8">Lessons learned</label>
                <textarea
                  rows={2}
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  placeholder="What wisdom did we find?"
                  className="w-full bg-white border border-teal-200 focus:bg-teal-50/50 focus:border-teal-400 focus:outline-none rounded-2xl p-2.5 text-xs font-semibold text-slate-850"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-black text-teal-800 mb-0.8">Gratitude list</label>
                <textarea
                  rows={2}
                  value={gratitudeList}
                  onChange={(e) => setGratitudeList(e.target.value)}
                  placeholder="Bullets or lines..."
                  className="w-full bg-white border border-teal-200 focus:bg-teal-50/50 focus:border-teal-400 focus:outline-none rounded-2xl p-2.5 text-xs font-semibold text-slate-850"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-300" /> Save Evening Inventory
          </button>
        </div>

      </form>

      {isSaved && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 animate-pulse">
          <Heart className="w-4 h-4 text-emerald-600 fill-emerald-500" /> Evening Reflection Submitted! Sent overview to Bliss.
        </div>
      )}

      {/* Historical trends */}
      {userHistory.length > 0 && (
        <div className="p-4 bg-slate-50 border border-stone-150 rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 text-slate-750 font-bold border-b border-stone-200/50 pb-1">
            <TrendingUp className="w-4 h-4 text-slate-600" />
            <strong className="text-xs uppercase font-extrabold tracking-wider font-mono text-slate-850">Evening Historical Rating Trend</strong>
          </div>

          <div className="space-y-1">
            <div className="grid grid-cols-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 font-mono">
              <span>Date</span>
              <span className="text-center font-bold">Energy</span>
              <span className="text-center font-bold">Anxiety</span>
            </div>

            {userHistory.map((item) => (
              <div key={item.id} className="grid grid-cols-3 text-xs text-slate-800 font-bold items-center py-1 border-b border-stone-150/40 font-mono">
                <span className="text-slate-500 font-sans font-semibold">{item.date}</span>
                <span className="text-center font-bold text-amber-600">{item.ratings.energy}/10</span>
                <span className="text-center font-bold text-indigo-650">{item.ratings.anxiety}/10</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
