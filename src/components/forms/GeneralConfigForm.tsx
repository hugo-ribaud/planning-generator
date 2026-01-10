import { ChangeEvent } from 'react'
import { Card } from '../ui/Card'
import { Input, TimeInput, DateInput } from '../ui/Input'
import { Select, SelectOption } from '../ui/Select'
import type { PlanningConfigState, ConfigErrors } from '../../hooks/usePlanningConfig'

const PERIOD_OPTIONS: SelectOption[] = [
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
]

const SLOT_DURATION_OPTIONS: SelectOption[] = [
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 heure' },
  { value: '90', label: '1h30' },
]

export interface GeneralConfigFormProps {
  config: PlanningConfigState
  errors: ConfigErrors
  onUpdate: (field: keyof PlanningConfigState, value: string | number) => void
}

export function GeneralConfigForm({ config, errors, onUpdate }: GeneralConfigFormProps): JSX.Element {
  const handleChange = (field: keyof PlanningConfigState) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number'
      ? parseInt(e.target.value, 10)
      : e.target.value
    onUpdate(field, value)
  }

  return (
    <Card title="Configuration générale" icon="⚙️">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Period */}
        <Select
          label="Période"
          value={config.period}
          onChange={handleChange('period')}
          options={PERIOD_OPTIONS}
        />

        {/* Start date */}
        <DateInput
          label="Date de début"
          value={config.startDate}
          onChange={handleChange('startDate')}
        />

        {/* Work hours - grouped on mobile */}
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-gray-700 mb-2 sm:hidden">Horaires de travail</p>
          <div className="grid grid-cols-2 gap-3">
            <TimeInput
              label="Début journée"
              value={config.workStart}
              onChange={handleChange('workStart')}
              error={errors.workStart}
            />
            <TimeInput
              label="Fin journée"
              value={config.workEnd}
              onChange={handleChange('workEnd')}
              error={errors.workEnd}
            />
          </div>
        </div>

        {/* Lunch break - grouped on mobile */}
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-gray-700 mb-2 sm:hidden">Pause déjeuner</p>
          <div className="grid grid-cols-2 gap-3">
            <TimeInput
              label="Début pause"
              value={config.lunchStart}
              onChange={handleChange('lunchStart')}
              error={errors.lunchStart}
            />
            <TimeInput
              label="Fin pause"
              value={config.lunchEnd}
              onChange={handleChange('lunchEnd')}
              error={errors.lunchEnd}
            />
          </div>
        </div>

        {/* Slot duration */}
        <Select
          label="Durée d'un créneau"
          value={String(config.slotDuration)}
          onChange={(e) => onUpdate('slotDuration', parseInt(e.target.value, 10))}
          options={SLOT_DURATION_OPTIONS}
          className="sm:col-span-2"
        />
      </div>
    </Card>
  )
}
