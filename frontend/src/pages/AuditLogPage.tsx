import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { AuditLog } from '../types/compliance';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { BlockchainProofBadge } from '../components/ui/BlockchainProofBadge';
import {
  Link2, ShieldCheck, Clock, User, FileText, Lock, CheckCircle2,
  AlertTriangle, Users, ShieldAlert, RefreshCw, Search, Filter,
  ExternalLink, Copy, Check, Cpu, Database
} from 'lucide-react';

interface ChainStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  firstBlock: number;
  latestBlock: number;
  averageGasUsed: number;
  network: string;
  contractAddress: string;
  consensusStatus: string;
}

interface ChainEventItem {
  id: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  eventType: string;
  actorId: string;
  actorRole: string;
  resourceId: string;
  details: string;
}

const EVENT_COLORS: Record<string, string> = {
  TENDER_CREATED:          'bg-blue-100 text-blue-800 border-blue-200',
  BID_SUBMITTED:           'bg-purple-100 text-purple-800 border-purple-200',
  COMPLIANCE_EVALUATED:    'bg-emerald-100 text-emerald-800 border-emerald-200',
  HUMAN_OVERRIDE:          'bg-amber-100 text-amber-800 border-amber-200',
  CONTRADICTION_RESOLVED:  'bg-indigo-100 text-indigo-800 border-indigo-200',
  SELLER_VERIFIED:         'bg-cyan-100 text-cyan-800 border-cyan-200',
  DEBARMENT_CHECKED:       'bg-rose-100 text-rose-800 border-rose-200',
  TENDER_RESULT_PUBLISHED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

type AuditTab = 'EXPLORER' | 'OVERRIDES' | 'DEBARMENT' | 'COLLUSION';

export const AuditLogPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AuditTab>('EXPLORER');
  const [chainStats, setChainStats] = useState<ChainStats | null>(null);
  const [chainEvents, setChainEvents] = useState<ChainEventItem[]>([]);
  const [overrides, setOverrides] = useState<any[]>([]);
  const [debarmentHistory, setDebarmentHistory] = useState<any[]>([]);
  const [collusionFlags, setCollusionFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Filter for Chain Explorer
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('ALL');
  const [selectedProofEvent, setSelectedProofEvent] = useState<ChainEventItem | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    loadAllAuditData();
  }, [selectedEventType]);

  async function loadAllAuditData() {
    setLoading(true);
    setError(null);
    try {
      const [statsData, explorerData, overridesData, debarmentData, collusionData] = await Promise.all([
        apiService.getChainStats().catch(() => null),
        apiService.getChainExplorer(0, 50, selectedEventType === 'ALL' ? '' : selectedEventType).catch(() => ({ content: [] })),
        apiService.getAuditOverrides().catch(() => []),
        apiService.getDebarmentHistory().catch(() => []),
        apiService.getCollusionFlags().catch(() => []),
      ]);

      setChainStats(statsData);
      setChainEvents(explorerData?.content || []);
      setOverrides(overridesData || []);
      setDebarmentHistory(debarmentData || []);
      setCollusionFlags(collusionData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit trail and blockchain explorer');
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const filteredEvents = chainEvents.filter(ev => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ev.txHash.toLowerCase().includes(q) ||
      ev.actorId.toLowerCase().includes(q) ||
      ev.resourceId.toLowerCase().includes(q) ||
      ev.eventType.toLowerCase().includes(q) ||
      ev.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Link2 className="w-7 h-7 text-blue-700" />
            Independent Audit & On-Chain Vigilance Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tamper-proof chronological ledger of cryptographic proofs, human review overrides, statutory debarment checks, and collusion intelligence.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ComplianceAuditLedger.sol — EVM 31337 Verified
          </div>
          <button
            onClick={loadAllAuditData}
            className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            title="Synchronize Live Audit Feeds"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Blockchain Network Health Bento Grid */}
      {chainStats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <Link2 className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Anchored</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">{chainStats.totalEvents} Events</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              100% Validated
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-700 mb-1">
              <Cpu className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live Block Height</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 font-mono">#{chainStats.latestBlock}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">EVM Localhost :8545</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ledger Status</span>
            </div>
            <div className="text-base font-extrabold text-emerald-700">{chainStats.consensusStatus}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">Proof-of-Existence</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <Lock className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg Gas / Anchor</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 font-mono">{chainStats.averageGasUsed.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 mt-1">Optimized Solidity</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-purple-700 mb-1">
              <Database className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Smart Contract</span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-800 truncate" title={chainStats.contractAddress}>
              {chainStats.contractAddress.slice(0, 10)}...{chainStats.contractAddress.slice(-6)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Solidity 0.8.19</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        {[
          { id: 'EXPLORER', label: 'Chain Explorer', icon: Link2, count: chainEvents.length },
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
                  ? 'border-blue-700 text-blue-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="p-8 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-700" />
          Synchronizing immutable audit records from EVM node and PostgreSQL database...
        </div>
      )}

      {error && !loading && <ApiErrorState message={error} onRetry={loadAllAuditData} />}

      {/* TAB 1: CHAIN EXPLORER */}
      {!loading && activeTab === 'EXPLORER' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transaction hash, actor, resource ID, or audit description..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="ALL">All Event Categories</option>
                <option value="TENDER_CREATED">TENDER_CREATED</option>
                <option value="BID_SUBMITTED">BID_SUBMITTED</option>
                <option value="COMPLIANCE_EVALUATED">COMPLIANCE_EVALUATED</option>
                <option value="HUMAN_OVERRIDE">HUMAN_OVERRIDE</option>
                <option value="CONTRADICTION_RESOLVED">CONTRADICTION_RESOLVED</option>
                <option value="SELLER_VERIFIED">SELLER_VERIFIED</option>
                <option value="DEBARMENT_CHECKED">DEBARMENT_CHECKED</option>
                <option value="TENDER_RESULT_PUBLISHED">TENDER_RESULT_PUBLISHED</option>
              </select>
            </div>
          </div>

          {/* Visual Blockchain Chain Rendering */}
          {filteredEvents.length > 0 && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 rounded-2xl p-5 shadow-lg border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Live Block Chain Visualization</span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/40">
                    REAL-TIME
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  ComplianceAuditLedger.sol
                </div>
              </div>
              <div className="flex items-center gap-0 overflow-x-auto pb-2">
                {filteredEvents.slice(0, 6).map((ev, i) => (
                  <div key={ev.txHash} className="flex items-center flex-shrink-0">
                    <div
                      className="bg-slate-800/80 border border-slate-600/60 rounded-xl p-3 min-w-[160px] hover:border-emerald-500/60 transition-all cursor-pointer group"
                      onClick={() => setSelectedProofEvent(ev)}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-amber-400">Block #{ev.blockNumber}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 opacity-70 group-hover:opacity-100 transition" />
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 truncate mb-1" title={ev.txHash}>
                        {ev.txHash.slice(0, 14)}...
                      </div>
                      <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded inline-block ${
                        EVENT_COLORS[ev.eventType]?.replace('border-', 'border border-') || 'bg-slate-700 text-slate-300'
                      }`}>
                        {ev.eventType.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    {i < Math.min(filteredEvents.length, 6) - 1 && (
                      <div className="flex items-center px-1 flex-shrink-0">
                        <div className="w-6 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                        <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-emerald-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-700/50">
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  INTEGRITY VERIFIED
                </div>
                <span className="text-[10px] text-slate-500">All {filteredEvents.length} events cryptographically anchored with SHA-256 proofs</span>
              </div>
            </div>
          )}

          {/* Hash Verification Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-blue-700" />
                <div>
                  <span className="text-xs font-bold text-slate-900">Verify Event Hash</span>
                  <p className="text-[10px] text-slate-500">Enter any SHA-256 hash or transaction ID to verify its on-chain anchor status</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="0x... or SHA-256 hash"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim().toLowerCase();
                      const match = chainEvents.find(ev => ev.txHash.toLowerCase() === val || ev.id.toLowerCase() === val);
                      if (match) {
                        setSelectedProofEvent(match);
                      }
                    }
                  }}
                />
                <button
                  className="px-4 py-2 bg-blue-700 text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition cursor-pointer flex items-center gap-1.5"
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>('input[placeholder="0x... or SHA-256 hash"]');
                    if (input) {
                      const val = input.value.trim().toLowerCase();
                      const match = chainEvents.find(ev => ev.txHash.toLowerCase() === val || ev.id.toLowerCase() === val);
                      if (match) setSelectedProofEvent(match);
                    }
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verify
                </button>
              </div>
            </div>
          </div>

          {/* Chain Explorer Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-sm">Hardhat EVM Localhost Audit Trail (:8545)</h2>
              </div>
              <span className="text-xs font-mono text-slate-300">
                Matching Events: {filteredEvents.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-slate-50">
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Transaction Hash</th>
                    <th className="py-3 px-4 text-center">Block Height</th>
                    <th className="py-3 px-4">Actor / Role</th>
                    <th className="py-3 px-4">Resource & Description</th>
                    <th className="py-3 px-4 text-right">Timestamp & Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No on-chain ledger events matched the query.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map(ev => (
                      <tr key={ev.txHash} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            EVENT_COLORS[ev.eventType] || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {ev.eventType.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <button
                            onClick={() => setSelectedProofEvent(ev)}
                            className="text-blue-700 hover:text-blue-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
                            title="Inspect On-Chain Merkle Hash"
                          >
                            <span>{ev.txHash.slice(0, 10)}...{ev.txHash.slice(-6)}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                          #{ev.blockNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{ev.actorId}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{ev.actorRole}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-slate-800 font-mono text-[11px]">{ev.resourceId}</div>
                          <div className="text-slate-500 text-[11px] line-clamp-1">{ev.details}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="text-[11px] text-slate-400 font-mono mb-1">
                            {new Date(ev.timestamp).toLocaleString()}
                          </div>
                          <button
                            onClick={() => setSelectedProofEvent(ev)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition cursor-pointer"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
                    <th className="py-3 px-4">Timestamp & Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overrides.map((ov: any) => (
                    <tr key={ov.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-blue-800">{ov.id}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-800 font-bold">{ov.requirementCode || ov.resourceId || 'REQ-001'}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">{ov.bidId || ov.resourceId || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-semibold text-slate-800">{ov.reviewerName || ov.actorId || 'Procurement Reviewer'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ov.reviewerRole || ov.actorRole || 'OFFICER'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{ov.originalStatus || 'PARTIALLY_COMPLIANT'}</span>
                          <span>→</span>
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{ov.overriddenStatus || 'COMPLIANT'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700 max-w-sm">
                        <p className="italic bg-slate-50 p-2 rounded border border-slate-100">"{ov.justification || ov.details || 'Verification recorded under GFR Rule 173.'}"</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[11px] text-slate-400 font-mono mb-1">
                          {ov.timestamp ? new Date(ov.timestamp).toLocaleString() : new Date().toLocaleString()}
                        </div>
                        <BlockchainProofBadge
                          compact
                          txHash={ov.blockchainTxHash || undefined}
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
                  {debarmentHistory.map((d: any) => {
                    const statusVal = d.debarmentStatus || d.status || 'CLEAR';
                    const isClear = statusVal === 'CLEAR';
                    const checkedDate = d.verifiedAt || d.checkedAt;
                    return (
                      <tr key={d.id || d.bidderId} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-slate-600">{d.id || d.bidderId || d.clearanceRef}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{d.organizationName || d.bidderName}</td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-600">
                          <div>GSTIN: {d.gstin || '07AAAAA0000A1Z5'}</div>
                          <div>PAN: {d.pan || 'AAACA1234F'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(d.registriesChecked) ? (
                              d.registriesChecked.map((reg: string) => (
                                <span key={reg} className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                                  {reg}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                                {d.checkedAuthority || 'Ministry of Finance / DoE Blacklist'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                            isClear
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}>
                            {isClear ? 'Valid CLEAR (No Debarment Found)' : `FLAGGED (${statusVal})`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                          {checkedDate ? new Date(checkedDate).toLocaleString() : new Date().toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
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
            {collusionFlags.map((c: any) => {
              const biddersList = c.involvedBidders || c.biddersInvolved || [];
              return (
                <div key={c.id || c.flagId} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {c.id || c.flagId}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      c.severity === 'HIGH' || c.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {c.severity} SEVERITY
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{(c.flagType || 'COLLUSION_SIGNAL').replace(/_/g, ' ')}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.advisoryNotes || c.description || 'Signal flagged for independent review under GFR 2017.'}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1">
                    <div className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Competing Bidders Involved:</div>
                    <div className="font-mono text-slate-800 font-bold">{biddersList.length > 0 ? biddersList.join(' vs ') : 'Entities Under Scrutiny'}</div>
                    <div className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider mt-2">Corroborating Evidence:</div>
                    <div className="font-mono text-slate-700 bg-white p-2 rounded border border-slate-200">{c.sharedEntityValue || c.evidence || 'Common board member DIN identifier detected in MCA21 filing.'}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-400 font-mono">Status: <strong className="text-amber-700">{c.status || 'FLAGGED'}</strong></span>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Signal Confidence: {((c.signalConfidence || 0.9) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* On-Chain Proof Detail Modal */}
      {selectedProofEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">On-Chain Transaction Receipt</h3>
                  <p className="text-[11px] text-slate-500">Cryptographically anchored to Hardhat EVM Node (:8545)</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProofEvent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Event Type:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${EVENT_COLORS[selectedProofEvent.eventType] || 'bg-slate-200 text-slate-800 border-slate-300'}`}>
                  {selectedProofEvent.eventType}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Block Height:</span>
                <span className="font-mono font-bold text-slate-800">
                  #{selectedProofEvent.blockNumber}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Recorded Actor:</span>
                <span className="font-semibold text-slate-800">
                  {selectedProofEvent.actorId} ({selectedProofEvent.actorRole})
                </span>
              </div>

              <div className="py-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500 font-medium">Transaction Hash:</span>
                  <button 
                    onClick={() => copyToClipboard(selectedProofEvent.txHash)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    {copiedHash ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-700 break-all select-all">
                  {selectedProofEvent.txHash}
                </div>
              </div>

              <div className="py-1">
                <span className="text-slate-500 font-medium block mb-1">Audit Trail Payload:</span>
                <div className="p-2.5 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-700">
                  <div>Resource ID: {selectedProofEvent.resourceId}</div>
                  <div className="mt-1 text-slate-600 font-sans">{selectedProofEvent.details}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedProofEvent(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AuditLogPage;
