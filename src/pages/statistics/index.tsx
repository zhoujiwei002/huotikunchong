import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import { Activity, TrendingUp, Download, FileText, ArrowLeft } from 'lucide-react-taro'
import './index.css'

interface Insect {
  id: string
  name: string
  species: string | null
  price: number
  description: string | null
  image_url: string | null
}

interface InventoryItem {
  id: string
  insect_id: string
  quantity: number
  location: string
  insects: Insect
}

interface InventoryLog {
  id: string
  insect_id: string
  operation_type: string
  quantity: number
  location: string
  remark: string | null
  price: number | null
  created_at: string
  insects: Insect
}

const LOCATIONS = ['全部', '公司总部', '王东团队', '袁兴彪团队', '郭秀华团队', '王希强团队', '王成兵团队', '周纪良团队', '秦文胜团队', '刘君团队']

interface ExpandedLocation {
  [key: string]: boolean
}

const StatisticsPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [activeTab, setActiveTab] = useState<'summary' | 'logs' | 'sales'>('summary')
  const [selectedLocation, setSelectedLocation] = useState('全部')
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedLocations, setExpandedLocations] = useState<ExpandedLocation>({})

  // 加载数据
  const loadData = async () => {
    try {
      setRefreshing(true)
      const [inventoryRes, logsRes] = await Promise.all([
        Network.request({ url: '/api/inventory' }),
        Network.request({ url: '/api/inventory/logs' }),
      ])

      if (inventoryRes.data?.code === 200 && inventoryRes.data.data) {
        setInventory(inventoryRes.data.data)
      }
      if (logsRes.data?.code === 200 && logsRes.data.data) {
        setLogs(logsRes.data.data)
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // 切换标签页时自动刷新数据
  const handleTabChange = (tab: 'summary' | 'logs' | 'sales') => {
    setActiveTab(tab)
    loadData() // 切换标签时刷新数据，确保前后端同步
  }

  // 根据选择的位置筛选数据
  const getFilteredData = () => {
    if (selectedLocation === '全部') {
      return { filteredInventory: inventory, filteredLogs: logs }
    }

    const filteredInventory = inventory.filter(item => item.location === selectedLocation)
    const filteredLogs = logs.filter(log => log.location === selectedLocation)

    return { filteredInventory, filteredLogs }
  }

  // 统计数据
  const getStats = () => {
    const { filteredInventory, filteredLogs } = getFilteredData()

    const totalInventory = filteredInventory.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = filteredInventory.reduce((sum, item) => sum + (item.quantity * item.insects.price), 0)

    const salesLogs = filteredLogs.filter(log => log.operation_type === '销售')
    const salesCount = salesLogs.length
    const salesQuantity = salesLogs.reduce((sum, log) => sum + log.quantity, 0)
    const totalSalesRevenue = salesLogs.reduce((sum, log) => sum + (log.price || 0), 0)
    const averageSalesPrice = salesQuantity > 0 ? Math.round(totalSalesRevenue / salesQuantity) : 0

    // 按昆虫统计销售收入
    const insectSalesRevenue: Record<string, {
      insectName: string
      totalRevenue: number
      totalQuantity: number
      averagePrice: number
    }> = {}
    salesLogs.forEach(log => {
      const insectName = log.insects.name
      const revenue = log.price || 0
      if (!insectSalesRevenue[insectName]) {
        insectSalesRevenue[insectName] = {
          insectName,
          totalRevenue: 0,
          totalQuantity: 0,
          averagePrice: 0,
        }
      }
      insectSalesRevenue[insectName].totalRevenue += revenue
      insectSalesRevenue[insectName].totalQuantity += log.quantity
    })

    // 计算各昆虫平均销售价格
    Object.keys(insectSalesRevenue).forEach(insectName => {
      const data = insectSalesRevenue[insectName]
      data.averagePrice = data.totalQuantity > 0 ? Math.round(data.totalRevenue / data.totalQuantity) : 0
    })

    // 按销售额排序
    const sortedInsectSales = Object.values(insectSalesRevenue).sort((a, b) => b.totalRevenue - a.totalRevenue)

    // 按门店统计库存数量
    const locationInventory: Record<string, number> = {}
    // 按门店统计库存明细
    const locationInventoryDetails: Record<string, Array<{
      insectName: string
      insectSpecies: string | null
      quantity: number
      price: number
      totalValue: number
    }>> = {}

    filteredInventory.forEach(item => {
      const location = item.location
      locationInventory[location] = (locationInventory[location] || 0) + item.quantity

      // 构建库存明细
      if (!locationInventoryDetails[location]) {
        locationInventoryDetails[location] = []
      }
      locationInventoryDetails[location].push({
        insectName: item.insects.name,
        insectSpecies: item.insects.species,
        quantity: item.quantity,
        price: item.insects.price,
        totalValue: item.quantity * item.insects.price,
      })
    })

    // 按库存数量排序
    const sortedLocationInventory = Object.entries(locationInventory)
      .map(([location, quantity]) => ({ location, quantity }))
      .sort((a, b) => b.quantity - a.quantity)

    // 按库存数量排序明细
    const sortedLocationInventoryDetails = Object.entries(locationInventoryDetails)
      .map(([location, details]) => ({
        location,
        details: details.sort((a, b) => b.quantity - a.quantity),
      }))
      .sort((a, b) => {
        const totalA = a.details.reduce((sum, d) => sum + d.quantity, 0)
        const totalB = b.details.reduce((sum, d) => sum + d.quantity, 0)
        return totalB - totalA
      })

    // 按门店统计销售收入
    const locationSalesRevenue: Record<string, {
      location: string
      totalRevenue: number
      totalQuantity: number
      averagePrice: number
    }> = {}
    salesLogs.forEach(log => {
      const location = log.location
      const revenue = log.price || 0
      if (!locationSalesRevenue[location]) {
        locationSalesRevenue[location] = {
          location,
          totalRevenue: 0,
          totalQuantity: 0,
          averagePrice: 0,
        }
      }
      locationSalesRevenue[location].totalRevenue += revenue
      locationSalesRevenue[location].totalQuantity += log.quantity
    })

    // 计算各门店平均销售价格
    Object.keys(locationSalesRevenue).forEach(location => {
      const data = locationSalesRevenue[location]
      data.averagePrice = data.totalQuantity > 0 ? Math.round(data.totalRevenue / data.totalQuantity) : 0
    })

    // 按销售额排序
    const sortedLocationSales = Object.values(locationSalesRevenue).sort((a, b) => b.totalRevenue - a.totalRevenue)

    // 按门店统计死亡数量
    const deathLogs = filteredLogs.filter(log => log.operation_type === '死亡')
    const locationDeathCount: Record<string, {
      location: string
      totalQuantity: number
      deathCount: number
    }> = {}
    deathLogs.forEach(log => {
      const location = log.location
      if (!locationDeathCount[location]) {
        locationDeathCount[location] = {
          location,
          totalQuantity: 0,
          deathCount: 0,
        }
      }
      locationDeathCount[location].totalQuantity += log.quantity
      locationDeathCount[location].deathCount += 1
    })

    // 按死亡数量排序
    const sortedLocationDeath = Object.values(locationDeathCount).sort((a, b) => b.totalQuantity - a.totalQuantity)

    const purchaseCount = filteredLogs.filter(log => log.operation_type === '进货').length
    const deathCount = deathLogs.length

    return {
      totalInventory,
      totalValue,
      salesCount,
      salesQuantity,
      totalSalesRevenue,
      averageSalesPrice,
      sortedInsectSales,
      purchaseCount,
      deathCount,
      filteredInventory,
      sortedLocationInventory,
      sortedLocationInventoryDetails,
      sortedLocationSales,
      sortedLocationDeath,
      filteredLogs,
    }
  }

  // 导出报表
  const handleExport = () => {
    const stats = getStats()
    const csvContent = [
      ['昆虫名称', '物种', '库存数量', '位置', '单价', '总价'].join(','),
      ...inventory.map(item =>
        [
          item.insects.name,
          item.insects.species || '',
          item.quantity,
          item.location,
          item.insects.price,
          item.quantity * item.insects.price
        ].join(',')
      ),
      '',
      ['库存汇总', '', '', '', '', ''].join(','),
      ['总库存', stats.totalInventory, '', '', '', ''].join(','),
      ['总价值', `¥${stats.totalValue}`, '', '', '', ''].join(','),
      '',
      ['销售汇总', '', '', '', '', ''].join(','),
      ['销售金额', `¥${stats.totalSalesRevenue}`, '', '', '', ''].join(','),
      ['销售次数', stats.salesCount, '', '', '', ''].join(','),
      ['销售数量', `${stats.salesQuantity} 只`, '', '', '', ''].join(','),
      ['平均销售价格', `¥${stats.averageSalesPrice}`, '', '', '', ''].join(','),
    ].join('\n')

    Taro.setClipboardData({
      data: csvContent,
      success: () => {
        Taro.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
        })
      },
    })
  }

  // 导出销售报表
  const handleExportSalesReport = () => {
    const stats = getStats()
    const csvContent = [
      ['排名', '昆虫名称', '销售收入', '销售数量', '平均价格'].join(','),
      ...stats.sortedInsectSales.map((item, index) =>
        [
          index + 1,
          item.insectName,
          `¥${item.totalRevenue}`,
          `${item.totalQuantity} 只`,
          `¥${item.averagePrice}/只`
        ].join(',')
      ),
      '',
      ['汇总', '', '', '', ''].join(','),
      ['总销售额', `¥${stats.totalSalesRevenue}`, '', '', ''].join(','),
      ['销售次数', stats.salesCount, '', '', ''].join(','),
      ['销售数量', `${stats.salesQuantity} 只`, '', '', ''].join(','),
      ['平均销售价格', `¥${stats.averageSalesPrice}`, '', '', ''].join(','),
    ].join('\n')

    Taro.setClipboardData({
      data: csvContent,
      success: () => {
        Taro.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
        })
      },
    })
  }

  useLoad(() => {
    loadData()
  })

  const stats = getStats()

  return (
    <View className="flex flex-col h-full bg-gray-50">
      {/* 顶部标题栏 */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex items-center gap-3">
          <View onClick={() => Taro.navigateBack()}>
            <ArrowLeft size={24} color="#374151" />
          </View>
          <Text className="block text-xl font-bold text-gray-900">数据统计</Text>
        </View>
      </View>

      {/* 位置筛选器 */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex items-center gap-2">
          <Text className="block text-sm text-gray-600">门店筛选：</Text>
          <View
            className="flex-1 bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between"
            onClick={() => setShowLocationPicker(true)}
          >
            <Text className={`block text-sm ${selectedLocation === '全部' ? 'text-gray-700' : 'text-emerald-600 font-medium'}`}>
              {selectedLocation}
            </Text>
            <TrendingUp size={16} color="#9ca3af" />
          </View>
        </View>
      </View>

      {/* 标签切换 */}
      <View className="bg-white flex border-b border-gray-200">
        <View
          className={`flex-1 py-3 text-center ${activeTab === 'summary' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}
          onClick={() => handleTabChange('summary')}
        >
          <View className="flex items-center justify-center gap-1">
            <Activity size={18} />
            <Text className="block font-medium">库存统计</Text>
          </View>
        </View>
        <View
          className={`flex-1 py-3 text-center ${activeTab === 'sales' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}
          onClick={() => handleTabChange('sales')}
        >
          <View className="flex items-center justify-center gap-1">
            <TrendingUp size={18} />
            <Text className="block font-medium">销售统计</Text>
          </View>
        </View>
        <View
          className={`flex-1 py-3 text-center ${activeTab === 'logs' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}
          onClick={() => handleTabChange('logs')}
        >
          <View className="flex items-center justify-center gap-1">
            <FileText size={18} />
            <Text className="block font-medium">操作记录</Text>
          </View>
        </View>
      </View>

      {/* 刷新提示 */}
      {refreshing && (
        <View className="bg-emerald-50 px-4 py-2 flex items-center justify-center">
          <Text className="block text-sm text-emerald-600">数据同步中...</Text>
        </View>
      )}

      <ScrollView className="flex-1" scrollY>
        <View className="p-4">
          {activeTab === 'summary' ? (
            <>
              {/* 统计卡片 */}
              <View className="grid grid-cols-2 gap-3 mb-4">
                <View className="bg-white rounded-xl p-4 shadow-sm">
                  <Text className="block text-sm text-gray-500 mb-1">总库存</Text>
                  <Text className="block text-2xl font-bold text-emerald-600">
                    {stats.totalInventory}
                  </Text>
                  <Text className="block text-xs text-gray-400">只</Text>
                </View>
                <View className="bg-white rounded-xl p-4 shadow-sm">
                  <Text className="block text-sm text-gray-500 mb-1">总价值</Text>
                  <Text className="block text-2xl font-bold text-blue-600">
                    ¥{stats.totalValue}
                  </Text>
                  <Text className="block text-xs text-gray-400">元</Text>
                </View>
                <View className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-sm">
                  <Text className="block text-sm text-blue-100 mb-1">销售金额</Text>
                  <Text className="block text-2xl font-bold text-white">
                    ¥{stats.totalSalesRevenue}
                  </Text>
                  <Text className="block text-xs text-blue-200">累计收入</Text>
                </View>
                <View className="bg-white rounded-xl p-4 shadow-sm">
                  <Text className="block text-sm text-gray-500 mb-1">平均销售价</Text>
                  <Text className="block text-2xl font-bold text-purple-600">
                    ¥{stats.averageSalesPrice}
                  </Text>
                  <Text className="block text-xs text-gray-400">元/只</Text>
                </View>
                <View className="bg-white rounded-xl p-4 shadow-sm">
                  <Text className="block text-sm text-gray-500 mb-1">销售数量</Text>
                  <Text className="block text-2xl font-bold text-pink-600">
                    {stats.salesQuantity}
                  </Text>
                  <Text className="block text-xs text-gray-400">只</Text>
                </View>
                <View className="bg-white rounded-xl p-4 shadow-sm">
                  <Text className="block text-sm text-gray-500 mb-1">销售次数</Text>
                  <Text className="block text-2xl font-bold text-green-600">
                    {stats.salesCount}
                  </Text>
                  <Text className="block text-xs text-gray-400">次</Text>
                </View>
              </View>

              {/* 库存分布 */}
              <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
                <View className="flex items-center gap-2 mb-4">
                  <TrendingUp size={20} color="#10b981" />
                  <Text className="block text-lg font-bold text-gray-900">
                    库存分布{selectedLocation !== '全部' && ` - ${selectedLocation}`}
                  </Text>
                </View>
                <View className="space-y-3">
                  {stats.sortedLocationInventoryDetails.map(({ location, details }) => {
                    const quantity = details.reduce((sum, d) => sum + d.quantity, 0)
                    const maxQuantity = Math.max(...stats.sortedLocationInventory.map(i => i.quantity))
                    const percentage = maxQuantity > 0 ? (quantity / maxQuantity) * 100 : 0
                    const isExpanded = expandedLocations[location]

                    return (
                      <View key={location} className="bg-gray-50 rounded-lg overflow-hidden">
                        {/* 门店汇总行 */}
                        <View
                          className="p-3"
                          onClick={() => setExpandedLocations(prev => ({
                            ...prev,
                            [location]: !prev[location]
                          }))}
                        >
                          <View className="flex justify-between items-center mb-2">
                            <View className="flex-1 flex items-center gap-2">
                              <Text className="block text-sm font-medium text-gray-900">
                                {location}
                              </Text>
                              <Text className="block text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                {details.length} 种
                              </Text>
                            </View>
                            <View className="flex items-center gap-2">
                              <View className="text-right">
                                <Text className="block text-lg font-bold text-emerald-600">
                                  {quantity}
                                </Text>
                                <Text className="block text-xs text-gray-400">只</Text>
                              </View>
                              <Text className={`block text-sm ${isExpanded ? 'text-gray-400' : 'text-emerald-500'}`}>
                                {isExpanded ? '▼' : '▶'}
                              </Text>
                            </View>
                          </View>
                          <View className="w-full bg-gray-200 rounded-full h-2">
                            <View
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </View>
                        </View>

                        {/* 展开的明细列表 */}
                        {isExpanded && (
                          <View className="border-t border-gray-200 px-3 py-2 bg-gray-100">
                            <View className="space-y-2">
                              {details.map((detail, index) => (
                                <View
                                  key={`${location}-${index}`}
                                  className="bg-white rounded-lg p-2.5 flex justify-between items-center"
                                >
                                  <View className="flex-1">
                                    <Text className="block text-sm font-medium text-gray-900">
                                      {detail.insectName}
                                    </Text>
                                    <Text className="block text-xs text-gray-500">
                                      {detail.insectSpecies || '无物种信息'}
                                    </Text>
                                  </View>
                                  <View className="text-right ml-3">
                                    <Text className="block text-base font-bold text-emerald-600">
                                      {detail.quantity}
                                    </Text>
                                    <Text className="block text-xs text-gray-400">只</Text>
                                  </View>
                                  <View className="text-right ml-3">
                                    <Text className="block text-sm font-medium text-blue-600">
                                      ¥{detail.price}
                                    </Text>
                                    <Text className="block text-xs text-gray-400">单价</Text>
                                  </View>
                                  <View className="text-right ml-3">
                                    <Text className="block text-sm font-bold text-purple-600">
                                      ¥{detail.totalValue}
                                    </Text>
                                    <Text className="block text-xs text-gray-400">总价</Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    )
                  })}
                </View>
              </View>

              {/* 各门店昆虫死亡排序 */}
              <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
                <View className="flex items-center gap-2 mb-4">
                  <Activity size={20} color="#dc2626" />
                  <Text className="block text-lg font-bold text-gray-900">
                    各门店昆虫死亡排序{selectedLocation !== '全部' && ` - ${selectedLocation}`}
                  </Text>
                </View>

                {stats.sortedLocationDeath.length === 0 ? (
                  <View className="flex flex-col items-center justify-center py-8">
                    <Activity className="w-12 h-12 text-gray-300 mb-3" />
                    <Text className="block text-sm text-gray-500">暂无死亡记录</Text>
                  </View>
                ) : (
                  <View className="space-y-3">
                    {stats.sortedLocationDeath.map((item, index) => {
                      const maxQuantity = Math.max(...stats.sortedLocationDeath.map(i => i.totalQuantity))
                      const percentage = maxQuantity > 0 ? (item.totalQuantity / maxQuantity) * 100 : 0
                      return (
                        <View key={item.location} className="bg-red-50 rounded-lg p-3">
                          <View className="flex justify-between items-center mb-2">
                            <View className="flex items-center gap-2">
                              <View className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-red-400 text-white' :
                                index === 1 ? 'bg-orange-400 text-white' :
                                index === 2 ? 'bg-yellow-400 text-yellow-900' :
                                'bg-gray-300 text-gray-700'
                              }`}
                              >
                                {index + 1}
                              </View>
                              <Text className="block text-sm font-medium text-gray-900">
                                {item.location}
                              </Text>
                            </View>
                            <View className="text-right">
                              <Text className="block text-lg font-bold text-red-600">
                                {item.totalQuantity}
                              </Text>
                              <Text className="block text-xs text-gray-400">只</Text>
                            </View>
                          </View>
                          <View className="w-full bg-red-200 rounded-full h-2 mb-2">
                            <View
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </View>
                          <View className="flex justify-between text-xs text-gray-500">
                            <Text>死亡次数: {item.deathCount} 次</Text>
                          </View>
                        </View>
                      )
                    })}
                  </View>
                )}
              </View>

              {/* 导出按钮 */}
              <View
                className="bg-emerald-500 rounded-xl p-4 flex items-center justify-center gap-2"
                onClick={handleExport}
              >
                <Download size={20} color="#ffffff" />
                <Text className="block text-base font-medium text-white">导出库存报表</Text>
              </View>
            </>
          ) : activeTab === 'sales' ? (
            <>
              {/* 销售概览卡片 */}
              <View className="grid grid-cols-2 gap-3 mb-4">
                <View className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-sm">
                  <Text className="block text-sm text-blue-100 mb-1">总销售额</Text>
                  <Text className="block text-2xl font-bold text-white">
                    ¥{stats.totalSalesRevenue}
                  </Text>
                  <Text className="block text-xs text-blue-200">累计收入</Text>
                </View>
                <View className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 shadow-sm">
                  <Text className="block text-sm text-emerald-100 mb-1">平均销售价</Text>
                  <Text className="block text-2xl font-bold text-white">
                    ¥{stats.averageSalesPrice}
                  </Text>
                  <Text className="block text-xs text-emerald-200">元/只</Text>
                </View>
                <View className="bg-white rounded-xl p-4 shadow-sm">
                  <Text className="block text-sm text-gray-500 mb-1">销售次数</Text>
                  <Text className="block text-2xl font-bold text-purple-600">
                    {stats.salesCount}
                  </Text>
                  <Text className="block text-xs text-gray-400">次</Text>
                </View>
                <View className="bg-white rounded-xl p-4 shadow-sm">
                  <Text className="block text-sm text-gray-500 mb-1">销售数量</Text>
                  <Text className="block text-2xl font-bold text-pink-600">
                    {stats.salesQuantity}
                  </Text>
                  <Text className="block text-xs text-gray-400">只</Text>
                </View>
              </View>

              {/* 各昆虫销售收入排名 */}
              <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
                <View className="flex items-center gap-2 mb-4">
                  <TrendingUp size={20} color="#10b981" />
                  <Text className="block text-lg font-bold text-gray-900">
                    销售收入排名{selectedLocation !== '全部' && ` - ${selectedLocation}`}
                  </Text>
                </View>

                {stats.sortedInsectSales.length === 0 ? (
                  <View className="flex flex-col items-center justify-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-300 mb-3" />
                    <Text className="block text-sm text-gray-500">暂无销售数据</Text>
                  </View>
                ) : (
                  <View className="space-y-3">
                    {stats.sortedInsectSales.map((item, index) => {
                      const maxRevenue = Math.max(...stats.sortedInsectSales.map(i => i.totalRevenue))
                      const percentage = maxRevenue > 0 ? (item.totalRevenue / maxRevenue) * 100 : 0
                      return (
                        <View key={item.insectName} className="bg-gray-50 rounded-lg p-3">
                          <View className="flex justify-between items-center mb-2">
                            <View className="flex items-center gap-2">
                              <View className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                index === 1 ? 'bg-gray-400 text-white' :
                                index === 2 ? 'bg-orange-400 text-white' :
                                'bg-gray-300 text-gray-700'
                              }`}
                              >
                                {index + 1}
                              </View>
                              <Text className="block text-sm font-medium text-gray-900">
                                {item.insectName}
                              </Text>
                            </View>
                            <Text className="block text-lg font-bold text-emerald-600">
                              ¥{item.totalRevenue}
                            </Text>
                          </View>
                          <View className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <View
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </View>
                          <View className="flex justify-between text-xs text-gray-500">
                            <Text>数量: {item.totalQuantity} 只</Text>
                            <Text>均价: ¥{item.averagePrice}/只</Text>
                          </View>
                        </View>
                      )
                    })}
                  </View>
                )}
              </View>

              {/* 门店销售收入排名 */}
              <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
                <View className="flex items-center gap-2 mb-4">
                  <TrendingUp size={20} color="#8b5cf6" />
                  <Text className="block text-lg font-bold text-gray-900">
                    门店销售收入排名{selectedLocation !== '全部' && ` - ${selectedLocation}`}
                  </Text>
                </View>

                {stats.sortedLocationSales.length === 0 ? (
                  <View className="flex flex-col items-center justify-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-300 mb-3" />
                    <Text className="block text-sm text-gray-500">暂无销售数据</Text>
                  </View>
                ) : (
                  <View className="space-y-3">
                    {stats.sortedLocationSales.map((item, index) => {
                      const maxRevenue = Math.max(...stats.sortedLocationSales.map(i => i.totalRevenue))
                      const percentage = maxRevenue > 0 ? (item.totalRevenue / maxRevenue) * 100 : 0
                      return (
                        <View key={item.location} className="bg-gray-50 rounded-lg p-3">
                          <View className="flex justify-between items-center mb-2">
                            <View className="flex items-center gap-2">
                              <View className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                index === 1 ? 'bg-gray-400 text-white' :
                                index === 2 ? 'bg-orange-400 text-white' :
                                'bg-gray-300 text-gray-700'
                              }`}
                              >
                                {index + 1}
                              </View>
                              <Text className="block text-sm font-medium text-gray-900">
                                {item.location}
                              </Text>
                            </View>
                            <Text className="block text-lg font-bold text-purple-600">
                              ¥{item.totalRevenue}
                            </Text>
                          </View>
                          <View className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <View
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </View>
                          <View className="flex justify-between text-xs text-gray-500">
                            <Text>数量: {item.totalQuantity} 只</Text>
                            <Text>均价: ¥{item.averagePrice}/只</Text>
                          </View>
                        </View>
                      )
                    })}
                  </View>
                )}
              </View>

              {/* 导出销售报表 */}
              <View
                className="bg-blue-500 rounded-xl p-4 flex items-center justify-center gap-2"
                onClick={() => handleExportSalesReport()}
              >
                <Download size={20} color="#ffffff" />
                <Text className="block text-base font-medium text-white">导出销售报表</Text>
              </View>
            </>
          ) : (
            <>
              {/* 操作记录列表 */}
              {logs.length === 0 ? (
                <View className="flex flex-col items-center justify-center py-16">
                  <FileText className="w-16 h-16 text-gray-300 mb-4" />
                  <Text className="block text-base text-gray-500">暂无操作记录</Text>
                </View>
              ) : (
                logs.map(log => {
                  const operationColor = {
                    '进货': 'bg-green-100 text-green-700',
                    '销售': 'bg-blue-100 text-blue-700',
                    '死亡': 'bg-red-100 text-red-700',
                  }[log.operation_type] || 'bg-gray-100 text-gray-700'

                  const operationIcon = {
                    '进货': '↑',
                    '销售': '↓',
                    '死亡': '✕',
                  }[log.operation_type] || '•'

                  return (
                    <View key={log.id} className="bg-white rounded-xl p-4 shadow-sm mb-3">
                      <View className="flex justify-between items-start">
                        <View className="flex-1">
                          <Text className="block text-base font-semibold text-gray-900 mb-1">
                            {log.insects.name}
                          </Text>
                          <View className="flex items-center gap-2 mb-1">
                            <Text className="block text-sm text-gray-500">操作：</Text>
                            <View className={`${operationColor} px-2 py-0.5 rounded`}>
                              <Text className="block text-xs font-medium">
                                {operationIcon} {log.operation_type} {log.quantity} 只
                              </Text>
                            </View>
                          </View>
                          <View className="flex items-center gap-2 mb-1">
                            <Text className="block text-sm text-gray-500">位置：</Text>
                            <Text className="block text-sm text-gray-700">{log.location}</Text>
                          </View>
                          {log.remark && (
                            <View className="flex items-center gap-2">
                              <Text className="block text-sm text-gray-500">备注：</Text>
                              <Text className="block text-sm text-gray-700">{log.remark}</Text>
                            </View>
                          )}
                          {log.price && log.operation_type === '销售' && (
                            <View className="flex items-center gap-2 mt-1">
                              <Text className="block text-sm text-gray-500">实收：</Text>
                              <Text className="block text-sm font-bold text-emerald-600">¥{log.price}</Text>
                            </View>
                          )}
                        </View>
                        <Text className="block text-xs text-gray-400">
                          {new Date(log.created_at).toLocaleString('zh-CN')}
                        </Text>
                      </View>
                    </View>
                  )
                })
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* 位置选择器弹窗 */}
      {showLocationPicker && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <View className="bg-white rounded-xl w-4/5 max-w-sm mx-4 p-6">
            <Text className="block text-lg font-bold text-gray-900 mb-4">
              选择门店
            </Text>
            <View className="space-y-2 mb-6">
              {LOCATIONS.map(location => (
                <View
                  key={location}
                  className={`p-3 rounded-lg border ${
                    selectedLocation === location
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedLocation(location)
                    setShowLocationPicker(false)
                  }}
                >
                  <Text
                    className={`block text-sm font-medium ${
                      selectedLocation === location ? 'text-emerald-700' : 'text-gray-700'
                    }`}
                  >
                    {location}
                  </Text>
                </View>
              ))}
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
              <View
                style={{ flex: 1 }}
                className="bg-gray-200 text-gray-700 rounded-xl py-3 flex items-center justify-center"
                onClick={() => setShowLocationPicker(false)}
              >
                <Text className="block text-base font-medium">取消</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default StatisticsPage
