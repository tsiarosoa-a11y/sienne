// =====================================================
// Données d'amorçage — reproduction fidèle du fichier
// budget_gestion_facile_final.xlsx (onglet "Budget Mensuel"
// + "📅 Calendrier" pour les jours d'échéance, Mars 2026)
// =====================================================
import type { MonthData, Transaction } from "./types";

const t = (
  id: string,
  section: Transaction["section"],
  label: string,
  emoji: string,
  budget: number,
  extras: Partial<Transaction> = {}
): Transaction => ({
  id,
  section,
  label,
  emoji,
  budget,
  actual: 0,
  paid: false,
  ...extras,
});

export const SEED_MARCH_2026: MonthData = {
  key: "2026-03",
  label: "Mars 2026",
  carryover: 0,
  transactions: [
    // ─── REVENUS ────────────────────────────────────────
    t("inc-fr",  "income", "France Travail (ARE)", "💼", 769),
    t("inc-apl", "income", "APL",                  "🏛️", 301),
    t("inc-rsa", "income", "RSA",                  "🤝", 540.44),
    t("inc-pa",  "income", "Prime d'activité",     "✨", 15),
    t("inc-ext", "income", "Aide externe",         "💝", 950),
    t("inc-tp",  "income", "Trop-perçu",           "⚠️", -174),

    // ─── FACTURES (charges fixes) ───────────────────────
    t("bill-loyer", "bills", "Loyer",                "🏠", 735,   { dueDay: 1 }),
    t("bill-gaz",   "bills", "Gaz",                  "🔥", 95,    { dueDay: 5 }),
    t("bill-elec",  "bills", "Électricité",          "💡", 25,    { dueDay: 5 }),
    t("bill-free",  "bills", "Freebox",              "📡", 23.99, { dueDay: 10 }),
    t("bill-mob1",  "bills", "Forfait mobile 1",     "📱", 9.99,  { dueDay: 15 }),
    t("bill-mob2",  "bills", "Forfait mobile 2",     "📱", 19.99, { dueDay: 15 }),
    t("bill-hab",   "bills", "Assurance habitation", "🛡️", 11,    { dueDay: 5 }),

    // ─── DÉPENSES variables ─────────────────────────────
    t("exp-alim",  "expenses", "Alimentation",     "🛒", 1000, { category: "Alimentation" }),
    t("exp-hyg",   "expenses", "Hygiène & soins",  "🧴", 200,  { category: "Hygiène & soins" }),
    t("exp-ent",   "expenses", "Entretien maison", "🧹", 88,   { category: "Maison" }),
    t("exp-cig",   "expenses", "Cigarettes",       "🚬", 390,  { category: "Plaisirs" }),
    t("exp-trans", "expenses", "Transports",       "🚇", 0,    { category: "Transports" }),

    // ─── DETTES / CRÉDITS ───────────────────────────────
    t("debt-k1",  "debts", "Alma/Klarna 1",            "💳", 0,  { dueDay: 20 }),
    t("debt-k2",  "debts", "Alma/Klarna 2",            "💳", 0,  { dueDay: 20 }),
    t("debt-cos", "debts", "Costume (3 mois)",         "💳", 99, { dueDay: 20 }),
    t("debt-lit", "debts", "Lit Bobochic (21 mois)",   "💳", 37, { dueDay: 20 }),

    // ─── ÉCONOMIES / OBJECTIFS ──────────────────────────
    t("sav-urg", "savings", "Fonds d'urgence", "🌱", 0),
    t("sav-eps", "savings", "Épargne",         "🪴", 0),
    t("sav-prj", "savings", "Projets",         "✨", 0),
  ],
};

/** Construit 12 mois pour l'année 2026, basés sur Mars (le mois "vivant") */
export function buildYear2026(): Record<string, MonthData> {
  const MONTHS = [
    "Janvier","Février","Mars","Avril","Mai","Juin",
    "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
  ];
  const data: Record<string, MonthData> = {};
  MONTHS.forEach((label, idx) => {
    const key = `2026-${String(idx + 1).padStart(2, "0")}`;
    if (key === "2026-03") {
      data[key] = SEED_MARCH_2026;
    } else {
      // Mois futurs : on garde la structure mais les "actuels" à 0
      data[key] = {
        key,
        label: `${label} 2026`,
        carryover: 0,
        transactions: SEED_MARCH_2026.transactions.map(tx => ({
          ...tx,
          id: `${tx.id}-${key}`,
          actual: 0,
          paid: false,
        })),
      };
    }
  });
  return data;
}
