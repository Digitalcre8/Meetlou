import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function SummaryCard({
  icon: Icon,
  label,
  value,
  suffix,
  tone = 'default',
}: {
  icon: LucideIcon
  label: string
  value: string
  suffix?: string
  tone?: 'default' | 'brand'
}) {
  return (
    <Card className="p-5">
      <div
        className={cn(
          'mb-3 flex h-10 w-10 items-center justify-center rounded-xl',
          tone === 'brand' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-foreground">
        {value}
        {suffix && <span className="ml-1 text-sm font-medium text-muted-foreground">{suffix}</span>}
      </p>
    </Card>
  )
}
