import { Minus, Plus, TriangleAlert } from 'lucide-react'
import { formatCurrencyGBP } from '@/lib/utils'
import { usePlan } from '@/contexts/PlanContext'
import type { Product, ShoppingListItem } from '@/types'

export function ProductCard({ item, product }: { item: ShoppingListItem; product: Product }) {
  const { updateShoppingItemQuantity } = usePlan()

  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-3">
      <img src={product.imageUrl} alt={product.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{product.brand}</p>
          <p className="truncate font-display text-sm font-semibold text-foreground">{product.name}</p>
          <p className="text-xs text-muted-foreground">{product.size}</p>
          {(product.macros.calories > 0 || product.macros.protein > 0) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {product.macros.calories} kcal &middot; {product.macros.protein}g protein / 100
              {product.unit === 'ml' ? 'ml' : product.unit === 'each' ? ' item' : 'g'}
            </p>
          )}
          {item.substitutionNote && (
            <p className="mt-1.5 flex items-start gap-1 text-xs text-brand-700">
              <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" />
              {item.substitutionNote}
            </p>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="font-display text-sm font-bold text-foreground">{formatCurrencyGBP(item.totalPrice)}</p>
          <div className="flex items-center gap-1 rounded-full border border-border">
            <button
              type="button"
              onClick={() => updateShoppingItemQuantity(item.id, item.quantity - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateShoppingItemQuantity(item.id, item.quantity + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
