export type ReadinessLevel = 'Nascent' | 'Developing' | 'Emerging' | 'Advanced'
export type Severity = 'Critical' | 'Moderate' | 'Minor'

export interface DimensionScore {
  name: string
  score: number
  level: ReadinessLevel
  keyFinding: string
}

export interface Gap {
  id: number
  description: string
  dimension: string
  indicator: string
  severity: Severity
  recommendation: string
}

export interface Recommendation {
  id: string
  title: string
  action: string
  owner: string
  resources: string
  feasibility: number
  expectedOutcome: string
  risks: string
  ituDimension: string
  sdgLink: string
}

export interface BenchmarkData {
  primary: string
  benchmark: string
  primaryScore: number
  benchmarkScore: number
}

export interface AssessmentData {
  documentName: string
  country: string
  assessmentDate: string
  overallScore: number
  readinessLevel: ReadinessLevel
  dimensions: DimensionScore[]
  gaps: Gap[]
  strengths: string[]
  priorityActions: string[]
}
