# Government e-Marketplace (GeM) Bid Compliance Platform
## Dashboard Architecture, Role-Based Access Control (RBAC) & Feature Matrix
**System Code:** SIH26100 | **Compliance Standard:** GFR 2017 & GeM GTC v4.0

---

## 1. Role-to-Dashboard Overview

The platform implements an **isolated Role-Based Access Control (RBAC)** architecture. Each user role is routed to a purpose-built view within the unified portal shell, ensuring strict data governance, commercial confidentiality, and integrity of public procurement.

| User Role | Primary Portal | Purpose & Responsibility | Access Level |
| :--- | :--- | :--- | :--- |
| **Procurement Officer** (`PROCUREMENT_OFFICER`) | Command Center (`/`) | Tender lifecycle oversight, multi-bidder comparison, anomaly evaluation, AI Copilot review | Full Tender & Bid Evaluation |
| **System Administrator** (`SYSTEM_ADMIN`) | Operations Suite (`/`) | System health, service pipelines, vendor ingestion testing, full audit verification | Administrative & Configuration |
| **Compliance Reviewer** (`COMPLIANCE_REVIEWER`) | Review Workstation (`/`) | Human-in-the-loop exception verification, override justification, contradiction audits | Review & Overrides (`reviews:write`) |
| **Auditor / Vigilance** (`AUDITOR`) | Vigilance Portal (`/`) | Independent scrutiny of procurement decisions, cryptographic audit ledger inspection | Read-Only Audit (`audit:read`) |
| **Bidder / Vendor** (`BIDDER_VENDOR`) | Vendor Self-Service (`/`) | Tender discovery, technical/financial dossier filing, GSTIN & MSME validation | Isolated Vendor Data Only |

---

## 2. In-Depth Dashboard Breakdown

---

### 2.1 Procurement Officer Dashboard
* **Route:** `/` (when authenticated as `PROCUREMENT_OFFICER`)
* **Primary Mission:** Evaluate technical, financial, and regulatory compliance of all submitted bids against published tender criteria.

#### Key Features & Modules:
1. **Executive Procurement KPIs:**
   - **Active Tenders Count:** Real-time count of public procurements under officer management.
   - **Bids Under Scrutiny:** Total submitted bidder dossiers across the selected tender.
   - **System Compliance Pass Rate:** Dynamic calculation of requirements verified as compliant.
   - **Contradiction Alert Counter:** Flags cross-document inconsistencies (e.g., turnover discrepancies between CA certificate and audited balance sheets).
2. **Tender & Bid Selection Matrix:**
   - Dropdown selectors allowing the officer to isolate any published tender and inspect individual vendor proposals.
3. **Multi-Bidder Compliance Matrix (`/compare`):**
   - Side-by-side comparative grid of all competing bidders.
   - Per-requirement status badges (`PASS`, `PARTIAL`, `FAIL`, `UNVERIFIED`).
   - Technical parameter evaluations (e.g., flow rate LPM, motor HP, power rating kW).
4. **GeM Procurement Intelligence Copilot (`/copilot`):**
   - Auditable committee decision support powered by the GeM Procurement Domain Model.
   - Zero-hallucination guard: Every generated answer is anchored to verified documents with page numbers and exact quotes.
5. **Red Flag & Collusion Detection:**
   - Identifies duplicate document metadata, identical corporate directors across bidding firms, or identical file submission IP clusters.
6. **On-Chain Cryptographic Proof Badge:**
   - Live transaction hash and block verification confirming the evaluation results are anchored on the Ethereum EVM ledger (`0x5FbDB2315678afecb367f032d93F642f64180aa3`).

#### Endpoints & APIs Used:
- `GET /api/v1/tenders` — Retrieves list of tenders.
- `GET /api/v1/tenders/{id}` — Retrieves tender specifications and criteria.
- `GET /api/v1/tenders/{id}/bids` — Retrieves all bids submitted for this tender.
- `GET /api/v1/compliance/results/{bidId}` — Retrieves deterministic and vector compliance evaluations.
- `POST http://localhost:8000/copilot/query` — Procurement Copilot RAG queries.

---

### 2.2 Bidder / Vendor Portal
* **Route:** `/` (when authenticated as `BIDDER_VENDOR` or `BIDDER`)
* **Primary Mission:** Allow legitimate suppliers to discover opportunities, upload compliant dossiers, and track their verification status with complete commercial confidentiality.

#### Key Features & Modules:
1. **Isolated Vendor Workspace:**
   - Strictly segmented: Vendors **never** see competitor bids, officer review queues, or collusion alerts.
2. **Vendor Standing & Regulatory Badges:**
   - **Debarment Status:** Real-time check against Ministry of Finance / GeM debarment blacklist (`CLEAR`).
   - **MSME / Udyam Standing:** Small / Micro Enterprise status and exemption eligibility.
   - **GSTIN & PAN Status:** Live status of corporate tax filings.
3. **Active Tenders for Bidding:**
   - Searchable directory of open tenders accepting bids.
   - One-click action: `Submit Technical Bid` routing to `/bids/upload`.
4. **Bid Submission & Document Ingestion (`/bids/upload`):**
   - Upload technical specifications, ISO certifications, CA turnover certificates, and EMD guarantees.
   - Instant pre-validation with page classification and unit normalization.

#### Endpoints & APIs Used:
- `GET /api/v1/tenders` — Public tenders accepting submissions.
- `POST /api/v1/bids/upload` — Multipart document dossier upload.
- `POST http://localhost:8000/documents/extract` — Microservice document parsing & OCR.
- `GET /api/v1/sellers/{id}` — Vendor's own verified registration status.

---

### 2.3 Compliance Reviewer Dashboard
* **Route:** `/` & `/reviews` (when authenticated as `COMPLIANCE_REVIEWER`)
* **Primary Mission:** Human-in-the-loop governance where subject matter experts review automated findings, resolve contradictions, and record auditable overrides.

#### Key Features & Modules:
1. **Pending Verification Queue (`/reviews`):**
   - Automatically filters all requirements flagged as `NON_COMPLIANT`, `PARTIALLY_COMPLIANT`, or `UNVERIFIED`.
   - Displays requirement text, bidder name, and automated extraction reasoning.
2. **One-Click Evidence Inspection:**
   - Direct link (`/compliance?tenderId=...&bidId=...`) opening the exact requirement evidence drawer.
3. **Audited Decision Overrides:**
   - Reviewers can update requirement status (e.g., mark as `COMPLIANT` if acceptable clarification was provided).
   - **Mandatory Justification:** Requires written officer remarks stored permanently in the audit trail.
4. **Seller Verification Queue (`/sellers`):**
   - Inspect high-risk sellers, debarment flags, and trust scores.

#### Endpoints & APIs Used:
- `GET /api/v1/compliance/results/{bidId}` — Evaluation findings.
- `POST /api/v1/compliance/override` — Persists human override with mandatory justification.
- `GET /api/v1/sellers` — Sellers list with risk metrics.
- `POST /api/v1/sellers/{id}/verify` — Seller qualification/verification.

---

### 2.4 Auditor & Vigilance Dashboard
* **Route:** `/` & `/audit` (when authenticated as `AUDITOR`)
* **Primary Mission:** Independent, tamper-evident oversight of public funds expenditure without the ability to modify or tamper with evaluations.

#### Key Features & Modules:
1. **Audit Oversight KPIs:**
   - **Anchored Audit Events:** Number of immutable records secured on the blockchain.
   - **Active Tenders Monitored:** 100% audit coverage indicator.
   - **Human Overrides Recorded:** Quick count of officer interventions requiring scrutiny.
   - **Blacklist Verifications:** 100% automated enforcement metric.
2. **Immutable Blockchain Audit Trail (`/audit`):**
   - Chronological ledger of all actions: `TENDER_CREATED`, `BID_SUBMITTED`, `COMPLIANCE_RESULT`, `HUMAN_OVERRIDE`, and `DEBARMENT_CHECK`.
   - Direct inspection of Ethereum transaction hashes, block numbers, and `keccak256` digest roots.
3. **Verification Modal & Cryptographic Proof:**
   - Interactive badge allowing auditors to copy tx hashes and verify against Hardhat/Sepolia node RPC.
4. **Official GeM Evaluation Reports (`/reports`):**
   - Print-ready and CSV exportable audit reports containing signed evaluation outcomes.

#### Endpoints & APIs Used:
- `GET /api/v1/audit/logs` — Database event log feed.
- `GET /api/v1/audit/blockchain/verify/{id}` — On-chain smart contract cryptographic verification.
- `GET /api/v1/tenders/{id}` — Full tender specifications.

---

### 2.5 System Administrator Suite
* **Route:** `/` (when authenticated as `SYSTEM_ADMIN`)
* **Primary Mission:** Comprehensive operations, microservice pipeline monitoring, and system configuration.

#### Key Features & Modules:
1. **Full Platform Navigation:**
   - Access to all functional screens: Tenders, Compliance Matrix, Multi-Bidder Compare, Procurement Copilot, Seller Risk, Human Review Queue, Reports, Analytics, Blockchain Trail, and Vendor Ingestion Test.
2. **System Analytics & Accuracy Engine (`/analytics`):**
   - Breakdown of Deterministic Rule Engine executions vs. Neural & Semantic Retrieval evaluations.
   - Average confidence metrics across all evaluated bidders.
   - Category-wise compliance distributions (Technical, Financial, Experience, Certifications).
3. **Vendor Ingestion Testing (`/bids/upload`):**
   - Test harness for validating PDF dossier parsing, OCR, and table extraction.

#### Endpoints & APIs Used:
- All `/api/v1/*` endpoints across backend and AI microservice.

---

## 3. Architecture & Service Ports

| Service Name | Technology Stack | Active Port | Health Endpoint |
| :--- | :--- | :--- | :--- |
| **Frontend Portal** | React 18, Vite, TypeScript, Tailwind CSS | `http://localhost:3000` | `/` |
| **Backend REST Core** | Spring Boot 3, Java 21, Flyway, H2 / PostgreSQL | `http://localhost:8080` | `/actuator/health` |
| **AI Evaluation Microservice** | FastAPI, Python 3.12, PyPDF, Unit Normalizer | `http://localhost:8000` | `/health` |
| **Procurement Domain AI** | Ollama LLM Service (`gem-copilot` / `qwen2.5:3b`) | `http://localhost:11434`| `/api/version` |
| **Blockchain EVM Ledger** | Solidity 0.8.19, Hardhat EVM Node | `http://localhost:8545` | JSON-RPC `eth_blockNumber` |

---

## 4. Summary of Verification Safeguards

1. **Deterministic Rule Supremacy:** All quantitative parameters (turnover amounts, pumping capacity LPM, warranty periods, experience contract counts) are evaluated deterministically using unit-normalized math, preventing LLM calculation drift.
2. **Zero-Hallucination Copilot:** Answers to officer questions cite only extracted document snippets with verified file names and page indices.
3. **Cryptographic Immutability:** Sensitive events are hashed with `keccak256` and anchored on-chain via `ComplianceAuditLedger.sol`.
