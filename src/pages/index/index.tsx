import { View, Text, ScrollView, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Plus as PlusIcon, X, Trash2 } from 'lucide-react-taro'
import { initSupabase, getInsects, createInsect, updateInsectQuantity, deleteInsect } from '@/services/supabase'
import './index.css'

const IndexPage = () => {
  const [insects, setInsects] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', quantity: '' })
  const [loading, setLoading] = useState(false)

  // 初始化
  useEffect(() => {
    initSupabase()
    loadInsects()
  }, [])

  // 加载昆虫列表
  const loadInsects = async () => {
    try {
      const data = await getInsects()
      setInsects(data)
    } catch (error) {
      console.error('加载失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none',
      })
    }
  }

  // 增加数量
  const handleIncrease = async (id: string) => {
    try {
      await updateInsectQuantity(id, 1)
      await loadInsects()
    } catch (error) {
      console.error('增加数量失败:', error)
      Taro.showToast({
        title: '操作失败',
        icon: 'none',
      })
    }
  }

  // 减少数量
  const handleDecrease = async (id: string, currentQuantity: number) => {
    if (currentQuantity <= 0) {
      Taro.showToast({
        title: '数量不能小于 0',
        icon: 'none',
      })
      return
    }

    try {
      await updateInsectQuantity(id, -1)
      await loadInsects()
    } catch (error) {
      console.error('减少数量失败:', error)
      Taro.showToast({
        title: '操作失败',
        icon: 'none',
      })
    }
  }

  // 添加昆虫
  const handleAdd = async () => {
    if (!addForm.name.trim()) {
      Taro.showToast({
        title: '请输入名称',
        icon: 'none',
      })
      return
    }

    if (!addForm.quantity.trim()) {
      Taro.showToast({
        title: '请输入数量',
        icon: 'none',
      })
      return
    }

    setLoading(true)

    try {
      await createInsect({
        name: addForm.name,
        quantity: parseInt(addForm.quantity),
      })

      Taro.showToast({
        title: '添加成功',
        icon: 'success',
      })

      setAddForm({ name: '', quantity: '' })
      setShowAddModal(false)
      await loadInsects()
    } catch (error) {
      console.error('添加失败:', error)
      Taro.showToast({
        title: '添加失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  // 删除昆虫
  const handleDelete = async (id: string) => {
    try {
      const res = await Taro.showModal({
        title: '确认删除',
        content: '确定要删除这个昆虫吗？',
      })

      if (res.confirm) {
        await deleteInsect(id)
        await loadInsects()
        Taro.showToast({
          title: '删除成功',
          icon: 'success',
        })
      }
    } catch (error) {
      console.error('删除失败:', error)
      Taro.showToast({
        title: '删除失败',
        icon: 'none',
      })
    }
  }

  return (
    <View className="w-full h-full flex flex-col bg-gray-50">
      {/* 顶部标题 */}
      <View className="bg-white p-4 shadow-sm">
        <Text className="block text-xl font-bold text-gray-800 text-center">昆虫数量管理</Text>
      </View>

      {/* 昆虫列表 */}
      <ScrollView className="flex-1" scrollY>
        <View className="p-4 space-y-3">
          {insects.map((item) => (
            <View key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
              <View className="flex items-center justify-between">
                <View className="flex-1">
                  <Text className="block text-lg font-semibold text-gray-800">{item.name}</Text>
                </View>
                <View className="flex items-center gap-3">
                  <View className="flex items-center gap-2">
                    <Button
                      size="mini"
                      onClick={() => handleDecrease(item.id, item.quantity)}
                      disabled={item.quantity <= 0}
                    >
                      -
                    </Button>
                    <Text className="block text-lg font-medium text-gray-800 min-w-[40px] text-center">
                      {item.quantity}
                    </Text>
                    <Button
                      size="mini"
                      type="primary"
                      onClick={() => handleIncrease(item.id)}
                    >
                      +
                    </Button>
                  </View>
                  <View onClick={() => handleDelete(item.id)}>
                    <Trash2 size={20} color="#ef4444" />
                  </View>
                </View>
              </View>
            </View>
          ))}

          {insects.length === 0 && (
            <View className="flex flex-col items-center justify-center py-20">
              <Text className="block text-gray-400">暂无昆虫</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 添加按钮 */}
      <View className="fixed bottom-6 left-0 right-0 px-4">
        <Button
          type="primary"
          className="w-full"
          onClick={() => setShowAddModal(true)}
        >
          添加昆虫
        </Button>
      </View>

      {/* 添加昆虫模态框 */}
      {showAddModal && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md">
            <View className="flex justify-between items-center mb-4">
              <Text className="block text-lg font-bold">添加昆虫</Text>
              <View onClick={() => setShowAddModal(false)}>
                <X size={24} className="text-gray-500" />
              </View>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="block text-sm text-gray-600 mb-2">名称</Text>
                <View className="bg-gray-50 rounded-lg px-4 py-3">
                  <Input
                    placeholder="请输入名称"
                    value={addForm.name}
                    onInput={(e) => setAddForm({ ...addForm, name: e.detail.value })}
                  />
                </View>
              </View>

              <View>
                <Text className="block text-sm text-gray-600 mb-2">数量</Text>
                <View className="bg-gray-50 rounded-lg px-4 py-3">
                  <Input
                    placeholder="请输入数量"
                    type="number"
                    value={addForm.quantity}
                    onInput={(e) => setAddForm({ ...addForm, quantity: e.detail.value })}
                  />
                </View>
              </View>
            </View>

            <View className="flex gap-3 mt-6">
              <View className="flex-1">
                <Button
                  type="default"
                  onClick={() => setShowAddModal(false)}
                >
                  取消
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  type="primary"
                  loading={loading}
                  onClick={handleAdd}
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
