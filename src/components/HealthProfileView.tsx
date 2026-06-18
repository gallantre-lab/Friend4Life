import React, { useState } from "react";
import { UserProfile } from "../types";
import { 
  Heart, Shield, AlertTriangle, CheckCircle, 
  Settings, UserCheck, Activity, Award
} from "lucide-react";

interface HealthProfileViewProps {
  rhonProfile: UserProfile;
  suzProfile: UserProfile;
  onUpdateProfile: (user: "rhon" | "suz", fields: Partial<UserProfile>) => void;
}

export default function HealthProfileView({
  rhonProfile,
  suzProfile,
  onUpdateProfile
}: HealthProfileViewProps) {
  const [editingUser, setEditingUser] = useState<"rhon" | "suz" | null>(null);

  // Buffer form states
  const [meds, setMeds] = useState("");
  const [supplements, setSupplements] = useState("");
  const [allergies, setAllergies] = useState("");
  const [foodRestrictions, setFoodRestrictions] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [recoveryNote, setRecoveryNote] = useState("");

  const startEdit = (user: "rhon" | "suz") => {
    const p = user === "rhon" ? rhonProfile : suzProfile;
    setEditingUser(user);
    setMeds(p.meds || "");
    setSupplements(p.supplements || "");
    setAllergies(p.allergies || "");
    setFoodRestrictions(p.foodRestrictions || "");
    setCurrentWeight(String(p.currentWeight || 160));
    setGoalWeight(String(p.goalWeight || 140));
    setRecoveryNote(p.recoveryNote || "");
  };

  const handleSave = () => {
    if (!editingUser) return;
    
    onUpdateProfile(editingUser, {
      meds,
      supplements,
      allergies,
      foodRestrictions,
      currentWeight: parseFloat(currentWeight) || 150,
      goalWeight: parseFloat(goalWeight) || 135,
      recoveryNote,
      glutenFree: foodRestrictions.toLowerCase().includes("gluten"),
      lowSugar: foodRestrictions.toLowerCase().includes("sugar") || foodRestrictions.toLowerCase().includes("carb")
    });

    setEditingUser(null);
  };

  return (
    <div id="health-profiles-section" className="space-y-6">
      
      {/* Introduction */}
      <div className="bg-gradient-to-r from-teal-50 to-indigo-50 rounded-3xl p-6 border border-teal-100/60 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-5 h-5 text-teal-700" />
            <h3 className="font-extrabold text-slate-800 text-lg">Structured Medication & Bio Record</h3>
          </div>
          <p className="text-xs text-slate-500 leading-normal max-w-xl">
            Keep clinical medications, supplement dosages, allergy alerts, and sobriety milestones clearly cataloged. Bliss references these profiles as grounding guides during every interaction.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RHON HEALTH PROFILE */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center text-sm">
                R
              </span>
              <div>
                <h4 className="font-extrabold text-slate-800">Rhon's Profile</h4>
                <p className="text-[10px] text-slate-400 font-mono">Age 47 • Sustainable weight focus</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => startEdit("rhon")}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl cursor-pointer transition"
            >
              Configure specs
            </button>
          </div>

          <div className="space-y-3.5 text-xs text-slate-700 font-sans">
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Current Weight</span>
                <span className="font-mono font-extrabold text-slate-800">{rhonProfile.currentWeight} lbs</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Target Goal</span>
                <span className="font-mono font-extrabold text-emerald-600">{rhonProfile.goalWeight} lbs</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 text-[10px] block uppercase tracking-wider">Medications & Supplements</span>
              <p className="bg-slate-50/70 py-1.5 px-3 rounded-lg border border-slate-100 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{rhonProfile.meds || "None routine"} {rhonProfile.supplements ? `| ${rhonProfile.supplements}` : ""}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 text-[10px] block uppercase tracking-wider">Allergies & Restrictions</span>
              <p className="bg-amber-50 text-amber-900 py-1.5 px-3 rounded-lg border border-amber-100 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Allergies: {rhonProfile.allergies || "No allergies documented"} {rhonProfile.foodRestrictions ? `• Restrict: ${rhonProfile.foodRestrictions}` : ""}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 text-[10px] block uppercase tracking-wider">Sobriety & Recovery Notes</span>
              <p className="bg-teal-50 text-teal-900 py-1.5 px-3 rounded-lg border border-teal-100 flex items-center gap-1.5 italic font-medium">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{rhonProfile.recoveryNote || "AA continuous sobriety"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* SUZ HEALTH PROFILE */}
        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 font-extrabold flex items-center justify-center text-sm">
                S
              </span>
              <div>
                <h4 className="font-extrabold text-slate-800">Suz's Profile</h4>
                <p className="text-[10px] text-slate-400 font-mono">Age 46 • Wegovy support & OA</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => startEdit("suz")}
              className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl cursor-pointer transition"
            >
              Configure specs
            </button>
          </div>

          <div className="space-y-3.5 text-xs text-slate-700 font-sans">
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Current Weight</span>
                <span className="font-mono font-extrabold text-slate-800">{suzProfile.currentWeight} lbs</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Target Goal</span>
                <span className="font-mono font-extrabold text-emerald-600">{suzProfile.goalWeight} lbs</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 text-[10px] block uppercase tracking-wider">Medications & Supplements</span>
              <p className="bg-slate-50/70 py-1.5 px-3 rounded-lg border border-slate-100 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{suzProfile.meds || "Wegovy support Routine"} {suzProfile.supplements ? `| ${suzProfile.supplements}` : ""}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 text-[10px] block uppercase tracking-wider">Allergies & Restrictions</span>
              <p className="bg-amber-50 text-amber-900 py-1.5 px-3 rounded-lg border border-amber-100 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Allergies: {suzProfile.allergies || "No documented allergies"} {suzProfile.foodRestrictions ? `• Restrict: ${suzProfile.foodRestrictions}` : ""}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 text-[10px] block uppercase tracking-wider">Sobriety & Recovery Notes</span>
              <p className="bg-purple-50 text-purple-950 py-1.5 px-3 rounded-lg border border-purple-100 flex items-center gap-1.5 italic font-medium">
                <Award className="w-4 h-4 text-purple-500 shrink-0" />
                <span>{suzProfile.recoveryNote || "Overeaters Anonymous (OA) tracking"}</span>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* EDITING DIALOG INPLACE PANEL */}
      {editingUser && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 animate-fade-in font-sans">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h4 className="font-extrabold text-sm uppercase">Updating {editingUser === "rhon" ? "Rhon's" : "Suz's"} Health Spec Record</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Medications & Frequency</label>
              <input 
                type="text"
                value={meds}
                onChange={e => setMeds(e.target.value)}
                placeholder="e.g. Vyvanse (30mg daily)"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Supplements</label>
              <input 
                type="text"
                value={supplements}
                onChange={e => setSupplements(e.target.value)}
                placeholder="e.g. Omega-3 Fish Oil, Vitamin D3"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Allergies</label>
              <input 
                type="text"
                value={allergies}
                onChange={e => setAllergies(e.target.value)}
                placeholder="e.g. Peanuts, Shellfish, none"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Food Restrictions & Preferences</label>
              <input 
                type="text"
                value={foodRestrictions}
                onChange={e => setFoodRestrictions(e.target.value)}
                placeholder="e.g. Gluten-Free (GF), Lower sugar, Lower carb"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Current lbs</label>
                <input 
                  type="number"
                  value={currentWeight}
                  onChange={e => setCurrentWeight(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Goal lbs</label>
                <input 
                  type="number"
                  value={goalWeight}
                  onChange={e => setGoalWeight(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Recovery Programme info</label>
              <input 
                type="text"
                value={recoveryNote}
                onChange={e => setRecoveryNote(e.target.value)}
                placeholder="e.g. 15 Years Continuous Sobriety in AA"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 mt-5 border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="bg-slate-700 text-slate-200 hover:bg-slate-650 px-4.5 py-2 rounded-2xl text-xs font-bold transition"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-5 py-2 rounded-2xl text-xs transition"
            >
              Save Secure Profile
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
