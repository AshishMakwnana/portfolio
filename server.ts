import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { runMigration } from './scripts/migrate';
import {
  issueAdminToken,
  requireAdmin,
  verifyAdminCredentials,
  verifyAdminToken,
} from './server/auth';
import { UPLOADS_DIR } from './server/db';
import { queries } from './server/queries';
import { SlidingWindowRateLimiter } from './server/rateLimiter';
import { generateResumePdf } from './src/utils/resumePdf';
import {
  isValidHttpUrl,
  slugifyTitle,
  validateContactInput,
} from './src/utils/validation';

const contactRateLimiter = new SlidingWindowRateLimiter(5, 15 * 60 * 1000);

export function createExpressApp() {
  const app = express();

  app.use(express.json({ limit: '5mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Public API
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.get('/api/portfolio', (_req, res) => {
    try {
      const data = queries.getPublicPortfolio();
      res.json(data);
    } catch (error) {
      console.error('Failed to read portfolio from database:', error);
      res.status(500).json({ error: 'Unable to load portfolio data.' });
    }
  });

  app.get('/api/projects/:slug', (req, res) => {
    try {
      const project = queries.getProjectBySlug(req.params.slug);
      if (!project) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }
      res.json(project);
    } catch (error) {
      console.error('Failed to fetch project by slug:', error);
      res.status(500).json({ error: 'Unable to load project details.' });
    }
  });

  app.get('/api/resume', async (_req, res) => {
    try {
      const data = queries.getPublicPortfolio();
      const preferredFilename = path
        .basename(data.profile.resumeFilename || 'Ashish-Makwana-Resume.pdf')
        .replace(/[^a-zA-Z0-9._-]/g, '_');
      const safeFilename = `${path.parse(preferredFilename).name || 'Ashish-Makwana-Resume'}.pdf`;

      if (data.profile.customResumePath) {
        const resolved = path.join(
          UPLOADS_DIR,
          path.basename(data.profile.customResumePath),
        );
        try {
          const buffer = await fs.readFile(resolved);
          if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
            res.send(buffer);
            return;
          }
        } catch {
          // Fall back to generated resume if custom file is absent
        }
      }

      const resumeBody = generateResumePdf(data);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${safeFilename}"`,
      );
      res.send(resumeBody);
    } catch (error) {
      console.error('Failed to generate resume download:', error);
      res.status(500).json({ error: 'Unable to generate resume.' });
    }
  });

  app.post('/api/contact', (req, res) => {
    const clientIp =
      req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const limit = contactRateLimiter.check(clientIp);
    if (!limit.allowed) {
      res.setHeader('Retry-After', String(limit.retryAfterSeconds));
      res.status(429).json({
        error: `Too many messages sent. Please wait ${limit.retryAfterSeconds} seconds before trying again.`,
      });
      return;
    }

    const validation = validateContactInput({
      name: String(req.body?.name ?? ''),
      email: String(req.body?.email ?? ''),
      subject: String(req.body?.subject ?? ''),
      message: String(req.body?.message ?? ''),
    });

    if (!validation.valid || !validation.sanitized) {
      res.status(400).json({
        error: 'Please review the highlighted fields.',
        fieldErrors: validation.errors,
      });
      return;
    }

    try {
      const createdMessage = queries.createContactMessage(validation.sanitized);
      res.status(201).json({ ok: true, id: createdMessage.id });
    } catch (error) {
      console.error('Failed to save contact message to database:', error);
      res.status(500).json({ error: 'Unable to save your message right now.' });
    }
  });

  // Admin Authentication
  app.post('/api/admin/login', (req, res) => {
    const email = String(req.body?.email ?? '');
    const password = String(req.body?.password ?? '');
    if (!verifyAdminCredentials(email, password)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }
    const token = issueAdminToken(email.trim());
    res.json({ token, email: email.trim() });
  });

  app.get('/api/admin/session', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : '';
    const payload = token ? verifyAdminToken(token) : null;
    if (!payload) {
      res.status(401).json({ authenticated: false });
      return;
    }
    res.json({ authenticated: true, email: payload.email });
  });

  // Protected Admin CRUD Routes
  app.get('/api/admin/dashboard', requireAdmin, (_req, res) => {
    try {
      const dbRecord = queries.getAdminDashboard();
      res.json(dbRecord);
    } catch (error) {
      console.error('Failed to load dashboard from database:', error);
      res.status(500).json({ error: 'Failed to load dashboard data.' });
    }
  });

  app.put('/api/admin/profile', requireAdmin, (req, res) => {
    try {
      const updated = queries.updateProfile(req.body ?? {});
      res.json(updated);
    } catch (error) {
      console.error('Unable to update profile in database:', error);
      res.status(500).json({ error: 'Unable to update profile.' });
    }
  });

  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    try {
      const updated = queries.updateSettings(req.body ?? {});
      res.json(updated);
    } catch (error) {
      console.error('Unable to update website settings in database:', error);
      res.status(500).json({ error: 'Unable to update website settings.' });
    }
  });

  // Skills CRUD
  app.post('/api/admin/skills', requireAdmin, (req, res) => {
    try {
      const { name, category, isPrimary, focusNote } = req.body ?? {};
      if (!name || !category) {
        res.status(400).json({ error: 'Skill name and category are required.' });
        return;
      }
      const created = queries.createSkill({
        name: String(name),
        category: String(category),
        isPrimary: Boolean(isPrimary),
        focusNote: String(focusNote ?? ''),
      });
      res.status(201).json(created);
    } catch (error) {
      console.error('Unable to create skill in database:', error);
      res.status(500).json({ error: 'Unable to create skill.' });
    }
  });

  app.put('/api/admin/skills/:id', requireAdmin, (req, res) => {
    try {
      const updated = queries.updateSkill(req.params.id, req.body ?? {});
      res.json(updated);
    } catch (error) {
      console.error('Unable to update skill in database:', error);
      res.status(500).json({ error: 'Unable to update skill.' });
    }
  });

  app.delete('/api/admin/skills/:id', requireAdmin, (req, res) => {
    try {
      queries.deleteSkill(req.params.id);
      res.json({ ok: true });
    } catch (error) {
      console.error('Unable to delete skill in database:', error);
      res.status(500).json({ error: 'Unable to delete skill.' });
    }
  });

  // Experience CRUD
  app.post('/api/admin/experiences', requireAdmin, (req, res) => {
    try {
      const { company, role, period, location, responsibilities, technologies } =
        req.body ?? {};
      if (!company || !role) {
        res.status(400).json({ error: 'Company and role are required.' });
        return;
      }
      const created = queries.createExperience({
        company: String(company),
        role: String(role),
        period: String(period ?? ''),
        location: String(location ?? ''),
        responsibilities,
        technologies,
      });
      res.status(201).json(created);
    } catch (error) {
      console.error('Unable to create experience entry in database:', error);
      res.status(500).json({ error: 'Unable to create experience entry.' });
    }
  });

  app.put('/api/admin/experiences/:id', requireAdmin, (req, res) => {
    try {
      const updated = queries.updateExperience(req.params.id, req.body ?? {});
      res.json(updated);
    } catch (error) {
      console.error('Unable to update experience entry in database:', error);
      res.status(500).json({ error: 'Unable to update experience entry.' });
    }
  });

  app.delete('/api/admin/experiences/:id', requireAdmin, (req, res) => {
    try {
      queries.deleteExperience(req.params.id);
      res.json({ ok: true });
    } catch (error) {
      console.error('Unable to delete experience entry in database:', error);
      res.status(500).json({ error: 'Unable to delete experience entry.' });
    }
  });

  // Projects CRUD
  app.post('/api/admin/projects', requireAdmin, (req, res) => {
    try {
      const body = req.body ?? {};
      const title = String(body.title ?? '').trim();
      if (!title) {
        res.status(400).json({ error: 'Project title is required.' });
        return;
      }
      const liveUrl = String(body.liveUrl ?? '').trim();
      const githubUrl = String(body.githubUrl ?? '').trim();
      if (
        (liveUrl && !isValidHttpUrl(liveUrl)) ||
        (githubUrl && !isValidHttpUrl(githubUrl))
      ) {
        res.status(400).json({ error: 'Project links must use http or https URLs.' });
        return;
      }

      const baseSlug = slugifyTitle(String(body.slug ?? '') || title);
      let uniqueSlug = baseSlug || `project-${Date.now()}`;
      const existing = queries.getProjectBySlug(uniqueSlug);
      if (existing) {
        uniqueSlug = `${uniqueSlug}-${Date.now().toString().slice(-4)}`;
      }

      const created = queries.createProject({
        title,
        slug: uniqueSlug,
        category: String(body.category ?? 'Backend Systems').trim(),
        status:
          body.status === 'In Progress' ? 'In Progress' : 'Completed',
        featured: Boolean(body.featured),
        shortDescription: String(body.shortDescription ?? '').trim(),
        problemStatement: String(body.problemStatement ?? '').trim(),
        solutionSummary: String(body.solutionSummary ?? '').trim(),
        technicalHighlights: body.technicalHighlights,
        technologies: body.technologies,
        screenshots: body.screenshots,
        liveUrl: liveUrl || undefined,
        githubUrl: githubUrl || undefined,
      });

      res.status(201).json(created);
    } catch (error) {
      console.error('Unable to create project in database:', error);
      res.status(500).json({ error: 'Unable to create project.' });
    }
  });

  app.put('/api/admin/projects/:id', requireAdmin, (req, res) => {
    try {
      const body = req.body ?? {};
      const liveUrl =
        body.liveUrl !== undefined ? String(body.liveUrl).trim() : undefined;
      const githubUrl =
        body.githubUrl !== undefined ? String(body.githubUrl).trim() : undefined;

      if (
        (liveUrl && !isValidHttpUrl(liveUrl)) ||
        (githubUrl && !isValidHttpUrl(githubUrl))
      ) {
        res.status(400).json({ error: 'Project links must use http or https URLs.' });
        return;
      }

      const updated = queries.updateProject(req.params.id, {
        title: body.title,
        slug: body.slug ? slugifyTitle(body.slug) : undefined,
        category: body.category,
        status: body.status,
        featured: body.featured,
        shortDescription: body.shortDescription,
        problemStatement: body.problemStatement,
        solutionSummary: body.solutionSummary,
        technicalHighlights: body.technicalHighlights,
        technologies: body.technologies,
        screenshots: body.screenshots,
        liveUrl,
        githubUrl,
      });

      res.json(updated);
    } catch (error) {
      console.error('Unable to update project in database:', error);
      res.status(500).json({ error: 'Unable to update project.' });
    }
  });

  app.delete('/api/admin/projects/:id', requireAdmin, (req, res) => {
    try {
      queries.deleteProject(req.params.id);
      res.json({ ok: true });
    } catch (error) {
      console.error('Unable to delete project from database:', error);
      res.status(500).json({ error: 'Unable to delete project.' });
    }
  });

  // Education CRUD
  app.post('/api/admin/education', requireAdmin, (req, res) => {
    try {
      const { degree, institution, period, location, description } =
        req.body ?? {};
      if (!degree || !institution) {
        res.status(400).json({ error: 'Degree and institution are required.' });
        return;
      }
      const created = queries.createEducation({
        degree: String(degree),
        institution: String(institution),
        period: String(period ?? ''),
        location: String(location ?? ''),
        description: String(description ?? ''),
      });
      res.status(201).json(created);
    } catch (error) {
      console.error('Unable to create education record in database:', error);
      res.status(500).json({ error: 'Unable to create education record.' });
    }
  });

  app.put('/api/admin/education/:id', requireAdmin, (req, res) => {
    try {
      const updated = queries.updateEducation(req.params.id, req.body ?? {});
      res.json(updated);
    } catch (error) {
      console.error('Unable to update education record in database:', error);
      res.status(500).json({ error: 'Unable to update education record.' });
    }
  });

  app.delete('/api/admin/education/:id', requireAdmin, (req, res) => {
    try {
      queries.deleteEducation(req.params.id);
      res.json({ ok: true });
    } catch (error) {
      console.error('Unable to delete education record from database:', error);
      res.status(500).json({ error: 'Unable to delete education record.' });
    }
  });

  // Certifications CRUD
  app.post('/api/admin/certifications', requireAdmin, (req, res) => {
    try {
      const { title, issuer, date, credentialUrl } = req.body ?? {};
      if (!title || !issuer) {
        res.status(400).json({ error: 'Title and issuer are required.' });
        return;
      }
      const cleanUrl = String(credentialUrl ?? '').trim();
      if (cleanUrl && !isValidHttpUrl(cleanUrl)) {
        res.status(400).json({ error: 'Credential link must use http or https.' });
        return;
      }
      const created = queries.createCertification({
        title: String(title),
        issuer: String(issuer),
        date: String(date ?? ''),
        credentialUrl: cleanUrl || undefined,
      });
      res.status(201).json(created);
    } catch (error) {
      console.error('Unable to create certification in database:', error);
      res.status(500).json({ error: 'Unable to create certification.' });
    }
  });

  app.put('/api/admin/certifications/:id', requireAdmin, (req, res) => {
    try {
      const cleanUrl =
        req.body?.credentialUrl !== undefined
          ? String(req.body.credentialUrl).trim()
          : undefined;
      if (cleanUrl && !isValidHttpUrl(cleanUrl)) {
        res.status(400).json({ error: 'Credential link must use http or https.' });
        return;
      }
      const updated = queries.updateCertification(req.params.id, {
        ...req.body,
        credentialUrl: cleanUrl,
      });
      res.json(updated);
    } catch (error) {
      console.error('Unable to update certification in database:', error);
      res.status(500).json({ error: 'Unable to update certification.' });
    }
  });

  app.delete('/api/admin/certifications/:id', requireAdmin, (req, res) => {
    try {
      queries.deleteCertification(req.params.id);
      res.json({ ok: true });
    } catch (error) {
      console.error('Unable to delete certification from database:', error);
      res.status(500).json({ error: 'Unable to delete certification.' });
    }
  });

  // Contact Messages management
  app.patch('/api/admin/messages/:id/read', requireAdmin, (req, res) => {
    try {
      queries.markMessageRead(
        req.params.id,
        req.body?.read !== undefined ? Boolean(req.body.read) : true,
      );
      res.json({ ok: true });
    } catch (error) {
      console.error('Unable to update message status in database:', error);
      res.status(500).json({ error: 'Unable to update message status.' });
    }
  });

  app.delete('/api/admin/messages/:id', requireAdmin, (req, res) => {
    try {
      queries.deleteMessage(req.params.id);
      res.json({ ok: true });
    } catch (error) {
      console.error('Unable to delete message from database:', error);
      res.status(500).json({ error: 'Unable to delete message.' });
    }
  });

  // Resume Upload & Reset
  app.post('/api/admin/resume', requireAdmin, async (req, res) => {
    try {
      const filename = String(req.body?.filename ?? '').trim();
      const base64Data = String(req.body?.base64Data ?? '').trim();
      const resetToGenerated = Boolean(req.body?.resetToGenerated);

      if (resetToGenerated) {
        queries.updateResumeMetadata(undefined, 'Ashish-Makwana-Resume.pdf');
        res.json(queries.getProfile());
        return;
      }

      if (!filename || !base64Data) {
        res.status(400).json({ error: 'Resume file and filename are required.' });
        return;
      }

      if (path.extname(filename).toLowerCase() !== '.pdf') {
        res.status(400).json({ error: 'Resume must be uploaded as a PDF.' });
        return;
      }

      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.byteLength > 3 * 1024 * 1024) {
        res.status(400).json({ error: 'Resume file must be 3MB or smaller.' });
        return;
      }
      if (buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
        res.status(400).json({ error: 'The uploaded file is not a valid PDF.' });
        return;
      }

      const safeName = `${Date.now()}-${path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      await fs.writeFile(path.join(UPLOADS_DIR, safeName), buffer);

      queries.updateResumeMetadata(safeName, path.basename(filename));
      res.json(queries.getProfile());
    } catch (error) {
      console.error('Unable to update resume in database:', error);
      res.status(500).json({ error: 'Unable to update resume.' });
    }
  });

  // Project Screenshot Upload
  app.post('/api/admin/upload', requireAdmin, async (req, res) => {
    try {
      const filename = String(req.body?.filename ?? 'screenshot.png');
      const dataUrl = String(req.body?.dataUrl ?? '');
      const match = /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/.exec(dataUrl);
      if (!match) {
        res.status(400).json({
          error: 'Only PNG, JPEG, or WebP images are supported.',
        });
        return;
      }

      const ext = match[1].split('/')[1];
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.byteLength > 2 * 1024 * 1024) {
        res.status(400).json({ error: 'Image must be 2MB or smaller.' });
        return;
      }

      const safeBase = path
        .basename(filename, path.extname(filename))
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const storedName = `${Date.now()}-${safeBase}.${ext}`;
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      await fs.writeFile(path.join(UPLOADS_DIR, storedName), buffer);

      res.status(201).json({ url: `/uploads/${storedName}` });
    } catch (error) {
      console.error('Unable to upload image:', error);
      res.status(500).json({ error: 'Unable to upload image.' });
    }
  });

  return app;
}

async function startServer() {
  // Ensure database is initialized and migrated
  runMigration();

  const app = createExpressApp();
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

// Start if executed directly
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  startServer().catch((err) => {
    console.error('Fatal server startup error:', err);
    process.exit(1);
  });
}
