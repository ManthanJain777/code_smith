import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight,
  ShieldCheck, ArrowLeft, Trash2, Eye, Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthProvider';
import { BlockchainProofBadge } from '../components/ui/BlockchainProofBadge';

interface FileUploadState {
  file: File;
  name: string;
  size: number;
  jobId?: string;
  status: 'PENDING' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  chunksIndexed?: number;
  pageCount?: number;
  error?: string;
}

export const BidUploadPage: React.FC = () => {
  const { bidId: paramBidId } = useParams<{ bidId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [bidId, setBidId] = useState(paramBidId || 'BID-APEX-001');
  const [tenderId, setTenderId] = useState('TND-PUMP-001');
  const [vendorName, setVendorName] = useState('Apex Pumps & Motors Pvt Ltd');
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [allDone, setAllDone] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        name: file.name,
        size: file.size,
        status: 'PENDING' as const,
        progress: 0,
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const loadDemoBidPack = async () => {
    const demoDocs = [
      'Apex_Pumps_Technical_Datasheet.pdf',
      'Apex_CA_Turnover_Certificate.pdf',
      'Apex_Audited_Balance_Sheet_FY25.pdf',
      'Apex_ISO_9001_Certificate.pdf',
      'Apex_GST_Registration_Certificate.pdf'
    ];

    const loadedFiles: FileUploadState[] = [];
    for (const docName of demoDocs) {
      try {
        const res = await fetch(`/demo_docs/${docName}`);
        if (res.ok) {
          const blob = await res.blob();
          const f = new File([blob], docName, { type: 'application/pdf' });
          loadedFiles.push({
            file: f,
            name: docName,
            size: blob.size,
            status: 'PENDING',
            progress: 0
          });
        }
      } catch (err) {
        console.warn(`Could not load /demo_docs/${docName}`, err);
      }
    }

    if (loadedFiles.length > 0) {
      setFiles(loadedFiles);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const startIngestionPipeline = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setOverallProgress(10);

    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      const fileItem = updatedFiles[i];
      try {
        fileItem.status = 'PROCESSING';
        fileItem.progress = 25;
        setFiles([...updatedFiles]);

        // Upload to AI Service Async Worker
        const formData = new FormData();
        formData.append('file', fileItem.file);
        formData.append('bid_id', bidId);

        const aiServiceUrl = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';
        const res = await fetch(`${aiServiceUrl}/api/v1/ai/documents/upload-async`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Upload failed: ${res.statusText}`);
        }

        const data = await res.json();
        fileItem.jobId = data.job_id;
        fileItem.status = 'QUEUED';
        setFiles([...updatedFiles]);

        // Poll job status
        let completed = false;
        let attempts = 0;
        while (!completed && attempts < 20) {
          attempts++;
          await new Promise(r => setTimeout(r, 600));

          const pollRes = await fetch(`${aiServiceUrl}/api/v1/ai/jobs/${fileItem.jobId}`);
          if (pollRes.ok) {
            const jobData = await pollRes.json();
            fileItem.progress = jobData.progress_percent || 75;
            if (jobData.status === 'COMPLETED') {
              fileItem.status = 'COMPLETED';
              fileItem.progress = 100;
              fileItem.pageCount = jobData.page_count;
              fileItem.chunksIndexed = jobData.chunk_count;
              completed = true;
            } else if (jobData.status === 'FAILED') {
              fileItem.status = 'FAILED';
              fileItem.error = jobData.error || 'Job failed';
              completed = true;
            }
            setFiles([...updatedFiles]);
          }
        }
      } catch (err: any) {
        fileItem.status = 'FAILED';
        fileItem.error = err.message || 'Processing error';
        setFiles([...updatedFiles]);
      }

      setOverallProgress(Math.round(((i + 1) / updatedFiles.length) * 100));
    }

    setIsProcessing(false);
    setAllDone(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/tenders" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition" title="Back to Tenders">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Vendor Bid Submission Portal</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                Vendor Ingestion Rail
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Seller Document Upload: Extracts text, computes SHA-256 hashes, indexes embeddings, and prepares submissions for Procurement Officer review.
            </p>
          </div>
        </div>
        <BlockchainProofBadge
          txHash="0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a"
          blockNumber={1000050}
          eventType="DOC_INGESTION"
          compact
        />
      </div>

      {/* Metadata Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="font-semibold text-slate-500 block mb-1">Target Tender ID</label>
          <input
            type="text"
            value={tenderId}
            onChange={e => setTenderId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-800"
          />
        </div>
        <div>
          <label className="font-semibold text-slate-500 block mb-1">Bid Identifier</label>
          <input
            type="text"
            value={bidId}
            onChange={e => setBidId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-800"
          />
        </div>
        <div>
          <label className="font-semibold text-slate-500 block mb-1">Bidder / Company Name</label>
          <input
            type="text"
            value={vendorName}
            onChange={e => setVendorName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
          />
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-400 p-8 text-center transition-colors shadow-sm">
        <UploadCloud className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 mb-1">Upload Bid PDF Documents</h3>
        <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
          Drag & drop technical datasheets, audited financials, CA certificates, or ISO registrations.
          PyMuPDF extracts tables, page refs, and runs prompt injection sanitization.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition shadow-sm">
            <span>Browse Local Files</span>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={isProcessing}
            />
          </label>
          <button
            type="button"
            onClick={loadDemoBidPack}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer transition shadow-sm"
          >
            <span>⚡ Load Official Apex Bid Pack (5 PDFs)</span>
          </button>
        </div>
      </div>

      {/* File List & Progress */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              Document Processing Queue ({files.length})
            </h3>
            {isProcessing && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Pipeline Active: {overallProgress}%
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {files.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 truncate">{item.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono font-medium">({(item.size / 1024).toFixed(0)} KB)</span>
                    {item.jobId && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {item.jobId}
                      </span>
                    )}
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.status === 'COMPLETED' ? 'bg-emerald-500' :
                        item.status === 'FAILED' ? 'bg-rose-500' :
                        item.status === 'PROCESSING' ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                    <span>Status: <strong className={item.status === 'COMPLETED' ? 'text-emerald-700' : item.status === 'FAILED' ? 'text-rose-700' : 'text-slate-800'}>{item.status}</strong></span>
                    {item.pageCount && <span className="text-slate-700">• {item.pageCount} Pages Parsed</span>}
                    {item.chunksIndexed && <span className="text-slate-700">• {item.chunksIndexed} Vector Chunks Indexed</span>}
                    {item.error && <span className="text-rose-600 font-bold">• {item.error}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={`/demo_docs/${item.name}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 rounded-lg hover:bg-slate-100 border border-slate-200 transition shadow-2xs"
                    title="View Original Document (PDF)"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>View PDF</span>
                  </a>
                  {item.status === 'COMPLETED' && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Ready</span>
                    </span>
                  )}
                  {item.status === 'PROCESSING' && (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  )}
                  {item.status === 'FAILED' && (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  )}
                  {!isProcessing && (
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {files.filter(f => f.status === 'COMPLETED').length} of {files.length} processed
            </span>
            <div className="flex items-center gap-3">
              {!allDone ? (
                <button
                  onClick={startIngestionPipeline}
                  disabled={isProcessing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Ingesting Documents...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Run AI Extraction & Vector Indexing</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/compliance')}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm"
                >
                  <span>Open Compliance Matrix</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
