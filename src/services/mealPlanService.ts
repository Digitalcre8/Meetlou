// Deterministic meal planning engine. Selects meals from the seeded library
// that are safe (allergens), compatible (dietary requirements) and close to
// the user's nutrition targets and food preferences. This is the fallback
// (and default, for the MVP) behind the aiService abstraction — see
// aiService.ts for where a real LLM-backed planner would plug in.

import { filterSafeMeals } from '@/services/allergenService'
import { filterCompatibleMeals } from '@/services/dietaryService'
import { MEALS, getMealsByType } from '@/data/seed/meals'
import type {
  Meal,
  MealPlan,
  MealPlanSlot,
  MealType,
  NutritionTargets,
  UserProfile,
} from '@/types'

const MEAL_TYPE_SHARE: Record<MealType, number> = {
  breakfast: 0.25,
  lunch: 0.3,
  dinner: 0.35,
  snack: 0.1,
}

const DAYS_IN_WEEK = 7

function getMealIdForDay() {
  return `slot-${crypto.randomUUID()}`
}

export function getMealById(mealId: string): Meal | undefined {
  return MEALS.find((m) => m.id === mealId)
}

function scoreMeal(meal: Meal, targetCalories: number, profile: UserProfile): number {
  const calorieDiff = Math.abs(meal.macros.calories - targetCalories)
  let score = -calorieDiff

  const nameAndTags = `${meal.name} ${meal.description} ${meal.tags.join(' ')}`.toLowerCase()

  for (const liked of profile.likedFoods) {
    if (liked.trim() && nameAndTags.includes(liked.trim().toLowerCase())) {
      score += 120
    }
  }
  for (const disliked of profile.dislikedFoods) {
    if (disliked.trim() && nameAndTags.includes(disliked.trim().toLowerCase())) {
      score -= 500
    }
  }

  // Slight bonus for meals that lean toward the user's protein target.
  if (profile.goal === 'build_muscle') {
    score += meal.macros.protein * 2
  }

  return score
}

function eligibleMealsFor(type: MealType, profile: UserProfile): Meal[] {
  const byType = getMealsByType(type)
  const safe = filterSafeMeals(byType, profile.allergies)
  const compatible = filterCompatibleMeals(safe, profile.dietaryRequirements)
  return compatible.length > 0 ? compatible : safe // never surface an unsafe meal, even if it means dropping diet strictness
}

function pickMealsForType(
  type: MealType,
  count: number,
  profile: UserProfile,
  targets: NutritionTargets,
): Meal[] {
  const pool = eligibleMealsFor(type, profile)
  if (pool.length === 0) return []

  const targetCalories = targets.calories * MEAL_TYPE_SHARE[type]
  const ranked = [...pool].sort((a, b) => scoreMeal(b, targetCalories, profile) - scoreMeal(a, targetCalories, profile))

  const selection: Meal[] = []
  const used = new Set<string>()
  let cursor = 0
  while (selection.length < count) {
    if (used.size >= ranked.length) used.clear() // cycle once pool exhausted
    const candidate = ranked[cursor % ranked.length]
    cursor += 1
    if (used.has(candidate.id) && ranked.length > selection.length) continue
    used.add(candidate.id)
    selection.push(candidate)
    if (cursor > ranked.length * 3) break // safety valve
  }
  return selection
}

export function generateWeeklyPlan(
  profile: UserProfile,
  targets: NutritionTargets,
  weekStarting: string,
): MealPlan {
  const slots: MealPlanSlot[] = []
  const types: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

  for (const type of types) {
    const meals = pickMealsForType(type, DAYS_IN_WEEK, profile, targets)
    meals.forEach((meal, day) => {
      slots.push({ id: getMealIdForDay(), day, type, mealId: meal.id })
    })
  }

  return {
    id: `plan-${crypto.randomUUID()}`,
    userId: profile.userId,
    weekStarting,
    slots,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/** Returns up to `count` safe, compatible alternatives for a given slot, excluding the current meal. */
export function getAlternatives(
  type: MealType,
  currentMealId: string,
  profile: UserProfile,
  targets: NutritionTargets,
  count = 5,
): Meal[] {
  const pool = eligibleMealsFor(type, profile).filter((m) => m.id !== currentMealId)
  const targetCalories = targets.calories * MEAL_TYPE_SHARE[type]
  return [...pool]
    .sort((a, b) => scoreMeal(b, targetCalories, profile) - scoreMeal(a, targetCalories, profile))
    .slice(0, count)
}

export function swapMealInPlan(plan: MealPlan, slotId: string, newMealId: string): MealPlan {
  return {
    ...plan,
    slots: plan.slots.map((slot) => (slot.id === slotId ? { ...slot, mealId: newMealId } : slot)),
    updatedAt: new Date().toISOString(),
  }
}

export function removeMealFromPlan(plan: MealPlan, slotId: string): MealPlan {
  return {
    ...plan,
    slots: plan.slots.filter((slot) => slot.id !== slotId),
    updatedAt: new Date().toISOString(),
  }
}

export function getSlotsForDay(plan: MealPlan, day: number): MealPlanSlot[] {
  return plan.slots
    .filter((s) => s.day === day)
    .sort((a, b) => {
      const order: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
      return order.indexOf(a.type) - order.indexOf(b.type)
    })
}

export function getDayMacros(plan: MealPlan, day: number) {
  const slots = getSlotsForDay(plan, day)
  return slots.reduce(
    (totals, slot) => {
      const meal = getMealById(slot.mealId)
      if (!meal) return totals
      return {
        calories: totals.calories + meal.macros.calories,
        protein: totals.protein + meal.macros.protein,
        carbs: totals.carbs + meal.macros.carbs,
        fat: totals.fat + meal.macros.fat,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )
}
