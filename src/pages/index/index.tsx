import { View, Text, Image, ScrollView, Button, Input, Picker } from '@tarojs/components'
import Taro, { useLoad, chooseImage, compressImage } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Plus, ShoppingCart, X, Activity, Camera, User } from 'lucide-react-taro'
import { initSupabase, getAllInventory, getAllInsects, createInsect, createOperationLog, deleteInventory, uploadFile, getInsectByName, getInventoryStats } from '@/services/supabase'
import { getUserNickname, setUserNickname } from '@/utils/user'
import './index.css'

// 预设仓库位置
const LOCATIONS = [
  '全部',
  '公司总部',
  '王东团队',
  '袁兴彪团队',
  '郭秀华团队',
  '王希强团队',
  '王成兵团队',
  '周纪良团队',
  '秦文胜团队',
  '刘君团队',
]

const IndexPage = () => {
  const [inventory, setInventory] = useState<any[]>([])
  const [selectedLocation, setSelectedLocation] = useState('全部')
  const [modalType, setModalType] = useState<'none' | 'add' | 'operation'>('none')
  const [selectedInsect, setSelectedInsect] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [insectForm, setInsectForm] = useState({
    name: '',
    species: '',
    price: '',
    description: '',
    location: '公司总部',
    quantity: '',
  })
  const [operationForm, setOperationForm] = useState({
    operationType: '销售',
    quantity: '',
    location: '公司总部',
    price: '',
    remark: '',
  })
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedOperationImage, setSelectedOperationImage] = useState('')
  const [stats, setStats] = useState({ totalQuantity: 0, insectCount: 0 })

  // 初始化
  useLoad(async () => {
    console.log('[IndexPage] useLoad 开始执行')
    initSupabase()
    await loadInventory()
    await loadStats()
  })

  // 加载库存数据
  const loadInventory = async () => {
    try {
      console.log('[IndexPage] 开始加载库存数据')
      const data = await getAllInventory(selectedLocation !== '全部' ? selectedLocation : undefined)
      console.log('[IndexPage] 库存数据加载成功，数量:', data.length)
      setInventory(data)
    } catch (error) {
      console.error('[IndexPage] 加载库存失败:', error)
      Taro.showToast({
        title: '加载库存失败',
        icon: 'none',
      })
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      const data = await getInventoryStats()
      setStats(data)
    } catch (error) {
      console.error('[IndexPage] 加载统计失败:', error)
    }
  }

  // 选择图片
  const handleChooseImage = async () => {
    try {
      const res = await chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        // 压缩图片
        const compressRes = await compressImage({
          src: res.tempFilePaths[0],
          quality: 75,
        })

        setSelectedImage(compressRes.tempFilePath)
      }
    } catch (error) {
      console.error('[IndexPage] 选择图片失败:', error)
      Taro.showToast({
        title: '选择图片失败',
        icon: 'none',
      })
    }
  }

  // 选择操作图片
  const handleChooseOperationImage = async () => {
    try {
      const res = await chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        const compressRes = await compressImage({
          src: res.tempFilePaths[0],
          quality: 75,
        })

        setSelectedOperationImage(compressRes.tempFilePath)
      }
    } catch (error) {
      console.error('[IndexPage] 选择操作图片失败:', error)
      Taro.showToast({
        title: '选择操作图片失败',
        icon: 'none',
      })
    }
  }

  // 上传图片
  const handleUploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null

    try {
      const res = await Taro.getFileInfo({ filePath: selectedImage })
      const fileData = await Taro.getFileSystemManager().readFile({
        filePath: selectedImage,
      })

      return await uploadFile(selectedImage, fileData.data as ArrayBuffer, 'image/jpeg')
    } catch (error) {
      console.error('[IndexPage] 上传图片失败:', error)
      Taro.showToast({
        title: '上传图片失败',
        icon: 'none',
      })
      return null
    }
  }

  // 上传操作图片
  const handleUploadOperationImage = async (): Promise<string | null> => {
    if (!selectedOperationImage) return null

    try {
      const res = await Taro.getFileInfo({ filePath: selectedOperationImage })
      const fileData = await Taro.getFileSystemManager().readFile({
        filePath: selectedOperationImage,
      })

      return await uploadFile(selectedOperationImage, fileData.data as ArrayBuffer, 'image/jpeg')
    } catch (error) {
      console.error('[IndexPage] 上传操作图片失败:', error)
      Taro.showToast({
        title: '上传操作图片失败',
        icon: 'none',
      })
      return null
    }
  }

  // 添加昆虫品种
  const handleAddInsect = async () => {
    if (!insectForm.name || !insectForm.price || !insectForm.quantity) {
      Taro.showToast({
        title: '请填写必填项',
        icon: 'none',
      })
      return
    }

    try {
      setLoading(true)
      console.log('[IndexPage] 开始添加昆虫:', insectForm)

      const imageUrl = await handleUploadImage()
      console.log('[IndexPage] 图片上传结果:', imageUrl)

      const existingInsect = await getInsectByName(insectForm.name)
      if (existingInsect) {
        Taro.showToast({
          title: '该昆虫品种已存在',
          icon: 'none',
        })
        return
      }

      await createInsect({
        name: insectForm.name,
        species: insectForm.species || null,
        price: parseInt(insectForm.price),
        description: insectForm.description || null,
        image_url: imageUrl || null,
      })

      const newInsect = await getInsectByName(insectForm.name)
      if (newInsect) {
        await createOperationLog({
          insect_id: newInsect.id,
          operation_type: '进货',
          quantity: parseInt(insectForm.quantity),
          location: insectForm.location,
          price: null,
          remark: '新增品种',
          image_url: imageUrl || null,
          operator: getUserNickname(),
        })
      }

      console.log('[IndexPage] 添加昆虫成功')
      Taro.showToast({
        title: '添加成功',
        icon: 'success',
      })
      setModalType('none')
      setInsectForm({ name: '', species: '', price: '', description: '', location: '公司总部', quantity: '' })
      setSelectedImage('')
      loadInventory()
      loadStats()
    } catch (error) {
      console.error('[IndexPage] 添加昆虫失败:', error)
      Taro.showToast({
        title: `添加失败: ${error instanceof Error ? error.message : '未知错误'}`,
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 执行操作
  const handleOperation = async () => {
    if (!selectedInsect || !operationForm.quantity) {
      Taro.showToast({
        title: '请填写数量',
        icon: 'none',
      })
      return
    }

    const quantity = parseInt(operationForm.quantity)

    if (operationForm.operationType === '销售' && !operationForm.price) {
      Taro.showToast({
        title: '请填写实收价格',
        icon: 'none',
      })
      return
    }

    if ((operationForm.operationType === '销售' || operationForm.operationType === '死亡') && quantity > selectedInsect.quantity) {
      Taro.showToast({
        title: '库存不足',
        icon: 'none',
      })
      return
    }

    try {
      const operationImageUrl = (operationForm.operationType === '销售' || operationForm.operationType === '死亡')
        ? await handleUploadOperationImage()
        : null

      await createOperationLog({
        insect_id: selectedInsect.insect_id,
        operation_type: operationForm.operationType as '销售' | '死亡' | '进货',
        quantity,
        location: selectedInsect.location,
        price: operationForm.operationType === '销售' ? parseInt(operationForm.price) : null,
        remark: operationForm.remark || null,
        image_url: operationImageUrl || null,
        operator: getUserNickname(),
      })

      console.log('[IndexPage] 操作成功')
      Taro.showToast({
        title: '操作成功',
        icon: 'success',
      })
      setModalType('none')
      setOperationForm({ operationType: '销售', quantity: '', location: '公司总部', price: '', remark: '' })
      setSelectedInsect(null)
      setSelectedOperationImage('')
      loadInventory()
      loadStats()
    } catch (error) {
      console.error('[IndexPage] 操作失败:', error)
      Taro.showToast({
        title: `操作失败: ${error instanceof Error ? error.message : '未知错误'}`,
        icon: 'none',
      })
    }
  }

  // 删除库存
  const handleDeleteInventory = async (item: any) => {
    if (item.quantity > 0) {
      Taro.showToast({
        title: '库存不为0，无法删除',
        icon: 'none',
      })
      return
    }

    Taro.showModal({
      title: '确认删除',
      content: `确定要删除"${item.insects.name}"的库存记录吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await deleteInventory(item.id)
            Taro.showToast({
              title: '删除成功',
              icon: 'success',
            })
            loadInventory()
            loadStats()
          } catch (error) {
            console.error('[IndexPage] 删除库存失败:', error)
            Taro.showToast({
              title: '删除失败',
              icon: 'none',
            })
          }
        }
      },
    })
  }

  // 切换位置
  const handleLocationChange = (e: any) => {
    setSelectedLocation(LOCATIONS[e.detail.value])
    loadInventory()
  }

  return (
    <View className="w-full h-full flex flex-col bg-gray-50">
      {/* 顶部统计栏 */}
      <View className="bg-white p-4 shadow-sm">
        <View className="flex justify-between items-center mb-3">
          <Text className="text-xl font-bold text-gray-800">库存管理</Text>
          <View className="flex gap-2">
            <View className="px-3 py-1 bg-blue-100 rounded-full">
              <Text className="text-sm text-blue-600">{stats.insectCount} 个品种</Text>
            </View>
            <View className="px-3 py-1 bg-green-100 rounded-full">
              <Text className="text-sm text-green-600">{stats.totalQuantity} 只</Text>
            </View>
          </View>
        </View>
        <Picker
          mode="selector"
          range={LOCATIONS}
          value={LOCATIONS.indexOf(selectedLocation)}
          onChange={handleLocationChange}
        >
          <View className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded-lg">
            <Text className="text-sm text-gray-600">当前位置</Text>
            <Text className="text-sm font-medium text-gray-800">{selectedLocation}</Text>
          </View>
        </Picker>
      </View>

      {/* 库存列表 */}
      <ScrollView className="flex-1" scrollY>
        <View className="p-4 space-y-3">
          {inventory.map((item) => (
            <View key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
              <View className="flex gap-3">
                {item.insects.image_url && (
                  <Image
                    src={item.insects.image_url}
                    className="w-20 h-20 rounded-lg bg-gray-100"
                    mode="aspectFill"
                  />
                )}
                <View className="flex-1">
                  <View className="flex justify-between items-start">
                    <Text className="text-lg font-semibold text-gray-800">{item.insects.name}</Text>
                    <View className={`px-2 py-1 rounded-full ${item.quantity === 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                      <Text className={`text-xs font-medium ${item.quantity === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.quantity === 0 ? '无库存' : '库存正常'}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-500 mt-1">
                    {item.insects.species || '-'} | ¥{item.insects.price}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    {item.location}
                  </Text>
                </View>
              </View>
              <View className="flex gap-2 mt-3">
                <View className="flex-1">
                  <Button
                    size="mini"
                    type="primary"
                    onClick={() => {
                      setSelectedInsect(item)
                      setModalType('operation')
                    }}
                  >
                    操作
                  </Button>
                </View>
                {item.quantity === 0 && (
                  <View className="flex-1">
                    <Button
                      size="mini"
                      type="warn"
                      onClick={() => handleDeleteInventory(item)}
                    >
                      删除
                    </Button>
                  </View>
                )}
              </View>
            </View>
          ))}
          {inventory.length === 0 && (
            <View className="flex flex-col items-center justify-center py-20">
              <Text className="text-gray-400">暂无库存数据</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 添加按钮 */}
      <View className="absolute bottom-20 right-4">
        <Button
          type="primary"
          size="normal"
          className="rounded-full shadow-lg"
          onClick={() => setModalType('add')}
        >
          <Plus size={20} />
        </Button>
      </View>

      {/* 添加昆虫模态框 */}
      {modalType === 'add' && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md">
            <View className="flex justify-between items-center mb-4">
              <Text className="text-lg font-bold">添加昆虫品种</Text>
              <View onClick={() => setModalType('none')}>
                <X size={24} className="text-gray-500" />
              </View>
            </View>

            <ScrollView className="max-h-96">
              {/* 图片上传 */}
              <View className="mb-4">
                {selectedImage ? (
                  <View className="relative">
                    <Image
                      src={selectedImage}
                      className="w-full h-48 rounded-lg"
                      mode="aspectFill"
                    />
                    <View
                      className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2"
                      onClick={() => setSelectedImage('')}
                    >
                      <X size={16} color="white" />
                    </View>
                  </View>
                ) : (
                  <View
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center"
                    onClick={handleChooseImage}
                  >
                    <Camera size={40} className="text-gray-400" />
                    <Text className="text-gray-400 mt-2">点击上传图片</Text>
                  </View>
                )}
              </View>

              {/* 表单 */}
              <View className="space-y-3">
                <View className="bg-gray-50 rounded-lg px-4 py-3">
                  <Input
                    placeholder="昆虫名称 *"
                    value={insectForm.name}
                    onInput={(e) => setInsectForm({ ...insectForm, name: e.detail.value })}
                  />
                </View>
                <View className="bg-gray-50 rounded-lg px-4 py-3">
                  <Input
                    placeholder="物种"
                    value={insectForm.species}
                    onInput={(e) => setInsectForm({ ...insectForm, species: e.detail.value })}
                  />
                </View>
                <View className="bg-gray-50 rounded-lg px-4 py-3">
                  <Input
                    placeholder="单价 *"
                    type="number"
                    value={insectForm.price}
                    onInput={(e) => setInsectForm({ ...insectForm, price: e.detail.value })}
                  />
                </View>
                <View className="bg-gray-50 rounded-lg px-4 py-3">
                  <Input
                    placeholder="描述"
                    value={insectForm.description}
                    onInput={(e) => setInsectForm({ ...insectForm, description: e.detail.value })}
                  />
                </View>
                <Picker mode="selector" range={LOCATIONS.slice(1)} value={LOCATIONS.slice(1).indexOf(insectForm.location)}>
                  <View className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between">
                    <Text className="text-gray-500">门店 *</Text>
                    <Text className="text-gray-800">{insectForm.location}</Text>
                  </View>
                </Picker>
                <View className="bg-gray-50 rounded-lg px-4 py-3">
                  <Input
                    placeholder="初始数量 *"
                    type="number"
                    value={insectForm.quantity}
                    onInput={(e) => setInsectForm({ ...insectForm, quantity: e.detail.value })}
                  />
                </View>
              </View>
            </ScrollView>

            <View className="flex gap-3 mt-4">
              <View className="flex-1">
                <Button
                  type="default"
                  onClick={() => setModalType('none')}
                >
                  取消
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  type="primary"
                  loading={loading}
                  onClick={handleAddInsect}
                >
                  确定
                </Button>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 操作模态框 */}
      {modalType === 'operation' && selectedInsect && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md">
            <View className="flex justify-between items-center mb-4">
              <Text className="text-lg font-bold">库存操作</Text>
              <View onClick={() => setModalType('none')}>
                <X size={24} className="text-gray-500" />
              </View>
            </View>

            <ScrollView className="max-h-96">
              {/* 当前库存信息 */}
              <View className="bg-blue-50 rounded-lg p-3 mb-4">
                <Text className="text-sm text-gray-600">{selectedInsect.insects.name}</Text>
                <Text className="text-xs text-gray-500">当前库存: {selectedInsect.quantity}</Text>
              </View>

              {/* 操作类型 */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">操作类型</Text>
                <View className="flex gap-2">
                  {(['销售', '死亡'] as const).map((type) => (
                    <View
                      key={type}
                      className={`flex-1 py-2 px-4 rounded-lg text-center ${
                        operationForm.operationType === type
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      onClick={() => setOperationForm({ ...operationForm, operationType: type })}
                    >
                      <Text className="text-sm">{type}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 操作图片 */}
              {(operationForm.operationType === '销售' || operationForm.operationType === '死亡') && (
                <View className="mb-4">
                  {selectedOperationImage ? (
                    <View className="relative">
                      <Image
                        src={selectedOperationImage}
                        className="w-full h-32 rounded-lg"
                        mode="aspectFill"
                      />
                      <View
                        className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2"
                        onClick={() => setSelectedOperationImage('')}
                      >
                        <X size={16} color="white" />
                      </View>
                    </View>
                  ) : (
                    <View
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center"
                      onClick={handleChooseOperationImage}
                    >
                      <Camera size={32} className="text-gray-400" />
                      <Text className="text-gray-400 text-sm mt-2">拍摄实景图片</Text>
                    </View>
                  )}
                </View>
              )}

              {/* 表单 */}
              <View className="space-y-3">
                <View className="bg-gray-50 rounded-lg px-4 py-3">
                  <Input
                    placeholder={`数量 (最大 ${selectedInsect.quantity})`}
                    type="number"
                    value={operationForm.quantity}
                    onInput={(e) => setOperationForm({ ...operationForm, quantity: e.detail.value })}
                  />
                </View>
                {operationForm.operationType === '销售' && (
                  <View className="bg-gray-50 rounded-lg px-4 py-3">
                    <Input
                      placeholder="实收价格 *"
                      type="number"
                      value={operationForm.price}
                      onInput={(e) => setOperationForm({ ...operationForm, price: e.detail.value })}
                    />
                  </View>
                )}
                <View className="bg-gray-50 rounded-lg px-4 py-3">
                  <Input
                    placeholder="备注"
                    value={operationForm.remark}
                    onInput={(e) => setOperationForm({ ...operationForm, remark: e.detail.value })}
                  />
                </View>
              </View>
            </ScrollView>

            <View className="flex gap-3 mt-4">
              <View className="flex-1">
                <Button
                  type="default"
                  onClick={() => setModalType('none')}
                >
                  取消
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  type="primary"
                  onClick={handleOperation}
                >
                  确定
                </Button>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default IndexPage
