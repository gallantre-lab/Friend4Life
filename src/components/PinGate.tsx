import React, { useState } from "react";
import { Shield } from "lucide-react";

interface PinGateProps {
  targetUser: "Rhon" | "Suz";
  onUnlock: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
}

export default function PinGate({ targetUser, onUnlock, onCancel, title, description }: PinGateProps) {
  const [pinLock, setPinLock] = useState<string>("");
  const [pinError, setPinError] = useState(false);

  const handleUnlockAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinLock.length !== 4 || !/^\d+$/.test(pinLock)) {
      setPinError(true);
      return;
    }

    const pinKey = targetUser === "Rhon" ? "rhon_dynamic_pin" : "suz_dynamic_pin";
    const existingPin = localStorage.getItem(pinKey);

    if (!existingPin) {
      // First time setup!
      localStorage.setItem(pinKey, pinLock);
      setPinError(false);
      onUnlock();
    } else {
      if (pinLock === existingPin) {
        setPinError(false);
        onUnlock();
      } else {
        setPinError(true);
      }
    }
  };

  const isSetup = !localStorage.getItem(targetUser === "Rhon" ? "rhon_dynamic_pin" : "suz_dynamic_pin");

  return (
    <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-3xs max-w-sm mx-auto mt-10">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-slate-800">
          {title || (isSetup ? "Set Up 4-Digit PIN" : "Enter PIN")}
        </h3>
        <p className="text-[11px] text-stone-500 mt-1">
          {description || (isSetup 
             ? `First time setup for ${targetUser === "Rhon" ? "Rhonda" : "Susan"}. Enter a 4-digit PIN.` 
             : `Enter ${targetUser === "Rhon" ? "Rhonda's" : "Susan's"} 4-digit PIN to access.`)}
        </p>
      </div>
      
      <form onSubmit={handleUnlockAttempt} className="space-y-4">
        <input
          type="password"
          maxLength={4}
          value={pinLock}
          onChange={(e) => setPinLock(e.target.value)}
          placeholder="••••"
          className="w-full text-center tracking-widest text-2xl py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-indigo-400 focus:outline-none"
          autoFocus
        />
        {pinError && <p className="text-[10px] text-rose-500 font-bold text-center m-0">Incorrect PIN. Try again.</p>}
        <button type="submit" className="w-full py-3 bg-slate-900 text-white font-black rounded-xl text-sm hover:bg-slate-800 transition cursor-pointer">
          {isSetup ? "Save PIN & Unlock" : "Unlock"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="w-full py-2 text-stone-500 font-bold text-xs hover:text-stone-700 transition cursor-pointer">
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}
