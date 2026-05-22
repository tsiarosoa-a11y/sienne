// ============================================================
// Types du domaine — calqués sur la structure du fichier Excel
// (Budget vs Réel, 6 sections, échéances jour du mois)
// ============================================================

export type SectionKey =
  | "income"      // Revenus
  | "bills"       // Factures (charges fixes)
  | "expenses"    // Dépenses variables
  | "debts"       // Dettes / crédits
  | "savings";    // Économies / objectifs

export interface Transaction {
  id: string;
  section: SectionKey;
  label: string;
  emoji: string;        // 🏠 📱 💳 💰 etc. — préservés du fichier
  budget: number;       // Montant prévu
  actual: number;       // Montant réel (saisi par l'utilisateur)
  dueDay?: number;      // 1–31 (factures et dettes)
  paid?: boolean;       // ☑ / ☐
  category?: string;    // Pour les dépenses : Alimentation, Hygiène…
  note?: string;
}

export interface MonthData {
  key: string;          // "2026-03"
  label: string;        // "Mars 2026"
  carryover: number;    // + Report du mois précédent
  transactions: Transaction[];
}

export interface AppState {
  currentMonth: string;
  months: Record<string, MonthData>;
  theme: "light" | "dark";
}

// ----- Totaux dérivés (Aperçu du flux de trésorerie) -----
export interface MonthTotals {
  income:  { budget: number; actual: number };
  bills:   { budget: number; actual: number };
  expenses:{ budget: number; actual: number };
  debts:   { budget: number; actual: number };
  savings: { budget: number; actual: number };
  carryover: number;
  // RESTANT = Revenus - Factures - Dépenses - Dettes
  remaining: { budget: number; actual: number };
}
