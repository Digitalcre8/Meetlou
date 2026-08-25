// Recipe engine — presentation-oriented helpers around a Meal's recipe.
// Kept separate from mealPlanService (selection) and productMatchingService
// (shopping) so recipe formatting/scaling can change independently.

import type { Ingredient, Meal } from '@/types'

export function scaleIngredients(ingredients: Ingredient[], servings: number, forServings: number): Ingredient[] {
  const factor = forServings / Math.max(servings, 1)
  return ingredients.map((ingredient) => ({
    ...ingredient,
    quantity: Math.round(ingredient.quantity * factor * 100) / 100,
  }))
}

export function formatIngredientLine(ingredient: Ingredient): string {
  const qty = Number.isInteger(ingredient.quantity)
    ? ingredient.quantity
    : ingredient.quantity.toFixed(1)
  return `${qty}${ingredient.unit === 'each' ? '' : ingredient.unit} ${ingredient.name}`.trim()
}

export function totalTimeMinutes(meal: Meal): number {
  return meal.recipe.prepTimeMinutes + meal.recipe.cookTimeMinutes
}
