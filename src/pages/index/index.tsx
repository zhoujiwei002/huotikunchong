import { View, Text, Image, ScrollView, Button, Input, Picker } from '@tarojs/components'
import Taro, { useLoad, chooseImage } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Plus, X, Camera, User, Search, RefreshCw } from 'lucide-react-taro'
import {
  initSupabase,
  getAllInventory,
  createInsect,
  createOperationLog,
  deleteInventory,
  uploadFile,
  getInsectByName,
  getInventoryStats,
  createInventory
} from '@/services/supabase'
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

// 预设昆虫品种
const PRESET_INSECTS = [
  '天门螳螂',
  '天门甲虫',
  '晋中甲虫',
  '绥化甲虫',
  '本溪甲虫',
  '天门睫角',
]

const IndexPage = () => {
  const [inventory, setInventory] = useState<any[]>([])
  const [selectedLocation, setSelectedLocation] = useState('全部')
  const [modalType, setModalType] = useState<'none' | 'add' | 'operation'>('none')
  const [selectedInsect, setSelectedInsect] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
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
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showUserModal, setShowUserModal] = useState(false)
  const [userNickname, setUserNicknameState] = useState('')

  // 初始化
  useLoad(async () => {
    console.log('[IndexPage] useLoad 开始执行')
    initSupabase()
    await loadInventory()
    await loadStats()
    setUserNicknameState(getUserNickname())
  })

  // 切换位置时重新加载
  useEffect(() => {
    loadInventory()
  }, [selectedLocation])

  // 加载库存数据
  const loadInventory = async () => {
    try {
      console.log('[IndexPage] 开始加载库存数据，位置:', selectedLocation)
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

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([loadInventory(), loadStats()])
    setRefreshing(false)
    Taro.showToast({
      title: '刷新成功',
      icon: 'success',
    })
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
        // H5 端不支持 compressImage，直接使用原始图片
        const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
        if (isWeapp) {
          // 小程序端：压缩图片
          const compressRes = await compressImage({
            src: res.tempFilePaths[0],
            quality: 75,
          })
          setSelectedImage(compressRes.tempFilePath)
        } else {
          // H5 端：直接使用原始图片
          setSelectedImage(res.tempFilePaths[0])
        }
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
        // H5 端不支持 compressImage，直接使用原始图片
        const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
        if (isWeapp) {
          // 小程序端：压缩图片
          const compressRes = await compressImage({
            src: res.tempFilePaths[0],
            quality: 75,
          })
          setSelectedOperationImage(compressRes.tempFilePath)
        } else {
          // H5 端：直接使用原始图片
          setSelectedOperationImage(res.tempFilePaths[0])
        }
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
      const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP

      if (isWeapp) {
        // 小程序端：读取文件并上传
        await Taro.getFileInfo({ filePath: selectedImage })
        const fileData = await Taro.getFileSystemManager().readFile({
          filePath: selectedImage,
        })
        return await uploadFile(selectedImage, fileData.data as ArrayBuffer, 'image/jpeg')
      } else {
        // H5 端：使用 FileReader 读取文件
        const response = await fetch(selectedImage)
        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()
        return await uploadFile(selectedImage, arrayBuffer, blob.type || 'image/jpeg')
      }
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
      const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP

      if (isWeapp) {
        // 小程序端：读取文件并上传
        await Taro.getFileInfo({ filePath: selectedOperationImage })
        const fileData = await Taro.getFileSystemManager().readFile({
          filePath: selectedOperationImage,
        })
        return await uploadFile(selectedOperationImage, fileData.data as ArrayBuffer, 'image/jpeg')
      } else {
        // H5 端：使用 FileReader 读取文件
        const response = await fetch(selectedOperationImage)
        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()
        return await uploadFile(selectedOperationImage, arrayBuffer, blob.type || 'image/jpeg')
      }
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

      // 先上传图片
      const imageUrl = await handleUploadImage()
      console.log('[IndexPage] 图片上传结果:', imageUrl)

      // 检查昆虫是否已存在
      const existingInsect = await getInsectByName(insectForm.name)
      if (existingInsect) {
        Taro.showToast({
          title: '该昆虫品种已存在',
          icon: 'none',
        })
        setLoading(false)
        return
      }

      // 创建昆虫
      await createInsect({
        name: insectForm.name,
        species: insectForm.species || null,
        price: parseInt(insectForm.price),
        description: insectForm.description || null,
        image_url: imageUrl || null,
      })

      // 获取新创建的昆虫 ID
      const newInsect = await getInsectByName(insectForm.name)
      if (newInsect) {
        // 先创建库存记录
        await createInventory({
          insect_id: newInsect.id,
          quantity: parseInt(insectForm.quantity),
          location: insectForm.location,
        })

        // 再创建操作日志
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

  // 执行操作（销售/死亡）
  const handleOperation = async () => {
    if (!selectedInsect || !operationForm.quantity) {
      Taro.showToast({
        title: '请填写数量',
        icon: 'none',
      })
      return
    }

    const quantity = parseInt(operationForm.quantity)

    // 销售时强制要求填写实收价格
    if (operationForm.operationType === '销售' && !operationForm.price) {
      Taro.showToast({
        title: '请填写实收价格',
        icon: 'none',
      })
      return
    }

    // 销售和死亡时检查库存
    if ((operationForm.operationType === '销售' || operationForm.operationType === '死亡') && quantity > selectedInsect.quantity) {
      Taro.showToast({
        title: '库存不足',
        icon: 'none',
      })
      return
    }

    // 销售和死亡时强制要求上传实景图片
    if ((operationForm.operationType === '销售' || operationForm.operationType === '死亡') && !selectedOperationImage) {
      Taro.showToast({
        title: '请拍摄实景图片',
        icon: 'none',
      })
      return
    }

    try {
      // 上传操作图片
      const operationImageUrl = (operationForm.operationType === '销售' || operationForm.operationType === '死亡')
        ? await handleUploadOperationImage()
        : null

      // 自动跳转到昆虫所属门店
      const location = selectedInsect.location

      await createOperationLog({
        insect_id: selectedInsect.insect_id,
        operation_type: operationForm.operationType as '销售' | '死亡' | '进货',
        quantity,
        location,
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
    const newIndex = e.detail.value
    setSelectedLocation(LOCATIONS[newIndex])
  }

  // 更新用户昵称
  const handleUpdateNickname = () => {
    if (!userNickname.trim()) {
      Taro.showToast({
        title: '请输入昵称',
        icon: 'none',
      })
      return
    }
    setUserNickname(userNickname.trim())
    setShowUserModal(false)
    Taro.showToast({
      title: '昵称更新成功',
      icon: 'success',
    })
  }

  // 过滤库存列表
  const filteredInventory = inventory.filter(item => {
    if (!searchKeyword) return true
    const keyword = searchKeyword.toLowerCase()
    return (
      item.insects.name.toLowerCase().includes(keyword) ||
      item.insects.species?.toLowerCase().includes(keyword)
    )
  })

  return (
    <View className="w-full h-full flex flex-col bg-gray-50">
      {/* 顶部统计栏 */}
      <View className="bg-white p-4 shadow-sm">
        <View className="flex justify-between items-center mb-3">
          <Text className="block text-xl font-bold text-gray-800">库存管理</Text>
          <View className="flex gap-2 items-center">
            <View
              className="flex items-center gap-1 px-3 py-1 bg-blue-100 rounded-full"
              onClick={() => setShowUserModal(true)}
            >
              <User size={14} color="#3b82f6" />
              <Text className="block text-sm text-blue-600">{getUserNickname()}</Text>
            </View>
            <View
              className={`p-2 rounded-full ${refreshing ? 'animate-spin' : ''}`}
              onClick={handleRefresh}
            >
              <RefreshCw size={16} color="#6b7280" />
            </View>
          </View>
        </View>
        <View className="flex gap-2 mb-3">
          <View className="flex-1 px-3 py-1 bg-blue-100 rounded-full flex items-center justify-center">
            <Text className="block text-sm text-blue-600">{stats.insectCount} 个品种</Text>
          </View>
          <View className="flex-1 px-3 py-1 bg-green-100 rounded-full flex items-center justify-center">
            <Text className="block text-sm text-green-600">{stats.totalQuantity} 只</Text>
          </View>
        </View>
        <Picker
          mode="selector"
          range={LOCATIONS}
          value={LOCATIONS.indexOf(selectedLocation)}
          onChange={handleLocationChange}
        >
          <View className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded-lg">
            <Text className="block text-sm text-gray-600">当前位置</Text>
            <Text className="block text-sm font-medium text-gray-800">{selectedLocation}</Text>
          </View>
        </Picker>
      </View>

      {/* 搜索栏 */}
      <View className="bg-white px-4 py-2">
        <View className="flex gap-2 items-center bg-gray-50 rounded-lg px-3 py-2">
          <Search size={16} color="#9ca3af" />
          <View className="flex-1">
            <Input
              className="w-full bg-transparent"
              placeholder="搜索昆虫名称或物种"
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
            />
          </View>
          {searchKeyword && (
            <View onClick={() => setSearchKeyword('')}>
              <X size={16} color="#9ca3af" />
            </View>
          )}
        </View>
      </View>

      {/* 库存列表 */}
      <ScrollView className="flex-1" scrollY>
        <View className="p-4 space-y-3">
          {filteredInventory.map((item) => (
            <View key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
              <View className="flex gap-3">
                <Image
                  src={item.insects.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSI4IiBmaWxsPSIjRjNGNEY2Ii8+PHBhdGggZD0iTTQwIDIwQzM1LjU4MTcgMjAgMzIgMjMuNTgxNyAzMiAyOFY1MkMzMiA1Ni40MTgzIDM1LjU4MTcgNjAgNDAgNjBDNDQuNDE4MyA2MCA0OCA1Ni40MTgzIDQ4IDUyVjI4QzQ4IDIzLjU4MTcgNDQuNDE4MyAyMCA0MCAyMFpNNDAgNTZDMzYuNjg2MyA1NiAzNCA1My4zMTM3IDM0IDUwQzM0IDQ2LjY4NjMgMzYuNjg2MyA0NCA0MCA0NEM0My4zMTM3IDQ0IDQ2IDQ2LjY4NjMgNDYgNTBDNDYgNTMuMzEzNyA0My4zMTM3IDU2IDQwIDU2WiIgZmlsbD0iIzlDQTNBNyIvPjwvc3ZnPg=='}
                  style={{ width: '80px', height: '80px', borderRadius: '8px', backgroundColor: '#f3f4f6' }}
                  mode="aspectFill"
                />
                <View className="flex-1">
                  <View className="flex justify-between items-start">
                    <Text className="block text-lg font-semibold text-gray-800">{item.insects.name}</Text>
                    <View className={`px-2 py-1 rounded-full ${item.quantity === 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                      <Text className={`block text-xs font-medium ${item.quantity === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.quantity === 0 ? '无库存' : '库存正常'}
                      </Text>
                    </View>
                  </View>
                  <Text className="block text-sm text-gray-500 mt-1">
                    {item.insects.species || '-'} | ¥{item.insects.price}
                  </Text>
                  <Text className="block text-sm text-gray-500 mt-1">
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
                      setOperationForm({ ...operationForm, location: item.location })
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
          {filteredInventory.length === 0 && (
            <View className="flex flex-col items-center justify-center py-20">
              <Text className="block text-gray-400">
                {searchKeyword ? '没有找到匹配的昆虫' : '暂无库存数据'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 添加按钮 */}
      <View className="fixed bottom-24 right-4">
        <Button
          type="primary"
          size="normal"
          className="rounded-full shadow-lg flex items-center justify-center"
          style={{ width: '56px', height: '56px', borderRadius: '50%' }}
          onClick={() => setModalType('add')}
        >
          <Plus size={24} color="white" />
        </Button>
      </View>

      {/* 添加昆虫模态框 */}
      {modalType === 'add' && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md max-h-[90vh] flex flex-col">
            <View className="flex justify-between items-center mb-4">
              <Text className="block text-lg font-bold">添加昆虫品种</Text>
              <View onClick={() => setModalType('none')}>
                <X size={24} className="text-gray-500" />
              </View>
            </View>

            <ScrollView className="flex-1 space-y-4">
              {/* 图片上传 */}
              <View>
                {selectedImage ? (
                  <View className="relative" style={{ width: '100%', height: '192px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                    <Image
                      src={selectedImage}
                      style={{ width: '100%', height: '100%', borderRadius: '8px' }}
                      mode="aspectFill"
                    />
                    <View
                      className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2"
                      style={{ top: '8px', right: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)' }}
                      onClick={() => setSelectedImage('')}
                    >
                      <X size={16} color="white" />
                    </View>
                  </View>
                ) : (
                  <View
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center"
                    style={{ width: '100%', height: '192px', borderRadius: '8px', border: '2px dashed #d1d5db' }}
                    onClick={handleChooseImage}
                  >
                    <Camera size={40} className="text-gray-400" />
                    <Text className="block text-gray-400 mt-2">点击上传图片</Text>
                  </View>
                )}
              </View>

              {/* 表单 */}
              <View className="space-y-3">
                <Picker mode="selector" range={PRESET_INSECTS}>
                  <View className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between items-center">
                    <Text className="block text-gray-500">选择预设昆虫</Text>
                    <Text className="block text-gray-800">从列表选择</Text>
                  </View>
                </Picker>
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
                  <View className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between items-center">
                    <Text className="block text-gray-500">门店 *</Text>
                    <Text className="block text-gray-800">{insectForm.location}</Text>
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

            <View className="flex gap-3 mt-4 pt-4 border-t">
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
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md max-h-[90vh] flex flex-col">
            <View className="flex justify-between items-center mb-4">
              <Text className="block text-lg font-bold">库存操作</Text>
              <View onClick={() => setModalType('none')}>
                <X size={24} className="text-gray-500" />
              </View>
            </View>

            <ScrollView className="flex-1 space-y-4">
              {/* 当前库存信息 */}
              <View className="bg-blue-50 rounded-lg p-3">
                <Text className="block text-sm text-gray-600">{selectedInsect.insects.name}</Text>
                <Text className="block text-xs text-gray-500">当前库存: {selectedInsect.quantity}</Text>
                <Text className="block text-xs text-gray-500">所在位置: {selectedInsect.location}</Text>
              </View>

              {/* 操作类型 */}
              <View>
                <Text className="block text-sm font-medium text-gray-700 mb-2">操作类型</Text>
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
                      <Text className="block text-sm">{type}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 操作图片 */}
              {(operationForm.operationType === '销售' || operationForm.operationType === '死亡') && (
                <View>
                  {selectedOperationImage ? (
                    <View className="relative" style={{ width: '100%', height: '128px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                      <Image
                        src={selectedOperationImage}
                        style={{ width: '100%', height: '100%', borderRadius: '8px' }}
                        mode="aspectFill"
                      />
                      <View
                        className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2"
                        style={{ top: '8px', right: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)' }}
                        onClick={() => setSelectedOperationImage('')}
                      >
                        <X size={16} color="white" />
                      </View>
                    </View>
                  ) : (
                    <View
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center"
                      style={{ width: '100%', height: '128px', borderRadius: '8px', border: '2px dashed #d1d5db' }}
                      onClick={handleChooseOperationImage}
                    >
                      <Camera size={32} className="text-gray-400" />
                      <Text className="block text-gray-400 text-sm mt-2">拍摄实景图片</Text>
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

            <View className="flex gap-3 mt-4 pt-4 border-t">
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

      {/* 用户昵称模态框 */}
      {showUserModal && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-sm">
            <Text className="block text-lg font-bold mb-4">设置昵称</Text>
            <View className="bg-gray-50 rounded-lg px-4 py-3 mb-4">
              <Input
                placeholder="请输入您的昵称"
                value={userNickname}
                onInput={(e) => setUserNicknameState(e.detail.value)}
              />
            </View>
            <View className="flex gap-3">
              <View className="flex-1">
                <Button type="default" onClick={() => setShowUserModal(false)}>
                  取消
                </Button>
              </View>
              <View className="flex-1">
                <Button type="primary" onClick={handleUpdateNickname}>
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
