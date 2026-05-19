import { Router } from 'express'
import { benchmarkingService } from '../services/benchmarkingService'
import { authenticate, AuthRequest } from '../middleware/auth'

export const benchmarkingRouter = Router()
benchmarkingRouter.use(authenticate)

benchmarkingRouter.get('/compare/:primaryId/:benchmarkId', async (req: AuthRequest, res, next) => {
  try {
    const result = await benchmarkingService.compare(req.params.primaryId as string, req.params.benchmarkId as string)
    res.json(result)
  } catch (e) { next(e) }
})

benchmarkingRouter.get('/pairs', async (req: AuthRequest, res, next) => {
  try {
    const pairs = await benchmarkingService.getPairs(req.userId!)
    res.json(pairs)
  } catch (e) { next(e) }
})
