import React from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import Table, { Column } from '../ui/Table'
import type { Holding } from '../../types/portfolio'

interface HoldingsTableProps {
  holdings: Holding[]
  onEdit: (holding: Holding) => void
  onDelete: (id: string) => void
  onUpdatePrice: (id: string, price: number) => void
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  onEdit,
  onDelete,
  onUpdatePrice,
}) => {

  const formatPercent = (value: number) => {
    const isPositive = value >= 0
    return (
      <span style={{ color: isPositive ? 'var(--success)' : 'var(--error)' }}>
        {Math.abs(value).toFixed(2)}%
      </span>
    )
  }

  const handlePriceUpdate = (holding: Holding) => {
    const newPrice = prompt(`Update current price for ${holding.symbol}`, holding.currentPrice.toString())
    if (newPrice && !isNaN(Number(newPrice)) && Number(newPrice) > 0) {
      onUpdatePrice(holding.id, Number(newPrice))
    }
  }

  const columns: Column<Holding>[] = [
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
    },
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
      key: 'totalCost',
      header: 'Total Cost',
      sortable: true,
      render: (_, row) => {
        const totalCost = row.quantity * row.avgPrice
        return <div className="text-right font-medium min-w-[80px]">${totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
      },
    },
    {
      key: 'currentPrice',
      header: 'Market Price',
      sortable: true,
      render: (value, row) => (
        <button
          onClick={() => handlePriceUpdate(row)}
          className="text-right hover:underline transition-colors min-w-[75px] block"
          style={{ color: 'var(--primary)' }}
        >
          ${Number(value).toFixed(2)}
        </button>
      ),
    },
    {
      key: 'marketValue',
      header: 'Market Value',
      sortable: true,
      render: value => <div className="text-right font-medium min-w-[85px]">${Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>,
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
            {formatPercent(row.unrealizedGainPercent)}
          </div>
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1 min-w-[70px] justify-center">
          <button
            onClick={() => onEdit(row)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            title="Edit position"
          >
            <Edit2 className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
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
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Holdings Table</h2>
        <div className="text-sm opacity-70">
          {holdings.length} {holdings.length === 1 ? 'position' : 'positions'}
        </div>
      </div>

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