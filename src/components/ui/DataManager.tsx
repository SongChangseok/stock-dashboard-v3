import React, { useRef, useState } from 'react'
import { Upload, Download, Database, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import Button from './Button'
import { usePortfolioStore } from '../../stores/portfolioStore'
import { 
  validateJsonFile, 
  validateCsvFile, 
  validateDataForExport, 
  downloadAsFile,
  getErrorMessage
} from '../../utils/dataTransform'

interface DataManagerProps {
  className?: string
}

const DataManager: React.FC<DataManagerProps> = ({ className = '' }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const jsonInputRef = useRef<HTMLInputElement>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)

  const {
    exportToJson,
    exportToCsv,
    loadFromJson,
    importFromCsv,
    setError,
    ui: { error },
  } = usePortfolioStore()

  // JSON 파일 다운로드
  const handleJsonDownload = () => {
    try {
      const data = exportToJson()
      
      // 데이터 검증 및 경고 표시
      const validation = validateDataForExport(data)
      if (validation.warnings.length > 0) {
        setUploadStatus({
          type: 'success',
          message: `Data exported with warnings: ${validation.warnings.join(', ')}`
        })
      }
      
      const jsonString = JSON.stringify(data, null, 2)
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `portfolio-backup-${timestamp}.json`
      
      downloadAsFile(jsonString, filename, 'application/json')
      
      if (validation.warnings.length === 0) {
        setUploadStatus({
          type: 'success',
          message: 'Portfolio data exported to JSON successfully.'
        })
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to export JSON')
      setUploadStatus({ type: 'error', message })
    }
  }

  // CSV 파일 다운로드
  const handleCsvDownload = () => {
    try {
      const data = exportToJson()
      
      // 데이터 검증 및 경고 표시
      const validation = validateDataForExport(data)
      if (validation.warnings.length > 0) {
        setUploadStatus({
          type: 'success',
          message: `Data exported with warnings: ${validation.warnings.join(', ')}`
        })
      }
      
      const csvData = exportToCsv()
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `portfolio-data-${timestamp}.csv`
      
      downloadAsFile(csvData, filename, 'text/csv')
      
      if (validation.warnings.length === 0) {
        setUploadStatus({
          type: 'success',
          message: 'Portfolio data exported to CSV successfully.'
        })
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to export CSV')
      setUploadStatus({ type: 'error', message })
    }
  }

  // JSON 파일 업로드
  const handleJsonUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setUploadStatus({ type: null, message: '' })

    try {
      // 파일 검증
      const validation = await validateJsonFile(file)
      if (!validation.isValid) {
        setUploadStatus({ type: 'error', message: validation.error || 'Invalid file' })
        setError(validation.error || 'Invalid file')
        return
      }

      // 데이터 로드
      if (validation.data) {
        loadFromJson(validation.data)
        setUploadStatus({
          type: 'success',
          message: 'Portfolio data imported from JSON successfully.'
        })
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to import JSON file')
      setUploadStatus({ type: 'error', message })
      setError(message)
    } finally {
      setIsProcessing(false)
      if (jsonInputRef.current) {
        jsonInputRef.current.value = ''
      }
    }
  }

  // CSV 파일 업로드
  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setUploadStatus({ type: null, message: '' })

    try {
      // 파일 검증
      const validation = await validateCsvFile(file)
      if (!validation.isValid) {
        setUploadStatus({ type: 'error', message: validation.error || 'Invalid file' })
        return
      }

      // 데이터 가져오기
      if (validation.data) {
        await importFromCsv(validation.data)
        setUploadStatus({
          type: 'success',
          message: 'Portfolio data imported from CSV successfully.'
        })
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to import CSV file')
      setUploadStatus({ type: 'error', message })
    } finally {
      setIsProcessing(false)
      if (csvInputRef.current) {
        csvInputRef.current.value = ''
      }
    }
  }

  const triggerJsonUpload = () => jsonInputRef.current?.click()
  const triggerCsvUpload = () => csvInputRef.current?.click()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Messages */}
        {(uploadStatus.message || error) && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              uploadStatus.type === 'success' || (!uploadStatus.message && !error)
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">
              {uploadStatus.message || error}
            </span>
          </div>
        )}

        {/* JSON Data Management */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Complete Portfolio Backup (JSON)
          </h3>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Export or import your complete portfolio history, target allocations, and settings.
          </p>
          
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex items-center gap-2"
              onClick={handleJsonDownload}
              disabled={isProcessing}
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={triggerJsonUpload}
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4" />
              Import JSON
            </Button>
          </div>

          <input
            ref={jsonInputRef}
            type="file"
            accept=".json"
            onChange={handleJsonUpload}
            className="hidden"
          />
        </div>

        {/* CSV Data Management */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Portfolio Data Export/Import (CSV)
          </h3>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Export portfolio data as spreadsheet format for analysis in Excel or other tools.
          </p>
          
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex items-center gap-2"
              onClick={handleCsvDownload}
              disabled={isProcessing}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={triggerCsvUpload}
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
          </div>

          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
          />
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Processing file...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DataManager