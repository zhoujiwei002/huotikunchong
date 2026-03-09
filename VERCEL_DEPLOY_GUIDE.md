# Vercel 部署指南

本指南将指导您如何将后端服务部署到 Vercel 平台。

## 📋 前置要求

1. ✅ Vercel CLI 已安装（已完成）
2. ✅ Vercel 账号（需要注册）
3. ✅ 后端代码已准备好

## 🚀 部署步骤

### 步骤 1：注册/登录 Vercel

如果您还没有 Vercel 账号，请先访问 https://vercel.com 注册。

### 步骤 2：登录 Vercel CLI

在项目根目录运行：

```bash
vercel login
```

按照提示选择登录方式（GitHub、GitLab 或 Bitbucket）。

### 步骤 3：部署后端

进入后端目录并部署：

```bash
cd /workspace/projects/server
vercel
```

部署过程中会提示您输入以下信息：

1. **Set up and deploy "~/projects/server"?**
   - 选择：`Y`（是）

2. **Which scope do you want to deploy to?**
   - 选择您的账号

3. **Link to existing project?**
   - 选择：`N`（否，创建新项目）

4. **What's your project's name?**
   - 输入：`insect-inventory-backend`（或其他您喜欢的名称）

5. **In which directory is your code located?**
   - 选择：`./`（当前目录）

6. **Want to override the settings?**
   - 选择：`N`（否）

7. **What do you want to build as?**
   - Vercel 会自动检测为 Node.js 项目

### 步骤 4：配置环境变量

部署完成后，Vercel 会提供一个预览 URL。接下来需要在 Vercel Dashboard 中配置环境变量：

1. 访问 Vercel Dashboard：https://vercel.com/dashboard
2. 找到您的项目（`insect-inventory-backend`）
3. 进入 `Settings` -> `Environment Variables`
4. 添加以下环境变量：

   - **PROJECT_DOMAIN**：您的公网域名（如：`https://your-app.vercel.app`）
   - **COZE_SUPABASE_URL**：Supabase 项目 URL
   - **COZE_SUPABASE_ANON_KEY**：Supabase 匿名密钥

5. 保存后，重新部署项目：
   ```bash
   vercel --prod
   ```

### 步骤 5：获取部署地址

部署成功后，Vercel 会提供一个 URL，格式如下：

```
https://your-project-name.vercel.app
```

记下这个地址，稍后需要配置到小程序中。

## 🔍 验证部署

部署完成后，您可以使用 curl 验证后端是否正常工作：

```bash
# 测试健康检查接口
curl https://your-project-name.vercel.app/api/health

# 测试库存接口
curl https://your-project-name.vercel.app/api/inventory
```

## 📝 更新小程序配置

1. 修改小程序的 `.env` 文件：

```env
PROJECT_DOMAIN=https://your-project-name.vercel.app
```

2. 重新构建小程序：

```bash
cd /workspace/projects
pnpm build:weapp
```

3. 上传新版本到微信公众平台

## ⚠️ 注意事项

1. **免费套餐限制**：
   - Vercel 免费套餐有请求次数限制（100GB/月）
   - 适合开发和小规模使用

2. **数据库连接**：
   - 确保 Supabase 数据库可以公网访问
   - 使用 Supabase 提供的连接字符串

3. **日志查看**：
   - 可以在 Vercel Dashboard 中查看部署日志
   - 地址：`https://vercel.com/dashboard/your-username/your-project-name/logs`

4. **域名配置（可选）**：
   - 如果需要自定义域名，可以在 Vercel Dashboard 中配置
   - 需要在域名提供商处添加 DNS 记录

## 🔄 重新部署

如果代码有更新，只需运行：

```bash
cd /workspace/projects/server
vercel --prod
```

## 🆘 常见问题

### 1. 部署失败

检查 `vercel.json` 配置是否正确，确保：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ]
}
```

### 2. 环境变量未生效

确保在部署前已配置环境变量，并重新部署：

```bash
vercel --prod
```

### 3. 数据库连接失败

检查 Supabase URL 和密钥是否正确配置。

## 📚 参考资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Vercel CLI 文档](https://vercel.com/docs/cli)
- [NestJS 部署到 Vercel](https://vercel.com/guides/deploying-a-nestjs-app-with-vercel)
