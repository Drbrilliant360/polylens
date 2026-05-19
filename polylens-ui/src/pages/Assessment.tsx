import { useAssessment } from '../lib/useAssessment'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { cn } from '../lib/cn'
import { CheckCircle, XCircle, Quote } from 'lucide-react'
import { defaultAssessment } from '../lib/data'

const coverMap: Record<string, string[]> = {
  'AI Policy & Strategy': ['Section 3.1 outlines AI as a national priority technology', 'Page 12 defines high-level AI vision and guiding principles', 'References collaboration with development partners for AI initiatives'],
  'Strategy Alignment': ['Page 5 mentions alignment with Tanzania Development Vision 2025', 'Section 2.3 references AU Digital Transformation Strategy', 'Links AI to SDG 9 (Industry, Innovation)'],
  'Data & Model Ecosystem': ['Section 4.2 references the Personal Data Protection Act 2022', 'Page 8 mentions data security requirements for digital services'],
  'Cross-Domain Correlation': ['Section 5.1 details AI applications in agriculture (precision farming)', 'Section 5.2 covers AI in health (diagnostic support)', 'Brief mention of AI in financial services (mobile money)'],
  'Human Impact & Inclusion': ['Page 15 includes a general commitment to inclusive digital development', 'Section 6.1 mentions education sector digital transformation'],
  'Digital Infrastructure': ['Section 7.1 details national broadband expansion targets', 'Page 22 references the National ICT Broadband Backbone (NICTBB)'],
  'Contextualization & Regional Fit': ['Section 8.1 identifies agriculture AI use cases relevant to local economy', 'Page 25 references EAC regional digital cooperation'],
}

const quoteMap: Record<string, string> = {
  'AI Policy & Strategy': '"The Government recognises Artificial Intelligence as a transformative technology for national development and commits to creating an enabling environment for its responsible adoption." — Section 3.1, p.12',
  'Data & Model Ecosystem': '"All data processing activities shall comply with the provisions of the Personal Data Protection Act (2022) to ensure citizen privacy and data security." — Section 4.2, p.18',
  'Digital Infrastructure': '"The National Broadband Strategy targets 80% population coverage by 2028, with priority given to underserved rural areas." — Section 7.1, p.22',
}

export default function Assessment() {
  const { assessment, loading } = useAssessment()
  const data = assessment || defaultAssessment
  const { country, documentName, assessmentDate, overallScore, readinessLevel, dimensions, strengths } = data

  if (loading) return <div className="flex items-center justify-center h-64 text-sm text-slate-500">Loading assessment data...</div>

  const gapsByDim: Record<string, string[]> = {}
  for (const g of data.gaps) {
    if (!gapsByDim[g.dimension]) gapsByDim[g.dimension] = []
    gapsByDim[g.dimension].push(g.description)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Assessment Report</h2>
          <p className="text-sm text-slate-500 mt-1 truncate">{documentName} — {country}</p>
        </div>
        <div className="text-left sm:text-right text-xs text-slate-400 shrink-0">
          <p>Assessed: {assessmentDate}</p>
          <p>Framework: ITU AI Readiness 2.0</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white',
              overallScore < 26 ? 'bg-red-500' :
              overallScore < 51 ? 'bg-amber-500' :
              overallScore < 76 ? 'bg-emerald-500' : 'bg-blue-600'
            )}>
              {overallScore}
            </div>
            <div>
              <p className="text-sm text-slate-500">Overall Score</p>
              <p className="text-lg font-bold text-slate-900">{readinessLevel}</p>
            </div>
          </div>
          <div className="flex-1">
            <ProgressBar value={overallScore} size="lg" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Dimension Analysis</h3>
        {dimensions.map((dim, i) => {
          const covers = coverMap[dim.name] || ['Policy document references this dimension in general terms']
          const dimGaps = gapsByDim[dim.name] || ['Gap analysis available upon detailed document review']
          const quote = quoteMap[dim.name] || null
          return (
            <div key={dim.name} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <details className="group" open={i < 1}>
                <summary className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors list-none">
                  <span className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0',
                    dim.score < 26 ? 'bg-red-500' :
                    dim.score < 51 ? 'bg-amber-500' :
                    dim.score < 76 ? 'bg-emerald-500' : 'bg-blue-600'
                  )}>
                    {dim.score}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">{dim.name}</h4>
                      <Badge variant={dim.level}>{dim.level}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{dim.keyFinding}</p>
                  </div>
                  <ChevronIcon />
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">What the document covers</span>
                      </div>
                      <ul className="space-y-2">
                        {covers.map((item, j) => (
                          <li key={j} className="flex gap-2 text-xs text-slate-600">
                            <span className="text-emerald-500 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">What is missing</span>
                      </div>
                      <ul className="space-y-2">
                        {dimGaps.map((item, j) => (
                          <li key={j} className="flex gap-2 text-xs text-slate-600">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {quote && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 flex gap-3">
                      <Quote className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-500 italic">"{quote}"</p>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )
        })}
      </div>

      {strengths.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Strengths</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {strengths.map((s, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-800">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
