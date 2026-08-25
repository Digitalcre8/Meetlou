import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

export function StepProgress({
  step,
  totalSteps,
  label,
}: {
  step: number
  totalSteps: number
  label: string
}) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className={cn('text-muted-foreground')}>
          Step {step} of {totalSteps}
        </span>
      </div>
      <Progress value={(step / totalSteps) * 100} />
    </div>
  )
}
