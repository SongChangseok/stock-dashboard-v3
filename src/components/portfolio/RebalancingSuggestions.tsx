import React from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card'
import Button from '../ui/Button'
import Table from '../ui/Table'
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { formatCurrency, formatPercent } from '../../utils/calculations'
import type { RebalancingSuggestion } from '../../types/portfolio'

interface RebalancingSuggestionsProps {
  suggestions: RebalancingSuggestion[]
  isLoading?: boolean
  onSimulate?: () => void
}

export const RebalancingSuggestions: React.FC<RebalancingSuggestionsProps> = ({
  suggestions,
  isLoading = false,
  onSimulate,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rebalancing Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rebalancing Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Portfolio is Well Balanced
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              All positions are within the 5% rebalancing threshold
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const columns = [
    {
      key: 'symbol' as keyof RebalancingSuggestion,
      header: 'Position',
      render: (value: any) => (
        <div className="font-medium text-gray-900 dark:text-white">{value}</div>
      ),
    },
    {
      key: 'action' as keyof RebalancingSuggestion,
      header: 'Action',
      render: (value: any) => (
        <div className="flex items-center gap-2">
          {value === 'buy' ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span
            className={`font-medium ${
              value === 'buy' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {value === 'buy' ? 'Buy' : 'Sell'}
          </span>
        </div>
      ),
    },
    {
      key: 'currentWeight' as keyof RebalancingSuggestion,
      header: 'Current Weight',
      render: (value: any) => (
        <span className="text-gray-700 dark:text-gray-300">
          {formatPercent(value)}
        </span>
      ),
    },
    {
      key: 'targetWeight' as keyof RebalancingSuggestion,
      header: 'Target Weight',
      render: (value: any) => (
        <span className="text-gray-700 dark:text-gray-300">
          {formatPercent(value)}
        </span>
      ),
    },
    {
      key: 'deviation' as keyof RebalancingSuggestion,
      header: 'Deviation',
      render: (value: any) => (
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <span className="font-medium text-orange-600 dark:text-orange-400">
            {formatPercent(value)}
          </span>
        </div>
      ),
    },
    {
      key: 'quantity' as keyof RebalancingSuggestion,
      header: 'Quantity',
      render: (value: any) => (
        <span className="font-mono text-gray-700 dark:text-gray-300">
          {value.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'amount' as keyof RebalancingSuggestion,
      header: 'Amount',
      render: (value: any) => (
        <span className="font-mono text-gray-900 dark:text-white font-medium">
          {formatCurrency(value)}
        </span>
      ),
    },
  ]

  const totalBuyAmount = suggestions
    .filter(s => s.action === 'buy')
    .reduce((sum, s) => sum + s.amount, 0)

  const totalSellAmount = suggestions
    .filter(s => s.action === 'sell')
    .reduce((sum, s) => sum + s.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Rebalancing Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Positions to Rebalance
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {suggestions.length}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-sm text-green-600 dark:text-green-400">
              Total Buy Amount
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(totalBuyAmount)}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-sm text-red-600 dark:text-red-400">
              Total Sell Amount
            </div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {formatCurrency(totalSellAmount)}
            </div>
          </div>
        </div>

        {/* Suggestions Table */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Rebalancing Actions
            </h3>
            {onSimulate && (
              <Button variant="secondary" onClick={onSimulate}>
                Run Simulation
              </Button>
            )}
          </div>
          
          <Table
            data={suggestions}
            columns={columns}
            className="border-0"
          />
        </div>

      </CardContent>
    </Card>
  )
}

export default RebalancingSuggestions