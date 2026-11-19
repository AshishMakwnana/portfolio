import { motion, useReducedMotion } from 'motion/react';
import type { ExperienceItem } from '../../types/portfolio';
import { formatInlineMetadata } from '../../utils/portfolioLogic';
import { SectionHeading } from '../ui/SectionHeading';
import { Skeleton } from '../ui/Skeleton';

interface ExperienceSectionProps {
  experiences: ExperienceItem[];
  loading: boolean;
}

export function ExperienceSection({
  experiences,
  loading,
}: ExperienceSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  const revealProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section
      id="experience"
      className="border-b border-[#263244]/70 py-16 md:py-20 lg:py-28"
    >
      <motion.div
        {...revealProps}
        className="mx-auto max-w-[1280px] px-5 md:px-8"
      >
        <SectionHeading
          indexLabel="03 / Experience"
          title="Professional Experience"
        />

        {loading ? (
          <div className="mt-10 space-y-6">
            <Skeleton className="h-44 w-full" />
          </div>
        ) : experiences.length === 0 ? (
          <div className="mt-10 rounded-xl border border-[#263244] bg-[#111827] p-8 text-sm text-[#94A3B8]">
            Experience records can be added from the Admin Dashboard.
          </div>
        ) : (
          <div className="relative mt-12 space-y-10 pl-7 md:pl-10">
            {/* Subtle vertical timeline rail */}
            <div
              aria-hidden="true"
              className="absolute bottom-2 left-[5px] top-2 w-px bg-[#263244]"
            />

            {experiences.map((item) => (
              <article key={item.id} className="relative">
                {/* Timeline node marker */}
                <span
                  aria-hidden="true"
                  className="absolute -left-[27px] md:-left-[39px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#38BDF8] bg-[#080B12]"
                />

                <div className="rounded-xl border border-[#263244] bg-[#111827] p-6 md:p-7 grid grid-cols-1 gap-6 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <h3 className="text-lg font-semibold text-[#F8FAFC]">
                      {item.role}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-[#38BDF8]">
                      {item.company}
                    </p>
                    <p className="mt-2 font-mono text-xs text-[#64748B]">
                      {formatInlineMetadata([item.period, item.location])}
                    </p>
                  </div>

                  <div className="md:col-span-8">
                    <ul className="space-y-2.5 text-sm leading-[1.65] text-[#94A3B8]">
                      {item.responsibilities.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#38BDF8]"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>

                    {item.technologies.length > 0 ? (
                      <p className="mt-5 border-t border-[#263244] pt-4 font-mono text-xs text-[#64748B]">
                        {item.technologies.join(' · ')}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
