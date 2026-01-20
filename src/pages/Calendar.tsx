import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Menu } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { getMyConsultations, getMyConsultationStats, type Consultation, type ConsultationStats } from '../api/coaches'

const Schedule = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved === 'true'
  })
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek)
    startOfWeek.setHours(0, 0, 0, 0)
    return startOfWeek
  })

  // State for consultations and stats
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [stats, setStats] = useState<ConsultationStats>({
    total: 0,
    past: 0,
    upcoming: 0,
    thisWeek: 0,
    thisMonth: 0,
    minutesBooked: 0,
    confirmed: 0,
    cancelled: 0
  })
  const [loading, setLoading] = useState(true)

  // Fetch consultations and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Calculate the date range for the current week being displayed
        const weekStart = new Date(currentWeekStart)
        const weekEnd = new Date(currentWeekStart)
        weekEnd.setDate(currentWeekStart.getDate() + 6)
        
        const startDate = weekStart.toISOString().split('T')[0] // YYYY-MM-DD format
        const endDate = weekEnd.toISOString().split('T')[0] // YYYY-MM-DD format
        
        const [consultationsData, statsData] = await Promise.all([
          getMyConsultations(undefined, startDate, endDate),
          getMyConsultationStats()
        ])
        setConsultations(consultationsData)
        // console.log("consultationsData", consultationsData);
        // console.log("Week range:", startDate, "to", endDate);
        setStats(statsData)
      } catch (error) {
        console.error('Error fetching consultation data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentWeekStart])

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

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
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 border-b"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-primary)',
            height: '89px',
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 transition-opacity rounded-lg lg:hidden hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
              }}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              {isSidebarCollapsed && (
                <div className="items-center hidden gap-1 mb-1 lg:flex">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl">
                    <img src="/logo.png" alt="Koshpal logo" className="w-[80px] h-[40px] bg-transparent" />
                  </div>
                  <h1 className="text-h2" style={{ color: 'var(--color-text-primary)' }}>
                    Koshpal
                  </h1>
                </div>
              )}
              
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 overflow-y-auto sm:p-6">
          <div className="mx-auto space-y-4 max-w-7xl">
            {/* Page Title */}
            <div>
              <h1 className="mb-1 text-sm sm:text-md font-regular font-outfit" style={{ color: 'var(--color-text-primary)' }}>
                Manage your schedule and availability
              </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {/* This Week */}
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-primary)'
                }}
              >
                <div className="mb-1 text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {loading ? '...' : stats.thisWeek}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  This Week
                </div>
              </div>

              {/* This Month */}
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-primary)'
                }}
              >
                <div className="mb-1 text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {loading ? '...' : stats.thisMonth}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  This Month
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
                <div className="mb-1 text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {loading ? '...' : Math.round(stats.minutesBooked)}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Minutes Booked
                </div>
              </div>

              {/* Confirmed */}
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-primary)'
                }}
              >
                <div className="mb-1 text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {loading ? '...' : stats.confirmed}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Confirmed
                </div>
              </div>
            </div>

            {/* Calendar Section */}
            <div 
              className="overflow-hidden rounded-xl"
              style={{ 
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-primary)'
              }}
            >
              {/* Calendar Header with Navigation */}
              <div 
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'var(--color-border-primary)' }}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newWeekStart = new Date(currentWeekStart)
                      newWeekStart.setDate(currentWeekStart.getDate() - 7)
                      setCurrentWeekStart(newWeekStart)
                    }}
                    className="p-1.5 rounded hover:bg-opacity-80 transition-colors"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                  >
                    <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date()
                      const dayOfWeek = today.getDay()
                      const startOfWeek = new Date(today)
                      startOfWeek.setDate(today.getDate() - dayOfWeek)
                      startOfWeek.setHours(0, 0, 0, 0)
                      setCurrentWeekStart(startOfWeek)
                    }}
                    className="px-3 py-1.5 rounded text-sm font-medium"
                    style={{ 
                      backgroundColor: 'var(--color-bg-tertiary)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const newWeekStart = new Date(currentWeekStart)
                      newWeekStart.setDate(currentWeekStart.getDate() + 7)
                      setCurrentWeekStart(newWeekStart)
                    }}
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
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = new Date(currentWeekStart)
                      date.setDate(currentWeekStart.getDate() + i)
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      const isToday = date.toDateString() === new Date().toDateString()
                      
                      return (
                        <div 
                          key={i}
                          className="p-3 text-sm font-medium text-center"
                          style={{ color: isToday ? '#4A5EAF' : 'var(--color-text-primary)' }}
                        >
                          {dayName}, {monthDay}
                        </div>
                      )
                    })}
                  </div>

                  {/* Time Slots */}
                  <div className="relative">
                    {['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'].map((timeSlot, timeIndex) => (
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
                          {timeSlot}
                        </div>
                        
                        {/* Day Cells */}
                        {Array.from({ length: 7 }, (_, dayIndex) => {
                          const cellDate = new Date(currentWeekStart)
                          cellDate.setDate(currentWeekStart.getDate() + dayIndex)
                          const isToday = cellDate.toDateString() === new Date().toDateString()
                          
                          // Find events for this day and time slot
                          const cellEvents = consultations.filter(consultation => {
                            const slotDate = new Date(consultation.slot.date)
                            const startTime = new Date(consultation.slot.startTime)
                            
                            // Check if the consultation is on the same day
                            if (slotDate.toDateString() !== cellDate.toDateString()) {
                              return false
                            }
                            
                            // Parse the time slot (e.g., "8 AM" -> hour 8, "1 PM" -> hour 13)
                            const timeSlotParts = timeSlot.split(' ')
                            let slotHour = parseInt(timeSlotParts[0])
                            if (timeSlotParts[1] === 'PM' && slotHour !== 12) {
                              slotHour += 12
                            } else if (timeSlotParts[1] === 'AM' && slotHour === 12) {
                              slotHour = 0
                            }
                            
                            // Check if consultation starts within this hour
                            const consultationHour = startTime.getHours()
                            return consultationHour === slotHour
                          })
                          
                          return (
                            <div 
                              key={dayIndex}
                              className="relative p-1 border-r min-h-[60px]"
                              style={{ 
                                borderColor: 'var(--color-border-primary)',
                                backgroundColor: isToday ? 'rgba(74, 94, 175, 0.02)' : 'transparent'
                              }}
                            >
                              {/* Events */}
                              {cellEvents.map(consultation => (
                                <div 
                                  key={consultation.id}
                                  className="p-2 mb-1 text-xs rounded"
                                  style={{ 
                                    backgroundColor: consultation.status === 'CONFIRMED' 
                                      ? 'rgba(147, 197, 253, 0.3)' 
                                      : 'rgba(251, 191, 36, 0.3)',
                                    border: consultation.status === 'CONFIRMED'
                                      ? '1px solid rgba(59, 130, 246, 0.5)'
                                      : '1px solid rgba(245, 158, 11, 0.5)'
                                  }}
                                >
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <Calendar className="w-3 h-3" style={{ color: '#334EAC' }} />
                                    <span className="font-semibold" style={{ color: '#334EAC' }}>
                                      {consultation.coach.fullName}
                                    </span>
                                  </div>
                                  <div className="text-xs" style={{ color: '#334EAC' }}>
                                    {consultation.coach.expertise.slice(0, 2).join(', ')}
                                  </div>
                                  {consultation.meetingLink && (
                                    <a 
                                      href={consultation.meetingLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block mt-1 text-xs underline"
                                      style={{ color: '#334EAC' }}
                                    >
                                      Join Meeting
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )
                        })}
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
