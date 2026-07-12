const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const GARLAND_DIR = path.join(__dirname, 'public', 'products', 'Garlands');
const PRODUCTS_JSON = path.join(__dirname, 'public', 'products.json');

async function convertAll() {
  try {
    const files = fs.readdirSync(GARLAND_DIR).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
    console.log(`Found ${files.length} images to convert.`);

    for (const file of files) {
      const oldPath = path.join(GARLAND_DIR, file);
      const ext = path.extname(file);
      const webpName = file.replace(ext, '.webp');
      const webpPath = path.join(GARLAND_DIR, webpName);

      try {
        await sharp(oldPath).webp({ quality: 80 }).toFile(webpPath);
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.error(`Error converting ${file}:`, err);
      }
    }

    // Update products.json
    const rawData = fs.readFileSync(PRODUCTS_JSON, 'utf-8');
    // Global replace for /products/Garlands/*.png to .webp
    const updatedData = rawData.replace(/\/products\/Garlands\/([^"]+)\.(png|jpg|jpeg)/g, '/products/Garlands/$1.webp');
    fs.writeFileSync(PRODUCTS_JSON, updatedData);

    console.log("Finished converting all images to webp and updated products.json");
  } catch (err) {
    console.error("Critical Error:", err);
  }
}

convertAll();
