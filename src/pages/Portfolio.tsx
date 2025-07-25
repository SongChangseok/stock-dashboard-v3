import React from 'react'
import { Target, Settings } from 'lucide-react'
import { usePortfolioStore } from '../stores/portfolioStore'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'

const Portfolio: React.FC = () => {
  const { targets, getCurrentWeights } = usePortfolioStore()

  const currentWeights = getCurrentWeights()

  return (
    <div className="space-y-6 animate-fade-in-scale">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Portfolio Management
          </h1>
          <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
            Set and manage your target portfolio allocation
          </p>
        </div>
        <Button className="flex items-center space-x-2" icon={<Settings className="h-4 w-4" />}>
          <span>Set Target Allocation</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Target Allocation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {targets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No target allocation has been set
                </p>
                <Button size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Set Target Allocation
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {targets.map(target => (
                  <div key={target.symbol} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{target.symbol}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {target.targetWeight}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(currentWeights).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No stocks currently held</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(currentWeights).map(([symbol, weight]) => (
                  <div key={symbol} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{symbol}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {weight.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Allocation Comparison Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Comparison chart component under development</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Portfolio
