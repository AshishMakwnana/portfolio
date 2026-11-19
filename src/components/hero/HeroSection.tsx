import { ArrowRight, Download, Github, Linkedin, Terminal } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { PortfolioPayload } from '../../types/portfolio';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { HeroArchitectureWorkbench } from './HeroArchitectureWorkbench';

interface HeroSectionProps {
  data: PortfolioPayload | null;
  loading: boolean;
  downloadingResume: boolean;
  onDownloadResume: () => void;
}

export function HeroSection({
  data,
  loading,
  downloadingResume,
  onDownloadResume,
}: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const profile = data?.profile;

  const renderHighlightedHeadline = (headline: string, highlight: string) => {
    if (!highlight || !headline.includes(highlight)) {
      return headline;
    }
    const [before, after] = headline.split(highlight);
    return (
      <>
        {before}
        <span className="text-[#38BDF8]">{highlight}</span>
        {after}
      </>
    );
  };

  const entranceTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section
      id="home"
      className="relative overflow-hidden border-b border-[#263244]/70 py-14 md:py-20 lg:py-24"
    >
      {/* Restrained sky-blue radial ambient glow behind Hero */}
      <div
        aria-hidden="true"
        className="hero-radial-glow pointer-events-none absolute -top-24 left-1/2 h-[540px] w-[780px] -translate-x-1/2 rounded-full"
      />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-stretch gap-10 px-5 md:px-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Core Engineering Identity & Actions */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={entranceTransition}
          className="flex flex-col justify-center lg:col-span-6"
        >
          {loading || !profile ? (
            <div className="space-y-4">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-14 w-full max-w-lg" />
              <Skeleton className="h-14 w-4/5" />
              <Skeleton className="h-5 w-80" />
              <Skeleton className="h-20 w-full max-w-xl" />
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#38BDF8]">
                <Terminal className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{profile.availabilityText}</span>
              </div>

              <p className="mt-5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#94A3B8]">
                {profile.greeting}
              </p>

              <h1 className="mt-3 text-[clamp(2.35rem,4.3vw,4.15rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#F8FAFC]">
                {renderHighlightedHeadline(
                  profile.headline,
                  profile.headlineHighlight,
                )}
              </h1>

              <p className="mt-5 text-base font-semibold text-[#E2E8F0] md:text-lg">
                {profile.designation}
              </p>

              <p className="mt-4 max-w-[60ch] text-[15px] leading-[1.68] text-[#94A3B8] md:text-base">
                {profile.shortIntro}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button href="#projects" variant="primary" size="lg" className="group w-full sm:w-auto">
                  <span>Explore My Work</span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                  isLoading={downloadingResume}
                  onClick={onDownloadResume}
                >
                  <Download className="h-4 w-4 text-[#38BDF8]" aria-hidden="true" />
                  <span>Download Resume</span>
                </Button>

                <Button
                  href="#contact"
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto border border-[#263244]/60 sm:border-transparent"
                >
                  <span>Contact Me</span>
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-6 border-t border-[#263244] pt-6">
                {profile.socialLinks.map((social) => {
                  const Icon =
                    social.platform === 'github' ? Github : Linkedin;
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors duration-200"
                    >
                      <Icon className="h-4 w-4 text-[#38BDF8]" aria-hidden="true" />
                      <span>{social.label}</span>
                    </a>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>

        {/* Right Column: Interactive Terminal & Backend Architecture Workbench */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }
          }
          className="lg:col-span-6"
        >
          <HeroArchitectureWorkbench
            nodes={data?.architectureNodes ?? []}
            workflows={data?.architectureWorkflows ?? []}
            loading={loading}
          />
        </motion.div>
      </div>
    </section>
  );
}
