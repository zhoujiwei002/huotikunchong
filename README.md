# 活体昆虫展会库存管理系统

基于 Taro + Supabase 的活体昆虫库存管理 H5 应用。

## 功能特性

### 核心功能
- ✅ 库存列表查看（支持按位置筛选）
- ✅ 添加昆虫品种（支持图片上传）
- ✅ 销售登记（必须填写实收价格和实景图片）
- ✅ 死亡登记（必须拍摄实景图片）
- ✅ 删除库存（仅库存为 0 时可删除）
- ✅ 库存状态实时更新
- ✅ 操作员昵称管理
- ✅ 搜索昆虫（支持名称和物种搜索）

### 业务规则
- 📍 **固定仓库位置**：全部、公司总部、王东团队、袁兴彪团队、郭秀华团队、王希强团队、王成兵团队、周纪良团队、秦文胜团队、刘君团队
- 🐛 **预设昆虫品种**：天门螳螂、天门甲虫、晋中甲虫、绥化甲虫、本溪甲虫、天门睫角
- 📊 **库存状态**：
  - 无库存（数量为 0）
  - 库存正常（数量大于 0）
- 🔒 **删除限制**：仅库存为 0 时可删除
- 💰 **销售限制**：必须填写实收价格
- 📸 **图片要求**：
  - 销售和死亡操作必须拍摄实景图片
  - 图片自动压缩为 JPEG 格式，质量 75%
- 🔄 **自动跳转**：销售和死亡操作自动跳转到昆虫所属门店

## 技术栈

### 前端
- **框架**: Taro 4 + React 18
- **样式**: Tailwind CSS 4
- **图标**: lucide-react-taro
- **状态管理**: React Hooks (useState, useEffect)

### 后端
- **数据库**: Supabase (PostgreSQL)
- **文件存储**: Supabase Storage
- **实时更新**: Supabase Realtime (未启用)

### 部署
- **H5 版本**: GitHub Pages
- **开发环境**: http://localhost:5000
- **生产环境**: https://username.github.io/huotikunchong/

## 数据库结构

### insects 表（昆虫品种表）
```sql
CREATE TABLE insects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  species TEXT,
  price INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### inventory 表（库存表）
```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insect_id UUID NOT NULL REFERENCES insects(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (insect_id, location)
);
```

### operation_logs 表（操作日志表）
```sql
CREATE TABLE operation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insect_id UUID NOT NULL REFERENCES insects(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('销售', '死亡', '进货')),
  quantity INTEGER NOT NULL,
  location TEXT NOT NULL,
  price INTEGER,
  remark TEXT,
  image_url TEXT,
  operator TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);
```

## 环境变量

创建 `.env.local` 文件（开发环境）：
```env
VITE_SUPABASE_URL=https://vluyeoauwhjnskzqdlbk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_I-rKIajDN71LfhUtyjoBzA_pCxAWmgE
```

创建 `.env.production` 文件（生产环境）：
```env
VITE_SUPABASE_URL=https://vluyeoauwhjnskzqdlbk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_I-rKIajDN71LfhUtyjoBzA_pCxAWmgE
```

## 开发指南

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm dev
```

- 前端: http://localhost:5000
- 后端: http://localhost:3000

### 构建 H5 版本
```bash
pnpm build:web
```

构建产物在 `dist-web/` 目录。

### 构建微信小程序版本
```bash
pnpm build:weapp
```

构建产物在 `dist/` 目录。

## 部署指南

### 部署到 GitHub Pages

1. 构建 H5 版本：
```bash
pnpm build:web
```

2. 创建 gh-pages 分支并部署：
```bash
git checkout -b gh-pages
cp -r dist-web/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

3. 在 GitHub 仓库设置中启用 GitHub Pages，选择 gh-pages 分支。

4. 访问: https://username.github.io/huotikunchong/

## 使用指南

### 查看库存
1. 打开应用
2. 查看库存列表
3. 点击下拉框切换不同仓库位置
4. 使用搜索框搜索特定昆虫

### 添加昆虫
1. 点击右下角的 "+" 按钮
2. 填写昆虫信息（名称、单价、初始数量等）
3. 上传昆虫图片
4. 选择所属门店
5. 点击"确定"完成添加

### 销售昆虫
1. 在库存列表中找到要销售的昆虫
2. 点击"操作"按钮
3. 选择操作类型为"销售"
4. 填写销售数量
5. 填写实收价格（必填）
6. 拍摄实景图片（必填）
7. 点击"确定"完成销售

### 死亡登记
1. 在库存列表中找到要登记的昆虫
2. 点击"操作"按钮
3. 选择操作类型为"死亡"
4. 填写死亡数量
5. 拍摄实景图片（必填）
6. 点击"确定"完成登记

### 删除库存
1. 在库存列表中找到要删除的昆虫
2. 确认库存数量为 0
3. 点击"删除"按钮
4. 确认删除操作

### 设置昵称
1. 点击右上角的用户图标
2. 输入您的昵称
3. 点击"确定"完成设置

## 常见问题

### Q: 为什么销售和死亡操作必须拍摄实景图片？
A: 为了确保操作的真实性和可追溯性，所有销售和死亡操作都需要拍摄实景图片作为凭证。

### Q: 为什么删除库存时库存必须为 0？
A: 为了防止误删除有库存的记录，只有当库存为 0 时才允许删除。

### Q: 为什么销售操作必须填写实收价格？
A: 为了准确记录销售收入，便于后续财务统计和分析。

### Q: 如何重置库存数量？
A: 可以通过"销售"或"死亡"操作减少库存，或添加新昆虫时设置初始数量。

### Q: 如何查看操作日志？
A: 目前操作日志功能正在开发中，未来版本将支持查看详细的操作记录。

## 更新日志

### v1.0.0 (2026-03-08)
- ✅ 初始版本发布
- ✅ 实现核心库存管理功能
- ✅ 支持添加、销售、死亡操作
- ✅ 支持图片上传和压缩
- ✅ 支持按位置筛选库存
- ✅ 支持搜索昆虫
- ✅ 实现操作员昵称管理

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系开发团队。
