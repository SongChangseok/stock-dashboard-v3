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
    throw new Error('CSV file is not valid.')
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
    throw new Error(`Required headers are missing: ${missingHeaders.join(', ')}`)
  }

  const csvRows: CSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1}: Column count mismatch. Skipping...`)
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
  const groupedByDate = csvRows.reduce(
    (acc, row) => {
      if (!acc[row.date]) {
        acc[row.date] = []
      }
      acc[row.date].push(row)
      return acc
    },
    {} as Record<string, CSVRow[]>
  )

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

  // 각 포트폴리오 스냅샷 검증
  for (const snapshot of portfolioData.portfolioHistory) {
    if (!validatePortfolioSnapshot(snapshot)) {
      return false
    }
  }

  // targets 검증
  if (!Array.isArray(portfolioData.targets)) {
    return false
  }

  // 각 타겟 배분 검증
  for (const target of portfolioData.targets) {
    if (!validateTargetAllocation(target)) {
      return false
    }
  }

  // settings 검증
  if (!portfolioData.settings || typeof portfolioData.settings !== 'object') {
    return false
  }

  if (typeof portfolioData.settings.darkMode !== 'boolean') {
    return false
  }

  if (typeof portfolioData.settings.lastUpdated !== 'string') {
    return false
  }

  return true
}

/**
 * 포트폴리오 스냅샷 유효성 검증
 */
export const validatePortfolioSnapshot = (snapshot: unknown): snapshot is PortfolioSnapshot => {
  if (!snapshot || typeof snapshot !== 'object') {
    return false
  }

  const snap = snapshot as PortfolioSnapshot

  // 기본 필드 검증
  if (!snap.date || typeof snap.date !== 'string') {
    return false
  }

  if (!Array.isArray(snap.holdings)) {
    return false
  }

  if (typeof snap.totalValue !== 'number' || snap.totalValue < 0) {
    return false
  }

  if (typeof snap.totalGain !== 'number') {
    return false
  }

  if (typeof snap.totalGainPercent !== 'number') {
    return false
  }

  // 각 보유 종목 검증
  for (const holding of snap.holdings) {
    if (!validateHolding(holding)) {
      return false
    }
  }

  return true
}

/**
 * 보유 종목 유효성 검증
 */
export const validateHolding = (holding: unknown): holding is Holding => {
  if (!holding || typeof holding !== 'object') {
    return false
  }

  const h = holding as Holding

  return (
    typeof h.id === 'string' &&
    typeof h.symbol === 'string' &&
    h.symbol.trim().length > 0 &&
    typeof h.name === 'string' &&
    h.name.trim().length > 0 &&
    typeof h.quantity === 'number' &&
    h.quantity > 0 &&
    typeof h.avgPrice === 'number' &&
    h.avgPrice > 0 &&
    typeof h.currentPrice === 'number' &&
    h.currentPrice > 0 &&
    typeof h.marketValue === 'number' &&
    h.marketValue >= 0 &&
    typeof h.unrealizedGain === 'number' &&
    typeof h.unrealizedGainPercent === 'number'
  )
}

/**
 * 목표 배분 유효성 검증
 */
export const validateTargetAllocation = (target: unknown): target is TargetAllocation => {
  if (!target || typeof target !== 'object') {
    return false
  }

  const t = target as TargetAllocation

  return (
    typeof t.symbol === 'string' &&
    t.symbol.trim().length > 0 &&
    typeof t.targetWeight === 'number' &&
    t.targetWeight >= 0 &&
    t.targetWeight <= 100 &&
    typeof t.tag === 'string'
  )
}

/**
 * 보유 종목 데이터 유효성 검증
 */
export const validateHoldingFormData = (data: HoldingFormData): string[] => {
  const errors: string[] = []

  if (!data.symbol?.trim()) {
    errors.push('Please enter position symbol.')
  }

  if (!data.name?.trim()) {
    errors.push('Please enter company name.')
  }

  if (!data.quantity || data.quantity <= 0) {
    errors.push('Quantity must be greater than 0.')
  }

  if (!data.avgPrice || data.avgPrice <= 0) {
    errors.push('Average cost must be greater than 0.')
  }

  if (!data.currentPrice || data.currentPrice <= 0) {
    errors.push('Market price must be greater than 0.')
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
        reject(new Error('Cannot read file.'))
      }
    }
    reader.onerror = () => reject(new Error('An error occurred while reading the file.'))
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

/**
 * 에러 메시지 추출 유틸리티
 */
export const getErrorMessage = (error: unknown, fallback = 'Unknown error occurred'): string => {
  return error instanceof Error ? error.message : fallback
}

/**
 * 파일 크기 검증 (10MB 제한)
 */
export const validateFileSize = (file: File, maxSizeMB = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * 파일 확장자 검증
 */
export const validateFileExtension = (file: File, allowedExtensions: string[]): boolean => {
  const fileExtension = file.name.toLowerCase().split('.').pop()
  return fileExtension ? allowedExtensions.includes(fileExtension) : false
}

/**
 * JSON 파일 내용 검증
 */
export const validateJsonFile = async (file: File): Promise<{ isValid: boolean; error?: string; data?: PortfolioData }> => {
  try {
    // 파일 크기 검증
    if (!validateFileSize(file)) {
      return { isValid: false, error: 'File size exceeds 10MB limit.' }
    }

    // 파일 확장자 검증
    if (!validateFileExtension(file, ['json'])) {
      return { isValid: false, error: 'Invalid file type. Please select a JSON file.' }
    }

    // 파일 내용 읽기
    const content = await readFileAsText(file)
    
    // JSON 파싱
    let data: unknown
    try {
      data = JSON.parse(content)
    } catch (parseError) {
      return { isValid: false, error: 'Invalid JSON format.' }
    }

    // 포트폴리오 데이터 구조 검증
    if (!validatePortfolioData(data)) {
      return { isValid: false, error: 'Invalid portfolio data structure.' }
    }

    return { isValid: true, data: data as PortfolioData }
  } catch (error) {
    return { isValid: false, error: getErrorMessage(error) }
  }
}

/**
 * CSV 파일 내용 검증
 */
export const validateCsvFile = async (file: File): Promise<{ isValid: boolean; error?: string; data?: string }> => {
  try {
    // 파일 크기 검증
    if (!validateFileSize(file)) {
      return { isValid: false, error: 'File size exceeds 10MB limit.' }
    }

    // 파일 확장자 검증
    if (!validateFileExtension(file, ['csv'])) {
      return { isValid: false, error: 'Invalid file type. Please select a CSV file.' }
    }

    // 파일 내용 읽기
    const content = await readFileAsText(file)

    // CSV 내용 기본 검증
    const lines = content.trim().split('\n')
    if (lines.length < 2) {
      return { isValid: false, error: 'CSV file must contain at least one data row.' }
    }

    // 헤더 검증
    const headers = lines[0].split(',')
    const requiredHeaders = ['date', 'symbol', 'name', 'quantity', 'avgPrice', 'currentPrice']
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header))
    
    if (missingHeaders.length > 0) {
      return { 
        isValid: false, 
        error: `Required columns are missing: ${missingHeaders.join(', ')}` 
      }
    }

    return { isValid: true, data: content }
  } catch (error) {
    return { isValid: false, error: getErrorMessage(error) }
  }
}

/**
 * 데이터 백업 전 확인
 */
export const validateDataForExport = (data: PortfolioData): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = []

  // 빈 포트폴리오 히스토리 확인
  if (data.portfolioHistory.length === 0) {
    warnings.push('No portfolio history data to export.')
  }

  // 빈 보유 종목 확인
  const currentSnapshot = data.portfolioHistory[data.portfolioHistory.length - 1]
  if (currentSnapshot && currentSnapshot.holdings.length === 0) {
    warnings.push('Current portfolio has no positions.')
  }

  // 타겟 배분 확인
  if (data.targets.length === 0) {
    warnings.push('No target allocations defined.')
  }

  // 타겟 배분 합계 확인
  const totalTargetWeight = data.targets.reduce((sum, target) => sum + target.targetWeight, 0)
  if (totalTargetWeight !== 100 && data.targets.length > 0) {
    warnings.push(`Target allocation weights sum to ${totalTargetWeight.toFixed(1)}% instead of 100%.`)
  }

  return { isValid: true, warnings }
}
