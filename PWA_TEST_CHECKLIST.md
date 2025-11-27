# PWA 测试清单

## 启动开发服务器
```bash
npm run dev
```

## 测试步骤

### 1. 基础验证
- [ ] 访问 http://localhost:3000/calculate-competition/
- [ ] 检查首页是否正常显示
- [ ] 检查"📱 安装到主屏幕"按钮是否显示

### 2. Manifest 验证
- [ ] 打开浏览器开发者工具
- [ ] 进入 Application > Manifest
- [ ] 验证manifest.json加载成功
- [ ] 检查所有图标路径是否正确

### 3. Service Worker 验证
- [ ] 开发者工具 > Application > Service Workers
- [ ] 验证service-worker.js注册成功
- [ ] 检查状态为"activated and running"

### 4. 离线功能测试
- [ ] 正常访问应用
- [ ] 开发者工具 > Network > 勾选 Offline
- [ ] 刷新页面，验证应用仍可访问
- [ ] 取消 Offline，恢复在线状态

### 5. 安装测试（Chrome）
- [ ] 点击"📱 安装到主屏幕"按钮
- [ ] 确认安装提示出现
- [ ] 接受安装
- [ ] 验证应用安装成功
- [ ] 从应用列表启动
- [ ] 验证独立窗口模式

### 6. iOS Safari 测试
- [ ] 在iPad/iPhone的Safari中打开
- [ ] 点击分享按钮
- [ ] 选择"添加到主屏幕"
- [ ] 验证图标显示正确
- [ ] 从主屏幕启动
- [ ] 验证全屏显示

### 7. 缓存验证
- [ ] 开发者工具 > Application > Cache Storage
- [ ] 查看 calculate-competition-v1 缓存
- [ ] 验证以下资源被缓存：
  - CSS文件
  - JS文件
  - manifest.json

### 8. 安装按钮行为
- [ ] 验证未安装时按钮显示
- [ ] 安装后按钮自动隐藏
- [ ] 独立模式下按钮不显示

## 浏览器测试矩阵

| 浏览器 | 版本 | 安装 | 离线 | Service Worker | 备注 |
|--------|------|------|------|----------------|------|
| Chrome Desktop | Latest | ⬜ | ⬜ | ⬜ | |
| Chrome Android | Latest | ⬜ | ⬜ | ⬜ | |
| Safari iOS | 16.4+ | ⬜ | ⬜ | ⬜ | |
| Safari iOS | < 16.4 | ⬜ | ⬜ | ⬜ | 需手动安装 |
| Edge Desktop | Latest | ⬜ | ⬜ | ⬜ | |
| Firefox Desktop | Latest | ⬜ | ⬜ | ⬜ | |

## 常见问题排查

### 安装按钮不显示
1. 检查是否使用HTTPS（或localhost）
2. 检查manifest.json是否正确链接
3. 检查浏览器控制台错误
4. 确认应用未被安装

### Service Worker未注册
1. 检查service-worker.js路径
2. 确认使用HTTPS（或localhost）
3. 查看浏览器控制台错误
4. 清除浏览器缓存重试

### 离线不工作
1. 验证Service Worker状态
2. 检查Cache Storage内容
3. 确认urlsToCache列表完整
4. 查看Network标签页请求来源

### 图标不显示
1. 确认SVG文件存在于public/icons/
2. 检查manifest.json中的路径
3. 验证图标URL可访问
4. 尝试使用PNG格式替代

## 性能指标

使用 Lighthouse 测试PWA评分：
- [ ] Performance > 90
- [ ] Best Practices > 90
- [ ] SEO > 90
- [ ] PWA > 90

## 生产环境部署检查

- [ ] 配置HTTPS
- [ ] 更新manifest.json的start_url为生产域名
- [ ] 更新service-worker.js的BASE_PATH
- [ ] 测试所有资源路径
- [ ] 验证跨域资源访问
- [ ] 更新CACHE_NAME版本号
