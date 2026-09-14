import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Tender } from '../types/compliance';
import { ApiErrorState } from '../components/ui/ApiErrorState';
import { CreateTenderModal } from '../components/tenders/CreateTenderModal';
import { Can } from '../components/auth/Can';
import { useAuth } from '../context/AuthProvider';
import {
  FileText, Plus, CheckCircle, ShieldCheck, Award, Search,
  Filter, Calendar, DollarSign, Building2, UploadCloud, Download,
  Clock, ArrowRight, CheckCircle2, ChevronRight, AlertCircle, Sparkles
} from 'lucide-react';

export const TendersPage: React.FC = () => {
  const { user } = useAuth();
  const isBidder = user?.role === 'BIDDER_VENDOR' || user?.role === 'BIDDER';

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getTenders();
      setTenders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tenders list');
    } finally {
      setLoading(false);
    }
  }

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    tenders.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tenders]);

  // Filtered tenders
  const filteredTenders = useMemo(() => {
    return tenders.filter(t => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tenderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.issuingAuthority?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || t.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'ALL' || t.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [tenders, searchQuery, selectedCategory, selectedStatus]);

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 font-medium text-sm">Querying National GeM Tender Database...</p>
      </div>
    );
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Role-Tailored Messaging */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              GFR 2017 & 2024 Vetted
            </span>
            <span className="text-xs text-slate-400">Government e-Marketplace (GeM)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
            {isBidder ? 'Live Procurement Tenders & Bidding Opportunities' : 'GeM Tenders & Requirement Requisitions'}
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            {isBidder
              ? 'Explore open bids across Central Ministries, state departments, and PSUs. Review technical clauses, verify eligibility, and submit digitally signed bids.'
              : 'Manage published tender specifications, automated clause extractions, multi-bidder compliance evaluation, and award determinations.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Can role={['SYSTEM_ADMIN', 'BIDDER_VENDOR', 'BIDDER']}>
            <Link
              to="/bids/upload"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Submit Bid Dossier</span>
            </Link>
          </Can>

          <Can role={['PROCUREMENT_OFFICER', 'SYSTEM_ADMIN']}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-500 transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Tender Notice (NIT)
            </button>
          </Can>
        </div>
      </div>

      <CreateTenderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />

      {/* Tender Search & Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tender ref number, ministry, title, or technical keywords..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { label: 'All Bids', value: 'ALL' },
              { label: 'Accepting Bids', value: 'IN_EVALUATION' },
              { label: 'Open', value: 'OPEN' },
              { label: 'Closed', value: 'CLOSED' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedStatus === tab.value
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories ({tenders.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tenders Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong>{filteredTenders.length}</strong> of <strong>{tenders.length}</strong> registered tenders</span>
        {isBidder && (
          <span className="text-purple-700 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> All open tenders eligible for MSME EMD exemption per GFR Rule 170
          </span>
        )}
      </div>

      {/* Tenders List */}
      <div className="space-y-6">
        {filteredTenders.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No matching tenders found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search query or filter settings.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setSelectedStatus('ALL'); }}
              className="text-xs font-semibold text-purple-600 hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredTenders.map((tender) => (
            <div key={tender.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition">
              {/* Tender Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded font-semibold">
                      {tender.tenderNumber}
                    </span>
                    <span className="text-xs font-medium text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 px-2.5 py-0.5 rounded-full">
                      {tender.status === 'IN_EVALUATION' ? 'ACCEPTING BIDS / EVALUATION' : tender.status}
                    </span>
                    {tender.category && (
                      <span className="text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {tender.category}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{tender.title}</h2>
                  <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Authority:</strong> {tender.issuingAuthority}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Closing:</strong> 30-Sep-2026, 17:00 IST
                    </span>
                  </div>
                </div>

                {/* Right side: Value and Key Action */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Value</span>
                    <span className="text-2xl font-extrabold text-white">
                      ₹{(tender.estimatedValue / 10000000).toFixed(2)} Cr
                    </span>
                    <span className="text-[10px] text-emerald-400 block font-medium">EMD: ₹{(tender.estimatedValue * 0.02 / 100000).toFixed(1)} Lakh (MSME Exempt)</span>
                  </div>

                  {/* Role-Specific Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Direct Participation for Bidders */}
                    <Can role={['BIDDER_VENDOR', 'BIDDER', 'SYSTEM_ADMIN']}>
                      {tender.status !== 'CLOSED' ? (
                        <Link
                          to={`/bids/upload?tenderId=${tender.id}`}
                          className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                          title="Participate in this tender and upload technical/financial bid"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Participate & Submit Bid</span>
                        </Link>
                      ) : (
                        <span className="px-3 py-1.5 bg-slate-800 text-slate-400 text-xs font-semibold rounded border border-slate-700">
                          Bidding Closed
                        </span>
                      )}
                    </Can>

                    {/* Officer Actions */}
                    <Can role={['PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN']}>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await apiService.runCompliancePipeline(tender.id);
                            alert(`Compliance evaluation executed for ${tender.tenderNumber}: ${res.message || 'Complete'}`);
                          } catch (e: any) {
                            alert(`Evaluation error: ${e.message}`);
                          }
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        title="Execute deterministic & AI evaluation on submitted bids"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Run Evaluation</span>
                      </button>
                    </Can>

                    <Can role={['SYSTEM_ADMIN', 'PROCUREMENT_OFFICER']}>
                      <Link
                        to={`/tenders/${tender.id}/compare`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition flex items-center gap-1"
                      >
                        <span>Compare Bids</span>
                      </Link>
                    </Can>

                    <Link
                      to={`/compliance?tenderId=${tender.id}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                    >
                      <span>Matrix</span>
                    </Link>

                    <Link
                      to={`/tenders/${tender.id}/results`}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-xs"
                      title="View public award determination and on-chain proof"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Standings & Proof</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Description & NIT Summary */}
              {tender.description && (
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="line-clamp-2">{tender.description}</p>
                </div>
              )}

              {/* Extracted Requirements List */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Statutory Compliance & Technical Clauses ({tender.requirements ? tender.requirements.length : 0})
                    </h3>
                  </div>

                  {isBidder && (
                    <Link
                      to={`/bids/upload?tenderId=${tender.id}`}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                    >
                      Verify Eligibility & Apply <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">Code</th>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4">Requirement Specification</th>
                        <th className="py-2.5 px-4">Verification Type</th>
                        <th className="py-2.5 px-4">Threshold / Condition</th>
                        <th className="py-2.5 px-4">GFR Mandatory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {tender.requirements && tender.requirements.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">{req.reqCode}</td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium">
                              {req.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-md text-slate-900 font-medium">{req.rawText}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{req.reqType}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {req.threshold !== undefined && req.threshold !== null
                              ? `${req.operator || ''} ${req.threshold} ${req.unit || ''}`
                              : 'Certificate Required'}
                          </td>
                          <td className="py-3 px-4">
                            {req.isMandatory ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Mandatory
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Desirable</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
