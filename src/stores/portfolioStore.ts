import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import type {
  PortfolioData,
  PortfolioSnapshot,
  Holding,
  TargetAllocation,
  RebalancingSuggestion,
  Settings,
  PerformanceMetrics,
  UIState,
  HoldingFormData,
} from '../types/portfolio'
import {
  calculatePortfolioTotals,
  calculateWeights,
  generateRebalancingSuggestions,
  calculatePerformanceMetrics,
} from '../utils/calculations'
import {
  formDataToHolding,
  getCurrentISODate,
  generateId,
  portfolioToCsv,
  csvToPortfolio,
  validatePortfolioData,
} from '../utils/dataTransform'

interface PortfolioStore {
  // State
  portfolioHistory: PortfolioSnapshot[]
  targets: TargetAllocation[]
  settings: Settings
  ui: UIState

  // Computed getters
  getCurrentSnapshot: () => PortfolioSnapshot | null
  getCurrentHoldings: () => Holding[]
  getTotalValue: () => number
  getTotalGain: () => number
  getTotalGainPercent: () => number
  getCurrentWeights: () => Record<string, number>
  getRebalancingSuggestions: () => RebalancingSuggestion[]
  getPerformanceMetrics: (period?: '1M' | '3M' | '1Y' | 'ALL') => PerformanceMetrics

  // Portfolio management actions
  addPortfolioSnapshot: (snapshot: PortfolioSnapshot) => void
  updateCurrentHoldings: (holdings: Holding[]) => void
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
  setSelectedPeriod: (period: '1M' | '3M' | '1Y' | 'ALL') => void

  // Data management actions
  loadFromJson: (data: PortfolioData) => void
  exportToJson: () => PortfolioData
  exportToCsv: () => string
  importFromCsv: (csvData: string) => Promise<void>
  resetAllData: () => void
  createSnapshot: () => void

  // Utility actions
  refreshCalculations: () => void
}

const initialSettings: Settings = {
  darkMode: false,
  lastUpdated: getCurrentISODate(),
}

const initialUIState: UIState = {
  isLoading: false,
  error: null,
  selectedPeriod: 'ALL',
}

export const usePortfolioStore = create<PortfolioStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      portfolioHistory: [],
      targets: [],
      settings: initialSettings,
      ui: initialUIState,

      // Computed getters
      getCurrentSnapshot: () => {
        const { portfolioHistory } = get()
        return portfolioHistory.length > 0 ? portfolioHistory[portfolioHistory.length - 1] : null
      },

      getCurrentHoldings: () => {
        const currentSnapshot = get().getCurrentSnapshot()
        return currentSnapshot?.holdings || []
      },

      getTotalValue: () => {
        const currentSnapshot = get().getCurrentSnapshot()
        return currentSnapshot?.totalValue || 0
      },

      getTotalGain: () => {
        const currentSnapshot = get().getCurrentSnapshot()
        return currentSnapshot?.totalGain || 0
      },

      getTotalGainPercent: () => {
        const currentSnapshot = get().getCurrentSnapshot()
        return currentSnapshot?.totalGainPercent || 0
      },

      getCurrentWeights: () => {
        const holdings = get().getCurrentHoldings()
        return calculateWeights(holdings)
      },

      getRebalancingSuggestions: () => {
        const holdings = get().getCurrentHoldings()
        const targets = get().targets
        return generateRebalancingSuggestions(holdings, targets)
      },

      getPerformanceMetrics: (period = 'ALL') => {
        const { portfolioHistory } = get()
        return calculatePerformanceMetrics(portfolioHistory, period)
      },

      // Portfolio management actions
      addPortfolioSnapshot: snapshot =>
        set(state => ({
          portfolioHistory: [...state.portfolioHistory, snapshot],
          settings: { ...state.settings, lastUpdated: getCurrentISODate() },
        })),

      updateCurrentHoldings: holdings =>
        set(state => {
          const { totalValue, totalGain, totalGainPercent } = calculatePortfolioTotals(holdings)

          const newSnapshot: PortfolioSnapshot = {
            date: getCurrentISODate(),
            holdings,
            totalValue,
            totalGain,
            totalGainPercent,
          }

          const updatedHistory = [...state.portfolioHistory]
          if (updatedHistory.length > 0) {
            updatedHistory[updatedHistory.length - 1] = newSnapshot
          } else {
            updatedHistory.push(newSnapshot)
          }

          return {
            portfolioHistory: updatedHistory,
            settings: { ...state.settings, lastUpdated: getCurrentISODate() },
          }
        }),

      addHolding: formData => {
        const holdings = get().getCurrentHoldings()
        const newHolding: Holding = {
          ...formDataToHolding(formData),
          id: generateId(),
        }

        const updatedHoldings = [...holdings, newHolding]
        get().updateCurrentHoldings(updatedHoldings)
      },

      updateHolding: (id, formData) => {
        const holdings = get().getCurrentHoldings()
        const updatedHoldings = holdings.map(holding =>
          holding.id === id ? { ...formDataToHolding(formData), id } : holding
        )

        get().updateCurrentHoldings(updatedHoldings)
      },

      deleteHolding: id => {
        const holdings = get().getCurrentHoldings()
        const updatedHoldings = holdings.filter(holding => holding.id !== id)

        get().updateCurrentHoldings(updatedHoldings)
      },

      updateHoldingPrice: (id, newPrice) => {
        const holdings = get().getCurrentHoldings()
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

        get().updateCurrentHoldings(updatedHoldings)
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

      setSelectedPeriod: period =>
        set(state => ({
          ui: { ...state.ui, selectedPeriod: period },
        })),

      // Data management actions
      loadFromJson: data => {
        if (!validatePortfolioData(data)) {
          throw new Error('Invalid portfolio data.')
        }

        set({
          portfolioHistory: data.portfolioHistory,
          targets: data.targets,
          settings: { ...data.settings, lastUpdated: getCurrentISODate() },
        })
      },

      exportToJson: () => {
        const { portfolioHistory, targets, settings } = get()
        return {
          portfolioHistory,
          targets,
          settings: { ...settings, lastUpdated: getCurrentISODate() },
        }
      },

      exportToCsv: () => {
        const data = get().exportToJson()
        return portfolioToCsv(data)
      },

      importFromCsv: async csvData => {
        try {
          get().setLoading(true)
          get().setError(null)

          const parsedData = csvToPortfolio(csvData)

          set(state => ({
            portfolioHistory: parsedData.portfolioHistory || state.portfolioHistory,
            targets: parsedData.targets || state.targets,
            settings: { ...state.settings, lastUpdated: getCurrentISODate() },
          }))
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'An error occurred while importing CSV.'
          get().setError(errorMessage)
          throw error
        } finally {
          get().setLoading(false)
        }
      },

      resetAllData: () =>
        set({
          portfolioHistory: [],
          targets: [],
          settings: { ...initialSettings, lastUpdated: getCurrentISODate() },
          ui: initialUIState,
        }),

      createSnapshot: () => {
        const holdings = get().getCurrentHoldings()
        if (holdings.length === 0) return

        const { totalValue, totalGain, totalGainPercent } = calculatePortfolioTotals(holdings)

        const snapshot: PortfolioSnapshot = {
          date: getCurrentISODate(),
          holdings: [...holdings],
          totalValue,
          totalGain,
          totalGainPercent,
        }

        get().addPortfolioSnapshot(snapshot)
      },

      refreshCalculations: () => {
        const holdings = get().getCurrentHoldings()
        get().updateCurrentHoldings(holdings)
      },
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
      portfolioHistory: state.portfolioHistory,
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
      if (validatePortfolioData(parsedData)) {
        usePortfolioStore.getState().loadFromJson(parsedData)
        return true
      }
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
  }
  return false
}
