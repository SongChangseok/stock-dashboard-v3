# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**Stock Portfolio Dashboard v3**는 개인 투자자(초급~중급)를 위한 React + TypeScript 기반 포트폴리오 관리 웹 애플리케이션입니다.

### 핵심 가치 제안

- **간단하고 직관적인 인터페이스**: 금융 용어에 익숙하지 않은 사용자도 쉽게 이해
- **사용자 주도적인 데이터 관리**: 실시간 API 없이 사용자가 수동으로 입력하는 데이터 기반
- **로컬 저장을 통한 데이터 프라이버시 보장**: LocalStorage 사용한 완전 클라이언트 사이드 앱

### 제약사항

- 실시간 주가 데이터 미제공 (사용자 수동 입력)
- 외부 API 연동 없음
- 다중 사용자 지원 없음 (로컬 단일 사용자)

## 개발 명령어

### 기본 개발 워크플로

```bash
npm run dev        # 개발 서버 시작 (http://localhost:5173)
npm run build      # TypeScript 컴파일 및 프로덕션 빌드
npm run lint       # ESLint 실행 (TypeScript 에러는 빌드 시 체크됨)
npm run preview    # 프로덕션 빌드 미리보기
```

### 코드 품질

- **TypeScript**: `tsc`가 빌드 과정에 포함되어 타입 체크 수행
- **ESLint**: 기본 JavaScript 규칙만 적용 (TypeScript 규칙은 컴파일러가 처리)
- **Prettier**: 코드 포맷팅 설정 완료 (`.prettierrc` 파일 참조)

## Token 사용량 최적화

### 파일 읽기 최적화

- **필요한 파일만 읽기**: 타입 정의는 `src/types/portfolio.ts`에 집중되어 있음
- **핵심 로직 파일**: `src/stores/portfolioStore.ts`, `src/utils/calculations.ts`, `src/utils/dataTransform.ts`
- **설정 파일들**: `package.json`, `tailwind.config.js`, `tsconfig.json` 등은 기본 설정 완료됨

### 검색 최적화

- **Glob 패턴 활용**: `src/components/**/*.tsx`, `src/utils/*.ts` 등으로 범위 제한
- **Grep으로 함수/변수 찾기**: 특정 함수명이나 타입명으로 정확한 위치 찾기
- **Task 도구 사용**: 복잡한 검색이나 여러 파일 분석이 필요할 때만 사용

### 효율적 개발 패턴

- **기존 패턴 재사용**: 타입 정의, 계산 로직, 데이터 변환 패턴이 이미 구축됨
- **Store 액션 확장**: 새 기능은 기존 `portfolioStore.ts`에 액션 추가로 충분
- **컴포넌트 구조**: `src/components/ui/`, `portfolio/`, `charts/` 폴더 구조 활용

### 불필요한 작업 방지

- **문서 생성 금지**: README, 추가 .md 파일 생성 없이 기존 구조 활용
- **과도한 리팩토링 방지**: 작동하는 코드는 필요시에만 수정
- **중복 타입 정의 방지**: `src/types/portfolio.ts`의 기존 타입 최대한 활용

## 페이지 구조 및 기능

### 3개 주요 페이지

1. **주식 보유 현황 페이지**: 현재 보유 주식 현황을 한눈에 파악하고 기간별 수익률 추적

   - 보유 주식 목록 테이블 (종목명, 보유수량, 평균매수가, 현재가, 평가손익, 수익률)
   - 포트폴리오 총 평가액 및 손익 요약
   - 종목별 비중 파이차트 시각화
   - 주식 추가/수정/삭제 기능, 수동 현재가 업데이트

2. **포트폴리오 관리 페이지**: 포트폴리오 구성 및 목표 설정 관리

   - 목표 포트폴리오 비중 설정
   - 현재 vs 목표 비중 비교 시각화 (막대차트)
   - 태그 시스템을 통한 종목 분류
   - 포트폴리오 성과 추적

3. **리밸런싱 관리 페이지**: 포트폴리오 리밸런싱 계획 및 실행 지원
   - 현재 vs 목표 비중 차이 계산
   - 리밸런싱 시뮬레이션 (매수/매도 수량 및 금액 제안)
   - 고정 임계값 (5%) 기준으로 리밸런싱 필요 종목 표시

### 공통 기능

- **데이터 관리**: JSON/CSV 파일 업로드/다운로드, LocalStorage 자동 저장
- **UI**: 반응형 디자인, 다크/라이트 모드 지원, 로딩 상태 및 에러 처리

## 아키텍처 개요

### 상태 관리 - Zustand Store

핵심은 `src/stores/portfolioStore.ts`의 단일 Zustand store입니다:

```typescript
interface PortfolioStore {
  // 상태: 포트폴리오 히스토리, 목표 비중, 설정, UI 상태
  portfolioHistory: PortfolioSnapshot[] // 시간별 포트폴리오 스냅샷
  targets: TargetAllocation[] // 목표 자산 배분
  settings: Settings // 다크모드 등 앱 설정
  ui: UIState // 로딩, 에러 상태

  // 계산된 값: 현재 포트폴리오 상태를 실시간 계산
  getCurrentSnapshot: () => PortfolioSnapshot | null
  getCurrentHoldings: () => Holding[]
  getTotalValue: () => number
  getCurrentWeights: () => Record<string, number>
  getRebalancingSuggestions: () => RebalancingSuggestion[]

  // 액션: CRUD 작업 및 데이터 관리
  addHolding
  updateHolding
  deleteHolding
  loadFromJson
  exportToJson
  exportToCsv
  importFromCsv
}
```

### 데이터 지속성 - LocalStorage Integration

- **자동 저장**: Store 변경시 자동으로 localStorage에 저장 (`subscribeToStore()`)
- **초기화**: 앱 시작시 localStorage에서 데이터 로드 (`loadFromLocalStorage()`)
- **백업/복원**: JSON/CSV 파일로 완전한 데이터 백업 및 복원 지원

### 데이터 백업 형식

**JSON 백업**: 완전한 포트폴리오 히스토리 및 설정 데이터 포함

```json
{
  "portfolioHistory": [...],
  "targets": [...],
  "settings": { "darkMode": boolean, "lastUpdated": "datetime" }
}
```

**CSV 백업**: 플랫 형태로 변환하여 Excel 등 외부 도구에서 분석 가능

```csv
date,symbol,name,quantity,avgPrice,currentPrice,marketValue,unrealizedGain,unrealizedGainPercent,targetWeight,tag
```

### 데이터 모델 - 시간별 스냅샷 시스템

**핵심 개념**: 포트폴리오는 시간별 스냅샷(`PortfolioSnapshot`)의 배열로 저장됩니다.

```typescript
PortfolioSnapshot {
  date: string              // ISO 날짜
  holdings: Holding[]       // 해당 시점의 보유 종목들
  totalValue: number        // 총 포트폴리오 가치
  totalGain: number         // 총 손익
  totalGainPercent: number  // 총 수익률
}
```

**데이터 활용 방식**:

- **최신 날짜의 데이터**: 현재 보유 현황으로 표시
- **과거 날짜들의 데이터**: 기간별 수익률 계산에 사용 (1개월, 3개월, 1년)
- **새로운 데이터 입력**: 새로운 날짜 항목으로 추가하여 히스토리 유지

각 `Holding`은 실시간 계산된 `marketValue`, `unrealizedGain`, `unrealizedGainPercent`를 포함합니다.

### 계산 로직 - utils/calculations.ts

핵심 금융 계산 함수들:

- `calculateUnrealizedGain()`: 개별 종목 손익 계산
- `calculatePortfolioTotals()`: 포트폴리오 전체 손익 계산
- `calculateWeights()`: 포트폴리오 내 종목별 비중 계산
- `generateRebalancingSuggestions()`: 5% 임계값 기반 리밸런싱 제안
- `calculatePerformanceMetrics()`: 기간별 성과 지표 (수익률, 변동성, 샤프비율 등)

### 데이터 변환 - utils/dataTransform.ts

- **CSV 변환**: 포트폴리오 히스토리를 flat CSV 형태로 변환/복원
- **폼 데이터 처리**: UI 폼 데이터를 내부 데이터 구조로 변환
- **파일 처리**: 파일 업로드/다운로드 및 검증
- **유효성 검사**: 입력 데이터 검증 및 에러 처리

## 디자인 시스템

### 디자인 원칙

- **미니멀리즘**: 불필요한 요소 제거, 핵심 기능에 집중
- **직관성**: 금융 용어에 익숙하지 않은 사용자도 쉽게 이해
- **일관성**: 전체 페이지에서 동일한 디자인 패턴 적용

### 색상 팔레트 및 레이아웃

- **컬러**: Primary(#2563EB), Success(#10B981), Warning(#F59E0B), Error(#EF4444)
- **타이포그래피**: 헤딩(굵은 폰트 700), 본문(보통 폰트 400), 숫자(모노스페이스)
- **레이아웃**: 헤더(로고, 네비게이션), 사이드바(메뉴), 메인 콘텐츠, 푸터(데이터 관리)

## 성능 목표

- 페이지 로딩 시간 < 2초
- 주요 액션 완료율 > 90%
- 모든 주요 브라우저 지원 (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## 권장 개발 패턴

### 현재 프로젝트 상태

- ✅ **완전한 기반 인프라**: 타입 시스템, Zustand 스토어, 유틸리티 함수 모두 완료
- ❌ **UI 컴포넌트 미구현**: `src/components/` 폴더가 비어있어 Phase 2 개발 대기 상태
- 🎯 **다음 단계**: UI 컴포넌트 개발에만 집중하면 빠른 완성 가능

### Type-First 개발 패턴

```typescript
// 권장: 기존 타입 최대한 활용
import { Holding, HoldingFormData, ButtonProps } from '../types/portfolio'

// 금지: 중복 타입 정의 ❌
// interface MyHolding { ... }
```

### Zustand Store 중심 개발

```typescript
// 권장: Store의 계산된 값 활용
const { getCurrentHoldings, getTotalValue, getRebalancingSuggestions } = usePortfolioStore()

// 권장: Store 액션으로 상태 변경
const { addHolding, updateHolding, deleteHolding } = usePortfolioStore()

// 금지: 직접적인 상태 조작 ❌
// useState로 포트폴리오 데이터 관리
```

### 개발 워크플로

```typescript
// 1단계: 기존 타입 확인
import { Holding, HoldingFormData } from '../types/portfolio'

// 2단계: 기존 유틸리티 함수 확인
import { calculateUnrealizedGain } from '../utils/calculations'

// 3단계: Store 액션 활용
const { addHolding } = usePortfolioStore()

// 4단계: 컴포넌트 구현
const StockForm = () => {
  const handleSubmit = (formData: HoldingFormData) => {
    addHolding(formData) // Store가 자동으로 계산 처리
  }
}
```

### 새 기능 추가시 (Token 효율적 접근법)

1. **먼저 기존 코드 확인**: `Grep` 또는 `Glob`로 유사한 기능이 있는지 확인
2. **타입 정의**: `src/types/portfolio.ts`의 기존 타입 확장 또는 새 인터페이스 추가
3. **계산 로직**: `src/utils/calculations.ts`에 비즈니스 로직 구현
4. **Store 액션**: `src/stores/portfolioStore.ts`의 기존 패턴 따라 액션 추가
5. **UI 컴포넌트**: 기존 `src/components/ui/` 컴포넌트 재사용 우선, 필요시에만 신규 생성

### 컴포넌트 구조

```
src/components/
├── ui/          # 재사용 가능한 기본 UI (Button, Input, Card, Modal, Table)
├── charts/      # Recharts 기반 차트 컴포넌트 (PieChart, LineChart, BarChart)
├── portfolio/   # 비즈니스 로직 컴포넌트 (HoldingsTable, PortfolioSummary, StockModal)
└── layout/      # 레이아웃 컴포넌트 (Header, Sidebar, Layout)
```

### Tailwind CSS 스타일링

- **미리 정의된 클래스**: `.card`, `.btn`, `.btn-primary` 등 (`src/index.css`)
- **다크모드**: `dark:` prefix 사용, `settings.darkMode`로 제어

```tsx
// 권장: 미리 정의된 클래스 사용
<div className="card">
  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">포트폴리오 현황</h2>
  <button className="btn btn-primary">주식 추가</button>
  <button className="btn btn-secondary">취소</button>
</div>
```

### 성능 최적화 패턴

```typescript
// 권장: React.memo로 불필요한 리렌더링 방지
const HoldingsTable = React.memo(({ holdings }: { holdings: Holding[] }) => {
  // ...
})

// 권장: useCallback으로 함수 메모이제이션
const handleAddHolding = useCallback(
  (formData: HoldingFormData) => {
    addHolding(formData)
  },
  [addHolding]
)
```

### 데이터 흐름 패턴

```
사용자 입력 → HoldingFormData → Store.addHolding() → 자동 계산 → UI 업데이트
                                     ↓
                            LocalStorage 자동 저장
```

## 데이터 구조 이해

### 포트폴리오 히스토리 vs 현재 상태

- **portfolioHistory**: 시간별 포트폴리오 스냅샷 배열 (과거 기록 포함)
- **getCurrentSnapshot()**: 가장 최근 스냅샷 (현재 포트폴리오 상태)
- **updateCurrentHoldings()**: 현재 보유 종목 업데이트시 사용 (마지막 스냅샷 수정)
- **addPortfolioSnapshot()**: 새로운 시점의 스냅샷 추가

### CSV 데이터 구조

CSV는 포트폴리오 히스토리를 flatten한 형태입니다:

```csv
date,symbol,name,quantity,avgPrice,currentPrice,marketValue,unrealizedGain,unrealizedGainPercent,targetWeight,tag
2024-01-01,AAPL,Apple Inc.,100,150.00,155.00,15500,500,3.33,30,Tech
```

### 리밸런싱 로직

5% 임계값을 기준으로:

- 현재 비중과 목표 비중 차이가 5% 이상인 종목들에 대해
- 매수/매도 수량과 금액을 계산하여 `RebalancingSuggestion` 생성

## 개발 우선순위

### Phase 1 (MVP) - 완료 ✅

프로젝트 초기화 및 기반 구축 완료

### Phase 2 (다음 단계) - 기본 UI 컴포넌트 개발

**개발 우선순위**:

1. **UI 컴포넌트 먼저**: `Button`, `Input`, `Card`, `Modal` 기본 컴포넌트
2. **HoldingsTable**: 가장 중요한 비즈니스 컴포넌트
3. **StockModal**: 주식 추가/수정 폼
4. **차트 컴포넌트**: `PieChart` (종목별 비중)
5. **레이아웃**: `Header`, `Sidebar` 구조

**구현 내용**:

1. **주식 보유 현황 페이지**: 주식 추가/수정/삭제, 현재 포트폴리오 현황 테이블, 종목별 비중 파이차트
2. **포트폴리오 관리 페이지**: 목표 비중 설정, 현재 vs 목표 비중 비교 (막대차트)
3. **리밸런싱 관리 페이지**: 리밸런싱 제안 (고정 5% 임계값)
4. **데이터 관리**: JSON 업로드/다운로드, LocalStorage 저장

### Phase 3 - 추가 기능

1. 라인차트로 수익률 추이 표시
2. CSV 업로드/다운로드
3. 기간별 수익률 계산 (1개월, 3개월, 1년)
4. 태그 시스템을 통한 종목 분류
5. 다크모드 지원

### 사용자 스토리 (개발 시 참고)

- **보유 현황**: 개인 투자자가 보유 주식 현황을 한눈에 보고 포트폴리오 상태를 빠르게 파악
- **포트폴리오 관리**: 투자자가 목표 포트폴리오 비중을 설정하고 현재와 비교하여 리밸런싱 필요성 판단
- **리밸런싱**: 투자자가 리밸런싱 제안을 받아 포트폴리오를 목표에 맞게 조정

각 개발 단계의 세부사항은 `docs/development-plan.md`와 `docs/prd.md`를 참조하세요.

## 개발 효율성 가이드

### 코드 재사용 우선

- **계산 함수**: `calculateUnrealizedGain`, `calculateWeights`, `generateRebalancingSuggestions` 등 기존 함수 활용
- **데이터 변환**: `formDataToHolding`, `portfolioToCsv`, `validatePortfolioData` 등 기존 유틸리티 사용
- **스토어 패턴**: 기존 액션들(`addHolding`, `updateHolding`, `deleteHolding`)의 패턴 따르기

### 빠른 개발을 위한 핵심 파일들

- **타입 참조**: `src/types/portfolio.ts` - 모든 인터페이스 정의
- **상태 관리**: `src/stores/portfolioStore.ts` - 전역 상태 및 액션
- **비즈니스 로직**: `src/utils/calculations.ts` - 금융 계산
- **스타일 가이드**: `src/index.css` - 미리 정의된 CSS 클래스들

### 불필요한 Token 사용 방지

- 새 기능 구현 전 기존 유사 기능 검색으로 중복 작업 방지
- 설정 파일들은 이미 완료된 상태이므로 수정 불필요
- 문서화는 최소한으로, 코드 자체가 문서 역할

## 2025 웹 디자인 트렌드 및 모범 사례

이 섹션은 Stock Portfolio Dashboard v3 개발 시 참고할 수 있는 2025년 웹 디자인 트렌드입니다.

### 주요 디자인 트렌드

1. **마이크로 인터랙션**

   - 사용자 피드백을 위한 미묘한 애니메이션
   - 호버 효과 같은 상호작용 요소로 참여도 향상
   - 직관적이고 인간적인 디지털 경험 구현

2. **레트로 스타일 디자인**

   - 볼드한 색상, 픽셀 아트, 향수를 자아내는 시각 요소 활용
   - 80년대, 90년대, 2000년대 초반 미학을 현대 웹 기능과 결합
   - 지나치게 세련된 디자인 대신 재미있는 대안 제시

3. **인터랙티브 3D 요소**

   - 웹사이트에 깊이와 현실감 추가
   - AR/VR 같은 경험으로 발전
   - 몰입감 있고 매력적인 디지털 상호작용 구현

4. **스크랩북 미학**

   - 레이어드되고 비대칭적인 디자인
   - 텍스처, 와시테이프, 스티커, 수작업 요소 포함
   - 진정성과 개인적 창의성 강조

5. **볼드 미니멀리즘**

   - 강렬한 타이포그래피가 포함된 깔끔한 레이아웃
   - 화이트 스페이스 극대화
   - 콘텐츠 명확성과 시각적 매력에 초점

6. **AI 생성 비주얼**

   - 독특하고 맞춤형 콘텐츠를 빠르게 제작
   - 디자인 워크플로 개선
   - 자동화를 활용하면서도 창의적 통제권 유지

7. **다크 테마 디자인**

   - 눈의 피로를 줄이는 커스터마이징 가능한 인터페이스
   - 고대비 레이아웃
   - 사용자 편의와 선호도 고려

8. **하이퍼 개인화된 인터페이스**

   - 개별 사용자에게 콘텐츠와 레이아웃 적응
   - 더 깊은 연결 구축
   - 맞춤형 경험을 통한 사용성 향상

9. **접근성 (Accessibility)**

   - 모든 사용자가 사용 가능한 웹사이트 보장
   - 고대비, 키보드 내비게이션, ARIA 라벨 구현
   - 포용성 표준 준수

10. **지속 가능한 웹 디자인**
    - 효율적인 코딩으로 환경 영향 감소
    - 이미지 및 호스팅 최적화
    - 환경을 고려하는 소비자 기대에 부합

### 프로젝트 적용 권장사항

**Stock Portfolio Dashboard v3**에 적용 가능한 트렌드:

- **볼드 미니멀리즘**: 기존 디자인 원칙과 일치
- **다크 테마 디자인**: 이미 계획된 다크/라이트 모드 지원
- **마이크로 인터랙션**: 버튼, 차트 상호작용에 미묘한 애니메이션 추가
- **접근성**: 금융 데이터 시각화에서 중요한 고대비 색상 활용
- **하이퍼 개인화**: 사용자 설정 기반 인터페이스 커스터마이징

이 트렌드들은 프로젝트의 **간단하고 직관적인 인터페이스** 목표와 **로컬 저장을 통한 데이터 프라이버시** 원칙에 잘 부합합니다.
