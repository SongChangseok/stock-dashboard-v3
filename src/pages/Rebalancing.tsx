import React from 'react'
import { Shuffle, AlertTriangle } from 'lucide-react'
import { usePortfolioStore } from '../stores/portfolioStore'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'

const Rebalancing: React.FC = () => {
  const { getRebalancingSuggestions } = usePortfolioStore()

  const suggestions = getRebalancingSuggestions()
  const needsRebalancing = suggestions.length > 0

  return (
    <div className="space-y-6 animate-fade-in-scale">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Rebalancing Management
          </h1>
          <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
            Review portfolio rebalancing suggestions
          </p>
        </div>
        <button className="btn btn-primary">
          <Shuffle className="h-4 w-4" />
          Rebalancing Simulation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle
                className={`h-5 w-5 ${needsRebalancing ? 'text-orange-500' : 'text-green-500'}`}
              />
              <span>Rebalancing Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p
                className={`text-2xl font-bold mb-2 ${needsRebalancing ? 'text-orange-600' : 'text-green-600'}`}
              >
                {needsRebalancing ? 'Adjustment Needed' : 'Balanced'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {needsRebalancing
                  ? `${suggestions.length} positions deviate by more than 5%`
                  : 'All positions are within target allocation range'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Threshold Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
                5%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Currently set as fixed threshold
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rebalancing Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No positions currently require rebalancing
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All positions are within ±5% of target allocation
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Rebalancing suggestions table under development</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Rebalancing
