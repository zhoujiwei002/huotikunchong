#!/bin/bash
# 微信小程序部署前检查脚本

echo "==================================="
echo "  库存通小程序 - 部署前检查"
echo "==================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_item() {
    if [ $1 -eq 0 ]; then
        echo -e "✅ ${GREEN}$2${NC}"
        return 0
    else
        echo -e "❌ ${RED}$2${NC}"
        return 1
    fi
}

# 1. 检查构建产物
echo "📦 检查构建产物..."
if [ -d "dist" ]; then
    check_item 0 "微信小程序构建产物存在 (dist/)"
else
    check_item 1 "微信小程序构建产物不存在 (dist/)"
fi

if [ -d "dist/pages" ]; then
    check_item 0 "页面文件完整"
else
    check_item 1 "页面文件不完整"
fi

echo ""

# 2. 检查配置文件
echo "⚙️  检查配置文件..."
if [ -f "dist/app.json" ]; then
    check_item 0 "app.json 配置文件存在"
else
    check_item 1 "app.json 配置文件不存在"
fi

if [ -f "dist/project.config.json" ]; then
    check_item 0 "project.config.json 配置文件存在"
else
    check_item 1 "project.config.json 配置文件不存在"
fi

# 检查 AppID
if grep -q "your-appid-here" dist/project.config.json 2>/dev/null; then
    echo -e "⚠️  ${YELLOW}⚠️  AppID 未配置，请修改 project.config.json 中的 appid${NC}"
else
    check_item 0 "AppID 已配置"
fi

echo ""

# 3. 检查后端 API 配置
echo "🌐 检查后端 API 配置..."
if [ -f ".env.production" ]; then
    check_item 0 ".env.production 环境变量文件存在"

    if grep -q "your-domain.com" .env.production 2>/dev/null; then
        echo -e "⚠️  ${YELLOW}⚠️  API 地址未配置，请修改 .env.production 中的 PROJECT_DOMAIN${NC}"
    else
        check_item 0 "API 地址已配置"
    fi
else
    echo -e "⚠️  ${YELLOW}⚠️  未找到 .env.production，请创建并配置${NC}"
fi

echo ""

# 4. 显示门店配置
echo "🏢 当前门店配置："
grep -A 1 "locationOptions = " src/pages/index/index.tsx 2>/dev/null | grep -o "\[.*\]" | head -1
echo ""

# 5. 检查 Git 状态
echo "📋 Git 状态："
git status --short 2>/dev/null
if [ $? -eq 0 ]; then
    if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
        check_item 0 "工作目录干净，无未提交的改动"
    else
        echo -e "⚠️  ${YELLOW}⚠️  检测到未提交的改动，建议先提交${NC}"
    fi
else
    echo -e "⚠️  ${YELLOW}⚠️  Git 不可用${NC}"
fi

echo ""

# 6. 显示部署清单
echo "==================================="
echo "  部署清单"
echo "==================================="
echo ""

echo "准备阶段："
echo "  [ ] 注册微信小程序账号"
echo "  [ ] 获取 AppID"
echo "  [ ] 下载微信开发者工具"
echo ""

echo "配置阶段："
echo "  [ ] 修改 dist/project.config.json 中的 appid"
echo "  [ ] 配置后端 API 地址 (.env.production)"
echo "  [ ] 在微信公众平台配置服务器域名"
echo ""

echo "测试阶段："
echo "  [ ] 导入项目到微信开发者工具"
echo "  [ ] 测试所有功能"
echo "  [ ] 真机调试"
echo ""

echo "发布阶段："
echo "  [ ] 上传代码"
echo "  [ ] 提交审核"
echo "  [ ] 发布上线"
echo ""

# 7. 下一步操作
echo "==================================="
echo "  下一步操作"
echo "==================================="
echo ""

echo "1️⃣  修改 AppID："
echo "   nano dist/project.config.json"
echo "   将 'your-appid-here' 替换为你的 AppID"
echo ""

echo "2️⃣  配置 API 地址："
echo "   cp .env.production.example .env.production"
echo "   nano .env.production"
echo "   修改 PROJECT_DOMAIN 为你的后端地址"
echo ""

echo "3️⃣  导入项目："
echo "   打开微信开发者工具"
echo "   导入 dist/ 目录"
echo "   填写 AppID"
echo ""

echo "4️⃣  查看详细指南："
echo "   cat WECHAT_MINI_PROGRAM.md"
echo ""

echo "==================================="
echo "  检查完成"
echo "==================================="
