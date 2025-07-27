import React from 'react'
import { LucideIcon } from 'lucide-react'

interface ActionButtonProps {
  icon: LucideIcon
  onClick: () => void
  variant?: 'edit' | 'delete' | 'default'
  disabled?: boolean
  'aria-label'?: string
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon: Icon, 
  onClick, 
  variant = 'default',
  disabled = false,
  'aria-label': ariaLabel
}) => {
  const variantClasses = {
    edit: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    delete: 'hover:bg-red-50 dark:hover:bg-red-900/20',
    default: 'hover:bg-gray-50 dark:hover:bg-gray-900/20'
  }

  const iconColors = {
    edit: 'text-gray-500 group-hover:text-blue-600',
    delete: 'text-gray-500 group-hover:text-red-600',
    default: 'text-gray-500 group-hover:text-gray-700'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center justify-center w-8 h-8 rounded-lg 
        transition-colors group disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
      `}
    >
      <Icon className={`h-4 w-4 transition-colors ${iconColors[variant]}`} />
    </button>
  )
}

export default ActionButton