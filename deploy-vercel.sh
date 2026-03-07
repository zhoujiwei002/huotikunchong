#!/bin/bash
# Vercel 快速部署脚本

echo "==================================="
echo "  库存通小程序 - Vercel 部署脚本"
echo "==================================="
echo ""

# 检查是否已安装 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 正在安装 Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI 安装完成"
    echo ""
fi

# 检查是否已构建
if [ ! -d "dist-web" ]; then
    echo "⚠️  未找到构建产物，正在构建..."
    pnpm build
    echo ""
fi

# 检查 .env.production
if [ ! -f ".env.production" ]; then
    echo "📝 创建生产环境变量文件..."
    cp .env.production.example .env.production
    echo "⚠️  请先编辑 .env.production 文件，配置 PROJECT_DOMAIN"
    echo "   然后重新运行此脚本"
    echo ""
    echo "编辑命令：nano .env.production"
    exit 1
fi

echo "🚀 开始部署到 Vercel..."
echo ""

# 部署到生产环境
vercel --prod

echo ""
echo "==================================="
echo "  部署完成！"
echo "==================================="
echo ""
echo "✅ 你的小程序已成功部署！"
echo ""
echo "📱 访问地址："
echo "   (部署后会显示)"
echo ""
echo "📝 后续操作："
echo "   1. 部署后端服务（如果还未部署）"
echo "   2. 在 .env.production 中配置正确的 API 地址"
echo "   3. 重新部署前端：vercel --prod"
echo ""
