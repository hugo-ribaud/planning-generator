/**
 * RegisterPage - User registration page
 * Email/password signup with display name
 */

import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../contexts/AuthContext'
import { Button, Input, Card } from '../components/ui'

export function RegisterPage(): JSX.Element {
  const navigate = useNavigate()
  const { signUp, error, clearError, loading } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setFormError('')
    clearError()

    // Validation
    if (!displayName.trim()) {
      setFormError('Le nom est requis')
      return
    }
    if (!email.trim()) {
      setFormError('L\'email est requis')
      return
    }
    if (!password) {
      setFormError('Le mot de passe est requis')
      return
    }
    if (password.length < 6) {
      setFormError('Le mot de passe doit contenir au moins 6 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas')
      return
    }

    const { data, error } = await signUp(email, password, displayName)

    if (!error && data) {
      // Check if email confirmation is required
      if (data.user && !data.session) {
        setSuccess(true)
      } else {
        // Auto-login successful, redirect to history
        navigate('/history', { replace: true })
      }
    }
  }

  const displayError = formError || error

  // Success message (email confirmation required)
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-6 text-center">
            <div className="text-5xl mb-4">&#9993;</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifiez votre email
            </h2>
            <p className="text-gray-600 mb-6">
              Un email de confirmation a ete envoye a <strong>{email}</strong>.
              Cliquez sur le lien pour activer votre compte.
            </p>
            <Link to="/login">
              <Button variant="primary" className="w-full">
                Retour a la connexion
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    )
  }

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
            Creer un compte
          </h1>
          <p className="text-gray-600">
            Commencez a organiser vos plannings familiaux
          </p>
        </div>

        {/* Register Card */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Display Name */}
            <Input
              label="Nom d'affichage"
              type="text"
              value={displayName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
              placeholder="Ex: Hugo"
              required
              autoComplete="name"
              autoFocus
            />

            {/* Email */}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              autoComplete="email"
            />

            {/* Password */}
            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Minimum 6 caracteres"
              required
              autoComplete="new-password"
            />

            {/* Confirm Password */}
            <Input
              label="Confirmer le mot de passe"
              type="password"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              placeholder="Retapez votre mot de passe"
              required
              autoComplete="new-password"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creation...' : 'Creer mon compte'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-4 text-sm text-gray-500">ou</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-600">
            Deja un compte ?{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Se connecter
            </Link>
          </p>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          En creant un compte, vous acceptez nos conditions d'utilisation
        </p>
      </motion.div>
    </div>
  )
}

export default RegisterPage
