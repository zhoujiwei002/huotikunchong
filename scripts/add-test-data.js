/**
 * 添加测试库存数据脚本
 *
 * 使用方法：
 * 1. 确保 .env.local 文件已配置 SUPABASE_URL 和 SUPABASE_ANON_KEY
 * 2. 运行: node scripts/add-test-data.js
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// 从环境变量读取配置
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 错误：请在 .env.local 文件中配置 SUPABASE_URL 和 SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 测试数据：为预设昆虫品种添加库存
const testData = [
  { name: '天门螳螂', quantity: 50, location: '公司总部' },
  { name: '天门甲虫', quantity: 100, location: '公司总部' },
  { name: '晋中甲虫', quantity: 80, location: '公司总部' },
  { name: '绥化甲虫', quantity: 60, location: '公司总部' },
  { name: '本溪甲虫', quantity: 90, location: '公司总部' },
  { name: '天门睫角', quantity: 40, location: '公司总部' },
]

async function addTestData() {
  console.log('🚀 开始添加测试数据...\n')

  for (const item of testData) {
    try {
      // 1. 查询昆虫品种
      const { data: insect, error: insectError } = await supabase
        .from('insects')
        .select('*')
        .eq('name', item.name)
        .single()

      if (insectError) {
        console.error(`❌ 查询昆虫 "${item.name}" 失败:`, insectError.message)
        continue
      }

      // 2. 查询现有的库存记录
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('insect_id', insect.id)
        .eq('location', item.location)
        .single()

      if (inventoryError && inventoryError.code !== 'PGRST116') {
        console.error(`❌ 查询库存失败:`, inventoryError.message)
        continue
      }

      if (inventory) {
        // 3. 更新现有库存
        const { error: updateError } = await supabase
          .from('inventory')
          .update({ quantity: item.quantity })
          .eq('id', inventory.id)

        if (updateError) {
          console.error(`❌ 更新库存 "${item.name}" 失败:`, updateError.message)
        } else {
          console.log(`✅ 更新库存 "${item.name}" 成功: ${item.quantity} 只`)
        }
      } else {
        // 4. 创建新库存记录
        const { error: createError } = await supabase
          .from('inventory')
          .insert({
            insect_id: insect.id,
            quantity: item.quantity,
            location: item.location,
          })

        if (createError) {
          console.error(`❌ 创建库存 "${item.name}" 失败:`, createError.message)
        } else {
          console.log(`✅ 创建库存 "${item.name}" 成功: ${item.quantity} 只`)
        }
      }
    } catch (error) {
      console.error(`❌ 处理 "${item.name}" 时出错:`, error.message)
    }
  }

  console.log('\n🎉 测试数据添加完成！')
  console.log('请刷新 H5 页面查看效果: https://zhoujiwei002.github.io/huotikunchong/')
}

addTestData()
