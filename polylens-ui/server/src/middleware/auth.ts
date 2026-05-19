import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/database'

const JWT_SECRET = process.env.JWT_SECRET || 'polylens-ai-secret'

export interface AuthRequest extends Request {
  userId?: string
  user?: { id: string; email: string; name: string; role: string }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true },
    })
    if (!user) return res.status(401).json({ error: 'User not found' })
    req.userId = user.id
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
