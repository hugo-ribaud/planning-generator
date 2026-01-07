/**
 * LoginPage - User authentication page
 * Email/password login with link to register
 */

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../contexts/AuthContext'
import { Button, Input, Card } from '../components/ui'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, error, clearError, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')

  // Get redirect path from location state or default to /history
  const from = location.state?.from?.pathname || '/history'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    clearError()

    // Basic validation
    if (!email.trim()) {
      setFormError('L\'email est requis')
      return
    }
    if (!password) {
      setFormError('Le mot de passe est requis')
      return
    }

    const { error } = await signIn(email, password)

    if (!error) {
      navigate(from, { replace: true })
    }
  }

  const displayError = formError || error

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Planning Familial
          </h1>
          <p className="text-gray-600">
            Connectez-vous pour acceder a vos plannings
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {displayError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {displayError}
              </motion.div>
            )}

            {/* Email */}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              autoComplete="email"
              autoFocus
            />

            {/* Password */}
            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
              autoComplete="current-password"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-4 text-sm text-gray-500">ou</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Register Link */}
          <p className="text-center text-gray-600">
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Creer un compte
            </Link>
          </p>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Organisez votre vie de famille avec des plannings partages
        </p>
      </motion.div>
    </div>
  )
}

export default LoginPage
