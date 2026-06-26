import React, { useState, useEffect } from "react";
import { Check, Heart, Sun, Activity, Sparkles, TrendingUp, Hand, Compass, Flame, Loader2, X, ArrowLeft, ArrowRight } from "lucide-react";
import ReadingAudioPlayer from "./ReadingAudioPlayer";

interface MorningConnectionCardProps {
  currentUser: "Rhon" | "Suz";
  onAddJournalEntry: (content: string, type: string) => void;
  onBlissInteract: (text: string) => void;
  onSaveSuccess?: () => void;
}

interface MorningRatingLog {
  id: string;
  date: string;
  user: "Rhon" | "Suz";
  ratings: {
    energy: number;
    anxiety: number;
  };
  connectWithGod: {
    prayer: string;
    focus: string;
    gratitude: string;
  };
  intentions: {
    mostImportant: string;
    beOfService: string;
    characterTrait: string;
    higherPowerHelp: string;
  };
  affirmation: string;
}

export default function MorningConnectionCard({
  currentUser,
  onAddJournalEntry,
  onBlissInteract,
  onSaveSuccess
}: MorningConnectionCardProps) {
  // 1-10 Rating states (0 means not selected yet)
  const [energy, setEnergy] = useState<number>(0);
  const [anxiety, setAnxiety] = useState<number>(0);

  // SECTION 1: Connect with God
  const [morningPrayer, setMorningPrayer] = useState("");
  const [spiritualFocus, setSpiritualFocus] = useState("");
  const [gratitudePrompt, setGratitudePrompt] = useState("");

  // SECTION 2: Intention Setting
  const [mostImportant, setMostImportant] = useState("");
  const [beOfService, setBeOfService] = useState("");
  const [characterTrait, setCharacterTrait] = useState("");
  const [higherPowerHelp, setHigherPowerHelp] = useState("");

  // SECTION 3: Personalized Affirmation
  const [personalizedAffirmation, setPersonalizedAffirmation] = useState("");
  const [isGeneratingAffirmation, setIsGeneratingAffirmation] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [history, setHistory] = useState<MorningRatingLog[]>([]);

  // Mobile wizard state
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileWizard, setShowMobileWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Load trends
  useEffect(() => {
    const saved = localStorage.getItem("forlife_morning_checkins_v6");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Generate personalized affirmation from server using Gemini
  const handleGenerateAffirmation = async () => {
    setIsGeneratingAffirmation(true);
    try {
      const res = await fetch("/api/affirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          energy,
          anxiety,
          userContext: currentUser
        })
      });

      const data = await res.json();
      if (data.affirmation) {
        setPersonalizedAffirmation(data.affirmation);
      } else {
        setPersonalizedAffirmation("Today, I trust the process, breathe in calm, and walk forward in abstinence and peace.");
      }
    } catch (err) {
      console.error(err);
      setPersonalizedAffirmation("Today, I trust the process, breathe in calm, and walk forward in abstinence and peace.");
    } finally {
      setIsGeneratingAffirmation(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const newLog: MorningRatingLog = {
      id: "mc_" + Date.now(),
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
      user: currentUser,
      ratings: { energy, anxiety },
      connectWithGod: {
        prayer: morningPrayer.trim(),
        focus: spiritualFocus.trim(),
        gratitude: gratitudePrompt.trim()
      },
      intentions: {
        mostImportant,
        beOfService,
        characterTrait,
        higherPowerHelp
      },
      affirmation: personalizedAffirmation
    };

    // Save history
    const existing = localStorage.getItem("forlife_morning_checkins_v6");
    let parsed: MorningRatingLog[] = [];
    if (existing) {
      try { parsed = JSON.parse(existing); } catch (e) {}
    }
    const updated = [newLog, ...parsed];
    localStorage.setItem("forlife_morning_checkins_v6", JSON.stringify(updated));
    setHistory(updated);

    // Save journal entry
    const journalText = `[☀️ MORNING CHECK-IN]
Ratings: Energy: ${energy}/10, Anxiety: ${anxiety}/10

✝ CONNECT WITH GOD:
- Morning Prayer: "${morningPrayer.trim() || "(None)"}"
- Daily Spiritual Focus: "${spiritualFocus.trim() || "(None)"}"
- Gratitude Prompt: "${gratitudePrompt.trim() || "(None)"}"

🎯 INTENTION SETTING:
- What is most important today?: "${mostImportant.trim() || "(None)"}"
- Character trait I want to practice: "${characterTrait.trim() || "(None)"}"
- What I am asking my Higher Power to help me with: "${higherPowerHelp.trim() || "(None)"}"

⭐ PERSONAL AFFIRMATION:
"${personalizedAffirmation || "One day at a time!"}"`;
    
    onAddJournalEntry(journalText, "morning");

    // Bliss Interactivity
    const userDisplayName = currentUser === "Rhon" ? "Rhonda" : "Susan";
    const blissPrompt = `Hey Bliss! I just completed my comprehensive Morning Inventory (${userDisplayName}). 
My ratings are Energy: ${energy}/10, Anxiety: ${anxiety}/10. 
Here are my intentions for today: I want to practice "${characterTrait || "acceptance"}".
My daily focus is "${spiritualFocus || "trusting God's plan"}".
My affirmation is: "${personalizedAffirmation || "I am grounded and safe"}".

Could you provide a swift, encouraging morning word for my day?`;
    
    onBlissInteract(blissPrompt);

    // Reset fields & Notify
    setIsSaved(true);
    setMorningPrayer("");
    setSpiritualFocus("");
    setGratitudePrompt("");
    setMostImportant("");
    setBeOfService("");
    setCharacterTrait("");
    setHigherPowerHelp("");
    setPersonalizedAffirmation("");

    // Reset wizard
    setShowMobileWizard(false);
    setCurrentStep(1);

    onSaveSuccess?.();

    setTimeout(() => {
      setIsSaved(false);
    }, 4500);
  };

  // Filter local history for trend
  const userHistory = history.filter(h => h.user === currentUser).slice(0, 5).reverse();

  if (isMobile) {
    return (
      <div id="morning-checkin-root" className="space-y-4 font-sans px-1">
        
        {/* Dynamic Prayer Header */}
        <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider font-mono block mb-1">
            {currentUser === "Rhon" ? "Rhonda's AA Prayer" : "Susan's OA Prayer"}
          </span>
          <p className="italic text-xs font-semibold text-slate-850 m-0 leading-relaxed">
            {currentUser === "Rhon" 
              ? `"God, direct my thinking today; select especially that it be divorced from self-pity, dishonest or self-seeking motives. Help me to be of service today."` 
              : `"God, keep me abstinent and peaceful today, nourishing my mind and temple with balanced nourishment, one meal and twenty-four hours at a time."`}
          </p>
        </div>

        {/* Start Wizard Card */}
        <div className="bg-gradient-to-br from-amber-50/40 to-orange-50/20 border border-amber-150 rounded-2xl p-5 text-center space-y-4 shadow-3xs">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Sun className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Your Morning Connection is Ready</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Open the tap-friendly morning wizard to log your energy, connect with God, set intentions, and align your day comfortably.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCurrentStep(1);
              setShowMobileWizard(true);
            }}
            className="w-full bg-slate-950 hover:bg-slate-850 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Start Morning Connection
          </button>
        </div>

        {isSaved && (
          <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-pulse">
            <Heart className="w-4 h-4 text-emerald-600 fill-emerald-500 shrink-0" /> morning connection saved! overview sent to Bliss.
          </div>
        )}

        {/* Mobile Full Screen Wizard Popup */}
        {showMobileWizard && (
          <div className="fixed inset-0 z-50 bg-slate-900/65 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden border border-stone-100">
              {/* Wizard Header */}
              <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between shrink-0 bg-slate-900 text-white">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-black text-amber-400 tracking-wider font-mono">Step {currentStep} of 5</span>
                  <h2 className="text-xs font-black">
                    {currentStep === 1 && "Rate Your Connection"}
                    {currentStep === 2 && "Section 1: Connect with God"}
                    {currentStep === 3 && "Section 2: Intention Setting"}
                    {currentStep === 4 && "Section 3: Daily Affirmation"}
                    {currentStep === 5 && "Review & Complete"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileWizard(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-lg text-white font-mono text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer transition-all border border-slate-700/50"
                  aria-label="Close Wizard"
                >
                  <span>Close</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-100 h-1 shrink-0">
                <div 
                  className="bg-amber-450 h-full transition-all duration-300" 
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                />
              </div>

              {/* Wizard Body (Scrollable content) */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-12">
                
                {/* STEP 1: Energy & Anxiety Ratings */}
                {currentStep === 1 && (
                  <div className="space-y-5 animate-fadeIn">
                    <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                      Tap to rate your energy and anxiety levels this morning to establish a recovery baseline.
                    </p>

                    {/* Warning Alert for required selection */}
                    {(energy === 0 || anxiety === 0) && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-bold text-center">
                        ⚠️ Please select both Energy and Anxiety levels to activate the "Next" button.
                      </div>
                    )}

                    {/* Energy Level */}
                    <div className="bg-amber-50/30 border border-amber-100 rounded-2xl p-4 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-amber-900 flex items-center gap-1">
                          <Sun className="w-4 h-4" /> Energy Level
                        </span>
                        <span className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-lg">
                          {energy === 0 ? "Select Rating" : `${energy} / 10`}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 pt-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                          const isSelected = energy === num;
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setEnergy(num)}
                              className={`h-11 rounded-xl text-xs font-black transition-all flex items-center justify-center border cursor-pointer ${
                                isSelected
                                  ? "bg-amber-450 text-slate-950 scale-105 border-amber-550/45 shadow-xs"
                                  : "bg-white text-stone-600 border-stone-200 hover:bg-amber-50/25"
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Anxiety Level */}
                    <div className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-4 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-indigo-900 flex items-center gap-1">
                          <Activity className="w-4 h-4" /> Anxiety Level
                        </span>
                        <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                          {anxiety === 0 ? "Select Rating" : `${anxiety} / 10`}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 pt-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                          const isSelected = anxiety === num;
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setAnxiety(num)}
                              className={`h-11 rounded-xl text-xs font-black transition-all flex items-center justify-center border cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-600 text-white scale-105 border-indigo-700 shadow-xs"
                                  : "bg-white text-stone-600 border-stone-200 hover:bg-indigo-50/25"
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Connect with God */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <p className="text-xs font-semibold text-slate-500">
                      Connect inward and offer your day to God or your Higher Power.
                    </p>

                    <div className="space-y-4 bg-orange-50/20 border border-orange-100 rounded-2xl p-4">
                      <div>
                        <span className="block text-[10px] font-black text-orange-950 mb-1">Morning Prayer</span>
                        <input
                          type="text"
                          value={morningPrayer}
                          onChange={(e) => setMorningPrayer(e.target.value)}
                          placeholder="Write your morning prayer or request..."
                          className="w-full bg-white border border-stone-250 focus:border-orange-400 focus:outline-none rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-850 shadow-3xs"
                        />
                      </div>

                      <div>
                        <span className="block text-[10px] font-black text-orange-950 mb-1">Daily Spiritual Focus</span>
                        <input
                          type="text"
                          value={spiritualFocus}
                          onChange={(e) => setSpiritualFocus(e.target.value)}
                          placeholder="E.g., Surrender, Acceptance, Patience..."
                          className="w-full bg-white border border-stone-250 focus:border-orange-400 focus:outline-none rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-850 shadow-3xs"
                        />
                      </div>

                      <div>
                        <span className="block text-[10px] font-black text-orange-950 mb-1">Gratitude Prompt</span>
                        <input
                          type="text"
                          value={gratitudePrompt}
                          onChange={(e) => setGratitudePrompt(e.target.value)}
                          placeholder="What are you grateful for right now?"
                          className="w-full bg-white border border-stone-250 focus:border-orange-400 focus:outline-none rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-850 shadow-3xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Intention Setting */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <p className="text-xs font-semibold text-slate-500">
                      Set conscious boundaries and intentions for the next 24 hours.
                    </p>

                    <div className="space-y-4 bg-sky-50/20 border border-sky-100 rounded-2xl p-4">
                      <div>
                        <span className="block text-[10px] font-black text-sky-950 mb-1">What is most important today?</span>
                        <input
                          type="text"
                          value={mostImportant}
                          onChange={(e) => setMostImportant(e.target.value)}
                          placeholder="Primary recovery or life priority..."
                          className="w-full bg-white border border-stone-250 focus:border-sky-400 focus:outline-none rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-850 shadow-3xs"
                        />
                      </div>

                      <div>
                        <span className="block text-[10px] font-black text-sky-950 mb-1">Character trait to practice?</span>
                        <input
                          type="text"
                          value={characterTrait}
                          onChange={(e) => setCharacterTrait(e.target.value)}
                          placeholder="E.g., Humility, Honesty, Acceptance..."
                          className="w-full bg-white border border-stone-250 focus:border-sky-400 focus:outline-none rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-850 shadow-3xs"
                        />
                      </div>

                      <div>
                        <span className="block text-[10px] font-black text-sky-950 mb-1">Asking Higher Power to help with?</span>
                        <input
                          type="text"
                          value={higherPowerHelp}
                          onChange={(e) => setHigherPowerHelp(e.target.value)}
                          placeholder="E.g., Dealing with cravings, my patience..."
                          className="w-full bg-white border border-stone-250 focus:border-sky-400 focus:outline-none rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-850 shadow-3xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Daily Affirmation */}
                {currentStep === 4 && (
                  <div className="space-y-4 animate-fadeIn">
                    <p className="text-xs font-semibold text-slate-500">
                      Generate or write a strong, personalized affirmation to recite today.
                    </p>

                    <div className="bg-emerald-50/20 border border-emerald-100 rounded-2xl p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-200/50 pb-2">
                        <span className="text-xs uppercase font-extrabold text-emerald-950 tracking-wider font-mono">Daily Affirmation</span>
                        <button
                          type="button"
                          onClick={handleGenerateAffirmation}
                          disabled={isGeneratingAffirmation}
                          className="bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-800 text-[10px] font-black px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                          {isGeneratingAffirmation ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" /> Aligning...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-emerald-600" /> Generate
                            </>
                          )}
                        </button>
                      </div>

                      <textarea
                        rows={3}
                        value={personalizedAffirmation}
                        onChange={(e) => setPersonalizedAffirmation(e.target.value)}
                        placeholder="Your custom daily affirmation will generate here, or you can write your own!"
                        className="w-full bg-white border border-stone-250 focus:border-emerald-400 focus:outline-none rounded-xl p-3 text-xs font-black text-slate-800 leading-relaxed shadow-3xs"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: Review & Complete */}
                {currentStep === 5 && (
                  <div className="space-y-4 animate-fadeIn">
                    <p className="text-xs font-semibold text-slate-500">
                      Review your morning intentions before finishing.
                    </p>

                    <div className="bg-slate-50 border border-stone-200 rounded-2xl p-4 space-y-3.5">
                      <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono font-bold">
                        <div className="bg-amber-50 p-2 rounded-xl border border-amber-150">
                          <span className="block text-[9px] text-amber-800 uppercase">Energy</span>
                          <span className="text-sm font-black text-slate-850">{energy}/10</span>
                        </div>
                        <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-150">
                          <span className="block text-[9px] text-indigo-800 uppercase">Anxiety</span>
                          <span className="text-sm font-black text-slate-850">{anxiety}/10</span>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div>
                          <strong className="text-[10px] uppercase text-stone-500 block font-mono">Prayer:</strong>
                          <p className="text-slate-800 font-semibold italic mt-0.5">"{morningPrayer || "None"}"</p>
                        </div>
                        <div>
                          <strong className="text-[10px] uppercase text-stone-500 block font-mono">Spiritual Focus:</strong>
                          <p className="text-slate-800 font-semibold mt-0.5">{spiritualFocus || "None"}</p>
                        </div>
                        <div>
                          <strong className="text-[10px] uppercase text-stone-500 block font-mono">Gratitude:</strong>
                          <p className="text-slate-800 font-semibold mt-0.5">"{gratitudePrompt || "None"}"</p>
                        </div>
                        <div>
                          <strong className="text-[10px] uppercase text-stone-500 block font-mono">Primary Focus Today:</strong>
                          <p className="text-slate-800 font-semibold mt-0.5">{mostImportant || "None"}</p>
                        </div>
                        <div>
                          <strong className="text-[10px] uppercase text-stone-500 block font-mono">Affirmation:</strong>
                          <p className="text-slate-800 font-bold mt-0.5 italic">"{personalizedAffirmation || "One day at a time!"}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Wizard Navigation Footer */}
              <div className="p-4 border-t border-stone-200 flex items-center justify-between shrink-0 bg-stone-50">
                <button
                  type="button"
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  className="px-4 py-3 border border-stone-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 bg-white hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    disabled={currentStep === 1 && (energy === 0 || anxiety === 0)}
                    onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                    className="px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-1 hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-300" /> Finish & Save
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Historical Ratings trend */}
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
    <div id="morning-checkin-root" className="space-y-4.5 font-sans">
      
      {/* Dynamic Prayer Header */}
      <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-2xl">
        <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider font-mono block mb-1">
          {currentUser === "Rhon" ? "Rhonda's AA Prayer" : "Susan's OA Prayer"}
        </span>
        <p className="italic text-xs font-semibold text-slate-850 m-0 leading-relaxed">
          {currentUser === "Rhon" 
            ? `"God, direct my thinking today; select especially that it be divorced from self-pity, dishonest or self-seeking motives. Help me to be of service today."` 
            : `"God, keep me abstinent and peaceful today, nourishing my mind and temple with balanced nourishment, one meal and twenty-four hours at a time."`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Core Quick Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Energy Rating Row */}
          <div className="bg-white border border-stone-200 rounded-2xl p-3.5 space-y-1.5 shadow-3xs">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-800">Energy Level</span>
              <span className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-lg">
                {energy === 0 ? "Select Rating" : `${energy} / 10`}
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
                        ? "bg-amber-450 text-slate-950 scale-108 border border-amber-550/30 shadow-xs"
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
              <span className="text-xs font-black text-slate-800">Anxiety Level</span>
              <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                {anxiety === 0 ? "Select Rating" : `${anxiety} / 10`}
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
                        ? "bg-indigo-600 text-white scale-108 shadow-xs"
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

        {/* SECTION 1: Connect with God */}
        <div className="bg-orange-50/40 border border-orange-100/70 rounded-2xl p-4.5 shadow-3xs space-y-3">
          <div className="flex items-center gap-1.5 border-b border-orange-200/50 pb-2">
            <Compass className="w-4.5 h-4.5 text-orange-500" />
            <strong className="text-xs uppercase font-extrabold tracking-wider text-orange-900 font-mono">
              Section 1: Connect with God
            </strong>
          </div>

          <div className="space-y-3">
            <div>
              <span className="block text-[10px] font-black text-orange-800 mb-1">Morning Prayer</span>
              <input
                type="text"
                value={morningPrayer}
                onChange={(e) => setMorningPrayer(e.target.value)}
                placeholder="Write your morning prayer or request..."
                className="w-full bg-white border border-orange-200 focus:bg-orange-50/50 focus:border-orange-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-850"
              />
            </div>

            <div>
              <span className="block text-[10px] font-black text-orange-800 mb-1">Daily Spiritual Focus</span>
              <input
                type="text"
                value={spiritualFocus}
                onChange={(e) => setSpiritualFocus(e.target.value)}
                placeholder="E.g., Surrender, Acceptance, Patience, Kindness..."
                className="w-full bg-white border border-orange-200 focus:bg-orange-50/50 focus:border-orange-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-850"
              />
            </div>

            <div>
              <span className="block text-[10px] font-black text-orange-800 mb-1">Gratitude Prompt</span>
              <input
                type="text"
                value={gratitudePrompt}
                onChange={(e) => setGratitudePrompt(e.target.value)}
                placeholder="Write one thing you are grateful for right now..."
                className="w-full bg-white border border-orange-200 focus:bg-orange-50/50 focus:border-orange-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-850"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Intention Setting */}
        <div className="bg-sky-50/40 border border-sky-100/70 rounded-2xl p-4.5 shadow-3xs space-y-3">
          <div className="flex items-center gap-1.5 border-b border-sky-200/50 pb-2">
            <Flame className="w-4.5 h-4.5 text-sky-500" />
            <strong className="text-xs uppercase font-extrabold tracking-wider text-sky-900 font-mono">
              Section 2: Intention Setting
            </strong>
          </div>

          <div className="space-y-3">
            <div>
              <span className="block text-[10px] font-black text-sky-800 mb-1">What is most important today?</span>
              <input
                type="text"
                value={mostImportant}
                onChange={(e) => setMostImportant(e.target.value)}
                placeholder="Your primary recovery or life priority..."
                className="w-full bg-white border border-sky-200 focus:bg-sky-50/50 focus:border-sky-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-850"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="block text-[10px] font-black text-sky-800 mb-1">Character trait to practice?</span>
                <input
                  type="text"
                  value={characterTrait}
                  onChange={(e) => setCharacterTrait(e.target.value)}
                  placeholder="E.g., Humility, Honesty..."
                  className="w-full bg-white border border-sky-200 focus:bg-sky-50/50 focus:border-sky-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-850"
                />
              </div>

              <div>
                <span className="block text-[10px] font-black text-sky-800 mb-1">Asking Higher Power to help with?</span>
                <input
                  type="text"
                  value={higherPowerHelp}
                  onChange={(e) => setHigherPowerHelp(e.target.value)}
                  placeholder="E.g., My patience, dealing with cravings..."
                  className="w-full bg-white border border-sky-200 focus:bg-sky-50/50 focus:border-sky-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-850"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: AI Personalized Affirmation */}
        <div className="bg-emerald-50/40 border border-emerald-100/70 rounded-2xl p-4.5 shadow-3xs space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-200/50 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-emerald-500" />
              <strong className="text-xs uppercase font-extrabold tracking-wider text-emerald-900 font-mono">
                Section 3: Daily Affirmation
              </strong>
            </div>

            <button
              type="button"
              onClick={handleGenerateAffirmation}
              disabled={isGeneratingAffirmation}
              className="bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-800 text-[10px] font-black px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              {isGeneratingAffirmation ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" /> Aligning...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Generate Affirmation
                </>
              )}
            </button>
          </div>

          <div className="space-y-1.5">
            <textarea
              rows={2}
              value={personalizedAffirmation}
              onChange={(e) => setPersonalizedAffirmation(e.target.value)}
              placeholder="Your custom daily affirmation will generate here, or you can write your own!"
              className="w-full bg-white border border-emerald-200 focus:border-emerald-400 focus:outline-none rounded-xl p-3 text-xs font-black text-slate-800 leading-relaxed shadow-3xs"
            />
          </div>
        </div>

        {/* Save Morning Check-In Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {(energy === 0 || anxiety === 0) ? (
            <p className="text-xs font-bold text-amber-600">
              ⚠️ Please select both Energy and Anxiety levels above to submit.
            </p>
          ) : (
            <div />
          )}
          <button
            type="submit"
            disabled={energy === 0 || anxiety === 0}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:opacity-55 disabled:cursor-not-allowed text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-300" /> Finish & Save Morning Journey
          </button>
        </div>

      </form>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-pulse">
          <Heart className="w-4 h-4 text-emerald-600 fill-emerald-500 shrink-0" /> morning connection saved successfully! sent overview report to Bliss.
        </div>
      )}

      {/* Historical Ratings trend */}
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
