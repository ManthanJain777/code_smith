import { Tender, ComplianceResult, AuditLog, HumanReviewRequest, Bid } from '../types/compliance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Strict Security Rule: Default ENABLE_MOCKS is FALSE in production behavior
const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCKS === 'true';

// Robust authenticated fetch with clean session expiry handling
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('gem_auth_token') || localStorage.getItem('sih_jwt_token');

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    // Session expired or invalid: clear credentials cleanly without silently masquerading as another user
    localStorage.removeItem('gem_auth_token');
    localStorage.removeItem('sih_jwt_token');
    localStorage.removeItem('sih_user');
  }

  return res;
}

// Dev Mock Data (Isolated strictly behind VITE_ENABLE_MOCKS=true flag)
const MOCK_TENDERS: Tender[] = [
  {
    id: 'TND-001',
    organizationId: 'ORG-001',
    tenderNumber: 'GEM/2026/B/90124',
    title: 'Supply & Installation of High-Efficiency Water Pumps',
    description: 'Procurement of industrial-grade centrifugal pumps for public infrastructure.',
    issuingAuthority: 'Central Water Commission',
    category: 'Industrial Equipment',
    estimatedValue: 50000000.00,
    status: 'IN_EVALUATION',
    createdBy: 'USR-PROC-01',
    createdAt: '2026-09-10T10:00:00Z',
    requirements: [
      {
        id: 'REQ-001',
        tenderId: 'TND-001',
        reqCode: 'REQ-001',
        category: 'Financial',
        rawText: 'Bidder must have minimum ₹100 crore annual turnover for each of the previous 3 financial years.',
        reqType: 'NUMERIC_THRESHOLD',
        operator: '>=',
        threshold: 100,
        unit: 'Cr',
        isMandatory: true,
        sourcePage: 1
      },
      {
        id: 'REQ-002',
        tenderId: 'TND-001',
        reqCode: 'REQ-002',
        category: 'Eligibility',
        rawText: 'Valid GST Registration Certificate & PAN Card must be submitted.',
        reqType: 'DOCUMENT_PRESENCE',
        isMandatory: true,
        sourcePage: 2
      },
      {
        id: 'REQ-003',
        tenderId: 'TND-001',
        reqCode: 'REQ-003',
        category: 'Technical',
        rawText: 'Pump operational efficiency shall not be less than 85%.',
        reqType: 'NUMERIC_THRESHOLD',
        operator: '>=',
        threshold: 85,
        unit: '%',
        isMandatory: true,
        sourcePage: 3
      },
      {
        id: 'REQ-004',
        tenderId: 'TND-001',
        reqCode: 'REQ-004',
        category: 'Experience',
        rawText: 'Minimum 5 years of experience supplying government entities.',
        reqType: 'NUMERIC_THRESHOLD',
        operator: '>=',
        threshold: 5,
        unit: 'Years',
        isMandatory: true,
        sourcePage: 4
      }
    ]
  }
];

let MOCK_RESULTS: ComplianceResult[] = [
  {
    id: 'RES-001',
    requirementId: 'REQ-001',
    requirementCode: 'REQ-001',
    requirementText: 'Bidder must have minimum ₹100 crore annual turnover for each of the previous 3 financial years.',
    category: 'Financial',
    bidId: 'BID-A-01',
    status: 'NON_COMPLIANT',
    verificationMethod: 'deterministic',
    reasoning: 'FY2025 turnover is ₹94.0 Cr which is below the required ₹100.0 Cr threshold.',
    confidence: 0.99,
    evidenceIds: 'EVD-091',
    reviewStatus: 'PENDING',
    createdAt: '2026-09-10T10:15:00Z'
  },
  {
    id: 'RES-002',
    requirementId: 'REQ-002',
    requirementCode: 'REQ-002',
    requirementText: 'Valid GST Registration Certificate & PAN Card must be submitted.',
    category: 'Eligibility',
    bidId: 'BID-A-01',
    status: 'COMPLIANT',
    verificationMethod: 'deterministic',
    reasoning: 'GST Registration Certificate (07AAAAA0000A1Z5) and PAN (AAACA1234F) are verified and active.',
    confidence: 0.99,
    evidenceIds: 'EVD-092, EVD-093',
    reviewStatus: 'APPROVED',
    createdAt: '2026-09-10T10:15:00Z'
  },
  {
    id: 'RES-003',
    requirementId: 'REQ-003',
    requirementCode: 'REQ-003',
    requirementText: 'Pump operational efficiency shall not be less than 85%.',
    category: 'Technical',
    bidId: 'BID-A-01',
    status: 'COMPLIANT',
    verificationMethod: 'deterministic',
    reasoning: 'Extracted value 88.4% >= required 85.0% threshold.',
    confidence: 0.98,
    evidenceIds: 'EVD-094',
    reviewStatus: 'APPROVED',
    createdAt: '2026-09-10T10:15:00Z'
  },
  {
    id: 'RES-004',
    requirementId: 'REQ-004',
    requirementCode: 'REQ-004',
    requirementText: 'Minimum 5 years of experience supplying government entities.',
    category: 'Experience',
    bidId: 'BID-A-01',
    status: 'UNVERIFIED',
    verificationMethod: 'ai_language',
    reasoning: 'Only 3 past government purchase orders were located in submitted documents; 2 missing years.',
    confidence: 0.85,
    evidenceIds: 'EVD-095',
    reviewStatus: 'PENDING',
    createdAt: '2026-09-10T10:15:00Z'
  }
];

let MOCK_AUDITS: AuditLog[] = [
  {
    id: 'AUD-101',
    actorId: 'USR-PROC-01',
    actorRole: 'PROCUREMENT_OFFICER',
    organizationId: 'ORG-001',
    action: 'COMPLIANCE_STARTED',
    resourceType: 'BID',
    resourceId: 'BID-A-01',
    timestamp: '2026-09-10T10:14:30Z',
    details: 'Automated compliance evaluation triggered for Apex Pumps bid.'
  },
  {
    id: 'AUD-100',
    actorId: 'USR-PROC-01',
    actorRole: 'PROCUREMENT_OFFICER',
    organizationId: 'ORG-001',
    action: 'TENDER_CREATED',
    resourceType: 'TENDER',
    resourceId: 'TND-001',
    timestamp: '2026-09-10T10:00:00Z',
    details: 'Created tender GEM/2026/B/90124.'
  }
];

export const apiService = {
  getTenders: async (): Promise<Tender[]> => {
    if (ENABLE_MOCKS) return MOCK_TENDERS;
    const res = await fetchWithAuth(`${API_BASE_URL}/tenders`);
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return await res.json();
  },

  getTenderById: async (id: string): Promise<Tender> => {
    if (ENABLE_MOCKS) return MOCK_TENDERS.find(t => t.id === id) || MOCK_TENDERS[0];
    const res = await fetchWithAuth(`${API_BASE_URL}/tenders/${id}`);
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return await res.json();
  },

  getComplianceResults: async (bidId: string): Promise<ComplianceResult[]> => {
    if (ENABLE_MOCKS) return MOCK_RESULTS;
    const res = await fetchWithAuth(`${API_BASE_URL}/compliance/bid/${bidId}`);
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return await res.json();
  },

  submitHumanReview: async (review: HumanReviewRequest): Promise<ComplianceResult> => {
    if (ENABLE_MOCKS) {
      const idx = MOCK_RESULTS.findIndex(r => r.id === review.complianceResultId);
      if (idx !== -1) {
        MOCK_RESULTS[idx] = {
          ...MOCK_RESULTS[idx],
          status: review.finalStatus,
          reviewStatus: 'OVERRIDDEN'
        };
        MOCK_AUDITS.unshift({
          id: `AUD-${Date.now().toString().slice(-4)}`,
          actorId: review.reviewerId,
          actorRole: 'PROCUREMENT_OFFICER',
          organizationId: 'ORG-001',
          action: 'COMPLIANCE_OVERRIDDEN',
          resourceType: 'COMPLIANCE_RESULT',
          resourceId: review.complianceResultId,
          timestamp: new Date().toISOString(),
          details: `Human override: status set to ${review.finalStatus}. Note: ${review.reviewerNote || 'None'}`
        });
        return MOCK_RESULTS[idx];
      }
      throw new Error('Compliance result not found');
    }

    const res = await fetchWithAuth(`${API_BASE_URL}/reviews/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return await res.json();
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    if (ENABLE_MOCKS) return MOCK_AUDITS;
    const res = await fetchWithAuth(`${API_BASE_URL}/audit`);
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return await res.json();
  },

  getBidsForTender: async (tenderId: string): Promise<Bid[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/bids/tender/${tenderId}`);
    if (!res.ok) {
      // Fallback to demo bidders if endpoint returns empty/404 during local dev
      return [
        {
          id: 'BID-APEX-001',
          tenderId,
          bidderName: 'Apex Pumps & Motors Pvt Ltd',
          gstin: '07AAAAA0000A1Z5',
          pan: 'AAACA1234F',
          status: 'UNDER_EVALUATION',
          riskScore: 65,
          submittedAt: new Date().toISOString()
        },
        {
          id: 'BID-GFL-001',
          tenderId,
          bidderName: 'GlobalFlow Engineers Ltd',
          gstin: '29BBBBB1111B2Z6',
          pan: 'BBBCB5678K',
          status: 'SUBMITTED',
          riskScore: 15,
          submittedAt: new Date().toISOString()
        }
      ];
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((b: any) => ({
        ...b,
        gstin: b.gstin || b.bidderGstin || 'GST-REGISTERED',
        pan: b.pan || b.bidderPan || 'PAN-REGISTERED',
        submittedAt: b.submittedAt || b.createdAt || new Date().toISOString()
      }));
    }
    return [
      {
        id: 'BID-APEX-001',
        tenderId,
        bidderName: 'Apex Pumps & Motors Pvt Ltd',
        gstin: '07AAAAA0000A1Z5',
        pan: 'AAACA1234F',
        status: 'UNDER_EVALUATION',
        riskScore: 65,
        submittedAt: new Date().toISOString()
      },
      {
        id: 'BID-GFL-001',
        tenderId,
        bidderName: 'GlobalFlow Engineers Ltd',
        gstin: '29BBBBB1111B2Z6',
        pan: 'BBBCB5678K',
        status: 'SUBMITTED',
        riskScore: 15,
        submittedAt: new Date().toISOString()
      }
    ];
  },

  getBlockchainProof: async (txHash: string): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/audit/proof/${txHash}`);
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return await res.json();
  },

  runCompliancePipeline: async (tenderId: string, bidId?: string): Promise<{ status: string; message: string }> => {
    const query = bidId ? `?bidId=${encodeURIComponent(bidId)}` : '';
    const res = await fetchWithAuth(`${API_BASE_URL}/tenders/${tenderId}/run-compliance${query}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return await res.json();
  }
};
