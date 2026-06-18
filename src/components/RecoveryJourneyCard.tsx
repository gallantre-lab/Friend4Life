import React from "react";
import { Plus, Minus, Star, Award, ShieldCheck, Heart } from "lucide-react";

export interface RecoveryMetrics {
  // Rhonda Metrics
  sugarFreeDays: number;
  bingeFreeDays: number;
  meetingsAttended: number;
  sponsorContacts: number;
  prayerMeditationStreak: number;
  gratitudeEntries: number;
  journalEntries: number;
  // Susan Metrics
  oaReadingsCompleted: number;
  foodPlanAdherence: number;
  emotionalCheckIns: number;
  weighIns: number;
  recoveryActivities: number;
}

interface RecoveryJourneyCardProps {
  currentUser: "Rhon" | "Suz";
  metrics: RecoveryMetrics;
  setMetrics: React.Dispatch<React.SetStateAction<RecoveryMetrics>>;
  onLogActivity: (text: string, type: "habit") => void;
  onBlissInteract: (text: string) => void;
}

export default function RecoveryJourneyCard({
  currentUser,
  metrics,
  setMetrics,
  onLogActivity,
  onBlissInteract
}: RecoveryJourneyCardProps) {
  const isRhon = currentUser === "Rhon";

  const handleUpdateMetric = (key: keyof RecoveryMetrics, direction: "add" | "sub") => {
    setMetrics((prev) => {
      const currentVal = prev[key] || 0;
      const newVal = direction === "add" ? currentVal + 1 : Math.max(0, currentVal - 1);
      
      // Save info log
      if (direction === "add") {
        onLogActivity(`Incremented metric streak: ${key.replace(/([A-Z])/g, " $1")}`, "habit");
      }

      return {
        ...prev,
        [key]: newVal
      };
    });
  };

  const handleSelfReportSuccess = (messageText: string) => {
    onBlissInteract(
      `Bliss, coach! I wanted to celebrate a recovery win: "${messageText}". I'm staying committed, focused, and grateful!`
    );
  };

  const rhondaMetricsList = [
    { key: "sugarFreeDays" as keyof RecoveryMetrics, label: "🍩 Sugar-Free Days", count: metrics.sugarFreeDays, color: "text-amber-600 bg-amber-50" },
    { key: "bingeFreeDays" as keyof RecoveryMetrics, label: "🍏 Binge-Free Days", count: metrics.bingeFreeDays, color: "text-emerald-600 bg-emerald-50" },
    { key: "meetingsAttended" as keyof RecoveryMetrics, label: "👥 AA Meetings Attended", count: metrics.meetingsAttended, color: "text-indigo-600 bg-indigo-50" },
    { key: "sponsorContacts" as keyof RecoveryMetrics, label: "📞 Sponsor Contacts", count: metrics.sponsorContacts, color: "text-purple-600 bg-purple-50" },
    { key: "prayerMeditationStreak" as keyof RecoveryMetrics, label: "🙏 Prayer/Meditation Streak", count: metrics.prayerMeditationStreak, color: "text-teal-600 bg-teal-50" },
    { key: "gratitudeEntries" as keyof RecoveryMetrics, label: "📝 Gratitude Entries", count: metrics.gratitudeEntries, color: "text-rose-600 bg-rose-50" },
    { key: "journalEntries" as keyof RecoveryMetrics, label: "📖 Journal Entries", count: metrics.journalEntries, color: "text-slate-650 bg-slate-50" },
  ];

  const susanMetricsList = [
    { key: "oaReadingsCompleted" as keyof RecoveryMetrics, label: "📖 OA Readings Completed", count: metrics.oaReadingsCompleted, color: "text-rose-600 bg-rose-50" },
    { key: "foodPlanAdherence" as keyof RecoveryMetrics, label: "🍽 Food Plan Adherence", count: metrics.foodPlanAdherence, color: "text-amber-600 bg-amber-50" },
    { key: "gratitudeEntries" as keyof RecoveryMetrics, label: "📝 Gratitude Entries", count: metrics.gratitudeEntries, color: "text-emerald-600 bg-emerald-50" },
    { key: "emotionalCheckIns" as keyof RecoveryMetrics, label: "😊 Emotional Check-Ins", count: metrics.emotionalCheckIns, color: "text-indigo-600 bg-indigo-50" },
    { key: "weighIns" as keyof RecoveryMetrics, label: "⚖️ Weigh-Ins Logged", count: metrics.weighIns, color: "text-purple-600 bg-purple-50" },
    { key: "recoveryActivities" as keyof RecoveryMetrics, label: "🏃 Recovery Activities", count: metrics.recoveryActivities, color: "text-teal-600 bg-teal-50" },
  ];

  const activeMetrics = isRhon ? rhondaMetricsList : susanMetricsList;

  // Render quick encouragement tier badges based on streak totals
  const getStreakGrade = () => {
    const totalCount = isRhon 
      ? metrics.sugarFreeDays + metrics.bingeFreeDays + metrics.meetingsAttended
      : metrics.foodPlanAdherence + metrics.oaReadingsCompleted + metrics.recoveryActivities;

    if (totalCount >= 20) return { title: "Spiritual Warrior Badge", desc: "Radiating intense commitment & focus!", color: "bg-purple-900 border-purple-800 text-white" };
    if (totalCount >= 10) return { title: "Heart-Centered Pillar", desc: "Consistent discipline yielding massive daily serenity.", color: "bg-emerald-900 border-emerald-800 text-white" };
    return { title: "Grateful Hopeful", desc: "Taking pristine single-day paces toward complete balance.", color: "bg-slate-900 border-slate-800 text-white" };
  };

  const badge = getStreakGrade();

  return (
    <div id="recovery-journey-panel" className="space-y-5 font-sans">
      
      {/* Visual Award Header Badge */}
      <div className={`p-4 rounded-2.5xl border flex items-center justify-between gap-4 shadow-sm ${badge.color}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl text-amber-300">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs tracking-wider uppercase opacity-80 leading-none">ACTIVE RECOVERY STATUS</h4>
            <h3 className="font-black text-sm md:text-base mt-1 tracking-tight">{badge.title}</h3>
            <p className="text-[10px] opacity-90 font-medium leading-relaxed mt-0.5">{badge.desc}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleSelfReportSuccess(`I've logged robust streaks today and feel very close to my Higher Power!`)}
          className="px-3 py-1.5 bg-white text-slate-950 hover:bg-slate-50 border-none rounded-xl text-[10px] font-black shrink-0 shadow-xs cursor-pointer transition-all"
        >
          Check In Win
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeMetrics.map((item) => (
          <div 
            key={item.key} 
            className="p-3.5 bg-white rounded-2xl border border-slate-150 flex items-center justify-between gap-4 hover:border-slate-350 transition shadow-xs"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold text-slate-800 leading-tight block">
                {item.label}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium">Current Streak:</span>
                <span className="text-xs font-black text-slate-900 font-mono">
                  {item.count}
                </span>
                <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">Days</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-stone-50 p-1.5 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => handleUpdateMetric(item.key, "sub")}
                className="w-7 h-7 bg-white hover:bg-stone-100 border border-stone-250 rounded-lg text-slate-600 flex items-center justify-center transition focus:ring-1 focus:ring-indigo-305 cursor-pointer"
                title="Decrement streak count"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleUpdateMetric(item.key, "add")}
                className="w-7 h-7 bg-white hover:bg-stone-100 border border-stone-250 rounded-lg text-slate-800 flex items-center justify-center transition focus:ring-1 focus:ring-indigo-305 font-black cursor-pointer"
                title="Increment streak count"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Spunky accountability indicator card */}
      <div className="p-3 bg-stone-50 border border-stone-150 rounded-2xl text-[11px] font-medium text-slate-500 leading-normal">
        🔑 <strong className="text-slate-800 font-bold">Pro Tip:</strong> Tapping these streaks notifies Bliss so she can remember your consistency in upcoming meal plans and accountability chats! Keep going!
      </div>

    </div>
  );
}
