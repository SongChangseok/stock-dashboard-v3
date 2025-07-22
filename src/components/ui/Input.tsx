import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helper, ...props }, ref) => {
    const inputClasses = [
      'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
      'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500',
      'focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
      'dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500',
      error && 'border-red-500 focus:ring-red-500',
      className
    ].filter(Boolean).join(' ')

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          type={type}
          className={inputClasses}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {helper && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {helper}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input