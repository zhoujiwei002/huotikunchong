# 小程序配置文件说明

## 📝 需要配置的文件清单

### 1. dist/project.config.json

小程序项目配置文件，需要配置以下内容：

```json
{
  "appid": "your-appid-here",
  "projectname": "库存通",
  "description": "活体昆虫库存管理系统",
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": false,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "useIsolateContext": true,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "disableUseStrict": false,
    "minifyWXML": true,
    "showES6CompileOption": false,
    "useCompilerPlugins": false
  },
  "compileType": "miniprogram",
  "libVersion": "2.19.4",
  "appid": "your-appid-here",
  "projectname": "库存通",
  "condition": {},
  "editorSetting": {
    "tabIndent": "insertSpaces",
    "tabSize": 2
  }
}
```

**关键配置项**：
- `appid`：替换为你的小程序 AppID
- `projectname`：小程序名称
- `urlCheck`：开发阶段设为 `false`，生产阶段设为 `true`

---

### 2. dist/app.json

小程序全局配置文件：

```json
{
  "pages": [
    "pages/index/index",
    "pages/detail/index",
    "pages/statistics/index"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTitleText": "库存通",
    "navigationBarTextStyle": "black"
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json",
  "lazyCodeLoading": "requiredComponents"
}
```

**关键配置项**：
- `pages`：页面路径列表
- `window`：窗口外观配置
- `style`：样式版本
- `lazyCodeLoading`：按需注入，提升性能

---

### 3. API 地址配置

在编译时需要配置后端 API 地址。

**方法 1：修改环境变量**
```bash
# 在 .env.production 中配置
PROJECT_DOMAIN=https://your-api-domain.com
```

**方法 2：修改网络请求配置**
在 `src/network/` 中修改 API 域名配置。

---

## 🚀 部署步骤总结

### 步骤 1：准备小程序账号
- [ ] 注册小程序账号
- [ ] 获取 AppID
- [ ] 配置基本信息

### 步骤 2：配置文件
- [ ] 修改 `dist/project.config.json` 中的 AppID
- [ ] 检查 `dist/app.json` 配置
- [ ] 配置后端 API 地址

### 步骤 3：导入项目
- [ ] 打开微信开发者工具
- [ ] 导入 `dist/` 目录
- [ ] 填写 AppID

### 步骤 4：测试功能
- [ ] 开发阶段测试
- [ ] 真机调试
- [ ] 确保所有功能正常

### 步骤 5：配置服务器域名
- [ ] 在微信公众平台配置 request 合法域名
- [ ] 配置 uploadFile 合法域名
- [ ] 配置 downloadFile 合法域名

### 步骤 6：上传和发布
- [ ] 上传代码
- [ ] 提交审核
- [ ] 等待审核
- [ ] 发布上线

---

## ⚠️ 注意事项

1. **AppID 必须正确**
   - 在 `project.config.json` 中配置
   - 与小程序管理后台的 AppID 一致

2. **服务器域名必须 HTTPS**
   - 不能使用 HTTP
   - 域名需要备案（国内服务器）
   - 证书必须有效

3. **开发阶段调试**
   - 可以在开发者工具中勾选"不校验合法域名"
   - 方便快速测试

4. **生产环境必须配置域名**
   - 不能勾选"不校验合法域名"
   - 否则无法通过审核

5. **图片上传功能**
   - 需要配置 uploadFile 合法域名
   - 确保后端接口正常

6. **隐私权限**
   - 如果使用相机、相册等权限
   - 需要在 `app.json` 中声明

---

## 📞 获取帮助

如果遇到问题：
1. 查看微信官方文档
2. 查看常见问题解答
3. 联系我获取帮助
