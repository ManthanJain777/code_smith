# Government e-Marketplace (GeM) AI Compliance Platform
## Service Registry & Network Web Addresses

This document records the exact web addresses, ports, environments, and deployment endpoints for all architectural services of the SIH26100 platform.

---

### 1. Frontend Web Service
*Modern React 18 + Vite + Tailwind CSS Government Procurement Interface*

| Environment | Web Address | Status | Notes |
|---|---|---|---|
| **Local Development** | `http://localhost:3000` | **ONLINE** | Live Vite dev server with HMR |
| **Local Production Build** | `http://localhost:4173` | **READY** | Tested via `npm run preview` |
| **Vercel Production** | `https://code-smith-frontend.vercel.app` | **ONLINE & LIVE** | Deployed on Vercel Edge CDN |
| **GitHub Repository** | `https://github.com/ManthanJain777/code_smith` | **SYNCED & LIVE** | Branch: `main` |

---

### 2. Backend Web Service
*Enterprise Spring Boot 3 / Java 17 REST API & Security Engine*

| Environment | Web Address | Status | Notes |
|---|---|---|---|
| **Local Development** | `http://localhost:8080/api/v1` | **ONLINE** | Port 8080, H2 JPA Database, Flyway Migrations |
| **Render Cloud Production** | `https://code-smith-iy3z.onrender.com/api/v1` | **DEPLOYED & LIVE** | Web Service on Render Cloud |
| **Render Health Probe** | `https://code-smith-iy3z.onrender.com/api/v1/health` | **ONLINE** | Health endpoint & system metrics |
| **Docker Container** | `http://localhost:8080` | **CONFIGURED** | Built via `docker-compose.yml` service `backend` |

---

### 3. AI Service (LLM, NLP & Document Extraction)
*FastAPI Python 3.10 Engine with Ollama / Mistral / DeepSeek RAG Pipeline*

| Environment | Web Address | Status | Notes |
|---|---|---|---|
| **Local Development** | `http://localhost:8000` | **ONLINE** | Port 8000, Uvicorn ASGI runtime |
| **API Documentation** | `http://localhost:8000/docs` | **ONLINE** | Swagger / OpenAPI UI |
| **Cloud Hosting** | *Deferred / Local-First for now* | **DEFERRED** | Preserved locally as per user instruction |

---

### 4. Blockchain Ledger Service
*Ethereum Virtual Machine (EVM) Prototype Audit Anchor (Hardhat Local Node)*

| Environment | Web Address | Status | Notes |
|---|---|---|---|
| **Local Hardhat EVM** | `http://localhost:8545` | **ONLINE** | Chain ID: `31337` (EVM Prototype) |
| **Smart Contract** | `ComplianceAuditLedger.sol` | **DEPLOYED** | Address: `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| **Testnet Target** | Polygon Amoy / Sepolia | **CONFIGURED** | Remote RPC configured in `hardhat.config.js` (Production Roadmap) |

---

### 5. Summary Matrix for Immediate Access

```text
┌─────────────────────────┬─────────────────────────────────────┬────────────────────────────────────┐
│ Service Component       │ Local Endpoint                      │ Production / Cloud Endpoint        │
├─────────────────────────┼─────────────────────────────────────┼────────────────────────────────────┤
│ GeM Frontend Portal     │ http://localhost:3000               │ Vercel Deployment                  │
│ Spring Boot Backend     │ http://localhost:8080/api/v1        │ /api/v1 (Vercel Serverless Bridge) │
│ AI Engine               │ http://localhost:8000               │ Deferred (Local-first)             │
│ Blockchain EVM Node     │ http://localhost:8545 (Chain 31337) │ Consortium RPC / Polygon Amoy      │
└─────────────────────────┴─────────────────────────────────────┴────────────────────────────────────┘
```
