/**
 * PlanningEditorPage - Main planning editor
 * Create and edit planning configurations
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { GeneralConfigForm, UsersForm, TasksForm } from '../components/forms'
import { PlanningView } from '../components/planning'
import { MilestoneList } from '../components/milestones'
import { Dashboard } from '../components/dashboard'
import { Button, SyncStatus, ToastContainer } from '../components/ui'
import { usePlanningConfig, usePlanningGenerator, useMilestones, useRealtimeSync, useToasts, useShoppingList } from '../hooks'
import { usePlannings } from '../hooks/usePlannings'
import { useAuth } from '../contexts/AuthContext'
import { TEST_USERS, TEST_TASKS, TEST_MILESTONES } from '../utils/testData'
import { PrintablePlanning } from '../components/printable/magazine'
import { ShoppingListView } from '../components/shopping'

// Auto-save delay in ms (30 seconds)
const AUTOSAVE_DELAY = 30000

export function PlanningEditorPage() {
  const { planningId } = useParams()
  const navigate = useNavigate()
  const { displayName, signOut } = useAuth()
  const { fetchPlanning, createPlanning, updatePlanning, loading: savingLoading } = usePlannings()
  const { toasts, removeToast, toast } = useToasts()

  // Planning configuration
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
    loadConfig,
  } = usePlanningConfig()

  // Planning generator
  const {
    planning,
    stats,
    isGenerating,
    error: generationError,
    generate,
    reset,
    loadPlanning,
  } = usePlanningGenerator()

  // Milestones
  const {
    milestones,
    addMilestone,
    updateMilestone,
    removeMilestone,
    toggleFocus,
    getFocusMilestone,
    loadMilestones,
  } = useMilestones()

  // Shopping list
  const {
    shoppingList,
    updateTitle: updateShoppingTitle,
    addCategory,
    updateCategory,
    removeCategory,
    addItem,
    updateItem,
    removeItem,
    toggleItem,
    assignItem,
    clearCheckedItems,
    uncheckAllItems,
    resetToDefault: resetShoppingList,
    loadShoppingList,
    getStats: getShoppingStats,
  } = useShoppingList()

  // Local state
  const [showPlanning, setShowPlanning] = useState(false)
  const [showPrintable, setShowPrintable] = useState(false)
  const [planningName, setPlanningName] = useState('Planning sans titre')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [currentPlanningId, setCurrentPlanningId] = useState(planningId || null)

  // Auto-save ref to track changes
  const autoSaveTimerRef = useRef(null)

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

    toast.sync(
      `${tableLabels[table] || table} ${eventLabels[payload.eventType] || 'modifie'} depuis un autre appareil`
    )
    console.log(`Realtime update [${table}]:`, payload)
  }, [toast])

  // Realtime sync
  const { connectionStatus, lastSync, reconnect, isConnected } = useRealtimeSync(
    config.id || null,
    {
      milestones: (payload) => handleRealtimeUpdate('milestones', payload),
      tasks: (payload) => handleRealtimeUpdate('tasks', payload),
      slots: (payload) => handleRealtimeUpdate('slots', payload),
      config: (payload) => handleRealtimeUpdate('config', payload),
    }
  )

  // Load existing planning if planningId is provided
  useEffect(() => {
    const loadExistingPlanning = async () => {
      if (planningId && planningId !== 'new') {
        const { data, error } = await fetchPlanning(planningId)
        if (error) {
          toast.error('Impossible de charger le planning')
          navigate('/history')
          return
        }

        if (data) {
          setPlanningName(data.name || 'Planning sans titre')
          setCurrentPlanningId(data.id)

          // Load data into hooks
          if (data.config) loadConfig(data.config)
          if (data.users_data) loadUsers(data.users_data)
          if (data.tasks_data) loadTasks(data.tasks_data)
          if (data.milestones_data) loadMilestones(data.milestones_data)
          if (data.shopping_list) loadShoppingList(data.shopping_list)
          if (data.planning_result) {
            loadPlanning(data.planning_result)
            setShowPlanning(true)
          }

          setLastSaved(new Date(data.updated_at))
        }
      }
    }

    loadExistingPlanning()
  }, [planningId, fetchPlanning, navigate, toast, loadConfig, loadUsers, loadTasks, loadMilestones, loadPlanning])

  // Track changes for auto-save
  useEffect(() => {
    if (currentPlanningId) {
      setHasUnsavedChanges(true)
    }
  }, [config, users, tasks, milestones, planning, planningName, shoppingList])

  // Auto-save effect
  useEffect(() => {
    if (!hasUnsavedChanges || !currentPlanningId) return

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(async () => {
      await handleSave(true)
    }, AUTOSAVE_DELAY)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [hasUnsavedChanges, currentPlanningId, config, users, tasks, milestones, planning])

  // Save planning
  const handleSave = async (isAutoSave = false) => {
    const planningData = {
      name: planningName,
      config,
      users,
      tasks,
      milestones,
      planningResult: planning,
      shoppingList,
    }

    try {
      if (currentPlanningId) {
        // Update existing
        const { error } = await updatePlanning(currentPlanningId, planningData)
        if (error) throw error
      } else {
        // Create new
        const { data, error } = await createPlanning(planningData)
        if (error) throw error
        setCurrentPlanningId(data.id)
        // Update URL without reload
        window.history.replaceState(null, '', `/planning/${data.id}`)
      }

      setHasUnsavedChanges(false)
      setLastSaved(new Date())

      if (!isAutoSave) {
        toast.success('Planning sauvegarde')
      }
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde')
      console.error('Save error:', err)
    }
  }

  // Load test data
  const handleLoadTestData = useCallback(() => {
    loadUsers(TEST_USERS)
    loadTasks(TEST_TASKS)
    loadMilestones(TEST_MILESTONES)
    toast.success('Donnees de test chargees (Hugo & Delphine)')
  }, [loadUsers, loadTasks, loadMilestones, toast])

  // Generate planning
  const handleGenerate = () => {
    if (validateConfig()) {
      const result = generate(config, users, tasks)
      if (result) {
        setShowPlanning(true)
        console.log('Planning genere:', result)
      }
    }
  }

  // Reset planning view
  const handleReset = () => {
    reset()
    setShowPlanning(false)
  }

  // Sign out
  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Printable view
  if (showPrintable) {
    return (
      <div className="relative">
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
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/history')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Retour
            </button>
            <input
              type="text"
              value={planningName}
              onChange={(e) => setPlanningName(e.target.value)}
              className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
              placeholder="Nom du planning"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Save status */}
            <div className="text-sm text-gray-500">
              {savingLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Sauvegarde...
                </span>
              ) : lastSaved ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Sauvegarde {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              ) : hasUnsavedChanges ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Non sauvegarde
                </span>
              ) : null}
            </div>

            <Button variant="secondary" size="sm" onClick={() => handleSave(false)}>
              Sauvegarder
            </Button>

            <div className="text-sm text-gray-500">
              {displayName}
            </div>

            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Deconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto py-8 px-4">
        {/* Sync status & dev tools */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <SyncStatus
            status={connectionStatus}
            lastSync={lastSync}
            onReconnect={reconnect}
          />
          {tasks.length === 0 && milestones.length === 0 && (
            <button
              onClick={handleLoadTestData}
              className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              Charger donnees test
            </button>
          )}
          {(tasks.length > 0 || milestones.length > 0) && (
            <button
              onClick={() => setShowPrintable(true)}
              className="px-3 py-1.5 text-xs font-medium bg-amber-700 hover:bg-amber-800 text-white rounded-full transition-colors"
            >
              Version imprimable
            </button>
          )}
        </div>

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

          {/* Shopping List */}
          <ShoppingListView
            shoppingList={shoppingList}
            users={users}
            actions={{
              addCategory,
              updateCategory,
              removeCategory,
              addItem,
              updateItem,
              removeItem,
              toggleItem,
              assignItem,
              clearCheckedItems,
              uncheckAllItems,
              resetToDefault: resetShoppingList,
              getStats: getShoppingStats,
            }}
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
                {isGenerating ? 'Generation...' : 'Generer le Planning'}
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
                  onClick={() => handleSave(false)}
                >
                  Sauvegarder
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
      </main>
    </div>
  )
}

export default PlanningEditorPage
