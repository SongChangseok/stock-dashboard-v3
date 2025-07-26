import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
  compactMode?: boolean
  className?: string
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = true,
  compactMode = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [height, setHeight] = useState<number | undefined>(defaultExpanded ? undefined : 0)
  const contentRef = useRef<HTMLDivElement>(null)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  useEffect(() => {
    if (!contentRef.current) return

    if (isExpanded) {
      const scrollHeight = contentRef.current.scrollHeight
      setHeight(scrollHeight)
      // After animation completes, set height to auto for responsive content
      const timer = setTimeout(() => setHeight(undefined), 300)
      return () => clearTimeout(timer)
    } else {
      // Set initial height before collapse
      setHeight(contentRef.current.scrollHeight)
      // Force reflow
      contentRef.current.offsetHeight
      // Then collapse
      setHeight(0)
    }
  }, [isExpanded])

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className={`font-medium text-gray-900 dark:text-white ${compactMode ? 'text-sm' : 'text-base'}`}>
            {title}
          </h3>
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ease-in-out ${
            isExpanded ? 'rotate-180' : 'rotate-0'
          }`} 
        />
      </button>

      {/* Content */}
      <div
        ref={contentRef}
        className="bg-white dark:bg-gray-900 overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          height: height === undefined ? 'auto' : `${height}px`,
        }}
      >
        <div className={compactMode ? 'p-3' : 'p-4'}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default CollapsibleSection