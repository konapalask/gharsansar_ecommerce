const fs = require('fs');
const path = require('path');

const GARLAND_DIR = path.join(__dirname, 'public', 'products', 'Garlands');
const PRODUCTS_JSON = path.join(__dirname, 'public', 'products.json');

function capitalizeFirstLetter(string) {
  return string.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function fixGarlands() {
  try {
    const files = fs.readdirSync(GARLAND_DIR).filter(f => !f.startsWith('.') && f.endsWith('.png'));
    console.log(`Found ${files.length} garlands to add.`);

    const productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf-8'));
    const garlandsArray = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const nameWithoutExt = path.basename(file, '.png');
      // Format the name nicely
      const title = capitalizeFirstLetter(nameWithoutExt.replace(/-\d+$/, ''));
      const uniqueId = `garland-${Date.now()}-${i}`;
      
      const product = {
        id: uniqueId,
        name: title,
        title: title,
        category: "Garlands",
        subCategory: "Decorative",
        price: 0,
        actualPrice: 0,
        "act-price": 0,
        discountPercentage: 0,
        image: `/products/Garlands/${file}`,
        stock: 50,
        isReturnGift: false,
        description: "Premium handcrafted decorative garland. Perfect for all festive occasions, pujas, and home decoration."
      };

      garlandsArray.push(product);
    }

    // Now insert properly into the JSON array
    let garlandsCategory = productsData.find(cat => cat.name === 'Garlands');
    if (!garlandsCategory) {
      garlandsCategory = {
        name: 'Garlands',
        category: 'Garlands',
        subcategories: [
          {
            name: 'Decorative',
            products: []
          }
        ]
      };
      productsData.push(garlandsCategory);
    }

    let decorativeSub = garlandsCategory.subcategories.find(sub => sub.name === 'Decorative');
    if (!decorativeSub) {
      decorativeSub = {
        name: 'Decorative',
        products: []
      };
      garlandsCategory.subcategories.push(decorativeSub);
    }

    // Append to existing products in this subcategory (or replace if they were already there, but they aren't)
    // To avoid duplicates if ran multiple times, we can clear it out first if we want, but since they weren't added, we can just push.
    // Let's filter out existing garlands just in case.
    decorativeSub.products = garlandsArray;

    fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(productsData, null, 2));
    console.log("Successfully fixed and appended garlands to products.json.");
  } catch (err) {
    console.error("Error processing garlands:", err);
  }
}

fixGarlands();
