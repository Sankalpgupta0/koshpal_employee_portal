import { useState } from 'react'
import { X } from 'lucide-react'

interface EditBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  currentBudget: number
  month: number
  year: number
  onSave: (budget: number) => Promise<void>
}

const EditBudgetModal = ({ 
  isOpen, 
  onClose, 
  currentBudget, 
  month, 
  year,
  onSave 
}: EditBudgetModalProps) => {
  const [budget, setBudget] = useState(currentBudget.toString())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const budgetValue = parseFloat(budget)
    if (isNaN(budgetValue) || budgetValue < 0) {
      setError('Please enter a valid budget amount')
      return
    }

    setLoading(true)
    try {
      await onSave(budgetValue)
      onClose()
    } catch (err) {
      setError('Failed to update budget. Please try again.')
      console.error('Error updating budget:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Budget
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Set your budget for {monthNames[month - 1]} {year}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monthly Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-colors"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                       transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditBudgetModal
