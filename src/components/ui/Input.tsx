import { useId, InputHTMLAttributes, ChangeEvent } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string | null
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  id: customId,
  ...props
}: InputProps): JSX.Element {
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
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`
          px-3 py-2 rounded-lg border transition-colors
          ${error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-primary focus:ring-primary'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-100 disabled:cursor-not-allowed
        `}
        {...props}
      />
      {error && (
        <span id={errorId} className="text-sm text-red-500" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export interface TimeInputProps extends Omit<InputProps, 'type'> {}

export function TimeInput({ label, value, onChange, ...props }: TimeInputProps): JSX.Element {
  return (
    <Input
      type="time"
      label={label}
      value={value}
      onChange={onChange}
      {...props}
    />
  )
}

export interface DateInputProps extends Omit<InputProps, 'type'> {}

export function DateInput({ label, value, onChange, ...props }: DateInputProps): JSX.Element {
  return (
    <Input
      type="date"
      label={label}
      value={value}
      onChange={onChange}
      {...props}
    />
  )
}
