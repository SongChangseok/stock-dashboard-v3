import React from 'react'
import { Edit, Trash2 } from 'lucide-react'
import Table, { Column } from '../ui/Table'
import type { Holding, HoldingsTableViewMode, AllocationInfo, TargetAllocation } from '../../types/portfolio'

interface HoldingsTableProps {
  holdings: Holding[]
  viewMode?: HoldingsTableViewMode
  targets?: TargetAllocation[]
  onEdit: (holding: Holding) => void
  onDelete: (id: string) => void
  onUpdatePrice?: (id: string, price: number) => void
  showTitle?: boolean
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  viewMode = 'full',
  targets = [],
  onEdit,
  onDelete,
  onUpdatePrice,
  showTitle = true,
}) => {

  const formatColoredPercent = (value: number) => {
    const isPositive = value >= 0
    return (
      <span style={{ color: isPositive ? 'var(--success)' : 'var(--error)' }}>
        {Math.abs(value).toFixed(2)}%
      </span>
    )
  }

  const handlePriceUpdate = (holding: Holding) => {
    if (!onUpdatePrice) return
    const newPrice = prompt(`Update current price for ${holding.symbol}`, holding.currentPrice.toString())
    if (newPrice && !isNaN(Number(newPrice)) && Number(newPrice) > 0) {
      onUpdatePrice(holding.id, Number(newPrice))
    }
  }

  // Calculate allocation information
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0)
  
  const getAllocationInfo = (holding: Holding): AllocationInfo => {
    const currentWeight = totalValue > 0 ? (holding.marketValue / totalValue) * 100 : 0
    const target = targets.find(t => t.symbol === holding.symbol)
    const hasTarget = !!target
    const targetWeight = target?.targetWeight || 0
    const deviation = hasTarget ? currentWeight - targetWeight : 0
    const needsRebalancing = Math.abs(deviation) > 5
    
    let status: AllocationInfo['status'] = 'noTarget'
    if (hasTarget) {
      status = needsRebalancing ? 'rebalance' : 'onTarget'
    }
    
    return {
      symbol: holding.symbol,
      currentWeight,
      targetWeight,
      hasTarget,
      needsRebalancing,
      status
    }
  }

  const renderStatusBadge = (allocationInfo: AllocationInfo) => {
    const { hasTarget, needsRebalancing } = allocationInfo
    
    if (hasTarget) {
      if (needsRebalancing) {
        return (
          <div className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
            Rebalance
          </div>
        )
      } else {
        return (
          <div className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
            On Target
          </div>
        )
      }
    } else {
      return (
        <div className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300">
          No Target
        </div>
      )
    }
  }

  // Dynamic column generation based on view mode
  const getColumns = (): Column<Holding>[] => {
    const baseColumns: Column<Holding>[] = [
      {
        key: 'symbol',
        header: 'Position',
        sortable: true,
        render: (value, row) => (
          <div className="min-w-[100px]">
            <div className="font-semibold text-sm">{value}</div>
            <div className="text-xs opacity-70 truncate max-w-[90px]">{row.name}</div>
          </div>
        ),
      }
    ]

    if (viewMode === 'full') {
      // Full view columns (original Holdings table)
      baseColumns.push(
        {
          key: 'quantity',
          header: 'Qty',
          sortable: true,
          render: value => <div className="text-right min-w-[50px]">{value.toLocaleString()}</div>,
        },
        {
          key: 'avgPrice',
          header: 'Avg Cost',
          sortable: true,
          render: value => <div className="text-right min-w-[70px]">${Number(value).toFixed(2)}</div>,
        },
        {
          key: 'currentPrice',
          header: 'Market Price',
          sortable: true,
          render: (value, row) => (
            <div className="text-right min-w-[80px]">
              <button
                onClick={() => handlePriceUpdate(row)}
                className="text-sm hover:underline hover:text-blue-600 transition-colors"
                title="Click to update price"
              >
                ${Number(value).toFixed(2)}
              </button>
            </div>
          ),
        },
        {
          key: 'marketValue',
          header: 'Market Value',
          sortable: true,
          render: value => (
            <div className="text-right font-medium min-w-[90px]">
              ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          ),
        },
        {
          key: 'unrealizedGain',
          header: 'Unrealized P&L',
          sortable: true,
          render: (value, row) => (
            <div className="text-right min-w-[90px]">
              <div 
                className="font-medium text-sm"
                style={{ color: Number(value) >= 0 ? 'var(--success)' : 'var(--error)' }}
              >
                ${Math.abs(Number(value)).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs">
                {formatColoredPercent(row.unrealizedGainPercent)}
              </div>
            </div>
          ),
        }
      )
    } else {
      // Allocation view columns (for Portfolio page)
      baseColumns.push(
        {
          key: 'marketValue',
          header: 'Weight',
          sortable: true,
          render: (_, row) => {
            const allocationInfo = getAllocationInfo(row)
            return (
              <div className="text-right min-w-[60px]">
                <div className="font-medium">{allocationInfo.currentWeight.toFixed(1)}%</div>
                {allocationInfo.hasTarget && (
                  <div className="text-xs opacity-70">
                    Target: {allocationInfo.targetWeight?.toFixed(1)}%
                  </div>
                )}
              </div>
            )
          },
        },
        {
          key: 'name',
          header: 'Status',
          sortable: false,
          render: (_, row) => {
            const allocationInfo = getAllocationInfo(row)
            return (
              <div className="flex items-center gap-2 min-w-[100px]">
                {renderStatusBadge(allocationInfo)}
              </div>
            )
          },
        }
      )
    }

    // Actions column (using 'id' as key since it's unique)
    baseColumns.push({
      key: 'id',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1 min-w-[70px] justify-center">
          <button
            onClick={() => onEdit(row)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
            title={viewMode === 'full' ? 'Edit position' : 'Edit position details'}
          >
            <Edit className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
          </button>
          <button
            onClick={() => onDelete(row.id)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
            title="Delete position"
          >
            <Trash2 className="h-4 w-4 text-gray-500 group-hover:text-red-600 transition-colors" />
          </button>
        </div>
      ),
    })

    return baseColumns
  }

  const columns = getColumns()

  const getTableTitle = () => {
    switch (viewMode) {
      case 'allocation':
        return 'Current Holdings'
      case 'full':
      default:
        return 'Holdings Table'
    }
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {getTableTitle()}
          </h2>
          <div className="text-sm opacity-70">
            {holdings.length} {holdings.length === 1 ? 'position' : 'positions'}
          </div>
        </div>
      )}

      <Table
        data={holdings}
        columns={columns}
        searchable
        searchPlaceholder="Search positions..."
        className="holdings-table"
      />
    </div>
  )
}

export default HoldingsTable