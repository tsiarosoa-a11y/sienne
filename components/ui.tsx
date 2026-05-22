"use client";

import { motion, AnimatePresence, type HTMLMotionProps } from "framer-motion";
import { useEffect, type ReactNode, type HTMLAttributes, type InputHTMLAttributes } from "react";
import clsx from "clsx";

// ─── CARD ──────────────────────────────────────────────────
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  accent?: boolean;          // bordure d'accent terracotta plus marquée
  noPadding?: boolean;
}
export function Card({ glass, accent, noPadding, className, children, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl shadow-card transition-shadow",
        glass ? "glass" : "bg-surface border border-border1/15",
        accent && "ring-1 ring-accent/20",
        !noPadding && "p-5 sm:p-6",
        "hover:shadow-cardLg",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

// ─── SECTION HEADER (reprend les "APERÇU DES …" du fichier) ─
export function SectionHeader({
  emoji, title, subtitle, action,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-9 rounded-xl bg-accentLight/40 flex items-center justify-center text-base shrink-0">
          <span aria-hidden>{emoji}</span>
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-[15px] leading-tight tracking-tight text-text1 uppercase">
            {title}
          </h3>
          {subtitle && <p className="text-[11.5px] text-text3 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── BUTTON ──────────────────────────────────────────────────
type Variant = "primary" | "ghost" | "subtle" | "danger";
type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: Variant;
  size?: "sm" | "md";
  icon?: ReactNode;
  children?: ReactNode;
};
const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accentStrong shadow-card",
  ghost:   "bg-transparent text-text2 hover:bg-surface2",
  subtle:  "bg-surface2 text-text1 hover:bg-accentLight/40 border border-border1/10",
  danger:  "bg-transparent text-accentStrong hover:bg-accentStrong/10 border border-accentStrong/30",
};
export function Button({
  variant = "primary", size = "md", icon, className, children, ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors",
        size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm",
        variantClasses[variant],
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  );
}

// ─── PROGRESS (style ASCII Excel + version moderne) ─────────
export function Progress({
  value, max = 1, label, accent = "rgb(var(--accent))",
}: {
  value: number; max?: number; label?: string; accent?: string;
}) {
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-[11.5px] uppercase tracking-wider text-text3">{label}</span>
          <span className="text-[11.5px] tabular-nums text-text2">{Math.round(pct * 100)}%</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-surface2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: accent }}
        />
      </div>
    </div>
  );
}

// ─── FIELD (reproduit les "cellules jaunes" du fichier Excel) ─
type FieldProps = InputHTMLAttributes<HTMLInputElement> & { suffix?: string };
export function Field({ className, suffix, ...rest }: FieldProps) {
  return (
    <div className="relative">
      <input
        {...rest}
        className={clsx(
          "editable w-full h-9 rounded-lg px-3 text-sm font-medium tabular-nums",
          suffix && "pr-8",
          className
        )}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-inputText/70 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

// ─── BADGE ──────────────────────────────────────────────────
export function Badge({
  children, tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "muted";
}) {
  const tones: Record<string, string> = {
    default: "bg-accentLight/40 text-accentStrong",
    success: "bg-success/15 text-success",
    warning: "bg-accentStrong/15 text-accentStrong",
    muted:   "bg-surface2 text-text3",
  };
  return (
    <span className={clsx(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider",
      tones[tone]
    )}>
      {children}
    </span>
  );
}

// ─── CHECKBOX (reproduit les ☑/☐ du fichier) ────────────────
export function Check({
  checked, onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={clsx(
        "size-5 rounded-md flex items-center justify-center transition-all",
        checked
          ? "bg-accent text-white shadow-sm"
          : "bg-input border border-accentLight/60 hover:border-accent"
      )}
    >
      <AnimatePresence>
        {checked && (
          <motion.svg
            key="v"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" className="size-3"
          >
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── MODAL ──────────────────────────────────────────────────
export function Modal({
  open, onClose, title, children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-text1/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:max-w-md bg-surface rounded-2xl shadow-cardLg border border-border1/15 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border1/10 flex items-center justify-between">
              <h4 className="font-display text-base tracking-tight">{title}</h4>
              <button onClick={onClose} className="size-8 rounded-lg hover:bg-surface2 grid place-items-center text-text3" aria-label="Fermer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── DIVIDER ─────────────────────────────────────────────────
export const Divider = ({ className }: { className?: string }) => (
  <div className={clsx("divider my-4", className)} />
);
