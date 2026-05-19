import { useState, useEffect } from 'react'
import { api } from './api'
import { defaultAssessment } from './data'
import type { AssessmentData } from './types'

interface ApiDimension {
  name: string; score: number; level: string; keyFinding: string
}
interface ApiGap {
  id: string; description: string; dimension: string
  indicator: string; severity: string; recommendation: string
}
interface ApiStrength { description: string }
interface ApiPriorityAction { title: string; description: string; rank: number }
interface ApiAssessment {
  id: string; documentName: string; country: string
  assessmentDate: string; overallScore: number; readinessLevel: string
  dimensions: ApiDimension[]; gaps: ApiGap[]
  strengths: ApiStrength[]; priorityActions: ApiPriorityAction[]
}

export function useAssessment() {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null)
  const [rawId, setRawId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.assessments.list()
      .then((list: ApiAssessment[]) => {
        if (list.length > 0) {
          const id = list[0].id
          setRawId(id)
          return api.assessments.get(id).then((live: ApiAssessment) => {
            setAssessment({
              documentName: live.documentName,
              country: live.country,
              assessmentDate: new Date(live.assessmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              overallScore: live.overallScore,
              readinessLevel: live.readinessLevel as AssessmentData['readinessLevel'],
              dimensions: (live.dimensions || []).map(d => ({
                name: d.name, score: d.score, level: d.level as AssessmentData['readinessLevel'], keyFinding: d.keyFinding,
              })),
              gaps: (live.gaps || []).map(g => ({
                id: g.id, description: g.description, dimension: g.dimension,
                indicator: g.indicator, severity: g.severity as AssessmentData['gaps'][number]['severity'], recommendation: g.recommendation,
              })),
              strengths: (live.strengths || []).map(s => typeof s === 'string' ? s : s.description),
              priorityActions: (live.priorityActions || []).map(p =>
                typeof p === 'string' ? p : `${p.title} — ${p.description}`
              ),
            })
          })
        }
        setAssessment(defaultAssessment)
      })
      .catch(() => {
        setAssessment(defaultAssessment)
      })
      .finally(() => setLoading(false))
  }, [])

  return { assessment, rawId, loading }
}
