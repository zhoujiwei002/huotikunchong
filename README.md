# 活体昆虫库存管理小程序 - 项目说明

## 📋 项目概述

基于 Taro 框架开发的活体昆虫库存管理小程序，支持多位置库存同步、操作记录追踪、数据统计及门店间串货。

## 🛠️ 技术栈

- **前端框架**：Taro 4 + React 18 + Tailwind CSS 4
- **后端框架**：NestJS 10
- **数据库**：PostgreSQL (Supabase)
- **图片处理**：Sharp (自动裁剪为 600x600 JPEG)
- **图标库**：lucide-react-taro
- **包管理器**：pnpm

## 🚀 快速启动

### 启动开发环境
```bash
cd /workspace/projects
coze dev
```

- **前端地址**：http://localhost:5000
- **后端地址**：http://localhost:3000

### 构建生产版本
```bash
pnpm build
```

### 代码检查
```bash
pnpm lint:build && pnpm tsc
```

## 📍 门店配置（固定）

目前系统支持的门店位置（共9个）：

1. 公司总部
2. 王东团队
3. 袁兴彪团队
4. 郭秀华团队
5. 王希强团队
6. 王成兵团队
7. 周纪良团队
8. 秦文胜团队
9. 刘君团队

**门店配置位置**：
- `src/pages/index/index.tsx` - `locationOptions` 数组
- `src/pages/statistics/index.tsx` - `LOCATIONS` 数组

**添加新门店时需要同时修改这两个文件！**

## 🐛 预设昆虫品种

系统初始化时会自动创建以下昆虫品种：

| 名称 | 物种 | 价格 | 描述 |
|------|------|------|------|
| 天门螳螂 | 螳螂 | 50 | 天门地区特产螳螂 |
| 天门甲虫 | 甲虫 | 80 | 天门地区特产甲虫 |
| 晋中甲虫 | 甲虫 | 100 | 晋中地区特产甲虫 |
| 绥化甲虫 | 甲虫 | 120 | 绥化地区特产甲虫 |
| 本溪甲虫 | 甲虫 | 90 | 本溪地区特产甲虫 |
| 天门睫角 | 睫角守宫 | 180 | 天门地区特产睫角 |

## ⚙️ 核心功能配置

### 库存阈值
- **无库存**：数量 = 0
- **库存正常**：数量 > 0
- **库存紧张**：已移除此提示

### 图片上传规范
- **尺寸**：自动裁剪为 600x600 正方形
- **格式**：JPEG
- **质量**：75%
- **存储**：Supabase 对象存储

### 操作员识别
- **实现方式**：用户昵称存储在 Taro Storage 中
- **工具文件**：`src/utils/user.ts`
- **功能**：
  - `getUserNickname()` - 获取用户昵称
  - `setUserNickname(nickname)` - 设置用户昵称

### 进货功能
- **状态**：已从客户端移除
- **原因**：进货需求已不需要

### 删除昆虫
- **限制**：仅在库存数量为 0 时可用
- **后端验证**：会检查所有门店的库存数量

## 📁 项目结构

```
src/
├── pages/
│   ├── index/          # 首页（库存列表、添加昆虫、操作记录）
│   ├── detail/         # 详情页（昆虫详情、操作历史）
│   └── statistics/     # 统计页（数据统计、报表导出）
├── network/            # 网络请求封装
├── utils/
│   └── user.ts         # 用户昵称管理
└── server/             # 后端服务
```

## 🌐 API 路由

所有后端路由自动加上 `/api` 前缀（在 `server/src/main.ts` 中配置）

### 库存相关
- `GET /api/inventory` - 获取所有库存
- `GET /api/inventory/:id` - 获取库存详情
- `POST /api/inventory/insects` - 添加昆虫品种
- `DELETE /api/inventory/insects/:id` - 删除昆虫品种

### 操作记录
- `POST /api/inventory/operations` - 创建操作记录（销售/死亡/进货）
- `GET /api/inventory/logs` - 获取操作记录

### 图片上传
- `POST /api/upload` - 上传图片并处理

### 统计数据
- `GET /api/inventory` - 返回库存数据
- `GET /api/inventory/logs` - 返回操作记录

## 🔧 重要注意事项

### 门店配置（CRITICAL）
- 门店位置是**固定配置**，修改时需要同时更新两个文件
- 添加新门店时，按照现有格式添加到数组的末尾

### 用户昵称功能
- 首次使用需要点击标题栏的紫色用户图标设置昵称
- 昵称存储在本地 Storage 中，不会同步到服务器
- 操作记录会显示操作员昵称

### 跨端兼容性
- **H5 端白屏问题**：所有垂直排列的 Text 必须添加 `block` 类名
- **Input 样式**：必须用 View 包裹，样式放在 View 上
- **Fixed + Flex**：必须使用 inline style
- **平台检测**：使用 `const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP`

### 代码规范
- 使用 `pnpm` 作为包管理器（禁止使用 npm/yarn）
- 使用 Tailwind CSS 实现样式
- 禁止硬编码 localhost 到请求 URL
- 网络请求使用 `Network.request`（禁止直接使用 Taro.request）

## 📝 最近修改记录

### 2025-03-05
- ✅ 新增门店"刘君团队"
- ✅ 实现操作员身份识别功能（用户昵称）
- ✅ 添加昵称设置弹窗
- ✅ 操作记录显示操作员信息

## 🔄 如果沙箱断开

### 恢复步骤
1. **重新初始化项目**：
   ```bash
   cd /workspace/projects
   coze init ${COZE_WORKSPACE_PATH} --template taro
   ```

2. **启动开发环境**：
   ```bash
   coze dev
   ```

3. **检查 Git 状态**：
   ```bash
   git status
   ```

4. **如果需要恢复之前的改动**：
   ```bash
   git log  # 查看提交历史
   git checkout <commit-hash>  # 恢复到指定版本
   ```

## 📞 联系信息

如有问题，请查看：
- 系统日志：`tail -50 /tmp/coze-logs/dev.log`
- 前端日志：`tail -50 /app/work/logs/bypass/console.log`
- 后端日志：查看开发服务器控制台

## ✅ 验证清单

每次修改后请确认：
- [ ] ESLint 检查通过
- [ ] TypeScript 类型检查通过
- [ ] 编译检查通过（H5/WeApp/TT/Server）
- [ ] 热更新正常
- [ ] 前端页面正常渲染
- [ ] 后端接口正常响应
- [ ] 无新错误引入

---

**文档生成时间**：2025-03-05
**当前分支**：main
**项目状态**：✅ 正常运行
