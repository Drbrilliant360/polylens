const API_BASE = import.meta.env.VITE_API_URL || '/api'

let token: string | null = localStorage.getItem('polylens_token')

export function setAuthToken(t: string | null) {
  token = t
  if (t) localStorage.setItem('polylens_token', t)
  else localStorage.removeItem('polylens_token')
}

export function getToken() {
  if (!token) token = localStorage.getItem('polylens_token')
  return token
}

export function isAuthenticated() {
  return !!getToken()
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  const authToken = getToken()
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    setAuthToken(null)
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'API error')
  }

  if (res.headers.get('content-type')?.includes('application/pdf')) {
    return res.blob() as any
  }

  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, name: string, password: string) =>
      request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, name, password }),
      }),
    me: () => request<any>('/auth/me'),
  },
  assessments: {
    list: () => request<any[]>('/assessments'),
    get: (id: string) => request<any>(`/assessments/${id}`),
    create: (data: any) =>
      request<any>('/assessments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/assessments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<any>(`/assessments/${id}`, { method: 'DELETE' }),
  },
  recommendations: {
    list: (assessmentId: string) => request<any[]>(`/recommendations/${assessmentId}`),
    bulkCreate: (assessmentId: string, recommendations: any[]) =>
      request<any>(`/recommendations/bulk/${assessmentId}`, {
        method: 'POST',
        body: JSON.stringify({ recommendations }),
      }),
  },
  benchmarking: {
    compare: (primaryId: string, benchmarkId: string) =>
      request<any>(`/benchmarking/compare/${primaryId}/${benchmarkId}`),
  },
  trends: {
    compare: (assessmentId: string) => request<any>(`/trends/${assessmentId}`),
  },
  reports: {
    downloadPdf: async (assessmentId: string) => {
      const res = await fetch(`${API_BASE}/reports/${assessmentId}/pdf`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Failed to generate PDF')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `polylens-assessment-${assessmentId}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    },
  },
  ai: {
    analyze: (documentText: string, documentName: string, country: string) =>
      request<any>('/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({ documentText, documentName, country }),
      }),
    gapAnalysis: (dimension: string, documentText: string, country: string) =>
      request<any>('/ai/gap-analysis', {
        method: 'POST',
        body: JSON.stringify({ dimension, documentText, country }),
      }),
    recommendations: (assessmentSummary: string, country: string) =>
      request<any>('/ai/recommendations', {
        method: 'POST',
        body: JSON.stringify({ assessmentSummary, country }),
      }),
    benchmarking: (primaryCountry: string, primaryData: string, benchmarkCountry: string, benchmarkData: string) =>
      request<any>('/ai/benchmarking', {
        method: 'POST',
        body: JSON.stringify({ primaryCountry, primaryData, benchmarkCountry, benchmarkData }),
      }),
    chat: (messages: { role: string; content: string }[], assessmentContext?: string) =>
      request<any>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages, assessmentContext }),
      }),
  },
  documents: {
    upload: async (assessmentId: string, file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/documents/upload/${assessmentId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      return res.json()
    },
  },
}
