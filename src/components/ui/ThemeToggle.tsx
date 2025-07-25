import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { usePortfolioStore } from '../../stores/portfolioStore'
import Button from './Button'

const ThemeToggle: React.FC = () => {
  const { settings, updateSettings } = usePortfolioStore()

  const toggleTheme = () => {
    updateSettings({ darkMode: !settings.darkMode })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="p-2 h-9 w-9 rounded-xl micro-bounce"
      title={settings.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {settings.darkMode ? (
        <Sun className="h-4 w-4 text-yellow-500" />
      ) : (
        <Moon className="h-4 w-4" style={{ color: 'var(--primary)' }} />
      )}
    </Button>
  )
}

export default ThemeToggle
