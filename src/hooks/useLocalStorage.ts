import { useState, useEffect, useCallback } from 'react'
import { safeJsonParse } from '../utils/dataTransform'

/**
 * LocalStorage를 사용하여 상태를 관리하는 훅
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // 초기값 설정 - localStorage에서 값을 읽거나 기본값 사용
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue
      }

      const item = window.localStorage.getItem(key)
      return item ? safeJsonParse(item, initialValue) : initialValue
    } catch (error) {
      console.warn(`localStorage getItem error for key "${key}":`, error)
      return initialValue
    }
  })

  // localStorage에 값을 저장하는 함수
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // 함수형 업데이트 지원
        const valueToStore = value instanceof Function ? value(storedValue) : value
        
        setStoredValue(valueToStore)

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`localStorage setItem error for key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // localStorage에서 값을 제거하는 함수
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`localStorage removeItem error for key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}

/**
 * 여러 localStorage 키를 한번에 관리하는 훅
 */
export function useMultipleLocalStorage<T extends Record<string, unknown>>(
  keys: Record<keyof T, string>,
  initialValues: T
) {
  const [values, setValues] = useState<T>(() => {
    const result = {} as T
    
    Object.entries(keys).forEach(([key, storageKey]) => {
      try {
        if (typeof window !== 'undefined') {
          const item = window.localStorage.getItem(storageKey)
          result[key as keyof T] = item 
            ? safeJsonParse(item, initialValues[key as keyof T])
            : initialValues[key as keyof T]
        } else {
          result[key as keyof T] = initialValues[key as keyof T]
        }
      } catch (error) {
        console.warn(`localStorage getItem error for key "${storageKey}":`, error)
        result[key as keyof T] = initialValues[key as keyof T]
      }
    })
    
    return result
  })

  const setValueByKey = useCallback(
    <K extends keyof T>(key: K, value: T[K] | ((val: T[K]) => T[K])) => {
      const storageKey = keys[key]
      
      setValues(prev => {
        const newValue = value instanceof Function ? value(prev[key]) : value
        const newValues = { ...prev, [key]: newValue }
        
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(storageKey, JSON.stringify(newValue))
          }
        } catch (error) {
          console.error(`localStorage setItem error for key "${storageKey}":`, error)
        }
        
        return newValues
      })
    },
    [keys]
  )

  const removeValueByKey = useCallback(
    <K extends keyof T>(key: K) => {
      const storageKey = keys[key]
      
      setValues(prev => {
        const newValues = { ...prev, [key]: initialValues[key] }
        
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(storageKey)
          }
        } catch (error) {
          console.error(`localStorage removeItem error for key "${storageKey}":`, error)
        }
        
        return newValues
      })
    },
    [keys, initialValues]
  )

  const clearAll = useCallback(() => {
    setValues(initialValues)
    
    Object.values(keys).forEach(storageKey => {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(storageKey)
        }
      } catch (error) {
        console.error(`localStorage removeItem error for key "${storageKey}":`, error)
      }
    })
  }, [keys, initialValues])

  return {
    values,
    setValueByKey,
    removeValueByKey,
    clearAll,
  }
}

/**
 * localStorage 변경을 감지하는 훅 (다른 탭에서의 변경 포함)
 */
export function useLocalStorageListener<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue
      }

      const item = window.localStorage.getItem(key)
      return item ? safeJsonParse(item, initialValue) : initialValue
    } catch (error) {
      console.warn(`localStorage getItem error for key "${key}":`, error)
      return initialValue
    }
  })

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setValue(safeJsonParse(e.newValue, initialValue))
        } catch (error) {
          console.warn(`localStorage parse error for key "${key}":`, error)
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [key, initialValue])

  const updateValue = useCallback(
    (newValue: T | ((val: T) => T)) => {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue
      
      setValue(valueToStore)
      
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`localStorage setItem error for key "${key}":`, error)
      }
    },
    [key, value]
  )

  return [value, updateValue] as const
}

/**
 * localStorage 용량 확인 함수
 */
export const getLocalStorageSize = (): number => {
  if (typeof window === 'undefined') return 0
  
  let total = 0
  
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      total += localStorage[key].length + key.length
    }
  }
  
  return total
}

/**
 * localStorage 사용 가능한 용량 확인
 */
export const getLocalStorageQuota = (): { used: number; available: number; total: number } => {
  if (typeof window === 'undefined') {
    return { used: 0, available: 0, total: 0 }
  }
  
  const used = getLocalStorageSize()
  
  // 대략적인 localStorage 용량 (5-10MB)
  const estimatedTotal = 5 * 1024 * 1024 // 5MB
  const available = Math.max(0, estimatedTotal - used)
  
  return {
    used,
    available,
    total: estimatedTotal,
  }
}