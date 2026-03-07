#!/bin/bash
# 微信小程序快速配置脚本

echo "==================================="
echo "  库存通小程序 - 快速配置"
echo "==================================="
echo ""

# 检查 dist 目录
if [ ! -d "dist" ]; then
    echo "❌ 错误：未找到 dist 目录"
    echo "请先运行: pnpm build:weapp"
    exit 1
fi

# 1. 创建 .env.production
echo "📝 创建生产环境变量文件..."
if [ ! -f ".env.production" ]; then
    cp .env.production.example .env.production
    echo "✅ 已创建 .env.production"
else
    echo "⚠️  .env.production 已存在"
fi
echo ""

# 2. 配置 AppID
echo "🔑 配置 AppID..."
echo "当前 AppID:"
grep "appid" dist/project.config.json | head -1
echo ""
echo "⚠️  请将 dist/project.config.json 中的 appid 修改为你的真实 AppID"
echo "   当前使用的是测试 ID: touristappid"
echo ""

# 3. 显示配置文件
echo "📄 需要配置的文件："
echo "   1. dist/project.config.json - 修改 appid"
echo "   2. .env.production - 修改 PROJECT_DOMAIN"
echo ""

# 4. 提供编辑命令
echo "📝 编辑命令："
echo "   编辑 AppID: nano dist/project.config.json"
echo "   编辑环境变量: nano .env.production"
echo ""

# 5. 下一步
echo "🚀 配置完成后，下一步："
echo "   1. 打开微信开发者工具"
echo "   2. 导入 dist/ 目录"
echo "   3. 填写你的 AppID"
echo "   4. 测试功能"
echo "   5. 上传发布"
echo ""

echo "💡 详细指南: cat WECHAT_MINI_PROGRAM.md"
echo ""
