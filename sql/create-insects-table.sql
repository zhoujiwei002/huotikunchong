-- 创建简化的 insects 表
-- 请在 Supabase 控制台的 SQL Editor 中执行此脚本

-- 1. 删除旧的 insects 表（如果存在）
DROP TABLE IF EXISTS insects CASCADE;

-- 2. 创建新的 insects 表
CREATE TABLE insects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 3. 创建更新时间触发器
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

-- 4. 插入测试数据
INSERT INTO insects (name, quantity) VALUES
  ('天门螳螂', 50),
  ('天门甲虫', 100),
  ('晋中甲虫', 80);

-- 5. 验证数据
SELECT * FROM insects;
