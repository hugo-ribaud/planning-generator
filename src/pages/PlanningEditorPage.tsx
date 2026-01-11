/**
 * PlanningEditorPage - Main planning editor with AI-First creation flow
 * Supports: Mode selection → AI/Manual creation → Editor
 */

import { useState, useCallback, useEffect, useRef, type ChangeEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { GeneralConfigForm, UsersForm, TasksForm, AIPromptModal } from '../components/forms'
import { PlanningView } from '../components/planning'
import { MilestoneList } from '../components/milestones'
import { Dashboard } from '../components/dashboard'
import { Button, SyncStatus, ToastContainer, MobileNav, NavLink, PlanoraiLogo, ThemeToggle, KeyboardShortcutsModal, ExportDropdown } from '../components/ui'
import { CreationModeSelector, AICreationFlow, ManualWizard } from '../components/creation'
import { usePlanningConfig, usePlanningGenerator, useMilestones, useRealtimeSync, useToasts, useShoppingList, useKeyboardShortcuts, detectChangedFields, getFieldLabel, type TransformedPlanningData, type UsePlanningConfigReturn } from '../hooks'
import { usePlannings } from '../hooks/usePlannings'
import { useAuth } from '../contexts/AuthContext'
import { TEST_USERS, TEST_TASKS, TEST_MILESTONES } from '../utils/testData'
import { PrintablePlanning } from '../components/printable/magazine'
import { ShoppingListView } from '../components/shopping'
import type { PlanningConfig, User, Task, Milestone, PlanningWeek, ShoppingList } from '../types'
import { exportToJSON } from '../utils/exportUtils'

// Auto-save delay in ms (30 seconds)
const AUTOSAVE_DELAY = 30000

// Creation mode states
type CreationMode = 'selector' | 'ai' | 'wizard' | 'editor'

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
  const planningConfig = usePlanningConfig()
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
  } = planningConfig

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
  const [showAIModal, setShowAIModal] = useState(false)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)
  const [planningName, setPlanningName] = useState('Planning sans titre')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [currentPlanningId, setCurrentPlanningId] = useState<string | null>(planningId || null)
  const [isLoadingPlanning, setIsLoadingPlanning] = useState(planningId !== undefined && planningId !== 'new')

  // Creation mode - start with selector for new plannings, editor for existing
  const [creationMode, setCreationMode] = useState<CreationMode>(
    planningId && planningId !== 'new' ? 'editor' : 'selector'
  )

  // Auto-save ref to track changes
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track the last update timestamp to avoid re-applying our own changes
  const lastUpdateRef = useRef<string | null>(null)

  // Section refs for keyboard navigation
  const configSectionRef = useRef<HTMLDivElement>(null)
  const usersSectionRef = useRef<HTMLDivElement>(null)
  const tasksSectionRef = useRef<HTMLDivElement>(null)
  const milestonesSectionRef = useRef<HTMLDivElement>(null)
  const shoppingSectionRef = useRef<HTMLDivElement>(null)

  // Scroll to section helper
  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  // Keyboard shortcuts (only active in editor mode)
  useKeyboardShortcuts(
    [
      // Save
      {
        key: 'mod+s',
        handler: () => {
          if (creationMode === 'editor') {
            handleSave(false)
            toast.success('Sauvegarde en cours...')
          }
        },
        description: 'Sauvegarder',
      },
      // New task
      {
        key: 'mod+n',
        handler: () => {
          if (creationMode === 'editor') {
            addTask()
            setTimeout(() => scrollToSection(tasksSectionRef), 100)
            toast.info('Nouvelle tache ajoutee')
          }
        },
        description: 'Nouvelle tache',
      },
      // New user
      {
        key: 'mod+u',
        handler: () => {
          if (creationMode === 'editor') {
            addUser()
            setTimeout(() => scrollToSection(usersSectionRef), 100)
            toast.info('Nouvel utilisateur ajoute')
          }
        },
        description: 'Nouvel utilisateur',
      },
      // Generate planning
      {
        key: 'mod+g',
        handler: () => {
          if (creationMode === 'editor' && !showPlanning) {
            handleGenerate()
          }
        },
        description: 'Generer planning',
      },
      // Print
      {
        key: 'mod+p',
        handler: () => {
          if (creationMode === 'editor' && planning && planning.length > 0) {
            setShowPrintable(true)
          }
        },
        description: 'Imprimer',
      },
      // Close modals
      {
        key: 'escape',
        handler: () => {
          if (showShortcutsModal) setShowShortcutsModal(false)
          else if (showAIModal) setShowAIModal(false)
          else if (showPrintable) setShowPrintable(false)
        },
        description: 'Fermer',
      },
      // Section navigation (number keys)
      {
        key: '1',
        handler: () => creationMode === 'editor' && scrollToSection(configSectionRef),
        description: 'Configuration',
        disableOnInput: true,
      },
      {
        key: '2',
        handler: () => creationMode === 'editor' && scrollToSection(usersSectionRef),
        description: 'Utilisateurs',
        disableOnInput: true,
      },
      {
        key: '3',
        handler: () => creationMode === 'editor' && scrollToSection(tasksSectionRef),
        description: 'Taches',
        disableOnInput: true,
      },
      {
        key: '4',
        handler: () => creationMode === 'editor' && scrollToSection(milestonesSectionRef),
        description: 'Objectifs',
        disableOnInput: true,
      },
      {
        key: '5',
        handler: () => creationMode === 'editor' && scrollToSection(shoppingSectionRef),
        description: 'Courses',
        disableOnInput: true,
      },
      // Help modal
      {
        key: 'shift+/',
        handler: () => setShowShortcutsModal(true),
        description: 'Aide raccourcis',
        disableOnInput: true,
      },
    ],
    { enabled: creationMode === 'editor' || showShortcutsModal || showAIModal || showPrintable }
  )

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
            setCreationMode('editor')

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

  // Apply AI-generated data
  const handleApplyAIData = useCallback((data: TransformedPlanningData): void => {
    loadConfig(data.config)
    loadUsers(data.users)
    loadTasks(data.tasks)
    loadMilestones(data.milestones)
    if (data.shoppingList) {
      loadShoppingList(data.shoppingList)
    }
    if (data.config.name) {
      setPlanningName(data.config.name)
    }
    setHasUnsavedChanges(true)
    setCreationMode('editor')
    toast.success('Planning genere par IA applique')
  }, [loadConfig, loadUsers, loadTasks, loadMilestones, loadShoppingList, toast])

  // Complete wizard
  const handleWizardComplete = useCallback((): void => {
    setCreationMode('editor')
    toast.success('Configuration terminee')
  }, [toast])

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

  // Build planningConfig adapter for ManualWizard
  const planningConfigForWizard: UsePlanningConfigReturn = {
    ...planningConfig,
    milestones,
    shoppingList,
    addMilestone,
    updateMilestone,
    deleteMilestone: removeMilestone,
    setShoppingList: loadShoppingList,
    deleteUser: removeUser,
    deleteTask: removeTask,
    onConfigChange: updateConfig,
  }

  // Render creation flow based on mode
  const renderCreationFlow = (): JSX.Element => {
    switch (creationMode) {
      case 'selector':
        return (
          <CreationModeSelector
            onSelectAI={() => setCreationMode('ai')}
            onSelectManual={() => setCreationMode('wizard')}
          />
        )

      case 'ai':
        return (
          <AICreationFlow
            onApply={handleApplyAIData}
            onBack={() => setCreationMode('selector')}
          />
        )

      case 'wizard':
        return (
          <ManualWizard
            planningConfig={planningConfigForWizard}
            onComplete={handleWizardComplete}
            onBack={() => setCreationMode('selector')}
          />
        )

      case 'editor':
      default:
        return renderEditor()
    }
  }

  // Render the full editor
  const renderEditor = (): JSX.Element => (
    <>
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
        <div ref={configSectionRef}>
          <GeneralConfigForm
            config={config}
            errors={errors}
            onUpdate={updateConfig}
          />
        </div>

        <div ref={usersSectionRef}>
          <UsersForm
            users={users}
            onUpdate={updateUser}
            onAdd={addUser}
            onRemove={removeUser}
          />
        </div>

        <div ref={tasksSectionRef}>
          <TasksForm
            tasks={tasks}
            users={users}
            onUpdate={updateTask}
            onAdd={addTask}
            onRemove={removeTask}
          />
        </div>

        <div ref={milestonesSectionRef}>
          <MilestoneList
            milestones={milestones}
            users={users}
            onAdd={addMilestone}
            onUpdate={updateMilestone}
            onDelete={removeMilestone}
            onToggleFocus={toggleFocus}
          />
        </div>

        {/* Shopping List */}
        <div ref={shoppingSectionRef}>
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
        </div>

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
            <>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowAIModal(true)}
                className="w-full sm:w-auto touch-target group"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500 group-hover:text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Generer avec IA
                </span>
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerate}
                disabled={users.some(u => !u.name) || tasks.length === 0 || isGenerating}
                className="w-full sm:w-auto touch-target"
              >
                {isGenerating ? 'Generation...' : 'Generer le Planning'}
              </Button>
            </>
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

      {/* AI Prompt Modal (for editor mode regeneration) */}
      <AIPromptModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onApply={handleApplyAIData}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Mobile Navigation - only show in editor mode */}
      {creationMode === 'editor' && (
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
            <NavLink
              icon="📤"
              label="Exporter JSON"
              onClick={() => {
                exportToJSON({
                  name: planningName,
                  config,
                  users,
                  tasks,
                  milestones,
                  shoppingList,
                  planningResult: planning,
                })
                toast.success('Export JSON reussi')
              }}
            />
            {(tasks.length > 0 || milestones.length > 0) && (
              <NavLink
                icon="🖨"
                label="Version imprimable"
                onClick={() => setShowPrintable(true)}
              />
            )}
            <NavLink
              icon="⌨️"
              label="Raccourcis clavier"
              onClick={() => setShowShortcutsModal(true)}
            />
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
      )}

      {/* Desktop Header - only show in editor mode */}
      {creationMode === 'editor' && (
        <header className="hidden lg:block bg-gradient-to-r from-primary/5 via-white to-secondary/5 dark:from-primary/10 dark:via-surface-dark dark:to-secondary/10 border-b border-gray-200 dark:border-border-dark sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/history')}
                className="text-gray-500 dark:text-text-muted-dark hover:text-primary touch-target flex items-center justify-center transition-colors"
              >
                ← Retour
              </button>
              <PlanoraiLogo width={120} height={36} animated={false} />
              <span className="text-gray-300 dark:text-border-dark">|</span>
              <input
                type="text"
                value={planningName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPlanningName(e.target.value)}
                className="text-xl font-bold text-gray-900 dark:text-text-dark bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 dark:focus:ring-offset-background-dark rounded px-2 py-1"
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

              {/* Export dropdown */}
              <ExportDropdown
                options={{
                  name: planningName,
                  config,
                  users,
                  tasks,
                  milestones,
                  shoppingList,
                  planningResult: planning,
                }}
                onExportComplete={(format) => toast.success(`Export ${format} reussi`)}
              />

              <ThemeToggle />

              {/* Keyboard shortcuts help */}
              <button
                onClick={() => setShowShortcutsModal(true)}
                className="p-2 text-gray-500 dark:text-text-muted-dark hover:text-gray-700 dark:hover:text-text-dark hover:bg-gray-100 dark:hover:bg-surface-elevated-dark rounded-lg transition-colors"
                aria-label="Raccourcis clavier"
                title="Raccourcis clavier (?)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </button>

              <div className="text-sm text-gray-500 dark:text-text-muted-dark">
                {displayName}
              </div>

              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Deconnexion
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="max-w-4xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
        {/* Editor mode: Mobile planning name input */}
        {creationMode === 'editor' && (
          <>
            <div className="lg:hidden mb-4">
              <div className="flex items-center gap-2 mb-2">
                <PlanoraiLogo width={100} height={30} animated={false} />
              </div>
              <input
                type="text"
                value={planningName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPlanningName(e.target.value)}
                className="w-full text-lg font-bold text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
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
          </>
        )}

        {/* Render based on creation mode */}
        <AnimatePresence mode="wait">
          <motion.div
            key={creationMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderCreationFlow()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default PlanningEditorPage
