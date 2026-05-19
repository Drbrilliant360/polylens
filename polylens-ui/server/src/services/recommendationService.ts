import { prisma } from '../config/database'
import { AppError } from '../middleware/errorHandler'

export const recommendationService = {
  async list(assessmentId: string) {
    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } })
    if (!assessment) throw new AppError('Assessment not found', 404)
    return prisma.recommendation.findMany({
      where: { assessmentId },
      orderBy: { feasibility: 'desc' },
    })
  },

  async create(assessmentId: string, data: {
    title: string
    action: string
    owner: string
    resources: string
    feasibility: number
    expectedOutcome: string
    risks: string
    ituDimension: string
    sdgLink: string
    timeHorizon: string
  }) {
    return prisma.recommendation.create({ data: { ...data, assessmentId } })
  },

  async bulkCreate(assessmentId: string, recommendations: any[]) {
    await prisma.recommendation.deleteMany({ where: { assessmentId } })
    return prisma.recommendation.createMany({
      data: recommendations.map(r => ({ ...r, assessmentId })),
    })
  },

  async delete(userId: string, id: string) {
    const rec = await prisma.recommendation.findFirst({
      where: { id, assessment: { userId } },
    })
    if (!rec) throw new AppError('Recommendation not found', 404)
    await prisma.recommendation.delete({ where: { id } })
    return { message: 'Recommendation deleted' }
  },
}
