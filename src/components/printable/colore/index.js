/**
 * Colorful Printable Planning Components
 *
 * A vibrant, color-coded printable planning system for family organization.
 *
 * Features:
 * - Gradient headers with user avatars
 * - Color-coded task badges by user (Hugo: Blue, Delphine: Pink, Common: Green)
 * - Visual priority indicators (Red: High, Yellow: Medium, Green: Low)
 * - Category icons for task types
 * - Progress bars for milestones
 * - A4 landscape print-optimized layout
 *
 * Usage:
 * ```jsx
 * import { PrintablePlanning } from '@/components/printable/colore'
 *
 * <PrintablePlanning
 *   tasks={tasks}
 *   users={users}
 *   milestones={milestones}
 *   planning={planning}
 *   config={config}
 * />
 * ```
 */

// Main container
export { PrintablePlanning, PrintablePlanningPreview } from './PrintablePlanning'

// Header with avatars and period badges
export { PrintableHeader } from './PrintableHeader'

// Weekly grid layout
export { WeekGrid } from './WeekGrid'

// Task badges and groups
export { TaskBadge, TaskBadgeGroup } from './TaskBadge'

// Milestone sidebar with progress
export { MilestoneSidebar } from './MilestoneSidebar'

// Default export for convenience
export { PrintablePlanning as default } from './PrintablePlanning'
