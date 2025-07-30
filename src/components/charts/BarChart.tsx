import React from 'react'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card'
import { formatPercent } from '../../utils/calculations'
import type { TargetAllocation } from '../../types/portfolio'

interface BarChartProps {
  currentWeights: Record<string, number>
  targets: TargetAllocation[]
  title?: string
}

interface ChartData {
  symbol: string
  tag: string
  current: number
  target: number
  difference: number
}

const BarChart: React.FC<BarChartProps> = ({ 
  currentWeights, 
  targets, 
  title = 'Current vs Target Allocation' 
}) => {
  // Combine current weights and targets
  const allSymbols = new Set([
    ...Object.keys(currentWeights),
    ...targets.map(t => t.symbol)
  ])

  const chartData: ChartData[] = Array.from(allSymbols).map(symbol => {
    const target = targets.find(t => t.symbol === symbol)
    const current = currentWeights[symbol] || 0
    const targetWeight = target?.targetWeight || 0
    
    return {
      symbol,
      tag: target?.tag || 'Untagged',
      current: current,
      target: targetWeight,
      difference: current - targetWeight,
    }
  }).sort((a, b) => Math.max(b.current, b.target) - Math.max(a.current, a.target))


  const getDifferenceColor = (difference: number): string => {
    if (Math.abs(difference) <= 1) return 'var(--foreground)'  // Neutral for very small differences
    if (Math.abs(difference) <= 5) return 'var(--warning)'     // Warning for moderate differences
    return 'var(--error)'  // Error for large differences (regardless of direction)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    const data = chartData.find(d => d.symbol === label)
    if (!data) return null

    return (
      <div 
        className="px-4 py-3 rounded-lg shadow-lg border"
        style={{ 
          backgroundColor: 'var(--background)',
          borderColor: 'var(--border)',
          color: 'var(--foreground)'
        }}
      >
        <div className="font-semibold text-base mb-2">{data.symbol}</div>
        <div className="text-sm opacity-70 mb-3">{data.tag}</div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#2563EB' }}></div>
              Current:
            </span>
            <span className="font-medium">{formatPercent(data.current)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#6B7280' }}></div>
              Target:
            </span>
            <span className="font-medium">{formatPercent(data.target)}</span>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm">Difference:</span>
            <span 
              className="font-medium text-sm"
              style={{ color: getDifferenceColor(data.difference) }}
            >
              {data.difference > 0 ? '+' : ''}{formatPercent(data.difference)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const CustomLegend = () => (
    <div className="flex justify-center gap-6 mt-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2563EB' }}></div>
        <span className="text-sm font-medium">Current Weight</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6B7280' }}></div>
        <span className="text-sm font-medium">Target Weight</span>
      </div>
    </div>
  )

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-center">
            <div>
              <div className="text-6xl opacity-20 mb-4">📊</div>
              <div className="opacity-70">No allocation data available</div>
              <div className="text-sm opacity-50 mt-1">
                Add target allocations and holdings to see comparison
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barCategoryGap="20%"
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--border)" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="symbol" 
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatPercent}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="current" 
                fill="#2563EB" 
                radius={[2, 2, 0, 0]}
                name="Current"
              />
              <Bar 
                dataKey="target" 
                fill="#6B7280" 
                radius={[2, 2, 0, 0]}
                name="Target"
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        <CustomLegend />

        {/* Summary table */}
        <div className="mt-6 space-y-3">
          <div className="flex justify-between items-center text-sm font-semibold border-b pb-2" style={{ borderColor: 'var(--border)' }}>
            <span>Position</span>
            <span>Tag</span>
            <span>Current</span>
            <span>Target</span>
            <span className="text-right">Difference</span>
          </div>
          {chartData.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <div className="font-medium min-w-[60px]">{item.symbol}</div>
              <div className="text-xs px-2 py-1 rounded-full text-center min-w-[80px]" 
                   style={{ 
                     backgroundColor: 'var(--muted)', 
                     color: 'var(--muted-foreground)' 
                   }}>
                {item.tag}
              </div>
              <div className="font-medium text-right min-w-[60px]">
                {formatPercent(item.current)}
              </div>
              <div className="font-medium text-right min-w-[60px]">
                {formatPercent(item.target)}
              </div>
              <div 
                className="font-medium text-right min-w-[80px]"
                style={{ color: getDifferenceColor(item.difference) }}
              >
                {item.difference > 0 ? '+' : ''}{formatPercent(item.difference)}
              </div>
            </div>
          ))}
        </div>

        {/* Summary stats */}
        <div className="mt-6 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4" style={{ borderColor: 'var(--border)' }}>
          <div className="text-center">
            <div className="text-sm opacity-70">Total Current</div>
            <div className="text-lg font-semibold">
              {formatPercent(chartData.reduce((sum, item) => sum + item.current, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm opacity-70">Total Target</div>
            <div className="text-lg font-semibold">
              {formatPercent(chartData.reduce((sum, item) => sum + item.target, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm opacity-70">Need Rebalancing</div>
            <div className="text-lg font-semibold">
              {chartData.filter(item => Math.abs(item.difference) > 5).length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BarChart