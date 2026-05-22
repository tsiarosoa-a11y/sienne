"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { eur, parseMonthKey } from "@/lib/format";
import { Card, SectionHeader, Badge } from "@/components/ui";
import type { Transaction } from "@/lib/types";

const WEEKDAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function CalendrierPage() {
  const { currentMonth } = useStore();
  const { year, monthIdx } = parseMonthKey(currentMonth.key);

  // Construction de la grille calendaire
  const grid = useMemo(() => buildCalendarGrid(year, monthIdx), [year, monthIdx]);

  // Index des transactions par jour
  const byDay = useMemo(() => {
    const map: Record<number, Transaction[]> = {};
    for (const tx of currentMonth.transactions) {
      if (tx.dueDay && (tx.section === "bills" || tx.section === "debts")) {
        if (!map[tx.dueDay]) map[tx.dueDay] = [];
        map[tx.dueDay].push(tx);
      }
    }
    return map;
  }, [currentMonth.transactions]);

  // Récap (comme dans le fichier Excel : Total charges fixes, Total crédits, TOTAL)
  const totalBills = currentMonth.transactions
    .filter(t => t.section === "bills")
    .reduce((s, t) => s + t.budget, 0);
  const totalDebts = currentMonth.transactions
    .filter(t => t.section === "debts")
    .reduce((s, t) => s + t.budget, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-text3 mb-1">Calendrier</div>
        <h1 className="font-display text-3xl sm:text-[40px] leading-tight tracking-tight">
          Vos paiements — <span className="italic text-accent">{currentMonth.label}</span>
        </h1>
        <p className="text-text2 mt-1.5 text-[14px]">
          Vue mensuelle de tous vos paiements programmés.
        </p>
      </div>

      {/* Récap rapide (style fichier Excel) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card noPadding className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-text3">Charges fixes</div>
          <div className="font-display text-xl sm:text-2xl tabular-nums tracking-tight mt-1">{eur.format(totalBills)}</div>
        </Card>
        <Card noPadding className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-text3">Crédits</div>
          <div className="font-display text-xl sm:text-2xl tabular-nums tracking-tight mt-1">{eur.format(totalDebts)}</div>
        </Card>
        <Card noPadding className="p-4 bg-surface3/60 border-accentLight/40">
          <div className="text-[11px] uppercase tracking-wider text-text3">Total</div>
          <div className="font-display text-xl sm:text-2xl tabular-nums tracking-tight mt-1 text-accentStrong">
            {eur.format(totalBills + totalDebts)}
          </div>
        </Card>
      </div>

      {/* Grille calendaire */}
      <Card noPadding className="p-4 sm:p-5 overflow-hidden">
        <SectionHeader emoji="📅" title="Vue mensuelle" subtitle="Cliquez ☑ dans le dashboard pour cocher" />

        {/* En-tête jours */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-[10.5px] uppercase tracking-wider text-text3 text-center pb-1">
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Cellules */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {grid.map((cell, i) => (
            <DayCell key={i} day={cell.day} transactions={cell.day ? byDay[cell.day] ?? [] : []} index={i} />
          ))}
        </div>
      </Card>

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-3 text-[12px] text-text3">
        <Legend swatch="bg-surface3" label="Jour avec paiement" />
        <Legend swatch="bg-accentLight/40" label="Charges fixes" />
        <Legend swatch="bg-accentStrong/30" label="Crédits / dettes" />
      </div>
    </div>
  );
}

// ─── DayCell ───
function DayCell({ day, transactions, index }: { day: number | null; transactions: Transaction[]; index: number }) {
  const hasPayments = transactions.length > 0;
  const hasDebt = transactions.some(t => t.section === "debts");
  const allPaid = transactions.length > 0 && transactions.every(t => t.paid);

  if (!day) {
    return <div className="aspect-square sm:aspect-[5/4] rounded-lg bg-surface2/30" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.012, duration: 0.25 }}
      className={clsx(
        "relative aspect-square sm:aspect-[5/4] rounded-lg p-1.5 sm:p-2 overflow-hidden border transition-all hover:shadow-card",
        hasPayments
          ? hasDebt
            ? "bg-accentStrong/10 border-accentStrong/25"
            : "bg-surface3/50 border-accentLight/40"
          : "bg-surface border-border1/10"
      )}
    >
      <div className="flex items-start justify-between">
        <span className={clsx(
          "text-[12px] font-semibold tabular-nums",
          hasPayments ? "text-text1" : "text-text3"
        )}>
          {day}
        </span>
        {allPaid && (
          <span className="text-[10px] text-success" aria-label="Tout payé">✓</span>
        )}
      </div>

      <ul className="mt-1 space-y-0.5 hidden sm:block">
        {transactions.slice(0, 3).map(tx => (
          <li key={tx.id} className={clsx(
            "text-[10.5px] truncate flex items-center gap-1",
            tx.paid ? "line-through text-text4" : "text-text2"
          )}>
            <span aria-hidden>{tx.emoji}</span>
            <span className="truncate flex-1">{tx.label}</span>
            <span className="tabular-nums text-text3 hidden md:inline">{Math.round(tx.budget)}€</span>
          </li>
        ))}
        {transactions.length > 3 && (
          <li className="text-[10px] text-accentStrong font-semibold">+{transactions.length - 3}</li>
        )}
      </ul>

      {/* Mobile: dot indicators */}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:hidden flex gap-0.5">
        {transactions.slice(0, 3).map(tx => (
          <span key={tx.id} className={clsx(
            "h-1 flex-1 rounded-full",
            tx.section === "debts" ? "bg-accentStrong" : "bg-accent"
          )} />
        ))}
      </div>
    </motion.div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-3 rounded ${swatch} border border-border1/15`} />
      {label}
    </span>
  );
}

// ─── Helpers ───
function buildCalendarGrid(year: number, monthIdx: number): { day: number | null }[] {
  const firstDay = new Date(year, monthIdx, 1);
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  // JS: 0=Sunday, 1=Monday… On veut Lundi=0
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const cells: { day: number | null }[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
  while (cells.length % 7 !== 0) cells.push({ day: null });
  return cells;
}
