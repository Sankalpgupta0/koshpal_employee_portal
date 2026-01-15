import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Moon, Sun, Settings as SettingsIcon, User, LogOut } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { updateEmployee, getMyProfile, updateMyProfile, type Employee } from '../api/employee'
import { axiosInstance } from '../api/axiosInstance'
import Toast from '../components/Toast'

const Settings = () => {
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved === 'true'
  })

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [originalData, setOriginalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
 

  const [removeImage, setRemoveImage] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

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

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true)
      // console.log('Fetching user data for employee ID:', employeeId)
      // const employee: Employee = await getEmployeeById()
       const data = await getMyProfile()
       const employee=data;
      // console.log('Fetched employee data:', employee.data)
      
      // Split name into first and last name
      const nameParts = employee.name.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      const userData = {
        firstName,
        lastName,
        email: employee.email,
        phone: employee.phone || '',
      }
      
      // Set profile picture if available
      if (employee.profilePhoto) {
        setProfilePicture(employee.profilePhoto)
      }
      
      // console.log('Setting form data:', userData)
      setFormData(userData)
      setOriginalData(userData)
    } catch (error) {
      console.error('Error fetching user data:', error)
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string }
      console.error('Error details:', axiosError.response?.data || axiosError.message)
    
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    
    if (!userStr) {
      navigate('/login')
      return
    }
    
    try {
      const user = JSON.parse(userStr)
      const employeeId = user._id
      // console.log('User ID from localStorage:', employeeId)
      // console.log('Full user object:', user)
      
      if (!employeeId) {
        console.error('No employee ID found in user object')
        navigate('/login')
        return
      }
      
      setUserId(employeeId)
      
      // Use cached data immediately as fallback
      if (user.name && user.email) {
        const nameParts = user.name.split(' ')
        const cachedData = {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: user.email,
          phone: user.phone || '',
        }
        
        // Set profile picture from cache if available
        if (user.profilePicture) {
          setProfilePicture(user.profilePicture)
        }
        
        // console.log('Using cached user data:', cachedData)
        setFormData(cachedData)
        setOriginalData(cachedData)
        setLoading(false)
      }
      
      // Then fetch fresh data from API
      fetchUserData()
    } catch (error) {
      console.error('Error parsing user data:', error)
      navigate('/login')
    }
  }, [navigate, fetchUserData])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

const handleSaveChanges = async () => {
  if (!formData.firstName.trim() || !formData.lastName.trim()) {
    setToast({ message: 'First name and last name are required', type: 'error' })
    return
  }

  try {
    setSaving(true)

    const fullName = `${formData.firstName} ${formData.lastName}`.trim()

    const fd = new FormData()
    fd.append('name', fullName)
    fd.append('phone', formData.phone)

    // Handle profile picture update
    if (selectedFile) {
      fd.append('image', selectedFile) //  FILE, not string
    }

    await updateMyProfile(fd)

    // Update local cache
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      user.name = fullName
      user.phone = formData.phone
      localStorage.setItem('user', JSON.stringify(user))
    }

    setOriginalData(formData)
    setToast({ message: 'Profile updated successfully!', type: 'success' })
  } catch (error) {
    setToast({ message: 'Failed to save changes', type: 'error' })
  } finally {
    setSaving(false)
  }
}


  


  const handleCancel = () => {
    // Reset form to original values
    setFormData(originalData)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    setToast({ message: 'Please select an image file', type: 'error' })
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    setToast({ message: 'Image size should be less than 5MB', type: 'error' })
    return
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    setToast({ message: 'Only JPG, PNG, JEPG allowed', type: 'error' })
    return
  }

  setSelectedFile(file) // ✅ FILE saved
  setRemoveImage(false)
  // Preview only
  const reader = new FileReader()
  reader.onload = () => {
    setProfilePicture(reader.result as string)
  }
  reader.readAsDataURL(file)
}


  const handleLogout = async () => {
    try {
      // Call backend logout to clear httpOnly cookies
      await axiosInstance.post('/auth/logout')
    } catch (error) {
      // Continue logout even if API call fails
    }
    
    // Clear localStorage data
    localStorage.removeItem('user')
    localStorage.removeItem('rememberMe')
    
    // Navigate to login page
    navigate('/login')
    
    // Show success toast
    setToast({ message: 'Logged out successfully', type: 'success' })
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
            {/* Hamburger Menu - Mobile Only */}
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
            <div className="flex items-center gap-3">
              <h1
                className="text-xl sm:text-2xl font-bold flex items-center gap-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Settings
                <SettingsIcon className="w-6 h-6" style={{ color: 'var(--color-text-secondary)' }} />
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Manage your account and preferences
          </p>

          {loading ? (
            <div
              className="rounded-lg p-8 text-center"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-primary)',
              }}
            >
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
                />
                <p style={{ color: 'var(--color-text-secondary)' }}>Loading user data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Profile Information Card */}
              <div
                className="rounded-lg p-6 sm:p-8"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-primary)',
                }}
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-8">
              <User
                className="w-6 h-6"
                style={{ color: 'var(--color-primary)' }}
              />
              <h2
                className="text-lg font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Profile Information
              </h2>
            </div>

            {/* Profile Photo Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'var(--color-border-primary)' }}>
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: profilePicture ? 'transparent' : 'var(--color-primary)' }}>
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, hide it and show initials
                      e.currentTarget.style.display = 'none'
                      setProfilePicture(null)
                    }}
                  />
                ) : (
                  <span>{getInitials(formData.firstName, formData.lastName)}</span>
                )}
              </div>

              {/* Name and Email */}
              <div className="flex-1">
                <h3
                  className="text-lg font-bold mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {formData.firstName} {formData.lastName}
                </h3>
                <p
                  className="text-sm mb-3"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {formData.email}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profile-image-input"
                />
                <button
                  onClick={() => document.getElementById('profile-image-input')?.click()}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Change Photo
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* First Name and Last Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'var(--color-input-bg)',
                      borderColor: 'var(--color-input-border)',
                      color: 'var(--color-input-text)',
                    }}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'var(--color-input-bg)',
                      borderColor: 'var(--color-input-border)',
                      color: 'var(--color-input-text)',
                    }}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all pr-24 cursor-not-allowed opacity-60"
                    style={{
                      backgroundColor: 'var(--color-bg-tertiary)',
                      borderColor: 'var(--color-input-border)',
                      color: 'var(--color-text-secondary)',
                    }}
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--color-success-light)',
                      color: 'var(--color-success-darkest)',
                    }}
                  >
                    Verified
                  </span>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--color-input-bg)',
                    borderColor: 'var(--color-input-border)',
                    color: 'var(--color-input-text)',
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border-primary)' }}>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="px-6 py-3 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {saving && (
                  <div
                    className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: 'white', borderTopColor: 'transparent' }}
                  />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Preferences & Account Actions Section */}
          <div
            className="rounded-lg p-6 sm:p-8 mt-6"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-primary)',
            }}
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon
                className="w-6 h-6"
                style={{ color: 'var(--color-primary)' }}
              />
              <h2
                className="text-lg font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Preferences & Account
              </h2>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                ) : (
                  <Sun className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                )}
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Dark Mode
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: isDarkMode ? 'var(--color-primary)' : 'var(--color-border-secondary)',
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Divider */}
            <div className="border-t my-6" style={{ borderColor: 'var(--color-border-primary)' }} />

            {/* Logout Button */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Account Actions
              </h3>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--color-error)',
                  color: 'white',
                }}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
            </>
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default Settings
