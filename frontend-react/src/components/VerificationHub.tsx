import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Clock, ShieldCheck, ArrowRight, UploadCloud, Check } from 'lucide-react';
import { VerificationStep } from '../types';

interface VerificationHubProps {
  steps: VerificationStep[];
  onUpdateStep: (id: string, status: 'locked' | 'pending' | 'verified') => void;
}

export default function VerificationHub({ steps, onUpdateStep }: VerificationHubProps) {
  const [activeStepId, setActiveStepId] = useState<string | null>('v-gst');
  const [inputValue, setInputValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeStep = steps.find(s => s.id === activeStepId);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsVerifying(true);
    setFeedback(null);

    // Simulate verification delay
    setTimeout(() => {
      setIsVerifying(false);
      if (activeStepId === 'v-gst' && !inputValue.toUpperCase().startsWith('27') && inputValue.length !== 15) {
        setFeedback('Invalid GSTIN format. Standard Indian GSTIN should be 15 characters (e.g., 27AABCR5544B2ZS).');
      } else {
        onUpdateStep(activeStepId!, 'verified');
        setFeedback('Successfully verified and linked with Government GST systems securely!');
        setInputValue('');
      }
    }, 1500);
  };

  const currentProgress = Math.round(
    (steps.filter(s => s.status === 'verified').length / steps.length) * 100
  );

  return (
    <div id="verification-hub" className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden transition-all duration-300">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-semibold text-slate-900 font-sans tracking-tight">Compliance & KYC Desk</h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Verify identity and register active tax mandates to ensure transparent billing, zero withholding holding periods, and accurate TDS claims.
          </p>
        </div>

        {/* Progress tracker */}
        <div className="flex flex-col items-end gap-1.5 min-w-[200px]">
          <div className="flex justify-between w-full text-xs font-semibold">
            <span className="text-slate-600">Verification Progress</span>
            <span className="text-emerald-700">{currentProgress}% Done</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${currentProgress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Status: {currentProgress === 100 ? 'Fully Compliant' : 'Awaiting Details'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* Step list */}
        <div className="p-6 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Required Assurances</h3>
          
          {steps.map((step) => {
            const isSelected = activeStepId === step.id;
            
            return (
              <button
                key={step.id}
                onClick={() => {
                  setActiveStepId(step.id);
                  setFeedback(null);
                  setInputValue('');
                }}
                className={`w-full text-left p-4 rounded-xl transition-all border ${
                  isSelected 
                    ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs' 
                    : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                } flex items-start gap-3`}
              >
                <div className="mt-0.5">
                  {step.status === 'verified' && (
                    <span className="text-emerald-600">
                      <CheckCircle2 className="w-5 h-5 fill-emerald-50" />
                    </span>
                  )}
                  {step.status === 'pending' && (
                    <span className="text-amber-500 pulsing-dot">
                      <Clock className="w-5 h-5" />
                    </span>
                  )}
                  {step.status === 'locked' && (
                    <span className="text-slate-400">
                      <AlertCircle className="w-5 h-5" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-emerald-950 font-medium' : 'text-slate-800'}`}>
                      {step.title}
                    </p>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      step.status === 'verified' 
                        ? 'bg-emerald-100 text-emerald-800 font-semibold' 
                        : 'bg-amber-100 text-amber-800 font-semibold'
                    }`}>
                      {step.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{step.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Step Details & Interaction Area */}
        <div className="p-6 bg-slate-50/50 flex flex-col justify-between">
          {activeStep ? (
            <div className="space-y-4">
              <div className="mb-4">
                <span className="inline-block text-[10px] font-mono uppercase bg-slate-200/75 px-2 py-1 rounded-md text-slate-600 mb-2">
                  {activeStep.type} Regulation Setup
                </span>
                <h4 className="text-base font-semibold text-slate-900 mb-1">{activeStep.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{activeStep.description}</p>
              </div>

              {activeStep.status === 'verified' ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex flex-col items-center text-center space-y-2">
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-full">
                    <Check className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-semibold text-emerald-950">Successfully Verified & Authenticated</h5>
                  <p className="text-xs text-emerald-800 max-w-xs">
                    This compliance checks matches active system records. No further action is required from you at this time.
                  </p>
                  <button 
                    onClick={() => {
                      onUpdateStep(activeStep.id, 'pending');
                      setFeedback(null);
                    }} 
                    className="mt-2 text-xs text-emerald-700 underline hover:text-emerald-900"
                  >
                    Reset verification (Simulation test)
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerify} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {activeStep.id === 'v-pan' && 'Enter 10-Digit PAN (e.g. ABCDE1234F)'}
                      {activeStep.id === 'v-gst' && 'Enter 15-Digit GSTIN (e.g. 27AABCR5544B2ZS)'}
                      {activeStep.id === 'v-bank' && 'Enter IFSC / Account Number'}
                      {activeStep.id === 'v-lut' && 'Upload Signed Letter of Undertaking File (.pdf)'}
                    </label>

                    {activeStep.type === 'LUT' ? (
                      <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/20 transition-all rounded-xl p-6 text-center cursor-pointer">
                        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <span className="text-xs font-semibold text-slate-700 block">Click or Drag PDF to upload</span>
                        <span className="text-[10px] text-slate-400">Valid for Current Financial Year (FY26-27)</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsVerifying(true);
                            setTimeout(() => {
                              setIsVerifying(false);
                              onUpdateStep(activeStep.id, 'verified');
                            }, 1200);
                          }}
                          className="mt-3 inline-flex items-center text-xs bg-slate-900 text-white font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Auto-Simulate PDF Upload
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={
                            activeStep.id === 'v-pan' ? 'ABCDE1234F' :
                            activeStep.id === 'v-gst' ? '27AABCR5544B2ZS' :
                            'Account details/IFSC'
                          }
                          className="w-full text-xs font-mono tracking-wider bg-white border border-slate-200 outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-slate-800"
                        />
                      </div>
                    )}
                  </div>

                  {activeStep.type !== 'LUT' && (
                    <button
                      type="submit"
                      disabled={isVerifying || !inputValue.trim()}
                      className="w-full py-2.5 bg-emerald-600 font-semibold hover:bg-emerald-700 text-white rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed justify-self-end mt-2"
                    >
                      {isVerifying ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Matching Government Databases...
                        </>
                      ) : (
                        <>
                          Run Secure Verification
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </form>
              )}

              {feedback && (
                <div className={`p-3 rounded-lg text-xs leading-normal font-medium ${
                  feedback.includes('Successfully') 
                    ? 'bg-emerald-100/55 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-100'
                }`}>
                  {feedback}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <ShieldCheck className="w-12 h-12 stroke-1 mb-2" />
              <p className="text-xs">Select a compliance step on the left to review or submit verification records.</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>🛡️ Audited with 256-bit NSDL & GSTN direct integrations</span>
            <span className="font-mono text-emerald-700">ONLINE v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
