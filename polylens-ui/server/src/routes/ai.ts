import { Router, Request, Response } from 'express'
import { aiService } from '../services/aiService'
import { authenticate, AuthRequest } from '../middleware/auth'

export const aiRouter = Router()
aiRouter.use(authenticate)

aiRouter.post('/analyze', async (req: AuthRequest, res, next) => {
  try {
    const { documentText, documentName, country } = req.body
    if (!documentText || !documentName || !country) {
      return res.status(400).json({ error: 'documentText, documentName, and country are required' })
    }
    const result = await aiService.analyzeDocument(documentText, documentName, country)
    res.json(result)
  } catch (e) {
    next(e)
  }
})

aiRouter.post('/gap-analysis', async (req: AuthRequest, res, next) => {
  try {
    const { dimension, documentText, country } = req.body
    if (!dimension || !documentText || !country) {
      return res.status(400).json({ error: 'dimension, documentText, and country are required' })
    }
    const result = await aiService.gapAnalysis(dimension, documentText, country)
    res.json(result)
  } catch (e) {
    next(e)
  }
})

aiRouter.post('/recommendations', async (req: AuthRequest, res, next) => {
  try {
    const { assessmentSummary, country } = req.body
    if (!assessmentSummary || !country) {
      return res.status(400).json({ error: 'assessmentSummary and country are required' })
    }
    const result = await aiService.generateRecommendations(assessmentSummary, country)
    res.json(result)
  } catch (e) {
    next(e)
  }
})

aiRouter.post('/benchmarking', async (req: AuthRequest, res, next) => {
  try {
    const { primaryCountry, primaryData, benchmarkCountry, benchmarkData } = req.body
    if (!primaryCountry || !primaryData || !benchmarkCountry || !benchmarkData) {
      return res.status(400).json({ error: 'All benchmarking fields are required' })
    }
    const result = await aiService.benchmarking(primaryCountry, primaryData, benchmarkCountry, benchmarkData)
    res.json(result)
  } catch (e) {
    next(e)
  }
})

aiRouter.post('/chat', async (req: AuthRequest, res, next) => {
  try {
    const { messages, assessmentContext } = req.body
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' })
    }
    const result = await aiService.chat(messages, assessmentContext)
    res.json(result)
  } catch (e) {
    next(e)
  }
})

aiRouter.post('/chat/stream', async (req: AuthRequest, res, next) => {
  try {
    const { messages, assessmentContext } = req.body
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    const fullContent = await aiService.chatStream(
      messages,
      assessmentContext,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
      }
    )

    res.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`)
    res.end()
  } catch (e) {
    next(e)
  }
})
