# 🚀 Serverless 部署指南（Vercel）

## 📋 概述

本指南将帮助你将后端服务部署到 Vercel（Serverless 平台），实现低成本、高可用的部署。

**优点**：
- ✅ 免费额度充足（100GB 带宽/月）
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动扩缩容
- ✅ 部署简单

**成本**：
- 免费版：100GB 带宽/月，100GB-Hours/月
- 超出后：$0.15/GB（带宽）
- 预计月成本：0-20 元（中小型应用）

---

## 🔧 前置准备

### 1. 安装 Node.js
确保已安装 Node.js 18+：
```bash
node --version  # 应该 >= 18
```

### 2. 安装 Vercel CLI
```bash
npm install -g vercel
```

### 3. 注册 Vercel 账号
- 访问：https://vercel.com/
- 使用 GitHub、GitLab 或 Email 注册
- 验证邮箱

### 4. 准备 Supabase 凭证
确保你有 Supabase 项目的：
- Project URL
- anon key

---

## 📝 部署步骤

### 步骤 1：登录 Vercel

```bash
vercel login
```

按照提示选择登录方式（推荐 GitHub）。

### 步骤 2：配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# Vercel 部署环境变量
PROJECT_DOMAIN=https://your-project.vercel.app
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key
```

**替换为你的实际值**：
- `your-project.vercel.app`：部署后会自动分配域名
- `https://your-project.supabase.co`：你的 Supabase 项目 URL
- `your-anon-key`：你的 Supabase anon key

### 步骤 3：部署后端

```bash
# 进入后端目录
cd server

# 部署到 Vercel
vercel
```

按照提示操作：
1. **Set up and deploy?** → Yes
2. **Which scope?** → 选择你的账号
3. **Link to existing project?** → No
4. **What's your project's name?** → inventory-system（或自定义）
5. **In which directory is your code located?** → ./
6. **Want to override the settings?** → No

### 步骤 4：配置环境变量（Vercel 控制台）

部署完成后，Vercel 会提供一个域名（如：`https://inventory-system.vercel.app`）。

1. 访问 Vercel 控制台：https://vercel.com/dashboard
2. 找到你的项目（inventory-system）
3. 点击 "Settings" → "Environment Variables"
4. 添加以下环境变量：

```
PROJECT_DOMAIN=https://inventory-system.vercel.app
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key
```

5. 点击 "Save"
6. 点击 "Redeploy" 重新部署

### 步骤 5：验证部署

访问以下 URL 测试：

```bash
# 测试健康检查
curl https://inventory-system.vercel.app/api/health

# 测试获取昆虫列表
curl https://inventory-system.vercel.app/api/inventory/insects

# 测试获取仓库位置
curl https://inventory-system.vercel.app/api/inventory/locations
```

如果返回 JSON 数据，说明部署成功！

---

## 🔄 更新小程序配置

### 1. 修改后端域名

在项目根目录编辑 `.env` 文件：

```bash
PROJECT_DOMAIN=https://inventory-system.vercel.app
```

**注意**：将 `inventory-system` 替换为你的实际项目名。

### 2. 重新构建小程序

```bash
pnpm build:weapp
```

### 3. 在微信开发者工具中刷新

1. 打开微信开发者工具
2. 点击"编译"按钮
3. 测试所有功能

---

## 🌐 配置微信小程序域名

### 1. 登录微信公众平台
访问：https://mp.weixin.qq.com/

### 2. 配置服务器域名

进入"开发" → "开发管理" → "开发设置"，点击"修改"，添加：

**request 合法域名**
```
https://inventory-system.vercel.app
```

**uploadFile 合法域名**
```
https://inventory-system.vercel.app
```

**downloadFile 合法域名**
```
https://inventory-system.vercel.app
```

### 3. 取消勾选域名校验

在微信开发者工具中：
1. 点击"详情" → "本地设置"
2. 取消勾选"不校验合法域名"

### 4. 测试小程序

在真机上测试小程序，确保所有功能正常。

---

## 📤 重新上传小程序

### 1. 在微信开发者工具中上传

1. 点击"上传"按钮
2. 版本号：`1.0.1`
3. 版本描述：```
更新后端地址，迁移到 Serverless 环境
- 后端部署到 Vercel
- 添加自动 HTTPS
- 提高稳定性和性能
```
4. 点击"上传"

### 2. 提交审核

1. 登录微信公众平台
2. 进入"管理" → "版本管理"
3. 找到版本 1.0.1
4. 点击"提交审核"
5. 填写审核信息

### 3. 发布上线

审核通过后，点击"发布"。

---

## 🔍 监控和日志

### 查看部署日志

```bash
# 查看部署历史
vercel ls

# 查看实时日志
vercel logs

# 查看特定部署的日志
vercel logs --deployments <deployment-url>
```

### 在 Vercel 控制台查看

1. 访问 Vercel 控制台
2. 选择你的项目
3. 点击 "Deployments"
4. 点击任意部署查看日志

### 监控资源使用

1. 进入项目 "Settings" → "Usage"
2. 查看带宽、函数调用次数等
3. 设置告警（可选）

---

## 💰 成本预估

### 免费额度

- **带宽**：100GB/月
- **函数调用**：100GB-Hours/月
- **执行时间**：10秒/请求（免费版）

### 典型应用成本

假设每天 1000 个请求，每次请求 100KB：

**月度数据传输**：
- 1000 请求/天 × 100KB × 30 天 = 3GB/月
- 免费额度：100GB/月
- **成本：0 元**

**超出情况**：
- 如果超出 100GB/月
- 超出部分：$0.15/GB
- 超出 50GB：$7.5

**预计月成本：0-20 元**

---

## 🔧 常见问题

### Q1: 部署后返回 404？

**解决方法**：
1. 检查 `vercel.json` 配置是否正确
2. 确认 `api/index.ts` 文件存在
3. 重新部署：`vercel --prod`

### Q2: 函数执行超时？

**解决方法**：
1. 在 `vercel.json` 中增加超时配置：
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```
2. 优化数据库查询
3. 减少不必要的计算

### Q3: 环境变量不生效？

**解决方法**：
1. 在 Vercel 控制台确认环境变量已添加
2. 点击 "Redeploy" 重新部署
3. 检查变量名称拼写

### Q4: 上传图片失败？

**解决方法**：
1. 检查 Vercel 免费版的请求体限制（4.5MB）
2. 优化图片大小
3. 升级到 Pro 版（支持更大的请求体）

### Q5: 数据库连接失败？

**解决方法**：
1. 检查 Supabase URL 和 anon key 是否正确
2. 确认 Supabase 项目未暂停
3. 检查 Supabase 数据库是否正常运行

---

## 🚀 高级配置

### 自定义域名

#### 1. 购买域名
在阿里云、腾讯云等平台购买域名。

#### 2. 配置 DNS
在域名服务商添加 CNAME 记录：
```
CNAME    yourdomain.com    cname.vercel-dns.com
```

#### 3. 在 Vercel 添加域名
1. 进入项目 "Settings" → "Domains"
2. 添加你的域名
3. 按照提示配置 DNS

### 缓存配置

在 `vercel.json` 中添加缓存规则：
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    }
  ]
}
```

### 环境隔离

使用多个项目环境：

**开发环境**：
```bash
vercel link --name inventory-system-dev
```

**生产环境**：
```bash
vercel --prod
```

---

## 📚 相关资源

- Vercel 官方文档：https://vercel.com/docs
- Vercel Node.js 文档：https://vercel.com/docs/frameworks/official-examples/nestjs
- NestJS Serverless 文档：https://docs.nestjs.com/faq/serverless

---

## ✅ 部署检查清单

部署前检查：
- [ ] Node.js 版本 >= 18
- [ ] Vercel CLI 已安装
- [ ] Supabase 凭证已准备好
- [ ] `.env.local` 文件已配置

部署后检查：
- [ ] 部署成功
- [ ] 环境变量已配置
- [ ] API 接口正常返回
- [ ] 小程序可以连接后端
- [ ] 所有功能测试通过

---

## 🎉 开始部署

现在你可以按照上述步骤，将后端服务部署到 Vercel 了！

**预计完成时间：30 分钟** 🚀
