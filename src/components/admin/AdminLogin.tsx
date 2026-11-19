import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { adminApi, setStoredAdminToken } from './adminApi';

interface AdminLoginProps {
  onAuthenticated: (email: string) => void;
  onBackToSite: () => void;
}

export function AdminLogin({
  onAuthenticated,
  onBackToSite,
}: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminApi.login(email.trim(), password);
      setStoredAdminToken(res.token);
      onAuthenticated(res.email);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to authenticate.',
      );
    } finally {
      setLoading(false);
    }
  };

  const fillSeededCredentials = () => {
    setEmail('ashishmakwana435@gmail.com');
    setPassword('PortfolioAdmin#2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#080B12] flex flex-col justify-center px-5 py-12">
      <div className="mx-auto w-full max-w-md">
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault();
            onBackToSite();
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#94A3B8] hover:text-[#38BDF8] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Portfolio</span>
        </a>

        <div className="mt-6 rounded-xl border border-[#263244] bg-[#111827] p-6 md:p-8">
          <div className="flex items-center gap-2.5 text-[#38BDF8]">
            <Lock className="h-4 w-4" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-wider">
              Portfolio Admin
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold text-[#F8FAFC]">
            Sign in to Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-[#94A3B8]">
            Manage profile content, projects, skills, experience, and contact
            messages.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {error ? (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-3.5 py-3 text-sm text-[#F8FAFC]"
              >
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]"
                  aria-hidden="true"
                />
                <span>{error}</span>
              </div>
            ) : null}

            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-[#E2E8F0]"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ashishmakwana435@gmail.com"
                className="mt-1.5 w-full rounded-lg border border-[#263244] bg-[#080B12] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#38BDF8] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-[#E2E8F0]"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter admin password"
                className="mt-1.5 w-full rounded-lg border border-[#263244] bg-[#080B12] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#38BDF8] focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </Button>
          </form>

          <div className="mt-5 border-t border-[#263244] pt-4 flex items-center justify-between gap-3 text-xs text-[#64748B]">
            <span>Default admin configured for preview</span>
            <button
              type="button"
              onClick={fillSeededCredentials}
              className="font-medium text-[#38BDF8] hover:text-[#60CAFA] transition-colors cursor-pointer whitespace-nowrap"
            >
              Fill Default Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
