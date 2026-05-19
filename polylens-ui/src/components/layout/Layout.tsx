import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar, MobileSidebar } from './Sidebar'
import { Header } from './Header'
import AIChatWidget from '../ai/AIChatWidget'
import { cn } from '../../lib/cn'

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileSidebarOpen])

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <MobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div
        className={cn(
          'min-h-screen flex flex-col transition-[margin] duration-300 ease-out',
          'ml-0',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        )}
      >
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-5 lg:p-6 max-w-[1600px] w-full mx-auto">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <AIChatWidget />
    </div>
  )
}
