import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthProvider';
import {
  ShieldCheck, ShieldAlert, Building2, FileText, Briefcase,
  Users, Zap, CheckCircle2, XCircle, AlertCircle, RefreshCw,
  Globe, CreditCard, Building, Landmark, Award, Factory,
  Lock, Layers, UserCheck, AlertTriangle
} from 'lucide-react';

interface PortalCard {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const PORTAL_DEFINITIONS: PortalCard[] = [
  { key: 'GSTN', label: 'GST Registration & Returns', icon: <Landmark className="w-5 h-5" />, description: 'Active GST registration + return filing status via GSTN portal' },
  { key: 'PAN_INCOME_TAX', label: 'PAN & Income Tax', icon: <CreditCard className="w-5 h-5" />, description: 'PAN validity and ITR filing compliance via Income Tax portal' },
  { key: 'MCA21', label: 'MCA21 Corporate Registry', icon: <Building className="w-5 h-5" />, description: 'Company incorporation, director details and annual return status' },
  { key: 'UDYAM_MSME', label: 'Udyam / MSME', icon: <Factory className="w-5 h-5" />, description: 'MSME registration type and statutory exemption eligibility' },
  { key: 'STARTUP_INDIA_DPIIT', label: 'Startup India / DPIIT', icon: <Zap className="w-5 h-5" />, description: 'DPIIT recognition, startup status and tax exemption grants' },
  { key: 'NSIC', label: 'NSIC Registration', icon: <Award className="w-5 h-5" />, description: 'NSIC single-point registration, monetary limit and benefits' },
  { key: 'OEM_AUTHORIZATION', label: 'OEM Authorization', icon: <Layers className="w-5 h-5" />, description: 'Original equipment manufacturer authorization letter validity' },
  { key: 'MAKE_IN_INDIA', label: 'Make in India / Local Content', icon: <Globe className="w-5 h-5" />, description: 'Local content percentage verification and MII compliance class' },
  { key: 'BIS_DPIIT', label: 'BIS / IS Standard Mark', icon: <ShieldCheck className="w-5 h-5" />, description: 'Bureau of Indian Standards IS mark license validity' },
  { key: 'EPFO', label: 'EPFO Compliance', icon: <Users className="w-5 h-5" />, description: 'Employee provident fund registration and ECR return status' },
  { key: 'ESIC', label: 'ESIC Compliance', icon: <UserCheck className="w-5 h-5" />, description: 'Employee state insurance registration and contribution status' },
  { key: 'DIGILOCKER', label: 'DigiLocker Verification', icon: <Lock className="w-5 h-5" />, description: 'Cryptographic verification of document authenticity via DigiLocker' },
  { key: 'DEBARMENT_BLACKLIST', label: 'Debarment & Blacklist', icon: <AlertTriangle className="w-5 h-5" />, description: 'Cross-check against GeM, CPPP and Ministry of Finance debarment lists' },
];

function getRiskColor(status: string) {
  if (status === 'VERIFIED') return { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> };
  if (status === 'RISK_IDENTIFIED') return { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4 text-red-600" /> };
  return { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-600', icon: <AlertCircle className="w-4 h-4 text-slate-400" /> };
}

function getRiskLevelStyle(risk: string) {
  switch (risk) {
    case 'LOW': return { bg: 'bg-emerald-100', text: 'text-emerald-800', bar: 'bg-emerald-500' };
    case 'MEDIUM': return { bg: 'bg-amber-100', text: 'text-amber-800', bar: 'bg-amber-500' };
    case 'HIGH': return { bg: 'bg-orange-100', text: 'text-orange-800', bar: 'bg-orange-500' };
    case 'CRITICAL': return { bg: 'bg-red-100', text: 'text-red-800', bar: 'bg-red-500' };
    default: return { bg: 'bg-slate-100', text: 'text-slate-600', bar: 'bg-slate-400' };
  }
}

export const PortalVerificationPage: React.FC = () => {
  const { user } = useAuth();
  const [sellers, setSellers] = useState<any[]>([]);
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getSellers().then(data => {
      setSellers(data || []);
      if (data && data.length > 0) setSelectedSellerId(data[0].id);
    }).catch(() => {}).finally(() => setLoadingSellers(false));
  }, []);

  const runVerification = async () => {
    if (!selectedSellerId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.verifyAllPortals(selectedSellerId);
      setReport(data);
    } catch (e: any) {
      setError(e.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const summary = report?._summary;
  const riskStyle = summary ? getRiskLevelStyle(report?.DEBARMENT_BLACKLIST?.debarmentStatus === 'DEBARRED' ? 'CRITICAL' : summary.portalComplianceScore >= 80 ? 'LOW' : summary.portalComplianceScore >= 60 ? 'MEDIUM' : 'HIGH') : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            Government Portal Verification
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
              [SIMULATED — MOCK API]
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Multi-portal statutory compliance verification — {PORTAL_DEFINITIONS.length} government data sources [SIMULATED — MOCK API]
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedSellerId}
            onChange={e => { setSelectedSellerId(e.target.value); setReport(null); }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            disabled={loadingSellers}
          >
            {loadingSellers && <option>Loading sellers…</option>}
            {sellers.map(s => (
              <option key={s.id} value={s.id}>{s.organizationName}</option>
            ))}
          </select>
          <button
            onClick={runVerification}
            disabled={loading || !selectedSellerId}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {loading ? 'Verifying…' : 'Run Full Verification'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Summary Card (after verification) */}
      {report && summary && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Portal Compliance Score</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-slate-900">{summary.portalComplianceScore}%</span>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${riskStyle?.bg} ${riskStyle?.text}`}>
                  {summary.portalComplianceScore >= 80 ? 'LOW RISK' : summary.portalComplianceScore >= 60 ? 'MEDIUM RISK' : 'HIGH RISK'}
                </div>
              </div>
              <div className="mt-3 h-2 w-64 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${riskStyle?.bar}`} style={{ width: `${summary.portalComplianceScore}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-emerald-50 rounded-lg px-4 py-3">
                <p className="text-2xl font-bold text-emerald-700">{summary.matched}</p>
                <p className="text-xs text-emerald-600 font-medium mt-0.5">Verified</p>
              </div>
              <div className="bg-red-50 rounded-lg px-4 py-3">
                <p className="text-2xl font-bold text-red-700">{summary.totalPortalsChecked - summary.matched}</p>
                <p className="text-xs text-red-600 font-medium mt-0.5">Issues Found</p>
              </div>
              <div className="bg-slate-50 rounded-lg px-4 py-3">
                <p className="text-2xl font-bold text-slate-700">{summary.totalPortalsChecked}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Portals Checked</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portal Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {PORTAL_DEFINITIONS.map(portal => {
          const data = report?.[portal.key];
          const matched = data?.matched;
          const status = data
            ? (matched === true ? 'VERIFIED' : matched === false ? 'RISK_IDENTIFIED' : 'NOT_APPLICABLE')
            : 'PENDING';
          const colors = getRiskColor(status);

          return (
            <div
              key={portal.key}
              className={`rounded-xl border p-4 transition ${colors.bg} ${colors.border} ${!report ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${colors.badge}`}>
                    {portal.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{portal.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{portal.description}</p>
                  </div>
                </div>
                <div className="shrink-0 mt-1">{colors.icon}</div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${colors.badge}`}>
                  {status === 'VERIFIED' ? '✓ Verified' : status === 'RISK_IDENTIFIED' ? '✗ Risk Found' : status === 'PENDING' ? '— Pending' : '○ N/A'}
                </div>
                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[9px] font-mono font-bold">
                  [SIMULATED — MOCK API]
                </span>
              </div>

              {data && (
                <div className="mt-3 space-y-1">
                  {Object.entries(data)
                    .filter(([k]) => !['connector', 'matched', 'disclaimer'].includes(k))
                    .slice(0, 4)
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[11px]">
                        <span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="font-medium text-slate-700 truncate max-w-[160px] text-right">
                          {Array.isArray(v) ? v.join(', ') : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v ?? '—')}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {!report && (
                <p className="text-[11px] text-slate-400 mt-3 italic">Run verification to fetch portal data</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Human-in-the-loop notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold">Human-in-the-Loop Required</p>
          <p className="text-xs mt-1">Portal verification results are advisory. Any flags raised by this system require review and final decision by the designated Procurement Officer as per GFR 2017.</p>
        </div>
      </div>
    </div>
  );
};
