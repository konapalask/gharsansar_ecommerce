const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const productsDir = path.join(__dirname, 'public', 'products');

// Recursively get all image files
function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, filesList);
    } else if (/\.(png|jpg|jpeg)$/i.test(fullPath)) {
      filesList.push(fullPath);
    }
  }
  return filesList;
}

async function convertImages() {
  const imageFiles = getFiles(productsDir);
  console.log(`Found ${imageFiles.length} images to convert.`);

  let successCount = 0;
  let failCount = 0;

  for (const file of imageFiles) {
    const parsedPath = path.parse(file);
    const newFilePath = path.join(parsedPath.dir, `${parsedPath.name}.webp`);

    try {
      await sharp(file)
        .webp({ quality: 80 })
        .toFile(newFilePath);
      
      // If conversion is successful, delete the original file
      fs.unlinkSync(file);
      successCount++;
    } catch (err) {
      console.error(`Failed to convert: ${file}`, err);
      failCount++;
    }
  }

  console.log(`Conversion complete. Success: ${successCount}, Failed: ${failCount}`);

  // Now update products.json
  const productsJsonPath = path.join(__dirname, 'public', 'products.json');
  if (fs.existsSync(productsJsonPath)) {
    let rawData = fs.readFileSync(productsJsonPath, 'utf8');
    
    // Replace .png, .jpg, .jpeg with .webp globally in the JSON content
    // We only replace occurrences that look like file extensions at the end of image paths
    rawData = rawData.replace(/\.png|\.jpg|\.jpeg/gi, '.webp');
    
    fs.writeFileSync(productsJsonPath, rawData);
    console.log(`Updated products.json extensions to .webp`);
  }
}

convertImages();
