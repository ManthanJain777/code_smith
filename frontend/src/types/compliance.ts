export type ComplianceStatus =
  | 'COMPLIANT'
  | 'PARTIALLY_COMPLIANT'
  | 'NON_COMPLIANT'
  | 'UNVERIFIED'
  | 'NOT_APPLICABLE';

export type VerificationMethod = 'deterministic' | 'ai_language' | 'hybrid' | 'human_override';

export interface Requirement {
  id: string;
  tenderId: string;
  reqCode: string;
  category: string;
  rawText: string;
  reqType: string;
  operator?: string;
  threshold?: number;
  unit?: string;
  isMandatory: boolean;
  sourcePage?: number;
}

export interface Tender {
  id: string;
  organizationId: string;
  tenderNumber: string;
  tenderReferenceNumber?: string;
  title: string;
  description: string;
  issuingAuthority: string;
  category: string;
  estimatedValue: number;
  status: string;
  createdBy: string;
  createdAt: string;
  closingDate?: string;
  requirements: Requirement[];
}

export interface Bid {
  id: string;
  tenderId: string;
  bidderName: string;
  gstin: string;
  bidderGstin?: string;
  cin?: string;
  pan?: string;
  bidderPan?: string;
  bidderEmail?: string;
  status: string;
  submittedAt: string;
  riskScore?: number;
  totalAmount?: number;
  quotedPrice?: number;
  complianceScore?: number;
  blockchainTx?: string;
  blockchainTxHash?: string;
  dscSerial?: string;
  forgeryRisk?: number;
  debarmentStatus?: string;
}

export interface ComplianceResult {
  id: string;
  requirementId: string;
  requirementCode: string;
  requirementText: string;
  category: string;
  bidId: string;
  status: ComplianceStatus;
  verificationMethod: VerificationMethod;
  reasoning: string;
  confidence: number;
  evidenceIds: string;
  reviewStatus: 'PENDING' | 'APPROVED' | 'OVERRIDDEN';
  humanOverridden?: boolean;
  reviewerNotes?: string;
  blockchainTxHash?: string;
  createdAt: string;
  /** Structured document-level citations extracted by AI */
  evidenceCitations?: Array<{
    documentName: string;
    pageNum: number;
    extractedText?: string;
    snippet?: string;
    confidence?: number;
  }>;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  organizationId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  details?: string;
  performedBy?: string;
  entityType?: string;
  entityId?: string;
}

export interface HumanReviewRequest {
  complianceResultId: string;
  reviewerId: string;
  finalStatus: ComplianceStatus;
  reviewerNote?: string;
}

export interface Contradiction {
  id: string;
  bidId: string;
  requirementId?: string;
  documentA: string;
  documentB: string;
  pageA?: number;
  pageB?: number;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
