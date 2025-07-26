import React, { useRef, useState } from 'react'
import { Upload, Download, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import Button from './Button'
import { usePortfolioStore } from '../../stores/portfolioStore'

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

  const {
    exportToJson,
    loadFromJson,
    ui: { error },
  } = usePortfolioStore()

  // JSON 파일 다운로드
  const handleJsonDownload = () => {
    try {
      const data = exportToJson()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `portfolio-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setUploadStatus({
        type: 'success',
        message: 'Portfolio data exported successfully!'
      })
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to export portfolio data'
      })
    }
  }

  // JSON 파일 업로드
  const handleJsonUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setUploadStatus({ type: null, message: '' })

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      loadFromJson(data)
      
      setUploadStatus({
        type: 'success',
        message: 'Portfolio data imported successfully!'
      })
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to import portfolio data. Please check the file format.'
      })
    } finally {
      setIsProcessing(false)
      if (jsonInputRef.current) {
        jsonInputRef.current.value = ''
      }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 내보내기 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Export your portfolio data as a JSON file for backup or sharing.
            </p>
            <Button onClick={handleJsonDownload} className="w-full">
              <Download className="h-4 w-4" />
              Download JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 가져오기 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Import portfolio data from a previously exported JSON file.
            </p>
            <div>
              <input
                ref={jsonInputRef}
                type="file"
                accept=".json"
                onChange={handleJsonUpload}
                disabled={isProcessing}
                className="hidden"
              />
              <Button
                onClick={() => jsonInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full"
              >
                <Upload className="h-4 w-4" />
                {isProcessing ? 'Importing...' : 'Import JSON'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상태 메시지 */}
      {uploadStatus.type && (
        <Card>
          <CardContent className="pt-6">
            <div className={`flex items-start gap-3 ${
              uploadStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{uploadStatus.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 에러 메시지 */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-red-600">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DataManager