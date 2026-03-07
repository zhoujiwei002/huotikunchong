const { createClient } = require('@supabase/supabase-js');

async function setupStorage() {
  const supabaseUrl = process.env.COZE_SUPABASE_URL;
  const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('缺少 Supabase 凭证');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 创建 bucket
  const { data, error } = await supabase.storage.createBucket('insect-images', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Bucket insect-images 已存在');
    } else {
      console.error('创建 bucket 失败:', error);
    }
  } else {
    console.log('Bucket insect-images 创建成功');
  }

  // 设置 bucket 为公开
  const { error: policyError } = await supabase.storage
    .from('insect-images')
    .createSignedUploadUrl('test.txt', 60);

  if (policyError && !policyError.message.includes('policy')) {
    console.error('设置 bucket 策略失败:', policyError);
  }

  console.log('Storage 设置完成');
}

setupStorage().catch(console.error);
