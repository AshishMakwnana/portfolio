import { CheckCircle2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ProfileData } from '../../types/portfolio';
import { SectionHeading } from '../ui/SectionHeading';
import { Skeleton } from '../ui/Skeleton';

interface AboutSectionProps {
  profile: ProfileData | null;
  loading: boolean;
}

export function AboutSection({ profile, loading }: AboutSectionProps) {
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
      id="about"
      className="border-b border-[#263244]/70 py-16 md:py-20 lg:py-28"
    >
      <motion.div
        {...revealProps}
        className="mx-auto max-w-[1280px] px-5 md:px-8"
      >
        <SectionHeading
          indexLabel="01 / About Me"
          title={
            profile?.aboutHeading ??
            'A Developer Focused on Building Real Solutions.'
          }
        />

        {loading || !profile ? (
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <Skeleton className="h-40 lg:col-span-7" />
            <Skeleton className="h-40 lg:col-span-5" />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-5 text-[15px] leading-[1.7] text-[#94A3B8] md:text-base lg:col-span-7">
              {profile.aboutParagraphs.map((paragraph, idx) => (
                <p key={idx} className="max-w-[65ch]">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="rounded-xl border border-[#263244] bg-[#111827] p-6 lg:col-span-5">
              <h3 className="text-base font-semibold text-[#F8FAFC]">
                Core Engineering Focus
              </h3>
              <ul className="mt-4 divide-y divide-[#263244]">
                {profile.aboutHighlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 text-sm text-[#94A3B8]"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#38BDF8]"
                      aria-hidden="true"
                    />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
