import { Tender, ComplianceResult, AuditLog, HumanReviewRequest, Bid } from '../types/compliance';
import { AUTH_TOKEN_KEY } from '../constants/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Robust authenticated fetch with clean session expiry handling
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  const headers = new Headers(options.headers || {});
  if (token) {
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
    try {
      const errorJson = await res.json();
      if (errorJson.message) {
        errorMsg = errorJson.message;
      } else if (errorJson.error) {
        errorMsg = `${errorJson.error}${errorJson.details ? ': ' + errorJson.details : ''}`;
      }
    } catch {
      // Body is not JSON
    }
    throw new Error(errorMsg);
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
    return await handleResponseJson<ComplianceResult[]>(res);
  },

  submitHumanReview: async (review: HumanReviewRequest): Promise<ComplianceResult> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/reviews/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    return await handleResponseJson<ComplianceResult>(res);
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/audit`);
    return await handleResponseJson<AuditLog[]>(res);
  },

  getBidsForTender: async (tenderId: string): Promise<Bid[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/bids/tender/${tenderId}`);
    const data = await handleResponseJson<any[]>(res);
    return (data || []).map((b: any) => ({
      ...b,
      gstin: b.gstin || b.bidderGstin || 'N/A',
      pan: b.pan || b.bidderPan || 'N/A',
      submittedAt: b.submittedAt || b.createdAt || new Date().toISOString()
    }));
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

  getCollusionFlags: async (): Promise<any[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/audit/collusion-flags`);
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
    const aiUrl = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';
    const res = await fetch(`${aiUrl}/api/v1/ai/copilot/transcript`);
    if (!res.ok) throw new Error(`AI Error ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return data.transcripts || [];
  },

  getBackendHealth: async (): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`Health Check Error ${res.status}`);
    return await res.json();
  },

  getNotifications: async (): Promise<any[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/notifications`);
    return await handleResponseJson<any[]>(res);
  },

  markNotificationsRead: async (): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/notifications/read-all`, {
      method: 'POST'
    });
    return await handleResponseJson(res);
  },

  getMyPermissions: async (): Promise<Record<string, string>> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/permissions/me`);
    return await handleResponseJson<Record<string, string>>(res);
  },

  getCopilotConfig: async (): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/copilot/config`);
    return await handleResponseJson(res);
  },

  queryCopilot: async (payload: { question: string; tender_id?: string; bid_id?: string }): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/copilot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await handleResponseJson(res);
  },

  getMyCalibration: async (): Promise<any[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/reviews/calibration/me`);
    return await handleResponseJson<any[]>(res);
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
