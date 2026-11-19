import { useState, type FormEvent } from 'react';
import {
  Mail,
  MailOpen,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import type {
  CertificationItem,
  ContactMessage,
  EducationItem,
  ExperienceItem,
  SkillItem,
} from '../../types/portfolio';
import { Button } from '../ui/Button';
import { adminApi } from './adminApi';

interface CommonManagerProps {
  onRefresh: () => Promise<void>;
  onToast: (type: 'success' | 'error', text: string) => void;
  onRequestDelete: (title: string, action: () => Promise<void>) => void;
}

const inputClass =
  'mt-1.5 w-full rounded-lg border border-[#263244] bg-[#080B12] px-3.5 py-2 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none';

/* ─────────────────────────── SKILLS MANAGER ─────────────────────────── */
export function AdminSkillsManager({
  skills,
  onRefresh,
  onToast,
  onRequestDelete,
}: CommonManagerProps & { skills: SkillItem[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SkillItem['category']>(
    'Backend Development',
  );
  const [isPrimary, setIsPrimary] = useState(false);
  const [focusNote, setFocusNote] = useState('');
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setCategory('Backend Development');
    setIsPrimary(false);
    setFocusNote('');
    setModalOpen(true);
  };

  const openEdit = (item: SkillItem) => {
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setIsPrimary(item.isPrimary);
    setFocusNote(item.focusNote);
    setModalOpen(true);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      onToast('error', 'Skill name is required.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await adminApi.updateSkill(editingId, {
          name: name.trim(),
          category,
          isPrimary,
          focusNote: focusNote.trim(),
        });
        onToast('success', 'Skill updated.');
      } else {
        await adminApi.createSkill({
          name: name.trim(),
          category,
          isPrimary,
          focusNote: focusNote.trim(),
        });
        onToast('success', 'Skill added.');
      }
      await onRefresh();
      setModalOpen(false);
    } catch (err) {
      onToast(
        'error',
        err instanceof Error ? err.message : 'Unable to save skill.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Skill</span>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#263244] bg-[#111827]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#263244] text-xs font-mono uppercase tracking-wider text-[#64748B]">
            <tr>
              <th className="px-5 py-3.5">Skill</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Priority</th>
              <th className="px-5 py-3.5">Focus Note</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#263244]">
            {skills.map((skill) => (
              <tr key={skill.id} className="hover:bg-[#161F2E]/50">
                <td className="px-5 py-3.5 font-semibold text-[#F8FAFC]">
                  {skill.name}
                </td>
                <td className="px-5 py-3.5 text-[#94A3B8]">{skill.category}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-[#38BDF8]">
                  {skill.isPrimary ? 'Primary' : 'Standard'}
                </td>
                <td className="px-5 py-3.5 text-xs text-[#94A3B8]">
                  {skill.focusNote}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(skill)}
                      aria-label={`Edit ${skill.name}`}
                      className="rounded-md border border-[#263244] bg-[#161F2E] p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onRequestDelete(skill.name, async () => {
                          await adminApi.deleteSkill(skill.id);
                          await onRefresh();
                          onToast('success', 'Skill deleted.');
                        })
                      }
                      aria-label={`Delete ${skill.name}`}
                      className="rounded-md border border-[#263244] bg-[#161F2E] p-1.5 text-[#94A3B8] hover:text-[#EF4444] cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="skill-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-[#263244] bg-[#111827] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#263244] pb-3">
              <h2 id="skill-modal-title" className="text-lg font-bold text-[#F8FAFC]">
                {editingId ? 'Edit Skill' : 'Add Skill'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close skill dialog"
                className="p-1 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label htmlFor="skill-name" className="block text-xs font-medium text-[#E2E8F0]">
                  Technology Name
                </label>
                <input
                  id="skill-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="skill-cat" className="block text-xs font-medium text-[#E2E8F0]">
                  Category
                </label>
                <select
                  id="skill-cat"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as SkillItem['category'])
                  }
                  className={inputClass}
                >
                  <option value="Architecture & System Design">Architecture & System Design</option>
                  <option value="Backend Engineering">Backend Engineering</option>
                  <option value="Databases & Modeling">Databases & Modeling</option>
                  <option value="Software Quality & Testing">Software Quality & Testing</option>
                  <option value="DevOps & Infrastructure">DevOps & Infrastructure</option>
                  <option value="Observability & Security">Observability & Security</option>
                  <option value="Frontend Development">Frontend Development</option>
                  <option value="Development Tools">Development Tools</option>
                  <option value="Backend Development">Backend Development</option>
                  <option value="Databases">Databases</option>
                </select>
              </div>

              <div>
                <label htmlFor="skill-note" className="block text-xs font-medium text-[#E2E8F0]">
                  Focus Note
                </label>
                <input
                  id="skill-note"
                  type="text"
                  value={focusNote}
                  onChange={(e) => setFocusNote(e.target.value)}
                  className={inputClass}
                />
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#E2E8F0] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="h-4 w-4 accent-[#38BDF8]"
                />
                <span>Primary Core Skill</span>
              </label>

              <div className="flex justify-end gap-3 border-t border-[#263244] pt-4">
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                  Save Skill
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ───────────────────────── EXPERIENCE MANAGER ───────────────────────── */
export function AdminExperienceManager({
  experiences,
  onRefresh,
  onToast,
  onRequestDelete,
}: CommonManagerProps & { experiences: ExperienceItem[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [period, setPeriod] = useState('');
  const [location, setLocation] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [technologiesText, setTechnologiesText] = useState('');
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setCompany('');
    setRole('');
    setPeriod('');
    setLocation('');
    setResponsibilitiesText('');
    setTechnologiesText('Laravel, PHP, MySQL');
    setModalOpen(true);
  };

  const openEdit = (item: ExperienceItem) => {
    setEditingId(item.id);
    setCompany(item.company);
    setRole(item.role);
    setPeriod(item.period);
    setLocation(item.location);
    setResponsibilitiesText(item.responsibilities.join('\n'));
    setTechnologiesText(item.technologies.join(', '));
    setModalOpen(true);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      company: company.trim(),
      role: role.trim(),
      period: period.trim(),
      location: location.trim(),
      responsibilities: responsibilitiesText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
      technologies: technologiesText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (editingId) {
        await adminApi.updateExperience(editingId, payload);
        onToast('success', 'Experience updated.');
      } else {
        await adminApi.createExperience(payload);
        onToast('success', 'Experience added.');
      }
      await onRefresh();
      setModalOpen(false);
    } catch (err) {
      onToast(
        'error',
        err instanceof Error ? err.message : 'Unable to save experience.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Experience</span>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#263244] bg-[#111827]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#263244] text-xs font-mono uppercase tracking-wider text-[#64748B]">
            <tr>
              <th className="px-5 py-3.5">Role & Company</th>
              <th className="px-5 py-3.5">Period</th>
              <th className="px-5 py-3.5">Location</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#263244]">
            {experiences.map((exp) => (
              <tr key={exp.id} className="hover:bg-[#161F2E]/50">
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-[#F8FAFC]">{exp.role}</p>
                  <p className="text-xs text-[#38BDF8]">{exp.company}</p>
                </td>
                <td className="px-5 py-3.5 text-[#94A3B8]">{exp.period}</td>
                <td className="px-5 py-3.5 text-[#94A3B8]">{exp.location}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(exp)}
                      aria-label={`Edit ${exp.role}`}
                      className="rounded-md border border-[#263244] bg-[#161F2E] p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onRequestDelete(exp.role, async () => {
                          await adminApi.deleteExperience(exp.id);
                          await onRefresh();
                          onToast('success', 'Experience deleted.');
                        })
                      }
                      aria-label={`Delete ${exp.role}`}
                      className="rounded-md border border-[#263244] bg-[#161F2E] p-1.5 text-[#94A3B8] hover:text-[#EF4444] cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="exp-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-[#263244] bg-[#111827] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#263244] pb-3">
              <h2 id="exp-modal-title" className="text-lg font-bold text-[#F8FAFC]">
                {editingId ? 'Edit Experience' : 'Add Experience'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close experience dialog"
                className="p-1 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="exp-role" className="block text-xs font-medium text-[#E2E8F0]">
                    Job Designation
                  </label>
                  <input
                    id="exp-role"
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="exp-company" className="block text-xs font-medium text-[#E2E8F0]">
                    Company
                  </label>
                  <input
                    id="exp-company"
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="exp-period" className="block text-xs font-medium text-[#E2E8F0]">
                    Employment Period
                  </label>
                  <input
                    id="exp-period"
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="exp-loc" className="block text-xs font-medium text-[#E2E8F0]">
                    Location
                  </label>
                  <input
                    id="exp-loc"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="exp-resp" className="block text-xs font-medium text-[#E2E8F0]">
                  Responsibilities (one per line)
                </label>
                <textarea
                  id="exp-resp"
                  rows={4}
                  value={responsibilitiesText}
                  onChange={(e) => setResponsibilitiesText(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="exp-tech" className="block text-xs font-medium text-[#E2E8F0]">
                  Technologies (comma separated)
                </label>
                <input
                  id="exp-tech"
                  type="text"
                  value={technologiesText}
                  onChange={(e) => setTechnologiesText(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[#263244] pt-4">
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                  Save Experience
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ───────────────────────── EDUCATION MANAGER ────────────────────────── */
export function AdminEducationManager({
  education,
  onRefresh,
  onToast,
  onRequestDelete,
}: CommonManagerProps & { education: EducationItem[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [degree, setDegree] = useState('');
  const [institution, setInstitution] = useState('');
  const [period, setPeriod] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setDegree('');
    setInstitution('');
    setPeriod('');
    setLocation('');
    setDescription('');
    setModalOpen(true);
  };

  const openEdit = (item: EducationItem) => {
    setEditingId(item.id);
    setDegree(item.degree);
    setInstitution(item.institution);
    setPeriod(item.period);
    setLocation(item.location);
    setDescription(item.description ?? '');
    setModalOpen(true);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        degree: degree.trim(),
        institution: institution.trim(),
        period: period.trim(),
        location: location.trim(),
        description: description.trim(),
      };
      if (editingId) {
        await adminApi.updateEducation(editingId, payload);
        onToast('success', 'Education updated.');
      } else {
        await adminApi.createEducation(payload);
        onToast('success', 'Education added.');
      }
      await onRefresh();
      setModalOpen(false);
    } catch (err) {
      onToast(
        'error',
        err instanceof Error ? err.message : 'Unable to save education.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Education</span>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#263244] bg-[#111827]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#263244] text-xs font-mono uppercase tracking-wider text-[#64748B]">
            <tr>
              <th className="px-5 py-3.5">Degree</th>
              <th className="px-5 py-3.5">Institution</th>
              <th className="px-5 py-3.5">Period</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#263244]">
            {education.map((edu) => (
              <tr key={edu.id} className="hover:bg-[#161F2E]/50">
                <td className="px-5 py-3.5 font-semibold text-[#F8FAFC]">
                  {edu.degree}
                </td>
                <td className="px-5 py-3.5 text-[#94A3B8]">{edu.institution}</td>
                <td className="px-5 py-3.5 text-[#94A3B8]">{edu.period}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(edu)}
                      aria-label={`Edit ${edu.degree}`}
                      className="rounded-md border border-[#263244] bg-[#161F2E] p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onRequestDelete(edu.degree, async () => {
                          await adminApi.deleteEducation(edu.id);
                          await onRefresh();
                          onToast('success', 'Education deleted.');
                        })
                      }
                      aria-label={`Delete ${edu.degree}`}
                      className="rounded-md border border-[#263244] bg-[#161F2E] p-1.5 text-[#94A3B8] hover:text-[#EF4444] cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edu-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-[#263244] bg-[#111827] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#263244] pb-3">
              <h2 id="edu-modal-title" className="text-lg font-bold text-[#F8FAFC]">
                {editingId ? 'Edit Education' : 'Add Education'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close education dialog"
                className="p-1 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label htmlFor="edu-degree" className="block text-xs font-medium text-[#E2E8F0]">
                  Degree / Program
                </label>
                <input
                  id="edu-degree"
                  type="text"
                  required
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="edu-inst" className="block text-xs font-medium text-[#E2E8F0]">
                  Institution
                </label>
                <input
                  id="edu-inst"
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edu-period" className="block text-xs font-medium text-[#E2E8F0]">
                    Dates
                  </label>
                  <input
                    id="edu-period"
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="edu-loc" className="block text-xs font-medium text-[#E2E8F0]">
                    Location
                  </label>
                  <input
                    id="edu-loc"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="edu-desc" className="block text-xs font-medium text-[#E2E8F0]">
                  Description
                </label>
                <textarea
                  id="edu-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end gap-3 border-t border-[#263244] pt-4">
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────── CERTIFICATIONS MANAGER ─────────────────────── */
export function AdminCertificationsManager({
  certifications,
  onRefresh,
  onToast,
  onRequestDelete,
}: CommonManagerProps & { certifications: CertificationItem[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [date, setDate] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setTitle('');
    setIssuer('');
    setDate('');
    setCredentialUrl('');
    setModalOpen(true);
  };

  const openEdit = (item: CertificationItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setIssuer(item.issuer);
    setDate(item.date);
    setCredentialUrl(item.credentialUrl ?? '');
    setModalOpen(true);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        issuer: issuer.trim(),
        date: date.trim(),
        credentialUrl: credentialUrl.trim() || undefined,
      };
      if (editingId) {
        await adminApi.updateCertification(editingId, payload);
        onToast('success', 'Learning record updated.');
      } else {
        await adminApi.createCertification(payload);
        onToast('success', 'Learning record added.');
      }
      await onRefresh();
      setModalOpen(false);
    } catch (err) {
      onToast(
        'error',
        err instanceof Error ? err.message : 'Unable to save learning record.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Learning Record</span>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#263244] bg-[#111827]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#263244] text-xs font-mono uppercase tracking-wider text-[#64748B]">
            <tr>
              <th className="px-5 py-3.5">Course / Learning</th>
              <th className="px-5 py-3.5">Provider / Source</th>
              <th className="px-5 py-3.5">Date / Focus</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#263244]">
            {certifications.map((cert) => (
              <tr key={cert.id} className="hover:bg-[#161F2E]/50">
                <td className="px-5 py-3.5 font-semibold text-[#F8FAFC]">
                  {cert.title}
                </td>
                <td className="px-5 py-3.5 text-[#94A3B8]">{cert.issuer}</td>
                <td className="px-5 py-3.5 text-[#94A3B8]">{cert.date}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(cert)}
                      aria-label={`Edit ${cert.title}`}
                      className="rounded-md border border-[#263244] bg-[#161F2E] p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onRequestDelete(cert.title, async () => {
                          await adminApi.deleteCertification(cert.id);
                          await onRefresh();
                          onToast('success', 'Learning record deleted.');
                        })
                      }
                      aria-label={`Delete ${cert.title}`}
                      className="rounded-md border border-[#263244] bg-[#161F2E] p-1.5 text-[#94A3B8] hover:text-[#EF4444] cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-[#263244] bg-[#111827] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#263244] pb-3">
              <h2 id="cert-modal-title" className="text-lg font-bold text-[#F8FAFC]">
                {editingId ? 'Edit Learning Record' : 'Add Learning Record'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close certification dialog"
                className="p-1 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label htmlFor="cert-title" className="block text-xs font-medium text-[#E2E8F0]">
                  Course or Learning Title
                </label>
                <input
                  id="cert-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cert-issuer" className="block text-xs font-medium text-[#E2E8F0]">
                  Provider or Source
                </label>
                <input
                  id="cert-issuer"
                  type="text"
                  required
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cert-date" className="block text-xs font-medium text-[#E2E8F0]">
                  Date
                </label>
                <input
                  id="cert-date"
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cert-url" className="block text-xs font-medium text-[#E2E8F0]">
                  Credential Link (optional)
                </label>
                <input
                  id="cert-url"
                  type="url"
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end gap-3 border-t border-[#263244] pt-4">
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ────────────────────────── MESSAGES MANAGER ────────────────────────── */
export function AdminMessagesManager({
  messages,
  onRefresh,
  onToast,
  onRequestDelete,
}: CommonManagerProps & { messages: ContactMessage[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    messages[0]?.id ?? null,
  );

  const selectedMessage =
    messages.find((m) => m.id === selectedId) ?? messages[0] ?? null;

  const toggleRead = async (msg: ContactMessage) => {
    try {
      await adminApi.markMessageRead(msg.id, !msg.read);
      await onRefresh();
      onToast(
        'success',
        msg.read ? 'Marked as unread.' : 'Marked as read.',
      );
    } catch (err) {
      onToast(
        'error',
        err instanceof Error ? err.message : 'Unable to update message.',
      );
    }
  };

  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-[#263244] bg-[#111827] p-8 text-center">
        <p className="text-base font-semibold text-[#F8FAFC]">
          Inbox is Empty
        </p>
        <p className="mt-1 text-sm text-[#94A3B8]">
          Messages submitted through the public Contact form appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="rounded-xl border border-[#263244] bg-[#111827] divide-y divide-[#263244] lg:col-span-5">
        {messages.map((msg) => {
          const isSelected = selectedMessage?.id === msg.id;
          return (
            <button
              key={msg.id}
              type="button"
              onClick={() => setSelectedId(msg.id)}
              className={[
                'w-full p-4 text-left transition-colors cursor-pointer',
                isSelected ? 'bg-[#161F2E]' : 'hover:bg-[#161F2E]/50',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[#F8FAFC] truncate">
                  {msg.name}
                </span>
                <span
                  className={[
                    'font-mono text-[11px] shrink-0',
                    msg.read ? 'text-[#64748B]' : 'text-[#38BDF8] font-medium',
                  ].join(' ')}
                >
                  {msg.read ? 'Read' : 'Unread'}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-[#CBD5E1] truncate">
                {msg.subject}
              </p>
              <p className="mt-1 font-mono text-[11px] text-[#64748B] tabular-nums">
                {new Date(msg.createdAt).toLocaleDateString()}
              </p>
            </button>
          );
        })}
      </div>

      {selectedMessage ? (
        <div className="rounded-xl border border-[#263244] bg-[#111827] p-6 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#263244] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#F8FAFC]">
                  {selectedMessage.subject}
                </h2>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  From{' '}
                  <span className="font-medium text-[#F8FAFC]">
                    {selectedMessage.name}
                  </span>{' '}
                  &lt;{selectedMessage.email}&gt;
                </p>
                <p className="mt-1 font-mono text-xs text-[#64748B] tabular-nums">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void toggleRead(selectedMessage)}
                >
                  {selectedMessage.read ? (
                    <>
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Mark Unread</span>
                    </>
                  ) : (
                    <>
                      <MailOpen className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
                      <span>Mark Read</span>
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() =>
                    onRequestDelete(
                      `message from ${selectedMessage.name}`,
                      async () => {
                        await adminApi.deleteMessage(selectedMessage.id);
                        await onRefresh();
                        onToast('success', 'Message deleted.');
                      },
                    )
                  }
                  aria-label="Delete selected message"
                  className="rounded-lg border border-[#263244] bg-[#161F2E] p-2 text-[#94A3B8] hover:border-[#EF4444]/60 hover:text-[#EF4444] cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-5 whitespace-pre-wrap text-sm leading-[1.7] text-[#CBD5E1]">
              {selectedMessage.message}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
