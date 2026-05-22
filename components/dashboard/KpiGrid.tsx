"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { eur } from "@/lib/format";
import { Card } from "../ui";

interface Tile {
  label: string;
  value: number;
  emoji: string;
  tone: "income" | "spend" | "balance" | "savings";
  hint?: string;
}

export function KpiGrid() {
  const { totals } = useStore();
  const spent = totals.bills.actual + totals.expenses.actual + totals.debts.actual;

  const tiles: Tile[] = [
    { label: "Revenus du mois",   value: totals.income.actual || totals.income.budget,   emoji: "💰", tone: "income",  hint: "Budgétés + réels" },
    { label: "Dépenses totales",  value: spent || totals.bills.budget + totals.expenses.budget + totals.debts.budget, emoji: "🛒", tone: "spend",   hint: "Factures + variable + dettes" },
    { label: "Solde restant",     value: totals.remaining.actual || totals.remaining.budget, emoji: "🌿", tone: "balance", hint: "Après toutes charges" },
    { label: "Économies prévues", value: totals.savings.budget,                              emoji: "🌱", tone: "savings", hint: "Objectifs du mois" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {tiles.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <KpiTile tile={t} />
        </motion.div>
      ))}
    </div>
  );
}

function KpiTile({ tile }: { tile: Tile }) {
  const negative = tile.tone === "balance" && tile.value < 0;
  const valueColor =
    tile.tone === "income"  ? "text-text1" :
    tile.tone === "spend"   ? "text-text1" :
    tile.tone === "balance" ? (negative ? "text-accentStrong" : "text-success") :
    "text-text1";

  return (
    <Card noPadding className="p-4 sm:p-5 relative overflow-hidden">
      {/* Halo */}
      <div className="absolute -top-8 -right-8 size-24 rounded-full bg-accentLight/30 blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between mb-3 relative">
        <div className="size-9 rounded-xl bg-surface2 grid place-items-center text-base">
          {tile.emoji}
        </div>
        <span className="text-[9.5px] uppercase tracking-[0.18em] text-text3">
          {tile.tone === "income" ? "+" : tile.tone === "spend" ? "−" : tile.tone === "balance" ? "=" : "↗"}
        </span>
      </div>

      <div className="text-[11px] uppercase tracking-wider text-text3 mb-1 relative">{tile.label}</div>
      <div className={`font-display text-xl sm:text-2xl tabular-nums tracking-tight ${valueColor} relative`}>
        {eur.format(tile.value)}
      </div>
      {tile.hint && (
        <div className="text-[10.5px] text-text3 mt-1 relative">{tile.hint}</div>
      )}
    </Card>
  );
}
