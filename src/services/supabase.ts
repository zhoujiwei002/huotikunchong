/**
 * Supabase 数据服务
 * 封装所有 Supabase 数据操作，替代原有的后端 API
 */

import { createClient } from '@supabase/supabase-js'

// Supabase 配置（从环境变量注入）
declare const __VITE_SUPABASE_URL__: string
declare const __VITE_SUPABASE_ANON_KEY__: string

const SUPABASE_URL = typeof __VITE_SUPABASE_URL__ !== 'undefined' ? __VITE_SUPABASE_URL__ : process.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = typeof __VITE_SUPABASE_ANON_KEY__ !== 'undefined' ? __VITE_SUPABASE_ANON_KEY__ : process.env.VITE_SUPABASE_ANON_KEY || ''

// 数据类型定义
export interface Insect {
  id: string
  name: string
  species: string | null
  price: number
  description: string | null
  image_url: string | null
  created_at: string
  updated_at: string | null
}

export interface Inventory {
  id: string
  insect_id: string
  quantity: number
  location: string
  created_at: string
  updated_at: string | null
}

export interface InventoryWithInsect extends Inventory {
  insects: Insect
}

export interface OperationLog {
  id: string
  insect_id: string
  operation_type: '销售' | '死亡' | '进货'
  quantity: number
  location: string
  price: number | null
  remark: string | null
  image_url: string | null
  operator: string
  created_at: string
  updated_at: string | null
}

export interface OperationLogWithInsect extends OperationLog {
  insects: Insect
}

// 全局 Supabase 客户端
let supabaseClient: ReturnType<typeof createClient> | null = null

// 初始化 Supabase 客户端
export const initSupabase = () => {
  const supabaseUrl = SUPABASE_URL || ''
  const supabaseAnonKey = SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] Supabase 配置缺失，请在 .env 文件中配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
    return false
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

  console.log('[Supabase] Supabase 初始化成功，URL:', supabaseUrl)
  return true
}

// 获取 Supabase 客户端
export const getSupabaseClient = () => {
  if (!supabaseClient) {
    throw new Error('[Supabase] Supabase 客户端未初始化，请先调用 initSupabase()')
  }
  return supabaseClient
}

// ==================== 昆虫品种管理 ====================

/**
 * 获取所有昆虫品种
 */
export const getAllInsects = async (): Promise<Insect[]> => {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('insects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[Supabase] 获取昆虫品种失败:', error)
    throw new Error('获取昆虫品种失败')
  }
}

/**
 * 根据名称查询昆虫
 */
export const getInsectByName = async (name: string): Promise<Insect | null> => {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('insects')
      .select('*')
      .eq('name', name)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[Supabase] 查询昆虫失败:', error)
      return null
    }
    return data
  } catch (error) {
    console.error('[Supabase] 查询昆虫失败:', error)
    return null
  }
}

/**
 * 创建昆虫品种
 */
export const createInsect = async (insect: {
  name: string
  species?: string | null
  price: number
  description?: string | null
  image_url?: string | null
}): Promise<Insect> => {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('insects')
      .insert({
        name: insect.name,
        species: insect.species || null,
        price: insect.price,
        description: insect.description || null,
        image_url: insect.image_url || null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[Supabase] 创建昆虫品种失败:', error)
    throw new Error('创建昆虫品种失败')
  }
}

/**
 * 删除昆虫品种
 */
export const deleteInsect = async (id: string): Promise<void> => {
  try {
    const client = getSupabaseClient()
    const { error } = await client.from('insects').delete().eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('[Supabase] 删除昆虫品种失败:', error)
    throw new Error('删除昆虫品种失败')
  }
}

// ==================== 库存管理 ====================

/**
 * 获取所有库存
 */
export const getAllInventory = async (location?: string): Promise<InventoryWithInsect[]> => {
  try {
    const client = getSupabaseClient()
    let query = client
      .from('inventory')
      .select(`
        *,
        insects (*)
      `)
      .order('created_at', { ascending: false })

    if (location) {
      query = query.eq('location', location)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []) as InventoryWithInsect[]
  } catch (error) {
    console.error('[Supabase] 获取库存失败:', error)
    throw new Error('获取库存失败')
  }
}

/**
 * 更新库存数量
 */
export const updateInventory = async (
  id: string,
  updates: { quantity: number }
): Promise<void> => {
  try {
    const client = getSupabaseClient()
    const { error } = await client
      .from('inventory')
      .update(updates)
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('[Supabase] 更新库存失败:', error)
    throw new Error('更新库存失败')
  }
}

/**
 * 删除库存记录
 */
export const deleteInventory = async (id: string): Promise<void> => {
  try {
    const client = getSupabaseClient()
    const { error } = await client.from('inventory').delete().eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('[Supabase] 删除库存记录失败:', error)
    throw new Error('删除库存记录失败')
  }
}

// ==================== 操作日志管理 ====================

/**
 * 创建操作日志
 */
export const createOperationLog = async (log: {
  insect_id: string
  operation_type: '销售' | '死亡' | '进货'
  quantity: number
  location: string
  price?: number | null
  remark?: string | null
  image_url?: string | null
  operator: string
}): Promise<OperationLog> => {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('operation_logs')
      .insert(log)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[Supabase] 创建操作日志失败:', error)
    throw new Error('创建操作日志失败')
  }
}

/**
 * 获取所有操作日志
 */
export const getAllOperationLogs = async (
  insectId?: string
): Promise<OperationLogWithInsect[]> => {
  try {
    const client = getSupabaseClient()
    let query = client
      .from('operation_logs')
      .select(`
        *,
        insects (*)
      `)
      .order('created_at', { ascending: false })

    if (insectId) {
      query = query.eq('insect_id', insectId)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []) as OperationLogWithInsect[]
  } catch (error) {
    console.error('[Supabase] 获取操作日志失败:', error)
    throw new Error('获取操作日志失败')
  }
}

// ==================== 文件上传 ====================

/**
 * 上传文件到 Supabase Storage
 */
export const uploadFile = async (
  filePath: string,
  fileData: ArrayBuffer,
  contentType: string = 'image/jpeg'
): Promise<string> => {
  try {
    const client = getSupabaseClient()
    const fileName = `insect-${Date.now()}-${Math.random().toString(36).substring(7)}`

    const { data, error } = await client.storage
      .from('insect-images')
      .upload(fileName, fileData, {
        contentType,
        upsert: false,
      })

    if (error) throw error

    // 获取公共 URL
    const { data: publicUrlData } = client.storage
      .from('insect-images')
      .getPublicUrl(data.path)

    return publicUrlData.publicUrl
  } catch (error) {
    console.error('[Supabase] 上传文件失败:', error)
    throw new Error('上传文件失败')
  }
}

// ==================== 数据统计 ====================

/**
 * 获取库存统计
 */
export const getInventoryStats = async () => {
  try {
    const client = getSupabaseClient()

    // 获取总库存数量
    const { data: inventoryData, error: inventoryError } = await client
      .from('inventory')
      .select('quantity')

    if (inventoryError) throw inventoryError

    const totalQuantity = inventoryData?.reduce((sum, item) => sum + item.quantity, 0) || 0

    // 获取昆虫品种数量
    const { count: insectCount, error: insectError } = await client
      .from('insects')
      .select('*', { count: 'exact', head: true })

    if (insectError) throw insectError

    return {
      totalQuantity,
      insectCount: insectCount || 0,
    }
  } catch (error) {
    console.error('[Supabase] 获取库存统计失败:', error)
    throw new Error('获取库存统计失败')
  }
}
