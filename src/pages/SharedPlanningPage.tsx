/**
 * SharedPlanningPage - Public read-only view of a shared planning
 * Accessed via /shared/:shareToken
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { usePlannings } from '../hooks/usePlannings'
import { Card, Button } from '../components/ui'
import type { Planning, User, Task, Milestone, PlanningConfig, PlanningWeek } from '../types'

// Import planning display components
import { PlanningView } from '../components/planning/PlanningView'

interface SharedPlanning extends Planning {
  users_data: User[]
  tasks_data: Task[]
  milestones_data: Milestone[]
  planning_result: PlanningWeek[] | null
  config: PlanningConfig
}

export function SharedPlanningPage(): JSX.Element | null {
  const { shareToken } = useParams<{ shareToken: string }>()
  const { fetchSharedPlanning, loading, error } = usePlannings()
  const [planning, setPlanning] = useState<SharedPlanning | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const loadPlanning = async (): Promise<void> => {
      if (!shareToken) return

      const { data, error } = await fetchSharedPlanning(shareToken)

      if (error || !data) {
        setNotFound(true)
      } else {
        setPlanning(data as SharedPlanning)
      }
    }

    if (shareToken) {
      loadPlanning()
    }
  }, [shareToken, fetchSharedPlanning])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Chargement du planning...</p>
        </div>
      </div>
    )
  }

  // Not found state
  if (notFound || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="max-w-md p-8">
            <div className="text-6xl mb-4">&#128533;</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Planning introuvable
            </h1>
            <p className="text-gray-600 mb-6">
              Ce planning n'existe pas ou n'est plus partage.
            </p>
            <Link to="/login">
              <Button variant="primary">
                Se connecter
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Show planning (read-only)
  if (!planning) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {planning.name}
            </h1>
            <p className="text-sm text-gray-500">
              Planning partage (lecture seule)
            </p>
          </div>

          <Link to="/login">
            <Button variant="primary">
              Creer mon compte
            </Button>
          </Link>
        </div>
      </header>

      {/* Planning content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {planning.planning_result ? (
          // Show generated planning
          <PlanningView
            planning={planning.planning_result}
            users={planning.users_data || []}
            stats={null}
            onReset={undefined}
          />
        ) : (
          // No result generated yet
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">&#128221;</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Planning en cours de creation
            </h2>
            <p className="text-gray-600">
              Le proprietaire n'a pas encore genere ce planning.
            </p>
          </Card>
        )}

        {/* Planning summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {planning.users_data?.length || 0}
            </div>
            <div className="text-gray-600">Utilisateurs</div>
          </Card>

          <Card className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {planning.tasks_data?.length || 0}
            </div>
            <div className="text-gray-600">Taches</div>
          </Card>

          <Card className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {planning.milestones_data?.length || 0}
            </div>
            <div className="text-gray-600">Jalons</div>
          </Card>
        </div>

        {/* Config summary */}
        {planning.config?.startDate && (
          <Card className="mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Periode</h3>
            <p className="text-gray-600">
              Du {new Date(planning.config.startDate).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
              {planning.config.endDate && (
                <> au {new Date(planning.config.endDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</>
              )}
            </p>
          </Card>
        )}
      </main>

      {/* Footer CTA */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Envie de creer vos propres plannings ?
          </h2>
          <p className="text-gray-600 mb-4">
            Inscrivez-vous gratuitement et organisez votre vie familiale.
          </p>
          <Link to="/register">
            <Button variant="primary" size="lg">
              Creer un compte gratuit
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default SharedPlanningPage
