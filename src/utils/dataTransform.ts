import type {
  Holding,
  HoldingFormData,
} from '../types/portfolio'
import { calculateUnrealizedGain } from './calculations'

/**
 * 현재 ISO 날짜 문자열 반환
 */
export const getCurrentISODate = (): string => {
  return new Date().toISOString()
}

/**
 * 고유한 ID 생성
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 폼 데이터를 Holding 객체로 변환
 */
export const formDataToHolding = (formData: HoldingFormData): Omit<Holding, 'id'> => {
  const { gain, gainPercent, marketValue } = calculateUnrealizedGain(
    formData.quantity,
    formData.avgPrice,
    formData.currentPrice
  )

  return {
    symbol: formData.symbol ? formData.symbol.toUpperCase() : undefined,
    name: formData.name,
    quantity: formData.quantity,
    avgPrice: formData.avgPrice,
    currentPrice: formData.currentPrice,
    marketValue,
    unrealizedGain: gain,
    unrealizedGainPercent: gainPercent,
  }
}

/**
 * 종목 중복 검사 (name 기준)
 */
export const checkDuplicateName = (holdings: Holding[], name: string, excludeId?: string): boolean => {
  return holdings.some(holding => 
    holding.name === name && holding.id !== excludeId
  )
}

