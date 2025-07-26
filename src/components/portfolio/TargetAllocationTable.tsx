import React from 'react'
import { Edit, Trash2 } from 'lucide-react'
import Table, { Column } from '../ui/Table'
import type { TargetAllocation } from '../../types/portfolio'

interface TargetAllocationTableProps {
  targets: TargetAllocation[]
  onEdit: (target: TargetAllocation) => void
  onDelete: (symbol: string) => void
  showTitle?: boolean
}

const TargetAllocationTable: React.FC<TargetAllocationTableProps> = ({
  targets,
  onEdit,
  onDelete,
  showTitle = true,
}) => {
  const getTotalAllocation = () => {
    return targets.reduce((sum, target) => sum + target.targetWeight, 0)
  }

  const renderTagBadge = (tag: string) => (
    <div className="text-xs px-2 py-1 rounded-full" 
         style={{ 
           backgroundColor: 'var(--muted)', 
           color: 'var(--muted-foreground)' 
         }}>
      {tag}
    </div>
  )

  const columns: Column<TargetAllocation>[] = [
    {
      key: 'symbol',
      header: 'Position',
      sortable: true,
      render: (value) => (
        <div className="min-w-[80px]">
          <div className="font-semibold text-sm">{value}</div>
        </div>
      ),
    },
    {
      key: 'tag',
      header: 'Tag',
      sortable: true,
      render: (value) => (
        <div className="min-w-[100px]">
          {renderTagBadge(String(value))}
        </div>
      ),
    },
    {
      key: 'targetWeight',
      header: 'Target Weight',
      sortable: true,
      render: (value) => (
        <div className="text-right font-medium min-w-[100px]">
          {Number(value).toFixed(1)}%
        </div>
      ),
    },
    {
      key: 'symbol',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1 min-w-[70px] justify-center">
          <button
            onClick={() => onEdit(row)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
            title="Edit target allocation"
          >
            <Edit className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
          </button>
          <button
            onClick={() => onDelete(row.symbol)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
            title="Delete target allocation"
          >
            <Trash2 className="h-4 w-4 text-gray-500 group-hover:text-red-600 transition-colors" />
          </button>
        </div>
      ),
    },
  ]

  const totalAllocation = getTotalAllocation()

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Target Allocation
          </h3>
          <div className="text-sm opacity-70">
            {targets.length} {targets.length === 1 ? 'target' : 'targets'}
          </div>
        </div>
      )}

      <Table
        data={targets.sort((a, b) => b.targetWeight - a.targetWeight)}
        columns={columns}
        searchable
        searchPlaceholder="Search targets..."
        className="target-allocation-table"
      />

      {/* Total Summary */}
      <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total Allocation</span>
          <span className={`font-semibold ${
            totalAllocation > 100 
              ? 'text-red-600 dark:text-red-400' 
              : totalAllocation === 100
                ? 'text-green-600 dark:text-green-400'
                : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            {totalAllocation.toFixed(1)}%
          </span>
        </div>
        
        {totalAllocation > 100 && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            ⚠️ Total allocation exceeds 100%. Consider adjusting target weights.
          </div>
        )}
        
        {totalAllocation < 100 && totalAllocation > 0 && (
          <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
            💡 {(100 - totalAllocation).toFixed(1)}% remaining to allocate.
          </div>
        )}
        
        {totalAllocation === 100 && (
          <div className="mt-2 text-sm text-green-600 dark:text-green-400">
            ✅ Perfect 100% allocation achieved!
          </div>
        )}
      </div>
    </div>
  )
}

export default TargetAllocationTable