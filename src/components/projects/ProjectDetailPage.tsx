import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Github,
  Layers,
} from 'lucide-react';
import type { ProjectItem } from '../../types/portfolio';
import { formatInlineMetadata } from '../../utils/portfolioLogic';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

interface ProjectDetailPageProps {
  slug: string;
  onBackHome: () => void;
}

export function ProjectDetailPage({
  slug,
  onBackHome,
}: ProjectDetailPageProps) {
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/projects/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? 'This project could not be found.'
              : 'Unable to load project details.',
          );
        }
        return (await response.json()) as ProjectItem;
      })
      .then((payload) => {
        if (active) {
          setProject(payload);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load project details.',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <main className="flex-1 py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1040px] px-5 md:px-8">
        <a
          href="/#projects"
          onClick={(event) => {
            event.preventDefault();
            onBackHome();
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#94A3B8] hover:text-[#38BDF8] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Selected Work</span>
        </a>

        {loading ? (
          <div className="mt-8 space-y-6">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-56 w-full" />
          </div>
        ) : error || !project ? (
          <div className="mt-10 rounded-xl border border-[#263244] bg-[#111827] p-8">
            <h1 className="text-2xl font-bold text-[#F8FAFC]">
              Project Not Found
            </h1>
            <p className="mt-2 text-sm text-[#94A3B8]">
              {error ?? 'The requested project slug does not exist.'}
            </p>
            <div className="mt-6">
              <Button variant="primary" size="md" onClick={onBackHome}>
                Return to Portfolio
              </Button>
            </div>
          </div>
        ) : (
          <article className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-mono text-[#94A3B8]">
                {formatInlineMetadata([
                  project.category,
                  project.featured ? 'Featured' : undefined,
                ])}
              </span>

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
            </div>

            <h1 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.1] text-[#F8FAFC]">
              {project.title}
            </h1>

            <p className="mt-5 max-w-[68ch] text-base leading-[1.7] text-[#94A3B8] md:text-lg">
              {project.shortDescription}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {project.liveUrl ? (
                <Button
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="primary"
                  size="md"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  <span>Live Demo</span>
                </Button>
              ) : null}

              {project.githubUrl ? (
                <Button
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="secondary"
                  size="md"
                >
                  <Github className="h-4 w-4 text-[#38BDF8]" aria-hidden="true" />
                  <span>View Source on GitHub</span>
                </Button>
              ) : null}
            </div>

            {/* Screenshots or Clean Architecture Visual */}
            {project.screenshots && project.screenshots.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
                {project.screenshots.map((src, idx) => (
                  <div
                    key={src}
                    className="overflow-hidden rounded-xl border border-[#263244] bg-[#111827]"
                  >
                    <img
                      src={src}
                      alt={`${project.title} screenshot ${idx + 1}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-64 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-xl border border-[#263244] bg-[#111827] p-6">
                <div className="flex items-center justify-between text-xs font-mono text-[#64748B]">
                  <span className="inline-flex items-center gap-2 text-[#38BDF8]">
                    <Layers className="h-4 w-4" aria-hidden="true" />
                    <span>System Architecture Overview</span>
                  </span>
                  <span>Slug: {project.slug}</span>
                </div>
                <p className="mt-4 font-mono text-xs text-[#94A3B8]">
                  Stack: {project.technologies.join(' · ')}
                </p>
              </div>
            )}

            {/* Case Study Breakdown */}
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-xl border border-[#263244] bg-[#111827] p-6">
                <h2 className="text-lg font-semibold text-[#F8FAFC]">
                  Problem Statement
                </h2>
                <p className="mt-3 text-sm leading-[1.7] text-[#94A3B8]">
                  {project.problemStatement}
                </p>
              </div>

              <div className="rounded-xl border border-[#263244] bg-[#111827] p-6">
                <h2 className="text-lg font-semibold text-[#F8FAFC]">
                  Solution & Architecture
                </h2>
                <p className="mt-3 text-sm leading-[1.7] text-[#94A3B8]">
                  {project.solutionSummary}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-[#263244] bg-[#111827] p-6 md:p-8">
              <h2 className="text-lg font-semibold text-[#F8FAFC]">
                Key Features & Technical Implementation
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-[1.65] text-[#94A3B8]">
                {project.technicalHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#38BDF8]"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-[#263244] pt-5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#64748B]">
                  Technology Stack
                </h3>
                <p className="mt-2 font-mono text-sm text-[#E2E8F0]">
                  {project.technologies.join(' · ')}
                </p>
              </div>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}
