import { RefreshCw } from 'lucide-react'
import * as React from 'react'
import { usePlan } from '@/contexts/PlanContext'
import { WeeklyPlanView } from '@/components/meal/WeeklyPlanView'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'

export default function MealPlanPage() {
  const { plan, regeneratePlan, generating } = usePlan()
  const { toast } = useToast()
  const [confirming, setConfirming] = React.useState(false)

  async function handleRegenerate() {
    await regeneratePlan()
    setConfirming(false)
    toast({ title: 'Plan regenerated', description: 'Your meal plan and shopping list are up to date.' })
  }

  if (!plan) {
    return (
      <Card className="p-12 text-center">
        <p className="font-display text-lg font-semibold text-foreground">Your plan is loading…</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Your Meal Plan</h1>
          <p className="mt-1 text-muted-foreground">Tap any meal to see the recipe, swap it, or remove it.</p>
        </div>
        {!confirming ? (
          <Button variant="outline" onClick={() => setConfirming(true)} disabled={generating}>
            <RefreshCw className="h-4 w-4" /> Regenerate Plan
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Replace your whole week?</span>
            <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleRegenerate} disabled={generating}>
              {generating ? 'Generating…' : 'Yes, regenerate'}
            </Button>
          </div>
        )}
      </div>

      <WeeklyPlanView plan={plan} />
    </div>
  )
}
