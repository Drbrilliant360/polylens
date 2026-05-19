import { useState } from 'react'
import { useAssessment } from '../lib/useAssessment'
import { defaultAssessment } from '../lib/data'
import { Badge } from '../components/ui/Badge'
import { cn } from '../lib/cn'
import { AlertTriangle, Filter } from 'lucide-react'

const severityOrder = { Critical: 0, Moderate: 1, Minor: 2 }

export default function GapAnalysis() {
  const { assessment, loading } = useAssessment()
  const { gaps, country } = assessment || defaultAssessment
  const [filterDimension, setFilterDimension] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')

  if (loading) return <div className="flex items-center justify-center h-64 text-sm text-slate-500">Loading gap analysis...</div>

  const dimensions = [...new Set(gaps.map(g => g.dimension))]
  const severities = [...new Set(gaps.map(g => g.severity))]

  const filteredGaps = gaps.filter(g => {
    if (filterDimension !== 'all' && g.dimension !== filterDimension) return false
    if (filterSeverity !== 'all' && g.severity !== filterSeverity) return false
    return true
  }).sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  const criticalCount = gaps.filter(g => g.severity === 'Critical').length
  const moderateCount = gaps.filter(g => g.severity === 'Moderate').length
  const minorCount = gaps.filter(g => g.severity === 'Minor').length
  const totalGaps = gaps.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Gap Analysis</h2>
        <p className="text-sm text-slate-500 mt-1">{country} — Policy Gap Register against ITU AI Readiness Framework 2.0</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Critical', count: criticalCount, color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
          { label: 'Moderate', count: moderateCount, color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50' },
          { label: 'Minor', count: minorCount, color: 'bg-slate-400', textColor: 'text-slate-600', bgColor: 'bg-slate-50' },
        ].map(severity => (
          <div key={severity.label} className={cn('rounded-xl border p-5', severity.bgColor, 'border-transparent')}>
            <div className="flex items-center gap-3">
              <div className={cn('w-3 h-3 rounded-full', severity.color)} />
              <span className={cn('text-sm font-semibold', severity.textColor)}>{severity.label}</span>
            </div>
            <p className={cn('text-3xl font-bold mt-2', severity.textColor)}>{severity.count}</p>
            <p className="text-xs text-slate-500 mt-1">{totalGaps > 0 ? `${Math.round(severity.count / totalGaps * 100)}% of total` : 'No gaps'}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Severity Heat Map</h3>
        <div className="space-y-3">
          {(['Critical', 'Moderate', 'Minor'] as const).map(severity => {
            const items = gaps.filter(g => g.severity === severity)
            const barWidth = severity === 'Critical' ? 100 : severity === 'Moderate' ? 66 : 33
            return (
              <div key={severity} className="flex items-center gap-4">
                <span className={cn(
                  'text-xs font-semibold w-16 flex-shrink-0',
                  severity === 'Critical' ? 'text-red-600' : severity === 'Moderate' ? 'text-amber-600' : 'text-slate-500'
                )}>
                  {severity}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div className={cn(
                    'h-2 rounded-full transition-all',
                    severity === 'Critical' ? 'bg-red-500' : severity === 'Moderate' ? 'bg-amber-500' : 'bg-slate-400'
                  )} style={{ width: `${barWidth}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-6 text-right">{items.length}</span>
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {gaps.map((item) => (
            <span key={item.id} className={cn(
              'text-xs px-2 py-1 rounded-md border',
              item.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
              item.severity === 'Moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-slate-50 text-slate-600 border-slate-200'
            )}>
              {item.description.length > 50 ? item.description.slice(0, 50) + '...' : item.description}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-policy-300"
            value={filterDimension}
            onChange={e => setFilterDimension(e.target.value)}
          >
            <option value="all">All Dimensions</option>
            {dimensions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <select
          className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-policy-300"
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value)}
        >
          <option value="all">All Severities</option>
          {severities.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-slate-400 self-center ml-auto">
          Showing {filteredGaps.length} of {gaps.length} gaps
        </span>
      </div>

      <div className="space-y-3">
        {filteredGaps.map((gap) => (
          <div key={gap.id} className={cn(
            'bg-white rounded-xl border p-5 transition-shadow hover:shadow-md',
            gap.severity === 'Critical' ? 'border-l-4 border-l-red-500' :
            gap.severity === 'Moderate' ? 'border-l-4 border-l-amber-500' :
            'border-l-4 border-l-slate-300'
          )}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-semibold text-slate-400">#{typeof gap.id === 'string' ? gap.id.slice(0, 8) : gap.id}</span>
                  <Badge variant={gap.severity}>{gap.severity}</Badge>
                  <Badge>{gap.dimension}</Badge>
                </div>
                <p className="text-sm font-medium text-slate-900">{gap.description}</p>
                <p className="text-xs text-slate-400 mt-1">{gap.indicator}</p>
              </div>
              <AlertTriangle className={cn(
                'w-5 h-5 flex-shrink-0',
                gap.severity === 'Critical' ? 'text-red-500' :
                gap.severity === 'Moderate' ? 'text-amber-500' : 'text-slate-400'
              )} />
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Recommendation:</span> {gap.recommendation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
