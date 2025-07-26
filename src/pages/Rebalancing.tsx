import React, { useState } from 'react'
import { Shuffle, AlertTriangle } from 'lucide-react'
import { usePortfolioStore } from '../stores/portfolioStore'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import RebalancingSuggestions from '../components/portfolio/RebalancingSuggestions'
import RebalancingSimulation from '../components/portfolio/RebalancingSimulation'

const Rebalancing: React.FC = () => {
  const { getRebalancingSuggestions, getCurrentHoldings, ui } = usePortfolioStore()
  const [showSimulation, setShowSimulation] = useState(false)

  const suggestions = getRebalancingSuggestions()
  const currentHoldings = getCurrentHoldings()
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
        <button 
          className="btn btn-primary"
          onClick={() => setShowSimulation(!showSimulation)}
          disabled={suggestions.length === 0}
        >
          <Shuffle className="h-4 w-4" />
          {showSimulation ? 'Hide Simulation' : 'Show Simulation'}
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

      <RebalancingSuggestions
        suggestions={suggestions}
        isLoading={ui.isLoading}
        onSimulate={() => setShowSimulation(true)}
      />

      {showSimulation && (
        <RebalancingSimulation
          suggestions={suggestions}
          currentHoldings={currentHoldings}
          isLoading={ui.isLoading}
        />
      )}
    </div>
  )
}

export default Rebalancing
