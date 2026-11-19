import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Github,
  Layers,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ProjectItem } from '../../types/portfolio';
import { formatInlineMetadata } from '../../utils/portfolioLogic';
import { SectionHeading } from '../ui/SectionHeading';
import { Skeleton } from '../ui/Skeleton';

interface ProjectsSectionProps {
  projects: ProjectItem[];
  loading: boolean;
  onNavigateProject: (slug: string) => void;
}

export function ProjectsSection({
  projects,
  loading,
  onNavigateProject,
}: ProjectsSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  const visibleProjects =
    filter === 'featured'
      ? projects.filter((project) => project.featured)
      : projects;

  const revealProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.12 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section
      id="projects"
      className="border-b border-[#263244]/70 py-16 md:py-20 lg:py-28"
    >
      <motion.div
        {...revealProps}
        className="mx-auto max-w-[1280px] px-5 md:px-8"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            indexLabel="04 / Selected Work"
            title="Selected Work & System Implementations"
            description="Selected backend architectures, REST APIs, and full-stack web applications."
          />

          <div
            role="tablist"
            aria-label="Filter projects"
            className="flex items-center gap-1 rounded-lg border border-[#263244] bg-[#111827] p-1 self-start md:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'all'}
              onClick={() => setFilter('all')}
              className={[
                'rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer',
                filter === 'all'
                  ? 'bg-[#161F2E] text-[#38BDF8]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]',
              ].join(' ')}
            >
              All Projects
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'featured'}
              onClick={() => setFilter('featured')}
              className={[
                'rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer',
                filter === 'featured'
                  ? 'bg-[#161F2E] text-[#38BDF8]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]',
              ].join(' ')}
            >
              Featured
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="mt-10 rounded-xl border border-[#263244] bg-[#111827] p-8 text-sm text-[#94A3B8]">
            No projects match the current filter.
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {visibleProjects.map((project, index) => {
              const isCompleted = project.status === 'Completed';
              const firstScreenshot = project.screenshots?.[0];
              const isLeadFeatured =
                project.featured && index === 0 && visibleProjects.length % 2 === 1;

              return (
                <article
                  key={project.id}
                  className={[
                    'group flex flex-col justify-between overflow-hidden rounded-xl border bg-[#111827] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[#38BDF8]/55',
                    project.featured
                      ? 'border-[#38BDF8]/30'
                      : 'border-[#263244]',
                    isLeadFeatured ? 'md:col-span-2' : '',
                  ].join(' ')}
                >
                  {/* Visual header: uploaded screenshot or clean architectural preview */}
                  <div className="relative h-48 overflow-hidden border-b border-[#263244] bg-[#0B111C]">
                    {firstScreenshot ? (
                      <img
                        src={firstScreenshot}
                        alt={`${project.title} preview`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col justify-between p-5 transition-transform duration-300 group-hover:scale-[1.02]">
                        <div className="flex items-center justify-between font-mono text-[11px] text-[#64748B]">
                          <span className="inline-flex items-center gap-1.5 text-[#38BDF8]">
                            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>/{project.slug}</span>
                          </span>
                          <span>{project.technologies.slice(0, 3).join(' · ')}</span>
                        </div>
                        <div className="space-y-2">
                          {project.technicalHighlights.slice(0, 2).map((line) => (
                            <div
                              key={line}
                              className="flex items-center gap-2 rounded-md border border-[#263244] bg-[#111827]/90 px-3 py-2 font-mono text-xs text-[#94A3B8]"
                            >
                              <span className="text-[#38BDF8]" aria-hidden="true">
                                &rsaquo;
                              </span>
                              <span className="truncate">{line}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-mono text-[#94A3B8]">
                          {formatInlineMetadata([
                            project.category,
                            project.featured ? 'Featured' : undefined,
                          ])}
                        </span>
                        <span
                          className={[
                            'inline-flex items-center gap-1.5 font-mono text-xs font-medium',
                            isCompleted ? 'text-[#22C55E]' : 'text-[#F59E0B]',
                          ].join(' ')}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          <span>{project.status}</span>
                        </span>
                      </div>

                      <h3 className="mt-3.5 text-xl font-semibold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors duration-200">
                        {project.title}
                      </h3>

                      <p className="mt-2.5 text-sm leading-[1.65] text-[#94A3B8]">
                        {project.shortDescription}
                      </p>
                    </div>

                    <div className="mt-6 border-t border-[#263244] pt-4 flex flex-wrap items-center justify-between gap-4">
                      <p className="font-mono text-xs text-[#64748B]">
                        {project.technologies.join(' · ')}
                      </p>

                      <div className="flex items-center gap-4 shrink-0">
                        {project.githubUrl ? (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${project.title} GitHub repository`}
                            className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                          >
                            <Github className="h-4 w-4" aria-hidden="true" />
                          </a>
                        ) : null}
                        {project.liveUrl ? (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${project.title} live demo`}
                            className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          </a>
                        ) : null}

                        <a
                          href={`/projects/${project.slug}`}
                          onClick={(event) => {
                            event.preventDefault();
                            onNavigateProject(project.slug);
                          }}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#38BDF8] hover:text-[#60CAFA] transition-colors whitespace-nowrap"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </motion.div>
    </section>
  );
}
