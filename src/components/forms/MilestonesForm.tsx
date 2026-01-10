/**
 * MilestonesForm - Wrapper for milestones management in wizard
 */

import { MilestoneList } from '../milestones/MilestoneList'
import type { Milestone, User } from '../../types'

export interface MilestonesFormProps {
  milestones: Milestone[]
  users: User[]
  onAdd: (milestone: Milestone) => void
  onUpdate: (id: string, field: keyof Milestone, value: unknown) => void
  onDelete: (id: string) => void
}

export function MilestonesForm({
  milestones,
  users,
  onAdd,
  onUpdate,
  onDelete,
}: MilestonesFormProps): JSX.Element {
  // For wizard, we don't need focus feature - just basic CRUD
  const handleToggleFocus = (): void => {
    // No-op in wizard mode
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        <p>Definissez vos objectifs a long terme pour suivre votre progression.</p>
        <p className="text-gray-500 mt-1">Cette etape est optionnelle.</p>
      </div>

      <MilestoneList
        milestones={milestones}
        users={users}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onToggleFocus={handleToggleFocus}
      />
    </div>
  )
}

export default MilestonesForm
