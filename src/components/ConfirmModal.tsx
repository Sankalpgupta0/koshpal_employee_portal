import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
}: ConfirmModalProps) => {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getVariantColor = () => {
    switch (variant) {
      case 'danger':
        return '#EF4444' // red
      case 'warning':
        return '#F59E0B' // amber
      case 'info':
        return 'var(--color-primary)'
      default:
        return 'var(--color-primary)'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-lg p-6 shadow-xl"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${getVariantColor()}20` }}
            >
              <AlertTriangle
                className="w-6 h-6"
                style={{ color: getVariantColor() }}
              />
            </div>
            <h2 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:opacity-80 transition-opacity"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <X className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
          </button>
        </div>

        {/* Message */}
        <p
          className="text-body-md mb-6"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-body-md font-semibold hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 rounded-lg text-body-md font-semibold hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: getVariantColor(),
              color: '#FFFFFF',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
