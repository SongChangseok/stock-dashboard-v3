// 보유 포지션 정보
export interface Holding {
  id: string
  symbol: string // 포지션 심볼
  name: string // 회사명
  quantity: number // 보유 수량
  avgPrice: number // 평균 매수 원가
  currentPrice: number // 현재 시장 가격
  marketValue: number // 시장 가치
  unrealizedGain: number // 미실현 손익
  unrealizedGainPercent: number // 미실현 수익률
}

// 포트폴리오 스냅샷
export interface PortfolioSnapshot {
  date: string // ISO datetime
  holdings: Holding[]
  totalValue: number
  totalGain: number
  totalGainPercent: number
}

// 목표 자산 배분
export interface TargetAllocation {
  symbol: string
  targetWeight: number
  tag: string
}

// 리밸런싱 제안
export interface RebalancingSuggestion {
  symbol: string
  action: 'buy' | 'sell'
  quantity: number
  amount: number
  reason: string
  currentWeight: number
  targetWeight: number
  deviation: number
}

// 설정
export interface Settings {
  darkMode: boolean
  lastUpdated: string
}

// 전체 포트폴리오 데이터
export interface PortfolioData {
  portfolioHistory: PortfolioSnapshot[]
  targets: TargetAllocation[]
  settings: Settings
}

// 성과 지표
export interface PerformanceMetrics {
  totalReturn: number
  totalReturnPercent: number
  annualizedReturn: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
}

// UI 상태 타입
export interface UIState {
  isLoading: boolean
  error: string | null
  selectedPeriod: '1M' | '3M' | '1Y' | 'ALL'
}

// 컴포넌트 Props 타입
export interface HoldingFormData {
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  currentPrice: number
}

export interface TargetAllocationFormData {
  symbol: string
  targetWeight: number
  tag: string
}

export type HoldingsTableViewMode = 'full' | 'allocation'

export interface AllocationInfo {
  symbol: string
  currentWeight: number
  targetWeight?: number
  hasTarget: boolean
  needsRebalancing: boolean
  status: 'onTarget' | 'rebalance' | 'noTarget'
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

// CSV 데이터 변환용 타입
export interface CSVRow {
  date: string
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  currentPrice: number
  marketValue: number
  unrealizedGain: number
  unrealizedGainPercent: number
  targetWeight: number
  tag: string
}
