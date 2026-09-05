"use client";

import {
  BarChart3,
  BookOpenCheck,
  ChevronRight,
  Flame,
  LayoutDashboard,
  Menu,
  MessageCircleMore,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Brand } from "./brand";
import { useLearning } from "./learning-provider";

const navigation = [
  { href: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/app/practice", label: "Practice", icon: MessageCircleMore },
  { href: "/app/vocabulary", label: "Vocabulary", icon: BookOpenCheck },
  { href: "/app/progress", label: "Progress", icon: BarChart3 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, hydrated, stats } = useLearning();
  const [menuOpen, setMenuOpen] = useState(false);
  const profile = data.profile;

  useEffect(() => {
    if (hydrated && !profile?.onboarded) {
      router.replace("/onboarding");
    }
  }, [hydrated, profile?.onboarded, router]);


  const progressPercent = useMemo(() => {
    if (!profile) return 0;
    return Math.min(100, Math.round((stats.todayMinutes / profile.dailyGoal) * 100));
  }, [profile, stats.todayMinutes]);

  if (!hydrated || !profile?.onboarded) {
    return <WorkspaceLoading />;
  }

  return (
    <div className="workspace-page">
      <aside className={`workspace-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <Brand href="/app" />
          <button
            className="icon-button sidebar-close"
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close workspace menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="workspace-nav" aria-label="Learning workspace navigation">
          <span className="nav-caption">LEARN</span>
          {navigation.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                className={`workspace-nav-link ${isActive ? "workspace-nav-active" : ""}`}
                href={item.href}
                key={item.href}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="nav-active-arrow" size={16} />}
              </Link>
            );
          })}
          <span className="nav-caption nav-caption-space">ACCOUNT</span>
          <Link
            className={`workspace-nav-link ${pathname.startsWith("/app/settings") ? "workspace-nav-active" : ""}`}
            href="/app/settings"
            onClick={() => setMenuOpen(false)}
          >
            <Settings2 size={19} />
            <span>Settings</span>
          </Link>
        </nav>
        <div className="sidebar-goal-card">
          <div className="sidebar-goal-title">
            <span><Sparkles size={15} /> Daily goal</span>
            <strong>{progressPercent}%</strong>
          </div>
          <div className="progress-track"><i style={{ width: `${progressPercent}%` }} /></div>
          <p>{stats.todayMinutes} of {profile.dailyGoal} min practiced today</p>
        </div>
        <div className="sidebar-local-note">
          <span className="local-status-dot" /> Local-only mode
        </div>
      </aside>

      {menuOpen && <button className="sidebar-backdrop" type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}

      <div className="workspace-content-wrap">
        <header className="workspace-header">
          <button
            className="icon-button mobile-workspace-menu"
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open workspace menu"
          >
            <Menu size={21} />
          </button>
          <div className="workspace-breadcrumb">
            <span>My learning space</span>
            <span className="header-separator">/</span>
            <strong>{navigation.find((item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href)))?.label ?? "Settings"}</strong>
          </div>
          <div className="header-actions">
            <span className="header-streak" title="Current learning streak">
              <Flame size={17} /> {stats.streak} day{stats.streak === 1 ? "" : "s"}
            </span>
            <Link className="profile-chip" href="/app/settings" aria-label="Open profile settings">
              <span className="profile-avatar">{profile.name.charAt(0).toUpperCase()}</span>
              <span className="profile-chip-copy">
                <strong>{profile.name}</strong>
                <small>{profile.targetLanguage}</small>
              </span>
            </Link>
          </div>
        </header>
        <main className="workspace-main">{children}</main>
      </div>
    </div>
  );
}

function WorkspaceLoading() {
  return (
    <main className="loading-page" aria-live="polite">
      <Brand />
      <div className="loading-spinner" />
      <p>Loading your local workspace…</p>
    </main>
  );
}
