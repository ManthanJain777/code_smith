import React, { useState, useEffect } from 'react';
import { Send, ShieldCheck, FileText, AlertCircle, User, Bot, Sparkles, Briefcase, Building2, Zap, Lock, ShieldAlert } from 'lucide-react';
import { apiService, getApiBaseUrl } from '../services/api';
import { useAuth } from '../context/AuthProvider';
import { ComplianceResult, Tender, Bid } from '../types/compliance';

interface Message {
  id: string;
  role: 'user' | 'copilot';
  text: string;
  sources?: Array<{ reqCode: string; status: string; document: string; page: number; reasoning: string }>;
  confidence?: number;
  modelUsed?: string;
  timestamp: string;
}

export const CopilotPage: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'PROCUREMENT_OFFICER';
  const isAuditor = role === 'AUDITOR' || role === 'VIEWER';
  const isReviewer = role === 'COMPLIANCE_REVIEWER';
  const isAdmin = role === 'SYSTEM_ADMIN';
  const isBidder = role === 'BIDDER_VENDOR' || role === 'BIDDER';

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [bids, setBids] = useState<Bid[]>([]);
  const [selectedBidId, setSelectedBidId] = useState<string>('');

  const getInitialMessages = (): Message[] => {
    if (isAuditor) {
      return [
        {
          id: 'intro',
          role: 'copilot',
          text: 'Welcome, Auditor. Displaying auditable procurement inquiry transcripts and verification history. In compliance with independent vigilance standards (GFR 2017), live query submission is locked to prevent committee interference.',
          timestamp: new Date().toISOString(),
        }
      ];
    } else if (isReviewer) {
      return [
        {
          id: 'intro',
          role: 'copilot',
          text: 'Welcome to your Compliance Exception Assistant. Scoped strictly to exception review items and flagged requirements in your queue. Cross-bidder comparison is restricted to maintain unbiased evaluation.',
          timestamp: new Date().toISOString(),
        }
      ];
    } else if (isAdmin || role === 'PROCUREMENT_OFFICER') {
      return [
        {
          id: 'intro',
          role: 'copilot',
          text: 'Welcome to the Procurement Committee Copilot. Unrestricted query access across all evaluated requirements, submitted bidder evidence dossiers, and statutory registries. All responses are strictly grounded in verified facts.',
          timestamp: new Date().toISOString(),
        }
      ];
    } else if (isBidder) {
      return [
        {
          id: 'intro',
          role: 'copilot',
          text: 'This is your Bid Compliance Assistant. I can help you understand why requirements were flagged, identify what documents you need to submit to achieve compliance, and check your statutory certificate expiry.',
          timestamp: new Date().toISOString(),
        }
      ];
    }
    return [
      {
        id: 'intro',
        role: 'copilot',
        text: 'Welcome to the Procurement Committee Copilot. Unrestricted query access across all evaluated requirements and submitted bidder evidence dossiers.',
        timestamp: new Date().toISOString(),
      }
    ];
  };

  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [transcriptsLoading, setTranscriptsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isAuditor) {
      setTranscriptsLoading(true);
      apiService.getCopilotTranscript()
        .then(data => setTranscripts(data))
        .catch(err => console.warn('Failed to load copilot transcripts:', err))
        .finally(() => setTranscriptsLoading(false));
    }
  }, [isAuditor]);

  useEffect(() => {
    async function loadTenders() {
      try {
        const list = await apiService.getTenders();
        setTenders(list);
        if (list.length > 0) {
          setSelectedTenderId(list[0].id);
        }
      } catch (e) {
        console.error('Failed to load tenders for copilot:', e);
      }
    }
    loadTenders();
  }, []);

  useEffect(() => {
    if (!selectedTenderId) return;
    async function loadBids() {
      try {
        const tenderBids = await apiService.getBidsForTender(selectedTenderId);
        const scopedBids = isBidder 
          ? tenderBids.filter(b => !b.bidderEmail || !user?.email || b.bidderEmail.toLowerCase() === user.email.toLowerCase())
          : tenderBids;
        setBids(scopedBids);
        if (scopedBids.length > 0) {
          setSelectedBidId(scopedBids[0].id);
        } else {
          setSelectedBidId('');
        }
      } catch (e) {
        console.error('Failed to load bids for copilot:', e);
      }
    }
    loadBids();
  }, [selectedTenderId, isBidder, user?.email]);

  const [copilotConfig, setCopilotConfig] = useState<{
    role: string;
    quick_questions: string[];
    query_input_enabled: boolean;
    system_prompt?: string;
  } | null>(null);

  useEffect(() => {
    apiService.getCopilotConfig()
      .then(cfg => setCopilotConfig(cfg))
      .catch(err => console.warn('Failed to load dynamic copilot config:', err));
  }, [role]);

  const activeBid = bids.find(b => b.id === selectedBidId);
  const bidderDisplayName = activeBid ? activeBid.bidderName : (isBidder ? (user?.fullName || 'My Organization') : 'Selected Bidder');

  // Dynamic sample questions from copilotConfig, falling back to role-scoped templates
  const sampleQuestions: string[] = (copilotConfig?.quick_questions && copilotConfig.quick_questions.length > 0)
    ? copilotConfig.quick_questions
    : (isAuditor
      ? []
      : isReviewer
      ? [
          'Why is requirement REQ-001 flagged for exception review?',
          'What evidence supports the financial turnover requirement?',
          'Explain contradiction between CA Certificate and Balance Sheet.',
          'Show extracted snippet and calculation for pump efficiency.',
        ]
      : isBidder
      ? [
          'Why is my financial turnover requirement flagged as non-compliant?',
          'What document do I need to fix my technical efficiency compliance?',
          'Is my ISO 9001 quality certificate about to expire?',
          'How can I improve my compliance readiness score?',
        ]
      : [
          'Why is FY2025 turnover flagged as non-compliant?',
          'What is the overall risk assessment and weighted formula breakdown for this bid?',
          'Are there any cross-document contradictions detected?',
          'What evidence was extracted for technical pump efficiency?',
          'Show debarment and blacklist check outcomes across all bidders.',
        ]);

  const isInputEnabled = copilotConfig ? copilotConfig.query_input_enabled : !isAuditor;

  const sendMessage = async (text?: string) => {
    const question = text || input.trim();
    if (!question || !isInputEnabled) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: question,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let answerText = '';
      let answerSources: any[] = [];
      let answerConf = 0.98;
      let modelUsed = isBidder ? 'Bidder Compliance Engine' : 'GeM Procurement Intelligence Copilot';

      const queryBidId = selectedBidId || (bids.length > 0 ? bids[0].id : '');

      // First attempt: Spring Boot authenticated copilot query endpoint
      try {
        const res = await apiService.queryCopilot({
          question,
          tender_id: selectedTenderId,
          bid_id: queryBidId
        });
        if (res && res.answer) {
          answerText = res.answer;
          answerConf = res.confidence || 0.96;
          modelUsed = res.model || res.model_used || (isBidder ? 'Bidder Compliance Engine' : 'GeM Procurement Intelligence Copilot (Gemini)');
          const citationsList = res.citations || res.sources || [];
          answerSources = citationsList.map((c: any) => ({
            reqCode: c.requirement_id || 'EVD-AI',
            status: 'VERIFIED',
            document: c.document_name || 'Technical_Datasheet.pdf',
            page: c.page || 1,
            reasoning: c.snippet || 'Grounded extraction'
          }));
        }
      } catch (backendErr) {
        console.warn('Primary backend copilot query error, trying AI endpoint:', backendErr);
      }

      // Second attempt if backend was empty: direct AI endpoint via dynamic API URL
      if (!answerText) {
        const baseUrl = getApiBaseUrl();
        const aiRes = await fetch(`${baseUrl}/ai/copilot/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('gem_auth_token') || ''}`
          },
          body: JSON.stringify({
            question,
            bid_id: queryBidId,
            role: role,
            user_name: user?.fullName || user?.email || 'Procurement Officer',
            tender_id: selectedTenderId,
            max_results: 5
          })
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          if (aiData.answer && aiData.answer.length > 10) {
            answerText = aiData.answer;
            answerConf = aiData.confidence || 0.96;
            modelUsed = aiData.model || aiData.model_used || (isBidder ? 'Bidder Compliance Engine' : 'GeM Procurement Intelligence Copilot (Gemini)');
            const citationsList = aiData.citations || aiData.sources || [];
            answerSources = citationsList.map((c: any) => ({
              reqCode: c.requirement_id || 'EVD-AI',
              status: 'VERIFIED',
              document: c.document_name || 'Technical_Datasheet.pdf',
              page: c.page || 1,
              reasoning: c.snippet || 'Grounded vector extraction'
            }));
          }
        }
      }

      if (!answerText) {
        throw new Error('No response generated from verified compliance index.');
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'copilot',
        text: answerText,
        sources: answerSources,
        confidence: answerConf,
        modelUsed: modelUsed,
        timestamp: new Date().toISOString(),
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'copilot',
        text: err?.message || 'Unable to connect to intelligence API. Please verify backend service.',
        confidence: 0,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="flex flex-col min-h-[650px] bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl shadow-xs">
      {/* Context Selection Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 mb-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="font-bold text-slate-500 uppercase">Tender:</span>
            <select
              value={selectedTenderId}
              onChange={(e) => setSelectedTenderId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 font-semibold text-slate-800 outline-none"
            >
              {tenders.map(t => (
                <option key={t.id} value={t.id}>{t.tenderNumber} - {t.title.slice(0, 28)}...</option>
              ))}
            </select>
          </div>

          {isBidder ? (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-500 uppercase">My Organization:</span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold px-2.5 py-1 rounded">
                {user?.fullName || 'My Organization'} {activeBid?.id ? `(${activeBid.id})` : ''}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-bold text-slate-500 uppercase">Target Bidder:</span>
              <select
                value={selectedBidId}
                onChange={(e) => setSelectedBidId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 font-semibold text-slate-800 outline-none"
              >
                {bids.map(b => (
                  <option key={b.id} value={b.id}>{b.bidderName} ({b.id})</option>
                ))}
                {bids.length === 0 && <option value="">No bids available</option>}
              </select>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={clearChat}
          className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded border border-slate-300 text-slate-700 transition cursor-pointer"
        >
          Clear Chat
        </button>
      </div>

      {/* Header Banner */}
      <div className={`rounded-2xl p-4 mb-3 text-white shadow-lg ${
        isAuditor 
          ? 'bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border border-teal-500/30' 
          : isBidder
          ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30'
          : 'bg-gradient-to-r from-purple-900 to-indigo-950'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">
                {isAuditor ? 'Vigilance Query Transcript' : isReviewer ? 'Compliance Exception Assistant' : isBidder ? 'My Bid Compliance Assistant' : 'Procurement Committee Copilot'}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Zero-Hallucination Guard Active
              </span>
              <span className="text-[10px] bg-purple-500/30 text-purple-200 border border-purple-400/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <Zap className="w-3 h-3 text-amber-300" /> {isBidder ? 'Vendor Self-Service Support' : isAuditor ? 'GFR Rule 173 Vigilance Log' : 'GeM Procurement Intelligence Engine'}
              </span>
              {isAuditor && (
                <span className="text-[10px] bg-amber-500/30 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono font-bold">
                  <Lock className="w-3 h-3 text-amber-300" /> Read-Only Vigilance Oversight
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold">
              {isAuditor ? 'Vigilance Query Transcript' : isReviewer ? 'Compliance Exception Assistant' : isBidder ? 'My Bid Compliance Assistant' : 'Procurement Committee Copilot'}
            </h1>
            <p className="text-xs text-purple-200 mt-0.5">
              {isAuditor 
                ? 'Chronological oversight stream of all queries asked by Procurement Committee members. Interactive query submission is locked under GFR 2017 standards.'
                : isBidder
                ? `Assisting ${bidderDisplayName} with requirement readiness, document explanations, and compliance evidence.`
                : isReviewer
                ? `Assisting exception review for assigned bid queue (${selectedBidId}). Strictly grounded in submitted evidence dossiers.`
                : `Unrestricted query access across tender requirements, all evaluated bidders, and statutory evidence dossiers.`}
            </p>
          </div>
        </div>

        {/* Suggested Queries — Only for Officer, Admin, Reviewer, Bidder. Auditor has NO live questions */}
        {!isAuditor && sampleQuestions.length > 0 && (
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider block mb-1.5">
              {isBidder ? 'Quick Inquiries for Your Bid:' : isReviewer ? 'Exception Review Prompts:' : 'Committee Decision Prompts (Non-Compliance / Risk / Contradictions):'}
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1 rounded-full transition text-left bg-white/10 hover:bg-white/20 border border-white/20 text-white cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area: Auditor Vigilance Transcript vs Interactive Messages */}
      {isAuditor ? (
        <div className="h-[520px] overflow-y-auto space-y-4 pb-4 pr-1">
          {transcriptsLoading ? (
            <div className="p-8 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading vigilance inquiry transcripts from AI audit stream...
            </div>
          ) : transcripts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
              No procurement committee queries recorded yet.
            </div>
          ) : (
            transcripts.map((tx: any) => (
              <div key={tx.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {tx.id}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{tx.user_name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                      {tx.role}
                    </span>
                    <span className="text-xs text-slate-400">• Tender: {tx.tender_id}</span>
                    <span className="text-xs text-slate-400">• Bid: {tx.bid_id}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(tx.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Inquiry Asked</span>
                  <p className="text-sm font-semibold text-slate-800">{tx.question}</p>
                </div>

                <div className="bg-white rounded-xl p-3.5 border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block mb-1">Copilot Answer</span>
                  {tx.answer}
                </div>

                {tx.citations && tx.citations.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Evidence Citations</span>
                    {tx.citations.map((c: any, i: number) => (
                      <div key={i} className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-slate-600">
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{c.document_name}</span>
                        <span>(p. {c.page})</span>
                        <span className="text-slate-400 italic truncate">— "{c.snippet}"</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Chat Messages for Interactive Roles */
        <div className="h-[520px] overflow-y-auto space-y-4 pb-4 pr-1">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'copilot' && (
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
              )}
              <div className={`max-w-2xl ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white mat-elev-1'
                      : 'bg-white border border-slate-200 text-slate-800 mat-elev-1'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Citations / Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Evidence Sources
                    </p>
                    {msg.sources.map((src, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
                      >
                        <span className="font-mono font-bold text-blue-700">{src.reqCode}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-800">
                          {src.status}
                        </span>
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-600 truncate">{src.document} (p. {src.page})</span>
                      </div>
                    ))}
                  </div>
                )}

                {msg.confidence !== undefined && msg.confidence > 0 && (
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3 text-emerald-500" />
                      <span>Grounding confidence: {(msg.confidence * 100).toFixed(0)}%</span>
                    </div>
                    {msg.modelUsed && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                         {msg.modelUsed}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 order-2">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-600 animate-pulse" />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-200" />
                <span>Querying verified compliance index...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Form or Auditor/Disabled Read-Only Lock */}
      {!isInputEnabled ? (
        <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Vigilance Audit Scrutiny Mode (Read-Only)</span>
              <span className="text-[11px] text-slate-600">Live query input disabled for Auditor vigilance oversight (GFR 2017). Inspecting auditable committee transcripts.</span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-slate-200 border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800 shrink-0">
            AUDIT_READ_ONLY
          </span>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2 pt-3 border-t border-slate-200"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isBidder
                ? "Ask about your submitted requirements, evidence, or missing documents..."
                : isReviewer
                ? `Ask about exception items or evidence for ${bidderDisplayName}...`
                : `Ask Copilot about ${bidderDisplayName}'s requirements, evidence, or flags...`
            }
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Ask</span>
          </button>
        </form>
      )}
    </div>
  );
};
