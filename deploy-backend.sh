#!/bin/bash

# 活体昆虫库存管理小程序 - 后端部署脚本
# 此脚本用于将后端服务部署到 Vercel 平台

set -e

echo "=========================================="
echo "  活体昆虫库存管理 - 后端部署工具"
echo "=========================================="
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录下运行此脚本"
    exit 1
fi

# 检查 Vercel CLI 是否安装
if ! command -v vercel &> /dev/null; then
    echo "❌ 错误：未检测到 Vercel CLI"
    echo "正在安装 Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI 安装成功"
fi

echo ""
echo "📋 部署前检查："
echo "   - 后端代码已准备好"
echo "   - 环境变量已配置（将在部署时提示输入）"
echo ""

# 进入后端目录
cd server

# 构建后端项目
echo "🔨 正在构建后端项目..."
pnpm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

echo ""
echo "🚀 开始部署到 Vercel..."
echo ""
echo "⚠️  部署过程中需要您输入以下信息："
echo "   1. Vercel 账号登录（如果未登录）"
echo "   2. 项目名称"
echo "   3. 环境变量（PROJECT_DOMAIN, COZE_SUPABASE_URL, COZE_SUPABASE_ANON_KEY）"
echo ""
echo "📝 部署完成后，请记录下 Vercel 提供的 URL"
echo ""

# 部署到 Vercel
vercel

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "📋 后续步骤："
echo "   1. 在 Vercel Dashboard 中配置环境变量"
echo "   2. 重新部署：vercel --prod"
echo "   3. 更新小程序 .env 文件中的 PROJECT_DOMAIN"
echo "   4. 重新构建并上传小程序"
echo ""
echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"
echo ""
