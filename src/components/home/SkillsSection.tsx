import { useState } from 'react';
import {
  CheckSquare,
  Code2,
  Cpu,
  Database,
  Layers,
  Server,
  ShieldCheck,
  Terminal,
  Wrench,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { SkillCategory, SkillItem } from '../../types/portfolio';
import { groupSkillsByCategory } from '../../utils/portfolioLogic';
import { SectionHeading } from '../ui/SectionHeading';
import { Skeleton } from '../ui/Skeleton';

interface SkillsSectionProps {
  skills: SkillItem[];
  loading: boolean;
}

const CATEGORY_ICONS: Record<string, typeof Server> = {
  'Architecture & System Design': Cpu,
  'Backend Engineering': Server,
  'Backend Development': Server,
  'Databases & Modeling': Database,
  'Databases': Database,
  'Software Quality & Testing': CheckSquare,
  'DevOps & Infrastructure': Terminal,
  'Observability & Security': ShieldCheck,
  'Frontend Development': Code2,
  'Development Tools': Wrench,
};

export function SkillsSection({ skills, loading }: SkillsSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<'All' | SkillCategory>('All');

  const grouped = groupSkillsByCategory(skills);
  const categories = grouped.map((g) => g.category);
  const visibleGroups =
    activeCategory === 'All'
      ? grouped
      : grouped.filter((group) => group.category === activeCategory);

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
      id="skills"
      className="border-b border-[#263244]/70 py-16 md:py-20 lg:py-28"
    >
      <motion.div
        {...revealProps}
        className="mx-auto max-w-[1280px] px-5 md:px-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            indexLabel="02 / Technical Skills"
            title="Technical Skills & Engineering Disciplines"
            description="Core backend frameworks, databases, and development tools I use to build and ship software."
          />

          {!loading && categories.length > 0 ? (
            <div
              role="tablist"
              aria-label="Filter skills by category"
              className="flex flex-wrap items-center gap-1 rounded-lg border border-[#263244] bg-[#111827] p-1 self-start lg:self-auto"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'All'}
                onClick={() => setActiveCategory('All')}
                className={[
                  'rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer',
                  activeCategory === 'All'
                    ? 'bg-[#161F2E] text-[#38BDF8]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]',
                ].join(' ')}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                  className={[
                    'rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer',
                    activeCategory === cat
                      ? 'bg-[#161F2E] text-[#38BDF8]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]',
                  ].join(' ')}
                >
                  {cat.replace(' Development', '').replace(' & Infrastructure', '')}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : visibleGroups.length === 0 ? (
          <div className="mt-10 rounded-xl border border-[#263244] bg-[#111827] p-8 text-sm text-[#94A3B8]">
            No skills configured in this category yet.
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleGroups.map((group) => {
              const Icon = CATEGORY_ICONS[group.category] ?? Layers;
              return (
                <div
                  key={group.category}
                  className="rounded-xl border border-[#263244] bg-[#111827] p-6"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-[#38BDF8] shrink-0" aria-hidden="true" />
                    <h3 className="text-base font-semibold text-[#F8FAFC]">
                      {group.category}
                    </h3>
                  </div>
                  <ul className="mt-5 divide-y divide-[#263244]/80">
                    {group.items.map((skill) => (
                      <li key={skill.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-baseline justify-between gap-3">
                          <span
                            className={
                              skill.isPrimary
                                ? 'text-sm font-semibold text-[#F8FAFC]'
                                : 'text-sm font-medium text-[#CBD5E1]'
                            }
                          >
                            {skill.name}
                          </span>
                          {skill.isPrimary ? (
                            <span className="font-mono text-[11px] font-medium text-[#38BDF8] shrink-0">
                              Primary
                            </span>
                          ) : null}
                        </div>
                        {skill.focusNote ? (
                          <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                            {skill.focusNote}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </section>
  );
}
