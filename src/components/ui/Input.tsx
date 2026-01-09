import { useId, InputHTMLAttributes, ChangeEvent } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  label?: string
  error?: string | null
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  /** Input size variant */
  inputSize?: 'sm' | 'md' | 'lg'
}

// Touch-friendly input sizes with minimum 44px touch target on mobile
const inputSizes = {
  sm: 'px-3 py-2 text-sm min-h-[40px] sm:min-h-[36px] sm:py-1.5',
  md: 'px-3 py-2.5 text-base min-h-[44px] sm:min-h-[40px] sm:py-2',
  lg: 'px-4 py-3 text-lg min-h-[48px] sm:min-h-[44px]',
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
  inputSize = 'md',
  ...props
}: InputProps): JSX.Element {
  const generatedId = useId()
  const id = customId || generatedId
  const errorId = `${id}-error`

  return (
    <div className={`flex flex-col gap-1 sm:gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs sm:text-sm font-medium text-gray-700">
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
          ${inputSizes[inputSize]}
          rounded-lg border transition-colors
          ${error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-primary focus:ring-primary'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-100 disabled:cursor-not-allowed
          touch-manipulation
        `}
        {...props}
      />
      {error && (
        <span id={errorId} className="text-xs sm:text-sm text-red-500" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export interface TimeInputProps extends Omit<InputProps, 'type'> {}

export function TimeInput({ label, value, onChange, inputSize = 'md', ...props }: TimeInputProps): JSX.Element {
  return (
    <Input
      type="time"
      label={label}
      value={value}
      onChange={onChange}
      inputSize={inputSize}
      {...props}
    />
  )
}

export interface DateInputProps extends Omit<InputProps, 'type'> {}

export function DateInput({ label, value, onChange, inputSize = 'md', ...props }: DateInputProps): JSX.Element {
  return (
    <Input
      type="date"
      label={label}
      value={value}
      onChange={onChange}
      inputSize={inputSize}
      {...props}
    />
  )
}
