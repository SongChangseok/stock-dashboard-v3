import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import type {
  Holding,
  TargetAllocation,
  RebalancingSuggestion,
  Settings,
  UIState,
  HoldingFormData,
} from '../types/portfolio'
import {
  calculatePortfolioTotals,
  calculateWeights,
  generateRebalancingSuggestions,
} from '../utils/calculations'
import {
  formDataToHolding,
  getCurrentISODate,
  generateId,
} from '../utils/dataTransform'

interface PortfolioStore {
  // State
  holdings: Holding[]
  targets: TargetAllocation[]
  settings: Settings
  ui: UIState

  // Computed getters
  getTotalValue: () => number
  getTotalGain: () => number
  getTotalGainPercent: () => number
  getCurrentWeights: () => Record<string, number>
  getAllHoldings: () => Holding[]
  getRebalancingSuggestions: () => RebalancingSuggestion[]

  // Portfolio management actions
  setHoldings: (holdings: Holding[]) => void
  addHolding: (formData: HoldingFormData) => void
  updateHolding: (id: string, formData: HoldingFormData) => void
  deleteHolding: (id: string) => void
  updateHoldingPrice: (id: string, newPrice: number) => void

  // Target allocation actions
  setTargets: (targets: TargetAllocation[]) => void
  addTarget: (target: TargetAllocation) => void
  updateTarget: (symbol: string, target: Partial<TargetAllocation>) => void
  deleteTarget: (symbol: string) => void

  // Settings actions
  updateSettings: (settings: Partial<Settings>) => void
  toggleDarkMode: () => void

  // UI state actions
  setUIState: (ui: Partial<UIState>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Data management actions
  loadFromJson: (data: any) => void
  exportToJson: () => any
  resetAllData: () => void
}

const initialSettings: Settings = {
  darkMode: false,
  lastUpdated: getCurrentISODate(),
}

const initialUIState: UIState = {
  isLoading: false,
  error: null,
}

export const usePortfolioStore = create<PortfolioStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      holdings: [],
      targets: [],
      settings: initialSettings,
      ui: initialUIState,

      // Computed getters
      getTotalValue: () => {
        const { holdings } = get()
        const { totalValue } = calculatePortfolioTotals(holdings)
        return totalValue
      },

      getTotalGain: () => {
        const { holdings } = get()
        const { totalGain } = calculatePortfolioTotals(holdings)
        return totalGain
      },

      getTotalGainPercent: () => {
        const { holdings } = get()
        const { totalGainPercent } = calculatePortfolioTotals(holdings)
        return totalGainPercent
      },

      getCurrentWeights: () => {
        const { holdings } = get()
        return calculateWeights(holdings)
      },

      getAllHoldings: () => {
        const { holdings, targets } = get()
        
        // 기존 보유 종목의 심볼 리스트
        const existingSymbols = holdings.map(h => h.symbol)
        
        // 타겟에는 있지만 보유하지 않은 종목들을 0 수량으로 추가
        const missingTargetHoldings: Holding[] = targets
          .filter(target => !existingSymbols.includes(target.symbol))
          .map(target => ({
            id: `target-${target.symbol}`,
            symbol: target.symbol,
            name: target.symbol,
            quantity: 0,
            avgPrice: 0,
            currentPrice: 0,
            marketValue: 0,
            unrealizedGain: 0,
            unrealizedGainPercent: 0,
            tag: target.tag || ''
          }))
        
        return [...holdings, ...missingTargetHoldings]
      },

      getRebalancingSuggestions: () => {
        const { holdings, targets } = get()
        return generateRebalancingSuggestions(holdings, targets)
      },

      // Portfolio management actions
      setHoldings: holdings =>
        set(state => ({
          holdings,
          settings: { ...state.settings, lastUpdated: getCurrentISODate() },
        })),

      addHolding: formData => {
        const { holdings } = get()
        const newHolding: Holding = {
          ...formDataToHolding(formData),
          id: generateId(),
        }

        const updatedHoldings = [...holdings, newHolding]
        get().setHoldings(updatedHoldings)
      },

      updateHolding: (id, formData) => {
        const { holdings } = get()
        const updatedHoldings = holdings.map(holding =>
          holding.id === id ? { ...formDataToHolding(formData), id } : holding
        )

        get().setHoldings(updatedHoldings)
      },

      deleteHolding: id => {
        const { holdings } = get()
        const updatedHoldings = holdings.filter(holding => holding.id !== id)

        get().setHoldings(updatedHoldings)
      },

      updateHoldingPrice: (id, newPrice) => {
        const { holdings } = get()
        const updatedHoldings = holdings.map(holding => {
          if (holding.id === id) {
            const marketValue = holding.quantity * newPrice
            const totalCost = holding.quantity * holding.avgPrice
            const unrealizedGain = marketValue - totalCost
            const unrealizedGainPercent = totalCost > 0 ? (unrealizedGain / totalCost) * 100 : 0

            return {
              ...holding,
              currentPrice: newPrice,
              marketValue,
              unrealizedGain,
              unrealizedGainPercent,
            }
          }
          return holding
        })

        get().setHoldings(updatedHoldings)
      },

      // Target allocation actions
      setTargets: targets =>
        set(state => ({
          targets,
          settings: { ...state.settings, lastUpdated: getCurrentISODate() },
        })),

      addTarget: target =>
        set(state => ({
          targets: [...state.targets, target],
          settings: { ...state.settings, lastUpdated: getCurrentISODate() },
        })),

      updateTarget: (symbol, targetUpdate) =>
        set(state => ({
          targets: state.targets.map(target =>
            target.symbol === symbol ? { ...target, ...targetUpdate } : target
          ),
          settings: { ...state.settings, lastUpdated: getCurrentISODate() },
        })),

      deleteTarget: symbol =>
        set(state => ({
          targets: state.targets.filter(target => target.symbol !== symbol),
          settings: { ...state.settings, lastUpdated: getCurrentISODate() },
        })),

      // Settings actions
      updateSettings: settings =>
        set(state => ({
          settings: { ...state.settings, ...settings, lastUpdated: getCurrentISODate() },
        })),

      toggleDarkMode: () =>
        set(state => ({
          settings: {
            ...state.settings,
            darkMode: !state.settings.darkMode,
            lastUpdated: getCurrentISODate(),
          },
        })),

      // UI state actions
      setUIState: ui =>
        set(state => ({
          ui: { ...state.ui, ...ui },
        })),

      setLoading: loading =>
        set(state => ({
          ui: { ...state.ui, isLoading: loading },
        })),

      setError: error =>
        set(state => ({
          ui: { ...state.ui, error },
        })),

      // Data management actions  
      loadFromJson: data => {
        set({
          holdings: data.holdings || [],
          targets: data.targets || [],
          settings: { ...data.settings, lastUpdated: getCurrentISODate() },
        })
      },

      exportToJson: () => {
        const { holdings, targets, settings } = get()
        return {
          holdings,
          targets,
          settings: { ...settings, lastUpdated: getCurrentISODate() },
        }
      },

      resetAllData: () =>
        set({
          holdings: [],
          targets: [],
          settings: { ...initialSettings, lastUpdated: getCurrentISODate() },
          ui: initialUIState,
        }),

    })),
    {
      name: 'portfolio-store',
    }
  )
)

// 스토어 변경 사항을 localStorage에 자동 저장하기 위한 구독
export const subscribeToStore = () => {
  return usePortfolioStore.subscribe(
    state => ({
      holdings: state.holdings,
      targets: state.targets,
      settings: state.settings,
    }),
    data => {
      try {
        localStorage.setItem('portfolio-data', JSON.stringify(data))
      } catch (error) {
        console.error('Failed to save to localStorage:', error)
      }
    }
  )
}

// 앱 시작시 localStorage에서 데이터를 로드하는 함수
export const loadFromLocalStorage = () => {
  try {
    const storedData = localStorage.getItem('portfolio-data')
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      usePortfolioStore.getState().loadFromJson(parsedData)
      return true
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
  }
  return false
}
