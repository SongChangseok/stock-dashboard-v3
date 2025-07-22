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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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