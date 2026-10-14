const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

async function testPipeline() {
  try {
    console.log('Testing image pipeline...');
    const publicImagesDir = path.join(process.cwd(), 'public', 'images');
    const bgPath = path.join(publicImagesDir, 'image.png');
    console.log('image.png exists:', fs.existsSync(bgPath));
    
    // Test importing imageEditor (transpiled or direct ts-node / sharp)
    const bgBuffer = await sharp(bgPath).resize(1080, 1080, { fit: 'cover' }).toBuffer();
    console.log('bgBuffer size:', bgBuffer.length);
    
    // Check if SVG rendering in sharp works on this Windows system
    const testSvg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
      <text x="50" y="50" font-family="Arial" font-size="30" fill="white">Test</text>
    </svg>`;
    const testSvgBuffer = Buffer.from(testSvg);
    
    const compositeTest = await sharp(bgBuffer)
      .composite([{ input: testSvgBuffer, top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toBuffer();
      
    console.log('compositeTest success! length:', compositeTest.length);
  } catch (err) {
    console.error('Pipeline failed with error:', err);
  }
}

testPipeline();
