import { useCallback, useEffect, useState } from 'react';
import {
  Award,
  Briefcase,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileText,
  FolderGit2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  User,
  X,
} from 'lucide-react';
import type { AdminDatabaseRecord } from '../../types/portfolio';
import { Skeleton } from '../ui/Skeleton';
import {
  adminApi,
  getStoredAdminToken,
  setStoredAdminToken,
} from './adminApi';
import {
  AdminCertificationsManager,
  AdminEducationManager,
  AdminExperienceManager,
  AdminMessagesManager,
  AdminSkillsManager,
} from './AdminCatalogManagers';
import { AdminLogin } from './AdminLogin';
import {
  AdminProfileManager,
  AdminResumeManager,
  AdminSettingsManager,
} from './AdminProfileSettings';
import { AdminProjectsManager } from './AdminProjectsManager';
import { ConfirmDialog } from './ConfirmDialog';

type AdminTab =
  | 'overview'
  | 'profile'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'education'
  | 'certifications'
  | 'messages'
  | 'resume'
  | 'settings';

const SIDEBAR_ITEMS: Array<{
  id: AdminTab;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'skills', label: 'Skills', icon: Code2 },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'certifications', label: 'Courses & Learning', icon: Award },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'settings', label: 'Website Settings', icon: Settings },
];

interface AdminAppProps {
  onBackToSite: () => void;
}

export function AdminApp({ onBackToSite }: AdminAppProps) {
  const [authChecking, setAuthChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [db, setDb] = useState<AdminDatabaseRecord | null>(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
    loading: boolean;
  }>({
    open: false,
    title: '',
    description: '',
    action: async () => {},
    loading: false,
  });

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoadingDb(true);
    try {
      const record = await adminApi.fetchDashboard();
      setDb(record);
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Unable to load dashboard data.',
      );
    } finally {
      setLoadingDb(false);
    }
  }, [showToast]);

  useEffect(() => {
    const token = getStoredAdminToken();
    if (!token) {
      setAuthChecking(false);
      return;
    }

    adminApi
      .checkSession()
      .then((res) => {
        if (res.authenticated && res.email) {
          setAdminEmail(res.email);
          void loadDashboard();
        } else {
          setStoredAdminToken(null);
        }
      })
      .catch(() => {
        setStoredAdminToken(null);
      })
      .finally(() => setAuthChecking(false));
  }, [loadDashboard]);

  const handleAuthenticated = (email: string) => {
    setAdminEmail(email);
    void loadDashboard();
  };

  const handleLogout = () => {
    setStoredAdminToken(null);
    setAdminEmail(null);
    setDb(null);
  };

  const requestDelete = (label: string, action: () => Promise<void>) => {
    setConfirmState({
      open: true,
      title: `Delete ${label}?`,
      description:
        'This action permanently removes the selected item from the portfolio database.',
      action,
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    setConfirmState((prev) => ({ ...prev, loading: true }));
    try {
      await confirmState.action();
      setConfirmState((prev) => ({ ...prev, open: false, loading: false }));
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Delete operation failed.',
      );
      setConfirmState((prev) => ({ ...prev, loading: false }));
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#080B12] flex items-center justify-center p-6">
        <Skeleton className="h-64 w-full max-w-md" />
      </div>
    );
  }

  if (!adminEmail) {
    return (
      <AdminLogin
        onAuthenticated={handleAuthenticated}
        onBackToSite={onBackToSite}
      />
    );
  }

  const unreadCount = db?.messages.filter((m) => !m.read).length ?? 0;
  const activeNavMeta =
    SIDEBAR_ITEMS.find((item) => item.id === activeTab) ?? SIDEBAR_ITEMS[0];

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        <div className="px-3 py-2">
          <p className="text-sm font-bold text-[#F8FAFC]">Ashish Makwana</p>
          <p className="mt-0.5 font-mono text-[11px] text-[#64748B]">
            Portfolio Admin
          </p>
        </div>

        <nav aria-label="Admin navigation" className="mt-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileNavOpen(false);
                }}
                className={[
                  'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'bg-[#161F2E] text-[#38BDF8]'
                    : 'text-[#94A3B8] hover:bg-[#161F2E]/50 hover:text-[#F8FAFC]',
                ].join(' ')}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {item.id === 'messages' && unreadCount > 0 ? (
                  <span className="font-mono text-xs tabular-nums text-[#38BDF8]">
                    {unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[#263244] pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#94A3B8] hover:bg-[#161F2E] hover:text-[#EF4444] transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F8FAFC] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-[#263244] bg-[#111827] lg:block">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileNavOpen ? (
        <div
          className="fixed inset-0 z-50 flex lg:hidden bg-black/70"
          onClick={() => setMobileNavOpen(false)}
        >
          <aside
            className="w-64 border-r border-[#263244] bg-[#111827] h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close admin sidebar"
                className="p-2 text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {renderSidebarContent()}
          </aside>
        </div>
      ) : null}

      {/* Main Content Shell */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#263244] bg-[#080B12]/90 px-5 py-3.5 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open admin sidebar"
              className="rounded-lg border border-[#263244] bg-[#111827] p-2 text-[#F8FAFC] lg:hidden"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="text-sm font-medium text-[#94A3B8]">
              <span>Admin</span>
              <span className="mx-2 text-[#64748B]">/</span>
              <span className="text-[#F8FAFC] font-semibold">
                {activeNavMeta.label}
              </span>
            </div>
          </div>

          <a
            href="/"
            onClick={(event) => {
              event.preventDefault();
              onBackToSite();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#263244] bg-[#111827] px-3.5 py-2 text-xs font-medium text-[#F8FAFC] hover:border-[#38BDF8]/60 transition-colors whitespace-nowrap shrink-0"
          >
            <span>View Live Site</span>
            <ExternalLink className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
          </a>
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-6xl w-full mx-auto">
          {toast ? (
            <div
              role="status"
              className={[
                'mb-6 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm',
                toast.type === 'success'
                  ? 'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#F8FAFC]'
                  : 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#F8FAFC]',
              ].join(' ')}
            >
              <CheckCircle2
                className={[
                  'h-4 w-4 shrink-0',
                  toast.type === 'success' ? 'text-[#22C55E]' : 'text-[#EF4444]',
                ].join(' ')}
                aria-hidden="true"
              />
              <span>{toast.text}</span>
            </div>
          ) : null}

          {loadingDb || !db ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
              <Skeleton className="h-72" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-[#263244] bg-[#111827] p-5">
                      <p className="text-xs font-mono text-[#64748B]">
                        Projects
                      </p>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-[#F8FAFC]">
                        {db.projects.length}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#263244] bg-[#111827] p-5">
                      <p className="text-xs font-mono text-[#64748B]">Skills</p>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-[#F8FAFC]">
                        {db.skills.length}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#263244] bg-[#111827] p-5">
                      <p className="text-xs font-mono text-[#64748B]">
                        Experience & Learning
                      </p>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-[#F8FAFC]">
                        {db.experiences.length +
                          db.education.length +
                          db.certifications.length}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#263244] bg-[#111827] p-5">
                      <p className="text-xs font-mono text-[#64748B]">
                        Unread Messages
                      </p>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-[#38BDF8]">
                        {unreadCount}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#263244] bg-[#111827] p-6">
                    <div className="flex items-center justify-between gap-4 border-b border-[#263244] pb-4">
                      <h2 className="text-base font-semibold text-[#F8FAFC]">
                        Recent Contact Messages
                      </h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab('messages')}
                        className="text-xs font-medium text-[#38BDF8] hover:text-[#60CAFA] cursor-pointer"
                      >
                        Open Inbox
                      </button>
                    </div>
                    {db.messages.length === 0 ? (
                      <p className="pt-4 text-sm text-[#94A3B8]">
                        No messages received yet.
                      </p>
                    ) : (
                      <ul className="divide-y divide-[#263244]">
                        {db.messages.slice(0, 5).map((msg) => (
                          <li
                            key={msg.id}
                            className="flex items-center justify-between gap-4 py-3.5 text-sm"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-[#F8FAFC] truncate">
                                {msg.subject}
                              </p>
                              <p className="text-xs text-[#94A3B8]">
                                {msg.name} · {msg.email}
                              </p>
                            </div>
                            <span
                              className={[
                                'font-mono text-xs shrink-0',
                                msg.read ? 'text-[#64748B]' : 'text-[#38BDF8]',
                              ].join(' ')}
                            >
                              {msg.read ? 'Read' : 'Unread'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : null}

              {activeTab === 'profile' ? (
                <AdminProfileManager
                  profile={db.profile}
                  onRefresh={loadDashboard}
                  onToast={showToast}
                />
              ) : null}

              {activeTab === 'projects' ? (
                <AdminProjectsManager
                  projects={db.projects}
                  onRefresh={loadDashboard}
                  onToast={showToast}
                  onRequestDelete={requestDelete}
                />
              ) : null}

              {activeTab === 'skills' ? (
                <AdminSkillsManager
                  skills={db.skills}
                  onRefresh={loadDashboard}
                  onToast={showToast}
                  onRequestDelete={requestDelete}
                />
              ) : null}

              {activeTab === 'experience' ? (
                <AdminExperienceManager
                  experiences={db.experiences}
                  onRefresh={loadDashboard}
                  onToast={showToast}
                  onRequestDelete={requestDelete}
                />
              ) : null}

              {activeTab === 'education' ? (
                <AdminEducationManager
                  education={db.education}
                  onRefresh={loadDashboard}
                  onToast={showToast}
                  onRequestDelete={requestDelete}
                />
              ) : null}

              {activeTab === 'certifications' ? (
                <AdminCertificationsManager
                  certifications={db.certifications}
                  onRefresh={loadDashboard}
                  onToast={showToast}
                  onRequestDelete={requestDelete}
                />
              ) : null}

              {activeTab === 'messages' ? (
                <AdminMessagesManager
                  messages={db.messages}
                  onRefresh={loadDashboard}
                  onToast={showToast}
                  onRequestDelete={requestDelete}
                />
              ) : null}

              {activeTab === 'resume' ? (
                <AdminResumeManager
                  profile={db.profile}
                  onRefresh={loadDashboard}
                  onToast={showToast}
                />
              ) : null}

              {activeTab === 'settings' ? (
                <AdminSettingsManager
                  settings={db.settings}
                  onRefresh={loadDashboard}
                  onToast={showToast}
                />
              ) : null}
            </>
          )}
        </main>
      </div>

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        loading={confirmState.loading}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setConfirmState((prev) => ({ ...prev, open: false }))
        }
      />
    </div>
  );
}
