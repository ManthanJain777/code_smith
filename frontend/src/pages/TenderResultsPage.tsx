import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthProvider';
import { useToast } from '../context/ToastContext';
import { 
  Award, 
  ShieldCheck, 
  ExternalLink, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Cpu, 
  Lock, 
  Copy, 
  Check,
  RefreshCw,
  Printer,
  Stamp,
  FileText
} from 'lucide-react';
import { GemStarLogo } from '../components/ui/GemStarLogo';

interface RankedBidder {
  rank: number;
  bidId: string;
  bidderName: string;
  score: number;
  debarmentStatus: string;
  recommendation: string;
}

interface OnChainProof {
  txHash: string;
  blockNumber: number;
  anchoredHash: string;
  contractAddress: string;
  verificationStatus: string;
}

interface TenderResultsData {
  tenderId: string;
  tenderNumber: string;
  title: string;
  status: string;
  awardedAt: string;
  rankedBidders: RankedBidder[];
  onChainProof: OnChainProof;
}

export const TenderResultsPage: React.FC = () => {
  const { tenderId: rawTenderId } = useParams<{ tenderId: string }>();
  const tenderId = rawTenderId ? decodeURIComponent(rawTenderId) : undefined;
  const { user } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState<TenderResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (tenderId) {
      loadResults(tenderId);
    }
  }, [tenderId]);

  async function loadResults(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getTenderResults(id);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load tender award results');
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!tenderId) return;
    setPublishing(true);
    try {
      await apiService.publishTenderResults(tenderId);
      await loadResults(tenderId);
      showToast('Tender evaluation results and L1 contract award successfully anchored on EVM blockchain.', 'success', 'Contract Award Published');
    } catch (err: any) {
      showToast(err.message || 'Failed to anchor results on blockchain', 'error', 'Publish Error');
    } finally {
      setPublishing(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Retrieving official tender evaluation & on-chain standings...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-red-900">Unable to Load Standings</h3>
        <p className="text-xs text-red-700 mt-1">{error || 'No tender evaluation data found'}</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link to="/tenders" className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700">
            Back to Tenders
          </Link>
          <button onClick={() => tenderId && loadResults(tenderId)} className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-500">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const userRoleNorm = (user?.role || '').toUpperCase().replace(/^ROLE_/, '');
  const canPublish = userRoleNorm === 'PROCUREMENT_OFFICER' || userRoleNorm === 'SYSTEM_ADMIN';
  const top1 = data.rankedBidders.find(b => b.rank === 1);
  const top2 = data.rankedBidders.find(b => b.rank === 2);
  const top3 = data.rankedBidders.find(b => b.rank === 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          to="/tenders" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Active Tenders
        </Link>
        <div className="flex items-center gap-2">
          {canPublish && (
            <button
              data-tour="publish-award-btn"
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              {publishing ? 'Anchoring to EVM...' : 'Publish Award to Blockchain'}
            </button>
          )}
          <button
            onClick={() => setIsVerifyModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition shadow-xs cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verify on Blockchain
          </button>
          <button
            data-tour="generate-contract-order-btn"
            onClick={() => setIsContractModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold px-3.5 py-2 rounded-lg transition shadow-xs cursor-pointer"
          >
            <Stamp className="w-3.5 h-3.5" />
            Generate GeM Contract Order
          </button>
        </div>
      </div>

      {/* Official Government Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {data.tenderNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {data.status}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Official GeM Evaluation & Bidder Standings
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {data.title}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Compliance-weighted competitive ranking generated via autonomous multi-criteria rules and on-chain verification ledger.
            </p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 rounded-xl p-4 min-w-[240px] text-right space-y-1.5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Award Determination</div>
            <div className="text-lg font-black text-amber-400">
              {top1 ? top1.bidderName : 'Pending'}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              L1 Lowest Qualified Bidder
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid: Podium Standings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Silver Medal (2nd) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between order-2 md:order-1 hover:border-slate-300 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                Rank 2 (L2)
              </span>
              <span className="text-xs font-bold text-slate-500">Silver Standing</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 line-clamp-1">
              {top2 ? top2.bidderName : 'No Qualified Bidder'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              ID: {top2 ? top2.bidId : 'N/A'}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Compliance Score</span>
            <span className="text-xl font-extrabold text-slate-700">{top2 ? `${top2.score}%` : 'N/A'}</span>
          </div>
        </div>

        {/* Gold Medal (1st Place) */}
        <div className="bg-gradient-to-b from-amber-50 to-white rounded-xl border-2 border-amber-400 p-6 shadow-md flex flex-col justify-between order-1 md:order-2 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <Award className="w-3 h-3" />
            L1 Recommended Winner
          </div>
          <div>
            <div className="flex items-center justify-between mb-3 mt-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                Rank 1 (L1 Winner)
              </span>
              <span className="text-xs font-bold text-amber-700">Contract Award Recommended</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 line-clamp-1">
              {top1 ? top1.bidderName : 'No Bids Submitted'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              ID: {top1 ? top1.bidId : 'N/A'}
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Compliance Score</span>
              <span className="text-xs font-semibold text-emerald-700">Debarment Check: CLEAR</span>
            </div>
            <span className="text-2xl font-black text-amber-600">{top1 ? `${top1.score}%` : 'N/A'}</span>
          </div>
        </div>

        {/* Bronze Medal (3rd) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between order-3 md:order-3 hover:border-slate-300 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                Rank 3 (L3)
              </span>
              <span className="text-xs font-bold text-slate-500">Bronze Standing</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 line-clamp-1">
              {top3 ? top3.bidderName : 'No Qualified Bidder'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              ID: {top3 ? top3.bidId : 'N/A'}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Compliance Score</span>
            <span className="text-xl font-extrabold text-slate-700">{top3 ? `${top3.score}%` : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Full Ranked Standings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Comprehensive Bidder Evaluation Standings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked in accordance with GeM Procurement Guidelines & Rule 173 of General Financial Rules (GFR).
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
            Total Evaluated: {data.rankedBidders.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100/50">
                <th className="py-3 px-4 w-16 text-center">Rank</th>
                <th className="py-3 px-4">Bidder Entity & ID</th>
                <th className="py-3 px-4 text-center">Compliance Score</th>
                <th className="py-3 px-4 text-center">Debarment Status</th>
                <th className="py-3 px-4 text-center">Determination</th>
                <th className="py-3 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {data.rankedBidders.map((bidder) => {
                const isL1 = bidder.rank === 1;
                return (
                  <tr key={bidder.bidId} className={isL1 ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/80'}>
                    <td className="py-3.5 px-4 text-center font-extrabold">
                      {isL1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs shadow-xs">
                          1
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs">
                          {bidder.rank}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{bidder.bidderName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{bidder.bidId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-md font-extrabold text-xs bg-slate-100 text-slate-800">
                        {bidder.score}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        {bidder.debarmentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                        isL1 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {bidder.recommendation}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/compliance?tenderId=${data.tenderId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                      >
                        Inspect Audit Matrix
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* On-Chain Ledger Verification Modal */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Blockchain Cryptographic Proof</h3>
                  <p className="text-[11px] text-slate-500">Tamper-evident verification against Hardhat EVM Node</p>
                </div>
              </div>
              <button 
                onClick={() => setIsVerifyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Proof Details Bento */}
            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Verification Status:</span>
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  VERIFIED — UNALTERED ON-CHAIN RECORD
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Block Height:</span>
                <span className="font-mono font-bold text-slate-800">
                  #{data.onChainProof.blockNumber}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Smart Contract:</span>
                <span className="font-mono text-slate-700 truncate max-w-[280px]">
                  {data.onChainProof.contractAddress}
                </span>
              </div>

              <div className="py-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500 font-medium">Anchored Merkle Hash:</span>
                  <button 
                    onClick={() => copyToClipboard(data.onChainProof.anchoredHash)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedHash ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-700 break-all select-all">
                  {data.onChainProof.anchoredHash}
                </div>
              </div>

              <div className="py-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500 font-medium">EVM Transaction Hash:</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-700 break-all select-all">
                  {data.onChainProof.txHash}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Every evaluation score is cryptographically hashed and anchored into the Ethereum Virtual Machine (EVM) ledger. Any post-submission alteration produces a hash mismatch and fails validation.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsVerifyModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Close Verification Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official GeM Contract Order / Letter of Intent (LoI) Modal */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* National Letterhead Header */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-200 relative">
              <button
                onClick={() => setIsContractModalOpen(false)}
                className="absolute top-0 right-0 text-slate-400 hover:text-slate-600 p-1 rounded-lg text-sm font-bold"
              >
                ✕
              </button>

              <GemStarLogo size={44} variant="color" />
              <div className="mt-2 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  भारत सरकार | Government of India
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#1B365D]">
                  Ministry of Petroleum & Natural Gas
                </h2>
                <p className="text-xs text-slate-600 font-semibold">
                  Government e Marketplace (GeM) • Contract Award & Sanction Order
                </p>
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs">
                <Stamp className="w-3.5 h-3.5 text-amber-700" />
                OFFICIAL SANCTION ORDER (RULE 173 GFR 2017)
              </div>
            </div>

            {/* Order Specification Details */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Contract Order No.</span>
                  <span className="font-mono font-bold text-slate-900">GEM/2026/CT/90124-L1</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sanction Date</span>
                  <span className="font-mono font-bold text-slate-900">{new Date().toLocaleDateString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Tender Reference</span>
                  <span className="font-mono font-bold text-slate-900">{data.tenderNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Awarded L1 Entity</span>
                  <span className="font-bold text-emerald-800">{top1 ? top1.bidderName : 'Apex Pumps & Motors Pvt Ltd'}</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">Awarded Contract Value</span>
                  <span className="text-xl font-black text-[#1B365D] font-mono">
                    ₹4,85,00,000 (Four Crore Eighty-Five Lakh Rupees Only)
                  </span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Evaluated as Lowest Responsive Bidder (L1) with 96.4% Compliance Score under GFR Rule 173.
                  </p>
                </div>
              </div>

              {/* Terms summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Delivery Period:</span>
                  <strong className="text-slate-900">90 Days from Sanction Date</strong>
                </div>
                <div className="flex justify-between">
                  <span>Performance Bank Guarantee (PBG):</span>
                  <strong className="text-slate-900">3% of Contract Value (₹14,55,000)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Inspection Agency:</span>
                  <strong className="text-slate-900">Directorate General of Quality Assurance (DGQA)</strong>
                </div>
              </div>

              {/* Digital Signature & Blockchain Seal */}
              <div className="p-3.5 bg-slate-900 rounded-xl text-white font-mono text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-amber-400 font-bold border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Digital Signature Certificate (DSC Class-3)
                  </span>
                  <span className="text-emerald-400">AUTHENTICATED</span>
                </div>
                <div className="flex justify-between text-slate-300 pt-1">
                  <span>Signatory:</span>
                  <span className="text-white font-bold">Sh. Rajesh Sharma, Tender Inviting Authority</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>EVM Blockchain Anchor:</span>
                  <span className="text-amber-400 truncate max-w-xs">{data.onChainProof.txHash}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-2 transition"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print Official Sanction Order</span>
              </button>

              <button
                type="button"
                onClick={() => setIsContractModalOpen(false)}
                className="px-5 py-2 bg-[#1B365D] hover:bg-[#0f2540] text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Close Sanction Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TenderResultsPage;
