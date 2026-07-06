const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'public', 'products.json');
const catalogPath = path.join(__dirname, 'public', 'products', 'ARTIFICIAL PLANTS', 'product_catalog.json');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Check if category already exists
let category = products.find(c => c.name === 'Artificial Plants');
if (category) {
  // Clear existing items in Artificial Plants to avoid duplicates
  category.subcategories = [];
} else {
  category = {
    cat_id: `cat_${products.length}`,
    name: 'Artificial Plants',
    subcategories: []
  };
  products.push(category);
}

// Group products by subcategory
const grouped = {};
catalog.forEach(item => {
  const subName = item.category || 'All Plants';
  if (!grouped[subName]) {
    grouped[subName] = [];
  }
  grouped[subName].push(item);
});

let subIdx = 0;
for (const [subName, items] of Object.entries(grouped)) {
  const subcategory = {
    sub_id: `sub_${products.indexOf(category)}_${subIdx}`,
    name: subName,
    products: []
  };

  items.forEach((item, idx) => {
    // Generate a default price if missing, but set act-price to 0 for dynamic algorithm
    const id = `artificial_${Date.now()}_${subIdx}_${idx}`;
    subcategory.products.push({
      prod_id: id,
      id: id,
      name: item.name,
      title: item.name,
      image: `/products/ARTIFICIAL PLANTS/${item.file}`,
      description: item.description,
      price: 599, // default price
      "act-price": 0,
      stock: 50
    });
  });

  category.subcategories.push(subcategory);
  subIdx++;
}

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log(`Added ${catalog.length} artificial plants to products.json`);
