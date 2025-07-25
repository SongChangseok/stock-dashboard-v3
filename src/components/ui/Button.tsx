import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group'

    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      danger: 'btn-danger',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
    }

    const sizes = {
      sm: 'h-9 px-3 text-sm min-w-[2.25rem]',
      md: 'h-11 px-5 text-sm min-w-[2.75rem]',
      lg: 'h-13 px-6 text-base min-w-[3.25rem]',
    }

    const classes = [baseClasses, variants[variant], sizes[size], className]
      .filter(Boolean)
      .join(' ')

    const isDisabled = disabled || loading

    return (
      <button className={classes} ref={ref} disabled={isDisabled} {...props}>
        {/* 로딩 애니메이션을 위한 배경 효과 */}
        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div
          className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </div>
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
