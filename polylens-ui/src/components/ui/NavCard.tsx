import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'

export function NavCard({
  to,
  icon: Icon,
  title,
  description,
  accent = 'policy',
}: {
  to: string
  icon: LucideIcon
  title: string
  description: string
  accent?: 'policy' | 'accent'
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white',
        'transition-all duration-200 ease-out',
        'hover:shadow-md hover:border-policy-200 hover:-translate-y-0.5',
        'active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-policy-400 focus-visible:ring-offset-2'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
          accent === 'policy'
            ? 'bg-policy-100 text-policy-600 group-hover:bg-policy-600 group-hover:text-white'
            : 'bg-accent-100 text-accent-700 group-hover:bg-accent-600 group-hover:text-white'
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 group-hover:text-policy-700 transition-colors">
          {title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-policy-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
    </Link>
  )
}
