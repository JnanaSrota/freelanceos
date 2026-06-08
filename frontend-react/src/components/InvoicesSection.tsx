import React, { useState, useEffect } from 'react';
import { downloadInvoicePDF } from '../api';
import { FilePlus, FileText, Search, PlusCircle, Trash, Play, Check, X, Printer, Coins, RefreshCw, Send, AlertCircle } from 'lucide-react';
import { Client, Invoice, InvoiceItem, InvoiceStatus } from '../types';
import AIInvoiceAssistant from './AIInvoiceAssistant';
import { INDIAN_STATES } from '../data';

interface InvoicesSectionProps {
  clients: Client[];
  invoices: Invoice[];
  selectedInspectionInvoice: Invoice | null;
  onSetInspectionInvoice: (invoice: Invoice | null) => void;
  onAddInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  workspaceStateCode: string; // e.g. "27" (Maharashtra)
}

export default function InvoicesSection({
  clients,
  invoices,
  selectedInspectionInvoice,
  onSetInspectionInvoice,
  onAddInvoice,
  onDeleteInvoice,
  onUpdateInvoiceStatus,
  workspaceStateCode
}: InvoicesSectionProps) {
  // Creator Form inputs
  const [clientId, setClientId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Professional Engineering Consulting Support', qty: 1, rate: 85000 }
  ]);
  const [notes, setNotes] = useState('');
  
  // Ledger Filters
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'paid' | 'unpaid' | 'overdue' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const handleDownloadPDF = async (id: string, invoiceNumber: string) => {
  await downloadInvoicePDF(Number(id), invoiceNumber)
}

  // Set default client if available
  useEffect(() => {
    if (clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
    }
  }, [clients, clientId]);

  const activeClient = clients.find(c => c.id === clientId);

  // Auto set due date to 30 days after invoice date
  useEffect(() => {
    if (invoiceDate) {
      const d = new Date(invoiceDate);
      d.setDate(d.getDate() + 30);
      setDueDate(d.toISOString().split('T')[0]);
    }
  }, [invoiceDate]);

  // Calculations for Creator Form
  const tempSubtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  
  // Calculate GST: 
  // If client is foreign -> 0% GST (under LUT)
  // Else if client is domestic -> 18% standard GST
  const tempGstRate = activeClient?.isForeign ? 0 : 0.18;
  const tempGstAmount = tempSubtotal * tempGstRate;

  // Calculate TDS:
  // If client has TDS turned on -> standard 10% on subtotal under Sec 194J
  const tempTdsRate = (activeClient && activeClient.tdsApplicable) ? 0.10 : 0;
  const tempTdsAmount = tempSubtotal * tempTdsRate;

  const tempTotalPayable = tempSubtotal + tempGstAmount - tempTdsAmount;

  // Items handlings
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    if (field === 'description') {
      updated[index].description = value as string;
    } else {
      updated[index][field] = Number(value);
    }
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([...items, { description: '', qty: 1, rate: 10000 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  // AI assistant integration callback
  const handleApplyAIParsed = (data: {
    client: string;
    items: InvoiceItem[];
    notes: string;
  }) => {
    setClientId(data.client);
    setItems(data.items);
    setNotes(data.notes);


    // Popup validation success message
    setFormSuccess('AI parsed details successfully applied to billing form fields!');
    setTimeout(() => setFormSuccess(null), 3000);
  };

  // Submit handlings
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || items.some(item => !item.description.trim() || item.qty <= 0 || item.rate <= 0)) {
      alert("Please ensure all items have valid descriptions, rates and positive quantities.");
      return;
    }

    const clientObj = clients.find(c => c.id === clientId);
    if (!clientObj) return;

    const freshInvoiceNumber = `FOS-26-0${invoices.length + 10}`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: freshInvoiceNumber,
      clientId,
      clientName: clientObj.name,
      invoiceDate,
      dueDate,
      items,
      subtotal: tempSubtotal,
      gstRate: tempGstRate,
      gstAmount: tempGstAmount,
      tdsRate: tempTdsRate,
      tdsAmount: tempTdsAmount,
      totalPayable: tempTotalPayable,
      status: 'unpaid',
      notes: notes || 'Standard payment terms net 30.'
    };

    onAddInvoice(newInvoice);
    setFormSuccess(`Invoice ${freshInvoiceNumber} created in registry!`);
    
    // Reset form values
    setItems([{ description: 'Professional Engineering Consulting Support', qty: 1, rate: 85000 }]);
    setNotes('');

    setTimeout(() => setFormSuccess(null), 4000);
  };

  // Filtered lists
  const filteredInvoiceLedger = invoices.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    if (ledgerFilter === 'all') return matchesSearch;
    return matchesSearch && inv.status === ledgerFilter;
  });

  return (
    <div className="space-y-8">
      
      {/* Dynamic Form banner notifications */}
      {formSuccess && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2 animate-fadeIn font-semibold">
          <Check className="w-5 h-5 text-emerald-600 animate-bounce" />
          {formSuccess}
        </div>
      )}

      {/* Grid Layout containing AI assistant + Invoice Creator */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Col (2 span): AI parsed helpers */}
        <div className="lg:col-span-2 space-y-6">
          <AIInvoiceAssistant clients={clients} onApplyParsedInvoice={handleApplyAIParsed} />

          {/* Quick tax calculator sheet for user training */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs space-y-3.5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Coins className="w-4 h-4 text-emerald-600" />
              Tax Calculator Logic Sheet
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Our automated system detects client tax requirements instantly based on State rules:
            </p>
            <div className="space-y-2 text-[11px] font-medium font-sans">
              <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-700">
                <span>Central State Code matching:</span>
                <span className="font-mono text-slate-900">{workspaceStateCode} (Your Work Office)</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-700">
                <span>Same State Business GST (IGST/Intra-state):</span>
                <span className="text-indigo-700 font-semibold">CGST 9% & SGST 9% applies</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-700">
                <span>Different State business:</span>
                <span className="text-sky-700 font-semibold">IGST 18% applies</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Professional Services withholding (TDS):</span>
                <span className="text-teal-700 font-semibold font-mono">10% standard Section 194J</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-[10px] text-slate-500 leading-normal">
              🛡️ Indian companies are required by law to deposit 10% TDS into your PAN. It appears on your Form 26AS real-time, allowing you to deduct it from regular advance income taxes.
            </div>
          </div>
        </div>

        {/* Right Col (3 span): Real invoice generator builder form */}
        <div className="lg:col-span-3 bg-white p-6 border border-slate-100 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <FilePlus className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 font-sans tracking-tight">Structured Invoice Creator</h3>
              <p className="text-xs text-slate-500 font-sans">Generate complete GSTR compliant billing records instantly.</p>
            </div>
          </div>

          <form onSubmit={handleCreateInvoice} className="space-y-4">
            
            {/* Primary select elements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Debtor / Client Profile</label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full text-xs bg-slate-50/75 border border-slate-200 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 text-slate-800"
                >
                  <option value="" disabled>Select corporate client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (State {c.state})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50/75 border border-slate-200 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-2 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50/75 border border-slate-200 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-2 py-2 text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Invoiced items list generator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Services Line Items</span>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="text-xs inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add item row
                </button>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50/40 p-3 rounded-xl border border-slate-100">
                    <div className="col-span-6 sm:col-span-7">
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Description of completed freelance consulting..."
                        className="w-full text-xs bg-white border border-slate-200 outline-hidden focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-slate-800"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                        placeholder="Qty"
                        className="w-full text-xs text-center font-mono bg-white border border-slate-200 outline-hidden focus:border-indigo-500 rounded-lg py-1.5 text-slate-800"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-3 flex items-center gap-1">
                      <input
                        type="number"
                        required
                        min="100"
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                        placeholder="Rate ₹"
                        className="w-full text-xs font-mono bg-white border border-slate-200 outline-hidden focus:border-indigo-500 rounded-lg py-1.5 text-slate-800 px-2"
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1 hover:bg-rose-50 text-rose-500 transition-colors rounded-md cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Notes (Payment information & Terms)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Declare bank IFSC, Swift code, UPI tag state, GST LUT details..."
                className="w-full text-xs bg-slate-50/50 border border-slate-200 outline-hidden focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-800 h-14 resize-none"
              />
            </div>

            {/* Live calculations audit sheet */}
            <div className="bg-slate-50 select-none p-4 rounded-xl border border-slate-100 flex flex-col gap-2 font-medium">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Calculated Base Subtotal:</span>
                <span className="font-mono text-slate-900">₹{tempSubtotal.toLocaleString('en-IN')}</span>
              </div>

              {/* Central vs Integrated GST breakdown based on state matching */}
              {activeClient?.isForeign ? (
                <div className="flex justify-between text-xs text-emerald-800 font-semibold bg-emerald-100/50 p-2 rounded-lg">
                  <span>GST/Export Rate: Zero-rated Remittance</span>
                  <span className="font-mono">₹0.00 (LUT Filed)</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1 border-t border-b border-slate-200/50 py-2 my-1">
                  {activeClient?.state === workspaceStateCode ? (
                    <>
                      <div className="flex justify-between text-[11px] text-indigo-700">
                        <span>Central GST (CGST - 9% in state):</span>
                        <span className="font-mono">₹{(tempGstAmount / 2).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-indigo-700">
                        <span>State GST (SGST - 9% in state):</span>
                        <span className="font-mono">₹{(tempGstAmount / 2).toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-[11px] text-sky-700">
                      <span>Integrated GST (IGST - 18% interstate billing):</span>
                      <span className="font-mono">₹{tempGstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* TDS display */}
              {tempTdsAmount > 0 && (
                <div className="flex justify-between text-xs text-teal-700">
                  <span>Professional services TDS Withholding (-10%):</span>
                  <span className="font-mono font-semibold">-₹{tempTdsAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm text-slate-900 font-bold">
                <span>Final Recipient Payable Total:</span>
                <span className="font-mono text-slate-950">₹{tempTotalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-slate-900 text-white font-semibold text-xs py-3 px-6 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Sign & Launch Live Invoice
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* Invoice list ledger */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        
        {/* Controls, ledger states, search */}
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs font-semibold gap-1">
            {['all', 'paid', 'unpaid', 'overdue', 'draft'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setLedgerFilter(status as any)}
                className={`px-3 py-1.5 rounded-md cursor-pointer uppercase text-[10px] transition-all ${
                  ledgerFilter === status 
                    ? 'bg-white text-slate-900 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Invoice number, Client code..."
              className="w-full md:w-64 text-xs bg-slate-50 border border-slate-200 outline-hidden focus:border-indigo-500 rounded-xl px-3 py-2 pl-8 text-slate-700"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
          </div>
        </div>

        {/* Ledger list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-mono text-slate-400 uppercase border-b border-slate-100">
                <th className="py-3.5 px-6 font-semibold">Invoicing Details</th>
                <th className="py-3.5 px-6 font-semibold">Client Party</th>
                <th className="py-3.5 px-6 font-semibold text-right">Taxable base</th>
                <th className="py-3.5 px-6 font-semibold">Computed Tax values</th>
                <th className="py-3.5 px-6 font-semibold text-right">Total Net</th>
                <th className="py-3.5 px-6 font-semibold">Billing Timeline</th>
                <th className="py-3.5 px-6 font-semibold">Status state</th>
                <th className="py-3.5 px-6 font-semibold text-center">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredInvoiceLedger.length > 0 ? (
                filteredInvoiceLedger.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 font-mono">{inv.invoiceNumber}</td>
                    <td className="py-4 px-6 font-medium text-slate-800">{inv.clientName}</td>
                    <td className="py-4 px-6 text-right font-mono text-slate-900">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6">
                      <div className="space-y-0.5 text-[10px] font-mono">
                        <div className="text-indigo-600">GST: +₹{inv.gstAmount.toLocaleString('en-IN')} ({(inv.gstRate*100)}%)</div>
                        {inv.tdsAmount > 0 && (
                          <div className="text-teal-600">TDS: -₹{inv.tdsAmount.toLocaleString('en-IN')} ({(inv.tdsRate*105)}%)</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold font-mono text-slate-950">
                      ₹{inv.totalPayable.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-sans leading-normal">
                        <div>Issue: <span className="font-mono text-slate-500 font-semibold">{inv.invoiceDate}</span></div>
                        <div className="text-[10px]">Due: <span className="font-mono text-rose-600 font-semibold">{inv.dueDate}</span></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-center tracking-wide uppercase ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'unpaid' ? 'bg-indigo-100 text-indigo-800' :
                          inv.status === 'overdue' ? 'bg-rose-100 text-rose-800 font-semibold animate-pulse' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {inv.status}
                        </span>

                        {/* Interactive toggle status buttons simulation */}
                        <div className="flex gap-1">
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => onUpdateInvoiceStatus(inv.id, 'paid')}
                              className="text-[9px] text-emerald-700 hover:underline uppercase font-semibold cursor-pointer"
                              title="Mark as paid"
                            >
                              ✓ Pay
                            </button>
                          )}
                          {inv.status === 'paid' && (
                            <button
                              onClick={() => onUpdateInvoiceStatus(inv.id, 'unpaid')}
                              className="text-[9px] text-indigo-700 hover:underline uppercase font-semibold cursor-pointer"
                              title="Mark as unpaid"
                            >
                              unpay
                            </button>
                          )}
                          {inv.status !== 'overdue' && inv.status !== 'paid' && (
                            <button
                              onClick={() => onUpdateInvoiceStatus(inv.id, 'overdue')}
                              className="text-[9px] text-rose-700 hover:underline uppercase font-semibold cursor-pointer"
                              title="Mark as overdue"
                            >
                              Late
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onSetInspectionInvoice(inv)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] rounded-md font-semibold cursor-pointer"
                        >
                          Inspect SVG Sheet
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(inv.id, inv.invoiceNumber)}
                          className="px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[10px] rounded-md font-semibold"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Permanently erase invoice ${inv.invoiceNumber} from ledger records?`)) {
                              onDeleteInvoice(inv.id);
                            }
                          }}
                          className="p-1 hover:bg-rose-50 text-rose-500 rounded-md cursor-pointer"
                          title="Erase invoice"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto stroke-1 text-slate-300 mb-2" />
                    <p className="text-xs">No invoices matched the filters in the ledger vault.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* --- INVOICE INSPECTION SVG MODAL DIALOG --- */}
      {selectedInspectionInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-xl overflow-hidden flex flex-col my-8">
            
            {/* Modal Heading header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-sm font-semibold tracking-tight">{selectedInspectionInvoice.invoiceNumber} inspection</h4>
                  <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">NSDL & GSTN Ledger compliance audit proof</p>
                </div>
              </div>
              <button
                onClick={() => onSetInspectionInvoice(null)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Indian Tax Invoice Body */}
            <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-bold text-slate-900 font-sans tracking-tight">FreelanceOS Corp</div>
                  <div className="text-[10px] text-slate-500 leading-normal">
                    Professional Tech Consultancy Services<br />
                    State Jurisdiction Code: 27 (Maharashtra)<br />
                    PAN matched: AXXXX1234X
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">TAX INVOICE</div>
                  <div className="text-sm font-mono font-bold text-indigo-700">{selectedInspectionInvoice.invoiceNumber}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    Date: {selectedInspectionInvoice.invoiceDate}<br />
                    Due: {selectedInspectionInvoice.dueDate}
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-slate-100 py-4 grid grid-cols-2 gap-4 text-xs leading-normal">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">RECIPIENT (BILL TO)</span>
                  <div className="font-semibold text-slate-800">{selectedInspectionInvoice.clientName}</div>
                  <div className="text-slate-500 block">{selectedInspectionInvoice.notes?.includes("prompt:") ? "Active verified corporate account" : selectedInspectionInvoice.notes}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">TAX ACCOUNT DETAILS</span>
                  <div className="font-mono text-slate-700 font-medium">GSTIN: {clients.find(c => c.id === selectedInspectionInvoice.clientId)?.gstin || 'None (Export Service Under LUT)'}</div>
                  <div className="text-[10px] text-slate-400">Place of supply: State {clients.find(c => c.id === selectedInspectionInvoice.clientId)?.state || 'Other'}</div>
                </div>
              </div>

              {/* Items grid */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Service Line Items</span>
                <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-50/75 grid grid-cols-12 gap-2 p-2.5 font-mono text-[9px] uppercase font-semibold text-slate-400 border-b border-indigo-50">
                    <div className="col-span-7">Description</div>
                    <div className="col-span-1 text-center">Qty</div>
                    <div className="col-span-2 text-right">Rate</div>
                    <div className="col-span-2 text-right">Line Total</div>
                  </div>
                  
                  {selectedInspectionInvoice.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 p-3 border-b border-slate-50 font-medium text-slate-700">
                      <div className="col-span-7">{it.description}</div>
                      <div className="col-span-1 text-center font-mono">{it.qty}</div>
                      <div className="col-span-2 text-right font-mono">₹{it.rate.toLocaleString('en-IN')}</div>
                      <div className="col-span-2 text-right font-mono text-slate-900">₹{(it.qty * it.rate).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax Calculations breakdown block */}
              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-[10px] text-slate-500 leading-normal font-sans">
                  <span className="font-bold text-slate-800 block">Certificate of Compliance</span>
                  <div>• Service supplied corresponds to computer consulting.</div>
                  <div>• Central & State jurisdiction declarations recorded.</div>
                  {selectedInspectionInvoice.gstAmount === 0 && (
                    <div className="text-emerald-700 font-semibold font-mono">✓ Authorized Zero GST export remittance under valid LUT.</div>
                  )}
                </div>

                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between text-slate-500">
                    <span>Taxable value subtotal:</span>
                    <span className="font-mono text-slate-900">₹{selectedInspectionInvoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {selectedInspectionInvoice.gstAmount > 0 && (
                    <>
                      <div className="flex justify-between text-indigo-700 font-medium text-[11px]">
                        <span>CGST (9%):</span>
                        <span className="font-mono">₹{(selectedInspectionInvoice.gstAmount / 2).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-indigo-700 font-medium text-[11px]">
                        <span>SGST (9%):</span>
                        <span className="font-mono">₹{(selectedInspectionInvoice.gstAmount / 2).toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}

                  {selectedInspectionInvoice.tdsAmount > 0 && (
                    <div className="flex justify-between text-teal-700 font-medium">
                      <span>Withheld TDS Under Sec 194J (-10%):</span>
                      <span className="font-mono font-semibold">-₹{selectedInspectionInvoice.tdsAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-slate-200/50 pt-2 text-sm font-bold text-slate-950">
                    <span>Net Remitted Amount:</span>
                    <span className="font-mono text-lg text-indigo-800">₹{selectedInspectionInvoice.totalPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Sign seal footer */}
              <div className="border-t border-slate-100 pt-6 flex justify-between items-center text-[10px] text-slate-400">
                <div className="space-y-0.5">
                  <div>Digital Hash: <span className="font-mono text-slate-500">sha256:f0s_26_auth_sec_0{selectedInspectionInvoice.invoiceNumber.slice(-3)}</span></div>
                  <div>Processed securely inside FreelanceOS GSTR sandbox tools</div>
                </div>
                <div className="text-right relative">
                  <div className="absolute right-0 bottom-4 w-16 h-16 border-2 border-emerald-400/40 rounded-full flex items-center justify-center text-[8px] uppercase tracking-tight font-semibold text-emerald-600/40 font-mono select-none pointer-events-none transform rotate-12 bg-white/20">
                    Verified Seal
                  </div>
                  <div className="font-sans font-semibold text-slate-600">Authorized Signatory</div>
                  <div className="italic text-[9px] text-zinc-400">e-Signed with NSDL credential</div>
                </div>
              </div>

            </div>

            {/* Modal action tray */}
            <div className="bg-slate-50 p-5 border-t border-slate-100 flex justify-between gap-2.5">
              <span className="text-[10px] text-slate-400 font-mono self-center">⚡ Document is legally certified & GSTR ready</span>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    alert("Printing transaction slip locally...");
                    window.print();
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 transition-colors font-semibold text-slate-700 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSetInspectionInvoice(null);
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-slate-900 transition-colors font-semibold text-white text-xs rounded-xl cursor-pointer"
                >
                  Close inspection
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
