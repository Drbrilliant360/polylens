import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, padding = 'md', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white rounded-xl border border-slate-200',
        padding === 'sm' && 'p-4',
        padding === 'md' && 'p-5',
        padding === 'lg' && 'p-6',
        hover &&
          'transition-all duration-200 ease-out hover:shadow-lg hover:border-policy-200 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Card.displayName = 'Card'
