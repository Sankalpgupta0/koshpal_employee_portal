import React from 'react'
import { X, ChevronLeft, ChevronRight, Clock, Calendar, Check, Video } from 'lucide-react'

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

interface BookingModalProps {
  isOpen: boolean
  selectedAdvisor: Advisor | null
  currentStep: number
  selectedDate: Date | null
  selectedTime: string | null
  notes: string
  currentMonth: Date
  timeSlots: string[]
  loadingSlots?: boolean
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
  onSelectTime: (time: string) => void
  onSetNotes: (notes: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onViewDetails: () => void
  formatDate: (date: Date | null) => string
  formatDateShort: (date: Date | null) => string
  formatMonthYear: (date: Date) => string
  renderCalendar: () => React.JSX.Element[]
}

const BookingModal = ({
  isOpen,
  selectedAdvisor,
  currentStep,
  selectedDate,
  selectedTime,
  notes,
  currentMonth,
  timeSlots,
  loadingSlots = false,
  onClose,
  onNext,
  onPrevious,
  onSelectTime,
  onSetNotes,
  onPrevMonth,
  onNextMonth,
  onViewDetails,
  formatDate,
  formatDateShort,
  formatMonthYear,
  renderCalendar,
}: BookingModalProps) => {
  if (!isOpen || !selectedAdvisor) return null

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-xs"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
      onClick={onClose}
    >
      <div className="min-h-screen flex items-start justify-center p-4 pt-8 sm:pt-12 md:pt-16">
        <div 
          className="rounded-3xl shadow-2xl w-full max-w-xl mb-8"
          style={{ backgroundColor: 'var(--color-bg-card)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b" style={{ 
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-primary)'
          }}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {currentStep === 3 ? 'Session Confirmation' : 'Schedule Session'}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-opacity-80 transition-colors"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              >
                <X className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            </div>
            
            {/* Step Indicator */}
            {currentStep < 3 && (
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors"
                      style={{
                        backgroundColor: step <= currentStep ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                        color: step <= currentStep ? 'white' : 'var(--color-text-secondary)',
                      }}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div 
                        className="h-0.5 w-8 sm:w-12"
                        style={{ backgroundColor: 'var(--color-border-primary)' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            {currentStep === 3 && (
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                      }}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div 
                        className="h-0.5 w-8 sm:w-12"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* Modal Content */}
        <div className="px-4 sm:px-5 py-3 sm:py-4">
          {/* Step 1: Date Selection */}
          {currentStep === 1 && (
            <div className="space-y-3 sm:space-y-4">
              {/* Advisor Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={selectedAdvisor.image}
                    alt={selectedAdvisor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedAdvisor.name}
                  </h3>
                  <div
                    className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold mt-1"
                    style={{
                      backgroundColor: '#17A2B8',
                      color: 'white',
                    }}
                  >
                    {selectedAdvisor.credentials}
                  </div>
                </div>
                <div
                  className="px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: '#E6F0EA',
                    color: '#67A682',
                  }}
                >
                  Available
                </div>
              </div>

              {/* Choose date & time */}
              <div>
                <h4 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  Choose date & time
                </h4>
                
                {/* Date and Time Slots Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Date Section */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 sm:mb-3" style={{ color: 'var(--color-text-primary)' }}>
                      Date
                    </label>

                    {/* Calendar */}
                    <div 
                      className="rounded-xl p-2 sm:p-3"
                      style={{ 
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border-primary)'
                      }}
                    >
                      {/* Month Navigation */}
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <button
                          onClick={onPrevMonth}
                          className="p-1.5 sm:p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                          style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                        >
                          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: 'var(--color-text-primary)' }} />
                        </button>
                        <span className="text-sm sm:text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {formatMonthYear(currentMonth)}
                        </span>
                        <button
                          onClick={onNextMonth}
                          className="p-1.5 sm:p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                          style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                        >
                          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: 'var(--color-text-primary)' }} />
                        </button>
                      </div>

                      {/* Day Headers */}
                      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                          <div 
                            key={day} 
                            className="h-6 sm:h-8 flex items-center justify-center text-[10px] sm:text-xs font-medium"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Days */}
                      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                        {renderCalendar()}
                      </div>
                    </div>
                  </div>

                  {/* Time Slots Section */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 sm:mb-3" style={{ color: 'var(--color-text-primary)' }}>
                      Available Time Slots
                    </label>
                    <div className="space-y-1.5 sm:space-y-2 max-h-[300px] overflow-y-auto">
                      {loadingSlots ? (
                        <div 
                          className="px-3 py-8 rounded-lg text-center"
                          style={{
                            backgroundColor: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border-primary)',
                          }}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" 
                                 style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              Loading available slots...
                            </p>
                          </div>
                        </div>
                      ) : timeSlots.length === 0 ? (
                        <div 
                          className="px-3 py-8 rounded-lg text-center"
                          style={{
                            backgroundColor: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border-primary)',
                          }}
                        >
                          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {selectedDate ? 'No slots available for this date' : 'Please select a date first'}
                          </p>
                        </div>
                      ) : (
                        timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => onSelectTime(time)}
                            className="w-full px-3 py-2 sm:py-2.5 rounded-lg text-left flex items-center gap-2 hover:bg-opacity-80 transition-colors"
                            style={{
                              backgroundColor: selectedTime === time ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                              color: selectedTime === time ? 'white' : 'var(--color-text-primary)',
                              border: `1px solid ${selectedTime === time ? 'var(--color-primary)' : 'var(--color-border-primary)'}`,
                            }}
                          >
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">{time}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Review & Confirm */}
          {currentStep === 2 && (
            <div className="space-y-3 sm:space-y-4">
              {/* Advisor Info */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={selectedAdvisor.image}
                    alt={selectedAdvisor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedAdvisor.name}
                  </h3>
                  <div
                    className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold mt-1"
                    style={{
                      backgroundColor: '#17A2B8',
                      color: 'white',
                    }}
                  >
                    {selectedAdvisor.credentials}
                  </div>
                </div>
                <div
                  className="px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: '#E6F0EA',
                    color: '#67A682',
                  }}
                >
                  Available
                </div>
              </div>

              {/* Selected Date and Time */}
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className="p-4 rounded-xl"
                  style={{ 
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-primary)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                    <span className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                      Date
                    </span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {formatDate(selectedDate)}
                  </p>
                </div>
                <div 
                  className="p-4 rounded-xl"
                  style={{ 
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-primary)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                    <span className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                      Time
                    </span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {selectedTime ? `${selectedTime.split(' ')[0]} - ${parseInt(selectedTime.split(':')[0]) + 1}:00` : ''}
                  </p>
                </div>
              </div>

              {/* Review & Confirm Section */}
              <div>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  Review & Confirm
                </h4>
                
                <div 
                  className="p-4 rounded-xl space-y-3"
                  style={{ 
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-primary)'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Employee:</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>John Doe</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Advisor:</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{selectedAdvisor.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Date:</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatDateShort(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Time:</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{selectedTime}</span>
                  </div>
                </div>
              </div>

              {/* Add Notes */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Add Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => onSetNotes(e.target.value)}
                  placeholder="Add any internal notes about this session..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-primary)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>

              {/* Info Box */}
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'rgba(51, 78, 172, 0.08)',
                  border: '1px solid rgba(51, 78, 172, 0.2)'
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-primary)' }}>
                      Calendar invite will be sent to both participant and advisor
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-primary)' }}>
                      Google Meet link will be automatically generated
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-3 sm:space-y-4">
              {/* Success Banner */}
              <div 
                className="rounded-2xl p-6 text-center"
                style={{ 
                  background: 'linear-gradient(135deg, #4A5EAF 0%, #5DA9A1 100%)',
                }}
              >
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#67A682' }}
                  >
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Session Booked
                </h3>
                <p className="text-sm text-white text-opacity-90">
                  Your financial Session is confirmed
                </p>
              </div>

              {/* Confirmation Message */}
              <div 
                className="p-4 rounded-xl text-center"
                style={{ 
                  backgroundColor: 'rgba(23, 162, 184, 0.08)',
                  border: '1px solid rgba(23, 162, 184, 0.2)'
                }}
              >
                <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  Confirmation email sent to your registered address
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div 
          className="px-4 sm:px-5 py-2.5 sm:py-3 border-t flex items-center gap-2 sm:gap-3"
          style={{ 
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-primary)'
          }}
        >
          {currentStep === 3 ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm hover:bg-opacity-80 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-primary)',
                }}
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Reschedule</span>
                <span className="sm:hidden">Reschedule</span>
              </button>
              <button
                onClick={onViewDetails}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 sm:gap-2"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                }}
              >
                View Details
              </button>
            </>
          ) : (
            <>
              <button
                onClick={currentStep === 1 ? onClose : onPrevious}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm hover:bg-opacity-80 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <button
                onClick={onNext}
                disabled={
                  (currentStep === 1 && (!selectedDate || !selectedTime || timeSlots.length === 0)) ||
                  (currentStep === 2 && false)
                }
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                }}
              >
                <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {currentStep === 2 ? 'Book Session' : 'Next'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
  )
}

export default BookingModal
