import { useState, useEffect } from 'react'
import { X, Building2, Wallet, CreditCard, Banknote } from 'lucide-react'
import type { Account, AccountType } from '../api/accounts'

interface EditAccountModalProps {
  isOpen: boolean
  account: Account | null
  onClose: () => void
  onSave: (id: string, account: { type: AccountType; provider?: string; maskedAccountNo?: string }) => void
}

const EditAccountModal = ({ isOpen, account, onClose, onSave }: EditAccountModalProps) => {
  const [formData, setFormData] = useState({
    type: 'BANK' as AccountType,
    provider: '',
    maskedAccountNo: '',
  })

  useEffect(() => {
    if (account) {
      setFormData({
        type: account.type,
        provider: account.provider || '',
        maskedAccountNo: account.maskedAccountNo || '',
      })
    }
  }, [account])

  if (!isOpen || !account) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(account.id, {
      type: formData.type,
      provider: formData.provider || undefined,
      maskedAccountNo: formData.maskedAccountNo || undefined,
    })
  }

  const accountTypes = [
    { value: 'BANK' as AccountType, label: 'Bank Account', icon: Building2 },
    { value: 'WALLET' as AccountType, label: 'Digital Wallet', icon: Wallet },
    { value: 'CREDIT_CARD' as AccountType, label: 'Credit Card', icon: CreditCard },
    { value: 'CASH' as AccountType, label: 'Cash', icon: Banknote },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Edit Account
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
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Account Type */}
          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Account Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {accountTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.type === type.value
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-lightest)]'
                      : 'border-[var(--color-border-primary)] hover:border-[var(--color-primary-light)]'
                  }`}
                  style={{ backgroundColor: formData.type === type.value ? 'var(--color-primary-lightest)' : 'var(--color-bg-secondary)' }}
                >
                  <type.icon
                    className="w-6 h-6 mx-auto mb-2"
                    style={{ color: formData.type === type.value ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
                  />
                  <div
                    className="text-sm font-medium"
                    style={{ color: formData.type === type.value ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
                  >
                    {type.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Provider Name */}
          {formData.type !== 'CASH' && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {formData.type === 'BANK' ? 'Bank Name' : 
                 formData.type === 'WALLET' ? 'Wallet Provider' : 
                 'Card Issuer'} (Optional)
              </label>
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder={
                  formData.type === 'BANK' ? 'e.g., HDFC Bank' :
                  formData.type === 'WALLET' ? 'e.g., PayTM, Google Pay' :
                  'e.g., VISA, Mastercard'
                }
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                style={{
                  backgroundColor: 'var(--color-input-bg)',
                  borderColor: 'var(--color-input-border)',
                  color: 'var(--color-input-text)',
                }}
              />
            </div>
          )}

          {/* Account Number */}
          {formData.type !== 'CASH' && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {formData.type === 'BANK' ? 'Account Number (Last 4 digits)' :
                 formData.type === 'WALLET' ? 'Phone/ID (Last 4 digits)' :
                 'Card Number (Last 4 digits)'} (Optional)
              </label>
              <input
                type="text"
                value={formData.maskedAccountNo}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setFormData({ ...formData, maskedAccountNo: value })
                }}
                placeholder="1234"
                maxLength={4}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                style={{
                  backgroundColor: 'var(--color-input-bg)',
                  borderColor: 'var(--color-input-border)',
                  color: 'var(--color-input-text)',
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditAccountModal
