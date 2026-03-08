import { Injectable, OnModuleInit } from '@nestjs/common'
import { getSupabaseClient } from '../storage/database/supabase-client'

// 预设的仓库位置
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

// 预设的昆虫品种
const INSECTS = [
  { name: '天门螳螂', species: 'Mantis', price: 150, description: '来自天门的螳螂品种' },
  { name: '天门甲虫', species: 'Beetle', price: 120, description: '来自天门的甲虫品种' },
  { name: '晋中甲虫', species: 'Beetle', price: 100, description: '来自晋中的甲虫品种' },
  { name: '绥化甲虫', species: 'Beetle', price: 110, description: '来自绥化的甲虫品种' },
  { name: '本溪甲虫', species: 'Beetle', price: 130, description: '来自本溪的甲虫品种' },
  { name: '天门睫角', species: 'Gecko', price: 200, description: '来自天门的睫角守宫' },
]

@Injectable()
export class InitService implements OnModuleInit {
  private client = getSupabaseClient()

  async onModuleInit() {
    console.log('🚀 开始初始化数据库...')
    await this.initializeData()
    console.log('✅ 数据库初始化完成')
  }

  private async initializeData() {
    // 检查是否已经初始化过（通过检查是否有预设昆虫）
    const { data: existingInsects, error: checkError } = await this.client
      .from('insects')
      .select('name')
      .in('name', INSECTS.map(i => i.name))
      .limit(1)

    if (checkError) {
      console.error('❌ 检查数据库状态失败:', checkError.message)
      return
    }

    if (existingInsects && existingInsects.length > 0) {
      console.log('✅ 数据库已初始化，跳过')
      return
    }

    // 初始化昆虫品种
    await this.initializeInsects()

    console.log('🎉 预设数据初始化完成')
  }

  private async initializeInsects() {
    console.log('📦 开始初始化昆虫品种...')

    for (const insect of INSECTS) {
      // 创建昆虫品种
      const { data: newInsect, error: insectError } = await this.client
        .from('insects')
        .insert(insect)
        .select()
        .single()

      if (insectError) {
        console.error(`❌ 创建昆虫品种失败 [${insect.name}]:`, insectError.message)
        continue
      }

      // 为每个昆虫品种创建初始库存记录（数量为 0，位置为公司总部）
      const { error: inventoryError } = await this.client
        .from('inventory')
        .insert({
          insect_id: newInsect.id,
          quantity: 0,
          location: '公司总部',
        })

      if (inventoryError) {
        console.error(`❌ 创建库存记录失败 [${insect.name}]:`, inventoryError.message)
        continue
      }

      console.log(`✅ 已创建: ${insect.name} (ID: ${newInsect.id})`)
    }

    console.log('✅ 昆虫品种初始化完成')
  }

  // 获取所有仓库位置
  getLocations() {
    return LOCATIONS
  }
}
