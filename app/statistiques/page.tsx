"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";
import { useStore, computeTotals, SECTION_META } from "@/lib/store";
import { eur, MONTH_LABELS } from "@/lib/format";
import { Card, SectionHeader, Badge } from "@/components/ui";

export default function StatistiquesPage() {
  const { state, currentMonth, totals } = useStore();

  // Récap annuel (style fichier Excel)
  const annualData = useMemo(() => {
    return MONTH_LABELS.map((label, i) => {
      const key = `2026-${String(i + 1).padStart(2, "0")}`;
      const m = state.months[key];
      if (!m) return { month: label.slice(0, 3), Revenus: 0, Dépenses: 0, Reste: 0, Épargne: 0 };
      const t = computeTotals(m);
      return {
        month: label.slice(0, 3),
        Revenus: t.income.actual || t.income.budget,
        Dépenses: (t.bills.actual || t.bills.budget) + (t.expenses.actual || t.expenses.budget) + (t.debts.actual || t.debts.budget),
        Reste: t.remaining.actual || t.remaining.budget,
        Épargne: t.savings.actual || t.savings.budget,
      };
    });
  }, [state.months]);

  // Analyse automatique des dépenses du mois courant
  const insights = useMemo(() => buildInsights(currentMonth.transactions, totals), [currentMonth.transactions, totals]);

  // Catégories (radial)
  const categoryData = useMemo(() => {
    const sections = ["bills", "expenses", "debts"] as const;
    return sections.map(s => ({
      name: SECTION_META[s].label,
      emoji: SECTION_META[s].emoji,
      value: totals[s].actual || totals[s].budget,
      budget: totals[s].budget,
    }));
  }, [totals]);

  const annualTotals = annualData.reduce(
    (acc, m) => ({
      revenus: acc.revenus + m.Revenus,
      dépenses: acc.dépenses + m.Dépenses,
      reste: acc.reste + m.Reste,
    }),
    { revenus: 0, dépenses: 0, reste: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-text3 mb-1">Statistiques</div>
        <h1 className="font-display text-3xl sm:text-[40px] leading-tight tracking-tight">
          Votre année <span className="italic text-accent">2026</span> en chiffres
        </h1>
        <p className="text-text2 mt-1.5 text-[14px]">
          Évolution mensuelle, répartition par catégorie, et analyse automatique.
        </p>
      </div>

      {/* Annual KPIs */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card noPadding className="p-4 sm:p-5">
          <div className="text-[11px] uppercase tracking-wider text-text3">Revenus annuels</div>
          <div className="font-display text-xl sm:text-2xl tabular-nums tracking-tight mt-1 text-success">
            {eur.format(annualTotals.revenus)}
          </div>
        </Card>
        <Card noPadding className="p-4 sm:p-5">
          <div className="text-[11px] uppercase tracking-wider text-text3">Dépenses annuelles</div>
          <div className="font-display text-xl sm:text-2xl tabular-nums tracking-tight mt-1">
            {eur.format(annualTotals.dépenses)}
          </div>
        </Card>
        <Card noPadding className="p-4 sm:p-5 bg-surface3/60 border-accentLight/40">
          <div className="text-[11px] uppercase tracking-wider text-text3">Reste à vivre</div>
          <div className={`font-display text-xl sm:text-2xl tabular-nums tracking-tight mt-1 ${annualTotals.reste < 0 ? "text-accentStrong" : "text-text1"}`}>
            {eur.format(annualTotals.reste)}
          </div>
        </Card>
      </div>

      {/* Évolution annuelle */}
      <Card>
        <SectionHeader emoji="📈" title="Évolution annuelle 2026" subtitle="Reste à vivre mois par mois" />
        <div className="h-[300px] -mx-2">
          <ResponsiveContainer>
            <AreaChart data={annualData} margin={{ top: 12, right: 12, left: -4, bottom: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C4746B" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#C4746B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gDep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6B4A42" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6B4A42" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgb(var(--border) / 0.18)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "rgb(var(--text-3))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgb(var(--text-3))", fontSize: 10 }} axisLine={false} tickLine={false}
                     tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
              <Tooltip content={<AreaTooltip />} cursor={{ stroke: "rgb(var(--accent))", strokeWidth: 1, strokeDasharray: "3 3" }} />
              <Area type="monotone" dataKey="Revenus"  stroke="#C4746B" strokeWidth={2} fill="url(#gRev)" />
              <Area type="monotone" dataKey="Dépenses" stroke="#6B4A42" strokeWidth={2} fill="url(#gDep)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two columns: categories + insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Categories */}
        <Card>
          <SectionHeader emoji="🎯" title="Catégories du mois" subtitle={currentMonth.label} />
          <div className="h-[230px] -mx-2">
            <ResponsiveContainer>
              <RadialBarChart
                cx="50%" cy="50%" innerRadius="35%" outerRadius="100%"
                data={categoryData} startAngle={90} endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, Math.max(...categoryData.map(d => Math.max(d.value, d.budget)), 1)]} tick={false} />
                <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "rgb(var(--surface-2))" }}
                  fill="#C4746B" />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2">
            {categoryData.map(c => {
              const pct = c.budget > 0 ? Math.round((c.value / c.budget) * 100) : 0;
              return (
                <li key={c.name} className="flex items-center gap-3 text-[13px]">
                  <span className="text-base">{c.emoji}</span>
                  <span className="flex-1 text-text2">{c.name}</span>
                  <span className="tabular-nums font-semibold">{eur.format(c.value)}</span>
                  <Badge tone={pct > 100 ? "warning" : pct > 80 ? "default" : "muted"}>{pct}%</Badge>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Insights */}
        <Card>
          <SectionHeader emoji="🪶" title="Analyse automatique" subtitle="Observations sur vos dépenses" />
          <ul className="space-y-3">
            {insights.map((ins, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="flex gap-3 p-3 rounded-xl bg-surface2/60 border border-border1/10"
              >
                <span className="text-xl shrink-0">{ins.emoji}</span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-text1">{ins.title}</div>
                  <p className="text-[12.5px] text-text2 mt-0.5 leading-relaxed">{ins.body}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Tableau récap annuel (reproduit l'onglet "📈 Récap annuel") */}
      <Card>
        <SectionHeader emoji="📋" title="Récapitulatif annuel" subtitle="Tableau mois par mois" />
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[10.5px] uppercase tracking-wider text-text3 border-b border-border1/15">
                <th className="text-left py-2 px-2 font-semibold">Mois</th>
                <th className="text-right py-2 px-2 font-semibold">Revenus</th>
                <th className="text-right py-2 px-2 font-semibold">Dépenses</th>
                <th className="text-right py-2 px-2 font-semibold">Reste</th>
                <th className="text-right py-2 px-2 font-semibold">Épargne</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border1/8">
              {annualData.map(r => (
                <tr key={r.month} className="hover:bg-surface2/40">
                  <td className="py-2 px-2 font-semibold text-text1">{r.month}</td>
                  <td className="py-2 px-2 text-right tabular-nums text-text2">{eur.format(r.Revenus)}</td>
                  <td className="py-2 px-2 text-right tabular-nums text-text2">{eur.format(r.Dépenses)}</td>
                  <td className={`py-2 px-2 text-right tabular-nums font-semibold ${r.Reste < 0 ? "text-accentStrong" : "text-text1"}`}>
                    {eur.format(r.Reste)}
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums text-text2">{eur.format(r.Épargne)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-border1/20 bg-surface3/40">
                <td className="py-3 px-2 font-bold text-text1">Total</td>
                <td className="py-3 px-2 text-right tabular-nums font-bold">{eur.format(annualTotals.revenus)}</td>
                <td className="py-3 px-2 text-right tabular-nums font-bold">{eur.format(annualTotals.dépenses)}</td>
                <td className="py-3 px-2 text-right tabular-nums font-bold text-accent">{eur.format(annualTotals.reste)}</td>
                <td className="py-3 px-2 text-right tabular-nums font-bold">{eur.format(annualData.reduce((s, r) => s + r.Épargne, 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Tooltip ───
function AreaTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface rounded-lg shadow-cardLg border border-border1/20 px-3 py-2 text-[12px]">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 tabular-nums">
          <span className="size-2 rounded-full" style={{ background: p.stroke }} />
          <span className="text-text3">{p.dataKey}</span>
          <span className="ml-auto font-semibold">{eur.format(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Auto-analyse simple, en français ───
function buildInsights(
  txs: import("@/lib/types").Transaction[],
  totals: import("@/lib/types").MonthTotals,
): { emoji: string; title: string; body: string }[] {
  const out: { emoji: string; title: string; body: string }[] = [];

  // 1. Dépense la plus lourde
  const expenses = txs.filter(t => t.section === "expenses" && (t.actual || t.budget) > 0);
  const biggest = [...expenses].sort((a, b) => (b.actual || b.budget) - (a.actual || a.budget))[0];
  if (biggest) {
    const v = biggest.actual || biggest.budget;
    const totalExp = totals.expenses.budget || totals.expenses.actual || 1;
    const share = Math.round((v / totalExp) * 100);
    out.push({
      emoji: biggest.emoji,
      title: `${biggest.label} pèse ${share}% de vos dépenses variables`,
      body: `${eur.format(v)} sur ${eur.format(totalExp)}. C'est votre plus gros poste — un levier d'optimisation potentiel.`,
    });
  }

  // 2. Taux d'épargne
  const income = totals.income.budget;
  if (income > 0) {
    const savings = totals.savings.budget;
    const rate = Math.round((savings / income) * 100);
    out.push({
      emoji: rate >= 10 ? "🌱" : "🌾",
      title: `Taux d'épargne : ${rate}%`,
      body: rate === 0
        ? "Aucune épargne prévue ce mois-ci. Envisagez d'allouer ne serait-ce que 5% pour bâtir un fonds d'urgence."
        : rate < 10
          ? `${eur.format(savings)} prévus — chaque euro mis de côté compte, surtout en début de parcours.`
          : `Excellent : ${eur.format(savings)} prévus. Au-delà de 10%, vous construisez vraiment une marge.`,
    });
  }

  // 3. Couverture des charges fixes
  if (income > 0) {
    const fixedRate = Math.round((totals.bills.budget / income) * 100);
    out.push({
      emoji: fixedRate > 50 ? "⚠️" : "🏠",
      title: `Charges fixes : ${fixedRate}% des revenus`,
      body: fixedRate > 50
        ? "Au-delà de 50%, vos charges fixes laissent peu de marge. La règle 50/30/20 recommande de les maintenir sous ce seuil."
        : `${eur.format(totals.bills.budget)} de charges fixes — vous gardez une marge confortable pour le variable et l'épargne.`,
    });
  }

  // 4. Dettes restantes
  if (totals.debts.budget > 0) {
    out.push({
      emoji: "💳",
      title: `${eur.format(totals.debts.budget)} de mensualités de crédit`,
      body: `Pensez à dater ces remboursements pour visualiser leur fin et libérer cette capacité.`,
    });
  }

  // 5. Restant négatif
  if (totals.remaining.budget < 0) {
    out.push({
      emoji: "🚨",
      title: "Budget prévisionnel négatif",
      body: `Vos prévisions dépassent vos revenus de ${eur.format(Math.abs(totals.remaining.budget))}. Identifiez un poste à réduire avant la fin du mois.`,
    });
  }

  return out.slice(0, 5);
}
