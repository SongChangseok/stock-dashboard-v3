import { useState, useEffect } from 'react'

interface MobileOptimizationConfig {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  compactMode: boolean
}

export const useMobileOptimization = (): MobileOptimizationConfig => {
  const [config, setConfig] = useState<MobileOptimizationConfig>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    compactMode: false,
  })

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024

      setConfig({
        isMobile,
        isTablet,
        isDesktop,
        compactMode: isMobile,
      })
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return config
}

export default useMobileOptimization