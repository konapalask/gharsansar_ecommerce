const fs = require('fs');
const path = require('path');

const publicProductsDir = path.join(__dirname, 'public', 'products');
const productsJsonPath = path.join(__dirname, 'public', 'products.json');

let productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));

// Helper to sanitize filename
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '_')
    .replace(/_+/g, '_');
}

// Function to recursively rename files and return mapping
const fileMapping = {};

function processDirectory(directory) {
  const items = fs.readdirSync(directory);
  items.forEach(item => {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // also rename directory if it has spaces or weird chars
      const newDirName = sanitizeFilename(item);
      const newDirPath = path.join(directory, newDirName);
      if (newDirPath !== fullPath) {
        fs.renameSync(fullPath, newDirPath);
        processDirectory(newDirPath);
      } else {
        processDirectory(fullPath);
      }
    } else {
      // rename file
      const newName = sanitizeFilename(item);
      const newPath = path.join(directory, newName);
      if (newPath !== fullPath) {
        fs.renameSync(fullPath, newPath);
        
        // create mapping for products.json
        // old relative path
        const oldRelPath = '/products/' + path.relative(publicProductsDir, fullPath).replace(/\\/g, '/');
        const newRelPath = '/products/' + path.relative(publicProductsDir, newPath).replace(/\\/g, '/');
        fileMapping[oldRelPath] = newRelPath;
        // also store without /products/ for safety
        fileMapping[oldRelPath.replace('/products/', '')] = newRelPath;
      }
    }
  });
}

// We just want to rename files inside /products that have spaces, pipes, ampersands
// Actually, let's just sanitize everything inside public/products
console.log('Sanitizing filenames...');
processDirectory(publicProductsDir);

console.log('Found', Object.keys(fileMapping).length, 'files to remap');

// Now update products.json
let updatedCount = 0;
productsData.forEach(category => {
  category.subcategories?.forEach(sub => {
    ['products', 'images', 'services'].forEach(key => {
      if (sub[key]) {
        sub[key].forEach(item => {
          if (item.image) {
            let imgUrl = item.image;
            // The mapping might have matched exactly
            if (fileMapping[imgUrl]) {
              item.image = fileMapping[imgUrl];
              updatedCount++;
            } else {
              // Try to find if any mapping matches the end of the URL
              for (const oldPath in fileMapping) {
                if (imgUrl.endsWith(oldPath) || oldPath.endsWith(imgUrl)) {
                  item.image = fileMapping[oldPath];
                  updatedCount++;
                  break;
                }
              }
            }
          }
        });
      }
    });
  });
});

console.log('Updated', updatedCount, 'image URLs in products.json');

fs.writeFileSync(productsJsonPath, JSON.stringify(productsData, null, 4));
console.log('Done.');
