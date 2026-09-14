import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  CreditCard,
  Key,
  CheckCircle2,
  FileText,
  Building2,
  ArrowRight,
  RefreshCw,
  Award,
  Check,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

import { AUTH_TOKEN_KEY } from '../constants/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const DIGILOCKER_DOCS = [
  { id: 'GSTN', name: 'GST Registration Certificate (Form GST REG-06)', issuer: 'Goods and Services Tax Network' },
  { id: 'PAN', name: 'PAN Verification Record', issuer: 'Income Tax Department / NSDL' },
  { id: 'MCA21', name: 'Certificate of Incorporation', issuer: 'Ministry of Corporate Affairs (MCA21)' },
  { id: 'UDYAM', name: 'Udyam MSME Registration Certificate', issuer: 'Ministry of Micro, Small & Medium Enterprises' },
  { id: 'DPIIT', name: 'Startup India Recognition Certificate', issuer: 'Department for Promotion of Industry and Internal Trade' },
  { id: 'BIS', name: 'BIS Standard Mark License (IS 1520:2002)', issuer: 'Bureau of Indian Standards' },
  { id: 'EPFO', name: 'EPFO Establishment & ECR Return Statement', issuer: 'Employees’ Provident Fund Organisation' },
  { id: 'ESIC', name: 'ESIC Employer Registration Certificate', issuer: 'Employees’ State Insurance Corporation' },
  { id: 'NSIC', name: 'Single Point Registration Scheme (SPRS)', issuer: 'National Small Industries Corporation' },
  { id: 'OEM', name: 'Direct OEM Manufacturer Certificate', issuer: 'GeM OEM Direct Registry' },
  { id: 'MII', name: 'Make in India Class-I Local Content Declaration', issuer: 'DPIIT Industrial Promotion' },
  { id: 'CCA', name: 'Class-3 Digital Signature Certificate (DSC)', issuer: 'Controller of Certifying Authorities (CCA)' },
  { id: 'DEBARMENT', name: 'Vigilance & Non-Debarment Clearance', issuer: 'Ministry of Finance / DoE' }
];

export const DigiLockerSimulationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sellerId = searchParams.get('sellerId') || 'me';

  // Step state: 1: Auth, 2: OTP, 3: Consent, 4: Synchronizing, 5: Complete
  const [step, setStep] = useState<number>(1);
  const [authMethod, setAuthMethod] = useState<'AADHAAR' | 'MOBILE'>('AADHAAR');
  const [identifier, setIdentifier] = useState<string>('9876 5432 1098');
  const [pin, setPin] = useState<string>('123456');
  const [otp, setOtp] = useState<string>('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>(DIGILOCKER_DOCS.map(d => d.id));
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncStatusText, setSyncStatusText] = useState<string>('Connecting to DigiLocker National Gateway...');
  const [error, setError] = useState<string | null>(null);

  const toggleDoc = (id: string) => {
    if (selectedDocs.includes(id)) {
      setSelectedDocs(selectedDocs.filter(d => d !== id));
    } else {
      setSelectedDocs([...selectedDocs, id]);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || pin.length < 6) {
      setError('Please enter a valid 12-digit Aadhaar / Mobile number and 6-digit Security PIN.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleConsentSubmit = async () => {
    setStep(4);
    setSyncProgress(15);
    setSyncStatusText('Establishing cryptographically secure TLS 1.3 connection to DigiLocker HSM...');

    setTimeout(() => {
      setSyncProgress(45);
      setSyncStatusText('Retrieving 13 digitally signed XML certificates from National Vault...');
    }, 800);

    setTimeout(() => {
      setSyncProgress(75);
      setSyncStatusText('Validating CCA Class-3 Digital Signatures and Tamper Seals...');
    }, 1600);

    setTimeout(async () => {
      setSyncProgress(95);
      setSyncStatusText('Anchoring verifiable credentials on GeM Central Compliance Ledger...');

      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        await fetch(`${API_BASE_URL}/sellers/${encodeURIComponent(sellerId)}/digilocker-sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            consentedDocs: selectedDocs,
            aadhaarRef: identifier,
            transactionId: `DL-TXN-${Date.now()}`
          })
        });
      } catch (err) {
        console.warn('Backend sync note:', err);
      }

      setSyncProgress(100);
      setStep(5);
    }, 2400);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* DigiLocker Official Government Banner */}
      <header className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-xl shadow-xs">
              DL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-blue-900 tracking-tight">DigiLocker</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                  Simulation Gateway
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                National Digital Locker System • Ministry of Electronics & IT (MeitY), Government of India
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encryption</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl w-full mx-auto p-4 my-8 flex-1">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Simulation Header Notice */}
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-blue-300 uppercase block">
                  Interactive Sandbox Environment
                </span>
                <h1 className="text-lg font-bold mt-0.5">GeM Verifiable Credential Gateway</h1>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            </div>
            <p className="text-xs text-blue-200 mt-2 leading-relaxed">
              Authenticate your identity to retrieve official statutory records directly from Central Government issuers into your GeM vendor compliance profile.
            </p>
          </div>

          {/* Stepper Wizard Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-semibold text-slate-500">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-blue-700 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-blue-700 text-white' : 'bg-slate-200'}`}>1</span>
              <span>Identity</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-blue-700 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-blue-700 text-white' : 'bg-slate-200'}`}>2</span>
              <span>2FA OTP</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-blue-700 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-blue-700 text-white' : 'bg-slate-200'}`}>3</span>
              <span>Consent</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <div className={`flex items-center gap-1.5 ${step >= 5 ? 'text-emerald-700 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 5 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>4</span>
              <span>Verified</span>
            </div>
          </div>

          {/* Step 1: Authentication */}
          {step === 1 && (
            <div className="p-6 space-y-5">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAuthMethod('AADHAAR')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${authMethod === 'AADHAAR' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'}`}
                >
                  <CreditCard className="w-3.5 h-3.5 inline mr-1.5" />
                  Aadhaar / Virtual ID
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('MOBILE')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${authMethod === 'MOBILE' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'}`}
                >
                  <Smartphone className="w-3.5 h-3.5 inline mr-1.5" />
                  Mobile Number
                </button>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {authMethod === 'AADHAAR' ? '12-Digit Aadhaar / Virtual ID (VID):' : 'Registered Mobile Number:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder={authMethod === 'AADHAAR' ? 'xxxx xxxx xxxx' : '+91 98765 43210'}
                    className="w-full text-sm font-mono font-semibold border border-slate-300 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Pre-filled with simulated test authorized director credentials</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    6-Digit DigiLocker Security PIN:
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="••••••"
                    className="w-full text-sm font-mono tracking-widest font-bold border border-slate-300 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                    {error}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Sign In & Generate OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: 2FA OTP */}
          {step === 2 && (
            <div className="p-6 space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-base font-bold text-slate-900">Two-Factor Authentication (2FA)</h2>
                <p className="text-xs text-slate-500">
                  Enter the 6-digit One-Time Password sent to your Aadhaar-linked mobile ending in <strong className="text-slate-800 font-mono">**9810</strong>
                </p>
              </div>

              <form onSubmit={handleStep2Submit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="849201"
                    className="w-full text-center text-2xl font-mono tracking-[0.5em] font-bold border-2 border-blue-600 rounded-xl p-3 bg-white focus:outline-none shadow-sm"
                  />
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOtp('849201')}
                    className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Click to Autofill Simulation OTP (849201)
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                    {error}
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    Verify OTP & Proceed
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Consent & Document Selection */}
          {step === 3 && (
            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">Statutory Consent & Document Access</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  GeM (Government e-Marketplace) is requesting authorized access to the following 13 statutory documents in your DigiLocker vault:
                </p>
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {DIGILOCKER_DOCS.map(doc => {
                  const isChecked = selectedDocs.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className="p-3 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center text-xs ${isChecked ? 'bg-blue-700 text-white' : 'border border-slate-300'}`}>
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{doc.name}</p>
                          <p className="text-[10px] text-slate-400">{doc.issuer}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        CCA SIGNED
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                <strong>Purpose of Access:</strong> Verification of statutory bid compliance under GFR 2017 & Public Procurement Policy for Micro & Small Enterprises Order.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConsentSubmit}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Grant Consent & Retrieve Credentials</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Cryptographic Synchronization */}
          {step === 4 && (
            <div className="p-10 text-center space-y-5">
              <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">Cryptographic Gateway In Progress</h3>
                <p className="text-xs font-mono text-slate-600">{syncStatusText}</p>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-700 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Direct statutory handshake with Controller of Certifying Authorities (CCA) HSM
              </p>
            </div>
          )}

          {/* Step 5: Verification Completed */}
          {step === 5 && (
            <div className="p-8 text-center space-y-5 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">DigiLocker Verification Successful!</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  All 13 statutory documents have been cryptographically verified and anchored into your central GeM vendor profile.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left max-w-md mx-auto bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Seller Standing</span>
                  <span className="font-bold text-emerald-700">VERIFIED VENDOR</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Updated Trust Score</span>
                  <span className="font-black text-emerald-600 text-base">96.5%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Credentials Verified</span>
                  <span className="font-bold text-slate-800">13 of 13 Registries</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">CCA Digital Signature</span>
                  <span className="font-bold text-emerald-700">Class-3 DSC Anchored</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/sellers/me')}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Return to GeM Vendor Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-400">
        DigiLocker Simulation Gateway • Compliant with Information Technology Act, 2000 (Section 4) • GeM Procurement Sandbox
      </footer>
    </div>
  );
};
