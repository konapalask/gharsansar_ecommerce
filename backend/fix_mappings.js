const fs = require('fs');
const path = require('path');

const publicProductsDir = path.join(__dirname, 'public', 'products');
const productsJsonPath = path.join(__dirname, 'public', 'products.json');

let productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));

// Helper to sanitize filename (same as before)
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '_')
    .replace(/_+/g, '_');
}

// Build a map of all CURRENT files on disk in public/products
// Key: filename, Value: relative path e.g. /products/aquarium_and_accesories/fish_food.png
const currentFiles = {};

function scanDirectory(directory) {
  const items = fs.readdirSync(directory);
  items.forEach(item => {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else {
      const relPath = '/products/' + path.relative(publicProductsDir, fullPath).replace(/\\/g, '/');
      currentFiles[item] = relPath;
    }
  });
}

scanDirectory(publicProductsDir);
console.log(`Found ${Object.keys(currentFiles).length} files currently on disk.`);

// Now fix products.json
let updatedCount = 0;
let stillMissingCount = 0;

productsData.forEach(category => {
  category.subcategories?.forEach(sub => {
    ['products', 'images', 'services'].forEach(key => {
      if (sub[key]) {
        sub[key].forEach(item => {
          if (item.image && item.image.startsWith('/products/')) {
            // Get the basename of the original image URL
            // (e.g. " Optimum Fish Food ... .png")
            let originalName = decodeURIComponent(item.image.split('/').pop());
            let expectedNewName = sanitizeFilename(originalName);
            
            // Wait, the original string in products.json might have weird url encoding or not.
            // Let's just use what's in the string and sanitize it.
            let fallbackName = sanitizeFilename(item.image.split('/').pop());
            
            if (currentFiles[expectedNewName]) {
              if (item.image !== currentFiles[expectedNewName]) {
                item.image = currentFiles[expectedNewName];
                updatedCount++;
              }
            } else if (currentFiles[fallbackName]) {
              if (item.image !== currentFiles[fallbackName]) {
                item.image = currentFiles[fallbackName];
                updatedCount++;
              }
            } else {
              stillMissingCount++;
              console.log(`Could not find match for: ${item.image} -> tried ${expectedNewName}`);
            }
          }
        });
      }
    });
  });
});

console.log(`Updated ${updatedCount} URLs in products.json.`);
console.log(`Still missing ${stillMissingCount} URLs.`);

fs.writeFileSync(productsJsonPath, JSON.stringify(productsData, null, 4));
console.log('Fixed products.json.');
