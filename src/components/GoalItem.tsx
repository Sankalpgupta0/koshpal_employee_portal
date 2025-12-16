import { Trash2, Edit2 } from 'lucide-react'

interface GoalItemProps {
  icon: string
  title: string
  current: number
  target: number
  percentage: number
  goalDate?: string
  onEdit?: () => void
  onDelete?: () => void
}

const GoalItem = ({ icon, title, current, target, percentage, goalDate, onEdit, onDelete }: GoalItemProps) => {
  return (
    <div
      className="p-4 rounded-lg"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-3xl">{icon}</div>
          <div className="flex-1">
            <h4 className="text-h4" style={{ color: 'var(--color-text-primary)' }}>
              {title}
            </h4>
            <p className="text-body-md" style={{ color: 'var(--color-text-secondary)' }}>
              ₹{current.toLocaleString()} / ₹{target.toLocaleString()}
            </p>
            {goalDate && (
              <p className="text-caption mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                Target: {new Date(goalDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1.5 rounded-full text-body-md font-semibold"
            style={{
              backgroundColor: 'var(--color-primary-lightest)',
              color: 'var(--color-primary)',
            }}
          >
            {percentage}%
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 rounded-lg hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-primary)',
              }}
              title="Edit goal"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 rounded-lg hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: 'var(--color-error-light)',
                color: 'var(--color-error-dark)',
              }}
              title="Delete goal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: 'var(--color-primary)',
          }}
        />
      </div>
    </div>
  )
}

export default GoalItem
