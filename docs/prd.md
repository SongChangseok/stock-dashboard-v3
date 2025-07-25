# 주식 포트폴리오 관리 웹애플리케이션 PRD

## 1. 프로덕트 개요

### 1.1 목적

개인 투자자를 위한 직관적이고 간단한 주식 포트폴리오 관리 도구 제공

### 1.2 타겟 사용자

- 개인 투자자 (초급~중급)
- 포트폴리오 관리 경험이 있는 사용자
- 데이터 기반 투자 관리를 원하는 사용자

### 1.3 핵심 가치 제안

- 간단하고 직관적인 인터페이스
- 사용자 주도적인 데이터 관리
- 로컬 저장을 통한 데이터 프라이버시 보장

## 2. 기능 요구사항

### 2.1 페이지 구조

#### 2.1.1 주식 보유 현황 페이지

**목적**: 현재 보유 중인 주식 현황을 한눈에 파악하고 기간별 수익률 추적

**주요 기능**:

- 보유 주식 목록 테이블 표시
  - 종목명, 보유수량, 평균매수가, 현재가, 평가손익, 수익률
- 포트폴리오 총 평가액 및 손익 요약
- 종목별 비중 파이차트 시각화
- 주식 추가/수정/삭제 기능
- 수동 현재가 업데이트 기능
- **날짜별 포트폴리오 현황 기록**
  - 간단한 라인차트로 포트폴리오 가치 추이 표시
  - 기간별 수익률 계산 및 표시 (1개월, 3개월, 1년)
  - 과거 포트폴리오 스냅샷 저장 및 조회

**데이터 구조**:

```json
{
  "portfolioHistory": [
    {
      "date": "datetime",
      "holdings": [
        {
          "id": "string",
          "symbol": "string",
          "name": "string",
          "quantity": number,
          "avgPrice": number,
          "currentPrice": number,
          "marketValue": number,
          "unrealizedGain": number,
          "unrealizedGainPercent": number
        }
      ],
      "totalValue": number,
      "totalGain": number,
      "totalGainPercent": number
    }
  ]
}
```

**데이터 활용 방식**:

- 최신 날짜의 데이터가 현재 보유 현황
- 과거 날짜들의 데이터로 기간별 수익률 계산
- 새로운 데이터 입력시 새로운 날짜 항목으로 추가

#### 2.1.2 포트폴리오 관리 페이지

**목적**: 포트폴리오 구성 및 목표 설정 관리

**주요 기능**:

- 목표 포트폴리오 비중 설정
- 현재 vs 목표 비중 비교 시각화 (간단한 막대차트)
- 간단한 태그 시스템을 통한 종목 분류
- 포트폴리오 성과 추적
  - 총 수익률 표시

**데이터 구조**:

```json
{
  "targets": [
    {
      "symbol": "string",
      "targetWeight": number,
      "tag": "string"
    }
  ]
}
```

#### 2.1.3 리밸런싱 관리 페이지

**목적**: 포트폴리오 리밸런싱 계획 및 실행 지원

**주요 기능**:

- 현재 vs 목표 비중 차이 계산
- 리밸런싱 시뮬레이션
  - 매수/매도 수량 및 금액 제안
- 고정 임계값 (5%) 기준으로 리밸런싱 필요 종목 표시

**데이터 구조**:

```json
{
  "rebalancing": {
    "suggestions": [
      {
        "symbol": "string",
        "action": "buy|sell",
        "quantity": number,
        "amount": number,
        "reason": "string"
      }
    ]
  }
}
```

### 2.2 공통 기능

#### 2.2.1 데이터 관리

- **JSON 파일 업로드/다운로드**
  - 전체 포트폴리오 히스토리 데이터 백업/복원
  - 모든 날짜별 보유 현황 및 목표 설정 데이터 포함
  - 완전한 데이터 이관 및 백업 지원
- **CSV 파일 업로드/다운로드**
  - 전체 포트폴리오 히스토리 데이터를 플랫 형태로 변환
  - 각 행이 특정 날짜의 특정 종목 데이터를 나타냄
  - 업로드시 CSV 데이터를 `portfolioHistory` 구조로 변환
  - Excel 등 외부 도구에서 데이터 분석 가능
- **LocalStorage 자동 저장**
  - 실시간 데이터 저장
  - 브라우저 종료 후에도 데이터 유지
  - 다크모드 설정 등 사용자 환경 설정 저장

**전체 데이터 구조 (JSON 백업 형태)**:

```json
{
  "portfolioHistory": [
    {
      "date": "datetime",
      "holdings": [...],
      "totalValue": number,
      "totalGain": number,
      "totalGainPercent": number
    }
  ],
  "targets": [
    {
      "symbol": "string",
      "targetWeight": number,
      "tag": "string"
    }
  ],
  "settings": {
    "darkMode": boolean,
    "lastUpdated": "datetime"
  }
}
```

**CSV 파일 구조 예시**:

```csv
date,symbol,name,quantity,avgPrice,currentPrice,marketValue,unrealizedGain,unrealizedGainPercent,targetWeight,tag
2024-01-01,AAPL,Apple Inc.,100,150.00,155.00,15500,500,3.33,30,Tech
2024-01-01,MSFT,Microsoft Corp.,50,300.00,310.00,15500,500,3.33,25,Tech
2024-01-02,AAPL,Apple Inc.,100,150.00,158.00,15800,800,5.33,30,Tech
2024-01-02,MSFT,Microsoft Corp.,50,300.00,312.00,15600,600,4.00,25,Tech
```

#### 2.2.2 사용자 인터페이스

- **반응형 디자인**: 데스크톱/태블릿/모바일 대응
- **다크/라이트 모드 지원**: 사용자 설정 저장
- **로딩 상태 및 에러 처리**
- **기본 접근성 지원**

## 3. 디자인 요구사항

### 3.1 디자인 원칙

- **미니멀리즘**: 불필요한 요소 제거, 핵심 기능에 집중
- **직관성**: 금융 용어에 익숙하지 않은 사용자도 쉽게 이해
- **일관성**: 전체 페이지에서 동일한 디자인 패턴 적용

### 3.2 시각적 디자인

- **컬러 팔레트**:

  - Primary: 파란색 계열 (#2563EB)
  - Success: 초록색 (#10B981)
  - Warning: 주황색 (#F59E0B)
  - Error: 빨간색 (#EF4444)
  - Neutral: 회색 계열

- **타이포그래피**:
  - 헤딩: 굵은 폰트 (700)
  - 본문: 보통 폰트 (400)
  - 숫자: 모노스페이스 폰트

### 3.3 레이아웃

- **헤더**: 로고, 네비게이션 메뉴
- **사이드바**: 주요 메뉴 (데스크톱)
- **메인 콘텐츠**: 페이지별 주요 내용
- **푸터**: 데이터 관리 도구 (업로드/다운로드)

## 4. 기술 요구사항

### 4.1 프론트엔드

- **프레임워크**: React.js
- **빌드 툴**: Vite
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **차트 라이브러리**: Recharts (파이차트, 라인차트)
- **아이콘**: Lucide React
- **상태 관리**: Zustand
- **코드 품질**: ESLint + Prettier

### 4.2 데이터 저장

- **주 저장소**: LocalStorage
- **백업**: JSON/CSV 파일 다운로드
- **데이터 동기화**: 수동 (파일 업로드)

### 4.3 브라우저 지원

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 4.4 개발 환경 설정

- **Vite 설정**: TypeScript 템플릿 기반
- **ESLint 규칙**: React, TypeScript, Prettier 호환
- **Prettier 설정**: 코드 포맷팅 자동화
- **TypeScript 설정**: strict mode 활성화
- **Zustand Store 구조**:

  ```typescript
  interface PortfolioStore {
    portfolioHistory: PortfolioSnapshot[]
    targets: TargetAllocation[]

    // Actions
    addPortfolioSnapshot: (snapshot: PortfolioSnapshot) => void
    updateCurrentHoldings: (holdings: Holding[]) => void
    setTargets: (targets: TargetAllocation[]) => void
    loadFromJson: (data: PortfolioData) => void
    exportToJson: () => PortfolioData
    exportToCsv: () => string
    importFromCsv: (csvData: string) => void
    calculateRebalancingSuggestions: () => RebalancingSuggestion[]
  }
  ```

## 5. 사용자 스토리

### 5.1 주식 보유 현황 관리

- **As a** 개인 투자자, **I want to** 보유 주식 현황을 한눈에 보고 싶다 **so that** 포트폴리오 상태를 빠르게 파악할 수 있다
- **As a** 사용자, **I want to** 주식을 쉽게 추가/수정/삭제하고 싶다 **so that** 포트폴리오 변경사항을 실시간 반영할 수 있다

### 5.2 포트폴리오 관리

- **As a** 투자자, **I want to** 목표 포트폴리오 비중을 설정하고 싶다 **so that** 투자 목표에 따라 자산을 배분할 수 있다
- **As a** 사용자, **I want to** 현재와 목표 비중을 비교하고 싶다 **so that** 리밸런싱 필요성을 판단할 수 있다

### 5.3 리밸런싱 관리

- **As a** 투자자, **I want to** 리밸런싱 제안을 받고 싶다 **so that** 포트폴리오를 목표에 맞게 조정할 수 있다
- **As a** 사용자, **I want to** 5% 이상 차이나는 종목을 쉽게 파악하고 싶다 **so that** 리밸런싱이 필요한 시점을 알 수 있다

## 6. 성공 지표 (KPI)

### 6.1 사용성 지표

- 페이지 로딩 시간 < 2초
- 주요 액션 완료율 > 90%
- 사용자 재방문율 > 70%

### 6.2 기능 활용도

- 데이터 업로드/다운로드 사용률 > 50%
- 리밸런싱 제안 활용률 > 60%
- 포트폴리오 목표 설정률 > 80%

## 7. 개발 우선순위

### Phase 1 (MVP) - 핵심 기능만

1. **주식 보유 현황 페이지**
   - 주식 추가/수정/삭제
   - 현재 포트폴리오 현황 테이블
   - 종목별 비중 파이차트
2. **포트폴리오 관리 페이지**
   - 목표 비중 설정
   - 현재 vs 목표 비중 비교 (간단한 막대차트)
3. **리밸런싱 관리 페이지**
   - 리밸런싱 제안 (고정 5% 임계값)
4. **데이터 관리**
   - JSON 업로드/다운로드
   - LocalStorage 저장

### Phase 2 - 추가 기능

1. 간단한 라인차트로 수익률 추이 표시
2. CSV 업로드/다운로드
3. 기간별 수익률 계산 (1개월, 3개월, 1년)
4. 태그 시스템을 통한 종목 분류
5. 다크모드 지원

### Phase 3 - 사용자 경험 개선

1. 고급 필터링 및 정렬
2. 성과 분석 대시보드
3. 모바일 최적화
4. 키보드 네비게이션

## 8. 제약사항 및 고려사항

### 8.1 제약사항

- 실시간 주가 데이터 미제공 (사용자 수동 입력)
- 외부 API 연동 없음
- 다중 사용자 지원 없음 (로컬 단일 사용자)

## 9. 결론

본 주식 포트폴리오 관리 웹애플리케이션은 개인 투자자가 쉽고 직관적으로 포트폴리오를 관리할 수 있도록 설계되었습니다. 사용자 중심의 간단한 인터페이스와 로컬 데이터 저장을 통해 프라이버시를 보장하면서도, 필수적인 포트폴리오 관리 기능을 모두 제공합니다.
