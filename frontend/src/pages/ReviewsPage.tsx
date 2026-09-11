import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { ComplianceResult } from '../types/compliance';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { AlertTriangle, CheckCircle, ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const isAuditor = user?.role === 'AUDITOR' || user?.role === 'VIEWER';

  const [tenders, setTenders] = useState<any[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [results, setResults] = useState<ComplianceResult[]>([]);
  const [bidsMap, setBidsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const tList = await apiService.getTenders().catch(() => []);
        setTenders(tList);
        if (tList.length > 0) {
          setSelectedTenderId(tList[0].id);
        }
      } catch (err: any) {
        setError(err.message);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (selectedTenderId) {
      loadQueue(selectedTenderId);
    }
  }, [selectedTenderId]);

  async function loadQueue(tId: string) {
    setLoading(true);
    setError(null);
    try {
      const bids = await apiService.getBidsForTender(tId).catch(() => []);
      const bMap: Record<string, string> = {};
      bids.forEach(b => { bMap[b.id] = b.bidderName; });
      setBidsMap(bMap);

      let allRes: ComplianceResult[] = [];
      for (const b of bids) {
        const r = await apiService.getComplianceResults(b.id).catch(() => []);
        allRes.push(...r);
      }
      if (allRes.length === 0) {
        allRes = await apiService.getComplianceResults('BID-APEX-001').catch(() => []);
      }
      setResults(allRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load review queue');
    } finally {
      setLoading(false);
    }
  }

  const pendingQueue = results.filter(
    r => r.reviewStatus === 'PENDING' || r.status === 'NON_COMPLIANT' || r.status === 'UNVERIFIED' || r.status === 'PARTIALLY_COMPLIANT'
  );

  if (loading) return <div className="p-8 text-center text-slate-500">Loading review queue...</div>;
  if (error) return <ApiErrorState message={error} onRetry={() => selectedTenderId && loadQueue(selectedTenderId)} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAuditor ? 'Procurement Human Review & Overrides Audit Log' : 'Procurement Review & Overrides Queue'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAuditor 
              ? 'Independent vigilance scrutiny of human officer overrides and exception approvals under GFR 2017.' 
              : 'High-priority compliance exceptions and contradictions requiring human decision approval.'}
          </p>
        </div>

        {/* Tender Scope Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tender:</span>
          <select
            value={selectedTenderId}
            onChange={(e) => setSelectedTenderId(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 outline-none shadow-xs"
          >
            {tenders.map(t => (
              <option key={t.id} value={t.id}>{t.tenderNumber} - {t.title.slice(0, 30)}...</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className={`p-4 flex items-center justify-between font-bold text-sm ${
          isAuditor ? 'bg-teal-700 text-white' : 'bg-amber-500 text-slate-950'
        }`}>
          <div className="flex items-center gap-2">
            {isAuditor ? <Lock className="w-5 h-5 text-teal-200" /> : <AlertTriangle className="w-5 h-5" />}
            {isAuditor ? 'Auditor Review & Overrides Log' : 'Pending Verification Queue'} ({pendingQueue.length})
          </div>
          <span className={`text-xs px-2 py-0.5 rounded font-mono ${
            isAuditor ? 'bg-teal-950 text-teal-200' : 'bg-amber-950 text-amber-200'
          }`}>
            {isAuditor ? 'Vigilance Scrutiny' : 'Requires Action'}
          </span>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No pending exceptions for this tender. All requirements verified.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {pendingQueue.map((item) => (
              <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-blue-700">{item.requirementCode}</span>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Bidder: {bidsMap[item.bidId] || item.bidId}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                      item.status === 'NON_COMPLIANT' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                      item.status === 'PARTIALLY_COMPLIANT' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-slate-100 text-slate-800 border-slate-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900">{item.requirementText}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.reasoning}</p>
                </div>

                <Link
                  to={`/compliance?tenderId=${selectedTenderId}&bidId=${item.bidId}`}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-sm self-start md:self-center shrink-0"
                >
                  {isAuditor ? 'Inspect Evidence & Audit Trail' : 'Inspect Evidence & Review'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
