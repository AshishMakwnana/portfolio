# Developer Portfolio & Backend Systems Dashboard

Production-grade developer portfolio and content management system built with **Node.js**, **Express**, **SQLite (`better-sqlite3`)**, **React 19**, **TypeScript**, and **Tailwind CSS**.

---

## Table of Contents

1. [Architecture & File Directory Map](#architecture--file-directory-map)
2. [Database Architecture & 3NF Relational Schema](#database-architecture--3nf-relational-schema)
3. [Production Hosting Requirements & Specifications](#production-hosting-requirements--specifications)
4. [Environment Variables Reference](#environment-variables-reference)
5. [Production Build & Deployment Walkthrough](#production-build--deployment-walkthrough)
6. [Reverse Proxy (Nginx) & SSL Configuration](#reverse-proxy-nginx--ssl-configuration)
7. [Automated Verification & Testing](#automated-verification--testing)
8. [Local Development](#local-development)
9. [API Reference](#api-reference)

---

## Architecture & File Directory Map

The codebase is organized into cleanly decoupled layers separating data persistence, HTTP transport, business logic, presentation, and automated testing:

```
e:\startup-projects\portfolio/
├── data/                                 # Persistent SQLite storage & media
│   ├── portfolio.db                     # Embedded SQLite database (WAL mode)
│   └── uploads/                         # User-uploaded screenshots and resume documents
│
├── server/                               # Backend database & API service layer
│   ├── db.ts                            # SQLite connection provider, WAL mode & foreign keys
│   ├── schema.sql                       # 14-table 3NF relational schema DDL
│   ├── queries.ts                       # Typed prepared-statement SQL query service
│   ├── store.ts                         # Store adapter maintaining backward compatibility
│   ├── auth.ts                          # HMAC bearer token signing, verification & admin guards
│   └── rateLimiter.ts                   # Sliding-window in-memory IP rate limiter
│
├── scripts/                              # Database utility & operational scripts
│   └── migrate.ts                       # Transactional schema runner & seed data migration
│
├── src/                                  # Frontend client application (React 19 + TypeScript)
│   ├── App.tsx                          # Root client component, route state & navigation
│   ├── main.tsx                         # Client DOM mounting entrypoint
│   ├── index.css                        # Tailwind CSS v4 styling & dark theme variables
│   │
│   ├── components/
│   │   ├── admin/                       # Protected admin content management console
│   │   │   ├── AdminApp.tsx             # Admin shell, tab navigation & session state
│   │   │   ├── AdminLogin.tsx           # Admin authentication login modal
│   │   │   ├── AdminProfileSettings.tsx # Form for identity, headline & contact info
│   │   │   ├── AdminCatalogManagers.tsx # CRUD managers for skills, experience, education, certs
│   │   │   ├── AdminProjectsManager.tsx # Project case studies & screenshot uploads
│   │   │   ├── ConfirmDialog.tsx        # Reusable destructive action confirmation modal
│   │   │   └── adminApi.ts              # Authenticated fetch client sending Bearer tokens
│   │   │
│   │   ├── hero/                        # Interactive hero section & architecture workbench
│   │   │   ├── HeroSection.tsx          # Top-of-page introduction, CTA buttons, resume download
│   │   │   └── HeroArchitectureWorkbench.tsx # Interactive terminal simulating Laravel routes & DB
│   │   │
│   │   ├── home/                        # Public homepage sections
│   │   │   ├── AboutSection.tsx         # Engineering background, paradigms & highlights
│   │   │   ├── SkillsSection.tsx        # Categorized engineering disciplines with category filtering
│   │   │   ├── ExperienceSection.tsx    # Vertical timeline of career history
│   │   │   ├── ProjectsSection.tsx      # Filterable case study cards linking to detail pages
│   │   │   ├── LearningSection.tsx      # Education history and technical certifications
│   │   │   └── ContactSection.tsx       # Validated inquiry form with copy-email & rate limit
│   │   │
│   │   ├── layout/                      # Shared frame components
│   │   │   ├── Navbar.tsx               # Fixed header, smooth scroll navigation & mobile menu
│   │   │   └── Footer.tsx               # Copyright, backend indicator & admin console link
│   │   │
│   │   ├── projects/                    # Deep-dive case studies
│   │   │   └── ProjectDetailPage.tsx   # Slug-routed case study view with technical highlights
│   │   │
│   │   └── ui/                          # Design system primitives
│   │       ├── Button.tsx               # Styled primary, secondary, outline & danger buttons
│   │       ├── SectionHeading.tsx       # Standardized numbered section header with sub-label
│   │       └── Skeleton.tsx             # Animated pulse loading placeholder
│   │
│   ├── hooks/
│   │   └── usePortfolioData.ts          # SWR-style React hook loading public portfolio payload
│   │
│   ├── types/
│   │   └── portfolio.ts                 # TypeScript interfaces, payloads & database record types
│   │
│   └── utils/
│       ├── portfolioLogic.ts            # Category sorting, terminal commands & resume formatter
│       └── validation.ts                # Sanitization for contact forms, slugs & URLs
│
├── tests/                               # Automated verification test suites
│   ├── dbSchema.test.ts                 # Tests 14 tables, foreign keys, cascading deletes, check constraints
│   ├── dbMigration.test.ts              # Tests database population, parity, and idempotency
│   ├── dbQueries.test.ts                # Tests prepared statements, relational joins & CRUD operations
│   └── api.test.ts                      # Tests Express HTTP contracts, auth rejection, rate limiting
│
├── server.ts                            # Express application setup, REST routes & production static serving
├── vite.config.ts                       # Vite bundling configuration with React and Tailwind plugins
└── package.json                         # Scripts, runtime dependencies, and Node test configuration
```

---

## Database Architecture & 3NF Relational Schema

The database is normalized to Third Normal Form (3NF) across 14 tables in [server/schema.sql](server/schema.sql).

### Table Schema Matrix

| Table Name | Primary Key | Key Columns & Types | Relational Constraints & Behavior |
|---|---|---|---|
| `profile` | `id TEXT` (`'default'`) | `name`, `headline`, `about_paragraphs TEXT (JSON)`, `email` | Singleton table storing identity and contact details |
| `social_links` | `id TEXT` | `label`, `url`, `platform TEXT`, `sort_order INT` | `CHECK (platform IN ('github', 'linkedin', 'email'))` |
| `site_settings` | `id TEXT` (`'default'`) | `site_title`, `meta_description`, `copyright_year INT` | Singleton table storing global SEO & footer meta |
| `skill_categories`| `id TEXT` | `name TEXT UNIQUE`, `sort_order INT` | Parent category taxonomy for technical disciplines |
| `skills` | `id TEXT` | `name`, `category_id TEXT`, `is_primary INT`, `focus_note` | Foreign key `REFERENCES skill_categories(id)` |
| `projects` | `id TEXT` | `slug TEXT UNIQUE`, `title`, `status TEXT`, `featured INT` | `CHECK (status IN ('Completed', 'In Progress'))` |
| `project_highlights`| `id INT AUTOINCREMENT` | `project_id TEXT`, `highlight TEXT`, `sort_order INT` | `ON DELETE CASCADE` from `projects(id)` |
| `project_technologies`| `id INT AUTOINCREMENT` | `project_id TEXT`, `technology TEXT`, `sort_order INT`| `ON DELETE CASCADE` from `projects(id)` |
| `project_screenshots`| `id INT AUTOINCREMENT` | `project_id TEXT`, `image_url TEXT`, `sort_order INT` | `ON DELETE CASCADE` from `projects(id)` |
| `experiences` | `id TEXT` | `company`, `role`, `period`, `location`, `sort_order INT` | Professional work history |
| `experience_responsibilities`| `id INT AUTOINCREMENT`| `experience_id TEXT`, `responsibility TEXT` | `ON DELETE CASCADE` from `experiences(id)` |
| `experience_technologies`| `id INT AUTOINCREMENT`| `experience_id TEXT`, `technology TEXT` | `ON DELETE CASCADE` from `experiences(id)` |
| `education` | `id TEXT` | `degree`, `institution`, `period`, `location` | Academic background records |
| `certifications` | `id TEXT` | `title`, `issuer`, `date`, `credential_url TEXT` | Professional certificates & coursework |
| `contact_messages` | `id TEXT` | `name`, `email`, `subject`, `message`, `is_read INT` | Indexed on `created_at DESC` |
| `architecture_nodes` | `id TEXT` | `label`, `layer`, `protocol`, `summary` | System design workbench visual nodes |
| `architecture_workflows` | `id TEXT` | `tab_label`, `command`, `endpoint_label`, `status_label`| `CHECK (id IN ('rest-api', 'database', 'auth-queue'))` |
| `workflow_terminal_lines`| `id INT AUTOINCREMENT`| `workflow_id TEXT`, `line TEXT`, `line_number INT` | `ON DELETE CASCADE` from `architecture_workflows(id)` |
| `workflow_active_nodes` | `(workflow_id, node_id)` | Composite primary key mapping active nodes per workflow | Cascading foreign keys to both workflows and nodes |

### Operational Database Features
- **ACID Transactions**: Multi-table operations (such as saving a project with its highlights, technologies, and screenshots) execute inside `db.transaction()` blocks. If any statement encounters an error, SQLite automatically rolls back all changes.
- **Microsecond Prepared Queries**: Queries are compiled ahead of time with `db.prepare(...)`, preventing SQL injection and avoiding query re-parsing.
- **Concurrent Readers in WAL Mode**: Write-Ahead Logging (`PRAGMA journal_mode = WAL`) enables zero-lock concurrent reads while writes are being committed to the database.

---

## Production Hosting Requirements & Specifications

### 1. Hardware & System Requirements
- **Node.js**: `v20.x` or `v22.x` (LTS versions recommended).
- **Architecture**: `x86_64` (amd64) or `arm64` (Linux, macOS, or Windows Server). `better-sqlite3` provides pre-compiled native binaries for all major platforms.
- **RAM**: Minimum `512 MB` (at least `1 GB` recommended if running `npm run build` directly on the server).
- **Disk Storage**: At least `1 GB` free persistent disk space for the SQLite database, WAL logs, and user-uploaded media (`data/uploads/`).

### 2. CRITICAL: Persistent Volume Requirement for SQLite
In modern container hosting (such as **Docker**, **Railway**, **Render**, **Fly.io**, or **Kubernetes**), the local container filesystem is **ephemeral**. Any file written inside the container is permanently erased when the container restarts or a new deploy occurs.

> [!IMPORTANT]
> Because SQLite stores data on disk (`data/portfolio.db` and `data/uploads/`), you **MUST mount a persistent volume** to the `data/` directory.

| Host Platform | Persistent Volume Configuration |
|---|---|
| **VPS / Dedicated Server (Ubuntu/Debian)** | Local disk directory is naturally persistent. No volume mount needed. Ensure backups of `/path/to/portfolio/data/`. |
| **Docker / Docker Compose** | Mount host directory or named volume: `-v /var/data/portfolio:/app/data` |
| **Railway** | Add a **Volume** in Railway dashboard and mount path to `/app/data`. |
| **Fly.io** | Create volume `fly volumes create portfolio_data --size 1` and map to `/app/data` in `fly.toml`. |
| **Render** | Attach **Disk** in service settings and mount to `/app/data`. |

---

## Environment Variables Reference

Configure these environment variables in your server environment or in a `.env` file (copied from `.env.example`):

| Variable Name | Required in Prod? | Default (if unset) | Purpose & Constraints |
|---|:---:|---|---|
| `NODE_ENV` | **YES** | `development` | Must be set to `production`. Tells Express to serve compiled static assets from `dist/` rather than spawning the Vite development server. |
| `PORT` | Optional | `3000` | Port the Express HTTP server binds to. Many cloud hosts (Render, Cloud Run, Heroku) inject this automatically. |
| `APP_URL` | Recommended | `http://localhost:3000` | Canonical public URL of your website (e.g. `https://ashishmakwana.dev`). Used for links, headers, and SEO metadata. |
| `ADMIN_EMAIL` | **YES** | `ashishmakwana435@gmail.com` | Email address required to log into `/admin`. |
| `ADMIN_PASSWORD` | **YES** | `PortfolioAdmin#2026` | Secure password for the admin console. **Must be updated in production** to prevent unauthorized access. |
| `ADMIN_TOKEN_SECRET` | **YES** | *(auto-generated hash)* | Secret key used to sign HMAC bearer tokens for admin sessions. Must be a strong, unpredictable random string (at least 32 characters). |
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API key if deploying to Google AI Studio or enabling future server-side AI features. |

### Generating a Secure `ADMIN_TOKEN_SECRET`
Run this one-liner in your terminal to generate a cryptographically strong 64-character secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Production Build & Deployment Walkthrough

### Step 1: Install Dependencies
```bash
npm install
```
*(On CI/CD servers, run `npm ci` to install exact locked dependencies).*

### Step 2: Build Production Bundle (Client Assets + Backend Server)
```bash
npm run build
```
This runs both Vite and esbuild in parallel:
1. Compiles the React 19 application and Tailwind CSS into optimized, minified static files located in `dist/`.
2. Compiles `server.ts` into a standalone, pure Node.js ES module at `dist/server.js`. This allows the server to run directly with native `node` in production without needing a TypeScript transpiler at runtime.

### Step 3: Run Database Migrations
```bash
npm run migrate
```
This initializes `data/portfolio.db`, runs the schema DDL, and populates the database with initial records if not already populated.

### Step 4: Run Automated Verification Tests
```bash
npm test
```
Validates that database constraints, queries, and API endpoints are 100% operational before directing live traffic.

### Step 5: Start the Production Server
Start the precompiled server with `npm start` or directly via `node dist/server.js`:

```bash
# Direct startup
NODE_ENV=production PORT=3000 node dist/server.js

# Or using the npm start script
npm start
```

#### Using PM2 Process Manager:
```bash
# Start with the preconfigured ecosystem configuration
pm2 start ecosystem.config.cjs --env production

# Monitor status & logs
pm2 status
pm2 logs portfolio

# Ensure it starts automatically on system reboots
pm2 save
pm2 startup
```

#### Or using Systemd Service (`/etc/systemd/system/portfolio.service`):
```ini
[Unit]
Description=Developer Portfolio & Backend Systems
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/portfolio
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=ADMIN_EMAIL=ashishmakwana435@gmail.com
Environment=ADMIN_PASSWORD=YourStrongProductionPassword123!
Environment=ADMIN_TOKEN_SECRET=your-generated-64-char-hex-secret
ExecStart=/usr/bin/node /var/www/portfolio/dist/server.js
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

---

## Reverse Proxy (Nginx) & SSL Configuration

When hosting on a Linux VPS, place Nginx in front of port 3000 to manage SSL termination, HTTP/2, and client headers.

### Complete Nginx Server Configuration (`/etc/nginx/sites-available/portfolio`):

```nginx
server {
    listen 80;
    server_name ashishmakwana.dev www.ashishmakwana.dev;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ashishmakwana.dev www.ashishmakwana.dev;

    # SSL certificates (managed via Certbot / Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/ashishmakwana.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ashishmakwana.dev/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Maximum file upload size (for screenshots and resumes)
    client_max_body_size 5M;

    # Proxy all traffic to Express server on port 3000
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # WebSocket support (for Vite HMR in staging or SSE)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Forwarded IP headers (CRUCIAL for contact form rate limiting)
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static asset caching
    location /assets/ {
        proxy_pass http://127.0.0.1:3000/assets/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
    }
}
```

### Enable SSL with Certbot:
```bash
sudo certbot --nginx -d ashishmakwana.dev -d www.ashishmakwana.dev
```

---

## Automated Verification & Testing

Run the full verification suite using:

```bash
npm test
```

### Verification Suites Executed (24 Automated Tests):
1. **Schema & Constraint Suite (`tests/dbSchema.test.ts`)**:
   - Validates that all 14 tables and indexes exist.
   - Verifies `PRAGMA foreign_keys = ON` rejects orphaned rows.
   - Verifies cascading deletes cleanly remove child highlights and tech tags.
   - Verifies unique constraints on project slugs and domain `CHECK` rules.
2. **Database Migration Suite (`tests/dbMigration.test.ts`)**:
   - Verifies fresh database seeding and field-level data integrity.
   - Verifies idempotency (second migration does not overwrite existing edits).
3. **Relational Query Layer Suite (`tests/dbQueries.test.ts`)**:
   - Tests `getPublicPortfolio()` returns complete, type-safe structures without crashes.
   - Tests `getProjectBySlug()` with relational joins.
   - Tests atomic CRUD operations for skills, projects, and experiences.
   - Tests contact message creation, retrieval, and deletion.
4. **API HTTP Contract Suite (`tests/api.test.ts`)**:
   - Tests `GET /api/health` -> `200 OK`.
   - Tests `GET /api/portfolio` -> `200 OK` (confirms private messages are excluded).
   - Tests `GET /api/projects/:slug` -> `200 OK` / `404 Not Found`.
   - Tests `POST /api/contact` validation, sanitization, and sliding-window rate limit.
   - Tests `POST /api/admin/login` authentication and token issuance.
5. **Utility Logic Suite (`src/utils/*.test.ts`)**:
   - Tests category ordering, metadata formatting, and terminal command resolution.

---

## Local Development

Start development server with Vite hot-reloading:

```bash
npm run dev
```

- **Public Portfolio**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Type Checking**: `npm run lint`
- **Database Migration**: `npm run migrate`

---

## API Reference

### Public Endpoints
- `GET /api/health` — Returns server status and UTC timestamp.
- `GET /api/portfolio` — Returns full public payload (profile, skills, projects, experiences, education, certs, workbench nodes/workflows).
- `GET /api/projects/:slug` — Returns individual project case study by unique slug.
- `GET /api/resume` — Downloads uploaded custom resume or generated plain text resume.
- `POST /api/contact` — Submits contact inquiry (rate-limited to 5 requests per 15 minutes per IP).

### Protected Admin Endpoints (`Authorization: Bearer <token>`)
- `POST /api/admin/login` — Verifies email/password and returns signed HMAC token.
- `GET /api/admin/session` — Validates current bearer token.
- `GET /api/admin/dashboard` — Returns complete record including contact messages.
- `PUT /api/admin/profile` — Updates identity, headlines, bio, and social links.
- `PUT /api/admin/settings` — Updates site title, description, and footer.
- `POST | PUT | DELETE /api/admin/skills` — Skills CRUD operations.
- `POST | PUT | DELETE /api/admin/projects` — Projects CRUD operations.
- `POST | PUT | DELETE /api/admin/experiences` — Career history CRUD operations.
- `POST | PUT | DELETE /api/admin/education` — Academic history CRUD operations.
- `POST | PUT | DELETE /api/admin/certifications` — Certifications CRUD operations.
- `PATCH /api/admin/messages/:id/read` — Toggles message read status.
- `DELETE /api/admin/messages/:id` — Deletes inquiry from database.
- `POST /api/admin/resume` — Uploads custom resume file (`.pdf`, `.txt`, `.docx`).
- `POST /api/admin/upload` — Uploads project screenshot images (`.png`, `.jpg`, `.webp`).
