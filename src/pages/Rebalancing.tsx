import React from 'react'
import { Shuffle, AlertTriangle } from 'lucide-react'
import { usePortfolioStore } from '../stores/portfolioStore'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'

const Rebalancing: React.FC = () => {
  const { getRebalancingSuggestions } = usePortfolioStore()
  
  const suggestions = getRebalancingSuggestions()
  const needsRebalancing = suggestions.length > 0

  return (
    <div className="space-y-6 animate-fade-in-scale">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            리밸런싱 관리
          </h1>
          <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
            포트폴리오 리밸런싱 제안을 확인하세요
          </p>
        </div>
        <Button className="flex items-center space-x-2 micro-float" icon={<Shuffle className="h-4 w-4" />}>
          <span>리밸런싱 시뮬레이션</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className={`h-5 w-5 ${needsRebalancing ? 'text-orange-500' : 'text-green-500'}`} />
              <span>리밸런싱 상태</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className={`text-2xl font-bold mb-2 ${needsRebalancing ? 'text-orange-600' : 'text-green-600'}`}>
                {needsRebalancing ? '조정 필요' : '균형 상태'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {needsRebalancing 
                  ? `${suggestions.length}개 종목이 5% 이상 벗어남`
                  : '모든 종목이 목표 비중 내에 있습니다'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>임계값 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 mb-2">5%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                현재 고정 임계값으로 설정됨
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>리밸런싱 제안</CardTitle>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                현재 리밸런싱이 필요한 종목이 없습니다
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                모든 종목이 목표 비중의 ±5% 범위 내에 있습니다
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">리밸런싱 제안 테이블 개발 예정</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Rebalancing