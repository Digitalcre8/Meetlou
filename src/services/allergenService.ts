// Deterministic allergen filtering — the safety-critical layer of the app.
// This never relies on AI: it is a straightforward set-intersection check
// against the user's declared allergies, applied to both meals and products.

import type { Allergen, Meal, Product } from '@/types'

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  peanuts: 'Peanuts',
  tree_nuts: 'Tree nuts',
  milk: 'Milk',
  eggs: 'Eggs',
  fish: 'Fish',
  shellfish: 'Shellfish',
  soy: 'Soy',
  wheat_gluten: 'Wheat / gluten',
  sesame: 'Sesame',
  other: 'Other',
}

export const ALLERGEN_DISCLAIMER =
  'Allergen information should always be checked on the product packaging before consumption. This app is not a substitute for medical advice.'

/** True if the item contains any allergen the user must avoid. */
export function containsAllergen(itemAllergens: Allergen[], userAllergies: Allergen[]): boolean {
  if (userAllergies.length === 0) return false
  return itemAllergens.some((allergen) => userAllergies.includes(allergen))
}

export function isMealSafe(meal: Meal, userAllergies: Allergen[]): boolean {
  return !containsAllergen(meal.allergens, userAllergies)
}

export function isProductSafe(product: Product, userAllergies: Allergen[]): boolean {
  return !containsAllergen(product.allergens, userAllergies)
}

export function filterSafeMeals(meals: Meal[], userAllergies: Allergen[]): Meal[] {
  return meals.filter((meal) => isMealSafe(meal, userAllergies))
}

export function filterSafeProducts(products: Product[], userAllergies: Allergen[]): Product[] {
  return products.filter((product) => isProductSafe(product, userAllergies))
}

/** Returns the specific allergens in an item that conflict with the user's profile. */
export function getConflictingAllergens(itemAllergens: Allergen[], userAllergies: Allergen[]): Allergen[] {
  return itemAllergens.filter((allergen) => userAllergies.includes(allergen))
}
