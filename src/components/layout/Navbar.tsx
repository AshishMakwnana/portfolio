import { useEffect, useState } from 'react';
import { Download, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'skills', label: 'Skills', href: '#skills' },
  { id: 'experience', label: 'Experience', href: '#experience' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'contact', label: 'Contact', href: '#contact' },
];

interface NavbarProps {
  brandName: string;
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  onDownloadResume: () => void;
  downloadingResume: boolean;
  resumeMessage: string | null;
}

export function Navbar({
  brandName,
  activeSection,
  onSelectSection,
  onDownloadResume,
  downloadingResume,
  resumeMessage,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const handleLinkClick = (sectionId: string) => {
    onSelectSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={[
        'sticky top-0 z-40 w-full transition-colors duration-300',
        scrolled || mobileMenuOpen
          ? 'bg-[#080B12]/90 backdrop-blur-md border-b border-[#263244]'
          : 'bg-[#080B12]/60 backdrop-blur-sm border-b border-transparent',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-5 py-3.5 md:px-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            handleLinkClick('home');
          }}
          className="text-base font-bold tracking-tight text-[#F8FAFC] whitespace-nowrap shrink-0 hover:text-[#38BDF8] transition-colors duration-200"
        >
          {brandName}
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 lg:gap-7"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(event) => {
                  event.preventDefault();
                  handleLinkClick(item.id);
                }}
                className={[
                  'relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-200',
                  isActive
                    ? 'text-[#F8FAFC]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]',
                ].join(' ')}
              >
                {item.label}
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-[#38BDF8]"
                  />
                ) : null}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Primary action + mobile toggle */}
        <div className="flex items-center gap-3 shrink-0">
          {resumeMessage ? (
            <span
              role="status"
              className={`hidden max-w-[280px] truncate text-xs font-medium whitespace-nowrap lg:inline ${
                resumeMessage === 'Resume downloaded'
                  ? 'text-[#22C55E]'
                  : 'text-[#F87171]'
              }`}
              title={resumeMessage}
            >
              {resumeMessage}
            </span>
          ) : null}

          <div className="hidden md:block">
            <Button
              variant="secondary"
              size="sm"
              isLoading={downloadingResume}
              onClick={onDownloadResume}
              aria-label="Download Resume"
            >
              <Download className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
              <span>Resume</span>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#263244] bg-[#111827] text-[#F8FAFC] md:hidden hover:border-[#38BDF8]/50 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen ? (
        <div
          id="mobile-navigation-drawer"
          className="border-t border-[#263244] bg-[#080B12] px-5 pb-6 pt-4 md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(event) => {
                    event.preventDefault();
                    handleLinkClick(item.id);
                  }}
                  className={[
                    'flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#161F2E] text-[#38BDF8]'
                      : 'text-[#94A3B8] hover:bg-[#111827] hover:text-[#F8FAFC]',
                  ].join(' ')}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-[#263244] pt-4">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              isLoading={downloadingResume}
              onClick={() => {
                onDownloadResume();
                setMobileMenuOpen(false);
              }}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Download Resume</span>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
