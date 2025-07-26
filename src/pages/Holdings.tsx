import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { usePortfolioStore } from '../stores/portfolioStore'
import HoldingsTable from '../components/portfolio/HoldingsTable'
import PortfolioSummary from '../components/portfolio/PortfolioSummary'
import StockModal from '../components/portfolio/StockModal'
import PieChart from '../components/charts/PieChart'
import type { Holding, HoldingFormData } from '../types/portfolio'

const Holdings: React.FC = () => {
  const {
    getCurrentHoldings,
    getTotalValue,
    getTotalGain,
    getTotalGainPercent,
    addHolding,
    updateHolding,
    deleteHolding,
    updateHoldingPrice,
    ui,
    setError,
  } = usePortfolioStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Holding | null>(null)

  const holdings = getCurrentHoldings()
  const totalValue = getTotalValue()
  const totalGain = getTotalGain()
  const totalGainPercent = getTotalGainPercent()

  const handleAddPosition = () => {
    setEditingPosition(null)
    setIsModalOpen(true)
  }

  const handleEditPosition = (position: Holding) => {
    setEditingPosition(position)
    setIsModalOpen(true)
  }

  const handleDeletePosition = (id: string) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      try {
        deleteHolding(id)
      } catch (error) {
        setError('Failed to delete position')
      }
    }
  }

  const handleUpdatePrice = (id: string, price: number) => {
    try {
      updateHoldingPrice(id, price)
    } catch (error) {
      setError('Failed to update position price')
    }
  }

  const handleSavePosition = (formData: HoldingFormData) => {
    try {
      if (editingPosition) {
        updateHolding(editingPosition.id, formData)
      } else {
        addHolding(formData)
      }
      setIsModalOpen(false)
      setEditingPosition(null)
    } catch (error) {
      setError('Failed to save position')
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPosition(null)
  }

  return (
    <div className="space-y-6 animate-fade-in-scale">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Holdings
          </h1>
          <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
            Manage your portfolio positions and track performance
          </p>
        </div>
        <button
          onClick={handleAddPosition}
          disabled={ui.isLoading}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add Position
        </button>
      </div>

      {ui.error && (
        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--error-light)',
            borderColor: 'var(--error)',
            color: 'var(--error)'
          }}
        >
          {ui.error}
        </div>
      )}

      <PortfolioSummary
        totalValue={totalValue}
        totalGain={totalGain}
        totalGainPercent={totalGainPercent}
        totalPositions={holdings.length}
      />

      {holdings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center">
            <Plus className="h-10 w-10" style={{ color: 'var(--primary)' }} />
          </div>
          <h3 className="text-xl font-semibold mb-2">No positions in your portfolio</h3>
          <p className="text-lg mb-8" style={{ color: 'var(--muted-foreground)' }}>
            Add your first position to start tracking your portfolio performance
          </p>
          <button
            onClick={handleAddPosition}
            className="btn btn-primary text-lg px-6 py-3"
          >
            <Plus className="h-5 w-5" />
            Add Your First Position
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <HoldingsTable
              holdings={holdings}
              onEdit={handleEditPosition}
              onDelete={handleDeletePosition}
              onUpdatePrice={handleUpdatePrice}
            />
          </div>
          <div className="lg:col-span-1">
            <PieChart holdings={holdings} />
          </div>
        </div>
      )}

      <StockModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePosition}
        editingPosition={editingPosition}
        isLoading={ui.isLoading}
      />
    </div>
  )
}

export default Holdings
