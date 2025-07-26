import React from 'react'
import { Card, CardContent } from './Card'

interface CompactCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export const CompactCard: React.FC<CompactCardProps> = ({
  children,
  className = '',
  title,
  icon,
  action
}) => {
  return (
    <Card className={`${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            {action}
          </div>
        </div>
      )}
      <CardContent className="p-3">
        {children}
      </CardContent>
    </Card>
  )
}

export default CompactCard