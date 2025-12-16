import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Moon, Sun } from 'lucide-react'
import Sidebar from '../components/Sidebar'

const Finances = () => {
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved === 'true'
  })

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    if (newMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        } ${isSidebarOpen ? 'lg:blur-0 blur-[2px]' : ''}`}
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <header
          className="flex items-center justify-between px-6 border-b"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-primary)',
            height: '89px',
          }}
        >
          <div className="flex items-center gap-4">
            {/* Hamburger Menu - Mobile Only */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
              }}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1
                className="text-xl sm:text-2xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                My Finances
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Track your financial information
              </p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
            }}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div
            className="p-8 rounded-lg text-center"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-primary)',
            }}
          >
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              My Finances
            </h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              This page is under construction.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Finances
