const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'public', 'products.json');
let data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

let updatedCount = 0;

function calculateActualPrice(price) {
  if (price >= 5000) {
    return price + Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
  } else if (price >= 1000) {
    return price + 500;
  } else if (price >= 100) {
    return price + Math.floor(Math.random() * (500 - 200 + 1)) + 200;
  }
  return price + 50; // default for items < 100
}

data.forEach((category) => {
  if (category.subcategories) {
    category.subcategories.forEach((sub) => {
      ['products', 'images', 'services'].forEach((key) => {
        if (sub[key]) {
          sub[key].forEach((item) => {
            const price = parseInt(item.price) || 0;
            // Always update act-price based on the new logic to fix the "99% offer" issue
            if (price > 0) {
              const newActPrice = calculateActualPrice(price);
              if (item["act-price"] !== newActPrice) {
                item["act-price"] = newActPrice;
                updatedCount++;
              }
            }
          });
        }
      });
    });
  }
});

fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));
console.log(`Updated actual prices for ${updatedCount} products.`);
