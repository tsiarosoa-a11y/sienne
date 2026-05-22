"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, SectionHeader, Button, Badge } from "@/components/ui";

export default function ParametresPage() {
  const { state, dispatch } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [copied, setCopied] = useState(false);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sienne-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyData = async () => {
    await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-text3 mb-1">Paramètres</div>
        <h1 className="font-display text-3xl sm:text-[40px] leading-tight tracking-tight">
          Préférences & <span className="italic text-accent">données</span>
        </h1>
      </div>

      {/* Thème */}
      <Card>
        <SectionHeader emoji="🎨" title="Apparence" subtitle="Clair ou sombre, dans la palette terre de Sienne" />
        <div className="grid grid-cols-2 gap-3">
          {(["light", "dark"] as const).map(mode => {
            const active = state.theme === mode;
            return (
              <button
                key={mode}
                onClick={() => state.theme !== mode && dispatch({ type: "TOGGLE_THEME" })}
                className={`relative rounded-xl overflow-hidden text-left transition-all ${
                  active ? "ring-2 ring-accent shadow-card" : "hover:shadow-card opacity-80 hover:opacity-100"
                }`}
              >
                {/* Mini preview */}
                <div className={`p-4 h-32 ${mode === "light" ? "bg-[#FDF6F3]" : "bg-[#1A1310]"}`}>
                  <div className="flex gap-1.5 mb-2">
                    {(mode === "light"
                      ? ["#FFFFFF", "#F3EAE5", "#F7DDD6", "#EFC5B8", "#C4746B"]
                      : ["#251B17", "#2F221C", "#3D2A22", "#8A4A3D", "#D88577"]
                    ).map(c => (
                      <span key={c} className="size-5 rounded-md" style={{ background: c }} />
                    ))}
                  </div>
                  <div className={`font-display text-base ${mode === "light" ? "text-[#2A1C18]" : "text-[#FAF0EC]"}`}>
                    Aperçu
                  </div>
                  <div className={`text-[11px] mt-0.5 ${mode === "light" ? "text-[#6B4A42]" : "text-[#D4BFB6]"}`}>
                    Cellules · Champs · Cartes
                  </div>
                </div>
                <div className="px-4 py-2.5 bg-surface flex items-center justify-between border-t border-border1/10">
                  <span className="text-[13px] font-semibold capitalize">{mode === "light" ? "Clair" : "Sombre"}</span>
                  {active && <Badge tone="default">Actif</Badge>}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Données */}
      <Card>
        <SectionHeader emoji="💾" title="Mes données" subtitle="Tout est stocké localement dans votre navigateur" />
        <div className="space-y-2">
          <Row label="Mois enregistrés" value={`${Object.keys(state.months).length}`} />
          <Row label="Transactions au total" value={`${Object.values(state.months).reduce((s, m) => s + m.transactions.length, 0)}`} />
          <Row label="Mois actif" value={state.months[state.currentMonth]?.label ?? "—"} />
          <Row label="Stockage" value="LocalStorage (clé: sienne.v1)" />
        </div>
        <div className="flex flex-wrap gap-2 mt-5">
          <Button variant="primary" onClick={exportData}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exporter en JSON
          </Button>
          <Button variant="subtle" onClick={copyData}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied ? "Copié ✓" : "Copier"}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirmReset) {
                dispatch({ type: "RESET" });
                if (typeof window !== "undefined") localStorage.removeItem("sienne.v1");
                setConfirmReset(false);
              } else {
                setConfirmReset(true);
                setTimeout(() => setConfirmReset(false), 4000);
              }
            }}
          >
            {confirmReset ? "Confirmer la réinitialisation ?" : "Réinitialiser"}
          </Button>
        </div>
      </Card>

      {/* À propos */}
      <Card>
        <SectionHeader emoji="🪞" title="À propos" subtitle="Modernisation fidèle de votre fichier Excel" />
        <p className="text-text2 text-[14px] leading-relaxed">
          <span className="font-display italic text-accent text-base">Sienne</span> reprend
          la palette et la logique métier de votre tableur original : flux de trésorerie,
          factures avec échéances, dépenses variables, dettes, économies, calendrier mensuel
          et récap annuel — tout est conservé, modernisé et animé.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {["Next.js 14", "TypeScript", "Tailwind", "Framer Motion"].map(t => (
            <span key={t} className="text-[11.5px] px-3 py-2 rounded-lg bg-surface2 text-text2 text-center font-medium">
              {t}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border1/10 last:border-0 text-[13.5px]">
      <span className="text-text3">{label}</span>
      <span className="font-semibold text-text1 tabular-nums">{value}</span>
    </div>
  );
}
