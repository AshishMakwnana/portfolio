export type ProjectStatus = 'Completed' | 'In Progress';

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  platform: 'github' | 'linkedin' | 'email';
}

export interface ProfileData {
  name: string;
  greeting: string;
  headline: string;
  headlineHighlight: string;
  designation: string;
  availabilityText: string;
  shortIntro: string;
  aboutHeading: string;
  aboutParagraphs: string[];
  aboutHighlights: string[];
  email: string;
  location: string;
  resumeFilename: string;
  customResumePath?: string;
  socialLinks: SocialLink[];
}

export type SkillCategory =
  | 'Architecture & System Design'
  | 'Backend Engineering'
  | 'Databases & Modeling'
  | 'Software Quality & Testing'
  | 'DevOps & Infrastructure'
  | 'Observability & Security'
  | 'Frontend Development'
  | 'Development Tools'
  | (string & {});

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  isPrimary: boolean;
  focusNote: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  responsibilities: string[];
  technologies: string[];
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: ProjectStatus;
  featured: boolean;
  shortDescription: string;
  problemStatement: string;
  solutionSummary: string;
  technicalHighlights: string[];
  technologies: string[];
  screenshots?: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  location: string;
  description?: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  layer: string;
  protocol: string;
  summary: string;
  activeInWorkflows: string[];
}

export interface ArchitectureWorkflow {
  id: 'rest-api' | 'database' | 'auth-queue';
  tabLabel: string;
  command: string;
  endpointLabel: string;
  latencyLabel: string;
  statusLabel: string;
  terminalLines: string[];
  activeNodeIds: string[];
}

export interface SiteSettings {
  siteTitle: string;
  metaDescription: string;
  copyrightYear: number;
  footerTagline: string;
}

export interface PortfolioPayload {
  profile: ProfileData;
  skills: SkillItem[];
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  architectureNodes: ArchitectureNode[];
  architectureWorkflows: ArchitectureWorkflow[];
  settings: SiteSettings;
}

export interface AdminDatabaseRecord extends PortfolioPayload {
  messages: ContactMessage[];
}
