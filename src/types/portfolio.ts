// 보유 포지션 정보
export interface Holding {
  id: string
  symbol?: string // 포지션 심볼 (선택사항, 한국 주식의 경우 없을 수 있음)
  name: string // 회사명 (primary identifier)
  quantity: number // 보유 수량
  avgPrice: number // 평균 매수 원가
  currentPrice: number // 현재 시장 가격
  marketValue: number // 시장 가치
  unrealizedGain: number // 미실현 손익
  unrealizedGainPercent: number // 미실현 수익률
}


// 목표 자산 배분
export interface TargetAllocation {
  symbol?: string // 포지션 심볼 (선택사항)
  name: string // 회사명 (primary identifier)
  targetWeight: number
  tag: string
}

// 리밸런싱 제안
export interface RebalancingSuggestion {
  symbol?: string // 포지션 심볼 (선택사항)
  name: string // 회사명 (primary identifier)
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


// UI 상태 타입
export interface UIState {
  isLoading: boolean
  error: string | null
}

// 컴포넌트 Props 타입
export interface HoldingFormData {
  symbol?: string // 포지션 심볼 (선택사항)
  name: string // 회사명 (필수)
  quantity: number
  avgPrice: number
  currentPrice: number
}

export interface TargetAllocationFormData {
  symbol?: string // 포지션 심볼 (선택사항)
  name: string // 회사명 (필수)
  targetWeight: number
  tag: string
}

export type HoldingsTableViewMode = 'full' | 'allocation'

export interface AllocationInfo {
  symbol?: string // 포지션 심볼 (선택사항)
  name: string // 회사명 (primary identifier)
  currentWeight: number
  targetWeight?: number
  hasTarget: boolean
  needsRebalancing: boolean
  status: 'onTarget' | 'rebalance' | 'noTarget'
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}


