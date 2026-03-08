# 🚀 Serverless 部署方案

## 📋 方案概述

已为你准备好了 **Vercel Serverless 部署方案**，可以实现低成本、高可用的后端服务部署。

---

## ✨ 优点

- ✅ **免费额度充足**：100GB 带宽/月，100GB-Hours/月
- ✅ **自动 HTTPS**：无需手动配置 SSL 证书
- ✅ **全球 CDN**：自动加速，访问更快
- ✅ **自动扩缩容**：根据流量自动调整
- ✅ **部署简单**：一条命令即可部署
- ✅ **成本低**：预计月成本 0-20 元

---

## 💰 成本预估

### 免费额度
- 带宽：100GB/月
- 函数调用：100GB-Hours/月
- 执行时间：10秒/请求

### 典型应用成本

假设每天 1000 个请求，每次请求 100KB：
- 月度数据传输：3GB/月
- 超出免费额度：0 元
- **预计月成本：0-20 元**

---

## 📝 快速开始

### 方法 1：使用自动部署脚本（推荐）

```bash
# 运行自动部署脚本
./deploy-vercel.sh
```

脚本会自动完成：
1. ✅ 检查 Node.js 版本
2. ✅ 检查 Vercel CLI
3. ✅ 登录 Vercel
4. ✅ 安装依赖
5. ✅ 构建项目
6. ✅ 部署到 Vercel

### 方法 2：手动部署

详细步骤请参考：[SERVERLESS_DEPLOYMENT.md](SERVERLESS_DEPLOYMENT.md)

---

## 🔧 部署后配置

### 1. 配置环境变量

在 Vercel 控制台添加环境变量：
- `PROJECT_DOMAIN=https://your-project.vercel.app`
- `COZE_SUPABASE_URL=https://your-project.supabase.co`
- `COZE_SUPABASE_ANON_KEY=your-anon-key`

### 2. 更新小程序

```bash
# 修改 .env 文件
PROJECT_DOMAIN=https://your-project.vercel.app

# 重新构建小程序
pnpm build:weapp

# 在微信开发者工具中刷新
```

### 3. 配置微信域名

在微信公众平台添加：
- request 合法域名：`https://your-project.vercel.app`
- uploadFile 合法域名：`https://your-project.vercel.app`
- downloadFile 合法域名：`https://your-project.vercel.app`

---

## 📂 新增文件

### 部署配置
- `vercel.json` - Vercel 部署配置
- `server/api/index.ts` - Serverless 函数入口
- `deploy-vercel.sh` - 自动部署脚本

### 文档
- `SERVERLESS_DEPLOYMENT.md` - 完整部署指南

---

## 🎯 与沙箱环境对比

| 特性 | 沙箱环境 | Vercel Serverless |
|------|---------|------------------|
| 成本 | 免费 | 0-20 元/月 |
| 域名 | localhost | 自动分配 HTTPS 域名 |
| 微信兼容 | ❌ | ✅ |
| 稳定性 | 依赖沙箱 | 99.9% SLA |
| 扩缩容 | ❌ | ✅ 自动 |
| 维护 | 无需维护 | 无需维护 |

---

## ✅ 部署检查清单

部署前：
- [ ] 已阅读 SERVERLESS_DEPLOYMENT.md
- [ ] 已注册 Vercel 账号
- [ ] 已准备好 Supabase 凭证
- [ ] 已安装 Node.js 18+

部署后：
- [ ] Vercel 部署成功
- [ ] 环境变量已配置
- [ ] API 接口正常返回
- [ ] 小程序已更新后端地址
- [ ] 微信域名已配置
- [ ] 真机测试通过

---

## 🚨 重要提示

### 当前状态
- ✅ 小程序代码已上传（v1.0.0）
- ✅ 审核已通过
- ✅ 已发布到生产环境
- ❌ **但后端还在沙箱环境**
- ❌ **用户打开小程序会连接失败**

### 必须做的事情
1. ⚠️ **立即部署后端服务到 Vercel**
2. ⚠️ **配置环境变量**
3. ⚠️ **更新小程序后端地址**
4. ⚠️ **配置微信小程序域名**
5. ⚠️ **重新上传并发布小程序（v1.0.1）**

---

## 📞 需要帮助？

### 查看文档
- 详细部署指南：[SERVERLESS_DEPLOYMENT.md](SERVERLESS_DEPLOYMENT.md)
- 常见问题：查看文档中的 "常见问题" 章节

### 监控和日志
```bash
# 查看部署日志
vercel logs

# 查看部署历史
vercel ls
```

---

## 🎉 开始部署

运行自动部署脚本：

```bash
./deploy-vercel.sh
```

**预计完成时间：30 分钟** 🚀
