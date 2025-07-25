import React from 'react'
import { Plus } from 'lucide-react'
import { usePortfolioStore } from '../stores/portfolioStore'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'

const Holdings: React.FC = () => {
  const { getCurrentHoldings, getTotalValue } = usePortfolioStore()

  const holdings = getCurrentHoldings()
  const totalValue = getTotalValue()

  return (
    <div className="space-y-6 animate-fade-in-scale">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            보유 현황
          </h1>
          <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
            현재 보유 중인 주식 현황을 관리하세요
          </p>
        </div>
        <Button className="flex items-center space-x-2" icon={<Plus className="h-4 w-4" />}>
          <span>주식 추가</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>보유 종목 수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold counter-up" style={{ color: 'var(--primary)' }}>
              {holdings.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>총 평가액</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold counter-up text-success">
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
                minimumFractionDigits: 0,
              }).format(totalValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>총 손익</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold counter-up gain-neutral">-</p>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-slide-in-bottom">
        <CardHeader>
          <CardTitle>보유 주식 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center">
                <Plus className="h-8 w-8" style={{ color: 'var(--primary)' }} />
              </div>
              <p className="text-lg mb-6" style={{ color: 'var(--muted-foreground)' }}>
                보유 중인 주식이 없습니다
              </p>
              <Button icon={<Plus className="h-4 w-4" />}>첫 번째 주식 추가하기</Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">주식 테이블 컴포넌트 개발 예정</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Holdings
