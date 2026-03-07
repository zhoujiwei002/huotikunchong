import { createClient } from '@supabase/supabase-js';

const client = createClient('https://vluyeoauwhjnskzqdlbk.supabase.co', 'sb_publishable_I-rKIajDN71LfhUtyjoBzA_pCxAWmgE');

(async () => {
  console.log('🔍 检查数据库状态...\n');

  // 尝试查询 insects 表
  const { data, error } = await client.from('insects').select('*').limit(1);

  if (error) {
    console.log('❌ 错误:', error.message);
    console.log('\n💡 这说明 insects 表不存在或结构不对\n');
    console.log('📝 你需要创建 insects 表\n');
  } else {
    console.log('✅ insects 表存在！');
    console.log('\n📊 表结构：');
    if (data && data.length > 0) {
      console.log('字段列表:', Object.keys(data[0]));
      console.log('\n示例数据:');
      console.log(data[0]);
    } else {
      console.log('表是空的，没有数据');
    }
  }
})();
