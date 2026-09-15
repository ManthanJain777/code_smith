# SIH26100 GeM Bid Compliance Platform
**AI-Powered Integrated Bid Compliance Verification Platform**
*Ministry of Petroleum & Natural Gas | General Financial Rules (GFR) 2017 & GeM GTC v4.0*

---

## Overview
The SIH26100 Platform delivers an enterprise-grade, role-based compliance verification and decision support ecosystem for high-value government procurement. It enforces strict separation of duties, commercial confidentiality under GFR Rule 173, explainable AI with deterministic supremacy, and an EVM blockchain audit anchor prototype.

---

## Prototype-Readiness Matrix

| Subsystem / Capability | Status | Current SIH Prototype Implementation | Production Roadmap / Gap |
| :--- | :--- | :--- | :--- |
| **Deterministic Compliance Engine** | **Implemented** | Mathematical turnover comparison vs threshold, unit normalization, citation linkage, rule versioning. | Automated NIT clause-to-rule parsing, tender policy packs. |
| **Qualitative Clause Adjudication** | **Implemented** | Unresolved qualitative requirements default to `UNVERIFIED` with referral under GFR 173. | Domain-specific legal semantic evaluation models with human oversight. |
| **Role-Based Access Control (RBAC)** | **Implemented** | 5 distinct roles, server-side JWT authentication, SecurityContext principal derivation, data-scoping filters. | National Single Sign-On (Jan Parichay / Parichay SSO) OAuth2 integration. |
| **Document Ownership & IDOR Protection** | **Implemented** | Server-side bidder ownership validation for uploaded bid documents, tender-level upload protection. | S3 / Object store signed URLs with immutable SHA-256 hash verification. |
| **Statutory Verification Adapters** | **Simulated** | 13 statutory registries (GST, PAN, MCA, Udyam, DPIIT, EPFO, ESIC, etc.) with explicit `[SIMULATED]` contracts. | Authenticated Open APIs (e.g. GSTN Sandbox, MCA21 V3, EPFO APIs) with signed responses. |
| **EVM Audit Anchoring** | **Implemented (Prototype)** | Local Hardhat node, `ComplianceAuditLedger.sol` smart contract, explicit `ON_CHAIN_CONFIRMED` vs `OFFLINE` status. | Permissioned consortium network (e.g. Hyperledger Besu), Merkle batching, HSM managed keys. |
| **AI Extraction & Grounded Copilot** | **Partially Integrated** | FastAPI / Ollama / Gemini with dynamic citations derived from evidence documents; refusal on unsupported claims. | Formal source-span verification, adversarial robustness benchmarks, automated citation check. |
| **Digital Signatures (DSC)** | **Simulated** | Explicit `Simulated Class-3 DSC` signing UI with cryptographic payload digest generation. | eMudhra / Capricorn browser PKI token extension integration for hardware DSC cryptographic signing. |

---

## 3-Layer Role-Based Access Control (RBAC)
Every platform feature is enforced across three distinct layers:
1. **Frontend Route Guards (`ProtectedRoute.tsx`):** Prevents direct URL bypassing.
2. **Backend Endpoint Security (`SecurityConfig.java` & Controller `@PreAuthorize`):** Rejects unauthorized REST calls with `HTTP 403 Forbidden`.
3. **Data-Scoping Filters:** Server-side principal injection guarantees that vendors never access competitor data and committee members inspect only authorized queues.

### The 5 System Personas & Credentials
| Role | Persona Name | Demo Login Email | Password | Primary Mission |
| :--- | :--- | :--- | :--- | :--- |
| **`SYSTEM_ADMIN`** | Operations & DevSecOps Lead | `admin.demo@gembid.local` | `Password123!` | Microservice health telemetry, adversarial prompt injection sentinel, vendor ingestion test harness. |
| **`PROCUREMENT_OFFICER`** | Tender Inviting Authority (TIA) | `procurement.demo@gembid.local` | `Password123!` | Contract award decisioning, Multi-Bidder Compare (`/compare`), live Procurement Committee Copilot, analytics. |
| **`COMPLIANCE_REVIEWER`** | Technical & Financial SME | `reviewer.demo@gembid.local` | `Password123!` | Exception-handling queue sorted by AI confidence, evidence drawer, audited overrides, contradiction resolution. |
| **`AUDITOR`** | Chief Vigilance Officer (CVO) | `auditor.demo@gembid.local` | `Password123!` | Read-only scrutiny, dedicated Human Override Log, Vigilance Query Transcript (read-only), blockchain verification, collusion signal flags. |
| **`BIDDER_VENDOR`** | Registered Supplier / OEM | `bidder.demo@gembid.local` | `Password123!` | Self-scoped workspace, pre-validation feedback, own compliance matrix with citations, "My Bid Compliance Assistant". |

---

## 4 Distinct Copilot Configurations
1. **Procurement Officer / Admin:** Live Committee Copilot with unrestricted cross-bidder queries and prompt buttons for Non-Compliance Reasons, Risk Assessment, and Contradictions.
2. **Compliance Reviewer:** Compliance Exception Assistant scoped strictly to exception bids in the user's review queue. Cross-bidder comparison is blocked.
3. **Auditor / Vigilance Officer:** Vigilance Query Transcript — strictly read-only with **NO live query input box**. Displays scrollable log of committee queries and answers.
4. **Bidder / Vendor:** "My Bid Compliance Assistant" — answers inquiries regarding the bidder's own requirements. Backend policy guard detects and refuses questions about competitor bids, pricing, or collusion flags.

---

## Canonical 5-State Compliance Vocabulary
All services strictly standardize on the five canonical states:
```
COMPLIANT | PARTIALLY_COMPLIANT | NON_COMPLIANT | UNVERIFIED | NOT_APPLICABLE
```

---

## 13 Statutory Portal Connectors `[SIMULATED — MOCK API]`
All statutory government registry integrations are verified and rendered with explicit `[SIMULATED — MOCK API]` labels:
1. GSTN Portal
2. PAN & Income Tax
3. MCA21 Corporate Registry
4. Udyam MSME Portal
5. Startup India (DPIIT)
6. NSIC National Small Industries Corporation
7. OEM Authorization & Malicious Vendor Database
8. Make in India (MII) & Local Content
9. Bureau of Indian Standards (BIS) & DPIIT QCO
10. EPFO Provident Fund Compliance
11. ESIC Employee State Insurance
12. DigiLocker Document Verification
13. Ministry of Finance Central Debarment / Blacklist

---

## Platform Architecture & Ports
- **Frontend:** React + Vite + TailwindCSS on port `3000`
- **Backend Core:** Spring Boot 3 + Java 17 + PostgreSQL on port `8080`
- **AI & RAG Engine:** FastAPI + PyTorch + Sentence-Transformers on port `8000`
- **Local LLM Engine:** Ollama qwen2.5:3b on port `11434`
- **Audit Blockchain:** Hardhat EVM + Solidity (`ComplianceAuditLedger.sol`) on port `8545`
