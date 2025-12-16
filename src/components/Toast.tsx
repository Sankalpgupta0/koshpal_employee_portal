import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--color-success)',
          text: 'white',
          icon: 'white',
        }
      case 'error':
        return {
          bg: 'var(--color-error)',
          text: 'white',
          icon: 'white',
        }
      case 'info':
        return {
          bg: 'var(--color-primary)',
          text: 'white',
          icon: 'white',
        }
    }
  }

  const colors = getColors()

  return (
    <div
      className="fixed top-4 right-4 z-[9999] animate-slide-in sm:max-w-md max-w-[calc(100vw-2rem)]"
    >
      <div
        className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-lg shadow-xl"
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ color: colors.icon, flexShrink: 0 }}>{getIcon()}</div>
        <p className="flex-1 text-sm sm:text-base font-semibold leading-tight">{message}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-white/20 transition-all flex-shrink-0"
          style={{ color: colors.text }}
          aria-label="Close notification"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  )
}

export default Toast
