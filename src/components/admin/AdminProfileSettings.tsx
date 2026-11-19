import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Download, RotateCcw, Save, Upload } from 'lucide-react';
import type { ProfileData, SiteSettings } from '../../types/portfolio';
import { Button } from '../ui/Button';
import { adminApi } from './adminApi';

interface ProfileManagerProps {
  profile: ProfileData;
  onRefresh: () => Promise<void>;
  onToast: (type: 'success' | 'error', text: string) => void;
}

export function AdminProfileManager({
  profile,
  onRefresh,
  onToast,
}: ProfileManagerProps) {
  const [name, setName] = useState(profile.name);
  const [greeting, setGreeting] = useState(profile.greeting);
  const [headline, setHeadline] = useState(profile.headline);
  const [headlineHighlight, setHeadlineHighlight] = useState(
    profile.headlineHighlight,
  );
  const [designation, setDesignation] = useState(profile.designation);
  const [availabilityText, setAvailabilityText] = useState(
    profile.availabilityText,
  );
  const [shortIntro, setShortIntro] = useState(profile.shortIntro);
  const [aboutHeading, setAboutHeading] = useState(profile.aboutHeading);
  const [aboutParagraphsText, setAboutParagraphsText] = useState(
    profile.aboutParagraphs.join('\n\n'),
  );
  const [aboutHighlightsText, setAboutHighlightsText] = useState(
    profile.aboutHighlights.join('\n'),
  );
  const [email, setEmail] = useState(profile.email);
  const [location, setLocation] = useState(profile.location);
  const [githubUrl, setGithubUrl] = useState(
    profile.socialLinks.find((s) => s.platform === 'github')?.url ?? '',
  );
  const [linkedinUrl, setLinkedinUrl] = useState(
    profile.socialLinks.find((s) => s.platform === 'linkedin')?.url ?? '',
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await adminApi.saveProfile({
        name,
        greeting,
        headline,
        headlineHighlight,
        designation,
        availabilityText,
        shortIntro,
        aboutHeading,
        aboutParagraphs: aboutParagraphsText
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter(Boolean),
        aboutHighlights: aboutHighlightsText
          .split('\n')
          .map((h) => h.trim())
          .filter(Boolean),
        email,
        location,
        socialLinks: [
          {
            id: 'github',
            label: 'GitHub',
            url: githubUrl.trim(),
            platform: 'github' as const,
          },
          {
            id: 'linkedin',
            label: 'LinkedIn',
            url: linkedinUrl.trim(),
            platform: 'linkedin' as const,
          },
        ].filter((link) => Boolean(link.url)),
      });
      await onRefresh();
      onToast('success', 'Profile updated.');
    } catch (err) {
      onToast(
        'error',
        err instanceof Error ? err.message : 'Unable to save profile.',
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'mt-1.5 w-full rounded-lg border border-[#263244] bg-[#080B12] px-3.5 py-2 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none';

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#263244] bg-[#111827] p-6 space-y-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="prof-name" className="block text-xs font-medium text-[#E2E8F0]">
            Display Name
          </label>
          <input
            id="prof-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="prof-greeting" className="block text-xs font-medium text-[#E2E8F0]">
            Hero Greeting
          </label>
          <input
            id="prof-greeting"
            type="text"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="prof-headline" className="block text-xs font-medium text-[#E2E8F0]">
            Hero Headline
          </label>
          <input
            id="prof-headline"
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="prof-highlight" className="block text-xs font-medium text-[#E2E8F0]">
            Accent Phrase
          </label>
          <input
            id="prof-highlight"
            type="text"
            value={headlineHighlight}
            onChange={(e) => setHeadlineHighlight(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="prof-desig" className="block text-xs font-medium text-[#E2E8F0]">
            Designation
          </label>
          <input
            id="prof-desig"
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="prof-avail" className="block text-xs font-medium text-[#E2E8F0]">
            Availability Line
          </label>
          <input
            id="prof-avail"
            type="text"
            value={availabilityText}
            onChange={(e) => setAvailabilityText(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="prof-intro" className="block text-xs font-medium text-[#E2E8F0]">
          Hero Introduction
        </label>
        <textarea
          id="prof-intro"
          rows={3}
          value={shortIntro}
          onChange={(e) => setShortIntro(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="prof-about-heading" className="block text-xs font-medium text-[#E2E8F0]">
          About Section Heading
        </label>
        <input
          id="prof-about-heading"
          type="text"
          value={aboutHeading}
          onChange={(e) => setAboutHeading(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="prof-about-body" className="block text-xs font-medium text-[#E2E8F0]">
            About Paragraphs (separate with blank line)
          </label>
          <textarea
            id="prof-about-body"
            rows={5}
            value={aboutParagraphsText}
            onChange={(e) => setAboutParagraphsText(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="prof-highlights" className="block text-xs font-medium text-[#E2E8F0]">
            Core Focus Highlights (one per line)
          </label>
          <textarea
            id="prof-highlights"
            rows={5}
            value={aboutHighlightsText}
            onChange={(e) => setAboutHighlightsText(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="prof-email" className="block text-xs font-medium text-[#E2E8F0]">
            Contact Email
          </label>
          <input
            id="prof-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="prof-loc" className="block text-xs font-medium text-[#E2E8F0]">
            Location
          </label>
          <input
            id="prof-loc"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="prof-gh" className="block text-xs font-medium text-[#E2E8F0]">
            GitHub URL
          </label>
          <input
            id="prof-gh"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="prof-li" className="block text-xs font-medium text-[#E2E8F0]">
            LinkedIn URL
          </label>
          <input
            id="prof-li"
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-[#263244] pt-4">
        <Button type="submit" variant="primary" size="md" isLoading={saving}>
          <Save className="h-4 w-4" aria-hidden="true" />
          <span>Save Profile</span>
        </Button>
      </div>
    </form>
  );
}

interface ResumeManagerProps {
  profile: ProfileData;
  onRefresh: () => Promise<void>;
  onToast: (type: 'success' | 'error', text: string) => void;
}

export function AdminResumeManager({
  profile,
  onRefresh,
  onToast,
}: ResumeManagerProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result);
          const commaIndex = result.indexOf(',');
          resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
        };
        reader.onerror = () => reject(new Error('Failed to read resume file.'));
        reader.readAsDataURL(file);
      });

      await adminApi.uploadResume({
        filename: file.name,
        base64Data,
      });
      await onRefresh();
      onToast('success', `Uploaded custom resume (${file.name}).`);
    } catch (err) {
      onToast(
        'error',
        err instanceof Error ? err.message : 'Unable to upload resume.',
      );
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleReset = async () => {
    setUploading(true);
    try {
      await adminApi.uploadResume({ resetToGenerated: true });
      await onRefresh();
      onToast('success', 'Reset to auto-generated resume.');
    } catch (err) {
      onToast(
        'error',
        err instanceof Error ? err.message : 'Unable to reset resume.',
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#263244] bg-[#111827] p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#F8FAFC]">
          Resume Document
        </h2>
        <p className="mt-1 text-sm text-[#94A3B8]">
          Visitors download your active resume directly from the top navigation
          bar and Hero actions.
        </p>
      </div>

      <div className="rounded-lg border border-[#263244] bg-[#080B12] p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-[#64748B]">Active File</p>
          <p className="mt-1 text-sm font-semibold text-[#F8FAFC]">
            {profile.resumeFilename}
          </p>
          <p className="mt-0.5 text-xs text-[#94A3B8]">
            {profile.customResumePath
              ? 'Custom uploaded file'
              : 'PDF generated from live portfolio records'}
          </p>
        </div>

        <Button href="/api/resume" variant="secondary" size="sm">
          <Download className="h-4 w-4 text-[#38BDF8]" aria-hidden="true" />
          <span>Test Download</span>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg bg-[#38BDF8] px-4 py-2 text-xs font-semibold text-[#080B12] hover:bg-[#60CAFA] transition-colors">
          <Upload className="h-4 w-4" aria-hidden="true" />
          <span>{uploading ? 'Uploading...' : 'Upload Custom Resume (PDF)'}</span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            disabled={uploading}
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>

        {profile.customResumePath ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={uploading}
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Use Dynamic Generated Resume</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

interface SettingsManagerProps {
  settings: SiteSettings;
  onRefresh: () => Promise<void>;
  onToast: (type: 'success' | 'error', text: string) => void;
}

export function AdminSettingsManager({
  settings,
  onRefresh,
  onToast,
}: SettingsManagerProps) {
  const [siteTitle, setSiteTitle] = useState(settings.siteTitle);
  const [metaDescription, setMetaDescription] = useState(
    settings.metaDescription,
  );
  const [copyrightYear, setCopyrightYear] = useState(
    String(settings.copyrightYear),
  );
  const [footerTagline, setFooterTagline] = useState(settings.footerTagline);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await adminApi.saveSettings({
        siteTitle: siteTitle.trim(),
        metaDescription: metaDescription.trim(),
        copyrightYear: Number(copyrightYear) || 2026,
        footerTagline: footerTagline.trim(),
      });
      await onRefresh();
      onToast('success', 'Website settings saved.');
    } catch (err) {
      onToast(
        'error',
        err instanceof Error ? err.message : 'Unable to save settings.',
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'mt-1.5 w-full rounded-lg border border-[#263244] bg-[#080B12] px-3.5 py-2 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none';

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#263244] bg-[#111827] p-6 space-y-5"
    >
      <div>
        <label htmlFor="set-title" className="block text-xs font-medium text-[#E2E8F0]">
          Site Title
        </label>
        <input
          id="set-title"
          type="text"
          value={siteTitle}
          onChange={(e) => setSiteTitle(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="set-desc" className="block text-xs font-medium text-[#E2E8F0]">
          Meta Description
        </label>
        <textarea
          id="set-desc"
          rows={3}
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="set-year" className="block text-xs font-medium text-[#E2E8F0]">
            Copyright Year
          </label>
          <input
            id="set-year"
            type="number"
            value={copyrightYear}
            onChange={(e) => setCopyrightYear(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="set-tagline" className="block text-xs font-medium text-[#E2E8F0]">
            Footer Tagline
          </label>
          <input
            id="set-tagline"
            type="text"
            value={footerTagline}
            onChange={(e) => setFooterTagline(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-[#263244] pt-4">
        <Button type="submit" variant="primary" size="md" isLoading={saving}>
          <Save className="h-4 w-4" aria-hidden="true" />
          <span>Save Settings</span>
        </Button>
      </div>
    </form>
  );
}
