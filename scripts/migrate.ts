import fs from 'node:fs';
import path from 'node:path';
import { getDb, initDatabase, DB_PATH } from '../server/db';
import type {
  AdminDatabaseRecord,
  PortfolioPayload,
} from '../src/types/portfolio';

export function runMigration(dbPath: string = DB_PATH): void {
  const db = initDatabase(dbPath);

  // Check if profile already seeded
  const existingProfile = db
    .prepare('SELECT id FROM profile WHERE id = ?')
    .get('default');

  if (existingProfile) {
    console.log('Database already migrated and populated.');
    if (dbPath !== DB_PATH) {
      db.close();
    }
    return;
  }

  console.log('Initializing database tables and running transactional migration...');

  // Read existing data/portfolio.json if available
  const jsonPath = path.resolve(process.cwd(), 'data', 'portfolio.json');
  let rawJsonData: Partial<AdminDatabaseRecord> | null = null;
  if (fs.existsSync(jsonPath)) {
    try {
      rawJsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (err) {
      console.warn('Failed to parse portfolio.json, using seed defaults:', err);
    }
  }

  const existingProfileData = rawJsonData?.profile;

  // Execute entire migration atomically inside a transaction
  const migrateTransaction = db.transaction(() => {
    // 1. Profile
    const profileInsert = db.prepare(`
      INSERT INTO profile (
        id, name, greeting, headline, headline_highlight, designation,
        availability_text, short_intro, about_heading, about_paragraphs,
        about_highlights, email, location, resume_filename, custom_resume_path, updated_at
      ) VALUES (
        @id, @name, @greeting, @headline, @headline_highlight, @designation,
        @availability_text, @short_intro, @about_heading, @about_paragraphs,
        @about_highlights, @email, @location, @resume_filename, @custom_resume_path, datetime('now')
      )
    `);

    profileInsert.run({
      id: 'default',
      name: existingProfileData?.name || 'Ashish Makwana',
      greeting: "Hi, I'm Ashish Makwana",
      headline: 'Building reliable backend systems and web applications with Laravel.',
      headline_highlight: 'reliable backend systems',
      designation: 'Laravel Developer & Backend Engineer',
      availability_text: 'Available for full-time backend & full-stack roles',
      short_intro:
        'I build dependable APIs, structured databases, and business web applications. My daily focus is Laravel, relational MySQL modeling, asynchronous queues, and clean frontend integration.',
      about_heading: 'Clean architecture, reliable data flow, and code built to last.',
      about_paragraphs: JSON.stringify([
        "I'm a backend-focused engineer who enjoys turning complex business workflows into clean, maintainable systems. Most of my work centers around Laravel and MySQL, building transactional backends, custom APIs, and management dashboards.",
        'I pay close attention to relational schema design, query efficiency, and input validation so applications remain fast and predictable under real workloads. On the client side, I connect services with modern JavaScript and clean, accessible interfaces.',
      ]),
      about_highlights: JSON.stringify([
        'REST API architecture with token authentication & rate limiting',
        'Relational database modeling, composite indexing & query optimization',
        'Modular service layers, background queues & webhook processing',
        'Full-stack integration connecting backend services to responsive frontends',
      ]),
      email: existingProfileData?.email || 'ashishmakwana435@gmail.com',
      location: existingProfileData?.location || 'India · Remote Ready',
      resume_filename:
        'Ashish-Makwana-Resume.pdf',
      custom_resume_path: existingProfileData?.customResumePath || null,
    });

    // 2. Social Links
    const socialInsert = db.prepare(`
      INSERT INTO social_links (id, label, url, platform, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);
    const socialLinks = existingProfileData?.socialLinks?.length
      ? existingProfileData.socialLinks
      : [
          {
            id: 'github',
            label: 'GitHub',
            url: 'https://github.com/ashishmakwana',
            platform: 'github',
          },
          {
            id: 'linkedin',
            label: 'LinkedIn',
            url: 'https://www.linkedin.com/in/ashish-makwana',
            platform: 'linkedin',
          },
        ];
    socialLinks.forEach((link, idx) => {
      socialInsert.run(link.id, link.label, link.url, link.platform, idx);
    });

    // 3. Site Settings
    const settingsInsert = db.prepare(`
      INSERT INTO site_settings (id, site_title, meta_description, copyright_year, footer_tagline, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    settingsInsert.run(
      'default',
      rawJsonData?.settings?.siteTitle ||
        'Ashish Makwana — Laravel Developer & Backend Engineer',
      rawJsonData?.settings?.metaDescription ||
        'Personal developer portfolio for Ashish Makwana — Laravel Developer, Backend Engineer, and Full-Stack Developer.',
      rawJsonData?.settings?.copyrightYear || 2026,
      rawJsonData?.settings?.footerTagline ||
        'Laravel Developer · Backend Engineer · Full-Stack Developer',
    );

    // 4. Skill Categories
    const categoryInsert = db.prepare(`
      INSERT INTO skill_categories (id, name, sort_order)
      VALUES (?, ?, ?)
    `);
    const categories = [
      { id: 'cat-arch', name: 'Architecture & System Design', sortOrder: 1 },
      { id: 'cat-backend', name: 'Backend Engineering', sortOrder: 2 },
      { id: 'cat-db', name: 'Databases & Modeling', sortOrder: 3 },
      { id: 'cat-testing', name: 'Software Quality & Testing', sortOrder: 4 },
      { id: 'cat-devops', name: 'DevOps & Infrastructure', sortOrder: 5 },
      { id: 'cat-ops', name: 'Observability & Security', sortOrder: 6 },
      { id: 'cat-frontend', name: 'Frontend Development', sortOrder: 7 },
      { id: 'cat-tools', name: 'Development Tools', sortOrder: 8 },
    ];
    categories.forEach((cat) => {
      categoryInsert.run(cat.id, cat.name, cat.sortOrder);
    });

    // 5. Skills
    const skillInsert = db.prepare(`
      INSERT INTO skills (id, name, category_id, is_primary, focus_note, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const skillsToInsert = [
      // Architecture
      {
        id: 'skill-system-design',
        name: 'System Design',
        categoryId: 'cat-arch',
        isPrimary: 1,
        focusNote: 'Service boundaries, queue decoupling, failure modes & concurrency',
        sortOrder: 1,
      },
      {
        id: 'skill-adr',
        name: 'Architecture Decision Records (ADRs)',
        categoryId: 'cat-arch',
        isPrimary: 0,
        focusNote: 'Trade-off analysis, technical rationale, and RFC documentation',
        sortOrder: 2,
      },
      // Backend
      {
        id: 'skill-laravel',
        name: 'Laravel',
        categoryId: 'cat-backend',
        isPrimary: 1,
        focusNote: 'Service architecture, queues, Eloquent ORM, Sanctum, events',
        sortOrder: 3,
      },
      {
        id: 'skill-php',
        name: 'PHP 8+',
        categoryId: 'cat-backend',
        isPrimary: 1,
        focusNote: 'Object-oriented design, typed properties, dependency injection',
        sortOrder: 4,
      },
      {
        id: 'skill-rest',
        name: 'RESTful APIs',
        categoryId: 'cat-backend',
        isPrimary: 1,
        focusNote: 'Resource transformers, rate limiting, token authentication, error handling',
        sortOrder: 5,
      },
      // Databases
      {
        id: 'skill-mysql',
        name: 'MySQL',
        categoryId: 'cat-db',
        isPrimary: 1,
        focusNote: '3NF normalized schemas, composite indexes, query plans, transactions',
        sortOrder: 6,
      },
      {
        id: 'skill-data-modeling',
        name: 'Relational Data Modeling',
        categoryId: 'cat-db',
        isPrimary: 1,
        focusNote: 'Referential integrity, constraints, migration lifecycles',
        sortOrder: 7,
      },
      {
        id: 'skill-redis',
        name: 'Redis',
        categoryId: 'cat-db',
        isPrimary: 0,
        focusNote: 'Queue workers, sliding-window rate limiters, response caching',
        sortOrder: 8,
      },
      {
        id: 'skill-sqlite',
        name: 'SQLite',
        categoryId: 'cat-db',
        isPrimary: 0,
        focusNote: 'Embedded relational storage, WAL mode, transactional migrations',
        sortOrder: 9,
      },
      // Testing
      {
        id: 'skill-testing',
        name: 'Testing Strategy',
        categoryId: 'cat-testing',
        isPrimary: 1,
        focusNote: 'Test pyramid, automated API feature tests, database test fixtures',
        sortOrder: 10,
      },
      {
        id: 'skill-pest',
        name: 'PHPUnit & Automated Testing',
        categoryId: 'cat-testing',
        isPrimary: 0,
        focusNote: 'HTTP status verification, boundary tests, regression prevention',
        sortOrder: 11,
      },
      // DevOps
      {
        id: 'skill-git',
        name: 'Git & GitHub Workflows',
        categoryId: 'cat-devops',
        isPrimary: 0,
        focusNote: 'Branch protection, semantic commits, PR reviews',
        sortOrder: 12,
      },
      {
        id: 'skill-cicd',
        name: 'CI/CD Automation',
        categoryId: 'cat-devops',
        isPrimary: 0,
        focusNote: 'Automated linting, test pipelines, artifact verification gates',
        sortOrder: 13,
      },
      {
        id: 'skill-linux',
        name: 'Linux CLI & Nginx',
        categoryId: 'cat-devops',
        isPrimary: 0,
        focusNote: 'Process managers (Supervisor), reverse proxies, file permissions',
        sortOrder: 14,
      },
      // Observability & Security
      {
        id: 'skill-observability',
        name: 'Observability & Logging',
        categoryId: 'cat-ops',
        isPrimary: 0,
        focusNote: 'Structured JSON logs, queue telemetry, health checks',
        sortOrder: 15,
      },
      {
        id: 'skill-security',
        name: 'Security Review & OWASP',
        categoryId: 'cat-ops',
        isPrimary: 0,
        focusNote: 'Input sanitization, token hashing, CSRF/XSS defenses, least-privilege',
        sortOrder: 16,
      },
      // Frontend
      {
        id: 'skill-js',
        name: 'JavaScript (ES6+)',
        categoryId: 'cat-frontend',
        isPrimary: 1,
        focusNote: 'Async/await fetch workflows, DOM state management, accessible UI',
        sortOrder: 17,
      },
      {
        id: 'skill-html-css',
        name: 'HTML5 & Tailwind CSS',
        categoryId: 'cat-frontend',
        isPrimary: 0,
        focusNote: 'Semantic structure, responsive utility grids, accessibility standards',
        sortOrder: 18,
      },
      // Tools
      {
        id: 'skill-postman',
        name: 'Postman & Composer',
        categoryId: 'cat-tools',
        isPrimary: 0,
        focusNote: 'API contract testing, dependency management, automated collections',
        sortOrder: 19,
      },
    ];

    skillsToInsert.forEach((s) => {
      skillInsert.run(s.id, s.name, s.categoryId, s.isPrimary, s.focusNote, s.sortOrder);
    });

    // 6. Projects & Child Tables
    const projectInsert = db.prepare(`
      INSERT INTO projects (
        id, slug, title, category, status, featured, short_description,
        problem_statement, solution_summary, live_url, github_url, sort_order, created_at, updated_at
      ) VALUES (
        @id, @slug, @title, @category, @status, @featured, @short_description,
        @problem_statement, @solution_summary, @live_url, @github_url, @sort_order, datetime('now'), datetime('now')
      )
    `);

    const highlightInsert = db.prepare(`
      INSERT INTO project_highlights (project_id, highlight, sort_order)
      VALUES (?, ?, ?)
    `);

    const techInsert = db.prepare(`
      INSERT INTO project_technologies (project_id, technology, sort_order)
      VALUES (?, ?, ?)
    `);

    const screenshotInsert = db.prepare(`
      INSERT INTO project_screenshots (project_id, image_url, sort_order)
      VALUES (?, ?, ?)
    `);

    const enrichedProjects = [
      {
        id: 'proj-erp-api',
        slug: 'multi-tenant-business-operations-api',
        title: 'Multi-Tenant Operations & Inventory Platform',
        category: 'Backend Architecture · Distributed Systems',
        status: 'Completed',
        featured: 1,
        short_description:
          'A multi-tenant inventory platform handling stock ledgers, order state transitions, and role-based staff access with Laravel and MySQL.',
        problem_statement:
          'Operations teams struggled with inventory discrepancies across warehouses, lacked audit trails for stock adjustments, and had no role-based permission boundaries.',
        solution_summary:
          'Architected a centralized Laravel platform using database transactions for race-condition-free stock updates, scoped API tokens, and normalized MySQL tables.',
        live_url: null,
        github_url: 'https://github.com/ashishmakwana',
        sort_order: 1,
        highlights: [
          'Formalized ADR-001 for strict pessimistic row locking during warehouse stock adjustments',
          'Normalized 3NF MySQL schema with composite indexes on (tenant_id, sku, warehouse_id)',
          'Automated test suite with 85+ feature and unit tests validating tenant boundary isolation',
          'Scoped Sanctum token abilities enforcing granular staff role permissions at middleware layer',
        ],
        technologies: [
          'Laravel',
          'PHP',
          'MySQL',
          'REST APIs',
          'JavaScript',
          'Redis',
        ],
        screenshots: [],
      },
      {
        id: 'proj-api-gateway',
        slug: 'queued-webhook-notification-dispatcher',
        title: 'Queued Webhook & Notification Dispatcher',
        category: 'API Infrastructure · Asynchronous Messaging',
        status: 'Completed',
        featured: 1,
        short_description:
          'An asynchronous webhook engine that dispatches signed payloads to external endpoints with retry backoffs and delivery logging using Redis queues.',
        problem_statement:
          'Synchronous third-party API calls during user checkout caused latency spikes and left team members blind when external partner endpoints timed out.',
        solution_summary:
          'Engineered a decoupled dispatch worker that offloads outbound requests to Redis queues, verifies recipient signatures, and logs every delivery attempt.',
        live_url: null,
        github_url: 'https://github.com/ashishmakwana',
        sort_order: 2,
        highlights: [
          'Formalized ADR-004: Redis queue isolation with exponential retry backoff and dead-letter queue',
          'HMAC-SHA256 payload signing for downstream webhook authenticity verification',
          'Structured JSON delivery logs tracking latency, HTTP status, and retry counts',
          'Idempotent job processing keys preventing duplicate notifications on worker recovery',
        ],
        technologies: ['Laravel', 'Redis', 'MySQL', 'REST APIs', 'PHP'],
        screenshots: [],
      },
    ];

    enrichedProjects.forEach((proj) => {
      projectInsert.run({
        id: proj.id,
        slug: proj.slug,
        title: proj.title,
        category: proj.category,
        status: proj.status,
        featured: proj.featured,
        short_description: proj.short_description,
        problem_statement: proj.problem_statement,
        solution_summary: proj.solution_summary,
        live_url: proj.live_url,
        github_url: proj.github_url,
        sort_order: proj.sort_order,
      });

      proj.highlights.forEach((h, hIdx) => {
        highlightInsert.run(proj.id, h, hIdx);
      });

      proj.technologies.forEach((t, tIdx) => {
        techInsert.run(proj.id, t, tIdx);
      });

      proj.screenshots.forEach((s, sIdx) => {
        screenshotInsert.run(proj.id, s, sIdx);
      });
    });

    // 7. Experiences & Child Tables
    const expInsert = db.prepare(`
      INSERT INTO experiences (id, company, role, period, location, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const expRespInsert = db.prepare(`
      INSERT INTO experience_responsibilities (experience_id, responsibility, sort_order)
      VALUES (?, ?, ?)
    `);

    const expTechInsert = db.prepare(`
      INSERT INTO experience_technologies (experience_id, technology, sort_order)
      VALUES (?, ?, ?)
    `);

    const experiences = [
      {
        id: 'exp-1',
        company: 'Enterprise & Business Web Systems',
        role: 'Laravel & Backend Engineer',
        period: 'Core Engineering Focus',
        location: 'India',
        sortOrder: 1,
        responsibilities: [
          'Architected modular Laravel backend services, role-based access controls, and versioned RESTful APIs serving web applications.',
          'Designed normalized MySQL relational schemas, migrations, and composite indexes to keep transactional and reporting queries fast under load.',
          'Implemented automated API test suites and background queues with Redis to decouple external integrations from user-facing request cycles.',
          'Built responsive administrative workflows, order management pipelines, and validated data forms using JavaScript and Tailwind CSS.',
        ],
        technologies: [
          'Laravel',
          'PHP',
          'MySQL',
          'REST APIs',
          'Redis',
          'JavaScript',
        ],
      },
    ];

    experiences.forEach((exp) => {
      expInsert.run(exp.id, exp.company, exp.role, exp.period, exp.location, exp.sortOrder);
      exp.responsibilities.forEach((r, rIdx) => {
        expRespInsert.run(exp.id, r, rIdx);
      });
      exp.technologies.forEach((t, tIdx) => {
        expTechInsert.run(exp.id, t, tIdx);
      });
    });

    // 8. Education & Certifications
    const eduInsert = db.prepare(`
      INSERT INTO education (id, degree, institution, period, location, description, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    eduInsert.run(
      'edu-1',
      'Bachelor of Computer Applications (BCA)',
      'Saurashtra University',
      '2020 – 2023',
      'India',
      'Coursework in relational databases, data structures, OOP in C++/Java, and web application development.',
      1,
    );

    const certInsert = db.prepare(`
      INSERT INTO certifications (id, title, issuer, date, credential_url, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    certInsert.run(
      'cert-1',
      'Building REST APIs with Laravel & Sanctum',
      'Laracasts & Professional Practice',
      '2024',
      null,
      1,
    );
    certInsert.run(
      'cert-2',
      'High-Performance SQL & Relational Schema Design',
      'MySQL Certification Coursework',
      '2024',
      null,
      2,
    );

    // 9. Contact Messages (migrate any existing messages)
    const msgInsert = db.prepare(`
      INSERT INTO contact_messages (id, name, email, subject, message, created_at, is_read)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const existingMessages = rawJsonData?.messages || [];
    existingMessages.forEach((msg) => {
      msgInsert.run(
        msg.id,
        msg.name,
        msg.email,
        msg.subject,
        msg.message,
        msg.createdAt,
        msg.read ? 1 : 0,
      );
    });

    // 10. Architecture Workbench Nodes & Workflows
    const nodeInsert = db.prepare(`
      INSERT INTO architecture_nodes (id, label, layer, protocol, summary, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const nodes = [
      {
        id: 'client',
        label: 'Client App',
        layer: 'Presentation',
        protocol: 'HTTPS / JSON',
        summary: 'Validates input payloads and sends bearer-authenticated requests.',
        sortOrder: 1,
      },
      {
        id: 'gateway',
        label: 'API Gateway & Sanctum',
        layer: 'Middleware',
        protocol: 'Rate Limit · Auth',
        summary: 'Enforces throttling, token verification, and FormRequest rules.',
        sortOrder: 2,
      },
      {
        id: 'laravel',
        label: 'Laravel Service Layer',
        layer: 'Domain Logic',
        protocol: 'PHP 8.3 · Jobs',
        summary: 'Executes atomic business rules, transforms responses, and dispatches queued jobs.',
        sortOrder: 3,
      },
      {
        id: 'database',
        label: 'MySQL & Redis',
        layer: 'Persistence',
        protocol: 'InnoDB · Cache',
        summary: 'Stores normalized relational records, indexed queries, and queue state.',
        sortOrder: 4,
      },
    ];
    nodes.forEach((n) => {
      nodeInsert.run(n.id, n.label, n.layer, n.protocol, n.summary, n.sortOrder);
    });

    const workflowInsert = db.prepare(`
      INSERT INTO architecture_workflows (
        id, tab_label, command, endpoint_label, latency_label, status_label, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const lineInsert = db.prepare(`
      INSERT INTO workflow_terminal_lines (workflow_id, line, line_number)
      VALUES (?, ?, ?)
    `);

    const activeNodeInsert = db.prepare(`
      INSERT INTO workflow_active_nodes (workflow_id, node_id)
      VALUES (?, ?)
    `);

    const workflows = [
      {
        id: 'rest-api',
        tabLabel: 'REST API',
        command: 'php artisan route:list --path=api/v1',
        endpointLabel: 'GET /api/v1/orders',
        latencyLabel: '18ms',
        statusLabel: '200 OK',
        sortOrder: 1,
        lines: [
          '$ php artisan route:list --path=api/v1',
          '  GET|HEAD  api/v1/orders ........... OrderController@index',
          '  POST      api/v1/orders ........... OrderController@store',
          '  GET|HEAD  api/v1/orders/{id} ...... OrderController@show',
          '  Middleware: auth:sanctum, throttle:api',
          '  Response: 200 OK · JSON Resource · 18ms',
        ],
        activeNodes: ['client', 'gateway', 'laravel', 'database'],
      },
      {
        id: 'database',
        tabLabel: 'Database',
        command: 'php artisan migrate:status',
        endpointLabel: 'MySQL 8.0 InnoDB',
        latencyLabel: '4ms',
        statusLabel: 'Synced',
        sortOrder: 2,
        lines: [
          '$ php artisan migrate:status',
          '  [Ran] 2025_01_10_000001_create_users_and_roles_tables',
          '  [Ran] 2025_01_14_000002_create_orders_and_ledger_tables',
          '  [Ran] 2025_02_03_000003_add_composite_status_index',
          '  Engine: MySQL 8.0 InnoDB · Transactions: ACID Verified',
        ],
        activeNodes: ['laravel', 'database'],
      },
      {
        id: 'auth-queue',
        tabLabel: 'Auth & Queue',
        command: 'php artisan queue:monitor redis:webhooks',
        endpointLabel: 'Sanctum + Redis Worker',
        latencyLabel: '9ms',
        statusLabel: 'Active',
        sortOrder: 3,
        lines: [
          '$ php artisan queue:monitor redis:webhooks',
          '  [OK] Queue [webhooks] ......... Driver: Redis · Backoff: 10s, 60s',
          '  [OK] Sanctum Token Guard ...... Scoped abilities enforced',
          '  [OK] Rate Limiter ............. 60 req/min per IP + token',
        ],
        activeNodes: ['client', 'gateway', 'laravel', 'database'],
      },
    ];

    workflows.forEach((wf) => {
      workflowInsert.run(
        wf.id,
        wf.tabLabel,
        wf.command,
        wf.endpointLabel,
        wf.latencyLabel,
        wf.statusLabel,
        wf.sortOrder,
      );
      wf.lines.forEach((line, lIdx) => {
        lineInsert.run(wf.id, line, lIdx);
      });
      wf.activeNodes.forEach((nodeId) => {
        activeNodeInsert.run(wf.id, nodeId);
      });
    });
  });

  migrateTransaction();
  console.log('Migration completed successfully.');
  if (dbPath !== DB_PATH) {
    db.close();
  }
}

if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runMigration();
}
