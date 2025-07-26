import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './Header'
import Holdings from '../../pages/Holdings'
import Portfolio from '../../pages/Portfolio'
import Rebalancing from '../../pages/Rebalancing'
import DataManagement from '../../pages/DataManagement'

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-secondary)' }}>
      <Header />

      <div className="flex">
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/holdings" replace />} />
              <Route path="/holdings" element={<Holdings />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/rebalancing" element={<Rebalancing />} />
              <Route path="/data-management" element={<DataManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
