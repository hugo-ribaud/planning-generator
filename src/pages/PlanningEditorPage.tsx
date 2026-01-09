/**
 * PlanningEditorPage - Main planning editor
 * Create and edit planning configurations
 */

import { useState, useCallback, useEffect, useRef, type ChangeEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { GeneralConfigForm, UsersForm, TasksForm } from '../components/forms'
import { PlanningView } from '../components/planning'
import { MilestoneList } from '../components/milestones'
import { Dashboard } from '../components/dashboard'
import { Button, SyncStatus, ToastContainer, MobileNav, NavLink } from '../components/ui'
import { usePlanningConfig, usePlanningGenerator, useMilestones, useRealtimeSync, useToasts, useShoppingList, detectChangedFields, getFieldLabel } from '../hooks'
import { usePlannings } from '../hooks/usePlannings'
import { useAuth } from '../contexts/AuthContext'
import { TEST_USERS, TEST_TASKS, TEST_MILESTONES } from '../utils/testData'
import { PrintablePlanning } from '../components/printable/magazine'
import { ShoppingListView } from '../components/shopping'
import type { PlanningConfig, User, Task, Milestone, PlanningWeek, ShoppingList } from '../types'

// Auto-save delay in ms (30 seconds)
const AUTOSAVE_DELAY = 30000

interface RealtimePayload {
  new: {
    updated_at?: string
    config?: PlanningConfig
    users_data?: User[]
    tasks_data?: Task[]
    milestones_data?: Milestone[]
    planning_result?: PlanningWeek[] | null
    shopping_list?: ShoppingList
    name?: string
  }
  old: {
    updated_at?: string
    config?: PlanningConfig
    users_data?: User[]
    tasks_data?: Task[]
    milestones_data?: Milestone[]
    planning_result?: PlanningWeek[] | null
    shopping_list?: ShoppingList
    name?: string
  }
}

interface PlanningData {
  id: string
  name: string
  config?: PlanningConfig
  users_data?: User[]
  tasks_data?: Task[]
  milestones_data?: Milestone[]
  planning_result?: PlanningWeek[] | null
  shopping_list?: ShoppingList
  updated_at: string
}

export function PlanningEditorPage(): JSX.Element {
  const { planningId } = useParams<{ planningId: string }>()
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
    loadMilestones,
  } = useMilestones()

  // Shopping list
  const {
    shoppingList,
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
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [currentPlanningId, setCurrentPlanningId] = useState<string | null>(planningId || null)
  const [isLoadingPlanning, setIsLoadingPlanning] = useState(planningId !== undefined && planningId !== 'new')

  // Auto-save ref to track changes
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track the last update timestamp to avoid re-applying our own changes
  const lastUpdateRef = useRef<string | null>(null)

  // Realtime sync handler - updates React state when remote changes arrive
  const handleRealtimeUpdate = useCallback((payload: RealtimePayload): void => {
    const newData = payload.new
    const oldData = payload.old

    // Skip if this is our own update (same updated_at timestamp)
    if (lastUpdateRef.current && newData.updated_at === lastUpdateRef.current) {
      console.log('Skipping own update')
      return
    }

    // Detect which fields changed
    const changedFields = detectChangedFields(oldData, newData)

    if (changedFields.length === 0) {
      return
    }

    // Build human-readable change description
    const changedLabels = changedFields.map(getFieldLabel).join(', ')
    toast.sync(`${changedLabels} modifie(s) depuis un autre appareil`)

    console.log('Realtime update received:', { changedFields, payload })

    // Update React state for each changed field
    for (const field of changedFields) {
      switch (field) {
        case 'config':
          if (newData.config) {
            loadConfig(newData.config)
          }
          break
        case 'users_data':
          if (newData.users_data) {
            loadUsers(newData.users_data)
          }
          break
        case 'tasks_data':
          if (newData.tasks_data) {
            loadTasks(newData.tasks_data)
          }
          break
        case 'milestones_data':
          if (newData.milestones_data) {
            loadMilestones(newData.milestones_data)
          }
          break
        case 'planning_result':
          if (newData.planning_result) {
            loadPlanning(newData.planning_result)
            setShowPlanning(true)
          } else {
            // Planning was cleared
            loadPlanning(null)
            setShowPlanning(false)
          }
          break
        case 'name':
          if (newData.name) {
            setPlanningName(newData.name)
          }
          break
        default:
          break
      }
    }

    // Update last saved time from remote
    if (newData.updated_at) {
      setLastSaved(new Date(newData.updated_at))
    }

    // Reset unsaved changes flag since we just synced
    setHasUnsavedChanges(false)
  }, [toast, loadConfig, loadUsers, loadTasks, loadMilestones, loadPlanning])

  // Realtime sync - subscribe to plannings table updates
  const { connectionStatus, lastSync, reconnect } = useRealtimeSync(
    currentPlanningId,
    {
      onUpdate: handleRealtimeUpdate,
    }
  )

  // Load existing planning if planningId is provided
  useEffect(() => {
    const loadExistingPlanning = async (): Promise<void> => {
      if (planningId && planningId !== 'new') {
        try {
          const { data, error } = await fetchPlanning(planningId)
          if (error) {
            toast.error('Impossible de charger le planning')
            navigate('/history')
            return
          }

          if (data) {
            const planningData = data as PlanningData
            setPlanningName(planningData.name || 'Planning sans titre')
            setCurrentPlanningId(planningData.id)

            // Load data into hooks
            if (planningData.config) loadConfig(planningData.config)
            if (planningData.users_data) loadUsers(planningData.users_data)
            if (planningData.tasks_data) loadTasks(planningData.tasks_data)
            if (planningData.milestones_data) loadMilestones(planningData.milestones_data)
            if (planningData.shopping_list) loadShoppingList(planningData.shopping_list)
            if (planningData.planning_result) {
              loadPlanning(planningData.planning_result)
              setShowPlanning(true)
            }

            setLastSaved(new Date(planningData.updated_at))
          }
        } finally {
          setIsLoadingPlanning(false)
        }
      } else {
        setIsLoadingPlanning(false)
      }
    }

    loadExistingPlanning()
  }, [planningId, fetchPlanning, navigate, toast, loadConfig, loadUsers, loadTasks, loadMilestones, loadPlanning, loadShoppingList])

  // Track changes for auto-save
  useEffect(() => {
    if (currentPlanningId) {
      setHasUnsavedChanges(true)
    }
  }, [config, users, tasks, milestones, planning, planningName, shoppingList, currentPlanningId])

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
  const handleSave = async (isAutoSave = false): Promise<void> => {
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
        const { data, error } = await updatePlanning(currentPlanningId, planningData)
        if (error) throw error

        // Track our own update timestamp to avoid re-applying it via realtime
        if (data?.updated_at) {
          lastUpdateRef.current = data.updated_at
        }
      } else {
        // Create new
        const { data, error } = await createPlanning(planningData)
        if (error) throw error
        if (data) {
          setCurrentPlanningId(data.id)
          // Update URL without reload
          window.history.replaceState(null, '', `/planning/${data.id}`)

          // Track our own update timestamp
          if (data.updated_at) {
            lastUpdateRef.current = data.updated_at
          }
        }
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
  const handleLoadTestData = useCallback((): void => {
    loadUsers(TEST_USERS)
    loadTasks(TEST_TASKS)
    loadMilestones(TEST_MILESTONES)
    toast.success('Donnees de test chargees (Hugo & Delphine)')
  }, [loadUsers, loadTasks, loadMilestones, toast])

  // Generate planning
  const handleGenerate = (): void => {
    if (validateConfig()) {
      const result = generate(config, users, tasks)
      if (result) {
        setShowPlanning(true)
        console.log('Planning genere:', result)
      }
    }
  }

  // Reset planning view
  const handleReset = (): void => {
    reset()
    setShowPlanning(false)
  }

  // Sign out
  const handleSignOut = async (): Promise<void> => {
    await signOut()
    navigate('/login')
  }

  // Loading state for initial fetch
  if (isLoadingPlanning) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Chargement du planning...</p>
        </div>
      </div>
    )
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
          weeks={planning || undefined}
          users={users}
          milestones={milestones}
          config={config}
          shoppingList={shoppingList}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Mobile Navigation */}
      <MobileNav
        title={planningName || 'Planning'}
        subtitle={hasUnsavedChanges ? 'Non sauvegarde' : lastSaved ? `Sauvegarde ${lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : undefined}
        headerActions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSave(false)}
            className="touch-target"
            aria-label="Sauvegarder"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </Button>
        }
      >
        {/* Mobile menu content */}
        <div className="space-y-2">
          <NavLink
            icon="←"
            label="Retour a l'historique"
            onClick={() => navigate('/history')}
          />
          <NavLink
            icon="💾"
            label="Sauvegarder"
            onClick={() => handleSave(false)}
          />
          {(tasks.length > 0 || milestones.length > 0) && (
            <NavLink
              icon="🖨"
              label="Version imprimable"
              onClick={() => setShowPrintable(true)}
            />
          )}
          <div className="border-t border-gray-200 my-4" />
          <div className="px-4 py-2">
            <p className="text-sm text-gray-500">Connecte en tant que</p>
            <p className="font-medium text-gray-900">{displayName}</p>
          </div>
          <NavLink
            icon="🚪"
            label="Deconnexion"
            onClick={handleSignOut}
          />
        </div>
      </MobileNav>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/history')}
              className="text-gray-500 hover:text-gray-700 touch-target flex items-center justify-center"
            >
              ← Retour
            </button>
            <input
              type="text"
              value={planningName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPlanningName(e.target.value)}
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
      <main className="max-w-4xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
        {/* Mobile: Planning name input (editable on mobile) */}
        <div className="lg:hidden mb-4">
          <input
            type="text"
            value={planningName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPlanningName(e.target.value)}
            className="w-full text-lg font-bold text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nom du planning"
          />
        </div>

        {/* Sync status & dev tools */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
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
          {planning && planning.length > 0 && (
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
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4"
          >
            {!showPlanning ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerate}
                disabled={users.some(u => !u.name) || tasks.length === 0 || isGenerating}
                className="w-full sm:w-auto touch-target"
              >
                {isGenerating ? 'Generation...' : 'Generer le Planning'}
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleReset}
                  className="w-full sm:w-auto touch-target"
                >
                  Modifier
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleSave(false)}
                  className="w-full sm:w-auto touch-target"
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
          className="mt-6 sm:mt-8 text-center pb-4 sm:pb-0"
        >
          <div className="inline-flex flex-wrap justify-center items-center gap-2 px-3 sm:px-4 py-2 bg-common/10 text-common rounded-full text-xs sm:text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-common"></span>
            <span>{users.length} utilisateur{users.length > 1 ? 's' : ''}</span>
            <span className="hidden sm:inline">•</span>
            <span>{tasks.length} tache{tasks.length > 1 ? 's' : ''}</span>
            <span className="hidden sm:inline">•</span>
            <span>{milestones.length} objectif{milestones.length > 1 ? 's' : ''}</span>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default PlanningEditorPage
