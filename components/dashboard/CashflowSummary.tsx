"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { eur } from "@/lib/format";
import { Card, Field, Progress } from "../ui";

/** Reproduit exactement la table "APERÇU DU FLUX DE TRÉSORERIE" du fichier */
export function CashflowSummary() {
  const { totals, currentMonth, dispatch } = useStore();

  const rows: { label: string; sign: "+" | "−"; value: number; valueActual: number; emphasized?: boolean }[] = [
    { label: "Report",   sign: "+", value: currentMonth.carryover, valueActual: currentMonth.carryover },
    { label: "Revenus",  sign: "+", value: totals.income.budget,   valueActual: totals.income.actual },
    { label: "Factures", sign: "−", value: totals.bills.budget,    valueActual: totals.bills.actual },
    { label: "Dépenses", sign: "−", value: totals.expenses.budget, valueActual: totals.expenses.actual },
    { label: "Économies",sign: "−", value: totals.savings.budget,  valueActual: totals.savings.actual },
    { label: "Dettes",   sign: "−", value: totals.debts.budget,    valueActual: totals.debts.actual },
  ];

  const remBudget  = totals.remaining.budget;
  const remActual  = totals.remaining.actual;
  const negativeBudget = remBudget < 0;
  const negativeActual = remActual < 0;

  // Indicateur visuel : pourcentage du budget réellement consommé sur les revenus
  const consumed = totals.income.budget > 0
    ? (totals.bills.actual + totals.expenses.actual + totals.debts.actual) / totals.income.budget
    : 0;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="size-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-text3">Flux de trésorerie</span>
          </div>
          <h2 className="font-display text-2xl sm:text-[28px] tracking-tight">
            Aperçu du mois
          </h2>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px] uppercase tracking-wider text-text3 mb-0.5">Restant prévu</div>
          <div className={`font-display text-2xl sm:text-3xl tabular-nums tracking-tight ${negativeBudget ? "text-accentStrong" : "text-text1"}`}>
            {eur.format(remBudget)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr,auto,auto] gap-x-3 sm:gap-x-6 items-center text-[13.5px]">
        <div />
        <div className="text-[10.5px] uppercase tracking-wider text-text3 text-right">Budget</div>
        <div className="text-[10.5px] uppercase tracking-wider text-text3 text-right">Réel</div>

        {rows.map((r, i) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="contents"
          >
            <div className="py-2 flex items-center gap-2 text-text2">
              <span className={r.sign === "+" ? "text-success font-bold" : "text-accent font-bold"}>
                {r.sign}
              </span>
              <span>{r.label}</span>
            </div>
            <div className="py-2 text-right tabular-nums text-text2">{eur.format(r.value)}</div>
            <div className="py-2 text-right tabular-nums text-text1 font-semibold">{eur.format(r.valueActual)}</div>
          </motion.div>
        ))}

        {/* Report editable */}
        <div className="col-span-3 my-3 divider" />
        <div className="text-[11.5px] text-text3">Report du mois précédent</div>
        <div className="col-span-2 max-w-[140px] justify-self-end">
          <Field
            type="number"
            inputMode="decimal"
            suffix="€"
            value={currentMonth.carryover}
            onChange={(e) =>
              dispatch({ type: "SET_CARRYOVER", monthKey: currentMonth.key, value: Number(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      {/* RESTANT — la ligne emblématique du fichier */}
      <div className="mt-5 rounded-2xl bg-surface3/60 border border-accentLight/40 p-4 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.18em] text-text3">RESTANT</div>
            <div className="text-[11px] text-text3 mt-0.5">Revenus − Factures − Dépenses − Dettes</div>
          </div>
          <div className="flex items-baseline gap-4">
            <div className="text-right">
              <div className="text-[10px] uppercase text-text3">Prévu</div>
              <div className={`font-display text-xl tabular-nums ${negativeBudget ? "text-accentStrong" : "text-text1"}`}>
                {eur.format(remBudget)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-text3">Réel</div>
              <div className={`font-display text-xl tabular-nums ${negativeActual ? "text-accentStrong" : "text-success"}`}>
                {eur.format(remActual)}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Progress
            value={Math.min(consumed, 1)}
            label="Consommé sur revenus"
            accent={consumed > 1 ? "rgb(var(--accent-strong))" : "rgb(var(--accent))"}
          />
        </div>
      </div>
    </Card>
  );
}
