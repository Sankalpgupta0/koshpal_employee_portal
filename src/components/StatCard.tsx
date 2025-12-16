import { Edit2 } from 'lucide-react'

interface StatCardProps {
  title: string
  amount: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  trend?: string
  trendDirection?: 'up' | 'down'
  gradientFrom?: string
  gradientTo?: string
  iconBgColor?: string
  trendBgColor?: string
  onEdit?: () => void
}

const StatCard = ({
  title,
  amount,
  icon: Icon,
  trend,
  trendDirection = 'up',
  gradientFrom = '#4F46E5',
  gradientTo = '#7C3AED',
  iconBgColor = 'rgba(255, 255, 255, 0.2)',
  trendBgColor = 'rgba(255, 255, 255, 0.2)',
  onEdit,
}: StatCardProps) => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 shadow-lg transition-transform duration-300 hover:scale-105"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
      />
      <div
        className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full opacity-10"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
      />

      <div className="relative z-10 flex items-start justify-between">
        {/* Icon */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>

        <div className="flex items-center gap-2">
          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Edit"
            >
              <Edit2 className="h-4 w-4 text-white" />
            </button>
          )}

          {/* Trend Badge */}
          {trend && (
            <div
              className="flex items-center gap-1 rounded-full px-3 py-1.5"
              style={{ backgroundColor: trendBgColor }}
            >
              <svg
                className={`h-4 w-4 text-white ${
                  trendDirection === 'down' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span className="text-sm font-semibold text-white">{trend}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mt-4">
        <p 
          className="uppercase tracking-wider text-white opacity-90"
          style={{
            fontFamily: 'Plus Jakarta Sans',
            fontSize: '0.625rem',
            fontWeight: 600,
            lineHeight: '0.75rem',
            letterSpacing: '0.12em'
          }}
        >
          {title}
        </p>
        <p 
          className="mt-1.5 text-white"
          style={{
            fontFamily: 'Outfit',
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: '2.5rem',
            letterSpacing: '-0.01em'
          }}
        >
          {amount}
        </p>
      </div>
    </div>
  )
}

export default StatCard
