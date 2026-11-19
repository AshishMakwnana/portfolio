import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  CheckCircle2,
  Clock,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { ProjectItem, ProjectStatus } from '../../types/portfolio';
import { slugifyTitle } from '../../utils/validation';
import { Button } from '../ui/Button';
import { adminApi } from './adminApi';

interface AdminProjectsManagerProps {
  projects: ProjectItem[];
  onRefresh: () => Promise<void>;
  onToast: (type: 'success' | 'error', text: string) => void;
  onRequestDelete: (title: string, action: () => Promise<void>) => void;
}

interface ProjectDraft {
  title: string;
  slug: string;
  category: string;
  status: ProjectStatus;
  featured: boolean;
  shortDescription: string;
  problemStatement: string;
  solutionSummary: string;
  technicalHighlightsText: string;
  technologiesText: string;
  screenshots: string[];
  liveUrl: string;
  githubUrl: string;
}

const EMPTY_DRAFT: ProjectDraft = {
  title: '',
  slug: '',
  category: 'Backend Systems',
  status: 'Completed',
  featured: false,
  shortDescription: '',
  problemStatement: '',
  solutionSummary: '',
  technicalHighlightsText: '',
  technologiesText: 'Laravel, PHP, MySQL',
  screenshots: [],
  liveUrl: '',
  githubUrl: '',
};

export function AdminProjectsManager({
  projects,
  onRefresh,
  onToast,
  onRequestDelete,
}: AdminProjectsManagerProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProjectDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const filtered = projects.filter((item) => {
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.technologies.some((t) => t.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const openCreate = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setModalOpen(true);
  };

  const openEdit = (project: ProjectItem) => {
    setEditingId(project.id);
    setDraft({
      title: project.title,
      slug: project.slug,
      category: project.category,
      status: project.status,
      featured: project.featured,
      shortDescription: project.shortDescription,
      problemStatement: project.problemStatement,
      solutionSummary: project.solutionSummary,
      technicalHighlightsText: project.technicalHighlights.join('\n'),
      technologiesText: project.technologies.join(', '),
      screenshots: project.screenshots ?? [],
      liveUrl: project.liveUrl ?? '',
      githubUrl: project.githubUrl ?? '',
    });
    setModalOpen(true);
  };

  const handleScreenshotUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Unable to read image file.'));
        reader.readAsDataURL(file);
      });
      const res = await adminApi.uploadImage(file.name, dataUrl);
      setDraft((prev) => ({
        ...prev,
        screenshots: [...prev.screenshots, res.url],
      }));
      onToast('success', 'Screenshot uploaded.');
    } catch (err) {
      onToast(
        'error',
        err instanceof Error ? err.message : 'Screenshot upload failed.',
      );
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) {
      onToast('error', 'Project title is required.');
      return;
    }

    setSaving(true);
    const payload = {
      title: draft.title.trim(),
      slug: draft.slug.trim() || slugifyTitle(draft.title),
      category: draft.category.trim() || 'Backend Systems',
      status: draft.status,
      featured: draft.featured,
      shortDescription: draft.shortDescription.trim(),
      problemStatement: draft.problemStatement.trim(),
      solutionSummary: draft.solutionSummary.trim(),
      technicalHighlights: draft.technicalHighlightsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      technologies: draft.technologiesText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      screenshots: draft.screenshots,
      liveUrl: draft.liveUrl.trim() || undefined,
      githubUrl: draft.githubUrl.trim() || undefined,
    };

    try {
      if (editingId) {
        await adminApi.updateProject(editingId, payload);
        onToast('success', 'Project updated.');
      } else {
        await adminApi.createProject(payload);
        onToast('success', 'Project created.');
      }
      await onRefresh();
      setModalOpen(false);
    } catch (err) {
      onToast(
        'error',
        err instanceof Error ? err.message : 'Unable to save project.',
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'mt-1.5 w-full rounded-lg border border-[#263244] bg-[#080B12] px-3.5 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#38BDF8] focus:outline-none';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Search projects"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filter projects..."
              className="w-60 rounded-lg border border-[#263244] bg-[#111827] py-2 pl-9 pr-3 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#38BDF8] focus:outline-none"
            />
          </div>

          <div
            role="tablist"
            aria-label="Filter projects by status"
            className="flex items-center gap-1 rounded-lg border border-[#263244] bg-[#111827] p-1"
          >
            {(['all', 'Completed', 'In Progress'] as const).map((status) => (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={statusFilter === status}
                onClick={() => setStatusFilter(status)}
                className={[
                  'rounded-md px-3 py-1 text-xs font-medium cursor-pointer transition-colors',
                  statusFilter === status
                    ? 'bg-[#161F2E] text-[#38BDF8]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]',
                ].join(' ')}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Project</span>
        </Button>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-xl border border-[#263244] bg-[#111827]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#263244] text-xs font-mono uppercase tracking-wider text-[#64748B]">
            <tr>
              <th className="px-5 py-3.5">Project</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Featured</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#263244]">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-sm text-[#94A3B8]"
                >
                  No projects found. Add your first project to publish it on the
                  portfolio.
                </td>
              </tr>
            ) : (
              filtered.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-[#161F2E]/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-[#F8FAFC]">
                      {project.title}
                    </p>
                    <p className="font-mono text-xs text-[#64748B]">
                      /{project.slug}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-[#94A3B8]">
                    {project.category}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={[
                        'inline-flex items-center gap-1.5 font-mono text-xs font-medium',
                        project.status === 'Completed'
                          ? 'text-[#22C55E]'
                          : 'text-[#F59E0B]',
                      ].join(' ')}
                    >
                      {project.status === 'Completed' ? (
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      <span>{project.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-[#94A3B8]">
                    {project.featured ? 'Yes' : 'No'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(project)}
                        aria-label={`Edit ${project.title}`}
                        className="rounded-md border border-[#263244] bg-[#161F2E] p-1.5 text-[#94A3B8] hover:border-[#38BDF8]/60 hover:text-[#F8FAFC] cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onRequestDelete(project.title, async () => {
                            await adminApi.deleteProject(project.id);
                            await onRefresh();
                            onToast('success', 'Project deleted.');
                          })
                        }
                        aria-label={`Delete ${project.title}`}
                        className="rounded-md border border-[#263244] bg-[#161F2E] p-1.5 text-[#94A3B8] hover:border-[#EF4444]/60 hover:text-[#EF4444] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-editor-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#263244] bg-[#111827] p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#263244] pb-4">
              <h2
                id="project-editor-title"
                className="text-lg font-bold text-[#F8FAFC]"
              >
                {editingId ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close project editor"
                className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#161F2E] hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="proj-title"
                    className="block text-xs font-medium text-[#E2E8F0]"
                  >
                    Title
                  </label>
                  <input
                    id="proj-title"
                    type="text"
                    required
                    value={draft.title}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        title: event.target.value,
                        slug: editingId
                          ? prev.slug
                          : slugifyTitle(event.target.value),
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="proj-slug"
                    className="block text-xs font-medium text-[#E2E8F0]"
                  >
                    Slug
                  </label>
                  <input
                    id="proj-slug"
                    type="text"
                    value={draft.slug}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, slug: event.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="proj-category"
                    className="block text-xs font-medium text-[#E2E8F0]"
                  >
                    Category
                  </label>
                  <input
                    id="proj-category"
                    type="text"
                    value={draft.category}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        category: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="proj-status"
                    className="block text-xs font-medium text-[#E2E8F0]"
                  >
                    Status
                  </label>
                  <select
                    id="proj-status"
                    value={draft.status}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        status: event.target.value as ProjectStatus,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>

                <div className="flex items-end pb-2">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-[#E2E8F0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.featured}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          featured: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-[#263244] bg-[#080B12] accent-[#38BDF8]"
                    />
                    <span>Featured Project</span>
                  </label>
                </div>
              </div>

              <div>
                <label
                  htmlFor="proj-short"
                  className="block text-xs font-medium text-[#E2E8F0]"
                >
                  Short Description
                </label>
                <textarea
                  id="proj-short"
                  rows={2}
                  value={draft.shortDescription}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      shortDescription: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="proj-problem"
                    className="block text-xs font-medium text-[#E2E8F0]"
                  >
                    Problem Statement
                  </label>
                  <textarea
                    id="proj-problem"
                    rows={3}
                    value={draft.problemStatement}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        problemStatement: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="proj-solution"
                    className="block text-xs font-medium text-[#E2E8F0]"
                  >
                    Solution Summary
                  </label>
                  <textarea
                    id="proj-solution"
                    rows={3}
                    value={draft.solutionSummary}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        solutionSummary: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="proj-highlights"
                  className="block text-xs font-medium text-[#E2E8F0]"
                >
                  Technical Highlights (one per line)
                </label>
                <textarea
                  id="proj-highlights"
                  rows={3}
                  value={draft.technicalHighlightsText}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      technicalHighlightsText: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="proj-tech"
                  className="block text-xs font-medium text-[#E2E8F0]"
                >
                  Technologies (comma separated)
                </label>
                <input
                  id="proj-tech"
                  type="text"
                  value={draft.technologiesText}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      technologiesText: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="proj-live"
                    className="block text-xs font-medium text-[#E2E8F0]"
                  >
                    Live Demo URL (optional)
                  </label>
                  <input
                    id="proj-live"
                    type="url"
                    value={draft.liveUrl}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, liveUrl: event.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="proj-github"
                    className="block text-xs font-medium text-[#E2E8F0]"
                  >
                    GitHub URL (optional)
                  </label>
                  <input
                    id="proj-github"
                    type="url"
                    value={draft.githubUrl}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        githubUrl: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-xs font-medium text-[#E2E8F0]">
                  Project Screenshots (PNG, JPEG, WebP)
                </label>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <label className="inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-lg border border-[#263244] bg-[#161F2E] px-3.5 py-2 text-xs font-medium text-[#F8FAFC] hover:border-[#38BDF8]/60">
                    <Upload className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
                    <span>
                      {uploadingImage ? 'Uploading...' : 'Upload Screenshot'}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={uploadingImage}
                      onChange={handleScreenshotUpload}
                      className="sr-only"
                    />
                  </label>

                  {draft.screenshots.map((url) => (
                    <div
                      key={url}
                      className="inline-flex items-center gap-2 rounded-md border border-[#263244] bg-[#080B12] px-2.5 py-1 text-xs text-[#94A3B8]"
                    >
                      <span className="max-w-[140px] truncate">{url}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            screenshots: prev.screenshots.filter((s) => s !== url),
                          }))
                        }
                        aria-label={`Remove screenshot ${url}`}
                        className="text-[#94A3B8] hover:text-[#EF4444] cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#263244] pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={saving}
                >
                  <span>{editingId ? 'Save Changes' : 'Create Project'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
