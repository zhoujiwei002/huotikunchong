#!/bin/bash
# 沙箱恢复脚本 - 用于沙箱断开后快速恢复开发环境

echo "==================================="
echo "  库存通小程序 - 沙箱恢复脚本"
echo "==================================="
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：未找到 package.json 文件"
    echo "请确保在 /workspace/projects 目录下执行此脚本"
    exit 1
fi

echo "✅ 当前目录正确"
echo ""

# 检查 Git 状态
echo "📋 检查 Git 状态..."
git status
echo ""

# 检查是否有未提交的改动
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  警告：检测到未提交的改动"
    echo ""
    read -p "是否要提交这些改动？(y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "chore: 沙箱恢复前提交未保存的改动"
        echo "✅ 改动已提交"
    else
        echo "⚠️  跳过提交"
    fi
    echo ""
fi

# 显示最近的提交记录
echo "📝 最近的提交记录："
git log --oneline -5
echo ""

# 启动开发环境
echo "🚀 正在启动开发环境..."
coze dev
