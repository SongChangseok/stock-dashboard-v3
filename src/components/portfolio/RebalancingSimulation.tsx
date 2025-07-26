import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card'
import Button from '../ui/Button'
import Table from '../ui/Table'
import { Play, RotateCcw, Calculator, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatPercent, calculateWeights } from '../../utils/calculations'
import type { RebalancingSuggestion, Holding } from '../../types/portfolio'

interface RebalancingSimulationProps {
  suggestions: RebalancingSuggestion[]
  currentHoldings: Holding[]
  isLoading?: boolean
}

interface SimulationResult {
  symbol: string
  currentQuantity: number
  newQuantity: number
  quantityChange: number
  currentValue: number
  newValue: number
  valueChange: number
  currentWeight: number
  newWeight: number
  targetWeight: number
}

export const RebalancingSimulation: React.FC<RebalancingSimulationProps> = ({
  suggestions,
  currentHoldings,
  isLoading = false,
}) => {
  const [isSimulated, setIsSimulated] = useState(false)

  const simulationResults = useMemo(() => {
    if (!isSimulated || suggestions.length === 0) return []

    const results: SimulationResult[] = []
    const holdingsMap = new Map(currentHoldings.map(h => [h.symbol, h]))
    
    // Create a copy of holdings to simulate changes
    const simulatedHoldings = [...currentHoldings]
    
    // Apply suggestions to simulated holdings
    for (const suggestion of suggestions) {
      const holdingIndex = simulatedHoldings.findIndex(h => h.symbol === suggestion.symbol)
      
      if (holdingIndex >= 0) {
        const holding = simulatedHoldings[holdingIndex]
        const quantityChange = suggestion.action === 'buy' ? suggestion.quantity : -suggestion.quantity
        const newQuantity = Math.max(0, holding.quantity + quantityChange)
        
        simulatedHoldings[holdingIndex] = {
          ...holding,
          quantity: newQuantity,
          marketValue: newQuantity * holding.currentPrice,
          unrealizedGain: (newQuantity * holding.currentPrice) - (newQuantity * holding.avgPrice),
          unrealizedGainPercent: holding.avgPrice > 0 ? 
            (((newQuantity * holding.currentPrice) - (newQuantity * holding.avgPrice)) / (newQuantity * holding.avgPrice)) * 100 : 0
        }
      }
    }

    // Calculate new weights
    const newWeights = calculateWeights(simulatedHoldings)
    const currentWeights = calculateWeights(currentHoldings)

    // Create results for all affected symbols
    const affectedSymbols = new Set([
      ...suggestions.map(s => s.symbol),
      ...currentHoldings.map(h => h.symbol)
    ])

    for (const symbol of affectedSymbols) {
      const currentHolding = holdingsMap.get(symbol)
      const simulatedHolding = simulatedHoldings.find(h => h.symbol === symbol)
      const suggestion = suggestions.find(s => s.symbol === symbol)

      if (currentHolding) {
        const currentQuantity = currentHolding.quantity
        const newQuantity = simulatedHolding?.quantity || 0
        const quantityChange = newQuantity - currentQuantity
        
        results.push({
          symbol,
          currentQuantity,
          newQuantity,
          quantityChange,
          currentValue: currentHolding.marketValue,
          newValue: simulatedHolding?.marketValue || 0,
          valueChange: (simulatedHolding?.marketValue || 0) - currentHolding.marketValue,
          currentWeight: currentWeights[symbol] || 0,
          newWeight: newWeights[symbol] || 0,
          targetWeight: suggestion?.targetWeight || 0,
        })
      }
    }

    return results.filter(r => r.quantityChange !== 0 || r.currentQuantity > 0)
      .sort((a, b) => Math.abs(b.valueChange) - Math.abs(a.valueChange))
  }, [suggestions, currentHoldings, isSimulated])

  const handleRunSimulation = () => {
    setIsSimulated(true)
  }

  const handleReset = () => {
    setIsSimulated(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Rebalancing Simulation
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

  const columns = [
    {
      key: 'symbol' as keyof SimulationResult,
      header: 'Position',
      render: (value: any) => (
        <div className="font-medium text-gray-900 dark:text-white">{value}</div>
      ),
    },
    {
      key: 'quantityChange' as keyof SimulationResult,
      header: 'Quantity Change',
      render: (value: any) => (
        <div className="flex items-center gap-1">
          {value > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : value < 0 ? (
            <TrendingDown className="h-4 w-4 text-red-600" />
          ) : null}
          <span
            className={`font-mono ${
              value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {value > 0 ? '+' : ''}{value.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: 'currentQuantity' as keyof SimulationResult,
      header: 'Current → New Quantity',
      render: (value: any, row: SimulationResult) => (
        <div className="font-mono text-gray-700 dark:text-gray-300">
          {value.toLocaleString()} → {row.newQuantity.toLocaleString()}
        </div>
      ),
    },
    {
      key: 'valueChange' as keyof SimulationResult,
      header: 'Value Change',
      render: (value: any) => (
        <div className="flex items-center gap-1">
          {value > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : value < 0 ? (
            <TrendingDown className="h-4 w-4 text-red-600" />
          ) : null}
          <span
            className={`font-mono font-medium ${
              value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {value > 0 ? '+' : ''}{formatCurrency(value)}
          </span>
        </div>
      ),
    },
    {
      key: 'currentWeight' as keyof SimulationResult,
      header: 'Weight Change',
      render: (value: any, row: SimulationResult) => (
        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {formatPercent(value)} → {formatPercent(row.newWeight)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Target: {formatPercent(row.targetWeight)}
          </div>
        </div>
      ),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Rebalancing Simulation
          </CardTitle>
          <div className="flex gap-2">
            {!isSimulated ? (
              <Button
                variant="primary"
                onClick={handleRunSimulation}
                disabled={suggestions.length === 0}
              >
                <Play className="h-4 w-4" />
                Run Simulation
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isSimulated ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Ready to Simulate
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Run the simulation to see how the rebalancing suggestions would affect your portfolio
            </p>
            <Button
              variant="primary"
              onClick={handleRunSimulation}
              disabled={suggestions.length === 0}
            >
              <Play className="h-4 w-4" />
              Run Simulation
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Positions Affected
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {simulationResults.length}
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Net Value Change
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(
                    simulationResults.reduce((sum, r) => sum + r.valueChange, 0)
                  )}
                </div>
              </div>
            </div>

            {/* Results Table */}
            {simulationResults.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Simulation Results
                </h3>
                <Table
                  data={simulationResults}
                  columns={columns}
                  className="border-0"
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No changes would be made to your portfolio
                </p>
              </div>
            )}

            {/* Warning */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calculator className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                    Simulation Results
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    This is a simulation based on current prices. Actual results may vary due to 
                    market movements, transaction costs, and execution timing. Always review 
                    market conditions before making trades.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RebalancingSimulation