import { Tender, ComplianceResult, AuditLog, Bid } from '../types/compliance';
import { AUTH_TOKEN_KEY } from '../constants/auth';

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes('placeholder')) {
    return envUrl;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // On local development, connect to local backend port 8080
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080/api/v1';
    }
    return `${window.location.origin}/api/v1`;
  }
  return 'http://localhost:8080/api/v1';
};

export const getAiServiceUrl = (): string => {
  const envAi = import.meta.env.VITE_AI_SERVICE_URL;
  if (envAi && !envAi.includes('placeholder') && !envAi.includes(':8000')) {
    return envAi;
  }
  return getApiBaseUrl();
};

export const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  status: number;
  kind: 'AUTH' | 'FORBIDDEN' | 'VALIDATION' | 'CONFLICT' | 'SERVER' | 'NETWORK';
  details?: any;

  constructor(status: number, message: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    if (status === 401) this.kind = 'AUTH';
    else if (status === 403) this.kind = 'FORBIDDEN';
    else if (status === 400 || status === 422) this.kind = 'VALIDATION';
    else if (status === 409) this.kind = 'CONFLICT';
    else if (status >= 500) this.kind = 'SERVER';
    else this.kind = 'NETWORK';
  }
}

// Robust authenticated fetch with clean session expiry handling
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  const headers = new Headers(options.headers || {});
  if (token && !token.startsWith('demo-jwt-token-')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && !url.includes('/auth/login') && !url.includes('/health')) {
    console.warn(`[fetchWithAuth] 401 received from ${url} — clearing token and redirecting to login`);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login?session=expired';
    }
  }

  return res;
}

// Parse real JSON error bodies from Spring Boot / GlobalExceptionHandler
async function handleResponseJson<T = any>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `API Error ${res.status}: ${res.statusText}`;
    let details: any = null;
    try {
      const errorJson = await res.json();
      details = errorJson;
      if (errorJson.message) {
        errorMsg = errorJson.message;
      } else if (errorJson.error) {
        errorMsg = `${errorJson.error}${errorJson.details ? ': ' + errorJson.details : ''}`;
      }
    } catch {
      // Body is not JSON
    }
    throw new ApiError(res.status, errorMsg, details);
  }
  return await res.json();
}

export const apiService = {
  getTenders: async (): Promise<Tender[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/tenders`);
    return await handleResponseJson<Tender[]>(res);
  },

  getTenderById: async (id: string): Promise<Tender> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/tenders/${id}`);
    return await handleResponseJson<Tender>(res);
  },

  getComplianceResults: async (bidId: string): Promise<ComplianceResult[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/compliance/bid/${bidId}`);
    const data = await handleResponseJson<ComplianceResult[]>(res);
    return (data || []).map((r: any) => ({
      ...r,
      verificationMethod: (r.verificationMethod || 'deterministic').toLowerCase(),
    }));
  },

  getBidsForTender: async (tenderId: string): Promise<Bid[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/bids/tender/${tenderId}`);
    const data = await handleResponseJson<any[]>(res);
    return (data || []).map((b: any) => ({
      ...b,
      gstin: b.gstin || b.bidderGstin || 'N/A',
      pan: b.pan || b.bidderPan || 'N/A',
      submittedAt: b.submittedAt || b.createdAt || new Date().toISOString(),
      blockchainTx: b.blockchainTx || b.blockchainTxHash || null,
    }));
  },

  getMyBids: async (): Promise<Bid[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/bids/my-bids`);
    const data = await handleResponseJson<any[]>(res);
    return (data || []).map((b: any) => ({
      ...b,
      gstin: b.gstin || b.bidderGstin || 'N/A',
      pan: b.pan || b.bidderPan || 'N/A',
      submittedAt: b.submittedAt || b.createdAt || new Date().toISOString(),
      blockchainTx: b.blockchainTx || b.blockchainTxHash || null,
    }));
  },

  submitHumanReview: async (review: any): Promise<ComplianceResult> => {
    const payload = {
      complianceResultId: review.complianceResultId || review.id || review.requirementId,
      reviewerId: review.reviewerId || 'USR-DEMO-REV',
      finalStatus: review.finalStatus || review.newStatus || review.status || 'COMPLIANT',
      reviewerNote: review.reviewerNote || review.reviewerNotes || review.rationale || 'Status confirmed by compliance officer with GFR 2017 justification.'
    };
    const res = await fetchWithAuth(`${API_BASE_URL}/reviews/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await handleResponseJson<ComplianceResult>(res);
    return {
      ...result,
      verificationMethod: (result.verificationMethod || 'human_override').toLowerCase() as any,
    };
  },

  getClarifications: async (): Promise<any[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/reviews/clarifications`);
    return await handleResponseJson<any[]>(res);
  },

  submitClarificationReply: async (id: string, payload: { statement: string; supportingDoc?: string; dscSerial?: string }): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/reviews/clarifications/${encodeURIComponent(id)}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await handleResponseJson(res);
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/audit`);
    return await handleResponseJson<AuditLog[]>(res);
  },

  getBlockchainProof: async (txHash: string): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/audit/proof/${txHash}`);
    return await handleResponseJson(res);
  },

  runCompliancePipeline: async (tenderId: string, bidId?: string): Promise<{ status: string; message: string }> => {
    const query = bidId ? `?bidId=${encodeURIComponent(bidId)}` : '';
    const res = await fetchWithAuth(`${API_BASE_URL}/tenders/${tenderId}/run-compliance${query}`, {
      method: 'POST'
    });
    return await handleResponseJson(res);
  },

  getComplianceScore: async (bidId: string): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/compliance/score/${encodeURIComponent(bidId)}`);
    return await handleResponseJson(res);
  },

  getAiRecommendation: async (bidId: string): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/compliance/recommendation/${encodeURIComponent(bidId)}`);
    return await handleResponseJson(res);
  },

  verifyAllPortals: async (sellerId: string): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/sellers/${encodeURIComponent(sellerId)}/verify-all`, {
      method: 'POST'
    });
    return await handleResponseJson(res);
  },

  verifySinglePortal: async (sellerId: string, portalKey: string): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/sellers/${encodeURIComponent(sellerId)}/verify/${encodeURIComponent(portalKey)}`, {
      method: 'POST'
    });
    return await handleResponseJson(res);
  },

  getSellers: async (): Promise<any[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/sellers`);
    return await handleResponseJson<any[]>(res);
  },

  getSellerById: async (id: string): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/sellers/${encodeURIComponent(id)}`);
    return await handleResponseJson(res);
  },

  getAuditOverrides: async (): Promise<any[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/audit/overrides`);
    return await handleResponseJson<any[]>(res);
  },

  getDebarmentHistory: async (): Promise<any[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/audit/debarment-history`);
    return await handleResponseJson<any[]>(res);
  },

  getCollusionFlags: async (tenderId?: string): Promise<any[]> => {
    const url = tenderId ? `${API_BASE_URL}/compliance/collusion-flags?tenderId=${tenderId}` : `${API_BASE_URL}/compliance/collusion-flags`;
    const res = await fetchWithAuth(url);
    return await handleResponseJson<any[]>(res);
  },

  resolveContradiction: async (payload: {
    contradictionId: string;
    chosenPrecedentDoc: string;
    resolutionRationale: string;
  }): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/compliance/contradictions/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await handleResponseJson(res);
  },

  getCopilotTranscript: async (): Promise<any[]> => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/copilot/transcript`);
      if (res.ok) {
        return await handleResponseJson<any[]>(res);
      }
    } catch {
      // Return empty transcript
    }
    return [];
  },

  queryGeminiCopilot: async (payload: {
    question: string;
    tender_id?: string;
    bid_id?: string;
    role?: string;
    user_name?: string;
    compliance_results?: any[];
  }): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/copilot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await handleResponseJson(res);
  },

  extractDocumentOcrWithGemini: async (payload: {
    portalKey: string;
    documentType: string;
    fileContent?: string;
    text?: string;
  }): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/ai/ocr/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await handleResponseJson(res);
  },

  getBackendHealth: async (): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (!res.ok) throw new Error(`Health Check Error ${res.status}`);
      return await res.json();
    } catch {
      return { status: 'DOWN', service: 'gem-ai-compliance-backend', mode: 'offline-unreachable' };
    }
  },

  getNotifications: async (): Promise<any[]> => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/notifications`);
      return await handleResponseJson<any[]>(res);
    } catch {
      return [];
    }
  },

  markNotificationsRead: async (): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/notifications/read-all`, {
      method: 'POST'
    });
    return await handleResponseJson(res);
  },

  getMyPermissions: async (): Promise<Record<string, string>> => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/permissions/me`);
      return await handleResponseJson<Record<string, string>>(res);
    } catch {
      return {};
    }
  },

  getCopilotConfig: async (): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/copilot/config`);
    return await handleResponseJson(res);
  },

  queryCopilot: async (payload: {
    question: string;
    tender_id?: string;
    bid_id?: string;
    role?: string;
    user_name?: string;
    compliance_results?: any[];
  }): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/copilot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await handleResponseJson(res);
  },

  getMyCalibration: async (): Promise<any[]> => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/reviews/calibration/me`);
      return await handleResponseJson<any[]>(res);
    } catch {
      return [];
    }
  },

  getTenderResults: async (tenderId: string): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/tenders/${tenderId}/results`);
    return await handleResponseJson(res);
  },

  publishTenderResults: async (tenderId: string): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/tenders/${tenderId}/publish-results`, {
      method: 'POST'
    });
    return await handleResponseJson(res);
  },

  getChainStats: async (): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/audit/chain-stats`);
    return await handleResponseJson(res);
  },

  getChainExplorer: async (page = 0, size = 20, eventType = ''): Promise<any> => {
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    if (eventType) query.append('eventType', eventType);
    const res = await fetchWithAuth(`${API_BASE_URL}/audit/chain-explorer?${query.toString()}`);
    return await handleResponseJson(res);
  },
};

export const complianceApi = apiService;
