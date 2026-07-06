const fs = require('fs');
const path = require('path');

const productsJsonPath = path.join(__dirname, 'public', 'products.json');
let productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));

let total = 0;
let missing = 0;
let missingUrls = [];

productsData.forEach(category => {
  category.subcategories?.forEach(sub => {
    ['products', 'images', 'services'].forEach(key => {
      if (sub[key]) {
        sub[key].forEach(item => {
          if (item.image) {
            total++;
            let imgUrl = item.image;
            if (imgUrl.startsWith('/products/')) {
              const filePath = path.join(__dirname, 'public', imgUrl);
              if (!fs.existsSync(filePath)) {
                missing++;
                missingUrls.push(imgUrl);
              }
            }
          }
        });
      }
    });
  });
});

console.log(`Total images: ${total}`);
console.log(`Missing images: ${missing}`);
if (missing > 0) {
  console.log('Sample missing URLs:', missingUrls.slice(0, 10));
}
