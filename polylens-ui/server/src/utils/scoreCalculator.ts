export function calculateReadinessLevel(score: number): string {
  if (score >= 76) return 'Advanced'
  if (score >= 51) return 'Emerging'
  if (score >= 26) return 'Developing'
  return 'Nascent'
}

export function calculateSeverity(score: number): string {
  if (score <= 25) return 'Critical'
  if (score <= 50) return 'Major'
  if (score <= 75) return 'Moderate'
  return 'Minor'
}
