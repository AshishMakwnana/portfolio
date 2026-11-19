import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Send,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ProfileData } from '../../types/portfolio';
import { validateContactInput } from '../../utils/validation';
import { Button } from '../ui/Button';
import { SectionHeading } from '../ui/SectionHeading';
import { Skeleton } from '../ui/Skeleton';

interface ContactSectionProps {
  profile: ProfileData | null;
  loading: boolean;
}

export function ContactSection({ profile, loading }: ContactSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    { type: 'success' | 'error'; text: string } | null
  >(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async (addr: string) => {
    try {
      await navigator.clipboard.writeText(addr);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      setCopiedEmail(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitStatus(null);

    const validation = validateContactInput({ name, email, subject, message });
    if (!validation.valid || !validation.sanitized) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.sanitized),
      });

      const body = (await response.json()) as {
        ok?: boolean;
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!response.ok) {
        if (body.fieldErrors) {
          setFieldErrors(body.fieldErrors);
        }
        setSubmitStatus({
          type: 'error',
          text: body.error || 'Unable to send your message right now.',
        });
        return;
      }

      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSubmitStatus({
        type: 'success',
        text: 'Message received. Thank you for reaching out — I will respond shortly.',
      });
    } catch {
      setSubmitStatus({
        type: 'error',
        text: 'Network error while sending your message. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const revealProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.12 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
      };

  const inputBaseClass =
    'mt-2 w-full rounded-lg border bg-[#080B12] px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#64748B] transition-colors focus:outline-none focus:border-[#38BDF8] disabled:opacity-50';

  return (
    <section id="contact" className="py-16 md:py-20 lg:py-28">
      <motion.div
        {...revealProps}
        className="mx-auto max-w-[1280px] px-5 md:px-8"
      >
        <SectionHeading
          indexLabel="06 / Get In Touch"
          title="Let's Discuss Architecture & Roles"
          description="Available for full-time backend engineering positions, API development, and distributed system design."
        />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Direct Details */}
          <div className="space-y-6 lg:col-span-5">
            {loading || !profile ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <div className="rounded-xl border border-[#263244] bg-[#111827] p-6 space-y-6">
                <p className="text-sm leading-[1.7] text-[#94A3B8]">
                  If you are hiring for a backend role or would like to discuss a
                  web application, send me a message below or email me directly.
                </p>

                <div className="space-y-4 border-t border-[#263244] pt-5">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-[#263244] bg-[#080B12] px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Mail
                        className="h-4 w-4 shrink-0 text-[#38BDF8]"
                        aria-hidden="true"
                      />
                      <a
                        href={`mailto:${profile.email}`}
                        className="truncate text-sm font-medium text-[#F8FAFC] hover:text-[#38BDF8] transition-colors"
                      >
                        {profile.email}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(profile.email)}
                      aria-label="Copy email address"
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#263244] bg-[#161F2E] px-2.5 py-1.5 text-xs font-medium text-[#F8FAFC] hover:border-[#38BDF8]/60 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedEmail ? (
                        <>
                          <Check
                            className="h-3.5 w-3.5 text-[#22C55E]"
                            aria-hidden="true"
                          />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy
                            className="h-3.5 w-3.5 text-[#94A3B8]"
                            aria-hidden="true"
                          />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-[#94A3B8]">
                    <MapPin
                      className="h-4 w-4 shrink-0 text-[#38BDF8]"
                      aria-hidden="true"
                    />
                    <span>{profile.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-5 border-t border-[#263244] pt-5">
                  {profile.socialLinks.map((social) => {
                    const Icon =
                      social.platform === 'github' ? Github : Linkedin;
                    return (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                      >
                        <Icon
                          className="h-4 w-4 text-[#38BDF8]"
                          aria-hidden="true"
                        />
                        <span>{social.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Validated Contact Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-xl border border-[#263244] bg-[#111827] p-6 md:p-8 space-y-5"
            >
              {submitStatus ? (
                <div
                  role={submitStatus.type === 'error' ? 'alert' : 'status'}
                  className={[
                    'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm',
                    submitStatus.type === 'success'
                      ? 'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#F8FAFC]'
                      : 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#F8FAFC]',
                  ].join(' ')}
                >
                  {submitStatus.type === 'success' ? (
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]"
                      aria-hidden="true"
                    />
                  ) : (
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]"
                      aria-hidden="true"
                    />
                  )}
                  <span>{submitStatus.text}</span>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-[#E2E8F0]"
                  >
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    disabled={submitting}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    aria-invalid={Boolean(fieldErrors.name)}
                    className={[
                      inputBaseClass,
                      fieldErrors.name ? 'border-[#EF4444]' : 'border-[#263244]',
                    ].join(' ')}
                  />
                  {fieldErrors.name ? (
                    <p className="mt-1.5 text-xs text-[#EF4444]">
                      {fieldErrors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-[#E2E8F0]"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    disabled={submitting}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    aria-invalid={Boolean(fieldErrors.email)}
                    className={[
                      inputBaseClass,
                      fieldErrors.email ? 'border-[#EF4444]' : 'border-[#263244]',
                    ].join(' ')}
                  />
                  {fieldErrors.email ? (
                    <p className="mt-1.5 text-xs text-[#EF4444]">
                      {fieldErrors.email}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-sm font-medium text-[#E2E8F0]"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  required
                  disabled={submitting}
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Backend engineering role or project inquiry"
                  aria-invalid={Boolean(fieldErrors.subject)}
                  className={[
                    inputBaseClass,
                    fieldErrors.subject ? 'border-[#EF4444]' : 'border-[#263244]',
                  ].join(' ')}
                />
                {fieldErrors.subject ? (
                  <p className="mt-1.5 text-xs text-[#EF4444]">
                    {fieldErrors.subject}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-[#E2E8F0]"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  disabled={submitting}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Share project requirements, timeline, or role details..."
                  aria-invalid={Boolean(fieldErrors.message)}
                  className={[
                    inputBaseClass,
                    fieldErrors.message ? 'border-[#EF4444]' : 'border-[#263244]',
                  ].join(' ')}
                />
                {fieldErrors.message ? (
                  <p className="mt-1.5 text-xs text-[#EF4444]">
                    {fieldErrors.message}
                  </p>
                ) : null}
              </div>

              <div className="pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={submitting}
                  className="w-full sm:w-auto"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
