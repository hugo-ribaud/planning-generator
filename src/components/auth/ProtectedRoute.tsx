/**
 * ProtectedRoute - Route guard component
 * Redirects to login if user is not authenticated
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ReactNode } from 'react'

export interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
