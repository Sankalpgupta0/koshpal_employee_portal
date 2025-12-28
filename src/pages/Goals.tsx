import { useState, useEffect } from 'react'
import { Menu, Moon, Sun, Plus, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import GoalItem from '../components/GoalItem'
import AddGoalModal from '../components/AddGoalModal'
import EditGoalModal from '../components/EditGoalModal'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../components/ToastContainer'
import {
  getFinancialGoalsByEmployeeId,
  createFinancialGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  type Goal,
} from '../api/financialGoals'

const Goals = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved === 'true'
  })
  const [goals, setGoals] = useState<Goal[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const navigate = useNavigate()

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const isDark = savedTheme === 'dark'
    setIsDarkMode(isDark)
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }

  // Handle sidebar collapse
  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed)
    localStorage.setItem('sidebarCollapsed', collapsed.toString())
  }

  // Fetch goals from API
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const userId = user._id

        if (!userId) {
          console.log('No user ID found')
          setLoading(false)
          return
        }

        console.log('Fetching goals for user:', userId)

        const response = await getFinancialGoalsByEmployeeId()

        console.log('Financial Goals:', response.financialGoals)

        // Sort goals by creation date (newest first)
        const sortedGoals = (response.financialGoals || []).sort((a, b) => {
          const dateA = new Date(a.goalDate).getTime()
          const dateB = new Date(b.goalDate).getTime()
          return dateB - dateA
        })

        setGoals(sortedGoals)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Error fetching financial goals:', error)
        console.error('Error details:', error.response?.data || error.message)
        setGoals([])
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [])

  // Add new goal
  const handleAddGoal = async (newGoal: Omit<Goal, '_id'>) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user._id

      console.log('Adding goal for user:', userId)
      console.log('Goal data:', newGoal)

      try {
        await addGoal(newGoal)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // If financial goals document doesn't exist (404), create it first
        if (error.response?.status === 404) {
          console.log('Financial goals document not found, creating new one')
          await createFinancialGoals()
        } else {
          throw error
        }
      }

      console.log('Goal added successfully')

      // Refresh goals list
      const updatedResponse = await getFinancialGoalsByEmployeeId()
      const sortedGoals = (updatedResponse.financialGoals || []).sort((a, b) => {
        const dateA = new Date(a.goalDate).getTime()
        const dateB = new Date(b.goalDate).getTime()
        return dateB - dateA
      })
      setGoals(sortedGoals)

      showToast('Goal added successfully!', 'success')
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
      console.log('Updating goal:', selectedGoal._id)
      console.log('Updated data:', updatedGoal)

      await updateGoal(selectedGoal._id, updatedGoal)

      console.log('Goal updated successfully')

      // Refresh goals list
      const updatedResponse = await getFinancialGoalsByEmployeeId()
      const sortedGoals = (updatedResponse.financialGoals || []).sort((a, b) => {
        const dateA = new Date(a.goalDate).getTime()
        const dateB = new Date(b.goalDate).getTime()
        return dateB - dateA
      })
      setGoals(sortedGoals)

      showToast('Goal updated successfully!', 'success')
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
      console.log('Deleting goal:', goalToDelete)

      await deleteGoal(goalToDelete)

      console.log('Goal deleted successfully')

      // Remove from local state
      setGoals(goals.filter((goal) => goal._id !== goalToDelete))
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
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => handleSidebarCollapse(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        } ${isSidebarOpen ? 'lg:blur-0 blur-[2px]' : ''}`}
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 border-b"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-primary)',
            height: '89px',
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
              <Menu className="w-6 h-6" style={{ color: 'var(--color-text-primary)' }} />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--color-bg-secondary)' }}
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-6 h-6" style={{ color: 'var(--color-text-primary)' }} />
            </button>
            <h1 className="text-h2" style={{ color: 'var(--color-text-primary)' }}>
              Financial Goals
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-body-md font-semibold hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
              }}
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Goal</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
              {isDarkMode ? (
                <Sun className="w-6 h-6" style={{ color: 'var(--color-text-primary)' }} />
              ) : (
                <Moon className="w-6 h-6" style={{ color: 'var(--color-text-primary)' }} />
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
                  Loading goals...
                </p>
              </div>
            ) : goals.length === 0 ? (
              <div
                className="text-center py-12 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-primary)',
                }}
              >
                <p className="text-body-lg mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  No financial goals yet
                </p>
                <p className="text-body-md mb-6" style={{ color: 'var(--color-text-tertiary)' }}>
                  Start planning your financial future by creating your first goal
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-body-md font-semibold hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-text-inverse)',
                  }}
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Goal
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-body-md" style={{ color: 'var(--color-text-secondary)' }}>
                    {goals.length} {goals.length === 1 ? 'goal' : 'goals'} total
                  </p>
                </div>
                <div className="space-y-4">
                  {goals.map((goal) => {
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
                  })}
                </div>
              </>
            )}
          </div>
        </main>
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

export default Goals
