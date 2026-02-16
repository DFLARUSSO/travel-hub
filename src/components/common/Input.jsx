export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="label">
          {label}
        </label>
      )}
      <input
        className={`input ${error ? 'border-status-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-status-error">{error}</p>
      )}
    </div>
  )
}
