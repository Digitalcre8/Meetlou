import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatCurrencyGBP, cn } from '@/lib/utils'
import { getSupermarket } from '@/data/seed/supermarkets'
import type { SupermarketId } from '@/types'

export function BudgetSummary({
  supermarket,
  estimatedTotal,
  budget,
}: {
  supermarket: SupermarketId
  estimatedTotal: number
  budget: number
}) {
  const remaining = Math.round((budget - estimatedTotal) * 100) / 100
  const percent = budget > 0 ? (estimatedTotal / budget) * 100 : 0
  const over = remaining < 0
  const meta = getSupermarket(supermarket)

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: meta.color, color: meta.textColor }}
          >
            {meta.shortName.slice(0, 2)}
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Supermarket</p>
            <p className="font-display font-semibold text-foreground">{meta.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Estimated total</p>
          <p className="font-display text-2xl font-bold text-foreground">{formatCurrencyGBP(estimatedTotal)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Budget</p>
          <p className="font-display text-lg font-semibold text-foreground">{formatCurrencyGBP(budget)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className={cn('font-display text-lg font-semibold', over ? 'text-destructive' : 'text-primary')}>
            {over ? '-' : ''}
            {formatCurrencyGBP(Math.abs(remaining))}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Progress
          value={Math.min(percent, 100)}
          indicatorClassName={over ? 'bg-destructive' : undefined}
        />
        {over && (
          <p className="mt-2 text-xs font-medium text-destructive">
            You're {formatCurrencyGBP(Math.abs(remaining))} over budget. Try "Make it cheaper" below.
          </p>
        )}
      </div>
    </Card>
  )
}
