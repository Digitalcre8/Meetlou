// Nutrition engine — estimates daily calorie and macro targets from a user's
// profile using the Mifflin-St Jeor equation. Kept isolated from the rest of
// the app so the estimation method can be swapped/improved independently.
//
// IMPORTANT: these are estimates for general wellness planning only, not
// medical advice. Callers should always present them as such.

import type { ActivityLevel, Goal, NutritionTargets, Sex } from '@/types'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
}

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly active',
  moderately_active: 'Moderately active',
  very_active: 'Very active',
  extremely_active: 'Extremely active',
}

export const ACTIVITY_LEVEL_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary: 'Little to no exercise, desk-based day',
  lightly_active: 'Light exercise 1-3 days a week',
  moderately_active: 'Moderate exercise 3-5 days a week',
  very_active: 'Hard exercise 6-7 days a week',
  extremely_active: 'Very hard training or a physical job',
}

const GOAL_CALORIE_ADJUSTMENT: Record<Goal, number> = {
  lose_weight: -0.2,
  build_muscle: 0.12,
  maintain_weight: 0,
  improve_nutrition: 0,
  eat_healthier: -0.05,
  other: 0,
}

const GOAL_PROTEIN_PER_KG: Record<Goal, number> = {
  lose_weight: 2.0,
  build_muscle: 2.0,
  maintain_weight: 1.6,
  improve_nutrition: 1.6,
  eat_healthier: 1.6,
  other: 1.6,
}

interface NutritionInput {
  age: number
  sex: Sex
  heightCm: number
  weightKg: number
  activityLevel: ActivityLevel
  goal: Goal
}

/** Basal Metabolic Rate via Mifflin-St Jeor. */
export function calculateBMR({ age, sex, heightCm, weightKg }: NutritionInput): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  if (sex === 'male') return Math.round(base + 5)
  if (sex === 'female') return Math.round(base - 161)
  return Math.round(base - 78) // midpoint estimate when sex is "other"
}

/** Total Daily Energy Expenditure = BMR x activity multiplier. */
export function calculateTDEE(input: NutritionInput): number {
  const bmr = calculateBMR(input)
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[input.activityLevel])
}

/**
 * Estimates daily calorie and macro targets for the given profile.
 * Clearly an estimate — never present this as medically prescriptive.
 */
export function calculateNutritionTargets(input: NutritionInput): NutritionTargets {
  const bmr = calculateBMR(input)
  const tdee = calculateTDEE(input)

  const adjustment = GOAL_CALORIE_ADJUSTMENT[input.goal]
  let calories = Math.round(tdee * (1 + adjustment))

  // Sensible floors so extreme inputs don't produce unsafe targets.
  const floor = input.sex === 'male' ? 1500 : 1200
  calories = Math.max(calories, floor)

  const proteinPerKg = GOAL_PROTEIN_PER_KG[input.goal]
  const protein = Math.round(input.weightKg * proteinPerKg)
  const proteinCalories = protein * 4

  const fatCalories = calories * 0.28
  const fat = Math.round(fatCalories / 9)

  const remainingCalories = Math.max(calories - proteinCalories - fatCalories, 0)
  const carbs = Math.round(remainingCalories / 4)

  return {
    bmr,
    tdee,
    calories,
    protein,
    carbs,
    fat,
    updatedAt: new Date().toISOString(),
  }
}
