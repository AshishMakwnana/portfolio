import crypto from 'node:crypto';
import { getDb } from './db';
import type {
  AdminDatabaseRecord,
  ArchitectureNode,
  ArchitectureWorkflow,
  CertificationItem,
  ContactMessage,
  EducationItem,
  ExperienceItem,
  PortfolioPayload,
  ProfileData,
  ProjectItem,
  SiteSettings,
  SkillCategory,
  SkillItem,
  SocialLink,
} from '../src/types/portfolio';

export class PortfolioQueries {
  private get db() {
    return getDb();
  }

  // ==========================================================================
  // PUBLIC READ QUERIES
  // ==========================================================================

  public getPublicPortfolio(): PortfolioPayload {
    const profile = this.getProfile();
    const settings = this.getSettings();
    const skills = this.getSkills();
    const experiences = this.getExperiences();
    const projects = this.getProjects();
    const education = this.getEducation();
    const certifications = this.getCertifications();
    const architectureNodes = this.getArchitectureNodes();
    const architectureWorkflows = this.getArchitectureWorkflows();

    return {
      profile,
      settings,
      skills,
      experiences,
      projects,
      education,
      certifications,
      architectureNodes,
      architectureWorkflows,
    };
  }

  public getAdminDashboard(): AdminDatabaseRecord {
    const publicData = this.getPublicPortfolio();
    const messages = this.getContactMessages();

    return {
      ...publicData,
      messages,
    };
  }

  public getProfile(): ProfileData {
    const row = this.db
      .prepare('SELECT * FROM profile WHERE id = ?')
      .get('default') as any;

    if (!row) {
      throw new Error('Profile record not found in database.');
    }

    const socialLinks = this.db
      .prepare('SELECT id, label, url, platform FROM social_links ORDER BY sort_order ASC')
      .all() as SocialLink[];

    let aboutParagraphs: string[] = [];
    let aboutHighlights: string[] = [];

    try {
      aboutParagraphs = JSON.parse(row.about_paragraphs);
    } catch {
      aboutParagraphs = [];
    }

    try {
      aboutHighlights = JSON.parse(row.about_highlights);
    } catch {
      aboutHighlights = [];
    }

    return {
      name: row.name,
      greeting: row.greeting,
      headline: row.headline,
      headlineHighlight: row.headline_highlight,
      designation: row.designation,
      availabilityText: row.availability_text,
      shortIntro: row.short_intro,
      aboutHeading: row.about_heading,
      aboutParagraphs,
      aboutHighlights,
      email: row.email,
      location: row.location,
      resumeFilename: row.resume_filename,
      customResumePath: row.custom_resume_path || undefined,
      socialLinks,
    };
  }

  public getSettings(): SiteSettings {
    const row = this.db
      .prepare('SELECT * FROM site_settings WHERE id = ?')
      .get('default') as any;

    if (!row) {
      return {
        siteTitle: 'Ashish Makwana — Laravel Developer & Backend Engineer',
        metaDescription: 'Personal developer portfolio for Ashish Makwana.',
        copyrightYear: 2026,
        footerTagline: 'Laravel Developer · Backend Engineer · Full-Stack Developer',
      };
    }

    return {
      siteTitle: row.site_title,
      metaDescription: row.meta_description,
      copyrightYear: row.copyright_year,
      footerTagline: row.footer_tagline,
    };
  }

  public getSkills(): SkillItem[] {
    const stmt = this.db.prepare(`
      SELECT s.id, s.name, sc.name as category_name, s.is_primary, s.focus_note
      FROM skills s
      JOIN skill_categories sc ON s.category_id = sc.id
      ORDER BY sc.sort_order ASC, s.sort_order ASC
    `);

    const rows = stmt.all() as any[];

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category_name as SkillCategory,
      isPrimary: Boolean(r.is_primary),
      focusNote: r.focus_note,
    }));
  }

  public getExperiences(): ExperienceItem[] {
    const exps = this.db
      .prepare('SELECT * FROM experiences ORDER BY sort_order ASC')
      .all() as any[];

    const respStmt = this.db.prepare(
      'SELECT responsibility FROM experience_responsibilities WHERE experience_id = ? ORDER BY sort_order ASC',
    );
    const techStmt = this.db.prepare(
      'SELECT technology FROM experience_technologies WHERE experience_id = ? ORDER BY sort_order ASC',
    );

    return exps.map((e) => {
      const responsibilities = (respStmt.all(e.id) as any[]).map(
        (r) => r.responsibility,
      );
      const technologies = (techStmt.all(e.id) as any[]).map(
        (t) => t.technology,
      );

      return {
        id: e.id,
        company: e.company,
        role: e.role,
        period: e.period,
        location: e.location,
        responsibilities,
        technologies,
      };
    });
  }

  public getProjects(): ProjectItem[] {
    const projs = this.db
      .prepare('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC')
      .all() as any[];

    const highlightStmt = this.db.prepare(
      'SELECT highlight FROM project_highlights WHERE project_id = ? ORDER BY sort_order ASC',
    );
    const techStmt = this.db.prepare(
      'SELECT technology FROM project_technologies WHERE project_id = ? ORDER BY sort_order ASC',
    );
    const screenStmt = this.db.prepare(
      'SELECT image_url FROM project_screenshots WHERE project_id = ? ORDER BY sort_order ASC',
    );

    return projs.map((p) => {
      const technicalHighlights = (highlightStmt.all(p.id) as any[]).map(
        (h) => h.highlight,
      );
      const technologies = (techStmt.all(p.id) as any[]).map(
        (t) => t.technology,
      );
      const screenshots = (screenStmt.all(p.id) as any[]).map(
        (s) => s.image_url,
      );

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        status: p.status,
        featured: Boolean(p.featured),
        shortDescription: p.short_description,
        problemStatement: p.problem_statement,
        solutionSummary: p.solution_summary,
        technicalHighlights,
        technologies,
        screenshots,
        liveUrl: p.live_url || undefined,
        githubUrl: p.github_url || undefined,
      };
    });
  }

  public getProjectBySlug(slug: string): ProjectItem | null {
    const p = this.db
      .prepare('SELECT * FROM projects WHERE slug = ?')
      .get(slug) as any;

    if (!p) return null;

    const technicalHighlights = (
      this.db
        .prepare(
          'SELECT highlight FROM project_highlights WHERE project_id = ? ORDER BY sort_order ASC',
        )
        .all(p.id) as any[]
    ).map((h) => h.highlight);

    const technologies = (
      this.db
        .prepare(
          'SELECT technology FROM project_technologies WHERE project_id = ? ORDER BY sort_order ASC',
        )
        .all(p.id) as any[]
    ).map((t) => t.technology);

    const screenshots = (
      this.db
        .prepare(
          'SELECT image_url FROM project_screenshots WHERE project_id = ? ORDER BY sort_order ASC',
        )
        .all(p.id) as any[]
    ).map((s) => s.image_url);

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      category: p.category,
      status: p.status,
      featured: Boolean(p.featured),
      shortDescription: p.short_description,
      problemStatement: p.problem_statement,
      solutionSummary: p.solution_summary,
      technicalHighlights,
      technologies,
      screenshots,
      liveUrl: p.live_url || undefined,
      githubUrl: p.github_url || undefined,
    };
  }

  public getEducation(): EducationItem[] {
    const rows = this.db
      .prepare('SELECT * FROM education ORDER BY sort_order ASC')
      .all() as any[];

    return rows.map((e) => ({
      id: e.id,
      degree: e.degree,
      institution: e.institution,
      period: e.period,
      location: e.location,
      description: e.description || undefined,
    }));
  }

  public getCertifications(): CertificationItem[] {
    const rows = this.db
      .prepare('SELECT * FROM certifications ORDER BY sort_order ASC')
      .all() as any[];

    return rows.map((c) => ({
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      date: c.date,
      credentialUrl: c.credential_url || undefined,
    }));
  }

  public getContactMessages(): ContactMessage[] {
    const rows = this.db
      .prepare('SELECT * FROM contact_messages ORDER BY created_at DESC')
      .all() as any[];

    return rows.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message,
      createdAt: m.created_at,
      read: Boolean(m.is_read),
    }));
  }

  public getArchitectureNodes(): ArchitectureNode[] {
    const nodes = this.db
      .prepare('SELECT * FROM architecture_nodes ORDER BY sort_order ASC')
      .all() as any[];

    const activeWfStmt = this.db.prepare(
      'SELECT workflow_id FROM workflow_active_nodes WHERE node_id = ?',
    );

    return nodes.map((n) => {
      const activeInWorkflows = (activeWfStmt.all(n.id) as any[]).map(
        (w) => w.workflow_id,
      );
      return {
        id: n.id,
        label: n.label,
        layer: n.layer,
        protocol: n.protocol,
        summary: n.summary,
        activeInWorkflows,
      };
    });
  }

  public getArchitectureWorkflows(): ArchitectureWorkflow[] {
    const wfs = this.db
      .prepare('SELECT * FROM architecture_workflows ORDER BY sort_order ASC')
      .all() as any[];

    const lineStmt = this.db.prepare(
      'SELECT line FROM workflow_terminal_lines WHERE workflow_id = ? ORDER BY line_number ASC',
    );
    const nodeStmt = this.db.prepare(
      'SELECT node_id FROM workflow_active_nodes WHERE workflow_id = ?',
    );

    return wfs.map((w) => {
      const terminalLines = (lineStmt.all(w.id) as any[]).map((l) => l.line);
      const activeNodeIds = (nodeStmt.all(w.id) as any[]).map(
        (n) => n.node_id,
      );

      return {
        id: w.id as 'rest-api' | 'database' | 'auth-queue',
        tabLabel: w.tab_label,
        command: w.command,
        endpointLabel: w.endpoint_label,
        latencyLabel: w.latency_label,
        statusLabel: w.status_label,
        terminalLines,
        activeNodeIds,
      };
    });
  }

  // ==========================================================================
  // PUBLIC MUTATIONS
  // ==========================================================================

  public createContactMessage(msg: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): ContactMessage {
    const id = `msg-${crypto.randomUUID()}`;
    const createdAt = new Date().toISOString();

    this.db
      .prepare(`
        INSERT INTO contact_messages (id, name, email, subject, message, created_at, is_read)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `)
      .run(id, msg.name, msg.email, msg.subject, msg.message, createdAt);

    return {
      id,
      name: msg.name,
      email: msg.email,
      subject: msg.subject,
      message: msg.message,
      createdAt,
      read: false,
    };
  }

  // ==========================================================================
  // ADMIN MUTATIONS
  // ==========================================================================

  public updateProfile(data: Partial<ProfileData>): ProfileData {
    const current = this.getProfile();
    const updated: ProfileData = {
      ...current,
      ...data,
      name: (data.name ?? current.name).trim(),
      greeting: (data.greeting ?? current.greeting).trim(),
      headline: (data.headline ?? current.headline).trim(),
      headlineHighlight: (
        data.headlineHighlight ?? current.headlineHighlight
      ).trim(),
      designation: (data.designation ?? current.designation).trim(),
      availabilityText: (
        data.availabilityText ?? current.availabilityText
      ).trim(),
      shortIntro: (data.shortIntro ?? current.shortIntro).trim(),
      aboutHeading: (data.aboutHeading ?? current.aboutHeading).trim(),
      email: (data.email ?? current.email).trim(),
      location: (data.location ?? current.location).trim(),
      resumeFilename: (data.resumeFilename ?? current.resumeFilename).trim(),
      customResumePath: data.customResumePath ?? current.customResumePath,
      aboutParagraphs: Array.isArray(data.aboutParagraphs)
        ? data.aboutParagraphs.map((p) => String(p).trim()).filter(Boolean)
        : current.aboutParagraphs,
      aboutHighlights: Array.isArray(data.aboutHighlights)
        ? data.aboutHighlights.map((h) => String(h).trim()).filter(Boolean)
        : current.aboutHighlights,
      socialLinks: Array.isArray(data.socialLinks)
        ? data.socialLinks
        : current.socialLinks,
    };

    const updateTx = this.db.transaction(() => {
      this.db
        .prepare(`
          UPDATE profile SET
            name = @name,
            greeting = @greeting,
            headline = @headline,
            headline_highlight = @headline_highlight,
            designation = @designation,
            availability_text = @availability_text,
            short_intro = @short_intro,
            about_heading = @about_heading,
            about_paragraphs = @about_paragraphs,
            about_highlights = @about_highlights,
            email = @email,
            location = @location,
            resume_filename = @resume_filename,
            custom_resume_path = @custom_resume_path,
            updated_at = datetime('now')
          WHERE id = 'default'
        `)
        .run({
          name: updated.name,
          greeting: updated.greeting,
          headline: updated.headline,
          headline_highlight: updated.headlineHighlight,
          designation: updated.designation,
          availability_text: updated.availabilityText,
          short_intro: updated.shortIntro,
          about_heading: updated.aboutHeading,
          about_paragraphs: JSON.stringify(updated.aboutParagraphs),
          about_highlights: JSON.stringify(updated.aboutHighlights),
          email: updated.email,
          location: updated.location,
          resume_filename: updated.resumeFilename,
          custom_resume_path: updated.customResumePath || null,
        });

      if (Array.isArray(data.socialLinks)) {
        this.db.prepare('DELETE FROM social_links').run();
        const insertSocial = this.db.prepare(`
          INSERT INTO social_links (id, label, url, platform, sort_order)
          VALUES (?, ?, ?, ?, ?)
        `);
        data.socialLinks.forEach((link, idx) => {
          insertSocial.run(link.id, link.label, link.url, link.platform, idx);
        });
      }
    });

    updateTx();
    return this.getProfile();
  }

  public updateSettings(data: Partial<SiteSettings>): SiteSettings {
    const current = this.getSettings();
    const updated: SiteSettings = {
      siteTitle: (data.siteTitle ?? current.siteTitle).trim(),
      metaDescription: (data.metaDescription ?? current.metaDescription).trim(),
      copyrightYear:
        Number(data.copyrightYear ?? current.copyrightYear) || 2026,
      footerTagline: (data.footerTagline ?? current.footerTagline).trim(),
    };

    this.db
      .prepare(`
        UPDATE site_settings SET
          site_title = ?,
          meta_description = ?,
          copyright_year = ?,
          footer_tagline = ?,
          updated_at = datetime('now')
        WHERE id = 'default'
      `)
      .run(
        updated.siteTitle,
        updated.metaDescription,
        updated.copyrightYear,
        updated.footerTagline,
      );

    return updated;
  }

  public createSkill(item: {
    name: string;
    category: string;
    isPrimary?: boolean;
    focusNote?: string;
  }): SkillItem {
    const id = `skill-${crypto.randomUUID()}`;
    const name = item.name.trim();
    const categoryName = item.category.trim();
    const isPrimary = item.isPrimary ? 1 : 0;
    const focusNote = (item.focusNote ?? '').trim();

    const tx = this.db.transaction(() => {
      let cat = this.db
        .prepare('SELECT id FROM skill_categories WHERE name = ?')
        .get(categoryName) as any;

      if (!cat) {
        const catId = `cat-${crypto.randomUUID().slice(0, 8)}`;
        const maxSort = (
          this.db
            .prepare('SELECT MAX(sort_order) as maxSort FROM skill_categories')
            .get() as any
        )?.maxSort || 0;
        this.db
          .prepare(
            'INSERT INTO skill_categories (id, name, sort_order) VALUES (?, ?, ?)',
          )
          .run(catId, categoryName, maxSort + 1);
        cat = { id: catId };
      }

      const maxSkillSort = (
        this.db
          .prepare(
            'SELECT MAX(sort_order) as maxSort FROM skills WHERE category_id = ?',
          )
          .get(cat.id) as any
      )?.maxSort || 0;

      this.db
        .prepare(`
          INSERT INTO skills (id, name, category_id, is_primary, focus_note, sort_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .run(id, name, cat.id, isPrimary, focusNote, maxSkillSort + 1);
    });

    tx();

    return {
      id,
      name,
      category: categoryName as SkillCategory,
      isPrimary: Boolean(isPrimary),
      focusNote,
    };
  }

  public updateSkill(
    id: string,
    item: {
      name?: string;
      category?: string;
      isPrimary?: boolean;
      focusNote?: string;
    },
  ): SkillItem {
    const existing = this.db
      .prepare(`
        SELECT s.*, sc.name as category_name
        FROM skills s
        JOIN skill_categories sc ON s.category_id = sc.id
        WHERE s.id = ?
      `)
      .get(id) as any;

    if (!existing) {
      throw new Error(`Skill ${id} not found.`);
    }

    const name = item.name !== undefined ? item.name.trim() : existing.name;
    const categoryName =
      item.category !== undefined
        ? item.category.trim()
        : existing.category_name;
    const isPrimary =
      item.isPrimary !== undefined ? (item.isPrimary ? 1 : 0) : existing.is_primary;
    const focusNote =
      item.focusNote !== undefined
        ? item.focusNote.trim()
        : existing.focus_note;

    const tx = this.db.transaction(() => {
      let cat = this.db
        .prepare('SELECT id FROM skill_categories WHERE name = ?')
        .get(categoryName) as any;

      if (!cat) {
        const catId = `cat-${crypto.randomUUID().slice(0, 8)}`;
        this.db
          .prepare(
            'INSERT INTO skill_categories (id, name, sort_order) VALUES (?, ?, 99)',
          )
          .run(catId, categoryName);
        cat = { id: catId };
      }

      this.db
        .prepare(`
          UPDATE skills SET
            name = ?,
            category_id = ?,
            is_primary = ?,
            focus_note = ?
          WHERE id = ?
        `)
        .run(name, cat.id, isPrimary, focusNote, id);
    });

    tx();

    return {
      id,
      name,
      category: categoryName as SkillCategory,
      isPrimary: Boolean(isPrimary),
      focusNote,
    };
  }

  public deleteSkill(id: string): void {
    this.db.prepare('DELETE FROM skills WHERE id = ?').run(id);
  }

  public createExperience(exp: {
    company: string;
    role: string;
    period?: string;
    location?: string;
    responsibilities?: string[];
    technologies?: string[];
  }): ExperienceItem {
    const id = `exp-${crypto.randomUUID()}`;
    const company = exp.company.trim();
    const role = exp.role.trim();
    const period = (exp.period ?? '').trim();
    const location = (exp.location ?? '').trim();
    const responsibilities = Array.isArray(exp.responsibilities)
      ? exp.responsibilities.map((r) => String(r).trim()).filter(Boolean)
      : [];
    const technologies = Array.isArray(exp.technologies)
      ? exp.technologies.map((t) => String(t).trim()).filter(Boolean)
      : [];

    const tx = this.db.transaction(() => {
      const maxSort = (
        this.db
          .prepare('SELECT MAX(sort_order) as maxSort FROM experiences')
          .get() as any
      )?.maxSort || 0;

      this.db
        .prepare(`
          INSERT INTO experiences (id, company, role, period, location, sort_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .run(id, company, role, period, location, maxSort + 1);

      const respInsert = this.db.prepare(`
        INSERT INTO experience_responsibilities (experience_id, responsibility, sort_order)
        VALUES (?, ?, ?)
      `);
      responsibilities.forEach((r, idx) => respInsert.run(id, r, idx));

      const techInsert = this.db.prepare(`
        INSERT INTO experience_technologies (experience_id, technology, sort_order)
        VALUES (?, ?, ?)
      `);
      technologies.forEach((t, idx) => techInsert.run(id, t, idx));
    });

    tx();

    return {
      id,
      company,
      role,
      period,
      location,
      responsibilities,
      technologies,
    };
  }

  public updateExperience(
    id: string,
    exp: {
      company?: string;
      role?: string;
      period?: string;
      location?: string;
      responsibilities?: string[];
      technologies?: string[];
    },
  ): ExperienceItem {
    const existing = this.db
      .prepare('SELECT * FROM experiences WHERE id = ?')
      .get(id) as any;

    if (!existing) {
      throw new Error(`Experience ${id} not found.`);
    }

    const company =
      exp.company !== undefined ? exp.company.trim() : existing.company;
    const role = exp.role !== undefined ? exp.role.trim() : existing.role;
    const period =
      exp.period !== undefined ? exp.period.trim() : existing.period;
    const location =
      exp.location !== undefined ? exp.location.trim() : existing.location;

    const tx = this.db.transaction(() => {
      this.db
        .prepare(`
          UPDATE experiences SET company = ?, role = ?, period = ?, location = ?
          WHERE id = ?
        `)
        .run(company, role, period, location, id);

      if (Array.isArray(exp.responsibilities)) {
        this.db
          .prepare(
            'DELETE FROM experience_responsibilities WHERE experience_id = ?',
          )
          .run(id);
        const respInsert = this.db.prepare(`
          INSERT INTO experience_responsibilities (experience_id, responsibility, sort_order)
          VALUES (?, ?, ?)
        `);
        exp.responsibilities
          .map((r) => String(r).trim())
          .filter(Boolean)
          .forEach((r, idx) => respInsert.run(id, r, idx));
      }

      if (Array.isArray(exp.technologies)) {
        this.db
          .prepare('DELETE FROM experience_technologies WHERE experience_id = ?')
          .run(id);
        const techInsert = this.db.prepare(`
          INSERT INTO experience_technologies (experience_id, technology, sort_order)
          VALUES (?, ?, ?)
        `);
        exp.technologies
          .map((t) => String(t).trim())
          .filter(Boolean)
          .forEach((t, idx) => techInsert.run(id, t, idx));
      }
    });

    tx();

    return (
      this.getExperiences().find((e) => e.id === id) || {
        id,
        company,
        role,
        period,
        location,
        responsibilities: exp.responsibilities || [],
        technologies: exp.technologies || [],
      }
    );
  }

  public deleteExperience(id: string): void {
    this.db.prepare('DELETE FROM experiences WHERE id = ?').run(id);
  }

  public createProject(proj: {
    title: string;
    slug: string;
    category?: string;
    status?: 'Completed' | 'In Progress';
    featured?: boolean;
    shortDescription?: string;
    problemStatement?: string;
    solutionSummary?: string;
    technicalHighlights?: string[];
    technologies?: string[];
    screenshots?: string[];
    liveUrl?: string;
    githubUrl?: string;
  }): ProjectItem {
    const id = `proj-${crypto.randomUUID()}`;
    const title = proj.title.trim();
    const slug = proj.slug.trim();
    const category = (proj.category ?? 'Backend Systems').trim();
    const status = proj.status === 'In Progress' ? 'In Progress' : 'Completed';
    const featured = proj.featured ? 1 : 0;
    const shortDescription = (proj.shortDescription ?? '').trim();
    const problemStatement = (proj.problemStatement ?? '').trim();
    const solutionSummary = (proj.solutionSummary ?? '').trim();
    const liveUrl = proj.liveUrl?.trim() || null;
    const githubUrl = proj.githubUrl?.trim() || null;

    const technicalHighlights = Array.isArray(proj.technicalHighlights)
      ? proj.technicalHighlights.map((h) => String(h).trim()).filter(Boolean)
      : [];
    const technologies = Array.isArray(proj.technologies)
      ? proj.technologies.map((t) => String(t).trim()).filter(Boolean)
      : [];
    const screenshots = Array.isArray(proj.screenshots)
      ? proj.screenshots.map((s) => String(s).trim()).filter(Boolean)
      : [];

    const tx = this.db.transaction(() => {
      const maxSort = (
        this.db
          .prepare('SELECT MAX(sort_order) as maxSort FROM projects')
          .get() as any
      )?.maxSort || 0;

      this.db
        .prepare(`
          INSERT INTO projects (
            id, slug, title, category, status, featured, short_description,
            problem_statement, solution_summary, live_url, github_url, sort_order, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `)
        .run(
          id,
          slug,
          title,
          category,
          status,
          featured,
          shortDescription,
          problemStatement,
          solutionSummary,
          liveUrl,
          githubUrl,
          maxSort + 1,
        );

      const hInsert = this.db.prepare(`
        INSERT INTO project_highlights (project_id, highlight, sort_order)
        VALUES (?, ?, ?)
      `);
      technicalHighlights.forEach((h, idx) => hInsert.run(id, h, idx));

      const tInsert = this.db.prepare(`
        INSERT INTO project_technologies (project_id, technology, sort_order)
        VALUES (?, ?, ?)
      `);
      technologies.forEach((t, idx) => tInsert.run(id, t, idx));

      const sInsert = this.db.prepare(`
        INSERT INTO project_screenshots (project_id, image_url, sort_order)
        VALUES (?, ?, ?)
      `);
      screenshots.forEach((s, idx) => sInsert.run(id, s, idx));
    });

    tx();

    return {
      id,
      slug,
      title,
      category,
      status,
      featured: Boolean(featured),
      shortDescription,
      problemStatement,
      solutionSummary,
      technicalHighlights,
      technologies,
      screenshots,
      liveUrl: liveUrl || undefined,
      githubUrl: githubUrl || undefined,
    };
  }

  public updateProject(
    id: string,
    proj: {
      title?: string;
      slug?: string;
      category?: string;
      status?: 'Completed' | 'In Progress';
      featured?: boolean;
      shortDescription?: string;
      problemStatement?: string;
      solutionSummary?: string;
      technicalHighlights?: string[];
      technologies?: string[];
      screenshots?: string[];
      liveUrl?: string;
      githubUrl?: string;
    },
  ): ProjectItem {
    const existing = this.db
      .prepare('SELECT * FROM projects WHERE id = ?')
      .get(id) as any;

    if (!existing) {
      throw new Error(`Project ${id} not found.`);
    }

    const title = proj.title !== undefined ? proj.title.trim() : existing.title;
    const slug = proj.slug !== undefined ? proj.slug.trim() : existing.slug;
    const category =
      proj.category !== undefined ? proj.category.trim() : existing.category;
    const status =
      proj.status === 'In Progress' || proj.status === 'Completed'
        ? proj.status
        : existing.status;
    const featured =
      proj.featured !== undefined ? (proj.featured ? 1 : 0) : existing.featured;
    const shortDescription =
      proj.shortDescription !== undefined
        ? proj.shortDescription.trim()
        : existing.short_description;
    const problemStatement =
      proj.problemStatement !== undefined
        ? proj.problemStatement.trim()
        : existing.problem_statement;
    const solutionSummary =
      proj.solutionSummary !== undefined
        ? proj.solutionSummary.trim()
        : existing.solution_summary;
    const liveUrl =
      proj.liveUrl !== undefined
        ? proj.liveUrl.trim() || null
        : existing.live_url;
    const githubUrl =
      proj.githubUrl !== undefined
        ? proj.githubUrl.trim() || null
        : existing.github_url;

    const tx = this.db.transaction(() => {
      this.db
        .prepare(`
          UPDATE projects SET
            title = ?, slug = ?, category = ?, status = ?, featured = ?,
            short_description = ?, problem_statement = ?, solution_summary = ?,
            live_url = ?, github_url = ?, updated_at = datetime('now')
          WHERE id = ?
        `)
        .run(
          title,
          slug,
          category,
          status,
          featured,
          shortDescription,
          problemStatement,
          solutionSummary,
          liveUrl,
          githubUrl,
          id,
        );

      if (Array.isArray(proj.technicalHighlights)) {
        this.db
          .prepare('DELETE FROM project_highlights WHERE project_id = ?')
          .run(id);
        const hInsert = this.db.prepare(`
          INSERT INTO project_highlights (project_id, highlight, sort_order)
          VALUES (?, ?, ?)
        `);
        proj.technicalHighlights
          .map((h) => String(h).trim())
          .filter(Boolean)
          .forEach((h, idx) => hInsert.run(id, h, idx));
      }

      if (Array.isArray(proj.technologies)) {
        this.db
          .prepare('DELETE FROM project_technologies WHERE project_id = ?')
          .run(id);
        const tInsert = this.db.prepare(`
          INSERT INTO project_technologies (project_id, technology, sort_order)
          VALUES (?, ?, ?)
        `);
        proj.technologies
          .map((t) => String(t).trim())
          .filter(Boolean)
          .forEach((t, idx) => tInsert.run(id, t, idx));
      }

      if (Array.isArray(proj.screenshots)) {
        this.db
          .prepare('DELETE FROM project_screenshots WHERE project_id = ?')
          .run(id);
        const sInsert = this.db.prepare(`
          INSERT INTO project_screenshots (project_id, image_url, sort_order)
          VALUES (?, ?, ?)
        `);
        proj.screenshots
          .map((s) => String(s).trim())
          .filter(Boolean)
          .forEach((s, idx) => sInsert.run(id, s, idx));
      }
    });

    tx();

    return this.getProjectBySlug(slug)!;
  }

  public deleteProject(id: string): void {
    this.db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  }

  public createEducation(edu: {
    degree: string;
    institution: string;
    period?: string;
    location?: string;
    description?: string;
  }): EducationItem {
    const id = `edu-${crypto.randomUUID()}`;
    const degree = edu.degree.trim();
    const institution = edu.institution.trim();
    const period = (edu.period ?? '').trim();
    const location = (edu.location ?? '').trim();
    const description = (edu.description ?? '').trim();

    const maxSort = (
      this.db
        .prepare('SELECT MAX(sort_order) as maxSort FROM education')
        .get() as any
    )?.maxSort || 0;

    this.db
      .prepare(`
        INSERT INTO education (id, degree, institution, period, location, description, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(id, degree, institution, period, location, description, maxSort + 1);

    return { id, degree, institution, period, location, description };
  }

  public updateEducation(
    id: string,
    edu: {
      degree?: string;
      institution?: string;
      period?: string;
      location?: string;
      description?: string;
    },
  ): EducationItem {
    const existing = this.db
      .prepare('SELECT * FROM education WHERE id = ?')
      .get(id) as any;

    if (!existing) throw new Error(`Education ${id} not found.`);

    const degree =
      edu.degree !== undefined ? edu.degree.trim() : existing.degree;
    const institution =
      edu.institution !== undefined
        ? edu.institution.trim()
        : existing.institution;
    const period = edu.period !== undefined ? edu.period.trim() : existing.period;
    const location =
      edu.location !== undefined ? edu.location.trim() : existing.location;
    const description =
      edu.description !== undefined
        ? edu.description.trim()
        : existing.description;

    this.db
      .prepare(`
        UPDATE education SET degree = ?, institution = ?, period = ?, location = ?, description = ?
        WHERE id = ?
      `)
      .run(degree, institution, period, location, description, id);

    return { id, degree, institution, period, location, description };
  }

  public deleteEducation(id: string): void {
    this.db.prepare('DELETE FROM education WHERE id = ?').run(id);
  }

  public createCertification(cert: {
    title: string;
    issuer: string;
    date?: string;
    credentialUrl?: string;
  }): CertificationItem {
    const id = `cert-${crypto.randomUUID()}`;
    const title = cert.title.trim();
    const issuer = cert.issuer.trim();
    const date = (cert.date ?? '').trim();
    const credentialUrl = cert.credentialUrl?.trim() || null;

    const maxSort = (
      this.db
        .prepare('SELECT MAX(sort_order) as maxSort FROM certifications')
        .get() as any
    )?.maxSort || 0;

    this.db
      .prepare(`
        INSERT INTO certifications (id, title, issuer, date, credential_url, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(id, title, issuer, date, credentialUrl, maxSort + 1);

    return {
      id,
      title,
      issuer,
      date,
      credentialUrl: credentialUrl || undefined,
    };
  }

  public updateCertification(
    id: string,
    cert: {
      title?: string;
      issuer?: string;
      date?: string;
      credentialUrl?: string;
    },
  ): CertificationItem {
    const existing = this.db
      .prepare('SELECT * FROM certifications WHERE id = ?')
      .get(id) as any;

    if (!existing) throw new Error(`Certification ${id} not found.`);

    const title = cert.title !== undefined ? cert.title.trim() : existing.title;
    const issuer =
      cert.issuer !== undefined ? cert.issuer.trim() : existing.issuer;
    const date = cert.date !== undefined ? cert.date.trim() : existing.date;
    const credentialUrl =
      cert.credentialUrl !== undefined
        ? cert.credentialUrl.trim() || null
        : existing.credential_url;

    this.db
      .prepare(`
        UPDATE certifications SET title = ?, issuer = ?, date = ?, credential_url = ?
        WHERE id = ?
      `)
      .run(title, issuer, date, credentialUrl, id);

    return {
      id,
      title,
      issuer,
      date,
      credentialUrl: credentialUrl || undefined,
    };
  }

  public deleteCertification(id: string): void {
    this.db.prepare('DELETE FROM certifications WHERE id = ?').run(id);
  }

  public markMessageRead(id: string, isRead: boolean): void {
    this.db
      .prepare('UPDATE contact_messages SET is_read = ? WHERE id = ?')
      .run(isRead ? 1 : 0, id);
  }

  public deleteMessage(id: string): void {
    this.db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
  }

  public updateResumeMetadata(
    customResumePath?: string,
    resumeFilename?: string,
  ): void {
    this.db
      .prepare(`
        UPDATE profile SET
          custom_resume_path = ?,
          resume_filename = COALESCE(?, resume_filename),
          updated_at = datetime('now')
        WHERE id = 'default'
      `)
      .run(customResumePath || null, resumeFilename || null);
  }
}

export const queries = new PortfolioQueries();
