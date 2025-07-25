// 보유 종목 정보
export interface Holding {
  id: string
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  currentPrice: number
  marketValue: number
  unrealizedGain: number
  unrealizedGainPercent: number
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

// 차트 데이터
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

// UI 상태 타입
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

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

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
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
