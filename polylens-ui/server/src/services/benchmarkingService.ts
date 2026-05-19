import { prisma } from '../config/database'
import { AppError } from '../middleware/errorHandler'

export const benchmarkingService = {
  async compare(primaryId: string, benchmarkId: string) {
    const [primary, benchmark] = await Promise.all([
      prisma.assessment.findFirst({
        where: { id: primaryId },
        include: { dimensions: true },
      }),
      prisma.assessment.findFirst({
        where: { id: benchmarkId },
        include: { dimensions: true },
      }),
    ])

    if (!primary || !benchmark) throw new AppError('One or both assessments not found', 404)

    const dimensionScores = primary.dimensions.map(pd => {
      const bd = benchmark.dimensions.find(d => d.name === pd.name)
      return {
        dimension: pd.name,
        primaryScore: pd.score,
        primaryLevel: pd.level,
        benchmarkScore: bd?.score ?? 0,
        benchmarkLevel: bd?.level ?? 'Nascent',
        delta: (bd?.score ?? 0) - pd.score,
      }
    })

    await prisma.benchmarkPair.create({
      data: {
        primaryCountry: primary.country,
        benchmarkCountry: benchmark.country,
        dimensionScores: JSON.stringify(dimensionScores),
        overallPrimary: primary.overallScore,
        overallBenchmark: benchmark.overallScore,
      },
    })

    return {
      primary: { country: primary.country, overallScore: primary.overallScore, readinessLevel: primary.readinessLevel },
      benchmark: { country: benchmark.country, overallScore: benchmark.overallScore, readinessLevel: benchmark.readinessLevel },
      dimensions: dimensionScores,
      overallDelta: benchmark.overallScore - primary.overallScore,
    }
  },

  async getPairs(userId: string) {
    return prisma.benchmarkPair.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
  },
}
