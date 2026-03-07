#!/bin/bash
# 后端服务部署脚本

echo "==================================="
echo "  库存通小程序 - 后端部署脚本"
echo "==================================="
echo ""

# 检查是否已构建
if [ ! -d "server/dist" ]; then
    echo "⚠️  未找到后端构建产物，正在构建..."
    cd server && pnpm build && cd ..
    echo ""
fi

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 正在安装 PM2..."
    npm install -g pm2
    echo "✅ PM2 安装完成"
    echo ""
fi

# 检查 .env 文件
if [ ! -f "server/.env" ]; then
    echo "📝 创建后端环境变量文件..."
    cat > server/.env << EOF
# 数据库配置（使用 Supabase）
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Supabase 配置
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# 服务端口
PORT=3000

# 文件存储
STORAGE_URL=your-storage-url
EOF
    echo "⚠️  请先编辑 server/.env 文件，配置数据库和存储信息"
    echo "   然后重新运行此脚本"
    echo ""
    echo "编辑命令：nano server/.env"
    exit 1
fi

echo "🚀 启动后端服务..."
echo ""

# 启动 PM2
cd server
pm2 start npm --name "kucuntong-api" -- start
pm2 save
pm2 startup

echo ""
echo "==================================="
echo "  后端部署完成！"
echo "==================================="
echo ""
echo "✅ 后端服务已启动！"
echo ""
echo "📋 服务信息："
echo "   状态：pm2 status"
echo "   日志：pm2 logs kucuntong-api"
echo "   重启：pm2 restart kucuntong-api"
echo "   停止：pm2 stop kucuntong-api"
echo ""
echo "🌐 后端地址："
echo "   http://localhost:3000"
echo ""
echo "⚠️  请确保防火墙已开放 3000 端口"
echo ""
