const fs = require('fs');
const path = require('path');

const PRODUCTS_JSON = path.join(__dirname, 'public', 'products.json');

const SIZES = [
  "12 inch (For 8x10 Frame)",
  "18 inch (For 12x15 Frame)",
  "24 inch (For 16x20 Frame)",
  "30 inch (For 20x24 Frame)",
  "36 inch (For 24x36 Frame)"
];

async function updateGarlandSizes() {
  try {
    const productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf-8'));
    
    let garlandsCategory = productsData.find(cat => cat.name === 'Garlands' || cat.category === 'Garlands');
    if (!garlandsCategory) {
      console.error("Garlands category not found");
      return;
    }

    let decorativeSub = garlandsCategory.subcategories.find(sub => sub.name === 'Decorative');
    if (!decorativeSub || !decorativeSub.products) {
      console.error("Decorative subcategory not found");
      return;
    }

    let updatedCount = 0;
    decorativeSub.products = decorativeSub.products.map((product, i) => {
      // Avoid appending if already appended
      if (!product.name.includes("inch")) {
        const randomSize = SIZES[i % SIZES.length];
        product.name = `${product.name} - ${randomSize}`;
        product.title = product.name; // Keep title in sync
        updatedCount++;
      }
      return product;
    });

    fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(productsData, null, 2));
    console.log(`Successfully updated ${updatedCount} garland names with sizes.`);
  } catch (err) {
    console.error("Error processing garlands:", err);
  }
}

updateGarlandSizes();
