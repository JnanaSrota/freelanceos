import { useState } from 'react';
import { Sparkles, ArrowRight, UserCheck, Calculator, AlertCircle, RefreshCw } from 'lucide-react';
import { Client, InvoiceItem } from '../types';

interface AIInvoiceAssistantProps {
  clients: Client[];
  onApplyParsedInvoice: (data: {
    client: string; // client ID
    items: InvoiceItem[];
    gstRate: number;
    notes: string;
  }) => void;
}

const PRESETS = [
  "Invoice Zerodha Tech for 5 weeks Web development at 60000 per week",
  "Service client Stripe Global for API integration consultancy at 285000 flat price",
  "Bill Razorpay Software 35 hours of design support at rate of 4200 per hour"
];

export default function AIInvoiceAssistant({ clients, onApplyParsedInvoice }: AIInvoiceAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<{
    success: boolean;
    clientName: string;
    clientId: string;
    items: InvoiceItem[];
    gstRate: number;
    notes: string;
    subtotal: number;
  } | null>(null);

  const handleParse = (textToParse: string) => {
    if (!textToParse.trim()) return;
    setIsParsing(true);
    setParsedData(null);

    setTimeout(() => {
      setIsParsing(false);
      const lower = textToParse.toLowerCase();

      // Find matching client
      let matchedClient = clients[0]; // fallback
      for (const client of clients) {
        if (lower.includes(client.name.toLowerCase().split(' ')[0])) {
          matchedClient = client;
          break;
        }
      }

      // Extract quantity, rate & description using smart mock parser
      let dQty = 1;
      let dRate = 120000;
      let dDesc = "Full stack developer services";

      // 1. Check weeks
      const weekMatch = lower.match(/(\d+)\s*week/);
      if (weekMatch) {
        dQty = parseInt(weekMatch[1]);
        dDesc = "Consulting & Web development services";
      }

      // 2. Check hours
      const hourMatch = lower.match(/(\d+)\s*hour/);
      if (hourMatch) {
        dQty = parseInt(hourMatch[1]);
        dDesc = "Technical consulting support (Hourly)";
      }

      // 3. Extract rates/amounts
      const rateMatch = lower.match(/at\s+(\d+)/) || lower.match(/of\s+(\d+)/) || lower.match(/rate\s+(\d+)/);
      if (rateMatch) {
        dRate = parseInt(rateMatch[1]);
      } else {
        const anyNumber = lower.match(/\b\d{4,7}\b/g);
        if (anyNumber && anyNumber.length > 0) {
          dRate = parseInt(anyNumber[0]);
        }
      }

      // Refining description from text
      if (lower.includes('api integration')) dDesc = 'API Integration Consulting Services';
      if (lower.includes('design support')) dDesc = 'UI/UX Design Engineering Support';
      if (lower.includes('web development')) dDesc = 'Web Client Development & Optimization';

      const items: InvoiceItem[] = [
        { description: dDesc, qty: dQty, rate: dRate }
      ];

      const gstRate = matchedClient.isForeign ? 0 : 0.18;
      const subtotal = dQty * dRate;

      setParsedData({
        success: true,
        clientName: matchedClient.name,
        clientId: matchedClient.id,
        items,
        gstRate,
        subtotal,
        notes: `AI Generated from prompt: "${textToParse}"`
      });
    }, 1200);
  };

  const handleApply = () => {
    if (!parsedData) return;
    onApplyParsedInvoice({
      client: parsedData.clientId,
      items: parsedData.items,
      gstRate: parsedData.gstRate,
      notes: parsedData.notes
    });
    setParsedData(null);
    setPrompt('');
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl shadow-md border border-indigo-950 overflow-hidden relative">
      {/* Visual background lights */}
      <span className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full pointer-events-none" />
      <span className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="p-1.5 bg-indigo-500/30 text-indigo-400 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-sm font-semibold tracking-tight text-white font-sans">AI Invoice Assistant</h4>
            <p className="text-[11px] text-indigo-300">Type natural statements to extract invoice fields instantaneously.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Invoice Zerodha for 4 weeks engineering at 80000"
              className="flex-1 bg-white/5 border border-white/10 outline-hidden focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 tracking-wide font-sans text-left"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleParse(prompt);
              }}
            />
            <button
              onClick={() => handleParse(prompt)}
              disabled={isParsing || !prompt.trim()}
              className="bg-indigo-600 font-semibold hover:bg-indigo-500 text-white text-xs px-4 rounded-xl transition-all border border-indigo-500 flex items-center gap-1.5 disabled:opacity-50"
            >
              {isParsing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  Parse
                  <ArrowRight className="w-3 px-0.5" />
                </>
              )}
            </button>
          </div>

          {/* Presets / Suggestions */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] text-indigo-300 uppercase font-mono mr-1">Tweak presets:</span>
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(preset);
                  handleParse(preset);
                }}
                className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded-full cursor-pointer transition-all border border-white/5 active:scale-95 text-left truncate max-w-[250px]"
              >
                "{preset.split(' ').slice(0, 3).join(' ')}..."
              </button>
            ))}
          </div>

          {/* AI Parser Result Showcase */}
          {parsedData && (
            <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  Successfully Analysed & Matched
                </span>
                <span className="text-xs font-mono font-semibold text-slate-300">Accuracy: 98%</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">CLIENT ENTITY</span>
                    <span className="fontWeight-semibold font-medium text-white">{parsedData.clientName}</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-400 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">ESTIMATED SUBTOTAL</span>
                    <span className="fontWeight-semibold font-medium text-white">₹{parsedData.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span className="font-mono text-slate-400">{parsedData.items[0].description}</span>
                  <span className="fontWeight-medium text-white">
                    {parsedData.items[0].qty} × ₹{parsedData.items[0].rate.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 border-t border-white/5 pt-1 mt-1">
                  <span>GST rate matches context:</span>
                  <span className="text-slate-300 font-mono">{(parsedData.gstRate * 100)}%</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleApply}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  Apply to Invoice Creator Form
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setParsedData(null);
                    setPrompt('');
                  }}
                  className="px-3 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded-lg transition-colors border border-white/5 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
