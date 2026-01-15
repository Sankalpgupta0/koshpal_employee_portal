import { X, Calendar, Clock, Check, Video } from 'lucide-react'
import { formatUTCToISTTime } from '../utils/timezone'

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

interface BookedSession {
  advisor: Advisor
  date: Date
  time: string
  notes: string
  employee: string
}

interface ConsultationData {
  id: string
  meetingLink: string
  notes?: string
  status: 'CONFIRMED' | 'CANCELLED'
  bookedAt: string
  slot: {
    id: string
    date: string
    startTime: string
    endTime: string
    status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED'
  }
  coach: {
    id: string
    email: string
    fullName: string
    expertise: string[]
    bio?: string
    rating: number
    successRate?: number
    clientsHelped?: number
    location: string
    languages?: string[]
    profilePhoto?: string
  }
}

interface ViewDetailsModalProps {
  isOpen: boolean
  bookedSession?: BookedSession | null
  consultationData?: ConsultationData | null
  onClose: () => void
  formatDate: (date: Date | null) => string
}

const ViewDetailsModal = ({
  isOpen,
  bookedSession,
  consultationData,
  onClose,
  formatDate,
}: ViewDetailsModalProps) => {
  if (!isOpen || (!bookedSession && !consultationData)) return null

  // Convert consultationData to bookedSession format if present
  const displaySession = consultationData
    ? {
        advisor: {
          id: consultationData.coach.id,
          name: consultationData.coach.fullName,
          image: consultationData.coach.profilePhoto || '/placeholder-avatar.jpg',
          rating: consultationData.coach.rating || 0,
          credentials: consultationData.coach.expertise +", " || 'Financial Coach',
          successRate: consultationData.coach.successRate
            ? `${consultationData.coach.successRate}%`
            : '95%',
          clientsHelped: consultationData.coach.clientsHelped || 0,
          location: consultationData.coach.location || 'Remote',
          languages: consultationData.coach.languages || ['English'],
          specialties: consultationData.coach.expertise.map((exp, idx) => ({
            name: exp,
            color: ['secondary', 'warning', 'primary', 'info'][idx % 4],
          })),
          nextAvailable: 'View Calendar',
          availabilityStatus: 'available' as const,
        },
        date: new Date(consultationData.slot.date),
        time: formatUTCToISTTime(consultationData.slot.startTime),
        notes: consultationData.notes || '',
        employee: 'You',
        meetingLink: consultationData.meetingLink,
      }
    : bookedSession || undefined;

  if (!displaySession || !displaySession.advisor) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
        <div className="p-8 text-center border shadow-xl rounded-xl">
          <h2 className="mb-2 text-lg font-bold">Could not load session details.</h2>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2.5 rounded-lg font-semibold text-sm bg-primary text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 backdrop-blur-md sm:pt-12 md:pt-16"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
    >
      <div 
        className="w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="overflow-hidden shadow-2xl rounded-2xl"
          style={{ 
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-primary)'
          }}
        >
          {/* Modal Header */}
          <div 
            className="flex items-center justify-between px-4 py-3 border-b sm:px-5 sm:py-4"
            style={{ 
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-primary)'
            }}
          >
            <h2 
              className="text-base font-bold sm:text-lg"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Session Details
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-opacity-10 rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'transparent',
                color: 'var(--color-text-secondary)'
              }}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="px-4 py-4 space-y-4 sm:px-5 sm:py-5">
            {/* Status Badge */}
            <div className="flex justify-center">
              <div 
                className="px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
                style={{ 
                  backgroundColor: 'rgba(103, 166, 130, 0.12)',
                  color: '#67A682'
                }}
              >
                <Check className="w-3.5 h-3.5" />
                Confirmed
              </div>
            </div>

            {/* Session Info Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div 
                className="p-3 rounded-xl"
                style={{ 
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border-primary)'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Date
                  </span>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {formatDate(displaySession.date)}
                </p>
              </div>

              <div 
                className="p-3 rounded-xl"
                style={{ 
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border-primary)'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Time
                  </span>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {displaySession.time}
                </p>
              </div>
            </div>

            {/* Participant Details */}
            <div 
              className="p-4 space-y-3 rounded-xl"
              style={{ 
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-primary)'
              }}
            >
              <div className="flex items-start gap-3">
                <img
                  src={displaySession.advisor.image}
                  alt={displaySession.advisor.name}
                  className="object-cover w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {displaySession.advisor.name}
                    </h4>
                    <span 
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: 'rgba(51, 78, 172, 0.1)',
                        color: 'var(--color-primary)'
                      }}
                    >
                      Advisor
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {displaySession.advisor.credentials}
                  </p>
                </div>
              </div>

              <div className="h-px" style={{ backgroundColor: 'var(--color-border-primary)' }} />

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="flex items-center justify-center w-8 h-8 text-xs font-semibold rounded-full"
                    style={{ 
                      backgroundColor: 'rgba(51, 78, 172, 0.1)',
                      color: 'var(--color-primary)'
                    }}
                  >
                    {displaySession.employee.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {displaySession.employee}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Participant
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
          {displaySession.notes && (
            <div 
              className="p-3 rounded-xl"
              style={{ 
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-primary)'
              }}
            >
              <h4 className="mb-2 text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Notes
              </h4>
              <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {displaySession.notes}
              </p>
              </div>
            )}

            {/* Meeting Link Info */}
            <div 
              className="p-3 rounded-xl"
              style={{ 
                backgroundColor: 'rgba(51, 78, 172, 0.08)',
                border: '1px solid rgba(51, 78, 172, 0.2)'
              }}
            >
              <div className="flex items-start gap-2">
                <Video className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                <div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-primary)' }}>
                    Google Meet link sent to email
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-primary)', opacity: 0.8 }}>
                    Check your inbox for the meeting link
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div 
            className="px-4 sm:px-5 py-2.5 sm:py-3 border-t"
            style={{ 
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-primary)'
            }}
          >
            <button
              onClick={onClose}
              className="w-full px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewDetailsModal
