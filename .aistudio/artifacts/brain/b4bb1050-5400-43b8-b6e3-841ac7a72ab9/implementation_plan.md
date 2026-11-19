# Ashish Makwana — Personal Developer Portfolio

A custom-engineered, dark-first personal developer portfolio and content platform for Ashish Makwana (Laravel Developer, Backend Engineer, and Full-Stack Developer), backed by a dedicated Express REST API and persistent local file database, delivered in phases starting with the design system and homepage.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices & Delivery Boundary:** Based on your answers, this plan locks in the architecture below and scopes **Milestone 1** strictly to the **Design System, Backend Data Foundation, and Homepage (Navigation, Hero, and Footer)** so you can review and approve the visual identity before we build out the remaining sections and Admin Dashboard in subsequent milestones.

- **Persistence Strategy (Confirmed)**: Express REST API backed by a structured local JSON file database, replacing hardcoded frontend arrays with real server-managed records.
- **Hero Visual Composition (Confirmed)**: Interactive terminal paired with a backend architecture visualizer in the right column of the Hero section, reflecting real Laravel, REST API, and database engineering workflows.
- **Phased Execution (Confirmed)**:
  - **Milestone 1 (Immediate upon approval)**: Design tokens, typography and motion system, Express server + local file database schema and seed data, sticky navigation bar, the two-column Hero section with interactive terminal/architecture explorer, and minimal footer.
  - **Milestone 2 (After Homepage Approval)**: About, Technical Skills, Experience timeline, Selected Work grid, dynamic Project Detail views (by slug), Education & Certifications, and Contact form with validation and rate limiting.
  - **Milestone 3 (Final Phase)**: Authenticated Admin Dashboard with dark sidebar layout, full CRUD management for all portfolio entities, resume upload/download management, and message inbox.

---

## 1. Overview & Core Concept

- **What It Does**: Presents Ashish Makwana's engineering capabilities, backend system architecture expertise, and real-world full-stack work through an editorial dark-mode web application powered by a live API rather than static frontend constants.
- **Target Audience / Persona**: Technical recruiters, engineering managers, startup founders, and freelance/contract clients evaluating backend and full-stack software engineering capability.
- **Key Value**: Avoids generic portfolio templates by pairing disciplined dark-slate typography and restrained sky-blue accents with a tactile, interactive backend engineering demonstration directly in the Hero viewport.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **First-Load Homepage Journey**: Visitors land on a full-bleed dark canvas (`#080B12`) with a subtle radial sky-blue glow behind the Hero. The sticky three-zone navigation bar, left-column editorial introduction, and right-column interactive terminal/architecture explorer load immediately from the API without blocking spinners.
2. **Hero Interactive Exploration**: Visitors can switch tabs or run preset commands inside the right-column interactive terminal (such as inspecting API endpoints, Laravel service routes, or database schema readiness) and watch the paired backend architecture nodes highlight the active request path (`Client -> API Gateway -> Laravel Service -> MySQL`).
3. **Navigation & Resume Access**: Visitors can jump smoothly between portfolio sections (with active-section tracking and mobile slide-in drawer with background scroll lock) or trigger the Resume download endpoint directly from the header or Hero CTA.
4. **Future Milestone Flows (Previewed in Architecture)**: Clicking any project opens a slug-based Project Detail view; submitting the Contact form validates inputs client- and server-side, enforces rate limiting, and persists messages for review in the Admin Dashboard.

### Visual Identity & Theme

- **Aesthetic Direction**: Refined technical editorial — combining the restraint of a minimalist developer monograph with the precision of modern SaaS engineering tools.
- **Color Palette & 60-30-10 Discipline**:
  - **60–75% Dominant Canvas**: Deep obsidian slate (`--background: #080B12`) with a restrained radial Hero glow (`rgba(56, 189, 248, 0.12)`).
  - **20–30% Structural Surfaces**: Elevated slate surfaces (`--surface: #111827`, `--surface-elevated: #161F2E`), hairline 1px borders (`--border: #263244`), and primary/secondary/muted text (`#F8FAFC`, `#94A3B8`, `#64748B`).
  - **10% Focused Accent & Semantics**: Sky blue (`--primary: #38BDF8`) reserved for primary CTAs, active tabs, and highlighted headline phrases; indigo (`--secondary: #6366F1`) used sparingly in the primary gradient (`135deg, #38BDF8 -> #6366F1`). Semantic status colors (`#22C55E` success, `#F59E0B` warning, `#EF4444` error) always paired with explicit text labels.
- **Typography & Hierarchy**:
  - **Primary Display & Body**: `Plus Jakarta Sans` (Weights 400, 500, 600, 700, 800), with `text-wrap: balance` on display headlines and slight optical tracking compensation on dark surfaces.
  - **Code, Terminal & Tabular Data**: `JetBrains Mono` with `tabular-nums` for terminal commands, timestamps, latency readouts inside the interactive terminal, and future admin data tables.
  - **Fluid Type Scale**: Hero heading at `clamp(2.5rem, 5.5vw, 4.5rem)` with tight `1.08` line-height; section headings `40–48px`; body prose `15–17px` at `1.6` line-height and `65–75ch` measure.
  - **Editorial Discipline**: Natural title-case headings with subtle section index kickers (`01 / About Me`), zero code-comment prefixes (`//`), zero ghost watermarks, and zero static pill-badge enclosures around metadata.

### Spatial Composition, Layout & Motion

- **Layout Grid & Top Bar Contract**: Centered `1280px` max-width container (`px-5 md:px-8`) with `100–120px` desktop vertical section rhythm (`72–88px` tablet, `56–72px` mobile). The sticky header strictly follows a three-zone single-row contract: wordmark left, single-line navigation links center/right, and one primary Resume CTA right.
- **Two-Column Balanced Hero**: Left column holds availability kicker (without decorative pulsing dots), greeting, balanced headline with selective `#38BDF8` emphasis, designation (`Laravel Developer | Backend Engineer | Full-Stack Developer`), concise bio, CTA group (`Explore My Work`, `Download Resume`, `Contact Me`), and social links. Right column holds the unified interactive terminal + backend architecture node panel at balanced visual height.
- **Interactive Feedback & Motion**:
  - Uses Motion with GPU-composited properties only (`transform`, `opacity`) and default settling curve `cubic-bezier(0.22, 1, 0.36, 1)`.
  - Initial entrance stagger completes within `400–750ms`; hover and tab transitions settle within `150–250ms`.
  - Scroll reveals trigger once per section entry; all non-essential motion, ambient glows, and smooth scrolling respect `prefers-reduced-motion: reduce`.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Unified Express + Vite Runtime with Local JSON Database**:
  - *Chosen Approach*: Run an Express server that serves both the `/api/*` REST endpoints (persisting to a structured local JSON data store on disk) and the Vite frontend middleware on port 3000.
  - *Why*: Matches your preference for an Express API with a local file database, requires zero external cloud credentials to boot immediately, preserves a clean frontend-to-API boundary (the frontend never touches disk directly), and keeps data persistence durable across server restarts.
  - *Alternatives Considered*: PostgreSQL via Cloud SQL or Firestore (passed over per your selection for a lightweight local file database) or pure client-side mock arrays (rejected because the guidelines strictly require dynamic backend APIs).

- **Decision 2 — `Plus Jakarta Sans` + `JetBrains Mono` Font Pairing**:
  - *Chosen Approach*: Use `Plus Jakarta Sans` from your guidelines' approved list as the unified display/body geometric sans, paired with `JetBrains Mono` strictly for the interactive terminal and tabular figures.
  - *Why*: Honors the typography hierarchy in `PORTFOLIO_DESIGN_GUIDELINES.md` while maintaining crisp geometric character on dark slate surfaces and strict tabular alignment in code/admin views.
  - *Alternatives Considered*: System defaults or `Inter` (avoided to keep the visual identity bespoke rather than template-like).

- **Decision 3 — Interactive Terminal + Architecture Visualizer as Hero Focal Anchor**:
  - *Chosen Approach*: Combine an interactive command/endpoint inspector with a compact, connected backend system flow diagram (`API Route -> Controller/Service -> Cache/DB`) inside a single elevated surface (`#111827` / `#161F2E`) with subtle hairline borders.
  - *Why*: Communicates backend engineering competence instantaneously without fake statistics, stock photography, or cluttered floating card islands.
  - *Alternatives Considered*: Static code screenshot or abstract decorative nodes without real interaction (rejected because non-functional decorative widgets dilute credibility).

- **Decision 4 — Strict Phased Delivery Starting with Milestone 1**:
  - *Chosen Approach*: Implement the complete design system tokens, Express API + seeded local database, sticky header/mobile menu, Hero section, and minimal Footer first; hold full inner sections, Project Detail pages, and the Admin Dashboard until you review and approve the homepage design.
  - *Why*: Follows your explicit instruction to validate the visual identity and homepage feel before expanding to the remaining sections and admin tooling.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### System Architecture & Component Hierarchy

```text
┌──────────────────────────────────────────────────────────────────────┐
│                        Browser Client (React)                        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Design System Layer (CSS Theme Tokens, Motion Primitives, UI)  │  │
│  └───────────────────────────────┬────────────────────────────────┘  │
│                                  ▼                                   │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Public Portfolio App (Milestone 1: Navbar + Hero + Footer)     │  │
│  │  ├─ StickyNav (Active section, mobile drawer, Resume action)   │  │
│  │  ├─ HeroSection                                                │  │
│  │  │   ├─ IntroColumn (Kicker, Headline, CTAs, Socials)          │  │
│  │  │   └─ TerminalArchitecturePanel (Interactive tabs & flow)    │  │
│  │  └─ Footer (Identity, links, copyright)                        │  │
│  └───────────────────────────────┬────────────────────────────────┘  │
│                                  │ HTTP / JSON (fetch)               │
└──────────────────────────────────┼───────────────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   Express Server & API Layer (Port 3000)             │
│                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────┐  │
│  │ Public Content API │  │ Contact & Rate     │  │ Admin API      │  │
│  │ /api/portfolio     │  │ Limiter (Phase 2)  │  │ (Phase 3 Auth) │  │
│  │ /api/projects/:slug│  │ /api/contact       │  │ /api/admin/*   │  │
│  │ /api/resume        │  └─────────┬──────────┘  └───────┬────────┘  │
│  └─────────┬──────────┘            │                     │           │
│            └───────────────────────┼─────────────────────┘           │
│                                    ▼                                 │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Persistence Service (Atomic Read/Write + Seed Initializer)     │  │
│  └───────────────────────────────┬────────────────────────────────┘  │
└──────────────────────────────────┼───────────────────────────────────┘
                                   ▼
                 ┌──────────────────────────────────┐
                 │ Local File Database (JSON Store) │
                 └──────────────────────────────────┘
```

### Data Model & Entities

The local file database maintains a single normalized document store seeded with authentic initial records (without fabricated metrics or fake testimonials):

- **Profile & Settings**: Name, headline, designation, availability status text, short introduction, about narrative, location, email, GitHub/LinkedIn URLs, resume metadata/download path, and site SEO metadata.
- **Skills**: Categorized records (`Backend Development`, `Frontend Development`, `Databases`, `DevOps & Infrastructure`, `Development Tools`) with primary emphasis flags and icon identifiers.
- **Experience**: Ordered career entries with company, role, date range, location, responsibility bullets, and technologies.
- **Projects**: Dynamic portfolio items keyed by unique `slug` containing title, category, status, featured flag, summary, problem statement, solution, technical implementation notes, stack tags, screenshot references, and optional live/repo URLs.
- **Education & Certifications**: Verified academic and credential records with institution/issuer, dates, and verification links.
- **Messages & Admin Auth (Milestones 2–3)**: Contact form submissions with timestamp and read status, plus hashed admin credentials and session verification for dashboard mutations.

### Interactive Component & State Mapping

- **Portfolio Data Context / Hook**: Fetches `/api/portfolio` on mount, exposes `loading`, `error`, and `data` states, and provides non-blocking skeleton placeholders for dynamic slots while keeping core layout structure immediately stable.
- **Navigation State**: Tracks scroll position across section anchors to update active nav highlights; manages mobile drawer open/close state and toggles `overflow: hidden` on `document.body` while open; restores focus cleanly on close.
- **Interactive Terminal & Architecture Explorer**:
  - Selecting a workflow tab (`REST API`, `Database`, `Auth & Queue`) or clicking an interactive command triggers a deterministic state transition in the terminal output buffer and highlights the corresponding node path in the architecture diagram.
  - Keyboard-accessible tablist (`role="tablist"`, arrow/click selection) with `prefers-reduced-motion` awareness.
- **Resume Action**: Triggers a verified download/preview response from `/api/resume` with clear loading and feedback states rather than a dead link.
