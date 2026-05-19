import { Router } from 'express'
import { trendService } from '../services/trendService'
import { authenticate, AuthRequest } from '../middleware/auth'

export const trendsRouter = Router()
trendsRouter.use(authenticate)

trendsRouter.get('/:assessmentId', async (req: AuthRequest, res, next) => {
  try {
    const result = await trendService.compare(req.params.assessmentId as string)
    res.json(result)
  } catch (e) { next(e) }
})
