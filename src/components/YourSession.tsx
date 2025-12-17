import { Clock, ExternalLink, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Session {
  id: string
  date: string
  time: string
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
  counselorName?: string
  sessionType?: string
  meetingLink?: string
}

interface YourSessionProps {
  sessionDetails?: Session | null
}

const YourSession = ({ sessionDetails }: YourSessionProps) => {
  const navigate = useNavigate()

  const currentSession = sessionDetails

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'var(--color-success)'
      case 'pending':
        return 'var(--color-warning)'
      case 'cancelled':
        return 'var(--color-error)'
      default:
        return 'var(--color-text-secondary)'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'var(--color-success-light)'
      case 'PENDING':
        return 'var(--color-warning-light)'
      case 'CANCELLED':
        return 'var(--color-error-light)'
      default:
        return 'var(--color-bg-tertiary)'
    }
  }

  return (
    <div
      className="p-4 md:p-6 rounded-lg"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-primary)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left Section - Session Info */}
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--color-primary-lightest)' }}
          >
            <User className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
          </div>

          {/* Session Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-h4 mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Your Session
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <span
                  className="text-body-md"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {currentSession?.slot?.startTime
                    ? new Date(currentSession.slot.startTime).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                    : ''}
                </span>

              </div>
              <span
                className="px-2 py-1 rounded text-caption font-semibold"
                style={{
                  backgroundColor: getStatusBgColor(currentSession?.status),
                  color: "white",
                }}
              >
                {currentSession?.status?.charAt(0).toUpperCase() + currentSession?.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-3 sm:flex-shrink-0">
          <button
            onClick={() => navigate('/sessions')}
            className="px-4 py-2 rounded-lg text-body-md font-semibold hover:opacity-80 transition-opacity border"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-primary)',
              borderColor: 'var(--color-primary)',
            }}
          >
            View Details
          </button>
          <button
            onClick={() => {
              // TODO: Implement join session logic

              console.log(currentSession?.meetingLink)
            }}
            className="px-4 py-2 rounded-lg text-body-md font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
            }}
          >
            Join Session
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default YourSession
