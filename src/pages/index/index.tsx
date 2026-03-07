import { View, Text, ScrollView, Input, Image, Picker } from '@tarojs/components'
import Taro, { useLoad, useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { Network } from '@/network'
import { Plus, Package, ShoppingCart, X, Activity, Camera, User } from 'lucide-react-taro'
import { getUserNickname, setUserNickname } from '@/utils/user'
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

const IndexPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [modalType, setModalType] = useState<'none' | 'addInsect' | 'operation' | 'transfer' | 'setNickname'>('none')
  const [selectedInsect, setSelectedInsect] = useState<InventoryItem | null>(null)

  // 用户昵称
  const [newNickname, setNewNickname] = useState('')

  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  // 门店筛选
  const [selectedLocation, setSelectedLocation] = useState('全部')
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  // 位置选项
  const locationOptions = ['公司总部', '王东团队', '袁兴彪团队', '郭秀华团队', '王希强团队', '王成兵团队', '周纪良团队', '秦文胜团队', '刘君团队']

  // 添加昆虫表单
  const [insectForm, setInsectForm] = useState({
    name: '',
    species: '',
    price: '',
    description: '',
    location: '公司总部',
    quantity: '',
  })
  const [selectedImage, setSelectedImage] = useState<string>('')

  // 操作表单
  const [operationForm, setOperationForm] = useState({
    operationType: '销售',
    quantity: '',
    location: '公司总部',
    price: '',
    remark: '',
  })
  const [selectedOperationImage, setSelectedOperationImage] = useState<string>('')

  // 串货表单
  const [transferForm, setTransferForm] = useState({
    quantity: '',
    sourceLocation: '',
    targetLocation: '公司总部',
    remark: '',
  })

  // 预设昆虫品种
  const presetInsects = [
    { name: '天门螳螂', species: '螳螂', price: 50, description: '天门地区特产螳螂' },
    { name: '天门甲虫', species: '甲虫', price: 30, description: '天门地区特产甲虫' },
    { name: '晋中甲虫', species: '甲虫', price: 35, description: '晋中地区特产甲虫' },
    { name: '绥化甲虫', species: '甲虫', price: 40, description: '绥化地区特产甲虫' },
    { name: '本溪甲虫', species: '甲虫', price: 45, description: '本溪地区特产甲虫' },
    { name: '天门睫角', species: '睫角', price: 80, description: '天门地区特产睫角' },
  ]

  // 初始化预设昆虫
  const initPresetInsects = async () => {
    try {
      // 获取所有昆虫列表
      const res = await Network.request({
        url: '/api/inventory/insects',
      })

      if (res.data?.code === 200 && res.data.data) {
        const existingInsects = res.data.data
        const existingNames = existingInsects.map((insect: Insect) => insect.name)

        // 找出需要创建的昆虫
        const insectsToCreate = presetInsects.filter(
          preset => !existingNames.includes(preset.name)
        )

        // 批量创建缺失的昆虫
        for (const insect of insectsToCreate) {
          await Network.request({
            url: '/api/inventory/insects',
            method: 'POST',
            data: {
              name: insect.name,
              species: insect.species,
              price: insect.price,
              description: insect.description,
              image_url: null,
            },
          })
        }

        // 如果有创建的昆虫，重新加载库存
        if (insectsToCreate.length > 0) {
          console.log(`已创建 ${insectsToCreate.length} 个预设昆虫`)
          loadInventory()
        }
      }
    } catch (error) {
      console.error('初始化预设昆虫失败:', error)
    }
  }

  // 加载库存数据
  const loadInventory = async () => {
    try {
      setLoading(true)
      const res = await Network.request({
        url: '/api/inventory',
      })
      console.log('库存数据:', res.data)
      if (res.data?.code === 200 && res.data.data) {
        setInventory(res.data.data)
      }
    } catch (error) {
      console.error('加载库存失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 选择图片（支持所有格式）
  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'], // 支持原图和压缩
        sourceType: ['album', 'camera'], // 相册和拍照
      })
      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        setSelectedImage(res.tempFilePaths[0])
        console.log('选择图片成功:', res.tempFilePaths[0])
      }
    } catch (error) {
      console.error('选择图片失败:', error)
      Taro.showToast({
        title: '选择图片失败',
        icon: 'none',
      })
    }
  }

  // 上传图片
  const handleUploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null

    try {
      console.log('开始上传图片:', selectedImage)
      const res = await Network.uploadFile({
        url: '/api/inventory/upload-image',
        filePath: selectedImage,
        name: 'file',
      })

      console.log('图片上传响应:', res.data)

      let data
      try {
        data = JSON.parse(res.data)
      } catch (parseError) {
        console.error('解析响应数据失败:', parseError)
        throw new Error('服务器响应格式错误')
      }

      if (data.code === 200 && data.data && data.data.url) {
        console.log('图片上传成功，URL:', data.data.url)
        return data.data.url
      }
      throw new Error(data.msg || '上传失败')
    } catch (error) {
      console.error('上传图片失败:', error)
      Taro.showToast({
        title: `上传失败: ${error.message || '未知错误'}`,
        icon: 'none',
        duration: 2000,
      })
      return null
    }
  }

  // 拍摄操作实景图片（仅销售和死亡需要）
  const handleTakeOperationPhoto = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'], // 支持原图和压缩
        sourceType: ['camera'], // 只允许拍照
      })
      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        setSelectedOperationImage(res.tempFilePaths[0])
        console.log('拍摄实景图片成功:', res.tempFilePaths[0])
      }
    } catch (error) {
      console.error('拍照失败:', error)
      Taro.showToast({
        title: '拍照失败',
        icon: 'none',
      })
    }
  }

  // 上传操作图片
  const handleUploadOperationImage = async (): Promise<string | null> => {
    if (!selectedOperationImage) return null

    try {
      const res = await Network.uploadFile({
        url: '/api/inventory/upload-image',
        filePath: selectedOperationImage,
        name: 'file',
      })

      const data = JSON.parse(res.data)
      if (data.code === 200 && data.data) {
        return data.data.url
      }
      throw new Error('上传失败')
    } catch (error) {
      console.error('上传操作图片失败:', error)
      Taro.showToast({
        title: '上传操作图片失败',
        icon: 'none',
      })
      return null
    }
  }

  // 添加昆虫品种
  const handleAddInsect = async () => {
    // 防止重复提交
    if (loading) {
      return
    }

    if (!insectForm.name || !insectForm.price || !insectForm.quantity) {
      Taro.showToast({
        title: '请填写必填项',
        icon: 'none',
      })
      return
    }

    try {
      setLoading(true)
      console.log('开始添加昆虫:', insectForm)

      // 先上传图片
      const imageUrl = await handleUploadImage()
      console.log('图片上传结果:', imageUrl)

      const requestData = {
        name: insectForm.name,
        species: insectForm.species || null,
        price: parseInt(insectForm.price),
        description: insectForm.description || null,
        image_url: imageUrl || null,
        location: insectForm.location,
        quantity: parseInt(insectForm.quantity),
        operator: getUserNickname(),
      }
      console.log('发送请求参数:', requestData)

      const res = await Network.request({
        url: '/api/inventory/insects',
        method: 'POST',
        data: requestData,
      })

      console.log('添加昆虫响应:', res.data)

      if (res.data?.code === 200) {
        Taro.showToast({
          title: '添加成功',
          icon: 'success',
        })
        setModalType('none')
        setInsectForm({ name: '', species: '', price: '', description: '', location: '公司总部', quantity: '' })
        setSelectedImage('')
        loadInventory()
      } else {
        throw new Error(res.data?.msg || '添加失败')
      }
    } catch (error) {
      console.error('添加昆虫失败:', error)
      Taro.showToast({
        title: `添加失败: ${error.message || '未知错误'}`,
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
      // 上传操作图片（销售和死亡时）
      const operationImageUrl = (operationForm.operationType === '销售' || operationForm.operationType === '死亡')
        ? await handleUploadOperationImage()
        : null

      const res = await Network.request({
        url: '/api/inventory/logs',
        method: 'POST',
        data: {
          insect_id: selectedInsect.insect_id,
          operation_type: operationForm.operationType,
          quantity,
          location: operationForm.location,
          price: operationForm.operationType === '销售' ? parseInt(operationForm.price) : null,
          remark: operationForm.remark || null,
          image_url: operationImageUrl || null,
          operator: getUserNickname(),
        },
      })

      if (res.data?.code === 200) {
        Taro.showToast({
          title: '操作成功',
          icon: 'success',
        })
        setModalType('none')
        setOperationForm({ operationType: '销售', quantity: '', location: '公司总部', price: '', remark: '' })
        setSelectedInsect(null)
        setSelectedOperationImage('')
        loadInventory()
      }
    } catch (error) {
      console.error('操作失败:', error)
      Taro.showToast({
        title: '操作失败',
        icon: 'none',
      })
    }
  }

  // 执行串货操作
  const handleTransfer = async () => {
    if (!selectedInsect || !transferForm.quantity) {
      Taro.showToast({
        title: '请填写数量',
        icon: 'none',
      })
      return
    }

    if (!transferForm.sourceLocation || !transferForm.targetLocation) {
      Taro.showToast({
        title: '请选择门店',
        icon: 'none',
      })
      return
    }

    if (transferForm.sourceLocation === transferForm.targetLocation) {
      Taro.showToast({
        title: '源门店和目标门店不能相同',
        icon: 'none',
      })
      return
    }

    const quantity = parseInt(transferForm.quantity)

    try {
      const res = await Network.request({
        url: '/api/inventory/transfer',
        method: 'POST',
        data: {
          insect_id: selectedInsect.insect_id,
          source_location: transferForm.sourceLocation,
          target_location: transferForm.targetLocation,
          quantity,
          remark: transferForm.remark || null,
        },
      })

      if (res.data?.code === 200) {
        Taro.showToast({
          title: '串货成功',
          icon: 'success',
        })
        setModalType('none')
        setTransferForm({ quantity: '', sourceLocation: '', targetLocation: '公司总部', remark: '' })
        setSelectedInsect(null)
        loadInventory()
      } else {
        throw new Error(res.data?.msg || '串货失败')
      }
    } catch (error) {
      console.error('串货失败:', error)
      Taro.showToast({
        title: `串货失败: ${error.message || '未知错误'}`,
        icon: 'none',
      })
    }
  }

  // 删除昆虫
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: '无库存', color: 'text-red-600', bg: 'bg-red-50' }
    return { text: '库存正常', color: 'text-emerald-600', bg: 'bg-emerald-50' }
  }

  useLoad(() => {
    initPresetInsects()
    loadInventory()
  })

  useDidShow(() => {
    loadInventory()
  })

  return (
    <View className="flex flex-col h-full bg-gray-50">
      {/* 顶部标题栏 */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex justify-between items-center">
          <Text className="block text-xl font-bold text-gray-900">活体昆虫库存管理</Text>
          <View style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
            <View
              className="bg-blue-500 rounded-lg px-3 py-2"
              onClick={() => Taro.navigateTo({ url: '/pages/statistics/index' })}
            >
              <Activity size={20} color="#ffffff" />
            </View>
            <View
              className="bg-purple-500 rounded-lg px-3 py-2"
              onClick={() => setModalType('setNickname')}
            >
              <User size={20} color="#ffffff" />
            </View>
            <View
              className="bg-emerald-500 rounded-lg px-3 py-2"
              onClick={() => setModalType('addInsect')}
            >
              <Plus size={20} color="#ffffff" />
            </View>
          </View>
        </View>
      </View>

      {/* 搜索框 */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center">
          <Text className="block text-gray-400 mr-2">🔍</Text>
          <View style={{ flex: 1 }}>
            <Input
              style={{ width: '100%' }}
              className="bg-transparent text-base"
              placeholder="搜索昆虫名称..."
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
              placeholderClass="text-gray-400"
            />
          </View>
          {searchKeyword && (
            <Text
              className="block text-gray-400 ml-2 text-base"
              onClick={() => setSearchKeyword('')}
            >
              ✕
            </Text>
          )}
        </View>
      </View>

      {/* 门店筛选器 */}
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
            <Activity size={16} color="#9ca3af" />
          </View>
        </View>
      </View>

      {/* 库存列表 */}
      <ScrollView className="flex-1" scrollY>
        <View className="p-4">
          {loading ? (
            <View className="flex items-center justify-center py-16">
              <View className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></View>
            </View>
          ) : inventory.filter(item => {
              // 根据搜索关键词过滤
              if (!searchKeyword) return true
              const keyword = searchKeyword.toLowerCase()
              return (
                item.insects.name.toLowerCase().includes(keyword) ||
                (item.insects.species && item.insects.species.toLowerCase().includes(keyword))
              )
            }).filter(item => {
              // 根据门店筛选
              if (selectedLocation === '全部') return true
              return item.location === selectedLocation
            }).length === 0 ? (
            <View className="flex flex-col items-center justify-center py-16">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <Text className="block text-base text-gray-500">
                {searchKeyword ? '未找到相关昆虫' : '暂无库存数据'}
              </Text>
            </View>
          ) : (
            inventory.filter(item => {
              // 根据搜索关键词过滤
              if (!searchKeyword) return true
              const keyword = searchKeyword.toLowerCase()
              return (
                item.insects.name.toLowerCase().includes(keyword) ||
                (item.insects.species && item.insects.species.toLowerCase().includes(keyword))
              )
            }).filter(item => {
              // 根据门店筛选
              if (selectedLocation === '全部') return true
              return item.location === selectedLocation
            }).map((item) => {
              const status = getStockStatus(item.quantity)

              // 阻止事件冒泡，避免点击按钮时跳转详情页
              const stopPropagation = (e: any) => {
                e.stopPropagation()
              }

              // 跳转到详情页
              const handleCardClick = () => {
                Taro.navigateTo({
                  url: `/pages/detail/index?id=${item.insects.id}`
                })
              }

              return (
                <View
                  key={item.id}
                  className="bg-white rounded-xl p-4 shadow-sm mb-3"
                  onClick={handleCardClick}
                >
                  <View className="flex gap-3">
                    {/* 昆虫图片 */}
                    {item.insects.image_url ? (
                      <Image
                        src={item.insects.image_url}
                        className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0"
                        mode="aspectFill"
                        lazyLoad
                        showMenuByLongpress={false}
                        onError={() => {
                          console.log('图片加载失败:', item.insects.image_url)
                        }}
                        onLoad={() => {
                          console.log('图片加载成功:', item.insects.image_url)
                        }}
                      />
                    ) : (
                      <View className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        <Package size={32} color="#9ca3af" />
                      </View>
                    )}

                    {/* 昆虫信息 */}
                    <View className="flex-1">
                      <View className="flex justify-between items-start">
                        <View className="flex-1">
                          <Text className="block text-base font-semibold text-gray-900 mb-1">
                            {item.insects.name}
                          </Text>
                          {item.insects.species && (
                            <Text className="block text-sm text-gray-500 mb-1">
                              物种：{item.insects.species}
                            </Text>
                          )}
                          <View className="flex items-center gap-2 mb-2">
                            <Text className="block text-sm text-gray-500">价格：</Text>
                            <Text className="block text-sm font-medium text-emerald-600">
                              ¥{item.insects.price}
                            </Text>
                          </View>
                          <View className="flex items-center gap-2">
                            <Text className="block text-sm text-gray-500">位置：</Text>
                            <Text className="block text-sm text-gray-700">{item.location}</Text>
                          </View>
                        </View>
                        <View className="flex flex-col items-end">
                          <Text
                            className={`block text-2xl font-bold ${status.color} mb-1`}
                          >
                            {item.quantity}
                          </Text>
                          <View className={`${status.bg} px-2 py-1 rounded`}>
                            <Text className={`block text-xs font-medium ${status.color}`}>
                              {status.text}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                    {/* 操作按钮 */}
                    <View className="flex gap-2 mt-4">
                      <View
                        style={{ flex: 1 }}
                        className="bg-purple-50 rounded-lg py-2"
                        onClick={(e) => {
                          stopPropagation(e)
                          setSelectedInsect(item)
                          setTransferForm({
                            ...transferForm,
                            sourceLocation: item.location,
                          })
                          setModalType('transfer')
                        }}
                      >
                        <View className="flex items-center justify-center gap-1">
                          <Activity size={16} color="#9333ea" />
                          <Text className="block text-sm font-medium text-purple-600">串货</Text>
                        </View>
                      </View>
                      <View
                        style={{ flex: 1 }}
                        className="bg-blue-50 rounded-lg py-2"
                        onClick={(e) => {
                          stopPropagation(e)
                          setSelectedInsect(item)
                          setOperationForm({
                            ...operationForm,
                            operationType: '销售',
                            location: item.location, // 自动设置为当前库存所在门店
                          })
                          setModalType('operation')
                        }}
                      >
                        <View className="flex items-center justify-center gap-1">
                          <ShoppingCart size={16} color="#2563EB" />
                          <Text className="block text-sm font-medium text-blue-600">销售</Text>
                        </View>
                      </View>
                      <View
                        style={{ flex: 1 }}
                        className="bg-red-50 rounded-lg py-2"
                        onClick={(e) => {
                          stopPropagation(e)
                          setSelectedInsect(item)
                          setOperationForm({
                            ...operationForm,
                            operationType: '死亡',
                            location: item.location, // 自动设置为当前库存所在门店
                          })
                          setModalType('operation')
                        }}
                      >
                        <View className="flex items-center justify-center gap-1">
                          <X size={16} color="#dc2626" />
                          <Text className="block text-sm font-medium text-red-600">死亡</Text>
                        </View>
                      </View>
                    </View>
                </View>
              )
            })
          )}
        </View>
      </ScrollView>

      {/* 添加昆虫弹窗 */}
      {modalType === 'addInsect' && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <View className="bg-white rounded-t-2xl w-full p-6">
            <Text className="block text-lg font-bold text-gray-900 mb-4">添加昆虫品种</Text>

            {/* 图片选择 */}
            <View className="mb-3">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  className="w-full h-40 rounded-lg bg-gray-100"
                  mode="aspectFill"
                />
              ) : (
                <View
                  className="w-full h-40 rounded-lg bg-gray-100 flex items-center justify-center"
                  onClick={handleChooseImage}
                >
                  <Text className="block text-gray-400">点击选择图片</Text>
                </View>
              )}
              {selectedImage && (
                <Text
                  className="block text-center text-sm text-emerald-600 mt-2"
                  onClick={handleChooseImage}
                >
                  点击更换图片
                </Text>
              )}
            </View>

            {/* 昆虫名称 */}
            <View className="mb-3">
              <View className="flex items-center mb-2">
                <Text className="block text-sm text-gray-700">昆虫名称</Text>
                <Text className="block text-sm text-red-500 ml-1">*</Text>
              </View>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  placeholder="请输入昆虫名称"
                  value={insectForm.name}
                  onInput={(e) => setInsectForm({ ...insectForm, name: e.detail.value })}
                  placeholderClass="text-gray-400"
                />
              </View>
            </View>

            {/* 物种 */}
            <View className="mb-3">
              <Text className="block text-sm text-gray-700 mb-2">物种</Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  placeholder="请输入物种（可选）"
                  value={insectForm.species}
                  onInput={(e) => setInsectForm({ ...insectForm, species: e.detail.value })}
                  placeholderClass="text-gray-400"
                />
              </View>
            </View>

            {/* 单价 */}
            <View className="mb-3">
              <View className="flex items-center mb-2">
                <Text className="block text-sm text-gray-700">单价</Text>
                <Text className="block text-sm text-red-500 ml-1">*</Text>
              </View>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  type="number"
                  placeholder="请输入单价"
                  value={insectForm.price}
                  onInput={(e) => setInsectForm({ ...insectForm, price: e.detail.value })}
                  placeholderClass="text-gray-400"
                />
              </View>
            </View>

            {/* 描述 */}
            <View className="mb-3">
              <Text className="block text-sm text-gray-700 mb-2">描述</Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  placeholder="请输入描述（可选）"
                  value={insectForm.description}
                  onInput={(e) => setInsectForm({ ...insectForm, description: e.detail.value })}
                  placeholderClass="text-gray-400"
                />
              </View>
            </View>

            {/* 门店选择 */}
            <View className="mb-3">
              <View className="flex items-center mb-2">
                <Text className="block text-sm text-gray-700">门店</Text>
                <Text className="block text-sm text-red-500 ml-1">*</Text>
              </View>
              <Picker
                mode="selector"
                range={locationOptions}
                value={locationOptions.indexOf(insectForm.location)}
                onChange={(e) => setInsectForm({ ...insectForm, location: locationOptions[e.detail.value] })}
              >
                <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <Text className={`block text-base ${insectForm.location ? 'text-gray-900' : 'text-gray-400'}`}>
                    {insectForm.location}
                  </Text>
                  <Text className="block text-gray-400">▼</Text>
                </View>
              </Picker>
            </View>

            {/* 初始数量 */}
            <View className="mb-4">
              <View className="flex items-center mb-2">
                <Text className="block text-sm text-gray-700">初始数量</Text>
                <Text className="block text-sm text-red-500 ml-1">*</Text>
              </View>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  type="number"
                  placeholder="请输入初始库存数量"
                  value={insectForm.quantity}
                  onInput={(e) => setInsectForm({ ...insectForm, quantity: e.detail.value })}
                  placeholderClass="text-gray-400"
                />
              </View>
            </View>

            <View style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
              <View style={{ flex: 1 }}>
                <View
                  className="bg-gray-100 rounded-lg"
                  onClick={() => setModalType('none')}
                >
                  <Text className="block text-center py-3 text-gray-700 font-medium">取消</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View
                  className={`rounded-lg ${loading ? 'bg-gray-400' : 'bg-emerald-500'}`}
                  onClick={!loading ? handleAddInsect : undefined}
                >
                  <Text className={`block text-center py-3 text-white font-medium ${loading ? 'opacity-70' : ''}`}>
                    {loading ? '添加中...' : '确定'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 操作弹窗 */}
      {modalType === 'operation' && selectedInsect && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <View className="bg-white rounded-t-2xl w-full p-6">
            <Text className="block text-lg font-bold text-gray-900 mb-2">
              {operationForm.operationType}
            </Text>
            <Text className="block text-sm text-gray-500 mb-4">
              {selectedInsect.insects.name}（当前库存：{selectedInsect.quantity}）
            </Text>

            {/* 数量 */}
            <View className="mb-3">
              <View className="flex items-center mb-2">
                <Text className="block text-sm text-gray-700">数量</Text>
                <Text className="block text-sm text-red-500 ml-1">*</Text>
              </View>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  type="number"
                  placeholder="请输入数量"
                  value={operationForm.quantity}
                  onInput={(e) => setOperationForm({ ...operationForm, quantity: e.detail.value })}
                  placeholderClass="text-gray-400"
                />
              </View>
            </View>

            {/* 位置 */}
            <View className="mb-3">
              <Text className="block text-sm text-gray-700 mb-2">位置</Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Picker
                  mode="selector"
                  range={locationOptions}
                  value={locationOptions.indexOf(operationForm.location)}
                  onChange={(e) =>
                    setOperationForm({ ...operationForm, location: locationOptions[e.detail.value] })
                  }
                >
                  <View className="flex justify-between items-center">
                    <Text className="block text-base text-gray-700">
                      {operationForm.location || '请选择位置'}
                    </Text>
                    <Text className="block text-sm text-gray-400">›</Text>
                  </View>
                </Picker>
              </View>
            </View>

            {/* 实收价格（仅销售时显示） */}
            {operationForm.operationType === '销售' && (
              <View className="mb-3">
                <View className="flex items-center mb-2">
                  <Text className="block text-sm text-gray-700">实收价格</Text>
                  <Text className="block text-sm text-red-500 ml-1">*</Text>
                </View>
                <View className="bg-gray-50 rounded-xl px-4 py-3">
                  <Input
                    className="w-full bg-transparent text-base"
                    type="digit"
                    placeholder="请输入实收价格"
                    value={operationForm.price}
                    onInput={(e) => setOperationForm({ ...operationForm, price: e.detail.value })}
                    placeholderClass="text-gray-400"
                  />
                </View>
              </View>
            )}

            {/* 实景图片上传（仅销售和死亡时显示） */}
            {(operationForm.operationType === '销售' || operationForm.operationType === '死亡') && (
              <View className="mb-3">
                <Text className="block text-sm text-red-600 mb-2">* 实景图片（必需）</Text>
                {selectedOperationImage ? (
                  <Image
                    src={selectedOperationImage}
                    className="w-full h-40 rounded-lg bg-gray-100"
                    mode="aspectFill"
                  />
                ) : (
                  <View
                    className="w-full h-40 rounded-lg bg-gray-100 flex items-center justify-center"
                    onClick={handleTakeOperationPhoto}
                  >
                    <View className="flex flex-col items-center">
                      <Camera size={32} color="#9ca3af" />
                      <Text className="block text-gray-400 text-sm mt-2">点击拍摄实景图片</Text>
                    </View>
                  </View>
                )}
                {selectedOperationImage && (
                  <Text
                    className="block text-center text-sm text-emerald-600 mt-2"
                    onClick={handleTakeOperationPhoto}
                  >
                    重新拍摄
                  </Text>
                )}
              </View>
            )}

            {/* 备注 */}
            <View className="mb-4">
              <Text className="block text-sm text-gray-700 mb-2">备注</Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  placeholder="请输入备注（可选）"
                  value={operationForm.remark}
                  onInput={(e) => setOperationForm({ ...operationForm, remark: e.detail.value })}
                  placeholderClass="text-gray-400"
                />
              </View>
            </View>

            <View style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
              <View style={{ flex: 1 }}>
                <View
                  className="bg-gray-100 rounded-lg"
                  onClick={() => {
                    setModalType('none')
                    setSelectedInsect(null)
                    setSelectedOperationImage('')
                  }}
                >
                  <Text className="block text-center py-3 text-gray-700 font-medium">取消</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View
                  className="bg-emerald-500 rounded-lg"
                  onClick={handleOperation}
                >
                  <Text className="block text-center py-3 text-white font-medium">确定</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 串货弹窗 */}
      {modalType === 'transfer' && selectedInsect && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <View className="bg-white rounded-t-2xl w-full p-6">
            <Text className="block text-lg font-bold text-gray-900 mb-2">串货</Text>
            <Text className="block text-sm text-gray-500 mb-4">
              {selectedInsect.insects.name}（当前库存：{selectedInsect.quantity}，位置：{selectedInsect.location}）
            </Text>

            {/* 源门店 */}
            <View className="mb-3">
              <View className="flex items-center mb-2">
                <Text className="block text-sm text-gray-700">源门店</Text>
                <Text className="block text-sm text-red-500 ml-1">*</Text>
              </View>
              <Picker
                mode="selector"
                range={locationOptions}
                value={locationOptions.indexOf(transferForm.sourceLocation)}
                onChange={(e) => setTransferForm({ ...transferForm, sourceLocation: locationOptions[e.detail.value] })}
              >
                <View className="bg-gray-50 rounded-xl px-4 py-3">
                  <View className="flex justify-between items-center">
                    <Text className={`block text-base ${transferForm.sourceLocation ? 'text-gray-900' : 'text-gray-400'}`}>
                      {transferForm.sourceLocation || '请选择源门店'}
                    </Text>
                    <Text className="block text-sm text-gray-400">›</Text>
                  </View>
                </View>
              </Picker>
            </View>

            {/* 目标门店 */}
            <View className="mb-3">
              <View className="flex items-center mb-2">
                <Text className="block text-sm text-gray-700">目标门店</Text>
                <Text className="block text-sm text-red-500 ml-1">*</Text>
              </View>
              <Picker
                mode="selector"
                range={locationOptions}
                value={locationOptions.indexOf(transferForm.targetLocation)}
                onChange={(e) => setTransferForm({ ...transferForm, targetLocation: locationOptions[e.detail.value] })}
              >
                <View className="bg-gray-50 rounded-xl px-4 py-3">
                  <View className="flex justify-between items-center">
                    <Text className={`block text-base ${transferForm.targetLocation ? 'text-gray-900' : 'text-gray-400'}`}>
                      {transferForm.targetLocation || '请选择目标门店'}
                    </Text>
                    <Text className="block text-sm text-gray-400">›</Text>
                  </View>
                </View>
              </Picker>
            </View>

            {/* 数量 */}
            <View className="mb-3">
              <View className="flex items-center mb-2">
                <Text className="block text-sm text-gray-700">数量</Text>
                <Text className="block text-sm text-red-500 ml-1">*</Text>
              </View>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  type="number"
                  placeholder="请输入串货数量"
                  value={transferForm.quantity}
                  onInput={(e) => setTransferForm({ ...transferForm, quantity: e.detail.value })}
                  placeholderClass="text-gray-400"
                />
              </View>
            </View>

            {/* 备注 */}
            <View className="mb-4">
              <Text className="block text-sm text-gray-700 mb-2">备注</Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  placeholder="请输入备注（可选）"
                  value={transferForm.remark}
                  onInput={(e) => setTransferForm({ ...transferForm, remark: e.detail.value })}
                  placeholderClass="text-gray-400"
                />
              </View>
            </View>

            <View style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
              <View style={{ flex: 1 }}>
                <View
                  className="bg-gray-100 rounded-lg"
                  onClick={() => {
                    setModalType('none')
                    setSelectedInsect(null)
                    setTransferForm({ quantity: '', sourceLocation: '', targetLocation: '公司总部', remark: '' })
                  }}
                >
                  <Text className="block text-center py-3 text-gray-700 font-medium">取消</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View
                  className="bg-purple-500 rounded-lg"
                  onClick={handleTransfer}
                >
                  <Text className="block text-center py-3 text-white font-medium">确定</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 设置昵称弹窗 */}
      {modalType === 'setNickname' && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <View className="bg-white rounded-xl w-4/5 max-w-sm mx-4 p-6">
            <Text className="block text-lg font-bold text-gray-900 mb-4">
              设置昵称
            </Text>
            <View className="mb-4">
              <Text className="block text-sm text-gray-700 mb-2">请输入您的昵称</Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-base"
                  placeholder="输入昵称"
                  value={newNickname}
                  onInput={(e) => setNewNickname(e.detail.value)}
                  placeholderClass="text-gray-400"
                />
              </View>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
              <View
                style={{ flex: 1 }}
                className="bg-gray-200 text-gray-700 rounded-lg py-3 flex items-center justify-center"
                onClick={() => {
                  setModalType('none')
                  setNewNickname('')
                }}
              >
                <Text className="block text-base font-medium">取消</Text>
              </View>
              <View
                style={{ flex: 1 }}
                className="bg-purple-500 rounded-lg py-3 flex items-center justify-center"
                onClick={() => {
                  if (!newNickname || newNickname.trim().length === 0) {
                    Taro.showToast({
                      title: '请输入昵称',
                      icon: 'none',
                    })
                    return
                  }

                  setUserNickname(newNickname.trim())
                  setModalType('none')
                  setNewNickname('')

                  Taro.showToast({
                    title: '昵称设置成功',
                    icon: 'success',
                  })
                }}
              >
                <Text className="block text-base font-medium text-white">确定</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 门店选择器弹窗 */}
      {showLocationPicker && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <View className="bg-white rounded-xl w-4/5 max-w-sm mx-4 p-6">
            <Text className="block text-lg font-bold text-gray-900 mb-4">
              选择门店
            </Text>
            <View className="space-y-2 mb-6">
              {['全部', ...locationOptions].map(location => (
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
                className="bg-gray-200 text-gray-700 rounded-lg py-3 flex items-center justify-center"
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

export default IndexPage
