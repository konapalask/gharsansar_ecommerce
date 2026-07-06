const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'public', 'products.json');
const rawData = fs.readFileSync(productsPath, 'utf8');
let products = JSON.parse(rawData);

const harshdeepDir = path.join(__dirname, 'public', 'products', 'harshdeep products');
const files = fs.readdirSync(harshdeepDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

function calculateActualPrice(price) {
  if (price >= 5000) {
    return price + Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
  } else if (price >= 1000) {
    return price + 500;
  } else if (price >= 100) {
    return price + Math.floor(Math.random() * (500 - 200 + 1)) + 200;
  }
  return price + 50;
}

const harshdeepCategory = {
  cat_id: `cat_${Date.now()}`,
  name: "Harshdeep Planters",
  subcategories: [
    {
      sub_id: `sub_${Date.now()}_1`,
      name: "Planters & Pots",
      products: []
    }
  ]
};

files.forEach((file, index) => {
  // e.g. "Harshdeep Atlantis Eco Planter Small (10x11.5 cm).png" -> "Atlantis Eco Planter Small (10x11.5 cm)"
  let titleName = file.replace(/\.(png|jpg|jpeg)$/i, '').replace(/^Harshdeep /i, '');
  
  const price = 599; // Default price
  const actPrice = calculateActualPrice(price);

  harshdeepCategory.subcategories[0].products.push({
    prod_id: `harshdeep_${Date.now()}_${index}`,
    id: `harshdeep_${Date.now()}_${index}`,
    name: titleName,
    title: titleName,
    image: `/products/harshdeep products/${file}`,
    description: `Premium quality ${titleName} by Harshdeep. Perfect for indoor and outdoor plants.`,
    price: price,
    "act-price": actPrice,
    stock: 50
  });
});

// Check if Harshdeep Planters already exists
const existingIndex = products.findIndex(c => c.name === "Harshdeep Planters");
if (existingIndex !== -1) {
  products[existingIndex] = harshdeepCategory;
} else {
  products.push(harshdeepCategory);
}

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log(`Added ${files.length} Harshdeep products successfully.`);
