import React, { useState } from 'react'
import { Target, Settings, Plus, BarChart3 } from 'lucide-react'
import { usePortfolioStore } from '../stores/portfolioStore'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import TargetAllocationModal from '../components/portfolio/TargetAllocationModal'
import TargetAllocationTable from '../components/portfolio/TargetAllocationTable'
import StockModal from '../components/portfolio/StockModal'
import HoldingsTable from '../components/portfolio/HoldingsTable'
import BarChart from '../components/charts/BarChart'
import AllocationSummary from '../components/portfolio/AllocationSummary'
import CollapsibleSection from '../components/ui/CollapsibleSection'
import useMobileOptimization from '../hooks/useMobileOptimization'
import type { TargetAllocation, TargetAllocationFormData, Holding, HoldingFormData } from '../types/portfolio'

const Portfolio: React.FC = () => {
  const { 
    targets,
    holdings,
    getCurrentWeights,
    addTarget, 
    updateTarget, 
    deleteTarget,
    updateHolding,
    deleteHolding,
    ui,
    setLoading 
  } = usePortfolioStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTarget, setEditingTarget] = useState<TargetAllocation | null>(null)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Holding | null>(null)
  const { compactMode } = useMobileOptimization()

  const currentWeights = getCurrentWeights()

  const handleAddTarget = () => {
    setEditingTarget(null)
    setIsModalOpen(true)
  }

  const handleEditTarget = (target: TargetAllocation) => {
    setEditingTarget(target)
    setIsModalOpen(true)
  }

  const handleDeleteTarget = async (symbol: string) => {
    if (window.confirm(`Are you sure you want to delete the target allocation for ${symbol}?`)) {
      try {
        setLoading(true)
        deleteTarget(symbol)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSaveTarget = async (formData: TargetAllocationFormData) => {
    try {
      setLoading(true)
      
      if (editingTarget) {
        updateTarget(editingTarget.symbol, formData)
      } else {
        addTarget(formData)
      }
      
      setIsModalOpen(false)
      setEditingTarget(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTarget(null)
  }

  const handleEditPosition = (position: Holding) => {
    setEditingPosition(position)
    setIsStockModalOpen(true)
  }

  const handleDeletePosition = (id: string) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      try {
        setLoading(true)
        deleteHolding(id)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSavePosition = (formData: HoldingFormData) => {
    try {
      setLoading(true)
      
      if (editingPosition) {
        updateHolding(editingPosition.id, formData)
      }
      
      setIsStockModalOpen(false)
      setEditingPosition(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseStockModal = () => {
    setIsStockModalOpen(false)
    setEditingPosition(null)
  }

  return (
    <div className={`animate-fade-in-scale ${compactMode ? 'space-y-3' : 'space-y-6'}`}>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className={`font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent ${compactMode ? 'text-2xl' : 'text-3xl'}`}>
            Portfolio Management
          </h1>
          {!compactMode && (
            <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
              Set and manage your target portfolio allocation
            </p>
          )}
        </div>
        <button 
          className={`btn btn-primary ${compactMode ? 'text-sm px-3 py-2' : ''}`}
          onClick={handleAddTarget}
          disabled={ui.isLoading}
        >
          <Plus className="h-4 w-4" />
          {compactMode ? 'Add Target' : 'Add Target Allocation'}
        </button>
      </div>

      {compactMode ? (
        // Mobile Layout: Collapsible sections
        <div className="space-y-3">
          <CollapsibleSection
            title="Portfolio Allocation Summary"
            icon={<BarChart3 className="h-4 w-4" />}
            compactMode={true}
            defaultExpanded={true}
          >
            <AllocationSummary
              currentWeights={currentWeights}
              targets={targets}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Target Allocation"
            icon={<Target className="h-4 w-4" />}
            compactMode={true}
            defaultExpanded={true}
          >
            {targets.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl opacity-20 mb-3">🎯</div>
                <p className="opacity-70 mb-3 text-sm">
                  No target allocation has been set
                </p>
                <button 
                  className="btn btn-secondary text-sm"
                  onClick={handleAddTarget}
                  disabled={ui.isLoading}
                >
                  <Plus className="h-4 w-4" />
                  Add First Target
                </button>
              </div>
            ) : (
              <TargetAllocationTable
                targets={targets}
                onEdit={handleEditTarget}
                onDelete={handleDeleteTarget}
                showTitle={false}
              />
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="Current Holdings"
            icon={<BarChart3 className="h-4 w-4" />}
            compactMode={true}
            defaultExpanded={true}
          >
            {holdings.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl opacity-20 mb-3">📊</div>
                <p className="opacity-70 text-sm">No positions currently held</p>
                <div className="text-xs opacity-50 mt-1">
                  Add holdings to see current allocation
                </div>
              </div>
            ) : (
              <HoldingsTable
                holdings={holdings}
                viewMode="allocation"
                targets={targets}
                onEdit={handleEditPosition}
                onDelete={handleDeletePosition}
                showTitle={false}
              />
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="Allocation Comparison Chart"
            icon={<BarChart3 className="h-4 w-4" />}
            compactMode={true}
            defaultExpanded={false}
          >
            <BarChart
              currentWeights={currentWeights}
              targets={targets}
              title=""
            />
          </CollapsibleSection>
        </div>
      ) : (
        // Desktop Layout: Original layout
        <div className="space-y-6">
          {/* Portfolio Allocation Summary */}
          <AllocationSummary
            currentWeights={currentWeights}
            targets={targets}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Target Allocation Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    <span>Target Allocation</span>
                  </div>
                  <button 
                    className="btn btn-secondary text-sm px-3 py-1.5"
                    onClick={handleAddTarget}
                    disabled={ui.isLoading}
                  >
                    <Settings className="h-4 w-4" />
                    Manage
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {targets.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl opacity-20 mb-4">🎯</div>
                    <p className="opacity-70 mb-4">
                      No target allocation has been set
                    </p>
                    <button 
                      className="btn btn-secondary"
                      onClick={handleAddTarget}
                      disabled={ui.isLoading}
                    >
                      <Plus className="h-4 w-4" />
                      Add First Target
                    </button>
                  </div>
                ) : (
                  <TargetAllocationTable
                    targets={targets}
                    onEdit={handleEditTarget}
                    onDelete={handleDeleteTarget}
                    showTitle={false}
                  />
                )}
              </CardContent>
            </Card>

            {/* Current Holdings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-4xl opacity-20">📊</div>
                    <span>Current Holdings</span>
                  </div>
                  <div className="text-sm opacity-70">
                    {holdings.length} {holdings.length === 1 ? 'position' : 'positions'}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {holdings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl opacity-20 mb-4">📊</div>
                    <p className="opacity-70">No positions currently held</p>
                    <div className="text-sm opacity-50 mt-1">
                      Add holdings to see current allocation
                    </div>
                  </div>
                ) : (
                  <HoldingsTable
                    holdings={holdings}
                    viewMode="allocation"
                    targets={targets}
                    onEdit={handleEditPosition}
                    onDelete={handleDeletePosition}
                    showTitle={false}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Allocation Comparison Chart */}
          <BarChart
            currentWeights={currentWeights}
            targets={targets}
            title="Current vs Target Allocation Comparison"
          />
        </div>
      )}

      {/* Target Allocation Modal */}
      <TargetAllocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTarget}
        editingTarget={editingTarget}
        existingTargets={targets}
        isLoading={ui.isLoading}
      />

      {/* Stock Position Modal */}
      <StockModal
        isOpen={isStockModalOpen}
        onClose={handleCloseStockModal}
        onSave={handleSavePosition}
        editingPosition={editingPosition}
        isLoading={ui.isLoading}
      />
    </div>
  )
}

export default Portfolio
