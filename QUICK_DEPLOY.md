# 🚀 一键部署指南（最简单方案）

## ⚠️ 重要提示

由于 Vercel、Render 等平台需要登录授权，**我无法在沙箱环境中直接完成部署**。

但你可以**在自己的机器上一键部署**，只需执行一条命令！

---

## 🎯 解决方案

### 方案 A：一键部署脚本（推荐，5分钟完成）

#### 步骤 1：在本地执行部署脚本

在你的电脑上打开终端，进入项目目录：

```bash
# 1. 安装 Vercel CLI（如果还没安装）
npm install -g vercel

# 2. 运行部署脚本
./deploy-vercel.sh
```

#### 步骤 2：按照提示操作

脚本会引导你完成：
1. 登录 Vercel（扫码或输入凭证）
2. 配置项目名称
3. 等待部署完成

#### 步骤 3：配置环境变量

访问 Vercel 控制台，添加环境变量：
```
PROJECT_DOMAIN=https://your-project.vercel.app
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key
```

#### 步骤 4：更新小程序

```bash
# 修改 .env 文件
PROJECT_DOMAIN=https://your-project.vercel.app

# 重新构建
pnpm build:weapp

# 在微信开发者工具中重新上传
```

---

### 方案 B：使用 Docker 部署（10分钟完成）

如果你不想使用 Vercel，可以使用 Docker 部署到任何云服务器。

#### 步骤 1：创建 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install

COPY server/ ./
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

#### 步骤 2：构建镜像

```bash
docker build -t inventory-system .
```

#### 步骤 3：运行容器

```bash
docker run -d \
  -p 3000:3000 \
  -e PROJECT_DOMAIN=https://your-domain.com \
  -e COZE_SUPABASE_URL=https://your-project.supabase.co \
  -e COZE_SUPABASE_ANON_KEY=your-anon-key \
  --name inventory-system \
  inventory-system
```

---

### 方案 C：使用 Railway（5分钟完成）

#### 步骤 1：连接 GitHub

1. 访问 https://railway.app/
2. 连接你的 GitHub 账号
3. 导入这个项目

#### 步骤 2：配置环境变量

在 Railway 项目设置中添加：
```
PROJECT_DOMAIN=https://your-app.railway.app
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key
```

#### 步骤 3：自动部署

Railway 会自动检测到 Node.js 项目并开始部署。

---

## 📋 我已经为你准备好的

- ✅ 完整的部署配置
- ✅ 自动化部署脚本
- ✅ 详细的部署文档
- ✅ Docker 配置（如果需要）
- ✅ 多种部署方案

---

## 🎉 你只需要

**在自己的机器上执行一条命令**：

```bash
./deploy-vercel.sh
```

**5-10 分钟内就能完成部署！**

---

## 📞 需要帮助？

如果遇到任何问题：
1. 查看 `SERVERLESS_DEPLOYMENT.md` 详细文档
2. 检查部署日志
3. 查看环境变量配置

**我已为你准备好所有需要的配置，部署过程非常简单！** 🚀
