import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
}

interface RecentTransactionsProps {
  employeeId?: string
}

const RecentTransactions = ({ employeeId }: RecentTransactionsProps) => {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const userId = employeeId || user._id

        if (!userId) {
          console.log('No user ID found')
          setLoading(false)
          return
        }

        const response = await getTransactionsByEmployeeId(userId, {
          limit: 10,
          skip: 0,
        })

        // Map API transactions to component format
        const mappedTransactions: Transaction[] = response.data.map((txn: APITransaction) => ({
          _id: txn._id,
          title: txn.merchant || txn.sender || 'Transaction',
          category: txn.categoryName || txn.categoryId || 'other',
          amount: txn.amount,
          date: txn.transactionDate,
          type: txn.txnType === 'CREDIT' ? 'income' : 'expense',
          icon: '', // Will use category icon
        }))

        setTransactions(mappedTransactions)
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [employeeId])

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
    }
    return icons[category.toLowerCase()] || '💳'
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
            Recent Transactions
          </h2>
          <p className="text-body-md" style={{ color: 'var(--color-text-secondary)' }}>
            Latest activity
          </p>
        </div>
        <button
          onClick={() => navigate('/transactions')}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-body-md font-semibold hover:opacity-80 transition-opacity"
          style={{
            color: 'var(--color-primary)',
          }}
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Transactions List */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-body-md" style={{ color: 'var(--color-text-secondary)' }}>
              Loading transactions...
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-body-md mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              No transactions yet
            </p>
            <p className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>
              Your recent transactions will appear here
            </p>
          </div>
        ) : (
          transactions.slice(0, 4).map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center gap-4 p-4 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              style={{ backgroundColor: 'var(--color-bg-secondary)' }}
              onClick={() => navigate('/transactions')}
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
          ))
        )}
      </div>
    </div>
  )
}

export default RecentTransactions
