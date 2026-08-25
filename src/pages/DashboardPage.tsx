import { Beef, Flame, PiggyBank, ShoppingBasket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePlan } from '@/contexts/PlanContext'
import { useAuth } from '@/contexts/AuthContext'
import { getDayMacros } from '@/services/mealPlanService'
import { formatCurrencyGBP } from '@/lib/utils'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { ChangeRequestInput } from '@/components/dashboard/ChangeRequestInput'
import { WeeklyPlanView } from '@/components/meal/WeeklyPlanView'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { profile, targets, plan, shoppingList } = usePlan()

  if (!profile || !targets || !plan) {
    return (
      <EmptyState />
    )
  }

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const todayMacros = getDayMacros(plan, todayIndex)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          {getGreeting()}, {user?.fullName?.split(' ')[0] || 'there'}
        </h1>
        <p className="mt-1 text-muted-foreground">Here's your plan for this week.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <SummaryCard icon={Flame} label="Daily calories" value={`${todayMacros.calories || targets.calories}`} suffix="kcal" tone="brand" />
        <SummaryCard icon={Beef} label="Daily protein" value={`${todayMacros.protein || targets.protein}`} suffix="g" />
        <SummaryCard icon={PiggyBank} label="Weekly budget" value={formatCurrencyGBP(profile.weeklyBudget)} />
        <SummaryCard
          icon={ShoppingBasket}
          label="Estimated shop"
          value={formatCurrencyGBP(shoppingList?.estimatedTotal ?? 0)}
        />
      </div>

      <ChangeRequestInput />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">This Week</h2>
          <Link to="/meals">
            <Button variant="ghost" size="sm">
              View full plan
            </Button>
          </Link>
        </div>
        <WeeklyPlanView plan={plan} />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center gap-3 p-12 text-center">
      <p className="font-display text-lg font-semibold text-foreground">Setting up your plan…</p>
      <p className="text-sm text-muted-foreground">This should just take a moment.</p>
    </Card>
  )
}
