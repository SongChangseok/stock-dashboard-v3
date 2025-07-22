import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './Header'
import Holdings from '../../pages/Holdings'
import Portfolio from '../../pages/Portfolio'
import Rebalancing from '../../pages/Rebalancing'

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/holdings" replace />} />
              <Route path="/holdings" element={<Holdings />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/rebalancing" element={<Rebalancing />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout