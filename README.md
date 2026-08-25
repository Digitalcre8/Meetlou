# Meetlou

**Your goals. Your meals. Your weekly shop.**

Meetlou is a personalised weekly meal planner and grocery shopping assistant.
Tell it your fitness goal, dietary requirements, allergies, food preferences,
household size, budget and preferred UK supermarket — it builds a 7-day meal
plan with full recipes, a consolidated shopping list grouped by category, and
an estimated basket cost, all filtered for your allergens automatically.

This is an MVP: supermarket integrations, checkout, and live AI planning are
not implemented, but the app is architected so they can be added without
reworking the UI (see [Architecture](#architecture)).

## Running it

```bash
npm install
npm run dev
```

The app works immediately with **no configuration** — no Supabase project and
no AI API key required. Auth, profiles and plans fall back to a
localStorage-backed store, and meal planning falls back to a deterministic
engine, so `npm run dev` gets you a fully working product on Try Demo.

To use Supabase for real accounts and Postgres persistence, copy `.env.example`
to `.env.local`, fill in your project's URL and anon key, then run
`supabase/schema.sql` against your project (SQL editor or `supabase db push`).
Row Level Security is enabled on every user-data table.

```bash
cp .env.example .env.local
```

## Tech stack

React + TypeScript + Vite, Tailwind CSS v4, shadcn/ui-style components on
Radix primitives, React Router, Supabase (auth + Postgres, optional),
Recharts for the progress chart.

## Architecture

Business logic lives in `src/services/`, never in components:

```
UI (pages/components)
  -> contexts (AuthContext, PlanContext) — orchestration + state
  -> services
       nutritionService        — BMR/TDEE/macro targets (Mifflin-St Jeor)
       mealPlanService          — deterministic meal selection & swaps
       recipeService             — recipe formatting/scaling
       allergenService           — deterministic allergen filtering (safety-critical)
       dietaryService             — dietary requirement compatibility
       productMatchingService      — ingredient -> seeded product matching
       basketOptimizationService    — consolidation + budget optimisation
       aiService                     — NL command parsing (AI-provider abstraction)
       planChangeService              — applies parsed commands to a plan
       adapters/supermarketAdapter.ts  — one class per chain, seeded today
  -> dataStore (Supabase or localStorage, same interface either way)
```

`src/data/seed/` holds the seeded catalogue: 10 supermarkets, ~70 base
products expanded per-chain (700+ SKUs with per-chain pricing), and a ~44
meal/recipe library. Product images are generated as deterministic inline SVG
data URIs (`src/lib/placeholderImage.ts`) so the app never depends on an
external image host.

### Adding a real supermarket integration later

Each chain has its own adapter class in `src/services/adapters/supermarketAdapter.ts`
(`TescoAdapter`, `SainsburysAdapter`, etc.), all implementing `SupermarketAdapter`.
Swapping the seeded implementation for a live one is a matter of replacing one
class's `getCatalogue`/`getProduct` methods — nothing upstream (product
matching, basket building, UI) needs to change.

### Adding real AI planning later

`src/services/aiService.ts` is the single seam between the app and any AI
provider. Today `interpretPlanChangeRequest` uses a deterministic keyword
parser so natural-language commands ("make this week's shop cheaper", "I
don't want fish this week") work without a key. A real integration would call
a secure backend/edge function from that same function — provider keys must
never ship to the browser bundle.

## What's deliberately out of scope (MVP)

Real supermarket checkout, live product/price/availability data, payment,
delivery slots, scraping, and automatic recurring orders. Interfaces are
shaped to make all of these addable later without a rewrite (see roadmap
below).

## Roadmap

- **Phase 2** — live product data & pricing, smarter AI planning, barcode
  scanning, pantry tracking.
- **Phase 3** — supermarket account connections, basket transfer, delivery
  slot selection, checkout.
- **Phase 4** — cross-supermarket comparison, price tracking, automatic
  weekly orders, family accounts, wearable/Health integrations.

## Disclaimers

Nutrition targets are estimates for general wellness planning, not medical
advice. Allergen filtering is deterministic and applied throughout the app,
but product packaging should always be checked before consumption.
