import { Router } from 'express'
import { recommendationService } from '../services/recommendationService'
import { authenticate, AuthRequest } from '../middleware/auth'

export const recommendationsRouter = Router()
recommendationsRouter.use(authenticate)

recommendationsRouter.get('/:assessmentId', async (req: AuthRequest, res, next) => {
  try {
    const recs = await recommendationService.list(req.params.assessmentId as string)
    res.json(recs)
  } catch (e) { next(e) }
})

recommendationsRouter.post('/:assessmentId', async (req: AuthRequest, res, next) => {
  try {
    const rec = await recommendationService.create(req.params.assessmentId as string, req.body)
    res.status(201).json(rec)
  } catch (e) { next(e) }
})

recommendationsRouter.post('/bulk/:assessmentId', async (req: AuthRequest, res, next) => {
  try {
    const result = await recommendationService.bulkCreate(req.params.assessmentId as string, req.body.recommendations)
    res.json(result)
  } catch (e) { next(e) }
})

recommendationsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const result = await recommendationService.delete(req.userId!, req.params.id as string)
    res.json(result)
  } catch (e) { next(e) }
})
