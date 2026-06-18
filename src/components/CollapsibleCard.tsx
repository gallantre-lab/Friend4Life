import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleCardProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  themeColor?: "emerald" | "amber" | "indigo" | "rose" | "purple" | "slate" | "teal";
}

export default function CollapsibleCard({
  id,
  title,
  icon,
  isOpen,
  onToggle,
  children,
  badge,
  themeColor = "slate"
}: CollapsibleCardProps) {
  const getThemeClasses = () => {
    switch (themeColor) {
      case "emerald":
        return { bg: "bg-emerald-50/40 border-emerald-100", text: "text-emerald-800", iconBg: "bg-emerald-500/10 text-emerald-600" };
      case "amber":
        return { bg: "bg-amber-50/40 border-amber-100", text: "text-amber-800", iconBg: "bg-amber-500/10 text-amber-600" };
      case "indigo":
        return { bg: "bg-indigo-50/40 border-indigo-100", text: "text-indigo-800", iconBg: "bg-indigo-500/10 text-indigo-600" };
      case "rose":
        return { bg: "bg-rose-50/40 border-rose-100", text: "text-rose-800", iconBg: "bg-rose-500/10 text-rose-600" };
      case "purple":
        return { bg: "bg-purple-50/40 border-purple-100", text: "text-purple-800", iconBg: "bg-purple-500/10 text-purple-600" };
      case "teal":
        return { bg: "bg-teal-50/40 border-teal-100", text: "text-teal-800", iconBg: "bg-teal-500/10 text-teal-600" };
      default:
        return { bg: "bg-white border-slate-150", text: "text-slate-800", iconBg: "bg-slate-100 text-slate-600" };
    }
  };

  const theme = getThemeClasses();

  return (
    <div 
      id={`collapsible-card-${id}`}
      className={`border rounded-2xl md:rounded-3xl transition-all duration-300 shadow-sm ${
        isOpen ? "bg-white border-slate-200 ring-2 ring-slate-900/5" : `hover:border-slate-300 ${theme.bg}`
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left cursor-pointer focus:outline-none select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-xl transition-transform duration-300 ${theme.iconBg} ${isOpen ? "scale-110" : ""}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-extrabold text-sm md:text-base text-slate-900 tracking-tight leading-snug">
              {title}
            </h3>
            {badge && !isOpen && (
              <span className="inline-block mt-0.5 text-[9px] font-black tracking-widest uppercase text-slate-400">
                {badge}
              </span>
            )}
          </div>
        </div>
        <div className={`p-1.5 rounded-lg border border-slate-250 transition-transform duration-300 ${isOpen ? "rotate-180 bg-slate-900 text-white" : "bg-white text-slate-500"}`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 md:p-5 pt-0 border-t border-slate-100 animate-fade-in text-slate-700">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
