import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  LayoutDashboard, 
  Users, 
  Coins, 
  ShieldCheck, 
  LogOut, 
  Check, 
  FileSpreadsheet
} from 'lucide-react';
import { 
  loginUser, registerUser,
  fetchClients, createClient, deleteClient as deleteClientAPI,
  fetchInvoices, createInvoice,
  fetchTaxSummary, logTaxPayment
} from './api'
import { Client, Invoice, TaxPayment, VerificationStep, InvoiceStatus } from './types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_INVOICES, 
  INITIAL_TAX_PAYMENTS, 
  INITIAL_VERIFICATION_STEPS, 
  INDIAN_STATES 
} from './data';

import OverviewSection from './components/OverviewSection';
import ClientsSection from './components/ClientsSection';
import InvoicesSection from './components/InvoicesSection';
import TaxSection from './components/TaxSection';
import VerificationHub from './components/VerificationHub';

export default function App() {
  // Authentication & Workspace States
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('fos_is_logged') === 'true';
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('fos_user_name') || '';
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('fos_user_email') || '';
  });
  const [userStateCode, setUserStateCode] = useState(() => {
    return localStorage.getItem('fos_user_state') || '27'; // Default Maharashtra
  });
  const [userGstin, setUserGstin] = useState(() => {
    return localStorage.getItem('fos_user_gstin') ||  '';
  });
  
  // Registration Inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regState, setRegState] = useState('27');
  const [regGstin, setRegGstin] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // App domain states (In-Memory with LocalStorage support for fast edits persistence)
  const [clients, setClients] = useState<Client[]>(() => {
    return [];
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    return [];
  });

  const [taxPayments, setTaxPayments] = useState<TaxPayment[]>(() => {
    const saved = localStorage.getItem('fos_tax_payments');
    return saved ? JSON.parse(saved) : INITIAL_TAX_PAYMENTS;
  });

  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>(() => {
    const saved = localStorage.getItem('fos_verification_steps');
    return saved ? JSON.parse(saved) : INITIAL_VERIFICATION_STEPS;
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedInspectionInvoice, setSelectedInspectionInvoice] = useState<Invoice | null>(null);

  // Save states to localstorage whenever they change
  useEffect(() => {
    localStorage.setItem('fos_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('fos_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('fos_tax_payments', JSON.stringify(taxPayments));
  }, [taxPayments]);

  useEffect(() => {
    localStorage.setItem('fos_verification_steps', JSON.stringify(verificationSteps));
  }, [verificationSteps]);

  // Auth Operations
  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!loginEmail || !loginPassword) {
    setAuthError('Please fill in credentials.')
    return
  }
  const { ok, data } = await loginUser(loginEmail, loginPassword)
  if (ok) {
    setIsLoggedIn(true)
    localStorage.setItem('fos_is_logged', 'true')
    setAuthError(null)
  } else {
    setAuthError(data.detail || 'Login failed')
  }
}

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!regName || !regEmail || !regPassword) {
    setAuthError('Please fill in required fields.')
    return
  }
  const { ok, data } = await registerUser({
    name: regName,
    email: regEmail,
    password: regPassword,
    state_code: regState,
    initials: regName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
    gstin: regGstin || undefined
  })
  if (ok) {
    setUserName(regName)
    setUserEmail(regEmail)
    setUserStateCode(regState)
    if (regGstin) setUserGstin(regGstin.toUpperCase())
    setIsLoggedIn(true)
    localStorage.setItem('fos_is_logged', 'true')
    setAuthError(null)
  } else {
    setAuthError(data.detail || 'Registration failed')
  }
}

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('fos_is_logged');
    // Clear custom flags if needed but preserve directory
  };

  // State mutators passed to sections
  const addClient = async (newClient: Client) => {
  const created = await createClient({
    name: newClient.name,
    email: newClient.email,
    gstin: newClient.gstin || null,
    state_code: newClient.state,
    is_foreign: newClient.isForeign,
    tds_applicable: newClient.tdsApplicable
  })
  setClients([...clients, { ...newClient, id: String(created.id) }])
}

const deleteClient = async (id: string) => {
  await deleteClientAPI(Number(id))
  setClients(clients.filter(c => c.id !== id))
}

const loadClients = async () => {
  const data = await fetchClients()
  if (Array.isArray(data)) {
    setClients(data.map((c: any) => ({
      id: String(c.id),
      name: c.name,
      email: c.email,
      gstin: c.gstin,
      state: c.state_code,
      isForeign: c.is_foreign,
      tdsApplicable: c.tds_applicable,
      createdDate: c.created_at || ''
    })))
  }
}

useEffect(() => {
  if (isLoggedIn) loadClients()
}, [isLoggedIn])

const addInvoice = async (newInvoice: Invoice) => {
  const payload = {
    client_id: Number(newInvoice.clientId),
    invoice_date: newInvoice.invoiceDate,
    due_date: newInvoice.dueDate,
    items: newInvoice.items.map(i => ({
   description: i.description,
   quantity: i.qty,
   rate: i.rate,
      sac_code: '998314'
    }))
  }
  const created = await createInvoice(payload)
  setInvoices([{ ...newInvoice, id: String(created.id), invoiceNumber: created.invoice_number }, ...invoices])
}

const deleteInvoice = async (id: string) => {
  setInvoices(invoices.filter(inv => inv.id !== id))
}

const loadInvoices = async () => {
  const data = await fetchInvoices()
  if (Array.isArray(data)) {
    setInvoices(data.map((inv: any) => ({
      id: String(inv.id),
      clientId: String(inv.client_id),
      invoiceNumber: inv.invoice_number,
      date: inv.invoice_date,
      dueDate: inv.due_date,
      status: inv.status,
      items: [],
      subtotal: inv.subtotal,
      cgst: inv.cgst,
      sgst: inv.sgst,
      igst: inv.igst,
      tdsDeducted: inv.tds_deducted,
      totalPayable: inv.total_payable
    })))
  }
}

useEffect(() => {
  if (isLoggedIn) loadInvoices()
}, [isLoggedIn])


  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  const addTaxPayment = async (payment: TaxPayment) => {
  await logTaxPayment(payment.amount, payment.challanNumber)
  setTaxPayments([...taxPayments, payment])
}
  
  const loadTaxSummary = async () => {
  const data = await fetchTaxSummary()
  if (data && data.gross_income_ytd !== undefined) {
    setTaxPayments(prev => prev) // Tax summary handled in TaxSection directly
  }
}

useEffect(() => {
  if (isLoggedIn) loadTaxSummary()
}, [isLoggedIn])

  const updateVerificationStep = (id: string, status: 'locked' | 'pending' | 'verified') => {
    setVerificationSteps(verificationSteps.map(step => step.id === id ? { ...step, status } : step));
  };

  // Sync GSTIN step status with registration details
  useEffect(() => {
    if (userGstin) {
      setVerificationSteps(prev => prev.map(s => s.id === 'v-gst' ? { ...s, status: 'verified' } : s));
    }
  }, [userGstin]);

  // Auth Layout
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        
        {/* Dynamic lights details */}
        <span className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <span className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-xl p-8 relative z-20 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold font-mono tracking-wide">
              <Briefcase className="w-3.5 h-3.5" />
              FINTECH FOR MODERN FREELANCERS
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight font-sans text-white">FreelanceOS</h1>
            <p className="text-xs text-slate-400">GST, TDS withholding, and Presumptive Tax calculation engine unified.</p>
          </div>

          {/* Form auth mode tabs */}
          <div className="flex bg-slate-800/60 rounded-xl p-1 text-xs">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(null); }}
              className={`flex-1 py-2 rounded-lg cursor-pointer transition-colors font-semibold ${authMode === 'login' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
            >
              Secure Login
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(null); }}
              className={`flex-1 py-2 rounded-lg cursor-pointer transition-colors font-semibold ${authMode === 'register' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
            >
              Sign Up Workspace
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl leading-normal text-center font-medium">
              ⚠️ {authError}
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Registered Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full text-xs bg-slate-800 border border-slate-700 outline-hidden focus:border-indigo-550 rounded-xl px-4 py-3 text-white placeholder-slate-500"
                  placeholder="name@consulting.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full text-xs bg-slate-800 border border-slate-700 outline-hidden focus:border-indigo-550 rounded-xl px-4 py-3 text-white placeholder-slate-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white rounded-xl text-xs transition-transform transform active:scale-98 cursor-pointer mt-2"
              >
                Enter Portal Workspace
              </button>

              <div className="bg-slate-800/40 p-3 rounded-xl text-[10px] text-slate-400 text-center leading-normal">
                💡 Testing credentials generated automatically. Click <strong>Enter Portal Workspace</strong> to jump right into the analytics interface.
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full text-xs bg-slate-800 border border-slate-700 outline-hidden focus:border-indigo-500 rounded-xl px-3 py-2.5 text-white"
                    placeholder="e.g. Prince Pal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Login email</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full text-xs bg-slate-800 border border-slate-700 outline-hidden focus:border-indigo-500 rounded-xl px-3 py-2.5 text-white"
                    placeholder="prince@corp.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full text-xs bg-slate-800 border border-slate-700 outline-hidden focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Jurisdiction State</label>
                  <select
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full text-xs bg-slate-800 border border-slate-700 outline-hidden focus:border-indigo-500 rounded-xl px-3 py-2.5 text-white"
                  >
                    {Object.entries(INDIAN_STATES).map(([code, label]) => (
                      <option key={code} value={code}>({code}) {label.slice(0,18)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Business GSTIN (Optional)</label>
                <input
                  type="text"
                  maxLength={15}
                  value={regGstin}
                  onChange={(e) => setRegGstin(e.target.value.toUpperCase())}
                  className="w-full text-xs font-mono bg-slate-800 border border-slate-700 outline-hidden focus:border-indigo-150 rounded-xl px-3 py-2.5 text-white"
                  placeholder="27AAOPS1144K2ZR"
                />
                <span className="text-[10px] text-slate-500 block mt-1">If input, state CGST/SGST computations dynamically adapt.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-650 hover:bg-slate-900 font-semibold text-white rounded-xl text-xs transition-colors mt-2 cursor-pointer"
              >
                Initialize Setup & Log In
              </button>
            </form>
          )}
        </div>

        <div className="text-[10px] text-slate-600 mt-6 z-20 flex items-center gap-1 leading-normal text-center block">
          <span>🔒 Sandbox secured & 256-bit NSDL & GSTN direct integrations simulations verified</span>
        </div>
      </div>
    );
  }

  // Dashboard Layout
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        
        {/* Dynamic Navigation Rails Left Side */}
        <aside className="w-full md:w-56 bg-slate-900 text-white p-5 flex flex-col justify-between shrink-0 select-none">
        
        <div className="space-y-6">
          {/* Logo brand */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shrink-0">
              <div className="w-4 h-4 border-2 border-white rotate-45"></div>
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white font-sans uppercase">Freelance<span className="text-teal-400">OS</span></h2>
              <span className="text-[9px] uppercase font-mono text-teal-400 block tracking-widest font-semibold">Workspace</span>
            </div>
          </div>

          {/* User brief widget */}
          <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center font-sans border border-teal-500 shrink-0">
              {userName.split(' ').map(n=>n[0]).join('')}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">{userName}</span>
              <span className="text-[9px] text-slate-400 font-mono block uppercase">State: {userStateCode} ({INDIAN_STATES[userStateCode]?.slice(0, 7)}...)</span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <nav className="flex flex-col gap-1.5 font-medium">
            <button
              onClick={() => { setActiveTab('overview'); setSelectedInspectionInvoice(null); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs rounded-xl cursor-pointer transition-colors ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-2xs font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Metrics Overview</span>
            </button>

            <button
              onClick={() => { setActiveTab('clients'); setSelectedInspectionInvoice(null); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs rounded-xl cursor-pointer transition-colors ${activeTab === 'clients' ? 'bg-indigo-600 text-white shadow-2xs font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Client Profiles</span>
            </button>

            <button
              onClick={() => { setActiveTab('invoices'); setSelectedInspectionInvoice(null); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs rounded-xl cursor-pointer transition-colors ${activeTab === 'invoices' ? 'bg-indigo-600 text-white shadow-2xs font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Invoice Ledger</span>
            </button>

            <button
              onClick={() => { setActiveTab('tax'); setSelectedInspectionInvoice(null); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs rounded-xl cursor-pointer transition-colors ${activeTab === 'tax' ? 'bg-indigo-600 text-white shadow-2xs font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Coins className="w-4 h-4 shrink-0" />
              <span>Advance Taxes</span>
            </button>

            <button
              onClick={() => { setActiveTab('verification'); setSelectedInspectionInvoice(null); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs rounded-xl cursor-pointer transition-colors ${activeTab === 'verification' ? 'bg-indigo-600 text-white shadow-2xs font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Compliance KYC</span>
            </button>
          </nav>

        </div>

        {/* Footer controls inside sidebar */}
        <div className="pt-6 border-t border-white/5 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Close Workspace</span>
          </button>
          <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider text-center block leading-normal">
            FreelanceOS v2.4 • Active
          </div>
        </div>

      </aside>

      {/* Main viewport area right side */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Dynamic Context Header line */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div>
            <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-md uppercase font-mono">
              FINANCIAL DESK
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 capitalize font-display mt-1">
              {activeTab === 'overview' && 'Intelligent Accounting Dashboard'}
              {activeTab === 'clients' && 'Corporate Profiles Directory'}
              {activeTab === 'invoices' && 'GSTR Invoices Desk & AI Assistant'}
              {activeTab === 'tax' && 'Sec 44ADA Advance Tax calculations'}
              {activeTab === 'verification' && 'Compliance & NSDL Verification Desk'}
            </h1>
          </div>

          {/* Quick status signals */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-650">
            <span className="flex items-center gap-1.5 p-1 px-2.5 bg-emerald-50 text-emerald-800 border border-emerald-250 rounded-xl">
              <span className="w-1.5 h-1.5 bg-emerald-450 rounded-full pulsing-dot" />
              ITD PAN Mapped
            </span>
            {userGstin ? (
              <span className="flex items-center gap-1.5 p-1 px-2.5 bg-emerald-50 text-emerald-800 border border-emerald-250 rounded-xl">
                <span className="w-1.5 h-1.5 bg-emerald-450 rounded-full" />
                GSTIN {userGstin.slice(0, 2)}... Verified
              </span>
            ) : (
              <button 
                onClick={() => setActiveTab('verification')}
                className="flex items-center gap-1 p-1 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-250 rounded-xl cursor-pointer"
              >
                ⚠️ Complete GST KYC
              </button>
            )}
          </div>
        </header>

        {/* Core dynamic section view loaders */}
        <div className="animate-fadeIn">
          {activeTab === 'overview' && (
            <OverviewSection 
              clients={clients} 
              invoices={invoices} 
              onNavigateTo={setActiveTab} 
              onSelectInvoice={setSelectedInspectionInvoice} 
            />
          )}

          {activeTab === 'clients' && (
            <ClientsSection 
              clients={clients} 
              onAddClient={addClient} 
              onDeleteClient={deleteClient} 
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesSection 
              clients={clients} 
              invoices={invoices} 
              selectedInspectionInvoice={selectedInspectionInvoice}
              onSetInspectionInvoice={setSelectedInspectionInvoice}
              onAddInvoice={addInvoice} 
              onDeleteInvoice={deleteInvoice} 
              onUpdateInvoiceStatus={updateInvoiceStatus}
              workspaceStateCode={userStateCode} 
            />
          )}

          {activeTab === 'tax' && (
            <TaxSection 
              invoices={invoices} 
              taxPayments={taxPayments} 
              onAddTaxPayment={addTaxPayment} 
            />
          )}

          {activeTab === 'verification' && (
            <VerificationHub 
              steps={verificationSteps} 
              onUpdateStep={updateVerificationStep} 
            />
          )}
        </div>

      </main>
      </div>

      {/* Bottom Info Rail */}
      <footer className="h-8 bg-slate-800 text-slate-400 text-[10px] px-8 flex items-center justify-between shrink-0 uppercase select-none font-sans font-medium tracking-wider">
        <div className="flex gap-6">
          <span>SYSTEM: <span className="text-emerald-400 font-bold">OPERATIONAL</span></span>
          <span>LAST SYNC: 2 MINS AGO</span>
        </div>
        <div className="flex gap-4">
          <span className="hover:text-white cursor-pointer transition-colors">PRIVACY POLICY</span>
          <span className="hover:text-white cursor-pointer transition-colors">SUPPORT CENTER</span>
          <span className="text-slate-500 font-mono">V2.4.18-STABLE</span>
        </div>
      </footer>
    </div>
  );
}
