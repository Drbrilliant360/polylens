import { Router } from 'express'
import { authService } from '../services/authService'
import { authenticate, AuthRequest } from '../middleware/auth'

export const authRouter = Router()

authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, name, password } = req.body
    const result = await authService.register(email, name, password)
    res.status(201).json(result)
  } catch (e) { next(e) }
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password)
    res.json(result)
  } catch (e) { next(e) }
})

authRouter.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await authService.getProfile(req.userId!)
    res.json(user)
  } catch (e) { next(e) }
})
