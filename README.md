# BrandGuard AI – Intelligent Brand Governance Platform
> Built for the **Inkloom AI** Problem Statement: *Autonomous Brand Integrity & AI Content Governance*

---

## 🚀 Live Cloud Deployment & Mobile Access

### 1-Click Free Cloud Deployment (Render.com)
Deploy BrandGuard AI online in 60 seconds with a permanent public HTTPS URL accessible on any mobile phone, tablet, or PC worldwide:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/nagaraj1244/BrandGuard-AI)

**Easy Steps:**
1. Click the **Deploy to Render** button above (or sign in to [render.com](https://render.com) with GitHub).
2. Connect the repository: `nagaraj1244/BrandGuard-AI`.
3. Click **"Deploy Web Service"**.
4. In under 2 minutes, Render gives you a permanent live public URL (e.g. `https://brandguard-ai.onrender.com`) that opens on any smartphone or computer with one click!

---

### Instant Mobile Connect from your PC
In your `BrandGuard-AI` folder, double-click:
📁 **`open-on-mobile.bat`**

It automatically generates a secure public HTTPS link that you can open on any mobile device (iPhone/Android) or share with anyone.

---

## 🛡️ Overview

**BrandGuard AI** is an enterprise brand governance and AI compliance platform designed to prevent identity drift, eliminate repetitive AI clichés, catch unverified claims, enforce mandatory disclaimers, and audit visual brand identity across multi-channel generative workflows.

---

## 👥 Three Core Roles & Access Permissions (RBAC)

1. **Admin**:
   - **User Management**: List all users, change user roles, remove accounts.
   - **Brand Guidelines Management**: Configure tone, approved color hex codes, font rules, logo usage rules, banned terms, and mandatory disclaimers.
   - **Company Settings**: Update company governance policies and automated AI gating criteria.
   - **Full Access**: Review queue, analytics, content history.

2. **Creator**:
   - **Content Studio & AI Scan**: Draft multi-channel marketing copy and graphics.
   - **Real-Time Violation Alerts**: Instant multi-factor checks (forbidden terminology, missing disclaimers, hyperbolic claims).
   - **AI Auto-Fix Suggestions**: Side-by-side diff view and 1-click apply.
   - **Content Tracking**: Submit assets to the review queue and track approval progress in Content History.

3. **Reviewer**:
   - **Review & Approval Queue**: Audit submitted content and inspect AI compliance scorecards.
   - **Decision Making**: Approve, reject, or request changes with contextual reviewer comments.
   - **Visual Asset Inspection**: Verify color palette adherence and WCAG AA/AAA contrast ratios.

---

## 🔐 Authentication & Security Architecture

- **Password Hashing**: Cryptographically secure `scrypt` hashing with unique 16-byte random salts per user (`crypto.scryptSync` + `crypto.randomBytes`). Zero plaintext passwords.
- **Timing-Safe Verification**: Passwords checked via `crypto.timingSafeEqual` to prevent timing attacks.
- **Standard RFC 7519 JWT**: HMAC-SHA256 tokens (`alg: "HS256"`) containing user id, email, role, and expiration timestamps.
- **Protected Endpoints**: Verified Bearer token middleware (`Authorization: Bearer <token>`) guarding content submission, guidelines editing, reviewer decisions, and user management.
- **Forgot/Reset Password Flow**: 32-byte cryptographic reset tokens with 1-hour expiration.
- **Persistent Database**: Stored in `server/src/data/database.json`.

---

## 🔑 Pre-Seeded Accounts for Immediate Testing

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@brandguard.ai` | `BrandGuard@2026` | Full system control, User Management, Guidelines, Settings, Analytics |
| **Creator** | `creator@brandguard.ai` | `BrandGuard@2026` | Content Studio, Real-Time AI Scan, Apply AI Rewrites, Submissions |
| **Reviewer** | `reviewer@brandguard.ai` | `BrandGuard@2026` | Review Queue, Decision Actions (Approve/Reject), Feedback Comments |

*(You can also register any new account with your own custom name, email, password, and role via the Sign Up form!)*

---

## 🧩 11 Main Modules

| Module | Purpose & Scope |
| :--- | :--- |
| **1. Authentication** | Role-based identity & instant role switcher (Admin, Creator, Reviewer) |
| **2. Dashboard** | Real-time compliance surveillance, adherence rate KPIs, backlog queues |
| **3. Brand Guidelines Management** | Machine-readable guidelines (Inkloom voice, colors, typography, disclaimers) |
| **4. Content Submission** | Multi-channel content studio for text and visual asset submissions |
| **5. AI Content Analysis** | Automated scoring of tone, sentiment, reading level, and style match |
| **6. Brand Violation Detection** | Multi-severity issue detection (Critical, High, Medium, Low) |
| **7. AI Suggestions** | Smart auto-fix recommendations and diff generation |
| **8. Visual Brand Checker** | Dominant color extraction, palette matching, and WCAG contrast check |
| **9. Review and Approval Workflow** | Stage-gated lifecycle: Draft → Scanned → Review Queue → Decision |
| **10. Analytics and Reports** | Aggregated compliance rates, violation category breakdowns, time saved |
| **11. Content History** | Complete audit trail of submissions, scans, and review decisions |

---

## 📂 Project Structure

```text
BrandGuard A/
├── package.json                 # Root script runner
├── README.md                    # Platform documentation
├── client/                      # Frontend Application (React + Vite + Tailwind CSS)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/
│   │   └── shield.svg
│   └── src/
│       ├── main.jsx             # React DOM entry
│       ├── App.jsx              # Main application shell & role switcher
│       └── index.css            # Tailwind directives & typography
└── server/                      # Backend Engine (Node.js REST API)
    ├── package.json
    ├── test/
    │   └── test-engine.js       # Core engine verification test
    └── src/
        ├── index.js             # Dual-mode launcher (Express / Native HTTP)
        ├── serverNative.js      # Zero-dependency standalone HTTP engine
        ├── serverExpress.js     # Express server implementation
        ├── data/
        │   └── db.js            # In-memory brand constitution & pre-seeded store
        ├── services/
        │   └── aiAnalysisEngine.js # AI violation detection & suggestion engine
        └── routes/
            ├── authRoutes.js        # Authentication & RBAC
            ├── guidelinesRoutes.js  # Brand guidelines management
            ├── contentRoutes.js     # Content submissions & history
            ├── analysisRoutes.js    # AI content & visual analysis
            ├── reviewRoutes.js      # Review queue & workflow decisions
            └── analyticsRoutes.js   # Metrics & reporting
```

---

## 🚀 Quick Start Guide

### 1. Test the AI Analysis Engine
You can verify the backend rule and analysis engine immediately with zero dependencies:
```bash
node server/test/test-engine.js
```

### 2. Start the Backend Server
```bash
node server/src/index.js
```
The server will run on `http://127.0.0.1:5000`.

### 3. Start the Frontend
In another terminal:
```bash
cd client
npm install
npm run dev
```
The Vite development server will start on `http://localhost:5173`.

