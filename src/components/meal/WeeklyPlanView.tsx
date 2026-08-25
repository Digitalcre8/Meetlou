import * as React from 'react'
import { getMealById, getSlotsForDay } from '@/services/mealPlanService'
import { formatDayLabel } from '@/lib/utils'
import { MealSlotCard } from '@/components/meal/MealSlotCard'
import { MealDetailModal } from '@/components/meal/MealDetailModal'
import { Card } from '@/components/ui/card'
import type { MealPlan, MealType } from '@/types'

const TYPE_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export function WeeklyPlanView({ plan, days = [0, 1, 2, 3, 4, 5, 6] }: { plan: MealPlan; days?: number[] }) {
  const [selection, setSelection] = React.useState<{ slotId: string; type: MealType; mealId: string } | null>(
    null,
  )

  const selectedMeal = selection ? getMealById(selection.mealId) ?? null : null

  return (
    <>
      <div className="space-y-4">
        {days.map((day) => {
          const slots = getSlotsForDay(plan, day)
          if (slots.length === 0) return null
          return (
            <Card key={day} className="p-4 sm:p-5">
              <h3 className="mb-3 font-display text-base font-bold text-foreground">{formatDayLabel(day)}</h3>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {TYPE_ORDER.map((type) => {
                  const slot = slots.find((s) => s.type === type)
                  if (!slot) return null
                  const meal = getMealById(slot.mealId)
                  if (!meal) return null
                  return (
                    <MealSlotCard
                      key={slot.id}
                      type={type}
                      meal={meal}
                      onClick={() => setSelection({ slotId: slot.id, type, mealId: meal.id })}
                    />
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>

      <MealDetailModal
        open={Boolean(selection)}
        onOpenChange={(open) => !open && setSelection(null)}
        meal={selectedMeal}
        slotId={selection?.slotId ?? null}
        type={selection?.type ?? null}
      />
    </>
  )
}
