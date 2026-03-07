/**
 * 重置数据库表结构 - 简化版
 * 删除旧表，创建新的简化表结构
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// 从环境变量读取配置
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 错误：请在 .env.local 文件中配置 SUPABASE_URL 和 SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY)

async function resetDatabase() {
  console.log('🗑️  开始重置数据库...\n')

  try {
    // 1. 删除旧的 insects 表
    console.log('📦 正在删除旧的 insects 表...')
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS insects CASCADE;'
    })

    if (dropError) {
      console.error('❌ 删除表失败:', dropError.message)
    } else {
      console.log('✅ 旧的 insects 表已删除\n')
    }

    // 2. 创建新的简化 insects 表
    console.log('🔨 正在创建新的 insects 表...')
    const createTableSQL = `
      CREATE TABLE insects (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE
      );
    `

    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    })

    if (createError) {
      console.error('❌ 创建表失败:', createError.message)
      console.log('\n💡 提示：如果你没有 exec_sql 函数，请手动在 Supabase 控制台执行以下 SQL：')
      console.log(createTableSQL)
      process.exit(1)
    }

    console.log('✅ 新的 insects 表创建成功\n')

    // 3. 添加更新时间触发器
    console.log('⚙️  正在添加更新时间触发器...')
    const triggerSQL = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_insects_updated_at
        BEFORE UPDATE ON insects
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `

    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: triggerSQL
    })

    if (triggerError) {
      console.error('⚠️  添加触发器失败:', triggerError.message)
      console.log('这不会影响功能，可以忽略。\n')
    } else {
      console.log('✅ 更新时间触发器添加成功\n')
    }

    // 4. 插入一些测试数据
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
        console.log(`✅ 插入 ${insect.name} 成功`)
      }
    }

    console.log('\n🎉 数据库重置完成！')
    console.log('表结构：')
    console.log('  - id (UUID, 主键)')
    console.log('  - name (VARCHAR, 昆虫名称)')
    console.log('  - quantity (INTEGER, 数量)')
    console.log('  - created_at (TIMESTAMP, 创建时间)')
    console.log('  - updated_at (TIMESTAMP, 更新时间)')
    console.log('\n测试数据：')
    console.log('  - 天门螳螂: 50 只')
    console.log('  - 天门甲虫: 100 只')
    console.log('  - 晋中甲虫: 80 只')

  } catch (error) {
    console.error('❌ 重置数据库失败:', error.message)
    console.log('\n💡 提示：你可以在 Supabase 控制台手动执行 SQL 命令')
    process.exit(1)
  }
}

resetDatabase()
