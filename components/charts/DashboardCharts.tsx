"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useStore, SECTION_META } from "@/lib/store";
import { eur } from "@/lib/format";
import { Card, SectionHeader } from "../ui";

const PALETTE = [
  "#C4746B",  // accent
  "#EFC5B8",  // accent-light
  "#C0524D",  // accent-strong
  "#6B4A42",  // text-2 (moka)
  "#A07870",  // text-3 (taupe)
];

// ─── Donut : répartition des dépenses ───
export function ExpenseBreakdown() {
  const { currentMonth } = useStore();
  const expenses = currentMonth.transactions.filter(tx => tx.section === "expenses");

  const data = expenses
    .map(tx => ({ name: tx.label, emoji: tx.emoji, value: tx.actual || tx.budget }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <SectionHeader emoji="🥖" title="Répartition des dépenses" subtitle={`Total : ${eur.format(total)}`} />
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/2 h-[200px]">
          {data.length > 0 ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full grid place-items-center text-[12px] text-text3">
              Aucune dépense pour ce mois
            </div>
          )}
        </div>
        <ul className="w-full sm:w-1/2 space-y-1.5">
          {data.slice(0, 6).map((d, i) => (
            <li key={d.name} className="flex items-center gap-2.5 text-[13px]">
              <span className="size-2.5 rounded-full shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
              <span className="text-base shrink-0">{d.emoji}</span>
              <span className="truncate text-text2 flex-1">{d.name}</span>
              <span className="tabular-nums font-semibold text-text1">{eur.format(d.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-surface rounded-lg shadow-cardLg border border-border1/20 px-3 py-2 text-[12px]">
      <div className="font-semibold">{p.payload.emoji} {p.name}</div>
      <div className="tabular-nums text-text2">{eur.format(p.value)}</div>
    </div>
  );
}

// ─── Bars : Budget vs Réel par section ───
export function BudgetVsActual() {
  const { totals } = useStore();
  const data = (["income", "bills", "expenses", "debts", "savings"] as const).map(k => ({
    section: SECTION_META[k].label,
    emoji: SECTION_META[k].emoji,
    Budget: totals[k].budget,
    Réel: totals[k].actual,
  }));

  return (
    <Card>
      <SectionHeader emoji="📊" title="Budget vs Réel" subtitle="Comparaison par section" />
      <div className="h-[240px] -mx-2">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="rgb(var(--border) / 0.18)" vertical={false} />
            <XAxis dataKey="section" tick={{ fill: "rgb(var(--text-3))", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgb(var(--text-3))", fontSize: 10 }} axisLine={false} tickLine={false} width={48}
                   tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
            <Tooltip content={<BarTooltip />} cursor={{ fill: "rgb(var(--accent-light) / 0.18)" }} />
            <Bar dataKey="Budget" fill="#EFC5B8" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Réel"   fill="#C4746B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface rounded-lg shadow-cardLg border border-border1/20 px-3 py-2 text-[12px]">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 tabular-nums">
          <span className="size-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-text3">{p.dataKey}</span>
          <span className="ml-auto font-semibold">{eur.format(p.value)}</span>
        </div>
      ))}
    </div>
  );
}
