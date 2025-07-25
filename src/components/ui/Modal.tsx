import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import Button from './Button'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in-scale">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative rounded-2xl w-full mx-4 animate-slide-in-bottom ${sizeClasses[size]}`}
        style={{
          backgroundColor: 'var(--background)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border)',
        }}
      >
        {title && (
          <div
            className="flex items-center justify-between p-6 pb-4 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {title}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2 h-9 w-9 rounded-xl">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className={title ? 'p-6 pt-4' : 'p-6'}>{children}</div>
      </div>
    </div>
  )
}

export default Modal
