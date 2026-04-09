import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagesDir = 'public/images';
const files = fs.readdirSync(imagesDir);

for (const file of files) {
  if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jfif')) {
    const inputPath = path.join(imagesDir, file);
    const fileName = path.parse(file).name;
    const outputPath = path.join(imagesDir, `${fileName}.webp`);

    console.log(`Optimizing ${file}...`);
    
    await sharp(inputPath)
      .resize(800) // Moderate resize to keep quality but reduce pixels
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    console.log(`Created ${outputPath}`);
  }
}
