const fs = require('fs');
const path = require('path');
const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'products.json'), 'utf8'));
const cat = rawData.find(c => c.name === 'Aquarium & Accessories');
if (cat) {
  cat.subcategories.forEach(s => console.log(s.name));
}
