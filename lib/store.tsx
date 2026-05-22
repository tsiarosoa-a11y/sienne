"use client";

import {
  createContext, useContext, useEffect, useMemo, useReducer, type ReactNode,
} from "react";
import type { AppState, MonthData, MonthTotals, SectionKey, Transaction } from "./types";
import { buildYear2026 } from "./seed";
import { uid } from "./format";

// ============ STATE ============
const STORAGE_KEY = "sienne.v1";

const initialState: AppState = {
  currentMonth: "2026-03",
  months: buildYear2026(),
  theme: "light",
};

type Action =
  | { type: "HYDRATE"; payload: AppState }
  | { type: "SET_MONTH"; key: string }
  | { type: "ADD_TX"; tx: Omit<Transaction, "id"> }
  | { type: "UPDATE_TX"; monthKey: string; id: string; patch: Partial<Transaction> }
  | { type: "DELETE_TX"; monthKey: string; id: string }
  | { type: "SET_CARRYOVER"; monthKey: string; value: number }
  | { type: "TOGGLE_THEME" }
  | { type: "RESET" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "SET_MONTH":
      return { ...state, currentMonth: action.key };
    case "ADD_TX": {
      const m = state.months[state.currentMonth];
      if (!m) return state;
      const tx: Transaction = { ...action.tx, id: uid() };
      return {
        ...state,
        months: {
          ...state.months,
          [m.key]: { ...m, transactions: [...m.transactions, tx] },
        },
      };
    }
    case "UPDATE_TX": {
      const m = state.months[action.monthKey];
      if (!m) return state;
      return {
        ...state,
        months: {
          ...state.months,
          [m.key]: {
            ...m,
            transactions: m.transactions.map(tx =>
              tx.id === action.id ? { ...tx, ...action.patch } : tx
            ),
          },
        },
      };
    }
    case "DELETE_TX": {
      const m = state.months[action.monthKey];
      if (!m) return state;
      return {
        ...state,
        months: {
          ...state.months,
          [m.key]: {
            ...m,
            transactions: m.transactions.filter(tx => tx.id !== action.id),
          },
        },
      };
    }
    case "SET_CARRYOVER": {
      const m = state.months[action.monthKey];
      if (!m) return state;
      return {
        ...state,
        months: { ...state.months, [m.key]: { ...m, carryover: action.value } },
      };
    }
    case "TOGGLE_THEME":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

// ============ DERIVED COMPUTATIONS ============
const ZERO = { budget: 0, actual: 0 };

export function computeTotals(m: MonthData): MonthTotals {
  const acc: Record<SectionKey, { budget: number; actual: number }> = {
    income:  { ...ZERO }, bills: { ...ZERO }, expenses: { ...ZERO },
    debts:   { ...ZERO }, savings: { ...ZERO },
  };
  for (const tx of m.transactions) {
    acc[tx.section].budget += tx.budget;
    acc[tx.section].actual += tx.actual;
  }
  // RESTANT = (carryover + Revenus) − Factures − Dépenses − Dettes
  // (formule reprise du fichier Excel : C17 = C12 - C13 - C14 - C16)
  const remaining = {
    budget: m.carryover + acc.income.budget - acc.bills.budget - acc.expenses.budget - acc.debts.budget,
    actual: m.carryover + acc.income.actual - acc.bills.actual - acc.expenses.actual - acc.debts.actual,
  };
  return { ...acc, carryover: m.carryover, remaining };
}

// ============ CONTEXT ============
interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  currentMonth: MonthData;
  totals: MonthTotals;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydratation depuis LocalStorage
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        // Vérification basique de structure
        if (parsed.months && parsed.currentMonth) {
          dispatch({ type: "HYDRATE", payload: parsed });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persistance
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch {
      // ignore (quota)
    }
  }, [state]);

  // Thème
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  const currentMonth = state.months[state.currentMonth] ?? state.months["2026-03"];
  const totals = useMemo(() => computeTotals(currentMonth), [currentMonth]);

  return (
    <StoreContext.Provider value={{ state, dispatch, currentMonth, totals }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

// ============ HELPERS ============
export const SECTION_META: Record<SectionKey, { label: string; emoji: string; accent: string }> = {
  income:   { label: "Revenus",   emoji: "💰", accent: "var(--success)" },
  bills:    { label: "Factures",  emoji: "🏠", accent: "var(--accent)" },
  expenses: { label: "Dépenses",  emoji: "🛒", accent: "var(--accent-strong)" },
  debts:    { label: "Dettes",    emoji: "💳", accent: "var(--text-2)" },
  savings:  { label: "Économies", emoji: "🌱", accent: "var(--success)" },
};
