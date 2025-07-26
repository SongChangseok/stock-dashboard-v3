import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../ui/Card'
import useMobileOptimization from '../../hooks/useMobileOptimization'

interface PortfolioSummaryProps {
  totalValue: number
  totalGain: number
  totalGainPercent: number
  totalPositions: number
  hideTitle?: boolean
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = React.memo(({
  totalValue,
  totalGain,
  totalPositions,
  hideTitle = false,
}) => {
  const { compactMode } = useMobileOptimization()
  const formatCurrency = React.useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }, [])

  const isPositiveGain = totalGain >= 0
  const totalCost = totalValue - totalGain

  const summaryItems = React.useMemo(() => [
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
  ], [formatCurrency, totalCost, totalValue, totalGain, isPositiveGain, totalPositions])

  return (
    <div className={compactMode ? 'space-y-2' : 'space-y-6'}>
      {!hideTitle && (
        <div className="flex items-center justify-between">
          <h2 className={`font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent ${compactMode ? 'text-lg' : 'text-2xl'}`}>
            Portfolio Summary
          </h2>
          <div className="text-sm opacity-70">
            {totalPositions} {totalPositions === 1 ? 'position' : 'positions'}
          </div>
        </div>
      )}

      <div className={`grid gap-3 ${compactMode ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'}`}>
        {summaryItems.map((item, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className={compactMode ? 'pb-1 px-3 pt-3' : 'pb-1'}>
              <div className={`font-medium opacity-70 ${compactMode ? 'text-xs' : 'text-sm'}`}>
                {compactMode ? item.title.replace('Total ', '') : item.title}
              </div>
            </CardHeader>
            <CardContent className={compactMode ? 'pt-0 px-3 pb-3' : 'pt-1'}>
              <div
                className={`font-bold ${compactMode ? 'text-lg' : 'text-2xl'}`}
                style={{ color: item.textColor || 'var(--foreground)' }}
              >
                {compactMode && item.value.length > 10 ? 
                  `$${(parseFloat(item.value.replace(/[$,]/g, '')) / 1000).toFixed(0)}K` : 
                  item.value
                }
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
})

PortfolioSummary.displayName = 'PortfolioSummary'

export default PortfolioSummary