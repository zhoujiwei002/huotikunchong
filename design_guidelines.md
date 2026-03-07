# 活体昆虫库存管理系统设计指南

## 品牌定位

**应用类型**：企业库存管理工具
**设计风格**：简洁、高效、专业
**目标用户**：展会现场工作人员、总部管理人员
**使用场景**：实时库存同步、进货销售记录、死亡情况追踪

## 配色方案

### 主色调
- 主色（绿色系，象征生命/自然）：`bg-emerald-500`、`text-emerald-600`
- 选中/激活态：`bg-emerald-600`、`text-emerald-700`

### 中性色
- 主要文字：`text-gray-900`
- 次要文字：`text-gray-500`
- 边框：`border-gray-200`
- 背景：`bg-gray-50`、`bg-white`

### 语义色
- 成功/进货：`bg-green-500`、`text-green-600`
- 警告/死亡：`bg-red-500`、`text-red-600`
- 信息/销售：`bg-blue-500`、`text-blue-600`

## 字体规范

### 层级
- 页面标题：`text-xl font-bold text-gray-900`
- 卡片标题：`text-lg font-semibold text-gray-800`
- 正文：`text-base text-gray-700`
- 辅助文字：`text-sm text-gray-500`
- 标签/数字：`text-sm font-medium`

## 间距系统

### 页面布局
- 页面边距：`p-4`
- 卡片间距：`gap-4`
- 列表项间距：`gap-3`

### 组件内边距
- 按钮：`px-4 py-3`
- 卡片：`p-4`
- 输入框：`px-4 py-3`

## 组件规范

### 主按钮
```tsx
<View className="bg-emerald-500 rounded-lg">
  <Button className="w-full text-white font-medium">确定</Button>
</View>
```

### 次按钮
```tsx
<View className="bg-gray-100 rounded-lg">
  <Button className="w-full text-gray-700 font-medium">取消</Button>
</View>
```

### 卡片
```tsx
<View className="bg-white rounded-xl p-4 shadow-sm">
  {/* 卡片内容 */}
</View>
```

### 输入框（跨端兼容）
```tsx
<View className="bg-gray-50 rounded-xl px-4 py-3 mb-3">
  <Input
    className="w-full bg-transparent text-base"
    placeholder="请输入昆虫名称"
    placeholderClass="text-gray-400"
  />
</View>
```

### 列表项
```tsx
<View className="bg-white rounded-xl p-4 shadow-sm mb-3">
  <View className="flex justify-between items-start">
    <View className="flex-1">
      <Text className="block text-base font-semibold text-gray-900 mb-1">名称</Text>
      <Text className="block text-sm text-gray-500">描述</Text>
    </View>
    <View className="flex flex-col items-end">
      <Text className="block text-lg font-bold text-emerald-600">数量</Text>
      <Text className="block text-xs text-gray-400">状态</Text>
    </View>
  </View>
</View>
```

### 空状态
```tsx
<View className="flex flex-col items-center justify-center py-16">
  <Package className="w-16 h-16 text-gray-300 mb-4" />
  <Text className="block text-base text-gray-500">暂无数据</Text>
</View>
```

### 加载状态
```tsx
<View className="flex items-center justify-center py-8">
  <View className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></View>
</View>
```

## 导航结构

### 页面规划
- **首页（库存列表）**：展示所有昆虫品种的库存情况
- **进货记录页**：添加进货记录，增加库存
- **销售记录页**：记录销售，减少库存
- **死亡记录页**：记录死亡，减少库存

### TabBar 配置
无需 TabBar，使用页面跳转 + 模态框方式

## 数据展示规范

### 库存数量卡片
- 正常库存：`text-emerald-600` 背景透明
- 低库存警告（<10）：`text-orange-600` 背景浅橙色
- 无库存：`text-red-600` 背景浅红色

### 操作类型标签
- 进货：`bg-green-100 text-green-700`
- 销售：`bg-blue-100 text-blue-700`
- 死亡：`bg-red-100 text-red-700`

## 小程序约束

### 性能优化
- 列表数据分页加载（每页20条）
- 使用虚拟列表（大量数据时）
- 图片压缩（如需展示昆虫图片）

### 网络优化
- 请求失败自动重试
- 离线数据缓存
- 操作完成后立即刷新列表

### 用户体验
- 操作确认提示（防止误操作）
- 实时库存更新（自动刷新）
- 错误信息友好提示

## 跨端兼容要点

### 强制规范
- 所有垂直排列的 Text 必须添加 `block` 类
- 所有 Input 必须用 View 包裹，样式放外层
- Fixed + Flex 布局必须使用 inline style
- 平台检测：`const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP`
