import React from 'react'
import { Info } from 'lucide-react'
import DataManager from '../components/ui/DataManager'

const DataManagement: React.FC = () => {

  return (
    <div className="space-y-6 animate-fade-in-scale">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Data Management
          </h1>
          <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
            Import, export, and manage your portfolio data
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          <Info className="h-4 w-4" />
          <span>Auto-saved to LocalStorage</span>
        </div>
      </div>

      {/* Data Management Component */}
      <DataManager />
    </div>
  )
}

export default DataManagement