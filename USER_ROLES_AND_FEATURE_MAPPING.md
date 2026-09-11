# SIH26100 GeM Bid Compliance Platform — Role-Based Access Control (RBAC) Specification
**Single Source of Truth**

This document establishes the definitive role-based access control (RBAC), feature scoping, and architectural security rules for the SIH26100 GeM Bid Compliance Verification Platform. This document supersedes and completely replaces all previous versions and conflicting documentation.

Every feature assigned to a role is strictly enforced across **THREE independent layers**:
1. **Frontend Route Guards:** Intercept direct URL routing (`ProtectedRoute.tsx`), blocking access even if no navigation link is rendered.
2. **Backend Endpoint Guards:** Spring Boot `SecurityConfig.java` filter chain and controller `@PreAuthorize` method annotations reject unauthorized requests with `HTTP 403 Forbidden`.
3. **Data-Scoping Filters:** Service and query-layer isolation filters prevent authorized roles from pulling competitor or unauthorized tenant data (server-side principal validation).

---

## Canonical Compliance State Vocabulary
The platform strictly standardizes on the following five-state vocabulary across Java enums, TypeScript types, Python schemas, and PostgreSQL tables:
```
COMPLIANT | PARTIALLY_COMPLIANT | NON_COMPLIANT | UNVERIFIED | NOT_APPLICABLE
```

---

## 1. System Administrator (`SYSTEM_ADMIN`)
* **Role Summary:** IT Operations & DevSecOps Lead. Superset role with global administration and microservice instrumentation authority.
* **Shared Baseline:** Full access to Tenders & Clauses, Compliance Matrix, Multi-Bidder Compare, Statutory Portal Connectors (13 registries `[SIMULATED — MOCK API]`), Seller Verification Queue, Human Review Queue (with override authority), exportable Compliance Reports, and Blockchain Audit Trail. Reuses the full Officer-grade Procurement Committee Copilot.
* **Unique Administrator Features:**
  - **Microservices Health Panel (`/admin`):** Real-time health, ping latency, and uptime monitoring across all 5 platform services:
    * React Frontend (:3000)
    * Spring Boot Core Backend (:8080)
    * FastAPI AI/RAG Engine (:8000)
    * Ollama Local LLM (:11434)
    * Hardhat EVM Blockchain (:8545)
  - **Prompt-Injection Defense Sentinel:** Real-time adversarial injection test harness where attack payloads can be evaluated and logged in real-time.
  - **Vendor Ingestion Test Harness:** Uploads sample bid documents labeled explicitly as `"TEST MODE"` without creating real vendor accounts.
  - **Aggregate Confidence Calibration Dashboard:** System-wide statistical distribution of human override rates correlated against AI confidence levels across all reviewers.
* **Notifications:** Microservice health check failed, Prompt-injection attempt sanitized.

---

## 2. Procurement Officer (`PROCUREMENT_OFFICER`)
* **Role Summary:** Tender Inviting Authority (TIA) & Committee Chair. Owns the final commercial and technical contract award decision.
* **Core Modules & Capabilities:**
  - **Tenders & Requirements (`/tenders`):** Full management of public procurement tenders, GFR 2017 clauses, and eligibility requirements.
  - **Compliance Matrix (`/compliance`):** Full access to 5-state requirement verification and evidence citations.
  - **Multi-Bidder Compare (`/compare`):** Side-by-side comparative evaluation of all competing bids. *Exclusively accessible to Officer among non-admin roles to uphold GFR Rule 173 commercial confidentiality.*
  - **Procurement Committee Copilot (`/copilot`):** Full interactive AI assistant with unrestricted query access across tender requirements, all bidders, and submitted evidence. Features quick-question categories for Non-Compliance Reasons, Risk Assessment, and Contradictions.
  - **Statutory Portal Connectors (`/portals`):** Batch queries across all 13 government registries `[SIMULATED — MOCK API]`.
  - **Seller/Vendor Risk Queue (`/sellers`):** Full queue inspection and authority to override seller trust scores with mandatory written justification.
  - **Human Review Queue (`/reviews`):** Queue access with authority to trigger human overrides.
  - **Contradiction Detection:** Read-only context for evaluation. *Does NOT get the resolve action (resolve action belongs exclusively to Reviewer).*
  - **Fraud & Risk Breakdown:** Forged document flags, debarment/blacklist check results, transparent weighted risk score breakdown (compliance rate, unverified count, contradictions, forgery flags, blacklist status).
  - **Diff & Expiry Tracking:** Deadline and certificate expiry tracking across all bidders, and "What Changed" document diffs.
  - **Compliance Reports & Analytics:** Full report exports and procurement trend analytics (`/analytics`).
  - **Blockchain Audit Trail (`/audit`):** Read-only verification to confirm own actions were anchored on-chain.
  - **Prompt Sentinel:** Read-only visibility into attack sanitization logs (no live adversarial test harness).
* **Explicitly Blocked:** Bid Submission (`/bids/upload`), Microservices Health Panel (`/admin`).
* **Notifications:** Bid processing complete, New high-risk flag, Contradiction detected.

---

## 3. Compliance Reviewer (`COMPLIANCE_REVIEWER`)
* **Role Summary:** Technical & Financial Subject Matter Expert (SME). Focused on human-in-the-loop exception handling.
* **Core Modules & Capabilities:**
  - **Tenders & Requirements (`/tenders`):** Read access to published tender specifications.
  - **Compliance Matrix (`/compliance`):** Full read/write access to compliance results for bids in their review queue.
  - **Compliance Exception Assistant (`/copilot`):** Scoped exclusively to bids currently in their review queue. Answers questions like "why is this flagged" and "what evidence supports this requirement." Strictly blocked from cross-bidder comparisons.
  - **Human Review Queue (`/reviews`):** Prioritized inbox sorted by AI uncertainty/confidence score, surfacing low-confidence items first.
  - **One-Click Evidence Drawer:** Displays extracted raw text snippet, source document filename, page index, deterministic calculation, and confidence score.
  - **Audited Decision Overrides:** Reclassifies automated findings with mandatory written justification (>= 15 characters), anchored to the blockchain and propagated to the Auditor Override Log.
  - **Contradiction Resolution Action:** Exclusively owns the resolve action (`POST /api/v1/compliance/contradictions/resolve`) to select statutory precedent documents and record formal resolution rationale.
  - **Seller Verification Queue (`/sellers`):** Full access to trust scores and statutory portals `[SIMULATED — MOCK API]`.
  - **Personal Confidence Calibration:** Personal statistic showing individual override rate vs. AI confidence score (never the aggregate across all reviewers).
  - **Compliance Reports (`/reports`):** Read access to generated evaluation reports.
* **Explicitly Blocked:** Multi-Bidder Compare (`/compare`), Procurement Analytics (`/analytics`), Bid Submission (`/bids/upload`), Full Blockchain Audit Interface write/anchor, Collusion Signal Flags.
* **Notifications:** Bid processing complete, New high-risk flag, Contradiction detected.

---

## 4. Auditor / Vigilance Officer (`AUDITOR`)
* **Role Summary:** Chief Vigilance Officer (CVO) / CAG Independent Oversight. Read-only scrutiny of the evaluation and human review process.
* **Core Modules & Capabilities:**
  - **Tenders & Compliance Matrix:** Read-only access to verify evaluation criteria and baseline findings.
  - **Dedicated Human Override Log (`GET /api/v1/audit/overrides`):** Dedicated scrutiny view listing every human override executed by Officers or Reviewers, including actor identity, timestamp, original status, overridden status, and mandatory justification text.
  - **Vigilance Query Transcript (`/copilot`):** Strictly read-only query transcript viewer with **NO live input box**. Displays scrollable log of questions asked by committee members, answers given, timestamps, and asking user identity.
  - **Primary Blockchain Audit Trail (`/audit`):** Rich ledger of all anchored events with Cryptographic Proof Modal exposing Ethereum EVM transaction hash, block number, gas used, and keccak256 digest against `ComplianceAuditLedger.sol`.
  - **Debarment / Blacklist History (`GET /api/v1/audit/debarment-history`):** Dedicated drill-down view of all checked bidders and official clearance references.
  - **Collusion Signal Flags (`GET /api/v1/audit/collusion-flags`):** Primary owner of collusion indicators (shared bank accounts, duplicate director DINs, identical submission IP clusters) framed strictly for human investigation.
  - **Compliance Reports & Risk Breakdown:** Read access to export compliance reports, inspect forged document flags, and review transparent risk formulas.
* **Explicitly Blocked:** Multi-Bidder Compare (`/compare`), Seller Verification Queue (`/sellers`), Statutory Portals (`/portals`), Active Human Review Queue (`/reviews`), Bid Submission (`/bids/upload`), Microservices Health Panel (`/admin`), Prompt-Injection Defense Sentinel (`/admin`).
* **Notifications:** New human override recorded.

---

## 5. Bidder / Vendor (`BIDDER_VENDOR`)
* **Role Summary:** Registered Supplier / OEM Representative. Strictly self-scoped to uphold commercial confidentiality under GFR Rule 173.
* **Core Modules & Capabilities:**
  - **Vendor Dashboard (`/`):** Real-time regulatory standing badges (debarment status, MSME/Udyam category, GSTIN/PAN status).
  - **Open Tenders (`/tenders`):** Read access to published active tenders open for bidding.
  - **Bid Submission & Document Ingestion (`/bids/upload`):** Multipart dossier upload with instant pre-validation feedback (OCR extraction, unit normalization, page confirmation).
  - **Own Compliance Matrix (`/compliance`):** Strictly scoped to own bid (`BID-APEX-001`). Displays requirement-by-requirement status with real document and page citations.
  - **My Bid Compliance Assistant (`/copilot`):** Scoped AI copilot with welcome text `"This is your Bid Compliance Assistant"`. Answers questions regarding why own requirements were flagged and what documents are required. *Actively detects and rejects queries regarding competitor bids, pricing, or collusion flags.*
  - **Deadline & Expiry Tracking:** Tracks upcoming expiration of own ISO, MSME, and tax certificates.
  - **"What Changed" Confirmation View:** Confirms resubmitted documents were processed into the evaluation matrix.
  - **Vendor Self-Profile (`/sellers/me`):** Scrutinizes own statutory registry standing.
  - **Own Compliance Report:** Exportable evaluation report for own bid dossier only.
* **Explicitly Blocked:** Multi-Bidder Compare (`/compare`), Competitor Bids, Seller Verification Queue for others, Active Human Review Queue, Procurement Analytics, Full Blockchain Trail, Statutory Portals for others, Contradiction Detection, Collusion Signal Flags, Forged Document Flags, Microservices Health Panel, Prompt Sentinel.
* **Notifications:** Bid status changed, Certificate expiring within N days, Document resubmission received.

---

## RBAC Endpoint & Route Security Matrix

| Feature / URL Path | Endpoint | `ADMIN` | `OFFICER` | `REVIEWER` | `AUDITOR` | `BIDDER` |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Command Center** (`/`) | Dynamic role dashboard | `FULL` | `FULL` | `FULL` | `READ` | `OWN` |
| **Tenders** (`/tenders`) | `GET /api/v1/tenders` | `FULL` | `FULL` | `READ` | `READ` | `READ` (open) |
| **Compliance Matrix** (`/compliance`) | `GET /api/v1/compliance/bid/{id}` | `FULL` | `FULL` | `FULL` | `READ` | `OWN` (data-isolated) |
| **Multi-Bidder Compare** (`/compare`) | `GET /api/v1/bids/tender/{id}` | `FULL` | `FULL` | `403 BLOCKED` | `403 BLOCKED` | `403 BLOCKED` |
| **Procurement Copilot** (`/copilot`) | `POST :8000/copilot/query` | `FULL` | `FULL` | `SCOPED` | `TRANSCRIPT ONLY` | `OWN REFUSAL` |
| **Statutory Portals** (`/portals`) | `GET /api/v1/sellers/{id}/verify-all` | `FULL` | `FULL` | `FULL` | `403 BLOCKED` | `403 BLOCKED` |
| **Seller Risk Queue** (`/sellers`) | `GET /api/v1/sellers` | `FULL` | `FULL` | `FULL` | `403 BLOCKED` | `403 BLOCKED` |
| **Vendor Self-Profile** (`/sellers/me`) | `GET /api/v1/sellers/me` | `FULL` | `FULL` | `FULL` | `403 BLOCKED` | `OWN` |
| **Human Reviews** (`/reviews`) | `GET /api/v1/reviews` | `FULL` | `FULL` | `FULL` | `403 BLOCKED` | `403 BLOCKED` |
| **Contradiction Resolve** | `POST /api/v1/compliance/contradictions/resolve`| `FULL` | `403 BLOCKED` | `FULL` | `403 BLOCKED` | `403 BLOCKED` |
| **Human Override Log** | `GET /api/v1/audit/overrides` | `FULL` | `403 BLOCKED` | `403 BLOCKED` | `FULL` | `403 BLOCKED` |
| **Collusion Signal Flags** | `GET /api/v1/audit/collusion-flags` | `FULL` | `403 BLOCKED` | `403 BLOCKED` | `FULL` | `403 BLOCKED` |
| **Debarment History** | `GET /api/v1/audit/debarment-history` | `FULL` | `403 BLOCKED` | `403 BLOCKED` | `FULL` | `403 BLOCKED` |
| **Blockchain Trail** (`/audit`) | `GET /api/v1/audit/logs` | `FULL` | `READ` | `READ` | `FULL` | `403 BLOCKED` |
| **Bid Submission** (`/bids/upload`) | `POST /api/v1/bids` | `TEST MODE` | `403 BLOCKED` | `403 BLOCKED` | `403 BLOCKED` | `FULL` |
| **Health Panel** (`/admin`) | `GET /api/v1/health` | `FULL` | `403 BLOCKED` | `403 BLOCKED` | `403 BLOCKED` | `403 BLOCKED` |
| **Adversarial Sentinel** (`/admin`) | `POST :8000/security/sanitize` | `FULL` | `READ LOG` | `403 BLOCKED` | `403 BLOCKED` | `403 BLOCKED` |
