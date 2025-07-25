import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { usePortfolioStore, loadFromLocalStorage, subscribeToStore } from './stores/portfolioStore'
import Layout from './components/layout/Layout'

function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const { settings } = usePortfolioStore()

  useEffect(() => {
    const loadSuccess = loadFromLocalStorage()
    const unsubscribe = subscribeToStore()

    setIsInitialized(true)

    if (loadSuccess) {
      console.log('Portfolio data loaded from localStorage')
    } else {
      console.log('No existing portfolio data found, starting fresh')
    }

    return unsubscribe
  }, [])

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.darkMode])

  if (!isInitialized) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--background-secondary)' }}
      >
        <div className="text-center animate-fade-in-scale">
          <div className="relative mb-8">
            {/* Main loading spinner */}
            <div
              className="animate-spin rounded-full h-16 w-16 border-4 border-transparent mx-auto"
              style={{
                borderTopColor: 'var(--primary)',
                borderRightColor: 'var(--primary)',
                boxShadow: 'var(--shadow-lg)',
              }}
            />
            {/* Pulse ring */}
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ backgroundColor: 'var(--primary)' }}
            />
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Portfolio Dashboard
          </h2>
          <p className="text-lg animate-pulse" style={{ color: 'var(--muted-foreground)' }}>
            Loading portfolio...
          </p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App
