import * as React from 'react'
import { Carrot, Cookie, CupSoda, Egg, Package, Snowflake, Wheat, Beef, ShieldAlert } from 'lucide-react'
import { usePlan } from '@/contexts/PlanContext'
import { ALLERGEN_DISCLAIMER } from '@/services/allergenService'
import { BudgetSummary } from '@/components/shopping/BudgetSummary'
import { ProductCard } from '@/components/shopping/ProductCard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import type { ProductCategory } from '@/types'

const CATEGORY_META: Record<ProductCategory, { label: string; icon: typeof Carrot }> = {
  produce: { label: 'Produce', icon: Carrot },
  meat_fish: { label: 'Meat & Fish', icon: Beef },
  dairy_eggs: { label: 'Dairy & Eggs', icon: Egg },
  carbohydrates: { label: 'Carbohydrates', icon: Wheat },
  frozen: { label: 'Frozen', icon: Snowflake },
  cupboard: { label: 'Cupboard', icon: Package },
  snacks: { label: 'Snacks', icon: Cookie },
  drinks: { label: 'Drinks', icon: CupSoda },
}

const CATEGORY_ORDER: ProductCategory[] = [
  'produce',
  'meat_fish',
  'dairy_eggs',
  'carbohydrates',
  'frozen',
  'cupboard',
  'snacks',
  'drinks',
]

export default function ShoppingPage() {
  const { profile, shoppingList, getProductById, submitChangeRequest } = usePlan()
  const { toast } = useToast()
  const [optimizing, setOptimizing] = React.useState(false)

  async function handleMakeCheaper() {
    setOptimizing(true)
    try {
      const message = await submitChangeRequest("make this week's shop cheaper")
      toast({ title: 'Basket optimised', description: message })
    } finally {
      setOptimizing(false)
    }
  }

  if (!profile || !shoppingList) {
    return (
      <Card className="p-12 text-center">
        <p className="font-display text-lg font-semibold text-foreground">Your shopping list is loading…</p>
      </Card>
    )
  }

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: shoppingList.items.filter((item) => item.category === category),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Your Weekly Shop</h1>
          <p className="mt-1 text-muted-foreground">
            {shoppingList.items.length} items, consolidated from your meal plan.
          </p>
        </div>
        <Button variant="outline" onClick={handleMakeCheaper} disabled={optimizing}>
          {optimizing ? 'Optimising…' : 'Make It Cheaper'}
        </Button>
      </div>

      <BudgetSummary
        supermarket={shoppingList.supermarket}
        estimatedTotal={shoppingList.estimatedTotal}
        budget={shoppingList.budget}
      />

      {grouped.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="font-display text-lg font-semibold text-foreground">Your basket is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">Add meals to your plan to build a shopping list.</p>
        </Card>
      ) : (
        grouped.map(({ category, items }) => {
          const meta = CATEGORY_META[category]
          return (
            <div key={category}>
              <div className="mb-3 flex items-center gap-2">
                <meta.icon className="h-4 w-4 text-brand-600" />
                <h2 className="font-display text-base font-bold text-foreground">{meta.label}</h2>
                <span className="text-sm text-muted-foreground">({items.length})</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                  const product = getProductById(item.productId)
                  if (!product) return null
                  return <ProductCard key={item.id} item={item} product={product} />
                })}
              </div>
            </div>
          )
        })
      )}

      <Card className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        {ALLERGEN_DISCLAIMER}
      </Card>
    </div>
  )
}
