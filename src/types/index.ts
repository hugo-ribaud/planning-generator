/**
 * Types TypeScript pour l'application Planning Familial
 */

// ============================================
// User & Profile Types
// ============================================

export interface User {
  id: string
  name: string
  color: string
  daysOff: string[]
  constraints?: string
}

export interface Profile {
  id: string
  email: string
  display_name?: string
  created_at: string
  updated_at: string
}

export interface UserAccount {
  id: string
  display_name?: string
  email?: string
  created_at: string
  updated_at: string
}

// ============================================
// Planning Configuration Types
// ============================================

export type PeriodType = 'week' | 'month'

export interface PlanningConfig {
  id?: string
  name?: string
  period?: PeriodType
  weekStartDay: string
  workDays: string[]
  slotDuration: number
  workStart?: string
  workEnd?: string
  lunchStart?: string
  lunchEnd?: string
  startDate?: string
  createdBy?: string
}

// ============================================
// Task Types
// ============================================

export type TaskType = 'solo' | 'common' | 'flexible'
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'once' | 'custom'
export type TimePreference = 'morning' | 'afternoon' | 'evening' | 'any'
export type Priority = 1 | 2 | 3 | 4 | 5

export interface Task {
  id: string
  name: string
  duration: number
  priority: Priority
  type: TaskType
  recurrence: RecurrenceType
  assignedTo?: string
  preferredTime: TimePreference
  preferredDays?: string[]
  color?: string
  configId?: string
}

// ============================================
// Milestone Types
// ============================================

export type MilestoneStatus = 'todo' | 'in_progress' | 'done'

export interface Milestone {
  id: string
  name: string
  title?: string
  description?: string
  targetDate?: string
  target_date?: string
  isCompleted: boolean
  is_completed?: boolean
  isFocused: boolean
  is_focus?: boolean
  color: string
  assignedTo?: string
  assigned_to?: string
  status?: MilestoneStatus
  progress?: number
  notes?: string
  configId?: string
}

// ============================================
// Planning Slot Types
// ============================================

export interface PlanningSlot {
  id: string
  taskId: string
  task_id?: string
  userId: string
  assigned_to?: string
  day: string
  startTime: string
  start_time?: string
  endTime: string
  end_time?: string
  columnType?: string
  column_type?: string
  isManual?: boolean
  is_manual?: boolean
  configId?: string
  config_id?: string
}

// ============================================
// Shopping List Types
// ============================================

export interface ShoppingItem {
  id: string
  name: string
  quantity: string
  unit: string
  isChecked: boolean
  is_checked?: boolean
  assignedTo?: string
  assigned_to?: string
  notes?: string
}

export interface ShoppingCategory {
  id: string
  name: string
  icon: string
  order: number
  items: ShoppingItem[]
}

export interface ShoppingList {
  id: string
  title: string
  categories: ShoppingCategory[]
  created_at?: string
  updated_at?: string
}

// ============================================
// Complete Planning Type
// ============================================

export interface Planning {
  id: string
  name: string
  config: PlanningConfig
  users_data: User[]
  tasks_data: Task[]
  milestones_data: Milestone[]
  planning_result: PlanningSlot[] | null
  shopping_list?: ShoppingList
  share_token?: string
  is_public?: boolean
  created_at: string
  updated_at: string
  user_id: string
}

// ============================================
// Planning Generation Types
// ============================================

export interface GeneratedWeek {
  weekNumber: number
  days: GeneratedDay[]
}

export interface GeneratedDay {
  date: string
  dayName: string
  slots: PlanningSlot[]
}

export interface PlanningStats {
  totalSlots: number
  filledSlots: number
  utilizationRate: number
  taskDistribution: Record<string, number>
  userWorkload: Record<string, number>
}

// ============================================
// Grid Utils Types
// ============================================

export interface GridColumn {
  id: string
  type: 'user' | 'common'
  userId?: string
  label: string
}

export interface GridSlot {
  id: string
  columnId: string
  startTime: string
  endTime: string
  task?: Task
  isOccupied: boolean
}

export interface Grid {
  columns: GridColumn[]
  slots: GridSlot[][]
  timeSlots: string[]
}

// ============================================
// Hook Return Types
// ============================================

export interface UsePlanningConfigReturn {
  config: PlanningConfig
  users: User[]
  tasks: Task[]
  errors: Record<string, string>
  updateConfig: (updates: Partial<PlanningConfig>) => void
  validateConfig: () => boolean
  addUser: () => void
  updateUser: (id: string, updates: Partial<User>) => void
  removeUser: (id: string) => void
  addTask: () => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void
  loadUsers: (users: User[]) => void
  loadTasks: (tasks: Task[]) => void
  loadConfig: (config: PlanningConfig) => void
}

export interface UsePlanningsReturn {
  plannings: Planning[]
  loading: boolean
  error: string | null
  fetchPlannings: () => Promise<{ data: Planning[] | null; error: Error | null }>
  fetchPlanning: (id: string) => Promise<{ data: Planning | null; error: Error | null }>
  createPlanning: (data: Partial<Planning>) => Promise<{ data: Planning | null; error: Error | null }>
  updatePlanning: (id: string, data: Partial<Planning>) => Promise<{ data: Planning | null; error: Error | null }>
  deletePlanning: (id: string) => Promise<{ error: Error | null }>
  sharePlanning: (id: string) => Promise<{ data: { shareToken: string } | null; error: Error | null }>
  unsharePlanning: (id: string) => Promise<{ error: Error | null }>
}

export interface UseShoppingListReturn {
  shoppingList: ShoppingList
  updateTitle: (title: string) => void
  addCategory: (category: Partial<ShoppingCategory>) => ShoppingCategory
  updateCategory: (categoryId: string, updates: Partial<ShoppingCategory>) => void
  removeCategory: (categoryId: string) => void
  addItem: (categoryId: string, item: Partial<ShoppingItem>) => ShoppingItem
  updateItem: (categoryId: string, itemId: string, updates: Partial<ShoppingItem>) => void
  removeItem: (categoryId: string, itemId: string) => void
  toggleItem: (categoryId: string, itemId: string) => void
  assignItem: (categoryId: string, itemId: string, userId: string | null) => void
  clearCheckedItems: () => void
  uncheckAllItems: () => void
  resetToDefault: () => void
  loadShoppingList: (list: ShoppingList) => void
  getStats: () => { total: number; checked: number; percentage: number }
}

// ============================================
// Auth Types
// ============================================

export interface AuthUser {
  id: string
  email?: string
  user_metadata?: {
    display_name?: string
  }
}

export interface AuthContextValue {
  user: AuthUser | null
  profile: UserAccount | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  displayName: string
  signIn: (email: string, password: string) => Promise<{ data: unknown; error: Error | null }>
  signUp: (email: string, password: string, displayName?: string) => Promise<{ data: unknown; error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  updateProfile: (updates: Partial<UserAccount>) => Promise<{ data: UserAccount | null; error: Error | null }>
  clearError: () => void
}

// ============================================
// Toast Types
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'sync'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

export interface UseToastsReturn {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  toast: {
    success: (message: string) => void
    error: (message: string) => void
    warning: (message: string) => void
    info: (message: string) => void
    sync: (message: string) => void
  }
}

// ============================================
// Realtime Sync Types
// ============================================

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error'

export interface RealtimePayload {
  new: Planning
  old: Planning
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}

export interface UseRealtimeSyncOptions {
  onUpdate?: (payload: RealtimePayload) => void
  onError?: (error: Error) => void
}

export interface UseRealtimeSyncReturn {
  connectionStatus: ConnectionStatus
  lastSync: Date | null
  reconnect: () => void
  isConnected: boolean
}

// ============================================
// Component Props Types
// ============================================

export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export interface InputProps {
  label?: string
  error?: string
  className?: string
  id?: string
  type?: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  autoComplete?: string
  autoFocus?: boolean
}

export interface SelectProps {
  label?: string
  error?: string
  className?: string
  id?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children?: React.ReactNode
  required?: boolean
}

export interface CardProps {
  children: React.ReactNode
  className?: string
}
