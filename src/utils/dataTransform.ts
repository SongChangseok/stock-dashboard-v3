import type {
  PortfolioData,
  PortfolioSnapshot,
  Holding,
  TargetAllocation,
  CSVRow,
  HoldingFormData,
} from '../types/portfolio'
import { calculateUnrealizedGain } from './calculations'

/**
 * 포트폴리오 데이터를 CSV 형식으로 변환
 */
export const portfolioToCsv = (data: PortfolioData): string => {
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
        holding.quantity.toString(),
        holding.avgPrice.toString(),
        holding.currentPrice.toString(),
        holding.marketValue.toString(),
        holding.unrealizedGain.toString(),
        holding.unrealizedGainPercent.toString(),
        target?.targetWeight?.toString() || '0',
        target?.tag || '',
      ]
    })
  )

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

/**
 * CSV 문자열을 파싱하여 포트폴리오 데이터로 변환
 */
export const csvToPortfolio = (csvString: string): Partial<PortfolioData> => {
  const lines = csvString.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV 파일이 올바르지 않습니다.')
  }

  const headers = lines[0].split(',')
  const expectedHeaders = [
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

  // 헤더 검증
  const missingHeaders = expectedHeaders.filter(header => !headers.includes(header))
  if (missingHeaders.length > 0) {
    throw new Error(`필수 헤더가 누락되었습니다: ${missingHeaders.join(', ')}`)
  }

  const csvRows: CSVRow[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1}: 컬럼 수가 일치하지 않습니다. 건너뛰는 중...`)
      continue
    }

    const row: Partial<CSVRow> = {}
    headers.forEach((header, index) => {
      const value = values[index]?.trim()
      
      switch (header) {
        case 'quantity':
        case 'avgPrice':
        case 'currentPrice':
        case 'marketValue':
        case 'unrealizedGain':
        case 'unrealizedGainPercent':
        case 'targetWeight':
          (row as any)[header] = parseFloat(value) || 0
          break
        default:
          (row as any)[header] = value || ''
      }
    })

    if (row.date && row.symbol) {
      csvRows.push(row as CSVRow)
    }
  }

  // 날짜별로 그룹핑하여 포트폴리오 히스토리 생성
  const groupedByDate = csvRows.reduce((acc, row) => {
    if (!acc[row.date]) {
      acc[row.date] = []
    }
    acc[row.date].push(row)
    return acc
  }, {} as Record<string, CSVRow[]>)

  const portfolioHistory: PortfolioSnapshot[] = Object.entries(groupedByDate).map(
    ([date, rows]) => {
      const holdings: Holding[] = rows.map((row, index) => ({
        id: `${row.symbol}-${date}-${index}`,
        symbol: row.symbol,
        name: row.name,
        quantity: row.quantity,
        avgPrice: row.avgPrice,
        currentPrice: row.currentPrice,
        marketValue: row.marketValue,
        unrealizedGain: row.unrealizedGain,
        unrealizedGainPercent: row.unrealizedGainPercent,
      }))

      const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0)
      const totalGain = holdings.reduce((sum, h) => sum + h.unrealizedGain, 0)
      const totalCost = totalValue - totalGain
      const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

      return {
        date,
        holdings,
        totalValue,
        totalGain,
        totalGainPercent,
      }
    }
  )

  // 목표 비중 추출 (최신 데이터 기준)
  const targets: TargetAllocation[] = []
  const symbolSet = new Set<string>()

  csvRows.forEach(row => {
    if (!symbolSet.has(row.symbol) && row.targetWeight > 0) {
      targets.push({
        symbol: row.symbol,
        targetWeight: row.targetWeight,
        tag: row.tag,
      })
      symbolSet.add(row.symbol)
    }
  })

  return {
    portfolioHistory: portfolioHistory.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
    targets,
  }
}

/**
 * 폼 데이터를 Holding 객체로 변환
 */
export const formDataToHolding = (formData: HoldingFormData): Omit<Holding, 'id'> => {
  const { marketValue, unrealizedGain, unrealizedGainPercent } = calculateUnrealizedGain({
    symbol: formData.symbol,
    name: formData.name,
    quantity: formData.quantity,
    avgPrice: formData.avgPrice,
    currentPrice: formData.currentPrice,
  })

  return {
    symbol: formData.symbol.toUpperCase().trim(),
    name: formData.name.trim(),
    quantity: formData.quantity,
    avgPrice: formData.avgPrice,
    currentPrice: formData.currentPrice,
    marketValue,
    unrealizedGain,
    unrealizedGainPercent,
  }
}

/**
 * Holding 객체를 폼 데이터로 변환
 */
export const holdingToFormData = (holding: Holding): HoldingFormData => ({
  symbol: holding.symbol,
  name: holding.name,
  quantity: holding.quantity,
  avgPrice: holding.avgPrice,
  currentPrice: holding.currentPrice,
})

/**
 * JSON 문자열을 안전하게 파싱
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('JSON 파싱 실패:', error)
    return fallback
  }
}

/**
 * 데이터 유효성 검증
 */
export const validatePortfolioData = (data: unknown): data is PortfolioData => {
  if (!data || typeof data !== 'object') {
    return false
  }

  const portfolioData = data as PortfolioData

  // portfolioHistory 검증
  if (!Array.isArray(portfolioData.portfolioHistory)) {
    return false
  }

  // targets 검증
  if (!Array.isArray(portfolioData.targets)) {
    return false
  }

  // settings 검증
  if (!portfolioData.settings || typeof portfolioData.settings !== 'object') {
    return false
  }

  return true
}

/**
 * 보유 종목 데이터 유효성 검증
 */
export const validateHoldingFormData = (data: HoldingFormData): string[] => {
  const errors: string[] = []

  if (!data.symbol?.trim()) {
    errors.push('종목 코드를 입력해주세요.')
  }

  if (!data.name?.trim()) {
    errors.push('종목명을 입력해주세요.')
  }

  if (!data.quantity || data.quantity <= 0) {
    errors.push('보유 수량은 0보다 커야 합니다.')
  }

  if (!data.avgPrice || data.avgPrice <= 0) {
    errors.push('평균 매수가는 0보다 커야 합니다.')
  }

  if (!data.currentPrice || data.currentPrice <= 0) {
    errors.push('현재가는 0보다 커야 합니다.')
  }

  return errors
}

/**
 * 파일을 읽어서 텍스트로 변환
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = event => {
      const result = event.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('파일을 읽을 수 없습니다.'))
      }
    }
    reader.onerror = () => reject(new Error('파일 읽기 중 오류가 발생했습니다.'))
    reader.readAsText(file)
  })
}

/**
 * 데이터를 파일로 다운로드
 */
export const downloadAsFile = (data: string, filename: string, mimeType = 'text/plain') => {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 현재 날짜를 ISO 문자열로 반환
 */
export const getCurrentISODate = (): string => {
  return new Date().toISOString()
}

/**
 * 고유한 ID 생성
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}