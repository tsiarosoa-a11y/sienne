"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, type ReactNode } from "react";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { monthLabel, MONTH_LABELS } from "@/lib/format";

const NAV = [
  { href: "/",              label: "Tableau de bord", emoji: "📊", id: "dash" },
  { href: "/depenses",      label: "Dépenses",        emoji: "🛒", id: "exp"  },
  { href: "/calendrier",    label: "Calendrier",      emoji: "📅", id: "cal"  },
  { href: "/statistiques",  label: "Statistiques",    emoji: "📈", id: "stat" },
  { href: "/parametres",    label: "Paramètres",      emoji: "⚙️", id: "set"  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthRoute = pathname === "/auth";

  useEffect(() => {
    if (!authLoading && !user && !isAuthRoute) {
      router.push("/auth");
    }
  }, [user, authLoading, isAuthRoute, router]);

  // Pour la page /auth, on affiche juste le contenu sans le shell
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Pour les autres pages, on attend l'authentification
  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-dvh flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border1/10 bg-surface/40 backdrop-blur-sm sticky top-0 h-dvh">
        <Brand />
        <Nav pathname={pathname} />
        <FooterInfo user={user} onSignOut={signOut} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-text1/30 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-surface border-r border-border1/10 flex flex-col lg:hidden"
            >
              <Brand onCloseMobile={() => setMobileOpen(false)} />
              <Nav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              <FooterInfo user={user} onSignOut={signOut} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function Brand({ onCloseMobile }: { onCloseMobile?: () => void }) {
  return (
    <div className="px-5 pt-6 pb-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3" onClick={onCloseMobile}>
        <div className="size-9 rounded-xl bg-gradient-to-br from-accent to-accentStrong grid place-items-center shadow-card">
          <svg viewBox="0 0 24 24" className="size-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21c0-7 4-13 9-13s9 6 9 13" />
            <circle cx="12" cy="8" r="3" />
          </svg>
        </div>
        <div className="leading-tight">
          <div className="font-display text-[19px] tracking-tight text-text1">Sienne</div>
          <div className="text-[10.5px] uppercase tracking-[0.18em] text-text3">Budget</div>
        </div>
      </Link>
      {onCloseMobile && (
        <button onClick={onCloseMobile} className="size-9 rounded-lg hover:bg-surface2 grid place-items-center text-text3 lg:hidden">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

function Nav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="px-3 mt-3 flex-1">
      <ul className="space-y-1">
        {NAV.map(item => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={clsx(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active ? "text-text1" : "text-text2 hover:text-text1 hover:bg-surface2/60"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-accentLight/45 -z-0"
                  />
                )}
                <span className="relative size-7 rounded-lg bg-surface2 flex items-center justify-center text-[14px]">
                  {item.emoji}
                </span>
                <span className="relative">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function FooterInfo({ user, onSignOut }: { user: any; onSignOut: () => Promise<void> }) {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await onSignOut();
    } catch (err) {
      console.error(err);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="px-5 py-5 mt-auto border-t border-border1/10 space-y-3">
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.18em] text-text3 mb-1">
          Connecté
        </div>
        <p className="text-[12px] text-text2 truncate">
          {user?.email}
        </p>
      </div>
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="w-full px-3 py-2 rounded-lg bg-accentLight/40 hover:bg-accentLight/60 text-text1 text-sm font-medium transition-colors disabled:opacity-50"
      >
        {signingOut ? "Déconnexion..." : "Déconnexion"}
      </button>
    </div>
  );
}

function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { state, dispatch, currentMonth } = useStore();
  const [openMonth, setOpenMonth] = useState(false);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-bg/75 border-b border-border1/10">
      <div className="px-4 sm:px-6 lg:px-10 h-16 flex items-center gap-3 max-w-[1400px] mx-auto w-full">
        <button
          onClick={onOpenMobile}
          className="lg:hidden size-9 rounded-lg hover:bg-surface2 grid place-items-center text-text2"
          aria-label="Menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="relative">
          <button
            onClick={() => setOpenMonth(v => !v)}
            className="flex items-center gap-2 h-10 px-3 rounded-xl hover:bg-surface2 transition-colors"
          >
            <span className="text-[15px] font-display tracking-tight">{monthLabel(currentMonth.key)}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-text3">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <AnimatePresence>
            {openMonth && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute left-0 top-full mt-2 w-52 bg-surface rounded-xl shadow-cardLg border border-border1/15 p-1.5 z-30"
              >
                {MONTH_LABELS.map((m, i) => {
                  const key = `2026-${String(i + 1).padStart(2, "0")}`;
                  const active = key === state.currentMonth;
                  return (
                    <button
                      key={key}
                      onClick={() => { dispatch({ type: "SET_MONTH", key }); setOpenMonth(false); }}
                      className={clsx(
                        "w-full text-left px-3 py-2 rounded-lg text-[13.5px] transition-colors",
                        active ? "bg-accentLight/40 text-text1 font-semibold" : "hover:bg-surface2 text-text2"
                      )}
                    >
                      {m} 2026
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => dispatch({ type: "TOGGLE_THEME" })}
          className="size-10 rounded-xl hover:bg-surface2 grid place-items-center text-text2 transition-colors"
          aria-label="Basculer thème"
        >
          <AnimatePresence mode="wait" initial={false}>
            {state.theme === "light" ? (
              <motion.svg
                key="sun"
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-[18px]"
              >
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" />
                <line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
              </motion.svg>
            ) : (
              <motion.svg
                key="moon"
                initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-[18px]"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>
      </div>
    </header>
  );
}
