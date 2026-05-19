import { useState, useEffect } from 'react'
import { useAssessment } from '../lib/useAssessment'
import { defaultAssessment } from '../lib/data'
import { api } from '../lib/api'
import { Badge } from '../components/ui/Badge'
import { cn } from '../lib/cn'
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react'

export default function TrendMonitoring() {
  const { assessment, rawId, loading } = useAssessment()
  const data = assessment || defaultAssessment
  const { country, overallScore, dimensions } = data
  const [trendData, setTrendData] = useState<any>(null)
  const [trendLoading, setTrendLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setTrendLoading(true)
      try {
        const id = rawId || (await api.assessments.list())[0]?.id
        if (id) {
          const result = await api.trends.compare(id)
          setTrendData(result)
        }
      } catch {
      } finally {
        setTrendLoading(false)
      }
    }
    if (!loading) load()
  }, [loading, rawId])

  if (loading || trendLoading) return <div className="flex items-center justify-center h-64 text-sm text-slate-500">Loading trend data...</div>

  const previousOverall = trendData?.previous?.overallScore ?? 28
  const prevDate = trendData?.previous?.assessmentDate
    ? new Date(trendData.previous.assessmentDate).toLocaleDateString('en-US', { year: 'numeric' })
    : 'Previous'
  const currDate = trendData?.current?.assessmentDate
    ? new Date(trendData.current.assessmentDate).toLocaleDateString('en-US', { year: 'numeric' })
    : 'Current'

  const dimensionTrends = trendData?.dimensions || []
  const closedGaps = trendData?.closedGaps || []
  const newGaps = trendData?.newGaps || []

  const overallDelta = overallScore - previousOverall
  const overallTrend = overallDelta > 0 ? 'up' : overallDelta < 0 ? 'down' : 'flat'

  const trendDimensions = dimensions.map(dim => {
    const dt = dimensionTrends.find((t: any) => t.dimension === dim.name || t.dim === dim.name)
    const prev = dt?.previousScore ?? 28
    const delta = dt ? dt.delta : dim.score - prev
    const level = dt?.currentLevel || dt?.previousLevel || dim.level
    return { name: dim.name, score: dim.score, prev, delta, level, notes: trendNotes(dim.name, delta) }
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Trend Monitoring</h2>
        <p className="text-sm text-slate-500 mt-1">{country} — Re-assessment comparison ({prevDate} → {currDate})</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Progress Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 pr-4 font-semibold text-slate-500">Dimension</th>
                  <th className="text-right py-2 px-4 font-semibold text-slate-500">{prevDate}</th>
                  <th className="text-right py-2 px-4 font-semibold text-slate-500">{currDate}</th>
                  <th className="text-right py-2 px-4 font-semibold text-slate-500">Change</th>
                  <th className="text-left py-2 pl-4 font-semibold text-slate-500">Notes</th>
                </tr>
              </thead>
              <tbody>
                {trendDimensions.map(dim => (
                  <tr key={dim.name} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-800">{dim.name}</td>
                    <td className="py-3 px-4 text-right text-slate-500">{dim.prev}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800">{dim.score}</td>
                    <td className={cn('py-3 px-4 text-right font-semibold',
                      dim.delta > 0 ? 'text-emerald-600' : dim.delta < 0 ? 'text-red-600' : 'text-slate-400'
                    )}>
                      <span className="inline-flex items-center gap-1">
                        {dim.delta > 0 ? '+' : ''}{dim.delta}
                        {dim.delta > 0 ? <ArrowUp className="w-3 h-3" /> : dim.delta < 0 ? <ArrowDown className="w-3 h-3" /> : null}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-slate-500">{dim.notes}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 font-semibold">
                  <td className="py-3 pr-4 text-slate-900">OVERALL</td>
                  <td className="py-3 px-4 text-right text-slate-500">{previousOverall}</td>
                  <td className="py-3 px-4 text-right text-slate-900">{overallScore}</td>
                  <td className={cn('py-3 px-4 text-right',
                    overallDelta > 0 ? 'text-emerald-600' : overallDelta < 0 ? 'text-red-600' : 'text-slate-500'
                  )}>
                    {overallDelta > 0 ? '+' : ''}{overallDelta}
                  </td>
                  <td className="py-3 pl-4 text-slate-600">Progress across all dimensions</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overall Trend</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="text-center">
                <p className="text-xs text-slate-400">{prevDate}</p>
                <p className="text-2xl font-bold text-slate-500">{previousOverall}</p>
              </div>
              <div className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full',
                overallTrend === 'up' ? 'bg-emerald-100 text-emerald-600' :
                overallTrend === 'down' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
              )}>
                {overallTrend === 'up' ? <TrendingUp className="w-6 h-6" /> :
                 overallTrend === 'down' ? <TrendingDown className="w-6 h-6" /> :
                 <Minus className="w-6 h-6" />}
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">{currDate}</p>
                <p className="text-2xl font-bold text-slate-900">{overallScore}</p>
              </div>
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-2">{overallDelta > 0 ? '+' : ''}{overallDelta} point {overallDelta >= 0 ? 'improvement' : 'decline'}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="text-xs font-semibold text-slate-700 mb-3">Velocity Assessment</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              At the current rate of {overallDelta > 0 ? '+' : ''}{overallDelta} points, {country} would reach the next readiness level within
              approximately 3-4 years, assuming linear progress and no major policy disruptions.
              Accelerated implementation of the recommendations in this assessment could shorten these timelines.
            </p>
            <div className="mt-3 p-3 rounded-lg bg-policy-50">
              <p className="text-xs font-medium text-policy-800">Momentum: {overallDelta > 5 ? 'Accelerating' : overallDelta > 0 ? 'Steady' : 'Stalling'}</p>
              <p className="text-xs text-policy-600 mt-1">
                {country} is maintaining {overallDelta > 0 ? 'positive' : 'steady'} momentum, driven by foundational policy developments.
                The primary risk is that progress remains uneven — especially in human impact and data
                ecosystem dimensions — without deliberate acceleration.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Gaps Closed Since {prevDate}</h3>
          <div className="space-y-3">
            {closedGaps.length > 0 ? closedGaps.map((gap: any, i: number) => (
              <div key={i} className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-emerald-600 text-xs font-bold">CLOSED</span>
                  <Badge variant="default">{gap.dimension || 'General'}</Badge>
                </div>
                <p className="text-xs font-semibold text-slate-800">{gap.description || gap.title}</p>
              </div>
            )) : [
              { title: 'Personal Data Protection Act enacted', detail: 'The PDPA 2022 established foundational data governance, partially addressing the data ecosystem gap.', dim: 'Data & Model Ecosystem' },
              { title: 'AI formally recognised in ICT Policy', detail: 'The 2023 ICT Policy elevated AI from absent to a national priority technology.', dim: 'AI Policy & Strategy' },
              { title: 'Broadband strategy expanded', detail: 'Connectivity targets increased, improving infrastructure outlook.', dim: 'Digital Infrastructure' },
            ].map((closed, i) => (
              <div key={i} className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-emerald-600 text-xs font-bold">CLOSED</span>
                  <Badge variant="default">{closed.dim}</Badge>
                </div>
                <p className="text-xs font-semibold text-slate-800">{closed.title}</p>
                <p className="text-xs text-slate-600 mt-0.5">{closed.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">New Gaps Identified</h3>
          <div className="space-y-3">
            {newGaps.length > 0 ? newGaps.map((gap: any, i: number) => (
              <div key={i} className="p-3 rounded-lg bg-red-50 border border-red-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-600 text-xs font-bold">NEW</span>
                  <Badge variant="Critical">{gap.dimension || 'General'}</Badge>
                </div>
                <p className="text-xs font-semibold text-slate-800">{gap.description || gap.title}</p>
                <p className="text-xs text-slate-600 mt-0.5">{gap.indicator || ''}</p>
              </div>
            )) : [
              { title: 'AI ethics framework still absent', detail: 'Despite general AI recognition, no specific ethics framework or impact assessment mechanism has been created.', dim: 'AI Policy & Strategy' },
              { title: 'Digital literacy gap widening', detail: 'Rapid digital service expansion without corresponding literacy programs has increased the inclusion gap.', dim: 'Human Impact & Inclusion' },
              { title: 'No AI compute infrastructure planning', detail: 'Regional peers have begun cloud and GPU planning; no equivalent strategy exists.', dim: 'Digital Infrastructure' },
            ].map((gap, i) => (
              <div key={i} className="p-3 rounded-lg bg-red-50 border border-red-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-600 text-xs font-bold">NEW</span>
                  <Badge variant="Critical">{gap.dim}</Badge>
                </div>
                <p className="text-xs font-semibold text-slate-800">{gap.title}</p>
                <p className="text-xs text-slate-600 mt-0.5">{gap.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function trendNotes(dim: string, delta: number): string {
  const notes: Record<string, string> = {
    'AI Policy & Strategy': delta > 0 ? 'AI recognition strengthened in policy' : 'Policy progress limited',
    'Strategy Alignment': delta > 0 ? 'Improved SDG linkage' : 'Alignment gains modest',
    'Data & Model Ecosystem': delta > 0 ? 'Data governance improved' : 'Data ecosystem still nascent',
    'Cross-Domain Correlation': delta > 0 ? 'Cross-sector applications expanded' : 'Limited cross-sector progress',
    'Human Impact & Inclusion': delta > 0 ? 'Inclusion measures advancing' : 'Still no dedicated inclusion strategy',
    'Digital Infrastructure': delta > 0 ? 'Infrastructure outlook improved' : 'Infrastructure progress slow',
    'Contextualization & Regional Fit': delta > 0 ? 'Regional alignment strengthened' : 'Limited change from previous assessment',
  }
  return notes[dim] || 'No significant change'
}
