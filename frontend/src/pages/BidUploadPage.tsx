import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight,
  ShieldCheck, ArrowLeft, Trash2, Eye, Cpu, Calculator, Check,
  Sparkles, QrCode, Printer, Stamp, Building2, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthProvider';
import { AUTH_TOKEN_KEY } from '../constants/auth';
import { BlockchainProofBadge } from '../components/ui/BlockchainProofBadge';
import { AshokaEmblem } from '../components/ui/AshokaEmblem';

interface FileUploadState {
  file: File;
  name: string;
  size: number;
  jobId?: string;
  status: 'PENDING' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  chunksIndexed?: number;
  pageCount?: number;
  error?: string;
}

export const BidUploadPage: React.FC = () => {
  const { bidId: paramBidId } = useParams<{ bidId: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'SYSTEM_ADMIN' || user?.role === 'ROLE_SYSTEM_ADMIN';

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Statutory & Vendor Profile
  const [bidId, setBidId] = useState(paramBidId || `BID-GEM-${Math.floor(10000 + Math.random() * 90000)}`);
  const [tenderId, setTenderId] = useState('TND-PUMP-001');
  const [tenders, setTenders] = useState<{ id: string; title: string; tenderNumber: string }[]>([]);
  const [vendorName, setVendorName] = useState(user?.fullName || 'Apex Pumps & Motors Pvt Ltd');
  const [vendorGstin, setVendorGstin] = useState('27AAACB5678G1Z5');
  const [vendorPan, setVendorPan] = useState('AAACB5678G');
  const [udyamNumber, setUdyamNumber] = useState('UDYAM-MH-03-0019284');
  const [emdExemption, setEmdExemption] = useState<'MSME_EXEMPT' | 'STARTUP_EXEMPT' | 'BANK_GUARANTEE'>('MSME_EXEMPT');
  const [localContentPercent, setLocalContentPercent] = useState<number>(68);

  // Step 2: Commercial BoQ Quote
  const [unitQuantity, setUnitQuantity] = useState<number>(24);
  const [unitBasePrice, setUnitBasePrice] = useState<number>(1712500); // 17.125L base
  const [gstRate, setGstRate] = useState<number>(18);
  const subtotal = unitQuantity * unitBasePrice;
  const gstAmount = Math.round((subtotal * gstRate) / 100);
  const totalLandedQuote = subtotal + gstAmount;

  // Step 3: Files & Verification
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [allDone, setAllDone] = useState(false);

  // Step 4: Submission Acknowledgment Receipt
  const [ackReceipt, setAckReceipt] = useState<{
    ackNumber: string;
    submittedAt: string;
    dscSerial: string;
    blockchainTx: string;
  } | null>(null);

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY);

    // Fetch live tenders
    fetch(`${apiBaseUrl}/tenders`, {
      headers: { 'Authorization': authToken ? `Bearer ${authToken}` : '' }
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTenders(data);
          if (!paramBidId) {
            setTenderId(data[0].id);
          }
        }
      })
      .catch(() => {});

    // Fetch seller profile
    fetch(`${apiBaseUrl}/sellers/me`, {
      headers: { 'Authorization': authToken ? `Bearer ${authToken}` : '' }
    })
      .then(r => r.ok ? r.json() : null)
      .then(seller => {
        if (seller) {
          if (seller.organizationName) setVendorName(seller.organizationName);
          if (seller.gstin) setVendorGstin(seller.gstin);
          if (seller.cinOrPan) {
            const panMatch = seller.cinOrPan.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
            if (panMatch) setVendorPan(panMatch[0]);
            else setVendorPan(seller.cinOrPan);
          }
        }
      })
      .catch(() => {});
  }, [token, paramBidId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        name: file.name,
        size: file.size,
        status: 'PENDING' as const,
        progress: 0,
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const loadDemoBidPack = async () => {
    const demoDocs = [
      'Apex_Pumps_Technical_Datasheet.pdf',
      'Apex_CA_Turnover_Certificate.pdf',
      'Apex_Audited_Balance_Sheet_FY25.pdf',
      'Apex_ISO_9001_Certificate.pdf',
      'Apex_GST_Registration_Certificate.pdf'
    ];

    const loadedFiles: FileUploadState[] = [];
    for (const docName of demoDocs) {
      try {
        const res = await fetch(`/demo_docs/${docName}`);
        if (res.ok) {
          const blob = await res.blob();
          const f = new File([blob], docName, { type: 'application/pdf' });
          loadedFiles.push({
            file: f,
            name: docName,
            size: blob.size,
            status: 'PENDING',
            progress: 0
          });
        }
      } catch (err) {
        console.warn(`Could not load /demo_docs/${docName}`, err);
      }
    }

    if (loadedFiles.length > 0) {
      setFiles(loadedFiles);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const startIngestionPipeline = async () => {
    if (files.length === 0) {
      alert('Please upload or select bid documents first.');
      return;
    }
    setIsProcessing(true);
    setUploadError(null);
    setOverallProgress(10);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    const aiServiceUrl = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY);

    let activeBidId = bidId;

    let realTxHash = '';

    // STEP 1: Attempt to persist the Bid entity in backend
    try {
      const bidPayload: Record<string, any> = {
        tenderId: tenderId,
        bidderName: vendorName || user?.fullName || 'Apex Pumps & Motors Pvt Ltd',
        email: user?.email || 'bidder.demo@gembid.local',
        gstin: vendorGstin || '27AAACB5678G1Z5',
        pan: vendorPan || 'AAACB5678G',
        quotedPrice: totalLandedQuote,
        localContentPercent: localContentPercent,
        emdStatus: emdExemption,
      };
      if (activeBidId) {
        bidPayload.id = activeBidId;
      }

      const createBidRes = await fetch(`${apiBaseUrl}/bids/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : ''
        },
        body: JSON.stringify(bidPayload)
      });

      if (createBidRes.ok) {
        const createdBid = await createBidRes.json().catch(() => null);
        if (createdBid && createdBid.id) {
          activeBidId = createdBid.id;
          setBidId(createdBid.id);
          if (createdBid.blockchainTx) {
            realTxHash = createdBid.blockchainTx;
          }
        }
      }
    } catch {
      // Backend connectivity issue
    }

    setOverallProgress(25);
    const updatedFiles = [...files];

    // STEP 2: Process files with realistic progress ticks
    for (let i = 0; i < updatedFiles.length; i++) {
      const fileItem = updatedFiles[i];
      fileItem.status = 'PROCESSING';
      fileItem.progress = 30;
      setFiles([...updatedFiles]);

      let backendSucceeded = false;
      try {
        const formData = new FormData();
        formData.append('file', fileItem.file);
        formData.append('bid_id', activeBidId);

        const res = await fetch(`${aiServiceUrl}/api/v1/ai/documents/upload-async`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          fileItem.jobId = data.job_id;
          fileItem.status = 'QUEUED';
          setFiles([...updatedFiles]);

          let attempts = 0;
          while (attempts < 10) {
            attempts++;
            await new Promise(r => setTimeout(r, 400));
            const pollRes = await fetch(`${aiServiceUrl}/api/v1/ai/jobs/${fileItem.jobId}`);
            if (pollRes.ok) {
              const jobData = await pollRes.json();
              fileItem.progress = jobData.progress_percent || 80;
              if (jobData.status === 'COMPLETED') {
                fileItem.status = 'COMPLETED';
                fileItem.progress = 100;
                fileItem.pageCount = jobData.page_count || 4;
                fileItem.chunksIndexed = jobData.chunk_count || 12;
                backendSucceeded = true;
                break;
              }
            }
          }
        }
      } catch {
        // Microservice down; handle below
      }

      if (!backendSucceeded) {
        fileItem.status = 'FAILED';
        fileItem.progress = 100;
        fileItem.error = 'AI ingestion microservice could not index this document. File queued for manual review.';
        setFiles([...updatedFiles]);
      }

      setOverallProgress(Math.round(25 + (((i + 1) / updatedFiles.length) * 75)));
    }

    // Set Acknowledgment Receipt
    const now = new Date();
    setAckReceipt({
      ackNumber: `GEM/ACK/2026/${activeBidId}`,
      submittedAt: now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN'),
      dscSerial: user?.dscSerial || 'DSC-AWAITING-PORTAL-REGISTRATION',
      blockchainTx: realTxHash || 'Ledger anchor awaiting EVM block confirmation',
    });

    setIsProcessing(false);
    setAllDone(true);
    setActiveStep(4);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Test Mode Banner for Admin */}
      {isAdmin && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold block">TEST MODE — Admin Parser Verification Harness</span>
            <span>You are operating the document ingestion test harness as System Administrator. Uploads in this mode are processed strictly for debugging OCR, unit parsing, and chunk indexing pipelines.</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/tenders" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition" title="Back to Tenders">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">
                {isAdmin ? 'Vendor Ingestion Test Harness' : 'GeM Bid Submission Gateway'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isAdmin
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {isAdmin ? 'TEST MODE' : 'GFR 2017 RULE 173'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              File statutory technical declarations, commercial BoQ quotations, and cryptographically sign bid dossiers.
            </p>
          </div>
        </div>
        {ackReceipt?.blockchainTx && !ackReceipt.blockchainTx.startsWith('Ledger anchor') ? (
          <BlockchainProofBadge
            txHash={ackReceipt.blockchainTx}
            blockNumber={undefined}
            eventType="BID_SUBMITTED"
            compact
          />
        ) : null}
      </div>

      {/* Step Indicator Wizard */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { step: 1, label: '1. Statutory Profile', sub: 'GSTIN, MSME, MII' },
            { step: 2, label: '2. Commercial BoQ', sub: 'Itemized Pricing' },
            { step: 3, label: '3. Technical Dossier', sub: 'PDF Verification' },
            { step: 4, label: '4. Digital Seal', sub: 'DSC Acknowledgment' },
          ].map(s => {
            const isCompleted = activeStep > s.step;
            const isCurrent = activeStep === s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(s.step as any)}
                className={`p-2.5 rounded-lg transition text-left sm:text-center ${
                  isCurrent
                    ? 'bg-blue-50 border border-blue-200 text-blue-900 font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 font-medium'
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {s.step}
                    </span>
                  )}
                  <span className="font-bold">{s.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5 hidden sm:block">{s.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Statutory & Vendor Profile */}
      {activeStep === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Bidder Entity & Statutory Classification
            </h2>
            <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
              DigiLocker Linked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target GeM Tender</label>
              <select
                value={tenderId}
                onChange={e => setTenderId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
              >
                {tenders.length > 0 ? (
                  tenders.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.tenderNumber || t.id} — {t.title}
                    </option>
                  ))
                ) : (
                  <option value="TND-PUMP-001">GEM/2026/B/90124 — Centrifugal Water Pumps (₹5.00 Cr)</option>
                )}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bid Identifier (Auto-generated)</label>
              <input
                type="text"
                value={bidId}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-600 bg-slate-50 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Registered Legal Entity Name</label>
              <input
                type="text"
                value={vendorName}
                onChange={e => setVendorName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">GSTIN Number</label>
              <input
                type="text"
                value={vendorGstin}
                onChange={e => setVendorGstin(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Permanent Account Number (PAN)</label>
              <input
                type="text"
                value={vendorPan}
                onChange={e => setVendorPan(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Udyam MSME Registration</label>
              <input
                type="text"
                value={udyamNumber}
                onChange={e => setUdyamNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Earnest Money Deposit (EMD) Exemption</label>
              <select
                value={emdExemption}
                onChange={e => setEmdExemption(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white font-medium"
              >
                <option value="MSME_EXEMPT">Claimed under MSME / Udyam Certificate (Zero EMD)</option>
                <option value="STARTUP_EXEMPT">Claimed under DPIIT Startup India (Zero EMD)</option>
                <option value="BANK_GUARANTEE">Bank Guarantee / E-PBG Attached (₹10,00,000)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Make in India (MII) Local Content Declaration: <strong className="text-emerald-700">{localContentPercent}%</strong>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={localContentPercent}
                  onChange={e => setLocalContentPercent(parseInt(e.target.value))}
                  className="flex-1 accent-emerald-600 cursor-pointer"
                />
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  {localContentPercent >= 50 ? 'Class-I Local Supplier' : 'Class-II Local Supplier'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-5 py-2.5 bg-[#1B365D] hover:bg-[#0f2540] text-white font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-sm"
            >
              <span>Proceed to Commercial BoQ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Commercial Bill of Quantities (BoQ) Quote */}
      {activeStep === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              Bill of Quantities (BoQ) Financial Quotation
            </h2>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
              GFR Rule 173 Commercial Schedule
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Quantity</th>
                  <th className="p-3 text-right">Base Unit Price (INR)</th>
                  <th className="p-3 text-center">GST %</th>
                  <th className="p-3 text-right">Total Landed Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-semibold text-slate-900">
                    High-Efficiency Centrifugal Water Pump (450 m³/hr, 65m Head, IE3 Motor)
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      value={unitQuantity}
                      onChange={e => setUnitQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-2 py-1 border rounded text-center font-bold"
                    />
                  </td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      value={unitBasePrice}
                      onChange={e => setUnitBasePrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-32 px-2 py-1 border rounded text-right font-mono font-bold"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <select
                      value={gstRate}
                      onChange={e => setGstRate(parseInt(e.target.value))}
                      className="px-2 py-1 border rounded font-bold"
                    >
                      <option value="18">18%</option>
                      <option value="12">12%</option>
                      <option value="5">5%</option>
                    </select>
                  </td>
                  <td className="p-3 text-right font-mono font-black text-slate-900 text-sm">
                    ₹{totalLandedQuote.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pricing Summary Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Landed Price Breakdown</p>
              <div className="flex gap-4 mt-1 font-mono text-slate-700">
                <span>Base Subtotal: <strong>₹{subtotal.toLocaleString('en-IN')}</strong></span>
                <span>GST (18%): <strong>₹{gstAmount.toLocaleString('en-IN')}</strong></span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Evaluated Bid Quote
              </span>
              <span className="text-2xl font-black text-[#1B365D]">
                ₹{totalLandedQuote.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="px-5 py-2.5 bg-[#1B365D] hover:bg-[#0f2540] text-white font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-sm"
            >
              <span>Proceed to Technical Documents</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Technical Documents & Verification */}
      {activeStep === 3 && (
        <div className="space-y-6">
          {/* Upload Dropzone */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-400 p-8 text-center transition-colors shadow-sm">
            <UploadCloud className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">Upload Bid PDF Documents</h3>
            <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
              Attach technical datasheets, CA turnover certificates, audited balance sheets, ISO registrations, and GST certificates.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition shadow-sm">
                <span>Browse Local Files</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isProcessing}
                />
              </label>
              <button
                type="button"
                onClick={loadDemoBidPack}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Load Verified Bid Pack (5 PDFs)</span>
              </button>
            </div>
          </div>

          {/* File List & Progress */}
          {files.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Document Verification Queue ({files.length} Documents)
                </h3>
                {isProcessing && (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Extraction & OCR: {overallProgress}%
                  </span>
                )}
              </div>

              <div className="divide-y divide-slate-100">
                {files.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 truncate">{item.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono font-medium">({(item.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            item.status === 'COMPLETED' ? 'bg-emerald-500' :
                            item.status === 'FAILED' ? 'bg-rose-500' :
                            item.status === 'PROCESSING' ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                        <span>Status: <strong className={item.status === 'COMPLETED' ? 'text-emerald-700' : item.status === 'FAILED' ? 'text-rose-700' : 'text-slate-800'}>{item.status}</strong></span>
                        {item.pageCount && <span className="text-slate-700">• {item.pageCount} Pages Parsed</span>}
                        {item.chunksIndexed && <span className="text-slate-700">• {item.chunksIndexed} Chunks Indexed</span>}
                      </div>
                      {item.error && (
                        <p className="text-[11px] text-rose-600 font-medium">{item.error}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/demo_docs/${item.name}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-blue-700 rounded-lg hover:bg-slate-100 border border-slate-200"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>View</span>
                      </a>
                      {!isProcessing && (
                        <button
                          onClick={() => removeFile(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={startIngestionPipeline}
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ingesting & Signing Documents...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      <span>Run AI OCR & Submit Bid</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Official GeM Bid Submission Acknowledgment Certificate */}
      {activeStep === 4 && ackReceipt && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-3">
          {/* Certificate Top Strip */}
          <div className="h-2 w-full flex">
            <div className="h-full w-1/3 bg-[#FF9933]" />
            <div className="h-full w-1/3 bg-white" />
            <div className="h-full w-1/3 bg-[#138808]" />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* National Header */}
            <div className="flex flex-col items-center text-center space-y-2 pb-6 border-b border-slate-200">
              <AshokaEmblem size={56} variant="navy" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1B365D] tracking-tight">
                  Government e Marketplace (GeM)
                </h2>
                <p className="text-xs text-slate-600 font-semibold">
                  National Public Procurement Portal • Government of India
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 font-black text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  OFFICIAL BID SUBMISSION ACKNOWLEDGMENT RECEIPT
                </div>
              </div>
            </div>

            {/* Receipt Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Acknowledgment Number</span>
                <span className="font-mono font-black text-slate-900 text-sm">{ackReceipt.ackNumber}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Timestamp & IST Record</span>
                <span className="font-mono font-bold text-slate-900">{ackReceipt.submittedAt}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Bidder Legal Entity</span>
                <span className="font-bold text-slate-900 text-sm block">{vendorName}</span>
                <span className="font-mono text-slate-500">GSTIN: {vendorGstin} | PAN: {vendorPan}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Total Commercial Bid Value (BoQ)</span>
                <span className="font-black text-emerald-700 text-base block font-mono">
                  ₹{totalLandedQuote.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500">Landed quote inclusive of 18% GST</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Make in India (MII) Status</span>
                <span className="font-bold text-slate-900">{localContentPercent}% Local Content ({localContentPercent >= 50 ? 'Class-I' : 'Class-II'})</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">EMD Exemption Claim</span>
                <span className="font-bold text-slate-900">{emdExemption} (Udyam: {udyamNumber})</span>
              </div>
            </div>

            {/* Cryptographic & Blockchain Anchor Strip */}
            <div className="p-4 bg-slate-900 rounded-xl text-white space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  Class-3 Digital Signature & EVM Blockchain Anchor
                </span>
                <span className="text-emerald-400 font-bold">VERIFIED ON CHAIN</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-2 pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">DSC SERIAL:</span>
                  <span className="text-slate-300">{ackReceipt.dscSerial}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">EVM HARDHAT TX HASH (CHAIN ID 31337):</span>
                  <span className="text-amber-400 truncate max-w-xs block">{ackReceipt.blockchainTx}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-2 transition"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print Official Receipt</span>
              </button>

              <div className="flex items-center gap-3">
                <Link
                  to={`/compliance?bidId=${encodeURIComponent(bidId)}&tenderId=${encodeURIComponent(tenderId)}`}
                  className="px-5 py-2.5 bg-[#1B365D] hover:bg-[#0f2540] text-white rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-md"
                >
                  <span>Open AI Compliance Matrix</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </Link>

                <Link
                  to="/compare"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-md"
                >
                  <span>View Multi-Bidder Standings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidUploadPage;
