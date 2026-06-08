import React, { useState, useEffect } from 'react';
import { Calendar, HelpCircle, ArrowRight, ShieldAlert, Check, PlusCircle, Bookmark, Percent, Landmark } from 'lucide-react';
import { Invoice, TaxPayment } from '../types';
import { fetchTaxSummary, logTaxPayment } from '../api';

interface TaxSectionProps {
  invoices: Invoice[];
  taxPayments: TaxPayment[];
  onAddTaxPayment: (payment: TaxPayment) => void;
}

export default function TaxSection({ invoices, taxPayments, onAddTaxPayment }: TaxSectionProps) {
  const [amountInput, setAmountInput] = useState('');
  const [challanInput, setChallanInput] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [taxData, setTaxData] = useState<any>(null);

useEffect(() => {
  fetchTaxSummary().then(data => setTaxData(data));
}, []);

const grossIncome = taxData?.gross_income_ytd ?? 0
const taxableProfit = taxData?.taxable_income ?? 0
const estimatedTaxLiability = taxData?.estimated_annual_tax ?? 0
const tdsClaimableIn26AS = taxData?.tds_credited ?? 0
const totalAdvancePaid = taxData?.actually_paid ?? 0
const totalOffset = tdsClaimableIn26AS + totalAdvancePaid
const shortfallAmount = taxData?.shortfall ?? 0

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountInput || !challanInput.trim()) return;

    const newPayment: TaxPayment = {
      id: `tax-${Date.now()}`,
      amount: Number(amountInput),
      challanNumber: challanInput.trim().toUpperCase(),
      paymentDate: new Date().toISOString().split('T')[0],
      quarter: 'Q1' // currently Q1 approaching in June 2026!
    };

    onAddTaxPayment(newPayment);
    setSuccessMsg(`Tax challan payment of ₹${Number(amountInput).toLocaleString('en-IN')} logged successfully!`);
    
    setAmountInput('');
    setChallanInput('');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Quarterly deadlines contextual indicators checking today's date (June 6, 2026 is approaching June 15 Q1 15% deadline!)
  const DEADLINES = [
    { name: 'Quarter 1', date: 'June 15, 2026', share: '15% of annual liability', status: 'approaching', label: 'Q1' },
    { name: 'Quarter 2', date: 'Sept 15, 2026', share: '45% of annual liability', status: 'upcoming', label: 'Q2' },
    { name: 'Quarter 3', date: 'Dec 15, 2026', share: '75% of annual liability', status: 'upcoming', label: 'Q3' },
    { name: 'Quarter 4', date: 'March 15, 2027', share: '100% of final liability', status: 'upcoming', label: 'Q4' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Visual KPI indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase font-mono">My taxable profits base</span>
            <div className="text-xl font-bold font-sans text-slate-900 mt-2">₹{taxableProfit.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-500 mt-1">presumed deemed profits (50% under Sec 44ADA of Income Tax Act)</p>
          </div>
          <div className="border-t border-slate-100 pt-2.5 mt-3 text-[10px] text-slate-400">
            Assumes gross FY professional receipts of ₹{grossIncome.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] bg-emerald-100/50 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase font-mono">Claimable offsets</span>
            <div className="text-xl font-bold font-sans text-slate-900 mt-2">₹{totalOffset.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-500 mt-1">TDS deducted (₹{tdsClaimableIn26AS.toLocaleString('en-IN')}) + Advance Tax paid (₹{totalAdvancePaid.toLocaleString('en-IN')})</p>
          </div>
          <div className="border-t border-slate-100 pt-2.5 mt-3 text-[10px] text-teal-800 font-semibold font-mono">
            Directly mapped to ITD PAN e-filing systems
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full uppercase font-mono">Advance Tax shortfall</span>
            <div className={`text-xl font-bold font-sans mt-2 ${shortfallAmount > 0 ? 'text-rose-700 animate-pulse' : 'text-emerald-700'}`}>
              ₹{shortfallAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-1">Pending payments to avoid Section 234C interest penalties.</p>
          </div>
          <div className="border-t border-slate-100 pt-2.5 mt-3 text-[10px] text-slate-400">
            Current approach threshold has a safe harbor of 90%
          </div>
        </div>

      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center gap-2 animate-fadeIn font-semibold">
          <Check className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Grid: Instructions on tax benefits vs Log form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Presumptive tax schematic mapping */}
        <div className="space-y-6">
          <div className="bg-white p-6 border border-slate-100 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 font-sans tracking-tight">Understanding Presumptive Scheme Sec 44ADA</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              For tech professionals and consultants earning under ₹75 Lakhs annually, the government eliminates complex accounting audits. Standard taxation calculates as follows:
            </p>

            <div className="divide-y divide-slate-50 text-xs">
              <div className="py-2.5 flex justify-between items-center text-slate-700 font-medium">
                <span className="flex items-center gap-1.5 font-sans">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Gross professional billings receipts
                </span>
                <span className="font-mono text-slate-900">₹{grossIncome.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-slate-700 font-medium">
                <span className="flex items-center gap-1.5 font-sans">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Presumptive Profit Margin (Deemed Profit - 50%)
                </span>
                <span className="font-mono text-slate-900">₹{taxableProfit.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-slate-700 font-medium">
                <span className="flex items-center gap-1.5 font-sans justify-self-start">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Approx 15% flat Slab Tax liability estimate
                </span>
                <span className="font-mono text-slate-900">₹{estimatedTaxLiability.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3.5 bg-indigo-50/50 border border-indigo-100/30 rounded-xl space-y-1.5 text-[11px] text-indigo-950 font-sans leading-relaxed">
              <span className="font-bold block flex items-center gap-1.5 text-indigo-950">
                <Percent className="w-4 h-4 text-indigo-600" />
                Double Reduction Benefit (GST + TDS Offset):
              </span>
              Since client corporate systems withhold 10% TDS from invoices, that amount is fully claimable in Form 26AS. Most software engineers under 44ADA pay virtually zero additional Advance tax because the TDS already exceeds their slab liability!
            </div>
          </div>

          {/* Quarterly approaches checklist */}
          <div className="bg-white p-6 border border-slate-100 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 font-sans tracking-tight">FY 2026-27 Government Payment Deadlines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEADLINES.map((dl) => (
                <div 
                  key={dl.label} 
                  className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    dl.status === 'approaching' 
                      ? 'bg-rose-50/50 border-rose-200 shadow-3xs' 
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-slate-800">{dl.name} ({dl.label})</span>
                    {dl.status === 'approaching' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-600 text-white animate-pulse">
                        DUE IN 9 DAYS
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-600 font-semibold">{dl.date}</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-1">{dl.share}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Log Challenge form & Record List of log payments */}
        <div className="space-y-6">
          <div className="bg-white p-6 border border-slate-100 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-indigo-50">
              <span className="p-2 bg-slate-900 text-white rounded-lg">
                <Landmark className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 font-sans tracking-tight">Log Advance Tax Payment</h4>
                <p className="text-xs text-slate-500">Record payments executed via Protean NSDL Portal.</p>
              </div>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Challan Amount Paid (₹)</label>
                  <input
                    type="number"
                    required
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full text-xs font-mono bg-slate-50/75 border border-slate-200 outline-hidden focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Treasury Challan Serial / CIN</label>
                  <input
                    type="text"
                    required
                    value={challanInput}
                    onChange={(e) => setChallanInput(e.target.value)}
                    placeholder="e.g. CIN-998811"
                    className="w-full text-xs font-mono bg-slate-50/75 border border-slate-200 outline-hidden focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-indigo-650 hover:bg-slate-900 text-white font-semibold text-xs py-2.5 px-5 rounded-xl transition-colors cursor-pointer"
                >
                  Confirm Log
                </button>
              </div>
            </form>
          </div>

          {/* Record Challan receipt history */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-xs text-slate-800 tracking-tight">
              Advance Tax History Log (CIN Verified)
            </div>
            
            <div className="divide-y divide-slate-100">
              {taxPayments.length > 0 ? (
                taxPayments.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50">
                    <div>
                      <div className="font-semibold text-slate-800">Challan No: <span className="font-mono text-slate-900">{p.challanNumber}</span></div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{p.quarter} Deadlines offset • Logged {p.paymentDate}</span>
                    </div>
                    <div className="text-right font-bold text-slate-900 font-mono">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 italic">
                  No advance tax payments logged for the current fiscal period yet.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
