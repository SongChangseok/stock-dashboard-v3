# 주식 포트폴리오 관리 웹앱 세부 개발 계획서

## 📋 프로젝트 개요

- **프로젝트명**: Stock Portfolio Dashboard v3
- **목적**: 개인 투자자를 위한 직관적이고 간단한 주식 포트폴리오 관리 도구
- **아키텍처**: React + TypeScript + Vite (SPA)
- **데이터 저장**: LocalStorage 기반 (JSON/CSV 백업)

## 🏗️ 기술 스택 및 프로젝트 구조

### 기술 스택

```
Frontend: React 18 + TypeScript + Vite
Styling: Tailwind CSS
State Management: Zustand
Charts: Recharts
Icons: Lucide React
Code Quality: ESLint + Prettier
```

### 프로젝트 구조

```
src/
├── components/
│   ├── ui/              # 재사용 가능한 기본 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   └── ThemeToggle.tsx
│   ├── charts/          # 차트 컴포넌트
│   │   ├── PieChart.tsx
│   │   ├── LineChart.tsx
│   │   └── BarChart.tsx
│   └── portfolio/       # 포트폴리오 관련 컴포넌트
│       ├── HoldingsTable.tsx
│       ├── PortfolioSummary.tsx
│       ├── StockModal.tsx
│       ├── TargetAllocationForm.tsx
│       └── RebalancingSuggestions.tsx
├── pages/
│   ├── Holdings.tsx     # 주식 보유 현황 페이지
│   ├── Portfolio.tsx    # 포트폴리오 관리 페이지
│   └── Rebalancing.tsx  # 리밸런싱 관리 페이지
├── hooks/
│   ├── usePortfolio.ts  # 포트폴리오 관련 커스텀 훅
│   ├── useTheme.ts      # 테마 관련 훅
│   └── useLocalStorage.ts # LocalStorage 관리 훅
├── stores/
│   └── portfolioStore.ts # Zustand 기반 전역 상태 관리
├── types/
│   └── portfolio.ts     # TypeScript 타입 정의
├── utils/
│   ├── calculations.ts  # 수익률, 비중 계산 함수
│   ├── dataTransform.ts # 데이터 변환 유틸리티
│   ├── fileHandler.ts   # JSON/CSV 파일 처리
│   └── validators.ts    # 데이터 유효성 검증
└── layout/
    ├── Header.tsx
    ├── Sidebar.tsx
    └── Layout.tsx
```

## 📊 데이터 모델 설계

### 핵심 타입 정의

```typescript
// 보유 종목 정보
interface Holding {
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
interface PortfolioSnapshot {
  date: string // ISO datetime
  holdings: Holding[]
  totalValue: number
  totalGain: number
  totalGainPercent: number
}

// 목표 자산 배분
interface TargetAllocation {
  symbol: string
  targetWeight: number
  tag: string
}

// 리밸런싱 제안
interface RebalancingSuggestion {
  symbol: string
  action: 'buy' | 'sell'
  quantity: number
  amount: number
  reason: string
  currentWeight: number
  targetWeight: number
  deviation: number
}

// 전체 포트폴리오 데이터
interface PortfolioData {
  portfolioHistory: PortfolioSnapshot[]
  targets: TargetAllocation[]
  settings: {
    darkMode: boolean
    lastUpdated: string
  }
}
```

### Zustand Store 구조

```typescript
interface PortfolioStore {
  // State
  portfolioHistory: PortfolioSnapshot[]
  targets: TargetAllocation[]
  settings: {
    darkMode: boolean
    lastUpdated: string
  }

  // Computed
  currentSnapshot: PortfolioSnapshot | null
  currentHoldings: Holding[]
  totalValue: number
  totalGain: number
  totalGainPercent: number

  // Actions
  addPortfolioSnapshot: (snapshot: PortfolioSnapshot) => void
  updateCurrentHoldings: (holdings: Holding[]) => void
  addHolding: (holding: Omit<Holding, 'id'>) => void
  updateHolding: (id: string, holding: Partial<Holding>) => void
  deleteHolding: (id: string) => void
  setTargets: (targets: TargetAllocation[]) => void
  updateSettings: (settings: Partial<Settings>) => void

  // Data Management
  loadFromJson: (data: PortfolioData) => void
  exportToJson: () => PortfolioData
  exportToCsv: () => string
  importFromCsv: (csvData: string) => void

  // Calculations
  calculateCurrentWeights: () => Record<string, number>
  calculateRebalancingSuggestions: () => RebalancingSuggestion[]
  calculatePerformanceMetrics: (period: '1M' | '3M' | '1Y') => PerformanceMetrics
}
```

## 🎯 개발 단계별 계획

### Phase 1: 프로젝트 초기화 및 기반 구축 (1-2일)

#### 1.1 개발 환경 설정

- [ ] Vite + React + TypeScript 프로젝트 생성
- [ ] 의존성 패키지 설치 및 설정
- [ ] ESLint, Prettier 설정
- [ ] Tailwind CSS 설정
- [ ] 기본 폴더 구조 생성

#### 1.2 핵심 타입 및 유틸리티

- [ ] TypeScript 타입 정의 (`types/portfolio.ts`)
- [ ] 계산 유틸리티 함수 (`utils/calculations.ts`)
- [ ] 데이터 변환 유틸리티 (`utils/dataTransform.ts`)
- [ ] LocalStorage 관리 훅 (`hooks/useLocalStorage.ts`)

#### 1.3 Zustand 스토어 구축

- [ ] 기본 스토어 구조 및 액션 정의
- [ ] LocalStorage 연동 미들웨어
- [ ] 초기 데이터 로딩 로직

### Phase 2: 기본 UI 컴포넌트 개발 (2-3일)

#### 2.1 재사용 가능한 UI 컴포넌트

- [ ] Button, Input, Card, Modal 컴포넌트
- [ ] Table 컴포넌트 (정렬, 필터링 기능 포함)
- [ ] ThemeToggle 컴포넌트 (다크/라이트 모드)

#### 2.2 레이아웃 컴포넌트

- [ ] Header (로고, 네비게이션, 테마 토글)
- [ ] Sidebar (메뉴, 데이터 관리 버튼)
- [ ] Layout (전체 레이아웃 구조)

#### 2.3 기본 라우팅 설정

- [ ] React Router 설정
- [ ] 3개 주요 페이지 라우트 구성

### Phase 3: 주식 보유 현황 페이지 (3-4일)

#### 3.1 핵심 기능 개발

- [ ] HoldingsTable 컴포넌트 (종목 목록 테이블)
- [ ] PortfolioSummary 컴포넌트 (총 평가액, 손익 요약)
- [ ] StockModal 컴포넌트 (주식 추가/수정/삭제)
- [ ] 종목별 비중 PieChart 컴포넌트

#### 3.2 데이터 관리 기능

- [ ] 주식 추가/수정/삭제 로직
- [ ] 현재가 수동 업데이트 기능
- [ ] 실시간 계산 (평가손익, 수익률, 비중)

#### 3.3 유효성 검증 및 에러 처리

- [ ] 입력 데이터 유효성 검증
- [ ] 에러 상태 UI 및 처리 로직
- [ ] 로딩 상태 UI

### Phase 4: 포트폴리오 관리 페이지 (2-3일)

#### 4.1 목표 비중 관리

- [ ] TargetAllocationForm 컴포넌트
- [ ] 목표 비중 설정/수정/삭제 기능
- [ ] 간단한 태그 시스템 구현

#### 4.2 비중 비교 시각화

- [ ] 현재 vs 목표 비중 BarChart 컴포넌트
- [ ] 비중 차이 계산 및 표시
- [ ] 포트폴리오 성과 요약 카드

### Phase 5: 리밸런싱 관리 페이지 (2-3일)

#### 5.1 리밸런싱 계산 로직

- [ ] 비중 차이 계산 알고리즘
- [ ] 5% 임계값 기준 리밸런싱 제안 생성
- [ ] 매수/매도 수량 및 금액 계산

#### 5.2 리밸런싱 UI

- [ ] RebalancingSuggestions 컴포넌트
- [ ] 리밸런싱 시뮬레이션 테이블
- [ ] 액션별 색상 코딩 (매수/매도)

### Phase 6: 데이터 관리 기능 (2일)

#### 6.1 파일 처리 유틸리티

- [ ] JSON 파일 업로드/다운로드 기능
- [ ] CSV 파일 업로드/다운로드 기능
- [ ] 데이터 형식 변환 로직

#### 6.2 데이터 백업/복원

- [ ] 전체 포트폴리오 히스토리 백업
- [ ] CSV 형태로 플랫 데이터 내보내기
- [ ] 파일 업로드시 데이터 검증 및 병합

### Phase 7: 추가 기능 및 최적화 (3-4일)

#### 7.1 포트폴리오 히스토리 및 차트

- [ ] 날짜별 포트폴리오 스냅샷 저장
- [ ] 포트폴리오 가치 추이 LineChart
- [ ] 기간별 수익률 계산 (1개월, 3개월, 1년)

#### 7.2 사용자 경험 개선

- [ ] 반응형 디자인 최적화
- [ ] 모바일 UI 개선
- [ ] 접근성 (a11y) 기본 지원
- [ ] 성능 최적화 (React.memo, useMemo, useCallback)

#### 7.3 고급 기능

- [ ] 고급 필터링 및 정렬 옵션
- [ ] 키보드 네비게이션 지원
- [ ] 데이터 검증 강화

## 📝 구현 세부사항

### 핵심 계산 로직

#### 수익률 계산

```typescript
const calculateUnrealizedGain = (holding: Holding) => {
  const gain = (holding.currentPrice - holding.avgPrice) * holding.quantity
  const gainPercent = (holding.currentPrice / holding.avgPrice - 1) * 100
  return { gain, gainPercent }
}
```

#### 포트폴리오 비중 계산

```typescript
const calculateWeights = (holdings: Holding[]) => {
  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0)
  return holdings.map(h => ({
    ...h,
    weight: (h.marketValue / totalValue) * 100,
  }))
}
```

#### 리밸런싱 제안 생성

```typescript
const generateRebalancingSuggestions = (
  holdings: Holding[],
  targets: TargetAllocation[],
  threshold = 5
): RebalancingSuggestion[] => {
  // 현재 비중 계산
  // 목표 비중과 비교
  // 임계값 초과 종목에 대한 매수/매도 제안 생성
}
```

### 데이터 지속성 관리

#### LocalStorage 자동 저장

```typescript
const useAutoSave = () => {
  const store = usePortfolioStore()

  useEffect(() => {
    const saveData = debounce(() => {
      localStorage.setItem('portfolioData', JSON.stringify(store))
    }, 1000)

    return store.subscribe(saveData)
  }, [store])
}
```

#### CSV 데이터 변환

```typescript
const portfolioToCsv = (data: PortfolioData): string => {
  const headers = [
    'date',
    'symbol',
    'name',
    'quantity',
    'avgPrice',
    'currentPrice',
    'marketValue',
    'unrealizedGain',
    'unrealizedGainPercent',
    'targetWeight',
    'tag',
  ]

  const rows = data.portfolioHistory.flatMap(snapshot =>
    snapshot.holdings.map(holding => {
      const target = data.targets.find(t => t.symbol === holding.symbol)
      return [
        snapshot.date,
        holding.symbol,
        holding.name,
        holding.quantity,
        holding.avgPrice,
        holding.currentPrice,
        holding.marketValue,
        holding.unrealizedGain,
        holding.unrealizedGainPercent,
        target?.targetWeight || 0,
        target?.tag || '',
      ]
    })
  )

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}
```

## 🎨 디자인 시스템

### 색상 팔레트

```css
:root {
  --primary: #2563eb;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --neutral-50: #f9fafb;
  --neutral-100: #f3f4f6;
  --neutral-500: #6b7280;
  --neutral-900: #111827;
}
```

### 컴포넌트 스타일 가이드

```typescript
// 카드 컴포넌트 기본 스타일
const cardStyles =
  'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'

// 테이블 스타일
const tableStyles = 'min-w-full divide-y divide-gray-200 dark:divide-gray-700'

// 버튼 변형
const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
}
```

## ✅ 테스트 전략

### 단위 테스트 (Jest + Testing Library)

- [ ] 유틸리티 함수 테스트 (계산, 변환)
- [ ] 커스텀 훅 테스트
- [ ] 컴포넌트 렌더링 테스트

### 통합 테스트

- [ ] 스토어 상태 관리 테스트
- [ ] 파일 업로드/다운로드 플로우 테스트
- [ ] 페이지 간 네비게이션 테스트

### E2E 테스트 (선택사항)

- [ ] 주요 사용자 시나리오 테스트
- [ ] 브라우저 호환성 테스트

## 📋 배포 및 운영

### 빌드 최적화

- [ ] Bundle 크기 최적화
- [ ] 코드 스플리팅 적용
- [ ] 이미지 최적화

### 정적 호스팅 배포

- [ ] GitHub Pages 또는 Vercel 배포 설정
- [ ] CI/CD 파이프라인 구성
- [ ] 환경변수 관리

## 🚀 향후 확장 계획

### 고급 기능

- [ ] 다중 포트폴리오 지원
- [ ] 실시간 주가 API 연동
- [ ] 알림 및 리밸런싱 스케줄링
- [ ] 성과 분석 대시보드

### 데이터 백엔드 연동

- [ ] 클라우드 스토리지 연동
- [ ] 사용자 인증 시스템
- [ ] 데이터 동기화

이 개발 계획서는 PRD의 모든 요구사항을 단계별로 구현할 수 있도록 구조화되었으며, 각 단계별로 명확한 deliverable과 시간 추정을 제공합니다.
