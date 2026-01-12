import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowUpRight, MapPin, Users, TrendingUp, Star, Languages, Menu } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import YourSession from '../components/YourSession'
import BookingModal from '../components/BookingModal'
import ViewDetailsModal from '../components/ViewDetailsModal'
import TipsModal from '../components/TipsModal'
import { getCoaches, bookConsultation } from '../api/coaches'
import { getSlotsByDate, getSlotsByCoachAndDate, getAvailableDates } from '../api/slots'
import type { Coach, CoachSlot, Consultation } from '../api/coaches'
import { getEmployeeLatestConsultation } from '../api/employee'
import { dateToISTDateString, formatUTCToISTTime } from '../utils/timezone'

interface Advisor {
  id: string
  name: string
  image: string
  rating: number
  credentials: string
  successRate: string
  clientsHelped: number
  location: string
  languages: string[]
  specialties: Array<{ name: string; color: string }>
  nextAvailable: string
  availabilityStatus: 'available' | 'busy'
}

const Sessions = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved === 'true'
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date()) // Current month
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [bookedSession, setBookedSession] = useState<{
    advisor: Advisor
    date: Date
    time: string
    notes: string
    employee: string
    meetingLink?: string
  } | null>(null)
  const [consultationData, setConsultationData] = useState<Consultation | null>(null)
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false)
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [loading, setLoading] = useState(true)
  const [availableSlots, setAvailableSlots] = useState<CoachSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [datesWithSlots, setDatesWithSlots] = useState<Set<string>>(new Set())
  const hasFetched = useRef(false)
  const [latestConsultation, setLatestConsultation] = useState<any>(null)

  // Handle navigation from YourSession component
  useEffect(() => {
    if (location.state?.openViewDetails) {
      if (location.state?.consultationData) {
        setConsultationData(location.state.consultationData);
        setIsViewDetailsOpen(true);
      } else {
        setConsultationData(null);
        setIsViewDetailsOpen(true);
      }
      // Clear the state to avoid reopening on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Default time slots (used when no slots are loaded yet)

  // Fetch coaches from backend
  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const fetchCoaches = async () => {
      try {
        setLoading(true)
        const coaches = await getCoaches()
        
        // Transform backend data to match UI format
        const transformedAdvisors: Advisor[] = coaches.map((coach: Coach) => ({
          id: coach.id,
          name: coach.fullName,
          image: coach.profilePhoto || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
          rating: coach.rating,
          credentials: coach.expertise.slice(0, 2).join(', '),
          successRate: `${coach.successRate}%`,
          clientsHelped: coach.clientsHelped,
          location: coach.location || 'Remote',
          languages: coach.languages,
          specialties: coach.expertise.map((exp, idx) => ({
            name: exp,
            color: ['secondary', 'warning', 'primary', 'info'][idx % 4],
          })),
          nextAvailable: 'View Calendar',
          availabilityStatus: 'available' as const,
        }))

        const latestConsultationResponse = await getEmployeeLatestConsultation();
        console.log("latest Consultation : " , latestConsultationResponse);
        
        // Check if latest consultation is in the past, if so set to null
        let finalLatestConsultation = latestConsultationResponse;
        if (latestConsultationResponse && latestConsultationResponse.slot) {
          const consultationDate = new Date(latestConsultationResponse.slot.startTime);
          const now = new Date();
          if (consultationDate < now) {
            finalLatestConsultation = null;
          }
        }
        
        setLatestConsultation(finalLatestConsultation);
        
        setAdvisors(transformedAdvisors)
      } catch (error) {
        console.error('Error fetching coaches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCoaches()
  }, [])

  // Fetch all slots for the current month to determine which dates have availability
  useEffect(() => {
    if (selectedAdvisor) {
      const fetchMonthSlots = async () => {
        try {
          const year = currentMonth.getFullYear()
          const month = currentMonth.getMonth()
          
          // Calculate first and last day of month
          const firstDay = new Date(year, month, 1)
          const lastDay = new Date(year, month + 1, 0)
          
          // Format dates as YYYY-MM-DD
          const startDate = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`
          const endDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`
          
          // NEW API: Fetch availability for entire month
          const availability = await getAvailableDates(startDate, endDate, selectedAdvisor.id)
          
          // Convert to Set of dates with slots
          const datesSet = new Set<string>(
            Object.entries(availability)
              .filter(([_, data]) => data.hasSlots)
              .map(([date]) => date)
          )
          
          setDatesWithSlots(datesSet)
        } catch (error) {
          console.error('Error fetching month slots:', error)
        }
      }
      fetchMonthSlots()
    }
  }, [selectedAdvisor, currentMonth])

  // Fetch slots when date is selected
  useEffect(() => {
    if (selectedDate && selectedAdvisor) {
      const fetchSlots = async () => {
        try {
          setLoadingSlots(true)
          // Convert selected date to YYYY-MM-DD string (IST)
          const selectedDateStr = dateToISTDateString(selectedDate)
          
          console.log('Fetching slots for date:', selectedDateStr, 'coach:', selectedAdvisor.id)
          
          // NEW API: Get slots for specific coach and date
          const coachData = await getSlotsByCoachAndDate(selectedAdvisor.id, selectedDateStr)
          
          console.log('Received coach data:', coachData)
          
          if (coachData && coachData.slots.length > 0) {
            const transformedSlots: CoachSlot[] = coachData.slots.map(slot => ({
              id: slot.slotId,
              coachId: selectedAdvisor.id,
              date: selectedDateStr,
              startTime: slot.startTime,
              endTime: slot.endTime,
              slotDate: slot.slotDate,
              status: (slot.status || 'AVAILABLE') as 'AVAILABLE' | 'BOOKED' | 'CANCELLED',
            }))
            console.log('Transformed slots:', transformedSlots)
            setAvailableSlots(transformedSlots)
          } else {
            console.log('No slots found for this coach on this date')
            setAvailableSlots([])
          }
        } catch (error) {
          console.error('Error fetching slots:', error)
          setAvailableSlots([])
        } finally {
          setLoadingSlots(false)
        }
      }
      fetchSlots()
    } else if (!selectedDate) {
      // Clear slots when date is deselected
      setAvailableSlots([])
    }
  }, [selectedDate, selectedAdvisor])

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  const getSpecialtyStyles = (color: string) => {
    switch (color) {
      case 'secondary':
        return {
          backgroundColor: 'rgba(23, 162, 184, 0.12)',
          color: '#17A2B8',
          borderColor: '#7BB5BE',
        }
      case 'warning':
        return {
          backgroundColor: '#FEF9ED',
          color: '#EB8A14',
          borderColor: '#FCC178',
        }
      case 'primary':
        return {
          backgroundColor: '#EFF1F8',
          color: '#334EAC',
          borderColor: '#CCD3EA',
        }
      default:
        return {
          backgroundColor: 'var(--color-bg-tertiary)',
          color: 'var(--color-text-secondary)',
          borderColor: 'var(--color-border-primary)',
        }
    }
  }

  const handleBookSession = (advisor: Advisor) => {
    setSelectedAdvisor(advisor)
    setCurrentStep(1)
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedSlotId(null)
    setNotes('')
    setAvailableSlots([])
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentStep(1)
    setSelectedDate(null)
    setSelectedTime(null)
    setNotes('')
    setSelectedAdvisor(null)
  }

  const handleNextStep = async () => {
    if (currentStep === 2 && selectedAdvisor && selectedDate && selectedTime && selectedSlotId) {
      try {
        setLoadingSlots(true) // Show loading state
        
        // Book the consultation via API
        const result = await bookConsultation({
          slotId: selectedSlotId,
          notes: notes || undefined,
        })

        // Save booking data for display with meeting link
        setBookedSession({
          advisor: selectedAdvisor,
          date: selectedDate,
          time: selectedTime,
          notes: notes,
          employee: JSON.parse(localStorage.getItem('user') || '{}').fullName || 'Employee',
          meetingLink: result.booking.meetingLink,
        })

        // Log booking details
        console.log('Session Booked Successfully:', {
          advisor: selectedAdvisor.name,
          date: formatDate(selectedDate),
          time: selectedTime,
          notes: notes,
          meetingLink: result.booking.meetingLink,
        })

        // Move to confirmation step
        setCurrentStep(3)
      } catch (error: any) {
        console.error('Error booking session:', error)
        
        // Show user-friendly error message
        const errorMessage = 
          error.response?.data?.message ||
          error.response?.status === 429 ? 'Too many booking attempts. Please wait a moment and try again.' :
          error.response?.status === 400 ? 'This time slot is no longer available. Please select another time.' :
          'Failed to book session. Please try again.'
        
        alert(errorMessage)
        
        // If slot was taken, refresh slots
        if (error.response?.status === 400) {
          setSelectedTime(null)
          setSelectedSlotId(null)
          // Refresh available slots
          if (selectedDate) {
            const year = selectedDate.getFullYear()
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
            const day = String(selectedDate.getDate()).padStart(2, '0')
            const dateStr = `${year}-${month}-${day}`
            try {
              const coachesWithSlots = await getAllCoachSlots(dateStr)
              const coachData = coachesWithSlots.find(c => c.coachId === selectedAdvisor.id)
              if (coachData) {
                const transformedSlots: CoachSlot[] = coachData.slots.map(slot => ({
                  id: slot.slotId,
                  coachId: selectedAdvisor.id,
                  date: dateStr,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  status: 'AVAILABLE' as const,
                }))
                setAvailableSlots(transformedSlots)
              }
            } catch (refreshError) {
              console.error('Error refreshing slots:', refreshError)
            }
          }
        }
      } finally {
        setLoadingSlots(false)
      }
      return // Don't auto-advance
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleViewDetails = () => {
    setIsViewDetailsOpen(true)
  }

  const handleCloseViewDetails = () => {
    setIsViewDetailsOpen(false)
    setConsultationData(null)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDateShort = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek }
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
    const days = []
    const prevMonthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate()
    
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(
        <button
          key={`prev-${i}`}
          disabled
          className="flex items-center justify-center h-8 text-xs sm:h-10 sm:text-sm"
          style={{ color: 'var(--color-text-tertiary)', opacity: 0.3 }}
        >
          {prevMonthDays - i}
        </button>
      )
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      // CRITICAL: Format date as YYYY-MM-DD in local timezone, not UTC
      // Backend returns slotDate in IST format (YYYY-MM-DD)
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const isSelected = selectedDate?.toDateString() === date.toDateString()
      const hasSlots = datesWithSlots.has(dateStr)
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
      
      days.push(
        <button
          key={day}
          onClick={() => hasSlots && !isPast && setSelectedDate(date)}
          disabled={!hasSlots || isPast}
          className="flex items-center justify-center h-8 text-xs transition-colors rounded-lg sm:h-10 sm:text-sm hover:bg-opacity-80"
          style={{
            backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
            color: isSelected ? 'white' : hasSlots && !isPast ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
            fontWeight: isSelected ? '600' : hasSlots ? '500' : '400',
            opacity: hasSlots && !isPast ? 1 : 0.4,
            cursor: hasSlots && !isPast ? 'pointer' : 'not-allowed',
          }}
        >
          {day}
        </button>
      )
    }
    
    // Next month days to fill the grid
    const totalCells = days.length
    const remainingCells = 42 - totalCells // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <button
          key={`next-${day}`}
          disabled
          className="flex items-center justify-center h-8 text-xs sm:h-10 sm:text-sm"
          style={{ color: 'var(--color-text-tertiary)', opacity: 0.3 }}
        >
          {day}
        </button>
      )
    }
    
    return days
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
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 border-b"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-primary)',
            height: '89px',
          }}
        >
          {/* Hamburger Menu - Mobile Only */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 transition-opacity rounded-lg lg:hidden hover:opacity-80"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
            }}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            {/* Notification Bell */}
            {/* <button
              className="relative p-2 transition-opacity rounded-lg hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
              }}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1"></span>
            </button> */}

          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mx-auto space-y-5 max-w-7xl">
            {/* Page Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-1 text-3xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Financial Advisors <span className="hidden md:inline">💼</span>
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Connect with expert advisors for personalized guidance
                </p>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  backgroundColor: '#E6F0EA',
                  border: '0.8px solid #CCE1D5',
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#67A682' }}></div>
                <span className="text-sm font-semibold" style={{ color: '#67A682' }}>
                  {advisors.length} Available
                </span>
              </div>
            </div>

            {/* Your Session Card */}
            {
              latestConsultation && <YourSession sessionDetails={latestConsultation} />
            }
            

            {/* Advisors Grid */}
            {loading ? (
              <div className="py-12 text-center">
                <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                  Loading coaches...
                </p>
              </div>
            ) : advisors.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                  No coaches available at the moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {advisors.map((advisor) => (
                <div
                  key={advisor.id}
                  className="p-4 rounded-2xl"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  {/* Advisor Header */}
                  <div className="flex gap-4 mb-3">
                    {/* Profile Image */}
                    <div className="flex-shrink-0 h-32 overflow-hidden w-28 rounded-2xl">
                      <img
                        src={advisor.image}
                        alt={advisor.name}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* Advisor Info */}
                    <div className="flex flex-col flex-1 gap-2">
                      <div>
                        <h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {advisor.name}
                        </h3>
                        
                        {/* Rating */}
                        <div
                          className="inline-flex items-center gap-1 px-2 py-1 mb-2 rounded-xl"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.10)',
                          }}
                        >
                          <Star className="w-3 h-3 fill-[#EB8A14] text-[#EB8A14]" />
                          <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {advisor.rating}
                          </span>
                        </div>

                        {/* Credentials Badge */}
                        <div
                          className="inline-block px-2 py-1 text-xs font-semibold rounded-md"
                          style={{
                            backgroundColor: '#17A2B8',
                            color: 'white',
                          }}
                        >
                          {advisor.credentials}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
                          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            {advisor.successRate} Success Rate
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
                          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {advisor.clientsHelped} Clients Helped
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
                          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            {advisor.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Languages className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
                          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            {advisor.languages.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {advisor.specialties.map((specialty, index) => {
                      const styles = getSpecialtyStyles(specialty.color)
                      return (
                        <span
                          key={index}
                          className="px-2 py-1.5 rounded-md text-xs font-semibold"
                          style={{
                            backgroundColor: styles.backgroundColor,
                            color: styles.color,
                            border: `0.8px solid ${styles.borderColor}`,
                          }}
                        >
                          {specialty.name}
                        </span>
                      )
                    })}
                  </div>

                  {/* Next Available */}
                  {/* <div
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.60)',
                      border: '0.8px solid rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {advisor.nextAvailable}
                      </span>
                    </div>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                      style={{
                        backgroundColor: 'rgba(23, 162, 184, 0.12)',
                        color: '#17A2B8',
                      }}
                    >
                      Available
                    </span>
                  </div> */}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 px-4 py-3 text-sm font-semibold transition-opacity rounded-lg cursor-pointer hover:opacity-90"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        color: 'var(--color-text-primary)',
                        border: '1.5px solid var(--color-border-primary)',
                      }}
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleBookSession(advisor)}
                      className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-sm font-bold transition-opacity rounded-lg cursor-pointer hover:opacity-90"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-text-inverse)',
                        boxShadow: '0px 4px 16px rgba(51, 78, 172, 0.30)',
                      }}
                    >
                      Book Session
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Banner - Find New Coach */}
          <div 
            className="px-6 py-4 mt-10 border-t"
            style={{
              // backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-primary)',
            }}
          >
            <div 
              className="flex flex-col items-start justify-between gap-3 p-4 rounded-xl sm:flex-row sm:items-center"
              style={{
                background: 'linear-gradient(135deg, #4A5EAF 0%, #5DA9A1 100%)',
              }}
            >
              <div className="flex-1">
                <h3 className="mb-1 text-base font-bold text-white sm:text-lg">
                  Still struggling to find coach?
                </h3>
                <p className="text-sm text-white text-opacity-90">
                  Tell us more and we can recommend you new coaches
                </p>
              </div>
              <button
                onClick={() => setIsTipsModalOpen(true)}
                className="px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{
                  backgroundColor: 'white',
                  color: '#4A5EAF',
                }}
              >
                Find new coach
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <BookingModal
        isOpen={isModalOpen}
        selectedAdvisor={selectedAdvisor}
        currentStep={currentStep}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        notes={notes}
        currentMonth={currentMonth}
        loadingSlots={loadingSlots}
        timeSlots={loadingSlots 
          ? [] 
          : availableSlots.map(slot => {
              // Convert UTC timestamp to IST time for display
              return formatUTCToISTTime(slot.startTime)
            })
        }
        onClose={handleCloseModal}
        onNext={handleNextStep}
        onPrevious={handlePreviousStep}
        onSelectTime={(time) => {
          setSelectedTime(time)
          // Find the corresponding slot ID by matching IST time
          const matchingSlot = availableSlots.find(slot => 
            formatUTCToISTTime(slot.startTime) === time
          )
          if (matchingSlot) {
            setSelectedSlotId(matchingSlot.id)
          }
        }}
        onSetNotes={setNotes}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        onViewDetails={handleViewDetails}
        formatDate={formatDate}
        formatDateShort={formatDateShort}
        formatMonthYear={formatMonthYear}
        renderCalendar={renderCalendar}
      />

      {/* Fallback UI for blank page issue */}
      {isViewDetailsOpen && !consultationData && (
        <div style={{ padding: 32, textAlign: 'center', color: 'red' }}>
          Could not load session details.
        </div>
      )}
      <ViewDetailsModal
        isOpen={isViewDetailsOpen}
        bookedSession={bookedSession}
        consultationData={consultationData}
        onClose={handleCloseViewDetails}
        formatDate={formatDate}
      />

      <TipsModal
        isOpen={isTipsModalOpen}
        onClose={() => setIsTipsModalOpen(false)}
      />
    </div>
  )
}

export default Sessions

