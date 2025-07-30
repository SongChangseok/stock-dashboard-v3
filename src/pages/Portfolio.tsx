import React, { useState } from 'react'
import { Plus, BarChart3, PieChart } from 'lucide-react'
import { usePortfolioStore } from '../stores/portfolioStore'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import TargetAllocationModal from '../components/portfolio/TargetAllocationModal'
import PortfolioAllocationTable from '../components/portfolio/PortfolioAllocationTable'
import BarChart from '../components/charts/BarChart'
import AllocationSummary from '../components/portfolio/AllocationSummary'
import CollapsibleSection from '../components/ui/CollapsibleSection'
import useMobileOptimization from '../hooks/useMobileOptimization'
import type { TargetAllocation, TargetAllocationFormData } from '../types/portfolio'

const Portfolio: React.FC = () => {
  const { 
    targets,
    holdings,
    getCurrentWeights,
    addTarget, 
    updateTarget, 
    deleteTarget,
    ui,
    setLoading 
  } = usePortfolioStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTarget, setEditingTarget] = useState<TargetAllocation | null>(null)
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
            title="Portfolio Allocation"
            icon={<PieChart className="h-4 w-4" />}
            compactMode={true}
            defaultExpanded={true}
          >
            <PortfolioAllocationTable
              targets={targets}
              holdings={holdings}
              currentWeights={currentWeights}
              onEditTarget={handleEditTarget}
              onDeleteTarget={handleDeleteTarget}
              showTitle={false}
              compactMode={true}
            />
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
        // Desktop Layout: Unified table view
        <div className="space-y-6">
          {/* Portfolio Allocation Summary */}
          <AllocationSummary
            currentWeights={currentWeights}
            targets={targets}
          />

          {/* Unified Portfolio Allocation Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  <span>Portfolio Allocation</span>
                </div>
                <div className="text-sm opacity-70">
                  Target vs Current Holdings
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PortfolioAllocationTable
                targets={targets}
                holdings={holdings}
                currentWeights={currentWeights}
                onEditTarget={handleEditTarget}
                onDeleteTarget={handleDeleteTarget}
                showTitle={false}
                compactMode={false}
              />
            </CardContent>
          </Card>

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
    </div>
  )
}

export default Portfolio
