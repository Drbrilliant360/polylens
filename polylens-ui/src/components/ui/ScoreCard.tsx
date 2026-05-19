import { Badge } from './Badge'
import { ProgressBar } from './ProgressBar'
import { Card } from './Card'
import type { DimensionScore } from '../../lib/types'
import { cn } from '../../lib/cn'

export function ScoreCard({ dimension, className }: { dimension: DimensionScore; className?: string }) {
  return (
    <Card hover className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-slate-900 leading-snug">{dimension.name}</h3>
        <Badge variant={dimension.level}>{dimension.level}</Badge>
      </div>
      <ProgressBar value={dimension.score} />
      <p className="mt-3 text-xs text-slate-500 leading-relaxed line-clamp-3">{dimension.keyFinding}</p>
    </Card>
  )
}
