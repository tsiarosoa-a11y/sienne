// Formatters — locale française, comme dans le fichier Excel ("1 055,97 €")

export const eur = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export const eurCompact = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export const num = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 2,
});

export function pct(x: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(x);
}

/** Barre ASCII style fichier Excel : ████████░░░░░░░░░░░░ */
export function asciiBar(progress: number, width = 20): string {
  const clamped = Math.max(0, Math.min(1, progress));
  const filled = Math.round(clamped * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

/** Capitalise première lettre (pour "Mars" etc.) */
export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Génère un id court */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Mois français */
export const MONTH_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function monthKey(year: number, monthIdx: number): string {
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}`;
}

export function parseMonthKey(key: string): { year: number; monthIdx: number } {
  const [y, m] = key.split("-").map(Number);
  return { year: y, monthIdx: m - 1 };
}

export function monthLabel(key: string): string {
  const { year, monthIdx } = parseMonthKey(key);
  return `${MONTH_LABELS[monthIdx]} ${year}`;
}
