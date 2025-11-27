# 🎨 PWA图标快速参考

## 当前状态
✅ 所有8个尺寸的PNG图标已生成  
✅ 基于你的自定义 logo.png (951x1002px)  
✅ manifest.json 已更新  
✅ layout.ejs 已更新  
✅ 透明背景保留  

## 快速命令

### 重新生成所有图标
```bash
cd public/icons
node generate-from-logo.js
```

### 验证图标
```bash
cd public/icons
node verify-icons.js
```

### 安装图像处理库（如需要）
```bash
npm install --save-dev sharp
```

## 文件位置
- 源图标：`public/icons/logo.png`
- 生成的图标：`public/icons/icon-*x*.png`
- 配置文件：`public/manifest.json`
- 生成脚本：`public/icons/generate-from-logo.js`
- 验证脚本：`public/icons/verify-icons.js`

## 图标尺寸清单
- [x] 72x72 - Favicon
- [x] 96x96 - Android
- [x] 128x128 - Chrome Web Store
- [x] 144x144 - Windows Tile
- [x] 152x152 - iOS Touch Icon
- [x] 192x192 - Android Chrome
- [x] 384x384 - High DPI
- [x] 512x512 - PWA Splash Screen

## 下次更新图标
1. 替换 `public/icons/logo.png`
2. 运行 `node generate-from-logo.js`
3. 运行 `node verify-icons.js` 验证
4. 清除浏览器缓存测试

## 提示
- 源图标建议尺寸：512x512或更大
- 保持方形比例获得最佳效果
- PNG格式支持透明背景
- 避免图标中有过多细节（小尺寸时会模糊）
