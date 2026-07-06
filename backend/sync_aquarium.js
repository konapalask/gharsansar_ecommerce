const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'public', 'products.json');
const imgDir = path.join(__dirname, 'public', 'products', 'aquarium_and_accesories');

const rawData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const files = fs.readdirSync(imgDir).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));

// Find the category "Aquarium & Accesories"
let targetCategory = rawData.find(c => c.name.toLowerCase() === 'aquarium & accesories' || c.name.toLowerCase().includes('aquarium'));

if (!targetCategory) {
  console.log("Could not find aquarium category in products.json");
  process.exit(1);
}

// Find subcategory "accessories" or similar
let targetSub = targetCategory.subcategories.find(s => s.name.toLowerCase().includes('accessories') || s.name.toLowerCase().includes('accesories'));
if (!targetSub) {
    if (targetCategory.subcategories.length > 0) {
        targetSub = targetCategory.subcategories[0];
    } else {
        console.log("Could not find suitable subcategory");
        process.exit(1);
    }
}

let existingProducts = targetSub.products || targetSub.images || [];
let addedCount = 0;

files.forEach(file => {
  const relativePath = `/aquarium_and_accesories/${file}`;
  
  // Check if any product has this image
  const exists = existingProducts.some(p => {
    let pImg = p.image || '';
    // Normalize path separators and remove leading slashes
    return pImg.replace(/\\/g, '/').replace(/^\/?products\//, '/').replace(/^\//, '') === relativePath.replace(/^\//, '');
  });

  if (!exists) {
    console.log("Missing:", relativePath);
    const newProduct = {
      id: `new_${Date.now()}_${addedCount}`,
      title: file.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '').replace(/_/g, ' '),
      price: 500, // Default price
      "act-price": 600,
      description: "Premium Aquarium Accessory",
      image: `/products${relativePath}`,
      stock: 50
    };
    
    if (targetSub.products) {
        targetSub.products.push(newProduct);
    } else if (targetSub.images) {
        targetSub.images.push(newProduct);
    }
    addedCount++;
  }
});

if (addedCount > 0) {
  fs.writeFileSync(productsPath, JSON.stringify(rawData, null, 2));
  console.log(`Added ${addedCount} new products to products.json`);
} else {
  console.log("No new products to add.");
}
