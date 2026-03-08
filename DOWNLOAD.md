# 🌐 公网下载链接（重新构建版本）

## ✅ 已修复问题

**问题**：之前版本缺少小程序构建文件，导致微信开发者工具无法识别

**解决方案**：已重新执行 `pnpm build:weapp`，生成完整的小程序构建文件

---

## 📥 点击下方链接下载（最新版本）

```
https://coze-coding-project.tos.coze.site/coze_storage_7613471713153613865/projects-backup-v2.tar_abcc92aa.gz?sign=1775536282-c83a1c9de7-0-6b83f38d8da542b02f72aadd56901badc0bbb08f5dcb578274cee01bd3814691
```

---

## 🚀 快速开始

### 步骤 1：下载并解压
```bash
# 下载
curl -O "https://coze-coding-project.tos.coze.site/coze_storage_7613471713153613865/projects-backup-v2.tar_abcc92aa.gz?sign=1775536282-c83a1c9de7-0-6b83f38d8da542b02f72aadd56901badc0bbb08f5dcb578274cee01bd3814691" --output projects-backup.tar.gz

# 解压
tar -xzf projects-backup.tar.gz
cd projects
```

### 步骤 2：安装依赖
```bash
pnpm install
```

### 步骤 3：配置环境变量
```bash
cp .env.production .env
```

### 步骤 4：启动开发服务
```bash
coze dev
```

### 步骤 5：导入微信开发者工具

1. 打开微信开发者工具
2. 点击"+"号创建项目
3. **项目目录**：选择 `dist/` 文件夹（注意：是项目根目录下的 dist 文件夹）
4. **AppID**：填入 `wx06b72147ad791131`
5. 开发模式：小程序
6. 点击"创建"

**✅ 现在可以正常加载了！**

---

## ⚠️ 重要提示

**链接有效期：30 天**

---

## 📂 包含内容

### 源代码
- ✅ 完整的前端代码（Taro + React 18）
- ✅ 完整的后端代码（NestJS 10）
- ✅ 配置文件（package.json, tsconfig.json）
- ✅ 环境变量模板（.env.production）

### 文档
- ✅ DEV_SETUP.md（开发环境配置指南）
- ✅ DEPLOYMENT.md（部署指南）
- ✅ API_DOCUMENTATION.md（API 文档）
- ✅ README.md（项目说明）
- ✅ CHANGELOG.md（更新日志）

### 已排除的文件
- ❌ node_modules（需要重新安装）
- ❌ dist（编译输出，需要重新构建）
- ❌ .git（Git 历史）
- ❌ .env（环境变量，包含敏感信息）

---

## 🔧 常见问题

### Q1: 导入后仍然提示找不到 app.json？

**解决方法**：
1. 确认选择的是 `dist/` 文件夹（不是 projects 文件夹）
2. 确认 `dist/` 文件夹下有 `app.json` 文件
3. 如果没有，执行以下命令重新构建：
   ```bash
   cd projects
   pnpm build:weapp
   ```

### Q2: 如何查看当前 dist 目录的文件？

```bash
ls -la dist/
```

应该看到：
- `app.json` ✓
- `app.js` ✓
- `app.wxss` ✓
- `pages/` 目录 ✓
- `project.config.json` ✓

### Q3: 依赖安装失败？

```bash
# 清理缓存
pnpm store prune

# 重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📖 详细文档

- **开发环境配置**：`DEV_SETUP.md`
- **部署指南**：`DEPLOYMENT.md`
- **API 文档**：`API_DOCUMENTATION.md`

---

## 🎉 开始使用

**立即点击上方链接下载，开始使用活体昆虫库存管理系统！**

**下载链接（30天有效）：**

```
https://coze-coding-project.tos.coze.site/coze_storage_7613471713153613865/projects-backup-v2.tar_abcc92aa.gz?sign=1775536282-c83a1c9de7-0-6b83f38d8da542b02f72aadd56901badc0bbb08f5dcb578274cee01bd3814691
```

**保存到本地：projects-backup.tar.gz** 🚀
