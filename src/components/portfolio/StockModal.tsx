import React, { useState, useEffect } from 'react'
import { Save, X } from 'lucide-react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import type { Holding, HoldingFormData } from '../../types/portfolio'

interface StockModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: HoldingFormData) => void
  editingPosition?: Holding | null
  isLoading?: boolean
}

const StockModal: React.FC<StockModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPosition,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<HoldingFormData>({
    symbol: '',
    name: '',
    quantity: 0,
    avgPrice: 0,
    currentPrice: 0,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof HoldingFormData, string>>>({})

  useEffect(() => {
    if (editingPosition) {
      setFormData({
        symbol: editingPosition.symbol,
        name: editingPosition.name,
        quantity: editingPosition.quantity,
        avgPrice: editingPosition.avgPrice,
        currentPrice: editingPosition.currentPrice,
      })
    } else {
      setFormData({
        symbol: '',
        name: '',
        quantity: 0,
        avgPrice: 0,
        currentPrice: 0,
      })
    }
    setErrors({})
  }, [editingPosition, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof HoldingFormData, string>> = {}

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Position symbol is required'
    } else if (!/^[A-Z]{1,5}$/.test(formData.symbol.toUpperCase())) {
      newErrors.symbol = 'Position symbol must be 1-5 uppercase letters'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Company name must be at least 2 characters'
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }

    if (formData.avgPrice <= 0) {
      newErrors.avgPrice = 'Average cost must be greater than 0'
    }

    if (formData.currentPrice <= 0) {
      newErrors.currentPrice = 'Market price must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const submissionData = {
        ...formData,
        symbol: formData.symbol.toUpperCase(),
        name: formData.name.trim(),
      }
      onSave(submissionData)
    }
  }

  const handleInputChange = (field: keyof HoldingFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  const isFormValid = !Object.values(errors).some(error => error) && 
    formData.symbol && formData.name && formData.quantity > 0 && 
    formData.avgPrice > 0 && formData.currentPrice > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingPosition ? 'Edit Position' : 'Add New Position'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Position Symbol"
            placeholder="e.g., AAPL"
            value={formData.symbol}
            onChange={e => handleInputChange('symbol', e.target.value)}
            error={errors.symbol}
            required
            disabled={isLoading}
            className="uppercase"
          />

          <Input
            label="Company Name"
            placeholder="e.g., Apple Inc."
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            error={errors.name}
            required
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Quantity"
            type="number"
            placeholder="0"
            value={formData.quantity || ''}
            onChange={e => handleInputChange('quantity', Number(e.target.value))}
            error={errors.quantity}
            required
            disabled={isLoading}
            min="1"
            step="1"
          />

          <Input
            label="Average Cost ($)"
            type="number"
            placeholder="0.00"
            value={formData.avgPrice || ''}
            onChange={e => handleInputChange('avgPrice', Number(e.target.value))}
            error={errors.avgPrice}
            required
            disabled={isLoading}
            min="0.01"
            step="0.01"
          />

          <Input
            label="Market Price ($)"
            type="number"
            placeholder="0.00"
            value={formData.currentPrice || ''}
            onChange={e => handleInputChange('currentPrice', Number(e.target.value))}
            error={errors.currentPrice}
            required
            disabled={isLoading}
            min="0.01"
            step="0.01"
          />
        </div>

        {/* Preview calculation */}
        {formData.quantity > 0 && formData.avgPrice > 0 && formData.currentPrice > 0 && (
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <h4 className="text-sm font-semibold mb-2 opacity-70">Preview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="opacity-70">Market Value: </span>
                <span className="font-medium">
                  ${(formData.quantity * formData.currentPrice).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div>
                <span className="opacity-70">Total Cost: </span>
                <span className="font-medium">
                  ${(formData.quantity * formData.avgPrice).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div>
                <span className="opacity-70">Unrealized P&L: </span>
                <span 
                  className="font-medium"
                  style={{
                    color: (formData.currentPrice - formData.avgPrice) >= 0 
                      ? 'var(--success)' 
                      : 'var(--error)'
                  }}
                >
                  ${Math.abs((formData.currentPrice - formData.avgPrice) * formData.quantity).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div>
                <span className="opacity-70">Return: </span>
                <span 
                  className="font-medium"
                  style={{
                    color: (formData.currentPrice - formData.avgPrice) >= 0 
                      ? 'var(--success)' 
                      : 'var(--error)'
                  }}
                >
                  {formData.avgPrice > 0 
                    ? `${Math.abs(((formData.currentPrice - formData.avgPrice) / formData.avgPrice) * 100).toFixed(2)}%`
                    : '0.00%'
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="btn btn-primary relative"
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <div className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
              <Save className="h-4 w-4" />
              {editingPosition ? 'Update Position' : 'Add Position'}
            </div>
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default StockModal