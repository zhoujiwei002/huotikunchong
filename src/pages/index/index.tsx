import { View, Text, Image, ScrollView, Button, Input, Picker } from '@tarojs/components'
import Taro, { useLoad, chooseImage } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Plus, X, Camera, Bug } from 'lucide-react-taro'
import {
  initSupabase,
  getAllInventory,
  createInsect,
  getInsectByName,
} from '@/services/supabase'
import './index.css'

// 预设昆虫品种
const PRESET_INSECTS = [
  '天门螳螂',
  '天门甲虫',
  '晋中甲虫',
  '绥化甲虫',
  '本溪甲虫',
  '天门睫角',
]

// 昆虫品种对应的颜色配置
const INSECT_COLORS: Record<string, { bg: string; text: string; iconColor: string }> = {
  '天门螳螂': { bg: 'bg-green-100', text: 'text-green-700', iconColor: '#22c55e' },
  '天门甲虫': { bg: 'bg-blue-100', text: 'text-blue-700', iconColor: '#3b82f6' },
  '晋中甲虫': { bg: 'bg-purple-100', text: 'text-purple-700', iconColor: '#a855f7' },
  '绥化甲虫': { bg: 'bg-orange-100', text: 'text-orange-700', iconColor: '#f97316' },
  '本溪甲虫': { bg: 'bg-pink-100', text: 'text-pink-700', iconColor: '#ec4899' },
  '天门睫角': { bg: 'bg-teal-100', text: 'text-teal-700', iconColor: '#14b8a6' },
}

// 获取昆虫颜色配置
const getInsectColor = (name: string) => {
  return INSECT_COLORS[name] || { bg: 'bg-gray-100', text: 'text-gray-700', iconColor: '#6b7280' }
}

const IndexPage = () => {
  const [inventory, setInventory] = useState<any[]>([])
  const [modalType, setModalType] = useState<'none' | 'add'>('none')
  const [loading, setLoading] = useState(false)
  const [insectForm, setInsectForm] = useState({
    name: '',
    species: '',
    price: '',
    description: '',
  })
  const [selectedImage, setSelectedImage] = useState('')

  // 初始化
  useLoad(async () => {
    console.log('[IndexPage] useLoad 开始执行')
    initSupabase()
    await loadInventory()
  })

  // 加载库存数据
  const loadInventory = async () => {
    try {
      console.log('[IndexPage] 开始加载昆虫列表')
      const data = await getAllInventory()
      console.log('[IndexPage] 昆虫列表加载成功，数量:', data.length)
      setInventory(data)
    } catch (error) {
      console.error('[IndexPage] 加载昆虫列表失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none',
      })
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
        const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
        if (isWeapp) {
          const compressRes = await Taro.compressImage({
            src: res.tempFilePaths[0],
            quality: 75,
          })
          setSelectedImage(compressRes.tempFilePath)
        } else {
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

  // 添加昆虫
  const handleAddInsect = async () => {
    if (!insectForm.name.trim()) {
      Taro.showToast({
        title: '请输入昆虫名称',
        icon: 'none',
      })
      return
    }

    if (!insectForm.price.trim()) {
      Taro.showToast({
        title: '请输入价格',
        icon: 'none',
      })
      return
    }

    setLoading(true)

    try {
      // 上传图片
      let imageUrl: string | null = null
      if (selectedImage) {
        imageUrl = await uploadFile(selectedImage)
      }

      // 检查是否已存在
      const existing = await getInsectByName(insectForm.name)
      if (existing) {
        Taro.showToast({
          title: '该昆虫已存在',
          icon: 'none',
        })
        setLoading(false)
        return
      }

      // 创建昆虫
      await createInsect({
        name: insectForm.name,
        species: insectForm.species || null,
        price: parseFloat(insectForm.price),
        description: insectForm.description || null,
        image_url: imageUrl,
      })

      Taro.showToast({
        title: '添加成功',
        icon: 'success',
      })

      // 重置表单
      setInsectForm({
        name: '',
        species: '',
        price: '',
        description: '',
      })
      setSelectedImage('')
      setModalType('none')

      // 重新加载
      await loadInventory()
    } catch (error) {
      console.error('[IndexPage] 添加昆虫失败:', error)
      Taro.showToast({
        title: '添加失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 上传文件
  const uploadFile = async (filePath: string): Promise<string> => {
    try {
      const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP

      let fileData: ArrayBuffer | null = null
      let fileName = ''

      if (isWeapp) {
        // 小程序端
        const res = await Taro.getFileSystemManager().readFile({
          filePath,
        })
        fileData = res.data
        fileName = `${Date.now()}.jpg`
      } else {
        // H5 端
        const res = await Taro.request({
          url: filePath,
          responseType: 'arraybuffer',
        })
        fileData = res.data
        fileName = `${Date.now()}.jpg`
      }

      if (!fileData) {
        throw new Error('无法读取文件')
      }

      // 使用 Supabase Storage 上传
      const { createClient } = await import('@supabase/supabase-js')
      const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import('@/services/supabase')

      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

      const { data, error } = await supabase.storage
        .from('insects')
        .upload(fileName, fileData, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (error) throw error

      // 获取公共 URL
      const { data: publicUrlData } = supabase.storage
        .from('insects')
        .getPublicUrl(data.path)

      return publicUrlData.publicUrl
    } catch (error) {
      console.error('[IndexPage] 上传图片失败:', error)
      throw new Error('上传图片失败')
    }
  }

  return (
    <View className="w-full h-full flex flex-col bg-gray-50">
      {/* 顶部标题 */}
      <View className="bg-white p-4 shadow-sm">
        <Text className="block text-xl font-bold text-gray-800 text-center">昆虫品种</Text>
      </View>

      {/* 昆虫列表 */}
      <ScrollView className="flex-1" scrollY>
        <View className="p-4 space-y-3">
          {inventory.map((item) => {
            const color = getInsectColor(item.insects.name)
            return (
              <View key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
                <View className="flex gap-3 items-center">
                  <View
                    className={`flex-shrink-0 ${color.bg} flex items-center justify-center`}
                    style={{ width: '60px', height: '60px', borderRadius: '8px', border: `2px solid ${color.iconColor}20` }}
                  >
                    {item.insects.image_url ? (
                      <Image
                        src={item.insects.image_url}
                        className="w-full h-full rounded-lg"
                        mode="aspectFill"
                        style={{ borderRadius: '8px' }}
                      />
                    ) : (
                      <Bug size={28} color={color.iconColor} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="block text-lg font-semibold text-gray-800">{item.insects.name}</Text>
                  </View>
                </View>
              </View>
            )
          })}
          {inventory.length === 0 && (
            <View className="flex flex-col items-center justify-center py-20">
              <Text className="block text-gray-400">暂无昆虫品种</Text>
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
    </View>
  )
}

export default IndexPage
