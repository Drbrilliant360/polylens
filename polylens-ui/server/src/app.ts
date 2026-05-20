import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth'
import { assessmentsRouter } from './routes/assessments'
import { documentsRouter } from './routes/documents'
import { recommendationsRouter } from './routes/recommendations'
import { benchmarkingRouter } from './routes/benchmarking'
import { trendsRouter } from './routes/trends'
import { reportsRouter } from './routes/reports'
import { aiRouter } from './routes/ai'
import { errorHandler } from './middleware/errorHandler'

const app = express()

if (!process.env.VERCEL) {
  dotenv.config({ path: path.join(__dirname, '..', '.env') })
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
if (!process.env.VERCEL) {
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
}

app.use('/api/auth', authRouter)
app.use('/api/assessments', assessmentsRouter)
app.use('/api/documents', documentsRouter)
app.use('/api/recommendations', recommendationsRouter)
app.use('/api/benchmarking', benchmarkingRouter)
app.use('/api/trends', trendsRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/ai', aiRouter)

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'PolicyLens API is running',
  })
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

export default app
