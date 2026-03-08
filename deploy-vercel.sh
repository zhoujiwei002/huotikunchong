#!/bin/bash

# ============================================
# 活体昆虫库存管理系统 - Vercel 部署脚本
# ============================================

set -e

echo "🚀 开始部署后端服务到 Vercel..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 版本过低，需要 18 或更高版本${NC}"
    echo "当前版本: $(node --version)"
    exit 1
fi
echo -e "${GREEN}✅ Node.js 版本检查通过: $(node --version)${NC}"
echo ""

# 检查 Vercel CLI
echo "📋 检查 Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI 未安装，正在安装...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI 安装完成${NC}"
else
    echo -e "${GREEN}✅ Vercel CLI 已安装: $(vercel --version)${NC}"
fi
echo ""

# 检查是否已登录
echo "📋 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  未登录 Vercel，正在打开登录页面...${NC}"
    vercel login
    echo -e "${GREEN}✅ 登录成功${NC}"
else
    echo -e "${GREEN}✅ 已登录 Vercel${NC}"
fi
echo ""

# 进入后端目录
echo "📂 进入后端目录..."
cd server
echo ""

# 安装依赖
echo "📦 安装后端依赖..."
if [ ! -d "node_modules" ]; then
    pnpm install
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
else
    echo -e "${GREEN}✅ 依赖已存在，跳过安装${NC}"
fi
echo ""

# 构建项目
echo "🔨 构建后端项目..."
pnpm build
echo -e "${GREEN}✅ 构建完成${NC}"
echo ""

# 部署到 Vercel
echo "🚀 部署到 Vercel..."
echo "请按照提示完成部署配置..."
echo ""

vercel

echo ""
echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""

# 获取部署 URL
echo "📋 部署信息："
echo "   - 请记下 Vercel 分配的域名（如：https://inventory-system.vercel.app）"
echo "   - 这个域名将用于配置小程序"
echo ""

echo -e "${YELLOW}⚠️  下一步操作：${NC}"
echo "   1. 在 Vercel 控制台配置环境变量"
echo "   2. 重新部署以应用环境变量"
echo "   3. 更新小程序的后端地址"
echo "   4. 配置微信小程序域名"
echo ""

echo -e "${GREEN}🎉 部署脚本执行完成！${NC}"
echo ""
echo "详细文档请查看：SERVERLESS_DEPLOYMENT.md"
