/**
 * 删除所有昆虫品种和库存数据
 *
 * 使用方法：
 * node scripts/delete-all-insects.js
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

async function deleteAllInsects() {
  console.log('🗑️  开始删除所有昆虫品种...\n')

  try {
    // 1. 先查询所有昆虫
    const { data: insects, error: queryError } = await supabase
      .from('insects')
      .select('id, name')

    if (queryError) {
      console.error('❌ 查询昆虫失败:', queryError.message)
      process.exit(1)
    }

    if (!insects || insects.length === 0) {
      console.log('✅ 数据库中没有昆虫品种')
      return
    }

    console.log(`📋 找到 ${insects.length} 个昆虫品种:`)
    insects.forEach(insect => {
      console.log(`   - ${insect.name} (ID: ${insect.id})`)
    })
    console.log()

    // 2. 确认删除
    console.log('⚠️  警告：这将删除所有昆虫品种和相关数据！')
    console.log('   此操作不可逆！\n')

    // 3. 删除所有库存记录
    console.log('📦 正在删除库存记录...')
    const { error: inventoryError } = await supabase
      .from('inventory')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (inventoryError) {
      console.error('❌ 删除库存失败:', inventoryError.message)
      process.exit(1)
    }
    console.log('✅ 库存记录已删除\n')

    // 4. 删除所有昆虫品种
    console.log('🐛 正在删除昆虫品种...')
    const { error: insectError } = await supabase
      .from('insects')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (insectError) {
      console.error('❌ 删除昆虫失败:', insectError.message)
      process.exit(1)
    }
    console.log('✅ 昆虫品种已删除\n')

    // 5. 验证删除结果
    const { data: remaining, error: verifyError } = await supabase
      .from('insects')
      .select('count')

    if (verifyError) {
      console.error('❌ 验证失败:', verifyError.message)
    } else {
      console.log(`📊 剩余昆虫数量: ${remaining?.[0]?.count || 0}`)
    }

    console.log('\n🎉 删除完成！')
    console.log('请刷新 H5 页面查看效果: https://zhoujiwei002.github.io/huotikunchong/')

  } catch (error) {
    console.error('❌ 删除过程中出错:', error.message)
    process.exit(1)
  }
}

deleteAllInsects()
