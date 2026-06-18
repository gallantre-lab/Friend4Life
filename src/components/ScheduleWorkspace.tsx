import React, { useState, useEffect } from "react";
import { CreditCard, Plus, Check, DollarSign } from "lucide-react";

interface PaymentItem {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
}

const defaultPayments: PaymentItem[] = [
  { id: "1", name: "Mortgage", amount: 850, paid: false },
  { id: "2", name: "Electric", amount: 150, paid: false },
  { id: "3", name: "Insurance", amount: 100, paid: false },
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
];

export default function ScheduleWorkspace() {
  const [payments, setPayments] = useState<PaymentItem[]>(() => {
    const saved = localStorage.getItem("forlife_payments_v1");
    if (saved) return JSON.parse(saved);
    return defaultPayments;
  });

  const [rhonPay, setRhonPay] = useState<number>(() => Number(localStorage.getItem("forlife_rhon_pay")) || 0);
  const [suzPay, setSuzPay] = useState<number>(() => Number(localStorage.getItem("forlife_suz_pay")) || 0);

  useEffect(() => {
    localStorage.setItem("forlife_payments_v1", JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem("forlife_rhon_pay", rhonPay.toString());
    localStorage.setItem("forlife_suz_pay", suzPay.toString());
  }, [rhonPay, suzPay]);

  const togglePayment = (id: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, paid: !p.paid } : p))
    );
  };

  const calculateTotals = () => {
    const totalScheduled = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalCompleted = payments.filter((p) => p.paid).reduce((sum, p) => sum + p.amount, 0);
    const totalRemaining = totalScheduled - totalCompleted;

    const totalIncome = rhonPay + suzPay;
    const remainingMoney = totalIncome - totalRemaining;

    return {
      totalScheduled,
      totalCompleted,
      totalRemaining,
      totalIncome,
      remainingMoney
    };
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="p-6 bg-cyan-50 border border-cyan-100 rounded-3xl shadow-3xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-cyan-900">Bi-Weekly Schedule / Payments</h2>
          <p className="text-xs text-cyan-700 font-semibold mt-1">Track bills, income, and remaining money</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-cyan-500 shadow-sm">
          <CreditCard className="w-6 h-6" />
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
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Scheduled</p>
              <p className="text-xl font-black">${totals.totalScheduled}</p>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-300">Completed</span>
              <span className="font-bold text-emerald-400">${totals.totalCompleted}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-300">Remaining to Pay</span>
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
          <h3 className="font-bold text-slate-800 mb-4 text-lg">Scheduled Payments</h3>
          
          <div className="space-y-2">
            {payments.map((payment) => (
              <div 
                key={payment.id} 
                className={`flex justify-between items-center p-3 rounded-xl border transition ${
                  payment.paid 
                    ? "bg-slate-50 border-slate-200 opacity-60" 
                    : "bg-white border-stone-200 shadow-3xs"
                }`}
              >
                <div className="flex flex-col gap-1 w-full max-w-[200px]">
                  <span className={`font-bold ${payment.paid ? "text-slate-500 line-through" : "text-slate-800"}`}>
                    {payment.name}
                  </span>
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
                      disabled={payment.paid}
                      className={`w-full pl-6 pr-2 py-1 text-xs font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                        payment.paid 
                          ? "bg-transparent text-slate-500" 
                          : "bg-stone-50 border border-stone-200 text-slate-800"
                      }`}
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => togglePayment(payment.id)}
                  className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer shrink-0 ${
                    payment.paid ? "bg-emerald-500" : "bg-stone-300"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    payment.paid ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
