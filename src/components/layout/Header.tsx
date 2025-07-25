import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'

const Header: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { path: '/holdings', label: '보유 현황' },
    { path: '/portfolio', label: '포트폴리오 관리' },
    { path: '/rebalancing', label: '리밸런싱' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header
      className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800"
      style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link
              to="/holdings"
              className="flex items-center space-x-2 text-xl font-bold transition-all duration-200 hover:scale-105"
              style={{ color: 'var(--foreground)' }}
            >
              <TrendingUp className="h-6 w-6" style={{ color: 'var(--primary)' }} />
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Portfolio Dashboard
              </span>
            </Link>

            <nav className="hidden md:flex space-x-2">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  style={
                    isActive(item.path) ? { background: 'var(--gradient-primary)' } : undefined
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>

        <nav className="md:hidden pb-3">
          <div className="flex space-x-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex-1 text-center ${
                  isActive(item.path)
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                style={isActive(item.path) ? { background: 'var(--gradient-primary)' } : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
