import { useState, useEffect } from 'react'
import { Menu, Moon, Sun, ArrowLeft, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getTransactionsByEmployeeId } from '../api/transactions'
import type { Transaction as APITransaction } from '../api/transactions'

interface Transaction {
  _id: string
  title: string
  category: string
  amount: number
  date: string
  type: 'income' | 'expense'
  icon: string
  description?: string
}

const Transactions = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved === 'true'
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
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

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const userId = user._id

        if (!userId) {
          console.log('No user ID found')
          setLoading(false)
          return
        }

        const response = await getTransactionsByEmployeeId(userId)

        // Map API transactions to component format
        const mappedTransactions: Transaction[] = response.data.map((txn: APITransaction) => ({
          _id: txn._id,
          title: txn.merchant || txn.sender || 'Transaction',
          category: txn.categoryName || txn.categoryId || 'Other',
          amount: txn.amount,
          date: txn.transactionDate,
          type: txn.txnType === 'CREDIT' ? 'income' : 'expense',
          icon: '', // Will use category icon
          description: txn.messageBody,
        }))

        // Sort by date (newest first)
        const sortedTransactions = mappedTransactions.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })

        setTransactions(sortedTransactions)
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  // Format date to relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  // Format amount with Indian currency
  const formatAmount = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.abs(amount))

    return type === 'income' ? `+${formatted}` : formatted
  }

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      salary: '💰',
      income: '💼',
      housing: '🏠',
      rent: '🏠',
      food: '🛒',
      groceries: '🛒',
      shopping: '🛍️',
      transport: '🚗',
      utilities: '💡',
      entertainment: '🎬',
      healthcare: '🏥',
      education: '📚',
      other: '📝',
      'food & dining': '🛒',
      'bills & utilities': '💡',
      'auto & transport': '🚗',
      'health & fitness': '🏥',
      travel: '✈️',
      'fees & charges': '💳',
      'business services': '💼',
      'personal care': '💆',
      'gifts & donations': '🎁',
    }
    return icons[category.toLowerCase()] || '💳'
  }

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === 'all') return true
    return transaction.type === filter
  })

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
              Transactions
            </h1>
          </div>

          <div className="flex items-center gap-3">
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
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-body-md font-semibold transition-all ${
                    filter === 'all' ? 'shadow-sm' : ''
                  }`}
                  style={{
                    backgroundColor: filter === 'all' 
                      ? 'var(--color-primary)' 
                      : 'var(--color-bg-card)',
                    color: filter === 'all' 
                      ? 'var(--color-text-inverse)' 
                      : 'var(--color-text-secondary)',
                  }}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('income')}
                  className={`px-4 py-2 rounded-lg text-body-md font-semibold transition-all ${
                    filter === 'income' ? 'shadow-sm' : ''
                  }`}
                  style={{
                    backgroundColor: filter === 'income' 
                      ? 'var(--color-success)' 
                      : 'var(--color-bg-card)',
                    color: filter === 'income' 
                      ? 'white' 
                      : 'var(--color-text-secondary)',
                  }}
                >
                  Income
                </button>
                <button
                  onClick={() => setFilter('expense')}
                  className={`px-4 py-2 rounded-lg text-body-md font-semibold transition-all ${
                    filter === 'expense' ? 'shadow-sm' : ''
                  }`}
                  style={{
                    backgroundColor: filter === 'expense' 
                      ? 'var(--color-error)' 
                      : 'var(--color-bg-card)',
                    color: filter === 'expense' 
                      ? 'white' 
                      : 'var(--color-text-secondary)',
                  }}
                >
                  Expenses
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
                  Loading transactions...
                </p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div
                className="text-center py-12 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-primary)',
                }}
              >
                <p className="text-body-lg mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  No transactions found
                </p>
                <p className="text-body-md" style={{ color: 'var(--color-text-tertiary)' }}>
                  {filter !== 'all' 
                    ? `No ${filter} transactions to display` 
                    : 'Your transactions will appear here'}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-body-md" style={{ color: 'var(--color-text-secondary)' }}>
                    {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
                  </p>
                </div>
                <div className="space-y-3">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-center gap-4 p-4 rounded-lg hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border-primary)',
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                        style={{
                          backgroundColor: transaction.type === 'income' 
                            ? 'var(--color-success-light)' 
                            : 'var(--color-bg-tertiary)',
                        }}
                      >
                        {transaction.icon || getCategoryIcon(transaction.category)}
                      </div>

                      {/* Transaction Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-h4 truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {transaction.title}
                        </h4>
                        <p className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
                          {formatDate(transaction.date)} • {transaction.category}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p
                          className="text-h4 font-semibold"
                          style={{
                            color: transaction.type === 'income' 
                              ? 'var(--color-success)' 
                              : 'var(--color-text-primary)',
                          }}
                        >
                          {formatAmount(transaction.amount, transaction.type)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Transactions
