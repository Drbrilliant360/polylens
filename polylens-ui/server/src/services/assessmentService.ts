import { prisma } from '../config/database'
import { AppError } from '../middleware/errorHandler'
import { calculateReadinessLevel } from '../utils/scoreCalculator'

export const assessmentService = {
  async list(userId: string) {
    return prisma.assessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        dimensions: true,
        _count: { select: { gaps: true, recommendations: true, documents: true } },
      },
    })
  },

  async getById(userId: string, id: string) {
    const assessment = await prisma.assessment.findFirst({
      where: { id, userId },
      include: {
        dimensions: { orderBy: { name: 'asc' } },
        gaps: { orderBy: { severity: 'desc' } },
        recommendations: true,
        documents: true,
        strengths: true,
        priorityActions: { orderBy: { rank: 'asc' } },
      },
    })
    if (!assessment) throw new AppError('Assessment not found', 404)
    return assessment
  },

  async create(userId: string, data: {
    title: string
    country: string
    documentName: string
    dimensions: { name: string; score: number; keyFinding: string }[]
    gaps: { description: string; dimension: string; indicator: string; severity: string; recommendation: string }[]
  }) {
    const dimensionLevels = data.dimensions.map(d => ({
      ...d,
      level: calculateReadinessLevel(d.score),
    }))
    const overallScore = Math.round(
      dimensionLevels.reduce((sum, d) => sum + d.score, 0) / dimensionLevels.length
    )
    const readinessLevel = calculateReadinessLevel(overallScore)

    return prisma.assessment.create({
      data: {
        title: data.title,
        country: data.country,
        documentName: data.documentName,
        overallScore,
        readinessLevel,
        userId,
        dimensions: { create: dimensionLevels },
        gaps: { create: data.gaps },
      },
      include: {
        dimensions: true,
        gaps: true,
      },
    })
  },

  async update(userId: string, id: string, data: {
    title?: string
    overallScore?: number
    status?: string
    dimensions?: { name: string; score: number; keyFinding: string }[]
    gaps?: { description: string; dimension: string; indicator: string; severity: string; recommendation: string }[]
  }) {
    const assessment = await prisma.assessment.findFirst({ where: { id, userId } })
    if (!assessment) throw new AppError('Assessment not found', 404)

    if (data.dimensions) {
      await prisma.dimensionScore.deleteMany({ where: { assessmentId: id } })
      const dimensionLevels = data.dimensions.map(d => ({
        ...d,
        level: calculateReadinessLevel(d.score),
      }))
      const overallScore = Math.round(
        dimensionLevels.reduce((sum, d) => sum + d.score, 0) / dimensionLevels.length
      )
      data.overallScore = overallScore
      await prisma.assessment.update({
        where: { id },
        data: {
          title: data.title,
          overallScore,
          readinessLevel: calculateReadinessLevel(overallScore),
          status: data.status,
          dimensions: { create: dimensionLevels },
        },
      })
    }

    if (data.gaps) {
      await prisma.gap.deleteMany({ where: { assessmentId: id } })
      await prisma.gap.createMany({ data: data.gaps.map(g => ({ ...g, assessmentId: id })) })
    }

    return this.getById(userId, id)
  },

  async delete(userId: string, id: string) {
    const assessment = await prisma.assessment.findFirst({ where: { id, userId } })
    if (!assessment) throw new AppError('Assessment not found', 404)
    await prisma.assessment.delete({ where: { id } })
    return { message: 'Assessment deleted' }
  },

  async getByCountry(userId: string, country: string) {
    return prisma.assessment.findMany({
      where: { userId, country: { contains: country } },
      orderBy: { createdAt: 'desc' },
      include: { dimensions: true, _count: { select: { gaps: true } } },
    })
  },
}
