# 极简版昆虫数量管理系统

## 🎯 功能介绍

这是一个全新的、极简的昆虫数量管理页面，只专注于**管理昆虫数量**。

### 核心功能

✅ **查看昆虫列表**
- 显示昆虫名称和数量
- 简洁的卡片式布局

✅ **调整数量**
- 点击 `+` 按钮增加数量（每次 +1）
- 点击 `-` 按钮减少数量（每次 -1）
- 数量不能小于 0

✅ **添加昆虫**
- 输入昆虫名称
- 输入初始数量
- 点击"确定"添加

✅ **删除昆虫**
- 点击红色的垃圾桶图标
- 确认后删除

---

## 📱 页面预览

```
╔═════════════════════════════════════════╗
║          昆虫数量管理                    ║
╚═════════════════════════════════════════╝

┌─────────────────────────────────────┐
│  天门螳螂      [ - ] 50 [ + ]  🗑️   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  天门甲虫      [ - ] 100 [ + ]  🗑️   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  晋中甲虫      [ - ] 80 [ + ]  🗑️   │
└─────────────────────────────────────┘

         ┌─────────────┐
         │  + 添加昆虫  │
         └─────────────┘
```

---

## 🔧 数据库配置（首次使用必需）

### 步骤 1：访问 Supabase 控制台

1. 打开浏览器，访问：https://supabase.com/dashboard
2. 登录你的账户
3. 选择项目：`vluyeoauwhjnskzqdlbk`

### 步骤 2：打开 SQL Editor

1. 在左侧菜单中，找到并点击 "SQL Editor"
2. 点击 "New query"

### 步骤 3：执行 SQL 脚本

复制以下 SQL 代码并粘贴到 SQL Editor 中，然后点击 "Run"：

```sql
-- 创建简化的 insects 表

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
```

### 步骤 4：验证创建成功

执行成功后，你应该在下方看到结果表格，包含 3 条测试数据：
- 天门螳螂: 50 只
- 天门甲虫: 100 只
- 晋中甲虫: 80 只

---

## 🚀 部署到 GitHub Pages

### 方法 1：使用 GitHub Actions（推荐）

如果已经配置了 GitHub Actions，只需推送代码：

```bash
git push origin main
```

GitHub Actions 会自动构建和部署，等待 2-5 分钟后刷新浏览器即可。

### 方法 2：手动部署

如果还没有配置 GitHub Actions，执行以下步骤：

```bash
# 1. 克隆项目到本地
git clone https://github.com/zhoujiwei002/huotikunchong.git
cd huotikunchong

# 2. 拉取最新代码
git fetch origin
git checkout main

# 3. 推送到 GitHub
git push origin main
```

---

## 🌐 访问地址

**H5 页面：** https://zhoujiwei002.github.io/huotikunchong/
**无需密码！**（移除了密码保护功能）

---

## 💡 使用说明

### 查看昆虫列表

1. 打开 H5 页面
2. 自动加载所有昆虫及其数量
3. 可以通过上下滚动查看

### 调整数量

**增加数量：**
- 点击蓝色 `+` 按钮
- 每次增加 1 只

**减少数量：**
- 点击灰色 `-` 按钮
- 每次减少 1 只
- 数量为 0 时按钮禁用

### 添加昆虫

1. 点击底部的"添加昆虫"按钮
2. 在弹出的窗口中输入：
   - 名称：如"天门螳螂"
   - 数量：如 50
3. 点击"确定"保存

### 删除昆虫

1. 点击右侧红色的垃圾桶图标（🗑️）
2. 在确认对话框中点击"确定"
3. 昆虫将被永久删除

---

## 📊 数据结构

**insects 表字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，自动生成 |
| name | VARCHAR(255) | 昆虫名称（必填） |
| quantity | INTEGER | 数量（必填，默认 0） |
| created_at | TIMESTAMP | 创建时间（自动） |
| updated_at | TIMESTAMP | 更新时间（自动） |

---

## 🎯 与旧版本的区别

### 旧版本功能（已移除）
- ❌ 图片上传
- ❌ 价格管理
- ❌ 物种分类
- ❌ 门店筛选
- ❌ 操作记录
- ❌ 库存状态显示
- ❌ 密码保护
- ❌ 复杂的库存操作（销售、死亡、串货）

### 新版本功能（保留）
- ✅ 昆虫名称显示
- ✅ 数量显示
- ✅ 增加/减少数量
- ✅ 添加昆虫
- ✅ 删除昆虫
- ✅ 极简界面

---

## 🔍 常见问题

### Q1: 页面显示"暂无昆虫"？

**原因：** 数据库表未创建或没有数据

**解决：**
1. 按照上述"数据库配置"步骤创建表
2. 插入测试数据
3. 刷新浏览器

### Q2: 调整数量失败？

**原因：** 数据库连接失败或表结构不正确

**解决：**
1. 检查是否正确创建了数据库表
2. 确认表包含 `name` 和 `quantity` 字段
3. 检查 Supabase 配置是否正确

### Q3: 添加昆虫失败？

**原因：** 名称或数量为空

**解决：**
- 确保名称不为空
- 确保数量为有效的数字

### Q4: 删除昆虫失败？

**原因：** 未确认删除或权限问题

**解决：**
- 确认在弹出的对话框中点击了"确定"
- 检查是否有数据库写入权限

---

## 📝 技术栈

- **前端：** Taro 4 + React 18 + Tailwind CSS 4
- **后端：** Supabase (PostgreSQL)
- **部署：** GitHub Pages
- **CI/CD：** GitHub Actions

---

## 🎉 总结

这是一个**极简、专注、易用**的昆虫数量管理工具！

- ✅ 界面简洁
- ✅ 操作简单
- ✅ 无需学习成本
- ✅ 即开即用

现在就开始使用吧！🚀

---

**版本：** v3.0（极简版）
**更新时间：** 2024-03-08
