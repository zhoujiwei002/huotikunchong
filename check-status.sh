#!/bin/bash
# 状态检查脚本 - 快速检查系统状态

echo "==================================="
echo "  库存通小程序 - 系统状态检查"
echo "==================================="
echo ""

# 1. 检查 Git 状态
echo "📋 Git 状态："
git status --short
echo ""

# 2. 检查最近提交
echo "📝 最近提交："
git log --oneline -3
echo ""

# 3. 检查端口占用
echo "🔌 端口状态："
if ss -tuln 2>/dev/null | grep -q ':5000.*LISTEN'; then
    echo "✅ 前端端口 5000 正在监听"
else
    echo "❌ 前端端口 5000 未监听"
fi

if ss -tuln 2>/dev/null | grep -q ':3000.*LISTEN'; then
    echo "✅ 后端端口 3000 正在监听"
else
    echo "❌ 后端端口 3000 未监听"
fi
echo ""

# 4. 检查日志错误
echo "🐛 系统错误（最近10条）："
tail -100 /tmp/coze-logs/dev.log 2>/dev/null | grep -iE "error|exception|warn" | tail -10
if [ $? -ne 0 ]; then
    echo "✅ 无系统错误"
fi
echo ""

# 5. 检查前端错误
echo "🌐 前端错误（最近5条）："
tail -50 /app/work/logs/bypass/console.log 2>/dev/null | grep -iE "error|exception" | tail -5
if [ $? -ne 0 ]; then
    echo "✅ 无前端错误"
fi
echo ""

# 6. 检查门店配置
echo "🏢 门店配置："
grep -n "locationOptions\|LOCATIONS" src/pages/index/index.tsx src/pages/statistics/index.tsx 2>/dev/null | head -10
echo ""

echo "==================================="
echo "  状态检查完成"
echo "==================================="
