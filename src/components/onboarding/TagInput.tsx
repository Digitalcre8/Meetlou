import * as React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = React.useState('')

  function commit() {
    const cleaned = draft.trim()
    if (cleaned && !value.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      onChange([...value, cleaned])
    }
    setDraft('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-input bg-card p-2.5">
        {value.map((tag) => (
          <Badge key={tag} variant="default" className="gap-1 py-1 pl-3 pr-1.5">
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="rounded-full p-0.5 hover:bg-brand-200"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={value.length === 0 ? placeholder : 'Add another…'}
          className="min-w-32 flex-1 border-none bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">Press Enter or comma to add</p>
    </div>
  )
}
