import { Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { axiosInstance } from '../api/axiosInstance'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const userStr = localStorage.getItem('user')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have user data and if the httpOnly cookie is valid
        if (!userStr) {
          setIsAuthenticated(false)
          return
        }

        const user = JSON.parse(userStr)
        
        // Validate role
        if (user.role !== 'EMPLOYEE') {
          localStorage.removeItem('user')
          setIsAuthenticated(false)
          return
        }

        // Verify the httpOnly cookie is still valid by calling /me endpoint
        await axiosInstance.get('/auth/me')
        setIsAuthenticated(true)
      } catch (error: any) {
        console.error('Authentication check failed:', error?.response?.status, error?.message)
        
        // Clear localStorage
        localStorage.removeItem('user')
        
        // If it's a 403 (Forbidden), try to clear server-side cookies too
        if (error?.response?.status === 403) {
          try {
            await axiosInstance.post('/auth/logout')
          } catch (logoutError) {
            console.log('Logout failed, but continuing')
          }
        }
        
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [userStr])

  if (isAuthenticated === null) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
