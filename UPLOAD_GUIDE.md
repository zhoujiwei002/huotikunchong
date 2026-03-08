# 📤 微信小程序上传指南

## 前置条件

在上传之前，请确认：

- ✅ 小程序已在微信开发者工具中正常运行
- ✅ 后端服务已部署到线上（参考下方"部署后端服务"章节）
- ✅ 小程序已配置正确的后端域名
- ✅ 所有功能已测试通过

---

## 步骤 1：部署后端服务（如果还没部署）

### 选项 A：使用云服务器部署

1. **购买云服务器**
   - 推荐使用：阿里云、腾讯云、华为云
   - 系统选择：Ubuntu 20.04 或 22.04
   - 配置：2核4GB 起步

2. **安装 Node.js 和 pnpm**
   ```bash
   # 安装 Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # 安装 pnpm
   npm install -g pnpm
   ```

3. **上传代码**
   ```bash
   # 在本地打包
   tar -czf server.tar.gz --exclude='node_modules' --exclude='dist' server/

   # 上传到服务器
   scp server.tar.gz root@your-server-ip:/root/

   # 在服务器上解压
   ssh root@your-server-ip
   tar -xzf server.tar.gz
   cd server
   pnpm install
   pnpm build
   ```

4. **配置环境变量**
   ```bash
   # 创建 .env 文件
   cat > .env << EOF
   PROJECT_DOMAIN=https://your-domain.com
   COZE_SUPABASE_URL=your-supabase-url
   COZE_SUPabase_ANON_KEY=your-supabase-anon-key
   EOF
   ```

5. **使用 PM2 启动服务**
   ```bash
   # 安装 PM2
   npm install -g pm2

   # 启动服务
   pm2 start npm --name "inventory-server" -- start

   # 设置开机自启
   pm2 startup
   pm2 save
   ```

6. **配置 Nginx 反向代理**
   ```bash
   # 安装 Nginx
   sudo apt-get install -y nginx

   # 配置 Nginx
   sudo nano /etc/nginx/sites-available/inventory

   # 配置内容
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }

   # 启用配置
   sudo ln -s /etc/nginx/sites-available/inventory /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **配置 HTTPS（可选但推荐）**
   ```bash
   # 安装 Certbot
   sudo apt-get install -y certbot python3-certbot-nginx

   # 获取 SSL 证书
   sudo certbot --nginx -d your-domain.com
   ```

### 选项 B：使用 Serverless 部署（快速上线）

参考项目中的 `DEPLOYMENT.md` 文档，使用云函数或 Serverless 服务部署。

---

## 步骤 2：配置小程序服务器域名

### 1. 登录微信公众平台
- 访问：https://mp.weixin.qq.com/
- 使用你的账号登录
- 进入"开发" → "开发管理" → "开发设置"

### 2. 配置服务器域名

在"服务器域名"中，点击"修改"，添加以下域名：

**request 合法域名**
```
https://your-domain.com
```

**uploadFile 合法域名**
```
https://your-domain.com
```

**downloadFile 合法域名**
```
https://your-domain.com
```

**重要提示**：
- 域名必须是 HTTPS
- 不能使用 IP 地址
- 不能使用端口号
- 不能使用 localhost

### 3. 配置业务域名（可选）

如果小程序中有 web-view，需要配置业务域名：
```
https://your-domain.com
```

---

## 步骤 3：配置小程序后端地址

### 1. 修改 `.env` 文件

```bash
cd projects
cp .env.production .env
```

编辑 `.env` 文件：
```
PROJECT_DOMAIN=https://your-domain.com
```

### 2. 重新构建小程序

```bash
pnpm build:weapp
```

### 3. 在微信开发者工具中刷新

点击"编译"按钮，重新加载小程序。

---

## 步骤 4：上传小程序

### 1. 在微信开发者工具中上传

1. 点击工具栏的"上传"按钮
2. 填写版本号：`1.0.0`
3. 填写项目备注：例如"首次发布，包含完整的库存管理功能"
4. 点击"上传"

### 2. 上传成功提示

上传成功后，会显示：
```
✅ 上传成功
版本号：1.0.0
```

---

## 步骤 5：提交审核

### 1. 登录微信公众平台

访问：https://mp.weixin.qq.com/

### 2. 进入版本管理

1. 点击"管理" → "版本管理"
2. 找到刚刚上传的版本（版本号：1.0.0）
3. 点击"提交审核"

### 3. 填写审核信息

**审核信息**：
- **功能页面**：选择"pages/index/index"（首页）
- **页面截图**：上传小程序运行截图
- **功能描述**：填写以下内容：

```
活体昆虫库存管理系统，支持多门店库存同步、操作记录追踪、数据统计及门店间串货。

核心功能：
1. 库存管理：查看和管理各门店的昆虫库存
2. 销售记录：记录销售信息和实收价格
3. 死亡记录：记录昆虫死亡情况
4. 库存统计：查看库存汇总和统计数据
5. 串货功能：支持门店间库存转移
```

**测试账号**：
- 填写你的微信号
- 填写测试密码（如果需要）

### 4. 提交审核

点击"提交审核"按钮。

---

## 步骤 6：等待审核

### 审核时间
- 一般审核时间：1-3 个工作日
- 加急审核：需要额外付费

### 审核中状态
可以在"版本管理"中查看审核状态：
- **审核中**：正在等待微信审核
- **审核通过**：可以发布上线
- **审核驳回**：需要修改后重新提交

### 审核被驳回怎么办？

1. 查看驳回原因
2. 修改相关问题
3. 重新构建和上传
4. 重新提交审核

---

## 步骤 7：发布上线

### 1. 审核通过后发布

1. 登录微信公众平台
2. 进入"管理" → "版本管理"
3. 找到已通过审核的版本
4. 点击"发布"

### 2. 发布成功提示

发布成功后，用户就可以在微信中搜索并使用你的小程序了。

---

## 📋 上传检查清单

上传前请检查：

- [ ] 后端服务已部署到线上
- [ ] 后端域名已配置 HTTPS
- [ ] 小程序服务器域名已配置
- [ ] `.env` 文件中的后端地址已更新
- [ ] 小程序已重新构建
- [ ] 所有功能已在真机测试通过
- [ ] 小程序已设置分类（建议：工具 > 其他工具）
- [ ] 小程序已设置服务类目（建议：工具 > 其他工具）

---

## 🔧 常见问题

### Q1: 上传时提示"网络请求失败"？

**解决方法**：
1. 检查网络连接
2. 检查微信开发者工具是否需要登录
3. 尝试重新登录微信开发者工具

### Q2: 审核被驳回"功能不完整"？

**解决方法**：
1. 确保所有功能都可以正常使用
2. 提供详细的功能描述
3. 上传完整的页面截图
4. 提供测试账号

### Q3: 审核被驳回"缺少必要信息"？

**解决方法**：
1. 确保填写了所有必填项
2. 提供详细的客服电话
3. 提供详细的用户协议和隐私政策

### Q4: 发布后用户搜索不到？

**解决方法**：
1. 确认小程序已发布上线
2. 等待 1-2 天让搜索引擎索引
3. 提供小程序码让用户扫码使用

### Q5: 小程序无法连接后端？

**解决方法**：
1. 检查服务器域名配置是否正确
2. 检查 HTTPS 证书是否有效
3. 检查后端服务是否正常运行
4. 检查 `.env` 文件中的后端地址是否正确

---

## 📞 需要帮助？

如果遇到问题，请：
1. 查看微信公众平台官方文档
2. 查看项目中的 `DEPLOYMENT.md`
3. 检查控制台错误日志
4. 联系微信小程序官方客服

---

## 🎉 开始上传

现在你可以按照上述步骤，将小程序上传到微信公众平台了！

**建议先在测试环境完整测试所有功能，确保无误后再上传！** 🚀
