import { useCallback, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import { AdminApp } from './components/admin/AdminApp';
import { HeroSection } from './components/hero/HeroSection';
import { AboutSection } from './components/home/AboutSection';
import { ContactSection } from './components/home/ContactSection';
import { ExperienceSection } from './components/home/ExperienceSection';
import { LearningSection } from './components/home/LearningSection';
import { ProjectsSection } from './components/home/ProjectsSection';
import { SkillsSection } from './components/home/SkillsSection';
import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { ProjectDetailPage } from './components/projects/ProjectDetailPage';
import { Button } from './components/ui/Button';
import { usePortfolioData } from './hooks/usePortfolioData';

const SECTION_IDS = [
  'home',
  'about',
  'skills',
  'experience',
  'projects',
  'contact',
];

function parseRoute(pathname: string):
  | { view: 'home' }
  | { view: 'admin' }
  | { view: 'project'; slug: string } {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return { view: 'admin' };
  }
  const projectMatch = /^\/projects\/([^/]+)\/?$/.exec(pathname);
  if (projectMatch) {
    return { view: 'project', slug: decodeURIComponent(projectMatch[1]) };
  }
  return { view: 'home' };
}

export default function App() {
  const {
    data,
    loading,
    error,
    refetch,
    downloadingResume,
    resumeMessage,
    downloadResume,
  } = usePortfolioData();

  const [pathname, setPathname] = useState<string>(
    () => window.location.pathname,
  );
  const [activeSection, setActiveSection] = useState<string>('home');

  const route = parseRoute(pathname);

  const navigateTo = useCallback(
    (nextPath: string, refreshData = false) => {
      if (window.location.pathname !== nextPath) {
        window.history.pushState({}, '', nextPath);
      }
      setPathname(nextPath);
      if (refreshData) {
        void refetch();
      }
    },
    [refetch],
  );

  const navigateHomeSection = useCallback(
    (sectionId: string) => {
      setActiveSection(sectionId);
      const scrollToTarget = () => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0 });
        }
      };

      if (route.view !== 'home') {
        navigateTo('/', true);
        window.setTimeout(scrollToTarget, 60);
      } else {
        scrollToTarget();
      }
    },
    [navigateTo, route.view],
  );

  useEffect(() => {
    const onPopState = () => {
      setPathname(window.location.pathname);
      void refetch();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [refetch]);

  useEffect(() => {
    if (data?.settings.siteTitle) {
      document.title = data.settings.siteTitle;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', data.settings.siteTitle);
      }
    }
    if (data?.settings.metaDescription) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', data.settings.metaDescription);
      }
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute('content', data.settings.metaDescription);
      }
    }
  }, [data?.settings.metaDescription, data?.settings.siteTitle]);

  useEffect(() => {
    if (route.view !== 'home') return;

    const handleScroll = () => {
      const scrollMarker = window.scrollY + 140;
      let current = 'home';

      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollMarker) {
          current = id;
        }
      }

      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [route.view]);

  if (route.view === 'admin') {
    return (
      <MotionConfig reducedMotion="user">
        <AdminApp onBackToSite={() => navigateTo('/', true)} />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#080B12] text-[#F8FAFC] flex flex-col">
        <Navbar
          brandName={data?.profile.name ?? 'Ashish Makwana'}
          activeSection={route.view === 'project' ? 'projects' : activeSection}
          onSelectSection={navigateHomeSection}
          onDownloadResume={downloadResume}
          downloadingResume={downloadingResume}
          resumeMessage={resumeMessage}
        />

        {route.view === 'project' ? (
          <ProjectDetailPage
            slug={route.slug}
            onBackHome={() => navigateHomeSection('projects')}
          />
        ) : (
          <main className="flex-1">
            {error ? (
              <div className="mx-auto max-w-[1280px] px-5 pt-8 md:px-8">
                <div
                  role="alert"
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#EF4444]/40 bg-[#111827] px-5 py-4"
                >
                  <div className="flex items-center gap-3 text-sm text-[#F8FAFC]">
                    <AlertCircle
                      className="h-4 w-4 shrink-0 text-[#EF4444]"
                      aria-hidden="true"
                    />
                    <span>Unable to reach the portfolio API ({error}).</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void refetch()}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : null}

            <HeroSection
              data={data}
              loading={loading}
              downloadingResume={downloadingResume}
              onDownloadResume={downloadResume}
            />

            <AboutSection
              profile={data?.profile ?? null}
              loading={loading}
            />

            <SkillsSection skills={data?.skills ?? []} loading={loading} />

            <ExperienceSection
              experiences={data?.experiences ?? []}
              loading={loading}
            />

            <ProjectsSection
              projects={data?.projects ?? []}
              loading={loading}
              onNavigateProject={(slug) =>
                navigateTo(`/projects/${encodeURIComponent(slug)}`)
              }
            />

            <LearningSection
              education={data?.education ?? []}
              certifications={data?.certifications ?? []}
              loading={loading}
            />

            <ContactSection
              profile={data?.profile ?? null}
              loading={loading}
            />
          </main>
        )}

        <Footer
          profile={data?.profile ?? null}
          settings={data?.settings ?? null}
          onNavigateHomeSection={navigateHomeSection}
          onNavigateAdmin={() => navigateTo('/admin')}
        />
      </div>
    </MotionConfig>
  );
}
