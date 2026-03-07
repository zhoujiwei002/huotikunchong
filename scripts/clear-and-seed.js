/**
 * 清空所有昆虫数据
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 错误：请在 .env.local 文件中配置 SUPABASE_URL 和 SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function clearData() {
  console.log('🗑️  开始清空昆虫数据...\n')

  try {
    // 删除所有昆虫
    const { error } = await supabase
      .from('insects')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
      console.error('❌ 清空数据失败:', error.message)
      process.exit(1)
    }

    console.log('✅ 所有昆虫数据已清空\n')

    // 插入测试数据
    console.log('🐛 正在插入测试数据...')
    const testData = [
      { name: '天门螳螂', quantity: 50 },
      { name: '天门甲虫', quantity: 100 },
      { name: '晋中甲虫', quantity: 80 },
    ]

    for (const insect of testData) {
      const { error } = await supabase
        .from('insects')
        .insert(insect)

      if (error) {
        console.error(`❌ 插入 ${insect.name} 失败:`, error.message)
      } else {
        console.log(`✅ 插入 ${insect.name}: ${insect.quantity} 只`)
      }
    }

    console.log('\n🎉 完成！')
    console.log('现在可以刷新 H5 页面查看效果')

  } catch (error) {
    console.error('❌ 清空数据失败:', error.message)
    process.exit(1)
  }
}

clearData()
