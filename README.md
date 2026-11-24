# 🛡️ ProjectOS Platform

> **Next-Generation Cloud Platform for Multi-Project Management, Auto-Generated REST APIs, 360° Observability & Granular RBAC.**  
> *منصة سحابية متطورة لإدارة المشاريع المتعددة، توليد الـ APIs التلقائية، الرقابة الشاملة 360°، ونظام الصلاحيات الدقيق.*

---

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌐 Languages / اللغات
- 🇸🇦 **العربية (RTL كامل 100%)**
- 🇺🇸 **English (Full LTR support)**
- *Instant zero-reload language toggle with dedicated typography and layouts.*

---

## ✨ Key Features / أهم المميزات

### 1. 🗄️ Multi-Project & Database Management
- Create and organize isolated workspace projects (e.g. Analytics, E-Commerce, Microservices).
- Multi-database engine compatibility (**PostgreSQL**, **MySQL**, and zero-setup **SQLite**).
- Dynamic Schema Designer: create tables, define fields, types (`string`, `number`, `boolean`, `json`, `datetime`), and validation rules dynamically.

### 2. ⚡ Auto-Generated Instant REST APIs
- Automatically generates full CRUD REST endpoints for every table you create:
  - `GET /api/v1/projects/:projectId/:tableName`
  - `POST /api/v1/projects/:projectId/:tableName`
  - `DELETE /api/v1/projects/:projectId/:tableName?id=:id`
- Interactive Data Grid with real-time row insertion, schema inspection, and one-click endpoint copy.
- Built-in Swagger/OpenAPI interactive documentation modal (`/api/v1/docs`).

### 3. 🚀 Direct SQL Engine (~3ms Speed)
- PostgREST-inspired raw SQL execution engine directly in the browser.
- Sub-5ms query execution with JSON formatting and duration metrics.

### 4. 📈 360° Observability & Telemetry Center
- Real-time hardware vitals monitoring: CPU utilization, RAM usage, storage metrics, and server uptime.
- API traffic metrics: Total requests, Average Latency, and Error rates (4xx / 5xx breakdown).
- Live Terminal Logs Viewer (`/api/v1/monitoring/logs`) with real-time audit trail and search filters.

### 5. 🔔 Multi-Channel Alert Dispatcher
- Real-time event notifications sent directly to:
  - **Telegram Bot** (`Chat ID` + `Bot Token`)
  - **Discord Webhook** channel
- Configurable CPU threshold triggers and instant "Test Alert" verification.

### 6. 🔐 Enterprise Authentication & Granular RBAC / ABAC
- Secure password hashing using native Node.js `crypto.scrypt` with 16-byte random salt and timing-safe equality checks.
- 3 Authentication methods supported:
  1. **HTTP-Only Session Cookies** (`projectos_session`)
  2. **Bearer Tokens** (`Authorization: Bearer <token>`)
  3. **Private API Keys** (`x-api-key: pos_...`)
- 4 Core Roles: `SUPER_ADMIN`, `ADMIN`, `DEVELOPER`, `VIEWER`.
- 9 Granular Permissions governing every single platform action:
  - `manage_users`, `create_project`, `delete_project`, `manage_schema`, `write_records`, `delete_records`, `execute_sql`, `manage_alerts`, `view_monitoring`.
- Per-user Custom JSON permission overrides (ABAC) editable directly from the UI.

---

## 🔑 Default Seeded Accounts / الحسابات الافتراضية

| Role / الدور | Email / البريد | Password / كلمة المرور | Default Permissions / الصلاحيات |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@projectos.io` | `SuperAdmin123!` | Full unrestricted access to all features |
| **Developer** | `dev@projectos.io` | `DevPassword123!` | Create projects, manage schema, write data, run SQL |
| **Viewer** | `viewer@projectos.io` | `ViewerPassword123!` | Read-only access to projects & monitoring |

---

## 🚀 Quickstart / البدء السريع

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm or yarn

### Installation & Setup

```bash
# 1. Clone repository
git clone https://github.com/Esmail514/projectos-platform.git
cd projectos-platform

# 2. Install dependencies
npm install

# 3. Initialize Database & Generate Prisma Client
npx prisma generate
npx prisma db push

# 4. Seed Default Users & Initial Projects
node seed-users.js

# 5. Start Development Server
npm run dev
# or for Production Build:
npm run build && npm start
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🧪 Automated Verification Suite

Run the full end-to-end security and RBAC test suite (20 automated assertions):
```bash
node test-auth-rbac.js
```

---

## 📁 Project Architecture

```text
├── .agent/skills/         # Architectural review skills (Coolify, Supabase, Directus)
├── prisma/
│   ├── schema.prisma      # Prisma schema (User, Session, Project, TableSchema, AlertSetting, AuditLog)
│   └── seed.js            # Initial project and table seeder
├── src/
│   ├── app/
│   │   ├── api/v1/        # REST API endpoints (auth, projects, tables, sql, monitoring, users)
│   │   ├── layout.tsx     # Root layout with dark slate theme
│   │   └── page.tsx       # Root entry point
│   ├── components/        # Cyber-enterprise UI components (Navbar, Sidebar, DataGrid, RBAC, etc.)
│   ├── lib/
│   │   ├── auth.ts        # Scrypt hashing, timing-safe checks, API keys, RBAC evaluator
│   │   ├── db.ts          # Singleton PrismaClient instance
│   │   └── i18n.ts        # Comprehensive Arabic & English translations
│   └── types/             # TypeScript definitions & permission interfaces
├── seed-users.js          # User database seeder
├── test-auth-rbac.js      # E2E automated test suite
└── next.config.ts         # Next.js 15 configuration
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
