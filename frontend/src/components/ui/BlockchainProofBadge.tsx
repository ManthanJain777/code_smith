import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, Copy, Check, Lock, Database, Award } from 'lucide-react';

interface BlockchainProofBadgeProps {
  txHash?: string;
  blockNumber?: number;
  eventType?: string;
  timestamp?: string;
  status?: 'ON_CHAIN_CONFIRMED' | 'OFFLINE' | 'MOCK_ONLY' | 'OFFLINE_DEMO_HASH' | string;
  compact?: boolean;
}

export const BlockchainProofBadge: React.FC<BlockchainProofBadgeProps> = ({
  txHash,
  blockNumber,
  eventType = "COMPLIANCE_EVALUATION",
  timestamp = new Date().toISOString(),
  status = "ON_CHAIN_CONFIRMED",
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Do not render if there is no real txHash
  if (!txHash) return null;

  const isConfirmed = status === "ON_CHAIN_CONFIRMED" && 
    !txHash.toLowerCase().startsWith("0xoffline") && 
    !txHash.toLowerCase().includes("mock") && 
    !txHash.toLowerCase().includes("demo");
  const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
          isConfirmed 
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" 
            : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
        }`}
        title={isConfirmed ? "Anchored on EVM ComplianceAuditLedger" : "Offline Simulation / Demo Digest"}
      >
        <ShieldCheck className={`w-3.5 h-3.5 ${isConfirmed ? "text-emerald-600" : "text-amber-600"}`} />
        <span>{isConfirmed ? "On-Chain" : "Demo Hash (Offline)"}</span>
      </button>
    );
  }

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs cursor-pointer hover:shadow-sm transition-all ${
          isConfirmed 
            ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200/80 hover:border-emerald-300"
            : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/80 hover:border-amber-300"
        }`}
      >
        <div className={`flex items-center gap-1.5 font-semibold relative ${isConfirmed ? "text-emerald-800" : "text-amber-900"}`}>
          <Award className={`w-5 h-5 drop-shadow-md ${isConfirmed ? "text-red-700" : "text-amber-700"}`} style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))' }} />
          <span>{isConfirmed ? "EVM On-Chain Anchor" : "Simulated Demo Digest"}</span>
        </div>
        <span className="text-slate-400">|</span>
        <span className="font-mono text-[#00FF41] bg-black px-1.5 py-0.5 rounded text-[11px] font-bold tracking-widest shadow-inner">{shortHash}</span>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
          title="Copy Digest / Hash"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${isConfirmed ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {isConfirmed ? "EVM Proof of Existence" : "Offline Demo Audit Digest"}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {isConfirmed ? "Smart Contract: ComplianceAuditLedger.sol" : "Simulated Digest (Node Offline)"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className={`flex items-center justify-between p-3 border rounded-xl ${
                isConfirmed ? "bg-emerald-50 border-emerald-100 text-emerald-900" : "bg-amber-50 border-amber-100 text-amber-900"
              }`}>
                <div className="flex items-center gap-2">
                  <Lock className={`w-4 h-4 ${isConfirmed ? "text-emerald-600" : "text-amber-600"}`} />
                  <span className="font-semibold text-xs uppercase tracking-wide">
                    {isConfirmed ? "Tamper-Proof Audit State" : "Simulated Audit Proof"}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isConfirmed ? "bg-emerald-200/60 text-emerald-800" : "bg-amber-200/60 text-amber-800"
                }`}>
                  {isConfirmed ? `Block #${blockNumber}` : "Simulated Block"}
                </span>
              </div>

              {!isConfirmed && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-800">
                  Notice: EVM node is currently offline or unreachable. This SHA-256 fallback digest preserves data integrity structure for demo purposes, but is not confirmed on a live blockchain network.
                </div>
              )}

              <div className="space-y-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {isConfirmed ? "Transaction Hash" : "Digest String"}
                  </label>
                  <div className="flex items-center justify-between p-2.5 mt-1 bg-black border border-slate-700 shadow-inner rounded-lg font-mono text-xs text-[#00FF41] tracking-wider break-all">
                    <span>{txHash}</span>
                    <button onClick={handleCopy} className="ml-2 text-slate-400 hover:text-white">
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xs text-slate-500 font-semibold">Event Type</span>
                    <p className="font-medium text-slate-900 mt-0.5 text-xs">{eventType}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xs text-slate-500 font-semibold">Network</span>
                    <p className="font-medium text-slate-900 mt-0.5 text-xs">
                      {isConfirmed ? "EVM (Hardhat Local Node, Chain ID 31337)" : "Offline Standalone Runtime"}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-xs text-slate-500 font-semibold">Anchoring Timestamp</span>
                  <p className="font-medium text-slate-800 mt-0.5 text-xs">{new Date(timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" /> keccak256 / sha256 cryptographic root
                </span>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Close Proof
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
