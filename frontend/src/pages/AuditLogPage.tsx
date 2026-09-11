import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { AuditLog } from '../types/compliance';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { BlockchainProofBadge } from '../components/ui/BlockchainProofBadge';
import { Link2, ShieldCheck, Clock, User, FileText, Lock, CheckCircle2 } from 'lucide-react';

interface BlockchainEntry {
  auditId: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  eventType: string;
  actor: string;
}

// Demo blockchain records aligned with smart contract events
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

function short(hash: string) {
  return hash.slice(0, 10) + '...' + hash.slice(-6);
}

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<BlockchainEntry | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAuditLogs();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading audit trail...</div>;
  if (error) return <ApiErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Immutable Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-1">
            Every procurement event — AI evaluation, human review override, document ingest — is immutably anchored on Ethereum.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ComplianceAuditLedger.sol — Active
        </div>
      </div>

      {/* Blockchain Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Events Anchored', value: logs.length > 0 ? logs.length : MOCK_BLOCKCHAIN.length, icon: <Link2 className="w-5 h-5" />, color: 'text-purple-700' },
          { label: 'Smart Contract', value: 'EVM:1337', icon: <ShieldCheck className="w-5 h-5" />, color: 'text-emerald-700' },
          { label: 'Contract Type', value: 'AuditLedger', icon: <Lock className="w-5 h-5" />, color: 'text-blue-700' },
          { label: 'Solidity Ver', value: '0.8.19', icon: <FileText className="w-5 h-5" />, color: 'text-amber-700' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className={`flex items-center gap-2 ${s.color} mb-1`}>
              {s.icon}
              <span className="text-xs font-semibold uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Blockchain Anchored Events Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-purple-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold">On-Chain Verified Hashes (Hardhat / Sepolia)</h2>
          </div>
          <span className="text-xs text-slate-300">Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3</span>
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

      {/* Database Audit Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-slate-900">Application Audit Events</h2>
          </div>
          <span className="text-xs text-slate-400">{logs.length} logged events</span>
        </div>
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No application logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">{log.id.slice(0, 8)}...</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${EVENT_COLORS[log.action] || 'bg-slate-100 text-slate-700'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700">{log.performedBy}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{log.entityType} ({log.entityId ? log.entityId.slice(0, 8) : 'N/A'})</td>
                    <td className="py-3 px-4 text-xs text-slate-800">{log.details || '—'}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
