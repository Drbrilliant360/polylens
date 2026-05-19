import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip
} from 'recharts'
import {
  FileText, AlertTriangle, BarChart3, Lightbulb, TrendingUp, Sparkles
} from 'lucide-react'
import { useAssessment } from '../lib/useAssessment'
import { defaultAssessment } from '../lib/data'
import { ScoreCard } from '../components/ui/ScoreCard'
import { Badge } from '../components/ui/Badge'
import { NavCard } from '../components/ui/NavCard'
import { Card } from '../components/ui/Card'
import { cn } from '../lib/cn'

const quickLinks = [
  { to: '/analyze', icon: Sparkles, title: 'Document Analysis', description: 'Upload and assess policy documents with AI', accent: 'accent' as const },
  { to: '/assessment', icon: FileText, title: 'Assessment Report', description: 'Full readiness report and dimension scores' },
  { to: '/gaps', icon: AlertTriangle, title: 'Gap Analysis', description: 'Critical gaps and ITU indicator mapping' },
  { to: '/benchmarking', icon: BarChart3, title: 'Benchmarking', description: 'Compare against peer countries' },
  { to: '/recommendations', icon: Lightbulb, title: 'Recommendations', description: 'Strategic actions and implementation plan' },
  { to: '/trends', icon: TrendingUp, title: 'Trend Monitoring', description: 'Track progress across reassessments' },
]

export default function Dashboard() {
  const { assessment, loading } = useAssessment()
  const data = assessment || defaultAssessment

  const radarData = data.dimensions.map(d => ({
    dimension: d.name.replace(/&/g, 'and').split(' ').slice(0, 2).join(' '),
    score: d.score,
    fullMark: 100,
  }))

  const levelColors: Record<string, string> = {
    Nascent: 'bg-red-500',
    Developing: 'bg-amber-500',
    Emerging: 'bg-emerald-500',
    Advanced: 'bg-blue-600',
  }

  const { overallScore, readinessLevel, country, documentName, dimensions, priorityActions } = data

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-policy-200 border-t-policy-600 rounded-full animate-spin" aria-hidden />
        <p className="text-sm text-slate-500">Loading assessment data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">{country} — {documentName}</p>
        </div>
        <Badge variant={readinessLevel} className="text-sm px-3 py-1 w-fit">
          {readinessLevel}
        </Badge>
      </div>

      <section>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick navigation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <NavCard key={link.to} {...link} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dimensions.map((d) => (
            <ScoreCard key={d.name} dimension={d} />
          ))}
        </div>

        <div className="space-y-4">
          <Card className="text-center p-6">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overall Readiness</p>
            <div className="relative inline-flex items-center justify-center mt-4">
              <svg className="w-28 h-28 sm:w-32 sm:h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - overallScore / 100)}`}
                  className={cn(
                    'transition-all duration-700',
                    overallScore < 26 ? 'text-red-500' :
                    overallScore < 51 ? 'text-amber-500' :
                    overallScore < 76 ? 'text-emerald-500' : 'text-blue-600'
                  )}
                />
              </svg>
              <span className="absolute text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">{overallScore}</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">out of 100</p>
            <div className={cn('h-2 w-full rounded-full mt-4', levelColors[readinessLevel])} />
            <p className="text-sm font-semibold text-slate-700 mt-2">{readinessLevel}</p>
          </Card>

          <Card padding="sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 px-1">Radar Overview</h3>
            <div className="w-full min-h-[220px] h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 8, fill: '#64748b' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fill: '#94a3b8' }} />
                  <Radar dataKey="score" stroke="#4c6ef5" fill="#4c6ef5" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <Card padding="lg">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Priority Action Plan</h3>
        <div className="space-y-3 sm:space-y-4">
          {priorityActions.map((action, i) => (
            <div
              key={i}
              className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-policy-50 border border-policy-100 transition-colors hover:bg-policy-100/80"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-policy-600 text-white text-sm font-bold flex-shrink-0 shadow-sm">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{action.split('—')[0].trim()}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{action.split('—').slice(1).join('—').trim()}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
