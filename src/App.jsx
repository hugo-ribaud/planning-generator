import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { GeneralConfigForm, UsersForm, TasksForm } from './components/forms'
import { PlanningView } from './components/planning'
import { MilestoneList } from './components/milestones'
import { Dashboard } from './components/dashboard'
import { Button, SyncStatus, ToastContainer } from './components/ui'
import { usePlanningConfig, usePlanningGenerator, useMilestones, useRealtimeSync, useToasts } from './hooks'
import { TEST_USERS, TEST_TASKS, TEST_MILESTONES } from './utils/testData'
import { PrintablePlanning } from './components/printable/magazine'

function App() {
  const {
    config,
    users,
    tasks,
    errors,
    updateConfig,
    validateConfig,
    addUser,
    updateUser,
    removeUser,
    addTask,
    updateTask,
    removeTask,
    loadUsers,
    loadTasks,
  } = usePlanningConfig()

  const {
    planning,
    stats,
    isGenerating,
    error: generationError,
    generate,
    reset,
  } = usePlanningGenerator()

  const {
    milestones,
    addMilestone,
    updateMilestone,
    removeMilestone,
    toggleFocus,
    getFocusMilestone,
    loadMilestones,
  } = useMilestones()

  const { toasts, removeToast, toast } = useToasts()

  // Realtime sync handlers
  const handleRealtimeUpdate = useCallback((table, payload) => {
    const eventLabels = {
      INSERT: 'ajoute',
      UPDATE: 'modifie',
      DELETE: 'supprime',
    }
    const tableLabels = {
      milestones: 'objectif',
      tasks: 'tache',
      slots: 'creneau',
      config: 'configuration',
    }

    // Show toast for external updates
    toast.sync(
      `${tableLabels[table] || table} ${eventLabels[payload.eventType] || 'modifie'} depuis un autre appareil`
    )

    // Handle data updates based on table
    // Note: In production, this would update the local state with Supabase data
    console.log(`Realtime update [${table}]:`, payload)
  }, [toast])

  // Realtime sync (using a placeholder configId for now)
  const { connectionStatus, lastSync, reconnect, isConnected } = useRealtimeSync(
    config.id || null,
    {
      milestones: (payload) => handleRealtimeUpdate('milestones', payload),
      tasks: (payload) => handleRealtimeUpdate('tasks', payload),
      slots: (payload) => handleRealtimeUpdate('slots', payload),
      config: (payload) => handleRealtimeUpdate('config', payload),
    }
  )

  const [showPlanning, setShowPlanning] = useState(false)
  const [showPrintable, setShowPrintable] = useState(false)

  // Load test data for Hugo & Delphine
  const handleLoadTestData = useCallback(() => {
    loadUsers(TEST_USERS)
    loadTasks(TEST_TASKS)
    loadMilestones(TEST_MILESTONES)
    toast.success('Données de test chargées (Hugo & Delphine)')
  }, [loadUsers, loadTasks, loadMilestones, toast])

  const handleGenerate = () => {
    if (validateConfig()) {
      const result = generate(config, users, tasks)
      if (result) {
        setShowPlanning(true)
        console.log('Planning généré:', result)
      }
    }
  }

  const handleReset = () => {
    reset()
    setShowPlanning(false)
  }

  // Affichage de la version imprimable magazine
  if (showPrintable) {
    return (
      <div className="relative">
        {/* Bouton retour (masqué à l'impression) */}
        <button
          onClick={() => setShowPrintable(false)}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 print:hidden"
        >
          ← Retour
        </button>
        <PrintablePlanning
          weeks={planning}
          users={users}
          milestones={milestones}
          config={config}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Planning Familial
          </h1>
          <p className="text-gray-600 mb-4">
            Organisez votre vie de foyer avec des objectifs et un planning partagé
          </p>
          {/* Sync status & dev tools */}
          <div className="flex justify-center items-center gap-4">
            <SyncStatus
              status={connectionStatus}
              lastSync={lastSync}
              onReconnect={reconnect}
            />
            {/* Dev: Load test data button */}
            {tasks.length === 0 && milestones.length === 0 && (
              <button
                onClick={handleLoadTestData}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              >
                🧪 Charger données test
              </button>
            )}
            {/* Print button */}
            {(tasks.length > 0 || milestones.length > 0) && (
              <button
                onClick={() => setShowPrintable(true)}
                className="px-3 py-1.5 text-xs font-medium bg-amber-700 hover:bg-amber-800 text-white rounded-full transition-colors"
              >
                📰 Version imprimable
              </button>
            )}
          </div>
        </header>

        {/* Dashboard */}
        {(milestones.length > 0 || tasks.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Dashboard
              milestones={milestones}
              tasks={tasks}
              users={users}
              planning={planning}
            />
          </motion.div>
        )}

        {/* Forms */}
        <div className="space-y-6">
          <GeneralConfigForm
            config={config}
            errors={errors}
            onUpdate={updateConfig}
          />

          <UsersForm
            users={users}
            onUpdate={updateUser}
            onAdd={addUser}
            onRemove={removeUser}
          />

          <TasksForm
            tasks={tasks}
            users={users}
            onUpdate={updateTask}
            onAdd={addTask}
            onRemove={removeTask}
          />

          <MilestoneList
            milestones={milestones}
            users={users}
            onAdd={addMilestone}
            onUpdate={updateMilestone}
            onDelete={removeMilestone}
            onToggleFocus={toggleFocus}
          />

          {/* Error message */}
          <AnimatePresence>
            {generationError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
              >
                {generationError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Planning View */}
          <AnimatePresence>
            {planning && showPlanning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PlanningView
                  planning={planning}
                  users={users}
                  stats={stats}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-4 pt-4"
          >
            {!showPlanning ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerate}
                disabled={users.some(u => !u.name) || tasks.length === 0 || isGenerating}
              >
                {isGenerating ? 'Génération...' : 'Générer le Planning'}
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleReset}
                >
                  Modifier
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    // TODO: Implement export in DEV-104
                    console.log('Export planning:', planning)
                    alert('Export disponible dans la prochaine version !')
                  }}
                >
                  Exporter
                </Button>
              </>
            )}
          </motion.div>
        </div>

        {/* Footer status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-common/10 text-common rounded-full text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-common"></span>
            {users.length} utilisateur{users.length > 1 ? 's' : ''} • {tasks.length} tache{tasks.length > 1 ? 's' : ''} • {milestones.length} objectif{milestones.length > 1 ? 's' : ''}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default App
