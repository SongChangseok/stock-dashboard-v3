import React from 'react'
import { Target, Settings } from 'lucide-react'
import { usePortfolioStore } from '../stores/portfolioStore'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'

const Portfolio: React.FC = () => {
  const { targets, getCurrentWeights } = usePortfolioStore()

  const currentWeights = getCurrentWeights()

  return (
    <div className="space-y-6 animate-fade-in-scale">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            포트폴리오 관리
          </h1>
          <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
            목표 포트폴리오 비중을 설정하고 관리하세요
          </p>
        </div>
        <Button className="flex items-center space-x-2" icon={<Settings className="h-4 w-4" />}>
          <span>목표 비중 설정</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>목표 비중</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {targets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  목표 비중이 설정되지 않았습니다
                </p>
                <Button size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  목표 비중 설정하기
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {targets.map(target => (
                  <div key={target.symbol} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{target.symbol}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {target.targetWeight}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>현재 비중</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(currentWeights).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">보유 주식이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(currentWeights).map(([symbol, weight]) => (
                  <div key={symbol} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{symbol}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {weight.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>비중 비교 차트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">비교 차트 컴포넌트 개발 예정</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Portfolio
