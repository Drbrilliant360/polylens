import { useState, useEffect } from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts'
import { useAssessment } from '../lib/useAssessment'
import { defaultAssessment, benchmarkData, benchmarkDimensions } from '../lib/data'
import { api } from '../lib/api'
import { cn } from '../lib/cn'

export default function Benchmarking() {
  const { assessment, rawId, loading } = useAssessment()
  const [liveComparison, setLiveComparison] = useState<any>(null)
  const [compLoading, setCompLoading] = useState(true)
  const data = assessment || defaultAssessment
  const { country } = data

  useEffect(() => {
    const loadComparison = async () => {
      setCompLoading(true)
      try {
        const list = await api.assessments.list()
        const primary = rawId || (list.length > 0 ? list[0].id : null)
        const benchmark = list.find((a: any) => a.country !== country)
        if (primary && benchmark) {
          const result = await api.benchmarking.compare(primary, benchmark.id)
          setLiveComparison(result)
        }
      } catch {
      } finally {
        setCompLoading(false)
      }
    }
    if (!loading) loadComparison()
  }, [loading, rawId, country])

  if (loading || compLoading) return <div className="flex items-center justify-center h-64 text-sm text-slate-500">Loading benchmarking data...</div>

  const primaryScore = liveComparison?.primary?.overallScore ?? 42
  const benchmarkScore = liveComparison?.benchmark?.overallScore ?? 64
  const benchmarkCountry = liveComparison?.benchmark?.country ?? 'Rwanda'
  const overallDelta = benchmarkScore - primaryScore

  const chartData = (liveComparison?.dimensions || benchmarkDimensions.map((dim, i) => ({
    dimension: dim.replace(/&/g, 'and'),
    [`${country}`]: benchmarkData[i].primaryScore,
    [benchmarkCountry]: benchmarkData[i].benchmarkScore,
    fullMark: 100,
  }))).map((d: any) => ({
    dimension: (d.dimension || d.dim?.replace(/&/g, 'and') || '').replace(/&/g, 'and'),
    [country]: d.primaryScore ?? d[country] ?? 0,
    [benchmarkCountry]: d.benchmarkScore ?? d[benchmarkCountry] ?? 0,
    fullMark: 100,
  }))

  const dimGaps = liveComparison?.dimensions?.map((d: any) => ({
    dimension: d.dimension,
    delta: d.delta,
    verdict: d.delta > 0 ? 'Ahead' : d.delta < 0 ? 'Behind' : 'On par',
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Benchmarking</h2>
        <p className="text-sm text-slate-500 mt-1">{country} vs. {benchmarkCountry} — ITU AI Readiness Framework 2.0</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Radar Comparison</h3>
          <ResponsiveContainer width="100%" height={360}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: '#64748b' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <Radar name={country} dataKey={country} stroke="#4c6ef5" fill="#4c6ef5" fillOpacity={0.15} strokeWidth={2} />
              <Radar name={benchmarkCountry} dataKey={benchmarkCountry} stroke="#20c997" fill="#20c997" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Overall Comparison</h3>
            <div className="flex items-center justify-around text-center">
              <div>
                <p className="text-xs text-slate-500 mb-1">{country}</p>
                <p className="text-3xl font-bold text-policy-600">{primaryScore}</p>
                <p className="text-xs text-slate-400 mt-1">{liveComparison?.primary?.readinessLevel || 'Developing'}</p>
              </div>
              <div className="text-slate-300 text-2xl font-light">vs</div>
              <div>
                <p className="text-xs text-slate-500 mb-1">{benchmarkCountry}</p>
                <p className="text-3xl font-bold text-emerald-600">{benchmarkScore}</p>
                <p className="text-xs text-slate-400 mt-1">{liveComparison?.benchmark?.readinessLevel || 'Emerging'}</p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-slate-50 text-center">
              <p className="text-xs text-slate-600">
                Gap: <span className="font-bold text-red-500">{overallDelta} points</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Dimension Gaps</h3>
            <div className="space-y-2">
              {(dimGaps.length > 0 ? dimGaps : [
                { dimension: 'Human Impact & Inclusion', delta: -32 },
                { dimension: 'Data & Model Ecosystem', delta: -26 },
                { dimension: 'Digital Infrastructure', delta: -25 },
                { dimension: 'Contextualization & Regional Fit', delta: -18 },
                { dimension: 'AI Policy & Strategy', delta: -17 },
                { dimension: 'Strategy Alignment', delta: -17 },
                { dimension: 'Cross-Domain Correlation', delta: -17 },
              ]).map((v: any) => (
                <div key={v.dimension} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 truncate mr-2">{v.dimension}</span>
                  <span className={cn(
                    'font-semibold flex-shrink-0',
                    v.delta < 0 ? 'text-red-500' : 'text-emerald-500'
                  )}>
                    {v.delta > 0 ? '+' : ''}{v.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Where {country} Leads</h3>
          {dimGaps.some((v: any) => v.delta > 0) ? (
            <div className="space-y-3">
              {dimGaps.filter((v: any) => v.delta > 0).map((v: any) => (
                <div key={v.dimension} className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-emerald-800">{v.dimension}</span>
                    <span className="text-xs font-bold text-emerald-600">+{v.delta}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-lg bg-amber-50 border border-amber-100 text-center">
              <p className="text-sm text-amber-700">
                {country} does not lead {benchmarkCountry} in any dimension in the current assessment.
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Focused policy action across all dimensions is needed to close the gap.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Where {country} Lags Most</h3>
          <div className="space-y-3">
            {(dimGaps.filter((v: any) => v.delta < 0).length > 0 ? dimGaps.filter((v: any) => v.delta < 0).sort((a: any, b: any) => a.delta - b.delta).slice(0, 3) : [
              { dim: 'Human Impact & Inclusion', delta: -32, note: 'Rwanda has a national digital literacy program and gender-inclusive tech policies' },
              { dim: 'Data & Model Ecosystem', delta: -26, note: 'Rwanda enacted an open data policy and AI model governance framework' },
              { dim: 'Digital Infrastructure', delta: -25, note: 'Rwanda invested in national broadband and government cloud infrastructure' },
            ]).map((item: any) => (
              <div key={item.dimension || item.dim} className="p-3 rounded-lg bg-red-50 border border-red-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-red-800">{item.dimension || item.dim}</span>
                  <span className="text-xs font-bold text-red-600">{item.delta}</span>
                </div>
                {item.note && <p className="text-xs text-red-700">{item.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Lessons to Borrow from {benchmarkCountry}</h3>
        <div className="space-y-4">
          {[
            { title: 'National Digital Literacy Campaign', what: `${benchmarkCountry} deployed a nationwide digital literacy program reaching 60% of rural households through community ICT centres.`, how: `${country} can adapt this model using existing broadband infrastructure and partner with the regulator for last-mile delivery.`, time: '12-18 months' },
            { title: 'Open Government Data Policy', what: `${benchmarkCountry} enacted an Open Data Policy (2021) mandating public data sharing with privacy safeguards.`, how: `${country} can build on existing data protection law to create a complementary open data framework, starting with agriculture and health data.`, time: '6-12 months' },
            { title: 'AI Ethics & Regulatory Sandbox', what: `${benchmarkCountry} established an AI regulatory sandbox under the national regulator and adopted UNESCO-aligned AI ethics principles.`, how: `${country} can launch a pilot sandbox within the ICT regulator, starting with fintech and agritech startups.`, time: '12 months' },
          ].map((lesson, i) => (
            <div key={i} className="p-4 rounded-lg bg-policy-50 border border-policy-100">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-policy-600 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{lesson.title}</h4>
                  <p className="text-xs text-slate-600 mt-2"><span className="font-medium">What {benchmarkCountry} did:</span> {lesson.what}</p>
                  <p className="text-xs text-slate-600 mt-1"><span className="font-medium">How {country} can adapt:</span> {lesson.how}</p>
                  <p className="text-xs text-policy-700 mt-1"><span className="font-medium">Estimated time:</span> {lesson.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Benchmarking Verdict</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {country} currently trails {benchmarkCountry} by {overallDelta} points, placing it in a lower readiness category while {benchmarkCountry} has reached a higher status.
          The widest gaps are in Human Impact & Inclusion and Data & Model Ecosystem, both areas where {benchmarkCountry} has
          made deliberate policy progress. {country} has foundational elements that position it well for rapid advancement.
          With focused implementation of the priority actions outlined in this assessment,
          {country} could realistically reach the next readiness level within 3-4 years. Without targeted intervention, the gap to regional
          leaders is likely to widen further.
        </p>
      </div>
    </div>
  )
}
