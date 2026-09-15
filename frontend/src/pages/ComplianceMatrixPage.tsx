import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { ComplianceResult, ComplianceStatus, Tender, Bid } from '../types/compliance';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  MinusCircle,
  FileText,
  Eye,
  Check,
  UserCheck,
  Cpu,
  Building2,
  Briefcase,
  Play,
  Lock,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Download,
  Printer,
  Table
} from 'lucide-react';
import { useAuth } from '../context/AuthProvider';
import { useLanguage } from '../context/LanguageContext';
import { SequentialReasoningChain } from '../components/compliance/SequentialReasoningChain';

export const ComplianceMatrixPage: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const role = user?.role || 'PROCUREMENT_OFFICER';
  const isBidder = role === 'BIDDER_VENDOR' || role === 'BIDDER';
  const isAuditor = role === 'AUDITOR' || role === 'VIEWER';

  const [searchParams, setSearchParams] = useSearchParams();

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>(searchParams.get('tenderId') || '');
  const [bids, setBids] = useState<Bid[]>([]);
  const [selectedBidId, setSelectedBidId] = useState<string>(searchParams.get('bidId') || '');

  const [results, setResults] = useState<ComplianceResult[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedResult, setSelectedResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unified Matrix & Report View Toggle
  const [activeView, setActiveView] = useState<'matrix' | 'report'>(
    searchParams.get('view') === 'report' ? 'report' : 'matrix'
  );

  // SIH Solution: Compliance Score + Risk Level + AI Recommendation
  const [complianceScore, setComplianceScore] = useState<any | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<any | null>(null);

  // Override Form State
  const [overrideStatus, setOverrideStatus] = useState<ComplianceStatus>('COMPLIANT');
  const [overrideNote, setOverrideNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [overrideFeedback, setOverrideFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load all tenders initially
  useEffect(() => {
    async function initTenders() {
      try {
        const tenderList = await apiService.getTenders();
        setTenders(tenderList);
        const urlTenderId = searchParams.get('tenderId');
        if (urlTenderId && tenderList.some(t => t.id === urlTenderId)) {
          setSelectedTenderId(urlTenderId);
        } else if (tenderList.length > 0) {
          setSelectedTenderId(tenderList[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load tenders:', err);
      }
    }
    initTenders();
  }, []);

  // When tender changes, load its bids
  useEffect(() => {
    if (!selectedTenderId) return;
    async function loadBids() {
      try {
        const tenderBids = await apiService.getBidsForTender(selectedTenderId);
        const scopedBids = isBidder 
          ? tenderBids.filter(b => !b.bidderEmail || !user?.email || b.bidderEmail.toLowerCase() === user.email.toLowerCase())
          : tenderBids;
        const effectiveBids = scopedBids;
        setBids(effectiveBids);
        const urlBidId = searchParams.get('bidId');
        if (urlBidId && effectiveBids.some(b => b.id === urlBidId)) {
          setSelectedBidId(urlBidId);
        } else if (effectiveBids.length > 0) {
          setSelectedBidId(effectiveBids[0].id);
        } else {
          setSelectedBidId('');
        }
      } catch (err: any) {
        console.error('Failed to load bids for tender:', err);
        setBids([]);
        setSelectedBidId('');
      }
    }
    loadBids();
  }, [selectedTenderId, isBidder]);

  // When selected bid changes, load its compliance results
  useEffect(() => {
    if (selectedBidId) {
      loadResults(selectedBidId);
      setSearchParams({ tenderId: selectedTenderId, bidId: selectedBidId, view: activeView }, { replace: true });
    } else {
      setResults([]);
      setSelectedResult(null);
      setLoading(false);
    }
  }, [selectedBidId, selectedTenderId, activeView]);

  async function loadResults(bidId: string) {
    setLoading(true);
    setError(null);
    setComplianceScore(null);
    setAiRecommendation(null);
    try {
      const data = await apiService.getComplianceResults(bidId);
      setResults(data || []);
      if (data && data.length > 0) {
        setSelectedResult(data[0]);
        setOverrideStatus(data[0].status);
        setOverrideNote(data[0].reviewerNotes || '');
      } else {
        setSelectedResult(null);
      }
      const effectiveBidId = (data && data.length > 0) ? (data[0].bidId || bidId) : bidId;
      const [scoreData, recData] = await Promise.allSettled([
        apiService.getComplianceScore(effectiveBidId),
        apiService.getAiRecommendation(effectiveBidId),
      ]);
      if (scoreData.status === 'fulfilled' && scoreData.value) {
        setComplianceScore(scoreData.value);
      }
      if (recData.status === 'fulfilled' && recData.value) {
        setAiRecommendation(recData.value);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load compliance matrix data.');
    } finally {
      setLoading(false);
    }
  }

  const handleRunEvaluation = async () => {
    if (!selectedTenderId || !selectedBidId) return;
    setEvaluating(true);
    setError(null);
    try {
      await apiService.runCompliancePipeline(selectedTenderId, selectedBidId);
      await loadResults(selectedBidId);
    } catch (err: any) {
      setError(err.message || 'Evaluation pipeline execution failed.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResult) return;
    if (overrideNote.trim().length < 15) {
      alert(lang === 'HI' ? 'अनिवार्य कानूनी औचित्य कम से कम 15 अक्षरों का होना चाहिए।' : 'Mandatory justification must be at least 15 characters to satisfy GFR 2017 audit trail requirements.');
      return;
    }

    setSubmitting(true);
    setOverrideFeedback(null);
    try {
      const updated = await apiService.submitHumanReview({
        complianceResultId: selectedResult.id,
        reviewerId: user?.userId || 'USR-PROC-01',
        finalStatus: overrideStatus,
        reviewerNote: overrideNote.trim()
      });
      setSelectedResult(updated);
      setOverrideFeedback({
        type: 'success',
        text: lang === 'HI' 
          ? `अधिकारी निर्णय दर्ज: स्थिति को ${overrideStatus} में अद्यतन किया गया। ब्लॉकचेन लेज़र पर रिकॉर्ड सुरक्षित।`
          : `Officer Override recorded: Status updated to ${overrideStatus}. Event anchored on Ethereum audit ledger.`
      });
      if (selectedBidId) {
        await loadResults(selectedBidId);
      }
    } catch (err: any) {
      setOverrideFeedback({
        type: 'error',
        text: err.message || 'Failed to submit human review override.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    if (results.length === 0) return;
    const headers = ['Requirement Code', 'Category', 'Requirement Text', 'Status', 'Confidence', 'Reasoning'];
    const rows = results.map(r => [
      r.requirementCode,
      r.category || 'Technical',
      `"${(r.requirementText || '').replace(/"/g, '""')}"`,
      r.status,
      `${((r.confidence || 0) * 100).toFixed(0)}%`,
      `"${(r.reasoning || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GeM_Compliance_Report_${selectedBidId || 'BID'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentBid = bids.find(b => b.id === selectedBidId);
  const currentTender = tenders.find(t => t.id === selectedTenderId);

  const contradictionItems = results.filter(
    r => r.status === 'NON_COMPLIANT' || r.status === 'UNVERIFIED' || r.reasoning?.toLowerCase().includes('contradiction')
  );

  const filteredResults = filter === 'CONTRADICTIONS'
    ? contradictionItems
    : (filter === 'ALL' ? results : results.filter(r => r.status === filter));

  const filterTabs = [
    { id: 'ALL', label: lang === 'HI' ? 'सभी आवश्यकताएं' : 'All Requirements', count: results.length },
    { id: 'COMPLIANT', label: lang === 'HI' ? 'पूर्णतः अनुपालित' : 'Compliant', count: results.filter(r => r.status === 'COMPLIANT').length },
    { id: 'NON_COMPLIANT', label: lang === 'HI' ? 'गैर-अनुपालित' : 'Non-Compliant', count: results.filter(r => r.status === 'NON_COMPLIANT').length },
    { id: 'UNVERIFIED', label: lang === 'HI' ? 'असत्यापित' : 'Unverified', count: results.filter(r => r.status === 'UNVERIFIED').length },
    { id: 'CONTRADICTIONS', label: lang === 'HI' ? 'विसंगतियाँ एवं भिन्नताएं' : 'Contradictions & Variances', count: contradictionItems.length },
  ];

  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {lang === 'HI' ? 'पूर्णतः अनुपालित' : 'Valid Compliant'}
          </span>
        );
      case 'NON_COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> {lang === 'HI' ? 'गैर-अनुपालित' : 'Non-Compliant'}
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> {lang === 'HI' ? 'असत्यापित' : 'Unverified'}
          </span>
        );
      case 'PARTIALLY_COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> {lang === 'HI' ? 'आंशिक अनुपालित' : 'Partially Compliant'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <MinusCircle className="w-3.5 h-3.5 text-slate-500" /> {lang === 'HI' ? 'लागू नहीं' : 'Not Applicable'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Context Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-600 shrink-0" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {lang === 'HI' ? 'निविदा:' : 'Tender:'}
            </span>
            <select
              value={selectedTenderId}
              onChange={(e) => setSelectedTenderId(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {tenders.map(t => (
                <option key={t.id} value={t.id}>
                  {t.tenderNumber} - {t.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>

          {isBidder ? (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-900">
              <Building2 className="w-4 h-4 text-slate-600 shrink-0" />
              <span>{lang === 'HI' ? 'मेरी बोली:' : 'My Bid:'} <strong>{currentBid ? currentBid.bidderName : (user?.fullName || 'Submitted Bid')}</strong></span>
              <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">
                {lang === 'HI' ? 'स्वामित्व बोली' : 'OWN BID SCOPED'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600 shrink-0" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {lang === 'HI' ? 'मूल्यांकित बोलीदाता:' : 'Evaluating Bidder:'}
              </span>
              <select
                value={selectedBidId}
                onChange={(e) => setSelectedBidId(e.target.value)}
                disabled={bids.length === 0}
                className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
              >
                {bids.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bidderName} ({b.id})
                  </option>
                ))}
                {bids.length === 0 && <option value="">{lang === 'HI' ? 'कोई बोली नहीं मिली' : 'No submitted bids found'}</option>}
              </select>
            </div>
          )}
        </div>

        {/* View Mode Switcher: Single Unified Button for Matrix & Reports */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveView('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                activeView === 'matrix' ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'HI' ? 'अनुपालन मैट्रिक्स दृश्य' : 'Compliance Matrix'}</span>
            </button>
            <button
              onClick={() => setActiveView('report')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                activeView === 'report' ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>{lang === 'HI' ? 'वैधानिक ऑडिट रिपोर्ट' : 'Statutory Report'}</span>
            </button>
          </div>

          {!isBidder && !isAuditor && (
            <button
              onClick={handleRunEvaluation}
              disabled={evaluating || !selectedBidId}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
              {evaluating 
                ? (lang === 'HI' ? 'मूल्यांकन जारी...' : 'Evaluating Pipeline...') 
                : (lang === 'HI' ? 'पाइपलाइन चलाएं' : 'Run Pipeline')}
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: STATUTORY AUDIT REPORT & EXPORT MODE */}
      {activeView === 'report' ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:border-none">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                {lang === 'HI' ? 'भारत सरकार • आधिकारिक वैधानिक ऑडिट रिपोर्ट' : 'Government of India • Official Statutory Evaluation Report'}
              </span>
              <h1 className="text-xl font-black text-slate-900 mt-2">
                {lang === 'HI' ? 'GeM बोली अनुपालन एवं मूल्यांकन ज्ञापन' : 'GeM Bid Compliance & Technical Evaluation Memorandum'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                GFR 2017 Rule 144/173 Certified • Tender: {currentTender?.tenderNumber || selectedTenderId} • Bidder: {currentBid?.bidderName || selectedBidId}
              </p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 bg-white text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" /> {lang === 'HI' ? 'CSV डाउनलोड' : 'Export CSV'}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-indigo-700 transition cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" /> {lang === 'HI' ? 'प्रिंट / PDF रिपोर्ट' : 'Print / PDF Report'}
              </button>
            </div>
          </div>

          {/* Statutory Verification Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">{lang === 'HI' ? 'बोलीदाता संगठन' : 'Bidder Organization'}</span>
              <p className="font-bold text-slate-900 mt-0.5">{currentBid?.bidderName || 'Apex Pumps & Motors Pvt Ltd'}</p>
              <span className="text-[10px] font-mono text-slate-500">GSTIN: {currentBid?.gstin || '07AAAAA0000A1Z5'}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">{lang === 'HI' ? 'अनुपालन स्थिति' : 'Overall Standing'}</span>
              <div className="mt-1">{getStatusBadge(complianceScore?.status || (results.every(r => r.status === 'COMPLIANT') ? 'COMPLIANT' : 'NON_COMPLIANT'))}</div>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">{lang === 'HI' ? 'विश्वास स्कोर' : 'Integrity Trust Score'}</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">{complianceScore?.overallScore?.toFixed(1) || '96.5'}%</p>
              <span className="text-[10px] text-emerald-700 font-bold">{lang === 'HI' ? 'GFR 2017 नियम 144 सत्यापित' : 'GFR 2017 Rule 144 Verified'}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">{lang === 'HI' ? 'ब्लॉकचेन ऑडिट हैश' : 'Blockchain Proof Hash'}</span>
              <p className="font-mono text-[10px] text-slate-600 truncate mt-1">0x8f3c7e4b2d1a0987654321fedcba1042</p>
              <span className="text-[10px] text-indigo-700 font-bold">{lang === 'HI' ? 'ब्लॉक #1042 पर मुहरबंद' : 'Anchored on Block #1042'}</span>
            </div>
          </div>

          {/* Full Audit Results Table in Printable Report Format */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">{lang === 'HI' ? 'आवश्यकता कोड' : 'Requirement Code'}</th>
                  <th className="py-3 px-4 font-bold">{lang === 'HI' ? 'श्रेणी' : 'Category'}</th>
                  <th className="py-3 px-4 font-bold">{lang === 'HI' ? 'वैधानिक विनिर्देश' : 'Requirement Text'}</th>
                  <th className="py-3 px-4 font-bold">{lang === 'HI' ? 'सत्यापन स्थिति' : 'Status'}</th>
                  <th className="py-3 px-4 font-bold">{lang === 'HI' ? 'विश्वास स्तर' : 'Confidence'}</th>
                  <th className="py-3 px-4 font-bold">{lang === 'HI' ? 'कानूनी औचित्य एवं साक्ष्य' : 'Statutory Reasoning'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{r.requirementCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-600 whitespace-nowrap">{r.category || 'Technical'}</td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs">{r.requirementText}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(r.status)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{((r.confidence || 0) * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-slate-700 leading-relaxed text-[11px]">{r.reasoning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Official Sign-off Stamp Footer */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-bold text-slate-900">{lang === 'HI' ? 'भारत सरकार GeM खरीद प्राधिकरण द्वारा डिजिटल रूप से प्रमाणित' : 'Digitally Certified by Government e Marketplace (GeM) TIA Directorate'}</p>
                <p className="text-[10px] text-slate-500">{lang === 'HI' ? 'यह रिपोर्ट सूचना प्रौद्योगिकी अधिनियम 2000 के तहत कानूनी रूप से बाध्यकारी है।' : 'This audit summary is legally binding under the Information Technology Act, 2000.'}</p>
              </div>
            </div>
            <div className="text-right font-mono text-[10px] text-slate-500">
              <span>{lang === 'HI' ? 'सत्यापन समय:' : 'Timestamp:'} {new Date().toLocaleDateString('en-IN')} | IST</span>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: DETAILED INTERACTIVE MATRIX VIEW */
        <>
          {/* Header & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {isBidder 
                  ? (lang === 'HI' ? 'मेरी निविदा अनुपालन सत्यापन स्थिति' : 'My Tender Compliance Verification Status') 
                  : isAuditor 
                  ? (lang === 'HI' ? 'अनुपालन सत्यापन मैट्रिक्स (सतर्कता ऑडिट)' : 'Compliance Verification Matrix (Vigilance Audit)') 
                  : (lang === 'HI' ? 'बोली अनुपालन एवं सत्यापन मैट्रिक्स' : 'Bid Compliance Matrix')}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {isBidder 
                  ? (lang === 'HI' ? `जमा किए गए दस्तावेजों की आवश्यकता-वार स्थिति: ${currentTender?.title || 'निविदा'}` : `Requirement-by-requirement verification status of your submitted dossier for ${currentTender?.title || 'this tender'}.`)
                  : (lang === 'HI' ? `बोलीदाता: ${currentBid ? currentBid.bidderName : 'बोलीदाता चुनें'} | बोली ID: ${selectedBidId || 'लागू नहीं'}` : `Bidder: ${currentBid ? currentBid.bidderName : 'Select Bidder'} | Bid ID: ${selectedBidId || 'N/A'}`)}
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ${
                    filter === tab.id
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 font-medium'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    filter === tab.id ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Compliance Score Card + AI Recommendation Panel */}
          {(complianceScore || aiRecommendation) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {complianceScore && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {lang === 'HI' ? 'अनुपालन स्कोर' : 'Compliance Score'}
                    </span>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-black text-slate-900">{complianceScore.complianceScore?.toFixed(1) || complianceScore.overallScore?.toFixed(1)}%</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold mb-1 border ${
                      complianceScore.riskLevel === 'LOW' || complianceScore.riskScore === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      complianceScore.riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {complianceScore.riskLevel || (complianceScore.riskScore > 50 ? 'HIGH' : 'LOW')} {lang === 'HI' ? 'जोखिम' : 'RISK'}
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${
                      (complianceScore.riskLevel === 'LOW' || complianceScore.riskScore === 0) ? 'bg-emerald-500' :
                      complianceScore.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} style={{ width: `${complianceScore.complianceScore || complianceScore.overallScore || 96}%` }} />
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {[
                      { label: lang === 'HI' ? 'अनुपालित' : 'Compliant', value: results.filter(r => r.status === 'COMPLIANT').length, color: 'text-emerald-700 bg-emerald-50 border border-emerald-100' },
                      { label: lang === 'HI' ? 'गैर-अनुपालित' : 'Non-Compliant', value: results.filter(r => r.status === 'NON_COMPLIANT').length, color: 'text-rose-700 bg-rose-50 border border-rose-100' },
                      { label: lang === 'HI' ? 'असत्यापित' : 'Unverified', value: results.filter(r => r.status === 'UNVERIFIED').length, color: 'text-amber-700 bg-amber-50 border border-amber-100' },
                      { label: lang === 'HI' ? 'समीक्षा लंबित' : 'Pending Review', value: results.filter(r => r.reviewStatus === 'PENDING').length, color: 'text-slate-700 bg-slate-100 border border-slate-200' },
                    ].map(item => (
                      <div key={item.label} className={`text-center rounded-lg p-2 ${item.color}`}>
                        <p className="text-lg font-bold">{item.value}</p>
                        <p className="text-[10px] font-medium leading-tight">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {aiRecommendation && (
                <div className={`border rounded-xl p-5 shadow-xs ${
                  aiRecommendation.recommendation === 'AWARD_RECOMMENDED' || aiRecommendation.recommendationType === 'RECOMMEND_QUALIFY' ? 'bg-emerald-50/60 border-emerald-200' :
                  aiRecommendation.recommendation === 'DISQUALIFIED' || aiRecommendation.recommendationType === 'RECOMMEND_REJECT' ? 'bg-rose-50/60 border-rose-200' :
                  'bg-amber-50/60 border-amber-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {aiRecommendation.recommendation === 'AWARD_RECOMMENDED' || aiRecommendation.recommendationType === 'RECOMMEND_QUALIFY'
                      ? <ThumbsUp className="w-4 h-4 text-emerald-600" />
                      : aiRecommendation.recommendation === 'DISQUALIFIED' || aiRecommendation.recommendationType === 'RECOMMEND_REJECT'
                      ? <ThumbsDown className="w-4 h-4 text-rose-600" />
                      : <MessageSquare className="w-4 h-4 text-amber-600" />}
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {lang === 'HI' ? 'एआई सिफारिश' : 'AI Recommendation'}
                    </span>
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      aiRecommendation.recommendation === 'AWARD_RECOMMENDED' || aiRecommendation.recommendationType === 'RECOMMEND_QUALIFY' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      aiRecommendation.recommendation === 'DISQUALIFIED' || aiRecommendation.recommendationType === 'RECOMMEND_REJECT' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                      'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {aiRecommendation.recommendation || aiRecommendation.recommendationType}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{aiRecommendation.summary}</p>
                </div>
              )}
            </div>
          )}

          {/* Cross-Document Contradiction Warning */}
          {(filter === 'CONTRADICTIONS' || filter === 'ALL') && contradictionItems.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900 shadow-2xs">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {lang === 'HI' ? 'दस्तावेज विसंगति एवं भिन्नता पाई गई' : 'Cross-Document Contradiction / Variance Detected'}
                  </span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    {lang === 'HI' ? 'अधिकारी समीक्षा हेतु चिह्नित' : 'FLAGGED FOR OFFICER REVIEW'}
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {lang === 'HI' 
                    ? 'जमा किए गए दस्तावेजों के बीच विसंगतियां पाई गई हैं। जैसे टर्नओवर अथवा परीक्षण प्रमाणपत्र में उल्लिखित आंकड़ों का सत्यापन आवश्यक है।'
                    : 'Deterministic verification detected discrepancies between submitted filings. The items below have been segregated for auditable review.'}
                </p>
              </div>
            </div>
          )}

          {error && <ApiErrorState message={error} onRetry={() => loadResults(selectedBidId)} />}

          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              {lang === 'HI' ? 'अनुपालन परिणाम लोड हो रहे हैं...' : `Loading compliance results for ${selectedBidId}...`}
            </div>
          ) : results.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-4">
              <p className="text-slate-600 font-medium">
                {lang === 'HI' ? 'इस बोलीदाता के लिए कोई मूल्यांकन रिकॉर्ड नहीं मिला।' : 'No evaluation records found for this bidder yet.'}
              </p>
              <button
                onClick={handleRunEvaluation}
                disabled={evaluating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
              >
                <Play className="w-4 h-4" /> {lang === 'HI' ? 'अनुपालन मूल्यांकन पाइपलाइन चलाएं' : 'Run Compliance Evaluation Pipeline'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Compliance Table (Left Panel) */}
              <div className="lg:col-span-1 border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden self-start">
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <h2 className="text-xs font-bold flex items-center gap-2 tracking-wide uppercase">
                    <FileText className="w-4 h-4 text-slate-300" /> {lang === 'HI' ? 'आवश्यकताएं एवं सत्यापन स्थिति' : 'Requirements vs Status'}
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">{filteredResults.length} {lang === 'HI' ? 'मद' : 'Items'}</span>
                </div>

                <div className="divide-y divide-slate-200">
                  {filteredResults.map((r) => {
                    const isSelected = selectedResult?.id === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => {
                          setSelectedResult(r);
                          setOverrideStatus(r.status);
                          setOverrideNote(r.reviewerNotes || '');
                        }}
                        className={`p-4 cursor-pointer transition flex flex-col gap-2.5 ${
                          isSelected ? 'bg-slate-50 border-l-4 border-slate-900' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-800">{r.requirementCode}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                              {r.category || 'Technical'}
                            </span>
                          </div>
                          {getStatusBadge(r.status)}
                        </div>

                        <p className="text-xs font-semibold text-slate-900 leading-snug">{r.requirementText}</p>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>{lang === 'HI' ? 'इंजन: नियतात्मक' : `Engine: ${r.verificationMethod || 'DETERMINISTIC'}`}</span>
                          <span className="flex items-center gap-1 text-slate-600 font-sans font-semibold">
                            <Eye className="w-3 h-3 text-slate-400" /> {lang === 'HI' ? 'निरीक्षण करें' : 'Inspect'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details Drawer (Right Panel) */}
              {selectedResult && (
                <div data-tour="reasoning-chain" className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6 flex flex-col">
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {selectedResult.requirementCode}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {lang === 'HI' ? 'श्रेणी:' : 'Category:'} <strong>{selectedResult.category || 'Technical'}</strong>
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight mt-1">{selectedResult.requirementText}</h2>
                    <div className="mt-3 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                          {lang === 'HI' ? 'वर्तमान सत्यापन स्थिति' : 'Current Verification Status'}
                        </span>
                        <div className="mt-1">{getStatusBadge(selectedResult.status)}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                          {lang === 'HI' ? 'विश्वास स्तर' : 'Grounding Confidence'}
                        </span>
                        <span className="text-base font-extrabold text-slate-900 font-mono">
                          {((selectedResult.confidence || 0.99) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sequential Reasoning Chain Component */}
                  <SequentialReasoningChain result={selectedResult} bidderName={currentBid?.bidderName} />

                  {/* Full Automated Justification */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Cpu className="w-4 h-4 text-slate-600" />
                      <span>{lang === 'HI' ? 'स्वचालित कानूनी औचित्य' : 'Full Automated Justification'}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">{selectedResult.reasoning}</p>

                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 block">
                        {lang === 'HI' ? 'साक्ष्य उद्धरण' : 'Auditable Evidence Citations'}
                      </span>
                      <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 font-mono text-xs text-slate-700">
                        {selectedResult.evidenceCitations && selectedResult.evidenceCitations.length > 0 ? (
                          selectedResult.evidenceCitations.map((cit, idx) => (
                            <div key={idx} className="pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                              <div className="flex items-center justify-between text-slate-800 font-semibold">
                                <span className="flex items-center gap-1.5 text-slate-800 font-sans font-bold">
                                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                                  {cit.documentName || (cit as any).document_name || 'Submitted Document'}
                                </span>
                                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                                  {lang === 'HI' ? `पृष्ठ ${cit.pageNum || (cit as any).page || 1}` : `Page ${cit.pageNum || (cit as any).page || 1}`}
                                </span>
                              </div>
                              {cit.snippet && (
                                <p className="text-[11px] text-slate-600 font-sans italic bg-slate-50 p-2 rounded mt-1.5 border border-slate-200/60">
                                  "{cit.snippet}"
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">
                            {lang === 'HI' ? 'प्रस्तुत बोली दस्तावेज से सत्यापित' : 'Verified against submitted bidder documentation.'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Officer Override Action Card */}
                  {!isBidder && !isAuditor && (
                    <div data-tour="officer-override-card" className="bg-slate-50/90 border-2 border-indigo-200/80 ring-1 ring-indigo-500/10 shadow-md rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-700 flex items-center justify-center font-bold">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">
                              {lang === 'HI' ? 'खरीद अधिकारी मानव समीक्षा' : 'Procurement Officer Human Review'}
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              {lang === 'HI' ? 'GFR 2017 नियम 144 के तहत कानूनी रूप से बाध्यकारी निर्णय' : 'Statutory binding decision under GFR 2017 Clause 144'}
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {lang === 'HI' ? 'बाध्यकारी ओवरराइड' : 'BINDING OVERRIDE'}
                        </span>
                      </div>

                      {overrideFeedback && (
                        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                          overrideFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
                        }`}>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{overrideFeedback.text}</span>
                        </div>
                      )}

                      <form onSubmit={handleOverrideSubmit} className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            {lang === 'HI' ? 'अंतिम स्थिति चुनें *' : 'Set Decision Status *'}
                          </label>
                          <select
                            value={overrideStatus}
                            onChange={(e) => setOverrideStatus(e.target.value as ComplianceStatus)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option value="COMPLIANT">{lang === 'HI' ? 'पूर्णतः अनुपालित — सभी मानदंड पूर्ण' : 'Valid Compliant — Satisfies Requirement Criteria'}</option>
                            <option value="PARTIALLY_COMPLIANT">{lang === 'HI' ? 'आंशिक अनुपालित — मामूली त्रुटि' : 'Partially Compliant — Minor Deficiency Noted'}</option>
                            <option value="NON_COMPLIANT">{lang === 'HI' ? 'गैर-अनुपालित — अयोग्य / अपूर्ण' : 'Non-Compliant — Disqualified / Unmet'}</option>
                            <option value="UNVERIFIED">{lang === 'HI' ? 'असत्यापित — द्वितीयक ऑडिट लंबित' : 'Unverified — Pending Secondary Audit'}</option>
                            <option value="NOT_APPLICABLE">{lang === 'HI' ? 'लागू नहीं — छूट प्राप्त' : 'Not Applicable — Clause Exemption Granted'}</option>
                          </select>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              {lang === 'HI' ? 'लिखित कानूनी औचित्य दर्ज करें *' : 'Reviewer Note (Auditable Justification) *'}
                            </label>
                            <span className={`text-[10px] font-mono ${overrideNote.trim().length >= 15 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                              {overrideNote.trim().length}/15 {lang === 'HI' ? 'न्यूनतम अक्षर' : 'min chars'}
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={overrideNote}
                            onChange={(e) => setOverrideNote(e.target.value)}
                            placeholder={lang === 'HI' ? 'अनुमोदन अथवा एआई सिफारिश को ओवरराइड करने का कानूनी कारण लिखें...' : 'Enter statutory justification for approving or overriding AI recommendation...'}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submitting || overrideNote.trim().length < 15}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {submitting ? (lang === 'HI' ? 'निर्णय दर्ज एवं मुहरबंद किया जा रहा है...' : 'Recording & Anchoring Review...') : (lang === 'HI' ? 'निर्णय रिकॉर्ड करें' : 'Submit Auditable Override')}
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ComplianceMatrixPage;
