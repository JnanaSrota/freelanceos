import { useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, ReceiptText, ShieldAlert, CheckCircle2, ChevronRight, FileText, ArrowRight } from 'lucide-react';
import { Client, Invoice } from '../types';

interface OverviewSectionProps {
  clients: Client[];
  invoices: Invoice[];
  onNavigateTo: (page: string) => void;
  onSelectInvoice: (invoice: Invoice) => void;
}

export default function OverviewSection({ clients, invoices, onNavigateTo, onSelectInvoice }: OverviewSectionProps) {
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [chartFilter, setChartFilter] = useState<'all' | 'q1' | 'q2'>('all');

  // Compute stats
  const fyInvoices = invoices; // All are current FY
  const totalInvoiced = fyInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
  const totalPayable = fyInvoices.reduce((sum, inv) => sum + inv.totalPayable, 0);
  
  const paidInvoices = fyInvoices.filter(inv => inv.status === 'paid');
  const unpaidInvoices = fyInvoices.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue');
  
  const cashCollected = paidInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
  const pendingCollections = unpaidInvoices.reduce((sum, inv) => sum + inv.totalPayable, 0);
  
  const totalGstCollected = paidInvoices.reduce((sum, inv) => sum + inv.gstAmount, 0);
  const totalTdsDeducted = paidInvoices.reduce((sum, inv) => sum + inv.tdsAmount, 0);

  // SVG Custom Interactive Chart Data Setup
  const monthlyMap = new Map();
invoices.forEach((inv) => {
  const date = new Date(inv.invoiceDate || Date.now());
  const month = date.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
  if (!monthlyMap.has(month)) {
    monthlyMap.set(month, { month, invoiced: 0, collected: 0, tds: 0, gst: 0 });
  }
  const row = monthlyMap.get(month);
  row.invoiced += Number(inv.subtotal || 0);
  row.tds += Number(inv.tdsDeducted || 0);
  row.gst += Number((inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0));
  if (inv.status === 'paid') {
    row.collected += Number(inv.subtotal || 0);
  }
});

const monthlyData = Array.from(monthlyMap.values());
  const activePoints = chartFilter === 'q1' 
    ? monthlyData.slice(0, 3) 
    : chartFilter === 'q2' 
      ? monthlyData.slice(2, 4) 
      : monthlyData;

  // Find max value in chart points for proportional scale
  const maxVal = Math.max(...activePoints.map(p => Math.max(p.invoiced, p.collected))) * 1.15 || 500000;

  // Chart layout specs
  const width = 600;
  const height = 180;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates
  const pointsInvoiced = activePoints.map((p, i) => {
    const x = paddingLeft + (i / (activePoints.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (p.invoiced / maxVal) * chartHeight;
    return { x, y, month: p.month, invoiced: p.invoiced, collected: p.collected, tds: p.tds, gst: p.gst };
  });

  const pointsCollected = activePoints.map((p, i) => {
    const x = paddingLeft + (i / (activePoints.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (p.collected / maxVal) * chartHeight;
    return { x, y };
  });

  // Polyline coordinates string
  const polylineInvoicedStr = pointsInvoiced.map(p => `${p.x},${p.y}`).join(' ');
  const polylineCollectedStr = pointsCollected.map(p => `${p.x},${p.y}`).join(' ');

  // Area path coordinate string
  const areaInvoicedStr = pointsInvoiced.length > 0 
    ? `${pointsInvoiced[0].x},${paddingTop + chartHeight} ${polylineInvoicedStr} ${pointsInvoiced[pointsInvoiced.length - 1].x},${paddingTop + chartHeight}` 
    : '';

  const areaCollectedStr = pointsCollected.length > 0
    ? `${pointsCollected[0].x},${paddingTop + chartHeight} ${polylineCollectedStr} ${pointsCollected[pointsCollected.length - 1].x},${paddingTop + chartHeight}`
    : '';

  return (
    <div className="space-y-6">
      {/* 4-Column Bento Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <Wallet className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 px-2 py-0.5 bg-emerald-100/50 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              +14% vs Q4
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-500 font-sans block lowercase first-letter:uppercase mb-1">Invoiced Revenue (YTD)</span>
            <p className="text-2xl font-bold font-sans tracking-tight text-slate-900">₹{totalInvoiced.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-slate-400 block font-mono mt-1">
              Base Gross Value (Net of taxes)
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="p-2.5 bg-sky-50 text-sky-700 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-semibold text-sky-700 px-2 py-0.5 bg-sky-100/50 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              65.4% Liquid
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-500 font-sans block lowercase first-letter:uppercase mb-1">Cash In-Bank</span>
            <p className="text-2xl font-bold font-sans tracking-tight text-slate-900">₹{cashCollected.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-slate-400 block font-mono mt-1">
              Realized Professional Fees
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-semibold text-teal-700 px-2 py-0.5 bg-teal-100/50 rounded-full">
              Form 26AS Sync
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-500 font-sans block lowercase first-letter:uppercase mb-1">TDS Withheld (10% standard)</span>
            <p className="text-2xl font-bold font-sans tracking-tight text-slate-900">₹{totalTdsDeducted.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-emerald-800 font-semibold px-1.5 py-0.5 bg-emerald-50 rounded-md inline-block mt-1">
              Refundable / Adjustable
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-semibold text-rose-700 px-2 py-0.5 bg-rose-100/50 rounded-full flex items-center gap-0.5">
              <ArrowDownRight className="w-3 h-3" />
              Followup Required
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-500 font-sans block lowercase first-letter:uppercase mb-1">Unrealized Receivables</span>
            <p className="text-2xl font-bold font-sans tracking-tight text-rose-800">₹{pendingCollections.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-rose-500 font-mono block mt-1">
              Includes CGST / SGST components
            </span>
          </div>
        </div>

      </div>

      {/* Grid Layout for Analytics & Small Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Interactive Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 font-sans tracking-tight">Professional Volume Trend</h3>
                <p className="text-xs text-slate-500">Gross billing compared to actual recognized payments</p>
              </div>

              {/* Chart Quarter Filters */}
              <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs font-medium">
                <button 
                  onClick={() => { setChartFilter('all'); setHoveredPointIdx(null); }} 
                  className={`px-3 py-1 rounded-md transition-colors ${chartFilter === 'all' ? 'bg-white shadow-3xs text-slate-900' : 'text-slate-500'}`}
                >
                  All Month
                </button>
                <button 
                  onClick={() => { setChartFilter('q1'); setHoveredPointIdx(null); }}
                  className={`px-3 py-1 rounded-md transition-colors ${chartFilter === 'q1' ? 'bg-white shadow-3xs text-slate-900' : 'text-slate-500'}`}
                >
                  Q1 (Apr-Jun)
                </button>
                <button 
                  onClick={() => { setChartFilter('q2'); setHoveredPointIdx(null); }}
                  className={`px-3 py-1 rounded-md transition-colors ${chartFilter === 'q2' ? 'bg-white shadow-3xs text-slate-900' : 'text-slate-500'}`}
                >
                  Q2 (Jul)
                </button>
              </div>
            </div>

            {/* Custom interactive Chart canvas */}
            <div className="relative mt-4 bg-slate-50/50 p-2 border border-slate-100 rounded-xl">
              <svg 
                viewBox={`0 0 ${width} ${height}`} 
                className="w-full h-auto overflow-visible select-none"
              >
                {/* Horizontal gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = paddingTop + ratio * chartHeight;
                  const value = Math.round(maxVal * (1 - ratio));
                  return (
                    <g key={idx}>
                      <line 
                        x1={paddingLeft} 
                        y1={y} 
                        x2={width - paddingRight} 
                        y2={y} 
                        stroke="#e2e8f0" 
                        strokeWidth="1" 
                        strokeDasharray="4 4"
                      />
                      <text 
                        x={paddingLeft - 8} 
                        y={y + 3} 
                        textAnchor="end" 
                        className="text-[10px] font-mono fill-slate-400"
                      >
                        ₹{Math.round(value/1000)}k
                      </text>
                    </g>
                  );
                })}

                {/* Shading/Fill area for base lines */}
                <path 
                  d={areaInvoicedStr} 
                  fill="url(#invoiceGrad)" 
                  opacity="0.32"
                />
                <path 
                  d={areaCollectedStr} 
                  fill="url(#collectGrad)" 
                  opacity="0.32"
                />

                {/* Primary Trend curves */}
                <polyline 
                  fill="none" 
                  stroke="#0d9488" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylineInvoicedStr}
                />
                <polyline 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylineCollectedStr}
                />

                {/* Interactive Points indicators of Invoiced curve */}
                {pointsInvoiced.map((p, idx) => (
                  <g key={idx}>
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="5" 
                      fill="#0d9488" 
                      className="cursor-pointer hover:r-7 transition-all"
                      onMouseEnter={() => setHoveredPointIdx(idx)}
                      onMouseLeave={() => setHoveredPointIdx(null)}
                    />
                    {/* Month labels on x-axis */}
                    <text 
                      x={p.x} 
                      y={height - 8} 
                      textAnchor="middle" 
                      className={`text-[10px] font-sans font-medium transition-colors ${hoveredPointIdx === idx ? 'fill-indigo-900 font-semibold' : 'fill-slate-500'}`}
                    >
                      {p.month}
                    </text>
                  </g>
                ))}

                {/* Linear Glow gradients definitions */}
                <defs>
                  <linearGradient id="invoiceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="collectGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Absolute coordinates display box */}
              {hoveredPointIdx !== null && pointsInvoiced[hoveredPointIdx] && (
                <div 
                  className="absolute bg-slate-900/95 text-white p-3 rounded-lg border border-slate-800 shadow-md text-xs space-y-1 z-30 transition-all pointer-events-none"
                  style={{
                    left: `${Math.min(pointsInvoiced[hoveredPointIdx].x * 1.1 - 40, width - 180)}px`,
                    top: `10px`
                  }}
                >
                  <div className="font-semibold text-teal-400 font-sans border-b border-white/10 pb-1 mb-1">
                    {pointsInvoiced[hoveredPointIdx].month} Metrics
                  </div>
                  <div className="flex justify-between gap-4 font-mono">
                    <span className="text-slate-400">Net invoiced:</span>
                    <span>₹{pointsInvoiced[hoveredPointIdx].invoiced.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between gap-4 font-mono">
                    <span className="text-slate-400">Cash received:</span>
                    <span className="text-emerald-400">₹{pointsInvoiced[hoveredPointIdx].collected.toLocaleString('en-IN')}</span>
                  </div>
                  {pointsInvoiced[hoveredPointIdx].tds > 0 && (
                    <div className="flex justify-between gap-4 font-mono text-[10px]">
                      <span className="text-slate-400">Estimated TDS:</span>
                      <span className="text-teal-400">₹{pointsInvoiced[hoveredPointIdx].tds.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 bg-teal-600 rounded-xs inline-block" />
              <span className="text-slate-600">Invoiced Billings</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 bg-emerald-500 rounded-xs inline-block" />
              <span className="text-slate-600">Actual Realized Take-Home</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono ml-auto">
              💡 Hover on data nodes to inspect details
            </p>
          </div>
        </div>

        {/* GST, SGST Compliance Breakdowns Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 font-sans tracking-tight">State & GST Split</h3>
              <span className="p-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg font-mono">18% Standard</span>
            </div>

            <div className="space-y-4">
              {/* Dynamic bar charts */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
                  <span>CGST (Central GST — 9%)</span>
                  <span className="font-mono text-slate-900">₹{(totalGstCollected / 2).toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-1000"
                    style={{ width: totalInvoiced > 0 ? `${((totalGstCollected / 2) / (totalInvoiced || 1)) * 100}%` : '15%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
                  <span>SGST (State GST — 9%)</span>
                  <span className="font-mono text-slate-900">₹{(totalGstCollected / 2).toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-sky-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: totalInvoiced > 0 ? `${((totalGstCollected / 2) / (totalInvoiced || 1)) * 100}%` : '15%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
                  <span>IGST (Integrated GST — Exports & Inter-state)</span>
                  <span className="font-mono text-slate-900">₹{0} <span className="text-[10px] text-slate-400">(All LUT export)</span></span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-slate-300 h-full rounded-full transition-all duration-1000"
                    style={{ width: '0%' }}
                  />
                </div>
                <p className="text-[10px] text-emerald-800 font-medium mt-1 leading-relaxed">
                  ☘️ Foreign remittances are classified as zero-rated supply of services under Sec 16 of IGST Act under signed LUT.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2 mt-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Compliance Health</span>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">GSTR-1 filing status</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold">Active FY27</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">TDS Credited to 26AS</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-semibold">MAPPED</span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Ledger / Recent Invoices Table (Financial Transparency emphasis) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 font-sans tracking-tight">Audit Ledger & Transaction Feed</h3>
            <p className="text-xs text-slate-500">Comprehensive real-time tracking of tax deductions, GST filings, and recipient billing status.</p>
          </div>
          <button 
            onClick={() => onNavigateTo('invoices')}
            className="text-xs inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            Manage Invoices
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-100">
                <th className="py-3 px-6 font-semibold">Invoice No</th>
                <th className="py-3 px-6 font-semibold">Client Name</th>
                <th className="py-3 px-6 font-semibold text-right">Taxable Subtotal</th>
                <th className="py-3 px-6 font-semibold">Tax Breakdowns</th>
                <th className="py-3 px-6 font-semibold text-right">Net Payable</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {fyInvoices.slice(0, 5).map((inv) => {
                const totalCalculated = inv.subtotal + inv.gstAmount - inv.tdsAmount;
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-all">
                    <td className="py-3.5 px-6 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-6 font-medium text-slate-800">{inv.clientName}</td>
                    <td className="py-3.5 px-6 text-right font-mono text-slate-700">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3 text-[10px] font-mono">
                        <span className="text-indigo-600">GST: +₹{inv.gstAmount.toLocaleString('en-IN')}</span>
                        {inv.tdsAmount > 0 && (
                          <span className="text-teal-600">TDS: -₹{inv.tdsAmount.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right font-semibold font-mono text-slate-900">
                      ₹{totalCalculated.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-center uppercase tracking-wide ${
                        inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'unpaid' ? 'bg-indigo-100 text-indigo-800' :
                        inv.status === 'overdue' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button 
                        onClick={() => onSelectInvoice(inv)}
                        className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                      >
                        Inspect Sheet
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
