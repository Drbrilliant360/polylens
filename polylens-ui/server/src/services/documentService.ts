import { prisma } from '../config/database'
import { AppError } from '../middleware/errorHandler'

export const documentService = {
  async upload(assessmentId: string, file: Express.Multer.File) {
    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } })
    if (!assessment) throw new AppError('Assessment not found', 404)

    return prisma.document.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        assessmentId,
      },
    })
  },

  async getByAssessment(assessmentId: string) {
    return prisma.document.findMany({ where: { assessmentId } })
  },

  async delete(userId: string, id: string) {
    const doc = await prisma.document.findFirst({
      where: { id, assessment: { userId } },
    })
    if (!doc) throw new AppError('Document not found', 404)
    await prisma.document.delete({ where: { id } })

    const fs = await import('fs')
    try { fs.unlinkSync(doc.path) } catch {}
    return { message: 'Document deleted' }
  },
}
