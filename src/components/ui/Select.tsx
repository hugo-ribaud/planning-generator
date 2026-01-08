import { useId, SelectHTMLAttributes, ChangeEvent } from 'react'

export interface SelectOption<T = string> {
  value: T
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  options?: SelectOption[]
  placeholder?: string
  error?: string | null
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void
}

export function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionner...',
  error,
  required = false,
  disabled = false,
  className = '',
  id: customId,
  ...props
}: SelectProps): JSX.Element {
  const generatedId = useId()
  const id = customId || generatedId
  const errorId = `${id}-error`

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`
          px-3 py-2 rounded-lg border transition-colors appearance-none
          bg-white bg-no-repeat bg-right
          ${error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-primary focus:ring-primary'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-100 disabled:cursor-not-allowed
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem'
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={errorId} className="text-sm text-red-500" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
