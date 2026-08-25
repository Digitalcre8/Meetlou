// Persistence abstraction. When Supabase is configured (VITE_SUPABASE_URL +
// VITE_SUPABASE_ANON_KEY), reads/writes go to Postgres via supabase-js and
// are protected by Row Level Security (see supabase/schema.sql). Otherwise
// the app falls back to a localStorage-backed store so the full experience
// — including demo mode — works with zero configuration.

import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type {
  MealPlan,
  NutritionTargets,
  ShoppingList,
  UserProfile,
  WeightEntry,
} from '@/types'

export interface DataStore {
  getProfile(userId: string): Promise<UserProfile | null>
  saveProfile(profile: UserProfile): Promise<void>
  getNutritionTargets(userId: string): Promise<NutritionTargets | null>
  saveNutritionTargets(userId: string, targets: NutritionTargets): Promise<void>
  getMealPlan(userId: string): Promise<MealPlan | null>
  saveMealPlan(plan: MealPlan): Promise<void>
  getShoppingList(userId: string): Promise<ShoppingList | null>
  saveShoppingList(list: ShoppingList): Promise<void>
  getWeightEntries(userId: string): Promise<WeightEntry[]>
  addWeightEntry(entry: WeightEntry): Promise<void>
}

// -------------------- localStorage implementation --------------------

const key = (ns: string, userId: string) => `meetlou:${ns}:${userId}`

function readJSON<T>(k: string): T | null {
  try {
    const raw = localStorage.getItem(k)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJSON(k: string, value: unknown) {
  localStorage.setItem(k, JSON.stringify(value))
}

class LocalDataStore implements DataStore {
  async getProfile(userId: string) {
    return readJSON<UserProfile>(key('profile', userId))
  }
  async saveProfile(profile: UserProfile) {
    writeJSON(key('profile', profile.userId), profile)
  }
  async getNutritionTargets(userId: string) {
    return readJSON<NutritionTargets>(key('targets', userId))
  }
  async saveNutritionTargets(userId: string, targets: NutritionTargets) {
    writeJSON(key('targets', userId), targets)
  }
  async getMealPlan(userId: string) {
    return readJSON<MealPlan>(key('plan', userId))
  }
  async saveMealPlan(plan: MealPlan) {
    writeJSON(key('plan', plan.userId), plan)
  }
  async getShoppingList(userId: string) {
    return readJSON<ShoppingList>(key('shopping', userId))
  }
  async saveShoppingList(list: ShoppingList) {
    writeJSON(key('shopping', list.userId), list)
  }
  async getWeightEntries(userId: string) {
    return readJSON<WeightEntry[]>(key('weights', userId)) ?? []
  }
  async addWeightEntry(entry: WeightEntry) {
    const existing = await this.getWeightEntries(entry.userId)
    writeJSON(key('weights', entry.userId), [...existing, entry])
  }
}

// -------------------- Supabase implementation --------------------

function toProfileRow(profile: UserProfile) {
  return {
    id: profile.id,
    user_id: profile.userId,
    full_name: profile.fullName,
    email: profile.email,
    goal: profile.goal,
    goal_other: profile.goalOther ?? null,
    age: profile.age,
    sex: profile.sex,
    height_cm: profile.heightCm,
    weight_kg: profile.weightKg,
    activity_level: profile.activityLevel,
    dietary_requirements: profile.dietaryRequirements,
    allergies: profile.allergies,
    allergies_other: profile.allergiesOther ?? null,
    liked_foods: profile.likedFoods,
    disliked_foods: profile.dislikedFoods,
    household_size: profile.householdSize,
    weekly_budget: profile.weeklyBudget,
    supermarket: profile.supermarket,
    onboarding_complete: profile.onboardingComplete,
    updated_at: new Date().toISOString(),
  }
}

function fromProfileRow(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    fullName: row.full_name as string,
    email: row.email as string,
    goal: row.goal as UserProfile['goal'],
    goalOther: (row.goal_other as string | null) ?? undefined,
    age: row.age as number,
    sex: row.sex as UserProfile['sex'],
    heightCm: row.height_cm as number,
    weightKg: row.weight_kg as number,
    activityLevel: row.activity_level as UserProfile['activityLevel'],
    dietaryRequirements: (row.dietary_requirements as UserProfile['dietaryRequirements']) ?? [],
    allergies: (row.allergies as UserProfile['allergies']) ?? [],
    allergiesOther: (row.allergies_other as string | null) ?? undefined,
    likedFoods: (row.liked_foods as string[]) ?? [],
    dislikedFoods: (row.disliked_foods as string[]) ?? [],
    householdSize: row.household_size as UserProfile['householdSize'],
    weeklyBudget: row.weekly_budget as number,
    supermarket: row.supermarket as UserProfile['supermarket'],
    onboardingComplete: Boolean(row.onboarding_complete),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

class SupabaseDataStore implements DataStore {
  private db() {
    if (!supabase) throw new Error('Supabase is not configured')
    return supabase
  }

  async getProfile(userId: string) {
    const { data, error } = await this.db()
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (error || !data) return null
    return fromProfileRow(data)
  }

  async saveProfile(profile: UserProfile) {
    const { error } = await this.db().from('profiles').upsert(toProfileRow(profile))
    if (error) throw error
  }

  async getNutritionTargets(userId: string) {
    const { data, error } = await this.db()
      .from('nutrition_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (error || !data) return null
    return {
      bmr: data.bmr,
      tdee: data.tdee,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      updatedAt: data.updated_at,
    }
  }

  async saveNutritionTargets(userId: string, targets: NutritionTargets) {
    const { error } = await this.db().from('nutrition_profiles').upsert({
      user_id: userId,
      bmr: targets.bmr,
      tdee: targets.tdee,
      calories: targets.calories,
      protein: targets.protein,
      carbs: targets.carbs,
      fat: targets.fat,
      updated_at: new Date().toISOString(),
    })
    if (error) throw error
  }

  async getMealPlan(userId: string) {
    const { data: planRow, error } = await this.db()
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error || !planRow) return null

    const { data: slotRows } = await this.db()
      .from('meal_plan_meals')
      .select('*')
      .eq('meal_plan_id', planRow.id)

    return {
      id: planRow.id,
      userId: planRow.user_id,
      weekStarting: planRow.week_starting,
      slots: (slotRows ?? []).map((s) => ({
        id: s.id,
        day: s.day,
        type: s.meal_type,
        mealId: s.meal_id,
      })),
      createdAt: planRow.created_at,
      updatedAt: planRow.updated_at,
    }
  }

  async saveMealPlan(plan: MealPlan) {
    const db = this.db()
    const { error: planError } = await db.from('meal_plans').upsert({
      id: plan.id,
      user_id: plan.userId,
      week_starting: plan.weekStarting,
      created_at: plan.createdAt,
      updated_at: new Date().toISOString(),
    })
    if (planError) throw planError

    await db.from('meal_plan_meals').delete().eq('meal_plan_id', plan.id)
    if (plan.slots.length > 0) {
      const { error: slotsError } = await db.from('meal_plan_meals').insert(
        plan.slots.map((slot) => ({
          id: slot.id,
          meal_plan_id: plan.id,
          day: slot.day,
          meal_type: slot.type,
          meal_id: slot.mealId,
        })),
      )
      if (slotsError) throw slotsError
    }
  }

  async getShoppingList(userId: string) {
    const { data: listRow, error } = await this.db()
      .from('shopping_lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error || !listRow) return null

    const { data: itemRows } = await this.db()
      .from('shopping_list_items')
      .select('*')
      .eq('shopping_list_id', listRow.id)

    return {
      id: listRow.id,
      userId: listRow.user_id,
      mealPlanId: listRow.meal_plan_id,
      supermarket: listRow.supermarket,
      estimatedTotal: listRow.estimated_total,
      budget: listRow.budget,
      createdAt: listRow.created_at,
      updatedAt: listRow.updated_at,
      items: (itemRows ?? []).map((i) => ({
        id: i.id,
        ingredientName: i.ingredient_name,
        category: i.category,
        productId: i.product_id,
        quantity: i.quantity,
        unitPrice: i.unit_price,
        totalPrice: i.total_price,
        matchedFor: i.matched_for ?? [],
        substitutionNote: i.substitution_note ?? undefined,
      })),
    }
  }

  async saveShoppingList(list: ShoppingList) {
    const db = this.db()
    const { error: listError } = await db.from('shopping_lists').upsert({
      id: list.id,
      user_id: list.userId,
      meal_plan_id: list.mealPlanId,
      supermarket: list.supermarket,
      estimated_total: list.estimatedTotal,
      budget: list.budget,
      created_at: list.createdAt,
      updated_at: new Date().toISOString(),
    })
    if (listError) throw listError

    await db.from('shopping_list_items').delete().eq('shopping_list_id', list.id)
    if (list.items.length > 0) {
      const { error: itemsError } = await db.from('shopping_list_items').insert(
        list.items.map((item) => ({
          id: item.id,
          shopping_list_id: list.id,
          ingredient_name: item.ingredientName,
          category: item.category,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
          matched_for: item.matchedFor,
          substitution_note: item.substitutionNote ?? null,
        })),
      )
      if (itemsError) throw itemsError
    }
  }

  async getWeightEntries(userId: string) {
    const { data, error } = await this.db()
      .from('weight_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
    if (error || !data) return []
    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      date: row.date,
      weightKg: row.weight_kg,
    }))
  }

  async addWeightEntry(entry: WeightEntry) {
    const { error } = await this.db().from('weight_entries').insert({
      id: entry.id,
      user_id: entry.userId,
      date: entry.date,
      weight_kg: entry.weightKg,
    })
    if (error) throw error
  }
}

let cachedStore: DataStore | null = null
let cachedLocalStore: DataStore | null = null

export function getDataStore(): DataStore {
  if (!cachedStore) {
    cachedStore = isSupabaseConfigured() ? new SupabaseDataStore() : new LocalDataStore()
  }
  return cachedStore
}

/** Always localStorage-backed — used for the "Try Demo" experience regardless of whether Supabase is configured. */
export function getLocalDataStore(): DataStore {
  if (!cachedLocalStore) cachedLocalStore = new LocalDataStore()
  return cachedLocalStore
}
