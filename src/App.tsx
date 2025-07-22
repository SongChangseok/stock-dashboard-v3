import { useEffect, useState } from 'react'
import { usePortfolioStore, loadFromLocalStorage, subscribeToStore } from './stores/portfolioStore'

function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const { settings, ui, getTotalValue, getCurrentHoldings } = usePortfolioStore()
  
  useEffect(() => {
    // localStorage에서 데이터 로드
    const loadSuccess = loadFromLocalStorage()
    
    // 스토어 변경사항을 localStorage에 자동 저장하는 구독 설정
    const unsubscribe = subscribeToStore()
    
    setIsInitialized(true)
    
    if (loadSuccess) {
      console.log('Portfolio data loaded from localStorage')
    } else {
      console.log('No existing portfolio data found, starting fresh')
    }

    return unsubscribe
  }, [])

  // 다크 모드 클래스 적용
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.darkMode])

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  const totalValue = getTotalValue()
  const holdings = getCurrentHoldings()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Stock Portfolio Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your investment portfolio with ease
          </p>
        </header>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Total Holdings
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {holdings.length}
              </p>
            </div>
            
            <div className="card text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Portfolio Value
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW',
                  minimumFractionDigits: 0,
                }).format(totalValue)}
              </p>
            </div>
            
            <div className="card text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Status
              </h3>
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-600 font-medium">
                  {ui.isLoading ? 'Loading...' : 'Ready'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Phase 1 Complete ✅
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                프로젝트 초기화 및 기반 구축이 완료되었습니다
              </p>
              
              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Vite + React + TypeScript 설정 완료
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Tailwind CSS, ESLint, Prettier 설정 완료
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    TypeScript 타입 정의 완료
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    계산 및 데이터 변환 유틸리티 구현
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Zustand 스토어 및 LocalStorage 연동 완료
                  </span>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                다음 단계: 기본 UI 컴포넌트 및 페이지 개발
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App