# 🌿 SchemaShift — Isolated SQL Sandbox & Terrarium

> Safely test DDL migrations, heavy JOINs, and unindexed SQL queries inside disposable, isolated PostgreSQL containers before touching production data.

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-6B8F71?style=flat-square&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v4.18-22301F?style=flat-square&logo=express)](https://expressjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-v14.2-6B8F71?style=flat-square&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16.0-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-v5.10-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![License](https://img.shields.io/badge/License-MIT-6B8F71?style=flat-square)](LICENSE)

---

## 🚀 Overview

**SchemaShift** provides an isolated, disposable sandbox (the **Terrarium**) that provisions PostgreSQL database containers on demand to measure performance benchmarks, lock risks, and production blast radius before SQL migration scripts hit live databases.

### 🔑 Key Features

* 🧪 **Disposable PostgreSQL Containers (`Dockerode`)**: Spawns isolated `postgres:16-alpine` containers with strict 512MB RAM caps. Containers are automatically wiped and destroyed after execution.
* ⚡ **Dual Container Side-by-Side Benchmark**: Runs two isolated containers concurrently to compare execution speedup multipliers (`⚡ 4.2x Faster`), plan cost drop, and table lock reductions.
* 🗄️ **Synthetic Schema & Data Explorer**: Live drawer showing synthetic tables (`users`, `orders`, `order_items`, `audit_logs`), column data types, indexes, and synthetic sample data rows powered by `@faker-js/faker`.
* 🛡️ **Blast Radius & Danger Scoring**: Computes a 0–100 danger score and plain-English impact statement based on `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` query plans and lock detection.
* 🤖 **AI Query Optimizer**: Suggests optimized SQL rewrites (e.g., adding `CONCURRENTLY` to `CREATE INDEX`, replacing `SELECT *` with column projections) using local Ollama or a rule-based TypeScript engine.
* 🔒 **SHA-256 Result Hash Verifier**: Verifies functional equivalence between original and AI-rewritten queries to ensure identical outputs.
* ↩️ **Automatic Rollback Generator**: Produces safe DOWN scripts for schema alterations.
* 📑 **PR Migration Safety Certificate Exporter**: One-click export of GitHub/GitLab-ready Markdown safety reports and JSON certificates.
* ⚙️ **GitHub Actions CI/CD Generator**: Downloadable `.github/workflows/schemashift-ci.yml` pipeline files to automate PR checks.
* 📊 **Migration Audit & Trends**: Tracks historical test runs and visualizes danger score trends over time via Recharts.

---

## 🛠️ Architecture & Tech Stack

```
SchemaShift/
├── start.js                   # Unified starter script for backend & frontend
├── backend/                   # Node.js + Express + Prisma + Dockerode
│   ├── src/
│   │   ├── sandbox/
│   │   │   ├── dockerodeEngine.ts    # Docker container lifecycle & fallback sandbox
│   │   │   ├── syntheticSeeder.ts    # Faker synthetic schema & data seeder
│   │   │   └── explainAnalyzer.ts    # PostgreSQL EXPLAIN parser & danger scorer
│   │   ├── services/
│   │   │   ├── aiOptimizerService.ts # Ollama & TypeScript heuristic rules
│   │   │   ├── correctnessVerifierService.ts # SHA-256 result hash verifier
│   │   │   ├── rollbackGeneratorService.ts   # Safe DOWN script generator
│   │   │   └── sandboxService.ts     # Orchestrator & Prisma DB logging
│   │   ├── routes/                   # Auth, Sandbox, & History Express routes
│   │   └── server.ts                 # Express Server entrypoint (Port 8000)
│   └── prisma/
│       └── schema.prisma             # System database schema for history & audits
└── frontend/                  # Next.js 14 App Router + Tailwind + Monaco Editor
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx               # Main Terrarium Sandbox Dashboard
    │   │   └── history/page.tsx       # Migration History & Trend Analytics
    │   └── components/
    │       ├── TerrariumJar.tsx       # Animated Glass Terrarium Visual Jar
    │       ├── SqlEditor.tsx          # Monaco SQL Editor with Preset Templates
    │       ├── ExplainPlanViewer.tsx  # Execution Plan Tree & Benchmarks
    │       ├── AiOptimizerCard.tsx    # AI Rewrite Suggestions & Diff Viewer
    │       ├── CompareView.tsx        # Side-by-Side Dual Container Benchmark
    │       ├── SchemaExplorerModal.tsx# Synthetic Schema & Sample Data Drawer
    │       ├── ReportExportModal.tsx  # PR Migration Safety Report Exporter
    │       ├── CiGeneratorModal.tsx   # GitHub Actions CI Workflow Generator
    │       ├── RollbackCard.tsx       # Migration Rollback Generator
    │       └── BlastRadiusBanner.tsx  # Plain-English Impact Banner
```

---

## 💻 Getting Started

### Prerequisites

* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Docker Desktop** *(Optional)*: Recommended for live PostgreSQL container provisioning.

### Quick Start

1. **Install Dependencies**:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

2. **Initialize Metadata Database**:
   ```bash
   cd backend
   npx prisma db push
   ```

3. **Launch SchemaShift**:
   Run from the project root:
   ```bash
   npm start
   ```

   This launches:
   - **Backend API**: `http://localhost:8000`
   - **Frontend App**: `http://localhost:3000`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/sandbox/test` | Provisions container, seeds dataset, executes migration, computes danger score, and generates AI rewrites |
| `POST` | `/api/sandbox/compare` | Runs side-by-side benchmark test in two isolated containers |
| `GET` | `/api/sandbox/schema` | Returns synthetic schema tables, column types, and sample data rows |
| `GET` | `/api/history` | Retrieves recent migration test runs for audit logs |
| `GET` | `/api/history/trends` | Returns danger score trends over time for visualization charts |

---

## 🧪 Preset Migration Scenarios

Try these built-in test templates in the SQL Editor:

1. **Unindexed Slow Query**: `SELECT * FROM orders WHERE total_amount > 150.00 AND status = 'completed';`
2. **Exclusive Table Lock**: `ALTER TABLE users ADD COLUMN bio TEXT DEFAULT 'Software Engineer';`
3. **Unindexed JOIN Scan**: `SELECT u.email, u.full_name, o.order_number FROM users u JOIN orders o ON u.id = o.user_id;`
4. **Safe Migration**: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);`

---

## 📜 License

Licensed under the MIT License.
