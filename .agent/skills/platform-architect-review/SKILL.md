---
name: platform-architect-review
description: >-
  Comprehensive architectural review, audit, and implementation guide for the top 3
  open-source backend & PaaS platforms: Coolify, Supabase, and Directus. Use when
  reviewing software projects, designing multi-project architectures, auto-generating
  REST/GraphQL endpoints from databases, and establishing 360-degree observability.
---

# 🏛️ Platform Architect Review Skill: Coolify, Supabase & Directus

This skill equips the AI agent with deep architectural knowledge and verification procedures to inspect, evaluate, recommend, and configure the top 3 modern open-source platforms for:
1. **Multi-Project & Multi-Tenancy Management**
2. **Automated Database Provisioning & Schema Design**
3. **Instant API Endpoint Generation (REST / GraphQL / OpenAPI)**
4. **360-Degree Observability, Metrics & Multi-Channel Alerting**

---

## 🎯 When to Activate This Skill
- The user asks to review, audit, or architect a backend system for managing multiple projects with isolated databases.
- The user needs automated REST or GraphQL endpoints directly from a database without writing boilerplate CRUD code.
- The user requires real-time 360° server/container monitoring, live logs, and automated alerts (Telegram, Discord, Slack).
- The user is choosing between **Coolify**, **Supabase**, and **Directus**, or wants to combine them into an enterprise self-hosted stack.

---

## 🔍 Core Platform Comparison & Decision Matrix

| Dimension | Coolify (coollabsio/coolify) | Supabase (supabase/supabase) | Directus (directus/directus) |
| :--- | :--- | :--- | :--- |
| **Primary Role** | Self-Hosted PaaS / Cloud Manager | Backend-as-a-Service (BaaS) | Open Data Platform / Headless Studio |
| **License** | **Apache 2.0 (100% Free)** | **Apache 2.0 (100% Free)** | BSL 1.1 (Free for revenue <$5M) |
| **Database Engines** | Multi-DB (Postgres, MySQL, Mongo, Redis, etc.) | PostgreSQL strictly (+ pgvector) | Any SQL (Postgres, MySQL, SQLite, MSSQL, Oracle) |
| **Auto-API Generation**| Via deployed containers (PostgREST/Hasura)| PostgREST (`/rest/v1`) + GraphQL | Native REST + GraphQL simultaneously |
| **Monitoring Level** | **Host & Container 360°** (CPU, RAM, Disk, Health)| **Database Internals** (Logflare, Prometheus)| **Data Audit Trails** (Revisions, Insights) |
| **Alert Channels** | Telegram, Discord, Slack, Pushover, Email | Email, Webhooks, Sentry integrations | Webhooks, Slack, Discord via visual Flows |
| **Admin UI Quality** | Modern DevOps Dashboard (Vue/Tailwind) | Technical Developer Studio (SQL Editor) | No-Code Data Studio (Vue.js, Dashboards) |
| **Real-Time Support**| Control plane logs via WebSockets | Phoenix Channels (CDC, Presence, Broadcast)| JSON WebSockets & GraphQL Subscriptions |
| **Best Used For** | Server & Project Orchestration + Monitoring | Postgres-first APIs, Auth, Realtime, AI | Existing SQL databases, Dashboards, No-Code |

---

## 📋 Comprehensive Feature Checklist for Each Platform

### 1. Coolify (coollabsio/coolify)
- **Multi-Tenancy & Project Hierarchy**:
  - Organizes infrastructure into Teams -> Projects -> Environments (Production, Staging, Dev) -> Resources.
  - Supports managing multiple remote Bare-Metal or VPS servers from a single dashboard.
- **Database Provisioning**:
  - One-click deployment of PostgreSQL, MySQL, MariaDB, MongoDB, Redis, ClickHouse, Dragonfly.
  - Automated isolated Docker bridge networks per project.
  - Automated cron-based database dumps with direct streaming to S3/Cloudflare R2/MinIO.
- **Reverse Proxy & SSL**:
  - Native integration with Traefik v3.
  - Automatic Let's Encrypt SSL certificates (HTTP-01 & DNS-01 wildcard certificates).
  - Automatic zero-downtime rolling container deployments.
- **Observability & Health**:
  - Lightweight Rust `Sentinel` background daemon tracking system vitals.
  - Real-time terminal log streaming via WebSockets.
  - Automated health check probes with automatic container restarts on failure.
  - Multi-channel instant notifications: **Telegram (with Topics support)**, Discord, Slack, Pushover, Email, Webhooks.
- **Deployments & Git**:
  - Native Git push integration (GitHub App, GitLab, Bitbucket, Gitea).
  - Pull Request preview environments (ephemeral preview URLs).
  - Docker Compose, Dockerfile, Nixpacks buildpacks.

### 2. Supabase (supabase/supabase)
- **Database Core**:
  - Unconstrained PostgreSQL (v15/v16/v17) with full SQL power, triggers, and stored procedures.
  - Pre-installed enterprise extensions: `pgvector`, `postgis`, `pg_cron`, `pg_net`, `vault`, `pgaudit`.
- **Auto API Engine (PostgREST)**:
  - Compiles incoming HTTP requests directly into single parameterized SQL statements.
  - Full CRUD operations with rich operators (`eq`, `neq`, `gt`, `like`, `fts`).
  - Deep relational resource embedding (`GET /users?select=name,posts(title,comments(content))`).
  - Stored procedures exposed as RPC endpoints (`/rest/v1/rpc/function_name`).
  - Dynamic OpenAPI 3.0 (Swagger) specification generated from database catalogs.
- **Security & Authorization**:
  - Row-Level Security (RLS) evaluated directly inside the PostgreSQL kernel.
  - Supabase Auth (GoTrue): JWT tokens, Passkeys/WebAuthn, OAuth2 (20+ providers), SAML 2.0 SSO.
- **Real-Time Engine**:
  - Built on Elixir/BEAM for massive concurrent connection scaling.
  - Database Change Data Capture (CDC) streaming WAL changes to clients.
  - CRDT-based Presence tracking and ephemeral non-persisted Broadcast.
- **Observability & Analytics**:
  - Studio Log Explorer powered by Logflare with SQL querying over unified logs.
  - Prometheus Metrics API exposing ~200 system and query metrics.
  - Automated Query Performance Advisors and Index recommendations.
- **Storage & Functions**:
  - S3-compatible object storage with image transformation CDN.
  - Edge Functions running TypeScript/Deno with sub-50ms cold starts.
  - Native Model Context Protocol (MCP) server for AI coding agents.

### 3. Directus (directus/directus)
- **Non-Intrusive Architecture**:
  - Pure database abstraction layer; leaves existing SQL schemas 100% clean with zero proprietary database tables.
  - Supports PostgreSQL, MySQL, MariaDB, SQLite, MS SQL Server, Oracle, CockroachDB.
- **Auto API Generation (Dual REST + GraphQL)**:
  - Generates comprehensive REST and GraphQL APIs simultaneously.
  - Industry-leading REST query dialect: nested logical filtering, deep relational population, aggregations (`aggregate[count]=*`), and grouping (`groupBy[]=status`).
  - Dynamic OpenAPI 3.0 specification tailored in real-time to the permissions of the calling user/token.
- **The Data Studio (Admin UI)**:
  - Responsive Vue.js single-page application.
  - Rich views: Table, Kanban, Calendar, Card gallery, Maps, Relational drawers.
  - Insights Dashboards: Built-in drag-and-drop analytics dashboard with Bar Charts, Line Charts, and Metric Counters.
- **Audit Trails & Governance**:
  - Field-level mutation history recorded in `directus_activity` and `directus_revisions`.
  - Instant one-click rollback of any database modification.
- **Automations & Custom Logic (Flows)**:
  - Visual no-code automation builder triggered by database mutations, cron schedules, webhooks, or manual buttons.
  - Sandboxed JavaScript/TypeScript execution for custom data transformations.
- **Granular Permissions & Auth**:
  - Role-based and attribute-based access control (RBAC/ABAC) down to individual fields.
  - Conditional row rules evaluated against `$CURRENT_USER` context.
  - SSO integration (SAML, OAuth2, OpenID Connect, LDAP).

---

## 🛠️ Step-by-Step AI Review & Architecture Procedure

When instructed to review, audit, or design a system using these platforms, follow this 6-step checklist:

### Step 1: Analyze Project Isolation & Multi-Tenancy
- Determine whether tenants require **Physical Isolation** (dedicated database/container per tenant) or **Logical Isolation** (shared database with tenant ID columns).
- *Rule of thumb*:
  - If strict legal compliance (HIPAA, SOC2) or high data residency is required: Recommend **Coolify** to orchestrate independent database containers per tenant.
  - If cost-efficiency and high tenant density are required: Recommend **Supabase** with kernel-level Row-Level Security (RLS) or **Directus** with role filtering.

### Step 2: Verify Database Engine Compatibility
- Inspect the data model:
  - If PostgreSQL with Vector AI search or spatial data: **Supabase**.
  - If existing legacy MySQL / MS SQL / multi-engine databases: **Directus**.
  - If diverse mixed microservices (Postgres + Redis + Mongo): **Coolify**.

### Step 3: Validate Auto-API & Query Requirements
- Verify if the client frontend requires deep nested joins or aggregations:
  - For complex aggregations, grouping, and non-dev backoffices: **Directus REST API**.
  - For maximum throughput, zero ORM latency, and stored procedure RPCs: **Supabase PostgREST**.

### Step 4: Audit Observability & Alerting Architecture
- Check the monitoring requirements:
  - Ensure host vitals (CPU, Memory, Disk) and container crashes trigger alerts to **Telegram** or **Discord** via **Coolify**.
  - Ensure slow database queries and API response times are tracked via **Prometheus** and **Logflare** (Supabase) or **OpenTelemetry**.
  - Ensure regulatory audit trails (who modified which record) are captured via **Directus Revisions**.

### Step 5: Enforce Security Boundaries
- Never expose raw database ports to the public internet; bind databases to `127.0.0.1` or internal Docker networks.
- Enforce HTTPS termination via **Traefik** with automated Let's Encrypt renewal.
- Always activate Row Level Security (`ALTER TABLE x ENABLE ROW LEVEL SECURITY;`) on Supabase tables exposed to public clients.

### Step 6: Formulate the Recommended Architecture Blueprint
- For enterprise teams (10+ developers), recommend the **Hybrid Architecture**:
  > **Host Layer**: Bare-metal / VPS managed by **Coolify**.  
  > **Control & Alerting Plane**: Coolify Rust Sentinel + Telegram / Discord Webhooks.  
  > **Network Plane**: Traefik Reverse Proxy with automated SSL.  
  > **Data & API Plane**: Supabase (PostgREST) or Directus provisioned per project.

---

## 🚀 One-Click Deployment Reference Commands

### Deploying Coolify (Base Control Plane)
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### Running Directus Connected to PostgreSQL
```bash
docker run -d \
  --name directus \
  -p 8055:8055 \
  -e KEY="2292f254-20d0-40e8-8b94-279545ca87ff" \
  -e SECRET="7c9927cf-4545-42a9-a68b-59d08e5033c5" \
  -e ADMIN_EMAIL="admin@example.com" \
  -e ADMIN_PASSWORD="SecurePassword123!" \
  -e DB_CLIENT="pg" \
  -e DB_CONNECTION_STRING="postgresql://postgres:password@postgres-host:5432/myproject" \
  directus/directus:latest
```

### Running Supabase Locally / Self-Hosted
```bash
# Clone the official self-hosted template
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
docker compose up -d
```
