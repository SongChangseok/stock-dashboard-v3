import React from 'react'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card'
import { formatPercent, getIdentifier } from '../../utils/calculations'
import type { TargetAllocation } from '../../types/portfolio'

interface ColumnChartProps {
  currentWeights: Record<string, number>
  targets: TargetAllocation[]
  title?: string
}

interface ChartData {
  symbol?: string
  name: string
  tag: string
  current: number
  target: number
  difference: number
}

const ColumnChart: React.FC<ColumnChartProps> = ({ 
  currentWeights, 
  targets, 
  title = 'Current vs Target Allocation' 
}) => {
  // Combine current weights and targets using identifiers
  const allIdentifiers = new Set([
    ...Object.keys(currentWeights),
    ...targets.map(t => getIdentifier(t))
  ])

  const chartData: ChartData[] = Array.from(allIdentifiers).map(identifier => {
    const target = targets.find(t => getIdentifier(t) === identifier)
    const current = currentWeights[identifier] || 0
    const targetWeight = target?.targetWeight || 0
    
    return {
      symbol: target?.symbol,
      name: target?.name || identifier,
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

    const data = chartData.find(d => d.name === label)
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
        <div className="font-semibold text-base mb-2">
          {data.name}
          {data.symbol && <div className="text-sm opacity-70 font-normal">({data.symbol})</div>}
        </div>
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
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              barCategoryGap="20%"
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--border)" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
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

        <div className="mt-6 space-y-3">
          <div className="flex justify-between items-center text-sm font-semibold border-b pb-2" style={{ borderColor: 'var(--border)' }}>
            <span>Position</span>
            <span>Current</span>
            <span>Target</span>
            <span>Difference</span>
          </div>
          {chartData.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <div>
                <div className="font-mono font-medium">{item.name}</div>
                {item.symbol && <div className="text-xs opacity-70">({item.symbol})</div>}
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

        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex justify-between items-center font-semibold">
            <span>Total Allocations</span>
            <span>{chartData.length} {chartData.length === 1 ? 'position' : 'positions'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ColumnChart