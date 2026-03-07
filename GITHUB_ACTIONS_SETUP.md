# GitHub Actions 自动部署配置完成

## ✅ 已完成的配置

我已经为你创建了 GitHub Actions 工作流配置文件，可以自动构建和部署 H5 版本到 GitHub Pages。

### 📋 工作流功能

**触发条件：**
- 每次向 `main` 分支推送代码时自动触发

**自动化流程：**
1. 检出代码
2. 设置 Node.js 18 环境
3. 安装 pnpm
4. 安装项目依赖
5. 构建 H5 版本（`pnpm build:web`）
6. 自动部署到 GitHub Pages（gh-pages 分支）

---

## 🔧 接下来的步骤（只需操作一次）

### 步骤 1：克隆项目到本地

在你的本地电脑终端中执行：

```bash
# 1. 克隆项目
git clone https://github.com/zhoujiwei002/huotikunchong.git

# 2. 进入项目目录
cd huotikunchong

# 3. 拉取最新代码（包含 GitHub Actions 配置）
git fetch origin

# 4. 切换到 main 分支
git checkout main

# 5. 推送到 GitHub（这会触发首次自动部署）
git push origin main
```

**推送成功后：**
- GitHub Actions 会自动开始构建和部署
- 大约需要 2-5 分钟完成
- 访问 https://github.com/zhoujiwei002/huotikunchong/actions 查看构建状态

### 步骤 2：配置 GitHub Pages（如果还没配置）

1. 访问：https://github.com/zhoujiwei002/huotikunchong/settings/pages
2. 在 "Build and deployment" 部分：
   - **Source**: 选择 `GitHub Actions`
   - （不需要选择 Branch，因为我们会通过 Actions 部署）
3. 点击 "Save"

**注意：** 如果之前已经配置了 Pages，可以跳过这一步。

---

## 🚀 未来如何更新

配置完成后，你只需要：

### 方法 1：在沙箱环境中开发（当前方式）

1. 在沙箱中修改代码
2. 我会帮你提交到 Git
3. 你在本地执行：
   ```bash
   git pull origin main
   git push origin main
   ```
4. GitHub Actions 自动构建和部署

### 方法 2：直接在本地开发（推荐）

1. 在本地修改代码
2. 提交并推送：
   ```bash
   git add .
   git commit -m "描述你的更改"
   git push origin main
   ```
3. GitHub Actions 自动构建和部署

---

## 📊 验证自动部署

### 查看构建状态

1. 访问：https://github.com/zhoujiwei002/huotikunchong/actions
2. 你会看到工作流运行状态
3. 点击最近的工作流可以查看详细日志

### 预期工作流

```
✅ Checkout
✅ Setup Node.js
✅ Setup pnpm
✅ Get pnpm store directory
✅ Setup pnpm cache
✅ Install dependencies
✅ Build H5
✅ Deploy to GitHub Pages
```

### 验证部署结果

1. 等待 2-5 分钟
2. 访问：https://zhoujiwei002.github.io/huotikunchong/
3. 输入密码：`inventory2024`
4. 应该能看到带"+"按钮的新版本

---

## 🎯 优势

### 自动部署的好处

✅ **无需手动推送 gh-pages 分支**
- 之前需要手动执行 `git checkout gh-pages` 和 `git push origin gh-pages`
- 现在只需要推送 main 分支

✅ **自动化流程**
- 每次更新自动构建和部署
- 无需手动执行构建命令

✅ **专业的工作流程**
- 符合现代 CI/CD 最佳实践
- 易于维护和扩展

✅ **构建日志透明**
- 可以在 GitHub Actions 页面查看详细日志
- 便于排查问题

---

## 🔍 GitHub Actions 配置详情

**工作流文件位置：** `.github/workflows/deploy.yml`

**配置说明：**
```yaml
name: Deploy H5 to GitHub Pages  # 工作流名称

on:
  push:
    branches: [main]  # 在 main 分支推送时触发

permissions:
  contents: write  # 允许写入内容（用于部署）

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest  # 运行在 Ubuntu 环境

    steps:
      - Checkout: 检出代码
      - Setup Node.js: 设置 Node.js 18
      - Setup pnpm: 安装 pnpm
      - Install dependencies: 安装依赖
      - Build H5: 构建 H5 版本
      - Deploy: 部署到 GitHub Pages
```

---

## 📝 环境变量配置

GitHub Actions 需要访问 Supabase 配置来构建 H5 版本。

### 添加 GitHub Secrets（如果需要）

如果构建时需要 Supabase 配置：

1. 访问：https://github.com/zhoujiwei002/huotikunchong/settings/secrets/actions
2. 点击 "New repository secret"
3. 添加以下 secrets：
   - Name: `SUPABASE_URL`
     Value: `https://vluyeoauwhjnskzqdlbk.supabase.co`
   - Name: `SUPABASE_ANON_KEY`
     Value: `sb_publishable_I-rKIajDN71LfhUtyjoBzA_pCxAWmgE`
4. 点击 "Add secret"

**注意：** 如果构建不需要 Supabase 配置，可以跳过这一步。

---

## 🚨 常见问题

### 问题 1：工作流运行失败

**排查步骤：**
1. 访问：https://github.com/zhoujiwei002/huotikunchong/actions
2. 点击失败的工作流
3. 查看错误日志

**常见原因：**
- 构建错误：代码语法错误或依赖问题
- 权限问题：GitHub Actions 没有写入权限
- 网络问题：无法访问 Supabase 或其他服务

### 问题 2：部署后页面没有更新

**解决方法：**
1. 强制刷新浏览器：`Ctrl + F5`（Windows）或 `Cmd + Shift + R`（Mac）
2. 清除浏览器缓存
3. 使用无痕模式访问

### 问题 3：Pages 显示 404

**检查步骤：**
1. 访问：https://github.com/zhoujiwei002/huotikunchong/settings/pages
2. 确保 Source 设置为 `GitHub Actions`
3. 检查 gh-pages 分支是否存在：https://github.com/zhoujiwei002/huotikunchong/tree/gh-pages

---

## 📞 需要帮助？

如果遇到任何问题：

1. 查看工作流日志：https://github.com/zhoujiwei002/huotikunchong/actions
2. 告诉我错误信息
3. 我会帮你排查问题

---

## ✅ 总结

### 现在你需要做的（一次性）：

```bash
git clone https://github.com/zhoujiwei002/huotikunchong.git
cd huotikunchong
git fetch origin
git checkout main
git push origin main
```

### 之后每次更新：

```bash
# 在本地或沙箱中修改代码后
git push origin main  # 自动触发构建和部署
```

就这么简单！🎉

---

**配置完成时间：** 2024-03-08
**配置文件：** `.github/workflows/deploy.yml`
