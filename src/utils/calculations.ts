import type {
  Holding,
  PortfolioSnapshot,
  TargetAllocation,
  RebalancingSuggestion,
  PerformanceMetrics,
} from '../types/portfolio'

/**
 * 미실현 손익 계산
 */
export const calculateUnrealizedGain = (holding: Omit<Holding, 'id' | 'marketValue' | 'unrealizedGain' | 'unrealizedGainPercent'>) => {
  const marketValue = holding.currentPrice * holding.quantity
  const totalCost = holding.avgPrice * holding.quantity
  const unrealizedGain = marketValue - totalCost
  const unrealizedGainPercent = totalCost > 0 ? (unrealizedGain / totalCost) * 100 : 0

  return {
    marketValue,
    unrealizedGain,
    unrealizedGainPercent,
  }
}

/**
 * 포트폴리오 총 가치 계산
 */
export const calculatePortfolioTotals = (holdings: Holding[]) => {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0)
  const totalGain = holdings.reduce((sum, holding) => sum + holding.unrealizedGain, 0)
  const totalGainPercent = totalValue > 0 ? (totalGain / (totalValue - totalGain)) * 100 : 0

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
  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0)
  
  if (totalValue === 0) return {}
  
  return holdings.reduce((weights, holding) => {
    weights[holding.symbol] = (holding.marketValue / totalValue) * 100
    return weights
  }, {} as Record<string, number>)
}

/**
 * 리밸런싱 제안 생성
 */
export const generateRebalancingSuggestions = (
  holdings: Holding[],
  targets: TargetAllocation[],
  threshold = 5
): RebalancingSuggestion[] => {
  const currentWeights = calculateWeights(holdings)
  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0)
  
  if (totalValue === 0) return []
  
  const suggestions: RebalancingSuggestion[] = []
  
  for (const target of targets) {
    const currentWeight = currentWeights[target.symbol] || 0
    const deviation = Math.abs(currentWeight - target.targetWeight)
    
    if (deviation >= threshold) {
      const currentHolding = holdings.find(h => h.symbol === target.symbol)
      const targetValue = (target.targetWeight / 100) * totalValue
      const currentValue = currentHolding ? currentHolding.marketValue : 0
      const difference = targetValue - currentValue
      
      const action: 'buy' | 'sell' = difference > 0 ? 'buy' : 'sell'
      const amount = Math.abs(difference)
      
      let quantity = 0
      if (currentHolding && currentHolding.currentPrice > 0) {
        quantity = amount / currentHolding.currentPrice
      }
      
      suggestions.push({
        symbol: target.symbol,
        action,
        quantity: Math.floor(quantity),
        amount,
        reason: `Current weight ${currentWeight.toFixed(1)}% differs from target ${target.targetWeight}% by ${deviation.toFixed(1)}%`,
        currentWeight,
        targetWeight: target.targetWeight,
        deviation,
      })
    }
  }
  
  return suggestions.sort((a, b) => b.deviation - a.deviation)
}

/**
 * 성과 지표 계산
 */
export const calculatePerformanceMetrics = (
  snapshots: PortfolioSnapshot[],
  period: '1M' | '3M' | '1Y' | 'ALL' = 'ALL'
): PerformanceMetrics => {
  if (snapshots.length === 0) {
    return {
      totalReturn: 0,
      totalReturnPercent: 0,
      annualizedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
    }
  }
  
  // 기간별 필터링
  const now = new Date()
  const periodStart = new Date()
  
  switch (period) {
    case '1M':
      periodStart.setMonth(now.getMonth() - 1)
      break
    case '3M':
      periodStart.setMonth(now.getMonth() - 3)
      break
    case '1Y':
      periodStart.setFullYear(now.getFullYear() - 1)
      break
    default:
      periodStart.setFullYear(1970) // 모든 데이터
  }
  
  const filteredSnapshots = snapshots.filter(s => new Date(s.date) >= periodStart)
  
  if (filteredSnapshots.length === 0) {
    return {
      totalReturn: 0,
      totalReturnPercent: 0,
      annualizedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
    }
  }
  
  const firstSnapshot = filteredSnapshots[0]
  const lastSnapshot = filteredSnapshots[filteredSnapshots.length - 1]
  
  // 총 수익률 계산
  const totalReturn = lastSnapshot.totalValue - firstSnapshot.totalValue
  const totalReturnPercent = firstSnapshot.totalValue > 0 
    ? (totalReturn / firstSnapshot.totalValue) * 100 
    : 0
  
  // 연환산 수익률 계산 (복리)
  const daysDiff = (new Date(lastSnapshot.date).getTime() - new Date(firstSnapshot.date).getTime()) / (1000 * 60 * 60 * 24)
  const years = daysDiff / 365.25
  const annualizedReturn = years > 0 && firstSnapshot.totalValue > 0
    ? (Math.pow(lastSnapshot.totalValue / firstSnapshot.totalValue, 1 / years) - 1) * 100
    : 0
  
  // 변동성 계산 (일간 수익률의 표준편차를 연환산)
  let volatility = 0
  if (filteredSnapshots.length > 1) {
    const dailyReturns: number[] = []
    for (let i = 1; i < filteredSnapshots.length; i++) {
      const prevValue = filteredSnapshots[i - 1].totalValue
      const currValue = filteredSnapshots[i].totalValue
      if (prevValue > 0) {
        dailyReturns.push((currValue - prevValue) / prevValue)
      }
    }
    
    if (dailyReturns.length > 0) {
      const mean = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length
      const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / dailyReturns.length
      volatility = Math.sqrt(variance) * Math.sqrt(252) * 100 // 연환산 (252 거래일)
    }
  }
  
  // 샤프 비율 계산 (무위험 수익률을 3%로 가정)
  const riskFreeRate = 3
  const excessReturn = annualizedReturn - riskFreeRate
  const sharpeRatio = volatility > 0 ? excessReturn / volatility : 0
  
  // 최대 낙폭 계산
  let maxDrawdown = 0
  let peak = filteredSnapshots[0].totalValue
  
  for (const snapshot of filteredSnapshots) {
    if (snapshot.totalValue > peak) {
      peak = snapshot.totalValue
    } else if (peak > 0) {
      const drawdown = ((peak - snapshot.totalValue) / peak) * 100
      maxDrawdown = Math.max(maxDrawdown, drawdown)
    }
  }
  
  return {
    totalReturn,
    totalReturnPercent,
    annualizedReturn,
    volatility,
    sharpeRatio,
    maxDrawdown,
  }
}

/**
 * 숫자를 통화 형식으로 포맷팅
 */
export const formatCurrency = (value: number, currency = 'KRW'): string => {
  if (currency === 'KRW') {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * 백분율 포맷팅
 */
export const formatPercent = (value: number, decimals = 2): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * 큰 숫자를 축약 형식으로 포맷팅 (1K, 1M, 1B)
 */
export const formatCompactNumber = (value: number): string => {
  if (Math.abs(value) >= 1e9) {
    return (value / 1e9).toFixed(1) + 'B'
  } else if (Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(1) + 'M'
  } else if (Math.abs(value) >= 1e3) {
    return (value / 1e3).toFixed(1) + 'K'
  }
  return value.toFixed(0)
}