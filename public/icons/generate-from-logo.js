const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceImage = path.join(__dirname, 'logo.png');

async function generateIcons() {
  console.log('🎨 开始生成PWA图标...\n');
  
  // Check if source image exists
  if (!fs.existsSync(sourceImage)) {
    console.error('❌ 错误: logo.png 文件不存在！');
    console.error('请确保在 public/icons/ 目录下有 logo.png 文件');
    process.exit(1);
  }

  // Get source image info
  const metadata = await sharp(sourceImage).metadata();
  console.log(`📷 源图标信息: ${metadata.width}x${metadata.height}, 格式: ${metadata.format}\n`);

  // Generate icons for each size
  for (const size of sizes) {
    try {
      const outputPath = path.join(__dirname, `icon-${size}x${size}.png`);
      
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ 生成成功: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ 生成失败 icon-${size}x${size}.png:`, error.message);
    }
  }

  console.log('\n🎉 所有图标生成完成！');
  console.log('\n📝 下一步:');
  console.log('1. 检查生成的图标是否符合预期');
  console.log('2. 如需要，更新 manifest.json 中的图标类型为 image/png');
}

generateIcons().catch(error => {
  console.error('❌ 生成过程出错:', error);
  process.exit(1);
});
