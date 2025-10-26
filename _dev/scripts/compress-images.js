const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const coversDir = path.join(__dirname, 'assets', 'images', 'covers');
const files = fs.readdirSync(coversDir);

const largePNGs = files.filter(f => {
  const ext = path.extname(f).toLowerCase();
  if (ext !== '.png') return false;
  const fullPath = path.join(coversDir, f);
  const stats = fs.statSync(fullPath);
  return stats.size > 500 * 1024; // Over 500KB
});

console.log(`Found ${largePNGs.length} large PNG files to optimize`);

async function convertToJPG(file) {
  const inputPath = path.join(coversDir, file);
  const outputPath = path.join(coversDir, file.replace('.png', '.jpg'));

  // Check if Node has canvas or sharp installed
  try {
    const sharp = require('sharp');
    await sharp(inputPath)
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);
    console.log(`✓ Converted ${file} to JPG with sharp`);
    return true;
  } catch (err) {
    console.log(`sharp not available, trying system convert...`);
    // Try ImageMagick as fallback
    try {
      await execPromise(`magick convert "${inputPath}" -quality 85 "${outputPath}"`);
      console.log(`✓ Converted ${file} to JPG with ImageMagick`);
      return true;
    } catch (e) {
      console.log(`✗ Failed to convert ${file}: ${e.message}`);
      return false;
    }
  }
}

(async () => {
  console.log('\nAttempting to install sharp for image optimization...');
  try {
    await execPromise('npm install sharp --no-save');
    console.log('✓ sharp installed\n');
  } catch (e) {
    console.log('Could not install sharp, will try system tools\n');
  }

  for (const file of largePNGs) {
    await convertToJPG(file);
  }

  console.log('\nDone! Please update HTML files to use .jpg instead of .png for these images.');
})();
