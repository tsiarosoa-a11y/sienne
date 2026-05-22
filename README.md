# Sienne — Gestion budgétaire personnelle

> Modernisation fidèle de `budget_gestion_facile_final.xlsx` en application web Next.js.
> Palette **terre de Sienne** (terracotta · crème · brun chaleureux) extraite cellule par cellule.

---

## ✨ Aperçu

| Fonctionnalité | Reprise du fichier Excel | Plus dans l'app |
|---|---|---|
| Flux de trésorerie | ✅ Aperçu identique (Report, Revenus, Factures, Dépenses, Économies, Dettes, RESTANT) | Recalcul live, halo animé |
| 6 sections | ✅ Revenus, Factures, Dépenses, Dettes, Économies | Ajout/édition/suppression inline |
| Cases ☑/☐ | ✅ Sur factures et dettes | Animation Framer Motion |
| Calendrier paiements | ✅ Grille mensuelle, échéances par jour | Couleurs selon catégorie (factures vs dettes) |
| Récap annuel | ✅ Tableau 12 mois | Graphique surface animé |
| Cellules jaunes éditables | ✅ Préservées (texte bleu sur fond crème) | + Glow accent au focus |
| Émojis 💰 📅 📈 🏠 📱 💳 | ✅ Tous conservés | + Nouveaux (🌱 ✨ 🪶) pour les insights |
| Polices Georgia + Arial | → **Fraunces** (display) + **Plus Jakarta Sans** (corps) | Plus moderne, même esprit "papier chaleureux" |

---

## 🎨 Palette (extraite du fichier Excel)

```
#FDF6F3  Fond crème         ← #FFFFFF  Cartes
#F3EAE5  Sous-en-têtes      ← #F7DDD6  Accent rose pêche
#FFF8DC  Cellules saisissables (texte #1F4E9C)
#EFC5B8  En-têtes terracotta clair
#C4746B  Accent principal   ← #C0524D  Alerte / dépassement
#2A1C18  Texte primaire     ← #6B4A42  Texte secondaire (moka)
#A07870  Texte tertiaire    ← #C8ADA7  Texte discret (taupe)
```

Toutes ces couleurs sont exposées en CSS variables dans `app/globals.css` et utilisables via Tailwind (`bg-bg`, `bg-surface`, `text-accent`, etc.).

Un mode sombre dérivé conserve les mêmes ratios chromatiques.

---

## 🗂️ Arborescence

```
sienne/
├── app/
│   ├── layout.tsx               # Root layout, fonts, StoreProvider
│   ├── globals.css              # Palette CSS variables + glassmorphism
│   ├── page.tsx                 # 📊 Dashboard
│   ├── depenses/page.tsx        # 🛒 Liste filtrable/cherchable
│   ├── calendrier/page.tsx      # 📅 Vue mensuelle des paiements
│   ├── statistiques/page.tsx    # 📈 Récap annuel + auto-analyse
│   └── parametres/page.tsx      # ⚙️ Thème, export/reset
│
├── components/
│   ├── AppShell.tsx             # Sidebar animée + topbar avec sélecteur de mois
│   ├── ui.tsx                   # Card, Button, Progress, Modal, Field, Check, Badge
│   ├── dashboard/
│   │   ├── KpiGrid.tsx          # 4 tuiles métriques en haut
│   │   ├── CashflowSummary.tsx  # "APERÇU DU FLUX DE TRÉSORERIE"
│   │   └── SectionPanel.tsx     # Panneau éditable réutilisé pour chaque section
│   └── charts/
│       └── DashboardCharts.tsx  # Donut + Bars (Recharts)
│
├── lib/
│   ├── types.ts                 # Modèle de domaine (Transaction, MonthData…)
│   ├── format.ts                # Formatters fr-FR + helpers mois
│   ├── seed.ts                  # Données initiales — reproduction fidèle Mars 2026
│   └── store.tsx                # React Context + LocalStorage + totaux dérivés
│
├── package.json
├── tsconfig.json                # strict: true
├── tailwind.config.ts           # Palette exposée + animations
├── postcss.config.mjs
├── next.config.mjs
└── README.md
```

---

## 🧮 Logique métier (calquée sur le fichier)

```ts
// Reprise littérale de la formule C17 du fichier :
//   C17 = C12 - C13 - C14 - C16
//   (Revenus - Factures - Dépenses - Dettes)

remaining = carryover + income − bills − expenses − debts
```

Le calcul est dérivé en temps réel dans `lib/store.tsx → computeTotals()` à chaque modification.

**Persistance :** LocalStorage sous la clé `sienne.v1`. Tout est sauvegardé automatiquement.

---

## 🚀 Démarrage

```bash
# 1. Installation
npm install

# 2. Développement
npm run dev
# → http://localhost:3000

# 3. Production
npm run build
npm start
```

### Vérification de types

```bash
npm run typecheck
```

---

## 🛫 Déploiement Vercel (zéro configuration)

```bash
# Méthode 1 : CLI
npx vercel

# Méthode 2 : GitHub
# - Pushez ce dossier sur GitHub
# - Connectez-vous sur https://vercel.com/new
# - Importez le repo, cliquez Deploy
# - Aucune variable d'environnement requise
```

Le projet est **100% client-side** : aucune base de données, aucune API, aucune clé. Le `localStorage` du navigateur suffit. Compatible Edge runtime.

---

## 🎬 Animations & UX

- **Sidebar mobile off-canvas** avec spring physics
- **Pill de navigation** qui glisse entre les éléments actifs (`layoutId`)
- **Barres de progression** qui s'animent à l'apparition (ease cubique)
- **Apparitions échelonnées** des lignes de chaque section (`delay: i * 0.04`)
- **Modale** avec backdrop blur + slide-up
- **Toggle thème** avec rotation animée du soleil ↔ lune
- **Cases à cocher** animées (zoom du ✓)
- **Halo** discret au coin de chaque KPI tile
- **Grain léger** sur le fond pour la chaleur du papier (radial-gradient)

---

## 📦 Stack

- **Next.js 14.2** (App Router)
- **React 18.3** + **TypeScript 5.5** (strict)
- **Tailwind CSS 3.4** + CSS variables
- **Framer Motion 11**
- **Recharts 2.12**
- Polices Google : **Fraunces** + **Plus Jakarta Sans**

---

## 💡 Aller plus loin

Idées pour étendre Sienne sans casser l'architecture :

- **Export PDF** d'un mois (via `react-to-print` ou impression CSS)
- **Import CSV** d'un relevé bancaire (mapping vers les sections)
- **Mode partage en lecture seule** (URL avec snapshot encodé)
- **Récurrences** automatiques (dupliquer un mois en un clic)
- **Synchronisation Supabase** si on veut quitter le LocalStorage

L'architecture (state via Context + reducer, types stricts, composants stateless) est prête pour chacune de ces extensions.

---

> Construit avec soin sur la palette terre de Sienne de votre fichier original.
