import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image, Input, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Network } from '@/network'
import { ArrowLeft, Package, X, ShoppingCart, Activity, Plus, TrendingDown, Pencil } from 'lucide-react-taro'

interface InsectDetail {
  id: string
  name: string
  species: string
  price: number
  description: string
  image_url: string
  created_at: string
  updated_at: string
}

interface InventoryLog {
  id: string
  insect_id: string
  operation_type: string
  quantity: number
  location: string
  price: number | null
  remark: string | null
  image_url: string | null
  operator: string | null
  created_at: string
}

export default function InsectDetailPage() {
  const router = useRouter()
  const insectId = router.params.id

  const [loading, setLoading] = useState(true)
  const [insect, setInsect] = useState<InsectDetail | null>(null)
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [filterType, setFilterType] = useState('全部')

  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [newPrice, setNewPrice] = useState('')

  useEffect(() => {
    if (insectId) {
      fetchInsectDetail()
    } else {
      Taro.showToast({
        title: '昆虫ID无效',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }
  }, [insectId])

  const fetchInsectDetail = async () => {
    try {
      setLoading(true)

      // 并行获取昆虫详情和操作记录
      const [insectRes, logsRes] = await Promise.all([
        Network.request({
          url: `/api/inventory/insects/${insectId}`
        }),
        Network.request({
          url: '/api/inventory/logs',
          data: { insectId }
        })
      ])

      if (insectRes.statusCode === 200 && insectRes.data?.code === 200) {
        setInsect(insectRes.data.data)
      }

      if (logsRes.statusCode === 200 && logsRes.data?.code === 200) {
        setLogs(logsRes.data.data || [])
      }
    } catch (error) {
      console.error('获取详情失败:', error)
      Taro.showToast({
        title: '获取详情失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  // 操作类型配置
  const operationConfig: Record<string, { icon: any; label: string; color: string; bgColor: string }> = {
    '添加': { icon: Plus, label: '添加', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    '进货': { icon: Plus, label: '进货', color: 'text-green-600', bgColor: 'bg-green-50' },
    '销售': { icon: ShoppingCart, label: '销售', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    '死亡': { icon: TrendingDown, label: '死亡', color: 'text-red-600', bgColor: 'bg-red-50' },
    '串货': { icon: Activity, label: '串货', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  }

  // 过滤操作记录
  const filteredLogs = filterType === '全部'
    ? logs
    : logs.filter(log => log.operation_type === filterType)

  // 格式化相对时间
  const formatRelativeTime = (time: string) => {
    const date = new Date(time)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  }

  // 格式化完整日期时间
  const formatDateTime = (time: string) => {
    const date = new Date(time)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  // 查看图片预览
  const handlePreviewImage = (imageUrl: string) => {
    Taro.previewImage({
      current: imageUrl,
      urls: [imageUrl]
    })
  }

  // 修改价格
  const handleUpdatePrice = async () => {
    if (!newPrice || parseFloat(newPrice) <= 0) {
      Taro.showToast({
        title: '请输入有效的价格',
        icon: 'none'
      })
      return
    }

    try {
      const price = parseFloat(newPrice)
      const res = await Network.request({
        url: `/api/inventory/insects/${insectId}`,
        method: 'PUT',
        data: { price }
      })

      console.log('修改价格响应:', res.data)

      if (res.statusCode === 200 && res.data?.code === 200) {
        Taro.showToast({
          title: '价格修改成功',
          icon: 'success'
        })
        setIsEditingPrice(false)
        // 重新获取昆虫详情
        await fetchInsectDetail()
      } else {
        Taro.showToast({
          title: res.data?.msg || '修改失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('修改价格失败:', error)
      Taro.showToast({
        title: '修改失败，请重试',
        icon: 'none'
      })
    }
  }

  if (loading) {
    return (
      <View className="flex items-center justify-center h-screen bg-gray-50">
        <Text className="block text-gray-500">加载中...</Text>
      </View>
    )
  }

  if (!insect) {
    return (
      <View className="flex items-center justify-center h-screen bg-gray-50">
        <View className="text-center">
          <X size={48} color="#9ca3af" />
          <Text className="block text-gray-500 mt-4">昆虫信息不存在</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView scrollY className="h-screen bg-gray-50">
      {/* 返回按钮 */}
      <View
        className="fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center"
        onClick={handleBack}
        style={{ marginTop: '44px' }}
      >
        <ArrowLeft size={20} color="#333" />
      </View>

      {/* 昆虫图片 */}
      {insect.image_url ? (
        <Image
          src={insect.image_url}
          className="w-full h-80 bg-gray-200"
          mode="aspectFill"
          lazyLoad
          showMenuByLongpress={false}
        />
      ) : (
        <View className="w-full h-80 bg-gray-200 flex items-center justify-center">
          <Package size={64} color="#9ca3af" />
        </View>
      )}

      {/* 基本信息 */}
      <View className="bg-white mx-4 mt-[-40px] rounded-2xl shadow-lg p-5 relative z-10">
        <View className="flex justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="block text-2xl font-bold text-gray-900 mb-1">{insect.name}</Text>
            <Text className="block text-sm text-gray-500">{insect.species}</Text>
          </View>
          <View className="bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-2">
            <Text className="block text-lg font-bold text-blue-600">¥{insect.price}</Text>
            <View
              className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
              onClick={() => {
                setIsEditingPrice(true)
                setNewPrice(insect.price.toString())
              }}
            >
              <Pencil size={16} color="#2563eb" />
            </View>
          </View>
        </View>

        {insect.description && (
          <View className="mt-4 pt-4 border-t border-gray-100">
            <Text className="block text-sm text-gray-500 mb-2">描述</Text>
            <Text className="block text-base text-gray-700 leading-relaxed">{insect.description}</Text>
          </View>
        )}
      </View>

      {/* 操作记录 */}
      <View className="mx-4 mt-4 mb-8">
        <View className="flex justify-between items-center mb-3">
          <Text className="block text-lg font-semibold text-gray-900">操作记录</Text>
          <Text className="block text-sm text-gray-500">
            共 {filteredLogs.length} 条
          </Text>
        </View>

        {/* 筛选按钮 */}
        <View className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['全部', '添加', '进货', '销售', '死亡', '串货'].map((type) => (
            <View
              key={type}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filterType === type
                  ? operationConfig[type]?.bgColor + ' ' + operationConfig[type]?.color
                  : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setFilterType(type)}
            >
              {type}
            </View>
          ))}
        </View>

        {/* 操作记录列表 */}
        {filteredLogs.length === 0 ? (
          <View className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Package size={48} color="#d1d5db" />
            <Text className="block text-gray-400 mt-3">暂无操作记录</Text>
          </View>
        ) : (
          <View className="space-y-3">
            {filteredLogs.map((log) => {
              const config = operationConfig[log.operation_type] || operationConfig['进货']
              const Icon = config.icon

              return (
                <View
                  key={log.id}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <View className="flex items-start justify-between">
                    <View className="flex items-start flex-1">
                      {/* 操作图标 */}
                      <View className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center mr-3 flex-shrink-0`}>
                        <Icon size={20} color={config.color.replace('text-', '')} />
                      </View>

                      {/* 操作信息 */}
                      <View className="flex-1">
                        <View className="flex items-center mb-1">
                          <Text className={`block text-base font-semibold ${config.color} mr-2`}>
                            {log.operation_type}
                          </Text>
                          <Text className={`block text-lg font-bold ${config.color}`}>
                            {log.operation_type === '销售' || log.operation_type === '死亡' ? '-' : '+'}
                            {log.quantity}
                          </Text>
                          <Text className="block text-sm text-gray-500 ml-1">只</Text>
                        </View>

                        {/* 价格（销售时显示） */}
                        {log.price && log.operation_type === '销售' && (
                          <Text className="block text-sm text-gray-600 mb-1">
                            实收：¥{log.price}
                          </Text>
                        )}

                        {/* 操作详情 */}
                        <View className="mt-2 space-y-1">
                          {/* 位置 */}
                          <Text className="block text-xs text-gray-500">
                            📍 位置：{log.location}
                          </Text>

                          {/* 操作员 */}
                          <Text className="block text-xs text-gray-500">
                            👤 操作员：{log.operator || '未知用户'}
                          </Text>

                          {/* 时间 */}
                          <Text className="block text-xs text-gray-500">
                            🕐 {formatRelativeTime(log.created_at)} {formatDateTime(log.created_at)}
                          </Text>
                        </View>

                        {/* 备注（添加、串货时显示） */}
                        {log.remark && (log.operation_type === '串货' || log.operation_type === '添加') && (
                          <View className="mt-2 p-2 bg-gray-50 rounded-lg">
                            <Text className="block text-xs text-gray-600">
                              💬 {log.remark}
                            </Text>
                          </View>
                        )}

                        {/* 销售或死亡照片 */}
                        {log.image_url && (log.operation_type === '死亡' || log.operation_type === '销售') && (
                          <View className="mt-3">
                            <Text className="block text-sm text-gray-500 mb-2">
                              {log.operation_type === '死亡' ? '死亡照片' : '销售照片'}：
                            </Text>
                            <Image
                              src={log.image_url}
                              className="w-full h-48 rounded-lg bg-gray-100"
                              mode="aspectFill"
                              lazyLoad
                              onClick={() => handlePreviewImage(log.image_url!)}
                              showMenuByLongpress={false}
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </View>

      {/* 修改价格弹窗 */}
      {isEditingPrice && (
        <View className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <View className="bg-white rounded-2xl w-full max-w-sm p-6">
            <View className="flex justify-between items-center mb-6">
              <Text className="text-lg font-bold text-gray-900">修改价格</Text>
              <View onClick={() => setIsEditingPrice(false)}>
                <X size={24} color="#6b7280" />
              </View>
            </View>

            <View className="mb-6">
              <Text className="block text-sm text-gray-500 mb-2">当前价格</Text>
              <Text className="block text-2xl font-bold text-gray-900">¥{insect?.price}</Text>
            </View>

            <View className="mb-6">
              <Text className="block text-sm text-gray-500 mb-2">新价格</Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent"
                  type="digit"
                  value={newPrice}
                  onInput={(e) => setNewPrice(e.detail.value)}
                  placeholder="请输入新价格"
                />
              </View>
            </View>

            <View className="flex gap-3">
              <View className="flex-1">
                <Button
                  className="w-full bg-gray-100 text-gray-600 rounded-xl"
                  onClick={() => setIsEditingPrice(false)}
                >
                  取消
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  className="w-full bg-blue-500 text-white rounded-xl"
                  onClick={handleUpdatePrice}
                >
                  确认
                </Button>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 底部间距 */}
      <View className="h-8" />
    </ScrollView>
  )
}
