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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">보유 현황</h1>
          <p className="text-gray-600 dark:text-gray-400">현재 보유 중인 주식 현황을 관리하세요</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>주식 추가</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>보유 종목 수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{holdings.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>총 평가액</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
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
            <p className="text-3xl font-bold text-red-600">-</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>보유 주식 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">보유 중인 주식이 없습니다</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                첫 번째 주식 추가하기
              </Button>
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