import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Tender, ComplianceResult, ComplianceStatus } from '../types/compliance';
import { CheckCircle2, XCircle, AlertCircle, HelpCircle, MinusCircle, Users, ArrowLeft, Download, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthProvider';

const StatusBadge: React.FC<{ status: ComplianceStatus }> = ({ status }) => {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    COMPLIANT:          { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: <CheckCircle2 className="w-3 h-3" />, label: 'COMPLIANT' },
    PARTIALLY_COMPLIANT:{ bg: 'bg-amber-100',   text: 'text-amber-800',   icon: <AlertCircle className="w-3 h-3" />,  label: 'PARTIALLY_COMPLIANT' },
    NON_COMPLIANT:      { bg: 'bg-rose-100',    text: 'text-rose-800',    icon: <XCircle className="w-3 h-3" />,      label: 'NON_COMPLIANT' },
    UNVERIFIED:         { bg: 'bg-slate-100',   text: 'text-slate-600',   icon: <HelpCircle className="w-3 h-3" />,   label: 'UNVERIFIED' },
    NOT_APPLICABLE:     { bg: 'bg-gray-100',    text: 'text-gray-600',    icon: <MinusCircle className="w-3 h-3" />,  label: 'NOT_APPLICABLE' },
  };
  const c = config[status] || config.UNVERIFIED;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold ${c.bg} ${c.text}`}>
      {c.icon} {c.label}
    </span>
  );
};

export const MultiBidderPage: React.FC = () => {
  const { user } = useAuth();
  const isAuditor = user?.role === 'AUDITOR' || user?.role === 'VIEWER';

  const { tenderId: paramTenderId } = useParams<{ tenderId: string }>();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [activeTenderId, setActiveTenderId] = useState<string>(paramTenderId || 'TND-PUMP-001');
  const [tender, setTender] = useState<Tender | null>(null);
  const [bidders, setBidders] = useState<{ id: string; name: string; gstin: string; risk: number }[]>([]);
  const [allResults, setAllResults] = useState<Record<string, ComplianceResult[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTenders() {
      try {
        const tList = await apiService.getTenders();
        setTenders(tList);
        if (paramTenderId && tList.some(t => t.id === paramTenderId)) {
          setActiveTenderId(paramTenderId);
        } else if (tList.length > 0 && !paramTenderId) {
          setActiveTenderId(tList[0].id);
        }
      } catch (err) {
        console.error('Failed to load tenders:', err);
      }
    }
    fetchTenders();
  }, [paramTenderId]);

  useEffect(() => {
    if (activeTenderId) {
      loadData(activeTenderId);
    }
  }, [activeTenderId]);

  async function loadData(tId: string) {
    setLoading(true); setError(null);
    try {
      const [t, bidsList] = await Promise.all([
        apiService.getTenderById(tId).catch(() => null),
        apiService.getBidsForTender(tId).catch(() => [])
      ]);

      const mappedBidders = bidsList.map(b => ({
        id: b.id,
        name: b.bidderName,
        gstin: b.gstin || 'GST-REGISTERED',
        risk: b.riskScore || 25
      }));

      const resultsMap: Record<string, ComplianceResult[]> = {};
      for (const bidder of mappedBidders) {
        const r = await apiService.getComplianceResults(bidder.id).catch(() => []);
        resultsMap[bidder.id] = r;
      }
      setTender(t);
      setBidders(mappedBidders);
      setAllResults(resultsMap);
    } catch (err: any) { setError(err.message || 'Failed to load bidder comparisons'); }
    finally { setLoading(false); }
  }

  function getResult(bidderId: string, reqCode: string): ComplianceResult | undefined {
    return allResults[bidderId]?.find(r => r.requirementCode === reqCode);
  }

  function getBidderScore(bidderId: string): number | null {
    const results = allResults[bidderId] || [];
    if (results.length === 0) return null;
    const compliant = results.filter(r => r.status === 'COMPLIANT').length;
    return Math.round((compliant / results.length) * 100);
  }

  const requirements = tender?.requirements || [];

  const exportToCsv = () => {
    const headers = ['Req Code', 'Category', 'Requirement Text', ...bidders.map(b => `${b.name} (${b.id})`)];
    const rows = requirements.map(req => {
      const row = [req.reqCode, req.category, `"${req.rawText.replace(/"/g, '""')}"`];
      for (const bidder of bidders) {
        const res = getResult(bidder.id, req.reqCode);
        row.push(res ? res.status : 'PENDING');
      }
      return row.join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Multi_Bidder_Comparison_${activeTenderId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading multi-bidder comparison...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/tenders" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h1 className="text-xl font-bold text-slate-900">Multi-Bidder Comparison Matrix</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {tender?.title || 'Submersible Water Pump Sets'} ({tender?.tenderReferenceNumber || 'GEM/2026/B/892341'})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportToCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-sm"
          >
            <Download className="w-4 h-4" /> Download CSV Comparison
          </button>
          <Link
            to={`/reports?tenderId=${activeTenderId}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
          >
            GeM Executive Report
          </Link>
        </div>
      </div>

      {/* Auditor Vigilance Scrutiny Banner */}
      {isAuditor && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              <strong>Auditor Vigilance Oversight:</strong> Reviewing comparative evaluations across all competing bidders to audit technical evaluation parity and detect favoritism under GFR 2017.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-teal-200 text-teal-900 font-mono text-[10px] font-bold shrink-0">
            AUDIT_SCRUTINY
          </span>
        </div>
      )}

      {/* Tender Scope Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Selected Tender:</span>
          <select
            value={activeTenderId}
            onChange={(e) => setActiveTenderId(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {tenders.map(t => (
              <option key={t.id} value={t.id}>
                {t.tenderNumber} - {t.title.slice(0, 36)}...
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs text-slate-500">Comparing <strong>{bidders.length}</strong> Bidders</span>
      </div>

      {/* Bidder Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bidders.map(bidder => {
          const score = getBidderScore(bidder.id);
          const results = allResults[bidder.id] || [];
          const nonCompliant = results.filter(r => r.status === 'NON_COMPLIANT').length;
          const partial = results.filter(r => r.status === 'PARTIALLY_COMPLIANT').length;
          const riskColor = bidder.risk > 50 ? 'bg-rose-600' : 'bg-emerald-600';
          const cardBg = bidder.risk > 50 ? 'bg-amber-50/40 border-amber-200' : 'bg-emerald-50/40 border-emerald-200';

          return (
            <div key={bidder.id} className={`rounded-xl border p-5 ${cardBg}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900">{bidder.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{bidder.gstin}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-extrabold ${score !== null && score >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {score !== null ? `${score}%` : 'Pending'}
                  </div>
                  <div className="text-xs font-medium text-slate-600">Compliance Rate</div>
                </div>
              </div>
              <div className="flex gap-3 text-xs items-center">
                <span className="text-emerald-700 font-semibold">{results.filter(r => r.status === 'COMPLIANT').length} Valid Pass</span>
                <span className="text-rose-700 font-semibold">{nonCompliant} Invalid Fail</span>
                <span className="text-amber-700 font-semibold">{partial} ◐ Partial</span>
                <span className={`ml-auto font-bold px-2 py-0.5 rounded text-white text-[10px] ${riskColor}`}>
                  Risk: {bidder.risk}/100
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-900 text-sm">Requirement-by-Requirement Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="p-3 font-bold text-slate-700 w-28">Req Code</th>
                <th className="p-3 font-bold text-slate-700">Category / Requirement</th>
                {bidders.map(b => (
                  <th key={b.id} className="p-3 font-bold text-slate-700 text-center min-w-[140px]">{b.name.split(' ')[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requirements.map(req => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-blue-700">{req.reqCode}</td>
                  <td className="p-3">
                    <div className="font-medium text-slate-800">{req.category}</div>
                    <div className="text-slate-500 text-[11px] max-w-xs truncate">{req.rawText}</div>
                  </td>
                  {bidders.map(bidder => {
                    const result = getResult(bidder.id, req.reqCode);
                    return (
                      <td key={bidder.id} className="p-3 text-center">
                        {result ? (
                          <div>
                            <StatusBadge status={result.status} />
                            <div className="mt-1 text-[10px] text-slate-400">{(result.confidence * 100).toFixed(0)}% conf.</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-slate-400 text-center">
        Status legend: <span className="text-emerald-600 font-semibold">COMPLIANT</span> = verified compliant •
        <span className="text-rose-600 font-semibold mx-1">NON_COMPLIANT</span> = verified non-compliant •
        <span className="text-amber-600 font-semibold mx-1">PARTIALLY_COMPLIANT</span> = some conditions met •
        <span className="text-slate-600 font-semibold mx-1">UNVERIFIED</span> = insufficient evidence (system returns UNVERIFIED, never guesses)
      </div>
    </div>
  );
};
