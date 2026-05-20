import OpenAI from 'openai'
import { AppError } from '../middleware/errorHandler'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
})

const MODEL = process.env.AI_MODEL || 'anthropic/claude-3-haiku'
const FALLBACK_MODEL = 'anthropic/claude-3-haiku'
const ANALYZE_MODEL = process.env.AI_ANALYZE_MODEL || FALLBACK_MODEL
const ANALYZE_MAX_TOKENS = parseInt(process.env.AI_ANALYZE_MAX_TOKENS || '1200', 10)

const SYSTEM_PROMPT = `You are PolicyLens AI, an expert AI Readiness Evaluation assistant using ITU AI Readiness Framework 2.0. You assess developing countries (focus Africa) across 7 dimensions: AI Policy & Strategy, Strategy Alignment, Data & Model Ecosystem, Cross-Domain Correlation, Human Impact & Inclusion, Digital Infrastructure, Contextualization & Regional Fit.

Rules: Ground analysis in provided text evidence. Score 0-100 per dimension. Be precise about gaps and cite ITU indicators. Recommendations must be actionable. Use accessible language for government officials. Flag insufficient documents. Return ONLY valid JSON when asked. Never fabricate evidence.`

interface AIChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoning_details?: unknown
}

function parseJsonContent(content: string) {
  const cleaned = content.replace(/```json?/g, '').replace(/```/g, '').trim()
  return JSON.parse(cleaned)
}

const ITU_DIMENSIONS = [
  'AI Policy & Strategy',
  'Strategy Alignment',
  'Data & Model Ecosystem',
  'Cross-Domain Correlation',
  'Human Impact & Inclusion',
  'Digital Infrastructure',
  'Contextualization & Regional Fit',
]

function buildOfflineAssessment(documentText: string, documentName: string, country: string) {
  const lower = documentText.toLowerCase()
  const signals = {
    policy: /national (ai|ict)|strategy|policy framework|governance/.test(lower),
    data: /data protection|open data|data governance|privacy/.test(lower),
    infrastructure: /broadband|connectivity|digital infrastructure|5g|fiber/.test(lower),
    inclusion: /digital literacy|inclusion|gender|workforce|skills/.test(lower),
    ethics: /ethics|accountability|human oversight|impact assessment/.test(lower),
    funding: /funding|budget|investment|financial/.test(lower),
    regional: /regional|african union|localization|local language/.test(lower),
  }

  const dimensionScores = ITU_DIMENSIONS.map((name, i) => {
    const keys = [
      ['policy', 'ethics', 'funding'],
      ['policy', 'regional'],
      ['data', 'ethics'],
      ['policy', 'inclusion'],
      ['inclusion', 'ethics'],
      ['infrastructure', 'funding'],
      ['regional', 'inclusion'],
    ][i]
    const hits = keys.filter(k => signals[k as keyof typeof signals]).length
    const score = Math.min(72, 22 + hits * 14 + Math.min(12, Math.floor(documentText.length / 400)))
    const level = score < 26 ? 'Nascent' : score < 51 ? 'Developing' : score < 76 ? 'Emerging' : 'Advanced'
    return {
      name,
      score,
      level,
      keyFinding: hits
        ? `Document references themes relevant to ${name.toLowerCase()}.`
        : `Limited explicit coverage of ${name.toLowerCase()} in the uploaded text.`,
      whatIsMissing: hits < 2 ? [`Strengthen ${name.toLowerCase()} with measurable targets and funding.`] : [],
    }
  })

  const overallScore = Math.round(
    dimensionScores.reduce((sum, d) => sum + d.score, 0) / dimensionScores.length
  )
  const readinessLevel =
    overallScore < 26 ? 'Nascent' : overallScore < 51 ? 'Developing' : overallScore < 76 ? 'Emerging' : 'Advanced'

  const gaps = dimensionScores
    .filter(d => d.score < 50)
    .slice(0, 4)
    .map(d => ({
      description: `Insufficient detail on ${d.name} in "${documentName}".`,
      dimension: d.name,
      indicator: 'ITU-AI-RF 2.0',
      severity: d.score < 35 ? 'Critical' : 'Moderate',
      recommendation: `Develop actionable policies and indicators for ${d.name}.`,
    }))

  return {
    demoMode: true,
    overallScore,
    readinessLevel,
    executiveSummary: `Offline preview for ${country}: analysis based on keyword signals in the uploaded text. Connect OpenRouter credits for full AI assessment.`,
    dimensions: dimensionScores,
    gaps,
    strengths: Object.entries(signals)
      .filter(([, v]) => v)
      .slice(0, 3)
      .map(([k]) => `Document addresses ${k.replace(/([A-Z])/g, ' $1').trim()} themes.`),
    priorityActions: [
      `Formalize a national AI governance body for ${country}.`,
      'Allocate dedicated AI implementation funding with annual reporting.',
      'Publish an AI ethics and impact assessment framework.',
    ],
    additionalDocumentsNeeded: ['National AI strategy implementation plan', 'AI ethics framework'],
  }
}

function aiErrorMessage(error: unknown): string {
  const err = error as { status?: number; message?: string; error?: { message?: string } }
  const msg = err.error?.message || err.message || 'AI analysis failed'
  if (err.status === 402) {
    return 'OpenRouter API credits are insufficient. Add credits at openrouter.ai or set AI_MODEL=anthropic/claude-3-haiku in server/.env'
  }
  if (msg.includes('JSON')) return `AI returned invalid JSON: ${msg}`
  return msg
}

async function createCompletion(
  params: Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, 'model'>,
  model: string = MODEL
) {
  try {
    return await client.chat.completions.create({ ...params, model })
  } catch (error) {
    const err = error as { status?: number }
    if (err.status === 402 && model !== FALLBACK_MODEL) {
      return client.chat.completions.create({ ...params, model: FALLBACK_MODEL })
    }
    throw error
  }
}

export const aiService = {
  async analyzeDocument(documentText: string, documentName: string, country: string) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new AppError('OPENROUTER_API_KEY is not configured on the server', 503)
    }

    const placeholderPattern = /^(PDF file selected|File selected for upload)/i
    if (placeholderPattern.test(documentText.trim()) || documentText.trim().length < 80) {
      throw new AppError(
        'Document text is too short or not extracted. Paste the policy text in the textarea, or upload a .txt/.md file.',
        400
      )
    }

    const analyzeSystem =
      'You assess national AI readiness using ITU AI Readiness Framework 2.0. Return ONLY valid JSON. Keep every string field under 20 words.'

    const prompt = `Assess "${documentName}" (${country}) against ITU AI Readiness Framework 2.0.

Document text:
${documentText.substring(0, 6000)}

Return JSON with all 7 ITU dimensions (AI Policy & Strategy, Strategy Alignment, Data & Model Ecosystem, Cross-Domain Correlation, Human Impact & Inclusion, Digital Infrastructure, Contextualization & Regional Fit), 2-4 gaps, strengths, and priorityActions:
{"overallScore":0,"readinessLevel":"Developing","executiveSummary":"","dimensions":[{"name":"","score":0,"level":"Developing","keyFinding":"","whatIsMissing":[""]}],"gaps":[{"description":"","dimension":"","indicator":"","severity":"Moderate","recommendation":""}],"strengths":[""],"priorityActions":[""],"additionalDocumentsNeeded":[""]}`

    const tiers = [
      { model: ANALYZE_MODEL, maxTokens: ANALYZE_MAX_TOKENS },
      { model: FALLBACK_MODEL, maxTokens: 400 },
      { model: FALLBACK_MODEL, maxTokens: 150 },
    ]

    let lastError: AppError | null = null

    for (const tier of tiers) {
      try {
        const response = await createCompletion(
          {
            messages: [
              { role: 'system', content: analyzeSystem },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: tier.maxTokens,
          },
          tier.model
        )

        const content = response.choices[0]?.message?.content
        if (!content) throw new Error('No response from AI model')

        if (response.choices[0]?.finish_reason === 'length') {
          lastError = new AppError(
            'AI response was truncated. Add OpenRouter credits at openrouter.ai or set AI_ANALYZE_MODEL=anthropic/claude-3-haiku in server/.env',
            502
          )
          continue
        }

        return parseJsonContent(content)
      } catch (error) {
        const message = aiErrorMessage(error)
        lastError = new AppError(message, 502)
        if (message.includes('credits') || message.includes('402')) continue
        if (error instanceof AppError) throw error
      }
    }

    if (process.env.AI_DEMO_FALLBACK !== 'false') {
      return buildOfflineAssessment(documentText, documentName, country)
    }

    throw lastError || new AppError('AI analysis failed', 502)
  },

  async gapAnalysis(dimension: string, documentText: string, country: string) {
    const prompt = `Perform a deep-dive gap analysis on the "${dimension}" dimension for ${country}.

Document text:
${documentText.substring(0, 3000)}

Return a JSON object with this exact structure:
{
  "currentStateSummary": "<2-3 sentences>",
  "gaps": [
    {
      "title": "<gap title>",
      "ituIndicator": "<ITU indicator code>",
      "severity": "<Critical|Moderate|Minor>",
      "rootCause": "<Political will|Resources|Awareness|Technical capacity>",
      "consequence": "<what happens if unfilled in 3 years>",
      "quickWin": "<what can be done in 6 months>",
      "fullSolution": "<complete long-term fix>",
      "africanPrecedent": "<African country that addressed this>"
    }
  ],
  "recommendedPolicyLanguage": ["<sample policy clause>", ...]
}`

    const response = await createCompletion({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 800,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI model')
    return parseJsonContent(content)
  },

  async generateRecommendations(assessmentSummary: string, country: string) {
    const prompt = `Generate detailed strategic recommendations for AI readiness improvement.

Country: ${country}
Assessment Context:
${assessmentSummary.substring(0, 20000)}

Return a JSON object:
{
  "immediateActions": [{
    "title": "<action title>",
    "action": "<step-by-step action>",
    "owner": "<ministry/agency>",
    "resources": "<resources needed>",
    "feasibility": <1-5>,
    "expectedOutcome": "<what changes by when>",
    "risks": "<what could go wrong>",
    "ituDimension": "<dimension name>",
    "sdgLink": "<SDG goals>"
  }],
  "shortTermActions": [...],
  "mediumTermActions": [...],
  "longTermVision": "<2-paragraph narrative vision>",
  "regionalCollaborationOpportunities": [
    {"opportunity": "<title>", "partners": "<countries>", "benefit": "<benefit>", "firstStep": "<action>"}
  ],
  "fundingPathways": [
    {"recommendation": "<title>", "funders": "<potential funders>", "mechanism": "<grant/loan/TA>", "budget": "<USD range>"}
  ]
}`

    const response = await createCompletion({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 1200,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI model')
    return parseJsonContent(content)
  },

  async benchmarking(primaryCountry: string, primaryData: string, benchmarkCountry: string, benchmarkData: string) {
    const prompt = `Perform a structured AI readiness benchmarking comparison.

Primary Country: ${primaryCountry}
Primary Assessment Data: ${primaryData.substring(0, 10000)}

Benchmark Country: ${benchmarkCountry}
Benchmark Data: ${benchmarkData.substring(0, 10000)}

Return a JSON object:
{
  "comparativeScores": [
    {"dimension": "<name>", "primaryScore": <0-100>, "benchmarkScore": <0-100>, "delta": <+/-N>, "verdict": "<Ahead|Behind|On par>"}
  ],
  "wherePrimaryLeads": [{"dimension": "<name>", "explanation": "<2 sentences>"}],
  "wherePrimaryLags": [{"dimension": "<name>", "explanation": "<2 sentences>"}],
  "lessonsToBorrow": [
    {"title": "<lesson>", "whatPeerDid": "<specific policy>", "howToAdapt": "<adaptation>", "timeframe": "<time>"}
  ],
  "verdict": "<1-paragraph honest assessment>"
}`

    const response = await createCompletion({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI model')
    return parseJsonContent(content)
  },

  async chat(conversation: { role: string; content: string }[], assessmentContext?: string) {
    const contextMessage = assessmentContext
      ? `Current assessment context:\n${assessmentContext.substring(0, 5000)}`
      : ''

    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT + '\n\n' + contextMessage },
      ...conversation.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const response = await createCompletion({
      messages,
      temperature: 0.5,
      max_tokens: 400,
    })

    return {
      content: response.choices[0]?.message?.content || 'No response',
    }
  },

  async chatStream(
    conversation: { role: string; content: string }[],
    assessmentContext: string | undefined,
    onChunk: (chunk: string) => void
  ) {
    const contextMessage = assessmentContext
      ? `Current assessment context:\n${assessmentContext.substring(0, 5000)}`
      : ''

    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT + '\n\n' + contextMessage },
      ...conversation.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const stream = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.5,
      max_tokens: 400,
      stream: true,
    })

    let fullContent = ''
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || ''
      if (text) {
        fullContent += text
        onChunk(text)
      }
    }

    return fullContent
  },
}
