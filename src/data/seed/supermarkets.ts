import type { SupermarketId } from '@/types'

export interface SupermarketMeta {
  id: SupermarketId
  name: string
  shortName: string
  /** Price multiplier applied to the base catalogue price to give each chain a distinct feel. */
  priceMultiplier: number
  color: string
  textColor: string
}

export const SUPERMARKETS: SupermarketMeta[] = [
  { id: 'tesco', name: 'Tesco', shortName: 'Tesco', priceMultiplier: 1.0, color: '#00539f', textColor: '#ffffff' },
  { id: 'sainsburys', name: "Sainsbury's", shortName: "Sainsbury's", priceMultiplier: 1.03, color: '#f06c00', textColor: '#ffffff' },
  { id: 'asda', name: 'ASDA', shortName: 'ASDA', priceMultiplier: 0.92, color: '#78be20', textColor: '#0d2f4f' },
  { id: 'morrisons', name: 'Morrisons', shortName: 'Morrisons', priceMultiplier: 0.96, color: '#f2c500', textColor: '#00542f' },
  { id: 'waitrose', name: 'Waitrose', shortName: 'Waitrose', priceMultiplier: 1.28, color: '#4b7738', textColor: '#ffffff' },
  { id: 'ocado', name: 'Ocado', shortName: 'Ocado', priceMultiplier: 1.22, color: '#8dc63f', textColor: '#1b1b1b' },
  { id: 'aldi', name: 'Aldi', shortName: 'Aldi', priceMultiplier: 0.78, color: '#00529b', textColor: '#ffffff' },
  { id: 'lidl', name: 'Lidl', shortName: 'Lidl', priceMultiplier: 0.76, color: '#0050aa', textColor: '#ffff00' },
  { id: 'iceland', name: 'Iceland', shortName: 'Iceland', priceMultiplier: 0.88, color: '#dc0032', textColor: '#ffffff' },
  { id: 'coop', name: 'Co-op', shortName: 'Co-op', priceMultiplier: 1.05, color: '#00b1e7', textColor: '#00224f' },
]

export function getSupermarket(id: SupermarketId): SupermarketMeta {
  const found = SUPERMARKETS.find((s) => s.id === id)
  if (!found) throw new Error(`Unknown supermarket: ${id}`)
  return found
}
