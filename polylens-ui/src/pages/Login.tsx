import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { inputClass } from '../lib/inputStyles'

export default function Login() {
  const { login, register } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('admin@polylens.ai')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isRegister) {
        await register(email, name, password)
      } else {
        await login(email, password)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-policy-50/30 to-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-policy-500 to-policy-700 text-white text-xl font-bold mb-4 shadow-lg shadow-policy-500/30 transition-transform hover:scale-105">
            PL
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">PolicyLens AI</h1>
          <p className="text-sm text-slate-500 mt-1">AI Readiness Evaluation Platform</p>
        </div>

        <Card padding="lg" className="shadow-lg border-slate-200/80">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">{error}</p>
            )}

            <Button type="submit" disabled={busy} fullWidth size="lg">
              {busy ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-policy-600 hover:text-policy-800 font-medium transition-colors underline-offset-2 hover:underline"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </Card>

        <p className="text-xs text-slate-400 text-center mt-6">
          Demo credentials: admin@polylens.ai / password123
        </p>
      </div>
    </div>
  )
}
