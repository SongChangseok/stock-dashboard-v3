import React from 'react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card'
import type { Holding } from '../../types/portfolio'

interface PieChartProps {
  holdings: Holding[]
  title?: string
}

interface ChartData {
  name: string
  symbol: string
  value: number
  percentage: number
  color: string
}

const COLORS = [
  '#2563EB', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#6366F1', // Indigo
]

const PieChart: React.FC<PieChartProps> = ({ holdings, title = 'Portfolio Allocation' }) => {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0)

  const chartData: ChartData[] = holdings
    .filter(holding => holding.marketValue > 0)
    .map((holding, index) => ({
      name: holding.name,
      symbol: holding.symbol,
      value: holding.marketValue,
      percentage: totalValue > 0 ? (holding.marketValue / totalValue) * 100 : 0,
      color: COLORS[index % COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0].payload as ChartData
    return (
      <div 
        className="px-3 py-2 rounded-lg shadow-lg border"
        style={{ 
          backgroundColor: 'var(--background)',
          borderColor: 'var(--border)',
          color: 'var(--foreground)'
        }}
      >
        <div className="font-semibold">{data.symbol}</div>
        <div className="text-sm opacity-70">{data.name}</div>
        <div className="mt-1">
          <div className="font-medium">{formatCurrency(data.value)}</div>
          <div className="text-sm opacity-70">{data.percentage.toFixed(1)}%</div>
        </div>
      </div>
    )
  }

  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null

    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.payload.symbol}</span>
            <span className="opacity-70">
              {entry.payload.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    )
  }

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
              <div className="opacity-70">No holdings data available</div>
              <div className="text-sm opacity-50 mt-1">
                Add some positions to see portfolio allocation
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
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="var(--background)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex justify-between items-center text-sm font-semibold border-b pb-2" style={{ borderColor: 'var(--border)' }}>
            <span>Position</span>
            <span>Value</span>
            <span>Weight</span>
          </div>
          {chartData.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <div className="font-medium">{item.symbol}</div>
                  <div className="text-xs opacity-70 truncate max-w-[120px]">
                    {item.name}
                  </div>
                </div>
              </div>
              <div className="font-medium">
                {formatCurrency(item.value)}
              </div>
              <div className="font-medium text-right min-w-[60px]">
                {item.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex justify-between items-center font-semibold">
            <span>Total Portfolio Value</span>
            <span>{formatCurrency(totalValue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PieChart