import { Clock, ExternalLink, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Toast from './Toast'

interface Session {
  id: string
  date?: string
  time?: string
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
  counselorName?: string
  sessionType?: string
  meetingLink?: string
  slot?: {
    startTime: string
    endTime: string
  }
}

interface YourSessionProps {
  sessionDetails?: Session | null
}

const YourSession = ({ sessionDetails }: YourSessionProps) => {
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('error')

  const currentSession = sessionDetails

  const handleViewDetails = async () => {
    if (!sessionDetails?.id) return;
    try {
      // const details = await getConsultationDetails(sessionDetails.id);
      const details = sessionDetails;
      // console.log("view details : ", details);
      if (!details || !details.id) {
        setToastMessage('Session details not found');
        setToastType('error');
        setShowToast(true);
        return;
      }
      navigate('/sessions', {
        state: {
          openViewDetails: true,
          consultationData: details,
        },
      });
    } catch (error) {
      setToastMessage('Failed to load consultation details');
      setToastType('error');
      setShowToast(true);
    }
  }  

  const getStatusBgColor = (status: string = '') => {
    const upperStatus = status.toUpperCase()
    switch (upperStatus) {
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
      className="p-4 rounded-lg md:p-6"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-primary)',
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Section - Session Info */}
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-full"
            style={{ backgroundColor: 'var(--color-primary-lightest)' }}
          >
            <User className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
          </div>

          {/* Session Details */}
          <div className="flex-1 min-w-0">
            <h3 className="mb-1 text-h4" style={{ color: 'var(--color-text-primary)' }}>
              Your Session
            </h3>
            <div className="flex flex-wrap items-center gap-2">
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
                className="px-2 py-1 font-semibold rounded text-caption"
                style={{
                  backgroundColor: getStatusBgColor(currentSession?.status || ''),
                  color: "white",
                }}
              >
                {currentSession?.status ? 
                  currentSession.status.charAt(0).toUpperCase() + currentSession.status.slice(1).toLowerCase() 
                  : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-3 sm:flex-shrink-0">
          <button
            onClick={handleViewDetails}
            className="px-4 py-2 font-semibold transition-opacity border rounded-lg text-body-md hover:opacity-80"
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
              if (currentSession?.meetingLink) {
                window.open(currentSession.meetingLink, '_blank');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 font-semibold transition-opacity rounded-lg text-body-md hover:opacity-90"
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
      
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setShowToast(false)} 
        />
      )}
    </div>
  )
}

export default YourSession
