import { Award, ExternalLink, GraduationCap } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { CertificationItem, EducationItem } from '../../types/portfolio';
import { formatInlineMetadata } from '../../utils/portfolioLogic';
import { SectionHeading } from '../ui/SectionHeading';
import { Skeleton } from '../ui/Skeleton';

interface LearningSectionProps {
  education: EducationItem[];
  certifications: CertificationItem[];
  loading: boolean;
}

export function LearningSection({
  education,
  certifications,
  loading,
}: LearningSectionProps) {
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
      id="learning"
      className="border-b border-[#263244]/70 py-16 md:py-20 lg:py-28"
    >
      <motion.div
        {...revealProps}
        className="mx-auto max-w-[1280px] px-5 md:px-8"
      >
        <SectionHeading
          indexLabel="05 / Learning"
          title="Education & Professional Learning."
        />

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Education */}
            <div className="lg:col-span-6">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[#F8FAFC] mb-4">
                <GraduationCap className="h-4 w-4 text-[#38BDF8]" aria-hidden="true" />
                <h3>Education</h3>
              </div>

              {education.length === 0 ? (
                <div className="rounded-xl border border-[#263244] bg-[#111827] p-6 text-sm text-[#94A3B8]">
                  No education records added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {education.map((edu) => (
                    <article
                      key={edu.id}
                      className="rounded-xl border border-[#263244] bg-[#111827] p-6"
                    >
                      <p className="font-mono text-xs text-[#38BDF8]">
                        {formatInlineMetadata([edu.period, edu.location])}
                      </p>
                      <h4 className="mt-2 text-lg font-semibold text-[#F8FAFC]">
                        {edu.degree}
                      </h4>
                      <p className="mt-1 text-sm font-medium text-[#CBD5E1]">
                        {edu.institution}
                      </p>
                      {edu.description ? (
                        <p className="mt-3 text-sm leading-relaxed text-[#94A3B8]">
                          {edu.description}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Courses and independent learning */}
            <div className="lg:col-span-6">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[#F8FAFC] mb-4">
                <Award className="h-4 w-4 text-[#38BDF8]" aria-hidden="true" />
                <h3>Courses & Independent Learning</h3>
              </div>

              {certifications.length === 0 ? (
                <div className="rounded-xl border border-[#263244] bg-[#111827] p-6 text-sm text-[#94A3B8]">
                  No learning records added yet.
                </div>
              ) : (
                <div className="divide-y divide-[#263244] rounded-xl border border-[#263244] bg-[#111827] px-6">
                  {certifications.map((cert) => (
                    <article
                      key={cert.id}
                      className="flex items-start justify-between gap-4 py-5"
                    >
                      <div>
                        <h4 className="text-base font-semibold text-[#F8FAFC]">
                          {cert.title}
                        </h4>
                        <p className="mt-1 text-xs font-mono text-[#94A3B8]">
                          {formatInlineMetadata([cert.issuer, cert.date])}
                        </p>
                      </div>

                      {cert.credentialUrl ? (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Verify ${cert.title}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#38BDF8] hover:text-[#60CAFA] whitespace-nowrap shrink-0"
                        >
                          <span>Verify</span>
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
