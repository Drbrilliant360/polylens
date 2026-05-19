import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider, useAuth } from './lib/auth'
import { Layout } from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Assessment from './pages/Assessment'
import GapAnalysis from './pages/GapAnalysis'
import Benchmarking from './pages/Benchmarking'
import Recommendations from './pages/Recommendations'
import TrendMonitoring from './pages/TrendMonitoring'
import DocumentAnalysis from './pages/DocumentAnalysis'
import Login from './pages/Login'

function AppRoutes() {
  const { user } = useAuth()
  if (!user) return <Login />
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/gaps" element={<GapAnalysis />} />
        <Route path="/benchmarking" element={<Benchmarking />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/trends" element={<TrendMonitoring />} />
        <Route path="/analyze" element={<DocumentAnalysis />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
