import { Router } from 'express'
import { documentService } from '../services/documentService'
import { authenticate, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'

export const documentsRouter = Router()
documentsRouter.use(authenticate)

documentsRouter.post('/upload/:assessmentId', upload.single('file'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const doc = await documentService.upload(req.params.assessmentId as string, req.file)
    res.status(201).json(doc)
  } catch (e) { next(e) }
})

documentsRouter.get('/:assessmentId', async (req: AuthRequest, res, next) => {
  try {
    const docs = await documentService.getByAssessment(req.params.assessmentId as string)
    res.json(docs)
  } catch (e) { next(e) }
})

documentsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const result = await documentService.delete(req.userId!, req.params.id as string)
    res.json(result)
  } catch (e) { next(e) }
})
