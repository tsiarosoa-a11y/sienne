"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useStore, SECTION_META } from "@/lib/store";
import { eur } from "@/lib/format";
import type { SectionKey } from "@/lib/types";
import { Card, SectionHeader, Field, Check, Progress, Button } from "../ui";

interface SectionPanelProps {
  section: SectionKey;
  /** Affiche la colonne échéance (factures, dettes) */
  showDueDay?: boolean;
  /** Affiche les cases à cocher (factures, dettes) */
  showCheck?: boolean;
}

export function SectionPanel({ section, showDueDay, showCheck }: SectionPanelProps) {
  const { currentMonth, dispatch } = useStore();
  const meta = SECTION_META[section];
  const [adding, setAdding] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftBudget, setDraftBudget] = useState<string>("");
  const [draftEmoji, setDraftEmoji] = useState("✨");

  const rows = useMemo(
    () => currentMonth.transactions.filter(tx => tx.section === section),
    [currentMonth, section]
  );

  const totalBudget = rows.reduce((s, r) => s + r.budget, 0);
  const totalActual = rows.reduce((s, r) => s + r.actual, 0);
  const progress = totalBudget > 0 ? totalActual / totalBudget : 0;
  const overbudget = totalActual > totalBudget && totalBudget > 0;

  const submitNew = () => {
    if (!draftLabel.trim()) return;
    dispatch({
      type: "ADD_TX",
      tx: {
        section,
        label: draftLabel.trim(),
        emoji: draftEmoji,
        budget: Number(draftBudget) || 0,
        actual: 0,
        paid: false,
      },
    });
    setDraftLabel("");
    setDraftBudget("");
    setDraftEmoji("✨");
    setAdding(false);
  };

  return (
    <Card>
      <SectionHeader
        emoji={meta.emoji}
        title={`Aperçu des ${meta.label.toLowerCase()}`}
        subtitle={`${rows.length} ligne${rows.length > 1 ? "s" : ""}`}
        action={
          <Button size="sm" variant="subtle" onClick={() => setAdding(v => !v)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="size-3.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ajouter
          </Button>
        }
      />

      {/* Headers */}
      <div className="grid items-center gap-2 text-[10.5px] uppercase tracking-wider text-text3 pb-2 border-b border-border1/10"
           style={{ gridTemplateColumns: gridCols(showCheck, showDueDay) }}>
        {showCheck && <span>☑</span>}
        <span>{section === "savings" ? "Objectif" : "Libellé"}</span>
        {showDueDay && <span className="text-center">Éch.</span>}
        <span className="text-right">Budget</span>
        <span className="text-right">Réel</span>
        <span />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border1/8">
        {rows.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.025, duration: 0.25 }}
            className="grid items-center gap-2 py-2.5 group"
            style={{ gridTemplateColumns: gridCols(showCheck, showDueDay) }}
          >
            {showCheck && (
              <Check
                checked={!!tx.paid}
                onChange={v => dispatch({ type: "UPDATE_TX", monthKey: currentMonth.key, id: tx.id, patch: { paid: v } })}
              />
            )}

            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[15px] shrink-0" aria-hidden>{tx.emoji}</span>
              <input
                value={tx.label}
                onChange={e => dispatch({ type: "UPDATE_TX", monthKey: currentMonth.key, id: tx.id, patch: { label: e.target.value } })}
                className="bg-transparent text-[13.5px] text-text1 truncate focus:outline-none focus:ring-2 focus:ring-accent/30 rounded px-1 -mx-1 w-full"
              />
            </div>

            {showDueDay && (
              <input
                type="number" min={1} max={31} inputMode="numeric"
                value={tx.dueDay ?? ""}
                onChange={e => dispatch({
                  type: "UPDATE_TX", monthKey: currentMonth.key, id: tx.id,
                  patch: { dueDay: e.target.value ? Number(e.target.value) : undefined },
                })}
                className="editable h-8 rounded-lg text-[12px] text-center tabular-nums w-12 mx-auto"
                placeholder="—"
              />
            )}

            <input
              type="number" inputMode="decimal" step="0.01"
              value={tx.budget}
              onChange={e => dispatch({ type: "UPDATE_TX", monthKey: currentMonth.key, id: tx.id, patch: { budget: Number(e.target.value) || 0 } })}
              className="editable h-8 rounded-lg px-2 text-[12.5px] text-right tabular-nums"
            />
            <input
              type="number" inputMode="decimal" step="0.01"
              value={tx.actual || ""}
              placeholder="—"
              onChange={e => dispatch({ type: "UPDATE_TX", monthKey: currentMonth.key, id: tx.id, patch: { actual: Number(e.target.value) || 0 } })}
              className="editable h-8 rounded-lg px-2 text-[12.5px] text-right tabular-nums"
            />

            <button
              onClick={() => dispatch({ type: "DELETE_TX", monthKey: currentMonth.key, id: tx.id })}
              className="size-7 rounded-md text-text4 hover:text-accentStrong hover:bg-accentStrong/10 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Supprimer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </motion.div>
        ))}

        {/* Ligne d'ajout */}
        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid items-center gap-2 py-2.5"
                   style={{ gridTemplateColumns: gridCols(showCheck, showDueDay) }}>
                {showCheck && <div />}
                <div className="flex items-center gap-2">
                  <input
                    value={draftEmoji}
                    onChange={e => setDraftEmoji(e.target.value || "✨")}
                    maxLength={2}
                    className="editable h-8 w-9 rounded-lg text-center"
                  />
                  <Field
                    placeholder="Nouveau libellé…"
                    value={draftLabel}
                    onChange={e => setDraftLabel(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submitNew()}
                    autoFocus
                  />
                </div>
                {showDueDay && <div />}
                <Field
                  type="number" placeholder="0"
                  value={draftBudget}
                  onChange={e => setDraftBudget(e.target.value)}
                  className="text-right"
                />
                <div />
                <button onClick={submitNew} className="size-7 rounded-md text-success hover:bg-success/10 grid place-items-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TOTAL */}
      <div className="mt-4 pt-3 border-t border-border1/15 grid items-center gap-2"
           style={{ gridTemplateColumns: gridCols(showCheck, showDueDay) }}>
        {showCheck && <div />}
        <div className="text-[11px] uppercase tracking-wider text-text3 font-semibold">Total</div>
        {showDueDay && <div />}
        <div className="text-right tabular-nums text-text2 text-[13.5px]">{eur.format(totalBudget)}</div>
        <div className={`text-right tabular-nums font-semibold text-[14px] ${overbudget ? "text-accentStrong" : "text-text1"}`}>
          {eur.format(totalActual)}
        </div>
        <div />
      </div>

      {totalBudget > 0 && (
        <div className="mt-3">
          <Progress
            value={Math.min(progress, 1)}
            label="Progression"
            accent={overbudget ? "rgb(var(--accent-strong))" : "rgb(var(--accent))"}
          />
        </div>
      )}
    </Card>
  );
}

function gridCols(check?: boolean, due?: boolean): string {
  const c = check ? "auto " : "";
  const d = due ? "auto " : "";
  return `${c}minmax(0,1fr) ${d}90px 90px auto`;
}
