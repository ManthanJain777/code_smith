import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, Copy, Check, Lock, Database } from 'lucide-react';

interface BlockchainProofBadgeProps {
  txHash?: string;
  blockNumber?: number;
  eventType?: string;
  timestamp?: string;
  compact?: boolean;
}

export const BlockchainProofBadge: React.FC<BlockchainProofBadgeProps> = ({
  txHash = "0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
  blockNumber = 1000042,
  eventType = "COMPLIANCE_EVALUATION",
  timestamp = new Date().toISOString(),
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
        title="Anchored on Ethereum ComplianceAuditLedger"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>On-Chain</span>
      </button>
    );
  }

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-lg text-xs cursor-pointer hover:border-emerald-300 hover:shadow-sm transition-all"
      >
        <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Ethereum Verified</span>
        </div>
        <span className="text-slate-400">|</span>
        <span className="font-mono text-slate-600 text-[11px]">{shortHash}</span>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
          title="Copy Transaction Hash"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Ethereum Proof of Existence</h3>
                  <p className="text-xs text-slate-300">Smart Contract: ComplianceAuditLedger.sol</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-900">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-xs uppercase tracking-wide">Tamper-Proof Audit State</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-emerald-200/60 rounded-full font-bold text-emerald-800">
                  Block #{blockNumber}
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction Hash</label>
                  <div className="flex items-center justify-between p-2.5 mt-1 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 break-all">
                    <span>{txHash}</span>
                    <button onClick={handleCopy} className="ml-2 text-slate-500 hover:text-slate-800">
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
                    <p className="font-medium text-slate-900 mt-0.5 text-xs">Ethereum EVM (Chain ID 1337) / Sepolia Network</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-xs text-slate-500 font-semibold">Anchoring Timestamp</span>
                  <p className="font-medium text-slate-800 mt-0.5 text-xs">{new Date(timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" /> keccak256 cryptographic root
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
