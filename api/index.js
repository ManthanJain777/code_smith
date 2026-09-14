// Vercel Serverless Function — Unified API Gateway for GeM Compliance Platform
// Provides serverless API parity for /api/v1 endpoints on Vercel deployments.

const DEMO_USERS = {
  'procurement.demo@gembid.local': { userId: 'USR-OFFICER-001', fullName: 'Sh. Rajesh Sharma', role: 'PROCUREMENT_OFFICER', organizationId: 'ORG-GEM-01', permissions: ['TENDER_CREATE', 'TENDER_VIEW', 'COMPLIANCE_VIEW', 'EVALUATION_MANAGE', 'AWARD_DECISION'] },
  'officer.sharma@gem.gov.in': { userId: 'USR-OFFICER-001', fullName: 'Sh. Rajesh Sharma', role: 'PROCUREMENT_OFFICER', organizationId: 'ORG-GEM-01', permissions: ['TENDER_CREATE', 'TENDER_VIEW', 'COMPLIANCE_VIEW', 'EVALUATION_MANAGE', 'AWARD_DECISION'] },
  'reviewer.demo@gembid.local': { userId: 'USR-REVIEWER-001', fullName: 'Smt. Priya Verma', role: 'COMPLIANCE_REVIEWER', organizationId: 'ORG-GEM-01', permissions: ['COMPLIANCE_VIEW', 'OVERRIDE_SUBMIT', 'CONTRADICTION_RESOLVE', 'AUDIT_VIEW'] },
  'reviewer.verma@gem.gov.in': { userId: 'USR-REVIEWER-001', fullName: 'Smt. Priya Verma', role: 'COMPLIANCE_REVIEWER', organizationId: 'ORG-GEM-01', permissions: ['COMPLIANCE_VIEW', 'OVERRIDE_SUBMIT', 'CONTRADICTION_RESOLVE', 'AUDIT_VIEW'] },
  'admin.demo@gembid.local': { userId: 'USR-ADMIN-001', fullName: 'Dr. Amit Patel', role: 'SYSTEM_ADMIN', organizationId: 'ORG-GEM-ADMIN', permissions: ['ALL'] },
  'admin.tech@gem.gov.in': { userId: 'USR-ADMIN-001', fullName: 'Dr. Amit Patel', role: 'SYSTEM_ADMIN', organizationId: 'ORG-GEM-ADMIN', permissions: ['ALL'] },
  'auditor.demo@gembid.local': { userId: 'USR-AUDITOR-001', fullName: 'CAG Audit Directorate', role: 'AUDITOR', organizationId: 'ORG-CAG-01', permissions: ['AUDIT_READ', 'REPLAY_VIEW', 'BLOCKCHAIN_VERIFY', 'REPORT_EXPORT'] },
  'auditor.cag@gov.in': { userId: 'USR-AUDITOR-001', fullName: 'CAG Audit Directorate', role: 'AUDITOR', organizationId: 'ORG-CAG-01', permissions: ['AUDIT_READ', 'REPLAY_VIEW', 'BLOCKCHAIN_VERIFY', 'REPORT_EXPORT'] },
  'bidder.demo@gembid.local': { userId: 'USR-BIDDER-001', fullName: 'Apex Pumps & Motors Pvt Ltd', role: 'BIDDER_VENDOR', organizationId: 'SLR-APEX-001', permissions: ['BID_SUBMIT', 'BID_STATUS_VIEW', 'DOCUMENTS_MANAGE'] },
  'bidder.apex@gmail.com': { userId: 'USR-BIDDER-001', fullName: 'Apex Pumps & Motors Pvt Ltd', role: 'BIDDER_VENDOR', organizationId: 'SLR-APEX-001', permissions: ['BID_SUBMIT', 'BID_STATUS_VIEW', 'DOCUMENTS_MANAGE'] },
};

const TENDERS = [
  {
    id: 'TND-PUMP-001',
    tenderNumber: 'GEM/2026/B/90125',
    title: 'Supply & Installation of High-Efficiency Industrial Water Pumps',
    description: 'Procurement of centrifugal pumps (800 units/day capacity) for Central Water Commission infrastructure. Minimum pump efficiency 85%, NPSH 6m, operating pressure 10 bar.',
    issuingAuthority: 'Central Water Commission',
    category: 'Industrial Equipment',
    estimatedValue: 50000000.00,
    status: 'IN_EVALUATION',
    createdBy: 'USR-PROC-01',
    createdAt: '2026-08-01T10:00:00Z',
    closingDate: '2026-09-30T17:00:00Z'
  },
  {
    id: 'TND-IT-002',
    tenderNumber: 'GEM/2026/IT/30210',
    title: 'Supply of High-Density Enterprise Compute Servers & SAN Storage',
    description: 'Procurement of rack-mounted servers (min 64GB RAM, dual 10GbE SFP+) and NVMe SAN storage for state data center expansion.',
    issuingAuthority: 'National Informatics Centre',
    category: 'IT & Data Systems',
    estimatedValue: 80000000.00,
    status: 'OPEN',
    createdBy: 'USR-PROC-01',
    createdAt: '2026-08-15T09:30:00Z',
    closingDate: '2026-10-15T17:00:00Z'
  },
  {
    id: 'TND-MED-003',
    tenderNumber: 'GEM/2026/MED/11090',
    title: 'Procurement of Portable Digital Radiography X-Ray Systems',
    description: 'Supply and comprehensive 5-year onsite maintenance of high-frequency mobile X-ray units for regional health institutes.',
    issuingAuthority: 'Ministry of Health & Family Welfare',
    category: 'Medical Equipment',
    estimatedValue: 35000000.00,
    status: 'CLOSED',
    createdBy: 'USR-PROC-02',
    createdAt: '2026-07-10T11:00:00Z',
    closingDate: '2026-08-25T17:00:00Z'
  }
];

const BIDS = [
  {
    id: 'BID-APEX-001',
    tenderId: 'TND-PUMP-001',
    bidderName: 'Apex Pumps & Motors Pvt Ltd',
    bidderGstin: '07AAAAA0000A1Z5',
    gstin: '07AAAAA0000A1Z5',
    bidderPan: 'AAACA1234F',
    pan: 'AAACA1234F',
    bidderEmail: 'apex@apexpumps.com',
    status: 'UNDER_EVALUATION',
    riskScore: 65.0,
    forgeryRisk: 'LOW',
    debarmentStatus: 'CLEAR',
    submittedAt: '2026-09-10T14:22:15Z',
    blockchainTx: '0x9a8f4c2e1b7d5a3f0e8c6b4a2d0f8e6c4b2a0d8e6c4b2a0d8e6c4b2a0d8e6c4b'
  },
  {
    id: 'BID-GFL-001',
    tenderId: 'TND-PUMP-001',
    bidderName: 'GlobalFlow Engineers Ltd',
    bidderGstin: '29BBBBB1111B2Z6',
    gstin: '29BBBBB1111B2Z6',
    bidderPan: 'BBACA5678G',
    pan: 'BBACA5678G',
    bidderEmail: 'bid@globalflow.in',
    status: 'UNDER_EVALUATION',
    riskScore: 15.0,
    forgeryRisk: 'LOW',
    debarmentStatus: 'CLEAR',
    submittedAt: '2026-09-11T16:45:00Z',
    blockchainTx: '0x1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d'
  }
];

const COMPLIANCE_RESULTS = [
  {
    id: 'RES-A-001',
    requirementId: 'REQ-P001',
    requirementCode: 'REQ-P001',
    requirementText: 'Bidder must have minimum Rs.100 crore annual turnover for each of the previous 3 financial years.',
    category: 'Financial',
    bidId: 'BID-APEX-001',
    status: 'PARTIALLY_COMPLIANT',
    verificationMethod: 'deterministic',
    reasoning: 'FY2023=Rs.112Cr (PASS), FY2024=Rs.127Cr (PASS), FY2025=Rs.94Cr (FAIL). FY2025 turnover Rs.94 Cr is below the required Rs.100 Cr threshold. 2 of 3 years compliant.',
    confidence: 0.99,
    reviewStatus: 'PENDING'
  },
  {
    id: 'RES-A-002',
    requirementId: 'REQ-P002',
    requirementCode: 'REQ-P002',
    requirementText: 'Valid GST Registration Certificate and PAN Card must be submitted.',
    category: 'Eligibility',
    bidId: 'BID-APEX-001',
    status: 'COMPLIANT',
    verificationMethod: 'deterministic',
    reasoning: 'GST Registration Certificate (07AAAAA0000A1Z5) verified active via GSTN. PAN Card (AAACA1234F) verified. Both documents present and valid.',
    confidence: 0.99,
    reviewStatus: 'APPROVED'
  },
  {
    id: 'RES-A-003',
    requirementId: 'REQ-P003',
    requirementCode: 'REQ-P003',
    requirementText: 'Pump operational efficiency shall not be less than 85%.',
    category: 'Technical',
    bidId: 'BID-APEX-001',
    status: 'COMPLIANT',
    verificationMethod: 'deterministic',
    reasoning: 'Technical Datasheet states pump efficiency 88.4%. 88.4% >= 85.0% threshold. COMPLIANT.',
    confidence: 0.98,
    reviewStatus: 'APPROVED'
  },
  {
    id: 'RES-A-004',
    requirementId: 'REQ-P004',
    requirementCode: 'REQ-P004',
    requirementText: 'Pump production capacity minimum 800 units per day.',
    category: 'Technical',
    bidId: 'BID-APEX-001',
    status: 'PARTIALLY_COMPLIANT',
    verificationMethod: 'deterministic',
    reasoning: 'CONTRADICTION DETECTED: Technical_Datasheet.pdf (page 12) states 800 units/day. Company_Brochure.pdf (page 3) states 500 units/day. Human reviewer must determine authoritative document.',
    confidence: 0.60,
    reviewStatus: 'PENDING'
  },
  {
    id: 'RES-A-005',
    requirementId: 'REQ-P005',
    requirementCode: 'REQ-P005',
    requirementText: 'Minimum 5 years of experience supplying to government entities.',
    category: 'Experience',
    bidId: 'BID-APEX-001',
    status: 'UNVERIFIED',
    verificationMethod: 'deterministic',
    reasoning: 'No government purchase order documents found in submitted bid covering 5+ years of government supply experience. System returns UNVERIFIED — not a guess.',
    confidence: 0.92,
    reviewStatus: 'PENDING'
  },
  {
    id: 'RES-A-006',
    requirementId: 'REQ-P006',
    requirementCode: 'REQ-P006',
    requirementText: 'ISO 9001:2015 Quality Management Certificate required. Certificate must be valid on the date of bid submission (2026-09-15).',
    category: 'Certification',
    bidId: 'BID-APEX-001',
    status: 'NON_COMPLIANT',
    verificationMethod: 'deterministic',
    reasoning: 'ISO 9001:2015 Certificate expiry date: 2026-07-31. Bid submission date: 2026-09-15. Certificate was expired 46 days before submission. NON_COMPLIANT.',
    confidence: 0.99,
    reviewStatus: 'PENDING'
  },
  {
    id: 'RES-A-007',
    requirementId: 'REQ-P007',
    requirementCode: 'REQ-P007',
    requirementText: 'Operating pressure rating must be at least 10 Bar.',
    category: 'Technical',
    bidId: 'BID-APEX-001',
    status: 'COMPLIANT',
    verificationMethod: 'deterministic',
    reasoning: 'Datasheet states operating pressure 155 PSI. Unit normalization: 155 PSI = 10.69 Bar. 10.69 Bar >= 10 Bar threshold. COMPLIANT after unit normalization.',
    confidence: 0.97,
    reviewStatus: 'APPROVED'
  }
];

const SELLERS = [
  {
    id: 'SLR-APEX-001',
    companyName: 'Apex Pumps & Motors Pvt Ltd',
    gstin: '07AAAAA0000A1Z5',
    pan: 'AAACA1234F',
    cin: 'U29100DL2010PTC201234',
    overallStatus: 'ACTIVE',
    trustScore: 84.5,
    portals: {
      gstn: { status: 'VERIFIED', message: 'Active taxpayer since 2017' },
      mca21: { status: 'VERIFIED', message: 'Compliant filings for FY 2024-25' },
      epfo: { status: 'VERIFIED', message: '128 active contributing members' },
      dpiit: { status: 'VERIFIED', message: 'DPIIT Startup recognized DIPP98231' },
      cppp: { status: 'CLEAR', message: 'No debarment record found' }
    }
  },
  {
    id: 'SLR-GFL-001',
    companyName: 'GlobalFlow Engineers Ltd',
    gstin: '29BBBBB1111B2Z6',
    pan: 'BBACA5678G',
    cin: 'L29120KA2005PLC034567',
    overallStatus: 'ACTIVE',
    trustScore: 98.0,
    portals: {
      gstn: { status: 'VERIFIED', message: 'Active regular taxpayer' },
      mca21: { status: 'VERIFIED', message: 'Listed public company, clean filings' },
      epfo: { status: 'VERIFIED', message: '1,450 active members' },
      dpiit: { status: 'NOT_APPLICABLE', message: 'Large enterprise' },
      cppp: { status: 'CLEAR', message: 'Clean public procurement record' }
    }
  }
];

const AUDIT_LOGS = [
  {
    id: 'AUD-001',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actor: 'USR-OFFICER-001',
    action: 'PIPELINE_RUN',
    resourceType: 'TENDER',
    resourceId: 'TND-PUMP-001',
    details: 'Triggered deterministic & ML compliance evaluation for all submitted bids',
    blockchainTxHash: '0x3a9b2c8f10e74b5a6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b'
  },
  {
    id: 'AUD-002',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    actor: 'USR-BIDDER-001',
    action: 'BID_SUBMISSION',
    resourceType: 'BID',
    resourceId: 'BID-APEX-001',
    details: 'Encrypted technical and commercial schedule bid sealed and submitted on GeM portal',
    blockchainTxHash: '0x9a8f4c2e1b7d5a3f0e8c6b4a2d0f8e6c4b2a0d8e6c4b2a0d8e6c4b2a0d8e6c4b'
  }
];

export default function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const cleanPath = url.split('?')[0].replace(/^\/api\/v1/, '').replace(/^\/api/, '');

  // 1. Health Endpoint
  if (cleanPath === '/health' || cleanPath === '' || cleanPath === '/') {
    return res.status(200).json({
      status: 'UP',
      service: 'GeM AI Compliance Gateway (Vercel Serverless)',
      version: '2.0.0',
      timestamp: new Date().toISOString()
    });
  }

  // 2. Auth Endpoints
  if (cleanPath === '/auth/login' && req.method === 'POST') {
    const { email, password } = req.body || {};
    const normalized = (email || '').toLowerCase().trim();
    const user = DEMO_USERS[normalized] || {
      userId: 'USR-GUEST-001',
      fullName: 'GeM Authorized User',
      role: 'PROCUREMENT_OFFICER',
      organizationId: 'ORG-DEMO',
      permissions: ['ALL']
    };

    return res.status(200).json({
      token: `demo-jwt-token-${user.role}`,
      userId: user.userId,
      email: normalized || 'user@gem.gov.in',
      fullName: user.fullName,
      role: user.role,
      organizationId: user.organizationId,
      permissions: user.permissions
    });
  }

  if (cleanPath === '/auth/me') {
    return res.status(200).json(DEMO_USERS['officer.sharma@gem.gov.in']);
  }

  // 3. Tenders
  if (cleanPath === '/tenders') {
    return res.status(200).json(TENDERS);
  }
  if (cleanPath.startsWith('/tenders/')) {
    const id = cleanPath.replace('/tenders/', '');
    const t = TENDERS.find(item => item.id === id) || TENDERS[0];
    return res.status(200).json(t);
  }

  // 4. Bids
  if (cleanPath.startsWith('/bids/tender/')) {
    const tId = cleanPath.replace('/bids/tender/', '');
    return res.status(200).json(BIDS.filter(b => b.tenderId === tId || tId.includes('PUMP')));
  }

  // 5. Compliance
  if (cleanPath.startsWith('/compliance/bid/')) {
    const bidId = cleanPath.replace('/compliance/bid/', '');
    return res.status(200).json(COMPLIANCE_RESULTS.filter(r => r.bidId === bidId || bidId.includes('APEX')));
  }
  if (cleanPath.startsWith('/compliance/score/')) {
    return res.status(200).json({
      overallScore: 82.4,
      financialScore: 75.0,
      technicalScore: 94.0,
      eligibilityScore: 100.0,
      confidence: 0.98,
      recommendation: 'REVIEW_REQUIRED',
      recommendationReason: 'Manual verification recommended due to detected contradiction in daily unit throughput.'
    });
  }
  if (cleanPath.startsWith('/compliance/recommendation/')) {
    return res.status(200).json({
      recommendation: 'PROCEED_WITH_SCRUTINY',
      riskTier: 'MEDIUM',
      criticalFlags: ['Contradiction in Pump Production Capacity', 'ISO 9001:2015 cert expired'],
      justificationSummary: 'Mandatory technical criteria met but qualification documents require human scrutiny override.'
    });
  }

  // 6. Sellers
  if (cleanPath === '/sellers') {
    return res.status(200).json(SELLERS);
  }
  if (cleanPath.startsWith('/sellers/') && cleanPath.endsWith('/verify-all')) {
    return res.status(200).json({ status: 'SUCCESS', verifiedAt: new Date().toISOString(), result: 'ALL_PORTALS_VERIFIED' });
  }
  if (cleanPath.startsWith('/sellers/')) {
    const sId = cleanPath.replace('/sellers/', '');
    const s = SELLERS.find(item => item.id === sId) || SELLERS[0];
    return res.status(200).json(s);
  }

  // 7. Audit & Reviews
  if (cleanPath === '/audit') {
    return res.status(200).json(AUDIT_LOGS);
  }
  if (cleanPath === '/audit/overrides') {
    return res.status(200).json([]);
  }
  if (cleanPath.startsWith('/audit/proof/')) {
    const hash = cleanPath.replace('/audit/proof/', '');
    return res.status(200).json({
      txHash: hash,
      blockNumber: 1048201,
      timestamp: new Date().toISOString(),
      network: 'GeM Sovereign Consortium EVM (Hardhat / Amoy)',
      status: 'CONFIRMED',
      eventPayload: { ruleCode: 'GFR-173', complianceVerified: true }
    });
  }
  if (cleanPath === '/reviews/override' && req.method === 'POST') {
    const body = req.body || {};
    return res.status(200).json({
      id: body.resultId || 'RES-OVERRIDE-01',
      status: body.newStatus || 'COMPLIANT',
      reasoning: body.justification || 'Reviewer manual override per GFR Rule 173',
      reviewStatus: 'APPROVED',
      blockchainTxHash: '0x4b8a2c0d6e8f0a2b4c6e8f0a2b4c6e8f0a2b4c6e8f0a2b4c6e8f0a2b4c6e8f0a'
    });
  }

  // Fallback
  return res.status(200).json({
    message: 'GeM API Gateway (Vercel Serverless)',
    path: cleanPath,
    timestamp: new Date().toISOString()
  });
}
