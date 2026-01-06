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
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
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
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  )
}

export function TimeInput({ label, value, onChange, ...props }) {
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

export function DateInput({ label, value, onChange, ...props }) {
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
