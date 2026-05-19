import { prisma } from '../config/database'
import { AppError } from '../middleware/errorHandler'

export const trendService = {
  async compare(assessmentId: string) {
    const current = await prisma.assessment.findFirst({
      where: { id: assessmentId },
      include: { dimensions: true, gaps: true },
    })
    if (!current) throw new AppError('Assessment not found', 404)

    const previous = await prisma.assessment.findFirst({
      where: {
        country: current.country,
        id: { not: current.id },
      },
      orderBy: { assessmentDate: 'desc' },
      include: { dimensions: true, gaps: true },
    })

    const dimensionTrends = current.dimensions.map(cd => {
      const pd = previous?.dimensions.find(d => d.name === cd.name)
      return {
        dimension: cd.name,
        previousScore: pd?.score ?? 0,
        currentScore: cd.score,
        delta: cd.score - (pd?.score ?? 0),
        previousLevel: pd?.level ?? 'Not assessed',
        currentLevel: cd.level,
      }
    })

    const previousGapIds = new Set(previous?.gaps.map(g => g.description) ?? [])
    const currentGapIds = new Set(current.gaps.map(g => g.description))

    const closedGaps = previous?.gaps.filter(g => !currentGapIds.has(g.description)) ?? []
    const newGaps = current.gaps.filter(g => !previousGapIds.has(g.description))

    return {
      previous: previous ? {
        overallScore: previous.overallScore,
        readinessLevel: previous.readinessLevel,
        assessmentDate: previous.assessmentDate,
      } : null,
      current: {
        overallScore: current.overallScore,
        readinessLevel: current.readinessLevel,
        assessmentDate: current.assessmentDate,
      },
      overallDelta: current.overallScore - (previous?.overallScore ?? 0),
      dimensions: dimensionTrends,
      closedGaps,
      newGaps,
    }
  },
}
