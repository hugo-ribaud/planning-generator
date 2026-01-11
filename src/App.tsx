/**
 * App - Main application component with routing
 * Provides authentication context and route management
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { ErrorBoundary } from './components/ui'
import {
  LoginPage,
  RegisterPage,
  PlanningHistoryPage,
  PlanningEditorPage,
  SharedPlanningPage,
} from './pages'

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
          <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/shared/:shareToken" element={<SharedPlanningPage />} />

          {/* Protected routes */}
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <PlanningHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planning/new"
            element={
              <ProtectedRoute>
                <PlanningEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planning/:planningId"
            element={
              <ProtectedRoute>
                <PlanningEditorPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/history" replace />} />
          <Route path="*" element={<Navigate to="/history" replace />} />
          </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
