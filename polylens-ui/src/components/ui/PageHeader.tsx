import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function PageHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1 truncate">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
