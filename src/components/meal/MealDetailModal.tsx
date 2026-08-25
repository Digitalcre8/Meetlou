import * as React from 'react'
import { Clock, Flame, RefreshCw, Trash2, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatIngredientLine } from '@/services/recipeService'
import { usePlan } from '@/contexts/PlanContext'
import { useToast } from '@/components/ui/toast'
import type { Meal, MealType } from '@/types'

interface MealDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meal: Meal | null
  slotId: string | null
  type: MealType | null
}

export function MealDetailModal({ open, onOpenChange, meal, slotId, type }: MealDetailModalProps) {
  const { swapMeal, removeMeal, getAlternativesFor } = usePlan()
  const { toast } = useToast()
  const [showAlternatives, setShowAlternatives] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    if (!open) setShowAlternatives(false)
  }, [open])

  if (!meal || !slotId || !type) return null

  const alternatives = showAlternatives ? getAlternativesFor(type, meal.id) : []

  async function handleSwap(newMealId: string) {
    if (!slotId) return
    setBusy(true)
    try {
      await swapMeal(slotId, newMealId)
      toast({ title: 'Meal swapped', description: 'Your shopping list has been updated.' })
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove() {
    if (!slotId) return
    setBusy(true)
    try {
      await removeMeal(slotId)
      toast({ title: 'Meal removed', description: 'Your shopping list has been updated.' })
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <img src={meal.imageUrl} alt={meal.name} className="h-56 w-full rounded-t-2xl object-cover" />
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>{meal.name}</DialogTitle>
            <DialogDescription>{meal.description}</DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-wrap gap-2">
            {meal.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Calories" value={`${meal.macros.calories}`} suffix="kcal" icon={Flame} />
            <Stat label="Protein" value={`${meal.macros.protein}g`} />
            <Stat label="Carbs" value={`${meal.macros.carbs}g`} />
            <Stat label="Fat" value={`${meal.macros.fat}g`} />
          </div>

          <div className="mt-5 flex items-center gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {meal.recipe.prepTimeMinutes + meal.recipe.cookTimeMinutes} min total
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> Serves {meal.recipe.servings}
            </span>
          </div>

          <Separator className="my-5" />

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground">Ingredients</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {meal.recipe.ingredients.map((ing) => (
                  <li key={ing.name} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                    {formatIngredientLine(ing)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground">Method</h3>
              <ol className="mt-2 space-y-2 text-sm text-muted-foreground">
                {meal.recipe.method.map((step, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {meal.allergens.length > 0 && (
            <p className="mt-5 text-xs text-muted-foreground">
              Contains: {meal.allergens.join(', ')}. Always check product packaging before consumption.
            </p>
          )}

          <Separator className="my-5" />

          {!showAlternatives ? (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setShowAlternatives(true)} disabled={busy}>
                <RefreshCw className="h-4 w-4" /> Swap Meal
              </Button>
              <Button variant="outline" onClick={handleRemove} disabled={busy}>
                <Trash2 className="h-4 w-4" /> Remove Meal
              </Button>
            </div>
          ) : (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">
                {alternatives.length > 0
                  ? `Here are ${alternatives.length} alternatives:`
                  : "We couldn't find safe alternatives right now."}
              </p>
              <div className="space-y-2">
                {alternatives.map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() => handleSwap(alt.id)}
                    disabled={busy}
                    className="flex w-full items-center gap-3 rounded-xl border border-border p-2.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50"
                  >
                    <img src={alt.imageUrl} alt={alt.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{alt.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {alt.macros.calories} kcal &middot; {alt.macros.protein}g protein
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => setShowAlternatives(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Stat({
  label,
  value,
  suffix,
  icon: Icon,
}: {
  label: string
  value: string
  suffix?: string
  icon?: typeof Flame
}) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className="mt-0.5 font-display text-lg font-bold text-foreground">
        {value} {suffix && <span className="text-xs font-normal text-muted-foreground">{suffix}</span>}
      </p>
    </div>
  )
}
