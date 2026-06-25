import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  Plus, 
  Check, 
  DollarSign, 
  TrendingDown, 
  TrendingUp,
  PiggyBank,
  ArrowUpRight,
  Award, 
  Calendar, 
  CheckCircle2, 
  History, 
  RotateCcw, 
  ChevronRight, 
  AlertTriangle, 
  Info, 
  Edit2, 
  Archive, 
  Trash2, 
  ShieldCheck, 
  X,
  FileText
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface PaymentItem {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
  na?: boolean;
}

const defaultPayments: PaymentItem[] = [
  { id: "1", name: "Mortgage", amount: 850, paid: false },
  { id: "2", name: "Electric", amount: 150, paid: false },
  { id: "3", name: "House Insurance", amount: 100, paid: false },
  { id: "21", name: "Car Insurance", amount: 100, paid: false },
  { id: "4", name: "Phones", amount: 155, paid: false },
  { id: "5", name: "LOC SG", amount: 250, paid: false },
  { id: "6", name: "Shed", amount: 150, paid: false },
  { id: "7", name: "Car SG", amount: 252, paid: false },
  { id: "8", name: "Car RG", amount: 215, paid: false },
  { id: "9", name: "Property", amount: 100, paid: false },
  { id: "10", name: "Emerg", amount: 50, paid: false },
  { id: "11", name: "Church", amount: 40, paid: false },
  { id: "12", name: "TFSA", amount: 100, paid: false },
  { id: "13", name: "SG CIBC", amount: 200, paid: false },
  { id: "14", name: "SG Triangle", amount: 50, paid: false },
  { id: "15", name: "CIBC RG", amount: 250, paid: false },
  { id: "16", name: "LOC RG", amount: 250, paid: false },
  { id: "17", name: "PC RG", amount: 250, paid: false },
  { id: "18", name: "Play", amount: 50, paid: false },
  { id: "19", name: "DR", amount: 50, paid: false },
  { id: "20", name: "Internet", amount: 80, paid: false }
];

interface DebtAccount {
  id: string;
  name: string;
  category: "Credit Card" | "Line of Credit" | "Mortgage" | "Auto Loan" | "Personal Loan" | "Other";
  creditLimit: number; // Credit Limit or Original Loan Amount
  currentBalance: number;
  startingBalance: number;
  interestRate: number; // Annual interest percentage (e.g. 13.99 for 13.99%)
  biweeklyPayment: number;
  notes: string;
  isArchived: boolean;
  completed?: boolean;
  lastAutoProcessed?: string;
}

interface DebtHistoryEntry {
  id: string;
  date: string; // "YYYY-MM-DD"
  accountId: string;
  accountName: string;
  previousBalance: number;
  newBalance: number;
  amountReduced: number;
}

interface SavingsAccount {
  id: string;
  name: string;
  startingBalance: number;
  currentBalance: number;
  notes: string;
  isArchived: boolean;
  lastUpdated?: string;
}

interface SavingsHistoryEntry {
  id: string;
  date: string; // "YYYY-MM-DD"
  accountId: string;
  accountName: string;
  previousBalance: number;
  newBalance: number;
  amountChanged: number; // Positive if deposited, negative if withdrawn
}

function getAccountOwner(name: string): "RG" | "SG" | "OTHER" {
  const normalized = name.toUpperCase();
  if (
    normalized.startsWith("RG ") || 
    normalized.includes(" RG") || 
    normalized.includes("RG-") || 
    normalized.includes("RHONDA") || 
    normalized === "RG"
  ) {
    return "RG";
  }
  if (
    normalized.startsWith("SG ") || 
    normalized.includes(" SG") || 
    normalized.includes("SG-") || 
    normalized.includes("SUSAN") || 
    normalized === "SG"
  ) {
    return "SG";
  }
  return "OTHER";
}

const defaultDebtAccounts: DebtAccount[] = [
  { id: "acc_1", name: "RG Visa Select", category: "Credit Card", creditLimit: 10000, currentBalance: 4772, startingBalance: 5500, interestRate: 13.99, biweeklyPayment: 150, notes: "Rhonda primary rewards card", isArchived: false },
  { id: "acc_2", name: "SG CIBC", category: "Credit Card", creditLimit: 15000, currentBalance: 5446, startingBalance: 6200, interestRate: 21.99, biweeklyPayment: 200, notes: "Susan main card", isArchived: false },
  { id: "acc_3", name: "SG Line of Credit", category: "Line of Credit", creditLimit: 14000, currentBalance: 12618, startingBalance: 13500, interestRate: 11.99, biweeklyPayment: 250, notes: "Susan personal LOC", isArchived: false },
  { id: "acc_4", name: "RG Line of Credit", category: "Line of Credit", creditLimit: 10000, currentBalance: 7655.39, startingBalance: 8200, interestRate: 8.99, biweeklyPayment: 250, notes: "Rhonda personal LOC", isArchived: false },
  { id: "acc_5", name: "RG PC Mastercard", category: "Credit Card", creditLimit: 14000, currentBalance: 1182, startingBalance: 2000, interestRate: 21.99, biweeklyPayment: 100, notes: "President's Choice points card", isArchived: false },
  { id: "acc_6", name: "SG CT Mastercard", category: "Credit Card", creditLimit: 19500, currentBalance: 0, startingBalance: 0, interestRate: 21.99, biweeklyPayment: 0, notes: "Canadian Tire Options", isArchived: false },
  { id: "acc_7", name: "RG Scotia Visa", category: "Credit Card", creditLimit: 12000, currentBalance: 0, startingBalance: 0, interestRate: 21.99, biweeklyPayment: 0, notes: "Scotiabank Passport", isArchived: false },
  { id: "acc_8", name: "SG Scotia Visa", category: "Credit Card", creditLimit: 1000, currentBalance: 0, startingBalance: 0, interestRate: 21.99, biweeklyPayment: 0, notes: "Susan small credit line", isArchived: false },
  { id: "acc_9", name: "RG Car", category: "Auto Loan", creditLimit: 32000, currentBalance: 32000, startingBalance: 33000, interestRate: 5.00, biweeklyPayment: 214, notes: "Rhonda SUV auto loan", isArchived: false, lastAutoProcessed: "2026-06-15" },
  { id: "acc_10", name: "SG Car", category: "Auto Loan", creditLimit: 38000, currentBalance: 38000, startingBalance: 39000, interestRate: 5.00, biweeklyPayment: 245, notes: "Susan crossover auto loan", isArchived: false, lastAutoProcessed: "2026-06-15" },
  { id: "acc_11", name: "Mortgage", category: "Mortgage", creditLimit: 318081.21, currentBalance: 318081.21, startingBalance: 319081.21, interestRate: 4.74, biweeklyPayment: 771.86, notes: "Shared home mortgage loan", isArchived: false, lastAutoProcessed: "2026-06-01" }
];

const defaultSavingsAccounts: SavingsAccount[] = [
  { id: "sav_1", name: "Emergency Fund", startingBalance: 5000, currentBalance: 5000, notes: "Emergency fund for unexpected expenses", isArchived: false },
  { id: "sav_2", name: "Electric Fund", startingBalance: 300, currentBalance: 300, notes: "Fund for electricity and utility bills", isArchived: false },
  { id: "sav_3", name: "TFSA", startingBalance: 10000, currentBalance: 10000, notes: "Tax-Free Savings Account", isArchived: false },
  { id: "sav_4", name: "DR Fund", startingBalance: 1500, currentBalance: 1500, notes: "Debt Reduction / Emergency Reserve Fund", isArchived: false },
  { id: "sav_5", name: "Play Fund", startingBalance: 800, currentBalance: 800, notes: "Fun and entertainment savings", isArchived: false },
  { id: "sav_6", name: "RG RRSP", startingBalance: 5000, currentBalance: 5000, notes: "RG RRSP long-term retirement savings", isArchived: false }
];

const defaultSavingsHistory: SavingsHistoryEntry[] = [
  { id: "sh_1", date: "2026-06-01", accountId: "sav_1", accountName: "Emergency Fund", previousBalance: 4000, newBalance: 5000, amountChanged: 1000 },
  { id: "sh_2", date: "2026-06-15", accountId: "sav_3", accountName: "TFSA", previousBalance: 9500, newBalance: 10000, amountChanged: 500 }
];

const defaultDebtHistory: DebtHistoryEntry[] = [
  { id: "dh_1", date: "2026-04-15", accountId: "acc_1", accountName: "RG Visa Select", previousBalance: 5500, newBalance: 4772, amountReduced: 728 },
  { id: "dh_2", date: "2026-04-30", accountId: "acc_2", accountName: "SG CIBC", previousBalance: 6200, newBalance: 5446, amountReduced: 754 },
  { id: "dh_3", date: "2026-05-15", accountId: "acc_3", accountName: "SG Line of Credit", previousBalance: 13500, newBalance: 12618, amountReduced: 882 },
  { id: "dh_4", date: "2026-05-30", accountId: "acc_4", accountName: "RG Line of Credit", previousBalance: 8200, newBalance: 7655.39, amountReduced: 544.61 },
  { id: "dh_5", date: "2026-06-10", accountId: "acc_5", accountName: "RG PC Mastercard", previousBalance: 2000, newBalance: 1182, amountReduced: 818 },
  { id: "dh_6", date: "2026-06-15", accountId: "acc_9", accountName: "RG Car", previousBalance: 33000, newBalance: 32000, amountReduced: 1000 },
  { id: "dh_7", date: "2026-06-15", accountId: "acc_10", accountName: "SG Car", previousBalance: 39000, newBalance: 38000, amountReduced: 1000 },
  { id: "dh_8", date: "2026-06-20", accountId: "acc_11", accountName: "Mortgage", previousBalance: 319081.21, newBalance: 318081.21, amountReduced: 1000 }
];

export default function ScheduleWorkspace() {
  const [payments, setPayments] = useState<PaymentItem[]>(() => {
    const saved = localStorage.getItem("forlife_payments_v1");
    let current: PaymentItem[];
    if (saved) {
      try {
        current = JSON.parse(saved);
      } catch (e) {
        current = [...defaultPayments];
      }
    } else {
      current = [...defaultPayments];
    }

    // Migration for "Insurance" split
    const hasOldInsurance = current.some((p) => p.name.toLowerCase() === "insurance");
    if (hasOldInsurance) {
      current = current.filter((p) => p.name.toLowerCase() !== "insurance");
    }

    // Ensure House Insurance exists
    const hasHouseInsurance = current.some((p) => p.name.toLowerCase() === "house insurance");
    if (!hasHouseInsurance) {
      current.push({ id: "3", name: "House Insurance", amount: 100, paid: false });
    }

    // Ensure Car Insurance exists
    const hasCarInsurance = current.some((p) => p.name.toLowerCase() === "car insurance");
    if (!hasCarInsurance) {
      current.push({ id: "21", name: "Car Insurance", amount: 100, paid: false });
    }

    // Ensure Internet exists
    const hasInternet = current.some((p) => p.name.toLowerCase() === "internet");
    if (!hasInternet) {
      const maxId = current.reduce((max: number, p: any) => {
        const num = parseInt(p.id, 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0);
      current.push({ id: String(maxId + 1), name: "Internet", amount: 80, paid: false });
    }

    return current;
  });

  const [rhonPay, setRhonPay] = useState<number>(() => Number(localStorage.getItem("forlife_rhon_pay")) || 0);
  const [suzPay, setSuzPay] = useState<number>(() => Number(localStorage.getItem("forlife_suz_pay")) || 0);

  // DEBT TRACKER STATES
  const [debtAccounts, setDebtAccounts] = useState<DebtAccount[]>(() => {
    const saved = localStorage.getItem("forlife_debt_accounts_v2");
    if (saved) return JSON.parse(saved);
    return defaultDebtAccounts;
  });

  const [debtHistory, setDebtHistory] = useState<DebtHistoryEntry[]>(() => {
    const saved = localStorage.getItem("forlife_debt_history_v2");
    if (saved) return JSON.parse(saved);
    return defaultDebtHistory;
  });

  // SAVINGS TRACKER STATES
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>(() => {
    const saved = localStorage.getItem("forlife_savings_accounts_v1");
    let current: SavingsAccount[] = [];
    if (saved) {
      try {
        current = JSON.parse(saved);
      } catch (e) {
        current = [...defaultSavingsAccounts];
      }
    } else {
      current = [...defaultSavingsAccounts];
    }
    
    // Clean up any duplicate RRSP accounts or incorrect names
    let rrspAccounts = current.filter(a => 
      a.name.toLowerCase().includes("rrsp") || 
      a.name.toLowerCase().includes("ronda") || 
      a.name.toLowerCase().includes("rhonda")
    );

    let otherAccounts = current.filter(a => 
      !a.name.toLowerCase().includes("rrsp") && 
      !a.name.toLowerCase().includes("ronda") && 
      !a.name.toLowerCase().includes("rhonda")
    );

    let rrspAccount: SavingsAccount;
    if (rrspAccounts.length > 0) {
      const preferred = rrspAccounts.find(a => a.id === "sav_6") || rrspAccounts[0];
      rrspAccount = {
        ...preferred,
        id: "sav_6",
        name: "RG RRSP",
        notes: "RG RRSP long-term retirement savings",
      };
    } else {
      rrspAccount = {
        id: "sav_6",
        name: "RG RRSP",
        startingBalance: 5000,
        currentBalance: 5000,
        notes: "RG RRSP long-term retirement savings",
        isArchived: false
      };
    }

    let merged = [...otherAccounts, rrspAccount];

    // Self-healing: ensure all other default savings accounts exist in the current list
    defaultSavingsAccounts.forEach(defAcc => {
      if (defAcc.id === "sav_6") return; // Already handled
      const exists = merged.some(a => a.name.toLowerCase() === defAcc.name.toLowerCase() || a.id === defAcc.id);
      if (!exists) {
        merged.push(defAcc);
      }
    });

    return merged;
  });

  const [savingsHistory, setSavingsHistory] = useState<SavingsHistoryEntry[]>(() => {
    const saved = localStorage.getItem("forlife_savings_history_v1");
    if (saved) return JSON.parse(saved);
    return defaultSavingsHistory;
  });

  const [trackerTab, setTrackerTab] = useState<"debt" | "savings">("debt");

  const [biweeklyAnchorDate, setBiweeklyAnchorDate] = useState<string>(() => {
    return localStorage.getItem("forlife_biweekly_anchor_date") || "2026-06-24";
  });

  useEffect(() => {
    localStorage.setItem("forlife_biweekly_anchor_date", biweeklyAnchorDate);
  }, [biweeklyAnchorDate]);

  // UI STATES FOR DEBT TRACKER
  const [paydaySuccessSummary, setPaydaySuccessSummary] = useState<{
    periodReduction: number;
    yearReduction: number;
    totalReduction: number;
    percentageReduction: number;
    newTotalDebt: number;
    unlockedMilestones: string[];
  } | null>(null);

  // ACCOUNT FORM STATE (For Create/Edit)
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [formAccountType, setFormAccountType] = useState<"debt" | "savings">("debt");
  const [accountForm, setAccountForm] = useState({
    name: "",
    category: "Credit Card" as DebtAccount["category"],
    creditLimit: "",
    currentBalance: "",
    startingBalance: "",
    interestRate: "",
    biweeklyPayment: "",
    notes: "",
    updateDate: new Date().toISOString().split("T")[0]
  });

  // HISTORY FILTERS
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  const [showArchivedDebts, setShowArchivedDebts] = useState(false);

  // Timezone-safe local date string helper
  const getLocalDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split("T")[0];
  };

  const parseDateString = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getDaysBetween = (dateStrA: string, dateStrB: string) => {
    const dateA = parseDateString(dateStrA);
    const dateB = parseDateString(dateStrB);
    const diffTime = Math.abs(dateB.getTime() - dateA.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const triggerDelete = (onDelete: () => void, onUndo: () => void, message: string = "Item deleted") => {
    const event = new CustomEvent("trigger-delete-confirm", {
      detail: { onDelete, onUndo, message }
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    localStorage.setItem("forlife_payments_v1", JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem("forlife_rhon_pay", rhonPay.toString());
    localStorage.setItem("forlife_suz_pay", suzPay.toString());
  }, [rhonPay, suzPay]);

  // Sync Debt state with LocalStorage
  useEffect(() => {
    localStorage.setItem("forlife_debt_accounts_v2", JSON.stringify(debtAccounts));
  }, [debtAccounts]);

  useEffect(() => {
    localStorage.setItem("forlife_debt_history_v2", JSON.stringify(debtHistory));
  }, [debtHistory]);

  // Sync Savings state with LocalStorage
  useEffect(() => {
    localStorage.setItem("forlife_savings_accounts_v1", JSON.stringify(savingsAccounts));
  }, [savingsAccounts]);

  useEffect(() => {
    localStorage.setItem("forlife_savings_history_v1", JSON.stringify(savingsHistory));
  }, [savingsHistory]);

  // Run Automatic Debt Reductions on Mount
  useEffect(() => {
    const todayStr = getLocalDateString();
    let updated = false;
    let newLogs: DebtHistoryEntry[] = [];

    const nextAccounts = debtAccounts.map(acc => {
      let lastAuto = acc.lastAutoProcessed;
      
      // Initialize defaults if not set
      if (!lastAuto) {
        if (acc.name === "RG Car") lastAuto = "2026-06-15";
        else if (acc.name === "SG Car") lastAuto = "2026-06-15";
        else if (acc.name === "Mortgage") lastAuto = "2026-06-01";
      }

      if (!lastAuto) return acc;

      if (acc.name === "RG Car") {
        const days = getDaysBetween(lastAuto, todayStr);
        if (days >= 14) {
          updated = true;
          const prevBal = acc.currentBalance;
          const newBal = Math.max(0, prevBal - 214);
          const amountReduced = Math.round((prevBal - newBal) * 100) / 100;
          
          if (amountReduced > 0) {
            newLogs.push({
              id: "dh_auto_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
              date: todayStr,
              accountId: acc.id,
              accountName: acc.name,
              previousBalance: prevBal,
              newBalance: newBal,
              amountReduced: amountReduced
            });
          }

          return {
            ...acc,
            currentBalance: newBal,
            lastAutoProcessed: todayStr
          };
        }
      } else if (acc.name === "SG Car") {
        const days = getDaysBetween(lastAuto, todayStr);
        if (days >= 14) {
          updated = true;
          const prevBal = acc.currentBalance;
          const newBal = Math.max(0, prevBal - 245);
          const amountReduced = Math.round((prevBal - newBal) * 100) / 100;

          if (amountReduced > 0) {
            newLogs.push({
              id: "dh_auto_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
              date: todayStr,
              accountId: acc.id,
              accountName: acc.name,
              previousBalance: prevBal,
              newBalance: newBal,
              amountReduced: amountReduced
            });
          }

          return {
            ...acc,
            currentBalance: newBal,
            lastAutoProcessed: todayStr
          };
        }
      } else if (acc.name === "Mortgage") {
        const lastDateObj = parseDateString(lastAuto);
        const currentDateObj = parseDateString(todayStr);
        const isNewMonth = currentDateObj.getFullYear() > lastDateObj.getFullYear() || 
                           (currentDateObj.getFullYear() === lastDateObj.getFullYear() && currentDateObj.getMonth() > lastDateObj.getMonth());
        
        if (isNewMonth) {
          updated = true;
          const prevBal = acc.currentBalance;
          const newBal = Math.max(0, prevBal - 1672.36);
          const amountReduced = Math.round((prevBal - newBal) * 100) / 100;

          if (amountReduced > 0) {
            newLogs.push({
              id: "dh_auto_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
              date: todayStr,
              accountId: acc.id,
              accountName: acc.name,
              previousBalance: prevBal,
              newBalance: newBal,
              amountReduced: amountReduced
            });
          }

          return {
            ...acc,
            currentBalance: newBal,
            lastAutoProcessed: todayStr
          };
        }
      }

      // If lastAuto was not set but now initialized
      if (lastAuto !== acc.lastAutoProcessed) {
        return {
          ...acc,
          lastAutoProcessed: lastAuto
        };
      }

      return acc;
    });

    if (updated) {
      if (newLogs.length > 0) {
        setDebtHistory(prev => [...newLogs, ...prev]);
      }
      setDebtAccounts(nextAccounts);
    } else if (nextAccounts.some((acc, idx) => acc.lastAutoProcessed !== debtAccounts[idx].lastAutoProcessed)) {
      setDebtAccounts(nextAccounts);
    }
  }, []);

  const getPaymentDueDate = (paymentId: string, index: number) => {
    if (!biweeklyAnchorDate) return "";
    try {
      const anchor = new Date(biweeklyAnchorDate + "T12:00:00");
      // Cycle is biweekly (14 days), offset of each specific item spreads them nicely across 0-13 days relative to the anchor
      const offset = index % 14;
      const dueDate = new Date(anchor.getTime());
      dueDate.setDate(dueDate.getDate() + offset);
      return dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch (e) {
      return "";
    }
  };

  const togglePayment = (id: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, paid: !p.paid } : p))
    );
  };

  const toggleNA = (id: string) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextNA = !p.na;
          return { 
            ...p, 
            na: nextNA,
            paid: nextNA ? false : p.paid 
          };
        }
        return p;
      })
    );
  };

  const resetCurrentCycle = () => {
    setPayments((prev) =>
      prev.map((p) => ({ ...p, paid: false, na: false }))
    );
  };

  const advanceToNextCycle = () => {
    if (biweeklyAnchorDate) {
      try {
        const currentAnchor = new Date(biweeklyAnchorDate + "T12:00:00");
        currentAnchor.setDate(currentAnchor.getDate() + 14);
        const yyyy = currentAnchor.getFullYear();
        const mm = String(currentAnchor.getMonth() + 1).padStart(2, "0");
        const dd = String(currentAnchor.getDate()).padStart(2, "0");
        setBiweeklyAnchorDate(`${yyyy}-${mm}-${dd}`);
      } catch (e) {
        console.error("Error advancing cycle date:", e);
      }
    }
    setPayments((prev) =>
      prev.map((p) => ({ ...p, paid: false, na: false }))
    );
  };

  const calculateTotals = () => {
    const activePayments = payments.filter((p) => !p.na);
    const totalScheduled = activePayments.reduce((sum, p) => sum + p.amount, 0);
    const totalCompleted = activePayments.filter((p) => p.paid).reduce((sum, p) => sum + p.amount, 0);
    const totalRemaining = totalScheduled - totalCompleted;

    const totalIncome = rhonPay + suzPay;
    const remainingMoney = totalIncome - totalScheduled;

    return {
      totalScheduled,
      totalCompleted,
      totalRemaining,
      totalIncome,
      remainingMoney
    };
  };

  const totals = calculateTotals();

  const getGroupedItems = <T extends { name: string }>(items: T[]) => {
    const rg: T[] = [];
    const sg: T[] = [];
    const other: T[] = [];

    items.forEach((item) => {
      const owner = getAccountOwner(item.name);
      if (owner === "RG") {
        rg.push(item);
      } else if (owner === "SG") {
        sg.push(item);
      } else {
        other.push(item);
      }
    });

    return { rg, sg, other };
  };

  // ==========================================
  // DEBT TRACKER CALCULATIONS
  // ==========================================
  const activeDebts = debtAccounts;
  
  // 1. Total Remaining Debt
  const totalRemainingDebt = activeDebts.reduce((sum, a) => sum + a.currentBalance, 0);

  // 2. Total Available Credit (Limit - Balance for CC and LOC)
  const totalAvailableCredit = activeDebts
    .filter(a => a.category === "Credit Card" || a.category === "Line of Credit")
    .reduce((sum, a) => {
      const avail = a.creditLimit - a.currentBalance;
      return sum + (avail > 0 ? avail : 0);
    }, 0);

  // 3. Total Biweekly Debt Payments
  const totalBiweeklyDebtPayments = activeDebts.reduce((sum, a) => sum + a.biweeklyPayment, 0);

  // 4. Estimated Interest Per Pay Period
  // Est. Monthly Interest = Balance * (InterestRate / 100) / 12
  // Biweekly = Annual / 26
  const totalEstBiweeklyInterest = activeDebts.reduce((sum, a) => {
    const annualInterest = a.currentBalance * (a.interestRate / 100);
    return sum + (annualInterest / 26);
  }, 0);

  // 5. Total Debt Paid Off Since Tracking Began
  // Sum of (StartingBalance - CurrentBalance)
  const totalStartingDebt = debtAccounts.reduce((sum, a) => sum + a.startingBalance, 0);
  const totalCurrentDebtAll = debtAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalDebtPaidOffSinceBegan = Math.max(0, totalStartingDebt - totalCurrentDebtAll);
  const pctOverallReduction = totalStartingDebt > 0 ? (totalDebtPaidOffSinceBegan / totalStartingDebt) * 100 : 0;

  // 6. Debt Paid Off This Year (using 2026 as reference of the log dates, or current year)
  const currentYear = new Date().getFullYear().toString();
  const debtPaidThisYear = debtHistory
    .filter(h => h.date.startsWith(currentYear))
    .reduce((sum, h) => sum + h.amountReduced, 0);

  // 7. Debt Paid Off This Pay Period (reductions on the latest date logged)
  const getLatestPaydayReduction = () => {
    if (debtHistory.length === 0) return 0;
    const sorted = [...debtHistory].sort((a, b) => b.date.localeCompare(a.date));
    const latestDate = sorted[0].date;
    return debtHistory
      .filter(h => h.date === latestDate)
      .reduce((sum, h) => sum + h.amountReduced, 0);
  };
  const debtPaidThisPayPeriod = getLatestPaydayReduction();

  // Largest Debt Reduction Achievement
  const largestReductionLog = debtHistory.length > 0
    ? [...debtHistory].sort((a, b) => b.amountReduced - a.amountReduced)[0]
    : null;

  // ==========================================
  // SAVINGS TRACKER CALCULATIONS (REVISED)
  // ==========================================
  const activeSavings = savingsAccounts.filter(a => !a.isArchived);
  
  // Total usable current savings balance (subtracts $2,500 from TFSA if active)
  const totalCurrentSavings = activeSavings.reduce((sum, a) => {
    if (a.name.toLowerCase() === "tfsa") {
      return sum + Math.max(0, a.currentBalance - 2500);
    }
    return sum + a.currentBalance;
  }, 0);

  // TFSA specifics
  const tfsaAccount = activeSavings.find(a => a.name.toLowerCase() === "tfsa");
  const tfsaTotal = tfsaAccount ? tfsaAccount.currentBalance : 0;
  const tfsaReserved = 2500;
  const tfsaAvailable = Math.max(0, tfsaTotal - tfsaReserved);

  // TFSA Long-Term Goal
  const tfsaGoalTarget = 25000;
  const tfsaGoalProgressPct = Math.min(100, (tfsaAvailable / tfsaGoalTarget) * 100);

  const getTfsaTimeRemaining = () => {
    const targetDate = new Date(2036, 5, 30); // June 30, 2036
    const today = new Date();
    
    let years = targetDate.getFullYear() - today.getFullYear();
    let months = targetDate.getMonth() - today.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years < 0) {
      return "Goal deadline passed";
    }
    
    if (years === 0) {
      return `${months} month${months !== 1 ? "s" : ""} remaining`;
    }
    
    return `${years} yr${years !== 1 ? "s" : ""}, ${months} mo${months !== 1 ? "s" : ""} remaining`;
  };

  // DR Fund specifics (Target $1,500, Deadline January)
  const drAccount = activeSavings.find(a => a.name.toLowerCase() === "dr fund" || a.name.toLowerCase().includes("dr"));
  const drBalance = drAccount ? drAccount.currentBalance : 0;
  const drTarget = 1500;
  const drProgressPct = drTarget > 0 ? (drBalance / drTarget) * 100 : 0;

  // RG RRSP specifics (Target $60,000, Target Date 2040)
  const rrspAccount = activeSavings.find(a => a.name.toLowerCase().includes("rrsp") || a.name.toLowerCase().includes("ronda") || a.name.toLowerCase().includes("rhonda"));
  const rrspBalance = rrspAccount ? rrspAccount.currentBalance : 0;
  const rrspGoalTarget = 60000;
  const rrspGoalProgressPct = Math.min(100, (rrspBalance / rrspGoalTarget) * 100);

  const getRrspTimeRemaining = () => {
    const targetDate = new Date(2040, 11, 31); // Dec 31, 2040
    const today = new Date();
    
    let years = targetDate.getFullYear() - today.getFullYear();
    let months = targetDate.getMonth() - today.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years < 0) {
      return "Goal deadline passed";
    }
    
    if (years === 0) {
      return `${months} month${months !== 1 ? "s" : ""} remaining`;
    }
    
    return `${years} yr${years !== 1 ? "s" : ""}, ${months} mo${months !== 1 ? "s" : ""} remaining`;
  };

  // ==========================================
  // MILESTONE TRACKING
  // ==========================================
  const milestones = [
    { id: "m1", label: "First $1,000 Paid Off", target: 1000, type: "amount" },
    { id: "m2", label: "First $5,000 Paid Off", target: 5000, type: "amount" },
    { id: "m3", label: "First $10,000 Paid Off", target: 10000, type: "amount" },
    { id: "m4", label: "25% of Debt Eliminated", target: 25, type: "percentage" },
    { id: "m5", label: "50% of Debt Eliminated", target: 50, type: "percentage" },
    { id: "m6", label: "75% of Debt Eliminated", target: 75, type: "percentage" }
  ];

  const checkMilestoneStatus = (milestone: typeof milestones[0]) => {
    if (milestone.type === "amount") {
      return {
        achieved: totalDebtPaidOffSinceBegan >= milestone.target,
        progress: `${Math.round((totalDebtPaidOffSinceBegan / milestone.target) * 100)}%`,
        text: `$${totalDebtPaidOffSinceBegan.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / $${milestone.target.toLocaleString()}`
      };
    } else {
      return {
        achieved: pctOverallReduction >= milestone.target,
        progress: `${Math.round((pctOverallReduction / milestone.target) * 100)}%`,
        text: `${pctOverallReduction.toFixed(1)}% / ${milestone.target}%`
      };
    }
  };

  // ==========================================
  // TIMELINE CHART DATA
  // ==========================================
  const getTimelineData = () => {
    const dataPoints: { date: string; balance: number; reduction: number }[] = [];
    
    // Sum of starting balances
    const startBal = totalStartingDebt;
    dataPoints.push({
      date: "Start",
      balance: Math.round(startBal),
      reduction: 0
    });

    // Group history entries by date ascending
    const sortedHistory = [...debtHistory].sort((a, b) => a.date.localeCompare(b.date));
    const grouped: Record<string, number> = {};
    sortedHistory.forEach(h => {
      grouped[h.date] = (grouped[h.date] || 0) + h.amountReduced;
    });

    const uniqueDates = Object.keys(grouped).sort();
    let rollingBal = startBal;

    uniqueDates.forEach(date => {
      rollingBal -= grouped[date];
      dataPoints.push({
        date: date.substring(5), // Simplify format to MM-DD
        balance: Math.round(rollingBal),
        reduction: Math.round(startBal - rollingBal)
      });
    });

    return dataPoints;
  };

  // ==========================================
  // CREATE & EDIT ACCOUNT HANDLERS
  // ==========================================
  const handleOpenCreateAccount = (type: "debt" | "savings" = "debt") => {
    setEditingAccountId(null);
    setFormAccountType(type);
    setAccountForm({
      name: "",
      category: "Credit Card",
      creditLimit: "",
      currentBalance: "",
      startingBalance: "",
      interestRate: "",
      biweeklyPayment: "",
      notes: "",
      updateDate: getLocalDateString()
    });
    setIsAccountFormOpen(true);
  };

  const handleOpenEditAccount = (id: string) => {
    setEditingAccountId(id);
    if (id.startsWith("sav_")) {
      const acc = savingsAccounts.find(a => a.id === id);
      if (!acc) return;
      setFormAccountType("savings");
      setAccountForm({
        name: acc.name,
        category: "Other",
        creditLimit: "0",
        currentBalance: String(acc.currentBalance),
        startingBalance: String(acc.startingBalance !== undefined ? acc.startingBalance : acc.currentBalance),
        interestRate: "0",
        biweeklyPayment: "0",
        notes: acc.notes,
        updateDate: acc.lastUpdated || getLocalDateString()
      });
    } else {
      const acc = debtAccounts.find(a => a.id === id);
      if (!acc) return;
      setFormAccountType("debt");
      setAccountForm({
        name: acc.name,
        category: acc.category,
        creditLimit: String(acc.creditLimit),
        currentBalance: String(acc.currentBalance),
        startingBalance: String(acc.startingBalance),
        interestRate: String(acc.interestRate),
        biweeklyPayment: String(acc.biweeklyPayment),
        notes: acc.notes,
        updateDate: getLocalDateString()
      });
    }
    setIsAccountFormOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(accountForm.creditLimit) || 0;
    const balance = parseFloat(accountForm.currentBalance) || 0;
    const startingBalanceValue = parseFloat(accountForm.startingBalance) || 0;
    const rate = parseFloat(accountForm.interestRate) || 0;
    const biweekly = parseFloat(accountForm.biweeklyPayment) || 0;
    const updateDate = accountForm.updateDate || getLocalDateString();

    if (formAccountType === "debt") {
      if (editingAccountId) {
        // Editing debt
        const originalAccount = debtAccounts.find(a => a.id === editingAccountId);
        if (!originalAccount) return;

        const balDiff = originalAccount.currentBalance - balance;
        const startBalDiff = startingBalanceValue - originalAccount.startingBalance;

        let updatedAccounts = debtAccounts.map(a => {
          if (a.id === editingAccountId) {
            return {
              ...a,
              name: accountForm.name,
              category: accountForm.category,
              creditLimit: limit,
              currentBalance: balance,
              startingBalance: startingBalanceValue,
              interestRate: rate,
              biweeklyPayment: biweekly,
              notes: accountForm.notes
            };
          }
          return a;
        });

        let updatedHistory = [...debtHistory];
        let newlyUnlocked: string[] = [];

        if (balDiff !== 0) {
          const logId = "dh_man_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
          const newLogEntry: DebtHistoryEntry = {
            id: logId,
            date: updateDate,
            accountId: originalAccount.id,
            accountName: accountForm.name,
            previousBalance: originalAccount.currentBalance,
            newBalance: balance,
            amountReduced: Math.round(balDiff * 100) / 100
          };
          updatedHistory.push(newLogEntry);

          // Calculate milestone status & achievements
          const previousPaidOff = Math.max(0, totalStartingDebt - totalCurrentDebtAll);
          const newPaidOff = previousPaidOff + balDiff;
          const previousPct = totalStartingDebt > 0 ? (previousPaidOff / totalStartingDebt) * 100 : 0;
          const newPct = totalStartingDebt > 0 ? (newPaidOff / totalStartingDebt) * 100 : 0;

          milestones.forEach(m => {
            if (m.type === "amount") {
              const wasUnlocked = previousPaidOff >= m.target;
              const isUnlockedNow = newPaidOff >= m.target;
              if (isUnlockedNow && !wasUnlocked) newlyUnlocked.push(m.label);
            } else {
              const wasUnlocked = previousPct >= m.target;
              const isUnlockedNow = newPct >= m.target;
              if (isUnlockedNow && !wasUnlocked) newlyUnlocked.push(m.label);
            }
          });

          const currentYearStr = new Date().getFullYear().toString();
          const yearReduction = updatedHistory
            .filter(h => h.date.startsWith(currentYearStr))
            .reduce((sum, h) => sum + h.amountReduced, 0);

          setPaydaySuccessSummary({
            periodReduction: Math.round(balDiff * 100) / 100,
            yearReduction: Math.round(yearReduction * 100) / 100,
            totalReduction: Math.round(newPaidOff * 100) / 100,
            percentageReduction: Math.round(newPct * 10) / 10,
            newTotalDebt: Math.round(updatedAccounts.reduce((sum, a) => sum + (a.isArchived ? 0 : a.currentBalance), 0) * 100) / 100,
            unlockedMilestones: newlyUnlocked
          });
        }

        if (startBalDiff !== 0) {
          const logId = "dh_start_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
          const newLogEntry: DebtHistoryEntry = {
            id: logId,
            date: updateDate,
            accountId: originalAccount.id,
            accountName: accountForm.name + " (Starting Balance Adjustment)",
            previousBalance: originalAccount.startingBalance,
            newBalance: startingBalanceValue,
            amountReduced: -startBalDiff
          };
          updatedHistory.push(newLogEntry);
        }

        setDebtAccounts(updatedAccounts);
        setDebtHistory(updatedHistory);
      } else {
        // Creating debt
        const newAccId = "acc_" + Date.now();
        const newAccount: DebtAccount = {
          id: newAccId,
          name: accountForm.name,
          category: accountForm.category,
          creditLimit: limit,
          currentBalance: balance,
          startingBalance: startingBalanceValue || balance,
          interestRate: rate,
          biweeklyPayment: biweekly,
          notes: accountForm.notes,
          isArchived: false
        };
        setDebtAccounts(prev => [...prev, newAccount]);
      }
    } else {
      // Savings account logic (simple operational bucket balance update)
      if (editingAccountId) {
        // Editing savings
        const originalAccount = savingsAccounts.find(a => a.id === editingAccountId);
        if (!originalAccount) return;

        let updatedAccounts = savingsAccounts.map(a => {
          if (a.id === editingAccountId) {
            return {
              ...a,
              name: accountForm.name,
              startingBalance: startingBalanceValue,
              currentBalance: balance,
              notes: accountForm.notes,
              lastUpdated: updateDate
            };
          }
          return a;
        });

        setSavingsAccounts(updatedAccounts);
      } else {
        // Creating savings
        const newAccId = "sav_" + Date.now();
        const newAccount: SavingsAccount = {
          id: newAccId,
          name: accountForm.name,
          startingBalance: startingBalanceValue || balance,
          currentBalance: balance,
          notes: accountForm.notes,
          isArchived: false,
          lastUpdated: updateDate
        };
        setSavingsAccounts(prev => [...prev, newAccount]);
      }
    }

    setIsAccountFormOpen(false);
  };

  const handleToggleDebtCompleted = (id: string) => {
    setDebtAccounts(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, completed: !a.completed };
      }
      return a;
    }));
  };

  const handleArchiveAccount = (id: string) => {
    if (id.startsWith("sav_")) {
      setSavingsAccounts(prev => prev.map(a => {
        if (a.id === id) {
          return { ...a, isArchived: !a.isArchived };
        }
        return a;
      }));
    } else {
      setDebtAccounts(prev => prev.map(a => {
        if (a.id === id) {
          return { ...a, isArchived: !a.isArchived };
        }
        return a;
      }));
    }
  };

  const handleDeleteAccount = (id: string) => {
    if (id.startsWith("sav_")) {
      const originalAccounts = [...savingsAccounts];
      const originalHistory = [...savingsHistory];
      triggerDelete(
        () => {
          setSavingsAccounts(prev => prev.filter(a => a.id !== id));
          setSavingsHistory(prev => prev.filter(h => h.accountId !== id));
        },
        () => {
          setSavingsAccounts(originalAccounts);
          setSavingsHistory(originalHistory);
        },
        "Savings account deleted"
      );
    } else {
      const originalAccounts = [...debtAccounts];
      const originalHistory = [...debtHistory];
      triggerDelete(
        () => {
          setDebtAccounts(prev => prev.filter(a => a.id !== id));
          setDebtHistory(prev => prev.filter(h => h.accountId !== id));
        },
        () => {
          setDebtAccounts(originalAccounts);
          setDebtHistory(originalHistory);
        },
        "Debt account deleted"
      );
    }
  };

  const handleDeleteHistoryLog = (id: string) => {
    if (id.startsWith("sh_")) {
      const originalHistory = [...savingsHistory];
      triggerDelete(
        () => {
          setSavingsHistory(prev => prev.filter(h => h.id !== id));
        },
        () => {
          setSavingsHistory(originalHistory);
        },
        "Savings history log entry deleted"
      );
    } else {
      const originalHistory = [...debtHistory];
      triggerDelete(
        () => {
          setDebtHistory(prev => prev.filter(h => h.id !== id));
        },
        () => {
          setDebtHistory(originalHistory);
        },
        "Debt history log entry deleted"
      );
    }
  };

  // ==========================================
  // FILTERS FOR LOGS
  // ==========================================
  const filteredHistoryLogs = debtHistory.filter(h => {
    const matchesAccount = filterAccount === "all" || h.accountId === filterAccount;
    const matchesMonth = filterMonth === "all" || h.date.split("-")[1] === filterMonth;
    const matchesYear = filterYear === "all" || h.date.startsWith(filterYear);
    return matchesAccount && matchesMonth && matchesYear;
  }).sort((a, b) => b.date.localeCompare(a.date));

  // Extract unique years from logs for filter dropdown
  const uniqueYears = Array.from(new Set(debtHistory.map(h => h.date.split("-")[0]))).sort();

  const renderAccountRow = (acc: DebtAccount) => {
    const isCcOrLoc = acc.category === "Credit Card" || acc.category === "Line of Credit";
    const avail = acc.creditLimit - acc.currentBalance;
    const utilizationPct = acc.creditLimit > 0 ? (acc.currentBalance / acc.creditLimit) * 100 : 0;
    const progress = acc.startingBalance > 0 ? ((acc.startingBalance - acc.currentBalance) / acc.startingBalance) * 100 : 100;
    const monthlyInterestEst = (acc.currentBalance * (acc.interestRate / 100)) / 12;

    return (
      <tr key={acc.id} className={`hover:bg-slate-50/50 transition duration-150 ${acc.completed ? "bg-stone-50/60 opacity-50 grayscale-[40%]" : ""}`}>
        <td className="p-3">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <span className={acc.completed ? "line-through text-slate-500" : ""}>{acc.name}</span>
            {acc.completed && (
              <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-emerald-200">
                Completed
              </span>
            )}
          </div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase mt-0.5">
            {acc.category} {acc.notes ? `• ${acc.notes}` : ""}
          </div>
        </td>
        <td className="p-3 text-right font-semibold text-slate-700">
          ${acc.creditLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td className="p-3 text-right font-semibold text-slate-400">
          ${acc.startingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td className={`p-3 text-right font-bold ${acc.currentBalance > 0 ? "text-slate-900" : "text-emerald-600"}`}>
          ${acc.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td className="p-3 text-center font-bold text-slate-600">
          {acc.interestRate}%
          <div className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">Est. ${monthlyInterestEst.toFixed(2)}/mo</div>
        </td>
        <td className="p-3 text-right font-bold text-slate-700">
          ${acc.biweeklyPayment.toLocaleString()}
          <div className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">Biweekly</div>
        </td>
        <td className="p-3 min-w-[140px]">
          {isCcOrLoc ? (
            <div>
              <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5">
                <span>Utilization</span>
                <span>{utilizationPct.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full ${utilizationPct > 80 ? "bg-red-500" : utilizationPct > 50 ? "bg-amber-500" : "bg-emerald-500"}`} 
                  style={{ width: `${Math.min(100, utilizationPct)}%` }}
                />
              </div>
              <div className="text-[9px] text-slate-400 font-bold mt-0.5">
                Avail: ${Math.max(0, avail).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5">
                <span>Paid Off Progress</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-cyan-500" 
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <div className="text-[9px] text-slate-400 font-bold mt-0.5">
                Remaining to go
              </div>
            </div>
          )}
        </td>
        <td className="p-3">
          <div className="flex gap-1.5 justify-center">
            <button
              onClick={() => handleOpenEditAccount(acc.id)}
              disabled={acc.completed}
              className={`p-1 rounded text-slate-400 transition ${acc.completed ? "opacity-30 cursor-not-allowed" : "hover:bg-stone-150 hover:text-slate-800"}`}
              title="Edit account details"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleToggleDebtCompleted(acc.id)}
              className={`p-1 rounded transition ${acc.completed ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-250" : "hover:bg-stone-150 text-slate-400 hover:text-emerald-600"}`}
              title={acc.completed ? "Mark as Active" : "Mark as Completed for current cycle"}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteAccount(acc.id)}
              className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition"
              title="Permanently Delete account"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const renderPaymentRow = (payment: PaymentItem) => {
    const isNA = !!payment.na;
    const paymentIndex = payments.indexOf(payment);
    return (
      <div 
        key={payment.id} 
        id={`pay_item_${payment.id}`}
        className={`flex justify-between items-center p-3 rounded-xl border transition duration-150 ${
          isNA
            ? "bg-stone-50 border-stone-200/60 opacity-45 text-slate-400"
            : payment.paid 
              ? "bg-slate-50 border-slate-200 opacity-60" 
              : "bg-white border-stone-200 shadow-3xs"
        }`}
      >
        <div className="flex flex-col gap-1 w-full max-w-[200px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`font-bold ${
              isNA
                ? "text-slate-400 line-through text-xs"
                : payment.paid 
                  ? "text-slate-500 line-through text-xs" 
                  : "text-slate-850 text-xs"
            }`}>
              {payment.name}
            </span>
            {isNA && (
              <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md font-mono shrink-0">
                N/A
              </span>
            )}
            <span className="text-[9px] font-black uppercase text-cyan-700 bg-cyan-50 border border-cyan-100/60 px-1.5 py-0.5 rounded-md font-mono shrink-0">
              {getPaymentDueDate(payment.id, paymentIndex)}
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">$</span>
            <input
              type="number"
              value={payment.amount === 0 ? "" : payment.amount}
              onChange={(e) => {
                const newAmount = Number(e.target.value) || 0;
                setPayments((prev) =>
                  prev.map((p) => (p.id === payment.id ? { ...p, amount: newAmount } : p))
                );
              }}
              disabled={payment.paid || isNA}
              className={`w-full pl-6 pr-2 py-1 text-xs font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                isNA
                  ? "bg-transparent text-slate-400"
                  : payment.paid 
                    ? "bg-transparent text-slate-500" 
                    : "bg-stone-50 border border-stone-200 text-slate-800"
              }`}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2.5 shrink-0">
          {/* NA Button Option */}
          <button
            type="button"
            onClick={() => toggleNA(payment.id)}
            className={`px-2 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider border transition cursor-pointer ${
              isNA
                ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                : "bg-stone-50 border-stone-200 text-slate-500 hover:bg-stone-100"
            }`}
            title={isNA ? "Mark as Active" : "Mark as N/A"}
          >
            {isNA ? "N/A" : "Active"}
          </button>

          {/* Paid Toggle Button */}
          <button
            type="button"
            onClick={() => !isNA && togglePayment(payment.id)}
            disabled={isNA}
            className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer shrink-0 ${
              isNA
                ? "bg-stone-200 opacity-45 cursor-not-allowed"
                : payment.paid 
                  ? "bg-emerald-500" 
                  : "bg-stone-300"
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
              payment.paid && !isNA ? "translate-x-6" : "translate-x-0.5"
            }`} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* 1. ORIGINAL BIWEEKLY SCHEDULE & PAYMENTS */}
      <div className="space-y-6">
        <div className="p-6 bg-cyan-50 border border-cyan-100 rounded-3xl shadow-3xs flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-cyan-900">Bi-Weekly Schedule / Payments</h2>
            <p className="text-xs text-cyan-700 font-semibold mt-1">Track bills, income, and remaining money</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-cyan-500 shadow-sm">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* MASTER MANUAL SCHEDULE ANCHOR DATE SETTING */}
        <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-600" /> Master Biweekly Anchor Date
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              Define the master start date for all biweekly payment cycle alignments. All due dates recalculate forward from here.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <input
              type="date"
              value={biweeklyAnchorDate}
              onChange={(e) => setBiweeklyAnchorDate(e.target.value)}
              className="bg-stone-50 border border-stone-200 focus:border-cyan-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-bold text-slate-850 shadow-3xs cursor-pointer"
            />
            <div className="text-[10px] font-black uppercase text-cyan-700 bg-cyan-50 border border-cyan-100 px-2.5 py-1.5 rounded-xl">
              Active Cycle
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Income & Summary Column */}
          <div className="space-y-4">
            <div className="p-6 bg-white border border-stone-200 rounded-3xl shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Paycheck Income
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Rhonda's Paycheck</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      value={rhonPay || ""}
                      onChange={(e) => setRhonPay(Number(e.target.value) || 0)}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-cyan-400 focus:outline-none rounded-xl pl-8 pr-3 py-2 text-sm font-semibold text-slate-800"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Susan's Paycheck</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      value={suzPay || ""}
                      onChange={(e) => setSuzPay(Number(e.target.value) || 0)}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-cyan-400 focus:outline-none rounded-xl pl-8 pr-3 py-2 text-sm font-semibold text-slate-800"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Total Income</span>
                  <span className="text-lg font-black text-emerald-600">${totals.totalIncome}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-sm text-white space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Scheduled Bills</p>
                <p className="text-xl font-black">${totals.totalScheduled}</p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-300">Total Paid</span>
                <span className="font-bold text-emerald-400">${totals.totalCompleted}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-300">Remaining To Pay</span>
                <span className="font-bold text-rose-400">${totals.totalRemaining}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-700 mt-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Available Money</p>
                <p className={`text-3xl font-black ${totals.remainingMoney >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  ${totals.remainingMoney}
                </p>
              </div>
            </div>
          </div>

          {/* Payments List Column */}
          <div className="md:col-span-2 bg-white border border-stone-200 rounded-3xl shadow-sm p-6 max-h-[600px] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="font-bold text-slate-800 text-lg">Scheduled Payments</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetCurrentCycle}
                  className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 text-slate-600 font-extrabold text-[10px] uppercase tracking-wider rounded-xl hover:bg-stone-150 hover:text-slate-850 transition cursor-pointer"
                  title="Unpay all items and clear temporary NA status"
                >
                  Reset Current Cycle
                </button>
                <button
                  type="button"
                  onClick={advanceToNextCycle}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-950 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
                  title="Advance master date by 14 days and reset all payments & NA status"
                >
                  Start Next Cycle
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {(() => {
                const groupedPayments = getGroupedItems<PaymentItem>(payments);
                return (
                  <>
                    {/* SECTION 1: RG */}
                    {groupedPayments.rg.length > 0 && (
                      <div className="space-y-2">
                        <div className="px-1 text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 select-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          SECTION 1: Rhonda's Payments (RG)
                        </div>
                        {groupedPayments.rg.map(p => renderPaymentRow(p))}
                      </div>
                    )}

                    {/* SECTION 2: SG */}
                    {groupedPayments.sg.length > 0 && (
                      <div className="space-y-2">
                        <div className="px-1 text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 select-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          SECTION 2: Susan's Payments (SG)
                        </div>
                        {groupedPayments.sg.map(p => renderPaymentRow(p))}
                      </div>
                    )}

                    {/* SECTION 3: Other */}
                    {groupedPayments.other.length > 0 && (
                      <div className="space-y-2">
                        <div className="px-1 text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 select-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                          Other Scheduled Payments
                        </div>
                        {groupedPayments.other.map(p => renderPaymentRow(p))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TRACKER DASHBOARD SECTION */}
      <div className="pt-8 border-t-2 border-stone-200 space-y-6">
        
        {/* Tracker Tab Toggle Buttons */}
        <div className="flex justify-between items-center bg-stone-50 p-2 border border-stone-200 rounded-3xl flex-wrap gap-2">
          <div className="flex bg-stone-200/50 p-1 rounded-2xl border border-stone-200 w-fit">
            <button
              onClick={() => setTrackerTab("debt")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                trackerTab === "debt"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              Debt Tracker
            </button>
            <button
              onClick={() => setTrackerTab("savings")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                trackerTab === "savings"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Savings Tracker
            </button>
          </div>
          <div className="text-[11px] text-slate-500 font-bold px-3">
            {trackerTab === "debt" ? "Active liabilities spreadsheet mode" : "Reserve savings tracker mode"}
          </div>
        </div>

        {trackerTab === "debt" ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Debt Section Header */}
            <div className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">Spreadsheet Mode</span>
                  <span className="text-xs text-slate-400 font-bold">Direct balance & history tracker</span>
                </div>
                <h2 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-emerald-400" /> DEBT TRACKER
                </h2>
                <p className="text-xs text-slate-300 mt-1 font-medium">Modelled after a debt reduction spreadsheet. Update balances, check credit limits, and monitor interest.</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto shrink-0">
                <button
                  onClick={() => handleOpenCreateAccount("debt")}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer w-full md:w-auto"
                >
                  <Plus className="w-4 h-4" /> Add Debt
                </button>
              </div>
            </div>

        {/* BALANCE UPDATE SUCCESS SUMMARY ALERT */}
        {paydaySuccessSummary && (
          <div className="p-6 bg-emerald-950 border border-emerald-800 rounded-3xl text-emerald-50 space-y-4 shadow-lg animate-fadeIn">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center text-emerald-300 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">🎉 Debt Balance Updated!</h4>
                  <p className="text-xs text-emerald-200">Your new balance is saved and previous balance has been archived to history.</p>
                </div>
              </div>
              <button 
                onClick={() => setPaydaySuccessSummary(null)}
                className="text-emerald-400 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-800/60">
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Debt Reduced By</p>
                <p className="text-xl font-black text-emerald-300">
                  {paydaySuccessSummary.periodReduction >= 0 
                    ? `+${paydaySuccessSummary.periodReduction.toLocaleString()}` 
                    : `-${Math.abs(paydaySuccessSummary.periodReduction).toLocaleString()}`}
                </p>
              </div>
              <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-800/60">
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Reduction This Year</p>
                <p className="text-xl font-black text-emerald-300">${paydaySuccessSummary.yearReduction.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-800/60">
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Total Lifetime Paid</p>
                <p className="text-xl font-black text-emerald-300">${paydaySuccessSummary.totalReduction.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-800/60">
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Overall Reduction</p>
                <p className="text-xl font-black text-emerald-300">{paydaySuccessSummary.percentageReduction}%</p>
              </div>
            </div>

            {paydaySuccessSummary.unlockedMilestones.length > 0 && (
              <div className="bg-emerald-900 p-4 rounded-2xl border border-yellow-700/40 flex items-start gap-3">
                <span className="text-xl">🏆</span>
                <div>
                  <p className="text-xs font-black text-yellow-300 uppercase tracking-wider">New Achievements Unlocked!</p>
                  <p className="text-xs text-white mt-1">You just unlocked: {paydaySuccessSummary.unlockedMilestones.join(", ")}!</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DEBT DASHBOARD METRICS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-white border border-rose-100 p-4 rounded-3xl shadow-3xs">
            <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Total Remaining Debt</span>
            <p className="text-2xl font-black text-slate-900 mt-1">${totalRemainingDebt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span className="text-[10px] text-rose-600 font-bold">{activeDebts.length} active liabilities</span>
            </div>
          </div>

          <div className="bg-white border border-blue-100 p-4 rounded-3xl shadow-3xs">
            <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Total Available Credit</span>
            <p className="text-2xl font-black text-slate-900 mt-1">${totalAvailableCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span className="text-[10px] text-blue-600 font-bold">Credit cards & LOCs</span>
            </div>
          </div>

          <div className="bg-white border border-amber-100 p-4 rounded-3xl shadow-3xs">
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Biweekly Debt Payments</span>
            <p className="text-2xl font-black text-slate-900 mt-1">${totalBiweeklyDebtPayments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span className="text-[10px] text-amber-600 font-bold">Minimum pay commit</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-3xs">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Est. Interest / Pay Period</span>
            <p className="text-2xl font-black text-slate-900 mt-1">${totalEstBiweeklyInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span className="text-[10px] text-slate-500 font-bold">Weighted cost per paycheck</span>
            </div>
          </div>

          {/* LOWER METRICS GRID */}
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl shadow-3xs col-span-2 md:col-span-1">
            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block">Total Paid Off (Lifetime)</span>
            <p className="text-2xl font-black text-emerald-800 mt-1">${totalDebtPaidOffSinceBegan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-emerald-700 font-black uppercase tracking-wider">{pctOverallReduction.toFixed(1)}% eliminated</span>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100/50 p-4 rounded-3xl shadow-3xs">
            <span className="text-[10px] font-black uppercase text-emerald-700/80 tracking-wider">Debt Paid Off This Year</span>
            <p className="text-xl font-black text-emerald-800 mt-1">${debtPaidThisYear.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="text-[9.5px] text-slate-500 font-bold mt-1">Reflects calendar year {currentYear}</div>
          </div>

          <div className="bg-emerald-600 text-white p-4 rounded-3xl shadow-sm col-span-2">
            <span className="text-[10px] font-black uppercase text-emerald-100 tracking-wider">Most Recent Balance Update Reduction</span>
            <p className="text-2xl font-black text-white mt-1">${debtPaidThisPayPeriod.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="text-[9.5px] text-emerald-100/90 font-semibold mt-1">Recorded from the most recent balance update</div>
          </div>

        </div>

        {/* VISUALS BLOCK (Total Progress & Timeline Trend Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Progress Bar & Summary Stats */}
          <div className="lg:col-span-1 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-stone-100 pb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Overall Progress
              </h3>
              
              <div className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                    <span>Paid Off Progress</span>
                    <span className="font-bold text-slate-800">{pctOverallReduction.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex border border-slate-200/55">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, pctOverallReduction)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-2">
                  <div className="flex justify-between py-1 border-b border-stone-50">
                    <span className="text-slate-500 font-medium">Starting Debt Baselined:</span>
                    <span className="font-bold text-slate-800">${totalStartingDebt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-50">
                    <span className="text-slate-500 font-medium">Remaining Liabilities:</span>
                    <span className="font-bold text-rose-600">${totalCurrentDebtAll.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-50">
                    <span className="text-slate-500 font-medium">Total Eliminated:</span>
                    <span className="font-bold text-emerald-600">${totalDebtPaidOffSinceBegan.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Largest reduction achievement */}
            {largestReductionLog && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-2 text-amber-900">
                <span className="text-lg">🏆</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">Largest Debt Reduction</p>
                  <p className="text-xs font-bold mt-0.5">${largestReductionLog.amountReduced.toLocaleString()} paid on {largestReductionLog.accountName}</p>
                  <p className="text-[9px] text-amber-600 mt-0.5">Recorded on {largestReductionLog.date}</p>
                </div>
              </div>
            )}
          </div>

          {/* Timeline Chart */}
          <div className="lg:col-span-2 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-stone-100 pb-2 flex items-center gap-1.5 mb-4">
              <TrendingDown className="w-4 h-4 text-cyan-600" /> Debt Reduction Timeline
            </h3>
            
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={getTimelineData()}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReduction" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "11px" }}
                  />
                  <Area type="monotone" name="Debt Balance" dataKey="balance" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                  <Area type="monotone" name="Total Paid Off" dataKey="reduction" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReduction)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-semibold text-center italic">Logs and payday updates build this history timeline automatically.</p>
          </div>

        </div>



        {/* ACCOUNT DETAILED SPECIFICATION & PROGRESS LIST */}
        <div className="bg-white border border-stone-200 rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Debt Accounts Ledger</h3>
              <p className="text-xs text-slate-400">View credit limits, starting baselines, rates, and individual progress.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowArchivedDebts(!showArchivedDebts)}
                className="px-3 py-1.5 border border-stone-200 text-stone-600 hover:bg-stone-50 font-bold text-[10px] uppercase rounded-xl transition cursor-pointer"
              >
                {showArchivedDebts ? "Hide Archived" : "Show Archived"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-y border-stone-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-3">Account / Category</th>
                  <th className="p-3 text-right">Limit / Original</th>
                  <th className="p-3 text-right">Starting Bal</th>
                  <th className="p-3 text-right">Current Bal</th>
                  <th className="p-3 text-center">Interest Rate</th>
                  <th className="p-3 text-right">Payment</th>
                  <th className="p-3">Progress / Utilization</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(() => {
                  const groupedDebts = getGroupedItems<DebtAccount>(debtAccounts);
                  return (
                    <>
                      {/* SECTION 1: RG Accounts */}
                      {groupedDebts.rg.length > 0 && (
                        <>
                          <tr className="bg-slate-100/70 border-y border-stone-200/60 font-black text-slate-700 uppercase tracking-wider text-[10px] select-none">
                            <td colSpan={8} className="p-2.5 text-left font-sans pl-4">
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2 align-middle"></span>
                              SECTION 1: Rhonda's Liabilities (RG)
                            </td>
                          </tr>
                          {groupedDebts.rg.map(acc => renderAccountRow(acc))}
                        </>
                      )}

                      {/* SECTION 2: SG Accounts */}
                      {groupedDebts.sg.length > 0 && (
                        <>
                          <tr className="bg-slate-100/70 border-y border-stone-200/60 font-black text-slate-700 uppercase tracking-wider text-[10px] select-none">
                            <td colSpan={8} className="p-2.5 text-left font-sans pl-4">
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 align-middle"></span>
                              SECTION 2: Susan's Liabilities (SG)
                            </td>
                          </tr>
                          {groupedDebts.sg.map(acc => renderAccountRow(acc))}
                        </>
                      )}

                      {/* SECTION 3: Other Accounts */}
                      {groupedDebts.other.length > 0 && (
                        <>
                          <tr className="bg-slate-100/70 border-y border-stone-200/60 font-black text-slate-700 uppercase tracking-wider text-[10px] select-none">
                            <td colSpan={8} className="p-2.5 text-left font-sans pl-4">
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-stone-400 mr-2 align-middle"></span>
                              Shared & Other Liabilities
                            </td>
                          </tr>
                          {groupedDebts.other.map(acc => renderAccountRow(acc))}
                        </>
                      )}
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>



        {/* REVOLVING CREDIT CARD & LINE OF CREDIT VISUAL GAUGES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-stone-100 pb-2 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-500" /> Revolving Credit Availability
            </h3>

            <div className="space-y-3.5">
              {activeDebts
                .filter(a => a.category === "Credit Card" || a.category === "Line of Credit")
                .map(acc => {
                  const avail = Math.max(0, acc.creditLimit - acc.currentBalance);
                  const utilPct = acc.creditLimit > 0 ? (acc.currentBalance / acc.creditLimit) * 100 : 0;
                  const availPct = Math.max(0, 100 - utilPct);

                  return (
                    <div key={acc.id} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-700">{acc.name}</span>
                        <span className="text-blue-600">${avail.toLocaleString(undefined, { maximumFractionDigits: 0 })} left</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                        <div 
                          className="bg-blue-500 h-full transition-all" 
                          style={{ width: `${availPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                        <span>Limit: ${acc.creditLimit.toLocaleString()}</span>
                        <span>{availPct.toFixed(0)}% available</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* MILESTONE TROPHIES */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-stone-100 pb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> Reduction Milestones
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {milestones.map(m => {
                const status = checkMilestoneStatus(m);
                return (
                  <div 
                    key={m.id} 
                    className={`p-3 rounded-2xl border transition flex flex-col justify-between ${
                      status.achieved 
                        ? "bg-amber-50/50 border-amber-200 text-amber-900" 
                        : "bg-stone-50/50 border-stone-200 text-slate-400"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-base ${status.achieved ? "animate-pulse" : ""}`}>
                          {status.achieved ? "🏆" : "🔒"}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {status.achieved ? "Unlocked" : "Locked"}
                        </span>
                      </div>
                      <p className="text-xs font-bold mt-1.5 text-slate-800">{m.label}</p>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-[9px] font-semibold text-slate-400 mb-1">
                        <span>{status.text}</span>
                        <span>{status.progress}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                        <div 
                          className={`h-full ${status.achieved ? "bg-amber-500" : "bg-slate-400"}`} 
                          style={{ width: `${Math.min(100, parseFloat(status.progress) || 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* 3. HISTORICAL SNAPSHOTS LOG */}
        <div className="bg-white border border-stone-200 rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-stone-100 pb-3 gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" /> Debt Balance & Reduction Log
              </h3>
              <p className="text-xs text-slate-400">Review, filter, and track exact history data snapshots.</p>
            </div>
            
            {/* Log filters */}
            <div className="flex flex-wrap gap-2 text-xs">
              <div>
                <select
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                  className="bg-stone-50 border border-stone-200 focus:outline-none rounded-xl px-2.5 py-1.5 font-bold text-slate-700"
                >
                  <option value="all">All Accounts</option>
                  {debtAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-stone-50 border border-stone-200 focus:outline-none rounded-xl px-2.5 py-1.5 font-bold text-slate-700"
                >
                  <option value="all">All Months</option>
                  <option value="01">January</option>
                  <option value="02">February</option>
                  <option value="03">March</option>
                  <option value="04">April</option>
                  <option value="05">May</option>
                  <option value="06">June</option>
                  <option value="07">July</option>
                  <option value="08">August</option>
                  <option value="09">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>

              <div>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="bg-stone-50 border border-stone-200 focus:outline-none rounded-xl px-2.5 py-1.5 font-bold text-slate-700"
                >
                  <option value="all">All Years</option>
                  {uniqueYears.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[300px] overflow-y-auto border border-stone-100 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-3">Log Date</th>
                  <th className="p-3">Account</th>
                  <th className="p-3 text-right">Previous Bal</th>
                  <th className="p-3 text-right">New Bal</th>
                  <th className="p-3 text-right">Debt Reduced</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredHistoryLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold italic">
                      No matching logged balance updates found.
                    </td>
                  </tr>
                ) : (
                  filteredHistoryLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-semibold text-slate-600 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {log.date}
                      </td>
                      <td className="p-3 font-bold text-slate-800">{log.accountName}</td>
                      <td className="p-3 text-right font-semibold text-slate-600">${log.previousBalance.toLocaleString()}</td>
                      <td className="p-3 text-right font-semibold text-slate-800">${log.newBalance.toLocaleString()}</td>
                      <td className={`p-3 text-right font-black ${log.amountReduced >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                        {log.amountReduced >= 0 ? `+$${log.amountReduced.toLocaleString()}` : `-$${Math.abs(log.amountReduced).toLocaleString()}`}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteHistoryLog(log.id)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                          title="Delete history item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* Savings Section Header */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">Payday Review Mode</span>
                <span className="text-xs text-slate-400 font-bold">Operational Money Buckets</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-400" /> SAVINGS TRACKER
              </h2>
              <p className="text-xs text-slate-300 mt-1 font-medium">Simple money buckets for pre-funded bills, short-term goals, and flexible spending. No long-term investment tracking.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto shrink-0">
              <button
                onClick={() => handleOpenCreateAccount("savings")}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer w-full md:w-auto"
              >
                <Plus className="w-4 h-4" /> Add Savings Account
              </button>
            </div>
          </div>

          {/* SAVINGS DASHBOARD METRICS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-white border border-emerald-100 p-5 rounded-3xl shadow-3xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Total Usable Savings</span>
                <p className="text-xl font-black text-slate-900 mt-1">${totalCurrentSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Excludes $2,500 TFSA property tax reserve</p>
            </div>

            <div className="bg-white border border-blue-100 p-5 rounded-3xl shadow-3xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">TFSA Available</span>
                <p className="text-xl font-black text-slate-900 mt-1">${tfsaAvailable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 font-medium flex justify-between">
                <span>Total: ${tfsaTotal.toLocaleString()}</span>
                <span>Tax Res: -$2,500</span>
              </div>
            </div>

            <div className="bg-white border border-amber-100 p-5 rounded-3xl shadow-3xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">DR Fund Target</span>
                <p className="text-xl font-black text-slate-900 mt-1">${drBalance.toLocaleString()} / $1,500</p>
              </div>
              <div className="mt-2">
                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, drProgressPct)}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold text-amber-600 mt-1">
                  <span>{Math.min(100, drProgressPct).toFixed(0)}% Completed</span>
                  <span>Deadline: Jan</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-indigo-150 p-5 rounded-3xl shadow-3xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">TFSA Long-Term Goal</span>
                <p className="text-xl font-black text-slate-900 mt-1">${tfsaAvailable.toLocaleString()} / $25,000</p>
              </div>
              <div className="mt-2 space-y-1">
                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden border border-stone-200/50">
                  <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${tfsaGoalProgressPct}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold text-indigo-600">
                  <span>{tfsaGoalProgressPct.toFixed(0)}% Completed</span>
                  <span>{getTfsaTimeRemaining()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-rose-150 p-5 rounded-3xl shadow-3xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">RG RRSP Goal</span>
                <p className="text-xl font-black text-slate-900 mt-1">${rrspBalance.toLocaleString()} / $60,000</p>
              </div>
              <div className="mt-2 space-y-1">
                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden border border-stone-200/50">
                  <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${rrspGoalProgressPct}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold text-rose-600">
                  <span>{rrspGoalProgressPct.toFixed(0)}% Completed</span>
                  <span>{getRrspTimeRemaining()}</span>
                </div>
              </div>
            </div>

          </div>

          {/* SAVINGS BUCKETS GRID */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-600" /> Operational Savings Buckets
              </h3>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-500 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showArchivedDebts}
                    onChange={(e) => setShowArchivedDebts(e.target.checked)}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Show Archived Buckets
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savingsAccounts
                .filter(a => showArchivedDebts ? true : !a.isArchived)
                .map(acc => {
                  const isTFSA = acc.name.toLowerCase() === "tfsa";
                  const isDR = acc.name.toLowerCase() === "dr fund" || acc.name.toLowerCase().includes("dr");
                  const isRRSP = acc.name.toLowerCase().includes("rrsp") || acc.name.toLowerCase().includes("ronda");
                  const isEmerg = acc.name.toLowerCase().includes("emergency");
                  const isElectric = acc.name.toLowerCase().includes("electric");
                  const isPlay = acc.name.toLowerCase().includes("play");

                  let purpose = "Custom savings category";
                  let bgAccent = "bg-stone-50 border-stone-200";
                  let textAccent = "text-slate-700";
                  let badge = "Active Pot";
                  let badgeColor = "bg-slate-100 text-slate-800 border-slate-200";

                  if (isEmerg) {
                    purpose = "Used as buffer account. Money is deposited in and used when needed.";
                    bgAccent = "bg-emerald-50/40 border-emerald-100";
                    textAccent = "text-emerald-900";
                    badge = "Emergency Buffer";
                    badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
                  } else if (isElectric) {
                    purpose = "Pre-fund electricity bill. Funds deposited in advance and withdrawn when paid.";
                    bgAccent = "bg-blue-50/40 border-blue-100";
                    textAccent = "text-blue-900";
                    badge = "Pre-funded Bills";
                    badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
                  } else if (isTFSA) {
                    purpose = "Tax-Free Savings Account with property tax reserve rule.";
                    bgAccent = "bg-indigo-50/40 border-indigo-100";
                    textAccent = "text-indigo-900";
                    badge = "TFSA Reserve";
                    badgeColor = "bg-indigo-100 text-indigo-800 border-indigo-200";
                  } else if (isDR) {
                    purpose = "Goal-based emergency/debt reduction reserve. Target $1,500 by January.";
                    bgAccent = "bg-amber-50/40 border-amber-100";
                    textAccent = "text-amber-900";
                    badge = "Goal-Based";
                    badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                  } else if (isRRSP) {
                    purpose = "RG RRSP long-term retirement savings. Target $60,000 by 2040.";
                    bgAccent = "bg-rose-50/40 border-rose-100";
                    textAccent = "text-rose-900";
                    badge = "Long-Term RRSP";
                    badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
                  } else if (isPlay) {
                    purpose = "Flexible spending, travel, or miscellaneous spending fund. Free balance.";
                    bgAccent = "bg-rose-50/40 border-rose-100";
                    textAccent = "text-rose-900";
                    badge = "Flexible Spending";
                    badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
                  }

                  if (acc.isArchived) {
                    badge = "Archived";
                    badgeColor = "bg-slate-300 text-slate-700 border-slate-400";
                  }

                  return (
                    <div 
                      key={acc.id} 
                      className={`p-6 rounded-3xl border transition flex flex-col justify-between shadow-xs hover:shadow-sm ${bgAccent} ${acc.isArchived ? "opacity-60 bg-stone-100 border-stone-300" : "bg-white"}`}
                    >
                      <div className="space-y-4">
                        {/* Bucket Header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 uppercase tracking-wide">
                              {acc.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                              {acc.notes || purpose}
                            </p>
                          </div>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${badgeColor}`}>
                            {badge}
                          </span>
                        </div>

                        {/* Balance Details Row */}
                        <div className="pt-3 border-t border-stone-100 space-y-2">
                          {isTFSA ? (
                            <div className="space-y-2.5">
                              <div className="flex justify-between text-xs font-semibold text-slate-500">
                                <span>Total TFSA Balance</span>
                                <span>${acc.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between text-xs font-semibold text-rose-500">
                                <span>Property Tax Reserve</span>
                                <span>-$2,500.00</span>
                              </div>
                              <div className="flex justify-between text-sm font-black text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100/70 mt-1">
                                <span>Available TFSA Balance</span>
                                <span>${Math.max(0, acc.currentBalance - 2500).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              </div>
                              
                              {/* Long-Term Goal */}
                              <div className="pt-2.5 border-t border-dashed border-stone-200 space-y-1.5">
                                <div className="flex justify-between text-[10px] font-black uppercase text-indigo-700">
                                  <span>Long-Term Target (June 2036)</span>
                                  <span>$25,000.00</span>
                                </div>
                                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200/50">
                                  <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${tfsaGoalProgressPct}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                                  <span>{tfsaGoalProgressPct.toFixed(1)}% Completed</span>
                                  <span>{getTfsaTimeRemaining()}</span>
                                </div>
                              </div>
                            </div>
                          ) : isDR ? (
                            <div className="space-y-2">
                              <div className="flex justify-between items-end">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-slate-400">Current Balance</span>
                                  <p className="text-xl font-black text-slate-900">${acc.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Goal</span>
                                  <p className="text-xs font-bold text-slate-600">$1,500.00</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200/50">
                                  <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, drProgressPct)}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                                  <span>{drProgressPct.toFixed(0)}% to target</span>
                                  <span>Deadline: Jan</span>
                                </div>
                              </div>
                            </div>
                          ) : isRRSP ? (
                            <div className="space-y-2">
                              <div className="flex justify-between items-end">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-slate-400">Current Balance</span>
                                  <p className="text-xl font-black text-slate-900">${acc.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Goal</span>
                                  <p className="text-xs font-bold text-slate-600">$60,000.00</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200/50">
                                  <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${rrspGoalProgressPct}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                                  <span>{rrspGoalProgressPct.toFixed(0)}% to target</span>
                                  <span>{getRrspTimeRemaining()}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-1">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-slate-400">Current Balance</span>
                                  <p className="text-xl font-black text-slate-900">${acc.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                                {acc.lastUpdated && (
                                  <div className="text-right">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">As Of</span>
                                    <p className="text-xs font-bold text-slate-600">{acc.lastUpdated}</p>
                                  </div>
                                )}
                              </div>

                              {/* Target Warnings */}
                              {isEmerg && acc.currentBalance < 500 && (
                                <div className="p-2.5 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-2 text-rose-800 text-[11px] font-bold leading-relaxed animate-pulse">
                                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                  <span>Warning: Emergency Fund balance is below the required $500 minimum buffer!</span>
                                </div>
                              )}

                              {isElectric && acc.currentBalance < 200 && (
                                <div className="p-2.5 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-2 text-rose-800 text-[11px] font-bold leading-relaxed animate-pulse">
                                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                  <span>Warning: Electric Fund balance is below the $200 target minimum!</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bucket Controls */}
                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Updated: {acc.lastUpdated || "Not recorded"}
                        </span>
                        
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleOpenEditAccount(acc.id)}
                            className="px-3 py-1.5 hover:bg-stone-150 border border-stone-200 rounded-xl text-slate-700 hover:text-slate-950 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                            title="Update balance & details"
                          >
                            <Edit2 className="w-3 h-3 text-cyan-600" /> Update Balance
                          </button>
                          <button
                            onClick={() => handleArchiveAccount(acc.id)}
                            className={`p-1.5 border rounded-xl transition cursor-pointer ${acc.isArchived ? "bg-amber-100 text-amber-700 border-amber-200" : "hover:bg-stone-150 text-slate-500 hover:text-amber-600 border-stone-200"}`}
                            title={acc.isArchived ? "Re-activate account" : "Archive account"}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(acc.id)}
                            className="p-1.5 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 rounded-xl text-slate-500 hover:text-rose-600 transition cursor-pointer"
                            title="Permanently Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              {savingsAccounts.filter(a => showArchivedDebts ? true : !a.isArchived).length === 0 && (
                <div className="col-span-full bg-stone-50 border border-stone-200 rounded-3xl p-8 text-center text-slate-500 italic">
                  No active savings buckets found. Click "Add Savings Account" to create a new money bucket!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT DETAIL DIALOG (CREATE & EDIT) */}
      {isAccountFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingAccountId 
                  ? `✏️ Edit ${formAccountType === "savings" ? "Savings" : "Debt"} Account` 
                  : `➕ Add New ${formAccountType === "savings" ? "Savings" : "Debt"} Account`}
              </h3>
              <button 
                onClick={() => setIsAccountFormOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  value={accountForm.name}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-cyan-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  placeholder={formAccountType === "savings" ? "e.g. TFSA Account" : "e.g. RG Scotia Visa"}
                />
              </div>

              {formAccountType === "debt" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Category</label>
                      <select
                        value={accountForm.category}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, category: e.target.value as DebtAccount["category"] }))}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-cyan-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                      >
                        <option value="Credit Card">Credit Card</option>
                        <option value="Line of Credit">Line of Credit</option>
                        <option value="Mortgage">Mortgage</option>
                        <option value="Auto Loan">Auto Loan</option>
                        <option value="Personal Loan">Personal Loan</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Interest Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={accountForm.interestRate}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, interestRate: e.target.value }))}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-cyan-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                        placeholder="e.g. 21.99"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Credit Limit / Original Loan</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={accountForm.creditLimit}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, creditLimit: e.target.value }))}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-cyan-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                        placeholder="e.g. 15000"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Biweekly Minimum Payment ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={accountForm.biweeklyPayment}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, biweeklyPayment: e.target.value }))}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-cyan-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                        placeholder="e.g. 250"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3 p-3 bg-cyan-50/55 border border-cyan-100 rounded-2xl">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-cyan-800 mb-1 font-black">Starting Balance ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={accountForm.startingBalance}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, startingBalance: e.target.value }))}
                    className="w-full bg-white border border-stone-200 focus:border-cyan-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                    placeholder="e.g. 10000"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-cyan-800 mb-1 font-black">Current Balance ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={accountForm.currentBalance}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, currentBalance: e.target.value }))}
                    className="w-full bg-white border border-stone-200 focus:border-cyan-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                    placeholder="e.g. 5446"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  {editingAccountId ? "Balance Update Date" : "As-Of / Start Date"}
                </label>
                <input
                  type="date"
                  required
                  value={accountForm.updateDate}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, updateDate: e.target.value }))}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-cyan-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Notes</label>
                <input
                  type="text"
                  value={accountForm.notes}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-cyan-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  placeholder={formAccountType === "savings" ? "e.g. General emergency savings" : "e.g. Primary household credit card"}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAccountFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-850 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>

    </div>
  );
}
