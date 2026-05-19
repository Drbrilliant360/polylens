import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import {
  LayoutDashboard, FileText, AlertTriangle, BarChart3,
  Lightbulb, TrendingUp, ChevronLeft, ChevronRight, X, Sparkles
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/assessment', icon: FileText, label: 'Assessment Report' },
  { to: '/gaps', icon: AlertTriangle, label: 'Gap Analysis' },
  { to: '/benchmarking', icon: BarChart3, label: 'Benchmarking' },
  { to: '/recommendations', icon: Lightbulb, label: 'Recommendations' },
  { to: '/trends', icon: TrendingUp, label: 'Trend Monitoring' },
  { to: '/analyze', icon: Sparkles, label: 'Document Analysis' },
]

function NavItem({
  to,
  icon: Icon,
  label,
  collapsed,
  end,
  onNavigate,
}: {
  to: string
  icon: typeof LayoutDashboard
  label: string
  collapsed?: boolean
  end?: boolean
  onNavigate?: () => void
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'nav-auto group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-policy-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900',
          isActive
            ? 'bg-policy-600 text-white shadow-md shadow-policy-900/30'
            : 'text-slate-300 hover:bg-surface-800 hover:text-white hover:translate-x-0.5'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              'w-5 h-5 flex-shrink-0 transition-transform duration-200',
              !isActive && 'group-hover:scale-110'
            )}
          />
          {!collapsed && <span className="truncate">{label}</span>}
          {isActive && !collapsed && (
            <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/80" />
          )}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={cn(
        'hidden lg:flex fixed left-0 top-0 h-full bg-surface-900 text-white flex-col z-30',
        'transition-[width] duration-300 ease-out shadow-xl shadow-black/10',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex items-center gap-3 h-16 px-4 border-b border-surface-700 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-policy-400 to-policy-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-policy-900/40">
          <span className="text-white font-bold text-sm">PL</span>
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm whitespace-nowrap">
            PolicyLens <span className="text-policy-300">AI</span>
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="p-2 border-t border-surface-700 flex-shrink-0">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg',
            'text-slate-400 hover:text-white hover:bg-surface-800',
            'transition-all duration-200 active:scale-95',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-policy-400'
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Collapse</>}
        </button>
      </div>
    </aside>
  )
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-surface-900 text-white flex flex-col z-50 w-[min(280px,85vw)]',
          'transition-transform duration-300 ease-out shadow-2xl lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-policy-400 to-policy-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PL</span>
            </div>
            <span className="font-semibold text-sm">
              PolicyLens <span className="text-policy-300">AI</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} onNavigate={onClose} />
          ))}
        </nav>
      </aside>
    </>
  )
}
