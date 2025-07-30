import React, { useState, useEffect } from 'react'
import { Save, X, Target } from 'lucide-react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import LoadingSpinner from '../ui/LoadingSpinner'
import type { TargetAllocation, TargetAllocationFormData } from '../../types/portfolio'

interface TargetAllocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: TargetAllocationFormData) => void
  editingTarget?: TargetAllocation | null
  existingTargets?: TargetAllocation[]
  isLoading?: boolean
}

const TargetAllocationModal: React.FC<TargetAllocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTarget,
  existingTargets = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<TargetAllocationFormData>({
    symbol: '',
    name: '',
    targetWeight: 0,
    tag: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof TargetAllocationFormData, string>>>({})

  useEffect(() => {
    if (editingTarget) {
      setFormData({
        symbol: editingTarget.symbol || '',
        name: editingTarget.name,
        targetWeight: editingTarget.targetWeight,
        tag: editingTarget.tag,
      })
    } else {
      setFormData({
        symbol: '',
        name: '',
        targetWeight: 0,
        tag: '',
      })
    }
    setErrors({})
  }, [editingTarget, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TargetAllocationFormData, string>> = {}

    // Symbol은 optional, 있다면 유효성 검사  
    if (formData.symbol && formData.symbol.trim()) {
      if (!/^[A-Z0-9]{1,10}$/.test(formData.symbol.toUpperCase())) {
        newErrors.symbol = 'Symbol must be 1-10 alphanumeric characters'
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Company name must be at least 2 characters'
    } else if (!editingTarget && existingTargets.some(target => target.name === formData.name.trim())) {
      newErrors.name = 'Company name already exists in target allocation'
    }

    if (formData.targetWeight <= 0) {
      newErrors.targetWeight = 'Target weight must be greater than 0'
    } else if (formData.targetWeight > 100) {
      newErrors.targetWeight = 'Target weight cannot exceed 100%'
    }

    // Check if total would exceed 100%
    const otherTargetsWeight = existingTargets
      .filter(target => !editingTarget || target.name !== editingTarget.name)
      .reduce((sum, target) => sum + target.targetWeight, 0)
    
    if (otherTargetsWeight + formData.targetWeight > 100) {
      newErrors.targetWeight = `Total allocation would exceed 100% (currently ${otherTargetsWeight.toFixed(1)}%)`
    }

    if (!formData.tag.trim()) {
      newErrors.tag = 'Tag is required'
    } else if (formData.tag.trim().length < 2) {
      newErrors.tag = 'Tag must be at least 2 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const submissionData = {
        ...formData,
        symbol: formData.symbol ? formData.symbol.toUpperCase() : undefined,
        name: formData.name.trim(),
        tag: formData.tag.trim(),
      }
      onSave(submissionData)
    }
  }

  const handleInputChange = (field: keyof TargetAllocationFormData, value: string | number) => {
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
    formData.name.trim() && formData.targetWeight > 0 && formData.tag

  // Calculate remaining allocation
  const otherTargetsWeight = existingTargets
    .filter(target => !editingTarget || target.name !== editingTarget.name)
    .reduce((sum, target) => sum + target.targetWeight, 0)
  const remainingWeight = 100 - otherTargetsWeight

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingTarget ? 'Edit Target Allocation' : 'Add Target Allocation'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Position Symbol (Optional)"
            placeholder="e.g., AAPL, 005930"
            value={formData.symbol || ''}
            onChange={e => handleInputChange('symbol', e.target.value)}
            error={errors.symbol}
            disabled={isLoading || !!editingTarget}
            className="uppercase"
            helpText="Optional for Korean stocks"
          />

          <Input
            label="Company Name *"
            placeholder="e.g., Apple Inc., 삼성전자"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            error={errors.name}
            required
            disabled={isLoading || !!editingTarget}
          />
        </div>
        
        <div>
          <Input
            label="Tag"
            placeholder="e.g., Tech, Finance"
            value={formData.tag}
            onChange={e => handleInputChange('tag', e.target.value)}
            error={errors.tag}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Input
            label="Target Weight (%)"
            type="number"
            placeholder="0.0"
            value={formData.targetWeight || ''}
            onChange={e => handleInputChange('targetWeight', Number(e.target.value))}
            error={errors.targetWeight}
            required
            disabled={isLoading}
            min="0.1"
            max="100"
            step="0.1"
          />
          <div className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Remaining allocation: {remainingWeight.toFixed(1)}%
          </div>
        </div>

        {/* Preview */}
        {formData.targetWeight > 0 && (
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <h4 className="text-sm font-semibold mb-2 opacity-70 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Preview
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="opacity-70">Symbol: </span>
                <span className="font-medium uppercase">{formData.symbol || 'N/A'}</span>
              </div>
              <div>
                <span className="opacity-70">Name: </span>
                <span className="font-medium">{formData.name || 'N/A'}</span>
              </div>
              <div>
                <span className="opacity-70">Tag: </span>
                <span className="font-medium">{formData.tag || 'N/A'}</span>
              </div>
              <div>
                <span className="opacity-70">Target Weight: </span>
                <span className="font-medium">{formData.targetWeight.toFixed(1)}%</span>
              </div>
              <div className="col-span-2">
                <span className="opacity-70">After Total: </span>
                <span 
                  className="font-medium"
                  style={{ 
                    color: (otherTargetsWeight + formData.targetWeight) > 100 
                      ? 'var(--error)' 
                      : 'var(--foreground)' 
                  }}
                >
                  {(otherTargetsWeight + formData.targetWeight).toFixed(1)}%
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
                <LoadingSpinner />
              </div>
            )}
            <div className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
              <Save className="h-4 w-4" />
              {editingTarget ? 'Update Allocation' : 'Add Allocation'}
            </div>
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default TargetAllocationModal