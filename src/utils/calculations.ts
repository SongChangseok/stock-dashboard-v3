import type { Holding, TargetAllocation, RebalancingSuggestion } from '../types/portfolio'

/**
 * 미실현 손익 계산
 */
export const calculateUnrealizedGain = (
  quantity: number,
  avgPrice: number,
  currentPrice: number
): { gain: number; gainPercent: number; marketValue: number } => {
  const marketValue = quantity * currentPrice
  const totalCost = quantity * avgPrice
  const gain = marketValue - totalCost
  const gainPercent = totalCost > 0 ? (gain / totalCost) * 100 : 0

  return {
    gain,
    gainPercent,
    marketValue,
  }
}

/**
 * 포트폴리오 전체 손익 계산
 */
export const calculatePortfolioTotals = (
  holdings: Holding[]
): { totalValue: number; totalGain: number; totalGainPercent: number } => {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0)
  const totalCost = holdings.reduce((sum, holding) => sum + holding.quantity * holding.avgPrice, 0)
  const totalGain = totalValue - totalCost
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

  return {
    totalValue,
    totalGain,
    totalGainPercent,
  }
}

/**
 * 포트폴리오 비중 계산
 */
export const calculateWeights = (holdings: Holding[]): Record<string, number> => {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0)

  if (totalValue === 0) return {}

  const weights: Record<string, number> = {}
  holdings.forEach(holding => {
    weights[holding.symbol] = (holding.marketValue / totalValue) * 100
  })

  return weights
}

/**
 * 리밸런싱 제안 생성
 */
export const generateRebalancingSuggestions = (
  holdings: Holding[],
  targets: TargetAllocation[]
): RebalancingSuggestion[] => {
  if (holdings.length === 0 || targets.length === 0) return []

  const currentWeights = calculateWeights(holdings)
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0)
  const suggestions: RebalancingSuggestion[] = []

  // 5% 이상 차이나는 경우만 리밸런싱 제안
  const threshold = 5

  for (const target of targets) {
    const currentWeight = currentWeights[target.symbol] || 0
    const deviation = Math.abs(currentWeight - target.targetWeight)

    if (deviation >= threshold) {
      const holding = holdings.find(h => h.symbol === target.symbol)
      if (!holding) continue

      const targetValue = (target.targetWeight / 100) * totalValue
      const currentValue = holding.marketValue
      const valueDifference = targetValue - currentValue

      // $50 이상 차이나거나 편차가 10% 이상일 때 제안 (기존 $100에서 완화)
      const minAmountThreshold = Math.max(50, totalValue * 0.005) // 포트폴리오의 0.5% 또는 $50 중 큰 값
      
      if (Math.abs(valueDifference) >= minAmountThreshold || deviation >= 10) {
        const action = valueDifference > 0 ? 'buy' : 'sell'
        const quantity = Math.abs(Math.round(valueDifference / holding.currentPrice))
        const amount = Math.abs(valueDifference)

        suggestions.push({
          symbol: target.symbol,
          action,
          quantity,
          amount,
          reason: `Current weight (${currentWeight.toFixed(
            1
          )}%) differs from target (${target.targetWeight.toFixed(1)}%) by ${deviation.toFixed(1)}%`,
          currentWeight,
          targetWeight: target.targetWeight,
          deviation,
        })
      }
    }
  }

  return suggestions.sort((a, b) => b.deviation - a.deviation)
}

/**
 * 숫자를 통화 형식으로 포맷팅 (USD 기본)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

/**
 * 숫자를 퍼센트 형식으로 포맷팅
 */
export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}