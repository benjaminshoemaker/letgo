const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

function createSVG(size) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981"/>
      <stop offset="100%" style="stop-color:#059669"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" fill="url(#bg)"/>
  <text x="50%" y="54%" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="${Math.round(size * 0.38)}" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="middle">LG</text>
</svg>`);
}

async function generateIcons() {
  const outputDir = path.join(__dirname, '..', 'public', 'icons');

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sizes = [192, 512];

  for (const size of sizes) {
    const svg = createSVG(size);
    const outputPath = path.join(outputDir, `icon-${size}.png`);

    await sharp(svg)
      .png()
      .toFile(outputPath);

    console.log(`Created ${outputPath}`);
  }

  // Also create a favicon
  const faviconSvg = createSVG(32);
  await sharp(faviconSvg)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'favicon.ico'));
  console.log('Created public/favicon.ico');

  // Create apple-touch-icon
  const appleSvg = createSVG(180);
  await sharp(appleSvg)
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log('Created public/icons/apple-touch-icon.png');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
