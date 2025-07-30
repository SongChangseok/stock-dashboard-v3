import React from 'react'
import { TrendingUp, Target, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card'
import { formatPercent } from '../../utils/calculations'
import type { TargetAllocation } from '../../types/portfolio'

interface AllocationSummaryProps {
  currentWeights: Record<string, number>
  targets: TargetAllocation[]
}

const AllocationSummary: React.FC<AllocationSummaryProps> = ({
  currentWeights,
  targets,
}) => {
  // Calculate summary metrics
  const totalCurrentWeight = Object.values(currentWeights).reduce((sum, weight) => sum + weight, 0)
  const totalTargetWeight = targets.reduce((sum, target) => sum + target.targetWeight, 0)
  
  const allocationsNeedingRebalancing = targets.filter(target => {
    const currentWeight = currentWeights[target.symbol] || 0
    return Math.abs(currentWeight - target.targetWeight) > 5
  }).length

  const unallocatedPositions = Object.keys(currentWeights).filter(symbol => 
    !targets.some(target => target.symbol === symbol)
  ).length

  const allocationEfficiency = totalTargetWeight > 0 
    ? Math.min((totalCurrentWeight / totalTargetWeight) * 100, 100)
    : 0

  const formatNumber = (value: number) => value.toString()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Portfolio Allocation Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Current Allocation */}
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
              {formatPercent(totalCurrentWeight)}
            </div>
            <div className="text-sm opacity-70">Current Allocation</div>
          </div>

          {/* Total Target Allocation */}
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
              {formatPercent(totalTargetWeight)}
            </div>
            <div className="text-sm opacity-70">Target Allocation</div>
          </div>

          {/* Positions Needing Rebalancing */}
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="text-2xl font-bold" style={{ 
                color: allocationsNeedingRebalancing > 0 ? 'var(--warning)' : 'var(--success)' 
              }}>
                {formatNumber(allocationsNeedingRebalancing)}
              </div>
              {allocationsNeedingRebalancing > 0 ? (
                <AlertTriangle className="h-5 w-5" style={{ color: 'var(--warning)' }} />
              ) : (
                <CheckCircle className="h-5 w-5" style={{ color: 'var(--success)' }} />
              )}
            </div>
            <div className="text-sm opacity-70">Need Rebalancing</div>
          </div>

          {/* Unallocated Positions */}
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="text-2xl font-bold" style={{ 
                color: unallocatedPositions > 0 ? 'var(--warning)' : 'var(--foreground)' 
              }}>
                {formatNumber(unallocatedPositions)}
              </div>
              {unallocatedPositions > 0 && (
                <AlertTriangle className="h-5 w-5" style={{ color: 'var(--warning)' }} />
              )}
            </div>
            <div className="text-sm opacity-70">Unallocated</div>
          </div>
        </div>

        {/* Allocation Efficiency Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium">Allocation Efficiency</div>
            <div className="text-sm font-medium">{formatPercent(allocationEfficiency)}</div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(allocationEfficiency, 100)}%`,
                backgroundColor: allocationEfficiency >= 90 
                  ? 'var(--success)' 
                  : allocationEfficiency >= 70 
                    ? 'var(--warning)' 
                    : 'var(--error)'
              }}
            />
          </div>
          <div className="text-xs opacity-70 mt-1">
            Based on target vs current allocation coverage
          </div>
        </div>

        {/* Status Messages */}
        <div className="mt-6 space-y-3">
          {totalTargetWeight === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
              <Target className="h-4 w-4" style={{ color: 'var(--warning)' }} />
              <div className="text-sm">
                <strong>No target allocation set.</strong> Define your target weights to track allocation performance.
              </div>
            </div>
          )}

          {totalTargetWeight > 100 && (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
              <AlertTriangle className="h-4 w-4" style={{ color: 'var(--error)' }} />
              <div className="text-sm">
                <strong>Target allocation exceeds 100%.</strong> Total target weights should not exceed 100%.
              </div>
            </div>
          )}

          {unallocatedPositions > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
              <AlertTriangle className="h-4 w-4" style={{ color: 'var(--warning)' }} />
              <div className="text-sm">
                <strong>{unallocatedPositions} position(s) have no target allocation.</strong> Consider setting target weights for all holdings.
              </div>
            </div>
          )}

          {allocationsNeedingRebalancing > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
              <AlertTriangle className="h-4 w-4" style={{ color: 'var(--warning)' }} />
              <div className="text-sm">
                <strong>{allocationsNeedingRebalancing} position(s) deviate by more than 5%.</strong> Consider rebalancing to align with targets.
              </div>
            </div>
          )}

          {totalTargetWeight > 0 && allocationsNeedingRebalancing === 0 && unallocatedPositions === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
              <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />
              <div className="text-sm">
                <strong>Portfolio is well-balanced!</strong> All positions are within target allocation ranges.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AllocationSummary