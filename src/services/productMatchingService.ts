// Product matching engine — turns a recipe ingredient into a real seeded
// product from the chosen supermarket's catalogue. Deterministic and
// allergy-safe by construction (it only ever returns products that pass the
// allergen filter). Designed so a future live-catalogue integration can
// replace `findCandidateProducts` without touching callers.

import { isProductSafe } from '@/services/allergenService'
import { PRODUCTS } from '@/data/seed/products'
import type { Allergen, Ingredient, Product, SupermarketId } from '@/types'

/** Average single-item weight (g) for ingredients expressed as "each" but matched to a by-weight product. */
const AVERAGE_EACH_WEIGHT_G: Record<string, number> = {
  onion: 150,
  carrots: 70,
  carrot: 70,
  potato: 180,
  potatoes: 180,
}

const SLICE_WEIGHT_G = 40

function normalize(name: string): string {
  return name.trim().toLowerCase()
}

/** Converts an ingredient quantity into the unit used by the candidate product's pack. */
function toProductUnitQuantity(ingredient: Ingredient, product: Product): number {
  if (ingredient.unit === product.unit) return ingredient.quantity

  if (ingredient.unit === 'slices' && product.unit === 'g') {
    return ingredient.quantity * SLICE_WEIGHT_G
  }

  if (ingredient.unit === 'each' && product.unit === 'g') {
    const perItem = AVERAGE_EACH_WEIGHT_G[normalize(ingredient.name)] ?? 100
    return ingredient.quantity * perItem
  }

  if (ingredient.unit === 'g' && product.unit === 'ml') return ingredient.quantity
  if (ingredient.unit === 'ml' && product.unit === 'g') return ingredient.quantity

  // Unknown conversion — assume 1:1 as a best-effort fallback.
  return ingredient.quantity
}

export function findCandidateProducts(
  ingredientName: string,
  category: Ingredient['category'],
  supermarket: SupermarketId,
): Product[] {
  const target = normalize(ingredientName)
  const inCategory = PRODUCTS.filter(
    (p) => p.supermarket === supermarket && p.available,
  )

  const exact = inCategory.filter((p) => p.ingredientTags.some((tag) => normalize(tag) === target))
  if (exact.length > 0) return exact

  const partial = inCategory.filter((p) =>
    p.ingredientTags.some((tag) => target.includes(normalize(tag)) || normalize(tag).includes(target)),
  )
  if (partial.length > 0) return partial

  // Last resort: same category, so the basket still has *something* useful.
  return inCategory.filter((p) => p.category === category)
}

function pricePerBaseUnit(product: Product): number {
  return product.price / Math.max(product.unitQuantity, 1)
}

export interface ProductMatch {
  product: Product
  packs: number
  totalPrice: number
  substitutionNote?: string
}

export function matchIngredientToProduct(
  ingredient: Ingredient,
  supermarket: SupermarketId,
  userAllergies: Allergen[],
): ProductMatch | null {
  const candidates = findCandidateProducts(ingredient.name, ingredient.category, supermarket)
  const safeCandidates = candidates.filter((p) => isProductSafe(p, userAllergies))

  if (safeCandidates.length === 0) return null

  const sortedByValue = [...safeCandidates].sort((a, b) => pricePerBaseUnit(a) - pricePerBaseUnit(b))
  const selected = sortedByValue[0]
  const requiredQuantity = toProductUnitQuantity(ingredient, selected)
  const packs = Math.max(1, Math.ceil(requiredQuantity / selected.unitQuantity))
  const totalPrice = Math.round(selected.price * packs * 100) / 100

  let substitutionNote: string | undefined
  const nextBest = sortedByValue.find((p) => p.id !== selected.id)
  if (nextBest) {
    const savingVsNext = Math.round((nextBest.price * packs - totalPrice) * 100) / 100
    if (savingVsNext > 0) {
      substitutionNote = `Chose ${selected.brand} over ${nextBest.brand} — save ${savingVsNext.toFixed(2)} on this item, same category and allergy-safe.`
    }
  } else if (!selected.ingredientTags.some((t) => normalize(t) === normalize(ingredient.name))) {
    substitutionNote = `No exact match for "${ingredient.name}" — substituted with the closest suitable product in this category.`
  }

  return { product: selected, packs, totalPrice, substitutionNote }
}
