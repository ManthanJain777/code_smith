# Hosting Guide: Deploying GeM Compliance Platform on Vercel

This repository is pre-configured for **zero-config single-click deployment on Vercel**.

---

## Quick Start: 3-Step Vercel Deployment

### Step 1: Push code to GitHub
Make sure your latest changes are pushed to GitHub:
```bash
git push origin main
```
Repository: `https://github.com/ManthanJain777/code_smith.git`

---

### Step 2: Import Project on Vercel
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** > **"Project"**.
3. Select your repository: **`ManthanJain777/code_smith`**.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Leave as `./` (or select `frontend` — both work seamlessly!)
   - **Build Command**: `npm run vercel-build` (or `npm run build` if Root Directory is `frontend`)
   - **Output Directory**: `frontend/dist` (or `dist` if Root Directory is `frontend`)

---

### Step 3: Environment Variables (Optional)
In Vercel, expand **"Environment Variables"** and add:

| Key | Example Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api/v1` | URL of Spring Boot REST API |
| `VITE_AI_SERVICE_URL` | `https://your-ai-service.onrender.com` | URL of FastAPI AI Engine |
| `VITE_PROBE_LOCAL_NODES` | `false` | Disables local port probing in cloud |

> **Note on Standalone / Demo Mode**:
> If you haven't deployed the backend yet, **the frontend will still work smoothly out of the box**! The authentication layer includes built-in demo credentials for all 5 roles (Procurement Officer, Reviewer, Admin, Auditor, and Bidder) with full mock data and UI workflows.

Click **"Deploy"**. Within 1–2 minutes, your live production URL will be ready!

---

## What makes this repository Vercel-Ready?

1. **`vercel.json` in root**:
   Configured with `"buildCommand": "npm --prefix frontend run build"`, `"outputDirectory": "frontend/dist"`, and SPA rewrites (`"source": "/(.*)", "destination": "/index.html"`).
2. **`frontend/vercel.json`**:
   Ensures single-page app (SPA) routing works seamlessly without 404 errors on browser page reloads when using nested routes like `/reviews`, `/dashboard`, `/bids/submit`, etc.
3. **`package.json` Root Script**:
   Includes `"vercel-build": "npm --prefix frontend run build"`, which Vercel automatically detects and runs during deployment.
4. **Official Branding**:
   Pre-configured with `Emblem_of_India.svg` as both the header logo and browser tab favicon.

---

## Hosting Backend & AI Services (When Ready)

For full end-to-end cloud hosting of the entire monorepo:
- **Frontend**: Vercel (Fast Global Edge CDN)
- **Backend (Spring Boot Java 17)**: Render.com / Railway.app / Fly.io (Dockerized via `docker-compose.yml`)
- **AI Service (FastAPI Python)**: Render.com / Railway.app / Modal / HuggingFace Spaces
- **Blockchain**: Sepolia / Polygon Amoy testnet (or local Hardhat node)
