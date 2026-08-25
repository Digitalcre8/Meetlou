import type { DietaryRequirement, Meal } from '@/types'

export const DIETARY_LABELS: Record<DietaryRequirement, string> = {
  no_preference: 'No preference',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  pescatarian: 'Pescatarian',
  halal: 'Halal',
  kosher: 'Kosher',
  gluten_free: 'Gluten-free',
  dairy_free: 'Dairy-free',
  other: 'Other',
}

/**
 * A meal satisfies the user's dietary requirements when every requirement
 * the user selected (other than "no_preference") appears on the meal's tag
 * list. Meals are authored with the strictest applicable tags, so a meal
 * tagged "vegan" is automatically compatible with a "vegetarian" requirement
 * check too via the union performed at generation time.
 */
export function isMealCompatible(meal: Meal, requirements: DietaryRequirement[]): boolean {
  const active = requirements.filter((r) => r !== 'no_preference' && r !== 'other')
  if (active.length === 0) return true
  return active.every((req) => meal.dietaryRequirements.includes(req))
}

export function filterCompatibleMeals(meals: Meal[], requirements: DietaryRequirement[]): Meal[] {
  return meals.filter((meal) => isMealCompatible(meal, requirements))
}
