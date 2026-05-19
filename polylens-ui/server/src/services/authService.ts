import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'
import { generateToken } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

export const authService = {
  async register(email: string, name: string, password: string) {
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) throw new AppError('Email already registered', 409)

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, name, password: hashed },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })

    const token = generateToken(user.id)
    return { user, token }
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new AppError('Invalid credentials', 401)

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new AppError('Invalid credentials', 401)

    const token = generateToken(user.id)
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    }
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })
    if (!user) throw new AppError('User not found', 404)
    return user
  },
}
