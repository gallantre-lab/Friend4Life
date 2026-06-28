import React, { useState, useEffect } from "react";
import { Check, Heart, Moon, TrendingUp, HelpCircle, BookOpen, AlertTriangle, MessageSquare, Clipboard, X, ArrowLeft, ArrowRight } from "lucide-react";

interface EveningInventoryCardProps {
  currentUser: "Rhon" | "Suz";
  onAddJournalEntry: (content: string, type: string) => void;
  onBlissInteract: (text: string) => void;
  onSaveSuccess?: () => void;
  onExit?: () => void;
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
  onBlissInteract,
  onSaveSuccess,
  onExit
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

  // Mobile responsiveness
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileWizard, setShowMobileWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const handleSubmit = (e?: React.FormEvent, ratingsOnly = false) => {
    if (e) e.preventDefault();

    const newLog: EveningRatingLog = {
      id: "ev_" + Date.now(),
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
      user: currentUser,
      ratings: { energy, anxiety },
      step10Answers: {
        resentful: ratingsOnly ? "" : resentful.trim(),
        selfish: ratingsOnly ? "" : selfish.trim(),
        dishonest: ratingsOnly ? "" : dishonest.trim(),
        afraid: ratingsOnly ? "" : afraid.trim(),
        oweApology: ratingsOnly ? "" : oweApology.trim(),
        helpedSomeone: ratingsOnly ? "" : helpedSomeone.trim(),
        gratefulToday: ratingsOnly ? "" : gratefulToday.trim(),
        didWell: ratingsOnly ? "" : didWell.trim(),
        improveTomorrow: ratingsOnly ? "" : improveTomorrow.trim(),
        godWorking: ratingsOnly ? "" : godWorking.trim()
      },
      freeFormJournal: ratingsOnly ? "" : freeFormJournal.trim(),
      winsOfDay: ratingsOnly ? "" : winsOfDay.trim(),
      lessonsLearned: ratingsOnly ? "" : lessonsLearned.trim(),
      gratitudeList: ratingsOnly ? "" : gratitudeList.trim()
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
    const journalText = ratingsOnly
      ? `[🌙 QUICK EVENING RATING]
Ratings: Energy: ${energy}/10, Anxiety: ${anxiety}/10
(Logged quick evening energy/anxiety baseline)`
      : `[🌙 EVENING STEP 10 CHECK-IN]
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
    const blissPrompt = ratingsOnly
      ? `Hey Bliss! I just logged my quick Evening Energy & Anxiety Ratings (${userDisplayName}). 
My ratings are Energy: ${energy}/10 and Anxiety: ${anxiety}/10.

Could you give me a very brief, comforting, blessing-filled evening sign-off to help me sleep peacefully?`
      : `Hey Bliss! I just completed my Evening Step 10 Inventory (${userDisplayName}). 
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
    setShowSuccessScreen(true);
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

    // Reset mobile wizard
    setShowMobileWizard(false);
    setCurrentStep(1);

    setTimeout(() => {
      setIsSaved(false);
    }, 4500);
  };

  // Filter historical items for display
  const userHistory = history.filter(h => h.user === currentUser).slice(0, 5).reverse();

  if (showSuccessScreen) {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-6 text-center space-y-4 max-w-md mx-auto my-6 animate-fade-in shadow-3xs">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
          <Check className="w-8 h-8 stroke-[3px]" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-black text-slate-900">Evening Inventory Saved!</h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
            Your evening reflections, Step 10 inventories, and daily wins have been saved. Bliss companion has been updated for your peace of mind.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowSuccessScreen(false);
            onSaveSuccess?.();
            onExit?.();
          }}
          className="w-full bg-slate-950 hover:bg-slate-850 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition active:scale-[0.97] cursor-pointer shadow-xs uppercase tracking-wider"
        >
          Close & Return to Wellness Hub
        </button>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div id="evening-checkin-root" className="space-y-4 font-sans px-1">
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

        {/* Start Wizard Card */}
        <div className="bg-gradient-to-br from-indigo-50/40 to-purple-50/20 border border-indigo-150 rounded-2xl p-5 text-center space-y-4 shadow-3xs">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Moon className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Your Evening Step 10 is Ready</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Open the tap-friendly evening wizard to rate your day, complete your Step 10 reflection, and rest peacefully.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCurrentStep(1);
              setShowMobileWizard(true);
            }}
            className="w-full bg-slate-950 hover:bg-slate-850 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer shadow-sm"
          >
            <Moon className="w-4 h-4 text-indigo-300" /> Start Evening Connection
          </button>
        </div>

        {isSaved && (
          <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-pulse">
            <Heart className="w-4 h-4 text-emerald-600 fill-emerald-500 shrink-0" /> evening connection saved! overview sent to Bliss.
          </div>
        )}

        {/* Mobile Full Screen Wizard Popup */}
        {showMobileWizard && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 md:p-4 flex items-center justify-center overflow-y-auto animate-fadeIn">
            <div className="bg-white w-full h-full md:h-auto md:max-h-[85vh] md:max-w-lg md:rounded-3xl flex flex-col overflow-hidden border-0 md:border md:border-stone-100 shadow-none md:shadow-2xl">
              
              {/* Wizard Header */}
              <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between shrink-0 bg-indigo-950 text-white">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-black text-indigo-400 tracking-wider font-mono">Step {currentStep} of 6</span>
                  <h2 className="text-xs font-black">
                    {currentStep === 1 && "Rate Your Energy & Anxiety"}
                    {currentStep === 2 && "Step 10 Alignment (Part 1)"}
                    {currentStep === 3 && "Step 10 Alignment (Part 2)"}
                    {currentStep === 4 && "Growth & Gratitude Reflection"}
                    {currentStep === 5 && "Journaling & Wins"}
                    {currentStep === 6 && "Review & Complete"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileWizard(false)}
                  className="w-8 h-8 rounded-full bg-indigo-900 hover:bg-indigo-850 text-white flex items-center justify-center transition active:scale-95 cursor-pointer border border-indigo-800"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-100 h-1 shrink-0">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300" 
                  style={{ width: `${(currentStep / 6) * 100}%` }}
                />
              </div>

              {/* Wizard Body (Scrollable Content, keeping controls high above the safe zone) */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-16">
                
                {/* STEP 1: Ratings */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                      Tap to rate your energy and anxiety levels tonight to establish an evening recovery baseline.
                    </p>

                    {/* Energy */}
                    <div className="bg-slate-50 border border-stone-200 rounded-2xl p-4 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-800">⚡ Energy Level</span>
                        <span className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-lg font-mono">
                          {energy} / 10
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setEnergy(num)}
                            className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              energy === num
                                ? "bg-amber-400 text-slate-950 scale-103 border border-amber-500/30 shadow-xs"
                                : "bg-white hover:bg-slate-100 text-stone-600 border border-stone-200"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Anxiety */}
                    <div className="bg-slate-50 border border-stone-200 rounded-2xl p-4 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-800">🌊 Anxiety Level</span>
                        <span className="text-xs font-black text-indigo-750 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg font-mono">
                          {anxiety} / 10
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setAnxiety(num)}
                            className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              anxiety === num
                                ? "bg-indigo-650 text-white scale-103 shadow-xs"
                                : "bg-white hover:bg-slate-100 text-stone-600 border border-stone-200"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {energy > 0 && anxiety > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSubmit(undefined, true)}
                        className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs animate-fadeIn"
                      >
                        <Check className="w-4 h-4 text-emerald-200" /> Quick-Submit Ratings Only (Skip Rest)
                      </button>
                    )}
                  </div>
                )}

                {/* STEP 2: Step 10 Alignment (Part 1) */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                      Reflect honestly on the daily alignment checkpoints below:
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Was I resentful today?</label>
                      <input
                        type="text"
                        value={resentful}
                        onChange={(e) => setResentful(e.target.value)}
                        placeholder="e.g., No, practiced acceptance / Briefly felt frustrated but let it go..."
                        className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl p-3 text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Was I selfish today?</label>
                      <input
                        type="text"
                        value={selfish}
                        onChange={(e) => setSelfish(e.target.value)}
                        placeholder="e.g., No, prioritized serving others / Caught myself being self-centered..."
                        className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl p-3 text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Was I dishonest today?</label>
                      <input
                        type="text"
                        value={dishonest}
                        onChange={(e) => setDishonest(e.target.value)}
                        placeholder="e.g., Kept absolute honesty today / Spoke standard truth..."
                        className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl p-3 text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Was I afraid today?</label>
                      <input
                        type="text"
                        value={afraid}
                        onChange={(e) => setAfraid(e.target.value)}
                        placeholder="e.g., Felt a bit of doubt about future, but turned to prayer..."
                        className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl p-3 text-xs font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: Step 10 Alignment (Part 2) */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Do I owe an apology to anyone?</label>
                      <textarea
                        rows={2}
                        value={oweApology}
                        onChange={(e) => setOweApology(e.target.value)}
                        placeholder="e.g., No apology needed today / Need to apologize for a sharp tone..."
                        className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl p-3 text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Did I help someone today?</label>
                      <textarea
                        rows={2}
                        value={helpedSomeone}
                        onChange={(e) => setHelpedSomeone(e.target.value)}
                        placeholder="e.g., Checked in on a friend, shared a peaceful word / Supported family..."
                        className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl p-3 text-xs font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: Growth & Gratitude */}
                {currentStep === 4 && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">What am I grateful for today?</label>
                      <textarea
                        rows={2}
                        value={gratefulToday}
                        onChange={(e) => setGratefulToday(e.target.value)}
                        placeholder="List people, quiet moments, support structures, or peace..."
                        className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl p-3 text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">What did I do well today?</label>
                      <textarea
                        rows={2}
                        value={didWell}
                        onChange={(e) => setDidWell(e.target.value)}
                        placeholder="e.g., Kept my diet plan perfectly, walked 4 miles, stayed sober..."
                        className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl p-3 text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">What could I improve tomorrow?</label>
                      <textarea
                        rows={2}
                        value={improveTomorrow}
                        onChange={(e) => setImproveTomorrow(e.target.value)}
                        placeholder="e.g., Drink more water, practice acceptance during unexpected tasks..."
                        className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl p-3 text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Where did I see God working in my life today?</label>
                      <textarea
                        rows={2}
                        value={godWorking}
                        onChange={(e) => setGodWorking(e.target.value)}
                        placeholder="e.g., In the patience I felt, in the guidance from Bliss, or natural sunset..."
                        className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl p-3 text-xs font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: Journal & Wins */}
                {currentStep === 5 && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Freeform Journal</label>
                      <textarea
                        rows={3}
                        value={freeFormJournal}
                        onChange={(e) => setFreeFormJournal(e.target.value)}
                        placeholder="Write any thoughts, prayers, or events of the day in a free-flowing format..."
                        className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl p-3 text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">Wins of the day</label>
                        <textarea
                          rows={2}
                          value={winsOfDay}
                          onChange={(e) => setWinsOfDay(e.target.value)}
                          placeholder="What did we achieve?"
                          className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl p-3 text-xs font-semibold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">Lessons learned</label>
                        <textarea
                          rows={2}
                          value={lessonsLearned}
                          onChange={(e) => setLessonsLearned(e.target.value)}
                          placeholder="What wisdom did we find?"
                          className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl p-3 text-xs font-semibold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">Gratitude list</label>
                        <textarea
                          rows={2}
                          value={gratitudeList}
                          onChange={(e) => setGratitudeList(e.target.value)}
                          placeholder="Bullets or lines..."
                          className="w-full bg-stone-50 border border-stone-200 focus:bg-white focus:border-indigo-400 focus:outline-none rounded-xl p-3 text-xs font-semibold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: Review & Save */}
                {currentStep === 6 && (
                  <div className="space-y-4 animate-fade-in text-slate-800 text-xs font-medium">
                    <p className="text-stone-500 font-semibold leading-relaxed">
                      Please review your evening inventory details below before saving and locking the day.
                    </p>

                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2 pb-2 border-b border-stone-200">
                        <div>
                          <strong className="text-[10px] text-stone-400 block uppercase font-mono">Energy Level:</strong>
                          <span className="text-sm font-black text-amber-700">{energy} / 10</span>
                        </div>
                        <div>
                          <strong className="text-[10px] text-stone-400 block uppercase font-mono">Anxiety Level:</strong>
                          <span className="text-sm font-black text-indigo-750">{anxiety} / 10</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {resentful && (
                          <div>
                            <strong className="text-[10px] text-stone-400 uppercase font-mono">Resentful:</strong>
                            <p className="text-slate-700 font-semibold">{resentful}</p>
                          </div>
                        )}
                        {selfish && (
                          <div>
                            <strong className="text-[10px] text-stone-400 uppercase font-mono">Selfish:</strong>
                            <p className="text-slate-700 font-semibold">{selfish}</p>
                          </div>
                        )}
                        {dishonest && (
                          <div>
                            <strong className="text-[10px] text-stone-400 uppercase font-mono">Dishonest:</strong>
                            <p className="text-slate-700 font-semibold">{dishonest}</p>
                          </div>
                        )}
                        {afraid && (
                          <div>
                            <strong className="text-[10px] text-stone-400 uppercase font-mono">Afraid:</strong>
                            <p className="text-slate-700 font-semibold">{afraid}</p>
                          </div>
                        )}
                        {gratefulToday && (
                          <div>
                            <strong className="text-[10px] text-stone-400 uppercase font-mono">Grateful For:</strong>
                            <p className="text-slate-700 font-semibold">"{gratefulToday}"</p>
                          </div>
                        )}
                        {didWell && (
                          <div>
                            <strong className="text-[10px] text-stone-400 uppercase font-mono">Did Well Today:</strong>
                            <p className="text-slate-700 font-semibold">{didWell}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Wizard Navigation Footer (Self-contained in the modal to never overlap mobile safe bars) */}
              <div className="p-4 border-t border-stone-200 flex flex-wrap gap-2 items-center justify-between shrink-0 bg-stone-50 pb-safe">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileWizard(false);
                      onExit?.();
                    }}
                    className="px-3 py-3 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer animate-fade-in"
                  >
                    Cancel & Exit
                  </button>
                  <button
                    type="button"
                    disabled={currentStep === 1}
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-3 border border-stone-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 bg-white hover:bg-stone-50 disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
                    className="px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-1 hover:bg-slate-850 transition cursor-pointer"
                  >
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow cursor-pointer transition"
                  >
                    <Check className="w-4 h-4 text-emerald-300" /> Finish & Save
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Historical Ratings Trend */}
        {userHistory.length > 0 && (
          <div className="p-4 bg-slate-50 border border-stone-200 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-700 pb-0.5 border-b border-stone-200/50">
              <TrendingUp className="w-4 h-4 text-slate-600" />
              <strong className="text-xs uppercase font-extrabold tracking-wider font-mono text-slate-800">Historical Energy/Anxiety Trend</strong>
            </div>

            <div className="space-y-1.5">
              <div className="grid grid-cols-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pb-1 border-b border-stone-200 font-mono">
                <span>Date</span>
                <span className="text-center">Energy</span>
                <span className="text-center">Anxiety</span>
              </div>

              {userHistory.map((item) => (
                <div key={item.id} className="grid grid-cols-3 text-xs text-slate-800 font-extrabold items-center py-1 border-b border-stone-150/40 font-mono">
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
              <span className="text-xs font-black text-slate-855">Energy Level</span>
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
              <span className="text-xs font-black text-slate-855">Anxiety Level</span>
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

        {/* Quick Submit Option for Desktop */}
        {energy > 0 && anxiety > 0 && (
          <div className="flex justify-end pt-1 animate-fadeIn">
            <button
              type="button"
              onClick={() => handleSubmit(undefined, true)}
              className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-black px-4.5 py-3 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <Check className="w-4 h-4 text-emerald-600" /> Quick-Submit Ratings Only (Skip Rest of Form)
            </button>
          </div>
        )}

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
                className="w-full bg-white border border-rose-200 focus:bg-rose-50/50 focus:border-rose-400 focus:outline-none rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-855"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-black text-rose-855 mb-0.8">What did I do well today?</label>
              <input
                type="text"
                value={didWell}
                onChange={(e) => setDidWell(e.target.value)}
                placeholder="Followed my meal commitments, meditated in the afternoon..."
                className="w-full bg-white border border-rose-200 focus:bg-rose-50/50 focus:border-rose-400 focus:outline-none rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-855"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-black text-rose-855 mb-0.8">What could I improve tomorrow?</label>
              <input
                type="text"
                value={improveTomorrow}
                onChange={(e) => setImproveTomorrow(e.target.value)}
                placeholder="Practice slower deep breathing when anxiety rises..."
                className="w-full bg-white border border-rose-200 focus:bg-rose-50/50 focus:border-rose-400 focus:outline-none rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-855"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-black text-rose-855 mb-0.8">Where did I see God working in my life today?</label>
              <input
                type="text"
                value={godWorking}
                onChange={(e) => setGodWorking(e.target.value)}
                placeholder="In the patience given during hard moments of the day..."
                className="w-full bg-white border border-rose-200 focus:bg-rose-50/50 focus:border-rose-400 focus:outline-none rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-855"
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
          <div className="flex items-center gap-1.5 text-slate-755 font-bold border-b border-stone-200/50 pb-1">
            <TrendingUp className="w-4 h-4 text-slate-600" />
            <strong className="text-xs uppercase font-extrabold tracking-wider font-mono text-slate-855">Evening Historical Rating Trend</strong>
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
