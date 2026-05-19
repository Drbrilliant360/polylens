import { useState } from 'react'
import { Menu, Download, Share2, Check } from 'lucide-react'
import { useAssessment } from '../../lib/useAssessment'
import { api } from '../../lib/api'
import { defaultAssessment } from '../../lib/data'
import { Button } from '../ui/Button'
import { cn } from '../../lib/cn'

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { assessment, rawId } = useAssessment()
  const data = assessment || defaultAssessment
  const { country, overallScore, readinessLevel } = data
  const [shareOk, setShareOk] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const id = rawId || (await api.assessments.list())[0]?.id
      if (id) {
        await api.reports.downloadPdf(id)
      } else {
        throw new Error('No assessment')
      }
    } catch {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `polylens-${country.toLowerCase().replace(/\s+/g, '-')}-assessment.json`
      a.click()
      window.URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `PolicyLens AI - ${country}`,
      text: `${country} AI Readiness Assessment: ${overallScore}/100 - ${readinessLevel}`,
      url: window.location.href,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setShareOk(true)
        setTimeout(() => setShareOk(false), 2000)
      }
    } catch {
      /* cancelled */
    }
  }

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between gap-3 h-14 sm:h-16 px-4 lg:px-6">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden -ml-1 shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">PolicyLens AI</h1>
            <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden sm:block">
              AI Readiness Evaluation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div
            className={cn(
              'hidden md:flex items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-lg',
              'bg-gradient-to-r from-policy-50 to-policy-100/80 border border-policy-100'
            )}
          >
            <span className="text-xs font-medium text-policy-700 truncate max-w-[100px] lg:max-w-none">
              {country}
            </span>
            <span className="w-px h-4 bg-policy-200 hidden sm:block" />
            <span className="text-xs font-semibold text-policy-800 tabular-nums">{overallScore}/100</span>
            <span className="text-xs text-policy-600 hidden sm:inline">{readinessLevel}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            disabled={downloading}
            aria-label="Download report"
            title="Download report"
            className="shrink-0"
          >
            <Download className={cn('w-4 h-4', downloading && 'animate-pulse')} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            aria-label="Share assessment"
            title={shareOk ? 'Link copied!' : 'Share assessment'}
            className="shrink-0"
          >
            {shareOk ? <Check className="w-4 h-4 text-accent-600" /> : <Share2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
