// Supermarket adapter interface. The MVP only ships a seeded-catalogue
// implementation, but every adapter conforms to this contract so a real
// integration (live prices, stock, checkout) can be dropped in later without
// touching the product matching / basket services above.

import { getProductsForSupermarket } from '@/data/seed/products'
import type { Product, SupermarketId } from '@/types'

export interface SupermarketAdapter {
  id: SupermarketId
  getCatalogue(): Promise<Product[]>
  getProduct(productId: string): Promise<Product | undefined>
  /** Phase 3: not implemented in the MVP. */
  checkAvailability?(productId: string): Promise<boolean>
  /** Phase 3: not implemented in the MVP. */
  createBasket?(items: { productId: string; quantity: number }[]): Promise<{ basketUrl: string }>
}

/** Seeded, read-only adapter used for every chain in the MVP. */
class SeededCatalogueAdapter implements SupermarketAdapter {
  id: SupermarketId

  constructor(id: SupermarketId) {
    this.id = id
  }

  async getCatalogue(): Promise<Product[]> {
    return getProductsForSupermarket(this.id)
  }

  async getProduct(productId: string): Promise<Product | undefined> {
    return getProductsForSupermarket(this.id).find((p) => p.id === productId)
  }
}

// Named exports so a future PR can swap any one of these for a real
// integration (e.g. `export class TescoAdapter implements SupermarketAdapter { ... }`)
// without changing how callers obtain an adapter.
export class TescoAdapter extends SeededCatalogueAdapter {
  constructor() {
    super('tesco')
  }
}
export class SainsburysAdapter extends SeededCatalogueAdapter {
  constructor() {
    super('sainsburys')
  }
}
export class AsdaAdapter extends SeededCatalogueAdapter {
  constructor() {
    super('asda')
  }
}
export class MorrisonsAdapter extends SeededCatalogueAdapter {
  constructor() {
    super('morrisons')
  }
}
export class WaitroseAdapter extends SeededCatalogueAdapter {
  constructor() {
    super('waitrose')
  }
}
export class OcadoAdapter extends SeededCatalogueAdapter {
  constructor() {
    super('ocado')
  }
}
export class AldiAdapter extends SeededCatalogueAdapter {
  constructor() {
    super('aldi')
  }
}
export class LidlAdapter extends SeededCatalogueAdapter {
  constructor() {
    super('lidl')
  }
}
export class IcelandAdapter extends SeededCatalogueAdapter {
  constructor() {
    super('iceland')
  }
}
export class CoopAdapter extends SeededCatalogueAdapter {
  constructor() {
    super('coop')
  }
}

const ADAPTERS: Record<SupermarketId, SupermarketAdapter> = {
  tesco: new TescoAdapter(),
  sainsburys: new SainsburysAdapter(),
  asda: new AsdaAdapter(),
  morrisons: new MorrisonsAdapter(),
  waitrose: new WaitroseAdapter(),
  ocado: new OcadoAdapter(),
  aldi: new AldiAdapter(),
  lidl: new LidlAdapter(),
  iceland: new IcelandAdapter(),
  coop: new CoopAdapter(),
}

export function getSupermarketAdapter(id: SupermarketId): SupermarketAdapter {
  return ADAPTERS[id]
}
