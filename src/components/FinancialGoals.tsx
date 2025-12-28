import { useState, useEffect } from 'react'
import { Plus, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import GoalItem from './GoalItem'
import AddGoalModal from './AddGoalModal'
import EditGoalModal from './EditGoalModal'
import ConfirmModal from './ConfirmModal'
import { useToast } from './ToastContainer'
import { 
  getFinancialGoalsByEmployeeId,
  createFinancialGoals,
  addGoal,
  updateGoal, 
  deleteGoal,
  type Goal 
} from '../api/financialGoals'

interface FinancialGoalsProps {
  employeeId?: string
}

const FinancialGoals = ({ employeeId }: FinancialGoalsProps) => {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const navigate = useNavigate()
  // Fetch goals from API
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const userId = employeeId || user._id
        
        if (!userId) {
          console.log('No user ID found')
          setLoading(false)
          return
        }

        // console.log('Fetching goals for user:', userId)
        
        const response = await getFinancialGoalsByEmployeeId()
        
        // console.log('Financial Goals:', response.financialGoals)
        
        // Sort goals by creation date (newest first) and limit to 3
        const sortedGoals = (response.financialGoals || []).sort((a, b) => {
          const dateA = new Date(a.goalDate).getTime()
          const dateB = new Date(b.goalDate).getTime()
          return dateB - dateA
        })
        
        setGoals(sortedGoals.slice(0, 3))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Error fetching financial goals:', error)
        console.error('Error details:', error.response?.data || error.message)
        // Set empty array on error
        setGoals([])
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [employeeId])

  // Add new goal
  const handleAddGoal = async (newGoal: Omit<Goal, '_id'>) => {
    try {
      // console.log('Adding goal for user:', userId)
      // console.log('Goal data:', newGoal)

      try {
        await addGoal(newGoal)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // If financial goals document doesn't exist (404), create it first
        if (error.response?.status === 404) {
          // console.log('Financial goals document not found, creating new one')
          await createFinancialGoals()
        } else {
          throw error
        }
      }

      // console.log('Goal added successfully')
      
      // Refresh goals list
      const updatedResponse = await getFinancialGoalsByEmployeeId()
      const sortedGoals = (updatedResponse.financialGoals || []).sort((a, b) => {
        const dateA = new Date(a.goalDate).getTime()
        const dateB = new Date(b.goalDate).getTime()
        return dateB - dateA
      })
      setGoals(sortedGoals.slice(0, 3))
      
      showToast('Goal added successfully!', 'success')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error adding financial goal:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      showToast(error.response?.data?.message || 'Failed to add goal', 'error')
    }
  }

  // Edit goal
  const handleEditGoal = async (updatedGoal: Omit<Goal, '_id'>) => {
    if (!selectedGoal?._id) return
    
    try {
      // console.log('Updating goal:', selectedGoal._id)
      // console.log('Updated data:', updatedGoal)

      await updateGoal(selectedGoal._id, updatedGoal)

      // console.log('Goal updated successfully')
      
      // Refresh goals list
      const updatedResponse = await getFinancialGoalsByEmployeeId()
      const sortedGoals = (updatedResponse.financialGoals || []).sort((a, b) => {
        const dateA = new Date(a.goalDate).getTime()
        const dateB = new Date(b.goalDate).getTime()
        return dateB - dateA
      })
      setGoals(sortedGoals.slice(0, 3))
      
      showToast('Goal updated successfully!', 'success')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error updating financial goal:', error)
      console.error('Error response:', error.response?.data)
      showToast(error.response?.data?.message || 'Failed to update goal', 'error')
    }
  }

  // Open edit modal
  const handleOpenEditModal = (goal: Goal) => {
    setSelectedGoal(goal)
    setIsEditModalOpen(true)
  }

  // Open delete confirmation modal
  const handleDeleteGoal = (goalId: string) => {
    setGoalToDelete(goalId)
    setIsDeleteModalOpen(true)
  }

  // Confirm delete goal
  const confirmDeleteGoal = async () => {
    if (!goalToDelete) return
    
    try {
      // console.log('Deleting goal:', goalToDelete)

      await deleteGoal(goalToDelete)

      // console.log('Goal deleted successfully')
      
      // Remove from local state
      setGoals(goals.filter(goal => goal._id !== goalToDelete))
      showToast('Goal deleted successfully!', 'success')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error deleting financial goal:', error)
      console.error('Error response:', error.response?.data)
      showToast(error.response?.data?.message || 'Failed to delete goal', 'error')
    } finally {
      setGoalToDelete(null)
    }
  }

  return (
    <div
      className="p-6 rounded-lg"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-primary)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-h3 mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Financial Goals
          </h2>
          <p className="text-body-md" style={{ color: 'var(--color-text-secondary)' }}>
            Track your progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/goals')}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-body-md font-semibold hover:opacity-80 transition-opacity"
            style={{
              color: 'var(--color-primary)',
            }}
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-body-md font-semibold hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
            }}
          >
            <Plus className="w-5 h-5" />
            Add Goal
          </button>
        </div>
      </div>

      {/* Goals List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-body-md" style={{ color: 'var(--color-text-secondary)' }}>
              Loading goals...
            </p>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-body-md mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              No financial goals yet
            </p>
            <p className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>
              Click "Add Goal" to create your first goal
            </p>
          </div>
        ) : (
          goals.map((goal) => {
            const percentage = Math.round((goal.saving / goal.goalAmount) * 100)
            return (
              <GoalItem
                key={goal._id}
                icon={goal.icon}
                title={goal.goalName}
                current={goal.saving}
                target={goal.goalAmount}
                percentage={percentage}
                goalDate={goal.goalDate}
                onEdit={() => handleOpenEditModal(goal)}
                onDelete={() => goal._id && handleDeleteGoal(goal._id)}
              />
            )
          })
        )}
      </div>

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddGoal}
      />

      {/* Edit Goal Modal */}
      <EditGoalModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedGoal(null)
        }}
        onSubmit={handleEditGoal}
        goal={selectedGoal}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setGoalToDelete(null)
        }}
        onConfirm={confirmDeleteGoal}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

export default FinancialGoals
