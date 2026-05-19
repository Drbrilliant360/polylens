import { cn } from '../../lib/cn'

export function ProgressBar({ value, size = 'md', showLabel = true, className }: {
  value: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}) {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

  const getColor = (v: number) => {
    if (v < 26) return 'bg-red-500'
    if (v < 51) return 'bg-amber-500'
    if (v < 76) return 'bg-emerald-500'
    return 'bg-blue-600'
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex-1 rounded-full bg-slate-200 overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', getColor(value))}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-slate-700 min-w-[3ch] text-right tabular-nums">
          {value}
        </span>
      )}
    </div>
  )
}
