import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Moon, Sun, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import Sidebar from '../components/Sidebar'

interface Event {
  id: string
  title: string
  participant: string
  time: string
  day: string
  date: string
}

const Schedule = () => {
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved === 'true'
  })
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(2025, 9, 5)) // Oct 5, 2025

  // Dummy events data
  const events: Event[] = [
    {
      id: '1',
      title: 'Investment portfolio review',
      participant: 'Sneha Desai',
      time: '10:00 AM',
      day: 'Sat',
      date: 'Oct 11'
    },
    {
      id: '2',
      title: 'Tax planning for FY',
      participant: 'Harsh Kumar',
      time: '11:00 AM',
      day: 'Sat',
      date: 'Oct 11'
    },
    {
      id: '3',
      title: 'Retirement planning',
      participant: 'Priya Mehta',
      time: '2:00 PM',
      day: 'Sat',
      date: 'Oct 11'
    }
  ]

  // Calculate stats
  const scheduled = events.length
  const tentative = 1
  const minutesBooked = 360
  const availableSlots = 12

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
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Page Title */}
            <div>
              <h1 className="text-sm sm:text-md font-regular font-outfit mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Manage your schedule and availability
              </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Scheduled */}
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-primary)'
                }}
              >
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {scheduled}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Scheduled
                </div>
              </div>

              {/* Tentative */}
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-primary)'
                }}
              >
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {tentative}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Tentative
                </div>
              </div>

              {/* Minutes Booked */}
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-primary)'
                }}
              >
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {minutesBooked}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Minutes Booked
                </div>
              </div>

              {/* Available Slots */}
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-primary)'
                }}
              >
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {availableSlots}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Available Slots
                </div>
              </div>
            </div>

            {/* Calendar Section */}
            <div 
              className="rounded-xl overflow-hidden"
              style={{ 
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-primary)'
              }}
            >
              {/* Calendar Header with Navigation */}
              <div 
                className="px-4 py-3 flex items-center justify-between border-b"
                style={{ borderColor: 'var(--color-border-primary)' }}
              >
                <div className="flex items-center gap-2">
                  <button
                    className="p-1.5 rounded hover:bg-opacity-80 transition-colors"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                  >
                    <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
                  </button>
                  <button
                    className="px-3 py-1.5 rounded text-sm font-medium"
                    style={{ 
                      backgroundColor: 'var(--color-bg-tertiary)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    Today
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-opacity-80 transition-colors"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                  >
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Week Days Header */}
                  <div 
                    className="grid grid-cols-8 border-b"
                    style={{ borderColor: 'var(--color-border-primary)' }}
                  >
                    <div className="p-3"></div>
                    {['Sun, Oct 5', 'Mon, Oct 6', 'Tue, Oct 7', 'Wed, Oct 8', 'Thu, Oct 9', 'Fri, Oct 10', 'Sat, Oct 11'].map((day, index) => (
                      <div 
                        key={index}
                        className={`p-3 text-center text-sm font-medium ${day.includes('Sat, Oct 11') ? 'text-blue-600' : ''}`}
                        style={{ color: day.includes('Sat, Oct 11') ? '#4A5EAF' : 'var(--color-text-primary)' }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  <div className="relative">
                    {['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM'].map((time, timeIndex) => (
                      <div 
                        key={timeIndex}
                        className="grid grid-cols-8 border-b"
                        style={{ borderColor: 'var(--color-border-primary)' }}
                      >
                        {/* Time Label */}
                        <div 
                          className="p-3 text-sm font-medium border-r"
                          style={{ 
                            color: 'var(--color-text-secondary)',
                            borderColor: 'var(--color-border-primary)'
                          }}
                        >
                          {time}
                        </div>
                        
                        {/* Day Cells */}
                        {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                          <div 
                            key={dayIndex}
                            className="relative p-1 border-r min-h-[60px]"
                            style={{ 
                              borderColor: 'var(--color-border-primary)',
                              backgroundColor: dayIndex === 6 ? 'rgba(74, 94, 175, 0.02)' : 'transparent'
                            }}
                          >
                            {/* Events */}
                            {dayIndex === 6 && time === '10 AM' && (
                              <div 
                                className="rounded p-2 text-xs"
                                style={{ 
                                  backgroundColor: 'rgba(147, 197, 253, 0.3)',
                                  border: '1px solid rgba(59, 130, 246, 0.5)'
                                }}
                              >
                                <div className="flex items-center gap-1 mb-0.5">
                                  <Calendar className="w-3 h-3" style={{ color: '#334EAC' }} />
                                  <span className="font-semibold" style={{ color: '#334EAC' }}>
                                    Sneha Desai
                                  </span>
                                </div>
                                <div className="text-xs" style={{ color: '#334EAC' }}>
                                  Investment portfolio review
                                </div>
                              </div>
                            )}
                            {dayIndex === 6 && time === '11 AM' && (
                              <div 
                                className="rounded p-2 text-xs"
                                style={{ 
                                  backgroundColor: 'rgba(147, 197, 253, 0.3)',
                                  border: '1px solid rgba(59, 130, 246, 0.5)'
                                }}
                              >
                                <div className="flex items-center gap-1 mb-0.5">
                                  <Calendar className="w-3 h-3" style={{ color: '#334EAC' }} />
                                  <span className="font-semibold" style={{ color: '#334EAC' }}>
                                    Harsh Kumar
                                  </span>
                                </div>
                                <div className="text-xs" style={{ color: '#334EAC' }}>
                                  Tax planning for FY
                                </div>
                              </div>
                            )}
                            {dayIndex === 6 && time === '2 PM' && (
                              <div 
                                className="rounded p-2 text-xs"
                                style={{ 
                                  backgroundColor: 'rgba(147, 197, 253, 0.3)',
                                  border: '1px solid rgba(59, 130, 246, 0.5)'
                                }}
                              >
                                <div className="flex items-center gap-1 mb-0.5">
                                  <Calendar className="w-3 h-3" style={{ color: '#334EAC' }} />
                                  <span className="font-semibold" style={{ color: '#334EAC' }}>
                                    Priya Mehta
                                  </span>
                                </div>
                                <div className="text-xs" style={{ color: '#334EAC' }}>
                                  Retirement planning
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Schedule
