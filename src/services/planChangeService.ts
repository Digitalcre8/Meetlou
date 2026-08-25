// Applies a parsed PlanChangeCommand (see aiService.ts) to a meal plan.
// Kept separate from mealPlanService so the "understand + act on natural
// language" concern is isolated from core meal selection.

import { getAlternatives, getMealById } from '@/services/mealPlanService'
import type { PlanChangeCommand } from '@/services/aiService'
import type { Meal, MealPlan, MealType, NutritionTargets, UserProfile } from '@/types'

export interface PlanChangeResult {
  plan: MealPlan
  message: string
  changed: boolean
}

function mealMatchesTerm(meal: Meal, term: string): boolean {
  const haystack = [
    meal.name,
    meal.description,
    ...meal.tags,
    ...meal.recipe.ingredients.map((i) => i.name),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(term.toLowerCase())
}

function replaceSlot(
  plan: MealPlan,
  slotId: string,
  type: MealType,
  currentMealId: string,
  profile: UserProfile,
  targets: NutritionTargets,
  exclude: (meal: Meal) => boolean,
): MealPlan {
  const alternatives = getAlternatives(type, currentMealId, profile, targets, 10).filter(
    (m) => !exclude(m),
  )
  if (alternatives.length === 0) return plan
  const replacement = alternatives[0]
  return {
    ...plan,
    slots: plan.slots.map((s) => (s.id === slotId ? { ...s, mealId: replacement.id } : s)),
    updatedAt: new Date().toISOString(),
  }
}

export function applyPlanChange(
  command: PlanChangeCommand,
  plan: MealPlan,
  profile: UserProfile,
  targets: NutritionTargets,
): PlanChangeResult {
  switch (command.type) {
    case 'more_protein': {
      let updated = plan
      for (const slot of plan.slots) {
        const current = getMealById(slot.mealId)
        if (!current) continue
        const alternatives = getAlternatives(slot.type, slot.mealId, profile, targets, 8)
        const higherProtein = [...alternatives].sort((a, b) => b.macros.protein - a.macros.protein)[0]
        if (higherProtein && higherProtein.macros.protein > current.macros.protein) {
          updated = {
            ...updated,
            slots: updated.slots.map((s) => (s.id === slot.id ? { ...s, mealId: higherProtein.id } : s)),
          }
        }
      }
      return {
        plan: { ...updated, updatedAt: new Date().toISOString() },
        message: 'Swapped in higher-protein meals across your plan where possible.',
        changed: updated !== plan,
      }
    }

    case 'exclude_ingredient': {
      let updated = plan
      let anyChanged = false
      for (const slot of plan.slots) {
        const current = getMealById(slot.mealId)
        if (!current || !mealMatchesTerm(current, command.ingredient)) continue
        const before = updated
        updated = replaceSlot(updated, slot.id, slot.type, slot.mealId, profile, targets, (m) =>
          mealMatchesTerm(m, command.ingredient),
        )
        if (updated !== before) anyChanged = true
      }
      return {
        plan: { ...updated, updatedAt: new Date().toISOString() },
        message: anyChanged
          ? `Removed "${command.ingredient}" from your plan and replaced those meals.`
          : `Your plan didn't contain "${command.ingredient}", so nothing needed to change.`,
        changed: anyChanged,
      }
    }

    case 'replace_meal_type': {
      let updated = plan
      const usedIds = new Set<string>()
      for (const slot of plan.slots.filter((s) => s.type === command.mealType)) {
        const alternatives = getAlternatives(slot.type, slot.mealId, profile, targets, 10).filter(
          (m) => !usedIds.has(m.id),
        )
        const replacement = alternatives[0] ?? getAlternatives(slot.type, slot.mealId, profile, targets, 10)[0]
        if (!replacement) continue
        usedIds.add(replacement.id)
        updated = {
          ...updated,
          slots: updated.slots.map((s) => (s.id === slot.id ? { ...s, mealId: replacement.id } : s)),
        }
      }
      return {
        plan: { ...updated, updatedAt: new Date().toISOString() },
        message: `Refreshed all of your ${command.mealType}s with new options.`,
        changed: updated !== plan,
      }
    }

    case 'regenerate_plan':
    case 'make_cheaper':
    case 'already_have_ingredient':
    case 'unknown':
    default:
      return { plan, message: '', changed: false }
  }
}

export function findExcludedMealCount(plan: MealPlan, term: string): number {
  return plan.slots.filter((slot) => {
    const meal = getMealById(slot.mealId)
    return meal ? mealMatchesTerm(meal, term) : false
  }).length
}
