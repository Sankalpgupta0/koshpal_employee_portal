import { useState, useEffect } from 'react'
import { X, Calendar, Clock, Check, Video, Star, MessageSquare, Eye } from 'lucide-react'
import { formatUTCToISTTime } from '../utils/timezone'
import { submitEmployeeFeedback, getEmployeeFeedback, getSharedCoachNote } from '../api/employee'

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
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
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
  const [rating, setRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [sharedNote, setSharedNote] = useState<string | null>(null)
  const [isEditingFeedback, setIsEditingFeedback] = useState(false)
  const [canEditFeedback, setCanEditFeedback] = useState(true)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  useEffect(() => {
    if (isOpen && (consultationData?.id || (bookedSession as any)?.id)) {
      fetchReflectionData()
    }
  }, [isOpen, consultationData, bookedSession])

  const fetchReflectionData = async () => {
    const sessionId = consultationData?.id || (bookedSession as any)?.id
    if (!sessionId) return

    setLoading(true)
    try {
      // Fetch Shared Coach Note
      try {
        const note = await getSharedCoachNote(sessionId)
        setSharedNote(note.notes)
      } catch (err: any) {
        if (err.response?.status !== 404) {
          console.error('Error fetching coach note:', err)
        }
        setSharedNote(null)
      }

      // Fetch Existing Feedback
      try {
        const feedback = await getEmployeeFeedback(sessionId)
        setRating(feedback.rating)
        setFeedbackText(feedback.feedbackText)
        
        // Check 24h window
        const createdAt = new Date(feedback.createdAt)
        const now = new Date()
        const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
        setCanEditFeedback(hoursDiff <= 24)
        setIsEditingFeedback(false)
      } catch (err: any) {
        if (err.response?.status !== 404) {
          console.error('Error fetching feedback:', err)
        }
        setRating(0)
        setFeedbackText('')
        setCanEditFeedback(true)
        setIsEditingFeedback(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFeedback = async () => {
    const sessionId = consultationData?.id || (bookedSession as any)?.id
    if (!sessionId || rating === 0) return

    setSaving(true)
    try {
      await submitEmployeeFeedback(sessionId, rating, feedbackText)
      setIsEditingFeedback(false)
      fetchReflectionData()
    } catch (err: any) {
      console.error('Error saving feedback:', err)
      alert(err.response?.data?.message || 'Failed to save feedback')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || (!bookedSession && !consultationData)) return null

  // Convert consultationData to bookedSession format if present
  const displaySession = consultationData
    ? {
        id: consultationData.id,
        status: consultationData.status,
        advisor: {
          id: consultationData.coach.id,
          name: consultationData.coach.fullName,
          image: consultationData.coach.profilePhoto || '/placeholder-avatar.jpg',
          rating: consultationData.coach.rating || 0,
          credentials: consultationData.coach.expertise.join(', ') || 'Financial Coach',
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
    : { ...bookedSession, status: 'CONFIRMED', id: (bookedSession as any).id } as any;

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

  const isCompleted = displaySession.status === 'COMPLETED' || (bookedSession as any)?.status === 'COMPLETED';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 backdrop-blur-md sm:pt-12 md:pt-16 overflow-y-auto"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
    >
      <div 
        className="w-full max-w-xl pb-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="overflow-hidden shadow-2xl rounded-2xl"
          style={{ 
            backgroundColor: 'white',
            border: '1px solid var(--color-border-primary)'
          }}
        >
          {/* Modal Header */}
          <div 
            className="flex items-center justify-between px-4 py-3 border-b sm:px-5 sm:py-4"
            style={{ 
              backgroundColor: 'white',
              borderColor: 'var(--color-border-primary)'
            }}
          >
            <h2 className="text-base font-bold sm:text-lg text-[#333333]">
              Session Details
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-[#808080]"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="px-4 py-4 space-y-4 sm:px-5 sm:py-5">
            {/* Status Badge */}
            <div className="flex justify-center">
              <div 
                className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${isCompleted ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {isCompleted ? 'Completed' : 'Confirmed'}
              </div>
            </div>

            {/* Session Info Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-gray-500">Date</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(displaySession.date)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-gray-500">Time</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {displaySession.time}
                </p>
              </div>
            </div>

            {/* Participant Details */}
            <div className="p-4 space-y-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-start gap-3">
                <img
                  src={displaySession.advisor.image}
                  alt={displaySession.advisor.name}
                  className="object-cover w-12 h-12 rounded-full ring-2 ring-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-semibold text-gray-900">
                    {displaySession.advisor.name}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold uppercase tracking-wider">
                      Advisor
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                  {displaySession.advisor.credentials}
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-200" />

              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
                  {displaySession.employee.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{displaySession.employee}</p>
                  <p className="text-xs text-gray-500">Participant</p>
                </div>
              </div>
            </div>

            {/* Coach's Shared Notes */}
            {isCompleted && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  Coach's Reflections
                </h3>
                {loading ? (
                    <div className="p-4 animate-pulse bg-gray-50 rounded-lg border border-dashed border-gray-200 h-20" />
                ) : sharedNote ? (
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-400" />
                    <p className="text-sm text-gray-700 leading-relaxed italic">
                      "{sharedNote}"
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
                    <p className="text-xs text-gray-500 italic">No shared notes from the coach yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Employee Feedback Section */}
            {isCompleted && (
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Your Feedback</h3>
                    {!isEditingFeedback && canEditFeedback && (
                        <button 
                            onClick={() => setIsEditingFeedback(true)}
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            Edit Feedback
                        </button>
                    )}
                  </div>

                  {isEditingFeedback ? (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">How was your session with {displaySession.advisor.name}?</p>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              onClick={() => setRating(s)}
                              onMouseEnter={() => setHoverRating(s)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star 
                                className={`w-6 h-6 ${s <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="What did you think of the session? Any specific takeaways?"
                        rows={3}
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
                      />

                      <div className="flex justify-end gap-2">
                        {rating > 0 && (
                            <button
                                onClick={() => setIsEditingFeedback(false && rating > 0)}
                                className="px-4 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                          onClick={handleSaveFeedback}
                          disabled={saving || rating === 0}
                          className="px-4 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 shadow-sm"
                        >
                          {saving ? 'Saving...' : 'Submit Feedback'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50/30 border border-yellow-100 rounded-xl">
                        <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star 
                                    key={s}
                                    className={`w-4 h-4 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-gray-600 italic">
                            {feedbackText || "No written feedback provided."}
                        </p>
                        {!canEditFeedback && (
                            <p className="mt-2 text-[10px] text-gray-400">
                                Feedback can no longer be edited (24h window passed).
                            </p>
                        )}
                    </div>
                  )}
                </div>
            )}

            {/* Meeting Link Info (only if confirmed) */}
            {!isCompleted && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-start gap-2">
                    <Video className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    <div>
                    <p className="text-xs font-medium mb-0.5 text-primary">
                        Google Meet link is ready
                    </p>
                    <p className="text-xs text-primary opacity-80">
                        You can join the session directly from your dashboard
                    </p>
                    </div>
                </div>
                </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-4 sm:px-5 py-3 border-t border-gray-100 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-2 rounded-xl font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              className="px-6 py-2 rounded-xl font-semibold text-sm bg-primary text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10"
            >
              <MessageSquare className="w-4 h-4" />
              Message Coach
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewDetailsModal
