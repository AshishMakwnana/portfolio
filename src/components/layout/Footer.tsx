import { Github, Linkedin } from 'lucide-react';
import type { ProfileData, SiteSettings } from '../../types/portfolio';

interface FooterProps {
  profile: ProfileData | null;
  settings: SiteSettings | null;
  onNavigateHomeSection: (sectionId: string) => void;
  onNavigateAdmin: () => void;
}

const FOOTER_LINKS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'skills', label: 'Skills', href: '#skills' },
  { id: 'experience', label: 'Experience', href: '#experience' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'contact', label: 'Contact', href: '#contact' },
];

export function Footer({
  profile,
  settings,
  onNavigateHomeSection,
  onNavigateAdmin,
}: FooterProps) {
  const year = settings?.copyrightYear ?? 2026;

  return (
    <footer className="border-t border-[#263244] bg-[#080B12] py-10">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="text-base font-bold text-[#F8FAFC]">
            {profile?.name ?? 'Ashish Makwana'}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            {settings?.footerTagline ??
              profile?.designation ??
              'Laravel Developer | Backend Engineer | Full-Stack Developer'}
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-[#94A3B8]"
        >
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => {
                event.preventDefault();
                onNavigateHomeSection(link.id);
              }}
              className="hover:text-[#F8FAFC] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/admin"
            onClick={(event) => {
              event.preventDefault();
              onNavigateAdmin();
            }}
            className="text-[#64748B] hover:text-[#38BDF8] transition-colors"
          >
            Admin
          </a>
        </nav>

        <div className="flex items-center gap-5 text-xs text-[#64748B]">
          {profile?.socialLinks.map((social) => {
            const Icon = social.platform === 'github' ? Github : Linkedin;
            return (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            );
          })}
          <span className="tabular-nums">
            &copy; {year} {profile?.name ?? 'Ashish Makwana'}
          </span>
        </div>
      </div>
    </footer>
  );
}
