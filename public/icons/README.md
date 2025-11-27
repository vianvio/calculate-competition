# PWA图标生成说明

## 当前图标
基于 `logo.png` 生成的所有尺寸PWA图标已就绪：
- ✅ icon-72x72.png
- ✅ icon-96x96.png
- ✅ icon-128x128.png
- ✅ icon-144x144.png
- ✅ icon-152x152.png
- ✅ icon-192x192.png
- ✅ icon-384x384.png
- ✅ icon-512x512.png

## 如何重新生成图标

### 使用自动脚本（推荐）
1. 将新的图标文件命名为 `logo.png` 并放在此目录
2. 运行生成脚本：
```bash
cd public/icons
node generate-from-logo.js
```

脚本会自动：
- 检测源图标尺寸和格式
- 生成所有需要的尺寸
- 保持透明背景
- 输出为PNG格式

### 方法2：使用在线工具
访问 https://realfavicongenerator.net/ 或 https://www.pwabuilder.com/imageGenerator
上传一个512x512的PNG图片，自动生成所有尺寸的图标。

### 方法3：使用命令行工具 ImageMagick
如果已安装 ImageMagick，可以使用以下命令批量生成：

```bash
# 从一个logo.png源图标生成所有尺寸
convert logo.png -resize 72x72 icon-72x72.png
convert logo.png -resize 96x96 icon-96x96.png
convert logo.png -resize 128x128 icon-128x128.png
convert logo.png -resize 144x144 icon-144x144.png
convert logo.png -resize 152x152 icon-152x152.png
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 384x384 icon-384x384.png
convert logo.png -resize 512x512 icon-512x512.png
```

## 图标要求
- **格式**: PNG（支持透明背景）
- **源文件尺寸**: 建议 512x512 或更大（方形）
- **设计建议**: 
  - 确保图标在小尺寸（72x72）下清晰可见
  - 避免过多细节
  - 使用高对比度
  - 考虑使用圆角方形设计（适合iOS和Android）

## 技术说明
- 使用 sharp 库进行图像处理
- 自动保持长宽比
- 透明背景支持
- 高质量PNG输出
