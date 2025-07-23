import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'filled' | 'minimal'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helper, leftIcon, rightIcon, variant = 'default', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = error ? `${inputId}-error` : undefined
    const helperId = helper ? `${inputId}-helper` : undefined
    
    const variants = {
      default: 'border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800',
      filled: 'border-0 bg-gray-100 dark:bg-gray-700',
      minimal: 'border-0 border-b-2 border-gray-300 bg-transparent rounded-none dark:border-gray-600'
    }

    const baseInputClasses = [
      'flex h-12 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
      'focus:outline-none focus:ring-2 focus:ring-opacity-20 focus:border-current',
      '[&:focus]:ring-[var(--primary)] [&:focus]:border-[var(--primary)]',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'dark:text-white',
      variants[variant],
      leftIcon && 'pl-11',
      rightIcon && 'pr-11',
      error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : '',
      className
    ].filter(Boolean).join(' ')

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={baseInputClasses}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
          {/* 포커스 상태를 나타내는 글로우 효과 */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 5%, transparent)' }} />
        </div>
        {error && (
          <p id={errorId} className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1" role="alert">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helper && !error && (
          <p id={helperId} className="text-sm text-gray-500 dark:text-gray-400">
            {helper}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input