import type { LucideIcon } from 'lucide-react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SelectableCard({
  label,
  description,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string
  description?: string
  icon?: LucideIcon
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'relative flex w-full flex-col items-start gap-1.5 rounded-2xl border-2 p-5 text-left transition-all hover:shadow-md',
        selected
          ? 'border-primary bg-brand-50 shadow-sm'
          : 'border-border bg-card hover:border-brand-200',
      )}
    >
      {selected && (
        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}
      {Icon && (
        <span
          className={cn(
            'mb-1 flex h-10 w-10 items-center justify-center rounded-xl',
            selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      )}
      <span className="font-semibold text-foreground">{label}</span>
      {description && <span className="text-sm text-muted-foreground">{description}</span>}
    </button>
  )
}
