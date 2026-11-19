-- SQLite Database Schema for Developer Portfolio
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- 1. Profile
CREATE TABLE IF NOT EXISTS profile (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL,
    greeting TEXT NOT NULL,
    headline TEXT NOT NULL,
    headline_highlight TEXT NOT NULL,
    designation TEXT NOT NULL,
    availability_text TEXT NOT NULL,
    short_intro TEXT NOT NULL,
    about_heading TEXT NOT NULL,
    about_paragraphs TEXT NOT NULL, -- JSON array of strings
    about_highlights TEXT NOT NULL, -- JSON array of strings
    email TEXT NOT NULL,
    location TEXT NOT NULL,
    resume_filename TEXT NOT NULL DEFAULT 'Ashish-Makwana-Resume.pdf',
    custom_resume_path TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Social Links
CREATE TABLE IF NOT EXISTS social_links (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('github', 'linkedin', 'email')),
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- 3. Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    site_title TEXT NOT NULL,
    meta_description TEXT NOT NULL,
    copyright_year INTEGER NOT NULL DEFAULT 2026,
    footer_tagline TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. Skill Categories & Skills
CREATE TABLE IF NOT EXISTS skill_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES skill_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    is_primary INTEGER NOT NULL DEFAULT 0,
    focus_note TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category_id);
CREATE INDEX IF NOT EXISTS idx_skills_primary ON skills(is_primary);

-- 5. Projects & Child Tables
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Completed', 'In Progress')),
    featured INTEGER NOT NULL DEFAULT 0,
    short_description TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    solution_summary TEXT NOT NULL,
    live_url TEXT,
    github_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);

CREATE TABLE IF NOT EXISTS project_highlights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    highlight TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_proj_highlights_pid ON project_highlights(project_id);

CREATE TABLE IF NOT EXISTS project_technologies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    technology TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_proj_tech_pid ON project_technologies(project_id);

CREATE TABLE IF NOT EXISTS project_screenshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_proj_screen_pid ON project_screenshots(project_id);

-- 6. Experiences & Child Tables
CREATE TABLE IF NOT EXISTS experiences (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    period TEXT NOT NULL,
    location TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS experience_responsibilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experience_id TEXT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    responsibility TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_exp_resp_eid ON experience_responsibilities(experience_id);

CREATE TABLE IF NOT EXISTS experience_technologies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experience_id TEXT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    technology TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_exp_tech_eid ON experience_technologies(experience_id);

-- 7. Education & Certifications
CREATE TABLE IF NOT EXISTS education (
    id TEXT PRIMARY KEY,
    degree TEXT NOT NULL,
    institution TEXT NOT NULL,
    period TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS certifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    date TEXT NOT NULL,
    credential_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- 8. Contact Inquiries
CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    is_read INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_messages_created ON contact_messages(created_at DESC);

-- 9. Hero Architecture Workbench
CREATE TABLE IF NOT EXISTS architecture_nodes (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    layer TEXT NOT NULL,
    protocol TEXT NOT NULL,
    summary TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS architecture_workflows (
    id TEXT PRIMARY KEY CHECK (id IN ('rest-api', 'database', 'auth-queue')),
    tab_label TEXT NOT NULL,
    command TEXT NOT NULL,
    endpoint_label TEXT NOT NULL,
    latency_label TEXT NOT NULL,
    status_label TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workflow_terminal_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workflow_id TEXT NOT NULL REFERENCES architecture_workflows(id) ON DELETE CASCADE,
    line TEXT NOT NULL,
    line_number INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_wf_lines_wid ON workflow_terminal_lines(workflow_id);

CREATE TABLE IF NOT EXISTS workflow_active_nodes (
    workflow_id TEXT NOT NULL REFERENCES architecture_workflows(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL REFERENCES architecture_nodes(id) ON DELETE CASCADE,
    PRIMARY KEY (workflow_id, node_id)
);
