import {
  Home,
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Settings,
  X,
  ChevronLeft,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const Sidebar = ({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', badge: null },
    { icon: BookOpen, label: 'Resources', path: '/resources', badge: null },
    { icon: Users, label: 'Sessions', path: '/sessions', badge: null },
    { icon: Calendar, label: 'Calendar', path: '/calendar', badge: 5 },
    { icon: TrendingUp, label: 'My Finances', path: '/finances', badge: null },
    { icon: Settings, label: 'Settings', path: '/settings', badge: null },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {/* Overlay - Transparent clickable area (Mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'} lg:translate-x-0 w-72`}
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderRight: '1px solid var(--color-border-primary)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 border-b" style={{ borderColor: 'var(--color-border-primary)', height: '89px' }}>
            {!isCollapsed && (
              <div className="flex items-center gap-3 transition-opacity duration-500">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <img src="/logo.png" alt="logo" className="w-8 h-8 sm:w-8 sm:h-8 bg-transparent" />
                </div>
                <span
                  className="text-h3"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Koshpal
                </span>
              </div>
            )}

            {/* Close button - Mobile Only */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
              }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Toggle Collapse button - Desktop Only */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:block p-2 rounded-lg hover:opacity-80 transition-all"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                }}
                aria-label="Toggle sidebar"
              >
                <ChevronLeft
                  className={`w-5 h-5 transition-transform ${
                    isCollapsed ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)

                return (
                  <li key={item.path}>
                    <button
                      onClick={() => {
                        navigate(item.path)
                        onClose()
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isCollapsed ? 'justify-center' : ''
                      }`}
                      style={{
                        backgroundColor: active
                          ? 'var(--color-bg-secondary)'
                          : 'transparent',
                        color: active
                          ? 'var(--color-primary)'
                          : 'var(--color-text-secondary)',
                      }}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left text-body-md">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className="px-2 py-0.5 text-label rounded-full"
                              style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'var(--color-text-inverse)',
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer - Monthly Goal & User Profile */}
          {!isCollapsed && (
            <div className="p-4 border-t space-y-4" style={{ borderColor: 'var(--color-border-primary)' }}>
              {/* Monthly Goal */}
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--color-success)',
                      color: 'var(--color-text-inverse)',
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <circle cx="12" cy="12" r="6" strokeWidth="2" />
                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-subtitle"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Monthly Goal
                    </p>
                  </div>
                  <span
                    className="text-mono-numeric"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    67%
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: '67%',
                      backgroundColor: 'var(--color-success)',
                    }}
                  />
                </div>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3 p-3 rounded-lg hover:opacity-80 cursor-pointer transition-all" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-text-inverse)',
                  }}
                >
                  {user.name
                    ? user.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'HK'}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-subtitle truncate"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {user.name || 'Harsh Kumar'}
                  </p>
                  <p
                    className="text-caption truncate"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    View Profile
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
