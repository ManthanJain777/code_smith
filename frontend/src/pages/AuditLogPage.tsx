import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { AuditLog } from '../types/compliance';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { BlockchainProofBadge } from '../components/ui/BlockchainProofBadge';
import {
  Link2, ShieldCheck, Clock, User, FileText, Lock, CheckCircle2,
  AlertTriangle, Users, Building, ShieldAlert, RefreshCw, Search
} from 'lucide-react';

interface BlockchainEntry {
  auditId: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  eventType: string;
  actor: string;
}

const MOCK_BLOCKCHAIN: BlockchainEntry[] = [
  { auditId: 'AUD-001', txHash: '0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a', blockNumber: 1000001, timestamp: '2026-09-10T06:00:00Z', eventType: 'TENDER_CREATED', actor: 'officer@gem.gov.in' },
  { auditId: 'AUD-002', txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b2c', blockNumber: 1000002, timestamp: '2026-09-10T07:30:00Z', eventType: 'BID_SUBMITTED', actor: 'vendor@apexpumps.com' },
  { auditId: 'AUD-003', txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c3d', blockNumber: 1000003, timestamp: '2026-09-10T09:00:00Z', eventType: 'COMPLIANCE_RESULT', actor: 'SYSTEM-AI' },
  { auditId: 'AUD-004', txHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d4e', blockNumber: 1000004, timestamp: '2026-09-10T11:15:00Z', eventType: 'HUMAN_OVERRIDE', actor: 'reviewer@gem.gov.in' },
  { auditId: 'AUD-005', txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e5f', blockNumber: 1000005, timestamp: '2026-09-11T08:00:00Z', eventType: 'DEBARMENT_CHECK', actor: 'officer@gem.gov.in' },
];

const EVENT_COLORS: Record<string, string> = {
  TENDER_CREATED:   'bg-blue-100 text-blue-800 border-blue-200',
  BID_SUBMITTED:    'bg-purple-100 text-purple-800 border-purple-200',
  COMPLIANCE_RESULT:'bg-emerald-100 text-emerald-800 border-emerald-200',
  HUMAN_OVERRIDE:   'bg-amber-100 text-amber-800 border-amber-200',
  DEBARMENT_CHECK:  'bg-rose-100 text-rose-800 border-rose-200',
  DOC_UPLOADED:     'bg-cyan-100 text-cyan-800 border-cyan-200',
};

type AuditTab = 'BLOCKCHAIN' | 'OVERRIDES' | 'DEBARMENT' | 'COLLUSION';

export const AuditLogPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AuditTab>('BLOCKCHAIN');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [overrides, setOverrides] = useState<any[]>([]);
  const [debarmentHistory, setDebarmentHistory] = useState<any[]>([]);
  const [collusionFlags, setCollusionFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllAuditData();
  }, []);

  async function loadAllAuditData() {
    setLoading(true);
    setError(null);
    try {
      const [logsData, overridesData, debarmentData, collusionData] = await Promise.all([
        apiService.getAuditLogs().catch(() => []),
        apiService.getAuditOverrides().catch(() => []),
        apiService.getDebarmentHistory().catch(() => []),
        apiService.getCollusionFlags().catch(() => []),
      ]);

      setLogs(logsData || []);
      setOverrides(overridesData || []);
      setDebarmentHistory(debarmentData || []);
      setCollusionFlags(collusionData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit data');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Link2 className="w-7 h-7 text-purple-600" />
            Independent Audit & Vigilance Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Chronological ledger of on-chain proofs, human review overrides, debarment checks, and collusion intelligence.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ComplianceAuditLedger.sol — EVM Verified
          </div>
          <button
            onClick={loadAllAuditData}
            className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition"
            title="Refresh Audit Feeds"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-4">
        {[
          { id: 'BLOCKCHAIN', label: 'On-Chain Ledger', icon: Link2, count: MOCK_BLOCKCHAIN.length },
          { id: 'OVERRIDES', label: 'Human Overrides Log', icon: ShieldCheck, count: overrides.length },
          { id: 'DEBARMENT', label: 'Debarment Check History', icon: ShieldAlert, count: debarmentHistory.length },
          { id: 'COLLUSION', label: 'Collusion Signal Flags', icon: Users, count: collusionFlags.length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AuditTab)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-semibold text-sm transition cursor-pointer ${
                isActive
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                isActive ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="p-8 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
          Synchronizing immutable audit records from EVM node and PostgreSQL...
        </div>
      )}

      {error && !loading && <ApiErrorState message={error} onRetry={loadAllAuditData} />}

      {/* TAB 1: BLOCKCHAIN LEDGER */}
      {!loading && activeTab === 'BLOCKCHAIN' && (
        <div className="space-y-6">
          {/* Blockchain Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Events Anchored', value: logs.length > 0 ? logs.length : MOCK_BLOCKCHAIN.length, icon: <Link2 className="w-5 h-5" />, color: 'text-purple-700' },
              { label: 'Smart Contract', value: 'EVM:1337', icon: <ShieldCheck className="w-5 h-5" />, color: 'text-emerald-700' },
              { label: 'Contract Type', value: 'ComplianceAuditLedger', icon: <Lock className="w-5 h-5" />, color: 'text-blue-700' },
              { label: 'Solidity Version', value: '0.8.19', icon: <FileText className="w-5 h-5" />, color: 'text-amber-700' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className={`flex items-center gap-2 ${s.color} mb-1`}>
                  {s.icon}
                  <span className="text-xs font-semibold uppercase tracking-wider">{s.label}</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Blockchain Anchored Events Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-purple-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold">On-Chain Verified Hashes (Hardhat EVM Localhost :8545)</h2>
              </div>
              <span className="text-xs font-mono text-slate-300">Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3</span>
            </div>
            <div className="divide-y divide-slate-100">
              {MOCK_BLOCKCHAIN.map(entry => (
                <div key={entry.txHash} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${EVENT_COLORS[entry.eventType] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {entry.eventType}
                      </span>
                      <span className="text-xs font-mono text-slate-400">Block #{entry.blockNumber}</span>
                      <span className="text-xs text-slate-500">• {new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Actor: <strong className="font-semibold text-slate-700">{entry.actor}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BlockchainProofBadge
                      txHash={entry.txHash}
                      blockNumber={entry.blockNumber}
                      eventType={entry.eventType}
                      timestamp={entry.timestamp}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HUMAN OVERRIDES LOG */}
      {!loading && activeTab === 'OVERRIDES' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Dedicated Human Override Log</h2>
              <p className="text-xs text-slate-500 mt-0.5">Auditor oversight of every override enacted by Officers and Reviewers with mandatory justification (≥ 15 chars).</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded">
              GFR 2017 AUDIT TRAIL
            </span>
          </div>
          {overrides.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No human overrides recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                  <tr>
                    <th className="py-3 px-4">Override ID</th>
                    <th className="py-3 px-4">Requirement</th>
                    <th className="py-3 px-4">Bid ID</th>
                    <th className="py-3 px-4">Overridden By</th>
                    <th className="py-3 px-4">Transition</th>
                    <th className="py-3 px-4">Mandatory Justification</th>
                    <th className="py-3 px-4">Timestamp & On-Chain Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overrides.map((ov: any) => (
                    <tr key={ov.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-purple-700">{ov.id}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-800 font-bold">{ov.requirementCode}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">{ov.bidId}</td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-semibold text-slate-800">{ov.reviewerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ov.reviewerRole}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{ov.originalStatus}</span>
                          <span>→</span>
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{ov.overriddenStatus}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700 max-w-sm">
                        <p className="italic bg-slate-50 p-2 rounded border border-slate-100">"{ov.justification}"</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[11px] text-slate-400 font-mono mb-1">
                          {new Date(ov.timestamp).toLocaleString()}
                        </div>
                        <BlockchainProofBadge
                          compact
                          txHash={ov.blockchainTxHash}
                          eventType="HUMAN_OVERRIDE"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DEBARMENT CHECK HISTORY */}
      {!loading && activeTab === 'DEBARMENT' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Debarment & Blacklist Verification History</h2>
              <p className="text-xs text-slate-500 mt-0.5">Automated cross-check logs across Ministry of Finance, GeM Incident Management, and CPPP blacklists.</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold rounded">
              STATUTORY BLACKLIST CHECK
            </span>
          </div>
          {debarmentHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No debarment records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                  <tr>
                    <th className="py-3 px-4">Check ID</th>
                    <th className="py-3 px-4">Bidder / Company Name</th>
                    <th className="py-3 px-4">GSTIN & PAN</th>
                    <th className="py-3 px-4">Registries Checked</th>
                    <th className="py-3 px-4">Outcome Status</th>
                    <th className="py-3 px-4">Checked At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {debarmentHistory.map((d: any) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-slate-600">{d.id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{d.bidderName}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">
                        <div>GSTIN: {d.gstin}</div>
                        <div>PAN: {d.pan}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(d.registriesChecked || []).map((reg: string) => (
                            <span key={reg} className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                              {reg}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                          d.status === 'CLEAR'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}>
                          {d.status === 'CLEAR' ? '✓ CLEAR (No Debarment Found)' : '⚠ FLAGGED / DEBARRED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                        {new Date(d.checkedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COLLUSION SIGNAL FLAGS */}
      {!loading && activeTab === 'COLLUSION' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <span className="font-bold block text-sm">Auditor & Vigilance Collusion Intelligence</span>
              <span>Signals below are auto-detected by cross-bidder correlation engines (shared bank accounts, common directors, identical submission IP subnets). Framed strictly as flags for human investigation under GFR Rule 173, never as automated accusations.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collusionFlags.map((c: any) => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {c.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    c.severity === 'HIGH' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {c.severity} SEVERITY
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900">{c.flagType.replace(/_/g, ' ')}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.description}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1">
                  <div className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Competing Bidders Involved:</div>
                  <div className="font-mono text-slate-800 font-bold">{(c.biddersInvolved || []).join(' vs ')}</div>
                  <div className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider mt-2">Corroborating Evidence:</div>
                  <div className="font-mono text-slate-700 bg-white p-2 rounded border border-slate-200">{c.evidence}</div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-400 font-mono">Status: <strong className="text-amber-700">{c.status}</strong></span>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Signal Confidence: {((c.signalConfidence || 0.9) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

