/**
 * ErrorBoundary - Captures React errors and displays a fallback UI
 * Prevents the entire app from crashing on component errors
 */

import { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'motion/react'
import { Button } from './Button'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Optional fallback component */
  fallback?: ReactNode
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })

    // Log to console for debugging
    console.error('ErrorBoundary caught an error:', error)
    console.error('Component stack:', errorInfo.componentStack)

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
          onReload={this.handleReload}
        />
      )
    }

    return this.props.children
  }
}

// Props for the fallback component
interface ErrorFallbackProps {
  error: Error | null
  onReset: () => void
  onReload: () => void
}

/**
 * Default error fallback UI component
 * Displays a user-friendly error message in French
 */
export function ErrorFallback({ error, onReset, onReload }: ErrorFallbackProps): JSX.Element {
  const isDev = import.meta.env.DEV

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center"
      >
        {/* Error icon */}
        <div className="text-6xl mb-4">&#9888;&#65039;</div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Oups, quelque chose s'est mal passe
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          Une erreur inattendue s'est produite. Nous nous excusons pour ce desagrement.
        </p>

        {/* Error details (dev mode only) */}
        {isDev && error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-sm font-mono text-red-800 break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={onReset}
          >
            Reessayer
          </Button>
          <Button
            variant="secondary"
            onClick={onReload}
          >
            Recharger la page
          </Button>
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/history'}
          >
            Retour a l'accueil
          </Button>
        </div>

        {/* Help text */}
        <p className="mt-6 text-sm text-gray-500">
          Si le probleme persiste, essayez de vider le cache de votre navigateur
          ou contactez le support.
        </p>
      </motion.div>
    </div>
  )
}

export default ErrorBoundary
