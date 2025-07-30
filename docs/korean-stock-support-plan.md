# 한국 주식 지원을 위한 개선 계획

## 📋 개요

현재 Stock Portfolio Dashboard v3는 미국 주식을 기준으로 설계되어 ticker symbol이 필수 필드로 구성되어 있습니다. 
한국 주식의 경우 ticker가 없는 종목들이 있어, 종목명(name) 기반으로 포트폴리오를 관리할 수 있도록 개선이 필요합니다.

## 🎯 주요 변경 사항

### 1. 타입 시스템 개선

#### 변경 전
```typescript
export interface Holding {
  id: string
  symbol: string // 필수 필드
  name: string
  // ...
}

export interface TargetAllocation {
  symbol: string // 필수 필드
  targetWeight: number
  tag: string
}
```

#### 변경 후
```typescript
export interface Holding {
  id: string
  symbol?: string // optional 필드로 변경
  name: string // primary identifier로 사용
  // ...
}

export interface TargetAllocation {
  symbol?: string // optional 필드로 변경
  name: string // primary identifier 추가
  targetWeight: number
  tag: string
}
```

### 2. 비즈니스 로직 변경

#### 종목 매칭 로직
- **기존**: `holding.symbol === target.symbol`
- **개선**: `holding.name === target.name` (symbol이 없는 경우)
- **우선순위**: symbol이 있으면 symbol 우선, 없으면 name 기준

#### 가중치 계산
```typescript
// 기존
weights[holding.symbol] = (holding.marketValue / totalValue) * 100

// 개선
const key = holding.symbol || holding.name
weights[key] = (holding.marketValue / totalValue) * 100
```

### 3. UI/UX 개선

#### StockModal (종목 추가/수정)
- Symbol 입력 필드를 optional로 변경
- 종목명을 필수 필드로 유지
- Symbol 없을 시 안내 메시지 표시

#### HoldingsTable
- Symbol 컬럼에 optional 표시 추가
- Symbol이 없는 경우 종목명만 표시
- 정렬 및 필터링을 종목명 기준으로 개선

#### TargetAllocationModal
- Symbol 대신 종목명 기반 target 설정
- 기존 보유 종목 목록에서 선택 가능하도록 개선

## 🔧 구현 단계

### Phase 1: 타입 및 데이터 구조 개선
1. **타입 정의 수정** (`src/types/portfolio.ts`)
   - `symbol` 필드를 optional로 변경
   - `name` 필드를 primary key로 활용
   - Form 데이터 타입 업데이트

### Phase 2: 비즈니스 로직 수정
2. **Store 로직 업데이트** (`src/stores/portfolioStore.ts`)
   - 종목 매칭 로직을 name 기준으로 변경
   - CRUD 작업 시 name 기반 중복 검사 추가

3. **계산 함수 수정** (`src/utils/calculations.ts`)
   - 가중치 계산을 name 기준으로 변경
   - 리밸런싱 제안 로직 수정

4. **데이터 변환 수정** (`src/utils/dataTransform.ts`)
   - CSV/JSON 변환에서 symbol optional 처리
   - 기존 데이터 마이그레이션 로직 추가

### Phase 3: UI 컴포넌트 업데이트
5. **Form 컴포넌트 수정**
   - `StockModal`: symbol 입력을 optional로 변경
   - `TargetAllocationModal`: name 기반 target 설정

6. **테이블 컴포넌트 수정**
   - `HoldingsTable`: symbol 컬럼 optional 표시
   - `TargetAllocationTable`: name 기반 매칭 표시
   - `PortfolioAllocationTable`: name 기반 정렬

7. **차트 컴포넌트 수정**
   - `PieChart`: symbol 없을 시 name 표시
   - `BarChart`: name 기반 데이터 매핑

### Phase 4: 백워드 호환성 및 검증
8. **데이터 마이그레이션**
   - 기존 미국 주식 데이터와의 호환성 보장
   - symbol이 있는 종목은 기존 방식 유지

9. **테스트 및 검증**
   - 한국 주식 데이터 테스트
   - 기존 기능 영향도 검증

## 🎨 UI/UX 개선 세부사항

### 1. 종목 입력 폼
```typescript
// Symbol 필드 UI 개선
<Input
  id="symbol"
  label="종목 코드 (선택사항)"
  placeholder="예: 005930 (삼성전자)"
  value={formData.symbol || ''}
  onChange={(e) => setFormData({...formData, symbol: e.target.value})}
  helpText="한국 주식의 경우 종목 코드 없이도 입력 가능합니다"
/>

<Input
  id="name" 
  label="종목명 *"
  placeholder="예: 삼성전자"
  value={formData.name}
  onChange={(e) => setFormData({...formData, name: e.target.value})}
  required
/>
```

### 2. 테이블 표시 개선
```typescript
// HoldingsTable에서 symbol/name 표시 로직
const displaySymbol = (holding: Holding) => {
  if (holding.symbol) {
    return `${holding.symbol} (${holding.name})`
  }
  return holding.name
}
```

### 3. 종목 선택 드롭다운
- Target allocation 설정 시 기존 보유 종목에서 선택
- Symbol이 있으면 "AAPL (Apple Inc.)" 형태로 표시
- Symbol이 없으면 "삼성전자" 형태로 표시

## ⚠️ 주의사항

### 1. 데이터 중복 방지
- 동일한 name을 가진 종목의 중복 입력 방지
- Symbol이 다르더라도 name이 같으면 경고 표시
- 예: "삼성전자"와 "삼성전자우" 구분 필요

### 2. 기존 데이터 호환성
- 기존 미국 주식 데이터는 symbol 기준 유지
- 새로운 한국 주식 데이터는 name 기준 처리
- 혼재된 포트폴리오에서도 정상 동작 보장

### 3. 성능 고려사항
- name 기반 검색 시 대소문자 구분 통일
- 한글 종목명 정렬 시 가나다 순 정렬 구현
- 검색 성능 최적화 (debounce 적용)

## 📊 예상 효과

### 1. 사용자 편의성 향상
- 한국 주식 투자자도 쉽게 포트폴리오 관리 가능
- 종목 코드를 모르더라도 종목명만으로 입력 가능
- 국내외 주식 혼재 포트폴리오 지원

### 2. 시장 확장성
- 한국 주식 시장 지원으로 사용자층 확대
- 향후 다른 아시아 시장 지원 시 기반 구축
- ticker가 없는 다른 자산 클래스 지원 가능

### 3. 데이터 관리 개선
- 종목명 기반의 직관적인 데이터 관리
- CSV 내보내기 시 한글 종목명으로 가독성 향상
- 엑셀 등 외부 도구와의 호환성 개선

## 🚀 구현 일정 (예상)

- **Phase 1**: 타입 및 데이터 구조 (1-2일)
- **Phase 2**: 비즈니스 로직 수정 (2-3일)  
- **Phase 3**: UI 컴포넌트 업데이트 (3-4일)
- **Phase 4**: 테스트 및 검증 (1-2일)

**총 예상 기간**: 7-11일

## 📝 관련 이슈

- [ ] 타입 시스템 개선
- [ ] 비즈니스 로직 수정  
- [ ] UI 컴포넌트 업데이트
- [ ] 테스트 케이스 작성
- [ ] 문서 업데이트

---

**작성일**: 2025-01-30  
**작성자**: Claude AI  
**버전**: v1.0