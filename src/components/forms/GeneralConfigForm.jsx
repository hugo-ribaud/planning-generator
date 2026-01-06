import { Card } from '../ui/Card'
import { Input, TimeInput, DateInput } from '../ui/Input'
import { Select } from '../ui/Select'

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
]

const SLOT_DURATION_OPTIONS = [
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 heure' },
  { value: '90', label: '1h30' },
]

export function GeneralConfigForm({ config, errors, onUpdate }) {
  const handleChange = (field) => (e) => {
    const value = e.target.type === 'number'
      ? parseInt(e.target.value, 10)
      : e.target.value
    onUpdate(field, value)
  }

  return (
    <Card title="Configuration générale" icon="⚙️">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Planning name */}
        <Input
          label="Nom du planning"
          value={config.name}
          onChange={handleChange('name')}
          placeholder="Ex: Planning Janvier"
          className="md:col-span-2"
        />

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

        {/* Work hours */}
        <TimeInput
          label="Début de journée"
          value={config.workStart}
          onChange={handleChange('workStart')}
          error={errors.workStart}
        />

        <TimeInput
          label="Fin de journée"
          value={config.workEnd}
          onChange={handleChange('workEnd')}
          error={errors.workEnd}
        />

        {/* Lunch break */}
        <TimeInput
          label="Début pause déjeuner"
          value={config.lunchStart}
          onChange={handleChange('lunchStart')}
          error={errors.lunchStart}
        />

        <TimeInput
          label="Fin pause déjeuner"
          value={config.lunchEnd}
          onChange={handleChange('lunchEnd')}
          error={errors.lunchEnd}
        />

        {/* Slot duration */}
        <Select
          label="Durée d'un créneau"
          value={String(config.slotDuration)}
          onChange={(e) => onUpdate('slotDuration', parseInt(e.target.value, 10))}
          options={SLOT_DURATION_OPTIONS}
          className="md:col-span-2"
        />
      </div>
    </Card>
  )
}
