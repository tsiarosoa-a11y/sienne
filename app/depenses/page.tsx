"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { useStore, SECTION_META } from "@/lib/store";
import type { SectionKey, Transaction } from "@/lib/types";
import { eur, uid } from "@/lib/format";
import { Card, SectionHeader, Field, Button, Badge, Modal } from "@/components/ui";

const FILTERS: { key: "all" | SectionKey; label: string; emoji: string }[] = [
  { key: "all",      label: "Tout",       emoji: "🗂️" },
  { key: "bills",    label: "Factures",   emoji: "🏠" },
  { key: "expenses", label: "Dépenses",   emoji: "🛒" },
  { key: "debts",    label: "Dettes",     emoji: "💳" },
  { key: "income",   label: "Revenus",    emoji: "💰" },
  { key: "savings",  label: "Économies",  emoji: "🌱" },
];

export default function DepensesPage() {
  const { currentMonth, dispatch } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | SectionKey>("all");
  const [sort, setSort] = useState<"date" | "amount" | "name">("amount");
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    let list = currentMonth.transactions.slice();
    if (filter !== "all") list = list.filter(t => t.section === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(t => t.label.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (sort === "amount") return (b.actual || b.budget) - (a.actual || a.budget);
      if (sort === "name") return a.label.localeCompare(b.label, "fr");
      return (a.dueDay ?? 99) - (b.dueDay ?? 99);
    });
    return list;
  }, [currentMonth.transactions, filter, query, sort]);

  const totalShown = filtered.reduce((s, t) => s + (t.actual || t.budget), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-text3 mb-1">Gestion</div>
          <h1 className="font-display text-3xl sm:text-[40px] leading-tight tracking-tight">
            Toutes les <span className="italic text-accent">dépenses</span>
          </h1>
          <p className="text-text2 mt-1.5 text-[14px]">
            {filtered.length} transaction{filtered.length > 1 ? "s" : ""} · Total {eur.format(totalShown)}
          </p>
        </div>
        <Button onClick={() => setAdding(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="size-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvelle transaction
        </Button>
      </div>

      {/* Toolbar */}
      <Card noPadding className="p-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-text3">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <Field
              placeholder="Rechercher…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 bg-surface2 rounded-xl p-1 self-start">
            {(["amount", "date", "name"] as const).map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={clsx(
                  "px-3 h-8 rounded-lg text-[12px] font-medium transition-colors",
                  sort === s ? "bg-surface text-text1 shadow-sm" : "text-text3 hover:text-text2"
                )}
              >
                {s === "amount" ? "Montant" : s === "date" ? "Échéance" : "Nom"}
              </button>
            ))}
          </div>
        </div>

        {/* Section filters */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border1/10">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={clsx(
                "px-3 h-8 rounded-full text-[12px] font-medium transition-all flex items-center gap-1.5",
                filter === f.key
                  ? "bg-accent text-white shadow-card"
                  : "bg-surface2 text-text2 hover:bg-accentLight/40"
              )}
            >
              <span>{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      {/* List */}
      <Card noPadding>
        <ul className="divide-y divide-border1/10">
          <AnimatePresence initial={false}>
            {filtered.map(tx => (
              <motion.li
                key={tx.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <Row tx={tx} />
              </motion.li>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <li className="p-12 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-text2 text-sm">Aucune transaction ne correspond.</p>
            </li>
          )}
        </ul>
      </Card>

      {/* Modal d'ajout */}
      <AddModal open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}

// ─── Row ───
function Row({ tx }: { tx: Transaction }) {
  const { currentMonth, dispatch } = useStore();
  const meta = SECTION_META[tx.section];

  return (
    <div className="flex items-center gap-4 px-4 sm:px-5 py-3.5 hover:bg-surface2/50 group transition-colors">
      <div className="size-10 rounded-xl bg-surface2 flex items-center justify-center text-[18px] shrink-0">
        {tx.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-text1 text-[14px] truncate">{tx.label}</span>
          <Badge tone="muted">{meta.label}</Badge>
          {tx.paid && <Badge tone="success">Payée ✓</Badge>}
        </div>
        <div className="text-[11.5px] text-text3 mt-0.5 flex items-center gap-2">
          {tx.dueDay && <span>Échéance le {tx.dueDay}</span>}
          {tx.category && <span>· {tx.category}</span>}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-[10.5px] uppercase text-text3">Budget</div>
        <div className="text-[13px] tabular-nums text-text2">{eur.format(tx.budget)}</div>
      </div>

      <input
        type="number" inputMode="decimal" step="0.01"
        value={tx.actual || ""}
        placeholder="0"
        onChange={(e) =>
          dispatch({
            type: "UPDATE_TX",
            monthKey: currentMonth.key,
            id: tx.id,
            patch: { actual: Number(e.target.value) || 0 },
          })
        }
        className="editable h-10 rounded-lg px-2.5 text-right tabular-nums font-semibold w-24 sm:w-28 shrink-0"
      />

      <button
        onClick={() => dispatch({ type: "DELETE_TX", monthKey: currentMonth.key, id: tx.id })}
        className="size-9 rounded-lg text-text4 hover:text-accentStrong hover:bg-accentStrong/10 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        aria-label="Supprimer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      </button>
    </div>
  );
}

// ─── Modal d'ajout ───
function AddModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentMonth, dispatch } = useStore();
  const [section, setSection] = useState<SectionKey>("expenses");
  const [emoji, setEmoji] = useState("✨");
  const [label, setLabel] = useState("");
  const [budget, setBudget] = useState("");
  const [dueDay, setDueDay] = useState("");

  const submit = () => {
    if (!label.trim()) return;
    dispatch({
      type: "ADD_TX",
      tx: {
        section,
        label: label.trim(),
        emoji: emoji || "✨",
        budget: Number(budget) || 0,
        actual: 0,
        paid: false,
        ...(dueDay ? { dueDay: Number(dueDay) } : {}),
      },
    });
    setLabel(""); setBudget(""); setDueDay(""); setEmoji("✨");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle transaction">
      <div className="space-y-4">
        <div>
          <label className="text-[11px] uppercase tracking-wider text-text3 block mb-1.5">Section</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(["income","bills","expenses","debts","savings"] as const).map(s => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={clsx(
                  "h-10 rounded-lg text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors",
                  section === s
                    ? "bg-accent text-white"
                    : "bg-surface2 text-text2 hover:bg-accentLight/40"
                )}
              >
                <span>{SECTION_META[s].emoji}</span>
                {SECTION_META[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-16">
            <label className="text-[11px] uppercase tracking-wider text-text3 block mb-1.5">Icône</label>
            <Field value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2} className="text-center text-base" />
          </div>
          <div className="flex-1">
            <label className="text-[11px] uppercase tracking-wider text-text3 block mb-1.5">Libellé</label>
            <Field value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex. Courses Carrefour" autoFocus />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[11px] uppercase tracking-wider text-text3 block mb-1.5">Budget (€)</label>
            <Field type="number" value={budget} onChange={e => setBudget(e.target.value)} suffix="€" />
          </div>
          {(section === "bills" || section === "debts") && (
            <div className="w-28">
              <label className="text-[11px] uppercase tracking-wider text-text3 block mb-1.5">Jour</label>
              <Field type="number" min={1} max={31} value={dueDay} onChange={e => setDueDay(e.target.value)} />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={submit}>Ajouter</Button>
        </div>
      </div>
    </Modal>
  );
}
