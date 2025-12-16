import { useState } from 'react'
import { X } from 'lucide-react'

interface AddGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (goal: {
    goalName: string
    icon: string
    goalAmount: number
    saving: number
    goalDate: string
  }) => void
}

const AddGoalModal = ({ isOpen, onClose, onSubmit }: AddGoalModalProps) => {
  const [formData, setFormData] = useState({
    goalName: '',
    icon: '🎯',
    goalAmount: '',
    saving: '',
    goalDate: '',
  })

  const emojiOptions = ['🏛️', '✈️', '📱', '🏠', '🚗', '💰', '🎓', '💍', '🎯', '🏖️', '🎮', '📚']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const goalData = {
      goalName: formData.goalName,
      icon: formData.icon,
      goalAmount: Number(formData.goalAmount),
      saving: Number(formData.saving) || 0,
      goalDate: formData.goalDate,
    }

    console.log('New Goal Data:', goalData)
    onSubmit(goalData)
    
    // Reset form
    setFormData({
      goalName: '',
      icon: '🎯',
      goalAmount: '',
      saving: '',
      goalDate: '',
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-lg p-6 shadow-xl"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>
            Add Financial Goal
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:opacity-80 transition-opacity"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <X className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Name */}
          <div>
            <label
              className="block text-label mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Goal Name
            </label>
            <input
              type="text"
              required
              value={formData.goalName}
              onChange={(e) => setFormData({ ...formData, goalName: e.target.value })}
              placeholder="e.g., Emergency Fund"
              className="w-full px-4 py-2 rounded-lg text-body-md outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-primary)',
              }}
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label
              className="block text-label mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Choose Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: emoji })}
                  className={`p-3 rounded-lg text-2xl hover:opacity-80 transition-all ${
                    formData.icon === emoji ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: formData.icon === emoji 
                      ? 'var(--color-primary-lightest)' 
                      : 'var(--color-bg-secondary)',
                    borderColor: formData.icon === emoji 
                      ? 'var(--color-primary)' 
                      : 'transparent',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Amount */}
          <div>
            <label
              className="block text-label mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Target Amount (₹)
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.goalAmount}
              onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
              placeholder="100000"
              className="w-full px-4 py-2 rounded-lg text-body-md outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-primary)',
              }}
            />
          </div>

          {/* Current Savings */}
          <div>
            <label
              className="block text-label mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Current Savings (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formData.saving}
              onChange={(e) => setFormData({ ...formData, saving: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-2 rounded-lg text-body-md outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-primary)',
              }}
            />
          </div>

          {/* Target Date */}
          <div>
            <label
              className="block text-label mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Target Date
            </label>
            <input
              type="date"
              required
              value={formData.goalDate}
              onChange={(e) => setFormData({ ...formData, goalDate: e.target.value })}
              className="w-full px-4 py-2 rounded-lg text-body-md outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-primary)',
              }}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-body-md font-semibold hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg text-body-md font-semibold hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
              }}
            >
              Add Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddGoalModal
