# 活体昆虫库存管理系统 - H5 部署指南

## 项目简介

基于 Taro + React + Tailwind CSS 的活体昆虫库存管理系统，支持 H5 和微信小程序双端部署。

## 技术栈

- **前端框架**: Taro 4 + React 18
- **样式方案**: Tailwind CSS 4 + weapp-tailwindcss
- **后端服务**: Supabase (PostgreSQL + Storage + Realtime)
- **图标库**: lucide-react-taro
- **部署平台**: GitHub Pages (H5 版本)

## 功能特性

- 库存管理：查看、添加、删除昆虫品种
- 操作记录：销售、死亡、进货记录
- 多位置支持：公司总部 + 8 个团队门店
- 数据统计：品种数量、库存总量
- 图片上传：支持昆虫实景图片上传
- 用户管理：支持设置操作员昵称

## 本地开发

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
# H5 开发
pnpm dev:h5

# 微信小程序开发
pnpm dev:weapp
```

访问 http://localhost:5000 查看页面

## 构建 H5 版本

```bash
pnpm build:web
```

构建产物位于 `dist-web/` 目录

## 部署到 GitHub Pages

### 方法一：使用 gh-pages 分支

```bash
# 清理旧的 gh-pages 分支
git branch -D gh-pages 2>/dev/null
git push origin --delete gh-pages 2>/dev/null

# 创建新的 gh-pages 分支
git checkout --orphan gh-pages
git rm -rf .

# 复制构建产物
cp -r dist-web/* .

# 提交并推送
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

### 方法二：使用 GitHub Actions（推荐）

在 `.github/workflows/deploy.yml` 中创建部署配置：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Build H5
        run: pnpm build:web

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist-web
```

### 访问 H5 版本

部署成功后，访问：
```
https://[你的用户名].github.io/huotikunchong/
```

例如：https://zhoujiwei002.github.io/huotikunchong/

## 环境变量配置

在 `.env.local` 文件中配置 Supabase：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 数据库初始化

### 创建表结构

```sql
-- 昆虫品种表
CREATE TABLE insects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  species TEXT,
  price NUMERIC NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 库存表
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insect_id UUID NOT NULL REFERENCES insects(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(insect_id, location)
);

-- 操作日志表
CREATE TABLE operation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insect_id UUID NOT NULL REFERENCES insects(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('销售', '死亡', '进货')),
  quantity INTEGER NOT NULL,
  location TEXT NOT NULL,
  price NUMERIC,
  remark TEXT,
  image_url TEXT,
  operator TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 启用行级安全策略
ALTER TABLE insects ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_logs ENABLE ROW LEVEL SECURITY;

-- 允许所有读取操作
CREATE POLICY "Allow all read" ON insects FOR SELECT USING (true);
CREATE POLICY "Allow all read" ON inventory FOR SELECT USING (true);
CREATE POLICY "Allow all read" ON operation_logs FOR SELECT USING (true);

-- 允许所有插入操作
CREATE POLICY "Allow all insert" ON insects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all insert" ON inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all insert" ON operation_logs FOR INSERT WITH CHECK (true);

-- 允许所有更新操作
CREATE POLICY "Allow all update" ON insects FOR UPDATE USING (true);
CREATE POLICY "Allow all update" ON inventory FOR UPDATE USING (true);
CREATE POLICY "Allow all update" ON operation_logs FOR UPDATE USING (true);

-- 允许所有删除操作
CREATE POLICY "Allow all delete" ON insects FOR DELETE USING (true);
CREATE POLICY "Allow all delete" ON inventory FOR DELETE USING (true);
CREATE POLICY "Allow all delete" ON operation_logs FOR DELETE USING (true);
```

### 初始化预设数据

```sql
-- 插入预设昆虫品种
INSERT INTO insects (name, species, price) VALUES
  ('天门螳螂', '螳螂', 50),
  ('天门甲虫', '甲虫', 30),
  ('晋中甲虫', '甲虫', 35),
  ('绥化甲虫', '甲虫', 40),
  ('本溪甲虫', '甲虫', 45),
  ('天门睫角', '睫角', 80);

-- 为每个昆虫品种创建初始库存记录
INSERT INTO inventory (insect_id, quantity, location)
SELECT id, 0, '公司总部'
FROM insects;
```

## H5 移动端优化

- ✅ viewport 配置：禁止缩放，适配全面屏
- ✅ rem 适配：与小程序 rpx 保持一致
- ✅ 安全区域：适配 iPhone X 刘海屏
- ✅ 触摸优化：禁用点击高亮，最小触摸区域 44px
- ✅ 文本换行：强制 Text 组件为 block 元素
- ✅ 按钮布局：View 包裹确保样式生效
- ✅ 加载动画：简洁的旋转加载指示器

## 浏览器兼容性

- iOS Safari 12+
- Chrome 80+
- 微信内置浏览器
- 其他现代移动浏览器

## 常见问题

### 1. 页面显示白屏

检查浏览器控制台是否有错误，确认：
- Supabase 环境变量是否正确
- 资源路径是否正确（应为 `/huotikunchong/`）
- 浏览器是否支持 ES6+

### 2. 图片无法上传

确认：
- Supabase Storage 是否已创建 `insect-images` bucket
- bucket 是否设置为 public 访问
- 文件大小是否超过限制（建议 < 10MB）

### 3. 数据无法加载

检查：
- Supabase 连接是否正常
- 数据库表结构是否正确
- RLS 策略是否允许访问

## 更新日志

### v1.0.0 (2024-03-08)
- ✅ 初始版本发布
- ✅ 支持 H5 和微信小程序
- ✅ 库存管理功能完整
- ✅ 图片上传功能
- ✅ 多位置支持
- ✅ 数据统计功能
