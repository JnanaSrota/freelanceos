import React, { useState } from 'react';
import { UserPlus, Search, HelpCircle, ShieldAlert, ArrowRight, Trash2, Check, Globe } from 'lucide-react';
import { Client } from '../types';
import { INDIAN_STATES } from '../data';

interface ClientsSectionProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export default function ClientsSection({ clients, onAddClient, onDeleteClient }: ClientsSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [stateCode, setStateCode] = useState('27'); // default Maharashtra
  const [isForeign, setIsForeign] = useState(false);
  const [tdsApplicable, setTdsApplicable] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newClient: Client = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      gstin: isForeign ? undefined : gstin.trim() || undefined,
      state: isForeign ? '99' : stateCode,
      isForeign,
      tdsApplicable,
      createdDate: new Date().toISOString().split('T')[0]
    };

    onAddClient(newClient);
    setSuccessMsg(`Client "${name}" added successfully!`);

    // Reset fields
    setName('');
    setEmail('');
    setGstin('');
    setIsForeign(false);
    setTdsApplicable(true);
    setIsAdding(false);

    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.state.includes(filterQuery)
  );

  return (
    <div className="space-y-6">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Client Directory</h2>
          <p className="text-xs text-slate-500">Configure accurate state mapping, GST and foreign remittance directives for billing compliance.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-700 font-semibold text-white px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-3xs"
        >
          <UserPlus className="w-4 h-4" />
          {isAdding ? "Collapse Form" : "Add New Client"}
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center gap-2 animate-fadeIn font-semibold">
          <Check className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Add Client Form Widget */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 border border-slate-100 rounded-2xl shadow-xs space-y-4 animate-slideDown">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mb-2">Create Legal Client Record</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trading Name (Full Legal Entity)</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Stripe Dev Systems Incorp"
                className="w-full text-xs bg-slate-50/50 border border-slate-200 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@corporate.com"
                className="w-full text-xs bg-slate-50/50 border border-slate-200 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-slate-800"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-xs font-semibold text-slate-700 mb-3 block">Tax Jurisdiction settings:</h5>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={isForeign}
                    onChange={(e) => {
                      const foreignVal = e.target.checked;
                      setIsForeign(foreignVal);
                      if (foreignVal) {
                        setGstin('');
                        setStateCode('99');
                        setTdsApplicable(false); // International clients don't withholding Indian TDS usually
                      } else {
                        setStateCode('27');
                        setTdsApplicable(true);
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded-sm focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>Foreign / Export Client (US, EU, etc.)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={tdsApplicable}
                    disabled={isForeign}
                    onChange={(e) => setTdsApplicable(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded-sm focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                  />
                  <span>Deduct TDS (Income tax withheld on payout — generally 10%)</span>
                </label>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-semibold text-slate-700 mb-3 block">State & Registration identification:</h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">State Jurisdiction</label>
                  <select
                    disabled={isForeign}
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-2 py-2 text-slate-800 disabled:opacity-50"
                  >
                    {Object.entries(INDIAN_STATES).map(([code, label]) => (
                      <option key={code} value={code}>
                        ({code}) {label.slice(0, 20)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Business GSTIN (Client)</label>
                  <input
                    type="text"
                    disabled={isForeign}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="27AABCR5544B2ZS"
                    className="w-full text-xs font-mono bg-white border border-slate-200 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 text-slate-800 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines info banners for fiscal transparency */}
          {isForeign ? (
            <div className="bg-teal-50 text-teal-800 border border-teal-100 p-3.5 rounded-xl text-xs space-y-1">
              <span className="font-semibold block flex items-center gap-1.5 text-teal-900">
                <Globe className="w-4 h-4 text-teal-600" />
                Zero-Rated Export Directives:
              </span>
              <p className="text-[11px] leading-relaxed">
                Billings to foreign clients require submitting a <strong>Letter of Undertaking (LUT)</strong> to avoid adding 18% IGST. Ensure the client's place of supply is set outside India and payments arrive in foreign convertible currencies.
              </p>
            </div>
          ) : (
            <div className="bg-indigo-50/50 text-indigo-950 border border-indigo-100/50 p-3.5 rounded-xl text-xs space-y-1">
              <span className="font-semibold block flex items-center gap-1.5 text-indigo-900">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                Domestic GST Rules checklist:
              </span>
              <p className="text-[11px] leading-relaxed">
                If the client shares the same state code as your workspace (e.g. Maharashtra state 27), the engine automates billing with CGST (9%) + SGST (9%). Otherwise, standard IGST (18%) is declared.
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 font-semibold text-white px-5 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Save Client Profile
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* Directory Records Display */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        
        {/* Search tool */}
        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center relative">
          <div className="absolute left-7 text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search directory by name, state code, or address email..."
            className="w-full text-xs bg-white border border-slate-200 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-9 pr-4 py-2 text-slate-700 placeholder-slate-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-100">
                <th className="py-3 px-6 font-semibold">Client Target</th>
                <th className="py-3 px-6 font-semibold">Jurisdiction</th>
                <th className="py-3 px-6 font-semibold">Identifications</th>
                <th className="py-3 px-6 font-semibold">Tax Treatment</th>
                <th className="py-3 px-6 font-semibold">Joined Date</th>
                <th className="py-3 px-6 font-semibold text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-800">{client.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{client.email}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-md font-mono text-[10px] items-center gap-1 font-semibold ${
                        client.isForeign ? 'bg-teal-50 text-teal-800 border border-teal-100' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {client.isForeign && <Globe className="w-2.5 h-2.5" />}
                        State {client.state} : {INDIAN_STATES[client.state]?.slice(0, 15) || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono font-medium text-slate-600 text-[11px]">
                      {client.gstin ? (
                        <span className="text-slate-800 font-semibold">{client.gstin}</span>
                      ) : (
                        <span className="text-slate-400 italic">No GSTIN registered</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          client.isForeign ? 'bg-sky-50 text-sky-800' : 'bg-indigo-50 text-indigo-800'
                        }`}>
                          {client.isForeign ? 'Export (GST Under LUT)' : 'Domestic Standard'}
                        </span>
                        {client.tdsApplicable && (
                          <span className="block text-[10px] text-teal-700 font-mono">
                            ✓ TDS Withholding Ready
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-500 whitespace-nowrap">{client.createdDate}</td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Remove "${client.name}" and erase their trade configurations?`)) {
                            onDeleteClient(client.id);
                          }
                        }}
                        className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors rounded-lg cursor-pointer"
                        title="Delete Client from directory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <UserPlus className="w-8 h-8 mx-auto stroke-1 text-slate-300 mb-2" />
                    <p className="text-xs">No clients found matching the query. Add a new corporate profile to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
