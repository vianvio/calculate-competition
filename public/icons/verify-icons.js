const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const requiredSizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function verifyIcons() {
  console.log('🔍 验证PWA图标...\n');
  
  let allValid = true;

  for (const size of requiredSizes) {
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(__dirname, filename);
    
    if (!fs.existsSync(filepath)) {
      console.log(`❌ 缺失: ${filename}`);
      allValid = false;
      continue;
    }
    
    try {
      const metadata = await sharp(filepath).metadata();
      
      if (metadata.width === size && metadata.height === size) {
        console.log(`✅ ${filename}: ${metadata.width}x${metadata.height}, ${metadata.format}, ${(metadata.size / 1024).toFixed(2)}KB`);
      } else {
        console.log(`⚠️  ${filename}: 尺寸不匹配 (${metadata.width}x${metadata.height}, 预期 ${size}x${size})`);
        allValid = false;
      }
    } catch (error) {
      console.log(`❌ ${filename}: 读取失败 - ${error.message}`);
      allValid = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  if (allValid) {
    console.log('✅ 所有图标验证通过！');
  } else {
    console.log('❌ 部分图标存在问题，请检查');
  }
  console.log('='.repeat(50));
}

verifyIcons().catch(error => {
  console.error('验证过程出错:', error);
  process.exit(1);
});
