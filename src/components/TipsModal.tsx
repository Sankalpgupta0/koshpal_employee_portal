import { X } from 'lucide-react'

interface TipsModalProps {
  isOpen: boolean
  onClose: () => void
}

const TipsModal = ({ isOpen, onClose }: TipsModalProps) => {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
    >
      <div 
        className="w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full"
          style={{ 
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-primary)'
          }}
        >
          {/* Modal Header */}
          <div 
            className="px-4 sm:px-5 py-3 border-b flex items-center justify-between flex-shrink-0"
            style={{ 
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-primary)'
            }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
                style={{ 
                  backgroundColor: 'rgba(51, 78, 172, 0.12)',
                  color: 'var(--color-primary)'
                }}
              >
                <span className="text-sm">💡</span>
                Helpful tips
              </div>
            </div>
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

          {/* Modal Content - Scrollable */}
          <div className="px-4 sm:px-5 py-4 space-y-3 overflow-y-auto flex-1">
            {/* Title and Description */}
            <div 
              className="p-3 rounded-xl border-2 border-dashed"
              style={{ 
                backgroundColor: 'var(--color-bg-tertiary)',
                borderColor: 'var(--color-border-primary)'
              }}
            >
              <h2 
                className="text-lg font-bold mb-1.5"
                style={{ color: 'var(--color-text-primary)' }}
              >
                How to pick a coach that's best for you
              </h2>
              <p 
                className="text-xs leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                When looking for a Coach, it's different than looking for a mentor or a therapist. With 3 million coaching Sessions done worldwide, we know that it takes at least 3 sessions to see which Coach suits you. Here are some tips to keep in mind as you browse profiles.
              </p>
            </div>

            {/* Tips List */}
            <div className="space-y-2.5">
              {/* Tip 1 */}
              <div 
                className="p-3 rounded-xl border-2 border-dashed"
                style={{ 
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderColor: 'var(--color-border-primary)'
                }}
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <div 
                    className="px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0"
                    style={{ 
                      backgroundColor: 'var(--color-primary)',
                      color: 'white'
                    }}
                  >
                    Tip 1
                  </div>
                  <h3 
                    className="text-sm font-bold flex-1"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Choose a Coach based on expertise related to your goals
                  </h3>
                </div>
                <p 
                  className="text-xs leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  With coaching, it's often more helpful to work with a Coach with experience coaching individuals solve similar problems to you. Review the 'Experience' section of the coaches profile closely for this insight.
                </p>
              </div>

              {/* Tip 2 */}
              <div 
                className="p-3 rounded-xl border-2 border-dashed"
                style={{ 
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderColor: 'var(--color-border-primary)'
                }}
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <div 
                    className="px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0"
                    style={{ 
                      backgroundColor: 'var(--color-primary)',
                      color: 'white'
                    }}
                  >
                    Tip 2
                  </div>
                  <h3 
                    className="text-sm font-bold flex-1"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    It's normal to request a new match if you don't feel like it's a good fit
                  </h3>
                </div>
                <p 
                  className="text-xs leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  While it's important to keep an open mind when starting coaching, don't settle if the fit isn't right. You can request a rematch at any time.
                </p>
              </div>

              {/* Tip 3 */}
              <div 
                className="p-3 rounded-xl border-2 border-dashed"
                style={{ 
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderColor: 'var(--color-border-primary)'
                }}
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <div 
                    className="px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0"
                    style={{ 
                      backgroundColor: 'var(--color-primary)',
                      color: 'white'
                    }}
                  >
                    Tip 3
                  </div>
                  <h3 
                    className="text-sm font-bold flex-1"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Find a Coach with a demeanor and style that fits for you
                  </h3>
                </div>
                <p 
                  className="text-xs leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Every Coach has a different approach, style, and personality. Look for a Coach whose approach will resonate with you and what you need.
                </p>
              </div>

              {/* Tip 4 */}
              <div 
                className="p-3 rounded-xl border-2 border-dashed"
                style={{ 
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderColor: 'var(--color-border-primary)'
                }}
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <div 
                    className="px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0"
                    style={{ 
                      backgroundColor: 'var(--color-primary)',
                      color: 'white'
                    }}
                  >
                    Tip 4
                  </div>
                  <h3 
                    className="text-sm font-bold flex-1"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Sometimes demographics matter
                  </h3>
                </div>
                <p 
                  className="text-xs leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  For most people, the demographics of a Coach won't matter, but if what you are working on requires someone who understands your unique experience, consider someone who shares your demographic identity.
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div 
            className="px-4 sm:px-5 py-3 border-t flex-shrink-0"
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
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TipsModal
