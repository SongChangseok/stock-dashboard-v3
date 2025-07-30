import React, { useState } from 'react'
import { Plus, PieChart as PieChartIcon, BarChart3 } from 'lucide-react'
import { usePortfolioStore } from '../stores/portfolioStore'
import HoldingsTable from '../components/portfolio/HoldingsTable'
import PortfolioSummary from '../components/portfolio/PortfolioSummary'
import StockModal from '../components/portfolio/StockModal'
import PieChart from '../components/charts/PieChart'
import CollapsibleSection from '../components/ui/CollapsibleSection'
import useMobileOptimization from '../hooks/useMobileOptimization'
import type { Holding, HoldingFormData } from '../types/portfolio'

const Holdings: React.FC = () => {
  const {
    holdings,
    getAllHoldings,
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
  const { compactMode } = useMobileOptimization()
  const allHoldings = getAllHoldings()
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
    const position = allHoldings.find(h => h.id === id)
    if (!position) return
    
    const isTargetOnly = position.quantity === 0 && id.startsWith('target-')
    const message = isTargetOnly 
      ? 'Are you sure you want to remove this target allocation?' 
      : 'Are you sure you want to delete this position?'
      
    if (window.confirm(message)) {
      try {
        if (isTargetOnly) {
          // Remove from targets instead of holdings
          const { deleteTarget } = usePortfolioStore.getState()
          deleteTarget(position.name)
        } else {
          deleteHolding(id)
        }
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
    <div className={`animate-fade-in-scale ${compactMode ? 'space-y-3' : 'space-y-6'}`}>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className={`font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent ${compactMode ? 'text-2xl' : 'text-3xl'}`}>
            Holdings
          </h1>
          {!compactMode && (
            <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
              Manage your portfolio positions and track performance
            </p>
          )}
        </div>
        <button
          onClick={handleAddPosition}
          disabled={ui.isLoading}
          className={`btn btn-primary ${compactMode ? 'text-sm px-3 py-2' : ''}`}
        >
          <Plus className="h-4 w-4" />
          {compactMode ? 'Add' : 'Add Position'}
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

      {holdings.length === 0 ? (
        <div className={`text-center ${compactMode ? 'py-8' : 'py-16'}`}>
          <div className={`mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center ${compactMode ? 'w-16 h-16 mb-3' : 'w-20 h-20 mb-6'}`}>
            <Plus className={`${compactMode ? 'h-8 w-8' : 'h-10 w-10'}`} style={{ color: 'var(--primary)' }} />
          </div>
          <h3 className={`font-semibold mb-2 ${compactMode ? 'text-lg' : 'text-xl'}`}>No positions in your portfolio</h3>
          <p className={`mb-6 ${compactMode ? 'text-base mb-4' : 'text-lg mb-8'}`} style={{ color: 'var(--muted-foreground)' }}>
            Add your first position to start tracking your portfolio performance
          </p>
          <button
            onClick={handleAddPosition}
            className={`btn btn-primary ${compactMode ? 'text-base px-4 py-2' : 'text-lg px-6 py-3'}`}
          >
            <Plus className="h-5 w-5" />
            Add Your First Position
          </button>
        </div>
      ) : compactMode ? (
        // Mobile Layout: Stack everything vertically with collapsible sections
        <div className="space-y-3">
          <CollapsibleSection
            title="Portfolio Summary"
            icon={<BarChart3 className="h-4 w-4" />}
            compactMode={true}
            defaultExpanded={true}
          >
            <PortfolioSummary
              totalValue={totalValue}
              totalGain={totalGain}
              totalGainPercent={totalGainPercent}
              totalPositions={holdings.length}
              hideTitle={true}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Holdings Table"
            icon={<BarChart3 className="h-4 w-4" />}
            compactMode={true}
            defaultExpanded={true}
          >
            <HoldingsTable
              holdings={allHoldings}
              onEdit={handleEditPosition}
              onDelete={handleDeletePosition}
              onUpdatePrice={handleUpdatePrice}
              showTitle={false}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Asset Allocation"
            icon={<PieChartIcon className="h-4 w-4" />}
            compactMode={true}
            defaultExpanded={false}
          >
            <PieChart holdings={holdings} />
          </CollapsibleSection>
        </div>
      ) : (
        // Desktop Layout: Original grid layout
        <div className="space-y-6">
          <PortfolioSummary
            totalValue={totalValue}
            totalGain={totalGain}
            totalGainPercent={totalGainPercent}
            totalPositions={holdings.length}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <HoldingsTable
                holdings={allHoldings}
                onEdit={handleEditPosition}
                onDelete={handleDeletePosition}
                onUpdatePrice={handleUpdatePrice}
              />
            </div>
            <div className="lg:col-span-1">
              <PieChart holdings={holdings} />
            </div>
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
