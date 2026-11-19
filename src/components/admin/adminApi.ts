import type {
  AdminDatabaseRecord,
  CertificationItem,
  EducationItem,
  ExperienceItem,
  ProfileData,
  ProjectItem,
  SiteSettings,
  SkillItem,
} from '../../types/portfolio';

const TOKEN_STORAGE_KEY = 'portfolio_admin_token';

export function getStoredAdminToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage restriction
  }
}

async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredAdminToken();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & T;

  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }

  return payload;
}

export const adminApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; email: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  checkSession: () =>
    apiRequest<{ authenticated: boolean; email?: string }>('/api/admin/session'),

  fetchDashboard: () =>
    apiRequest<AdminDatabaseRecord>('/api/admin/dashboard'),

  saveProfile: (profile: Partial<ProfileData>) =>
    apiRequest<ProfileData>('/api/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  saveSettings: (settings: SiteSettings) =>
    apiRequest<SiteSettings>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  createSkill: (skill: Omit<SkillItem, 'id'>) =>
    apiRequest<SkillItem>('/api/admin/skills', {
      method: 'POST',
      body: JSON.stringify(skill),
    }),

  updateSkill: (id: string, skill: Partial<SkillItem>) =>
    apiRequest<SkillItem>(`/api/admin/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skill),
    }),

  deleteSkill: (id: string) =>
    apiRequest<{ ok: boolean }>(`/api/admin/skills/${id}`, {
      method: 'DELETE',
    }),

  createExperience: (exp: Omit<ExperienceItem, 'id'>) =>
    apiRequest<ExperienceItem>('/api/admin/experiences', {
      method: 'POST',
      body: JSON.stringify(exp),
    }),

  updateExperience: (id: string, exp: Partial<ExperienceItem>) =>
    apiRequest<ExperienceItem>(`/api/admin/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(exp),
    }),

  deleteExperience: (id: string) =>
    apiRequest<{ ok: boolean }>(`/api/admin/experiences/${id}`, {
      method: 'DELETE',
    }),

  createProject: (project: Omit<ProjectItem, 'id'>) =>
    apiRequest<ProjectItem>('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    }),

  updateProject: (id: string, project: Partial<ProjectItem>) =>
    apiRequest<ProjectItem>(`/api/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    }),

  deleteProject: (id: string) =>
    apiRequest<{ ok: boolean }>(`/api/admin/projects/${id}`, {
      method: 'DELETE',
    }),

  createEducation: (edu: Omit<EducationItem, 'id'>) =>
    apiRequest<EducationItem>('/api/admin/education', {
      method: 'POST',
      body: JSON.stringify(edu),
    }),

  updateEducation: (id: string, edu: Partial<EducationItem>) =>
    apiRequest<EducationItem>(`/api/admin/education/${id}`, {
      method: 'PUT',
      body: JSON.stringify(edu),
    }),

  deleteEducation: (id: string) =>
    apiRequest<{ ok: boolean }>(`/api/admin/education/${id}`, {
      method: 'DELETE',
    }),

  createCertification: (cert: Omit<CertificationItem, 'id'>) =>
    apiRequest<CertificationItem>('/api/admin/certifications', {
      method: 'POST',
      body: JSON.stringify(cert),
    }),

  updateCertification: (id: string, cert: Partial<CertificationItem>) =>
    apiRequest<CertificationItem>(`/api/admin/certifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cert),
    }),

  deleteCertification: (id: string) =>
    apiRequest<{ ok: boolean }>(`/api/admin/certifications/${id}`, {
      method: 'DELETE',
    }),

  markMessageRead: (id: string, read: boolean) =>
    apiRequest<{ ok: boolean }>(`/api/admin/messages/${id}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ read }),
    }),

  deleteMessage: (id: string) =>
    apiRequest<{ ok: boolean }>(`/api/admin/messages/${id}`, {
      method: 'DELETE',
    }),

  uploadResume: (payload: {
    filename?: string;
    base64Data?: string;
    resetToGenerated?: boolean;
  }) =>
    apiRequest<ProfileData>('/api/admin/resume', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  uploadImage: (filename: string, dataUrl: string) =>
    apiRequest<{ url: string }>('/api/admin/upload', {
      method: 'POST',
      body: JSON.stringify({ filename, dataUrl }),
    }),
};
