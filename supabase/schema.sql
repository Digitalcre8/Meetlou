-- Meetlou — Supabase schema
--
-- Run this against a fresh Supabase project (SQL editor, or `supabase db push`
-- with this file as a migration). It creates every table the app's data
-- layer (src/services/dataStore.ts) reads and writes, plus RLS policies so
-- each user can only ever see their own profile, plans, and shopping lists.
--
-- Design notes:
--   * dietary_requirements, allergies and liked/disliked foods are modelled
--     as array columns on `profiles` rather than separate join tables —
--     they're simple multi-select user attributes with no lifecycle of
--     their own, so this keeps reads/writes to a single row per user.
--   * `supermarkets`, `products`, `meals` and `recipes` are included as
--     public, read-only catalogue tables so a future Phase 2 (live product
--     data, a real AI meal planner) has somewhere to land without a schema
--     change. The MVP itself serves this catalogue from seeded TypeScript
--     data (src/data/seed) rather than these tables, so meal_plan_meals and
--     shopping_list_items reference meal/product ids as plain text instead
--     of foreign keys.

create extension if not exists "pgcrypto";

-- -------------------- profiles --------------------

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  goal text not null check (goal in ('lose_weight', 'build_muscle', 'maintain_weight', 'improve_nutrition', 'eat_healthier', 'other')),
  goal_other text,
  age integer not null check (age between 13 and 120),
  sex text not null check (sex in ('male', 'female', 'other')),
  height_cm numeric not null check (height_cm between 100 and 250),
  weight_kg numeric not null check (weight_kg between 30 and 300),
  activity_level text not null check (activity_level in ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  dietary_requirements text[] not null default '{}',
  allergies text[] not null default '{}',
  allergies_other text,
  liked_foods text[] not null default '{}',
  disliked_foods text[] not null default '{}',
  household_size integer not null check (household_size between 1 and 5),
  weekly_budget numeric not null check (weekly_budget >= 0),
  supermarket text not null check (supermarket in ('tesco', 'sainsburys', 'asda', 'morrisons', 'waitrose', 'ocado', 'aldi', 'lidl', 'iceland', 'coop')),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = user_id);

-- -------------------- nutrition_profiles --------------------

create table if not exists public.nutrition_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  bmr numeric not null,
  tdee numeric not null,
  calories numeric not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  updated_at timestamptz not null default now()
);

alter table public.nutrition_profiles enable row level security;

create policy "nutrition_profiles_select_own" on public.nutrition_profiles for select using (auth.uid() = user_id);
create policy "nutrition_profiles_upsert_own" on public.nutrition_profiles for insert with check (auth.uid() = user_id);
create policy "nutrition_profiles_update_own" on public.nutrition_profiles for update using (auth.uid() = user_id);
create policy "nutrition_profiles_delete_own" on public.nutrition_profiles for delete using (auth.uid() = user_id);

-- -------------------- meal_plans + meal_plan_meals --------------------

create table if not exists public.meal_plans (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  week_starting date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.meal_plans enable row level security;

create policy "meal_plans_select_own" on public.meal_plans for select using (auth.uid() = user_id);
create policy "meal_plans_insert_own" on public.meal_plans for insert with check (auth.uid() = user_id);
create policy "meal_plans_update_own" on public.meal_plans for update using (auth.uid() = user_id);
create policy "meal_plans_delete_own" on public.meal_plans for delete using (auth.uid() = user_id);

create table if not exists public.meal_plan_meals (
  id text primary key,
  meal_plan_id text not null references public.meal_plans (id) on delete cascade,
  day integer not null check (day between 0 and 6),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  -- References the seeded meal catalogue (src/data/seed/meals.ts) by id.
  -- Not a foreign key to `meals` in the MVP — see the note at the top of this file.
  meal_id text not null
);

alter table public.meal_plan_meals enable row level security;

create policy "meal_plan_meals_select_own" on public.meal_plan_meals for select
  using (exists (select 1 from public.meal_plans p where p.id = meal_plan_id and p.user_id = auth.uid()));
create policy "meal_plan_meals_insert_own" on public.meal_plan_meals for insert
  with check (exists (select 1 from public.meal_plans p where p.id = meal_plan_id and p.user_id = auth.uid()));
create policy "meal_plan_meals_update_own" on public.meal_plan_meals for update
  using (exists (select 1 from public.meal_plans p where p.id = meal_plan_id and p.user_id = auth.uid()));
create policy "meal_plan_meals_delete_own" on public.meal_plan_meals for delete
  using (exists (select 1 from public.meal_plans p where p.id = meal_plan_id and p.user_id = auth.uid()));

-- -------------------- shopping_lists + shopping_list_items --------------------

create table if not exists public.shopping_lists (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_plan_id text not null references public.meal_plans (id) on delete cascade,
  supermarket text not null,
  estimated_total numeric not null default 0,
  budget numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shopping_lists enable row level security;

create policy "shopping_lists_select_own" on public.shopping_lists for select using (auth.uid() = user_id);
create policy "shopping_lists_insert_own" on public.shopping_lists for insert with check (auth.uid() = user_id);
create policy "shopping_lists_update_own" on public.shopping_lists for update using (auth.uid() = user_id);
create policy "shopping_lists_delete_own" on public.shopping_lists for delete using (auth.uid() = user_id);

create table if not exists public.shopping_list_items (
  id text primary key,
  shopping_list_id text not null references public.shopping_lists (id) on delete cascade,
  ingredient_name text not null,
  category text not null check (category in ('produce', 'meat_fish', 'dairy_eggs', 'carbohydrates', 'frozen', 'cupboard', 'snacks', 'drinks')),
  -- References the seeded product catalogue (src/data/seed/products.ts) by id.
  -- Not a foreign key to `products` in the MVP — see the note at the top of this file.
  product_id text not null,
  quantity integer not null default 1,
  unit_price numeric not null,
  total_price numeric not null,
  matched_for text[] not null default '{}',
  substitution_note text
);

alter table public.shopping_list_items enable row level security;

create policy "shopping_list_items_select_own" on public.shopping_list_items for select
  using (exists (select 1 from public.shopping_lists l where l.id = shopping_list_id and l.user_id = auth.uid()));
create policy "shopping_list_items_insert_own" on public.shopping_list_items for insert
  with check (exists (select 1 from public.shopping_lists l where l.id = shopping_list_id and l.user_id = auth.uid()));
create policy "shopping_list_items_update_own" on public.shopping_list_items for update
  using (exists (select 1 from public.shopping_lists l where l.id = shopping_list_id and l.user_id = auth.uid()));
create policy "shopping_list_items_delete_own" on public.shopping_list_items for delete
  using (exists (select 1 from public.shopping_lists l where l.id = shopping_list_id and l.user_id = auth.uid()));

-- -------------------- weight_entries --------------------

create table if not exists public.weight_entries (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  weight_kg numeric not null check (weight_kg between 20 and 400),
  created_at timestamptz not null default now()
);

alter table public.weight_entries enable row level security;

create policy "weight_entries_select_own" on public.weight_entries for select using (auth.uid() = user_id);
create policy "weight_entries_insert_own" on public.weight_entries for insert with check (auth.uid() = user_id);
create policy "weight_entries_update_own" on public.weight_entries for update using (auth.uid() = user_id);
create policy "weight_entries_delete_own" on public.weight_entries for delete using (auth.uid() = user_id);

-- -------------------- public catalogue tables (Phase 2 ready) --------------------
-- Populated by a future seed/import job. Readable by anyone (including
-- anonymous visitors on the landing page); never writable from the client.

create table if not exists public.supermarkets (
  id text primary key,
  name text not null,
  price_multiplier numeric not null default 1
);

create table if not exists public.products (
  id text primary key,
  supermarket text not null references public.supermarkets (id) on delete cascade,
  name text not null,
  brand text not null,
  category text not null,
  size text not null,
  unit_quantity numeric not null,
  unit text not null,
  price numeric not null,
  calories numeric not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  ingredient_tags text[] not null default '{}',
  allergens text[] not null default '{}',
  image_url text,
  available boolean not null default true
);

create table if not exists public.meals (
  id text primary key,
  name text not null,
  description text,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  image_url text,
  calories numeric not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  prep_time_minutes integer not null,
  tags text[] not null default '{}',
  dietary_requirements text[] not null default '{}',
  allergens text[] not null default '{}'
);

create table if not exists public.recipes (
  id text primary key,
  meal_id text not null references public.meals (id) on delete cascade,
  servings integer not null default 1,
  prep_time_minutes integer not null,
  cook_time_minutes integer not null,
  method text[] not null default '{}',
  ingredients jsonb not null default '[]'
);

alter table public.supermarkets enable row level security;
alter table public.products enable row level security;
alter table public.meals enable row level security;
alter table public.recipes enable row level security;

create policy "supermarkets_public_read" on public.supermarkets for select using (true);
create policy "products_public_read" on public.products for select using (true);
create policy "meals_public_read" on public.meals for select using (true);
create policy "recipes_public_read" on public.recipes for select using (true);

-- -------------------- updated_at trigger --------------------

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_meal_plans_updated_at before update on public.meal_plans
  for each row execute function public.set_updated_at();
create trigger set_shopping_lists_updated_at before update on public.shopping_lists
  for each row execute function public.set_updated_at();
