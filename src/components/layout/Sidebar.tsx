import React, { useRef } from 'react'
import { Download, Upload, FileText, FileSpreadsheet, BarChart3, Target, Shuffle } from 'lucide-react'
import { usePortfolioStore } from '../../stores/portfolioStore'
import Button from '../ui/Button'

const Sidebar: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const { exportToJson, exportToCsv, loadFromJson, importFromCsv, ui } = usePortfolioStore()

  const handleJsonExport = () => {
    const data = exportToJson()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCsvExport = () => {
    const csvData = exportToCsv()
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleJsonImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        loadFromJson(data)
        alert('Portfolio data imported successfully!')
      } catch (error) {
        alert('Error importing JSON file. Please check the file format.')
      }
    }
    reader.readAsText(file)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCsvImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvData = e.target?.result as string
        importFromCsv(csvData)
        alert('CSV data imported successfully!')
      } catch (error) {
        alert('Error importing CSV file. Please check the file format.')
      }
    }
    reader.readAsText(file)
    
    if (csvInputRef.current) {
      csvInputRef.current.value = ''
    }
  }

  const menuItems = [
    { icon: BarChart3, label: '보유 현황', href: '/holdings' },
    { icon: Target, label: '포트폴리오 관리', href: '/portfolio' },
    { icon: Shuffle, label: '리밸런싱', href: '/rebalancing' }
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              데이터 관리
            </h3>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleJsonExport}
                  disabled={ui.isLoading}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCsvExport}
                  disabled={ui.isLoading}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={ui.isLoading}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => csvInputRef.current?.click()}
                  disabled={ui.isLoading}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  CSV
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              도움말
            </h3>
            <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <FileText className="h-3 w-3 mr-1" />
                JSON: 완전한 데이터 백업
              </div>
              <div className="flex items-center">
                <FileSpreadsheet className="h-3 w-3 mr-1" />
                CSV: 스프레드시트 분석용
              </div>
            </div>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleJsonImport}
        className="hidden"
      />
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv"
        onChange={handleCsvImport}
        className="hidden"
      />
    </aside>
  )
}

export default Sidebar