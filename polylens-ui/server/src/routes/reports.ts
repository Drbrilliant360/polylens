import { Router } from 'express'
import { reportService } from '../services/reportService'
import { authenticate, AuthRequest } from '../middleware/auth'

export const reportsRouter = Router()
reportsRouter.use(authenticate)

reportsRouter.get('/:assessmentId/pdf', async (req: AuthRequest, res, next) => {
  try {
    const pdf = await reportService.generatePdf(req.params.assessmentId as string)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="polylens-assessment-${req.params.assessmentId as string}.pdf"`)
    res.send(pdf)
  } catch (e) { next(e) }
})
