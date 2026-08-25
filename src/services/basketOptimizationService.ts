// Consolidates a meal plan's recipe ingredients into a single shopping list,
// matches each to a seeded product, and applies a lightweight budget
// optimisation pass. Kept separate from productMatchingService so the
// "shopping engine" (consolidation + budget logic) can evolve independently
// of the "matching engine" (ingredient -> product).

import { getMealById } from '@/services/mealPlanService'
import { matchIngredientToProduct } from '@/services/productMatchingService'
import { findCandidateProducts } from '@/services/productMatchingService'
import { isProductSafe } from '@/services/allergenService'
import type {
  Allergen,
  HouseholdSize,
  Ingredient,
  MealPlan,
  Product,
  ShoppingList,
  ShoppingListItem,
  SupermarketId,
  UserProfile,
} from '@/types'

interface ConsolidatedIngredient {
  name: string
  category: Ingredient['category']
  unit: string
  quantity: number
  mealNames: Set<string>
}

function consolidateIngredients(plan: MealPlan, householdSize: HouseholdSize): ConsolidatedIngredient[] {
  const map = new Map<string, ConsolidatedIngredient>()

  for (const slot of plan.slots) {
    const meal = getMealById(slot.mealId)
    if (!meal) continue
    for (const ingredient of meal.recipe.ingredients) {
      const key = `${ingredient.name.toLowerCase()}|${ingredient.unit}`
      const scaledQuantity = ingredient.quantity * householdSize
      const existing = map.get(key)
      if (existing) {
        existing.quantity += scaledQuantity
        existing.mealNames.add(meal.name)
      } else {
        map.set(key, {
          name: ingredient.name,
          category: ingredient.category,
          unit: ingredient.unit,
          quantity: scaledQuantity,
          mealNames: new Set([meal.name]),
        })
      }
    }
  }

  return Array.from(map.values())
}

export function buildShoppingList(
  plan: MealPlan,
  profile: UserProfile,
): ShoppingList {
  const consolidated = consolidateIngredients(plan, profile.householdSize)

  const items: ShoppingListItem[] = []
  for (const entry of consolidated) {
    const ingredient: Ingredient = {
      name: entry.name,
      quantity: entry.quantity,
      unit: entry.unit,
      category: entry.category,
    }
    const match = matchIngredientToProduct(ingredient, profile.supermarket, profile.allergies)
    if (!match) continue

    items.push({
      id: `item-${crypto.randomUUID()}`,
      ingredientName: entry.name,
      category: entry.category,
      productId: match.product.id,
      quantity: match.packs,
      unitPrice: match.product.price,
      totalPrice: match.totalPrice,
      matchedFor: Array.from(entry.mealNames),
      substitutionNote: match.substitutionNote,
    })
  }

  const estimatedTotal = Math.round(items.reduce((sum, item) => sum + item.totalPrice, 0) * 100) / 100

  return {
    id: `shop-${crypto.randomUUID()}`,
    userId: profile.userId,
    mealPlanId: plan.id,
    supermarket: profile.supermarket,
    items,
    estimatedTotal,
    budget: profile.weeklyBudget,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/** Swaps every item for the cheapest allergy-safe alternative in its category, regardless of budget. Used by the "make it cheaper" natural-language command. */
export function forceCheaperBasket(
  shoppingList: ShoppingList,
  supermarket: SupermarketId,
  userAllergies: Allergen[],
  getProductById: (id: string) => Product | undefined,
): OptimizationResult {
  const notes: string[] = []
  const items = shoppingList.items.map((item) => {
    const currentProduct = getProductById(item.productId)
    if (!currentProduct) return item

    const candidates = findCandidateProducts(item.ingredientName, item.category, supermarket).filter(
      (p) => isProductSafe(p, userAllergies),
    )
    const cheapest = [...candidates].sort(
      (a, b) => a.price / Math.max(a.unitQuantity, 1) - b.price / Math.max(b.unitQuantity, 1),
    )[0]
    if (!cheapest || cheapest.id === item.productId) return item

    const newTotalPrice = Math.round(cheapest.price * item.quantity * 100) / 100
    const saving = Math.round((item.totalPrice - newTotalPrice) * 100) / 100
    if (saving <= 0) return item

    notes.push(`Swapped ${currentProduct.name} (${currentProduct.brand}) for ${cheapest.brand} to save ${saving.toFixed(2)}.`)
    return {
      ...item,
      productId: cheapest.id,
      unitPrice: cheapest.price,
      totalPrice: newTotalPrice,
      substitutionNote: `Swapped ${currentProduct.brand} for ${cheapest.brand} — save ${saving.toFixed(2)}, same dietary requirements.`,
    }
  })

  const estimatedTotal = Math.round(items.reduce((sum, item) => sum + item.totalPrice, 0) * 100) / 100
  return { items, estimatedTotal, notes }
}

export interface OptimizationResult {
  items: ShoppingListItem[]
  estimatedTotal: number
  notes: string[]
}

/**
 * If the basket exceeds budget, look for cheaper same-category products
 * that still pass the allergen filter, swapping the priciest lines first.
 */
export function optimizeForBudget(
  shoppingList: ShoppingList,
  supermarket: SupermarketId,
  userAllergies: Allergen[],
  getProductById: (id: string) => Product | undefined,
): OptimizationResult {
  let items = [...shoppingList.items]
  const notes: string[] = []
  let total = shoppingList.estimatedTotal
  const overBudget = total - shoppingList.budget

  if (overBudget <= 0) {
    return { items, estimatedTotal: total, notes }
  }

  const byCostDesc = [...items].sort((a, b) => b.totalPrice - a.totalPrice)

  for (const item of byCostDesc) {
    if (total - shoppingList.budget <= 0) break
    const currentProduct = getProductById(item.productId)
    if (!currentProduct) continue

    const candidates = findCandidateProducts(item.ingredientName, item.category, supermarket).filter(
      (p) => p.id !== item.productId && isProductSafe(p, userAllergies),
    )
    const cheaper = candidates
      .filter((p) => p.price / Math.max(p.unitQuantity, 1) < currentProduct.price / Math.max(currentProduct.unitQuantity, 1))
      .sort((a, b) => a.price - b.price)[0]

    if (!cheaper) continue

    const newTotalPrice = Math.round(cheaper.price * item.quantity * 100) / 100
    const saving = Math.round((item.totalPrice - newTotalPrice) * 100) / 100
    if (saving <= 0) continue

    items = items.map((i) =>
      i.id === item.id
        ? {
            ...i,
            productId: cheaper.id,
            unitPrice: cheaper.price,
            totalPrice: newTotalPrice,
            substitutionNote: `Swapped ${currentProduct.brand} for ${cheaper.brand} — save ${saving.toFixed(2)}, same dietary requirements.`,
          }
        : i,
    )
    notes.push(`Swapped ${currentProduct.name} (${currentProduct.brand}) for ${cheaper.brand} to save ${saving.toFixed(2)}.`)
    total = Math.round((total - saving) * 100) / 100
  }

  return { items, estimatedTotal: total, notes }
}
