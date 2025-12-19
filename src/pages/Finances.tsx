import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  Moon,
  Sun,
  Plus,
  Building2,
  Wallet,
  CreditCard,
  Banknote,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import AddAccountModal from '../components/AddAccountModal'
import EditAccountModal from '../components/EditAccountModal'
import ConfirmModal from '../components/ConfirmModal'
import FinancialGoals from '../components/FinancialGoals'
import RecentTransactions from '../components/RecentTransactions'
import { useToast } from '../components/ToastContainer'
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  type Account,
  type AccountType,
} from '../api/accounts'
import { getLatestMonthlySummary } from '../api/insights'

const Finances = () => {
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved === 'true'
  })

  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [monthlySummary, setMonthlySummary] = useState<any>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    } else {
      fetchData()
    }
  }, [navigate])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [accountsData, monthlyData] = await Promise.all([
        getAccounts(),
        getLatestMonthlySummary().catch(() => null),
      ])
      setAccounts(accountsData)
      setMonthlySummary(monthlyData?.data)
    } catch (error) {
      console.error('Error fetching financial data:', error)
      showToast('Failed to load financial data', 'error')
    } finally {
      setLoading(false)
    }
  }

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

  const handleAddAccount = async (accountData: {
    type: AccountType
    provider?: string
    maskedAccountNo?: string
  }) => {
    try {
      await createAccount(accountData)
      showToast('Account added successfully!', 'success')
      setIsAddModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error adding account:', error)
      showToast('Failed to add account', 'error')
    }
  }

  const handleEditAccount = async (
    id: string,
    accountData: { type: AccountType; provider?: string; maskedAccountNo?: string }
  ) => {
    try {
      await updateAccount(id, accountData)
      showToast('Account updated successfully!', 'success')
      setIsEditModalOpen(false)
      setSelectedAccount(null)
      fetchData()
    } catch (error) {
      console.error('Error updating account:', error)
      showToast('Failed to update account', 'error')
    }
  }

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return
    try {
      await deleteAccount(accountToDelete)
      showToast('Account deleted successfully!', 'success')
      setIsDeleteModalOpen(false)
      setAccountToDelete(null)
      fetchData()
    } catch (error) {
      console.error('Error deleting account:', error)
      showToast('Failed to delete account', 'error')
    }
  }

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'BANK':
        return Building2
      case 'WALLET':
        return Wallet
      case 'CREDIT_CARD':
        return CreditCard
      case 'CASH':
        return Banknote
      default:
        return DollarSign
    }
  }

  const getAccountLabel = (type: AccountType) => {
    switch (type) {
      case 'BANK':
        return 'Bank Account'
      case 'WALLET':
        return 'Digital Wallet'
      case 'CREDIT_CARD':
        return 'Credit Card'
      case 'CASH':
        return 'Cash'
      default:
        return 'Account'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        } ${isSidebarOpen ? 'lg:blur-0 blur-[2px]' : ''}`}
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
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
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1
                className="text-xl sm:text-2xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                My Finances
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Manage your accounts and track your money
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
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {/* Financial Overview Cards */}
          {monthlySummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Income */}
              <div
                className="p-5 rounded-xl shadow-sm"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-primary)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-success-light)' }}
                  >
                    <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-success-dark)' }} />
                  </div>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Total Income
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {formatCurrency(Number(monthlySummary.totalIncome))}
                </p>
              </div>

              {/* Total Expenses */}
              <div
                className="p-5 rounded-xl shadow-sm"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-primary)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-error-light)' }}
                  >
                    <TrendingDown className="w-5 h-5" style={{ color: 'var(--color-error-dark)' }} />
                  </div>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Total Expenses
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {formatCurrency(Number(monthlySummary.totalExpense))}
                </p>
              </div>

              {/* Savings */}
              <div
                className="p-5 rounded-xl shadow-sm"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-primary)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-primary-light)' }}
                  >
                    <DollarSign className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  </div>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Savings
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {formatCurrency(Number(monthlySummary.savings))}
                </p>
              </div>

              {/* Budget */}
              <div
                className="p-5 rounded-xl shadow-sm"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-primary)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-warning-light)' }}
                  >
                    <Wallet className="w-5 h-5" style={{ color: 'var(--color-warning-dark)' }} />
                  </div>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Monthly Budget
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {formatCurrency(Number(monthlySummary.budget))}
                </p>
              </div>
            </div>
          )}

          {/* Accounts Section */}
          <div
            className="rounded-xl p-6 shadow-sm"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-primary)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  My Accounts
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {accounts.length} account{accounts.length !== 1 ? 's' : ''} linked
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Plus className="w-5 h-5" />
                Add Account
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent align-[-0.125em]"
                     style={{ color: 'var(--color-primary)' }}
                />
                <p className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>
                  Loading accounts...
                </p>
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text-tertiary)' }} />
                <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  No accounts yet
                </p>
                <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  Add your first account to start tracking your finances
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Account
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => {
                  const Icon = getAccountIcon(account.type)
                  return (
                    <div
                      key={account.id}
                      className="p-5 rounded-xl border-2 transition-all hover:shadow-md"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderColor: 'var(--color-border-primary)',
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: 'var(--color-primary-lightest)' }}
                        >
                          <Icon className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedAccount(account)
                              setIsEditModalOpen(true)
                            }}
                            className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: 'var(--color-bg-card)' }}
                          >
                            <Edit2 className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                          </button>
                          <button
                            onClick={() => {
                              setAccountToDelete(account.id)
                              setIsDeleteModalOpen(true)
                            }}
                            className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: 'var(--color-bg-card)' }}
                          >
                            <Trash2 className="w-4 h-4" style={{ color: 'var(--color-error)' }} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        {getAccountLabel(account.type)}
                      </h3>

                      {account.provider && (
                        <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                          {account.provider}
                        </p>
                      )}

                      {account.maskedAccountNo && (
                        <p className="text-sm font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                          ···· {account.maskedAccountNo}
                        </p>
                      )}

                      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border-primary)' }}>
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          Added {new Date(account.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Financial Goals and Recent Transactions Section */}
          <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
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

      {/* Modals */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddAccount}
      />
      <EditAccountModal
        isOpen={isEditModalOpen}
        account={selectedAccount}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedAccount(null)
        }}
        onSave={handleEditAccount}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Account"
        message="Are you sure you want to delete this account? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteAccount}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setAccountToDelete(null)
        }}
        variant="danger"
      />
    </div>
  )
}

export default Finances
