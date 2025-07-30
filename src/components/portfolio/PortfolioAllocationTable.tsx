import React, { useMemo } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import Table, { Column } from '../ui/Table'
import { getIdentifier } from '../../utils/calculations'
import type { TargetAllocation, Holding } from '../../types/portfolio'

interface PortfolioAllocationRow {
  identifier: string
  symbol?: string
  name: string
  targetWeight: number | null
  currentWeight: number
  difference: number
  status: 'balanced' | 'over-weighted' | 'under-weighted' | 'target-only' | 'no-target'
  target: TargetAllocation | null
  holding: Holding | null
}

interface PortfolioAllocationTableProps {
  targets: TargetAllocation[]
  holdings: Holding[]
  currentWeights: Record<string, number>
  onEditTarget: (target: TargetAllocation) => void
  onDeleteTarget: (name: string) => void
  showTitle?: boolean
  compactMode?: boolean
}

const PortfolioAllocationTable: React.FC<PortfolioAllocationTableProps> = ({
  targets,
  holdings,
  currentWeights,
  onEditTarget,
  onDeleteTarget,
  showTitle = true,
  compactMode = false
}) => {
  const data = useMemo(() => {
    // Get all unique identifiers from both targets and holdings
    const allIdentifiers = Array.from(new Set([
      ...targets.map(t => getIdentifier(t)),
      ...holdings.map(h => getIdentifier(h))
    ])).sort()

    return allIdentifiers.map((identifier): PortfolioAllocationRow => {
      const target = targets.find(t => getIdentifier(t) === identifier)
      const holding = holdings.find(h => getIdentifier(h) === identifier)
      const currentWeight = currentWeights[identifier] || 0
      const targetWeight = target?.targetWeight || 0
      const difference = currentWeight - targetWeight

      let status: PortfolioAllocationRow['status']
      if (target && holding) {
        if (Math.abs(difference) < 0.01) status = 'balanced'
        else if (difference > 0) status = 'over-weighted'
        else status = 'under-weighted'
      } else if (target && !holding) {
        status = 'target-only'
      } else {
        status = 'no-target'
      }

      return {
        identifier,
        symbol: target?.symbol || holding?.symbol,
        name: target?.name || holding?.name || identifier,
        targetWeight: target ? targetWeight : null,
        currentWeight,
        difference,
        status,
        target: target || null,
        holding: holding || null
      }
    })
  }, [targets, holdings, currentWeights])

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`
  }

  const getDifferenceColor = (difference: number): string => {
    if (Math.abs(difference) < 0.01) return 'text-gray-600 dark:text-gray-400'
    return difference > 0 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
  }


  const columns: Column<PortfolioAllocationRow>[] = [
    {
      key: 'identifier',
      header: 'Position',
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="font-mono font-medium">{row.name}</div>
          {row.symbol && <div className="text-xs opacity-70">({row.symbol})</div>}
        </div>
      )
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (value) => (
        <div className="max-w-[150px] truncate" title={String(value)}>
          {String(value)}
        </div>
      )
    },
    {
      key: 'targetWeight',
      header: 'Target',
      sortable: true,
      render: (value) => (
        <span className="font-mono">
          {value !== null ? formatPercentage(Number(value)) : '-'}
        </span>
      )
    },
    {
      key: 'currentWeight',
      header: 'Current',
      sortable: true,
      render: (value, row) => (
        <span className="font-mono">
          {row.holding ? formatPercentage(Number(value)) : '-'}
        </span>
      )
    },
    {
      key: 'difference',
      header: 'Difference',
      sortable: true,
      render: (value, row) => {
        const difference = Number(value)
        if (!row.target || !row.holding) return <span>-</span>
        
        return (
          <div className={`flex items-center justify-end ${getDifferenceColor(difference)}`}>
            <span className="font-mono">{formatPercentage(Math.abs(difference))}</span>
          </div>
        )
      }
    },
    ...(compactMode ? [] : [{
      key: 'status' as keyof PortfolioAllocationRow,
      header: 'Status',
      render: (_value: any, row: PortfolioAllocationRow) => {
        const status = row.status
        const difference = row.difference
        
        if (row.target && row.holding) {
          return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              Math.abs(difference) < 0.01
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : Math.abs(difference) < 5
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {status === 'balanced' ? 'Balanced' : status === 'over-weighted' ? 'Over-weighted' : 'Under-weighted'}
            </span>
          )
        } else if (row.target && !row.holding) {
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              Target Only
            </span>
          )
        } else {
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
              No Target
            </span>
          )
        }
      }
    }]),
    {
      key: 'identifier',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          {row.target && (
            <>
              <button
                onClick={() => onEditTarget(row.target!)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit Target"
              >
                <Edit className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
              </button>
              <button
                onClick={() => onDeleteTarget(row.name)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete Target"
              >
                <Trash2 className="h-4 w-4 text-gray-500 group-hover:text-red-600 transition-colors" />
              </button>
            </>
          )}
        </div>
      )
    }
  ]

  if (data.length === 0) {
    return (
      <div>
        {showTitle && (
          <h3 className={`font-medium mb-4 ${compactMode ? 'text-base' : 'text-lg'}`}>
            Portfolio Allocation Overview
          </h3>
        )}
        <div className="text-center py-8">
          <div className="text-3xl opacity-20 mb-3">🎯</div>
          <p className="opacity-70 mb-3">
            No targets or positions found
          </p>
          <p className="text-sm opacity-50">
            Add target allocations and positions to see comparison
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {showTitle && (
        <h3 className={`font-medium mb-4 ${compactMode ? 'text-base' : 'text-lg'}`}>
          Portfolio Allocation Overview
        </h3>
      )}
      <Table 
        data={data}
        columns={columns}
        searchable={true}
        searchPlaceholder="Search symbols or names..."
        mobileCardView={true}
      />
    </div>
  )
}

export default PortfolioAllocationTable