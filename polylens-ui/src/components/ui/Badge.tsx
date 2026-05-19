import { cn } from '../../lib/cn'
import type { ReadinessLevel, Severity } from '../../lib/types'

export function Badge({ children, variant = 'default', className }: {
  children: React.ReactNode
  variant?: ReadinessLevel | Severity | 'default'
  className?: string
}) {
  const styles: Record<string, string> = {
    Nascent: 'bg-red-100 text-red-700 border-red-200',
    Developing: 'bg-amber-100 text-amber-700 border-amber-200',
    Emerging: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Advanced: 'bg-blue-100 text-blue-700 border-blue-200',
    Critical: 'bg-red-100 text-red-700 border-red-200',
    Moderate: 'bg-amber-100 text-amber-700 border-amber-200',
    Minor: 'bg-slate-100 text-slate-600 border-slate-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  }

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', styles[variant] || styles.default, className)}>
      {children}
    </span>
  )
}
