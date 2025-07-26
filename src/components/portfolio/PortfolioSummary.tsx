import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../ui/Card'

interface PortfolioSummaryProps {
  totalValue: number
  totalGain: number
  totalGainPercent: number
  totalPositions: number
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  totalValue,
  totalGain,
  totalPositions,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const isPositiveGain = totalGain >= 0
  const totalCost = totalValue - totalGain

  const summaryItems = [
    {
      title: 'Total Cost Basis',
      value: formatCurrency(totalCost),
      icon: <DollarSign className="h-5 w-5" />,
      bgColor: 'var(--muted-foreground)',
    },
    {
      title: 'Total Market Value',
      value: formatCurrency(totalValue),
      icon: <DollarSign className="h-5 w-5" />,
      bgColor: 'var(--primary)',
    },
    {
      title: 'Total Unrealized P&L',
      value: formatCurrency(Math.abs(totalGain)),
      icon: isPositiveGain ? (
        <TrendingUp className="h-5 w-5" />
      ) : (
        <TrendingDown className="h-5 w-5" />
      ),
      bgColor: isPositiveGain ? 'var(--success)' : 'var(--error)',
      textColor: isPositiveGain ? 'var(--success)' : 'var(--error)',
    },
    {
      title: 'Total Positions',
      value: totalPositions.toString(),
      icon: <PieChart className="h-5 w-5" />,
      bgColor: 'var(--warning)',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Portfolio Summary</h2>
        <div className="text-sm opacity-70">
          {totalPositions} {totalPositions === 1 ? 'position' : 'positions'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryItems.map((item, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="pb-1">
              <div className="text-sm font-medium opacity-70">
                {item.title}
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              <div
                className="text-2xl font-bold"
                style={{ color: item.textColor || 'var(--foreground)' }}
              >
                {item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}

export default PortfolioSummary