import { useState, useCallback } from 'react'
import { api } from '../lib/api'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { inputClass, textareaClass } from '../lib/inputStyles'
import { cn } from '../lib/cn'
import { Upload, FileText, Loader2, CheckCircle, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react'

const PLACEHOLDER_DOC_TEXT = [
  'PDF file selected. Text extraction will be handled by the server.',
  'File selected for upload.',
]

function isExtractableDocText(text: string) {
  const trimmed = text.trim()
  if (!trimmed || PLACEHOLDER_DOC_TEXT.includes(trimmed)) return false
  return trimmed.length >= 80
}

export default function DocumentAnalysisPage() {
  const [file, setFile] = useState<File | null>(null)
  const [country, setCountry] = useState('')
  const [docName, setDocName] = useState('')
  const [docText, setDocText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'upload' | 'review' | 'results'>('upload')

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setDocName(f.name.replace(/\.[^/.]+$/, ''))
    setError('')

    if (f.type === 'text/plain' || f.name.endsWith('.txt') || f.name.endsWith('.md')) {
      const text = await f.text()
      setDocText(text)
    } else if (f.type === 'application/pdf') {
      setDocText('')
      setError('PDF uploaded — paste the document text below (automatic PDF extraction is not enabled yet).')
    } else {
      setDocText('')
      setError('Word documents are not auto-parsed — paste the document text below, or upload a .txt/.md file.')
    }
  }, [])

  async function handleAnalyze() {
    if (!country.trim()) {
      setError('Enter the country or institution name.')
      return
    }
    if (!isExtractableDocText(docText)) {
      setError(
        file?.name.endsWith('.pdf') || file?.type === 'application/pdf'
          ? 'Paste the PDF content into the Document Text field — the server cannot read PDF files from upload alone yet.'
          : 'Add at least 80 characters of document text (paste content or upload a .txt/.md file).'
      )
      return
    }
    setAnalyzing(true)
    setError('')

    try {
      const assessment = await api.ai.analyze(docText, docName, country)
      setResult(assessment)

      const dimensions = (assessment.dimensions || []).map((d: any) => ({
        name: d.name,
        score: d.score,
        keyFinding: d.keyFinding || (d.whatIsMissing?.length ? d.whatIsMissing.join('; ') : ''),
      }))
      const gaps = (assessment.gaps || []).map((g: any) => ({
        description: g.description,
        dimension: g.dimension,
        indicator: g.indicator || '',
        severity: g.severity,
        recommendation: g.recommendation || '',
      }))

      if (dimensions.length > 0) {
        try {
          await api.assessments.create({
            title: docName,
            country,
            documentName: docName,
            dimensions,
            gaps,
          })
        } catch {
          // Assessment save is optional
        }
      }

      setStep('results')
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handlePasteText = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocText(e.target.value)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Analysis"
        subtitle="Upload a policy document for AI-powered readiness assessment"
        action={
          result ? (
            <Badge variant={result.readinessLevel} className="text-sm px-3 py-1">
              {result.readinessLevel}
            </Badge>
          ) : undefined
        }
      />

      {step !== 'results' && (
        <Card padding="lg" className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-policy-100 text-policy-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Upload Policy Document</h3>
              <p className="text-xs text-slate-500">PDF, DOC, DOCX, TXT, or MD (max 20MB)</p>
            </div>
          </div>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 sm:p-8 cursor-pointer transition-all duration-200 hover:border-policy-400 hover:bg-policy-50/60 hover:shadow-sm active:scale-[0.99] focus-within:ring-2 focus-within:ring-policy-300 focus-within:border-policy-400">
            <FileText className="w-10 h-10 text-slate-300 mb-3" />
            <span className="text-sm font-medium text-slate-600">
              {file ? file.name : 'Click to upload or drag and drop'}
            </span>
            {file && <span className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</span>}
            <input type="file" accept=".pdf,.doc,.docx,.txt,.md" onChange={handleFileChange} className="hidden" />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Country / Institution</label>
              <input
                type="text" value={country} onChange={e => setCountry(e.target.value)}
                placeholder="e.g., Tanzania, Kenya"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Document Name</label>
              <input
                type="text" value={docName} onChange={e => setDocName(e.target.value)}
                placeholder="e.g., National ICT Policy 2023"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Document Text <span className="text-slate-400">(paste or edit extracted text)</span>
            </label>
            <textarea
              value={docText}
              onChange={handlePasteText}
              rows={8}
              placeholder="Paste the document text here, or upload a file above..."
              className={cn(textareaClass, 'min-h-[160px] text-xs')}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {!analyzing && (!country.trim() || !isExtractableDocText(docText)) && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              {!country.trim()
                ? 'Enter a country to enable analysis.'
                : 'Paste document text (80+ characters) or upload a .txt/.md file to enable analysis.'}
            </p>
          )}

          <Button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || !country.trim() || !isExtractableDocText(docText)}
            fullWidth
            size="lg"
          >
            {analyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Running assessment...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Run AI Readiness Assessment</>
            )}
          </Button>
        </Card>
      )}

      {result && (
          <div className="space-y-5">
          {result.demoMode && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Preview mode: OpenRouter credits are low or unavailable. Results are estimated from your text. Add credits for full AI analysis.
            </div>
          )}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white',
                result.overallScore < 26 ? 'bg-red-500' :
                result.overallScore < 51 ? 'bg-amber-500' :
                result.overallScore < 76 ? 'bg-emerald-500' : 'bg-blue-600'
              )}>
                {result.overallScore ?? '—'}
              </div>
              <div>
                <p className="text-xs text-slate-500">Overall Readiness Score</p>
                <p className="text-lg font-bold text-slate-900">{result.readinessLevel || 'Not assessed'}</p>
              </div>
              <div className="flex-1">
                <ProgressBar value={result.overallScore ?? 0} size="lg" />
              </div>
            </div>
            {result.executiveSummary && (
              <p className="text-sm text-slate-600 leading-relaxed">{result.executiveSummary}</p>
            )}
          </div>

          {result.dimensions?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.dimensions.map((dim: any) => (
                <div key={dim.name} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-slate-900">{dim.name}</h4>
                    <Badge variant={dim.level || 'Developing'}>{dim.score ?? '—'}</Badge>
                  </div>
                  <ProgressBar value={dim.score ?? 0} size="sm" showLabel />
                  {dim.keyFinding && <p className="text-xs text-slate-500 mt-2">{dim.keyFinding}</p>}
                  {dim.whatIsMissing?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <p className="text-xs font-medium text-red-600">Gaps:</p>
                      <ul className="mt-1 space-y-0.5">
                        {dim.whatIsMissing.slice(0, 2).map((item: string, i: number) => (
                          <li key={i} className="text-xs text-slate-500 flex gap-1">
                            <span className="text-red-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {result.gaps?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Identified Gaps</h3>
              <div className="space-y-3">
                {result.gaps.map((gap: any, i: number) => (
                  <div key={i} className={cn(
                    'p-3 rounded-lg border',
                    gap.severity === 'Critical' ? 'bg-red-50 border-red-100' :
                    gap.severity === 'Moderate' ? 'bg-amber-50 border-amber-100' :
                    'bg-slate-50 border-slate-200'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={gap.severity || 'Moderate'}>{gap.severity || 'Moderate'}</Badge>
                      {gap.dimension && <span className="text-xs text-slate-400">{gap.dimension}</span>}
                    </div>
                    <p className="text-xs text-slate-700">{gap.description}</p>
                    {gap.recommendation && (
                      <p className="text-xs text-slate-500 mt-1">
                        <span className="font-medium">Recommendation:</span> {gap.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.priorityActions?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Priority Action Plan</h3>
              <div className="space-y-3">
                {result.priorityActions.map((action: string, i: number) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg bg-policy-50 border border-policy-100">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-policy-600 text-white text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-xs text-slate-700">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.additionalDocumentsNeeded?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Additional Documents Needed</h3>
              <ul className="space-y-2">
                {result.additionalDocumentsNeeded.map((doc: string, i: number) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-600">
                    <ArrowRight className="w-3.5 h-3.5 text-policy-500 flex-shrink-0 mt-0.5" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.strengths?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Strengths</h3>
              <div className="space-y-2">
                {result.strengths.map((s: string, i: number) => (
                  <div key={i} className="flex gap-2 text-xs text-emerald-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setStep('upload'); setResult(null); setFile(null); setDocText(''); setCountry(''); setError('') }}
            >
              Analyze Another Document
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
