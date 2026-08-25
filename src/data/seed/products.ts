import { getPlaceholderImage } from '@/lib/placeholderImage'
import type { Product } from '@/types'
import { BASE_PRODUCTS } from './baseProducts'
import { SUPERMARKETS } from './supermarkets'

/** Small deterministic hash so price jitter/availability are stable across reloads. */
function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function jitteredPrice(base: number, multiplier: number, seed: string): number {
  const jitter = 0.94 + (hash(seed) % 13) / 100 // +/- ~6%
  const price = base * multiplier * jitter
  return Math.round(price * 100) / 100
}

function generateProducts(): Product[] {
  const products: Product[] = []
  for (const supermarket of SUPERMARKETS) {
    for (const base of BASE_PRODUCTS) {
      const id = `${supermarket.id}-${base.slug}`
      const brand = base.brand === 'OWN_BRAND' ? supermarket.shortName : base.brand
      const unavailable = hash(id) % 23 === 0
      products.push({
        id,
        supermarket: supermarket.id,
        name: base.name,
        brand,
        category: base.category,
        size: base.size,
        unitQuantity: base.unitQuantity,
        unit: base.unit,
        price: jitteredPrice(base.basePrice, supermarket.priceMultiplier, id),
        macros: base.macros,
        ingredientTags: base.ingredientTags,
        allergens: base.allergens,
        imageUrl: getPlaceholderImage(base.name, 400),
        available: !unavailable,
      })
    }
  }
  return products
}

export const PRODUCTS: Product[] = generateProducts()

export function getProductsForSupermarket(supermarket: string): Product[] {
  return PRODUCTS.filter((p) => p.supermarket === supermarket)
}
