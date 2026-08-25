import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Meal, MealType } from '@/types'

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

export function MealSlotCard({
  type,
  meal,
  onClick,
  compact = false,
}: {
  type: MealType
  meal: Meal
  onClick: () => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-all hover:border-brand-200 hover:shadow-md"
    >
      <img
        src={meal.imageUrl}
        alt={meal.name}
        className={cn('shrink-0 rounded-xl object-cover', compact ? 'h-14 w-14' : 'h-16 w-16')}
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          {MEAL_TYPE_LABELS[type]}
        </p>
        <p className="truncate font-display text-sm font-semibold text-foreground">{meal.name}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{meal.macros.calories} kcal</span>
          <span>{meal.macros.protein}g protein</span>
          {!compact && (
            <span className="hidden items-center gap-1 sm:flex">
              <Clock className="h-3 w-3" />
              {meal.prepTimeMinutes}m
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
