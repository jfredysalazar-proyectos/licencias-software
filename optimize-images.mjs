import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const imageDir = join(__dirname, 'client/public/images');
const logoPath = join(__dirname, 'client/public/logo.png');
const faviconPath = join(__dirname, 'client/public/favicon.png');

async function optimizeImage(inputPath, outputPath = null) {
  try {
    const output = outputPath || inputPath;
    const ext = extname(inputPath).toLowerCase();
    
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
      console.log(`Skipping ${inputPath} - not a supported image format`);
      return;
    }

    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Optimizing ${inputPath}...`);
    console.log(`  Original size: ${metadata.width}x${metadata.height}`);
    
    // Optimize based on image type
    if (inputPath.includes('logo') || inputPath.includes('favicon')) {
      // Keep logos at original size but optimize
      await image
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(output + '.tmp');
    } else if (inputPath.includes('hero')) {
      // Hero images - resize to max 1920px width
      await image
        .resize(1920, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: 85 })
        .toFile(output.replace(ext, '.webp'));
      console.log(`  Converted to WebP: ${output.replace(ext, '.webp')}`);
      return;
    } else {
      // Product images - resize to max 800px width
      await image
        .resize(800, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: 80 })
        .toFile(output.replace(ext, '.webp'));
      console.log(`  Converted to WebP: ${output.replace(ext, '.webp')}`);
      return;
    }
    
    // For PNG files (logo, favicon), replace original
    const fs = await import('fs/promises');
    await fs.rename(output + '.tmp', output);
    console.log(`  Optimized: ${output}`);
    
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error.message);
  }
}

async function optimizeDirectory(dir) {
  try {
    const files = await readdir(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      const stats = await stat(filePath);
      
      if (stats.isDirectory()) {
        await optimizeDirectory(filePath);
      } else if (stats.isFile()) {
        await optimizeImage(filePath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
  }
}

async function main() {
  console.log('Starting image optimization...\n');
  
  // Optimize logo
  console.log('Optimizing logo...');
  await optimizeImage(logoPath);
  
  // Optimize favicon
  console.log('\nOptimizing favicon...');
  await optimizeImage(faviconPath);
  
  // Optimize all images in images directory
  console.log('\nOptimizing product and hero images...');
  await optimizeDirectory(imageDir);
  
  console.log('\n✅ Image optimization complete!');
}

main();
