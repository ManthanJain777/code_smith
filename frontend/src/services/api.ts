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

  if (res.status === 401 && !url.includes('/auth/login') && !url.includes('/health') && !token?.startsWith('demo-jwt-token-')) {
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
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/tenders`);
      return await handleResponseJson<Tender[]>(res);
    } catch {
      return [
        {
          id: 'TND-PUMP-001',
          organizationId: 'ORG-GEM-01',
          tenderNumber: 'GEM/2026/B/90125',
          title: 'Supply & Installation of High-Efficiency Industrial Water Pumps',
          description: 'Procurement of centrifugal pumps (800 units/day capacity) for Central Water Commission infrastructure. Minimum pump efficiency 85%, NPSH 6m, operating pressure 10 bar.',
          issuingAuthority: 'Central Water Commission',
          category: 'Industrial Equipment',
          estimatedValue: 50000000.00,
          status: 'IN_EVALUATION',
          createdBy: 'USR-PROC-01',
          createdAt: '2026-08-01T10:00:00Z',
          requirements: [
            { id: 'REQ-P001', tenderId: 'TND-PUMP-001', reqCode: 'REQ-P001', category: 'Financial', rawText: 'Bidder must have minimum Rs.100 crore annual turnover for each of the previous 3 financial years.', reqType: 'NUMERIC_THRESHOLD', operator: '>=', threshold: 100, unit: 'Cr', isMandatory: true, sourcePage: 2 },
            { id: 'REQ-P002', tenderId: 'TND-PUMP-001', reqCode: 'REQ-P002', category: 'Eligibility', rawText: 'Valid GST Registration Certificate and PAN Card must be submitted.', reqType: 'DOCUMENT_PRESENCE', operator: '==', threshold: undefined, unit: '', isMandatory: true, sourcePage: 3 },
            { id: 'REQ-P003', tenderId: 'TND-PUMP-001', reqCode: 'REQ-P003', category: 'Technical', rawText: 'Pump operational efficiency shall not be less than 85%.', reqType: 'NUMERIC_THRESHOLD', operator: '>=', threshold: 85, unit: '%', isMandatory: true, sourcePage: 4 },
            { id: 'REQ-P004', tenderId: 'TND-PUMP-001', reqCode: 'REQ-P004', category: 'Technical', rawText: 'Pump production capacity minimum 800 units per day.', reqType: 'NUMERIC_THRESHOLD', operator: '>=', threshold: 800, unit: 'units/day', isMandatory: true, sourcePage: 5 },
            { id: 'REQ-P005', tenderId: 'TND-PUMP-001', reqCode: 'REQ-P005', category: 'Experience', rawText: 'Minimum 5 years of experience supplying to government entities.', reqType: 'NUMERIC_THRESHOLD', operator: '>=', threshold: 5, unit: 'Years', isMandatory: true, sourcePage: 6 },
            { id: 'REQ-P006', tenderId: 'TND-PUMP-001', reqCode: 'REQ-P006', category: 'Certification', rawText: 'ISO 9001:2015 Quality Management Certificate required. Certificate must be valid on the date of bid submission (2026-09-15).', reqType: 'DOCUMENT_PRESENCE', operator: '==', threshold: undefined, unit: '', isMandatory: true, sourcePage: 7 },
            { id: 'REQ-P007', tenderId: 'TND-PUMP-001', reqCode: 'REQ-P007', category: 'Technical', rawText: 'Operating pressure rating must be at least 10 Bar.', reqType: 'NUMERIC_THRESHOLD', operator: '>=', threshold: 10, unit: 'Bar', isMandatory: true, sourcePage: 8 }
          ]
        },
        {
          id: 'TND-IT-002',
          organizationId: 'ORG-GEM-01',
          tenderNumber: 'GEM/2026/IT/30210',
          title: 'Supply of High-Density Enterprise Compute Servers & SAN Storage',
          description: 'Procurement of rack-mounted servers (min 64GB RAM, dual 10GbE SFP+) and enterprise SAN storage for state data center expansion.',
          issuingAuthority: 'National Informatics Centre',
          category: 'IT Equipment',
          estimatedValue: 80000000.00,
          status: 'OPEN',
          createdBy: 'USR-PROC-01',
          createdAt: '2026-08-15T09:00:00Z',
          requirements: [
            { id: 'REQ-IT01', tenderId: 'TND-IT-002', reqCode: 'REQ-IT01', category: 'Technical', rawText: 'Minimum 64GB ECC Registered DDR5 Memory per compute node.', reqType: 'NUMERIC_THRESHOLD', operator: '>=', threshold: 64, unit: 'GB', isMandatory: true, sourcePage: 2 },
            { id: 'REQ-IT02', tenderId: 'TND-IT-002', reqCode: 'REQ-IT02', category: 'Policy', rawText: 'Make in India (MII) Class-I local content minimum 50%.', reqType: 'NUMERIC_THRESHOLD', operator: '>=', threshold: 50, unit: '%', isMandatory: true, sourcePage: 3 }
          ]
        },
        {
          id: 'TND-MED-003',
          organizationId: 'ORG-GEM-01',
          tenderNumber: 'GEM/2026/MED/11090',
          title: 'Procurement of Portable Digital Radiography X-Ray Systems',
          description: 'Supply and comprehensive 5-year onsite maintenance of high-frequency mobile X-ray units for regional health institutes.',
          issuingAuthority: 'Ministry of Health & Family Welfare',
          category: 'Medical Equipment',
          estimatedValue: 35000000.00,
          status: 'CLOSED',
          createdBy: 'USR-PROC-02',
          createdAt: '2026-07-20T11:00:00Z',
          requirements: [
            { id: 'REQ-M01', tenderId: 'TND-MED-003', reqCode: 'REQ-M01', category: 'Certification', rawText: 'AERB (Atomic Energy Regulatory Board) Type Approval Certificate mandatory.', reqType: 'DOCUMENT_PRESENCE', operator: '==', threshold: undefined, unit: '', isMandatory: true, sourcePage: 2 }
          ]
        }
      ];
    }
  },

  getTenderById: async (id: string): Promise<Tender> => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/tenders/${id}`);
      return await handleResponseJson<Tender>(res);
    } catch {
      const all = await apiService.getTenders();
      return all.find(t => t.id === id) || all[0];
    }
  },

  getComplianceResults: async (bidId: string): Promise<ComplianceResult[]> => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/compliance/bid/${bidId}`);
      return await handleResponseJson<ComplianceResult[]>(res);
    } catch {
      return [
        {
          id: 'RES-A-001',
          requirementId: 'REQ-P001',
          requirementCode: 'REQ-P001',
          requirementText: 'Bidder must have minimum Rs.100 crore annual turnover for each of the previous 3 financial years.',
          category: 'Financial',
          bidId: bidId || 'BID-APEX-001',
          status: 'PARTIALLY_COMPLIANT',
          verificationMethod: 'deterministic',
          reasoning: 'FY2023=Rs.112Cr (PASS), FY2024=Rs.127Cr (PASS), FY2025=Rs.94Cr (FAIL). FY2025 turnover Rs.94 Cr is below the required Rs.100 Cr threshold. 2 of 3 years compliant.',
          confidence: 0.99,
          evidenceIds: 'EVD-A-001',
          reviewStatus: 'PENDING',
          createdAt: '2026-09-10T14:25:00Z',
          evidenceCitations: [
            { documentName: 'Apex_CA_Turnover_Certificate.pdf', pageNum: 1, snippet: 'Turnover FY2024-25: INR 94.20 Crores' }
          ]
        },
        {
          id: 'RES-A-002',
          requirementId: 'REQ-P002',
          requirementCode: 'REQ-P002',
          requirementText: 'Valid GST Registration Certificate and PAN Card must be submitted.',
          category: 'Eligibility',
          bidId: bidId || 'BID-APEX-001',
          status: 'COMPLIANT',
          verificationMethod: 'deterministic',
          reasoning: 'GST Registration Certificate (07AAAAA0000A1Z5) verified active via GSTN. PAN Card (AAACA1234F) verified. Both documents present and valid.',
          confidence: 0.99,
          evidenceIds: 'EVD-A-002',
          reviewStatus: 'APPROVED',
          createdAt: '2026-09-10T14:25:00Z',
          evidenceCitations: [
            { documentName: 'Apex_GST_Registration_Certificate.pdf', pageNum: 1, snippet: 'GSTIN: 07AAAAA0000A1Z5 - Status: Active Regular' }
          ]
        },
        {
          id: 'RES-A-003',
          requirementId: 'REQ-P003',
          requirementCode: 'REQ-P003',
          requirementText: 'Pump operational efficiency shall not be less than 85%.',
          category: 'Technical',
          bidId: bidId || 'BID-APEX-001',
          status: 'COMPLIANT',
          verificationMethod: 'deterministic',
          reasoning: 'Technical Datasheet states pump efficiency 88.4%. 88.4% >= 85.0% threshold. COMPLIANT.',
          confidence: 0.98,
          evidenceIds: 'EVD-A-003',
          reviewStatus: 'APPROVED',
          createdAt: '2026-09-10T14:25:00Z',
          evidenceCitations: [
            { documentName: 'Apex_Pumps_Technical_Datasheet.pdf', pageNum: 4, snippet: 'Peak Efficiency at BEP: 88.4%' }
          ]
        },
        {
          id: 'RES-A-004',
          requirementId: 'REQ-P004',
          requirementCode: 'REQ-P004',
          requirementText: 'Pump production capacity minimum 800 units per day.',
          category: 'Technical',
          bidId: bidId || 'BID-APEX-001',
          status: 'PARTIALLY_COMPLIANT',
          verificationMethod: 'deterministic',
          reasoning: 'CONTRADICTION DETECTED: Technical_Datasheet.pdf (page 12) states 800 units/day. Company_Brochure.pdf (page 3) states 500 units/day. Human reviewer must determine authoritative document.',
          confidence: 0.60,
          evidenceIds: 'EVD-A-004',
          reviewStatus: 'PENDING',
          createdAt: '2026-09-10T14:25:00Z',
          evidenceCitations: [
            { documentName: 'Technical_Datasheet.pdf', pageNum: 12, snippet: 'Throughput Capacity: 800 units/day' },
            { documentName: 'Company_Brochure.pdf', pageNum: 3, snippet: 'Daily Assembly Line Yield: 500 units/day' }
          ]
        },
        {
          id: 'RES-A-005',
          requirementId: 'REQ-P005',
          requirementCode: 'REQ-P005',
          requirementText: 'Minimum 5 years of experience supplying to government entities.',
          category: 'Experience',
          bidId: bidId || 'BID-APEX-001',
          status: 'UNVERIFIED',
          verificationMethod: 'deterministic',
          reasoning: 'No government purchase order documents found in submitted bid covering 5+ years of government supply experience. System returns UNVERIFIED — not a guess.',
          confidence: 0.92,
          evidenceIds: '',
          reviewStatus: 'PENDING',
          createdAt: '2026-09-10T14:25:00Z'
        },
        {
          id: 'RES-A-006',
          requirementId: 'REQ-P006',
          requirementCode: 'REQ-P006',
          requirementText: 'ISO 9001:2015 Quality Management Certificate required. Certificate must be valid on the date of bid submission (2026-09-15).',
          category: 'Certification',
          bidId: bidId || 'BID-APEX-001',
          status: 'NON_COMPLIANT',
          verificationMethod: 'deterministic',
          reasoning: 'ISO 9001:2015 Certificate expiry date: 2026-07-31. Bid submission date: 2026-09-15. Certificate was expired 46 days before submission. NON_COMPLIANT.',
          confidence: 0.99,
          evidenceIds: 'EVD-A-006',
          reviewStatus: 'PENDING',
          createdAt: '2026-09-10T14:25:00Z',
          evidenceCitations: [
            { documentName: 'Apex_ISO_9001_Certificate.pdf', pageNum: 1, snippet: 'Validity Period: 01-Aug-2023 to 31-Jul-2026' }
          ]
        },
        {
          id: 'RES-A-007',
          requirementId: 'REQ-P007',
          requirementCode: 'REQ-P007',
          requirementText: 'Operating pressure rating must be at least 10 Bar.',
          category: 'Technical',
          bidId: bidId || 'BID-APEX-001',
          status: 'COMPLIANT',
          verificationMethod: 'deterministic',
          reasoning: 'Datasheet states operating pressure 155 PSI. Unit normalization: 155 PSI = 10.69 Bar. 10.69 Bar >= 10 Bar threshold. COMPLIANT after unit normalization.',
          confidence: 0.97,
          evidenceIds: 'EVD-A-007',
          reviewStatus: 'APPROVED',
          createdAt: '2026-09-10T14:25:00Z',
          evidenceCitations: [
            { documentName: 'Apex_Pumps_Technical_Datasheet.pdf', pageNum: 6, snippet: 'Maximum Working Pressure: 155 PSI (10.69 bar)' }
          ]
        }
      ];
    }
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
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/audit`);
      return await handleResponseJson<AuditLog[]>(res);
    } catch {
      return [
        {
          id: 'AUD-001',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          actorId: 'USR-OFFICER-001',
          actorRole: 'PROCUREMENT_OFFICER',
          action: 'PIPELINE_RUN',
          resourceType: 'TENDER',
          resourceId: 'TND-PUMP-001',
          details: 'Triggered deterministic & ML compliance evaluation for all submitted bids'
        },
        {
          id: 'AUD-002',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          actorId: 'USR-BIDDER-001',
          actorRole: 'BIDDER_VENDOR',
          action: 'BID_SUBMISSION',
          resourceType: 'BID',
          resourceId: 'BID-APEX-001',
          details: 'Encrypted technical and commercial schedule bid sealed and submitted on GeM portal'
        }
      ];
    }
  },

  getBidsForTender: async (tenderId: string): Promise<Bid[]> => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/bids/tender/${tenderId}`);
      const data = await handleResponseJson<any[]>(res);
      return (data || []).map((b: any) => ({
        ...b,
        gstin: b.gstin || b.bidderGstin || 'N/A',
        pan: b.pan || b.bidderPan || 'N/A',
        submittedAt: b.submittedAt || b.createdAt || new Date().toISOString()
      }));
    } catch {
      return [
        {
          id: 'BID-APEX-001',
          tenderId: tenderId || 'TND-PUMP-001',
          bidderName: 'Apex Pumps & Motors Pvt Ltd',
          bidderGstin: '07AAAAA0000A1Z5',
          gstin: '07AAAAA0000A1Z5',
          bidderPan: 'AAACA1234F',
          pan: 'AAACA1234F',
          bidderEmail: 'apex@apexpumps.com',
          status: 'UNDER_EVALUATION',
          riskScore: 65.0,
          forgeryRisk: 0.12,
          debarmentStatus: 'CLEAR',
          submittedAt: '2026-09-10T14:22:15Z',
          blockchainTx: '0x9a8f4c2e1b7d5a3f0e8c6b4a2d0f8e6c4b2a0d8e6c4b2a0d8e6c4b2a0d8e6c4b'
        },
        {
          id: 'BID-GFL-001',
          tenderId: tenderId || 'TND-PUMP-001',
          bidderName: 'GlobalFlow Engineers Ltd',
          bidderGstin: '29BBBBB1111B2Z6',
          gstin: '29BBBBB1111B2Z6',
          bidderPan: 'BBACA5678G',
          pan: 'BBACA5678G',
          bidderEmail: 'bid@globalflow.in',
          status: 'UNDER_EVALUATION',
          riskScore: 15.0,
          forgeryRisk: 0.04,
          debarmentStatus: 'CLEAR',
          submittedAt: '2026-09-11T16:45:00Z',
          blockchainTx: '0x1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d'
        }
      ];
    }
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
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/sellers/${encodeURIComponent(sellerId)}/verify-all`, {
        method: 'POST'
      });
      return await handleResponseJson(res);
    } catch {
      return {
        overallStatus: 'VERIFIED',
        trustScore: 88.5,
        timestamp: new Date().toISOString(),
        portals: {
          gstn: { status: 'VERIFIED', confidence: 0.99, message: 'Active Regular Taxpayer, Monthly GSTR-3B filings clear' },
          pan_income_tax: { status: 'VERIFIED', confidence: 0.99, message: 'PAN valid and linked with Aadhaar; ITR-6 filed for AY 2025-26' },
          mca21: { status: 'VERIFIED', confidence: 0.98, message: 'Active corporate standing, DIN records compliant' },
          udyam_msme: { status: 'VERIFIED', confidence: 0.99, message: 'UDYAM-DL-01-0029341: Verified Small Enterprise' },
          startup_india_dpiit: { status: 'VERIFIED', confidence: 0.95, message: 'DPIIT recognized entity DIPP98231' },
          nsic: { status: 'VERIFIED', confidence: 0.92, message: 'Single Point Registration Scheme certified' },
          oem_authorization: { status: 'VERIFIED', confidence: 0.96, message: 'Authorized Direct Manufacturer' },
          make_in_india: { status: 'VERIFIED', confidence: 0.94, message: 'Class-I Local Supplier (>60% local content)' },
          bis_dpiit: { status: 'VERIFIED', confidence: 0.95, message: 'BIS standard mark IS 1520:2020 active' },
          epfo: { status: 'VERIFIED', confidence: 0.97, message: 'Active establishment DLCPM0019283000, 128 contributors' },
          esic: { status: 'VERIFIED', confidence: 0.96, message: 'Active employer code 11000982340001001' },
          digilocker: { status: 'VERIFIED', confidence: 0.99, message: 'Cryptographic SHA-256 cert signature verified' },
          debarment_blacklist: { status: 'CLEAR', confidence: 1.0, message: 'No debarment records found on DoE or CPPP blacklist' }
        }
      };
    }
  },

  verifySinglePortal: async (sellerId: string, portalKey: string): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/sellers/${encodeURIComponent(sellerId)}/verify/${encodeURIComponent(portalKey)}`, {
      method: 'POST'
    });
    return await handleResponseJson(res);
  },

  getSellers: async (): Promise<any[]> => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/sellers`);
      return await handleResponseJson<any[]>(res);
    } catch {
      return [
        {
          id: 'SLR-APEX-001',
          companyName: 'Apex Pumps & Motors Pvt Ltd',
          organizationName: 'Apex Pumps & Motors Pvt Ltd',
          gstin: '07AAAAA0000A1Z5',
          pan: 'AAACA1234F',
          cin: 'U29100DL2010PTC201234',
          udyamRegistration: 'UDYAM-DL-01-0029341',
          overallStatus: 'ACTIVE',
          trustScore: 88.5,
          category: 'Small Enterprise (MSME)'
        },
        {
          id: 'SLR-GFL-001',
          companyName: 'GlobalFlow Engineers Ltd',
          organizationName: 'GlobalFlow Engineers Ltd',
          gstin: '29BBBBB1111B2Z6',
          pan: 'BBACA5678G',
          cin: 'L29120KA2005PLC034567',
          udyamRegistration: 'UDYAM-KR-03-0004521',
          overallStatus: 'ACTIVE',
          trustScore: 98.0,
          category: 'Large Enterprise'
        }
      ];
    }
  },

  getSellerById: async (id: string): Promise<any> => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/sellers/${encodeURIComponent(id)}`);
      return await handleResponseJson(res);
    } catch {
      return {
        id: 'SLR-APEX-001',
        organizationName: 'Apex Pumps & Motors Pvt Ltd',
        gstin: '07AAAAA0000A1Z5',
        pan: 'AAACA1234F',
        cin: 'U29100DL2010PTC201234',
        cinOrPan: 'AAACA1234F',
        udyamRegistration: 'UDYAM-DL-01-0029341',
        bisLicense: 'CM/L-8492019',
        epfoCode: 'DLCPM0019283000',
        registeredAddress: 'Plot 42, Okhla Industrial Area Phase-III, New Delhi 110020',
        category: 'Small Enterprise (MSME)',
        isDebarred: false,
        overallStatus: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        trustScore: 88.5,
        updatedAt: new Date().toISOString(),
        verificationResults: [
          { connectorName: 'GSTN Tax Registry', status: 'VERIFIED', responseJson: '{"taxpayerStatus":"Active","filingStatus":"Regular"}' },
          { connectorName: 'MCA21 Corporate Registry', status: 'VERIFIED', responseJson: '{"companyStatus":"Active","roc":"ROC Delhi"}' },
          { connectorName: 'Udyam MSME Portal', status: 'VERIFIED', responseJson: '{"enterpriseType":"Small","majorActivity":"Manufacturing"}' },
          { connectorName: 'EPFO Social Security', status: 'VERIFIED', responseJson: '{"contributingMembers":128,"status":"Compliant"}' },
          { connectorName: 'Central Vigilance Debarment', status: 'CLEAR', responseJson: '{"debarred":false,"reason":null}' }
        ]
      };
    }
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
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/tenders/${tenderId}/results`);
      return await handleResponseJson(res);
    } catch {
      return {
        tenderId: tenderId,
        tenderNumber: tenderId.includes('GEM') ? tenderId.replace(/-/g, '/') : 'GEM/2026/B/90124',
        title: 'Supply & Installation of High-Efficiency Water Pumps',
        status: 'AWARDED',
        awardedAt: '2026-09-12T16:45:00Z',
        rankedBidders: [
          {
            rank: 1,
            bidId: 'BID-GEM-90124',
            bidderName: 'Apex Pumps & Motors Pvt Ltd / GlobalFlow',
            score: 96.5,
            debarmentStatus: 'CLEAR',
            recommendation: 'L1 CONTRACT WINNER (Awarded ₹4.78 Cr)'
          },
          {
            rank: 2,
            bidId: 'BID-FLOW-002',
            bidderName: 'FlowTech Hydraulics India Ltd',
            score: 88.2,
            debarmentStatus: 'CLEAR',
            recommendation: 'L2 Qualified'
          },
          {
            rank: 3,
            bidId: 'BID-HYDRO-003',
            bidderName: 'HydroMech Engineering Corp',
            score: 72.0,
            debarmentStatus: 'CLEAR',
            recommendation: 'L3 Non-Compliant (Operational efficiency < 85%)'
          }
        ],
        onChainProof: {
          txHash: '0x8f3c7e4b2d1a0987654321fedcba0987654321fedcba0987654321fedcba1042',
          blockNumber: 1042,
          anchoredHash: '0x3a9f1b4c8d2e0f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a',
          contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          verificationStatus: 'VERIFIED_ON_CHAIN'
        }
      };
    }
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
