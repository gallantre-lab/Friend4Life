import React, { useState, useEffect } from "react";
import { Shield, Loader2 } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

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
  const [isCheckingCloud, setIsCheckingCloud] = useState(false);

  const cleanPin = (raw: any): string => {
    if (raw === undefined || raw === null) return "";
    let pin = String(raw).trim();
    if (pin === "null" || pin === "undefined" || pin === "" || pin.toLowerCase().includes("nan")) return "";
    while ((pin.startsWith('"') && pin.endsWith('"')) || (pin.startsWith("'") && pin.endsWith("'"))) {
      pin = pin.substring(1, pin.length - 1).trim();
    }
    pin = pin.replace(/\D/g, ""); // strictly keep only numeric characters
    return pin;
  };

  const getExistingPin = () => {
    const profileKey = targetUser === "Rhon" ? "forlife_rhon_profile_v3" : "forlife_suz_profile_v3";
    let storedPin = "";
    const localProfileStr = localStorage.getItem(profileKey);
    if (localProfileStr) {
      try {
        const parsed = JSON.parse(localProfileStr);
        if (parsed && parsed.pin) {
          storedPin = cleanPin(parsed.pin);
        }
      } catch (e) {}
    }
    const legacyPinKey = targetUser === "Rhon" ? "forlife_rhon_pin_v3" : "forlife_suz_pin_v3";
    const dynamicPinKey = targetUser === "Rhon" ? "rhon_dynamic_pin" : "suz_dynamic_pin";
    
    const rawPin = storedPin || cleanPin(localStorage.getItem(legacyPinKey)) || cleanPin(localStorage.getItem(dynamicPinKey)) || "";
    return rawPin;
  };

  useEffect(() => {
    const fetchCloudPinIfNeeded = async () => {
      const localPin = getExistingPin();
      if (localPin) return; // already synced locally

      setIsCheckingCloud(true);
      try {
        const keysToFetch = targetUser === "Rhon"
          ? ["forlife_rhon_profile_v3", "forlife_rhon_pin_v3", "rhon_dynamic_pin"]
          : ["forlife_suz_profile_v3", "forlife_suz_pin_v3", "suz_dynamic_pin"];

        let cloudPin = "";
        let fetchedProfileVal = "";
        for (const key of keysToFetch) {
          const docRef = doc(db, "local_storage", key);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const val = docSnap.data()?.value;
            if (val) {
              if (key.includes("profile")) {
                try {
                  const parsed = JSON.parse(val);
                  if (parsed && parsed.pin) {
                    const cleaned = cleanPin(parsed.pin);
                    if (cleaned) {
                      cloudPin = cleaned;
                      fetchedProfileVal = val;
                    }
                  }
                } catch (e) {}
              } else {
                const cleaned = cleanPin(val);
                if (cleaned) {
                  cloudPin = cleaned;
                }
              }
            }
          }
        }

        if (cloudPin) {
          const legacyPinKey = targetUser === "Rhon" ? "forlife_rhon_pin_v3" : "forlife_suz_pin_v3";
          const dynamicPinKey = targetUser === "Rhon" ? "rhon_dynamic_pin" : "suz_dynamic_pin";
          const profileKey = targetUser === "Rhon" ? "forlife_rhon_profile_v3" : "forlife_suz_profile_v3";

          localStorage.setItem(legacyPinKey, cloudPin);
          localStorage.setItem(dynamicPinKey, cloudPin);
          
          let profileObj: any = null;
          if (fetchedProfileVal) {
            try {
              profileObj = JSON.parse(fetchedProfileVal);
            } catch (e) {}
          }
          if (profileObj) {
            profileObj.pin = cloudPin;
            localStorage.setItem(profileKey, JSON.stringify(profileObj));
          }
          
          // force re-render
          setPinLock("");
        }
      } catch (err) {
        console.error("PinGate: Error fetching cloud PIN on mount:", err);
      } finally {
        setIsCheckingCloud(false);
      }
    };

    fetchCloudPinIfNeeded();
  }, [targetUser]);

  const handleUnlockAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinLock.length !== 4 || !/^\d+$/.test(pinLock)) {
      setPinError(true);
      return;
    }

    setIsCheckingCloud(true);
    let existingPin = getExistingPin();

    if (pinLock !== existingPin) {
      try {
        const keysToFetch = targetUser === "Rhon"
          ? ["forlife_rhon_profile_v3", "forlife_rhon_pin_v3", "rhon_dynamic_pin"]
          : ["forlife_suz_profile_v3", "forlife_suz_pin_v3", "suz_dynamic_pin"];

        let cloudPin = "";
        let fetchedProfileVal = "";
        for (const key of keysToFetch) {
          const docRef = doc(db, "local_storage", key);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const val = docSnap.data()?.value;
            if (val) {
              if (key.includes("profile")) {
                try {
                  const parsed = JSON.parse(val);
                  if (parsed && parsed.pin) {
                    const cleaned = cleanPin(parsed.pin);
                    if (cleaned) {
                      cloudPin = cleaned;
                      fetchedProfileVal = val;
                    }
                  }
                } catch (e) {}
              } else {
                const cleaned = cleanPin(val);
                if (cleaned) {
                  cloudPin = cleaned;
                }
              }
            }
          }
        }

        if (cloudPin) {
          existingPin = cloudPin;
          const legacyPinKey = targetUser === "Rhon" ? "forlife_rhon_pin_v3" : "forlife_suz_pin_v3";
          const dynamicPinKey = targetUser === "Rhon" ? "rhon_dynamic_pin" : "suz_dynamic_pin";
          const profileKey = targetUser === "Rhon" ? "forlife_rhon_profile_v3" : "forlife_suz_profile_v3";

          localStorage.setItem(legacyPinKey, cloudPin);
          localStorage.setItem(dynamicPinKey, cloudPin);
          
          let profileObj: any = null;
          if (fetchedProfileVal) {
            try {
              profileObj = JSON.parse(fetchedProfileVal);
            } catch (e) {}
          }
          if (profileObj) {
            profileObj.pin = cloudPin;
            localStorage.setItem(profileKey, JSON.stringify(profileObj));
          }
        }
      } catch (err) {
        console.error("PinGate: Cloud verify fallback error:", err);
      } finally {
        setIsCheckingCloud(false);
      }
    } else {
      setIsCheckingCloud(false);
    }

    if (!existingPin) {
      // First time setup!
      const pinKey = targetUser === "Rhon" ? "rhon_dynamic_pin" : "suz_dynamic_pin";
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

  const handleResetPinToDefault = () => {
    const legacyPinKey = targetUser === "Rhon" ? "forlife_rhon_pin_v3" : "forlife_suz_pin_v3";
    const dynamicPinKey = targetUser === "Rhon" ? "rhon_dynamic_pin" : "suz_dynamic_pin";
    const profileKey = targetUser === "Rhon" ? "forlife_rhon_profile_v3" : "forlife_suz_profile_v3";

    localStorage.setItem(legacyPinKey, "1234");
    localStorage.setItem(dynamicPinKey, "1234");

    const localProfileStr = localStorage.getItem(profileKey);
    if (localProfileStr) {
      try {
        const parsed = JSON.parse(localProfileStr);
        parsed.pin = "1234";
        localStorage.setItem(profileKey, JSON.stringify(parsed));
      } catch (e) {}
    }
    alert(`PIN for ${targetUser === "Rhon" ? "Rhonda" : "Susan"} has been reset to 1234 locally!`);
    setPinLock("");
    setPinError(false);
  };

  const isSetup = !getExistingPin();

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
          className="w-full text-center tracking-widest text-2xl py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-indigo-400 focus:outline-none disabled:opacity-50"
          autoFocus
          disabled={isCheckingCloud}
        />
        {pinError && !isCheckingCloud && <p className="text-[10px] text-rose-500 font-bold text-center m-0">Incorrect PIN. Try again.</p>}
        {isCheckingCloud && (
          <div className="flex items-center justify-center gap-1.5 text-stone-500 text-xs font-semibold py-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            <span>Checking security cloud...</span>
          </div>
        )}
        <button 
          type="submit" 
          disabled={isCheckingCloud}
          className="w-full py-3 bg-slate-900 text-white font-black rounded-xl text-sm hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {isCheckingCloud ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            isSetup ? "Save PIN & Unlock" : "Unlock"
          )}
        </button>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isCheckingCloud}
            className="w-full py-2 text-stone-500 font-bold text-xs hover:text-stone-700 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleResetPinToDefault}
            className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition bg-none border-none p-0"
          >
            Forgot PIN? Reset to default 1234
          </button>
        </div>
      </form>
    </div>
  );
}
