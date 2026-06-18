import React, { useState } from "react";
import { Users, Phone, ShieldCheck, Heart, Calendar, Plus, MessageSquare } from "lucide-react";

export interface LoggedEvent {
  id: string;
  type: "meeting" | "sponsor_call" | "recovery_call" | "service_work";
  notes: string;
  date: string;
  user: "Rhon" | "Suz";
}

interface MeetingsSupportCardProps {
  currentUser: "Rhon" | "Suz";
  events: LoggedEvent[];
  setEvents: React.Dispatch<React.SetStateAction<LoggedEvent[]>>;
  onLogActivity: (text: string, type: "habit") => void;
  onBlissInteract: (text: string) => void;
}

export default function MeetingsSupportCard({
  currentUser,
  events,
  setEvents,
  onLogActivity,
  onBlissInteract
}: MeetingsSupportCardProps) {
  const [logType, setLogType] = useState<LoggedEvent["type"]>("meeting");
  const [logNotes, setLogNotes] = useState("");
  const [savedOk, setSavedOk] = useState(false);

  // Sponsor profiles
  const rSponsor = { name: "Brenda (Rhonda's sponsor)", phone: "555-019-3382", step: "Step 11", requirements: "Call daily by 9am" };
  const sSponsor = { name: "Carla (Susan's sponsor)", phone: "555-014-9981", step: "Step 4", requirements: "Call Mon & Thurs evenings" };

  const activeSponsor = currentUser === "Rhon" ? rSponsor : sSponsor;

  const handlePostLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logNotes.trim()) return;

    const newEv: LoggedEvent = {
      id: "ev_" + Date.now() + Math.random().toString(36).substring(2, 5),
      type: logType,
      notes: logNotes.trim(),
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      user: currentUser
    };

    setEvents((prev) => [newEv, ...prev]);
    onLogActivity(`Logged target event: ${getTypeLabel(logType)} - "${logNotes.trim()}"`, "habit");

    // Formulate Bliss interact
    const typeText = getTypeLabel(logType);
    const blissPrompt = `Bliss, I checked off a major anchor in my recovery calendar today: I logged ${typeText} with notes: "${logNotes.trim()}". Could you bless me with a quick word of celebration on this action?`;
    onBlissInteract(blissPrompt);

    setLogNotes("");
    setSavedOk(true);

    setTimeout(() => {
      setSavedOk(false);
    }, 4000);
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case "meeting": return currentUser === "Rhon" ? "👥 AA Recovery Meeting" : "👥 OA Recovery Meeting";
      case "sponsor_call": return "📞 Phone Call with Sponsor";
      case "recovery_call": return "☎️ Outbound Recovery Call";
      case "service_work": return "🤝 Active Service Work";
      default: return "Anchor Action";
    }
  };

  const myEvents = events.filter((e) => e.user === currentUser);

  return (
    <div id="meetings-support-panel" className="space-y-4 font-sans text-xs md:text-sm">
      
      {/* Sponsor Contacts Quick Reference Panel */}
      <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2.5xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase text-teal-800 tracking-wider font-mono">My Active Sponsor Coordinates</span>
          <h4 className="font-extrabold text-slate-900 text-sm">{activeSponsor.name}</h4>
          <p className="text-slate-500 font-medium">📍 Currently working: <strong className="text-slate-800 font-bold">{activeSponsor.step}</strong></p>
          <p className="text-slate-500 font-medium font-mono text-[10.5px]">📞 Contact: <span className="bg-white px-1.5 py-0.5 rounded border leading-none">{activeSponsor.phone}</span></p>
        </div>

        <div className="space-y-1 md:border-l md:border-teal-200/50 md:pl-4 justify-center flex flex-col">
          <span className="text-[9px] font-black uppercase text-teal-800 tracking-widest font-mono">Contract Commitments</span>
          <p className="text-[11px] leading-relaxed text-teal-900 font-bold">
            "{activeSponsor.requirements}"
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setLogType("sponsor_call");
                setLogNotes("Standard daily check-in complete. Feeling grounded.");
              }}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-[10px] font-black shadow-xs cursor-pointer transition"
            >
              📞 Direct Call Logged
            </button>
          </div>
        </div>
      </div>

      {savedOk && (
        <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl font-bold flex items-center justify-center gap-1.5 animate-bounce text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Event logged successfully and shared with Bliss!
        </div>
      )}

      {/* Logging form */}
      <form onSubmit={handlePostLog} className="p-3.5 bg-slate-50/80 border border-slate-150 rounded-2xl space-y-3">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-[10px] uppercase font-bold text-slate-500">I want to log:</span>
          <div className="flex bg-slate-150 p-0.5 rounded-lg gap-1">
            {(["meeting", "sponsor_call", "recovery_call", "service_work"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setLogType(t)}
                className={`px-2 py-1 text-[10px] font-black rounded transition ${
                  logType === t ? "bg-white text-slate-900 shadow-xs" : "text-slate-550 hover:text-slate-800"
                }`}
              >
                {t === "meeting" ? "Meeting" : t === "sponsor_call" ? "Sponsor" : t === "recovery_call" ? "Call" : "Service"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            required
            value={logNotes}
            onChange={(e) => setLogNotes(e.target.value)}
            placeholder={
              logType === "meeting" ? "E.g., 12pm Central AA Group, great speaker on Step 3..." :
              logType === "sponsor_call" ? "E.g., worked on Steps discussion, daily check..." :
              logType === "recovery_call" ? "E.g., called Brenda to check on her daily run..." :
              "E.g., set up coffee pot at meeting center, cleaned table..."
            }
            className="flex-1 bg-white border border-slate-205 focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none font-semibold transition shadow-3xs"
          />
          <button
            type="submit"
            className="px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Log
          </button>
        </div>
      </form>

      {/* Historical logs list */}
      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
        {myEvents.length === 0 ? (
          <div className="p-3 text-center text-slate-400 italic">
            No logged anchor actions yet today. Let's record one!
          </div>
        ) : (
          myEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-2.5 bg-white border border-slate-150 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-black text-indigo-850 px-1.5 py-0.5 rounded bg-indigo-50 font-mono">
                    {getTypeLabel(ev.type)}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono font-medium">{ev.date}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-bold">
                  {ev.notes}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEvents((prev) => prev.filter((item) => item.id !== ev.id))}
                className="text-[9px] font-black text-slate-400 hover:text-rose-600 px-1 cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
