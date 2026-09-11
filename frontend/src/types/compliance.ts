export type ComplianceStatus =
  | 'COMPLIANT'
  | 'PARTIALLY_COMPLIANT'
  | 'NON_COMPLIANT'
  | 'UNVERIFIED'
  | 'NOT_APPLICABLE';

export type VerificationMethod = 'deterministic' | 'ai_language' | 'hybrid';

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
  cin?: string;
  pan?: string;
  status: string;
  submittedAt: string;
  riskScore?: number;
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
  createdAt: string;
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
