import { useEffect, useState, useRef } from 'react'
import { Menu, Moon, Sun, Wallet, TrendingUp, Users, Calendar } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import YourSession from '../components/YourSession'
import IncomeExpenseChart from '../components/IncomeExpenseChart'
import SpendingCategoryChart from '../components/SpendingCategoryChart'
import FinancialGoals from '../components/FinancialGoals'
import RecentTransactions from '../components/RecentTransactions'
import EditBudgetModal from '../components/EditBudgetModal'
import { getLatestMonthlySummary, getSpendingTrends, updateBudget } from '../api/insights'
import { getEmployeeLatestConsultation } from '../api/employee'

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved === 'true'
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [monthlySummary, setMonthlySummary] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [trendsData, setTrendsData] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [latestConsultation, setLatestConsultation] = useState<any>(null)
  const hasFetched = useRef(false)

  // Initialize dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      setIsDarkMode(false)
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])

  // Save sidebar collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    if (newMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleBudgetSave = async (newBudget: number) => {
    const currentDate = new Date()
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()
    
    await updateBudget({ month, year, budget: newBudget })
    
    // Refresh the monthly summary to get updated budget
    const updatedSummary = await getLatestMonthlySummary()
    setMonthlySummary(updatedSummary || null)
  }

  // Fetch user and employee summary
  useEffect(() => {
    // Prevent duplicate fetches in StrictMode
    if (hasFetched.current) {
      console.log('Dashboard: Skipping duplicate fetch (StrictMode)')
      return
    }
    hasFetched.current = true
    console.log('Dashboard: Fetching data...')

    const fetchData = async () => {
      try {
        const localUser = JSON.parse(localStorage.getItem('user') || '{}')
        setUser(localUser)
        
        // Fetch latest monthly summary and trends data
        const [summaryResponse, trendsResponse, latestConsultationResponse] = await Promise.all([
          getLatestMonthlySummary(),
          getSpendingTrends(6),
          getEmployeeLatestConsultation()
        ])

        
        console.log('Latest Monthly Summary:', summaryResponse)
        console.log('Spending Trends:', trendsResponse)
        console.log('Latest Consultation:', latestConsultationResponse)

        setLatestConsultation(latestConsultationResponse || null)
        
        setMonthlySummary(summaryResponse || null)
        setTrendsData(trendsResponse || null)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Extract data from monthly summary
  const totalIncome = monthlySummary?.totalIncome || 0
  const totalExpense = monthlySummary?.totalExpense || 0
  const savings = monthlySummary?.savings || 0
  const budget = monthlySummary?.budget || 0
  const categoryBreakdown = monthlySummary?.categoryBreakdown || {}

  // Prepare chart data from last 6 months trends
  const chartData = trendsData?.trends?.map((trend: any) => ({
    month: new Date(trend.year, trend.month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    income: trend.totalIncome,
    expenses: trend.totalExpense,
  })) || []

  // Prepare category spending data for donut chart
  const categoryColors = [
    '#334eac', '#5b70c7', '#80b597', '#67a682', 
    '#f5a038', '#d47602', '#17a2b8', '#117a8a',
    '#e74c3c', '#c0392b', '#9b59b6', '#8e44ad'
  ]
  
  // Handle categoryBreakdown as either array or object
  const categoryData = Array.isArray(categoryBreakdown)
    ? categoryBreakdown.map((cat: any, index: number) => ({
        name: cat.category || 'Unknown',
        value: typeof cat.amount === 'number' ? cat.amount : parseFloat(cat.amount) || 0,
        color: categoryColors[index % categoryColors.length],
      }))
    : Object.entries(categoryBreakdown).map(([key, value], index) => ({
        name: key,
        value: typeof value === 'number' ? value : parseFloat(value as string) || 0,
        color: categoryColors[index % categoryColors.length],
      }))

  // Stat cards with monthly summary data
  const statCards = [
    {
      title: 'BUDGET',
      amount: budget,
      icon: Wallet,
      trendDirection: 'up' as const,
      gradientFrom: '#334eac',
      gradientTo: '#5b70c7',
    },
    {
      title: 'SPENDING',
      amount: totalExpense,
      icon: TrendingUp,
      trendDirection: 'up' as const,
      gradientFrom: '#80b597',
      gradientTo: '#67a682',
    },
    {
      title: 'INCOME',
      amount: totalIncome,
      icon: Users,
      trendDirection: 'up' as const,
      gradientFrom: '#f5a038',
      gradientTo: '#d47602',
    },
    {
      title: 'SAVING',
      amount: savings,
      icon: Calendar,
      trendDirection: 'down' as const,
      gradientFrom: '#17a2b8',
      gradientTo: '#117a8a',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-medium">Loading Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
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
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
              }}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              {isSidebarCollapsed && (
                <div className="hidden lg:flex items-center gap-1 mb-1">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                    <img src="/logo.png" alt="Koshpal logo" className="w-[80px] h-[40px] bg-transparent" />
                  </div>
                  <h1 className="text-h2" style={{ color: 'var(--color-text-primary)' }}>
                    Koshpal
                  </h1>
                </div>
              )}
              <p className="text-body-md" style={{ color: 'var(--color-text-secondary)' }}>
                Welcome back, {user?.name || user?.email || 'User'}!
              </p>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
            }}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="mb-8">
            {/* Mobile Scroll */}
            <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {statCards.map((card, index) => (
                <div key={index} className="min-w-[280px] snap-center">
                  <StatCard 
                    {...card} 
                    onEdit={card.title === 'BUDGET' ? () => setIsBudgetModalOpen(true) : undefined}
                  />
                </div>
              ))}
            </div>

            {/* Grid layout for larger screens */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card, index) => (
                <StatCard 
                  key={index} 
                  {...card} 
                  onEdit={card.title === 'BUDGET' ? () => setIsBudgetModalOpen(true) : undefined}
                />
              ))}
            </div>
          </div>

          {/* Your Session Section */}
          {
            latestConsultation && <div className="mb-8">
            <YourSession sessionDetails={latestConsultation}/>
          </div>
          }

          {/* Charts Section - Responsive Layout */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income vs Expenses Chart - Shows first on mobile, left on desktop */}
            {chartData.length > 0 && (
              <div className="order-1">
                <IncomeExpenseChart data={chartData} />
              </div>
            )}

            {/* Spending by Category Chart - Shows second on mobile, right on desktop */}
            <div className="order-2">
              {categoryData && categoryData.length > 0 ? (
                <SpendingCategoryChart data={categoryData} />
              ) : (
                <div
                  className="p-6 rounded-lg h-full flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border-primary)',
                    minHeight: '400px',
                  }}
                >
                  <div className="text-center">
                    <h3 className="text-h3 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Spending by Category
                    </h3>
                    <p className="text-body-md" style={{ color: 'var(--color-text-secondary)' }}>
                      No categories yet
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Financial Goals and Recent Transactions Section - Responsive Grid */}
          <div className="mb-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Financial Goals - Shows first on mobile, left on desktop */}
            <div className="order-1">
              <FinancialGoals />
            </div>

            {/* Recent Transactions - Shows second on mobile, right on desktop */}
            <div className="order-2">
              <RecentTransactions />
            </div>
          </div>
        </main>
      </div>

      {/* Edit Budget Modal */}
      <EditBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentBudget={budget}
        month={new Date().getMonth() + 1}
        year={new Date().getFullYear()}
        onSave={handleBudgetSave}
      />
    </div>
  )
}

export default Dashboard
