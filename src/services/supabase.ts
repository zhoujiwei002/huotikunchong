/**
 * Supabase 数据服务 - 简化版
 * 只支持昆虫数量管理
 */

import { createClient } from '@supabase/supabase-js'

// Supabase 配置（从环境变量注入）
declare const __VITE_SUPABASE_URL__: string
declare const __VITE_SUPABASE_ANON_KEY__: string

export const SUPABASE_URL = typeof __VITE_SUPABASE_URL__ !== 'undefined' ? __VITE_SUPABASE_URL__ : ''
export const SUPABASE_ANON_KEY = typeof __VITE_SUPABASE_ANON_KEY__ !== 'undefined' ? __VITE_SUPABASE_ANON_KEY__ : ''

// 数据类型定义
export interface Insect {
  id: string
  name: string
  quantity: number
  created_at: string
  updated_at: string | null
}

// 全局 Supabase 客户端
let supabaseClient: ReturnType<typeof createClient> | null = null

// 初始化 Supabase 客户端
export const initSupabase = () => {
  const supabaseUrl = SUPABASE_URL || ''
  const supabaseAnonKey = SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] Supabase 配置缺失')
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

// ==================== 昆虫管理 ====================

/**
 * 获取所有昆虫
 */
export const getInsects = async (): Promise<Insect[]> => {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('insects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[Supabase] 获取昆虫失败:', error)
    throw new Error('获取昆虫失败')
  }
}

/**
 * 创建昆虫
 */
export const createInsect = async (insect: {
  name: string
  quantity: number
}): Promise<Insect> => {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('insects')
      .insert({
        name: insect.name,
        quantity: insect.quantity,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[Supabase] 创建昆虫失败:', error)
    throw new Error('创建昆虫失败')
  }
}

/**
 * 更新昆虫数量
 */
export const updateInsectQuantity = async (
  id: string,
  delta: number
): Promise<void> => {
  try {
    const client = getSupabaseClient()

    // 先获取当前数量
    const { data: current, error: fetchError } = await client
      .from('insects')
      .select('quantity')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const newQuantity = Math.max(0, (current.quantity || 0) + delta)

    // 更新数量
    const { error } = await client
      .from('insects')
      .update({ quantity: newQuantity })
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('[Supabase] 更新昆虫数量失败:', error)
    throw new Error('更新昆虫数量失败')
  }
}

/**
 * 删除昆虫
 */
export const deleteInsect = async (id: string): Promise<void> => {
  try {
    const client = getSupabaseClient()
    const { error } = await client.from('insects').delete().eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('[Supabase] 删除昆虫失败:', error)
    throw new Error('删除昆虫失败')
  }
}
