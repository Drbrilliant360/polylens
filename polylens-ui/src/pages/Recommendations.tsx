import { useState, useEffect } from 'react'
import { useAssessment } from '../lib/useAssessment'
import { defaultAssessment, recommendations as defaultRecs } from '../lib/data'
import { api } from '../lib/api'
import { Badge } from '../components/ui/Badge'
import { cn } from '../lib/cn'
import { Star, Clock, Target, AlertCircle } from 'lucide-react'

function shortId(id: string) {
  return id.startsWith('R-') ? id.split('-')[2] : id.slice(0, 4)
}

export default function Recommendations() {
  const { assessment, rawId, loading } = useAssessment()
  const { country } = assessment || defaultAssessment
  const [liveRecs, setLiveRecs] = useState<any[] | null>(null)
  const [recsLoading, setRecsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'immediate' | 'short' | 'medium'>('all')

  useEffect(() => {
    const load = async () => {
      setRecsLoading(true)
      try {
        const id = rawId || (await api.assessments.list())[0]?.id
        if (id) {
          const recs = await api.recommendations.list(id)
          setLiveRecs(recs)
        }
      } catch {
      } finally {
        setRecsLoading(false)
      }
    }
    if (!loading) load()
  }, [loading, rawId])

  const recommendations = liveRecs || defaultRecs || []

  const categorized = {
    immediate: recommendations.filter((r: any) => (r.timeHorizon || r.id?.startsWith('R-IM') ? 'immediate' : '') === 'immediate' || r.id?.startsWith('R-IM')),
    short: recommendations.filter((r: any) => (r.timeHorizon || '').startsWith('short') || r.id?.startsWith('R-ST')),
    medium: recommendations.filter((r: any) => (r.timeHorizon || '').startsWith('medium') || r.id?.startsWith('R-MT')),
  }

  if (liveRecs) {
    categorized.immediate = liveRecs.filter((r: any) => (r.timeHorizon || '').startsWith('immediate'))
    categorized.short = liveRecs.filter((r: any) => (r.timeHorizon || '').startsWith('short'))
    categorized.medium = liveRecs.filter((r: any) => (r.timeHorizon || '').startsWith('medium'))
  }

  const filtered = activeTab === 'all' ? recommendations :
    activeTab === 'immediate' ? categorized.immediate :
    activeTab === 'short' ? categorized.short :
    categorized.medium

  const tabs = [
    { key: 'all', label: 'All', count: recommendations.length },
    { key: 'immediate', label: 'Immediate (0-6mo)', count: categorized.immediate.length },
    { key: 'short', label: 'Short-term (6-18mo)', count: categorized.short.length },
    { key: 'medium', label: 'Medium-term (18mo-3yr)', count: categorized.medium.length },
  ] as const

  if (loading || recsLoading) return <div className="flex items-center justify-center h-64 text-sm text-slate-500">Loading recommendations...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Strategic Recommendations</h2>
        <p className="text-sm text-slate-500 mt-1">{country} — Ranked by feasibility and impact</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'text-xs px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200',
                'active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-policy-400',
                activeTab === tab.key
                  ? 'bg-policy-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((rec: any, i: number) => (
            <div key={rec.id || i} className="p-5 rounded-xl border border-slate-200 hover:border-policy-200 transition-colors">
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-policy-100 text-policy-700 text-sm font-bold flex-shrink-0">
                  {shortId(rec.id || '') || i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h4 className="text-sm font-semibold text-slate-900">{rec.title}</h4>
                    <Badge variant="default">{rec.ituDimension}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    <span className="font-medium">Action:</span> {rec.action}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-policy-500" />
                      <span className="text-slate-600"><span className="font-medium text-slate-700">Owner:</span> {rec.owner}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-policy-500" />
                      <span className="text-slate-600"><span className="font-medium text-slate-700">Resources:</span> {rec.resources}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-slate-600">
                        Feasibility: {Array.from({ length: 5 }, (_, j) => (
                          <span key={j} className={j < rec.feasibility ? 'text-amber-500' : 'text-slate-200'}>★</span>
                        ))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-600"><span className="font-medium text-slate-700">Risks:</span> {rec.risks}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <span className="font-medium">Expected outcome:</span> {rec.expectedOutcome}
                    <span className="mx-2">·</span>
                    <span className="font-medium">SDG alignment:</span> {rec.sdgLink}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Implementation Roadmap</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex mb-2">
              {['Year 1', 'Year 2', 'Year 3', 'Year 4-5'].map((y, i) => (
                <div key={i} className="flex-1 text-center text-xs font-semibold text-slate-500">{y}</div>
              ))}
            </div>
            <div className="relative h-48">
              <div className="absolute inset-0 flex">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex-1 border-l border-slate-200 last:border-r" />
                ))}
              </div>
              <div className="absolute inset-0">
                <RoadmapBar left="0%" width="33%" color="bg-policy-500" label={categorized.immediate[0]?.title || 'AI Coordination Council'} row={0} />
                <RoadmapBar left="0%" width="50%" color="bg-policy-400" label={categorized.immediate[1]?.title || 'Ethics Framework'} row={1} />
                <RoadmapBar left="0%" width="50%" color="bg-amber-500" label={categorized.short[0]?.title || 'Open Data Policy'} row={2} />
                <RoadmapBar left="25%" width="50%" color="bg-amber-400" label={categorized.short[1]?.title || 'Regulatory Sandbox'} row={3} />
                <RoadmapBar left="50%" width="37%" color="bg-emerald-500" label={categorized.medium[0]?.title || 'Digital Literacy Program'} row={4} />
                <RoadmapBar left="50%" width="37%" color="bg-emerald-400" label={categorized.medium[1]?.title || 'Compute Strategy'} row={5} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Long-Term Vision (3-5 Years)</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          By 2031, {country} will have transitioned from its current readiness level to an Emerging AI-ready nation with a fully operational
          AI governance ecosystem. A National AI Coordination Council will have overseen the implementation of a comprehensive
          AI ethics framework, regulatory sandbox, and open data policy — creating an enabling environment for responsible AI
          innovation. A nationwide digital literacy program will have reached millions of citizens, with targeted AI skilling
          producing thousands of AI practitioners across government, academia, and industry. National compute infrastructure
          will support research and startup experimentation, positioning {country} as a competitive AI destination in East Africa
          and a credible partner in continental AI initiatives under the African Union's Digital Transformation Strategy.
        </p>
      </div>
    </div>
  )
}

function RoadmapBar({ left, width, color, label, row }: { left: string; width: string; color: string; label: string; row: number }) {
  return (
    <div
      className="absolute flex items-center gap-2"
      style={{ left, width, top: `${row * 30 + 4}px`, height: '22px' }}
    >
      <div className={cn('h-full rounded-md flex items-center px-2 truncate text-xs font-medium text-white', color)}>
        {label}
      </div>
    </div>
  )
}
