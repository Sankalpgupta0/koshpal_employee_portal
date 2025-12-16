import { useState, useEffect } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { loginEmployee } from '../api/employee'
import { useToast } from '../components/ToastContainer'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  // Initialize dark mode from localStorage (default to light)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleSignIn = async () => {
    try {
      const response = await loginEmployee({ email, password })
      
      console.log('Login successful:', response)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.employee))
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }
      
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      showToast(error.response?.data?.message || 'Login failed. Please check your credentials.', 'error')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSignIn()
  }

  return (
    <div
      className="flex justify-center items-center min-h-screen p-4 sm:p-6 md:p-8"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
    >
      <div
        className="rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-md relative"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8">
          <img src="/logo.png" alt="logo" className="w-6 h-6 sm:w-8 sm:h-8" />
          <span
            className="text-lg sm:text-xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Koshpal
          </span>
        </div>

        {/* Welcome Text */}
        <div className="mb-6 sm:mb-8">
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Welcome back
          </h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Sign in to access your financial dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Work Email */}
          <div className="mb-3 sm:mb-4">
            <label
              className="block text-xs sm:text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Work Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5"
                style={{ color: 'var(--color-text-tertiary)' }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-input-bg)',
                  border: '1px solid var(--color-input-border)',
                  color: 'var(--color-input-text)',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3 sm:mb-4">
            <label
              className="block text-xs sm:text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5"
                style={{ color: 'var(--color-text-tertiary)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-input-bg)',
                  border: '1px solid var(--color-input-border)',
                  color: 'var(--color-input-text)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70 cursor-pointer"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mb-5 sm:mb-6 gap-2">
            <label className="flex items-center flex-shrink-0">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded flex-shrink-0 cursor-pointer"
                style={{
                  accentColor: 'var(--color-primary)',
                  borderColor: 'var(--color-input-border)',
                }}
              />
              <span
                className="cursor-pointer ml-1.5 sm:ml-2 text-xs sm:text-sm whitespace-nowrap"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Remember me
              </span>
            </label>
            <a
              href="#"
              className="text-xs sm:text-sm font-medium whitespace-nowrap hover:opacity-80"
              style={{ color: 'var(--color-secondary)' }}
            >
              Forgot password?
            </a>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="cursor-pointer w-full font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-200"
            style={{
              background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
              color: 'var(--color-text-inverse)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
