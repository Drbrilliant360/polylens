import { Router } from 'express'
import { assessmentService } from '../services/assessmentService'
import { authenticate, AuthRequest } from '../middleware/auth'

export const assessmentsRouter = Router()
assessmentsRouter.use(authenticate)

assessmentsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const assessments = await assessmentService.list(req.userId!)
    res.json(assessments)
  } catch (e) { next(e) }
})

assessmentsRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const assessment = await assessmentService.getById(req.userId!, req.params.id as string)
    res.json(assessment)
  } catch (e) { next(e) }
})

assessmentsRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const assessment = await assessmentService.create(req.userId!, req.body)
    res.status(201).json(assessment)
  } catch (e) { next(e) }
})

assessmentsRouter.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const assessment = await assessmentService.update(req.userId!, req.params.id as string, req.body)
    res.json(assessment)
  } catch (e) { next(e) }
})

assessmentsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const result = await assessmentService.delete(req.userId!, req.params.id as string)
    res.json(result)
  } catch (e) { next(e) }
})

assessmentsRouter.get('/country/:country', async (req: AuthRequest, res, next) => {
  try {
    const assessments = await assessmentService.getByCountry(req.userId!, req.params.country as string)
    res.json(assessments)
  } catch (e) { next(e) }
})
